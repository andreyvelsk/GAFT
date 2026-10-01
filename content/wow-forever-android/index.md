---
title: "WoW Forever for Android"
description: "A standalone launcher that runs the World of Warcraft: Forever beta natively on the AYN Thor's Snapdragon 8 Gen 2."
date: "2026-10-01 06:36"
slug: "wow-forever-android"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/wow-forever-android/preview.webp"
  - type: "image"
    url: "/content/wow-forever-android/screenshot-2.webp"
  - type: "image"
    url: "/content/wow-forever-android/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wupt0w/wow_forever_standalone_apk_for_ayn_thor/)

## Description

WoW Forever for Android is a standalone launcher that runs the World of Warcraft: Forever beta on the AYN Thor as a normal Android app — tap the icon, press Play, and the game runs. It uses Blizzard's own Windows ARM64 WoW client, so the game runs natively on the phone's CPU; Wine translates the Windows calls, and DXVK plus a patched Turnip Vulkan driver render the game on the Adreno GPU. Nothing is emulated as x86.

The launcher is tested on the AYN Thor (Snapdragon 8 Gen 2 / Adreno 740) and reaches the game world with controller support. It also works on the Retroid Pocket 6 and is expected to work on other Snapdragon 8 Gen 2 devices such as the AYN Odin 2 family. You need your own Battle.net account with WoW Forever beta access — the app contains no Blizzard game files.

## Setup guide

1. Download the APK from the [latest release](https://github.com/jaredgei/wow-forever-android/releases/latest) and install it on your device. The package name is app.wowforever, so it can sit alongside GameNative or Winlator.
2. Copy your WoW game data from a Battle.net install (on a Mac, /Applications/World of Warcraft/) into a folder on the device — the default is /storage/emulated/0/WoW Forever/. You need the whole Data/ folder (~67 GB) and the hidden .build.info file. Any folder works, including one on an SD card. You don't need WowB-ARM64.exe — the app downloads the matching Windows ARM64 client from Blizzard's CDN when you press Play.
3. Open WoW Forever and press Play. The first launch downloads the ARM64 game client and installs the Windows environment, which takes a few minutes and needs an internet connection. After that it boots straight into the game.

Requirements: a Snapdragon 8 Gen 2 (Adreno 740) device, Android 10 or newer (64-bit), about 80 GB of free space for the game data plus about 4 GB of internal storage for the app and its Windows environment, and a Mac or PC with the WoW Forever beta installed through Battle.net to copy the game data from.

## Features

Controller: built-in handheld controllers work in-game, with WoW's own gamepad mode handling the mapping.

In-game menu: press Back (the button or the back swipe gesture) to open the sidebar with Keyboard, Sign in to Battle.net, on-screen controls, a performance overlay and Exit.

Keyboard: opens the Android keyboard, which appears on the bottom screen on dual-screen devices like the Thor. Symbols like @ work, and pasting works too.

Sign in to Battle.net: saves your email and password on the device, encrypted with the Android Keystore, and types them in for you. Nothing is sent anywhere. Authenticator codes still have to be entered by hand.

## Updating the game

The app doesn't update the game. Every time Blizzard patches the beta, you have to copy the new files to the device yourself. If the game suddenly says "No realms available" or there are no servers to pick, an out-of-date client is almost always the reason. Let Battle.net patch the game on your computer, then re-sync the game files to the device — the included sync script copies only changed or new files, refreshes the build info, and downloads the matching ARM64 client when the build changed.

See the project page: [github.com](https://github.com/jaredgei/wow-forever-android)
