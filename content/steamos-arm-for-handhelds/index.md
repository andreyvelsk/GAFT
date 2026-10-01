---
title: "SteamOS ARM for handhelds"
description: "An unofficial port of Valve's SteamOS ARM that brings Steam Deck-style Game Mode and Desktop Mode to the AYN Thor and other Snapdragon handhelds."
date: "2026-10-01 06:48"
slug: "steamos-arm-for-handhelds"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/steamos-arm-for-handhelds/preview.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wuom2l/steamos_arm_port_now_runs_on_the_8_elite_and_a/)

## Description

SteamOS ARM for handhelds is an unofficial port of Valve's SteamOS for ARM — the build Valve made for the Steam Frame — to Snapdragon handhelds. On the AYN Thor you get Game Mode and the KDE desktop just like on a Steam Deck. Because the Frame software was made for a VR headset, the port spends a lot of effort fixing what makes it annoying on a handheld: battery drain, fan control, lag, and the broken overlay. The Thor is supported by the Snapdragon 8 Gen 2 image (v1.3 beta 9), and on the Thor the bottom screen gets its own dashboard in Game Mode.

## Setup guide

Download the latest release for your chip from the project's releases page. For the AYN Thor (Snapdragon 8 Gen 2), grab the v1.3 beta 9 image, write it to an SD card and boot from it. There is one image per chip — pick your device in the ABL menu and the system figures out the rest. Updates install over your current system, so there is no reflashing. If something breaks, create a file called `debug` on the SD card's BOOT drive and send the logs to the project's Discord or GitHub.

## Features

- Game Mode and Desktop Mode, with x86 games running through FEX and ARM64 Proton.
- The controller shows up as a Steam Deck controller, back buttons included.
- On the AYN Thor the bottom screen gets its own dashboard in Game Mode: Steam buttons, profiles, brightness, and any apps you want down there.
- Standby that actually saves battery (around 1W, versus 3W+ on the stock image) and a proper fan curve.
- Lossless Scaling frame generation on ARM, Decky, and the performance overlay.
- Android apps with the Play Store.
- Updates install over your current system, no reflashing.

## Known issues

These are beta releases, so expect some rough edges. The 8 Gen 2 image went through nine betas in four days to get from a black screen on everything to one image that boots on all supported devices. If something breaks, make a file called `debug` on the SD card's BOOT drive and send the logs on Discord or GitHub — that is how most of these fixes happened.

See the project page: [github.com](https://github.com/hashtagbasit/SteamOS-ARM-Handhelds)
