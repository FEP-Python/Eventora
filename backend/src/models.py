from email.policy import default

from config import db
from enum import Enum
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

class UserRole(Enum):
    Leader = "leader"
    COLEADER = "coleader"
    MEMBER = "member"
    VOLUNTEER = "volunteer"

# ASSOCIATION TABLE - MANY TO MANY
organization_members = db.Table("organization_members",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column('org_id', db.Integer, db.ForeignKey('organization.id'), primary_key=True),
    db.Column('role', db.String(20), default='member'),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

team_members = db.Table('team_members',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'), primary_key=True),
    db.Column('role', db.String(20), default='member'),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

task_assignees = db.Table('task_assignees',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True),
    db.Column('assigned_at', db.DateTime, default=datetime.utcnow)
)

# MODELS
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False, unique=False)
    last_name = db.Column(db.String(80), nullable=False, unique=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(120), nullable=False, unique=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    college = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owned_organizations = db.relationship('Organization', backref='owner', lazy=True)
    created_events = db.relationship('Event', backref='creator', lazy=True)
    created_tasks = db.relationship('Task', foreign_keys='Task.creator_id', backref='creator', lazy=True)
    led_teams = db.relationship('Team', backref='leader', lazy=True)

    organizations = db.relationship('Organization', secondary=organization_members, backref='members')
    teams = db.relationship('Team', secondary=team_members, backref='members')
    assigned_tasks = db.relationship('Task', secondary=task_assignees, backref='assignees')

    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "role": self.role,
            "college": self.college,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False, unique=False)
    college = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    contact_email = db.Column(db.String(120), nullable=False)
    contact_phone = db.Column(db.String(15), nullable=False)
    website = db.Column(db.String(255), nullable=True)
    code = db.Column(db.String(20), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    events = db.relationship('Event', backref='organization', lazy=True, cascade='all, delete-orphan')
    teams = db.relationship('Team', backref='organization', lazy=True, cascade='all, delete-orphan')
    budgets = db.relationship('Budget', backref='organization', lazy=True, cascade='all, delete-orphan')

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

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False, unique=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=False)
    title = db.Column(db.String(80), nullable=False, unique=False)
    description = db.Column(db.Text, unique=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    registration_deadline = db.Column(db.DateTime)
    capacity = db.Column(db.Integer)
    location = db.Column(db.Text, nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(EventStatus), default=EventStatus.DRAFT, nullable=False)
    is_public = db.Column(db.Boolean, default=True, nullable=False)
    registration_required = db.Column(db.Boolean, default=False)
    entry_fee = db.Column(db.Float, default=0.0)
    certificate_provided = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Task', backref='event', lazy=True, cascade='all, delete-orphan')

    def to_json(self):
        return {
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
            "venueDetails": self.venue_details,
            "eventType": self.event_type,
            "status": self.status,
            "isPublic": self.is_public,
            "registrationRequired": self.registration_required,
            "entryFee": self.entry_fee,
            "certificateProvided": self.certificate_provided,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    leader_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Task', backref='assigned_team', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "orgId": self.org_id,
            "leaderId": self.leader_id,
            "name": self.name,
            "description": self.description,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Enum(Priority), default=Priority.MEDIUM)
    status = db.Column(db.Enum(TaskStatus), default=TaskStatus.PENDING)
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_json(self):
        return {
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
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
        }

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    total_amount = db.Column(db.Float, nullable=False)
    spent_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_json(self):
        return {
            "id": self.id,
            "orgId": self.org_id,
            "name": self.name,
            "description": self.description,
            "totalAmount": self.total_amount,
            "spentAmount": self.spent_amount,
            "remainingAmount": self.total_amount - self.spent_amount,
        }
