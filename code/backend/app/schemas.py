from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    id: int
    registration_no: str   # ⚠️ if your SQL table uses `registration_no`, update this too
    name: str
    username: str
    occupation: str
    description: Optional[str]
    quirk: Optional[str]
    priority: int
    is_admin: bool

    class Config:
        from_attributes = True   # ✅ Pydantic v2 fix


class LoginRequest(BaseModel):
    username: str
    password: str

class EnterQueueResponse(BaseModel):
    message: str

class ResultOut(BaseModel):
    student_id: int
    name: str
    position: int
    accepted: bool
    priority: int

class ProcessResponse(BaseModel):
    accepted: List[ResultOut]
    rejected: List[ResultOut]
