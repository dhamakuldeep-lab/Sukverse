from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..database import Base

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    user_id = Column(Integer, primary_key=True)
    bio = Column(String)
    contact_number = Column(String)
    department = Column(String)
    created_by = Column(Integer)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

class BulkUploadLog(Base):
    __tablename__ = 'bulk_upload_logs'
    upload_id = Column(Integer, primary_key=True)
    filename = Column(String)
    uploader_user_id = Column(Integer)
    status = Column(String)
    timestamp = Column(DateTime(timezone=False), server_default=func.now())

class UserRoleAssignment(Base):
    __tablename__ = 'user_role_assignments'
    user_id = Column(Integer, primary_key=True)
    role_id = Column(Integer)
    assigned_by = Column(Integer)
    assigned_at = Column(DateTime(timezone=False), server_default=func.now())
