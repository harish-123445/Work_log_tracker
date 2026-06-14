import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth as auth_router
from app.routers import projects as projects_router
from app.routers import export as export_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="WorkLog API", version="1.0.0")

# Allow the frontend dev server and any deployed frontend origin(s).
# Set FRONTEND_ORIGINS as a comma-separated list in production, e.g.
# FRONTEND_ORIGINS=https://worklog.example.com,https://www.worklog.example.com
origins_env = os.getenv("FRONTEND_ORIGINS", "*")
origins = ["*"] if origins_env.strip() == "*" else [o.strip() for o in origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(projects_router.router)
app.include_router(export_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "WorkLog API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
