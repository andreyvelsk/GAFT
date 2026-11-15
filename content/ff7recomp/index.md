---
title: "FF7Recomp"
description: "FINAL FANTASY VII (Steam) recompiled to native ARM64 Android, with 7th Heaven mods, 120 FPS and dual-screen support on the AYN Thor."
date: "2026-11-10 06:58"
slug: "ff7recomp"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/ff7recomp/preview.webp"
  - type: "image"
    url: "/content/ff7recomp/screenshot-2.webp"
  - type: "image"
    url: "/content/ff7recomp/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xwfi0s/ff7recomp_10_final_fantasy_vii_steam_running/"
project_page: "https://github.com/bhuiyah/ff7-recomp-android"
---

## Description

FF7Recomp takes the Steam release of FINAL FANTASY VII (1.02 US), statically recompiles it to native ARM64, and renders it with FFNx on Vulkan or OpenGL ES. It runs natively at 30/60/120 FPS in 16:9 widescreen, with controller support, save states, and a 7th Heaven-style mod launcher. The APK contains no game code or data: you point it at your own Steam FF7 folder, and it recompiles your `ff7_en.exe` on the device once, which takes about 8 minutes on the AYN Thor. It is built for the AYN Thor's dual screen and is meant to run on other Android handhelds and phones.

## Features

- Runs natively at 30, 60 or 120 FPS (120 is experimental), in 16:9 widescreen, with a resolution setting up to 4x, portrait mode for phones, and a CRT filter
- A 7th Heaven-style launcher: browse and install mods from the Qhimm and Sega catalogs, set mod order and options, and support hext code patches; tested with NinoStyle, Cosmos Gaia, Cosmos Limit Break, Echo-S, Finishing Touch, ChaOS and more
- On the Thor's bottom screen: party status, location, enemy HP in battle, a world map showing where you are, a walkthrough guide, and a touch deck (menu, save/load state, speed toggle, random battles on/off, battle enhancement); you can swap the screens or leave the second one to other apps
- Full controller support with button mapping saved between sessions, analog walk and run, physical keyboard support, hold confirm to repeat, and rumble
- On-screen touch controls whose size and layout you can edit; they hide when a controller is used
- Save states: 10 slots, each named after the place it was saved, plus a quick resume when you start the game
- Import your PC saves or PlayStation memory cards (DuckStation, ePSXe, RetroArch, DexDrive, PSP)
- Game boosters like the console re-releases: 2x/3x speed, no random battles, battle enhancement, EXP/AP/Gil boosters, and save anywhere
- English, French, German or Spanish, from the languages your Steam copy includes
- Steam achievements on your own Steam account (sign in by scanning a QR code), plus a local RetroAchievements-format set (offline only)
- Keep the game files and mods on an SD card
- In-app updates from GitHub releases, and a Report a problem button that collects logs into one zip

## Setup guide

1. Download the APK from the latest release and install it (allow installing from your browser or file manager when Android asks).
2. Install FINAL FANTASY VII from Steam and put its install folder, `FINAL FANTASY VII Steam Edition` (the one with `ff7` inside), on the device: internal storage, an SD card or a USB drive.
3. Open FF7Recomp → **Game files** → **Find my FF7 folder…** and pick that folder.
4. The launcher copies the game files, then builds the game for your device. This happens once; on an AYN Thor it takes about 8 minutes and carries on in the background (a notification shows the progress). **Quiet build** halves the speed to keep the fan low.
5. Press **Play**.

No patch or older version is needed: FINAL FANTASY VII as Steam installs it today has everything FF7Recomp uses. Pick its main folder (not `ff7/workingdir`); the launcher checks the game files when you import and tells you if the folder is not the right one. Patched game files are not supported. GOG should work but hasn't been tested. Needs Android 10 or newer on a 64-bit ARM device.

## Known issues

- Only the Steam 1.02 US exe is supported; the Japanese edition is not supported yet
- Movies decode on the CPU (no hardware decoding yet): upscaled 30 FPS movie mods work on the Thor but run warmer
- The 120 FPS mode is experimental; it runs fields at 120, while the world map and battles stay at 60
- Save states can still crash or show wrong textures after loading in some places
- Some rendering problems in the Temple of the Ancients
- Some Android 10 devices can't install the APK
- RetroAchievements are offline only, until the port is approved by RetroAchievements
- Steam playtime and cloud saves are not synced
