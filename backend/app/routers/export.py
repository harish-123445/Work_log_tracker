from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app import schemas, auth, reports
from app.database import get_db
from app.routers.projects import _get_owned_project

router = APIRouter(prefix="/export", tags=["export"])


def _slug(text: str) -> str:
    return "".join(c if c.isalnum() else "_" for c in text).strip("_")[:60]


@router.get("/project/{project_id}/pdf")
def export_project_pdf(
    project_id: str,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    project_dict = _get_owned_project(db, project_id, current_user)
    project = schemas.ProjectOut(**project_dict)
    
    buf = reports.build_project_pdf(project)
    filename = f"{_slug(project.project_title)}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/project/{project_id}/docx")
def export_project_docx(
    project_id: str,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    project_dict = _get_owned_project(db, project_id, current_user)
    project = schemas.ProjectOut(**project_dict)
    
    buf = reports.build_project_docx(project)
    filename = f"{_slug(project.project_title)}.docx"
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/all/pdf")
def export_all_pdf(
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    projects_dict = db.child("projects").order_by_child("owner_id").equal_to(current_user.id).get()
    if not projects_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No projects to export")

    projects = []
    for pid, pdata in projects_dict.items():
        pdata["id"] = pid
        projects.append(schemas.ProjectOut(**pdata))

    # Sort by company_name ASC, start_date DESC
    def sort_key(p):
        sd = p.start_date.isoformat() if p.start_date else ""
        return (p.company_name, sd)

    projects.sort(key=sort_key, reverse=True) # This reverses both, not ideal for company.
    # To correctly sort company ASC and date DESC:
    projects.sort(key=lambda p: p.start_date.isoformat() if p.start_date else "", reverse=True)
    projects.sort(key=lambda p: p.company_name)

    buf = reports.build_full_pdf(current_user, projects)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="work_log_report.pdf"'},
    )


@router.get("/all/docx")
def export_all_docx(
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    projects_dict = db.child("projects").order_by_child("owner_id").equal_to(current_user.id).get()
    if not projects_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No projects to export")

    projects = []
    for pid, pdata in projects_dict.items():
        pdata["id"] = pid
        projects.append(schemas.ProjectOut(**pdata))

    projects.sort(key=lambda p: p.start_date.isoformat() if p.start_date else "", reverse=True)
    projects.sort(key=lambda p: p.company_name)

    buf = reports.build_full_docx(current_user, projects)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": 'attachment; filename="work_log_report.docx"'},
    )
