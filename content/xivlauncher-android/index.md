---
title: "XIVLauncher Android"
description: "Play Final Fantasy XIV on your Android phone or handheld with this all-in-one launcher."
date: "2026-09-29 06:26"
slug: "xivlauncher-android"
category: "port"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/uE9OpuZB1X8"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wt25mx/how_to_play_ffxiv_on_android_2026/)

## Description

XIVLauncher Android is a port of XIVLauncher that brings Final Fantasy XIV to Android phones and handhelds. It logs in to your Square Enix account, installs or updates the game, and runs the Windows client under Wine with FEX, DXVK and the Turnip Vulkan driver, all inside one app. Dalamud plugins are supported. It works with paid accounts, free trial accounts and Steam accounts, and has been tested on the AYN Thor, Samsung Galaxy S25 Ultra and Galaxy Fold 8 Ultra. The launcher supports controllers, mouse and keyboard, and automatically updates your game when new patches drop. You can also copy your existing PC install onto the device or put the game on an SD card.

## Setup guide

Download XIVLauncher.apk from the [latest release](https://github.com/ZeroTheScyther/XIVLauncher-Android/releases/latest) and open it on your device, allowing installation from your browser or file manager. On first launch the app downloads its runtime (about 400 MB) — keep the app open until setup finishes. Tap Play, log in, and either let the app install the game or point Settings → Game install location at a copy you already have. The app checks for new releases on launch and offers the download from the official repository.

## Requirements

You need an arm64 Android device with a Snapdragon SoC (Adreno GPU) — the app was developed on a Snapdragon 8 Elite, and other recent Adreno 7xx/8xx devices may work. You also need 12 GB of RAM, Android 8.0 or newer, about 2.5 GB for the runtime plus the game (~130 GB), a FINAL FANTASY XIV account with an active subscription (Square Enix and Steam service accounts both work), and a controller or Bluetooth keyboard and mouse.

## Security

This repository is the only official source of XIVLauncher Android. The APK is published only on the repository's Releases page and is not distributed through any website, app store, mirror, Discord server or file host. The app handles your Square Enix login and potentially your Steam login, so an APK from anywhere else may be modified to steal your FFXIV account or install malware on your device. If you got it somewhere else, uninstall it, change your Square Enix password and enable the one-time password. Enable 2FA.

See the project page: [github.com](https://github.com/ZeroTheScyther/XIVLauncher-Android)
