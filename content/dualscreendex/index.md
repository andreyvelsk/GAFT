---
title: "Pokémon + DualDex"
description: "A passive ROM- and memory-derived Pokédex companion for dual-screen Android handhelds"
date: "2026-08-13 04:02"
slug: "dualscreendex"
category: "companion"
media:
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.21/docs/images/dualdex-v1-pokedex-browse.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.21/docs/images/dualdex-v1-charizard-entry.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.21/docs/images/dualdex-v1-move-detail.png"
tags:
  - pokemon
  - pokedex
  - ayn-thor
  - retroarch
  - dual-screen
---

## Description
DualDex is a passive Pokédex companion for mainline-family Pokémon games running in RetroArch. Keep the game on the AYN Thor's upper display and DualDex on the lower display, or use its optional resizable overlay on a single screen.

DualDex parses the user's own GB, GBC, or GBA ROM into a local Pokédex and combines it with checksum-valid SaveRAM and supported read-only live-memory layouts. It does not use OCR, screenshots, cheats, memory writes, bundled Pokémon data, or per-ROM-hack profiles. Unsupported capabilities fail independently, so a ROM can retain its static Pokédex even when live battle or map support is unavailable.

## Features

- ROM-derived species, forms, types, moves, descriptions, sprites, encounters, and type mechanics
- Seen, caught, team, Area, rarity, and battle context where the selected ROM exposes validated structures
- Organic discovery mode that conceals information until it has been observed or captured
- Docked lower-screen mode and an optional floating 4:3 overlay
- Automatic RetroArch content detection with manual ROM selection as a fallback
- A Map First preview with zoom, pan, recentering, fog of war, Area Dex navigation, and Pokémon observation maps

## Setup guide

1. Download the signed [`v1.0.0-rc.21` prerelease](https://github.com/Darkaxt/DualScreenDex/releases/tag/v1.0.0-rc.21).
2. Install the production APK and open **RetroArch Setup** in DualDex.
3. Grant Android's **All files access** when prompted. DualDex uses it to discover sibling ROM folders, RetroArch SaveRAM, and the public RetroArch configuration.
4. Let the setup page enable RetroArch **Network Commands** and the recommended SaveRAM autosave setting, then restart RetroArch if DualDex reports that the configuration changed.
5. Start a supported Pokémon ROM in RetroArch. DualDex should activate the matching local catalog automatically; manual ROM selection remains available when automatic activation cannot resolve it.
6. Leave **Display mode** on **Docked** for the Thor's lower screen, or explicitly enable **Overlay** and grant **Display over other apps** for the floating companion.

## Compatibility and limitations

RC21 is a prerelease. Its ROM-derived Map First view is intentionally enabled only for the exact validated **Modern Emerald 3.5** ROM. Other ROMs keep the existing Pokédex and Area experience with map controls and assets safely omitted. Experimental THUMB ability-mechanics decoding is not included in this APK.

The parser has been exercised against a documented ROM-hack corpus, but support is capability-based rather than an all-or-nothing compatibility claim. See the current [ROM Hacks Compatibility report](https://github.com/Darkaxt/DualScreenDex/blob/v1.0.0-rc.21/reports/dualdex-rom-hacks-compatibility.md) and [Parser Compatibility report](https://github.com/Darkaxt/DualScreenDex/blob/v1.0.0-rc.21/reports/dualdex-parser-compatibility.md) before testing a particular hack.

The protected workflow signs production APKs. RC21's package, version, download hash, signer, and installation on a Thor were verified; hands-on gameplay validation remains part of prerelease testing.

Project and issue tracker: [github.com/Darkaxt/DualScreenDex](https://github.com/Darkaxt/DualScreenDex)

