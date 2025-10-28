from enum import Enum
from src.config import db
from datetime import datetime


# ENUMS
class EventStatus(Enum):
    DRAFT = "draft"
    PLANNED = "planned"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class OrgRole(Enum):
    LEADER = "leader"
    COLEADER = "coleader"
    MEMBER = "member"
    VOLUNTEER = "volunteer"


# Association Models
class OrganizationMember(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey(
        "organization.id"), primary_key=True)
    role = db.Column(db.Enum(OrgRole), default=OrgRole.MEMBER, nullable=False)
    user = db.relationship("User", back_populates="organization_memberships")
    organization = db.relationship("Organization", back_populates="members"
                                   )


class TeamMember(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey("team.id"), primary_key=True)
    role = db.Column(db.Enum(OrgRole), default=OrgRole.MEMBER, nullable=False)
    user = db.relationship("User", back_populates="team_memberships")
    team = db.relationship("Team", back_populates="members"
                           )


class TaskAssignee(db.Model):
    task_id = db.Column(db.Integer, db.ForeignKey("task.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index("idx_task_user", "task_id", "user_id"),
    )


# MODELS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    college = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization_memberships = db.relationship(
        "OrganizationMember", back_populates="user", cascade="all, delete-orphan")
    team_memberships = db.relationship(
        "TeamMember", back_populates="user", cascade="all, delete-orphan")
    # tasks_assigned = db.relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")

    owned_organizations = db.relationship(
        "Organization", backref="owner", lazy=True, cascade="all, delete-orphan")
    created_events = db.relationship(
        "Event", backref="creator", lazy=True, cascade="all, delete-orphan")
    created_tasks = db.relationship(
        "Task", foreign_keys="Task.creator_id", backref="creator", lazy=True, cascade="all, delete-orphan")
    led_teams = db.relationship(
        "Team", backref="leader", lazy=True, cascade="all, delete-orphan")

    __table_args__ = (
        db.Index("idx_user_name", "first_name", "last_name"),
    )

    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "college": self.college,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def get_org_role(self, org_id):
        """Get user's role in a specific organization"""
        membership = OrganizationMember.query.filter_by(
            user_id=self.id,
            org_id=org_id
        ).first()
        return membership.role if membership else None

    def is_org_member(self, org_id):
        """Check if user is a member of the organization"""
        return OrganizationMember.query.filter_by(
            user_id=self.id,
            org_id=org_id
        ).first() is not None

    def is_org_admin(self, org_id):
        """Check if user is a leader or co-leader of the organization"""
        membership = OrganizationMember.query.filter_by(
            user_id=self.id,
            org_id=org_id
        ).first()
        return membership and membership.role in [OrgRole.LEADER, OrgRole.COLEADER]

    def is_org_leader(self, org_id):
        """Check if user is a leader of the organization"""
        membership = OrganizationMember.query.filter_by(
            user_id=self.id,
            org_id=org_id
        ).first()
        return membership and membership.role == OrgRole.LEADER


