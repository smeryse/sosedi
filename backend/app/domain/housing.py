from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class BuildingEntity(BaseModel):
    id: str
    name: str
    address: str
    floors: int | None = None


class RoomEntity(BaseModel):
    id: str
    name: str
    area: float
    has_balcony: bool = False
    has_workplace: bool = False
    noise_level: int = Field(default=0, ge=0, le=10)


class RoommateEntity(BaseModel):
    id: str
    name: str
    room_id: str


class ApartmentEntity(BaseModel):
    id: str
    building_id: str
    rooms: list[RoomEntity]
    total_rent: float


class RentCalculationResult(BaseModel):
    roommate_id: str
    room_id: str
    rent: float
    details: dict[str, Any] | None = None


class ApartmentManifest(BaseModel):
    id: str
    model_url: str
    rooms: list[dict[str, Any]]
    camera_presets: list[dict[str, Any]] = []
    hitbox_names: list[str] = []
    quality_variants: dict[str, str] = {}


class SceneNode(BaseModel):
    id: str
    type: str
    label: str
    position: dict[str, float] | None = None
    rotation: dict[str, float] | None = None
    scale: dict[str, float] | None = None
    children: list[SceneNode] | None = None
    properties: dict[str, Any] = {}


class ApartmentSceneDocument(BaseModel):
    version: int = 1
    nodes: list[SceneNode] = []
    camera_presets: list[dict[str, Any]] = []
    bounds: dict[str, float] | None = None
