from config import db
from models import Organization
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from lib import generate_code, token_required

org_bp = Blueprint("org", __name__)

@org_bp.route("/create", methods=["POST"])
@token_required
def create_org(current_user):
    name = request.json.get("name")
    college = request.json.get("college")
    description = request.json.get("description")
    contact_email = request.json.get("contactEmail")
    contact_phone = request.json.get("contactPhone")
    website = request.json.get("website")

    if not all([name, college, contact_email, contact_phone]):
        return jsonify({"message": "All fields are required"}), 400

    code = generate_code(org_name=name, length=6)

    existing_org = Organization.query.filter_by(code=code).first()
    if existing_org:
        return jsonify({"message": "Organization already exists"}), 400

    new_org = Organization(
        name=name,
        owner_id=current_user.id,
        college=college,
        description=description,
        contact_email=contact_email,
        contact_phone=contact_phone,
        website=website,
        code=code,
    )

    try:
        db.session.add(new_org)
        db.session.commit()
        return jsonify({"message": "Organization created"}, 201)
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify(({"message": str(e)}), 400)

@org_bp.route("/get-all", methods=["GET"])
def get_all_orgs():
    orgs = Organization.query.all()
    json_orgs = list(map(lambda org: org.to_json(), orgs))
    return jsonify({"data": json_orgs})

@org_bp.route("/get/<int:org_id>", methods=["GET"])
@token_required
def get_org_by_id(org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404
    return jsonify({"data": org.to_json()}), 200

@org_bp.route("/update/<int:org_id>", methods=["PATCH"])
@token_required
def update_org(org_id, current_user):
    org = Organization.query.filter_by(id=org_id).first()
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    if org.owner_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    data = request.json
    org.name = data.get("name", org.name)
    org.college = data.get("college", org.college)
    org.description = data.get("description", org.description)
    org.contact_email = data.get("contactEmail", org.contact_email)
    org.contact_phone = data.get("contactPhone", org.contact_phone)
    org.website = data.get("website", org.website)

    db.session.commit()

    return jsonify({"message": "Organization updated"}), 200

@org_bp.route("/delete/<int:org_id>", methods=["DELETE"])
@token_required
def delete_org(org_id, current_user):
    org = Organization.query.filter_by(id=org_id).first()
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    if org.owner_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(org)
    db.session.commit()

    return jsonify({"message": "Organization deleted"}), 200

@org_bp.route("/users", methods=["GET"])
@token_required
def get_user_orgs(current_user):
    orgs = Organization.query.filter_by(owner_id=current_user.id).all()
    json_orgs = list(map(lambda org: org.to_json(), orgs))
    return jsonify({"data": json_orgs})