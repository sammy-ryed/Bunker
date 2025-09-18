from sqlalchemy.orm import Session
from . import models, schemas
from typing import List
from sqlalchemy import asc
from datetime import datetime

def get_user_by_username(db: Session, username: str):
    return db.query(models.Classmate).filter(models.Classmate.username == username).first()

def create_queue_entry(db: Session, student: models.Classmate):
    # ensure not already queued
    existing = db.query(models.QueueEntry).filter(models.QueueEntry.student_id == student.id).first()
    if existing:
        return existing
    entry = models.QueueEntry(student_id=student.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_queue_entries(db: Session):
    # return queue entries joined with student
    return db.query(models.QueueEntry).join(models.Classmate).all()

def get_bunker_capacity(db: Session):
    s = db.query(models.Setting).filter(models.Setting.keyname == "bunker_capacity").first()
    if s:
        try:
            return int(s.value)
        except:
            return 0
    return 0

def set_bunker_capacity(db: Session, capacity: int):
    s = db.query(models.Setting).filter(models.Setting.keyname == "bunker_capacity").first()
    if s:
        s.value = str(capacity)
    else:
        s = models.Setting(keyname="bunker_capacity", value=str(capacity))
        db.add(s)
    db.commit()
    return capacity

def process_queue(db: Session, capacity: int):
    # Fetch current queue and sort by priority (lower = higher) then entered_at
    q = db.query(models.QueueEntry).join(models.Classmate).order_by(asc(models.Classmate.priority), asc(models.QueueEntry.entered_at)).all()
    results = []
    position = 0
    for entry in q:
        position += 1
        accepted = position <= capacity
        res = models.Result(student_id=entry.student_id, accepted=accepted, position=position)
        db.add(res)
        results.append((entry.student, res))  # tuple (Classmate, Result mock)
    # delete queue entries (snapshot processed)
    for entry in q:
        db.delete(entry)
    db.commit()
    # return lists
    accepted_list = []
    rejected_list = []
    for student, result in results:
        item = {"student_id": student.id, "name": student.name, "position": result.position, "accepted": result.accepted, "priority": student.priority}
        if result.accepted:
            accepted_list.append(item)
        else:
            rejected_list.append(item)
    return {"accepted": accepted_list, "rejected": rejected_list}

def get_latest_result_for_student(db: Session, student_id: int):
    return db.query(models.Result).filter(models.Result.student_id == student_id).order_by(models.Result.processed_at.desc()).first()

def get_all_results(db: Session):
    # return latest results for all students from last processing by position
    return db.query(models.Result).join(models.Classmate).order_by(models.Result.position).all()
