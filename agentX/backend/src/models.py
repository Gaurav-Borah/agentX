from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=False, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String)

    # new fields
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    detailed_note = Column(Text, nullable=True)
    questions = Column(JSON, nullable=True)  # ✅ JSON field (PostgreSQL only)

    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)