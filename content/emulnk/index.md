---
title: "Emulnk"
description: "Emulator companion app that turns your second screen into a themed dashboard, built for dual-display handhelds"
date: "2026-06-15 11:00"
slug: "emulnk"
category: "emulation"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=u7MSK2YUFw8"
---

## Description
EmuLnk connects to emulators over UDP, reads game memory in real time, and renders it as themed HTML pages. It supports three modes: full-screen dashboards on a second screen, floating overlay widgets on top of the game, or both at once (bundle). Themes are HTML/CSS/JS WebViews driven by live data from JSON profiles. Themes can also write back to game memory, run macros, play sounds, and trigger haptic feedback.

## Supported Emulators

| Emulator | Systems | Fork |
|----------|---------|------|
| **RetroArch** | SNES, Genesis, NES, GB, GBC, GBA, PS1, N64 | [`retroarch-lnk`](https://github.com/EmuLnk/retroarch-lnk) |
| **Dolphin** | GameCube, Wii | [`dolphin-lnk`](https://github.com/EmuLnk/dolphin-lnk) |
| **PPSSPP** | PSP | [`ppsspp-lnk`](https://github.com/EmuLnk/ppsspp-lnk) |
| **melonDS** | NDS, DSi | [`melonds-lnk`](https://github.com/EmuLnk/melonDS-lnk) |
| **Azahar** | 3DS | [`azahar-lnk`](https://github.com/EmuLnk/azahar-lnk) |

> Each emulator fork adds the EmuLnk binary UDP protocol. Install the fork alongside EmuLnk to use it.

## Setup guide
Link to project: [Github.com](https://github.com/EmuLnk/emulnk)

List of supported games: [Github.com](https://github.com/EmuLnk/emulnk-repo) 