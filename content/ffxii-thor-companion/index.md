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
- The **data builder** (PC, Python) builds names, licence boards and map sheets from your own game files. You run it once and copy its output to the Thor.

## Features

The app offers five tabs that follow the game live:
- **Status** – Where you are, a map of the areas you have explored with a "you are here" marker, the game's map symbols and exit labels (tap it for a full-size map you can zoom and drag), live party HP/MP, and the enemy your party is targeting (level, HP, weaknesses).
- **Gambits** – Every member's gambits as the game has them right now, with item counts ("Potion ×14", "0 left" warnings). **Suggest** builds a gambit set from what that character owns and is licensed for. The optional **editor** can apply a change or a whole suggested set to the running game, and switch which set (I/II/III) a character uses.
- **Equip** – Each member's equipped gear, plus what the game's own **Optimize** would change. Descriptions come from optional mods.
- **Bestiary** – Bestiary pages by location (with an optional mod).
- **Licenses** – Both job boards per character: owned, buyable now (the game's exact rules, including Espers, Quickenings and the Second Board), and the cheapest route to any license.

## Requirements

- **AYN Thor** (Android 13) with **GameNative** and **FINAL FANTASY XII THE ZODIAC AGE from Steam, version 1.0.4.0**. Other game builds are detected and the companion stays read-only and blank.
- **Required mods:** ffgriever's FF12 External File Loader and FF12 LUA Script Loader. Tested with LUA Loader 1.7.1.
- **Optional mods** that add text: Dynamic Equipment Description with The Insurgent's Descriptive Inventory (Equip tab descriptions), and Foedex Clan Primer Text Replacer (Bestiary tab). Everything else works without them.
- **A PC with your Steam copy of the game** and Python 3.10+, to run the data builder once.

## Setup guide

Getting started takes three one-time steps:
- Run the **data builder** on your PC (it reads your own game files and builds the companion data), then copy `FFXII_companion` into the Thor's `Download` folder.
- Install the **APK** on the Thor and open it once. Grant "All files access" when asked. It puts the loader, the signed game script and the installer in `Download/FFXII_companion/install`.
- Once only: in GameNative, open the game's container and run `D:\FFXII_companion\install\install.cmd`. Then play.

To update, install the new APK over the old one and restart the game. To remove, run `uninstall.cmd` the same way, uninstall the app, and delete `Download/FFXII_companion`.

See the project page: [github.com](https://github.com/Cybranfox/ffxii-thor-companion)
