---
title: "Megingiard"
description: "Allows you to customize the bottom screen with screen mirroring, virtual keyboard/mouse controls, custom gamepad inputs, and macro execution."
date: "2026-06-19 14:44"
slug: "megingiard"
category: "companion"
generated: "ai"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=vgs6X9piswA"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1tlids6/rerelease_source_available_megingiard_a/)

## Description

Megingiard is a bespoke companion application designed specifically for the AYN Thor dual-screen Android handheld. It combines deep Android hardware video stream manipulation with modern Jetpack Compose interfaces to turn the secondary display into a fully interactive tool belt: a latency-free, multi-cutout mirror of the primary screen, a virtual keyboard, a virtual touchpad, a configurable MacroPad, and a virtual gamepad — all driven by native input injection for sub-millisecond response. The app requires Android 13 or newer and only supports the AYN Thor; single-screen devices are permanently unsupported.

## Main Features

**Latency-Free Multi-Cutout Screen Mirroring** — Define up to 10 cropped regions of the primary screen and arrange them freely on the secondary display. Pan and pinch-to-zoom up to 10×, rotate cutouts in 90° steps, flip axes, and lock aspect ratios. Isolate stationary HUD elements (minimaps, health meters, dials) from moving scenery, freeze frames, and link MacroPad layouts to visual anchors that auto-switch when the HUD disappears. Includes smart alignment guides, edge blending, circular cutouts, temporal motion smoothing, and a Follow Touch mode that centers the viewport on your last touch.

**MacroPad Central Mode** — Create named profiles with custom button layouts and bind buttons to keyboard keystrokes, gamepad buttons, mouse actions, scroll wheels, layout/mirror actions, or app launchers using visual pickers. Profiles can auto-switch per app, and a visual macro editor lets you record or hand-craft timed sequences of key, mouse, and gamepad events with human-like timing randomizers.

**Virtual Keyboard** — Compact full keyboard and ergonomic split layouts with QWERTY/QWERTZ/AZERTY variants, auto-open when a text field is focused on the primary screen, sticky modifiers, spacebar cursor scrubbing, an integrated trackpoint, and a quick macro toolbar.

**Virtual Touchpad** — Relative mouse mode turns the bottom screen into a trackpad with tap-to-click, two-finger scrolling, and physical LMB/MMB/RMB buttons; Absolute Touch mode projects touches directly to matching coordinates on the primary screen.

## Setup guide

Download and install the latest release of Megingiard from the [releases page](https://github.com/stormpanda/megingiard/releases/latest). The app targets the AYN Thor running Android 13 or newer; single-screen devices are not supported. After installation, launch the app and grant the requested permissions to use the mirror, MacroPad, keyboard, and touchpad on the secondary display.

See the project page: [github.com](https://github.com/stormpanda/megingiard)
