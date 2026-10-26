---
title: "OpenFusion:Pocket"
description: "An unofficial native Android client for FusionFall with optional dual-screen companion panels."
date: "2026-10-26 07:28"
slug: "openfusion-pocket"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/openfusion-pocket/preview.webp"
  - type: "image"
    url: "/content/openfusion-pocket/screenshot-2.webp"
  - type: "image"
    url: "/content/openfusion-pocket/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1xew036/openfusionpocket_v20_fusionfall_on_android_with_a/)

## Description

OpenFusion:Pocket is an unofficial community preservation project that provides a native Android client for FusionFall, rebuilt in Unity 2022.3 LTS. Development and device testing currently focus on FusionFall Retrobution. It runs as an Android application without running the Windows client through Wine or Winlator, and it does not compile the original client or recompile Unity on your phone.

The client includes an optional **DS Companion** interface that keeps the game world on the main screen and shows useful panels on a second screen. It supports compatible physical dual-screen Android handhelds and unfolded foldables, with testing on the AYN Thor and Galaxy Z Fold. Regular phones and tablets keep the full single-screen experience — there is no forced split just because the display is large.

## Features

The DS Companion panels on the second screen use your actual character data and existing game systems:

- **Map:** local/world views, original game icons, filters, zoom and live position.
- **Nanos:** animated previews, collection, energy and assigned powers. Tap an equipped Nano to summon it, or manage equipment and powers at a Nano Station.
- **Equipment:** character preview with touch rotation, inventory and live stats. Selecting an item opens its original details and actions on the main screen.
- **Missions:** active/completed lists, objectives, progress, rewards and tracking.
- **E-Mail (new in v2.0):** Guide/Player folders, unread indicators, message reading and received attachments. Composing and replying use the original interface on the main screen.
- **Nano Boost, Attack Boost and Taros counters**, also available in the companion interface.

Additional client features include:

- Launcher navigation with the stick/D-pad and A/B and L1/R1.
- A touch layout editor, saved profiles and a controller-style preset.
- Optional encrypted password saving using Android Keystore.
- Gamepad support, launcher focus navigation and an in-game UI cursor; touch controls can hide while a controller is connected.
- Server selection, staged game-resource downloads and persistent caching with integrity checks.
- Retrobution 3.0.3 Halloween ambience, green rim lighting, audio and NPC hats.
- Optional experimental Vulkan, with OpenGL ES remaining the default.
- Opening cinematic and guided Tech Square practice.

## Setup guide

1. Open the [latest release](https://github.com/rsigristc/OpenFusion-Pocket/releases/latest) and download the **OpenFusion-Pocket APK**.
2. Allow installation from your browser or file manager when Android asks, then install the APK.
3. Open the app, choose a server and sign in with an account for that server. An internet connection is required.
4. Initial game-resource downloads require additional storage and time; Wi-Fi is recommended. Server availability and account registration are managed by each server's operators.
5. To update an existing installation signed with the same certificate, install the update over it to retain your data and cache.

The build targets Android 6.0 / API 23 or newer, with ARMv7 and ARM64 included. For dual-screen use, choose **Automatic / Single Screen / Dual Screen** in the Dual Screen settings, available in the launcher Game Settings and in-game Settings.

## Known issues

- DS Chat opens the existing game interface rather than a dedicated companion panel.
- The tutorial is an adaptation rather than complete Legacy parity.
- Support depends on Android display, posture and input reporting, so it does not guarantee every dual-screen device or foldable; device and server compatibility varies.
- Experimental Vulkan is not a guaranteed frame-rate boost.
- Visual fidelity, loading time, memory use and input behavior can vary by device.
- An external display alone is insufficient for the companion: physical secondary screens need usable dimensions and a touch confirmation in settings.

See the project page: [github.com](https://github.com/rsigristc/OpenFusion-Pocket)
