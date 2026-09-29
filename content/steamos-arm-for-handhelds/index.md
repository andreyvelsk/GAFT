---
title: "SteamOS ARM for Handhelds"
description: "Valve's official SteamOS for ARM, tuned for Snapdragon handhelds with Game Mode, desktop mode and dual-screen support on the AYN Thor."
date: "2026-09-29 06:20"
slug: "steamos-arm-for-handhelds"
category: "port"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wskk2e/steamos_arm_for_8_gen_2_handhelds_odin_2_thor/)

## Description

SteamOS ARM for Handhelds brings Valve's official SteamOS for ARM — the build made for the Steam Frame — to Snapdragon handhelds, with Game Mode and the KDE desktop just like on a Steam Deck. This first pre-release beta targets Snapdragon 8 Gen 2 (SM8550) devices: the AYN Odin 2 / Mini / Portal / Thor, the AYANEO Pocket ACE / DMG / DS / EVO / S 1K / S 2K, and the Retroid Pocket 6 / Nova. One image covers all devices — you pick yours in the ROCKNIX ABL menu and the system figures out the rest.

On the AYN Thor (and the AYANEO Pocket DS) the bottom screen gets its own dashboard in Game Mode: Steam/QAM/keyboard/screenshot buttons, performance profiles, brightness controls for both screens, stats, and pinned apps (browser, VLC, a guide) that keep running while the game plays on the top screen. As far as the developer knows, it's the first time Valve's own SteamOS uses the second screen in Game Mode.

## Features

- x86 games through FEX and ARM64 Proton
- the controller shows up as a Steam Deck controller, back buttons too
- Lossless Scaling frame generation on ARM, Decky and the performance overlay
- standby that actually saves battery (around 1W) and a proper fan curve
- Android apps with the Play Store
- updates install over your current system, no reflashing

## Setup guide

Download the [latest release](https://github.com/hashtagbasit/SteamOS-ARM-Handhelds/releases/latest) and flash it to an SD card, then boot your device and pick your model in the ROCKNIX ABL menu. This is a pre-release beta, so if something doesn't work, report it with your device name on GitHub, Discord or in the comments.

## Known issues

The developer doesn't own any of the 8 Gen 2 devices, so all debugging and progress depends on tester reports — this is a pre-release beta and you are testing. If you have one of the supported devices and don't mind flashing an SD card, try it and tell the developer what works and what's broken (GitHub issue, Discord or a comment, saying which device you have). Pocket FIT and Pocket S2 owners: this build isn't for you — stay on v1.2, your v1.3 comes as an update later.

See the project page: [github.com](https://github.com/hashtagbasit/SteamOS-ARM-Handhelds)
