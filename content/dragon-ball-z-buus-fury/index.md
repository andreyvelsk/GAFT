---
title: "Dragon Ball Z: Buu's Fury"
description: "A native Android ARM64 port of Dragon Ball Z: Buu's Fury with dual-screen gameplay and a touchscreen companion interface for the AYN Thor."
date: "2026-11-14 07:16"
slug: "dragon-ball-z-buus-fury"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/dragon-ball-z-buus-fury/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xv2hif/dragon_ball_z_legacy_trilogy_for_android_buus/"
project_page: "https://github.com/erpiopio/BuusFury-Thor"
---

## Description

Dragon Ball Z: Buu's Fury is an unofficial Android adaptation of the classic Game Boy Advance RPG, built for the AYN Thor. Instead of conventional GBA emulation, the original game code is statically recompiled for native ARM64 execution.

The port introduces native dual-screen functionality: gameplay runs on the upper display while a persistent touchscreen companion interface shows additional game information on the lower display. Adaptive widescreen reveals extra game-world content without simply stretching the original GBA image.

The lower-screen companion interface provides six dedicated sections:

- Character Status
- Inventory
- Equipment
- Skills
- Journal
- Scouter-inspired Map

Automatic English and Spanish interface localization is based on the recognized ROM identity. The application does not include copyrighted ROMs or GBA BIOS files — you must provide your own.

## Setup guide

1. Download the Android APK from the latest GitHub release.
2. Install the APK on your compatible Android device.
3. Launch the application.
4. Select and import your own supported Buu's Fury ROM.
5. Import your authentic GBA BIOS.
6. Allow the installer to validate both files.
7. Start the game.

The installer validates the ROM identity before accepting an import. Failed ROM validation preserves the previously installed ROM. Back up your save files before switching ROM variants.

## Features

- Native Android ARM64 integration using GBARecomp.
- Real dual-screen support through Android Presentation.
- Adaptive widescreen gameplay.
- Persistent touchscreen companion interface.
- Live character statistics and inventory information.
- Equipment and skill information.
- Quest journal.
- Scouter-inspired map interface.
- Automatic English and Spanish interface localization based on ROM identity.
- Integrated ROM and GBA BIOS importer.
- Physical gamepad support.
- Lightweight APK — approximately 18 MB.

## Supported games

Only specifically reviewed ROM identities are accepted. The installer verifies the exact ROM hash and file size; unknown or modified ROMs are rejected.

- USA GoodTools / RetroAchievements — English — 8,388,608 bytes
- USA No-Intro — English — 8,388,608 bytes
- Reviewed Spanish translation — Spanish — 10,514,228 bytes

An authentic 16 KiB Game Boy Advance BIOS is required. ROMs and BIOS files are not included.
