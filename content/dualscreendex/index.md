---
title: "Pokémon + DualDex"
description: "A passive ROM- and memory-derived Pokédex companion for dual-screen Android handhelds"
date: "2026-08-13 04:02"
slug: "dualscreendex"
category: "companion"
media:
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.23/docs/images/dualdex-v1-pokedex-browse.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.23/docs/images/dualdex-v1-charizard-entry.png"
  - type: "image"
    url: "https://raw.githubusercontent.com/Darkaxt/DualScreenDex/v1.0.0-rc.23/docs/images/dualdex-v1-move-detail.png"
tags:
  - pokemon
  - pokedex
  - ayn-thor
  - retroarch
  - dual-screen
---

## Description
DualDex is a passive Pokédex companion for mainline-family Pokémon games running in RetroArch. Keep the game on the AYN Thor's upper display and DualDex on the lower display, or use its optional resizable overlay on a single screen.

DualDex parses the user's own GB, GBC, or GBA ROM into a local Pokédex and combines it with checksum-valid SaveRAM and supported read-only live-memory layouts. It does not use OCR, screenshots, cheats, memory writes, bundled Pokémon data, or per-ROM-hack profiles. Unsupported capabilities fail independently, so a ROM can retain its static Pokédex even when a live-memory feature is unavailable.

## Features

- ROM-derived species, forms, types, moves, descriptions, sprites, encounters, and type mechanics
- Seen, caught, team, Area, rarity, and battle context where the selected ROM exposes validated structures
- Live Gen III party detection where the ROM exposes a structurally validated party layout, without waiting for an in-game save
- Organic discovery mode that conceals information until it has been observed or captured
- An Area roster that puts known Pokémon first and masks unseen local encounters without revealing their identities
- Docked lower-screen mode and an optional floating 4:3 overlay
- Automatic RetroArch content detection with manual ROM selection as a fallback

## Setup guide

1. Download the signed [`v1.0.0-rc.23` prerelease](https://github.com/Darkaxt/DualScreenDex/releases/tag/v1.0.0-rc.23).
2. Install the production APK and open **RetroArch Setup** in DualDex.
3. Grant Android's **All files access** when prompted. DualDex uses it to discover sibling ROM folders, RetroArch SaveRAM, and the public RetroArch configuration.
4. Let the setup page enable RetroArch **Network Commands** and the recommended SaveRAM autosave setting, then restart RetroArch if DualDex reports that the configuration changed.
5. Start a supported Pokémon ROM in RetroArch. DualDex should activate the matching local catalog automatically; manual ROM selection remains available when automatic activation cannot resolve it.
6. Leave **Display mode** on **Docked** for the Thor's lower screen, or explicitly enable **Overlay** and grant **Display over other apps** for the floating companion.

## Compatibility and limitations

RC23 is a prerelease. It keeps the stable RC19 companion layout and adds structurally resolved live Gen III party reading, so a newly received starter can appear in Team before the player performs an in-game save. The Area filter retains the newer Organic-mode encounter visibility: known local Pokémon are listed first, while unseen parsed encounters appear as disabled silhouettes with masked names. Experimental world maps and THUMB ability-mechanics decoding are not included in this APK.

The parser has been exercised against a documented ROM-hack corpus, but support is capability-based rather than an all-or-nothing compatibility claim. See the current [ROM Hacks Compatibility report](https://github.com/Darkaxt/DualScreenDex/blob/v1.0.0-rc.23/reports/dualdex-rom-hacks-compatibility.md) and [Parser Compatibility report](https://github.com/Darkaxt/DualScreenDex/blob/v1.0.0-rc.23/reports/dualdex-parser-compatibility.md) before testing a particular hack.

The protected workflow signs production APKs. RC23's package, version, download hash, signer, and installation on a Thor are verified before the registry entry is finalized; hands-on gameplay validation remains part of prerelease testing.

Project and issue tracker: [github.com/Darkaxt/DualScreenDex](https://github.com/Darkaxt/DualScreenDex)
