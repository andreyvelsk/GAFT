---
title: "Wayfinder"
description: "Wayfinder moves apps between the AYN Thor's two screens, sends the controller where you want it, and puts the Thor's settings one press away."
date: "2026-09-29 06:17"
slug: "wayfinder"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/wayfinder/preview.webp"
  - type: "image"
    url: "/content/wayfinder/screenshot-2.webp"
  - type: "video"
    url: "https://youtu.be/YkOjooy4elU?is=mel4LaQrhch-pV4Z"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wsiwyo/wayfinder_is_a_necessity/)

## Description

Wayfinder is a free app for the AYN Thor that makes its two screens work as one. It moves and swaps apps between the screens live — the app keeps running and keeps its state — sends the controller to the screen you want, gives every game its own buttons, and puts the Thor's settings one press away, all without leaving your game. A quick review calls it much better than the default AYN home button menu: it fixes major complaints with the Thor's UI and navigation, with better controller assignment to the top and bottom screens, a more intelligent keyboard, audio mixing, volume button fixes and much more.

## Features

Move and swap apps between the screens live — the app keeps running (hold Back). Combos on Home, Back and the AYN button for 30+ actions, with a cheat sheet when you hold Home. Game controls (Home + X): remap any button per app or per game — keys, mouse, macros, gyro. Keyboard & mouse (Home + Y) on the other screen: PC keys, a trackpad (with a Touch mode), your own pad, the game's guide. Quick panel (AYN button) over your game: brightness, volume, performance, fan, 45 shortcut tiles. Per-app profiles: screen, performance, fan, refresh rate, lights, controls. Audio: per-screen volume, volume boost up to +12 dB, a speaker fix with EQ, and separate EQ for headphones and Bluetooth. FPS counter with battery and temperatures, stick lights, screenshots and screen recording, sleep & standby actions, and a guide & notes companion. No root, no PC: one-press setup.

## Setup guide

Download the [latest release](https://github.com/Thor-Wayfinder/thor-wayfinder/releases/latest) from the GitHub releases page and install the APK on your Thor (stock system, "Force SELinux" off — the default). No root, no computer and no Shizuku are needed. Beta users should uninstall the old "Thor Wayfinder" app first. Open Wayfinder: the welcome tour sets everything up (accessibility service, keyboard, background running) and teaches the combos by doing them. Step-by-step help for every feature is in the project's wiki.

## Known issues

Since version 1.4, Wayfinder leaves the CPU to ClusterTune and Pulse, so they can stay installed together. With SleepManager, Wayfinder's sleep actions and lid guard stay off unless you turn them on. If another app does the same job as a part of Wayfinder (Mjolnir, BiFrost, OdinTools), the Hub tells you what to do. If ClusterTune and Wayfinder gave you trouble before, restart your Thor once after updating. Wayfinder works around Android's limited support for two screens: most apps move fine, but a few heavy or unusual apps may restart or refuse to move.

See the project page: [github.com](https://github.com/Thor-Wayfinder/thor-wayfinder)
