---
title: "ChronoDuo"
description: "A DS-style second screen for the official Chrono Trigger Android game: live world map, party status and the battle menu on the bottom display"
date: "2026-09-08 12:00"
slug: "chronoduo"
category: "game"
media:
  - type: "image"
    url: "/content/chronoduo/preview.webp"
  - type: "image"
    url: "/content/chronoduo/battle.webp"
  - type: "image"
    url: "/content/chronoduo/forest.webp"
tags:
  - chrono-trigger
  - dual-screen
  - companion
---

source: [github.com](https://github.com/kalenjohnson/chrono-duo)

## Description
ChronoDuo is a dual-screen host for **Chrono Trigger (Upgrade Ver.)** on the AYN Thor. The real game runs full-widescreen on the top screen while the bottom screen becomes a DS-style companion display, much like the Nintendo DS release.

ChronoDuo ships no game code or assets. It loads the official Chrono Trigger Android app you already own inside its own process and drives the second screen through Android's standard `Presentation` API.

The bottom screen shows:

- **Overworld map** in a sepia, torn-parchment style with a live position marker, the current location name, gold and play time. All eight era maps are rendered on first launch from the game's own map data, and story changes such as bridges and craters show up as they happen.
- **Party status** with real portraits in the game's own window chrome and live HP and MP.
- **Battle mirroring** — the Attack/Tech/Item menu and the Tech and Item lists move to the bottom screen, driven by the d-pad, so the top screen stays HUD-free. Enemy HP bars stay hidden by default, with an eye toggle to reveal them.
- **Indoor area maps** with a live marker once you import your own Chrono Trigger DS ROM (decoded on-device, nothing is shipped or uploaded).
- **Original pixel art** — an optional toggle rebuilds the unfiltered SNES-style sprites, field chips and overworld tiles from the 1x art the game itself ships.

## Setup guide
1. Install the official [CHRONO TRIGGER (Upgrade Ver.)](https://play.google.com/store/apps/details?id=com.square_enix.android_googleplay.chrono) from Google Play (version 2.1.5 or newer) and launch it once.
2. Download the latest `ChronoDuo-<version>.apk` from the [Releases page](https://github.com/kalenjohnson/chrono-duo/releases) and install it.
3. Launch **ChronoDuo** instead of Chrono Trigger. The game boots on the top screen and the companion display appears on the bottom.

Tap the gear in the top-left corner of the bottom screen (outside battle) to open settings, import a DS ROM, or build the original pixel-art sheets.

Full details on the project page: [github.com](https://github.com/kalenjohnson/chrono-duo)

## Known issues
- Requires Android 8.0+ on an arm64 device; developed and tested on the AYN Thor Lite.
- Early release (0.1). Report problems on the project's [issue tracker](https://github.com/kalenjohnson/chrono-duo/issues).
