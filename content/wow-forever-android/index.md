---
title: "WoW Forever for Android"
description: "Play the World of Warcraft: Forever beta natively on Snapdragon 8 Series Android handhelds like the AYN Thor."
date: "2026-10-06 06:22"
slug: "wow-forever-android"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtube.com/shorts/t91-xYXOF90"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wychvd/wow_forever_beta_ayn_thor_60fps_showcase/)

## Description

WoW Forever for Android lets you play the World of Warcraft: Forever beta on Snapdragon Android handhelds as a normal Android app: tap the icon, press Play, and the game runs. It uses Blizzard's own Windows ARM64 WoW client, so the game itself runs natively on the device's CPU; Wine translates the Windows calls, and DXVK plus a patched Turnip Vulkan driver render the game on the Adreno GPU. Nothing is emulated as x86. It is an unofficial community project, not affiliated with or endorsed by Blizzard Entertainment. You need your own Battle.net account with WoW Forever beta access, and the repository and its releases contain no Blizzard game files.

## Features

- Runs the WoW Forever beta as a normal Android app with a tap-to-play launcher.
- Native ARM64 execution: the game never goes through x86 emulation.
- Direct launch and instant boot: once configured, the app boots straight into the game.
- Native in-app game updater (v2.0): live version check against Blizzard's public patch service and one-tap updates over Wi-Fi — no PC or USB cable needed.
- Battle.net sign-in from the in-game sidebar, with credentials stored encrypted on-device via the Android Keystore.
- On-screen keyboard that appears on the Thor's bottom screen, with working symbols like `@` and paste support.
- Built-in handheld controller support through WoW's own gamepad mode.
- Performance: solid 60fps in low-populated areas, with dips to around 40fps in crowded cities.

## Requirements

- A Snapdragon 8 series device (Adreno 7xx or Adreno 8xx). The app bundles both the Adreno 740 driver and the Turnip v32 driver for Snapdragon 8 Elite / Adreno 8xx, automatically detecting the GPU and applying the optimal driver and environment flags.
- Android 10 or newer, 64-bit.
- About 80 GB free for the game data (internal storage or SD card), plus about 4 GB of internal storage for the app and its Windows environment.
- A Mac or PC with the WoW Forever beta installed through Battle.net, to copy the game data from.
- Your own Battle.net account with WoW Forever beta access.

Supported devices:
- AYN Thor (Snapdragon 8 Gen 2 / Adreno 740) — tested, reaches the game world with controller support
- Retroid Pocket 6 (Snapdragon 8 Gen 2 / Adreno 740) — tested by the original community setup
- AYN Odin 2 / Mini (Snapdragon 8 Gen 2) — expected to work
- AYN Odin Portal (Snapdragon 8 Elite / Adreno 830) — supported via bundled Turnip v32 driver
- RedMagic 11 Pro (Snapdragon 8 Elite / Adreno 840) — tested in-world
- Samsung Galaxy S23/S24/S25 / Z Fold series — supported (with automatic Samsung UBWC optimization)

## Setup guide

- Download `WoW-Forever.apk` from the [latest release](https://github.com/jaredgei/wow-forever-android/releases/latest) and install it on your device. The app's package name is `app.wowforever`, so it can sit alongside GameNative or Winlator.
- Copy your WoW game data to the device (one-time setup): copy `.build.info` and the whole `Data/` folder (~67 GB) from your Battle.net install into a folder on the device. The default is `/storage/emulated/0/WoW Forever/`; any other folder works too, including one on an SD card.
  - `Data/` is the same on every platform, so a Mac, Windows, or ARM install all work.
  - `.build.info` is a hidden file — copy it too. Without it the game fails with "CAS system was unable to initialize".
  - You don't need `WowB-ARM64.exe`; the app downloads the matching Windows ARM64 client from Blizzard's CDN when you press Play and checks its hashes.
  - If you used a different folder, the launcher shows **Locate Game Files** — pick the folder that contains `.build.info` and `Data/`. **Change Location** switches it later.
- Transfer the files to a `WoW Forever/` folder on your device via SD card (make sure your file manager shows hidden files so `.build.info` is included) or USB file transfer in MTP mode.
- Open **WoW Forever**. Once your game files are configured, the app automatically launches straight into the game. The first launch downloads the ARM64 game client and installs the Windows environment, which takes a few minutes and needs an internet connection.
- To access folder settings, forget credentials, check environment status, or view updates, hold **Start + Select + L2 + R2** (or tap the back button) during the loading splash to cancel boot and return to the setup screen.
- Controls: built-in handheld controllers work in-game; WoW's own gamepad mode handles the mapping. Press Back to open the sidebar with **Keyboard**, **Sign in to Battle.net**, on-screen controls, performance overlay and **Exit**.
- Sign in to Battle.net: open the sidebar and tap **Sign in to Battle.net**. The app automatically focuses the login fields, enters your credentials, and submits. The first time, it prompts for your email and password and stores them encrypted with the Android Keystore on-device only. Authenticator codes still have to be entered by hand.

See the project page: [github.com](https://github.com/jaredgei/wow-forever-android)
