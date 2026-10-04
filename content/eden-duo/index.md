---
title: "Eden Duo"
description: "A Nintendo Switch emulator for dual-screen Android handhelds that adds live touch companion screens on the second display."
date: "2026-09-27 18:26"
slug: "eden-duo"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/eden-duo/preview.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-2.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-3.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-4.webp"
  - type: "video"
    url: "https://www.youtube.com/watch?v=LaLfNIwAwHU"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wrdk1j/eden_duo_a_switch_emulator_fork_with_second/)

## Description

Eden Duo is a fork of the Eden Nintendo Switch emulator for Android devices with two screens, such as the AYN Thor. The game runs on the top screen as usual, while the bottom screen shows a touch companion for the game you are playing: maps, party and inventory menus, status, and more, all driven by the running game's live state.

Companions are separate, installable `.dsmod.zip` packages, one per game, so a companion can be updated without updating the emulator. They ship no game assets — all art and text comes from your own game files. Dual-screen support is available for eight games: **Persona 5 Royal**, **Metroid Dread**, **Link's Awakening**, **Mario Kart 8 Deluxe**, **Super Mario Bros. Wonder**, **Animal Crossing: New Horizons**, **Fire Emblem: Three Houses**, and **The Binding of Isaac**.

## Features

- **Second-screen companion** — the game on the main screen and a touch companion page on the second display.
- **Live game state** — companions read the running game's memory every frame: no save-file snapshots and no polling delays.
- **Installable packages** — add a companion from the game's **Add-ons** menu with its `.dsmod.zip`; packages are validated (title, build, file layout and module checksums) before they are installed.
- **Native companion modules** — a package can carry a small native module for games whose data is too complex for a declarative manifest; modules talk to the emulator through a small, versioned C interface and never ship inside the APK.
- **Touch that feels native** — taps, press-and-hold gestures, drag and drop, animated page and layout changes, and haptic feedback on the second screen.
- **Second screen your way** — swap the screens, stretch the companion, or open another app on the second screen for games without a companion.
- **Built for handhelds** — change-driven partial redraws, tile-based texture uploads and an optional GPU compositor keep the second screen at full frame rate without costing the game frames.

### Requirements

- Android 13 or newer (arm64).
- A device with a second display.
- Your own legally obtained game dump with the matching update.
- Your console's keys and firmware.

## Supported games

- **Persona 5 Royal (1.0.2)** — the full start menu on the bottom screen: skills, items, equipment, Persona, stats, confidants, requests and the calendar with the Daily Log. You can use items and change equipment or Persona by tapping, and see enemy affinities in battle.
- **Metroid Dread (2.1.0)** — a live area map with Samus's position, EMMI zones, water levels, and energy and missiles.
- **The Legend of Zelda: Link's Awakening (1.0.1)** — a live map with your own pins, plus gear and items, with X/Y equip from the touch screen. [Watch a video showcase](https://www.youtube.com/watch?v=LaLfNIwAwHU).
- **Mario Kart 8 Deluxe (4.0.0, 3.0.3)** — a live rank bar with every racer's items, a course map showing all racers, and a big horn button. Also works with CTGP-DX v1.1.1 custom tracks.
- **Super Mario Bros. Wonder (1.2.1)** — a course page with a progress rail from start to goal, your 10-flower coins, world Wonder Seeds, current form and item balloon, and a world map page with the selected course and an Open Courses button. Created by u/Far_Entrepreneur_246, the first third-party contributor.
- **Animal Crossing: New Horizons (3.0.3)** — island map, pockets, Critterpedia, DIY recipes and the NookPhone.
- **Fire Emblem: Three Houses (1.2.0)** — monastery and battle maps, unit details, academy and quests. [Watch a video showcase](https://www.youtube.com/watch?v=gt7DaUXBABY).
- **The Binding of Isaac: Afterbirth+ and Repentance DLC (1.7.9b)** — MAP / ITEMS / ROOM pages, counters, stats and optional item descriptions.

Compatibility is intentionally strict: each companion is written for one exact game build and checks the running build before it loads. On any other version it does not load and shows a notice, instead of reading memory it does not understand.

## Setup guide

1. Download the latest EdenDuo APK (1.1.0 or newer) from the [Releases page](https://github.com/igawa6/eden-duo/releases/latest) and install it.
2. Set up the emulator as usual: keys, firmware, and your games folder.
3. Download a companion package from the [Eden Duo Companions repository](https://github.com/igawa6/eden-duo-companions).
4. In Eden Duo, long-press the game, open **Add-ons** and tap **Install**. In the **Content type** dialog choose **Dual screen mods**, tap **OK**, then select the `.dsmod.zip` file. The companion appears in the Add-ons list as `Name-version`, for example `MetroidDreadDS-1.0.0`.
5. Launch the game — the companion appears on the second screen once the game reaches gameplay.

Second-screen options are in **Settings → Graphics → Second Screen**, and each game can have its own values. **Swap Screens** chooses which display runs the game and which shows the companion — handy for Retroid or AYANEO dual-screen layouts. **No Companion** decides what the second screen shows for games without a companion: the game icon, black, nothing, or a chosen app such as a guide, browser or media player.

Each companion needs an exact game version, listed in the companion repository. Eden Duo uses its own app ID, so it installs alongside other Eden builds and keeps separate data.

See the project page: [github.com](https://github.com/igawa6/eden-duo)
