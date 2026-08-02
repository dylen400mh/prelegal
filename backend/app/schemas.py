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


# --- Mutual NDA chat (PL-5) ---
#
# These mirror the frontend `MndaData` model (frontend/nda/types.ts). Fields are
# snake_case in Python but (de)serialize as camelCase to match the frontend and
# the LLM structured-output schema.


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PartyData(CamelModel):
    company: str = ""
    name: str = ""
    title: str = ""
    notice_address: str = ""


class MndaDocument(CamelModel):
    purpose: str = ""
    effective_date: str = ""
    mnda_term_mode: Literal["expires", "untilTerminated"] = "expires"
    mnda_term_years: int = 1
    confidentiality_mode: Literal["years", "perpetuity"] = "years"
    confidentiality_years: int = 1
    governing_law: str = ""
    jurisdiction: str = ""
    modifications: str = ""
    party1: PartyData = Field(default_factory=PartyData)
    party2: PartyData = Field(default_factory=PartyData)


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(CamelModel):
    messages: list[ChatMessage]
    data: MndaDocument


class ChatResponse(CamelModel):
    """The assistant's next reply plus the full updated NDA document. Doubles as
    the LLM's structured-output schema and the endpoint's response body."""

    reply: str
    data: MndaDocument
