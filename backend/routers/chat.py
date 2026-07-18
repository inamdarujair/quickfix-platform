import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import os

from database import db
from auth_utils import require_roles

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are the QuickFix Assistant, a friendly helper embedded in the QuickFix local service "
    "booking platform. You help customers figure out what kind of local service professional "
    "they need (plumbing, electrical, cleaning, painting, carpentry, ac_repair, "
    "appliance_repair, pest_control, gardening, moving) and how to book them. "
    "Ask clarifying questions if needed (what's the problem, their city, urgency, budget). "
    "Once you know the right category, tell them clearly which category to pick and suggest "
    "they visit the Browse Services page and filter by that category and their city. "
    "Keep answers concise and conversational. You cannot see live listings or prices, so never "
    "invent specific provider names, exact prices or availability — point them to Browse Services for that."
)


class ChatMessageRequest(BaseModel):
    message: str


def get_session_id(user_id: str) -> str:
    return f"quickfix-{user_id}"


@router.get("/history")
async def get_history(user: dict = Depends(require_roles("customer"))):
    messages = await db.chat_messages.find({"user_id": user["id"]}).sort("created_at", 1).to_list(500)
    return [{"role": m["role"], "content": m["content"], "created_at": m["created_at"]} for m in messages]


@router.post("/message")
async def send_message(payload: ChatMessageRequest, user: dict = Depends(require_roles("customer"))):
    text = payload.message.strip()

    async def event_generator():
        await db.chat_messages.insert_one({
            "user_id": user["id"],
            "role": "user",
            "content": text,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        chat = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=get_session_id(user["id"]),
            system_message=SYSTEM_PROMPT,
        ).with_model("openai", "gpt-5.4-mini")

        full_reply = ""
        async for event in chat.stream_message(UserMessage(text=text)):
            if isinstance(event, TextDelta):
                full_reply += event.content
                yield f"data: {json.dumps({'delta': event.content})}\n\n"
            elif isinstance(event, StreamDone):
                break

        await db.chat_messages.insert_one({
            "user_id": user["id"],
            "role": "assistant",
            "content": full_reply,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
