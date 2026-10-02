---
title: "Wildermyth Android Launcher"
description: "An unofficial launcher that runs the PC version of Wildermyth on the AYN Thor with Steam Cloud saves, achievements, DLC and controller support."
date: "2026-10-02 06:22"
slug: "wildermyth-android-launcher"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/wildermyth-android-launcher/preview.webp"
  - type: "image"
    url: "/content/wildermyth-android-launcher/screenshot-2.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wuyox0/wildermyth_android_launcher_pc_wildermyth/)

## Description

Wildermyth is a beloved tactical RPG by Worldwalker Games, but it has no Android version and the PC version doesn't run on Android as is. This unofficial, free and open-source launcher runs the PC version of the game on the AYN Thor using the game's own desktop jar on a bundled Java 8 runtime, with Android builds of the game's native libraries for graphics, controller and sound. You bring your own copy of the game — from Steam, GOG or Epic — and the Steam version gets the most out of the app: in-app download, cloud saves, achievements and DLC. Copies from other stores load through "Use my game files", which is untested. The app is not affiliated with Worldwalker Games or Valve.

## Setup guide

Download the APK from the Releases page and install it on your Thor. On first launch, either pick your own game files or sign in to Steam to download the game (about 3 GB; the download keeps going with the screen off). Sign in by scanning a QR code with the Steam app — you never type your password. Saves download before you play and upload when you quit, so you can switch between the Thor and your PC. If both copies changed, the app asks which to keep and backs up the other.

## Features

Install the game from the app — pick your own game files or sign in to Steam and download the game. Steam Cloud saves sync before and after each session, with conflict handling that backs up the other copy. Steam achievements unlock as you play and sync after each session. DLC you own on Steam is unlocked. Controller and sound work out of the box. Tested on the AYN Thor (Snapdragon 8 Gen 2, Android 13); other Android handhelds with a Snapdragon chip may work but haven't been tested.

## Status and limits

Downloads slow down during the long stretch of small files — that's latency to Steam's servers, not your connection. The app has only been tested on one device, so expect rough edges elsewhere. No game files ship with the app; you need your own copy of Wildermyth to play.

See the project page: [github.com](https://github.com/hung-eggie-do-covergo/wildermyth-android)
