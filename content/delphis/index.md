---
title: "Delphis"
description: "A companion app for the Dolphin emulator that auto-maps your controller and turns the Thor's bottom screen into a live button guide."
date: "2026-11-06 08:03"
slug: "delphis"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/delphis/preview.webp"
  - type: "image"
    url: "/content/delphis/screenshot-2.webp"
  - type: "image"
    url: "/content/delphis/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xow1hd/delphis_a_dolphincompanion_app_for_emulating/"
project_page: "https://github.com/HiramRG/Delphis"
---

## Description

Pick a game and Delphis sets up the controls that suit it (pointer, sideways Wii Remote, wheel, gyro aiming…), launches it in Dolphin on the top screen, and turns the bottom screen into a live guide to your buttons. It lets you change controls mid-game, autosaves when you quit and picks up where you left off.

## Features

- **Game-aware presets.** Delphis reads the game ID from the disc and suggests layouts built for that game.
- **Gyro aiming (Experimental).** Aim the Wii pointer by moving the Thor, with two styles: *Gyro aiming* and *Precision gyro*, which moves finely when you move slowly and far when you move fast, and lets you hold R1 to freeze the pointer and re-position. Invert up/down or left/right in Settings, and try it on the built-in test screen.
- **Edit any preset.** Change what any button does for one game; your version is saved for that game.
- **Change controls mid-game.** Pick another layout from the bottom screen; the game restarts with it and, with autosave on, continues from the same spot.
- **Top screen.** Delphis' menus, then the game in Dolphin.
- **Bottom screen in the menus.** Quick tiles, a touch picker for control styles, and details for the game you're on.
- **Bottom screen while playing.** Big tiles for the main buttons (colour-coded A, B, X, Y), the rest in a short list, plus *Change controls*, *Edit preset* and *Main menu*. A thin bar shows the time and battery.
- **Autosave and resume.** When you close a game from Delphis, it saves a Dolphin save state first, and the next time you start that game it continues from there. You can turn this off in *Settings → Closing games*.
- **A Wii-style home.** A *Continue playing* card for your last game, a recently played row, then your whole library, with a retractable column for All games, Favorites, Wii and GameCube, plus search and sorting by Recent / A–Z / Most played.
- **Menu music.** An original, Wii-style loop that plays only in the menus, or your own audio file, with its own volume slider.
- **In-app updates** from the repository's releases.

## Supported games

- Super Mario Galaxy 1 & 2
- Mario Kart Wii
- New Super Mario Bros. Wii
- Metroid Prime 3 / Trilogy
- Twilight Princess
- Donkey Kong Country Returns
- Kirby's Return to Dream Land
- Super Paper Mario
- Smash Bros. Brawl
- Plus generic presets for everything else (pointer, sideways, Classic Controller, GameCube).

## Setup guide

- Download **Delphis.apk** from the [latest release](https://github.com/HiramRG/Delphis/releases/latest) and install it on your Thor. Android asks you to allow installing apps from your browser or file manager the first time.
- Open Dolphin once so its user folder exists.
- Open Delphis and follow the walkthrough:
  - **Connect Dolphin's folder:** in the picker, open *Dolphin* in the side menu and tap *Use this folder*.
  - **Choose your games folder.**
  - **Turn on "close games"** (the accessibility helper).
  - **Controller Check** (recommended, about a minute).
  - Optionally **try gyro aiming**.
- After that, Delphis updates itself: *Settings → Updates* (it also checks quietly at start-up).
