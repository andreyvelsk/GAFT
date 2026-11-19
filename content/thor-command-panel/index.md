---
title: "Thor Command Panel"
description: "A user-installable replacement for the AYN Thor's stock dual-screen assistant, rebuilt around themes and customization."
date: "2026-11-19 10:24"
slug: "thor-command-panel"
category: "tool"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xzjvt4/thor_command_panel_a_fully_customizable_assistant/"
project_page: "https://github.com/BrianJr03/command-panel"
---

## Description

Thor Command Panel (TCP) is a user-installable replacement for the AYN Thor's stock Dual-Screen Assistant. It handles the essentials — screen modes, brightness, volume, quick-setting tiles and live hardware telemetry — then goes well past the original with themes, a Theme Studio for building your own looks, a companion settings app, and more. It ships 16 overlay themes (plus the stock look) that re-skin the whole panel live, fonts included.

## Features

- Everything the stock assistant does: a bottom-screen overlay answering the AYN hardware button, screen modes (dual, top-only, bottom-only with real screen blanking), brightness and volume for each screen, a 60/120 Hz toggle with a live FPS readout, quick-setting tiles, hardware telemetry (temperature, fan, CPU/GPU/power/RAM gauges), and Task and Settings dialogs.
- Theme Studio to mix parts from any look or build one from scratch (custom parts, shapes, colors, your own fonts) with a live preview, and to share looks as packs or follow GitHub theme repos for updates.
- 16 overlay themes — Aurora Glass, Tactical HUD, Terminal, Segment LCD, Comic Panel, Cockpit, Neon Arcade, Bloom, Jelly, Y2K Chrome, E-Ink, and more — each restyling cards, tiles, gauges, sliders and fonts.
- A companion settings app that is fully gamepad-navigable, with a guided tour of every section on first launch.
- Customizable tiles you can turn on or off and drag-and-drop to reorder.
- Arrange mode to long-press the overlay and drag-and-drop its cards into any layout.
- Replay Buffer, a rolling screen-capture buffer you can dump to an MP4 clip, capturing the top screen, the bottom screen, or both stacked into one video.
- Ambient-LED accent sync that follows the Thor's stick LED color.
- Quick Launch, a one-tap app launcher button in the nav bar.
- Battery time estimate and an option to hide the network-speed readout.
- Settings backup and restore.
- In-app updates that check GitHub for new releases, show patch notes, and install in one press.
- Full gamepad navigation across the whole UI.

## Requirements

- An AYN Thor, the dual-screen Android handheld this targets.
- The stock Dual-Screen Assistant present on the device — Command Panel loads AYN's icons from it at runtime rather than bundling copies.
- Root is obtained through the Thor's own PServerBinder, the same mechanism the stock app uses — no custom firmware or unlock needed.
- A Replace Stock Assistant toggle decides whether Command Panel or the built-in app answers the hardware button.
- If Better Dual Screen Assistant is installed, Command Panel detects it and stands by while BDSA's Replace stock assistant is on; it takes over automatically when that option is turned off.

## Setup guide

- Download and install the latest release from the releases page.
- Install Command Panel side-by-side with the stock assistant; use the Replace Stock Assistant toggle to decide whether Command Panel or the built-in app answers the hardware button.
- To save Replay Buffer clips from Back Button Hero, install TCP SC (tcp-sc-<version>.apk) after Command Panel, or press Install on the TCP SC card in General.
- In Back Button Hero, pick a gesture or a Back + button combo, then choose Launch app → TCP SC → bottom screen, so the game on the top screen keeps focus.
