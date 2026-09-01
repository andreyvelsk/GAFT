---
title: "Crash Team Racing: CTR-DS"
description: "Native port of Crash Team Racing with a second screen companion display"
date: "2026-08-31 13:46"
slug: "ctr"
category: "game"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=z-IvchKvkf4"
---

source: [reddit](https://www.reddit.com/r/AynThor/comments/1w2mw0s/crash_team_racing_ps1_dual_screen/)

## Description
CTR-DS is a fork of [CTR Native](https://github.com/Simon358/ctr-native-android) — a native port of Crash Team Racing (PS1, 1999) built on the CTR-ModSDK decompilation — that adds a second screen, a 64-bit build, and a set of graphics and frame-rate options.

On a dual-screen handheld like the AYN Thor the HUD, the live map and a settings panel move to the bottom display, leaving the top one entirely to the game. The map draws driver portraits instead of coloured dots, because there is room for them.

The fork also adds:

- **64-bit build** — runs on devices with no 32-bit runtime at all, like modern phones
- **Frame caps above 30** — up to 120fps without the game running at four times speed
- **Internal resolution up to 8x** — geometry is rendered into a target of `240 × scale` lines
- **Widescreen**, HD replacement art for the 2D HUD, CHD disc images, on-screen touch controls, and a launcher for picking a disc and settings without editing a file

## Setup guide
See the project page: [github.com](https://github.com/igawa6/ctr-native-android)