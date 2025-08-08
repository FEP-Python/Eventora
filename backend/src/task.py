from config import db
from models import Task
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify

task_bp = Blueprint("task", __name__)

@task_bp.route("/create", methods=["POST"])
@token_required
def create_task(current_user):
    event_id = request.form.get("eventId")
    team_id = request.form.get("teamId")
    title = request.form.get("title")
    description = request.form.get("description")
    priority = request.form.get("priority")
    status = request.form.get("status")
    due_date = request.form.get("dueDate")

    if not all([event_id, team_id, title, priority, status, due_date]):
        return jsonify({"message": "All fields are required"}), 400

    creator_id = current_user.id

    new_task = Task(
        event_id=event_id,
        team_id=team_id,
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

@task_bp.route("/get-all/<int:event_id>", methods=["GET"])
@token_required
def get_tasks_by_event_id(event_id):
    tasks = Task.query.filter_by(event_id=event_id).all()
    json_tasks = list(map(lambda task: task.to_json(), tasks))
    return jsonify({"data": json_tasks}), 200

@task_bp.route("/get-all/<int:team_id>", methods=["GET"])
@token_required
def get_tasks_by_team_id(team_id):
    tasks = Task.query.filter_by(team_id=team_id).all()
    json_tasks = list(map(lambda task: task.to_json(), tasks))
    return jsonify({"data": json_tasks}), 200

@task_bp.route("/update/<int:task_id>", methods=["PATCH"])
@token_required
def update_task(task_id, current_user):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    if task.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.priority = data.get("priority", task.priority)
    task.status = data.get("status", task.status)
    task.due_date = data.get("dueDate", task.due_date)

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