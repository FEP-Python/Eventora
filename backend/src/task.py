from config import db
from datetime import datetime
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models import Task, Team, TeamMember, TaskAssignee

task_bp = Blueprint("task", __name__)

@task_bp.route("/create", methods=["POST"])
@token_required
def create_task(current_user):
    event_id = request.form.get("eventId")
    team_id = request.form.get("teamId")
    org_id = request.form.get("orgId")
    title = request.form.get("title")
    description = request.form.get("description")
    priority = request.form.get("priority")
    status = request.form.get("status")
    due_date_str = request.form.get("dueDate")

    if not all([event_id, team_id, org_id, title, priority, status, due_date_str]):
        return jsonify({"message": "All fields are required"}), 400

    try:
        due_date = datetime.fromisoformat(due_date_str)
    except ValueError:
        return jsonify({"message": "Invalid due date"}), 400

    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404
    if current_user.id not in team.members.user.id:
        return jsonify({"message": "You are not a member of this team"}), 403

    creator_id = current_user.id

    new_task = Task(
        event_id=event_id,
        team_id=team_id,
        org_id=org_id,
        creator_id=creator_id,
        title=title,
        description=description,
        priority=priority,
        status=status,
        due_date=due_date,
    )

    try:
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Task created"}, 201)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(({"message": str(e)}), 400)

@task_bp.route("/event/<int:event_id>", methods=["GET"])
@token_required
def get_tasks_by_event_id(current_user, event_id):
    tasks = Task.query.filter_by(event_id=event_id).all()
    return jsonify({"data": [t.to_json() for t in tasks]}), 200

@task_bp.route("/team/<int:team_id>", methods=["GET"])
@token_required
def get_tasks_by_team_id(current_user, team_id):
    tasks = Task.query.filter_by(team_id=team_id).all()
    return jsonify({"data": [t.to_json() for t in tasks]}), 200

@task_bp.route("/update/<int:task_id>", methods=["PATCH"])
@token_required
def update_task(task_id, current_user):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    if task.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.get_json()
    if "title" in data: task.title = data["title"]
    if "description" in data: task.description = data["description"]
    if "priority" in data: task.priority = data["priority"]
    if "status" in data: task.status = data["status"]
    if "due_date" in data:
        try:
            task.due_date = datetime.fromisoformat(data["dueDate"])
        except ValueError:
            return jsonify({"message": "Invalid due_date format"}), 400

    db.session.commit()

    return jsonify({"message": "Task updated"}), 200

@task_bp.route("/delete/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(task_id, current_user):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    if task.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted"}), 200

@task_bp.route("/assign", methods=["POST"])
@token_required
def assign_task(current_user):
    data = request.get_json()
    task_id = data.get("taskId")
    user_ids = data.get("userIds", [])

    if not task_id or not user_ids:
        return jsonify({"message": "task_id and user_ids are required"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    assigned = []
    for uid in user_ids:
        team_member = TeamMember.query.filter_by(
            team_id=task.team_id,
            user_id=uid,
        ).first()
        if not team_member:
            continue

        if not TaskAssignee.query.filter_by(
            task_id=task.id,
            user_id=uid,
        ).first():
            db.session.add(TaskAssignee(task_id=task_id, user_id=uid))
            assigned.append(uid)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500

    return jsonify({"message": "Users assigned", "assigned_user_ids": assigned}), 200

@task_bp.route("/unassign", methods=["DELETE"])
@token_required
def unassign_task():
    data = request.get_json()
    task_id = data.get("task_id")
    user_ids = data.get("user_ids", [])

    if not task_id or not user_ids:
        return jsonify({"error": "task_id and user_ids are required"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    removed = []
    for uid in user_ids:
        record = TaskAssignee.query.filter_by(task_id=task_id, user_id=uid).first()
        if record:
            db.session.delete(record)
            removed.append(uid)

    db.session.commit()
    return jsonify({"message": "Users unassigned", "removed_user_ids": removed}), 200