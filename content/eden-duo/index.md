---
title: "Eden Duo"
description: "A Nintendo Switch emulator for dual-screen Android handhelds that adds live touch companion screens on the second display."
date: "2026-09-27 18:26"
slug: "eden-duo"
category: "emulator"
media:
  - type: "image"
    url: "/content/eden-duo/preview.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-2.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-3.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-4.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wrdk1j/eden_duo_a_switch_emulator_fork_with_second/)

## Description

Eden Duo is a fork of the Eden Nintendo Switch emulator for Android devices with two screens, such as the AYN Thor. The game runs on the top screen as usual, while the bottom screen shows a touch companion for the game you are playing: maps, party and inventory menus, status, and more, all driven by the running game's live state.

Companions are separate, installable `.dsmod.zip` packages, one per game, so a companion can be updated without updating the emulator. They ship no game assets — all art and text comes from your own game files. For the initial release, dual-screen support is baked in for three games: **Persona 5 Royal**, **Metroid Dread**, and **Link's Awakening**.

## Features

- **Second-screen companion** — the game on the main screen and a touch companion page on the second display.
- **Live game state** — companions read the running game's memory every frame: no save-file snapshots and no polling delays.
- **Installable packages** — add a companion from the game's **Add-ons** menu with its `.dsmod.zip`; packages are validated (title, build, file layout and module checksums) before they are installed.
- **Native companion modules** — a package can carry a small native module for games whose data is too complex for a declarative manifest; modules talk to the emulator through a small, versioned C interface and never ship inside the APK.
- **Built for handhelds** — change-driven partial redraws, tile-based texture uploads and an optional GPU compositor keep the second screen at full frame rate without costing the game frames.

### Requirements

- Android 13 or newer (arm64).
- A device with a second display.
- Your own legally obtained game dump with the matching update.
- Your console's keys and firmware.

## Supported games

- **Persona 5 Royal (1.0.2)** — the full start menu on the bottom screen: skills, items, equipment, Persona, stats, confidants, requests and the calendar with the Daily Log. You can use items and change equipment or Persona by tapping, and see enemy affinities in battle.
- **Metroid Dread (2.1.0)** — a live area map with Samus's position, EMMI zones, water levels, and energy and missiles.
- **The Legend of Zelda: Link's Awakening (1.0.1)** — a live map with your own pins, plus gear and items, with X/Y equip from the touch screen.

Compatibility is intentionally strict: each companion is written for one exact game build and checks the running build before it loads. On any other version it does not load and shows a notice, instead of reading memory it does not understand.

## Setup guide

1. Download the latest EdenDuo APK from the [Releases page](https://github.com/igawa6/eden-duo/releases/latest) and install it.
2. Set up the emulator as usual: keys, firmware, and your games folder.
3. Download a companion package from the Eden Duo Companions repository.
4. In Eden Duo, long-press the game, open **Add-ons** and tap **Install**. In the **Content type** dialog choose **Dual screen mods**, tap **OK**, then select the `.dsmod.zip` file. The companion appears in the Add-ons list as `Name-version`, for example `MetroidDreadDS-1.0.0`.
5. Launch the game — the companion appears on the second screen once the game reaches gameplay.

Each companion needs an exact game version, listed in the companion repository. Eden Duo uses its own app ID, so it installs alongside other Eden builds and keeps separate data.

See the project page: [github.com](https://github.com/igawa6/eden-duo)
