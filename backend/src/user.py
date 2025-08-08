from config import db
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, jsonify, request
from models import Organization, OrganizationMember


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