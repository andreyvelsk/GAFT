---
title: "Better Dual Screen Assistant"
description: "A drop-in replacement for AYN's DualScreenAssistant that adds customizable quick settings, live hardware telemetry, and system-wide theming for the AYN Thor's dual screens."
date: "2026-11-01 06:53"
slug: "better-dual-screen-assistant"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/better-dual-screen-assistant/preview.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xk8oze/betterdualscreenmanager_110_update/"
project_page: "https://github.com/stormpanda/better-dual-screen-assistant"
---

## Description

Better Dual Screen Assistant is a user-installable drop-in replacement and feature-packed upgrade for the built-in system app DualScreenAssistant on the AYN Thor (Snapdragon 8 Gen 2, Android 13) dual-screen handheld. It preserves 1:1 visual and functional parity with the stock assistant while adding a gamepad-first top-screen companion settings app, 22 customizable and reorderable Quick Setting tiles across three categories, screen task swapping, Stick LED brightness control, Megingiard theme palettes with live sync, Android 13 Monet OS theme injection, and a sub-millisecond UID 0 Binder helper daemon with automatic uninstall/force-stop recovery.

Version 1.1.0 adds an accurate FPS counter that reads real gameplay frame counts, a background service that is not killed by cleaning recents (and no longer appears in recents), Celsius/Fahrenheit temperature readouts, a more intuitive toggle UI, a fix that restores the GameAssistant swipe-in from the right edge of the top screen, improved Touch UI, and a much smaller app size (2.2 MB, down from 39.3 MB).

## Features

- Bottom-screen assistant overlay with Mode and Settings tabs
- Screen mode control: dual-screen display, only top screen, only bottom screen, plus a one-tap Swap Screens button
- Linked brightness sliders for dual, top, and bottom screens, plus an optional Stick LED brightness slider (0%–100%)
- Linked volume sliders for dual, top, and bottom screens
- One-tap 60 FPS / 120 FPS mode toggle with a live SurfaceFlinger FPS readout
- 22 customizable Quick Setting tiles in a paged 2 × 4 grid, swipeable by touch or L1/R1 shoulder buttons
- Stock AYN toggles (10, enabled by default): Focus Lock, Performance Mode, Fan Control, Clear Memory, Controller Style, Charging Separation, Vibration, Ambient Light, Force Landscape, and Theme Mode
- Android system toggles (4, optional): Wi-Fi, Bluetooth, Do Not Disturb, and Airplane Mode
- Tools (8, optional): Bottom Touch Lock, Screenshot (top/bottom/both), L2/R2 Trigger Mode, 80% Charge Limit, Virtual Mouse, Key Mapper Overlay, Keep Screen On, and Double-Tap HOME
- Live hardware telemetry: SoC temperature, fan speed, CPU frequency, GPU frequency, battery power draw, and RAM usage
- Top status bar with live clock, Bluetooth indicator, network RX speed, Wi-Fi signal bars, and custom battery icon
- Gamepad-first two-pane companion settings app on the top screen with live preview on the bottom screen
- Visual quick-toggle reordering with touch tap-to-swap and gamepad grab-and-move
- Theming: Stock AYN (Follow System, Light, Dark), 8 built-in custom palettes, 11 accent presets, a custom HSV color picker, and Megingiard sync
- Android 13 Monet OS theme injection that themes SystemUI, Quick Settings, Notifications, and Material You apps system-wide
- Safe ephemeral stock suppression with automatic uninstall/force-stop recovery that restores brightness, touch, and the stock assistant

## Requirements

- AYN Thor handheld (Snapdragon 8 Gen 2, Android 13)
- Replaces the built-in system app DualScreenAssistant (com.odin.dualscreen.assistant)
- Latest release APK from the GitHub releases page

## Setup guide

Download the latest release from the GitHub releases page and install the APK on your AYN Thor. The app is a user-installable drop-in replacement for the stock DualScreenAssistant, so no system modifications are required. For the best experience, navigate the app with the controller.
