import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional

class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "Regular User"  # "Regular User", "Security Analyst", "Administrator"

    @field_validator("email")
    def validate_email_format(cls, v):
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(pattern, v):
            raise ValueError("Invalid email format.")
        return v.lower().strip()

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
