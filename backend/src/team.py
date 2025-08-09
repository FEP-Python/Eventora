from config import db
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models import Team, Organization, TeamMember, User, UserRole, OrganizationMember

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
        role=UserRole.LEADER
    )
    db.session.add(team_member)

    try:
        db.session.commit()
        return jsonify({"message": "Team created"}), 201
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
    return jsonify({"data": team.to_json()}), 200

@team_bp.route("/get-all/<int:org_id>", methods=["GET"])
@token_required
def get_teams_by_org_id(current_user, org_id):
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

    return jsonify({"message": "Team updated"}), 200

@team_bp.route("/update-leader/<int:team_id>", methods=["PATCH"])
@token_required
def update_leader(current_user, team_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    new_leader_id = data.get("leaderId")

    if not new_leader_id or new_leader_id == team.leader_id:
        return jsonify({"message": "Invalid or same leader ID"}), 400

    new_leader = User.query.get(new_leader_id)
    if not new_leader:
        return jsonify({"message": "No user found with this id"}), 404

    # Ensure new leader is a team member
    membership = TeamMember.query.filter_by(team_id=team.id, user_id=new_leader.id).first()
    if not membership:
        membership = TeamMember(team_id=team.id, user_id=new_leader.id, role=UserRole.MEMBER)
        db.session.add(membership)

    # Ensure old leader is still in team
    old_leader_membership = TeamMember.query.filter_by(team_id=team.id, user_id=team.leader_id).first()
    if not old_leader_membership:
        old_leader_membership = TeamMember(team_id=team.id, user_id=team.leader_id, role=UserRole.MEMBER)
        db.session.add(old_leader_membership)
    else:
        old_leader_membership.role = UserRole.MEMBER

    # Promote new leader
    membership.role = UserRole.LEADER
    team.leader_id = new_leader.id

    db.session.commit()
    return jsonify({"message": "Leader updated"}), 200

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

    # Check if already a member
    if TeamMember.query.filter_by(team_id=team.id, user_id=member_id).first():
        return jsonify({"message": "User already in team"}), 400

    new_member = TeamMember(team_id=team.id, user_id=member_id)

    db.session.add(new_member)
    db.session.commit()

    return jsonify({"message": "Member added"}), 200

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
        return jsonify({"message": "Cannot remove team leader"}), 400

    member = TeamMember.query.filter_by(team_id=team.id, user_id=member_id).first()
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

    members = [member.user.to_json() for member in team.members]

    return jsonify({"data": members}), 200
