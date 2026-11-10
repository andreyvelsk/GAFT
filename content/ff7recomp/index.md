---
title: "FF7Recomp"
description: "FINAL FANTASY VII (PC) recompiled to native ARM64 Android, with a dual-screen HUD on the AYN Thor and a 7th Heaven-style mod launcher."
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
source: "https://www.reddit.com/r/AynThor/comments/1xs4cn3/ff7recomp_final_fantasy_vii_pc_recompiled_to/"
project_page: "https://github.com/bhuiyah/ff7-recomp-android"
---

## Description

FF7Recomp takes the Steam release of FINAL FANTASY VII (1.02 US), statically recompiles it to native ARM64, and renders it with FFNx on Vulkan. It runs natively at 30/60 FPS (120 is experimental) in 16:9 widescreen, with controller support and save states. The APK contains no game code or data: you point it at your own Steam FF7 folder, and it recompiles your `ff7_en.exe` on the device once, which takes about 8 minutes on the AYN Thor. It is built for the AYN Thor's dual screen and is meant to run on other Android handhelds and phones.

## Features

- Runs natively at 30/60 FPS (120 is experimental), in 16:9 widescreen, with controller support and save states
- A 7th Heaven-style launcher: browse and install mods from the Qhimm and Sega catalogs, and set mod order and options
- On the Thor's bottom screen: party status, location, enemy HP in battle, and a touch deck (menu, save/load state, speed toggle, random battles on/off, battle enhancement)
- Boosters like the console re-releases (speed, no random battles, battle enhancement)
- English, French, German or Spanish, from the languages your Steam copy includes
- On-screen touch controls for single-screen devices with no controller; they hide when a controller is used
- Steam achievements on your own Steam account, plus a local RetroAchievements-format set (offline only)

## Setup guide

1. Download the APK from the latest release and install it (allow installing from your browser or file manager when Android asks).
2. Install FINAL FANTASY VII from Steam and put its install folder, `FINAL FANTASY VII Steam Edition` (the one with `ff7` inside), on the device: internal storage, an SD card or a USB drive.
3. Open FF7Recomp → **Game files** → **Find my FF7 folder…** and pick that folder.
4. The launcher copies the game files, then builds the game for your device. This happens once; on an AYN Thor it takes about 8 minutes and carries on in the background (a notification shows the progress). **Quiet build** halves the speed to keep the fan low.
5. Press **Play**.

No patch or older version is needed: FINAL FANTASY VII as Steam installs it today has everything FF7Recomp uses. Pick its main folder (not `ff7/workingdir`); the launcher checks the game files when you import and tells you if the folder is not the right one. Patched game files and the 2013 release are not supported yet.

## Known issues

- Only the Steam 1.02 US exe is supported; the Japanese edition is not supported yet
- Movies decode on the CPU (no hardware decoding yet): upscaled 30 FPS movie mods work on the Thor but run warmer
- The 120 FPS mode is experimental
- RetroAchievements are offline only, until the port is approved by RetroAchievements
- Steam playtime and cloud saves are not synced
