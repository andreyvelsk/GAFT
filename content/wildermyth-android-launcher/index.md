---
title: "Wildermyth Android Launcher"
description: "An unofficial launcher that brings the PC version of Wildermyth to the AYN Thor with Steam Cloud saves, achievements, DLC and controller support."
date: "2026-10-02 06:41"
slug: "wildermyth-android-launcher"
category: "app"
generated: "ai"
media:
  - type: "image"
    url: "/content/wildermyth-android-launcher/preview.webp"
  - type: "image"
    url: "/content/wildermyth-android-launcher/screenshot-2.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wuyox0/wildermyth_android_launcher_pc_wildermyth/)

## Description

Wildermyth Android Launcher is an unofficial, free and open-source launcher that runs the PC version of Wildermyth on the AYN Thor. It boots the game's own desktop jar, unmodified, on a bundled Java 8 runtime, swapping in Android builds of the game's native libraries for graphics, controller and sound. You need your own copy of the game — Steam, GOG or Epic Games Store — since no game files ship with the app. The Steam version gets the most out of it: in-app download, cloud saves, achievements and DLC. Copies from other stores load through "Use my game files", which is untested. Tested on the AYN Thor (Snapdragon 8 Gen 2, Android 13); other Android handhelds with a Snapdragon chip may work but haven't been tested.

## Features

- Install the game from the app: pick your own game files, or sign in to Steam and download the game (about 3 GB). The download keeps going with the screen off.
- Sign in with a QR code from the Steam app — you never type your password.
- Steam Cloud saves: saves download before you play and upload when you quit, so you can switch between the Thor and your PC. If both changed, the app asks which to keep and backs up the other.
- Steam achievements unlock as you play and sync after each session.
- DLC you own on Steam is unlocked.
- Controller and sound work out of the box.

## Setup guide

Download the APK from the [Releases page](https://github.com/hung-eggie-do-covergo/wildermyth-android/releases/latest) and install it on your Thor. On first launch, either pick your game files or sign in to Steam to download the game. Sign in by scanning a QR code with the Steam app. Saves download before you play and upload when you quit, so you can switch between the Thor and your PC; if both copies changed, the app asks which to keep and backs up the other.

## Status and limits

Downloads slow down during the long stretch of small files — that's latency to Steam's servers, not your connection. The app has only been tested on one device (the AYN Thor). The project was built with the help of an AI coding assistant; read the code before you trust it and keep backups of your saves.

See the project page: [github.com](https://github.com/hung-eggie-do-covergo/wildermyth-android)
