from config import db
from models import Event
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify

event_bp = Blueprint("event", __name__)

@event_bp.route("/create", methods=["POST"])
@token_required
def create_event(current_user):
    org_id = request.json.get("orgId")
    title = request.json.get("title")
    description = request.json.get("description")
    start_date = request.json.get("startDate")
    end_date = request.json.get("endDate")
    registration_deadline = request.json.get("registrationDeadline")
    capacity = request.json.get("capacity")
    location = request.json.get("location")
    event_type = request.json.get("eventType")
    status = request.json.get("status")
    is_public = request.json.get("isPublic")
    registration_required = request.json.get("registrationRequired")
    entry_free = request.json.get("entryFree")
    certificate_provided = request.json.get("certificateProvided")

    if not all([org_id, title, start_date, end_date, location, event_type, status, is_public]):
        return jsonify({"message": "All fields are required"}), 400

    creator_id = current_user.id

    new_event = Event(
        creator_id=creator_id,
        org_id=org_id,
        title=title,
        description=description,
        start_date=start_date,
        end_date=end_date,
        registration_deadline=registration_deadline,
        capacity=capacity,
        location=location,
        event_type=event_type,
        status=status,
        is_public=is_public,
        registration_required=registration_required,
        entry_free=entry_free,
        certificate_provided=certificate_provided,
    )

    try:
        db.session.add(new_event)
        db.session.commit()
        return jsonify({"message": "Event created"}, 201)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(({"message": str(e)}), 400)

@event_bp.route("/get-all/<int:org_id>", methods=["GET"])
@token_required
def get_all_events_by_org_id(org_id):
    events = Event.query.filter_by(org_id=org_id).all()
    json_events = list(map(lambda event: event.to_json(), events))
    return jsonify({"data": json_events}), 200

@event_bp.route("/update/<int:event_id>", methods=["PATCH"])
@token_required
def update_event(event_id, current_user):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    event.title = data.get("title", event.title)
    event.description = data.get("description", event.description)
    event.start_date = data.get("startDate", event.start_date)
    event.end_date = data.get("endDate", event.end_date)
    event.capacity = data.get("capacity", event.capacity)
    event.location = data.get("location", event.location)
    event.event_type = data.get("eventType", event.event_type)
    event.status = data.get("status", event.status)
    event.is_public = data.get("isPublic", event.is_public)
    event.registration_required = data.get("registrationRequired", event.registration_required)
    event.entry_free = data.get("entryFree", event.entry_free)
    event.certificate_provided = data.get("certificateProvided", event.certificate_provided)

    db.session.commit()

    return jsonify({"message": "Event updated"}), 200

@event_bp.route("/delete/<int:event_id>", methods=["DELETE"])
@token_required
def delete_event(event_id, current_user):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted"}), 200