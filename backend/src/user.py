from src.config import db
from src.models import User
from src.lib import token_required
from flask import Blueprint, jsonify, request

user_bp = Blueprint("user", __name__)

@user_bp.route("/owned-org", methods=["GET"])
@token_required
def get_user_owned_orgs(current_user):
    try:
        owned_orgs = [org.to_json() for org in current_user.owned_organizations]
        return jsonify({"data": owned_orgs}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/member-org", methods=["GET"])
@token_required
def get_user_member_orgs(current_user):
    try:
        member_orgs = [membership.organization.to_json() for membership in current_user.organization_memberships]
        return jsonify({"data": member_orgs}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/lead-team", methods=["GET"])
@token_required
def get_user_lead_teams(current_user):
    try:
        led_teams = [team.to_json() for team in current_user.led_teams]
        return jsonify({"data": led_teams}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/member-team", methods=["GET"])
@token_required
def get_user_member_teams(current_user):
    try:
        member_teams = [membership.team.to_json() for membership in current_user.team_memberships]
        return jsonify({"data": member_teams}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/created-event", methods=["GET"])
@token_required
def get_user_created_events(current_user):
    try:
        created_events = [event.to_json() for event in current_user.created_events]
        return jsonify({"data": created_events}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/created-task", methods=["GET"])
@token_required
def get_user_created_tasks(current_user):
    try:
        created_tasks = [task.to_json() for task in current_user.created_tasks]
        return jsonify({"data": created_tasks}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/assigned-task", methods=["GET"])
@token_required
def get_user_assigned_tasks(current_user):
    try:
        assigned_tasks = [task.to_json() for task in current_user.tasks_assigned]
        return jsonify({"data": assigned_tasks}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/get/<int:user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        return jsonify({"data": user.to_json()}), 200
    except Exception as e:
        return jsonify({"message": 'Error geting user'}), 500

@user_bp.route("/delete/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@user_bp.route("/update/<int:user_id>", methods=["PATCH"])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = request.json
        user.first_name = data.get("firstName", user.first_name)
        user.last_name = data.get("lastName", user.last_name)
        user.email = data.get("email", user.email)
        user.role = data.get("role", user.role)

        db.session.commit()

        return jsonify({"message": "User updated"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
