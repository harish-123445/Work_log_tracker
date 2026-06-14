from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, auth, reports
from app.database import get_db
from app.routers.projects import _get_owned_project

router = APIRouter(prefix="/export", tags=["export"])


def _slug(text: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in text).strip("_")[:60]


@router.get("/project/{project_id}/pdf")
def export_project_pdf(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = _get_owned_project(db, project_id, current_user)
    buf = reports.build_project_pdf(project)
    filename = f"{_slug(project.project_title)}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/project/{project_id}/docx")
def export_project_docx(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = _get_owned_project(db, project_id, current_user)
    buf = reports.build_project_docx(project)
    filename = f"{_slug(project.project_title)}.docx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/all/pdf")
def export_all_pdf(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    projects = (
        db.query(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Project.company_name, models.Project.start_date.desc().nullslast())
        .all()
    )
    if not projects:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No projects to export")

    buf = reports.build_full_pdf(current_user, projects)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="work_log_report.pdf"'},
    )


@router.get("/all/docx")
def export_all_docx(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    projects = (
        db.query(models.Project)
        .filter(models.Project.owner_id == current_user.id)
        .order_by(models.Project.company_name, models.Project.start_date.desc().nullslast())
        .all()
    )
    if not projects:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No projects to export")

    buf = reports.build_full_docx(current_user, projects)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": 'attachment; filename="work_log_report.docx"'},
    )
