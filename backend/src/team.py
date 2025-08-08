from config import db
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models import Team, Organization, TeamMember

team_bp = Blueprint("team", __name__)

@team_bp.route("/create", methods=["POST"])
@token_required
def create_team(current_user):
    org_id = request.json.get("orgId")
    name = request.json.get("name")
    description = request.json.get("description")

    if not org_id or not name.strip():
        return jsonify({"message": "Organization and team name is required"}), 400

    existing_team = Organization.query.filter_by(
        org_id=org_id,
        name=name
    ).first()
    if existing_team:
        return jsonify({"message": "A team with this name already exists in the organization"}), 400

    leader_id = current_user.id

    new_team = Team(
        org_id=org_id,
        name=name,
        description=description,
        leader_id=leader_id
    )

    try:
        db.session.add(new_team)
        db.session.commit()
        return jsonify({"message": "Team created"}, 201)
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
def update_team(team_id, current_user):
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

@team_bp.route("/delete/<int:team_id>", methods=["DELETE"])
@token_required
def delete_team(team_id, current_user):
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
    if any(member.user_id == member_id for member in team.members):
        return jsonify({"message": "User already in team"}), 400

    new_member = TeamMember(team_id=team.id, user_id=member_id)

    db.session.add(new_member)
    db.session.commit()

    return jsonify({"message": "Member added"}), 200

@team_bp.route("/remove-member/<int:team_id>/<int:user_id>", methods=["DELETE"])
@token_required
def remove_member_from_team(current_user, team_id, user_id):
    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    if team.leader_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    member = TeamMember.query.filter_by(team_id=team.id, user_id=user_id).first()
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