class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    college = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120), nullable=False)
    contact_phone = db.Column(db.String(15), nullable=False)
    website = db.Column(db.String(255))
    code = db.Column(db.String(20), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = db.relationship(
        "OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    events = db.relationship(
        "Event", back_populates="organization", lazy=True, cascade="all, delete-orphan")
    teams = db.relationship(
        "Team", back_populates="organization", lazy=True, cascade="all, delete-orphan")
    tasks = db.relationship(
        "Task", back_populates="organization", lazy=True, cascade="all, delete-orphan")
    budgets = db.relationship(
        "Budget", backref="organization", lazy=True, cascade="all, delete-orphan")

    __table_args__ = (
        db.Index("idx_org_owner", "owner_id"),
        db.Index("idx_org_name", "name"),
        db.Index("idx_org_code", "code"),
    )

    def to_json(self):
        return {
            "id": self.id,
            "ownerId": self.owner_id,
            "name": self.name,
            "college": self.college,
            "description": self.description,
            "contactEmail": self.contact_email,
            "contactPhone": self.contact_phone,
            "website": self.website,
            "code": self.code,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

    def get_member_role(self, user_id):
        """Get a member's role in this organization"""
        membership = OrganizationMember.query.filter_by(
            user_id=user_id,
            org_id=self.id
        ).first()
        return membership.role if membership else None


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey(
        'organization.id'), nullable=False)
    creator_id = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    registration_deadline = db.Column(db.DateTime)
    capacity = db.Column(db.Integer)
    location = db.Column(db.Text, nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(EventStatus),
                       default=EventStatus.DRAFT, nullable=False)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    registration_required = db.Column(db.Boolean, default=False)
    entry_fee = db.Column(db.Float, default=0.0)
    certificate_provided = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = db.relationship("Organization", back_populates="events")
    tasks = db.relationship("Task", back_populates="event",
                            lazy=True, cascade="all, delete-orphan")

    __table_args__ = (
        db.Index("idx_event_org_title", "org_id", "title"),
    )

    def to_json(self, include_creator=False):
        data = {
            "id": self.id,
            "orgId": self.org_id,
            "creatorId": self.creator_id,
            "title": self.title,
            "description": self.description,
            "startDate": self.start_date,
            "endDate": self.end_date,
            "registrationDeadline": self.registration_deadline,
            "capacity": self.capacity,
            "location": self.location,
            "eventType": self.event_type,
            "status": self.status.value if self.status else None,
            "isPublic": self.is_public,
            "registrationRequired": self.registration_required,
            "entryFee": self.entry_fee,
            "certificateProvided": self.certificate_provided,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_creator and self.creator:
            data["creator"] = self.creator.to_json()

        return data


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey(
        'organization.id'), nullable=False)
    leader_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = db.relationship(
        "TeamMember", back_populates="team", cascade="all, delete-orphan")
    organization = db.relationship("Organization", back_populates="teams")
    tasks = db.relationship("Task", back_populates="team",
                            cascade="all, delete-orphan")

    __table_args__ = (
        db.Index("idx_team_org_name", "org_id", "name"),
    )

    def to_json(self, include_members=True):
        data = {
            "id": self.id,
            "orgId": self.org_id,
            "leaderId": self.leader_id,
            "name": self.name,
            "description": self.description,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "members": [member.user.to_json() for member in self.members],
            "tasks": [task.to_json() for task in self.tasks] if self.tasks else []
        }

        if include_members:
            data["members"] = []
            for member in self.members:
                user_data = member.user.to_json()
                user_data["teamRole"] = member.role.value
                data["members"].append(user_data)

        return data


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey(
        'organization.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    creator_id = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    # assignee_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Enum(Priority), default=Priority.MEDIUM)
    status = db.Column(db.Enum(TaskStatus), default=TaskStatus.PENDING)
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # assignee = db.relationship("User", back_populates="tasks_assigned", foreign_keys=[assignee_id])
    event = db.relationship("Event", back_populates="tasks")
    team = db.relationship("Team", back_populates="tasks")
    organization = db.relationship("Organization", back_populates="tasks")

    __table_args__ = (
        db.Index("idx_task_team_status", "team_id", "status"),
        db.Index("idx_task_event_status", "event_id", "status"),
    )

    def to_json(self):
        data = {
            "id": self.id,
            "eventId": self.event_id,
            "teamId": self.team_id,
            "creatorId": self.creator_id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.value if self.priority else None,
            "status": self.status.value if self.status else None,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

        assignees = (
            db.session.query(User.id, User.first_name, User.last_name)
            .join(TaskAssignee, TaskAssignee.user_id == User.id)
            .filter(TaskAssignee.task_id == self.id)
            .all()
        );

        data["assignees"] = [{"id": user.id, "name": user.first_name + " " + user.last_name} for user in assignees]
        return data


class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey(
        'organization.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    total_amount = db.Column(db.Float, nullable=False)
    spent_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.Index("idx_budget_org_name", "org_id", "name"),
    )

    def to_json(self):
        return {
            "id": self.id,
            "orgId": self.org_id,
            "name": self.name,
            "description": self.description,
            "totalAmount": self.total_amount,
            "spentAmount": self.spent_amount,
            "remainingAmount": self.total_amount - self.spent_amount,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
