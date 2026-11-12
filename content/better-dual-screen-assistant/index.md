---
title: "Better Dual Screen Assistant"
description: "A drop-in replacement for the stock dual-screen assistants on the AYN Thor and Retroid Pocket Duo that adds customizable quick settings, live hardware telemetry, screen recording, and system-wide theming."
date: "2026-11-01 06:53"
slug: "better-dual-screen-assistant"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/better-dual-screen-assistant/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xti8he/appupdate_betterdualscreenassistant_120_rp_duo/"
project_page: "https://github.com/stormpanda/better-dual-screen-assistant"
---

## Description

Better Dual Screen Assistant is a user-installable drop-in replacement and feature-packed upgrade for the built-in DualScreenAssistant system app on the AYN Thor (Snapdragon 8 Gen 2, Android 13) and Retroid Pocket Duo (Moorechip CQ7790S, Android 16) dual-screen handhelds. It preserves 1:1 visual and functional parity with each device's stock assistant while adding interchangeable AYN Smooth and Retroid Pixel UI looks across all themes, a gamepad-first top-screen companion settings app, 24 customizable and reorderable Quick Setting tiles, hardware-accelerated dual-screen and internal audio recording, an accurate per-task game FPS counter, screen task swapping, Stick LED brightness control, Megingiard theme palettes with live sync, Android 13–16 Monet OS theme injection, in-app update checks with Obtainium integration, and a sub-millisecond UID 0 Binder helper daemon with Direct Boot support, persistent service supervision, and automatic uninstall recovery.

Version 1.1.0 adds an accurate FPS counter that reads real gameplay frame counts, a background service that is not killed by cleaning recents (and no longer appears in recents), Celsius/Fahrenheit temperature readouts, a more intuitive toggle UI, a fix that restores the GameAssistant swipe-in from the right edge of the top screen, improved Touch UI, and a much smaller app size (2.2 MB, down from 39.3 MB).

Version 1.2.0 adds support for the Retroid Pocket Duo, a second pixel-styled UI look (Retroid Pixel) alongside AYN Smooth that works with all existing themes, and hardware-accelerated screen recording for the top, bottom, or both screens stitched together automatically, with device audio and optional microphone mixing.

## Features

- Bottom-screen assistant overlay with Mode and Settings tabs
- Screen mode control: dual-screen display, only top screen, only bottom screen, plus a one-tap Swap Screens button that swaps foreground app tasks between the two screens
- Linked brightness sliders for dual, top, and bottom screens with zero-lag hardware brightness during drag, plus an optional Stick LED brightness slider (0%–100% on AYN Thor)
- Linked volume sliders for dual, top, and bottom screens
- One-tap 60 FPS / 120 FPS mode toggle with an accurate game FPS counter that measures real foreground frame delivery, with an option to use the stock SurfaceFlinger counter
- 24 customizable Quick Setting tiles in a paged 2 × 4 grid, swipeable by touch or L1/R1 shoulder buttons
- Stock vendor toggles (up to 10, enabled by default): Focus Lock, Performance Mode, Fan Control, Clear Memory, Controller Style, Charging Separation, Vibration, LED Lights, Force Landscape, and Theme Mode
- Android system toggles (4, optional): Wi-Fi, Bluetooth, Do Not Disturb, and Airplane Mode
- Tools (up to 10, optional): Touch Lock, Screenshot (top/bottom/both), Screen Record, Trigger Mode, 80% Charge Limit, Mouse Mode, Key Mapper, Keep Screen On, Home Lock, and Clear All Tasks
- Screen recording: hardware MediaCodec H.264 + 48 kHz AAC capture of the top, bottom, or both screens (GPU-composited) at 30/60 FPS, with privileged internal game audio loopback and optional microphone mixing, saved to /sdcard/Movies/ScreenRecordings
- Live hardware telemetry: SoC temperature (°C/°F), fan speed, CPU frequency, GPU frequency, battery power draw, and RAM usage
- Top status bar with live clock, Bluetooth indicator, network RX speed, Wi-Fi signal bars, a custom battery icon, and an interactive recording timer/stop pill while capturing video
- Gamepad-first two-pane companion settings app on the top screen with live preview on the bottom screen
- Visual quick-toggle reordering with touch tap-to-swap and gamepad grab-and-move
- Two interchangeable UI looks on both devices: AYN Smooth and Retroid Pixel (50+ pixel-art vector icons, bundled pixel fonts, and an optional Improve Retroid Readability boost)
- Theming: Stock (Follow System, Light, Dark), 8 built-in custom palettes, 13 accent presets, a custom HSV color picker, and Megingiard sync
- Android 13–16 Monet OS theme injection that themes SystemUI, Quick Settings, Notifications, and Material You apps system-wide
- In-app updates: automatic 24-hour GitHub release checks with an update banner, manual Check for Updates, and one-tap Add to Obtainium
- Direct Boot support so the assistant works immediately on boot before unlock
- Safe ephemeral stock suppression with automatic uninstall/force-stop recovery that restores brightness, touch, and the stock assistant on both devices

## Requirements

- AYN Thor handheld (Snapdragon 8 Gen 2, Android 13) or Retroid Pocket Duo (Moorechip CQ7790S, Android 16)
- Replaces the built-in system app DualScreenAssistant (com.odin.dualscreen.assistant on AYN Thor, com.retroidpocket.dualscreen.assistant on Retroid Pocket Duo)
- Latest release APK from the GitHub releases page

## Setup guide

Download the latest release from the GitHub releases page and install the APK on your AYN Thor or Retroid Pocket Duo. The app is a user-installable drop-in replacement for the stock DualScreenAssistant, so no system modifications are required. For the best experience, navigate the app with the controller. For automatic updates, add the project to Obtainium.
