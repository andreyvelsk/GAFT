---
title: "GBA DS"
description: "A Game Boy Advance emulator with a second-screen experience for maps, HUDs and other game information"
date: "2026-10-26 12:00"
slug: "gba-ds"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "https://raw.githubusercontent.com/kyannon/gba-ds/main/docs/fusion.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/kyannon/gba-ds/main/docs/cotm.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/kyannon/gba-ds/main/docs/mario-kart-race.png"
tags:
  - gba
  - emulator
  - dual-screen
source: "https://github.com/kyannon/gba-ds"
project_page: "https://github.com/kyannon/gba-ds"
---

## Description
GBA DS is a Game Boy Advance emulator for dual-screen handhelds. The game runs on one screen while the second screen displays the game's own map or other useful information, bringing a DS-style experience to GBA games.

The project is built for devices such as the Anbernic RG DS Plus and Android handhelds running GammaOS. It is inspired by the way the Nintendo DS Castlevania games keep a live map visible on the second screen, making exploration more comfortable without interrupting gameplay.

GBA DS supports 14 games with dedicated second-screen features. Other Game Boy Advance games also run normally on the primary screen, even when they do not yet have custom second-screen compatibility.

## Second-screen features
- **Live maps** for supported games, including explored rooms, save rooms, warp rooms, area names and completion percentages.
- **Game-specific HUDs** for games such as *Mario Kart: Super Circuit*, including the course map, lap information, time and standings.
- **Goal sheets** for *Tony Hawk's Pro Skater 2*, kept visible while skating.
- **Animated map updates** with blinking or pulsing player markers.
- **Pixel-perfect scaling** with optional LCD grid effects.
- **Automatic game logo extraction** for games without a dedicated second-screen display.

## How it works
GBA DS uses [libmgba](https://mgba.io) for emulation and runs a second, silent copy of the emulator alongside the active game. At regular intervals and after room transitions, it copies the live game state into the silent emulator, opens the relevant map or information screen, captures a short sequence of frames and displays the result on the second screen.

The active game is never paused or modified. Screens that are not valid map or HUD screens—such as title screens, menus, cutscenes and fades—are rejected so the previous useful display remains visible.

## Setup guide
1. Download the latest build from the [GBA DS releases page](https://github.com/kyannon/gba-ds/releases).
2. Follow the installation guide for your device in the project's [wiki](https://github.com/kyannon/gba-ds/wiki).
3. Add your legally obtained GBA ROMs according to the instructions for your operating system.
4. Launch GBA DS and select a game. Supported titles automatically activate their second-screen mode.

Documentation is available in the wiki: [Playing](https://github.com/kyannon/gba-ds/wiki/Playing), [Supported games](https://github.com/kyannon/gba-ds/wiki/Supported-games), [Settings](https://github.com/kyannon/gba-ds/wiki/Settings) and [Troubleshooting](https://github.com/kyannon/gba-ds/wiki/Troubleshooting).

## Known issues
- Second-screen features are currently available only for the supported games listed in the project's wiki.
- Games without dedicated compatibility still run, but use only the primary screen.
- Installation steps and supported platforms vary between ROCKNIX, BananaOS, stock Linux and Android.
- ROM files are not included; use only games you legally own.
