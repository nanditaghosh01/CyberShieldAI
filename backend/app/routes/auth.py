import uuid
import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from ..utils.security import hash_password, verify_password, create_access_token, get_current_user
from ..database import db_manager

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister):
    # Check if user already exists
    existing = db_manager.find_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Allow setting role if valid, default to Regular User
    allowed_roles = ["Regular User", "Security Analyst", "Administrator"]
    role = user_in.role if user_in.role in allowed_roles else "Regular User"

    user_id = str(uuid.uuid4())
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    hashed_pwd = hash_password(user_in.password)

    user_data = {
        "id": user_id,
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_pwd,
        "role": role,
        "created_at": now_iso
    }

    db_manager.insert_user(user_data)

    token = create_access_token({"sub": user_id, "username": user_in.username, "role": role, "email": user_in.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_in.email,
            "username": user_in.username,
            "role": role,
            "created_at": now_iso
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin):
    user = db_manager.find_user_by_email(login_in.email)
    if not user or not verify_password(login_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )

    user_id = user["id"]
    token = create_access_token({
        "sub": user_id,
        "username": user["username"],
        "role": user["role"],
        "email": user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user["email"],
            "username": user["username"],
            "role": user["role"],
            "created_at": user.get("created_at", "")
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    user = db_manager.find_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "role": user["role"],
        "created_at": user.get("created_at", "")
    }

