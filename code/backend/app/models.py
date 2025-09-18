from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class Classmate(Base):
    __tablename__ = "classmates"
    id = Column(Integer, primary_key=True, index=True)
    registration_no = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    username = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    occupation = Column(String(100), nullable=False)
    description = Column(Text)
    quirk = Column(Text)
    priority = Column(Integer, nullable=False)
    is_admin = Column(Boolean, default=False)

class QueueEntry(Base):
    __tablename__ = "queue_entries"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("classmates.id"), nullable=False, unique=True)
    entered_at = Column(DateTime(timezone=True), server_default=func.now())
    student = relationship("Classmate", backref="queue_entry")

class Result(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("classmates.id"), nullable=False)
    accepted = Column(Boolean, nullable=False)
    position = Column(Integer, nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    student = relationship("Classmate", backref="results")

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    keyname = Column(String(100), unique=True, nullable=False)
    value = Column(String(255), nullable=False)
