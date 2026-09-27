---
title: "SleepManager"
description: "Android sleep/wake manager that cuts standby battery drain on the AYN Thor and other handhelds."
date: "2026-09-27 18:22"
slug: "sleepmanager"
category: "app"
media:
  - type: "video"
    url: "https://youtu.be/MATer9L8E1s?si=uhFrzt0F5maFB6eY"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wr105i/make_your_ayn_thor_run_even_longer_sleepmanager/)

## Description

SleepManager is an Android app that reduces standby battery drain on handhelds like the AYN Thor. The basic idea: when your handheld sleeps, stop or disable what doesn't need to be running, and restore it properly when you wake the device. It can manage Wi-Fi, Bluetooth, Syncthing-Fork, BasicSync, Tailscale and JamesDSP, and it was born out of the developer's frustration with Android handheld standby drain — some devices lost around 14% overnight or were completely dead after a few days. No root, Shizuku or ADB is required for normal use.

## Setup guide

1. Download and install the latest SleepManager APK from the [latest release](https://github.com/Baggio94/SleepManager/releases/latest).
2. Install the optional SleepManager Helper if you want Wi-Fi or Bluetooth control.
3. Open SleepManager and choose what you want it to manage during sleep.
4. Enable SleepManager, then tap **Finish setup**.

SleepManager always tries to restore only what it changed — for example, if Wi-Fi was already off before sleep, it stays off after wake.

## Features

- Turn **Wi-Fi** and **Bluetooth** off during sleep and restore them safely on wake.
- Pause and resume **Syncthing-Fork**; manage **BasicSync**, **Tailscale** and **JamesDSP**.
- Run optional syncs before sleep, after wake or periodically while sleeping with supported providers (advanced sync modes require BasicSync 3.19+).
- Track sleep battery drain, mAh use, deep sleep and standby estimates, including a 7-day average and best/worst measured drain.
- Keep an activity log and copyable diagnostics.
- Check and install stable updates from inside the app.

## AYN Thor

SleepManager adds extra options when it detects the Thor lid sensor. **Closed-lid protection** puts the Thor back to sleep if it wakes unexpectedly while the lid is still closed, instead of restoring Wi-Fi, Bluetooth and other services too early — this needs Android **Device Admin** permission. It understands when an external display is connected, so docked use is not treated as a false wake. Optional Thor controls include **Sleep when external display disconnects** and **Power button sleeps with lid closed**.

See the project page: [github.com](https://github.com/Baggio94/SleepManager)
