import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL examples:
#   sqlite:///./worklog.db                                  (default, local file)
#   postgresql+psycopg2://user:pass@host:5432/dbname        (when deploying)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./worklog.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
