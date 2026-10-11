---
title: "Bloodborne-Android"
description: "A native Android port of Bloodborne (PS4, v1.09) that runs on the AYN Thor with FSR 3.1 upscaling, frame generation and an on-screen controller."
date: "2026-10-11 06:21"
slug: "bloodborne-android"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/bloodborne-android/preview.webp"
  - type: "image"
    url: "/content/bloodborne-android/screenshot-2.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x2vi26/bloodborne_running_on_thor_8gen2_at_3x_fps_and/)

## Description

Bloodborne-Android is a port of Bloodborne (PS4, v1.09 — the executable shared by every retail release) for Android phones and handhelds. The runtime and renderer run natively on ARM64, FEXCore translates the game's x86-64 code, and Mesa Turnip drives the GPU.

The port is tested on the AYN Thor (Snapdragon 8 Gen 2, Adreno 740) and the Oppo Find N5 (Snapdragon 8 Elite, Adreno 830). It requires Android 9+ and 4 KB memory pages, and was tested with 16 GB RAM. The APK contains no game files — you supply your own dump of Bloodborne with the 1.09 update merged in.

It includes cheats, game settings (skip the online/offline screen, skip intros, free camera, debug menu), FSR 3.1 upscaling and frame generation, Lossless Scaling frame generation (2×/3×/4×, signed in through Steam), an on-screen PlayStation controller with an editable layout, and two Vulkan drivers picked automatically for your GPU. The picture stays 16:9 on any screen, including foldables.

## Setup guide

- Download the APK from the latest release and install it.
- Copy your own extracted dump of Bloodborne with the **1.09 update** merged into it to the device (any retail release works; the APK contains no game files).
- Open the app, select the folder containing `eboot.bin` (or the folder that holds it), and allow storage access. The first launch takes a few minutes.
- Swipe in from the left edge (or press Back) to open the menu with its Game, Graphics, Controls and Storage sections; each entry shows its current setting underneath.

Lossless Scaling frame generation:

- Open the menu → **Get Lossless.dll from Steam**.
- Scan the QR code with the Steam app on your phone (Steam Guard → scan QR code), or choose **Sign in with password instead** and enter your Steam Guard code.
- The app checks that your account owns Lossless Scaling and downloads only `Lossless.dll` (about 7 MB).
- Open **Lossless Scaling** in the menu and pick 2×, 3× or 4×. Lower flow scale and performance mode are faster; changes apply while you play.
- Lossless Scaling itself is not included: you need your own copy bought on Steam. You can also copy `Lossless.dll` from a PC (`steamapps/common/Lossless Scaling/Lossless.dll`) next to your game folder, e.g. `/sdcard/Bloodborne/Lossless.dll` beside `/sdcard/Bloodborne/CUSA03173`.

Notes:

- Use the original 1.09 `eboot.bin`. Some dumps ship with one that already has a 60 fps patch applied; that one crashes in the gestures menu.
- Updates keep settings and saves.
- On ColorOS / OxygenOS (Oppo, OnePlus) a "Security warning" about a malicious app may appear at launch — tap **Got it**; the game keeps running.

## Features

- **Cheats** — infinite health and infinite blood vials/items, switched on and off while you play.
- **Game settings** in the app's menu: skip the online/offline screen (straight to the main menu), skip intros, free camera, debug menu.
- **Lossless Scaling frame generation** (2×, 3×, 4×). Sign in with Steam in the app and it downloads `Lossless.dll` from your own copy of Lossless Scaling.
- **FSR 3.1** upscaling and **FSR 3.1 frame generation**. FSR 3.1 frame generation has poor image quality for now; try Lossless Scaling frame generation instead.
- **On-screen PlayStation controller** with an editable layout; physical controllers work too.
- **Two Vulkan drivers in one APK**, picked automatically for your GPU.
- 16:9 picture on any screen, including foldables.

## Supported games

Every retail release runs the same 1.09 executable, so all of them work:

- US: Bloodborne CUSA00900, Game of the Year / The Old Hunters CUSA03179
- EU: Bloodborne CUSA00207, Game of the Year / The Old Hunters CUSA03173
- UK: Bloodborne CUSA00208
- Japan: Bloodborne CUSA00299, Game of the Year / The Old Hunters CUSA03014
- Asia: Bloodborne CUSA01363, Game of the Year / The Old Hunters CUSA03023

See the project page: [github.com](https://github.com/ducvd89/Bloodborne-Android)
