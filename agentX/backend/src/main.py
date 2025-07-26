from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
import re
import uvicorn
import schemas, database, models
from routes import users
import psycopg2


models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Allow Angular to send the cookie
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],   # <-- your Angular origin(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add cookie-based session support
app.add_middleware(
    SessionMiddleware,
    secret_key="CHANGE_ME_TO_A_RANDOM_32+_BYTE_STRING",
    #session_cookie="sid",        # optional (default: "session")
    same_site="lax",             # or "strict"/"none" (use "none" only over HTTPS)
    https_only=False,             # set True in production
    max_age=60 * 60 * 24 * 7,    # 7 days (optional)
)

app.include_router(users.router, prefix="/auth")

#         raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)