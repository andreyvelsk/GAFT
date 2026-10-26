---
title: "FFXII Thor Companion"
description: "A free, open-source live second-screen companion showing your map, party HP/MP, gambits, gear and License Board while playing FFXII The Zodiac Age on the AYN Thor."
date: "2026-10-23 06:48"
slug: "ffxii-thor-companion"
category: "companion"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1xcfl3f/i_made_a_live_secondscreen_companion_for_final/)

## Description

FFXII Thor Companion is a live second-screen companion for FINAL FANTASY XII THE ZODIAC AGE (Steam, PC) running under GameNative on the AYN Thor dual-screen handheld. The game plays on the top screen and the companion app on the bottom screen follows it in real time. It is free and open source (MIT), requires no accounts, no tracking and no internet permission, and builds its data from your own copy of the game — no game files are included. It is an unofficial fan project, not affiliated with or endorsed by Square Enix.

The companion is made of three pieces, each with its own job:
- The **app** (`.apk`) runs on the Thor's bottom screen and reads files. It has no network access.
- The **game script** runs inside the game under ffgriever's LUA Script Loader. It reads the game's state and writes it as small JSON files to `Download/FFXII_companion/live` on the device. It comes inside the app: a small loader (`ThorCompanion.lua`), installed once, checks the script's signature at every game start and only runs a genuine, current copy. After the first install, updating is just installing the new app.
- **Your game data** (names, licence boards, map sheets) is built from your own game files, on the Thor: the game script copies the files it needs while you play (about 5 minutes) and the app builds the data. A PC data builder is still available as an alternative.

## Features

The app offers five tabs that follow the game live:
- **Status** – Where you are, a map of the areas you have explored with a "you are here" marker, the game's map symbols and exit labels (tap it for a full-size map you can zoom and drag), live party HP/MP and status effects, the enemy your party is targeting (level, HP, weaknesses), the game's own "where to go next" hint, and (optional) your accepted hunts.
- **Gambits** – Every member's gambits as the game has them right now, with item counts ("Potion ×14", "0 left" warnings). It shows one set at a time — tap I, II or III to look through them. **Suggest** builds a gambit set from what that character owns and is licensed for. The optional **editor** can apply a change or a whole suggested set to the running game, and switch which set (I/II/III) a character uses.
- **Equip** – Each member's equipped gear, plus what the game's own **Optimize** would change. Descriptions come from optional mods.
- **Bestiary** – Bestiary pages by location (with an optional mod).
- **Licenses** – Both job boards per character: owned, buyable now (the game's exact rules, including Espers, Quickenings and the Second Board), and the cheapest route to any license.

Accepted hunts have a map link under Status › Hunts that follows your progress and opens the place the game's own View Hunt Map points to. Most have a marker; one offers several regions to choose from. These are the game's hunt-map destinations, not exact spawn points, and ground you haven't explored stays hidden. Hunts remain optional.

The interface brings the bottom screen closer to the game's menus, with a softly moving slate background, plain menu words down the left, a pointing-glove cursor, and paper pages for Bestiary and the full map.

## Requirements

- **AYN Thor** (Android 13) with **GameNative** and **FINAL FANTASY XII THE ZODIAC AGE from Steam, version 1.0.4.0**. Other game builds are detected and the companion stays read-only and blank.
- **Required mods:** ffgriever's FF12 External File Loader and FF12 LUA Script Loader. Use the current versions (tested: LUA Script Loader 2.0.1 with External File Loader 1.6.1); 1.7.1 still works but often hangs when the game closes.
- **Optional mods** that add text: Dynamic Equipment Description with The Insurgent's Descriptive Inventory (Equip tab descriptions), and Foedex Clan Primer Text Replacer (Bestiary tab). Everything else works without them.
- **No PC needed** for the game data any more; the optional PC data builder needs Python 3.10+.
- If you use The Insurgent's Manifesto, its 36-slot single gambit list mode is not supported by the editor (the editor refuses to run then); everything else still works.
- English (US) game text only for this beta; Korean and Chinese licence boards differ.

## Setup guide

Getting started takes a few one-time steps:
- First, ffgriever's two mod loaders have to be working in FFXII (the companion's script runs through them): FF12 External File Loader and FF12 LUA Script Loader copied into the game's `x64` folder, the newer C++ runtime next to them, and GameNative's **Enable mod loaders** switched on. Without them the game runs fine but the companion just waits.
- Install the **APK** on the Thor, open it on the bottom screen and tap **Allow file access**. It puts the loader, the signed game script and the installer in `Download/FFXII_companion/install`.
- Once only: in GameNative, open the game's container and run `D:\FFXII_companion\install\install.cmd`.
- Tap **Start FFXII**, then **Build game data**. The game data builds itself while you play (about 5 minutes).

To update, install the new APK over the old one and restart the game. When updating from an earlier version, rebuild your game data once (Status › Details › Rebuild) with the game running until it finishes; you don't need to run `install.cmd` again. To remove, run `uninstall.cmd` the same way (it deletes the loader and its record), uninstall the app, and delete `Download/FFXII_companion`.

Watch:
- [0.17 video: the new look and hunt maps](https://github.com/Cybranfox/ffxii-thor-companion/releases/latest)
- [0.16 video](https://github.com/Cybranfox/ffxii-thor-companion/releases/latest)
- [0.15 setup walkthrough](https://github.com/Cybranfox/ffxii-thor-companion/releases/latest)
- [first demo (0.9)](https://github.com/Cybranfox/ffxii-thor-companion/releases/latest)

See the project page: [github.com](https://github.com/Cybranfox/ffxii-thor-companion)
