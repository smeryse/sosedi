import pytest
from pydantic import ValidationError

from app.domain.housing import (
    ApartmentEntity,
    RoomEntity,
    BuildingEntity,
    RoommateEntity,
    RentCalculationResult,
    ApartmentManifest,
)
from app.domain.compatibility import (
    CompatibilityInput,
    CompatibilityResult,
    AxisScore,
    CompatibilityAnswer,
)
from app.domain.floorplan import (
    Corner2D,
    Wall2D,
    Room2D,
    FloorplanGraph,
    FurniturePlacementCandidate,
)


class TestHousingDomain:
    def test_room_entity(self):
        room = RoomEntity(id="r1", name="Test Room", area=15.5)
        assert room.area == 15.5
        assert room.noise_level == 0

    def test_room_entity_validation(self):
        with pytest.raises(ValidationError):
            RoomEntity(id="r1", name="Bad", area=15.5, noise_level=20)

    def test_apartment_entity(self):
        rooms = [RoomEntity(id="r1", name="Room", area=10.0)]
        apt = ApartmentEntity(id="a1", building_id="b1", rooms=rooms, total_rent=30000)
        assert len(apt.rooms) == 1
        assert apt.total_rent == 30000

    def test_rent_calculation_result(self):
        r = RentCalculationResult(roommate_id="u1", room_id="r1", rent=15000)
        assert r.rent == 15000


class TestCompatibilityDomain:
    def test_valid_input(self):
        answers = [CompatibilityAnswer(question_id="q1", answer=3)]
        inp = CompatibilityInput(user_id="u1", answers=answers)
        assert len(inp.answers) == 1

    def test_axis_score(self):
        s = AxisScore(axis="sleep", score=0.8, label="Сон", description="Test")
        assert s.score == 0.8

    def test_compatibility_result(self):
        axes = [AxisScore(axis="sleep", score=0.8, label="Сон", description="Test")]
        r = CompatibilityResult(overall_score=0.75, axes=axes, highlights=["Good"])
        assert r.overall_score == 0.75


class TestFloorplanDomain:
    def test_corner(self):
        c = Corner2D(id="c1", x=10.0, y=20.0)
        assert c.x == 10.0

    def test_floorplan_graph(self):
        corners = [Corner2D(id="c1", x=0, y=0), Corner2D(id="c2", x=10, y=0)]
        walls = [Wall2D(id="w1", start_corner_id="c1", end_corner_id="c2")]
        rooms = [Room2D(id="r1", label="Room", corner_ids=["c1", "c2"])]
        g = FloorplanGraph(corners=corners, walls=walls, rooms=rooms)
        assert len(g.corners) == 2

    def test_furniture_placement(self):
        f = FurniturePlacementCandidate(
            furniture_id="f1", width=1.0, depth=0.5, height=2.0,
            placement_type="wall", position={"x": 5, "y": 5},
        )
        assert f.width == 1.0
