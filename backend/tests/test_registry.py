from app.doc_chat import build_messages
from app.registry import DOCUMENT_IDS, DOCUMENT_TYPES, get_document_type
from app.schemas import DocumentData


def test_registry_has_all_document_types():
    assert len(DOCUMENT_TYPES) == 11
    assert "mutual-nda" in DOCUMENT_IDS
    assert "cloud-service-agreement" in DOCUMENT_IDS
    # mutual-nda-coverpage is not a standalone document.
    assert "mutual-nda-coverpage" not in DOCUMENT_IDS


def test_every_document_has_metadata_and_fields():
    for doc in DOCUMENT_TYPES:
        assert doc["id"] and doc["name"] and doc["description"]
        assert doc["fields"], f"{doc['id']} has no fields"


def test_build_messages_includes_catalog_and_field_hint():
    # No doc chosen: catalog only.
    msgs = build_messages([], DocumentData(doc_type=""))
    assert any("cloud-service-agreement" in m["content"] for m in msgs)

    # Doc chosen: a field hint for that document is added.
    msgs = build_messages([], DocumentData(doc_type="mutual-nda"))
    assert any("creating a Mutual Non-Disclosure Agreement" in m["content"] for m in msgs)


def test_get_document_type():
    assert get_document_type("mutual-nda")["name"] == "Mutual Non-Disclosure Agreement"
    assert get_document_type("nonexistent") is None
