from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import models, schemas, auth, database, utils
from youtube_transcript_api import YouTubeTranscriptApi
import httpx
from dotenv import load_dotenv
import os

router = APIRouter()

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
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        #full_text = " ".join([entry["text"] for entry in transcript])
       #print(full_text)
        # Send the transcript to Dify workflow
        # async with httpx.AsyncClient(timeout=120.0) as client:
        #     payload = {
        #         "inputs": {"transcript": full_text},  # Pass transcript as input
        #         "response_mode": "blocking",          # Use 'blocking' instead of 'streaming' to get immediate response
        #         "user": "abc-123"
        #     }
        #     headers = {
        #         "Authorization": f"Bearer {DIFY_API_KEY}",
        #         "Content-Type": "application/json"
        #     }

        #     dify_response = await client.post(DIFY_WORKFLOW_URL, json=payload, headers=headers)

        # if dify_response.status_code != 200:
        #     raise HTTPException(
        #         status_code=dify_response.status_code,
        #         detail=f"Dify API error: {dify_response.text}"
        #     )
        sample_text = {
            "text" : """Here’s a **comprehensive, detailed markdown note** on **AI Agents**, suitable for study or documentation purposes:

---

# AI Agents: Detailed Notes

## 1. **Introduction to AI Agents**

An **AI Agent** is an autonomous or semi-autonomous system that **perceives its environment, reasons, and takes actions to achieve specific goals**.

* **Definition**:
  An AI agent is any entity that can **observe** (perceive information), **decide** (plan or reason), and **act** (execute actions) in a given environment to maximize the probability of achieving its goals.

* **Key Characteristics**:

  1. **Autonomy**: Operates without constant human supervision.
  2. **Reactivity**: Responds to changes in the environment.
  3. **Proactiveness**: Takes initiative to fulfill goals.
  4. **Social Ability**: Can interact with humans or other agents if needed.

* **Example**:

  * ChatGPT with tools (e.g., browsing, code execution) can be considered a **conversational AI agent**.
  * A **self-driving car** is an **autonomous AI agent**.

---

## 2. **Core Components of an AI Agent**

An AI agent typically consists of the following components:

| Component                       | Function                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------- |
| **Perception**                  | Collects data from the environment (sensors, APIs, user input).                 |
| **Knowledge Base / Memory**     | Stores information, past experiences, or world models.                          |
| **Reasoning / Decision Making** | Chooses actions using algorithms, logic, or machine learning.                   |
| **Action / Actuator**           | Executes the chosen actions in the environment (outputs, API calls, movements). |
| **Learning**                    | Improves over time using feedback (reinforcement learning, fine-tuning, RAG).   |

**Simplified Architecture**:

```
Environment <--> Sensors -> Perception -> Reasoning -> Action -> Actuators -> Environment
```

---

## 3. **Types of AI Agents**

AI Agents can be classified based on **capabilities**, **architecture**, or **level of intelligence**.

### 3.1 **Based on Capability**

1. **Simple Reflex Agents**

   * Action is **rule-based**: “If condition, then action”.
   * **No memory or learning**.
   * **Example**: A thermostat or spam filter.

2. **Model-Based Reflex Agents**

   * Maintain a **model of the world** to handle partially observable environments.
   * **Example**: Robotic vacuum (Roomba).

3. **Goal-Based Agents**

   * Use **goals** to decide actions, may explore multiple paths.
   * Require **search and planning algorithms**.
   * **Example**: Pathfinding robot.

4. **Utility-Based Agents**

   * Use **utility functions** to maximize performance and choose optimal actions.
   * **Example**: Financial trading bots that optimize profit vs. risk.

5. **Learning Agents**

   * Continuously improve by **learning from past experiences**.
   * Use **Reinforcement Learning or Machine Learning**.
   * **Example**: AlphaGo, self-driving cars.

---

### 3.2 **Based on Functionality**

1. **Reactive Agents**

   * React to environment changes immediately.
   * **Example**: Automatic emergency braking in cars.

2. **Deliberative Agents**

   * Build an **internal model**, plan actions carefully.
   * **Example**: Chess-playing AI.

3. **Hybrid Agents**

   * Combine reactive and deliberative strategies.
   * **Example**: Advanced robotics (Boston Dynamics robots).

---

### 3.3 **Based on Role in a System**

1. **Autonomous Agents**: Operate with minimal human input.
2. **Collaborative Agents**: Work with humans or other agents.
3. **Interface Agents**: Assist users by performing tasks on their behalf (e.g., Siri, Alexa).
4. **Mobile Agents**: Move across networks to perform tasks (used in distributed computing).

---

## 4. **AI Agent Architectures**

An **architecture** defines how the **components of an agent** are organized and how they interact.

### 4.1 **Reactive Architecture**

* Focuses on **direct mapping** of perceptions to actions.
* **Pros**: Fast response.
* **Cons**: Limited intelligence.
* **Example**: Obstacle-avoiding robot.

### 4.2 **Deliberative (Symbolic) Architecture**

* Maintains **internal models** and plans before acting.
* **Pros**: High reasoning capability.
* **Cons**: Slower response.
* **Example**: Automated planners, classical AI.

### 4.3 **Hybrid Architecture**

* Combines **reactive** and **deliberative** for flexibility.
* **Example**: Self-driving cars (instant obstacle avoidance + long-term route planning).

### 4.4 **Learning Agent Architecture**

* Has a **learning element** that improves decision-making with time.
* **Loop**: Perceive → Act → Learn → Improve policy.

---

## 5. **Key Technologies Behind AI Agents**

Modern AI agents combine multiple **AI disciplines**:

| Technology                            | Role in AI Agents                                          |
| ------------------------------------- | ---------------------------------------------------------- |
| **Machine Learning**                  | Helps agents learn from data and improve performance.      |
| **Deep Learning**                     | Enables complex perception tasks like vision and speech.   |
| **Reinforcement Learning**            | Core for decision-making in dynamic environments.          |
| **NLP (Natural Language Processing)** | Enables agents to understand and generate human language.  |
| **Knowledge Graphs & RAG**            | Help agents use structured knowledge and external data.    |
| **Computer Vision**                   | Enables perception from cameras/sensors.                   |
| **Planning & Search Algorithms**      | Used for goal-oriented action selection.                   |
| **Multi-Agent Systems**               | Facilitate communication and collaboration between agents. |

---

## 6. **Applications of AI Agents**

AI agents are used in **various domains**, including:

1. **Virtual Assistants**:

   * Siri, Alexa, Google Assistant.
2. **Autonomous Vehicles**:

   * Self-driving cars, drones.
3. **Industrial Automation**:

   * Predictive maintenance, smart manufacturing.
4. **Healthcare**:

   * Diagnostic assistants, patient monitoring bots.
5. **Finance**:

   * Stock trading bots, fraud detection agents.
6. **Gaming and Simulation**:

   * NPCs (Non-Playable Characters) with intelligent behavior.
7. **Customer Support**:

   * Chatbots with tool usage and knowledge retrieval (RAG agents).

---

## 7. **Challenges in Building AI Agents**

1. **Partial Observability**: Agents may not have full environmental knowledge.
2. **Real-Time Decision Making**: Balancing speed and intelligence.
3. **Scalability & Performance**: Efficient handling of large, complex tasks.
4. **Safety & Reliability**: Avoiding harmful actions or failures.
5. **Ethical Concerns**: Bias, privacy, accountability in decision-making.
6. **Explainability**: Understanding why an agent made a specific decision.

---

## 8. **Future of AI Agents**

* **Autonomous Multi-Agent Systems**: Swarm robotics, distributed problem-solving.
* **Cognitive Agents**: Closer to human reasoning and understanding.
* **Agentic AI in LLMs**:

  * LLMs (like GPT-4/5) are now used as **AI agents**:

    * Tool usage (e.g., web search, code execution).
    * Memory and planning capabilities.
    * Multi-step autonomous workflows.
* **Integration with IoT and Robotics** for real-world impact.

---

## 9. **Summary**

* **AI Agents** are autonomous entities capable of perception, reasoning, and action.
* Types range from **simple reflex** to **learning agents**.
* Core technologies include **ML, RL, NLP, Vision, and Planning**.
* They are revolutionizing industries from **healthcare to autonomous vehicles**.
* Future trends aim for **autonomous, collaborative, and explainable agents**.

---

If you want, I can also make a **visual flowchart of AI Agent architecture** in markdown with Mermaid to include in your notes.

Do you want me to add that?
"""
        }
        owner_id=request.session.get("users.id")
        print(f"owner_id: {owner_id}")
        convo = models.Conversation(url=data.url, response=sample_text["text"], owner_id=request.session.get("user_id"))
        db.add(convo)
        db.commit()
        db.refresh(convo)
        #response_data = dify_response.json()
        #text_output = response_data.get("data", {}).get("outputs", {}).get("text", "")
        return {"text": sample_text["text"]}

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