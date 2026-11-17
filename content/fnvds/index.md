---
title: "FNVDS"
description: "An interactive Pip-Boy style companion that runs on the Thor's lower screen while Fallout: New Vegas plays on the top display."
date: "2026-11-17 16:56"
slug: "fnvds"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/fnvds/preview.webp"
  - type: "image"
    url: "/content/fnvds/screenshot-2.webp"
  - type: "image"
    url: "/content/fnvds/screenshot-3.webp"
  - type: "video"
    url: "https://youtu.be/81zquuI1nRc?si=0kUZJPBHwxbnybuA"
source: "https://www.reddit.com/r/AynThor/comments/1xxll89/fnvds_fallout_new_vegas_dual_screen_companion_app/"
project_page: "https://github.com/EdJones01/FNVDS"
---

## Description

FNVDS (Fallout: New Vegas Dual Screen) is an interactive companion for playing Fallout: New Vegas on the AYN Thor. The game runs on the upper display and the companion app runs on the lower display, turning the bottom screen into an interactive Pip-Boy style device. It works with both the Steam and GOG versions of Fallout: New Vegas and requires xNVSE. The supported device is the AYN Thor, running the game in GameNative.

## Setup guide

Download and install the [latest release](https://github.com/EdJones01/FNVDS/releases/latest), then follow these steps:

- Install xNVSE in the game's environment.
- Extract the release ZIP and copy its `Data` folder into the New Vegas installation so the plugin is at `Data/NVSE/Plugins/FNVDS.dll`.
- Install `FNVDS.apk` on the Thor.
- Launch New Vegas through xNVSE and open FNVDS on the lower display.
- When updating, close the game and replace both the APK and DLL with the matching release.

## Features

- Stats: view health, AP, limb condition, active effects, level and XP; use healing items, treat crippled limbs and manage Hardcore needs; browse S.P.E.C.I.A.L., skills, perk descriptions, karma and faction reputation.
- Items: browse categorised inventory with item stats, condition and equipped indicators; equip gear, use aid, switch compatible ammo, assign hotkeys and install weapon mods; drop individual items or stacks and sort inventory by name, weight or value.
- Maps: explore live world and local maps with player, quest, custom and location markers; pan, zoom, search locations, save favourites and fast travel; place or remove custom markers.
- Data: track quests and view their objectives and map markers; read notes and play or stop voice recordings through the game; change radio stations and browse general statistics and challenges.
- Dialogue: select responses, view skill checks and skip spoken lines.
- V.A.T.S.: choose targets and body parts, view hit chances and predicted damage, and queue or cancel attacks.
- Trade monitor: view your proposed trade, item values and caps.
- Looting summary: see items taken or deposited and their total values during each session.

## Requirements

- Steam or GOG Fallout: New Vegas, installed and running in GameNative; the plugin targets the 32-bit 1.4.0.525 game runtime.
- xNVSE, installed and working in the same game environment.
- An Android 8.0+ device; the supported device is the AYN Thor.
- Matching versions of FNVDS.apk and FNVDS.dll.
