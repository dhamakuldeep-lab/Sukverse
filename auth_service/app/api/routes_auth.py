"""
API routes for user authentication and management.

Provides endpoints for registration, login, retrieving the current user,
updating profiles, changing passwords and password reset.  Tokens are
issued as JWTs and must be included in the Authorization header for
protected routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..schemas import user as user_schema
from ..services import auth as auth_service
from ..db import models
from ..security import jwt as jwt_utils
from ..schemas.user import UserAdminUpdate, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth2 scheme for extracting bearer token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt_utils.decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload["sub"]
    user = auth_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.post("/register", response_model=user_schema.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = auth_service.register_user(db, user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return new_user


@router.post("/login", response_model=user_schema.TokenPair)
def login(user: user_schema.UserLogin, db: Session = Depends(get_db)):
    db_user = auth_service.authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = jwt_utils.create_access_token({"sub": db_user.email})
    refresh_token = jwt_utils.create_refresh_token({"sub": db_user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=user_schema.UserOut)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user


@router.put("/update-profile", response_model=user_schema.UserOut)
def update_profile(
    update_data: user_schema.UserUpdate = Body(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        updated = auth_service.update_user_profile(db, current_user.id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return updated


@router.put("/change-password", response_model=dict)
def change_password(
    password_data: user_schema.ChangePassword = Body(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        auth_service.change_password(db, current_user.id, password_data.old_password, password_data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Password changed successfully."}


@router.post("/forgot-password", response_model=dict)
def forgot_password(payload: user_schema.ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        token = auth_service.forgot_password_logic(db, payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    # In a real implementation you would send this token via email
    return {"message": "Password reset token generated.", "token": token}


@router.post("/reset-password", response_model=dict)
def reset_password(payload: user_schema.ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        auth_service.reset_password_logic(db, payload.token, payload.new_password)  # token unused in this stub
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return {"message": "Password reset successful."}


@router.post("/refresh-token", response_model=user_schema.TokenPair)
def refresh_token(payload: user_schema.TokenRefreshRequest):
    # Decode the refresh token and issue a new access token
    decoded = jwt_utils.decode_token(payload.refresh_token)
    if not decoded or "sub" not in decoded:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    email = decoded["sub"]
    new_access = jwt_utils.create_access_token({"sub": email})
    return {
        "access_token": new_access,
        "refresh_token": payload.refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout", response_model=dict)
def logout_user():
    # Stateless JWT logout: simply return a message; client should discard tokens
    return {"message": "Logged out successfully."}


# === Admin-only user management endpoints ===

@router.get("/users", response_model=list[UserOut])
def list_users(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Return a list of all users. Requires admin privileges.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    users = auth_service.get_all_users(db)
    return users


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve a single user by ID. Admin only.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def admin_update_user(user_id: int, update_data: UserAdminUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Update a user as an admin. Admin can change email, username, profile picture, active status and admin rights.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    try:
        updated = auth_service.admin_update_user(db, user_id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return updated


@router.delete("/users/{user_id}", response_model=dict)
def admin_delete_user(user_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Soft-delete a user by marking them inactive. Admin only.
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    try:
        auth_service.delete_user(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return {"message": "User deactivated successfully."}