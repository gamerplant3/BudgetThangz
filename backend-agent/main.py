import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import cohere
from dotenv import load_dotenv
from datetime import datetime

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

class SpendingContextItem(BaseModel):
    id: int
    label: str
    amount: float
    type: str
    date: str

class UserMessageWithContext(BaseModel):
    message: str
    current_budget_items: List[BudgetContextItem]
    current_ongoing_spending: List[SpendingContextItem]  # Passed for modification tracking

# ---- Cohere Native V2 Tool Specifications ----
BUDGET_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "stage_budget_item",
            "description": "Add a new planned, recurring income or expense item to the budget baseline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "amount": {"type": "number"},
                    "type": {"type": "string", "enum": ["income", "expense"]},
                    "frequency": {"type": "string",
                                  "enum": ["weekly", "biweekly", "monthly", "quarterly", "annual", "once"]},
                    "date": {"type": "string"}
                },
                "required": ["label", "amount", "type", "frequency"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "stage_ongoing_spend",
            "description": "Record a completely new, individual transaction or purchase that just happened.",
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
            "description": "Remove or cancel an existing item from the baseline budget.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"}
                },
                "required": ["id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "modify_ongoing_spend",
            "description": "Call this when the user wants to correct, modify, adjust, or change a recent transaction they just logged (e.g., 'oops, change that to $15.50').",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer",
                           "description": "The unique internal ID of the matching transaction to modify."},
                    "label": {"type": "string",
                              "description": "The updated label, or the original label if unchanged."},
                    "amount": {"type": "number", "description": "The corrected numerical dollar amount."}
                },
                "required": ["id", "amount"]
            }
        }
    }
]


@app.post("/api/agent/chat")
async def process_agent_intent(payload: UserMessageWithContext):
    try:
        current_date_context = datetime.now().strftime("%Y-%m-%d")

        # Format active lists as readable maps for Cohere's context window
        budget_summary = "\n".join([f"- ID: {i.id} | {i.label} | ${i.amount}" for i in payload.current_budget_items])
        spending_summary = "\n".join(
            [f"- ID: {s.id} | {s.label} | ${s.amount} | Date: {s.date}" for s in payload.current_ongoing_spending])

        system_prompt = (
            f"You are the AI brain inside the 'BudgetThangz' finance app.\n"
            f"Current date: {current_date_context}.\n\n"
            f"ACTIVE RECENT TRANSACTIONS:\n{spending_summary or 'None logged.'}\n\n"
            f"BASELINE BUDGET ITEMS:\n{budget_summary or 'None setup.'}\n\n"
            "If the user says 'oops', 'change that', or wants to correct an entry, look at the active transactions list, "
            "find the item that matches the context (usually the most recent matching entry), extract its ID, and trigger 'modify_ongoing_spend'."
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
            0].text if response.message.content else "How can I help you adjust your records?"
        return {"type": "conversational", "actions": [], "agent_reply": agent_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)