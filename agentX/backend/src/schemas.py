# schemas.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    class Config:
        orm_mode = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Message(BaseModel):
    message: str

class URLRequest(BaseModel):
    url: str

class SessionRequest(BaseModel):
    amount:  float

class transcript(BaseModel):
    transcript: str