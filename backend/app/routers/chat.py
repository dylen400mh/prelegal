from fastapi import APIRouter, HTTPException, status
from litellm import completion

from app.config import settings
from app.nda_chat import build_messages
from app.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    messages = build_messages(payload.messages, payload.data)
    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
            api_key=settings.openrouter_api_key,
        )
        return ChatResponse.model_validate_json(response.choices[0].message.content)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service error",
        ) from exc
