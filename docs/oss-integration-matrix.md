# Open-Source Integration Matrix

| Repository | URL | Commit SHA | License | Feature / Area | Donor Advantage | Sosedi Advantage | Selected Ideas & Files | Integration Strategy | Required Attribution | Risks & Mitigations |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pascal Editor** | `https://github.com/pascalorg/editor` | `2084892383ababb4cb0d2941d46e87982647a95c` | MIT | 3D Scene Registry & Dirty Nodes | Mature 3D entity hierarchy, R3F WebGPU/WebGL node schemas, dirty node updates, focus & selection manager | Co-living domain, MapLibre, PostGIS, roommate fair rent calculator, Supabase RLS | `SceneNode` Zod schemas, `SceneRegistry` pattern (`Map<EntityId, Object3D>`), dirty update queue, undo/redo history | Clean adaptation into `lib/domain/housing/scene-graph.ts` and `lib/application/3d/scene-registry.ts` | Mention in `THIRD_PARTY_NOTICES.md` & code headers | WebGPU incompatibility; Mitigation: Keep R3F WebGL2 renderer as active production target |
| **Blueprint3D Modern** | `https://github.com/charmlinn/blueprint3d-modern` | `f56f0b2a4a6e177181aefbf535d2945b937b5c02` | MIT | 2D Floorplan Graph Engine | Corner/Wall/Room mathematical model, wall splitting, snapping, polygon calculation, placement rules | R3F declarative scene, GLB asset manifest, exact `RoomId` union,fair rent split | Corner/Wall/Room domain models, closed loop detection, wall snapping, item placement rules | Clean adaptation into `lib/domain/floorplan/graph-engine.ts` and `placement-rules.ts` | Mention in `THIRD_PARTY_NOTICES.md` & code headers | Dual rendering engine conflict; Mitigation: Blueprint graph is pure math model; rendering executed exclusively by R3F |
| **Arcada** | `https://github.com/mehanix/arcada` | `caf04020face2490f2e5ea635c31620cc0db2f40` | Apache-2.0 | Owner Floorplan Editor UX | Clear 2D editing tool UX (Add Wall, Add Door, Measure, Multi-floor) | 3D WebGL renderer, MapLibre GIS, resident profiles, Supabase auth/RLS | 2D Editor UX tool patterns, wall/opening tools, floor level switcher UX | Clean adaptation into `components/owner/editor/*` using Tailwind/shadcn without adding Pixi/Mantine | Preserve Apache-2.0 license header in adapted files & notice | Heavy Pixi.js bundle; Mitigation: Use native Canvas 2D / SVG for 2D editing without adding Pixi dependency |
| **mapcn** | `https://github.com/AnmolSaini16/mapcn` | `93f9a9ed55005ce08e22a991eed6de4a7d5f2483` | MIT | Declarative MapLibre React UI | Composable React MapLibre UI primitives (Marker, Popup, Tooltip, Route, Controls) | Real estate listings model, PostGIS spatial queries, quality layers, 3D building extrusion | Marker, Popup, Tooltip, Zoom/Compass controls pattern | Clean adaptation into `components/map/map-primitives.tsx` | Mention in `THIRD_PARTY_NOTICES.md` | Multiple map instances; Mitigation: Map primitives attach to existing single MapLibre instance |

---

## Dependency & Renderer Compatibility Matrix

- **Three.js**: `0.185.1` (Single deduplicated instance across `@react-three/fiber` and `@react-three/drei`)
- **React Three Fiber**: `9.6.1` (Single R3F WebGL2 Canvas renderer)
- **MapLibre GL**: `5.1.0` (Single Map instance on map screens)
- **Zustand**: `5.0.3` (Single domain store with `memoryStorage` fallback for SSR)
- **Zod**: `3.24.2` (Single domain schema validator)
