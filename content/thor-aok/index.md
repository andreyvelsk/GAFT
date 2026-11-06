---
title: "Thor AoK"
description: "Native Age of Empires II port for the AYN Thor with the map on the top screen and a touch command deck on the bottom."
date: "2026-11-06 08:04"
slug: "thor-aok"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/cT8PKuzvq-g"
source: "https://www.reddit.com/r/AynThor/comments/1xooizx/age_of_empires_ii_on_the_ayn_thor_full_map_on_top/"
project_page: "https://github.com/harmssi/thor-aok"
---

## Description

Thor AoK is a native Android (arm64) port of Age of Empires II for the AYN Thor dual-screen handheld, built on the open-source OpenAoK engine — no Wine and no emulator. It plays from your own Age of Empires II HD (Steam) files; no game data is included in the APK. The top screen shows only the map at full 1920×1080, while the bottom screen (1240×1080) becomes a touch command deck. The game plays The Age of Kings' rules from The Conquerors' data: the 13 original civilisations, the original random maps and the computer player from HD's scripts. Fan project, not affiliated with Microsoft, Ensemble Studios or AYN.

## Setup guide

- Download ThorAoK-0.1.0.apk from the latest release and install it on the Thor (allow installing from your browser or file manager once).
- Install Age of Empires II HD from your Steam library on a PC or Mac (or on the Thor through a Steam client such as DroiDeck — the files are what matters).
- Convert the data on a PC or Mac with the script from the repository (Python 3, CMake and a C++ compiler; Pillow and NumPy for the terrain). This writes android/build/OpenAoK-data/ (about 300 MB) from your own files.
- Copy OpenAoK-data to the Thor (SD card or internal storage, USB or adb push).
- Start Thor AoK, tap Choose data folder, open OpenAoK-data, Use this folder → Allow. The app checks every file against the manifest and copies it in; after that it starts straight away (Play). The folder on the card can be deleted afterwards.
- No permissions to grant — the import uses Android's folder picker.

## Features

- Top screen (1920×1080): only the map. The top bar and bottom panel are gone; menus, dialogs and messages are unchanged.
- Bottom screen (1240×1080): a touch command deck with wood, food, gold, stone, population and the age; the mini-map (tap or drag to move the view); the selection with its hit points and production queue (tap a queued item to cancel it); quick buttons for the idle villager, idle army, Town Center, the next age, delete and the menu; and the selection's commands as big tiles with the original icons.
- Tap a tile to press the button (train, research, build menu, stop, bell, …); long-press shows the button's help.
- Placing a building: pick it on the deck, then tap the spot on the top screen. Delete asks first: tap it again within 3 seconds.
- Mini-map drawn by the engine's mini-map code (terrain, fog, units) with the view frame.
- Deck and launcher in English, Deutsch, Español, Français; the game's own text comes from your HD files (English).
- Without a second screen everything stays as in OpenAoK.

## Known issues

- The Conquerors' civilisations, units and technologies are in the data but not playable; the computer player skips rules that need them.
- No default hotkeys (they come from the CD's EMPIRES2.EXE, which HD does not have); campaigns and the 1999 bonus scenario are not converted.
- The game's text is English (from HD's English strings).
- v0.1.0: economy and building work well; combat and aging up are still early. Game music is muted for now.
