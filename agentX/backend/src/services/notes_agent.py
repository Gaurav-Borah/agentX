from langgraph.graph import StateGraph, END
import os
import re
import json
import requests
from typing import Optional, List, TypedDict
from langchain.schema import Document
from langchain_tavily import TavilySearch
from dotenv import load_dotenv

load_dotenv()
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

# Step 1: State Definition
class AgentState(TypedDict):
    input_text: str
    summary: str
    queries: List[str]
    web_data: str
    final_notes: str

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

# Step 2: Nodes
def summarize_node(state: AgentState):
    """
    Step 1: Summarize long text and generate 5 search queries.
    
    Args:
        state (dict): Dictionary containing:
            - "text" (str): The input long text.

    Returns:
        dict: Contains:
            - "summary" (str): Concise summary of all topics discussed.
            - "queries" (list[str]): 5 search queries based on the summary.
    """
    text = state["input_text"]
    print(f"Summarizing text: {text[:100]}...") 
    prompt = f"""
    Summarize the following text into a concise paragraph covering all topics discussed.
    Also provide 5 search queries that could help gather more details on the topics.

    Text: {text}

    Return JSON:
    {{
        "summary": "<summary>",
        "queries": ["<q1>", "<q2>", "<q3>", "<q4>", "<q5>"]
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
        queries = data["queries"]

        print("Summary:", summary)
        print("Queries:", queries)
        state["summary"] = summary
        state["queries"] = queries
    else:
        print("No JSON found")
    
    return state

def search_node(state: AgentState):
    """
    Step 2: Perform web search for each query and extract relevant text from results.

    Args:
        state (dict): Dictionary containing:
            - "queries" (list[str]): Search queries.

    Returns:
        dict: Contains:
            - "web_data" (str): Combined extracted text from search results.
      """
    tool = TavilySearch(
        max_results=5,
        topic="general",
        # include_answer=False,
        # include_raw_content=False,
        # include_images=False,
        # include_image_descriptions=False,
        # search_depth="basic",
        # time_range="day",
        # start_date=None,
        # end_date=None,
        # include_domains=None,
        # exclude_domains=None
    )
    queries = state["queries"]
    results = []

    for q in queries:
        res = tool.invoke({"query": q})
        #print(f"Tavily search results for '{q}': {res}")
        results.extend([item["content"] for item in res["results"]])

    print(f"Search results: {results}")
    state["web_data"] = "\n".join(results)
    return state

# def extract_node(state: AgentState): 
#     results = state["search_results"]
#     summary = state["summary_and_queries"]

#     prompt = f"""
#     You are given:
#     Summary: {state["summary"]}
#     Search Results: {state["web_data"]}

#     Extract only relevant facts, stats, and points from search results
#     that expand or clarify the summary topics.
#     Return in bullet points.
#     """
#     response = call_deepseek(prompt)
#     return {"extracted_data": response}

def detailed_notes_node(state: AgentState):
    """
    Combines the summary and web data to generate detailed notes using DeepSeek.

    Args:
        state (AgentState): Workflow state with 'summary' and 'web_data'.

    Returns:
        AgentState: Updated state with 'final_notes'.
    """
    prompt = f"""
    Create a detailed set of notes combining:
    - Summary: {state["summary"]}
    - Relevant web data: {state["web_data"]}

    Structure notes with headings, subheadings, and bullet points.
    """
    resp = call_deepseek(prompt)
    state["final_notes"] = resp
    print(f"Detailed notes: {resp}")
    return state

# ------------------------------
# Build LangGraph Workflow
# ------------------------------
def build_agent():
    """
    Builds and returns the LangGraph workflow for the AI agent.
    """
    workflow = StateGraph(AgentState)
    workflow.add_node("summarize_and_generate_queries", summarize_node)
    workflow.add_node("search_web", search_node)
    workflow.add_node("generate_detailed_notes", detailed_notes_node)

    workflow.set_entry_point("summarize_and_generate_queries")
    workflow.add_edge("summarize_and_generate_queries", "search_web")
    workflow.add_edge("search_web", "generate_detailed_notes")
    workflow.add_edge("generate_detailed_notes", END)

    return workflow.compile()