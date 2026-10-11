---
title: "ThorDirStat"
description: "A free WinDirStat for the AYN Thor that shows exactly what's filling your storage."
date: "2026-10-11 06:18"
slug: "thordirstat"
category: "app"
generated: "ai"
media:
  - type: "image"
    url: "/content/thordirstat/preview.webp"
  - type: "image"
    url: "/content/thordirstat/screenshot-2.webp"
  - type: "image"
    url: "/content/thordirstat/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x2hsll/thordirstat_windirstat_for_the_ayn_thor_see/)

## Description

ThorDirStat is a WinDirStat equivalent for the AYN Thor. It scans your internal storage, SD card or a USB drive and shows every file as a rectangle sized by how much space it takes, colored by file type and grouped by folder, so the biggest consumers of space stand out right away. The treemap runs on the big top screen while the folder tree and file type list live on the bottom screen.

It also lists each installed app's own size, with App info a hold away to clear its cache or uninstall it, and measures Android/data and Android/obb with Shizuku, which is where game data usually hides. Scanning uses WinDirStat's Pac-Man animation while file and byte counts climb.

## Features

- **Treemap:** every file is a rectangle sized by its bytes, inside its folder's rectangle, colored by file type and shaded as a cushion so folders show as bumps, just like WinDirStat
- **Folders:** the folder tree, biggest first, with each item's share of its folder as a bar, its size, item count and last change
- **File types:** every extension with its treemap color, a description (videos, Android apps, disc images, Switch games, save states...), its bytes, share and number of files; tap one to outline every file of that type in the treemap
- **Apps:** each installed app's own size, with App info a hold away to clear its cache or uninstall it
- **Drives:** pick internal storage, the SD card, a USB drive, or all of them at once, with a used / free bar for each
- **Zoom:** double-tap (or use the zoom buttons) to zoom into any folder; tap a block again to select the whole folder it belongs to
- **Actions:** press and hold for zoom, open, share, properties, copy path, rescan and delete (delete always asks first)
- **Gamepad:** D-pad moves through the list, A opens or closes a folder, X shows actions, Y zooms in, B zooms out, and L1 / R1 switch between Folders and File types
- **One-screen mode:** turn off "Use both screens" in Settings to show the lists and treemap side by side on one display, or swap the screens
- **Updates:** Check for updates in Settings finds a newer ThorDirStat release on GitHub, shows what's new, then downloads and installs it

## Setup guide

1. Download `ThorDirStat.apk` from the [latest release](https://github.com/ajhockey88/ThorDirStat/releases/latest) and copy it to the Thor.
2. Open it on the Thor to install.
3. Open ThorDirStat and tap **Allow access**, then turn on **Allow access to manage all files**. (With Shizuku allowed, ThorDirStat switches this on by itself.)
4. Optional, for `Android/data` and `Android/obb`: start Shizuku, then tap **Allow ThorDirStat in Shizuku**. Android hides those folders from apps, and they often hold the biggest files (game data, emulator files); without Shizuku they show as "hidden by Android" and their space counts towards `<Unknown>`.
5. Optional, for `<Apps>`: in **Drives**, tap **Allow usage access** and turn it on for ThorDirStat. Without it, apps' sizes count towards `<Unknown>`.
6. To update, tap **Check for updates** at the bottom of Settings, or install the newest `ThorDirStat.apk` from the [latest release](https://github.com/ajhockey88/ThorDirStat/releases/latest) over the old one.

See the project page: [github.com](https://github.com/ajhockey88/ThorDirStat)
