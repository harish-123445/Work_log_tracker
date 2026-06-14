import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app import schemas, auth
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db = Depends(get_db)):
    users_by_username = db.child("users").order_by_child("username").equal_to(user_in.username).get()
    if users_by_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with that username already exists")
        
    users_by_email = db.child("users").order_by_child("email").equal_to(user_in.email).get()
    if users_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user with that email already exists")

    user_id = uuid.uuid4().hex
    now = datetime.utcnow().isoformat()
    
    user_data = {
        "username": user_in.username,
        "email": user_in.email,
        "full_name": user_in.full_name,
        "hashed_password": auth.hash_password(user_in.password),
        "created_at": now
    }
    
    db.child("users").child(user_id).set(user_data)
    
    user_data["id"] = user_id
    return schemas.UserOut(**user_data)


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)
):
    users_dict = db.child("users").order_by_child("username").equal_to(form_data.username).get()
    
    if not users_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id, user_data = list(users_dict.items())[0]
    
    if not auth.verify_password(form_data.password, user_data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": str(user_id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: schemas.UserOut = Depends(auth.get_current_user)):
    return current_user
