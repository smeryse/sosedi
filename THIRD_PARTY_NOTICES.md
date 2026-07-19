# Third-Party Notices & Open-Source Attribution

This project selectively incorporates algorithms, design patterns, schemas, and components adapted from the following open-source projects. All adapted code preserves original copyright notices and license compliance.

---

## 1. Pascal Editor
- **Repository**: https://github.com/pascalorg/editor
- **Commit SHA**: `2084892383ababb4cb0d2941d46e87982647a95c`
- **License**: MIT
- **Adapted Concepts & Patterns**:
  - Zod Node Schemas (`SceneNode`, `LevelNode`, `WallNode`, `ZoneNode`, `FurnitureNode`).
  - React Three Fiber Scene Registry (`Map<EntityId, Object3D>`).
  - Dirty-Node selective geometry update queue.
  - Hierarchy & Selection Manager strategies.
  - Undo/Redo command pattern for 3D state.

## 2. Blueprint3D Modern
- **Repository**: https://github.com/charmlinn/blueprint3d-modern
- **Commit SHA**: `f56f0b2a4a6e177181aefbf535d2945b937b5c02`
- **License**: MIT
- **Adapted Concepts & Algorithms**:
  - 2D Floorplan Graph algorithms (Corner, Wall, Room closed polygon calculation).
  - Wall intersection splitting & grid snapping algorithms.
  - Placement rules for `FloorItem`, `WallItem`, `InWallItem`, `CeilingItem`.
  - Surface polygon area computation and 2D/3D state synchronization.

## 3. Arcada
- **Repository**: https://github.com/mehanix/arcada
- **Commit SHA**: `caf04020face2490f2e5ea635c31620cc0db2f40`
- **License**: Apache-2.0
- **Adapted UX & Tools**:
  - Owner Floorplan Editor UX layout and tools (Wall, Opening, Item, Measure).
  - Multi-floor level switcher UX patterns.
  - Export/print floorplan utilities adapted for Canvas 2D/SVG.

## 4. mapcn
- **Repository**: https://github.com/AnmolSaini16/mapcn
- **Commit SHA**: `93f9a9ed55005ce08e22a991eed6de4a7d5f2483`
- **License**: MIT
- **Adapted Components**:
  - Declarative React MapLibre UI primitives (Marker, Popup, Tooltip, Route, Controls).
  - Integrated into single MapLibre Map instance lifecycle without creating parallel instances.
