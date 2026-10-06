---
title: "Phoenix Emu"
description: "A free, open-source NES and SNES emulator for Android with RetroAchievements, save states, rewind and customizable on-screen controls."
date: "2026-10-06 06:27"
slug: "phoenix-emu"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/phoenix-emu/preview.webp"
  - type: "image"
    url: "/content/phoenix-emu/screenshot-2.webp"
  - type: "image"
    url: "/content/phoenix-emu/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wyd078/i_built_a_free_nessnes_emulator_for_android_with/)

## Description

Phoenix Emu is a free NES and SNES emulator for Android, built for handhelds and gamepads. It runs the Mesen (NES) and Snes9x (SNES) cores through libretro in a dedicated process, with low-latency audio driven by the audio clock. The app includes a console-style library with cover-flow and grid views, a themeable glass UI, save states with slots, rewind, fast-forward, customizable on-screen controls and RetroAchievements support. It is free, GPLv3-licensed, contains no ads and ships no ROMs.

## Setup guide

- Download the latest APK from the [releases page](https://github.com/dfdx047/PhoenixEmu/releases/latest) — the release notes include the APK and its SHA-256 checksum.
- Install the APK on your Android device.
- Add your own ROM folder from the library screen; the app does not ship any games.
- Optionally sign in with your RetroAchievements account to enable achievements.
- Android 12 or newer is recommended for the live-blur glass UI; older devices get a lighter fallback.

## Features

- NES (Mesen) and SNES (Snes9x) emulation through libretro cores, running in a dedicated process so the UI never competes with the emulation loop
- Low-latency audio through Oboe; the emulation loop is driven by the audio clock
- Save states with 4 slots per game and a thumbnail for each slot
- Auto-save on exit and auto-load on start, each switchable
- Fast-forward and rewind (a ring buffer of recent states), mapped by default to R2 and L2
- Shortcut engine: save/load state, previous/next slot, fast-forward, rewind, menu and reset can be bound to any button, with an optional hotkey button for combos
- Aspect-ratio and video-filter options
- Library that scans chosen folders and builds automatically, with a cover-flow carousel and a grid view, plus search, system filter (NES / SNES), recents, favorites and sorting
- Cover art and metadata fetched online, region badges (USA / EUR / JPN) and ROM identification by CRC32
- Fully navigable with a gamepad: D-pad or stick to move, A to play, Y for options, L1 / R1 to switch sections
- Glass UI with live blur (Android 12+) and a lighter fallback for older or weaker devices, or a solid finish
- Themes: Material You, NES (US), Famicom (JP), SNES (US), Super Famicom (JP) and an AMOLED option
- Custom wallpaper with adjustable blur and opacity, plus a "reduce effects" mode
- Portuguese and English, with a help balloon on every setting
- Physical gamepad remapping
- On-screen controller editor: drag every button, adjust opacity and size
- Controller skins: three built-in styles plus community skins, importable as .zip or browsable in the in-app Download skins library
- Auto-hide of on-screen controls when a gamepad is used
- RetroAchievements: sign in with your account, live unlocks while you play (NES and SNES) with a pop-up and sound, pop-up options (on/off, sound, vibration, volume, duration, six screen positions) and a dedicated screen with progress
- Hardcore mode: global default, per console or per game; it blocks save states, rewind and autoload

## Known issues

- The emulator is in alpha, so bugs are expected
- Portrait mode has not been tested yet; development and testing focus on landscape handhelds with gamepads (mainly the AYN Odin 3)

See the project page: [github.com](https://github.com/dfdx047/PhoenixEmu)
