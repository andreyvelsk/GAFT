---
title: "Terraria Dual Screen Companion"
description: "A live, touch-controlled second-screen companion for Terraria on the AYN Thor, built from the real game state."
date: "2026-11-13 13:02"
slug: "terraria-dual-screen-companion"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/terraria-dual-screen-companion/preview.webp"
  - type: "image"
    url: "/content/terraria-dual-screen-companion/screenshot-2.webp"
  - type: "image"
    url: "/content/terraria-dual-screen-companion/screenshot-3.webp"
  - type: "video"
    url: "https://youtube.com/shorts/JQWyCvnienA?si=8dIx0ru2Xu9_fjn2"
source: "https://www.reddit.com/r/AynThor/comments/1y28qsd/you_asked_for_it_terraria_dual_screen_companion/"
project_page: "https://github.com/Skifchara/terraria-dualscreen-companion"
---

## Description

Terraria Dual Screen Companion is a fully functional companion for the native Android version of Terraria on the AYN Thor. The game runs on the top screen, while the bottom screen becomes a dedicated, interactive interface with real-time inventory management, equipment and accessories, crafting, chests and storage management, an interactive world map with zoom and NPC markers, hotbar and controller integration, health, mana, buffs and character information, touch gestures, animations and haptic feedback, dynamic backgrounds that react to your biome, weather and time of day, and an option to hide the original HUD for a cleaner gameplay experience.

This is not screen mirroring, OCR or simulated touch input. The companion communicates with the actual game state, so your actions on the bottom screen really affect Terraria. It works with a legitimate Android copy of Terraria through TL Pro — no cracked APKs, DRM bypasses or modified game installations required. The project is free and open source under the MIT License and is designed and tested for the AYN Thor in single-player.

Version 1.0.8 adds a full Bestiary interface with filters and search, NPC conversation windows with real in-game actions, search across inventory, crafting recipes and the Bestiary, an on-screen keyboard, improved map markers, and an installer that automates most of the setup.

## Features

- Inventory — all slots, coins, ammo, trash slot and sort; drag to move, swap or stack, double-tap a stack to split it; search your inventory directly from the second screen.
- Item window — big sprite, rarity colour, stats, the game's own tooltip, reforge percentages and context buttons (Use, Equip, Favourite, Split, Drop, Delete, Put in chest, Take).
- Edge gestures while dragging — top: drop · bottom: use / equip / summon · right: trash · left: favourite.
- Equipment, crafting, chests and banks, hotbar, health and mana bars (tap to flip to hearts and stars), buffs and debuffs, and info accessories (watch, depth meter, compass, weather radio); search crafting recipes from the second screen.
- People — team and PvP, town NPCs with a room check / move-in, armour sets (loadouts) and total defence.
- NPC interactions — conversation windows with real in-game actions such as Shop, Help, Heal, Happiness and Quests.
- Chat and emotes — the game's chat log with an on-screen keyboard (EN / RU, slash commands) and all 151 emote bubbles, all accessible directly from the bottom screen.
- Nearby — talk to and trade with any town NPC close to you, and look up recipes with the Guide on the second screen.
- Bestiary — the game's own entries with kill counts, stats, drops and habitats, unlocked the way the game unlocks them, with filters and search.
- Pause, block names on long-press on the map, and info accessory readings with a full list.
- Banners — claim earned banners from the Craft tab; buffs and pets can be tapped, and accessory / armour / wings visibility toggled.
- Map — smooth panning and pinch zoom, town NPC heads, boss icons with health, and markers for spawn points, beds and your last death.
- Hide HUD — removes the game's own HUD from the top screen; the controller then drives the companion (L1 / R1 hotbar, Y cycles the tabs).
- Backgrounds from the game itself — biome parallax layers, cave wall textures, day / night tint, clouds, rain and snow, lightning flashes, damage / heal / mana edge flashes and the game's interface sounds.
- Visual polish — improved sprites, corrected colours, larger buttons and a more consistent Terraria-style interface.
- Bug fixes and improved communication between the game and the companion.
- English, Russian, Spanish and Polish.

## Requirements

- AYN Thor dual-screen Android device (designed and tested for it).
- A legitimate Android copy of Terraria (Google Play) and TL Pro.
- Single-player only; not for online servers.
- A PC is needed for the initial setup; the installer automates most of the steps.
- Sprites, fonts and backgrounds are decoded on a PC from your own installed copy of Terraria; no game assets are included in the repository or releases.

## Setup guide

- Install Terraria (Google Play) and TL Pro. Back up your saves. Turn on USB debugging on the device and plug it into a PC.
- Download the installer zip from the Releases page, unpack it and run Install.bat (Windows) or python3 tools/install.py (macOS / Linux). It installs the app (signed with a development key), copies the mod pack to the device and decodes the sprites from your own installed Terraria.
- In TL Pro, import the mod pack and enable it. Restart the game through TL Pro after every mod update.
- Start a single-player world and open Terraduo Companion — it opens on the bottom screen by itself.
- Updating from v1.0.7 or older: run the new installer and re-import the updated TL Pro mod pack (v11), then restart Terraria through TL Pro.
- Only want the app? Install the APK directly; without the sprite step it draws plain frames.
- The latest release is still marked as a pre-release.
