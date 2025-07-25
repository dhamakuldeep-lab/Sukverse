"""
Pydantic schemas for request and response models in the auth service.

These models define the expected structure of incoming data (e.g. for
registration and login) and outgoing data (e.g. user information and
tokens).
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, constr


class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None


class ChangePassword(BaseModel):
    old_password: constr(min_length=6)
    new_password: constr(min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: constr(min_length=6)


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str] = None
    is_active: bool
    is_admin: bool

    class Config:
        orm_mode = True

# Schema for admin to update any user fields
class UserAdminUpdate(BaseModel):
    """Fields that an admin can update for a user."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None