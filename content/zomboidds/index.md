---
title: "ZomboidDS"
description: "Dual-screen companion app for Project Zomboid (Build 42) via Zomdroid: the game on the top screen, inventory, crafting, status and vehicle controls on the Thor's bottom screen."
date: "2026-09-26 09:47"
slug: "zomboidds"
category: "game"
media:
  - type: "image"
    url: "/content/zomboidds/preview.webp"
  - type: "image"
    url: "/content/zomboidds/screenshot-2.webp"
  - type: "image"
    url: "/content/zomboidds/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wptab9/zomboidds_dualscreen_mod_for_pz_on_zomdroid/)

## Description

ZomboidDS is a Nintendo DS-style dual-screen setup for Project Zomboid on handhelds like the AYN Thor. The game itself runs on the top screen through [Zomdroid](https://github.com/udarmolota/zomdroid), while the **ZomboidDS Companion** app runs on the bottom screen and renders everything in the game's own art — icons are read from the player's own installation on the device, no game files are shipped.

The bottom screen has five panels:

- **Inventory** — your bags and every container around you; move items with a tap and use them through the game's own item menu (read, eat, apply, craft, ...).
- **Deck** — the game's speed buttons and context actions for where you stand (open, sit, drink, ...).
- **Status** — moodles, the body with its injuries, and the game's treatments.
- **Craft** — recipes you can make with what's in reach, their requirements, and crafting.
- **Vehicle** — speed, fuel and engine while driving.

Because everything is driven by the game's own data, most mods should stay compatible (untested by the author). The mod's bridge listens only on `127.0.0.1` (loopback), so nothing on the network can reach it; the app has no analytics and no accounts. On the Thor, the companion app launches on the bottom screen (display 4).

ZomboidDS is an unofficial mod, not affiliated with or endorsed by The Indie Stone. It requires your own copy of **Project Zomboid (Build 42)** running in Zomdroid — no game data is included. It builds on [ZombieBuddy](https://github.com/zed-0xff/ZombieBuddy) (MIT) as the Java mod loader. Licensed under GPLv3.

## Setup guide

1. Install [Zomdroid](https://github.com/udarmolota/zomdroid) and set up your own copy of Project Zomboid (Build 42) in it.
2. Download `ZomboidDS-<version>.apk` from the [latest release](https://github.com/Space001000/ZomboidDS/releases/latest) and install it.
3. Follow the in-app setup checklist: it installs the mod for you (through Android's folder picker, no storage permission needed), downloads ZombieBuddy from its GitHub releases (a pinned version verified against built-in SHA-256 hashes), and checks the prerequisites. It also notifies you when a new version is available.
4. Launch the game in Zomdroid on the top screen and the companion app on the bottom screen.

See the project page: [github.com](https://github.com/Space001000/ZomboidDS)
