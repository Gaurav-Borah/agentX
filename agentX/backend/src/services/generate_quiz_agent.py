from langgraph.graph import StateGraph, END
import os
import re
import json
import requests
from typing import TypedDict, List, Dict
from dotenv import load_dotenv

load_dotenv()
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")

class AgentState(TypedDict):
    input_text: str
    questions: List[Dict]

def call_deepseek(prompt: str, model: str = "deepseek-chat") -> str:
    headers = {
        "Authorization": f"Bearer {deepseek_api_key}",
        "Content-Type": "application/json"
    }
    url = "https://api.deepseek.com/chat/completions"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    resp = requests.post(url, headers=headers, json=payload)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

def generate_questions_node(state: AgentState):
    """
    Step: Generate 5 questions with options and correct answers from input text.
    """
    text = state["input_text"]

    prompt = f"""
    From the following text, generate 5 multiple-choice questions with 4 options each 
    and specify the correct answer.

    Text: {text}

    Format your response strictly as JSON like this:
    {{
        "questions": [
            {{
                "question": "What is ...?",
                "options": ["A", "B", "C", "D"],
                "answer": "Correct option"
            }}
        ]
    }}
    """

    response = call_deepseek(prompt)

    # Try to extract JSON
    match = re.search(r"```json\s*(\{.*?\})\s*```", response, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        # fallback if LLM responds directly in JSON
        json_str = response.strip()

    try:
        data = json.loads(json_str)
        raw_questions = data.get("questions", [])
    except Exception as e:
        print("JSON parsing failed:", e)
        raw_questions = []

    # Convert into required structure
    questions = []
    for idx, q in enumerate(raw_questions, start=1):
        questions.append({
            "id": idx,
            "question": q["question"],
            "options": q["options"],
            "answer": q["answer"],
            "selected": "",
            "correct": False
        })

    state["questions"] = questions
    return state

def build_agent():
    workflow = StateGraph(AgentState)
    workflow.add_node("generate_questions", generate_questions_node)

    workflow.set_entry_point("generate_questions")
    workflow.add_edge("generate_questions", END)

    return workflow.compile()

