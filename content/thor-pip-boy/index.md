---
title: "Thor Pip-Boy"
description: "A live Pip-Boy companion for Fallout 4 on the AYN Thor's second screen."
date: "2026-11-10 06:58"
slug: "thor-pip-boy"
category: "companion"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/dQ\\_Nsl6ExDk"
source: "https://www.reddit.com/r/AynThor/comments/1xrm7l2/fallout_4_on_the_thor_with_a_live_pipboy_on_the/"
project_page: "https://github.com/harmssi/thor-pipboy"
---

## Description

Thor Pip-Boy is a second-screen Pip-Boy for Fallout 4 on the dual-screen AYN Thor handheld. The game runs on the top screen (Steam via DroidDeck) while a green phosphor Pip-Boy with live game data runs on the bottom screen. Tap an item to equip or use it. It replaces the official Pip-Boy companion app interface, which no longer works in the current Fallout 4 release (1.11.240). The app contains no game files and no Bethesda artwork – all graphics are drawn by the app itself. It is an unofficial fan project, not affiliated with Bethesda, ZeniMax, Microsoft or AYN.

## Features

- STAT: status figure with limb condition, HP/AP/level/XP, rads, resistances; S.P.E.C.I.A.L.
- INV: weapons, apparel, aid, misc, junk, ammo with weight/value – tap = equip / unequip / use
- DATA: quests with objectives (active quest first); world info: date, location, caps, weight
- MAP: world map markers, quest markers and player arrow; local map indoors (doors, quest marker)
- RADIO: stations in range, radio on/off
- FAV: quick keys 1–12 (your in-game favorites) as big tiles – tap = equip / use; Stimpak and RadAway buttons with count
- English and German UI, auto-reconnect, "waiting for Fallout 4…" screen
- One launcher icon starts the Pip-Boy and the game together
- Auto-reopen guard that brings the Pip-Boy back about 20 s after the game is stable

## Setup guide

You need your own Fallout 4 on Steam (runtime 1.11.240), running on the AYN Thor through DroidDeck. No game files are included.

- Download the latest release: ThorPipBoy.apk and ThorPipBoy.dll (plus optional ThorPipBoy.ini).
- Install the runtime dependencies yourself (they may not be redistributed): F4SE 0.7.9 (build for runtime 1.11.240) and the Address Library for F4SE Plugins (the file containing version-1-11-240-0.bin) from Nexus Mods.
- Copy the files into the Fallout 4 folder (…/steamapps/common/Fallout 4/, on the Thor under Android/data/com.droiddeck.launcher/files/steam/steamapps/common/Fallout 4/): f4se_loader.exe, f4se_1_11_240.dll and Data/Scripts/* (from F4SE), Data/F4SE/Plugins/version-1-11-240-0.bin (Address Library), Data/F4SE/Plugins/ThorPipBoy.dll and Data/F4SE/Plugins/ThorPipBoy.ini (optional).
- Set the Steam launch option for Fallout 4 so Steam starts F4SE (f4se_loader.exe) instead of the launcher.
- Install the APK on the device. For the auto-reopen guard, grant the SYSTEM_ALERT_WINDOW and SCHEDULE_EXACT_ALARM permissions once.
- Start "Thor Pip-Boy" from the launcher: it opens the Pip-Boy on the bottom screen and starts Fallout 4 via DroidDeck on the top screen. Load a save – the Pip-Boy fills with live data.

## Known issues

- Fallout 4 uses almost all of the Thor's RAM. While a save loads, Android may close the Pip-Boy for a moment; a built-in guard reopens it about 20 s after the game is stable again. It never reopens it during loading.
- A Stimpak tapped while a weapon is being drawn may be ignored by the game – tap again.
