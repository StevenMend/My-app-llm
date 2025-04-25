from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from sqlalchemy import Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String)
    full_name = Column(String)
    google_id = Column(String, unique=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    last_active = Column(TIMESTAMP, default=datetime.utcnow)

    user = relationship("User", backref="chat_sessions")
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.session_id"))
    sender = Column(String) 
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


class SessionDocument(Base):
    __tablename__ = "session_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), nullable=False)
    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)