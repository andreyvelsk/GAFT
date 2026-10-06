---
title: "DuoFrost"
description: "An open-source LED control app for AYN devices with ambient colors, audio-reactive effects, widgets and sleep timers."
date: "2026-10-06 06:33"
slug: "duofrost"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/duofrost/preview.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wymjac/duofrost_210_released_audio_fixes_safer_presets/)

## Description

DuoFrost is an open-source continuation of BiFrost that brings screen-matching ambient colors, audio-reactive lighting and custom LED effects to AYN devices, with practical controls for everyday use. It keeps BiFrost's ambient screen colors, audio-reactive effects, Ambi Aurora, separate left/right controls, presets and app profiles, and also retains theme and backup sharing, charging/battery indicators and temperature effects. DuoFrost installs alongside BiFrost: presets, themes or backups can be exported from BiFrost and imported into DuoFrost, and only one LED controller should run at a time. The maintainer's device is the AYN Thor.

## Features

- Better background control: keep lighting running after closing the app or using Clear all, with recovery controls when Android interrupts it.
- Brightness limits: choose a maximum output, a Battery Saver limit and optional dimming when the screen is off.
- Sleep timer and temporary mute: choose a duration from 1 to 120 minutes, use a timer quick choice or silence the LEDs while keeping the current effect ready to resume.
- Home-screen widgets: Start/Stop, mute/unmute and a favorite preset without navigating through settings.
- More flexible schedules: choose weekdays or weekends, including schedules that continue overnight.
- Small everyday conveniences: an easier Quick Settings tile setup, a six-step LED test, and separate backup of lighting and background settings.
- Ambient fixes: more faithful purple/pink colors, improved custom single-color sampling and more reliable capture cleanup.
- Audio and sharing fixes in 2.1.0: audio effects stop cleanly after capture errors and use fewer hardware calls; safer preset imports, better detection of unsaved custom colors and clear export failures.

## Requirements

- An AYN device (the maintainer's device is the AYN Thor).
- Ambient and audio effects need capture permission. These effects process samples locally and do not record or upload captured content.
- For background lighting, allow DuoFrost to run in the background in Android's battery settings.
- After an Android Force stop, open the app again.

## Setup guide

- If you already use an older DuoFrost version, export a full backup from the old app and save it outside the app before uninstalling.
- Uninstall the old DuoFrost, then install 2.1.0.
- Download the APK from the [latest release, 2.1.0](https://github.com/Tufein/DuoFrost/releases/latest).
- Open it on your AYN device and follow the first-run guide.
- Import your backup and grant the permissions you need again.
- Pick an effect, adjust your colors and brightness, and enable only the permissions you need.
- Keep your backup until you have checked that everything restored correctly.

See the project page: [github.com](https://github.com/Tufein/DuoFrost)
