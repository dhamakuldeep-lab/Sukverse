"""
Auth Service
============

This module implements a complete authentication and user management microservice
for the Jabi platform.  It exposes endpoints for user registration, login,
profile updates, password changes, role management and administration.  The
service uses JWT for stateless authentication and SQLAlchemy with PostgreSQL for
persistence.  A default admin user can be created on startup via environment
variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
"""

import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ValidationError
from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, relationship, sessionmaker
from sqlalchemy import create_engine


# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://auth_user:auth_pass@auth_db:5432/auth_db")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-super-secret")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    users = relationship("User", back_populates="role_obj")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    role_obj = relationship("Role", back_populates="users")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "student"


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


def init_db():
    """Initialise tables and create default roles and admin user if specified."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create default roles
        for role_name in ["admin", "trainer", "student"]:
            if not db.query(Role).filter_by(name=role_name).first():
                db.add(Role(name=role_name, description=f"{role_name.title()} role"))
        db.commit()
        # Create admin user if credentials provided
        if ADMIN_EMAIL and ADMIN_PASSWORD:
            if not db.query(User).filter_by(email=ADMIN_EMAIL).first():
                admin_role = db.query(Role).filter_by(name="admin").first()
                admin = User(
                    email=ADMIN_EMAIL,
                    hashed_password=get_password_hash(ADMIN_PASSWORD),
                    role_id=admin_role.id,
                )
                db.add(admin)
                db.commit()
    finally:
        db.close()


app = FastAPI(title="Auth Service", description="Handles user registration, authentication and admin management.")


@app.on_event("startup")
def on_startup():
    init_db()


@app.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Ensure role exists
    role = db.query(Role).filter_by(name=user_in.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")
    # Check for duplicate email
    if db.query(User).filter_by(email=user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role_id=role.id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserOut(id=new_user.id, email=new_user.email, role=role.name, is_active=new_user.is_active)


@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user.email})
    user.last_login = datetime.utcnow()
    db.commit()
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserOut(id=current_user.id, email=current_user.email, role=current_user.role_obj.name, is_active=current_user.is_active)


@app.put("/me", response_model=UserOut)
def update_profile(update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if update.email:
        # Ensure new email isn't taken
        if db.query(User).filter(User.email == update.email, User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = update.email
    if update.password:
        current_user.hashed_password = get_password_hash(update.password)
    db.commit()
    db.refresh(current_user)
    return UserOut(id=current_user.id, email=current_user.email, role=current_user.role_obj.name, is_active=current_user.is_active)


@app.put("/change-password")
def change_password(old_password: str, new_password: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"detail": "Password updated"}


@app.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Only admin can list users
    if current_user.role_obj.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")
    users = db.query(User).all()
    return [UserOut(id=u.id, email=u.email, role=u.role_obj.name, is_active=u.is_active) for u in users]


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role_obj.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(id=user.id, email=user.email, role=user.role_obj.name, is_active=user.is_active)


@app.put("/users/{user_id}", response_model=UserOut)
def admin_update_user(user_id: int, update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role_obj.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if update.email and db.query(User).filter(User.email == update.email, User.id != user_id).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    if update.email:
        user.email = update.email
    if update.password:
        user.hashed_password = get_password_hash(update.password)
    if update.role:
        role = db.query(Role).filter_by(name=update.role).first()
        if not role:
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role_id = role.id
    if update.is_active is not None:
        user.is_active = update.is_active
    db.commit()
    db.refresh(user)
    return UserOut(id=user.id, email=user.email, role=user.role_obj.name, is_active=user.is_active)


@app.delete("/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role_obj.name != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}


@app.post("/forgot-password")
def forgot_password(email: EmailStr, db: Session = Depends(get_db)):
    # In a real implementation, send an email with a secure token.  Here we return a dummy token.
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    dummy_token = create_access_token({"sub": email}, expires_delta=timedelta(minutes=5))
    return {"detail": "Password reset link sent", "token": dummy_token}


@app.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    # In production, token should be validated against a password reset table.  Here we simply decode it.
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    return {"detail": "Password reset successful"}