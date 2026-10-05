---
title: "DuoFrost"
description: "An open-source LED control app for AYN devices with ambient colors, audio-reactive effects, widgets and sleep timers."
date: "2026-10-05 06:39"
slug: "duofrost"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/duofrost/preview.webp"
  - type: "image"
    url: "/content/duofrost/screenshot-2.webp"
  - type: "image"
    url: "/content/duofrost/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wxuhst/duofrost_led_control_for_ayn_devices_bifrost_fork/)

## Description

DuoFrost is an open-source fork of BiFrost that brings screen-matching colors, audio-reactive lighting and custom LED effects to AYN devices. It keeps BiFrost's ambient screen colors, audio-reactive effects, Ambi Aurora, separate left/right controls, presets and app profiles, as well as theme and backup sharing, charging/battery indicators and temperature effects. On top of that it adds better background controls, adjustable brightness limits, sleep timers, temporary LED mute, home-screen widgets, weekday/weekend schedules, separate backups of lighting and background settings, ambient color fixes and a simple LED test. DuoFrost is tested on the AYN Thor and AYN Odin 3 and is released under GPLv3.

## Features

- Ambient screen colors and audio-reactive effects, including Ambi Aurora.
- Separate left/right stick controls, presets and app profiles.
- Theme and backup sharing, charging/battery indicators and temperature effects.
- Background controls that keep lighting running after closing the app or using Clear all, with recovery controls when Android interrupts it.
- Brightness limits: a maximum output, a Battery Saver limit and optional dimming when the screen is off.
- Sleep timer of 5, 15, 30, 60 or 120 minutes, plus temporary LED mute that keeps the current effect ready to resume.
- Home-screen widgets for Start/Stop, mute/unmute and a favorite preset.
- Weekday/weekend schedules, including schedules that continue overnight.
- Six-step LED test and separate backup of lighting and background settings.
- More faithful purple/pink ambient colors, improved custom single-color sampling and more reliable capture cleanup.

## Requirements

- An AYN device (tested on the AYN Thor and AYN Odin 3).
- Android with sideloading enabled to install the APK.
- Capture permission for ambient and audio effects; captured samples are processed locally and are not recorded or uploaded.
- Permission to run in the background in Android's battery settings for background lighting.

## Setup guide

- Download the APK from the latest release.
- Open it on your AYN device and follow the first-run guide.
- Pick an effect, adjust your colors and brightness, and enable only the permissions you need.
- For updates through Obtainium, add the DuoFrost repository.
- Coming from BiFrost: export your presets, themes or backup from BiFrost and import them into DuoFrost. Both apps can be installed alongside each other; run one LED controller at a time.
- After an Android Force stop, open the app again.

See the project page: [github.com](https://github.com/Tufein/DuoFrost)
