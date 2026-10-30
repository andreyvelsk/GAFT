---
title: "The Legend of Zelda: The Wind Waker HD"
description: "A native Android port of The Wind Waker HD (Wii U) that runs the game on the AYN Thor's second screen as a touch GamePad."
date: "2026-10-15 06:04"
slug: "zelda-wind-waker-hd"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=bkn6ne7iINI"
source: "https://github.com/GreenNaugahyde/ZeldaWWHDRecompAndroid"
project_page: "https://github.com/GreenNaugahyde/ZeldaWWHDRecompAndroid"
---

## Description

The Legend of Zelda: The Wind Waker HD is a native Android port of the Wii U game, built on the ZeldaWWHDRecomp project. The game's PowerPC code is recompiled to native ARM, the Wii U system libraries it uses are reimplemented, and its graphics run directly on Vulkan — there is no emulator in between. On dual-screen devices like the AYN Thor the GamePad picture goes to the second screen by itself, with touch, while the main screen shows the TV picture.

The app contains no game files. You bring your own copy of the game — a disc image (`.wud` or `.wux`) dumped from your own Wii U disc with its keys, or a Cemu archive (`.wua`) made from it. On the first start the app extracts the game and recompiles its code on your device with LLVM; later starts load the compiled code in about half a second.

## Features

- **Dual-screen (AYN Thor):** the GamePad picture goes to the second screen by itself, with touch, and the main screen shows the TV picture; Graphics › GamePad screen switches back to the screen layouts.
- **APK without game code:** on the first start the app extracts the game from your disc image or `.wua` and recompiles its code on the device with LLVM (once; a few minutes on a fast phone). The work continues in the background with a progress notification and resumes where it stopped if the app is closed.
- **Frame generation** with Lossless Scaling's LSFG 3: 60, 90 or 120 fps.
- **60 fps by frame interpolation:** the game draws an extra frame between its 30 steps a second; 120 fps on screens with 120 Hz or more.
- **In-game options menu** in the style of the game's own menus, with tabs for saves, the game, graphics, mods and controls, usable by touch and with a controller.
- **Save states:** five slots with a picture, time and place of each state, and the controls it was saved with.
- **Import and export** of the game save and the save states to a folder of your choice.
- **Performance overlay:** frame rate, frame time, CPU and GPU load, temperatures, the graphics settings in use, the SoC, GPU and GPU driver.
- **USA, European and Japanese versions** of the game, with all features.
- **Game language** from your copy (USA: English, French, Spanish; Europe: also German and Italian; Japan: Japanese).
- **Custom GPU drivers** on Adreno GPUs: Mesa Turnip or newer Qualcomm drivers.
- **Widescreen:** the game renders at the screen's shape and shows more to the sides.
- **The Wii U's sun and haze:** the sun's corona and lens flare, the haze in the distance and the bloom around bright light.
- **Display options:** rendering resolution from 0.5× to 3×, aspect ratio, and screen layouts for the TV and GamePad pictures.
- **On-screen controls** for the whole GamePad, which hide while a controller is in use.
- **Gyro aiming** with the device's motion sensors or a controller's.
- **Rumble** on the controller in use, or on the device while playing by touch.
- **Gameplay mods:** climb any wall, direct right-stick camera, first person on R3, quick doors, fast scene changes.
- **Faster running and swimming:** Link runs and swims 1.25 up to 4 times as fast.
- **Fast forward:** hold ZR (R2) to run cutscenes and dialogues faster.
- **Crash logs:** if the game crashes, the next start offers its log in Android's share menu for a bug report.
- **No internet access:** the app doesn't request it, and its manifest explicitly excludes it.

## Enhanced fork

[SSunnKing's **Wind Waker HD Recompiled — Android Enhanced**](https://github.com/SSunnKing/ZeldaWWHDRecompAndroid---ENHANCED) is a fork of this Android port with better touch controls, graphics and performance: a floating left stick, camera by swiping, context buttons that follow your save data, a layout editor, native widescreen, fixed shadows, a pinch-to-zoom camera, and renderer and performance work. Its README does not mention dual-screen support, but it is a fork of the same project and its code still carries the second-display path (`DrcDisplay.java`, an Android `Presentation` on the AYN Thor's lower screen with touch), so dual-screen devices are likely supported there too.

## Requirements

- Android 11 or newer, 64-bit ARM, Vulkan 1.1, about 2 GB of free storage and, for the one-time compile, about 2 GB of free memory.
- Your own dump of The Wind Waker HD (USA, Europe or Japan): the disc image (`.wux` or `.wud`), its disc key (a `.key` file with the image's name) and the Wii U common key (`common.key`); or a Cemu archive of the game (`.wua`, already decrypted: no keys needed).
- For frame generation, your own copy of Lossless Scaling (`Lossless.dll`).

## Setup guide

1. Put the image and both keys in one folder on your device (or the `.wua` file alone).
2. Install the APK from the [latest release](https://github.com/GreenNaugahyde/ZeldaWWHDRecompAndroid/releases/latest) and start it. Choose **Extract from your disc image or .wua…** and select that folder.
3. The app extracts the game files, then prepares the game code for your device (once; about 6 minutes on a Snapdragon 7+ Gen 3, 9 minutes on a Snapdragon 855, 18 minutes on a Helio G85). A notification shows the progress and keeps the process alive.
4. The game starts. The first visit to each place may stutter briefly while its shaders compile, then they are cached.
