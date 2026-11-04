---
title: "SA Companion"
description: "A PDA-style companion app that shows live data from GTA San Andreas on a second screen."
date: "2026-11-04 07:39"
slug: "sa-companion"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/sa-companion/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xngqbw/gta_sa_dual_screen_release/"
project_page: "https://github.com/Gamersmood/SA-Companion"
---

## Description

SA Companion is a PDA-style companion app for GTA San Andreas on Android. The game runs on one screen and the app runs on a second screen (made for the AYN Thor Max, Android 13, where the game is on the top screen and the app on the bottom one). It shows live data from the game and can send a few things back.

A CLEO script reads the game data and a small AML plugin writes it to a shared folder, which the app reads about 20 times a second. The app can also send things back to the game, such as a weapon, radio station, waypoint and cheats.

## Features

- Live position, heading, health and armor, money, wanted stars, clock and day
- Weapon wheel with real magazine ammo, detonator, and the ability to equip a weapon from the app
- Car radio control
- Map with the real San Andreas icons, a circular radar, gang territories (with a flash during a gang war) and waypoints that you set on the app and that show up in the game
- Stats (including driving, flying, bike and cycling skill), cheat entry, settings and setup
- Two themes: San Andreas (default) and Classic (Chinatown Wars style, with its own pause screen)
- Game HUD opacity slider with live preview, and auto launch of the app on the second screen when the game starts

## Requirements

- GTA San Andreas for Android, 32-bit (com.rockstargames.gtasa) — the 64-bit version is not supported
- AML (AndroidModLoader) already working, which loads the libPdaBridge.so mod from the game's mods folder
- CLEO mod for Android (libCLEOMod.so) already working, which runs the .csa scripts that read the game data
- Android 13 device (minSdk 33), ideally with two screens
- Tested only on the AYN Thor Max; other devices, screen sizes and Android versions may not work or may look wrong
- "All files access" permission for the app (it asks for it in Setup)

## Setup guide

Download and install the latest release APK, then open the app and follow the Setup screens. Setup has two modes:

- Unprotected (easiest): pick the game folder (Android_unprotected/data/com.rockstargames.gtasa) and the app copies the mod files in for you. The shared files are then written to cleo/pda/ inside the game folder. When a new app version carries newer mod files, Setup tells you and updates them.
- Protected: use this when the app cannot reach the game folder. The app puts the three files in Download/PDA Mod Files (subfolders mods and cleo) and you copy them to the game folder by hand. The shared files are written to /storage/emulated/0/PDA/. After you update the app, copy the files again by hand.

Then start the game and load a save. The app shows a waiting screen until the game starts sending data.
