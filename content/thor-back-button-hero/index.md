---
title: "Thor Back Button Hero"
description: "A customizable back-button utility for the AYN Thor Android handheld."
date: "2026-10-31 09:38"
slug: "thor-back-button-hero"
category: "tool"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xjw6mi/thor_back_button_hero_v140_out_now/"
project_page: "https://github.com/denissteinhorst/thor-back-button-hero"
---

## Description

Back Button Hero is a customizable back-button utility for the AYN Thor Android handheld. It gets more out of the Back button: double-tap for an app switcher on the bottom screen, hold to swap both screens, and put your favorite actions on L1, L2, R1, R2 and the D-pad — screenshots, volume, brightness, controller focus, minimizing or closing the app in front and more. No rooting is needed, and the app is free and open source.

The four Back gestures:

- **Single tap:** sends a regular Back or opens the launcher on the bottom screen.
- **Double tap:** opens an app switcher on the bottom screen, which the Thor does not have on its own. It shows a card for every app opened there, the available memory, and actions for a bottom-screen screenshot or closing all bottom-screen apps. Tap a card to open the app or swipe it up to close it. (Timing adjustable.)
- **Tap, then hold:** opens the system's Recents on the top screen. (Timing adjustable.)
- **Hold:** swaps the apps on the top and bottom screens. (Timing adjustable.)

Each gesture can be switched off in the app's settings. Hold L2 + R2 together for 300 ms to deactivate all Back gestures and shortcuts; hold again to reactivate them. While deactivated, Back and its combinations reach your game normally. Stick clicks always reach the game. Settings also offer L3 + R3 or L1 + R1, and a hold time from 100 to 3000 ms. A message confirms each change. Back Button Hero starts active after a device or service restart.

Hold Back and press another button to run a shortcut. The shoulder buttons L1, L2, R1, R2 and the four D-pad directions can each be assigned any action from the list below. A button without an assignment is left alone, so games and apps still receive its normal input.

Available actions:

- Launch an app on the top or bottom screen
- Navigation flick to the previous or next app
- Home
- Recents
- Screenshot of the top screen, the bottom screen, or both
- Volume up / down on both screens, only the top, or only the bottom
- Brightness up / down on both screens, only the top, or only the bottom
- Set controller focus to the top or bottom screen, either as a toggle or fixed to one screen
- Active App Control: minimizes the app in front or force-closes it, on the top screen, the bottom screen, both, or asks each time
- Quick Settings and notifications
- System settings pages: Wi-Fi and internet, Bluetooth, Night Light, Extra Dim, Display, Sound, Location, Cast, Do Not Disturb, Battery Saver
- Not set

The app is completely free, with no ads, no tracking, no account and no root required. It is fully open source (0BSD) and every setting is optional.

## Features

New in v1.4.0:

- **Frontend compatibility:** ES-DE Companion and NeoStation let their bottom screen step aside while you use another app there, and come back from their own card in bottom Recents. Cocoon keeps running out of sight, so its top screen stays in dual-screen layout. Swap a game away and quit it, and the other app returns to its screen, so ES-DE and Companion end up where they started. RetroArch keeps the controller after a swap (experimental). iiSU is not supported yet; Hero leaves it alone instead of fighting it.
- **A new bottom Recents:** looks like the system's own Recents, with real previews and light/dark theme. Fully D-pad navigable, including Screenshot and Close all. Optionally lists the apps from both screens.
- **Smoother swaps:** hold-to-swap now moves the running apps instead of restarting them, so games keep their state.
- **Active App Control shortcut:** minimize or force-close the app in front, on top, bottom or both.
- **Pause shortcut:** hold L2 + R2 to switch Hero off (e.g. when an emulator needs Back), hold again to resume.
- **Per-app exceptions:** choose which gestures and shortcuts each app keeps for itself.
- **Redesigned settings:** grouped pages, plus defaults and unbind per page with a preview.

Default hotkey assignments:

- L1: Navigation flick left
- R1: Navigation flick right
- L2: Screenshot, top screen only
- R2: Set controller focus: toggle between the screens
- D-pad up: Brightness up, both screens
- D-pad down: Brightness down, both screens
- D-pad left: Volume down, both screens
- D-pad right: Volume up, both screens

On a fresh install, or after Reset settings, a single tap opens the launcher on the bottom screen, a double tap opens the app switcher (300 ms window), tap then hold opens Recents on the top screen (1000 ms), and hold swaps both screens (1000 ms).

## Requirements

- AYN Thor handheld. Tested on an AYN Thor Max 16GB/1TB (Rainbow), 1st Batch, Android 13, firmware Thor_V1.0.0.377_20260206_165408_user. The app uses no model-specific features, so other Thor variants (Base, Pro, Max512) should work too.
- Android 11 (min SDK 30) or later.
- No root required. The D-pad shortcuts use a root service that AYN's firmware already provides; your device is not rooted.
- The app is not on the Play Store; install the APK from the Releases page.
- The accessibility service must be enabled in Android's settings for the app to work.

## Setup guide

- Download the latest APK from the [Releases page](https://github.com/denissteinhorst/thor-back-button-hero/releases/latest).
- Install the APK on your Thor.
- Open Back Button Hero once and tap **Turn on accessibility service**.
- In Android's Accessibility settings, select Back Button Hero and switch on its service. Android will show a standard warning that the service can observe your actions and see what is on the screen; this is generic and shown for every accessibility app.
- Return to Back Button Hero and check that the service status shows as on.
- On Android 13 and later, allow notifications if you want update alerts.
- The app checks GitHub Releases for updates and notifies you when a newer one is available — no auto-install, it just links to the release page.
