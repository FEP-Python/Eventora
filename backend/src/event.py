from config import db
from datetime import datetime
from lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from models import Event, Organization, EventStatus

event_bp = Blueprint("event", __name__)

@event_bp.route("/create", methods=["POST"])
@token_required
def create_event(current_user):
    org_id = request.json.get("orgId")
    title = request.json.get("title")
    description = request.json.get("description")
    start_date = datetime.fromisoformat(request.json.get("startDate"))
    end_date = datetime.fromisoformat(request.json.get("endDate"))
    registration_deadline = datetime.fromisoformat(request.json.get("registrationDeadline"))
    capacity = request.json.get("capacity")
    location = request.json.get("location")
    event_type = request.json.get("eventType")
    status = request.json.get("status", EventStatus.DRAFT)
    is_public = request.json.get("isPublic")
    registration_required = request.json.get("registrationRequired")
    entry_fee = request.json.get("entryFee")
    certificate_provided = request.json.get("certificateProvided")

    if not all([org_id, title, start_date, end_date, location, event_type, status]):
        return jsonify({"message": "All fields are required"}), 400

    if end_date < start_date:
        return jsonify({"message": "End date cannot be before start date"}), 400

    creator_id = current_user.id

    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

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
        entry_fee=entry_fee,
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
def get_all_events_by_org_id(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    events = Event.query.filter_by(org_id=org_id).all()
    return jsonify({"data": [e.to_json() for e in events]}), 200

@event_bp.route("/get/<int:event_id>", methods=["GET"])
@token_required
def get_event_by_id(current_user, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
    return jsonify({"data": event.to_json()}), 200

@event_bp.route("/update/<int:event_id>", methods=["PATCH"])
@token_required
def update_event(current_user, event_id):
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
    event.entry_fee = data.get("entryFee", event.entry_fee)
    event.certificate_provided = data.get("certificateProvided", event.certificate_provided)

    db.session.commit()

    return jsonify({"message": "Event updated"}), 200

@event_bp.route("/delete/<int:event_id>", methods=["DELETE"])
@token_required
def delete_event(current_user, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted"}), 200

@event_bp.route("/search", methods=["GET"])
@token_required
def search_events(current_user):
    query = Event.query
    title = request.args.get("title")
    event_type = request.args.get("type")
    status = request.args.get("status")

    if title:
        query = query.filter(Event.title.ilike(f"%{title}%"))
    if event_type:
        query = query.filter_by(event_type=event_type)
    if status:
        query = query.filter_by(status=status)

    events = query.all()
    return jsonify({"data": [event.to_json() for event in events]}), 200

@event_bp.route("/upcoming/<int:org_id>", methods=["GET"])
def get_org_upcoming_events(org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    now = datetime.utcnow()
    events = Event.query.filter(
        Event.start_date > now,
        Event.is_public == True,
        org_id == org.id,
    ).all()
    return jsonify({"data": [event.to_json() for event in events]}), 200

