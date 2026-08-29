---
title: "Eden DS"
description: "An Android-focused fork of the Eden emulator with a dedicated dual-screen companion for the AYN Thor. Currently supports The Legend of Zelda: Breath of the Wild and Mario Kart 8 Deluxe."
date: "2026-08-29 12:59"
slug: "eden-ds"
category: "emulation"
media:
  - type: "image"
    url: "/content/eden-ds/preview.webp"
---

source: [reddit](https://www.reddit.com/r/AynThor/comments/1vya2n0/mario_kart_8_dualscreen_update_breath_of_the_wild/)

## Description
Eden DS is an Android-focused fork of the Eden emulator, that adds a dedicated, always-on companion interface for dual-screen devices. Gameplay stays on the primary display while a touch-first UI runs on Android's presentation display. The companion is integrated into the emulator and reads live guest state through build-checked bridges — it does not mirror the primary display or run a second copy of the game renderer.

## Supported games
The current supported games are:

- **The Legend of Zelda: Breath of the Wild** — always-on Inventory, Map and Quests pages designed for touch, live health, stamina, rupees, equipment, runes and Champion abilities, terrain map with player position, shrines, pan and pinch-to-zoom, fast-travel requests, and live quest tracking.
- **Mario Kart 8 Deluxe** — Wii U GamePad-inspired layout, live 12-racer standings with portraits, course-specific track maps with real-time racer projection, two live item slots with touch activation, and live coin count.

Compatibility is intentionally strict: the live-memory bridge is enabled only when both the title ID and the main-module Build ID match, so unsupported builds fail closed instead of reading unknown memory layouts.

The actual list of supported games is on the project page and may change as new companions are added.

## Setup guide
See the project page: [github.com](https://github.com/JoeCorrell/Eden-DS)