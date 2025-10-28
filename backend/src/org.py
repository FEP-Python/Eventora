from config import db
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from lib import generate_code, token_required
from models import Organization, OrganizationMember, OrgRole, TeamMember, EventStatus

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
        return jsonify({"message": "Club already exists"}), 400

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
        role=OrgRole.LEADER
    )
    db.session.add(org_member)

    try:
        db.session.commit()
        return jsonify(({"message": "Club created", "data": new_org.to_json()}), 201)
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

    user_role = current_user.get_org_role(org_id)
    org_data = org.to_json()
    org_data["userRole"] = user_role.value if user_role else None
    org_data["isMember"] = current_user.is_org_member(org_id)

    return jsonify({"data": org_data}), 200

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

    return jsonify({"message": "Organization updated", "data": org.to_json()}), 200

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

    # Check if user is a member
    if not current_user.is_org_member(org_id):
        return jsonify({"message": "Not authorized. Only members can view member list"}), 403

    members = []
    for member in org.members:
        user_data = member.user.to_json()
        user_data["orgRole"] = member.role.value
        # user_data["joinedAt"] = member.joined_at.isoformat() if member.joined_at else None
        user_data["isOwner"] = member.user_id == org.owner_id
        members.append(user_data)

    return jsonify({"data": members}), 200

