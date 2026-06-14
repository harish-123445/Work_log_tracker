from datetime import date, datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field

StatusLiteral = Literal["Ongoing", "Completed", "On Hold"]


# ---------- Auth ----------

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Project ----------

class ProjectBase(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    project_title: str = Field(min_length=1, max_length=255)
    role_title: Optional[str] = None
    description: Optional[str] = None
    features: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)
    project_manager_name: Optional[str] = None
    project_manager_contact: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: StatusLiteral = "Ongoing"
    achievements: Optional[str] = None
    notes: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    company_name: Optional[str] = None
    project_title: Optional[str] = None
    role_title: Optional[str] = None
    description: Optional[str] = None
    features: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    project_manager_name: Optional[str] = None
    project_manager_contact: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[StatusLiteral] = None
    achievements: Optional[str] = None
    notes: Optional[str] = None


class ProjectOut(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
