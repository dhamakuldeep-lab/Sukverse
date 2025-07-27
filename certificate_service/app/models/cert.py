from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class Certificate(Base):
    __tablename__ = 'certificates'
    certificate_id = Column(Integer, primary_key=True)
    workshop_id = Column(Integer)
    name = Column(String)
    criteria = Column(String)

class CertificateTemplate(Base):
    __tablename__ = 'certificate_templates'
    template_id = Column(Integer, primary_key=True)
    format_json = Column(String)
    preview_path = Column(String)

class IssuedCertificate(Base):
    __tablename__ = 'issued_certificates'
    certificate_id = Column(Integer, ForeignKey('certificates.certificate_id'), primary_key=True)
    user_id = Column(Integer, primary_key=True)
    issued_at = Column(DateTime(timezone=False), server_default=func.now())
    file_url = Column(String)
