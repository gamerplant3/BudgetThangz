import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import cohere
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="BudgetThangz Agentic Backend")

api_key = os.getenv("COHERE_API_KEY")
if not api_key:
    raise RuntimeError("COHERE_API_KEY is not set.")

co = cohere.ClientV2(api_key=api_key)

# ---- Request Schema ----
class BudgetContextItem(BaseModel):
    id: int
    label: str
    amount: float
    type: str
    frequency: str
    date: Optional[str] = ""

class UserMessageWithContext(BaseModel):
    message: str
    current_budget_items: List[BudgetContextItem] # Pass existing list to the model for richer context

# ---- Cohere Native V2 Tool Specifications ----
BUDGET_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "stage_budget_item",
            "description": "Call this to add a new planned, recurring income or expense item to the budget baseline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "label": {"type": "string", "description": "The name/description of the entry"},
                    "amount": {"type": "number"},
                    "type": {"type": "string", "enum": ["income", "expense"]},
                    "frequency": {"type": "string",
                                  "enum": ["weekly", "biweekly", "monthly", "quarterly", "annual", "once"]},
                    "date": {"type": "string",
                             "description": "YYYY-MM-DD format. Required only if frequency is 'once'."}
                },
                "required": ["label", "amount", "type", "frequency"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "stage_ongoing_spend",
            "description": "Call this to record a one-off transaction or purchase that just occurred.",
            "parameters": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "amount": {"type": "number"},
                    "type": {"type": "string", "enum": ["expense", "income"], "default": "expense"},
                    "date": {"type": "string"}
                },
                "required": ["label", "amount", "type", "date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_budget_item",
            "description": "Call this when the user explicitly requests to remove, delete, or cancel an existing item from their baseline budget.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer",
                           "description": "The exact internal unique ID number of the budget item to be deleted."}
                },
                "required": ["id"]
            }
        }
    }
]


@app.post("/api/agent/chat")
async def process_agent_intent(payload: UserMessageWithContext):
    try:
        current_date_context = "2026-05-29"

        # Build a readable representation of what is currently stored in the app's budget
        items_summary = "\n".join([
            f"- ID: {item.id} | Label: {item.label} | Amount: ${item.amount} | Freq: {item.frequency}"
            for item in payload.current_budget_items
        ]) if payload.current_budget_items else "No budget items currently exist."

        system_prompt = (
            f"You are the AI brain running inside the 'BudgetThangz' finance app.\n"
            f"Current date context: {current_date_context}.\n\n"
            f"Here are the items currently in the user's budget:\n{items_summary}\n\n"
            "If the user wants to delete, cancel, or remove an item, cross-reference its label with the list above, "
            "find the exact ID number, and pass that ID to the 'delete_budget_item' tool function."
        )

        response = co.chat(
            model="command-r-plus-08-2024",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload.message}
            ],
            tools=BUDGET_TOOLS
        )

        actions = []
        if response.message.tool_calls:
            for call in response.message.tool_calls:
                actions.append({
                    "target_action": call.function.name,
                    "payload": call.function.arguments
                })
            return {
                "type": "action_execution_plan",
                "actions": actions,
                "agent_reply": "Understood! I have processed those updates for you."
            }

        agent_text = response.message.content[
            0].text if response.message.content else "How can I help with your budget?"
        return {"type": "conversational", "actions": [], "agent_reply": agent_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)