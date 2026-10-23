---
title: "GBA Duo"
description: "Play GBA, GBC and GB games on the top screen with a live, customizable companion on the bottom."
date: "2026-10-16 07:30"
slug: "gba-duo"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/gba-duo/preview.webp"
  - type: "image"
    url: "/content/gba-duo/screenshot-2.webp"
  - type: "image"
    url: "/content/gba-duo/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x74l9b/build_your_own_gba_companion_with_gba_duo/)

## Description

GBADuo is a Game Boy Advance, Game Boy Color and Game Boy player for dual-screen Android handhelds, made for and tested on the AYN Thor. The game runs on the top screen; the bottom screen is a companion built from a pack that reads the game's memory as you play and shows what matters, like your party and bag in Pokémon FireRed or your rucksack and friendships in Harvest Moon. Packs are plain files (a layout, CSS and a Lua script), so anyone can build one for a favorite game. They can read live game values, display guides, extract and render in-game assets, and — with a setting enabled — modify memory in real time. It should run on any dual-screen Android 11+ device (arm64), though other devices are not yet tested. GBADuo has no accounts, ads or analytics and asks for no permissions: it never goes online, and your games, saves and packs never leave your device.

## Setup guide

- Download the latest `gbaduo-<version>.apk` from the [latest release](https://github.com/khumam/gba-duo/releases/latest) onto your device.
- Open the APK; if Android asks, allow your browser or file manager to install apps.
- Open GBADuo and tap **+** to add a ROM folder. Every `.gba`, `.gbc` and `.gb` file in it shows up in your library.
- You can add more folders, or remove one, under **ROM folders**; removing a folder never deletes its files.
- To use a companion, download a pack's `.zip` from its releases and add it with **⋮ > Import pack…**; tap **⋮** next to a game to choose which pack it uses, and each game remembers its own.
- To keep a copy of your saves in a folder you choose (SD card, a synced folder), use **Settings > Save folder**; back up your old saves first.
- No games are included: use your own legally dumped ROMs.
- GBADuo doesn't check for updates: download the newer APK from the [latest release](https://github.com/khumam/gba-duo/releases/latest) and install it over the old one; your saves stay.
- Full docs and setup guide: [gbaduo.com](https://gbaduo.com).

## Features

- **Packs per game** - tap **⋮** next to a game in your library to choose its companion pack, or **Import pack…** to add one from a `.zip`; each game remembers its own pack.
- **Live** - the pack's Lua script reads the game's memory several times a second, so the screen follows along as you play.
- **Touch** - tabs, buttons and pages you can tap through; the controller keeps driving the game whichever screen has focus.
- **Auto-opening pages** - a pack can switch pages when something happens in the game, like FireRed's battle page opening when a battle starts and closing when it ends.
- **In-game assets** - a pack can extract and render in-game assets (icons, maps, sprites) inside its layout.
- **Memory manipulation** - a pack can modify memory values in real time, letting you build interactive mechanics; it must be manually enabled in settings, as modifying memory can corrupt game states if done incorrectly.
- **Save states** - 9 slots per game, each showing when it was saved.
- **In-game saves** - kept per game, next to its save states.
- **Save folder** - optionally mirror every game's saves to a folder you pick (SD card, a synced folder), so backups and moving to another device are file copies; if a save changed in both places, the newer one is kept and the other is saved next to it as `game.sav.conflict-<time>`.
- **RetroAchievements** - softcore mode is supported.
- **Launcher intent** - launch games directly from third-party frontends/launchers (some launchers may require minor setup).
- **Fast-forward** - hold **R2**; 2x, 3x or 4x, picked in the menu.
- **Shaders** - Off, GBA Color, LCD Grid, Scanlines and Scale2x.
- **Swap A/B** - flips the A and B buttons if they feel the wrong way round.
- Press **L2** or **BACK** in a game for the menu: resume, save state, load state, fast-forward speed, shader, swap A/B and quit.

## Supported games

Companion packs live in the [gba-duo-companions](https://github.com/khumam/gba-duo-companions) repository. Download a pack's `.zip` from its releases and add it with **⋮ > Import pack…**.

- Pokémon FireRed (US) - `pokemon-firered-companion`: party, bag pockets, trainer card, and a battle page with both Pokémon's live stats.
- Harvest Moon: Friends of Mineral Town (EU/US) - `harvest-moon-fomt-companion`: gold, date and time, stamina, held tool and rucksack, affection, and Harvest Sprites' work.

See the project page: [github.com](https://github.com/khumam/gba-duo)
