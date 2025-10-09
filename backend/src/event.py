# from config import db
# from datetime import datetime
# from lib import token_required
# from sqlalchemy.exc import IntegrityError
# from flask import Blueprint, request, jsonify
# from models import Event, Organization, EventStatus

# event_bp = Blueprint("event", __name__)

# @event_bp.route("/create", methods=["POST"])
# @token_required
# def create_event(current_user):
#     org_id = request.json.get("orgId")
#     title = request.json.get("title")
#     description = request.json.get("description")
#     start_date = datetime.fromisoformat(request.json.get("startDate"))
#     end_date = datetime.fromisoformat(request.json.get("endDate"))
#     registration_deadline = datetime.fromisoformat(request.json.get("registrationDeadline"))
#     capacity = request.json.get("capacity")
#     location = request.json.get("location")
#     event_type = request.json.get("eventType")
#     status = request.json.get("status", EventStatus.DRAFT)
#     is_public = request.json.get("isPublic")
#     registration_required = request.json.get("registrationRequired")
#     entry_fee = request.json.get("entryFee")
#     certificate_provided = request.json.get("certificateProvided")

#     if not all([org_id, title, start_date, end_date, location, event_type, status]):
#         return jsonify({"message": "All fields are required"}), 400

#     if end_date < start_date:
#         return jsonify({"message": "End date cannot be before start date"}), 400

#     creator_id = current_user.id

#     org = Organization.query.get(org_id)
#     if not org:
#         return jsonify({"message": "Organization not found"}), 404

#     new_event = Event(
#         creator_id=creator_id,
#         org_id=org_id,
#         title=title,
#         description=description,
#         start_date=start_date,
#         end_date=end_date,
#         registration_deadline=registration_deadline,
#         capacity=capacity,
#         location=location,
#         event_type=event_type,
#         status=status,
#         is_public=is_public,
#         registration_required=registration_required,
#         entry_fee=entry_fee,
#         certificate_provided=certificate_provided,
#     )

#     try:
#         db.session.add(new_event)
#         db.session.commit()
#         return jsonify({"message": "Event created"}, 201)
#     except IntegrityError:
#         db.session.rollback()
#         return jsonify({"message": "Database integrity error"}), 500
#     except Exception as e:
#         db.session.rollback()
#         return jsonify(({"message": str(e)}), 400)

# @event_bp.route("/get-all/<int:org_id>", methods=["GET"])
# @token_required
# def get_all_events_by_org_id(current_user, org_id):
#     org = Organization.query.get(org_id)
#     if not org:
#         return jsonify({"message": "Organization not found"}), 404

#     events = Event.query.filter_by(org_id=org_id).all()
#     return jsonify({"data": [e.to_json() for e in events]}), 200

# @event_bp.route("/get/<int:event_id>", methods=["GET"])
# @token_required
# def get_event_by_id(current_user, event_id):
#     event = Event.query.get(event_id)
#     if not event:
#         return jsonify({"message": "Event not found"}), 404
#     return jsonify({"data": event.to_json()}), 200

# @event_bp.route("/update/<int:event_id>", methods=["PATCH"])
# @token_required
# def update_event(current_user, event_id):
#     event = Event.query.get(event_id)
#     if not event:
#         return jsonify({"message": "Event not found"}), 404

#     if event.creator_id != current_user.id:
#         return jsonify({"message": "Not authorized"}), 403

#     data = request.json
#     event.title = data.get("title", event.title)
#     event.description = data.get("description", event.description)
#     event.start_date = data.get("startDate", event.start_date)
#     event.end_date = data.get("endDate", event.end_date)
#     event.capacity = data.get("capacity", event.capacity)
#     event.location = data.get("location", event.location)
#     event.event_type = data.get("eventType", event.event_type)
#     event.status = data.get("status", event.status)
#     event.is_public = data.get("isPublic", event.is_public)
#     event.registration_required = data.get("registrationRequired", event.registration_required)
#     event.entry_fee = data.get("entryFee", event.entry_fee)
#     event.certificate_provided = data.get("certificateProvided", event.certificate_provided)

#     db.session.commit()

#     return jsonify({"message": "Event updated"}), 200

# @event_bp.route("/delete/<int:event_id>", methods=["DELETE"])
# @token_required
# def delete_event(current_user, event_id):
#     event = Event.query.get(event_id)
#     if not event:
#         return jsonify({"message": "Event not found"}), 404

#     if event.creator_id != current_user.id:
#         return jsonify({"message": "Not authorized"}), 403

#     db.session.delete(event)
#     db.session.commit()

#     return jsonify({"message": "Event deleted"}), 200

# @event_bp.route("/search", methods=["GET"])
# @token_required
# def search_events(current_user):
#     query = Event.query
#     title = request.args.get("title")
#     event_type = request.args.get("type")
#     status = request.args.get("status")

#     if title:
#         query = query.filter(Event.title.ilike(f"%{title}%"))
#     if event_type:
#         query = query.filter_by(event_type=event_type)
#     if status:
#         query = query.filter_by(status=status)

#     events = query.all()
#     return jsonify({"data": [event.to_json() for event in events]}), 200

# @event_bp.route("/upcoming/<int:org_id>", methods=["GET"])
# def get_org_upcoming_events(org_id):
#     org = Organization.query.get(org_id)
#     if not org:
#         return jsonify({"message": "Organization not found"}), 404

