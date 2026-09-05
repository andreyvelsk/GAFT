---
title: "Metroid Prime Hunters"
description: "A native Android port of the Metroid Prime Hunters recompilation with true dual-screen support and touch controls for the AYN Thor"
date: "2026-09-05 07:00"
slug: "metroid-prime-hunters"
category: "game"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=tvqnW6J6KU0"
---

See actual dual-screen gameplay in source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1w7pl20/metroid_prime_hunters_recomp_is_now_available_for/)

## Description
The top screen fills the Thor's main display, while the bottom screen lives on the second panel with working touch (stylus) input. Controls are twin-stick Prime-style: the left stick moves, the right stick aims, and the triggers shoot — melonPrimeDS-style bindings. Rendering is handled by the desktop GL 4.3 compute renderer ported to GLES 3.2, running on the Adreno 740 with up to 4x internal resolution and xBR texture upscaling.

Every touchscreen-mapped action can be rebound to physical buttons from the settings launcher, where you can also tune aim/stylus sensitivity and pick video quality. Holding SELECT fast-forwards through cinematics.

**No game data is included.** You must supply your own dump of your own cartridge — the app hash-verifies it and refuses anything else. Requires the USA revision 0 release of Metroid Prime Hunters (`AMHE`, 64 MiB, SHA-1 `90164d1ac127ee5f9815ea4ae7de798c7b5fc629`).

## Setup guide
1. Install the APK from the [Releases](https://github.com/aabrole/HuntersRecomp/releases) page.
2. Copy your ROM dump to the app's data folder as `mph.nds`:
   ```
   adb push "Metroid Prime Hunters.nds" /sdcard/Android/data/com.thor.mph/files/mph.nds
   ```
   (or copy it there with any file manager after launching the app once)
3. Launch **Hunters Recomp**, adjust settings if you like, press **PLAY**.

See the project page: [github.com](https://github.com/aabrole/HuntersRecomp)
