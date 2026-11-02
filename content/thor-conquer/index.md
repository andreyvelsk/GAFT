---
title: "Thor Conquer"
description: "Native dual-screen port of Command &amp; Conquer Red Alert and Tiberian Dawn for the AYN Thor, with a touch command deck on the second screen."
date: "2026-11-02 06:45"
slug: "thor-conquer"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/ZMGUqJJKna8"
source: "https://www.reddit.com/r/AynThor/comments/1xl60a0/native_red_alert_port_for_the_thor_battlefield_on/"
project_page: "https://github.com/harmssi/thor-conquer"
---

## Description

Thor Conquer is a native Android (arm64) port of Command & Conquer: Tiberian Dawn and Red Alert built around the AYN Thor's two displays, based on Vanilla Conquer. The top screen shows only the battlefield: the engine renders 960×540 and scales it exactly 2× on the 1080p panel (pixel-perfect, no stretching, no bars), so you see far more of the battlefield at the classic sprite size. The sidebar and the top tab bar are gone; menus, films and the score screen keep their original 640×400 layout and are shown as a centred frame at 2×. The bottom screen is a touch command deck with credits, a power meter, a framed radar, REPAIR / SELL / MENU buttons and two build columns with the in-game cameos, build progress, READY and ON HOLD badges. Deck taps run the same code as clicks on the original sidebar, so nothing is faked, and the deck never steals focus, so the controller stays with the game. If there is no second screen, the classic sidebar is shown on the top screen instead. On the author's Thor (Snapdragon 8 Gen 2) the port runs at 59.8 fps average over 18 minutes with a flat battery temperature of 33 °C and about 28 % of one CPU core — native arm64, no emulator.

## Features

- **Dual screen:** the deck is an Android Presentation on display 4 (FLAG_NOT_FOCUSABLE, so the controller stays with the game). If there is no second screen, the classic sidebar is shown on the top screen instead.
- **Engine-faithful:** every deck action goes through the engine's normal input path — build clicks run through the original sidebar button code, a radar tap does what a radar click does, and REPAIR and SELL are the sidebar buttons. No game state is changed directly.
- **Build deck:** tap = build or deploy when READY; tap again while building = hold; long-press = hold, then cancel. The progress sweep is drawn over the cameo. The accent color follows the faction: amber for Allies/GDI, red for Soviet/Nod.
- **Radar:** the minimap is rendered from the engine's cell colors, with a viewport frame. Tap or drag on it to scroll the map.
- **Top-screen touch:** tap = select / left click, drag = selection box, two-finger drag = scroll, long-press or two-finger tap = right click (deselect / cancel).
- **Controller:** left stick = cursor, right stick = scroll, A = left click, B = right click, Select = Esc (menu), Start = Enter, X/Y = G/F, D-pad = 1–4. L1/R1 move a focus ring through the deck's build items, and A builds the focused item while the ring is visible.
- **Content:** Red Alert (Allied, Soviet, Counterstrike, Aftermath) and Tiberian Dawn (GDI, Nod). Covert Operations is not supported yet.
- **Languages:** English (default), Deutsch, Español, Français. The app follows the system language; you can override it in Settings → Language.

## Setup guide

- Download and install the latest release APK (arm64, Android 13+) from the [Releases page](https://github.com/harmssi/thor-conquer/releases/latest).
- You need your own copy of the Command & Conquer Remastered Collection (Steam) — no game data is included.
- Copy the legacy game files from Data/CNCDATA/ into the app's data folder at /sdcard/Android/data/de.harmssi.thorconquer/files/, placing disc-specific files in the redalert/ and tiberiandawn/ subfolders as described in the README. A flat layout also works, but then only the first campaign or disc is playable.
- Minimum files: Red Alert needs REDALERT.MIX + MAIN.MIX; Tiberian Dawn needs CONQUER.MIX, GENERAL.MIX, CCLOCAL.MIX, TEMPERAT.MIX, DESERT.MIX, WINTER.MIX and SOUNDS.MIX. The launcher shows a checklist of what is missing.
- Launch the game. The launcher checks the data and lets you override the language in Settings → Language.

## Known issues

- Multiplayer is untested.
- Covert Operations is not supported for Tiberian Dawn.
- Saves get automatic names.
- The APK is debug-signed.
- Game data lives in the app folder, so uninstalling deletes it; updating over the top keeps it.
