# chromux deep guide: visual coordinates and frames

On-demand guide (`chromux skill visual`).
Read this for canvas, range sliders, drag/drop, hover-only controls, screenshot crops, or cross-origin frames.

## Coordinate spaces

`click --xy`, `hover --xy`, `drag --xy`, and screenshot `--region` use CSS viewport coordinates by default.
Keep that default for coordinates measured from DOM geometry.

A screenshot response reports PNG dimensions, CSS and visual viewport data, scroll offsets, and measured `cssToImage` / `imageToCss` conversion.
Use `--space image` when a point or crop came from the PNG.
Do not multiply or divide by `devicePixelRatio` alone; zoom, visual viewport scale, and clipping can change the mapping.

```bash
chromux screenshot <s> /tmp/full.png
chromux screenshot <s> /tmp/crop.png --region X Y W H --space image
chromux click <s> --xy IMAGE_X IMAGE_Y --space image
```

`--ref @N|selector` crops one reachable visible element.
Region and ref crops are clipped to the visible viewport and return their own image dimensions and CSS rect.

## Canvas and visual-only controls

Canvas objects do not have DOM refs.
Capture the full surface or a bounded crop, inspect the image, then act with image-space or CSS-space coordinates.

```bash
chromux hover <s> --xy X Y --space image
chromux click <s> --xy X Y --space image
chromux drag <s> --xy X1 Y1 --to-xy X2 Y2 --space image --drag-mode pointer
```

For an HTML range input, drag the visible thumb with pointer mode; `fill` is not the range-control action.
Use `--drag-mode html5` for native draggable and drop targets.
`auto` chooses HTML5 only when the source reports draggable and otherwise uses real pointer movement.
There is no JavaScript synthetic-success fallback.

## Cross-origin frames

Default snapshots keep child content opaque.
They expose only the frame title, origin without path/query data, CSS rect, and a frame ref.
Visible pointer actions can use that geometry, but reliable text insertion into a site-isolated OOPIF requires child-target routing.

Use `open <s> <url> --oopif` only when child DOM/ref access is necessary.
The snapshot appends namespaced refs such as `@f1g1:2`; snapshot, click, fill, and text/selector waits route to that child target.
File fill, autocomplete `--pick`, and ref-based hover/drag are not routed to OOPIF children.

Frame navigation or detach invalidates the namespace.
Take a fresh snapshot on a stale-child error.
The opt-in uses child-target attachment, increases the response payload, and broadens the observable automation surface, so it stays disabled by default.

## Recovery loop

After any visual action, check the returned `changed` diff or take a screenshot of the resulting state.
If nothing changed, verify coordinate space and crop metadata first, then check for an overlay, stale frame namespace, or the wrong drag mode before repeating the action.
