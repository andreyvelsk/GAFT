---
title: "Plumemu"
description: "A calm, light launcher for Android retro handhelds that names your games offline and shows details and battery use on a second screen."
date: "2026-10-30 07:57"
slug: "plumemu"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/plumemu/preview.webp"
  - type: "image"
    url: "/content/plumemu/screenshot-2.webp"
  - type: "image"
    url: "/content/plumemu/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xijzd3/plumemu_a_launcher_i_made_for_my_thor/"
project_page: "https://github.com/joiha-steven/plumemu"
---

## Description

Plumemu is a minimal launcher for your ROMs and Android games, made for the AYN Thor and similar Android retro handhelds. It names your games offline with no account, sets up in a couple of minutes, never touches your files, and uses the bottom screen to show info about whatever you are looking at. It is light on RAM, easy to use with one hand, and works with both buttons and touch. The only login is an optional ScreenScraper account for box art, stored encrypted on the device; anonymous usage statistics are off by default. It runs on Android 6.0 or later (8.0 MB download) and was tested on the AYN Thor, the Retroid Pocket Nova and the Retroid Pocket Classic.

## Setup guide

- Download `plumemu-0.0.8-beta-850.apk` from the latest release or from the website.
- Open the APK on the device and allow the install when Android asks.
- Open Plumemu and pick your ROMs folder with Android's folder picker; it finds the emulators you have installed, picks one for each system, and adds new games by itself.
- To make Plumemu your home screen, say yes when it asks, or press Home and choose Plumemu.
- Updating: install a newer version the same way, over the old one — your library and settings stay. Once a day on Wi-Fi Plumemu looks for a new version; Settings › About › Update downloads, checks and installs it.
- Buttons: "A" opens and plays, "B" goes back, "X" searches, "Y" adds to or removes from Favorites, "START" opens the game menu (Settings from the system column), "SELECT" toggles list and grid, "L2/R2" jump between systems, and "L1/R1" move by letter in a list or resize covers in a grid. Touch works everywhere: tap to select, tap again to play.
- On the AYN Thor the lower screen shows the chosen game's details, your statistics while Settings is open, and, while you play, a clock with how long the battery lasts at this game's pace.

## Features

- **Names your games offline.** Reads each game's own code inside zip, 7z and CHD files and disc images, knows about 29,000 arcade sets by their short names, and takes names for newer Switch games from GameTDB. No account, no internet; a wrong name is fixed from the game menu and the fix sticks.
- **One row per game.** Copies of one game (regions, revisions, arcade sets) show as one row even from separate folders; Other versions in the game menu picks which one plays, and `.cue`, `.gdi` and `.m3u` parts are not rows of their own.
- **New games show up by themselves.** Copy games in or put in an SD card and they appear when you come back; Home tells you about them.
- **Android games and ports.** Installed Android games get a system of their own, and native port apps join Ports; Show as game, Show as port and Not a game correct Plumemu's choice.
- **Optional box art.** Sign in with your own free ScreenScraper account to fetch box art and game details over Wi-Fi; box art ScreenScraper lacks is fetched from Steam's and libretro's public image servers, with no login.
- **Emulators picked for you.** Plumemu finds the emulators you have installed and picks one per system; any game or system can use another, and each emulator is offered only for the file types it opens.
- **Second screen and battery.** On a handheld with two screens, like the AYN Thor, the lower screen shows the chosen game's details, your statistics while Settings is open, and while you play a clock with how long the battery lasts at this game's pace. Everything still works on one screen.
- **Light on hardware.** An 8.0 MB download that runs on Android 6.0, opens a library of 10,000 games in about a quarter of a second, and uses no CPU while it waits.
- **Make it yours.** Ten ready-made color sets, list or cover grids in three sizes, a system info band, adjustable text size and weight, sounds and vibration, and a D-pad-friendly keyboard for Search.
- **Your files stay yours.** It sees only the folder you pick and never deletes, moves or renames a game file; settings or everything (library, box art, play time) can be backed up and restored from one file.
- **Privacy.** The only required permission is internet plus install/uninstall packages; anonymous usage statistics and crash reports are off until you switch them on.

## Known issues

- **Beta.** Plumemu is a beta: it still has gaps and rough edges and is updated often.
- **No screenshots or videos of games in this beta** — box art and details only for now.
- **Tested devices.** Only the AYN Thor (both screens), the Retroid Pocket Nova (4:3) and the Retroid Pocket Classic have been tested; other handhelds (Retroid Pocket 5, 4 Pro and Mini, AYN Odin and similar) are laid out for but untested.
- Most translations have not been read by a native speaker yet.
