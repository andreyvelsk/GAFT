---
title: "DrillPod"
description: "An unofficial Android launcher for Motherload (XGen Studios, 2004) with gamepad, touch controls and an AYN Thor second-screen dashboard."
date: "2026-11-18 13:50"
slug: "drillpod"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/drillpod/preview.webp"
  - type: "image"
    url: "/content/drillpod/screenshot-2.webp"
  - type: "image"
    url: "/content/drillpod/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xz6v8b/vibecoded_motherload_flash_game_port/"
project_page: "https://github.com/AliasGprime/drillpod"
---

## Description

DrillPod is an unofficial Android launcher dedicated to Motherload, the classic Flash mining game by XGen Studios (2004). It runs the game with the open-source Ruffle emulator and adapts it to today's devices: Android handhelds (designed for the dual-screen AYN Thor), phones and tablets. Every feature — button-to-button menu navigation, the second-screen dashboard, local saves — is tailored to Motherload's screens, shops and save system; DrillPod is not a general-purpose Flash player.

The app contains no part of the game (no graphics, sounds or code): every player provides their own copy of Motherload (8khsgfbehb.swf), verified by its MD5 fingerprint. It is an unofficial fan project, not affiliated with or endorsed by XGen Studios.

## Features

- Start menu fully usable with a gamepad or by touch.
- Two ways to get Motherload: direct download from XGen Studios' official website, or import of a file already on the device.
- MD5 check of the file (42469867aa46129edbab37894c344cb4): only this exact version of Motherload is accepted; any other file is rejected.
- English / French interface (automatic from the Android language, or chosen manually).
- Every gamepad action can be remapped (16 actions in three contexts: driving, game menus, anywhere).
- Button-to-button navigation in the game's menus: on every screen (shops, inventory, options, save bot, game over…), the cursor lands on the most useful button by itself and then jumps from button to button with the d-pad or the sticks.
- Virtual gamepad modelled on the AYN Thor with a layout editor: move, resize or hide every element with your finger.
- On a dual-screen device (AYN Thor), the bottom screen shows a live dashboard: cash, depth, score, fuel / hull / cargo-bay gauges, detailed cargo with estimated value, items with their gamepad button, current equipment, and alerts (low fuel, hull damaged, cargo bay full).
- Three display modes: stretched 16:9, original 4:3, wide.
- Optional high-quality mode: 1.5× supersampling, best Flash quality, and smoothing of textures that looked blocky when scaled up.
- Local saves: the game's requests to its former online save server are answered locally, with automatic login on the save / load screen.

## Requirements

- Android 7.0 or later.
- A copy of Motherload (8khsgfbehb.swf), verified by its MD5 fingerprint (42469867aa46129edbab37894c344cb4).
- Internet connection to download the game from the publisher's official website, or a local copy of the file to import.
- A dual-screen device (AYN Thor) for the second-screen dashboard; the dashboard is optional on other devices.

## Setup guide

- Download DrillPod.apk from the [latest release](https://github.com/AliasGprime/drillpod/releases/latest).
- Open it on the Android device (allow installs from unknown sources if asked). Play Protect may show a warning because the APK is not distributed through the Play Store.
- Start DrillPod, then either download the game (fetches the file from the publisher's official website; Internet connection required) or import a file (select your copy of 8khsgfbehb.swf).
- The file is verified and prepared on the device. Choose Play.
