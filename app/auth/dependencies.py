from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.auth import utils  
from app import models
from sqlalchemy.orm import Session
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    user = utils.get_user_from_token(token, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token or expired")
    return user