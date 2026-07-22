from __future__ import annotations

from pydantic import BaseModel


class CompatibilityAnswer(BaseModel):
    question_id: str
    answer: int | str | bool


class CompatibilityInput(BaseModel):
    user_id: str
    answers: list[CompatibilityAnswer]


class AxisScore(BaseModel):
    axis: str
    score: float
    label: str
    description: str


class CompatibilityResult(BaseModel):
    overall_score: float
    axes: list[AxisScore]
    highlights: list[str]
    advice: str | None = None
