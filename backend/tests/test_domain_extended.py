import pytest
from pydantic import ValidationError

from app.domain.housing import (
    RoomEntity, ApartmentEntity, BuildingEntity, RoommateEntity,
    RentCalculationResult, ApartmentManifest, SceneNode, ApartmentSceneDocument,
)
from app.domain.compatibility import (
    CompatibilityInput, CompatibilityResult, AxisScore, CompatibilityAnswer,
)
from app.domain.floorplan import (
    Corner2D, Wall2D, Room2D, FloorplanGraph, FurniturePlacementCandidate,
)
from app.domain.errors import AppError, handle_database_error


class TestHousingEdgeCases:
    def test_room_noise_level_boundaries(self):
        RoomEntity(id="r1", name="Quiet", area=10.0, noise_level=0)
        RoomEntity(id="r2", name="Loud", area=10.0, noise_level=10)
        with pytest.raises(ValidationError):
            RoomEntity(id="r3", name="Invalid", area=10.0, noise_level=-1)
        with pytest.raises(ValidationError):
            RoomEntity(id="r4", name="Invalid", area=10.0, noise_level=11)

    def test_room_area_zero(self):
        room = RoomEntity(id="r1", name="Zero", area=0.0)
        assert room.area == 0.0

    def test_room_area_negative(self):
        room = RoomEntity(id="r1", name="Negative", area=-5.0)
        assert room.area == -5.0

    def test_apartment_empty_rooms(self):
        apt = ApartmentEntity(id="a1", building_id="b1", rooms=[], total_rent=0)
        assert len(apt.rooms) == 0
        assert apt.total_rent == 0

    def test_apartment_negative_rent(self):
        apt = ApartmentEntity(id="a1", building_id="b1", rooms=[], total_rent=-1000)
        assert apt.total_rent == -1000

    def test_building_no_floors(self):
        b = BuildingEntity(id="b1", name="House", address="Addr")
        assert b.floors is None

    def test_rent_calculation_empty_details(self):
        r = RentCalculationResult(roommate_id="u1", room_id="r1", rent=10000)
        assert r.details is None

    def test_rent_calculation_with_details(self):
        r = RentCalculationResult(roommate_id="u1", room_id="r1", rent=10000, details={"base": 8000, "bonus": 2000})
        assert r.details["base"] == 8000

    def test_apartment_manifest_defaults(self):
        m = ApartmentManifest(id="m1", model_url="http://example.com/model.glb", rooms=[])
        assert m.camera_presets == []
        assert m.hitbox_names == []
        assert m.quality_variants == {}

    def test_apartment_manifest_with_variants(self):
        m = ApartmentManifest(id="m1", model_url="url", rooms=[], quality_variants={"low": "low.glb", "high": "high.glb"})
        assert m.quality_variants["low"] == "low.glb"

    def test_scene_node_defaults(self):
        n = SceneNode(id="n1", type="mesh", label="Table")
        assert n.position is None
        assert n.rotation is None
        assert n.scale is None
        assert n.children is None
        assert n.properties == {}

    def test_scene_node_with_children(self):
        child = SceneNode(id="n2", type="mesh", label="Leg")
        parent = SceneNode(id="n1", type="mesh", label="Table", children=[child])
        assert len(parent.children) == 1

    def test_scene_document_defaults(self):
        doc = ApartmentSceneDocument()
        assert doc.version == 1
        assert doc.nodes == []
        assert doc.camera_presets == []
        assert doc.bounds is None


class TestCompatibilityEdgeCases:
    def test_input_empty_answers(self):
        inp = CompatibilityInput(user_id="u1", answers=[])
        assert inp.answers == []

    def test_answer_various_types(self):
        int_ans = CompatibilityAnswer(question_id="q1", answer=5)
        str_ans = CompatibilityAnswer(question_id="q2", answer="yes")
        bool_ans = CompatibilityAnswer(question_id="q3", answer=True)
        assert int_ans.answer == 5
        assert str_ans.answer == "yes"
        assert bool_ans.answer is True

    def test_axis_score_boundaries(self):
        AxisScore(axis="a", score=0.0, label="L", description="D")
        AxisScore(axis="b", score=1.0, label="L", description="D")
        with pytest.raises(ValidationError):
            AxisScore(axis="c", score=-0.1, label="L", description="D")
        with pytest.raises(ValidationError):
            AxisScore(axis="d", score=1.1, label="L", description="D")

    def test_compatibility_result_no_advice(self):
        r = CompatibilityResult(overall_score=0.5, axes=[], highlights=[])
        assert r.advice is None

    def test_compatibility_result_full(self):
        axes = [AxisScore(axis="sleep", score=0.8, label="Сон", description="Test")]
        r = CompatibilityResult(overall_score=0.75, axes=axes, highlights=["Good"], advice="Keep it up")
        assert r.advice == "Keep it up"


class TestFloorplanEdgeCases:
    def test_floorplan_empty(self):
        g = FloorplanGraph(corners=[], walls=[], rooms=[])
        assert len(g.corners) == 0
        assert len(g.walls) == 0
        assert len(g.rooms) == 0

    def test_corner_float_precision(self):
        c = Corner2D(id="c1", x=1.23456789, y=9.87654321)
        assert abs(c.x - 1.23456789) < 1e-8

    def test_wall_start_end_same_corner(self):
        w = Wall2D(id="w1", start_corner_id="c1", end_corner_id="c1")
        assert w.start_corner_id == w.end_corner_id

    def test_room_empty_corner_ids(self):
        r = Room2D(id="r1", label="Empty", corner_ids=[])
        assert r.corner_ids == []

    def test_furniture_default_rotation(self):
        f = FurniturePlacementCandidate(furniture_id="f1", width=1.0, depth=0.5, height=2.0, placement_type="wall", position={"x": 0, "y": 0})
        assert f.rotation == 0.0

    def test_furniture_custom_rotation(self):
        f = FurniturePlacementCandidate(furniture_id="f1", width=1.0, depth=0.5, height=2.0, placement_type="wall", position={"x": 0, "y": 0}, rotation=90.0)
        assert f.rotation == 90.0


class TestErrorHandling:
    def test_app_error_basic(self):
        err = AppError(code="NOT_FOUND", message="Not found")
        assert err.code == "NOT_FOUND"
        assert err.message == "Not found"
        assert err.details is None

    def test_app_error_with_details(self):
        err = AppError(code="VALIDATION", message="Invalid", details={"field": "email"})
        assert err.details["field"] == "email"

    def test_handle_foreign_key_error(self):
        exc = Exception("foreign_key_violation on table users")
        err = handle_database_error(exc)
        assert err.code == "REFERENCE_NOT_FOUND"

    def test_handle_unique_violation(self):
        exc = Exception("unique_violation duplicate key")
        err = handle_database_error(exc)
        assert err.code == "DUPLICATE"

    def test_handle_serialization_failure(self):
        exc = Exception("serialization_failure on commit")
        err = handle_database_error(exc)
        assert err.code == "CONCURRENCY"

    def test_handle_generic_error(self):
        exc = Exception("connection refused")
        err = handle_database_error(exc)
        assert err.code == "DATABASE_ERROR"

    def test_app_error_str(self):
        err = AppError(code="ERR", message="Something broke")
        assert str(err) == "Something broke"
