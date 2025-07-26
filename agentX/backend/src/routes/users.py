from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, schemas, auth, database, utils
from youtube_transcript_api import YouTubeTranscriptApi
import httpx

router = APIRouter()

DIFY_API_KEY = "app-RJo6Hfq8ITP29pYqnpyhACim"
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

@router.post("/get_transcript")
async def get_transcript(data: schemas.URLRequest):
    print(data.url)
    video_id = utils.extract_video_id(data.url)

    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([entry["text"] for entry in transcript])

        # Send the transcript to Dify workflow
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "inputs": {"transcript": full_text},  # Pass transcript as input
                "response_mode": "blocking",          # Use 'blocking' instead of 'streaming' to get immediate response
                "user": "abc-123"
            }
            headers = {
                "Authorization": f"Bearer {DIFY_API_KEY}",
                "Content-Type": "application/json"
            }

            dify_response = await client.post(DIFY_WORKFLOW_URL, json=payload, headers=headers)

        if dify_response.status_code != 200:
            raise HTTPException(
                status_code=dify_response.status_code,
                detail=f"Dify API error: {dify_response.text}"
            )

        response_data = dify_response.json()
        text_output = response_data.get("data", {}).get("outputs", {}).get("text", "")
        return {"text": text_output}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# async def get_transcript(data: schemas.URLRequest):
#     print(data.url)
#     video_id = utils.extract_video_id(data.url)
    
#     if not video_id:
#         raise HTTPException(status_code=400, detail="Invalid YouTube URL")

#     try:
#         transcript = YouTubeTranscriptApi.get_transcript(video_id)
#         full_text = " ".join([entry["text"] for entry in transcript])
#         response = {"transcript": full_text}
#         print()
#         return response
#     except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))