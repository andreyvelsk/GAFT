---
title: "Thor RA2"
description: "Native port of Red Alert 2 / Yuri's Revenge for the AYN Thor with the full map on the top screen and a touch command deck on the second screen."
date: "2026-11-06 08:04"
slug: "thor-ra2"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/hMupGiEim60"
source: "https://www.reddit.com/r/AynThor/comments/1xofkqe/red_alert_2_on_the_thor_with_the_whole_map_on_top/"
project_page: "https://github.com/harmssi/thor-ra2"
---

## Description

Thor RA2 is an Android (arm64) build of the open-source RA2 Engine that runs Red Alert 2 / Yuri's Revenge natively on the AYN Thor — no Wine, no emulator. The top screen (1920×1080) shows only the map at full width, with the sidebar gone; menus, briefings and movies stay original. The bottom screen (1240×1080) is a touch command deck with credits, a power meter (red on low power), the radar, REPAIR / SELL / MENU / ZOOM, control groups 1–5, superweapons with their timers, and four build tabs (buildings, defenses, infantry, vehicles) with cameos, build progress, READY and ON HOLD. The deck is available in English, German, Spanish and French. The app ships no game data — it runs on the original files from your own copy of the game.

## Setup guide

- Download the latest release APK on the Thor.
- In Chrome tap **Download anyway**, open the file, and when the Package installer asks for permission choose **Settings → Allow from this source**, go back (you land in the download list) and **tap the APK again**, then **Install**.
- Copy every `.mix` and `.csf` file from your Red Alert 2 / Yuri's Revenge install (about 1 GB) into a `Download/RA2` folder on the Thor. Required: `ra2.mix`, `ra2md.mix`, `language.mix`, `multimd.mix`.
- Start Thor RA2, tap **Game files → Import or update game files**, open the `RA2` folder, then **Use this folder → Allow**. The files are copied into the app's own folder.
- Pick **Red Alert 2** or **Yuri's Revenge** on the bottom screen.

## Features

- **Dual screen:** map on the top screen, touch command deck on the second screen; without a second screen the original sidebar is shown.
- **Build deck:** tap to build, or place when READY (then tap the spot on the top screen); units queue with every tap, long-press holds or cancels; the accent color follows the side (Allies blue, Soviets red, Yuri violet).
- **Radar:** rendered from the engine's own radar picture; tap or drag to scroll the map.
- **Control groups:** groups 1–5 with unit count; tap to select, tap again to move the camera, long-press to save the current selection.
- **Zoom:** cycles the game picture 100 % → 125 % → 150 % live, mid-game; the setting is kept.
- **Superweapons:** each with its cameo, countdown and charge bar; tap when READY to pick a target.
- **Controller:** left stick = cursor, A = left click, B = right click, right stick / D-pad = scroll, Start = options, Back = centre on base, X = deploy, Y = stop, L3 (hold) = force fire; L1 / R1 switch the deck's build tab.
- **Launcher:** title screen on top, choice on the bottom screen (Red Alert 2 or Yuri's Revenge), game files, ZOOM, language, info.
- **Languages:** deck in English, German, Spanish and French, following the system / per-app language.

## Known issues

- Yuri is playable in skirmish only (no Yuri campaign); several Yuri abilities are still approximations or missing.
- Menu D-pad navigation jumps between buttons, list entries and checkboxes; sliders and some drop-down lists still need the stick cursor.
- "Red Alert 2" in the launcher only hides Yuri in the skirmish lobby; the engine always plays Yuri's Revenge rules.
- Saves from 0.2.x do not load in 0.3.0 (they are kept, not deleted).
- Ares / Phobos overhaul mods such as Mental Omega do not run.
- The shell menu font has no ß; menus spell it "ss". Umlauts and accents are shown.
- Requires Android 8.0 or later (arm64); made and tested for the AYN Thor.
