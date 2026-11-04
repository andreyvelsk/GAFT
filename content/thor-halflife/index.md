---
title: "Thor Half-Life"
description: "Native dual-screen Half-Life port for the AYN Thor with the full HEV suit HUD on the touch screen."
date: "2026-11-04 07:35"
slug: "thor-halflife"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/jiYEW7FgMcQ"
source: "https://www.reddit.com/r/AynThor/comments/1xmnvqp/native_halflife_port_for_the_thor_the_game_on_the/"
project_page: "https://github.com/harmssi/thor-halflife"
---

## Description

Thor Half-Life is a native Android (arm64) port of Half-Life for the AYN Thor, based on Xash3D FWGS and the Half-Life SDK — no emulator, no Windows layer. The game runs on the top screen at 1920×1080 with GLES3, while the entire HEV suit HUD (health, armor and every weapon) is moved to the bottom touch screen so the HUD never covers the game. Opposing Force and Blue Shift are supported, each with its own deck. The APK contains no Valve data; you need your own copy of Half-Life.

## Features

- Native Android port (arm64) based on Xash3D FWGS + the Half-Life SDK — no emulator, no Windows layer
- Top screen: just the game, 1920×1080, GLES3
- Bottom screen = HEV deck: health/armor, the full arsenal with ammo (tap to select), pickups, hazards (radiation, water), map name, flashlight, quicksave/quickload, menu
- Opposing Force and Blue Shift work too, each with its own deck (night vision, Displacer etc.)
- Controller: RT fire, LT alt fire, A jump, B duck, X reload, Y use, LB/RB weapon, d-pad up flashlight

## Requirements

- A copy of Half-Life (Steam) — the APK contains no Valve data
- Copy `steamapps/common/Half-Life/valve` from your Steam installation to `/sdcard/xash/valve`
- For Opposing Force / Blue Shift, put `gearbox` / `bshift` next to it (`*_hd` folders optional)

## Setup guide

- Install the APK from the latest release (Chrome: Download anyway → Package installer → Settings → Allow from this source → Install)
- Copy `steamapps/common/Half-Life/valve` from your Steam installation to `/sdcard/xash/valve`; for Opposing Force / Blue Shift put `gearbox` / `bshift` next to it (`*_hd` folders optional)
- Start the app and tap Allow file access
- Play
