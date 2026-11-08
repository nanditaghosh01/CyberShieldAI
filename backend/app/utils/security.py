import datetime
import bcrypt
import jwt
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import settings

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a plain password with salt using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials."
        )

def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> dict:
    """Optional user authentication. Returns anonymous guest if no token provided."""
    if not credentials:
        return {"id": "anonymous", "username": "Guest", "role": "Regular User", "email": ""}
    try:
        payload = decode_access_token(credentials.credentials)
        return {
            "id": payload.get("sub"),
            "username": payload.get("username", "User"),
            "role": payload.get("role", "Regular User"),
            "email": payload.get("email", "")
        }
    except HTTPException:
        return {"id": "anonymous", "username": "Guest", "role": "Regular User", "email": ""}

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> dict:
    """Strict authentication. Raises 401 if missing or invalid."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid bearer token."
        )
    payload = decode_access_token(credentials.credentials)
    return {
        "id": payload.get("sub"),
        "username": payload.get("username", "User"),
        "role": payload.get("role", "Regular User"),
        "email": payload.get("email", "")
    }

def require_role(required_role: str):
    """Enforces role-based access control (RBAC)."""
    def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role", "Regular User")
        # Hierarchical roles: Administrator > Security Analyst > Regular User
        role_hierarchy = {"Administrator": 3, "Security Analyst": 2, "Regular User": 1}
        if role_hierarchy.get(user_role, 0) < role_hierarchy.get(required_role, 1):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires '{required_role}' privilege level."
            )
        return user
    return role_checker

