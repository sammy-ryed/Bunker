from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import database, models, schemas, auth, crud
from .deps import get_db, get_current_user, get_current_admin
from datetime import timedelta
from .config import FRONTEND_URL, ACCESS_TOKEN_EXPIRE_MINUTES

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Apocalypse Bunker Queue API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
@app.post("/auth/login", response_model=schemas.Token)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, data.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not auth.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = auth.create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer", "is_admin": bool(user.is_admin)}

# Student: get their profile
@app.get("/students/me", response_model=schemas.UserBase)
def read_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "registration_no": current_user.registration_no,  # <- changed
        "name": current_user.name,
        "username": current_user.username,
        "occupation": current_user.occupation,
        "description": current_user.description,
        "quirk": current_user.quirk,
        "priority": current_user.priority,
        "is_admin": current_user.is_admin,
    }


# Student: enter the queue
@app.post("/queue/enter", response_model=schemas.EnterQueueResponse)
def enter_queue(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins cannot enter the student queue")
    entry = crud.create_queue_entry(db, current_user)
    return {"message": "You have been added to the queue (only one entry allowed)."}

# Student: check result/status
@app.get("/queue/status")
def queue_status(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    latest = crud.get_latest_result_for_student(db, current_user.id)
    if not latest:
        return {"status": "pending", "message": "Queue not processed yet for your entry."}
    if latest.accepted:
        return {"status": "accepted", "message": "✅ Congrats, you got in!", "position": latest.position}
    else:
        return {"status": "rejected", "message": "❌ Bye! Enjoy eating brains!", "position": latest.position}

# Admin: set bunker capacity
@app.post("/admin/set_capacity")
def admin_set_capacity(payload: dict, db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    capacity = int(payload.get("capacity", 0))
    crud.set_bunker_capacity(db, capacity)
    return {"message": f"Capacity set to {capacity}"}

# Admin: process queue now
@app.post("/admin/process", response_model=schemas.ProcessResponse)
def admin_process(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    capacity = crud.get_bunker_capacity(db)
    processed = crud.process_queue(db, capacity)
    return processed

# Admin: view last results (all results)
@app.get("/admin/results")
def admin_results(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    results = crud.get_all_results(db)
    out = []
    for r in results:
        out.append({
            "student_id": r.student_id,
            "name": r.student.name,
            "position": r.position,
            "accepted": bool(r.accepted)
        })
    return out
