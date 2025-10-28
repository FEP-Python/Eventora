from src.config import db
from src.lib import token_required
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from src.models import Budget, Organization, OrganizationMember, OrgRole

budget_bp = Blueprint("budget", __name__)

@budget_bp.route("/create", methods=["POST"])
@token_required
def create_budget(current_user):
    try:
        data = request.json

        # Extract required fields
        org_id = data.get("orgId")
        name = data.get("name")
        total_amount = data.get("totalAmount")

        # Validate required fields
        if not all([org_id, name, total_amount]):
            missing_fields = []
            if not org_id: missing_fields.append("orgId")
            if not name: missing_fields.append("name")
            if not total_amount: missing_fields.append("totalAmount")

            return jsonify({
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Validate total_amount is positive
        if total_amount <= 0:
            return jsonify({"message": "Total amount must be greater than 0"}), 400

        # Verify organization exists
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({"message": "Organization not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        # Check if user has permission to create budget (leader or coleader)
        if membership.role not in [OrgRole.LEADER, OrgRole.COLEADER]:
            return jsonify({"message": "Only leaders and co-leaders can create budgets"}), 403

        # Extract optional fields
        description = data.get("description", "")
        spent_amount = data.get("spentAmount", 0.0)

        # Validate spent_amount is not negative and not greater than total_amount
        if spent_amount < 0:
            return jsonify({"message": "Spent amount cannot be negative"}), 400

        if spent_amount > total_amount:
            return jsonify({"message": "Spent amount cannot be greater than total amount"}), 400

        # Create new budget
        new_budget = Budget(
            org_id=org_id,
            name=name,
            description=description,
            total_amount=float(total_amount),
            spent_amount=float(spent_amount)
        )

        db.session.add(new_budget)
        db.session.commit()

        return jsonify({
            "message": "Budget created successfully",
            "data": new_budget.to_json()
        }), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Database integrity error", "error": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "An error occurred", "error": str(e)}), 400

@budget_bp.route("/get-all/<int:org_id>", methods=["GET"])
@token_required
def get_all_budgets_by_org_id(current_user, org_id):
    try:
        # Verify organization exists
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({"message": "Organization not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        budgets = Budget.query.filter_by(org_id=org_id).all()
        return jsonify({"data": [budget.to_json() for budget in budgets]}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@budget_bp.route("/get/<int:budget_id>", methods=["GET"])
@token_required
def get_budget_by_id(current_user, budget_id):
    try:
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"message": "Budget not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=budget.org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        return jsonify({"data": budget.to_json()}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@budget_bp.route("/update/<int:budget_id>", methods=["PATCH"])
@token_required
def update_budget(current_user, budget_id):
    try:
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"message": "Budget not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=budget.org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        # Check if user has permission to update budget (leader or coleader)
        if membership.role not in [OrgRole.LEADER, OrgRole.COLEADER]:
            return jsonify({"message": "Only leaders and co-leaders can update budgets"}), 403

        data = request.json

        # Update fields if provided
        if "name" in data:
            budget.name = data["name"]
        if "description" in data:
            budget.description = data["description"]
        if "totalAmount" in data:
            total_amount = float(data["totalAmount"])
            if total_amount <= 0:
                return jsonify({"message": "Total amount must be greater than 0"}), 400
            budget.total_amount = total_amount
        if "spentAmount" in data:
            spent_amount = float(data["spentAmount"])
            if spent_amount < 0:
                return jsonify({"message": "Spent amount cannot be negative"}), 400
            if spent_amount > budget.total_amount:
                return jsonify({"message": "Spent amount cannot be greater than total amount"}), 400
            budget.spent_amount = spent_amount

        db.session.commit()

        return jsonify({
            "message": "Budget updated successfully",
            "data": budget.to_json()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Update failed", "error": str(e)}), 400

@budget_bp.route("/delete/<int:budget_id>", methods=["DELETE"])
@token_required
def delete_budget(current_user, budget_id):
    try:
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"message": "Budget not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=budget.org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        # Check if user has permission to delete budget (leader or coleader)
        if membership.role not in [OrgRole.LEADER, OrgRole.COLEADER]:
            return jsonify({"message": "Only leaders and co-leaders can delete budgets"}), 403

        db.session.delete(budget)
        db.session.commit()

        return jsonify({"message": "Budget deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Delete failed", "error": str(e)}), 400

@budget_bp.route("/add-expense/<int:budget_id>", methods=["POST"])
@token_required
def add_expense(current_user, budget_id):
    try:
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"message": "Budget not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=budget.org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        # Check if user has permission to add expenses (leader or coleader)
        if membership.role not in [OrgRole.LEADER, OrgRole.COLEADER]:
            return jsonify({"message": "Only leaders and co-leaders can add expenses"}), 403

        data = request.json
        expense_amount = data.get("amount")

        if not expense_amount:
            return jsonify({"message": "Expense amount is required"}), 400

        expense_amount = float(expense_amount)
        if expense_amount <= 0:
            return jsonify({"message": "Expense amount must be greater than 0"}), 400

        # Check if adding this expense would exceed the total budget
        new_spent_amount = budget.spent_amount + expense_amount
        if new_spent_amount > budget.total_amount:
            return jsonify({
                "message": f"Adding this expense would exceed the budget. Current spent: {budget.spent_amount}, Total budget: {budget.total_amount}, Expense: {expense_amount}"
            }), 400

        budget.spent_amount = new_spent_amount
        db.session.commit()

        return jsonify({
            "message": "Expense added successfully",
            "data": budget.to_json()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to add expense", "error": str(e)}), 400

@budget_bp.route("/remove-expense/<int:budget_id>", methods=["POST"])
@token_required
def remove_expense(current_user, budget_id):
    try:
        budget = Budget.query.get(budget_id)
        if not budget:
            return jsonify({"message": "Budget not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=budget.org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        # Check if user has permission to remove expenses (leader or coleader)
        if membership.role not in [OrgRole.LEADER, OrgRole.COLEADER]:
            return jsonify({"message": "Only leaders and co-leaders can remove expenses"}), 403

        data = request.json
        expense_amount = data.get("amount")

        if not expense_amount:
            return jsonify({"message": "Expense amount is required"}), 400

        expense_amount = float(expense_amount)
        if expense_amount <= 0:
            return jsonify({"message": "Expense amount must be greater than 0"}), 400

        # Check if removing this expense would make spent amount negative
        new_spent_amount = budget.spent_amount - expense_amount
        if new_spent_amount < 0:
            return jsonify({
                "message": f"Cannot remove expense. Current spent: {budget.spent_amount}, Expense to remove: {expense_amount}"
            }), 400

        budget.spent_amount = new_spent_amount
        db.session.commit()

        return jsonify({
            "message": "Expense removed successfully",
            "data": budget.to_json()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to remove expense", "error": str(e)}), 400

@budget_bp.route("/analytics/<int:org_id>", methods=["GET"])
@token_required
def get_budget_analytics(current_user, org_id):
    try:
        # Verify organization exists
        org = Organization.query.get(org_id)
        if not org:
            return jsonify({"message": "Organization not found"}), 404

        # Check if user is a member of the organization
        membership = OrganizationMember.query.filter_by(
            user_id=current_user.id,
            org_id=org_id
        ).first()

        if not membership:
            return jsonify({"message": "You are not a member of this organization"}), 403

        budgets = Budget.query.filter_by(org_id=org_id).all()

        # Calculate analytics
        total_budget = sum(budget.total_amount for budget in budgets)
        total_spent = sum(budget.spent_amount for budget in budgets)
        total_remaining = total_budget - total_spent

        analytics = {
            "totalBudgets": len(budgets),
            "totalBudgetAmount": total_budget,
            "totalSpentAmount": total_spent,
            "totalRemainingAmount": total_remaining,
            "utilizationPercentage": (total_spent / total_budget * 100) if total_budget > 0 else 0,
            "budgets": [budget.to_json() for budget in budgets]
        }

        return jsonify({"data": analytics}), 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
