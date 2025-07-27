"""
Business logic for the auth service.

This module provides functions for registering users, authenticating
credentials, updating profiles, changing passwords and handling
password reset flows.  It is separate from the API layer so that
business logic can be reused or tested independently.
"""

from datetime import datetime
from typing import Optional

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..db import models
from ..schemas import user as user_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def register_user(db: Session, user_data: user_schema.UserCreate) -> models.User:
    if get_user_by_email(db, user_data.email):
        raise ValueError("User already exists")
    hashed = pwd_context.hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        username=user_data.email.split("@")[0],
        password_hash=hashed,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if user and pwd_context.verify(password, user.password_hash):
        user.last_login = datetime.utcnow()
        db.commit()
        return user
    return None


def update_user_profile(db: Session, user_id: int, update_data: user_schema.UserUpdate) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    if update_data.email:
        # Ensure new email isn't taken
        existing = get_user_by_email(db, update_data.email)
        if existing and existing.id != user.id:
            raise ValueError("Email already in use")
        user.email = update_data.email
    if update_data.username:
        user.username = update_data.username
    if update_data.profile_picture_url:
        user.profile_picture_url = update_data.profile_picture_url
    db.commit()
    db.refresh(user)
    return user


def get_all_users(db: Session) -> list[models.User]:
    """Return all users. Intended for admin use only."""
    return db.query(models.User).all()


def admin_update_user(db: Session, user_id: int, update_data: user_schema.UserAdminUpdate) -> models.User:
    """
    Update a user record as an admin. Allows changing email, username, profile picture,
    and toggling active/admin status. Does not update password.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    # Only update provided fields
    if update_data.email is not None:
        # Ensure new email is not taken by another user
        existing = get_user_by_email(db, update_data.email)
        if existing and existing.id != user.id:
            raise ValueError("Email already in use")
        user.email = update_data.email
    if update_data.username is not None:
        user.username = update_data.username
    if update_data.profile_picture_url is not None:
        user.profile_picture_url = update_data.profile_picture_url
    if update_data.is_active is not None:
        user.is_active = update_data.is_active
    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin
    db.commit()
    db.refresh(user)
    return user


def bulk_update_users(db: Session, updates: list[user_schema.UserBulkUpdate]) -> list[models.User]:
    """Update multiple users in a single operation."""
    updated_records: list[models.User] = []
    for item in updates:
        user = db.query(models.User).filter(models.User.id == item.id).first()
        if not user:
            raise ValueError("User not found")
        if item.email is not None:
            existing = get_user_by_email(db, item.email)
            if existing and existing.id != user.id:
                raise ValueError("Email already in use")
            user.email = item.email
        if item.username is not None:
            user.username = item.username
        if item.profile_picture_url is not None:
            user.profile_picture_url = item.profile_picture_url
        if item.is_active is not None:
            user.is_active = item.is_active
        if item.is_admin is not None:
            user.is_admin = item.is_admin
        updated_records.append(user)
    db.commit()
    for user in updated_records:
        db.refresh(user)
    return updated_records


def delete_user(db: Session, user_id: int) -> None:
    """Soft delete a user by marking them inactive. Does not remove from DB."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    user.is_active = False
    db.commit()


def change_password(db: Session, user_id: int, old_password: str, new_password: str) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not pwd_context.verify(old_password, user.password_hash):
        raise ValueError("Incorrect old password")
    user.password_hash = pwd_context.hash(new_password)
    db.commit()
    db.refresh(user)
    return user


def forgot_password_logic(db: Session, email: str) -> str:
    # In a real application you would send a reset email.  Here we just return a dummy token.
    user = get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found")
    # Generate a simple token (could be JWT or random string)
    return "reset-token-for-" + email


def reset_password_logic(db: Session, email: str, new_password: str) -> models.User:
    user = get_user_by_email(db, email)
    if not user:
        raise ValueError("User not found")
    user.password_hash = pwd_context.hash(new_password)
    db.commit()
    db.refresh(user)
    return user