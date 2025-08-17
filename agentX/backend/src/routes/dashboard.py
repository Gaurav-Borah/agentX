from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, schemas, auth, database, utils
from youtube_transcript_api import YouTubeTranscriptApi
import json
from services import notes_agent, summary_agent, generate_quiz_agent

router = APIRouter()
transcript = None

notes_agent = notes_agent.build_agent()
summary_agent = summary_agent.build_agent()
quiz_agent = generate_quiz_agent.build_agent()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 1. TRANSCRIPT + SUMMARY
# 1. GET TRANSCRIPT + SUMMARY
@router.post("/get_transcript")
async def get_transcript(data: schemas.URLRequest, request: Request, db: Session = Depends(get_db)):
    owner_id = request.session.get("user_id")
    if not owner_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check if transcript & summary already exist in DB
    convo = db.query(models.Conversation).filter(
        models.Conversation.url == data.url,
        models.Conversation.owner_id == owner_id
    ).first()

    if convo and convo.transcript and convo.summary:
        return {
            "summary": convo.summary,
            "url": data.url,
            "transcript": convo.transcript
        }

    # If not in DB, fetch transcript from YouTube
    video_id = utils.extract_video_id(data.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        global transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([entry["text"] for entry in transcript])

        summary = summary_agent.invoke({"input_text": full_text})
        print(f"Summary: {summary}")

        # Save to DB (create or update)
        if convo:
            convo.transcript = full_text
            convo.summary = summary["summary"]
        else:
            convo = models.Conversation(
                url=data.url,
                transcript=full_text,
                summary=summary["summary"],
                owner_id=owner_id
            )
            db.add(convo)

        db.commit()
        db.refresh(convo)

        return {"summary": summary["summary"], "url": data.url, "transcript": full_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. GENERATE DETAILED NOTES
@router.post("/generate_detailed_notes")
async def generate_detailed_notes(data: schemas.URLRequest, request: Request, db: Session = Depends(get_db)):
    owner_id = request.session.get("user_id")
    if not owner_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check if detailed notes already exist
    convo = db.query(models.Conversation).filter(
        models.Conversation.url == data.url,
        models.Conversation.owner_id == owner_id
    ).first()

    if convo and convo.detailed_note:
        return {"detailed_notes": convo.detailed_note}

    # If not, generate detailed notes
    if not convo or not convo.transcript:
        raise HTTPException(status_code=400, detail="Transcript not found")

    full_text = convo.transcript

    try:
        detailed_notes = notes_agent.invoke({"input_text": full_text})
        final_notes = detailed_notes["final_notes"]
        print(f"Detailed Notes: {final_notes}")

        # Update convo with detailed notes
        convo.detailed_note = final_notes
        db.commit()
        db.refresh(convo)

        return {"detailed_notes": final_notes}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# 3. QUIZ QUESTIONS
@router.post("/generate_quiz")
async def generate_quiz(data: schemas.transcript, request: Request, db: Session = Depends(get_db)):
    try:
        result = quiz_agent.invoke({"input_text": data.transcript})
        questions = result.get("questions", [])

        print(f"Generated Quiz Questions: {questions}")

        owner_id = request.session.get("user_id")
        if not owner_id:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Update conversation (add quiz questions)
        # convo = db.query(models.Conversation).filter(
        #     models.Conversation.url == data.url,
        #     models.Conversation.owner_id == owner_id
        # ).first()

        # if convo:
        #     convo.questions = json.dumps(questions)  # store as JSON string
        # else:
        #     convo = models.Conversation(
        #         url=data.url,
        #         transcript=data.transcript,
        #         questions=json.dumps(questions),
        #         owner_id=owner_id
        #     )
        #     db.add(convo)

        # db.commit()
        # db.refresh(convo)

        return {"questions": questions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. GET USER CONVERSATIONS
@router.get("/conversations")
async def get_user_conversations(request: Request, db: Session = Depends(get_db)):
    """Get all conversations for the current user"""
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    conversations = db.query(models.Conversation)\
        .filter(models.Conversation.owner_id == user_id)\
        .order_by(models.Conversation.timestamp.desc())\
        .all()

    history_items = []
    for convo in conversations:
        history_items.append({
            "id": convo.id,
            "url": convo.url,
            "transcript": convo.transcript,
            "summary": convo.summary,
            "detailed_note": convo.detailed_note,
            "questions": json.loads(convo.questions) if convo.questions else None,
            "date": convo.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        })

    return {"conversations": history_items}
