# # deps.py
# from fastapi import Depends, HTTPException, Request
# from sqlalchemy.orm import Session
# import models, database

# def get_db():
#     db = database.SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# def current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
#     uid = request.session.get("user_id")
#     if not uid:
#         raise HTTPException(status_code=401, detail="Not authenticated")
#     user = db.get(models.User, uid)
#     if not user:
#         request.session.clear()
#         raise HTTPException(status_code=401, detail="Not authenticated")
#     return user
