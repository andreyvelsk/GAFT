---
title: "SoH Dual Screen Rando"
description: "A Ship of Harkinian build for the AYN Thor that runs Ocarina of Time on the top screen with a randomizer tracker on the bottom screen."
date: "2026-11-18 13:50"
slug: "soh-dual-screen-rando"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/soh-dual-screen-rando/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xyurny/ship_of_harkinian_dual_screen_build_for_randomizer/"
project_page: "https://github.com/Dizax-git/Shipwright-Android-Dual-Screen-Bleeding-Edge"
---

## Description

This is a Ship of Harkinian build for the AYN Thor that runs the game on the top screen and a randomizer tracker on the bottom screen. The bottom screen shows an items tracker with the real icons, the Hyrule map from the pause menu with your hints (Way of the Hero, barren, items left to find, gossip stones you haven't read), the list of checks you can do right now with the rando logic (by region and area, with the ones you can only do at the other age in a different color), plus a run timer and the time of day. It uses the game's font and dialogue boxes so it fits with the rest. It is based on SoH 9.3.1 and Darkaxt's dual screen port. It doesn't ask for any account, login or key: all the code is on the GitHub page, and the APK on the release is built by GitHub Actions straight from that code, with the SHA-256 next to it. You need your own Ocarina of Time ROM.

## Features

- Items tracker with the real icons; once you've read the altar in the Temple of Time, the stones and medallions show which dungeon they're in.
- Hints: the Hyrule map from the pause menu with markers for Way of the Hero, barren, items still to find and gossip stones you haven't read yet; tap a location to see what you know about it. Only hints you've actually read show up, so no spoilers, and the usual hint journal is still there behind the Journal button.
- Checks: the checks of your seed sorted by region (the 6 medallions) and by area, updated every time you get an item. Blue means you can get it now, purple with an hourglass means you can get it at the other age, grey with a lock means not yet, gold means done. Tap a check to see its full name or skip it; a blinking blue dot shows what just opened up, and it can follow Link from area to area.
- Run timer and time of day at the top of the bottom screen.
- Touching the bottom screen doesn't take the controls away from the game (on the Thor, set Autolock to the top screen in the AYN settings).
- Bigger SoH menu that works with your finger: scroll by dragging, keyboard for search, and a Menu Scale slider in Settings > General.
- Gyro aiming uses the Thor's own sensor, with more settings in Settings > Controls.
- Quit really closes the game instead of leaving it in the background.
- Fixed unreadable letters on the title screen and invisible chests with Containers Match Contents (64-bit Android bugs).
- All check, area and gossip stone names are translated in French too (English and German keep the original names).
- If you have the OoT Reloaded HD pack in your SOH/mods folder, the bottom screen uses its HD font.

## Setup guide

You need your own Ocarina of Time ROM. Check that it's supported on ship.equipment.

1. If you already have a SoH build with the package `com.dishii.soh` (Darkaxt's port for example), uninstall it first — this one is signed with a different key so Android won't install over it. Your `SOH` folder stays where it is, but back it up anyway.
2. Download the APK from the [latest release](https://github.com/Dizax-git/Shipwright-Android-Dual-Screen-Bleeding-Edge/releases/latest) and install it.
3. Start it, allow file access, and pick your ROM. It builds `oot.o2r` the first time.
4. On the Thor, set Autolock to the top screen in the AYN settings.
5. Make a seed in the Randomizer menu and start a new file.

To update, just install the new APK over the old one — saves and settings are kept. Settings are in Enhancements > UI: what the bottom screen shows (trackers or the normal HUD), its size, game font on/off, reachable checks, follow current area, maps and compasses.

## Known issues

- Only tested on the author's Thor; other dual screen handhelds might work if Android sees the second screen as a display.
- Gyro aiming works but isn't super precise.
- Based on SoH 9.3.1, so any SoH bugs from that version are present.
- Android arm64 only.
