---
title: "Dave the Diver"
description: "A second-screen companion for Dave the Diver on Eden Duo, with live dive maps, cargo, missions, sushi-bar tools and phone apps read from your own game files."
date: "2026-10-29 06:58"
slug: "eden-duo"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/eden-duo/preview.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-2.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-3.webp"
  - type: "video"
    url: "https://www.youtube.com/watch?v=M5MKBQ-x8MU"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1xi1h1k/dave_the_diver_ds_mod_for_eden_duo_is_out_now/)

## Description

The Dave the Diver companion turns the second screen of a dual-screen Android handheld into a live, touchable panel for the game, so the top screen stays on the sea. Everything is read from your own game files and saves. The page auto-switches depending on where you are — dive, sushi bar or boat — and the bottom screen tracks your current gold, date and weather. A Continue button is added to the title menu. It supports game version 1.0.6.1267 and is installed from the game's Add-ons menu in Eden Duo as a .dsmod.zip package.

## Features

Dive page:
- Live map of your dive site with markers for chests, O2 tanks, weapons, ammo, pinned fish and missions with items to collect (the map is built while you dive)
- Tap the map to zoom it 3x
- Live stats for your O2 gauge, cargo weight and depth limits
- Cargo tab shows what you are carrying and lets you discard items without opening the top-screen menu
- Missions tab shows all current missions and lets you pin ones that collect items
- Sea Village map with Bei and credits shown on the bottom screen
- Item pickup popups and completed-mission notifications on the bottom screen
- Optional HUD: hide the top-screen HUD while diving

Sushi page:
- Recipes with price, amount of each you have, sort option, pin-to-dive to put a fish marker on the map, and add-to-menu without opening the in-game menu
- Ingredients showing your current storage with count and rank; tap an item to see which recipes use it
- Menu editing is locked until the sushi bar tutorial is completed to prevent a soft lock

Phone apps:
- Weapons shop showing blueprints and progress, with tracking and crafting
- iDiver showing gear levels, upgrade costs and one-tap upgrades
- Call to call your buddies
- Mail and EcoWatcher showing your mail and research items, with pinning so you can see what you need during a dive
- Basic calculator
- Back and close buttons

## Requirements

- Dave the Diver game version 1.0.6.1267 (title ID 010097F018538000)
- Eden Duo 1.1.0 or newer
- The companion checks the running game build before it loads; on any other version it does not load and shows a notice
- Use NCE in Eden instead of JIT — JIT caused a crash for testers
- Companion packages contain no game assets; everything shown is read at runtime from your own game files and saves

## Setup guide

- Install Eden Duo, at least the version required in the companion's release notes
- Update Dave the Diver to version 1.0.6.1267
- Download the Dave the Diver .dsmod.zip from the [latest release](https://github.com/igawa6/eden-duo-companions/releases/latest) — do not rename it, as the file name carries the title ID, name and version
- In Eden Duo, long-press the game, open Add-ons and tap Install. In the Content type dialog choose Dual screen mods, tap OK, then select the file. It appears in the Add-ons list
- Launch the game; the companion appears on the second screen once gameplay starts
- Use NCE in Eden instead of JIT

See the project page: [github.com](https://github.com/igawa6/eden-duo-companions)
