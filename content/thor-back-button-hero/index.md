---
title: "Thor Back Button Hero"
description: "A customizable back-button utility for the AYN Thor Android handheld."
date: "2026-10-31 09:38"
slug: "thor-back-button-hero"
category: "tool"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1y25k26/back_button_hero_20_just_released_its_finally/"
project_page: "https://github.com/denissteinhorst/thor-back-button-hero"
---

## Description

Back Button Hero is a customizable back-button and shortcut utility for the AYN Thor Android handheld. It gets more out of the Back button: double-tap for an app switcher on the bottom screen, hold to swap both screens, and put your favorite actions on L1, L2, R1, R2, the D-pad, the face buttons (A, B, X, Y), Start, Select and Home — screenshots, volume, brightness, controller focus, minimizing or closing the app in front, recording gameplay, macros, gyro control and more. No rooting is needed, and the app is free and open source.

The four Back gestures:

- **Single tap:** sends a regular Back or opens the launcher on the bottom screen.
- **Double tap:** opens an app switcher on the bottom screen, which the Thor does not have on its own. It shows a card for every app opened there, the available memory, and actions for a bottom-screen screenshot or closing all bottom-screen apps. Tap a card to open the app or swipe it up to close it. (Timing adjustable.)
- **Tap, then hold:** opens the system's Recents on the top screen. (Timing adjustable.)
- **Hold:** swaps the apps on the top and bottom screens. (Timing adjustable.)

Each gesture can be switched off in the app's settings. Hold L2 + R2 together for 300 ms to deactivate all Back gestures and shortcuts; hold again to reactivate them. While deactivated, Back and its combinations reach your game normally. Stick clicks always reach the game. Settings also offer L3 + R3 or L1 + R1, and a hold time from 100 to 3000 ms. A message confirms each change. Back Button Hero starts active after a device or service restart.

Hold Back and press another button to run a shortcut. The shoulder buttons L1, L2, R1, R2, the face buttons A, B, X, Y, the keys Home, Start, Select and the four D-pad directions can each be assigned any action from the list below. A button without an assignment is left alone, so games and apps still receive its normal input.

Available actions:

- Launch an app on the top or bottom screen
- Navigation flick to the previous or next app
- Home
- Back
- Recents
- Switch both apps
- Switch to last app
- Screenshot of the top screen, the bottom screen, or both
- Record video of the top screen, the bottom screen, or both, with optional microphone and push-to-talk
- Macro: play a recorded button sequence
- Gyro on/off: steer a stick by turning the handheld
- Volume up / down / mute on both screens, only the top, or only the bottom
- Brightness up / down on both screens, only the top, or only the bottom
- Media control: play/pause, next/previous track
- Set controller focus to the top or bottom screen, either as a toggle or fixed to one screen
- Switch active app
- Active App Control: minimize, force-close, or restart the app in front
- Close Apps: end every app on the chosen screens
- Power Menu, Standby
- Status Overlay: battery, time, temperature
- AYN controls: Performance Mode, Fan Control, Handle Style, Toggle Display Power, Refresh Rate, Stick Lighting, Direct Power Supply, Vibration, Force Landscape, Virtual Mouse, Do Not Disturb, Mute Microphone
- Quick Settings and notifications
- System settings pages: Wi-Fi and internet, Bluetooth, Night Light, Extra Dim, Display, Sound, Location, Cast, Do Not Disturb, Battery Saver
- Not set

The app is completely free, with no ads, no tracking, no account and no root required. It is fully open source (0BSD) and every setting is optional.

## Features

New in v2.0:

- **Two independent shortcut layers:** Dual mode gives Home its own gestures and button combinations, so Back + R1 and Home + R1 can run different actions.
- **More buttons to make your own:** A, B, X, Y, Start, Select and Home now join the shoulder buttons, D-pad and sticks as shortcut options.
- **Gameplay recording:** Record the top screen, bottom screen or both, with game audio and optional microphone commentary. Push-to-talk is available, including an option to lower game audio while you speak.
- **Record and edit your own macros:** Save a button sequence, adjust its inputs and pauses, and replay it with one shortcut. Named macros can be reused across different bindings.
- **Gyro control — Beta:** Tilt or turn your Thor to control either stick, with adjustable sensitivity, calibration and an optional hold-to-aim button.
- **An easier way to set everything up:** A visual overview of your bindings, searchable actions, guided options and a welcome setup with suggested shortcuts or a blank start. Updating keeps your existing settings.

There are also new shortcuts for media playback, switching to your last app, restarting apps, closing background apps, standby, refresh rate, stick lighting and more.

The bottom-screen app switcher, screen swapping and your existing shortcuts are still there.

On a fresh install, nothing is assigned: no Back gesture, no shoulder button, no D-pad direction, no stick direction or press, and no on/off shortcut. Back Button Hero does nothing until you assign something. Updating from an earlier version keeps the settings you had.

## Requirements

Requirements:

- AYN Thor handheld. Tested on an AYN Thor Max 16GB/1TB (Rainbow), 1st Batch, Android 13, firmware Thor_V1.0.0.377_20260206_165408_user. The app uses no model-specific features, so other Thor variants (Base, Pro, Max512) should work too.
- Android 11 (min SDK 30) or later.
- No root required. The D-pad shortcuts use a root service that AYN's firmware already provides; your device is not rooted.
- The app is not on the Play Store; install the APK from the Releases page.
- The accessibility service must be enabled in Android's settings for the app to work.

## Setup guide

Setup guide:

- Download the latest APK from the [Releases page](https://github.com/denissteinhorst/thor-back-button-hero/releases/latest).
- Install the APK on your Thor.
- Open Back Button Hero once and tap **Turn on accessibility service**.
- In Android's Accessibility settings, select Back Button Hero and switch on its service. Android will show a standard warning that the service can observe your actions and see what is on the screen; this is generic and shown for every accessibility app.
- Return to Back Button Hero and check that the service status shows as on.
- On Android 13 and later, allow notifications if you want update alerts.
- The app checks GitHub Releases for updates and notifies you when a newer one is available — no auto-install, it just links to the release page.
- For details, setup and an interactive App-Simulation, visit the [website](https://denissteinhorst.github.io/thor-back-button-hero/).
