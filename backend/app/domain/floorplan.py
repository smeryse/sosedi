from pydantic import BaseModel


class Corner2D(BaseModel):
    id: str
    x: float
    y: float


class Wall2D(BaseModel):
    id: str
    start_corner_id: str
    end_corner_id: str


class Room2D(BaseModel):
    id: str
    label: str
    corner_ids: list[str]


class FloorplanGraph(BaseModel):
    corners: list[Corner2D]
    walls: list[Wall2D]
    rooms: list[Room2D]


class FurniturePlacementCandidate(BaseModel):
    furniture_id: str
    width: float
    depth: float
    height: float
    placement_type: str
    position: dict[str, float]
    rotation: float = 0.0
