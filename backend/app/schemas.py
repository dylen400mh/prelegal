from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime


# --- Document chat (PL-5, generalized to all document types in PL-6) ---
#
# These mirror the frontend `DocumentData` model (frontend/nda/types.ts). Fields
# are snake_case in Python but (de)serialize as camelCase to match the frontend
# and the LLM structured-output schema.


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PartyBlock(CamelModel):
    heading: str = ""
    company: str = ""
    name: str = ""
    title: str = ""
    notice_address: str = ""


class CoverField(CamelModel):
    label: str
    value: str = ""


class DocumentData(CamelModel):
    doc_type: str = ""
    cover_fields: list[CoverField] = Field(default_factory=list)
    parties: list[PartyBlock] = Field(default_factory=list)


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(CamelModel):
    messages: list[ChatMessage]
    data: DocumentData


class ChatResponse(CamelModel):
    """The assistant's next reply plus the full updated document. Doubles as the
    LLM's structured-output schema and the endpoint's response body."""

    reply: str
    data: DocumentData
