---
title: "OoT3D Save Editor"
description: "A browser-based save file editor for The Legend of Zelda: Ocarina of Time 3D, built for the Azahar emulator on the AYN Thor."
date: "2026-10-12 06:33"
slug: "oot3d-save-editor"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x3pouy/ocarina_of_time_3d_save_editor_is_now_available/)

## Description

A save file editor for The Legend of Zelda: Ocarina of Time 3D, built for the Azahar emulator (and any other setup that gives you access to a raw save file). It runs entirely in your browser — nothing you load is ever uploaded anywhere. The editor uses the actual checksum algorithm (CRC-16/ARC over the full save) and recalculates it correctly on every save, so edited files load in-game.

## Features

- Edit rupees, hearts, magic, ammo, small keys, and the file name.
- Full inventory editor: all 24 item slots (including bottle contents and trade items), equipment, and every capacity upgrade.
- Gold Skulltulas, individually — not just a total count. Each of the 22 in-game regions gets its own grid of tokens, sized to that region's real count.
- Dungeon Completion panel — one click to fully clear a dungeon: reward, map, compass, boss key, every Skulltula in it, all chests, and the boss arena.
- Story Progress panel — all 145 story/event flags from the game's own decompiled source, so you can skip cutscenes you've already seen or jump ahead in the story.
- A real, verified checksum (CRC-16/ARC over the full save) recalculated correctly on every save, so edited files load in-game.

## Known issues

The save format isn't officially documented by Nintendo; everything here is reverse-engineered from a few different sources with different confidence levels:
- Checksum: verified directly against real save files. High confidence.
- Core fields (health, rupees, items, equipment, keys): sourced from a long-standing community save-format writeup, cross-checked against three real save files. High confidence.
- Story/event flags: sourced from the actual decompiled N64/3DS game source. About 40 of the 145 flags have a name and purpose confirmed directly in the source code's own comments; the rest are tagged GUESS.
- Unverified details: exactly which bit maps to which named Gold Skulltula within a region (only the per-region total is confirmed), and the exact bit order for dungeon boss-key/compass/map flags (carried over from the N64 version's layout, not independently confirmed for 3DS).

## Setup guide

Download the [latest release](https://github.com/theanimater23/Oot3DS-Save-Editor-For-Azahar/releases/latest) and open it in your browser. Load a raw save file from the Azahar emulator (or any setup that gives you access to a raw save file), make your edits, and save. The editor recalculates the checksum on every save, so edited files load in-game. Nothing you load is ever uploaded anywhere.

See the project page: [github.com](https://github.com/theanimater23/Oot3DS-Save-Editor-For-Azahar)