@org_bp.route("/members/<int:org_id>/update-role", methods=["PATCH"])
@token_required
def update_member_role(current_user, org_id):
    """Update a member's role in the organization"""
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    # Only leaders can update roles
    if not current_user.is_org_leader(org_id):
        return jsonify({"message": "Not authorized. Only leaders can update member roles"}), 403

    user_id = request.json.get("userId")
    new_role = request.json.get("role")

    if not user_id or not new_role:
        return jsonify({"message": "userId and role are required"}), 400

    # Validate role
    try:
        role_enum = OrgRole[new_role.upper()]
    except KeyError:
        return jsonify({"message": "Invalid role. Valid roles: leader, coleader, member, volunteer"}), 400

    # Prevent demoting yourself if you're the owner
    if user_id == current_user.id and org.owner_id == current_user.id:
        return jsonify({"message": "Owner cannot change their own role"}), 400

    membership = OrganizationMember.query.filter_by(
        user_id=user_id,
        org_id=org_id
    ).first()

    if not membership:
        return jsonify({"message": "User is not a member of this organization"}), 404

    old_role = membership.role.value
    membership.role = role_enum

    try:
        db.session.commit()
        return jsonify({
            "message": f"Member role updated from {old_role} to {role_enum.value}",
            "data": {
                "userId": user_id,
                "oldRole": old_role,
                "newRole": role_enum.value
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@org_bp.route("/members/<int:org_id>/remove", methods=["DELETE"])
@token_required
def remove_member(current_user, org_id):
    """Remove a member from the organization"""
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    # Only admins can remove members
    if not current_user.is_org_admin(org_id):
        return jsonify({"message": "Not authorized. Only leaders and co-leaders can remove members"}), 403

    user_id = request.json.get("userId")
    if not user_id:
        return jsonify({"message": "userId is required"}), 400

    # Cannot remove the owner
    if user_id == org.owner_id:
        return jsonify({"message": "Cannot remove the organization owner"}), 400

    # Leaders cannot be removed by co-leaders
    target_role = org.get_member_role(user_id)
    if target_role == OrgRole.LEADER and not current_user.is_org_leader(org_id):
        return jsonify({"message": "Co-leaders cannot remove leaders"}), 403

    membership = OrganizationMember.query.filter_by(
        user_id=user_id,
        org_id=org_id
    ).first()

    if not membership:
        return jsonify({"message": "User is not a member of this organization"}), 404

    try:
        db.session.delete(membership)
        db.session.commit()
        return jsonify({"message": "Member removed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

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

    # Owner cannot leave their own organization
    if org.owner_id == current_user.id:
        return jsonify({"message": "Owner cannot leave their own organization. Transfer ownership or delete the organization instead"}), 400

    membership = OrganizationMember.query.filter_by(
        user_id=current_user.id,
        org_id=org.id
    ).first()

    if not membership:
        return jsonify({"message": "You are not a member of this organization"}), 400

    try:
        db.session.delete(membership)
        db.session.commit()
        return jsonify({"message": "Left organization successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@org_bp.route("/details/<int:org_id>", methods=["GET"])
@token_required
def get_org_full_details(current_user, org_id):
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    # Check if user is a member to view full details
    if not current_user.is_org_member(org_id):
        return jsonify({"message": "Not authorized. Only members can view full organization details"}), 403

    # Get user's role in the organization
    user_role = current_user.get_org_role(org_id)

    # Prepare members data with roles
    members_data = []
    for m in org.members:
        user_data = m.user.to_json()
        user_data["orgRole"] = m.role.value
        user_data["joinedAt"] = m.joined_at.isoformat() if m.joined_at else None
        user_data["isOwner"] = m.user_id == org.owner_id
        members_data.append(user_data)

    return jsonify({
        "org": org.to_json(),
        "userRole": user_role.value if user_role else None,
        "isOwner": org.owner_id == current_user.id,
        "members": members_data,
        "teams": [t.to_json() for t in org.teams],
        "events": [e.to_json() for e in org.events],
        "tasks": [t.to_json() for t in org.tasks],
        "budgets": [b.to_json() for b in org.budgets]
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
            return jsonify({"message": "Organization not found with this code"}), 404

        # Prevent joining if already a member
        existing_member = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=org.id
        ).first()
        if existing_member:
            return jsonify({"message": "You are already a member of this organization"}), 400

        # New members join as MEMBER role by default
        membership = OrganizationMember(
            user_id=current_user.id,
            org_id=org.id,
            role=OrgRole.MEMBER
        )

        db.session.add(membership)
        db.session.commit()

        org_data = org.to_json()
        org_data["userRole"] = OrgRole.MEMBER.value

        return jsonify({
            "message": f"Successfully joined '{org.name}'",
            "data": org_data
        }), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Database integrity error"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@org_bp.route("/my-organizations", methods=["GET"])
@token_required
def get_my_organizations(current_user):
    """Get all organizations where the current user is a member"""
    memberships = OrganizationMember.query.filter_by(user_id=current_user.id).all()

    orgs_data = []
    for membership in memberships:
        org_data = membership.organization.to_json()
        org_data["userRole"] = membership.role.value
        org_data["isOwner"] = membership.organization.owner_id == current_user.id
        org_data["joinedAt"] = membership.joined_at.isoformat() if membership.joined_at else None
        orgs_data.append(org_data)

    return jsonify({"data": orgs_data}), 200

@org_bp.route("/transfer-ownership/<int:org_id>", methods=["POST"])
@token_required
def transfer_ownership(current_user, org_id):
    """Transfer ownership of the organization to another member"""
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    # Only current owner can transfer ownership
    if org.owner_id != current_user.id:
        return jsonify({"message": "Not authorized. Only the owner can transfer ownership"}), 403

    new_owner_id = request.json.get("newOwnerId")
    if not new_owner_id:
        return jsonify({"message": "newOwnerId is required"}), 400

    # Check if new owner is a member
    new_owner_membership = OrganizationMember.query.filter_by(
        user_id=new_owner_id,
        org_id=org_id
    ).first()

    if not new_owner_membership:
        return jsonify({"message": "New owner must be a member of the organization"}), 400

    try:
        # Transfer ownership
        org.owner_id = new_owner_id

        # Make new owner a LEADER if not already
        if new_owner_membership.role != OrgRole.LEADER:
            new_owner_membership.role = OrgRole.LEADER

        # Current owner remains as LEADER (can be changed later)
        db.session.commit()

        return jsonify({
            "message": "Ownership transferred successfully",
            "data": {
                "newOwnerId": new_owner_id,
                "organizationId": org_id
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@org_bp.route("/statistics/<int:org_id>", methods=["GET"])
@token_required
def get_org_statistics(current_user, org_id):
    # """Get organization statistics"""
    org = Organization.query.get(org_id)
    if not org:
        return jsonify({"message": "Organization not found"}), 404

    # Only members can view statistics
    if not current_user.is_org_member(org_id):
        return jsonify({"message": "Not authorized. Only members can view organization statistics"}), 403

    # Calculate statistics
    total_members = len(org.members)
    total_events = len(org.events)
    total_teams = len(org.teams)
    total_tasks = len(org.tasks)

    # Count by role
    role_counts = {}
    for member in org.members:
        role = member.role.value
        role_counts[role] = role_counts.get(role, 0) + 1

    # Count events by status
    event_status_counts = {}
    for event in org.events:
        status = event.status.value
        event_status_counts[status] = event_status_counts.get(status, 0) + 1

    # Count tasks by status
    task_status_counts = {}
    for task in org.tasks:
        status = task.status.value
        task_status_counts[status] = task_status_counts.get(status, 0) + 1

    return jsonify({
        "data": {
            "totalMembers": total_members,
            "totalEvents": total_events,
            "totalTeams": total_teams,
            "totalTasks": total_tasks,
            "membersByRole": role_counts,
            "eventsByStatus": event_status_counts,
            "tasksByStatus": task_status_counts,
            "organizationAge": (datetime.utcnow() - org.created_at).days if org.created_at else 0
        }
    }), 200
