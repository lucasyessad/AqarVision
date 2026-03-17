"""Tests for JSON extraction and error handling."""

import pytest

from services.errors import extract_json, AIServiceError


def test_extract_json_direct():
    data = extract_json('{"key": "value"}')
    assert data == {"key": "value"}


def test_extract_json_markdown_block():
    text = '```json\n{"key": "value"}\n```'
    data = extract_json(text)
    assert data == {"key": "value"}


def test_extract_json_with_preamble():
    text = 'Voici le résultat :\n{"key": "value"}\nMerci.'
    data = extract_json(text)
    assert data == {"key": "value"}


def test_extract_json_no_json():
    with pytest.raises(AIServiceError):
        extract_json("No JSON here at all")


def test_extract_json_nested():
    text = '```\n{"low": 5000000, "mid": 7000000, "high": 9000000, "confidence": 0.6}\n```'
    data = extract_json(text)
    assert data["mid"] == 7000000
