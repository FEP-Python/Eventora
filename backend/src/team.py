from src.config import db
from src.lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from src.models import Team, Organization, TeamMember, User, OrgRole, OrganizationMember

team_bp = Blueprint("team", __name__)


@team_bp.route("/create", methods=["POST"])
@token_required
def create_team(current_user):
    org_id = request.json.get("orgId")
    name = request.json.get("name")
    description = request.json.get("description")

    if not org_id or not name.strip():
        return jsonify({"message": "Organization and team name is required"}), 400

    existing_team = Team.query.filter_by(
        org_id=org_id,
        name=name
    ).first()
    if existing_team:
        return jsonify({"message": "A team with this name already exists in the organization"}), 400

    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    is_user_in_org = OrganizationMember.query.filter_by(
        user_id=current_user.id,
        org_id=org.id,
    ).first()
    if not is_user_in_org:
        return jsonify({"message": "Not authorized"}), 400

    leader_id = current_user.id

    new_team = Team(
        org_id=org_id,
        name=name,
        description=description,
        leader_id=leader_id
    )
    db.session.add(new_team)
    db.session.flush()

    team_member = TeamMember(
        team_id=new_team.id,
        user_id=current_user.id,
        role=OrgRole.LEADER
    )
    db.session.add(team_member)

    try:
        db.session.commit()
        return jsonify({"message": "Team created", "data": new_team.to_json()}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(({"message": str(e)}), 400)


@team_bp.route("/get-all", methods=["GET"])
def get_all_teams():
    teams = Team.query.all()
    json_teams = list(map(lambda team: team.to_json(), teams))
    return jsonify({"data": json_teams})


@team_bp.route("/get/<int:team_id>", methods=["GET"])
@token_required
def get_team_by_id(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    # Verify user is member of the organization
    is_user_in_org = OrganizationMember.query.filter_by(
        user_id=current_user.id,
        org_id=team.org_id
    ).first()
    if not is_user_in_org:
        return jsonify({"message": "Not authorized"}), 403

    return jsonify({"data": team.to_json()}), 200


@team_bp.route("/get-all/<int:org_id>", methods=["GET"])
@token_required
def get_teams_by_org_id(current_user, org_id):
    # Verify user is member of the organization
    is_user_in_org = OrganizationMember.query.filter_by(
        user_id=current_user.id,
        org_id=org_id
    ).first()
    if not is_user_in_org:
        return jsonify({"message": "Not authorized"}), 403

    teams = Team.query.filter_by(org_id=org_id).all()
    json_teams = list(map(lambda team: team.to_json(), teams))
    return jsonify({"data": json_teams}), 200


@team_bp.route("/update/<int:team_id>", methods=["PATCH"])
@token_required
def update_team(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    team.name = data.get("name", team.name)
    team.description = data.get("description", team.description)

    db.session.commit()

    return jsonify({"message": "Team updated", "data": team.to_json()}), 200


@team_bp.route("/update-member-role/<int:team_id>", methods=["PATCH"])
@token_required
def update_member_role(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    # Only team leader can update roles
    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized. Only team leaders can update member roles"}), 403

    data = request.json
    member_id = data.get("memberId")
    new_role = data.get("role")

    if not member_id or not new_role:
        return jsonify({"message": "memberId and role are required"}), 400

    # Validate role
    try:
        role_enum = OrgRole[new_role.upper()]
    except KeyError:
        return jsonify({"message": "Invalid role. Valid roles: leader, coleader, member, volunteer"}), 400

    # Get the member
    membership = TeamMember.query.filter_by(
        team_id=team_id,
        user_id=member_id
    ).first()

    if not membership:
        return jsonify({"message": "User is not a member of this team"}), 404

    # Prevent leader from demoting themselves
    if member_id == current_user.id and role_enum != OrgRole.LEADER:
        return jsonify({"message": "Team leader cannot demote themselves. Transfer leadership first"}), 400

    old_role = membership.role

    # Role-specific validations
    if role_enum == OrgRole.LEADER:
        # Check if there's already a leader
        existing_leader = TeamMember.query.filter_by(
            team_id=team_id,
            role=OrgRole.LEADER
        ).first()

        if existing_leader and existing_leader.user_id != member_id:
            # Demote existing leader to member
            existing_leader.role = OrgRole.MEMBER
            # Update team leader_id
            team.leader_id = member_id

    elif role_enum == OrgRole.COLEADER:
        # Check if there's already a co-leader
        existing_coleader = TeamMember.query.filter_by(
            team_id=team_id,
            role=OrgRole.COLEADER
        ).first()

        if existing_coleader and existing_coleader.user_id != member_id:
            return jsonify({
                "message": f"Team already has a co-leader: {existing_coleader.user.first_name} {existing_coleader.user.last_name}. Demote them first."
            }), 400

    # Update the member's role
    membership.role = role_enum

    try:
        db.session.commit()
        return jsonify({
            "message": f"Member role updated from {old_role.value} to {role_enum.value}",
            "data": {
                "userId": member_id,
                "oldRole": old_role.value,
                "newRole": role_enum.value,
                "team": team.to_json()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@team_bp.route("/delete/<int:team_id>", methods=["DELETE"])
@token_required
def delete_team(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "Team deleted"}), 200


@team_bp.route("/add-member/<int:team_id>", methods=["POST"])
@token_required
def add_member_to_team(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    member_id = request.json.get("memberId")
    if not member_id:
        return jsonify({"message": "Member ID is required"}), 400

    # Verify member is in the organization
    is_member_in_org = OrganizationMember.query.filter_by(
        user_id=member_id,
        org_id=team.org_id
    ).first()
    if not is_member_in_org:
        return jsonify({"message": "User is not a member of this organization"}), 400

    # Check if already a member
    if TeamMember.query.filter_by(team_id=team.id, user_id=member_id).first():
        return jsonify({"message": "User already in team"}), 400

    # New members are added as MEMBER by default
    new_member = TeamMember(
        team_id=team.id, user_id=member_id, role=OrgRole.MEMBER)

    db.session.add(new_member)
    db.session.commit()

    # Return updated team data with members
    return jsonify({
        "message": "Member added",
        "data": team.to_json()
    }), 200


@team_bp.route("/remove-member/<int:team_id>", methods=["DELETE"])
@token_required
def remove_member_from_team(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    member_id = request.json.get("memberId")
    if not member_id:
        return jsonify({"message": "Member ID is required"}), 400

    if member_id == team.leader_id:
        return jsonify({"message": "Cannot remove team leader. Transfer leadership first"}), 400

    member = TeamMember.query.filter_by(
        team_id=team.id, user_id=member_id).first()
    if not member:
        return jsonify({"message": "Member not found in team"}), 404

    db.session.delete(member)
    db.session.commit()

    return jsonify({"message": "Member removed"}), 200


@team_bp.route("/members/<int:team_id>", methods=["GET"])
@token_required
def list_team_members(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    members = []
    for member in team.members:
        member_data = member.user.to_json()
        member_data["teamRole"] = member.role.value
        member_data["isTeamLeader"] = member.user_id == team.leader_id
        members.append(member_data)

    return jsonify({"data": members}), 200


@team_bp.route("/transfer-leadership/<int:team_id>", methods=["POST"])
@token_required
def transfer_leadership(current_user, team_id):
    # """Transfer team leadership to another member"""
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    # Only current leader can transfer leadership
    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized. Only the team leader can transfer leadership"}), 403

    new_leader_id = request.json.get("newLeaderId")
    if not new_leader_id:
        return jsonify({"message": "newLeaderId is required"}), 400

    # Check if new leader is a team member
    new_leader_membership = TeamMember.query.filter_by(
        team_id=team_id,
        user_id=new_leader_id
    ).first()

    if not new_leader_membership:
        return jsonify({"message": "New leader must be a member of the team"}), 400

    try:
        # Update old leader to member
        old_leader_membership = TeamMember.query.filter_by(
            team_id=team_id,
            user_id=current_user.id
        ).first()

        if old_leader_membership:
            old_leader_membership.role = OrgRole.MEMBER

        # Promote new leader
        new_leader_membership.role = OrgRole.LEADER
        team.leader_id = new_leader_id

        db.session.commit()

        return jsonify({
            "message": "Leadership transferred successfully",
            "data": {
                "newLeaderId": new_leader_id,
                "teamId": team_id,
                "team": team.to_json()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