#     now = datetime.utcnow()
#     events = Event.query.filter(
#         Event.start_date > now,
#         Event.is_public == True,
#         org_id == org.id,
#     ).all()
#     return jsonify({"data": [event.to_json() for event in events]}), 200


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
    try:
        data = request.json
        
        # Extract required fields
        org_id = data.get("orgId")
        title = data.get("title")
        location = data.get("location")
        event_type = data.get("eventType")
        start_date_str = data.get("startDate")
        end_date_str = data.get("endDate")
        
        # Validate required fields
        if not all([org_id, title, location, event_type, start_date_str, end_date_str]):
            missing_fields = []
            if not org_id: missing_fields.append("orgId")
            if not title: missing_fields.append("title")
            if not location: missing_fields.append("location")
            if not event_type: missing_fields.append("eventType")
            if not start_date_str: missing_fields.append("startDate")
            if not end_date_str: missing_fields.append("endDate")
            
            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError) as e:
            return jsonify({"message": "Invalid date format"}), 400
        
        # Parse optional registration deadline
        registration_deadline = None
        registration_deadline_str = data.get("registrationDeadline")
        if registration_deadline_str:
            try:
                registration_deadline = datetime.fromisoformat(
                    registration_deadline_str.replace('Z', '+00:00')
                )
            except (ValueError, AttributeError):
                return jsonify({"message": "Invalid registration deadline format"}), 400

        # Validate date logic
        if end_date <= start_date:
            return jsonify({"message": "End date must be after start date"}), 400
        
        if registration_deadline and registration_deadline > start_date:
            return jsonify({"message": "Registration deadline must be before start date"}), 400

        # Extract optional fields with defaults
        description = data.get("description", "")
        capacity = data.get("capacity")  # Can be None
        status_str = data.get("status", "draft")
        is_public = data.get("isPublic", True)
        registration_required = data.get("registrationRequired", False)
        entry_fee = data.get("entryFee", 0.0)
        certificate_provided = data.get("certificateProvided", False)

        # Convert status string to enum
        try:
            if isinstance(status_str, str):
                status = EventStatus(status_str.lower())
            else:
                status = EventStatus.DRAFT
        except ValueError:
            return jsonify({"message": f"Invalid status: {status_str}"}), 400

        # Verify organization exists
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({"message": "Organization not found"}), 404

        # Create new event
        new_event = Event(
            creator_id=current_user.id,
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
            entry_fee=float(entry_fee) if entry_fee is not None else 0.0,
            certificate_provided=certificate_provided,
        )

        db.session.add(new_event)
        db.session.commit()
        
        return jsonify({
            "message": "Event created successfully",
            "data": new_event.to_json()
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Database integrity error", "error": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 400

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
    event = db.session.query(Event).options(
        db.joinedload(Event.creator)
    ).filter(Event.id == event_id).first()
    
    if not event:
        return jsonify({"message": "Event not found"}), 404
    
    # Use include_creator=True to automatically include creator info
    return jsonify({"data": event.to_json(include_creator=True)}), 200

@event_bp.route("/update/<int:event_id>", methods=["PATCH"])
@token_required
def update_event(current_user, event_id):
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"message": "Event not found"}), 404

    if event.creator_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    
    # Update fields if provided
    if "title" in data:
        event.title = data["title"]
    if "description" in data:
        event.description = data["description"]
    if "startDate" in data:
        try:
            event.start_date = datetime.fromisoformat(data["startDate"].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return jsonify({"message": "Invalid start date format"}), 400
    if "endDate" in data:
        try:
            event.end_date = datetime.fromisoformat(data["endDate"].replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return jsonify({"message": "Invalid end date format"}), 400
    if "registrationDeadline" in data:
        if data["registrationDeadline"]:
            try:
                event.registration_deadline = datetime.fromisoformat(
                    data["registrationDeadline"].replace('Z', '+00:00')
                )
            except (ValueError, AttributeError):
                return jsonify({"message": "Invalid registration deadline format"}), 400
        else:
            event.registration_deadline = None
    if "capacity" in data:
        event.capacity = data["capacity"]
    if "location" in data:
        event.location = data["location"]
    if "eventType" in data:
        event.event_type = data["eventType"]
    if "status" in data:
        try:
            event.status = EventStatus(data["status"].lower())
        except ValueError:
            return jsonify({"message": f"Invalid status: {data['status']}"}), 400
    if "isPublic" in data:
        event.is_public = data["isPublic"]
    if "registrationRequired" in data:
        event.registration_required = data["registrationRequired"]
    if "entryFee" in data:
        event.entry_fee = float(data["entryFee"]) if data["entryFee"] is not None else 0.0
    if "certificateProvided" in data:
        event.certificate_provided = data["certificateProvided"]

    # Validate updated dates
    if event.end_date <= event.start_date:
        return jsonify({"message": "End date must be after start date"}), 400
    
    if event.registration_deadline and event.registration_deadline > event.start_date:
        return jsonify({"message": "Registration deadline must be before start date"}), 400

    try:
        db.session.commit()
        return jsonify({
            "message": "Event updated successfully",
            "data": event.to_json()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Update failed", "error": str(e)}), 400

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
        try:
            status_enum = EventStatus(status.lower())
            query = query.filter_by(status=status_enum)
        except ValueError:
            return jsonify({"message": f"Invalid status: {status}"}), 400

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
        Event.org_id == org_id,
    ).all()
    return jsonify({"data": [event.to_json() for event in events]}), 200