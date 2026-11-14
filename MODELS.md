# Adding 3D models

Put a GLB at the path shown in `src/data/objects.ts` (e.g. `public/models/hardware/ram.glb`; SISURU BOT stays at `public/models/sisuru-bot.glb`).
Missing files show a cyan wireframe placeholder box + a note naming the expected path. Optional card images: `public/thumbnails/<id>.png`.
Model rules: Y-up, glTF-Binary, <5 MB, textures ≤1024 px, Draco/meshopt compression. The app scales the largest dimension to `scale` (marker widths) and rests the lowest point on the marker.
Use only models you made or that are CC0 / CC-BY (keep credits), e.g. from Poly Pizza, Sketchfab (check each licence) or Kenney.
