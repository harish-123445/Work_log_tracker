import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app import schemas, auth
from app.database import get_db

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_owned_project(db, project_id: str, user: schemas.UserOut) -> dict:
    project_data = db.child("projects").child(project_id).get()
    if not project_data or project_data.get("owner_id") != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project_data["id"] = project_id
    return project_data


@router.get("", response_model=list[schemas.ProjectOut])
def list_projects(
    company: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    projects_dict = db.child("projects").order_by_child("owner_id").equal_to(current_user.id).get()
    
    if not projects_dict:
        return []
        
    projects = []
    for pid, pdata in projects_dict.items():
        pdata["id"] = pid
        projects.append(pdata)
        
    if company:
        projects = [p for p in projects if p.get("company_name") == company]
    if status_filter:
        projects = [p for p in projects if p.get("status") == status_filter]
    if search:
        s = search.lower()
        projects = [
            p for p in projects 
            if s in str(p.get("project_title", "")).lower() or s in str(p.get("description", "")).lower()
        ]
        
    def sort_key(p):
        sd = p.get("start_date")
        return sd if sd is not None else ""
        
    projects.sort(key=sort_key, reverse=True)
    return projects


@router.get("/companies", response_model=list[str])
def list_companies(
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    projects_dict = db.child("projects").order_by_child("owner_id").equal_to(current_user.id).get()
    if not projects_dict:
        return []
    
    companies = set()
    for pdata in projects_dict.values():
        cname = pdata.get("company_name")
        if cname:
            companies.add(cname)
            
    return list(companies)


@router.get("/stats")
def project_stats(
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    projects_dict = db.child("projects").order_by_child("owner_id").equal_to(current_user.id).get()
    if not projects_dict:
        return {"total_projects": 0, "by_status": {}, "by_company": {}}
        
    total = len(projects_dict)
    by_status = {}
    by_company = {}
    
    for pdata in projects_dict.values():
        st = pdata.get("status", "Unknown")
        comp = pdata.get("company_name", "Unknown")
        
        by_status[st] = by_status.get(st, 0) + 1
        by_company[comp] = by_company.get(comp, 0) + 1
        
    return {
        "total_projects": total,
        "by_status": by_status,
        "by_company": by_company,
    }


@router.post("", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: schemas.ProjectCreate,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    project_id = uuid.uuid4().hex
    now = datetime.utcnow().isoformat()
    
    project_data = project_in.model_dump()
    for k, v in project_data.items():
        if hasattr(v, 'isoformat'):
            project_data[k] = v.isoformat()
            
    project_data["owner_id"] = current_user.id
    project_data["created_at"] = now
    project_data["updated_at"] = now
    
    db.child("projects").child(project_id).set(project_data)
    
    project_data["id"] = project_id
    return project_data


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: str,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    return _get_owned_project(db, project_id, current_user)


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: str,
    project_in: schemas.ProjectUpdate,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    project_data = _get_owned_project(db, project_id, current_user)
    
    update_data = project_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if hasattr(v, 'isoformat'):
            update_data[k] = v.isoformat()
            
    now = datetime.utcnow().isoformat()
    update_data["updated_at"] = now
    
    db.child("projects").child(project_id).update(update_data)
    
    project_data.update(update_data)
    return project_data


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db = Depends(get_db),
    current_user: schemas.UserOut = Depends(auth.get_current_user),
):
    _get_owned_project(db, project_id, current_user)
    db.child("projects").child(project_id).delete()
    return None

