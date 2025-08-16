from langgraph.graph import StateGraph, END
import os
import re
import json
import requests
from typing import Optional, List, TypedDict
from langchain.schema import Document
from dotenv import load_dotenv

load_dotenv()
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")

class AgentState(TypedDict):
    input_text: str
    summary: str

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

def summarize_node(state: AgentState):
    """
    Step 1: Summarize long text.
    
    Args:
        state (dict): Dictionary containing:
            - "text" (str): The input long text.

    Returns:
        dict: Contains:
            - "summary" (str): Concise summary of all topics discussed.
    """
    text = state["input_text"]
    print(f"Summarizing text: {text[:100]}...") 
    prompt = f"""
    Summarize the following text covering all topics discussed and return a structured markdown output.

    Text: {text}

    Return JSON:
    {{
        "summary": "<summary>",
    }}
    """
    response = call_deepseek(prompt)
    match = re.search(r"```json\s*(\{.*?\})\s*```", response, re.DOTALL)
    if match:
        json_str = match.group(1)
        
        # 2. Parse JSON
        data = json.loads(json_str)
        
        # 3. Access summary and queries
        summary = data["summary"]

        print("Summary:", summary)
        state["summary"] = summary
    else:
        print("No JSON found")
    
    return state

def build_agent():
    """
    Builds and returns the LangGraph workflow for the AI agent.
    """
    workflow = StateGraph(AgentState)
    workflow.add_node("summary", summarize_node)

    workflow.set_entry_point("summary")
    workflow.add_edge("summary", END)

    return workflow.compile()