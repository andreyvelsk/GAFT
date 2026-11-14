---
title: "Thor FF IX"
description: "A live companion deck for Final Fantasy IX on the AYN Thor's second screen, showing party, enemy, ability and map data from your own Steam copy."
date: "2026-11-13 13:02"
slug: "thor-ffix"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/thor-ffix/preview.webp"
  - type: "image"
    url: "/content/thor-ffix/screenshot-2.webp"
  - type: "video"
    url: "https://youtu.be/7KjomDMhI4s"
source: "https://www.reddit.com/r/AynThor/comments/1xv3xl8/ff9_and_ff13_thor/"
project_page: "https://github.com/harmssi/thor-ffix"
---

## Description

Thor FF IX runs Final Fantasy IX on the top screen of the AYN Thor — your own Steam copy through DroidDeck, with the Memoria engine and the Moguri mod — and a live deck on the bottom screen, framed with the game's own window skin, portraits and icons. The deck shows:

- Battle: party with HP/MP/ATB/Trance, and for each enemy its HP, weaknesses, and what is still left to steal
- Abilities: what your equipped gear still teaches and how much AP is missing, so you know when a piece can come off
- Extras: the booster buttons by touch (high speed, no battles, ...) and the counters the game never shows: Excalibur II countdown, steal count for Thievery, frogs, dragons, treasure hunter rank
- World map with your position, items, key items

The window frames, portraits and icons are read from your own game while it runs; nothing from the game is in the app or the repository. It also comes with a script that pulls the mods people usually recommend (Moguri 9.0, 30 fps FMVs, the PSX sound fix) from their authors and copies them to the device. Runs at about 60 fps on the Thor with Moguri active. FF IX has no Steam Cloud, so there is also a small import: drop your PC save into a folder next to the game and it is picked up at the next start.

## Features

- Party (left column, optional): portraits, level, HP/MP, status; in battle the ATB and Trance gauges. The « chip next to the tabs hides the column so the panel uses the whole screen
- Auto: switches by itself — enemies in battle, the map on the world map, items in the field
- Enemies: HP, level, status, and what Scan would tell you: weak / absorbs / immune / halves, what is left to steal and what it drops
- Abilities: every ability your equipped gear teaches, with AP so far and AP needed
- Map: the world map with your position and heading, the chocobo and the airship
- Items / Key items: your inventory with the game's item icons
- Extras: the game's booster buttons by touch (high speed, no encounters, battle assist, 9999 damage) and the hidden counters: Excalibur II countdown, successful steals (Thievery), frogs (Frog Drop), dragons (Dragon's Crest), treasure hunter rank, chocographs, card record
- The deck is read-only apart from the four booster buttons, which press the game's own buttons with the game's own rules; after a touch the focus goes back to the top screen
- The deck's labels follow the game's language — German when the game is German, English otherwise (names of items, abilities and places always come from the game)

## Requirements

- An AYN Thor (or another dual-screen Android handheld)
- Your own FINAL FANTASY IX on Steam, installed in DroidDeck
- A computer with adb for the one-time setup

## Setup guide

- Download the [latest release](https://github.com/harmssi/thor-ffix/releases/latest) of Thor FF IX — it includes the Android app and the patched Memoria Assembly-CSharp.dll with the status server
- Install the patched Memoria into your FF IX game folder on the device (the originals are kept as *.thor-bak; the uninstall script puts them back)
- Install the Thor FF IX APK and start Thor FF IX. It launches FF IX in DroidDeck on the top screen and the deck on the bottom screen
- DroidDeck opens its own control panel on the bottom screen; the deck puts itself in front of it as soon as the game is running. If you need DroidDeck's panel (Steam menu, trackpads), hold the deck's header for a second — closing the panel with ✕ brings the deck back
- Optional: run the mod installer script to download the community-recommended mods (Moguri 9.0, 30 fps FMVs, PSX sounds, and more) from their authors and copy them to the device
- To bring a save from your PC: drop your SavedData_ww.dat into a folder next to the game; at the next start it is moved into the save folder. If the save is not your own, also create an empty file no-achievements so the game reports no achievements or stats to Steam
- Watch the [install guide](https://youtu.be/cU4BpiBhWHk) for a step-by-step walkthrough
