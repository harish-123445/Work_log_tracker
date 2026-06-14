from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan"
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    company_name = Column(String(255), nullable=False)
    project_title = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    features = Column(JSON, default=list)        # list[str]
    technologies = Column(JSON, default=list)    # list[str]

    project_manager_name = Column(String(255), nullable=True)
    project_manager_contact = Column(String(255), nullable=True)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="Ongoing")  # Ongoing | Completed | On Hold

    achievements = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
