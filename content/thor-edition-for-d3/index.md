---
title: "Thor Edition for D3"
description: "A dual-screen port of Diablo III for the AYN Thor with a touch control deck on the second screen."
date: "2026-11-08 06:31"
slug: "thor-edition-for-d3"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/efP39kseEDo"
source: "https://www.reddit.com/r/AynThor/comments/1xq0r82/diablo_iii_on_the_thor_game_on_top_a_touch_skill/"
project_page: "https://github.com/harmssi/thor-d3"
---

## Description

Thor Edition for D3 is a fork of Desm0nt's Diablo III Mobile port that brings Diablo III to the AYN Thor's dual screens. The game runs natively as ARM64 code on the top screen (1920×1080, 16:9) with no touch overlay, while the bottom screen shows a control deck with six skill buttons, a potion button, a live life bar and resource globe, and one-tap access to inventory, skills, quests, map, town portal, lock target, game menu and port settings. The deck never takes focus, so the built-in controller works as usual. It requires your own legally purchased copy of the Nintendo Switch version (Eternal Collection, update 2.7.7). The repository and APK contain no game files, art or keys.

## Features

- Control deck on the bottom screen (1240×1080) with life bar and resource globe read live from the game's HUD, six skill buttons with equipped skill icons, a large potion button, and buttons for Inventory, Skills, Quests, Map, Town Portal, Lock Target, Game Menu and port settings.
- Clean top screen: the on-screen touch pad and FPS counter are off; the game fills the 1920×1080 screen (16:9).
- Game data on the SD card: if `Download/Diablo3Mobile` has no `romfs`, the app uses `<SD card>/Diablo3Mobile`.
- Buttons as printed: right face button = A confirms; put `DM_PAD_LAYOUT=label` into `Diablo3Mobile/dm/env` to use printed labels.

## Setup guide

- Obtain a legally purchased copy of Diablo III: Eternal Collection for Nintendo Switch (update 2.7.7).
- Follow the upstream project's installation guide at https://github.com/Desm0nt/diablo3-port (docs/INSTALL.md) to prepare the game folder.
- Copy the finished `Diablo3Mobile` folder to the Thor's SD card root (or `Download/`).
- Install the APK from the latest release: https://github.com/harmssi/thor-d3/releases/latest.
- Launch the app; the game appears on the top screen and the control deck on the bottom.

## Known issues

- v0.1.0 beta: only Act 1 has been tested so far.
- The town portal button is not yet confirmed.
- Offline only: single player, local saves.
