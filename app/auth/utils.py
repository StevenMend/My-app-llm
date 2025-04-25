
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db
from app.models import User



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "SECRET_KEY"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30



def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(" JWT created:", token)
    return token

def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_timestamp = payload.get("exp")

        if exp_timestamp is None:
            print("Non-expiring token")
            return None

        now = datetime.now(timezone.utc).timestamp()
        if now > exp_timestamp:
            print("Token expired:", now, ">", exp_timestamp)
            return None

        
        return payload

    except JWTError as e:
        print("Error decoding JWT:", str(e))
        return None

def get_user_from_token(token: str, db: Session) -> Optional[User]:
    payload = verify_access_token(token)
    if payload:
        email = payload.get("sub")
        
        user = db.query(User).filter(User.email == email).first()
        if user:
            print("Authenticated user:", user.email)
            return user
        else:
            print("User not found")
    else:
        print("Invalid or expired payload")
    return None



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user = get_user_from_token(token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user










