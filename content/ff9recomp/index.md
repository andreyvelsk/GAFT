---
title: "FF9Recomp"
description: "FINAL FANTASY IX (PC) running natively on Android with Memoria and Moguri Mod, built for the AYN Thor's dual screens."
date: "2026-11-17 16:56"
slug: "ff9recomp"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/ff9recomp/preview.webp"
  - type: "image"
    url: "/content/ff9recomp/screenshot-2.webp"
  - type: "image"
    url: "/content/ff9recomp/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xxd7xo/ff9recomp_final_fantasy_ix_running_natively_on/"
project_page: "https://github.com/bhuiyah/ff9-recomp-android"
---

## Description

FF9Recomp runs the PC release of FINAL FANTASY IX natively on ARM64 Android — no emulation, no Wine/FEX, and no Unity. The game's own .NET assemblies run on .NET 8 Mono, on top of a small engine written for this project (rendering, assets, audio, movies, input). Memoria's own code runs as it does on PC, so its features and settings come along, and Moguri Mod plus the rest of Memoria's mod catalog work. The APK contains nothing from the game: you bring your own PC copy (Steam or GOG, with Memoria installed) or download it from your Steam account inside the app. It is built for the AYN Thor's dual screens and meant to run on other Android handhelds and phones. Not affiliated with or endorsed by Square Enix; you need your own copy of FINAL FANTASY IX for PC.

## Setup guide

- Download the APK from the [latest release](https://github.com/bhuiyah/ff9-recomp-android/releases/latest) and install it (allow installing from your browser or file manager when Android asks).
- Get your game onto the device, one of two ways:
  - **Import game folder** (Game files): pick your FINAL FANTASY IX folder, the one with `FF9_Launcher.exe`, `StreamingAssets` and `x64`. Install Memoria in it on the PC first (and Moguri Mod if you want it). The folder is copied into the app once.
  - **Download from Steam** (Game files): sign in by scanning a QR code with the Steam app (you never type your Steam password here). The app downloads the game your account owns, checks every file against Steam's, then installs Memoria itself. A stopped download goes on where it was, and **Repair from Steam** fetches only missing or damaged files.
- Press **Play** (or Start).
- Short on space? With an SD card in the device, **Game files** → **Storage** moves your game, mods and saves to it, and back.
- Bring your PC saves: **Game files** → **Import a PC save** and pick `SavedData_ww.dat` from the PC (`AppData/LocalLow/SquareEnix/FINAL FANTASY IX/Steam/EncryptedSavedData`). It is the same file the game uses here, so all your save slots come across; the saves already on the device are kept as a backup first.

## Features

- 60 FPS fields and battles (Memoria's frame interpolation), the original 30/15, or an experimental 120; 16:9 widescreen.
- A launcher with Memoria's mod catalog built in: search, categories, one-tap install and update, a download queue, and load order. The 2K and 4K FMV packs play at full resolution.
- AYN Thor dual screen, in FF9's grey window style:
  - The party with portraits, HP/MP, ATB and Trance, plus location, playtime, gil, AP progress, items, key items and counters (steals, frogs, dragons, chocographs and cards).
  - In battle, each enemy's level, HP, weaknesses, absorbs, immunities, halved elements, what's left to steal and drops.
  - On the world map, the whole map with where you, your chocobo and the airship are.
  - The screen fades to shade while the game has taken control (cutscenes, talks) and lights up again when you have it back.
  - A touch deck: Menu, Save state, Load state, Speed, Battles and Battle+.
- Save states (Select+R1 in game, 10 slots), the game's boosters (High Speed, Battle Assistance, No Encounters, 9999 damage) and fast dialogue.
- A CRT filter (scanlines and a phosphor mask), controller support with analog walk and run, and on-screen touch controls with an arrangeable layout.
- Pixel Guide on the bottom screen, opened from the book at the bottom screen's top right.
- Steam achievements via QR sign-in, and Steam Cloud saves with Upload/Download from the game's title screen.
- **Report a problem** builds one zip with the game's logs, how it last closed, device and screen info, settings and mod list — it never includes your game files, mods or Steam sign-in.

## Known issues

- M4 (playable) is still in progress: the opening, Alexandria, fields, battles and the world map play on the Thor, but not every area has been played through.
- The battle results screen is clipped at the left in widescreen.
- Download from Steam and Steam achievements have not been tested with a Steam copy of the game yet; importing a GOG copy works.
- Steam Cloud saves were tested both ways with the PC version's Cloud save; a first Upload to an account with no Cloud save yet, and the Japanese game's Cloud file, have not been tested.
- Movies decode on the CPU, on several cores. The 2K video pack plays at full speed on the Thor; the 4K pack has not been timed.
- The 120 FPS mode is experimental and runs warmer.
- Only tested on the AYN Thor (Snapdragon 8 Gen 2). Other GPUs (Mali, PowerVR) should work, and textures larger than a GPU allows are shrunk, but that hasn't been tried on one.
