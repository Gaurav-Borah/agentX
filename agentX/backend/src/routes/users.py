from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, schemas, auth, database, utils
from youtube_transcript_api import YouTubeTranscriptApi
import httpx
from dotenv import load_dotenv
import os

router = APIRouter()

load_dotenv()
DIFY_API_KEY = os.getenv("DIFY_API_KEY")
DIFY_WORKFLOW_URL = "https://api.dify.ai/v1/workflows/run"

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        (models.User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_pw = auth.hash_password(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Optional: return JWT token instead of user info
    # token = auth.create_access_token({"sub": new_user.username})
    # return {"access_token": token, "token_type": "bearer"}

    return new_user

@router.post("/login", response_model=schemas.Message)
def login(payload: schemas.LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Persist user identity in the cookie-backed session
    request.session["user_id"] = user.id
    return {"message": "Login successful"}

@router.get("/me", response_model=schemas.UserOut)
def me(request: Request, db: Session = Depends(get_db)):
    uid = request.session.get("user_id")
    if not uid:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.get(models.User, uid)
    if not user:
        # stale session – user deleted
        request.session.clear()
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@router.post("/logout", response_model=schemas.Message)
def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out"}
