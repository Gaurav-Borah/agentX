from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, func
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
    response = Column(Text)     
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)