---
title: "FF8Recomp"
description: "FINAL FANTASY VIII (2013 or Remastered) recompiled to native ARM64 Android, built on your device from your own copy."
date: "2026-11-23 19:08"
slug: "ff8recomp"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/ff8recomp/preview.webp"
  - type: "image"
    url: "/content/ff8recomp/screenshot-2.webp"
  - type: "image"
    url: "/content/ff8recomp/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1y2rgqn/ff8recomp_final_fantasy_viii_running_natively_on/"
project_page: "https://github.com/bhuiyah/ff8-recomp-android"
---

## Description

FINAL FANTASY VIII for PC, statically recompiled to native ARM64 Android. There is no emulation and no Wine/FEX: the game's own x86 program is translated to C and compiled for your device, then rendered by FFNx on Vulkan (or OpenGL ES). The APK contains nothing from the game — you bring your own copy.

Either Steam edition is supported:
- The 2013 release.
- The Remastered, with its HD models, portraits and menus, its re-recorded music, and five languages (English, French, German, Spanish, Italian).

You sign in to Steam inside the app with a QR code (you never type your password), pick which edition to play, and the game downloads straight from Steam — or you can import a folder you already have. The game is then built on your device once, in about 15 minutes on the Thor.

On the AYN Thor's dual screens, the bottom screen shows the party (portraits, HP, GFs, junctions), magic, GFs, items and Triple Triad cards, in the launcher's orange. In battle it shows each enemy's HP and weaknesses, what you can steal and what they drop, plus the party's ATB. A touch deck has Menu, Save/Load state, Speed and random encounters on/off.

## Features

- Battles at 30 FPS (the game shipped them at 15), with the original timing and an experimental 60 FPS option in Settings, plus 16:9 widescreen.
- The game's music, played through a small DirectMusic player written for this project, using FF8's own instruments (Android has no DirectMusic).
- A launcher with Junction VIII's mod catalogs built in, with search, categories and one-tap install, plus `.iro` files and load order. Mods that patch the game's code (`.hext`) work too.
- Save states, speed-up, no encounters, a CRT filter, controller, keyboard and touch controls, and Pixel Guide on the bottom screen.
- Report a problem builds one zip with logs and device info, so bugs are easy to send.

## Setup guide

- Download and install the latest APK from the [releases page](https://github.com/bhuiyah/ff8-recomp-android/releases/latest).
- Open FF8Recomp → **Game files**, then either:
  - **Connect to Steam…**: scan the QR code with the Steam app and choose your edition (the Remastered is about 2.8 GB, the 2013 release about 1.7 GB), or
  - **Find my FF8 folder…**: pick your FINAL FANTASY VIII folder.
- Let it build (about 15 minutes on the Thor; it carries on in the background), then press **Play**.
- To bring your PC saves over, copy them into `Android/data/com.ff8recomp/files/game/save/user_0/`.

## Known issues

- Languages: the Remastered in English, French, German, Spanish or Italian; the 2013 release in English. Japanese is not supported yet.
- The Remastered runs through FFNx's Remastered mode, so the Remastered's own additions (its booster menu and its new options) are not there.
- Not yet available: Steam achievements and cloud saves, and importing PlayStation saves.
- Patched game files are not supported.
- The music player covers what FF8's segments use; DirectMusic's reverb and chorus are not reproduced.
- Movies decode on the CPU.
