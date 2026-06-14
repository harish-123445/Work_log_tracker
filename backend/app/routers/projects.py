from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas, auth
from app.database import get_db

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_owned_project(db: Session, project_id: int, user: models.User) -> models.Project:
    project = (
        db.query(models.Project)
        .filter(models.Project.id == project_id, models.Project.owner_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("", response_model=list[schemas.ProjectOut])
def list_projects(
    company: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Project).filter(models.Project.owner_id == current_user.id)

    if company:
        query = query.filter(models.Project.company_name == company)
    if status_filter:
        query = query.filter(models.Project.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.filter(
            models.Project.project_title.ilike(like)
            | models.Project.description.ilike(like)
        )

    return query.order_by(models.Project.start_date.desc().nullslast()).all()


@router.get("/companies", response_model=list[str])
def list_companies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    rows = (
        db.query(models.Project.company_name)
        .filter(models.Project.owner_id == current_user.id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]


@router.get("/stats")
def project_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    base = db.query(models.Project).filter(models.Project.owner_id == current_user.id)

    total = base.count()
    by_status = dict(
        db.query(models.Project.status, func.count(models.Project.id))
        .filter(models.Project.owner_id == current_user.id)
        .group_by(models.Project.status)
        .all()
    )
    by_company = dict(
        db.query(models.Project.company_name, func.count(models.Project.id))
        .filter(models.Project.owner_id == current_user.id)
        .group_by(models.Project.company_name)
        .all()
    )

    return {
        "total_projects": total,
        "by_status": by_status,
        "by_company": by_company,
    }


@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = models.Project(**project_in.model_dump(), owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return _get_owned_project(db, project_id, current_user)


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = _get_owned_project(db, project_id, current_user)
    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = _get_owned_project(db, project_id, current_user)
    db.delete(project)
    db.commit()
    return None
