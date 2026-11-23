---
title: "ShulkDS"
description: "A dual-screen Minecraft Java client for Android handhelds like the AYN Thor and Retroid Pocket Duo."
date: "2026-11-23 19:08"
slug: "minecraft"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/minecraft/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1y31owi/shulkds_minecraft_java_for_dualscreen_android/"
project_page: "https://github.com/NaiSenshin/ShulkDS"
---

## Description

ShulkDS is a dual-screen Android fork of Horizon and Starling, a Rust rewrite of Minecraft: Java Edition 26.3. It is built for dual-screen Android handhelds like the Retroid Pocket Duo and (somewhat) the AYN Thor, inspired by the 3DS and Wii U editions of Minecraft.

It is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft. ShulkDS does not include any Minecraft .jar files, assets, or game data. On first launch, sign in with a Microsoft account that owns Minecraft: Java Edition and the app will download and set up 26.3 on your device.

Gameplay runs on the top screen while a touchscreen dashboard on the bottom keeps your map, inventory, and settings open.

## Features

- Dual-screen gameplay: clean 3D view on the top screen while your map, inventory, and settings stay open on the bottom touchscreen.
- Bottom-screen dashboard: tabs for a live minimap with coordinates and FPS, a touch inventory with quick-manage buttons, and quick option sliders.
- Console Edition menus: crafting, Creative mode, chests, workstations, and villager trading use Legacy4J Console Edition layouts built for controllers.
- 3DS-style main menu: world panorama and rotatable 3D skin preview on top, with world and server menus on the bottom screen.
- Handheld shortcuts: hold D-Pad Down to zoom, press D-Pad Left to type in chat on the bottom screen, plus reach-around placement and a radial menu.
- Optional Distant Horizons: built-in LOD distant terrain support, off by default and toggleable in Options > Mods.
- Upscaling & frame gen: optional FSR upscaling and 2x frame generation in quick settings for smoother performance.
- 120 Hz support.

## Setup guide

- Download shulkds-1.0.1-arm64-v8a.apk from the latest release.
- Updating from v1.0.0: install the new APK right over your current install.
- Updating from an older 0.8.0 test build: uninstall 0.8.0 first. Your worlds and settings in /sdcard/ShulkDS will stay intact.
- Open ShulkDS, allow storage access if prompted, and sign in with a Microsoft account that owns Minecraft: Java Edition so it can download your game files.

## Known issues

- Bottom-screen scaling and UI cleanup on the AYN Thor is still being worked on.
- A temporary 60 Hz refresh-rate lock has been reported on the Retroid Pocket.
- Heating when using Distant Horizons is still being optimized.
