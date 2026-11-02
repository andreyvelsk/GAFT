---
title: "Pokémon Platinum"
description: "A native port of Pokémon Platinum for the AYN Thor that runs the decompiled game directly and adds a Gear companion on the lower screen."
date: "2026-11-02 06:46"
slug: "pokemon-platinum"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/pokemon-platinum/preview.webp"
  - type: "image"
    url: "/content/pokemon-platinum/screenshot-2.webp"
  - type: "image"
    url: "/content/pokemon-platinum/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xle019/pokemon_platinum_recomp_with_features_for_dual/"
project_page: "https://github.com/SilasMayes/pokeplatinum-thor"
---

## Description

A native port of Pokémon Platinum for the AYN Thor and other Android devices, with PC builds for Windows and Linux. It runs the decompiled game directly (no emulator), puts the DS bottom screen on the Thor's lower panel, and fills the rest of that panel with the Gear: a companion screen with the battle menu, damage and turn order, your party, the area's wild Pokémon, a Pokédex, a map with items, the PC and the bosses' teams. It also supports Renegade Platinum and randomized games. The port is built on cybervisi0n's PC port and its libntr libraries, which are built on the pret decompilation; it is an independent fork.

## Features

- **Two screens on the Thor**: top screen on the main panel, touch screen on the lower one; widescreen on the overworld and in battles (experimental).
- **The Gear**: battle menu with damage ranges, KO marks and turn order; party, Day Care and eggs; wild Pokémon by area and time; Pokédex; map with item balls and hidden items; PC sorting; trainer card, level cap and the bosses' teams; shiny-hunt counters.
- **Renegade Platinum** and **randomized games** side by side with the original, each with its own saves.
- **Saves**: four slots, `.sav` import and export, autosave, and sync between devices through Syncthing or any synced folder.
- **Quality of life**: 60 FPS on the overworld, instant text, fast-forward, field moves without HMs, *Use another Repel?*, whole-party Exp. Share, game clock offset, Nuzlocke helper.
- **GBA slot** for Pal Park and dual-slot encounters from a GBA save, **link play** between two devices for trades and battles, and **texture packs**.
- **Cheats and a save editor**, off unless you open them.

## Requirements

- A dump of **Pokémon Platinum (USA)** (`.nds`, game code CPUE). The repository and its releases contain no ROM and no game assets.
- For Renegade Platinum: Drayano's patch, which you download yourself; the app applies it to your own ROM.
- Android 10+ on arm64 (the AYN Thor, phones, other handhelds) for the APK.
- Windows 10/11, 64-bit, or 64-bit Linux (glibc 2.38+) for the PC builds.

## Setup guide

Download the newest release from the [Releases page](https://github.com/SilasMayes/pokeplatinum-thor/releases/latest).

- Install the APK on Android 10+ arm64 (the AYN Thor, phones, other handhelds). Install the APK only from the repository's Releases page.
- On first launch, the game asks for your own dump of Pokémon Platinum (USA) and extracts what it needs from it.
- For Renegade Platinum, download Drayano's patch yourself; the app applies it to your own ROM.
- Windows: run `main.exe` from the `windows-x64.zip`. Linux: run `main` or the AppImage from the `linux-x64.tar.gz`.
