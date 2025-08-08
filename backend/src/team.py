from config import db
from models import Team
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify

team_bp = Blueprint("team", __name__)

@team_bp.route("/create", methods=["POST"])
@token_required
def create_team(current_user):
    org_id = request.json.get("orgId")
    name = request.json.get("name")
    description = request.json.get("description")

    if not all([org_id, name]):
        return jsonify({"message": "All fields are required"}), 400

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

@team_bp.route("/get-all/<int:org_id>", methods=["GET"])
@token_required
def get_all_teams_by_org_id(org_id):
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

@team_bp.route("/users", methods=["GET"])
@token_required
def get_user_created_events(current_user):
    events = Event.query.filter_by(creator_id=current_user.id).all()
    json_events = list(map(lambda event: event.to_json(), events))
    return jsonify({"data": json_events}), 200