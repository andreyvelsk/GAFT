---
title: "Bloodborne · Thor Companion"
description: "A dual-screen build of the Bloodborne Android port that runs the game on the AYN Thor's upper screen with an integrated companion on the lower screen."
date: "2026-11-01 06:54"
slug: "bloodborne-thor-companion"
category: "game"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xkrajs/best_halloween_gaming_bloodborne_running/"
project_page: "https://github.com/emerytech/Bloodborne-Android"
---

## Description

An unofficial fork of the Bloodborne Android port by ducvd89, reworked into a single app that builds an integrated Hunter's Companion into the game for the AYN Thor. Based on the upstream android-2.2.0 release, it installs as one app with one launch icon and one game-folder selection: the game runs on the upper screen and a touchscreen companion runs on the lower screen.

The project includes no game files — no game, saves, game artwork, generated game code, or Lossless Scaling DLL. You provide your own Bloodborne 1.09 files (the folder with `eboot.bin`, `sce_module` and `sce_sys`) extracted from a disc you legally own. It is not an official Sony or FromSoftware product.

## Requirements

- An **AYN Thor** (dual-screen Android handheld). The build targets its two screens; the second-screen companion only appears on a display named `Screen-2`.
- Your own **Bloodborne 1.09** game files — a folder containing `eboot.bin`, `sce_module/` and `sce_sys/` — extracted from a disc you own. None are included.
- Free storage for your extracted game files plus the on-device compiled code (several GB).
- The app APK from the latest release.

## Setup guide

- **Install the app** — Download the APK from the [latest preview release](https://github.com/emerytech/Bloodborne-Android/releases/latest) onto your Thor and install it, allowing installation from your browser or file manager when Android asks. Do not install an upstream APK over this fork: this build uses its own package (`com.emerytech.bloodbornethor`) and sits beside any existing Bloodborne app. Upgrading from an earlier preview: install the new APK over it — it is signed with the same key, so it upgrades in place and keeps its settings and saves.
- **Put your game files on the device** — Copy your own Bloodborne 1.09 folder somewhere on the Thor's storage, for example `Download/Bloodborne` or `Games/Bloodborne`. The folder must directly contain `eboot.bin`, `sce_module/` and `sce_sys/` (artwork is read from `sce_sys` — `pic1.png` becomes the companion background).
- **First launch** — Open **Bloodborne · Thor Companion**, grant storage access when asked, and choose the game folder from the step above (the one with `eboot.bin`).
- **Build the native code (first run only)** — If compatible precompiled `aot/` code is already in your folder, it is imported automatically. Otherwise the app compiles the game's code on-device; this one-time step takes a while, then the game boots to its title screen on the upper screen.
- **Play** — The game runs on the **upper** screen with your physical controls, and the **lower** screen is the touchscreen companion.

## Features

- **Menu tab** — the full in-game menu (settings, cheats, mods, saves, online, graphics, controls) mirrored onto the bottom touchscreen; dialogs open on the upper screen.
- **Controls tab** — a quick reference for the Bloodborne button layout (combat, parry/rally, movement, menus, tips). The glyphs are a reference, not touch buttons.
- **Artwork tab** — the home view, showing the game's own key art read from your `sce_sys` folder.
- **Status tab** — live CPU, RAM, battery and temperature, a clock, and a brightness slider for the lower screen, refreshed every second.
- **Couchside tab** — a scannable QR to couchside.tv, shown only when this tab is open; tap the card to open it directly in your browser.
- **Help tab** — a short how-it-works note.
- Artwork is the home view: tap a tab to open it, tap the same tab again to close back to the artwork. The top swipe-in drawer on the upper screen stays available, so the game menu is reachable from either screen.
- Upstream's **Hunter's Atlas** second-screen map is preserved; the game menu's **Thor companion** entry offers hide/show and the Atlas map, which takes over the lower screen until turned off.
- Save backup and restore from the game menu, copying saves to timestamped `Bloodborne-saves-…` folders in your Download folder.
- Mod browser with a starter catalog: direct downloads are checksum-checked, preview their shared files, and install switched off.
