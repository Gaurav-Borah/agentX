from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, schemas, auth, database, utils
from youtube_transcript_api import YouTubeTranscriptApi
import httpx
from services import notes_agent, summary_agent, generate_quiz_agent
from dotenv import load_dotenv
import os

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

@router.post("/get_transcript")
async def get_transcript(data: schemas.URLRequest, request: Request, db: Session = Depends(get_db)):
    print(data.url)
    video_id = utils.extract_video_id(data.url)

    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        global transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([entry["text"] for entry in transcript])
        #summary = agent.summarize_node({"input_text": full_text})
        #print(f"Summary: {summary}")
        #detailed_notes = agent.invoke({"input_text": full_text}) 
        summary = summary_agent.invoke({"input_text": full_text})
        print(f"Sumamry: {summary}")

        owner_id=request.session.get("users.id")
        print(f"owner_id: {owner_id}")
        convo = models.Conversation(url=data.url, response=summary["summary"], owner_id=request.session.get("user_id"))
        db.add(convo)
        db.commit()
        db.refresh(convo)
        #response_data = dify_response.json()
        #text_output = response_data.get("data", {}).get("outputs", {}).get("text", "")
        #return {"detailed_notes": detailed_notes["final_notes"], "summary": detailed_notes["summary"], "url": data.url, "transcript": transcript}
        print(type(transcript))
        return {"summary": summary["summary"], "url": data.url, "transcript": full_text}

    except Exception as e:
        
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate_detailed_notes")
async def generate_detailed_notes(data: schemas.URLRequest, request: Request, db: Session = Depends(get_db)):
   global transcript
   full_text = " ".join([entry["text"] for entry in transcript])
   try:
      detailed_notes = notes_agent.invoke({"input_text": full_text})
      final_notes = detailed_notes["final_notes"]
      print(f"Detailed Notes: {final_notes}")
      
      # Save the conversation with detailed notes
      # owner_id = request.session.get("user_id")
      # convo = models.Conversation(url=data.url, response=detailed_notes["final_notes"], owner_id=owner_id)
      # db.add(convo)
      # db.commit()
      # db.refresh(convo)

      return {"detailed_notes": detailed_notes["final_notes"]}
   except Exception as e:
      raise HTTPException(status_code=500, detail=str(e))   
    

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
    
    # Transform the data for simple URL + transcript display
    history_items = []
    for convo in conversations:
        # Format the date
        date = convo.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        
        history_items.append({
            "id": convo.id,
            "url": convo.url,
            "transcript": convo.response,
            "date": date
        })
    
    return {"conversations": history_items}

@router.post("/generate_quiz")
async def generate_quiz(data: schemas.transcript, db: Session = Depends(get_db)):
    try:

        # Run quiz agent
        result = quiz_agent.invoke({"input_text": data.transcript})
        questions = result.get("questions", [])

        # Debug log
        print(f"Generated Quiz Questions: {questions}")

        # Optionally save quiz to DB
        # owner_id = request.session.get("user_id")
        # convo = models.Conversation(
        #     url=data.url,
        #     response=json.dumps(questions),
        #     owner_id=owner_id
        # )
        # db.add(convo)
        # db.commit()
        # db.refresh(convo)

        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))