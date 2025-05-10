from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.auth import utils
from app import models
from app.schemas.user import UserCreate, UserResponse, UserLogin
from pydantic import BaseModel
from typing import List
from datetime import datetime
from uuid import uuid4
router = APIRouter()
from app.auth.dependencies import get_current_user
from app.models import User, ChatSession
from typing import Optional, List

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 🔹 Normalización
    email_normalized = user.email.strip().lower()
    name_normalized = user.full_name.strip()

    # 🔹 Verificación con email normalizado
    db_user = db.query(models.User).filter(models.User.email == email_normalized).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = utils.hash_password(user.password)

    # 🔹 Guardado con campos normalizados
    new_user = models.User(
        email=email_normalized,
        hashed_password=hashed_password,
        full_name=name_normalized
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating user")

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        is_active=new_user.is_active,
        created_at=new_user.created_at
    )

@router.post("/login")
async def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not utils.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = utils.create_access_token(data={"sub": db_user.email})
    refresh_token = utils.create_access_token(data={"sub": db_user.email}, expires_delta=timedelta(days=7))

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "email": db_user.email,
        "full_name": db_user.full_name
    }

class Attachment(BaseModel):
    name: str
    url: str
    type: Optional[str] = None

class ChatMessageOut(BaseModel):
    id: int
    session_id: str
    sender: str
    content: str
    timestamp: datetime
    attachments: Optional[List[Attachment]] = []
    
    class Config:
        orm_mode = True

class ChatSessionOut(BaseModel):
    session_id: str
    name: str
    last_active: datetime

    class Config:
        orm_mode = True

@router.get("/chat/sessions", response_model=List[ChatSessionOut])
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.last_active.desc())
        .all()
    )
    return sessions

@router.get("/chat/sessions/{session_id}/messages", response_model=List[ChatMessageOut])
def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.timestamp.asc())
        .all()
    )
    return messages

@router.post("/chat/sessions")
def create_session(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        new_session = ChatSession(
            session_id=str(uuid4()),  
            name=f"Chat {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}",
            user_id=user.id,
            last_active=datetime.utcnow(),
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        print(f"Session created with ID: {new_session.session_id}")
        return {
            "session_id": new_session.session_id,
            "name": new_session.name,
            "last_active": new_session.last_active,
        }
    except Exception as e:
        db.rollback()
        print("Error creating session:", str(e))
        raise HTTPException(status_code=500, detail="Error creating chat session")

class Attachment(BaseModel):
    name: str
    url: str
    type: Optional[str] = None

class MessageIn(BaseModel):
    session_id: str
    sender: str
    content: Optional[str] = ""
    attachments: Optional[List[Attachment]] = []

@router.post("/chat/messages")
def save_message(
    msg: MessageIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        print(f" Session used: {msg.session_id}")

        session = db.query(models.ChatSession).filter_by(session_id=msg.session_id, user_id=user.id).first()
        if not session:
            raise HTTPException(status_code=403, detail="Invalid session or access denied")

        message = models.ChatMessage(
            session_id=msg.session_id,
            sender=msg.sender,
            content=msg.content,
            timestamp=datetime.utcnow(),
            attachments=[att.dict() for att in msg.attachments] if msg.attachments else []
        )

        db.add(message)

        user_messages_count = (
            db.query(models.ChatMessage)
            .filter(
                models.ChatMessage.session_id == msg.session_id,
                models.ChatMessage.sender == "user"
            )
            .count()
        )

        if user_messages_count == 0 and msg.sender == "user":
            new_name = None
            if msg.attachments and len(msg.attachments) > 0:
                new_name = f"Análisis {msg.attachments[0].name}"
            elif msg.content and msg.content.strip():
                new_name = msg.content.strip()
                new_name = new_name[:30] + "..." if len(new_name) > 30 else new_name

            if new_name:
                db.query(models.ChatSession).filter_by(session_id=msg.session_id).update({"name": new_name})
                print(f" Session name updated to: {new_name}")

        db.commit()
        db.refresh(message)
        print(" Message saved:", message.id)

        return {"id": message.id}

    except Exception as e:
        db.rollback()
        print("Error saving message:", str(e))
        raise HTTPException(status_code=500, detail="Error saving message")

@router.delete("/chat/sessions/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = db.query(models.ChatSession).filter_by(session_id=session_id, user_id=user.id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        db.query(models.ChatMessage).filter_by(session_id=session_id).delete()
        db.delete(session)
        db.commit()
        return {"message": f"Session {session_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting session")

@router.put("/chat/sessions/{session_id}/name")
def update_session_name(
    session_id: str,
    new_name: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter_by(session_id=session_id, user_id=user.id).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.name = new_name[:30] + "..." if len(new_name) > 30 else new_name
    session.last_active = datetime.utcnow()
    db.commit()

    print(f" Session name manually updated: {session.name}")
    return {"message": "Session name updated"}