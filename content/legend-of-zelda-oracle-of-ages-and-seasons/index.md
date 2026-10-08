---
title: "The Legend of Zelda: Oracle of Ages and Seasons"
description: "Native reimplementation of the Game Boy Color Zelda Oracle games, playable on Android, macOS, Windows and Linux."
date: "2026-10-08 06:28"
slug: "legend-of-zelda-oracle-of-ages-and-seasons"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/legend-of-zelda-oracle-of-ages-and-seasons/preview.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x04bvt/legend_of_zelda_oracle_of_ages_and_seasons_now/)

## Description

Native reimplementation of The Legend of Zelda: Oracle of Ages and Oracle of Seasons in C. Every routine the games run is readable C: all of Ages, and 99% of Seasons (shared with Ages where the two games agree, hand-written where Seasons differs; the rest is generated C from the disassembly). The native build runs both games with no CPU emulator and no ROM code. Behaviour is checked against the original ROM by replaying full playthroughs and comparing every C routine with the original code it replaces. You need your own US ROMs; none are included.

Two apps, same game:
- `oracles-native`, the real port: no CPU emulator. On first launch it reads your ROM once, keeps the graphics, sound and data, zeroes the code bytes, and caches the result; later launches never touch the ROM again.
- `oracles`, the development app: runs the ROM on the emulator core with the C routines hooked in, so it can boot the real boot ROM, record playthroughs and fall back to the original code.

`oracles-native` is also available as an Android app (arm64, Android 8+).

## Setup guide

Download the latest [nightly release](https://github.com/kirby-letsgo/oracles-decomp/releases/latest) and install the Android APK (arm64, Android 8+) on your device. You need your own US ROMs for Oracle of Ages and Oracle of Seasons — none are included. On first launch the app opens the system file picker: choose the ROM (copy it to the phone's Downloads first). Add ROM in the launcher adds the other game. Touch controls sit under the game in portrait and at its sides in landscape. The back button pauses (and goes back in menus). Leaving the app saves the game and a Resume state, and coming back opens the pause menu.

## Features

- Launcher: Ages and Seasons side by side (each in its own title-screen colours), each game's three save files with name, hearts and essences, Resume (the state from the last quit), Load state, and the title screen.
- Settings (from the launcher or the pause menu): volume, screen filter (sharp, scanlines, LCD grid, CRT), scale (pixel or fill), Game Boy Color colours, fullscreen, controls (every button, Pause, Fast-forward, Swap and the item buttons remap for keyboard and gamepad), and optional quality-of-life toggles, all off by default: fast text, faster menus, quick swap (C swaps the A and B items) and 4 slots (A/S are two more item buttons).
- Widescreen mode: 256x144 (16:9 at the game's 144 lines) — the game's own 160 pixels in the middle, unchanged, and 48 pixels each side showing the rooms around it; DIM SIDES (on by default) draws the strips a little darker than the live room.
- Save sync across devices: CREATE ACCOUNT gives a 16-digit code, and ENTER CODE on another device joins it; synced are each game's save, save-state slots with their pictures and item buttons, and the shared settings.
- Save states: 4 slots with thumbnails; quitting saves a Resume state and returns to the launcher.
- Touch controls: D-pad (diagonals by touching between arms), A, B, Start, Select, Pause and fast-forward (hold), plus X and Y when 4 slots is on; they hide when a controller or keyboard is used and come back on the next touch.
- Desktop controls: arrow keys to move, X/Z for A/B, Return for Start, Backspace or Right Shift for Select, M to mute, F11 or Cmd+F for fullscreen, hold Tab (gamepad: right trigger) to fast-forward.

## Requirements

- Android 8+ (arm64) for the Android app; macOS (universal DMG), Windows (x64 zip) and Linux (x86_64 AppImage) builds are also available.
- Your own US ROMs — none are included:
  - `Legend of Zelda, The - Oracle of Ages (USA, Australia).gbc` (SHA1 `880374fb978b18af4aa529e2e32f7ffb4d7dd2f4`)
  - `Legend of Zelda, The - Oracle of Seasons (USA, Australia).gbc` (SHA1 `ba1268290fb2b1b70505d2d7b5825fc8a4816a4b`)
- The development app (`oracles`) also needs the Game Boy Color boot ROM.

See the project page: [github.com](https://github.com/kirby-letsgo/oracles-decomp)
