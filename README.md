# Cutting Mat Studio

A local-first procedural wallpaper editor built with React, TypeScript, Canvas 2D, and Sites. No image generation APIs, uploads, or application accounts.

## Develop

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Tests cover recipes, history, randomization locks, device-storage failures, deterministic drawing, export failures, and actual PNG dimensions. Native Canvas is used only by tests and artwork scripts; the app uses browser Canvas.

`npm run dev` serves the editor. Saved designs and the latest recipe stay in the browser's local storage, with a maximum of 30 named designs. Clearing site data removes them. Ruler markings are decorative.

## Rendering

`lib/mat/model.ts` defines version-1 recipes, curated presets, the history reducer, and storage validation. `lib/mat/render.ts` provides one drawing function for previews, thumbnails, and exports. Texture coordinates are seeded and cached; export redraws at the requested resolution. Standard canvases use a 1200-unit design width, with an adaptive minimum height for extreme aspect ratios.

PNG exports allow 64–8192 pixels per side and at most 34 million pixels. Apply custom dimensions before exporting. Errors preserve the editable recipe.

## Artwork

```sh
node --experimental-strip-types scripts/artwork.mjs
```

This regenerates procedural social artwork and sample renders. No AI assets are used.

## Studio v2 workflow

- Type exact values beside sliders; each completed slider gesture is one undo step.
- Keep canvas size while trying presets, or switch that option off to use preset dimensions.
- Match the canvas to the browser's estimate of your screen pixels, or swap width and height.
- In Saved designs, import/download editable `.design.json` files, update a loaded design, duplicate favorites, or undo the latest deletion. Imports preserve version-1 compatibility and validate all settings before applying.
- The latest session is saved on page exit as well as during editing. A corrupt session no longer prevents recovery of otherwise valid saved designs.
