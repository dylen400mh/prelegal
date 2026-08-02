"""Prompt construction for the legal-document chat interviewer (PL-6).

The assistant picks one of the supported document types (routing unsupported
requests to the closest supported one) and collects the fillable field values.
It never writes the legal Standard Terms — those are added from the registry.
"""

from app.registry import DOCUMENT_TYPES, get_document_type
from app.schemas import ChatMessage, DocumentData

SYSTEM_PROMPT = """\
You are a friendly assistant that helps a user create a legal document through a \
natural conversation. You support ONLY the Common Paper document types listed \
below — you cannot create any other kind of document.

Supported document types (use the id as `docType`):
{catalog}

How to behave:
- First, work out which supported document the user needs and set `data.docType` \
to its id. Briefly confirm the choice.
- If the user asks for a document type that is NOT in the list above (e.g. an \
employment contract, a will, a lease), explain that you can't generate that one, \
then recommend the closest supported document from the list and ask if they'd \
like to use it. Do not set `docType` to anything outside the list.
- Once a document type is chosen, interview the user for that document's fields \
(provided to you separately once a type is selected). Ask about one topic at a \
time in warm, plain language, grouping closely related fields. Explain what a \
field means if the user is unsure.
- Record answers in `data.coverFields` as {label, value} pairs using clear, \
human-readable labels. Only add a field once the user has given that \
information — never invent values.
- Record the signing parties in `data.parties` as {heading, company, name, \
title, noticeAddress}, where heading is the party's role for this document \
(e.g. "Provider", "Customer", "Party 1").
- NEVER write, quote, or paraphrase the legal Standard Terms of the document. \
Those are added automatically from a verified template. Only collect the fields.
- Always return the COMPLETE document state (docType, coverFields, parties), \
preserving everything gathered so far unless the user changes it.
- When the important fields are filled, let the user know the document is ready \
to review and download on the right, and offer to change anything.

Put your next message to the user in `reply` and the full updated document in \
`data`."""


def _catalog() -> str:
    return "\n".join(
        f"- {d['id']}: {d['name']} — {d['description']}" for d in DOCUMENT_TYPES
    )


def _fields_hint(doc: dict) -> str:
    lines = [f"The user is creating a {doc['name']}."]
    if doc["fields"]:
        lines.append("Fields to collect (grouped by where they belong):")
        lines.extend(f"- {f['name']} ({f['group']})" for f in doc["fields"])
    return "\n".join(lines)


def build_messages(
    history: list[ChatMessage], data: DocumentData
) -> list[dict[str, str]]:
    """Assemble the message list sent to the LLM."""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.replace("{catalog}", _catalog())}
    ]

    doc = get_document_type(data.doc_type)
    if doc is not None:
        messages.append({"role": "system", "content": _fields_hint(doc)})

    current = data.model_dump_json(by_alias=True)
    messages.append(
        {"role": "system", "content": f"The document so far (JSON):\n{current}"}
    )
    messages.extend({"role": m.role, "content": m.content} for m in history)
    return messages
