# chromux macOS status bar app

This folder contains the native macOS companion wrapper for the chromux status
dashboard. It builds a small AppKit status bar app that starts the local
`chromux app` HTTP server, shows a `cx` menu bar item, and opens the dashboard in
a native window.

The core npm CLI stays zero-dependency. The app bundle copies `chromux.mjs` and
`status-app/` into `Contents/Resources` at build time and runs them with the
system `node` command.

## Build

```bash
./apps/macos-status-bar/build.sh
open "apps/macos-status-bar/dist/Chromux Status.app"
```

The app inherits `CHROMUX_HOME`, `CHROMUX_PROFILE`, and other environment values
from its launch environment when started from a shell. When launched from
Finder, it uses the normal default chromux home at `~/.chromux`.

## Behavior

- Adds a `cx` item to the macOS status bar.
- Starts `chromux app --host 127.0.0.1 --port 0`.
- Opens the local dashboard in a native WebKit window.
- Shows currently active profiles in the `cx` menu when it opens.
- Supports active-first sorting, filtering, bulk profile selection, and deletion
  through the dashboard.
- Provides menu items for opening the dashboard, opening the URL in a browser,
  restarting the local server, and quitting.
- Stops the local server process on quit.
