from config import db
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from lib import generate_code, token_required
from models import Organization, OrganizationMember, UserRole

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
    db.session.add(new_org)
    db.session.flush()

    org_member = OrganizationMember(
        user_id=current_user.id,
        org_id=new_org.id,
        role=UserRole.LEADER
    )
    db.session.add(org_member)

    try:
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
def get_org_by_id(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404
    return jsonify({"data": org.to_json()}), 200

@org_bp.route("/update/<int:org_id>", methods=["PATCH"])
@token_required
def update_org(current_user, org_id):
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
def delete_org(current_user, org_id):
    org = Organization.query.filter_by(id=org_id).first()
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    if org.owner_id != current_user.id:
        return jsonify({"message": "Not authorized"}), 403

    db.session.delete(org)
    db.session.commit()

    return jsonify({"message": "Organization deleted"}), 200

@org_bp.route("/members/<int:org_id>", methods=["GET"])
@token_required
def get_org_members(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    members = [member.user.to_json() for member in org.members]

    return jsonify({"data": members}), 200

@org_bp.route("/search", methods=["GET"])
@token_required
def search_orgs(current_user):
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"message": "Query parameter 'q' is required"}), 400

    orgs = Organization.query.filter(
        (Organization.name.ilike(f"%{query}")) | (Organization.code == query)
    ).all()

    return jsonify({"data": [org.to_json() for org in orgs]}), 200

@org_bp.route("/leave/<int:org_id>", methods=["POST"])
@token_required
def leave_org(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    if org.owner_id == current_user.id:
        return jsonify({"message": "Owner cannot leave their own organization"}), 400

    membership = OrganizationMember.query.filter_by(
        user_id=current_user.id,
        org_id=org.id
    ).first()
    if not membership:
        return jsonify({"message": "You are not a member of this organization"}), 400

    db.session.delete(membership)
    db.session.commit()

    return jsonify({"message": "Left organization successfully"}), 200

@org_bp.route("/details/<int:org_id>", methods=["GET"])
@token_required
def get_org_full_details(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    return jsonify({
        "org": org.to_json(),
        "members": [m.user.to_json() for m in org.members],
        "teams": [t.to_json() for t in org.teams],
        "events": [e.to_json() for e in org.events],
        "tasks": [t.to_json() for t in org.tasks]
    }), 200

@org_bp.route("/join", methods=["POST"])
@token_required
def join_org(current_user):
    try:
        code = request.json.get("code")
        if not code:
            return jsonify({"message": "Organization code is required"}), 400

        org = Organization.query.filter_by(code=code).first()
        if not org:
            return jsonify({"message": "Organization not found"}), 404

        # Prevent joining if already a member
        existing_member = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=org.id
        ).first()
        if existing_member:
            return jsonify({"message": "You are already member of this organization"}), 400

        membership = OrganizationMember(
            user_id=current_user.id,
            org_id=org.id,
            role=UserRole.MEMBER
        )

        db.session.add(membership)
        db.session.commit()

        return jsonify({
            "message": f"Joined organization '{org.name}' successfully",
            "data": org.to_json()
        }), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500