---
title: "RetroDS"
description: "Play SNES and PS1 games on dual-screen Android handhelds with the game's own map or menu on the second screen."
date: "2026-11-26 06:34"
slug: "retrods"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/retrods/preview.webp"
  - type: "image"
    url: "/content/retrods/screenshot-2.webp"
  - type: "image"
    url: "/content/retrods/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1y5kuyn/retrods_10_snes_and_ps1_with_the_games_own/"
project_page: "https://github.com/iosue-iulianus/retro-ds"
---

## Description

RetroDS is an Android app that plays Super Nintendo and PlayStation games on dual-screen handhelds. The game runs on one screen exactly as the console drew it, while the other screen shows what the game would have put on a second screen if it had one: its map, its items, its menu, in the game's own style, live as you play. It is not a port, a ROM hack or a companion app: it runs your normal ROM or disc in the bsnes or SwanStation emulator cores, patched to expose the game's memory and video memory, so RetroDS can see what the game is doing every frame and draw the maps and menus itself from the game's own graphics.

You play with the buttons; the second screen is for looking — drag and zoom the map, tap an item to switch to it. RetroDS is free, GPLv3, and updates itself from GitHub. It was built for and tested on the Retroid Pocket Duo; other dual-screen Android handhelds should work but haven't been tried. On the Thor, the game should go on whichever screen fits a 4:3 picture biggest (the 6" top screen), with the map or menu on the bottom one, and you can swap screens and change scaling in the settings. ROMs and the PS1 BIOS (scph5501) are on you.

## Features

- **Your game, unchanged.** RetroDS runs your own cartridge or disc in an accurate emulator (bsnes, SwanStation). It isn't a port or a ROM hack: the game is the one you know, its saves are ordinary saves, and save states and cheats work as they do for any game (RetroAchievements too, on the Super Nintendo).
- **Drawn live, not captured.** RetroDS reads the running game and draws the second screen itself after every frame: the map scrolls under your finger at the screen's refresh rate, with no second copy of the game running down the battery.
- **The game's own look.** Every second screen is made from the game's own graphics (its map, its items screen, its menu), rearranged for touch at most.
- **One app for your library.** Super Nintendo and PlayStation games in one game list. The games RetroDS knows get their second screen; any other SNES or PSX game plays single-screen with its title logo or name on the other screen.
- **Controls and display.** Save and load states (with Undo), screens and scaling (4:3 or Pixel Perfect), shaders, controls, cheats, and on the Super Nintendo rewind (L2), fast forward (R2), patches applied as the game loads (IPS, UPS, BPS, xdelta) and RetroAchievements (casual mode).
- **Ten languages.**

## Supported games

- **The Legend of Zelda: A Link to the Past** (USA release): the world map, built from the ground the game has actually shown you, with the world map's own clouds over what you haven't seen and the game's markers for where to go next; pinch or tap to zoom. The items screen slides up over the map (X) — tap an item to give it to Y. Drop your own markers on the map to remember a secret for later. In dungeons, the dungeon's own map, floor by floor.
- **Super Metroid** (USA / Japan release): the area map as the pause screen draws it, explored rooms and all, drawn from the cartridge and the game's memory; drag it and fling it, and it scrolls at the screen's refresh rate. Tap SAMUS for the equipment page, and tap a beam, suit or item there to switch it on or off without pausing.
- **Castlevania: Symphony of the Night** (USA release, SLUS-00067): the castle map exactly as the game's map screen draws it, read from the game's video memory, with rooms explored and the percentage of the castle displayed; tap or pinch to zoom. Press Start, or swipe across the second screen, and the game pauses and its own menu moves to the second screen, widened to fill modern screens, while the game screen shows the game's logo. L2 and R2 rewind and fast forward are disabled in Symphony of the Night because the game itself uses those buttons.
- **Every other game.** Any other Super Nintendo or PlayStation game plays on one screen, with its title logo or name on the other. Other regional releases of the games above also get their second screen.

## Setup guide

1. Download `retrods-vX.Y.Z-android.apk` from the latest release and open it on the handheld. Android asks once to allow installing apps from your browser or file manager. Allow RetroDS **All files access** when it asks, so your saves and states live in shared storage.
2. Put your own games, and for the PlayStation your own BIOS, in these folders (other folders can be chosen in Settings > System > Folders):
   - `ROMs/snes` — Super Nintendo games (.sfc, .smc, .swc, .fig, .zip); battery saves go beside them (.srm)
   - `ROMs/psx` — PlayStation discs (.cue with their .bin tracks); memory card saves go beside them (.srm)
   - `RetroDS/bios` — scph5501.bin, required for US games and never included
3. Open RetroDS and pick a game. Tap the game screen or press HOME for RetroDS's menu: save and load states (with Undo), screens and scaling (4:3 or Pixel Perfect), shaders, controls, and the rest.
4. Updates: once a day, when the game list opens, RetroDS checks for a new release and offers to install it (Settings > System > Updates to check now or switch it off). Your games, saves and states stay where they are.
