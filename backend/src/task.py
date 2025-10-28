from src.config import db
from datetime import datetime
from src.lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from src.models import Task, Team, TeamMember, TaskAssignee, TaskStatus, Priority

task_bp = Blueprint("task", __name__)


@task_bp.route("/create", methods=["POST"])
@token_required
def create_task(current_user):
    data = request.get_json() if request.is_json else request.json
    event_id = data.get("eventId") or None
    team_id = data.get("teamId")
    org_id = data.get("orgId")
    title = data.get("title")
    description = data.get("description")
    priority = data.get("priority", "low")
    status = data.get("status", "pending")
    due_date_str = data.get("dueDate")
    user_ids = data.get("userIds", [])

    if not all([team_id, org_id, title, priority, status, due_date_str]):
        return jsonify({"message": "teamId, orgId, title, priority, status, and dueDate are required"}), 400

    try:
        due_date = datetime.fromisoformat(due_date_str)
    except Exception:
        return jsonify({"message": "Invalid dueDate format"}), 400

    team = Team.query.get(team_id)
    if not team:
        return jsonify({"message": "Team not found"}), 404

    # ✅ FIXED: Correct membership validation
    member_ids = [member.user_id for member in team.members]
    if current_user.id not in member_ids:
        return jsonify({"message": "You are not a member of this team"}), 403

    # Convert status/priority (string to Enum)
    try:
        priority_enum = Priority(priority.upper()) if hasattr(
            priority, "upper") else Priority(priority)
    except ValueError:
        try:
            priority_enum = Priority(priority.lower())
        except Exception:
            priority_enum = Priority.LOW

    try:
        status_enum = TaskStatus(
            status.upper() if hasattr(status, "upper") else status)
    except ValueError:
        try:
            status_enum = TaskStatus(status.lower())
        except Exception:
            status_enum = TaskStatus.PENDING

    creator_id = current_user.id
    new_task = Task(
        event_id=event_id,
        team_id=team_id,
        org_id=org_id,
        creator_id=creator_id,
        title=title,
        description=description,
        priority=priority_enum,
        status=status_enum,
        due_date=due_date,
    )
    db.session.add(new_task)
    db.session.flush()

    task_id = new_task.id

    # Assignment is optional
    assigned = []
    if user_ids:
        for uid in user_ids:
            # Check if user is a team member
            if not TeamMember.query.filter_by(team_id=team.id, user_id=uid).first():
                continue
            # Check if already assigned
            if not TaskAssignee.query.filter_by(task_id=task_id, user_id=uid).first():
                db.session.add(TaskAssignee(task_id=task_id, user_id=uid))
                assigned.append(uid)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 400

    return jsonify({
        "message": "Task created successfully",
        "task": new_task.to_json(),
        "assignedUserIds": assigned,
    }), 201


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
def update_task(current_user, task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    if task.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.get_json()

    if "title" in data:
        task.title = data["title"]

    if "description" in data:
        task.description = data["description"]

    priority_value = data.get("priority")
    if priority_value:
        try:
            priority_enum = Priority(priority_value.lower())
            task.priority = priority_enum
        except ValueError:
            priority_enum = Priority.LOW
    else:
        priority_enum = Priority.LOW

    status_value = data.get("status")
    if status_value:
        try:
            status_enum = TaskStatus(status_value.lower())
            task.status = status_enum
        except ValueError:
            status_enum = TaskStatus.PENDING
    else:
        status_enum = TaskStatus.PENDING

    # Handle both 'due_date' and 'dueDate' keys
    if "due_date" in data:
        try:
            task.due_date = datetime.fromisoformat(data["due_date"])
        except (ValueError, TypeError):
            return jsonify({"message": "Invalid due_date format"}), 400
    elif "dueDate" in data:
        try:
            task.due_date = datetime.fromisoformat(data["dueDate"])
        except (ValueError, TypeError):
            return jsonify({"message": "Invalid dueDate format"}), 400

    try:
        db.session.commit()
        return jsonify({"message": "Task updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating task: {str(e)}"}), 500


@task_bp.route("/delete/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
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
        record = TaskAssignee.query.filter_by(
            task_id=task_id, user_id=uid).first()
        if record:
            db.session.delete(record)
            removed.append(uid)

    db.session.commit()
    return jsonify({"message": "Users unassigned", "removed_user_ids": removed}), 200


@task_bp.route("/update-status/<int:task_id>", methods=["PATCH"])
@token_required
def update_task_status(current_user, task_id):
    data = request.get_json()
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    # ✅ Check if current_user is assigned to this task
    is_assigned = (
        db.session.query(TaskAssignee)
        .filter(
            TaskAssignee.task_id == task_id,
            TaskAssignee.user_id == current_user.id
        )
        .first()
    )

    if not is_assigned:
        return jsonify({"error": "Not authorized"}), 403

    # ✅ Update only the status
    task.status = new_status
    db.session.commit()

    return jsonify({
        "message": "Status updated successfully",
        "task": task.to_json()
    }), 200
