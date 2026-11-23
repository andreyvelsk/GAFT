---
title: "Dark Souls II: Scholar of the First Sin"
description: "An unofficial native Android port of Dark Souls II: Scholar of the First Sin (Xbox 360) with a second-screen HUD for dual-screen handhelds."
date: "2026-11-23 19:08"
slug: "dark-souls-ii-scholar-of-the-first-sin"
category: "game"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1y2pvua/dark_souls_ii_sotf_xbox_360_dual_screen_60fps_on/"
project_page: "https://github.com/Lazaer-YZY/ds2-sotfs-recomp"
---

## Description

An unofficial native Android (arm64) port of the Xbox 360 release of Dark Souls II: Scholar of the First Sin, made by static recompilation. The game's PowerPC code is translated ahead of time to C++ and runs natively — it is not a CPU emulator. You bring your own copy of the game; no game files are included. On dual-screen handhelds such as the AYN Thor, the HUD can live on the second screen. The port is playable from the start of the game through Majula, with saves, cutscenes, audio and the Scholar DLC data. On an AYN Thor at the 60 fps setting it averages 60 fps with a 1% low of 48–56 fps, drawing the HUD on the second screen.

## Setup guide

- Download the latest release APK and open it on the device to install it.
- Start the app (the icon is called **Dark Souls II**). With no game yet it opens its game-folder page, which lists both discs.
- Import the discs from your own disc images (.iso) on the device: tap **Import disc 1…** and pick the disc 1 ISO, then **Import disc 2…** and pick the disc 2 ISO. Each ISO can be deleted once imported.
- Alternatively, copy the files from a PC into the device's internal storage under `Android/data/com.ds2recomp.android/files/`: everything on disc 1 into `game/` and the DLC package from disc 2 into `dlc/`.
- Start the game. The first start installs the DLC package and loads the bundled shader cache at the title screen (a minute or two; let it finish).
- Use the **CTRL** button (top centre) to open settings: Controls, Frame rate and performance, Image, Second screen, Game, and Troubleshooting.

## Features

- **Second screen HUD** on dual-screen handhelds such as the AYN Thor: HP and stamina, the four equipment slots, effect icons, souls and damage figures, drawn with the game's own art.
- Frame-rate options: 30, 40 and 60 fps, plus "Smoother 60" on 120 Hz panels.
- Render resolutions 360p / 432p / 540p / 720p / 1080p / 1440p with AMD FSR 1 upscaling.
- **Fill screen** for phones wider than 16:9 at every resolution, with the HUD and menus staying 16:9 in the middle.
- FXAA anti-aliasing on the 3D scene only, so the HUD and text stay sharp.
- Game languages: English, French, German, Italian, Spanish, Brazilian Portuguese, Polish, Russian, Japanese, Korean and Traditional Chinese.
- Simple cheats: infinite HP, infinite stamina, no equipment wear, and +10,000 souls.
- Touch controls with an editable layout and optional drag-to-look, or any game controller with its own button mapping.
- Save backups to a folder of your choice, a GPU driver manager, GPU compatibility options, a performance overlay, and **Save logs** for bug reports.

## Requirements

- Your own **Dark Souls II: Scholar of the First Sin** for Xbox 360: **disc 1 and disc 2** (disc 2 carries Compatibility Pack 4 with the three Crown DLC areas; the game does not start without it).
- An arm64 Android device with Vulkan, Android 8 or newer (9 or newer for the bundled Turnip driver).
- Snapdragon (Adreno 7xx / 8xx) is the tested path; Adreno 6xx works from 0.5.1. Mali GPUs use Arm's driver or PanVK; other GPUs use the system driver and are untested.
- About 8 GB free for the game, plus room for one disc image (7.8 GB) while importing it.
