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
source: "https://www.reddit.com/r/AynThor/comments/1y60qqm/megingiard_update_0110_true_onetap_system_service/"
project_page: "https://github.com/stormpanda/megingiard"
---

## Description

Megingiard is a bespoke companion application designed for dual-screen Android gaming handhelds, including the AYN Thor and the Retroid Pocket Duo. It combines deep Android hardware video stream manipulation with modern Jetpack Compose interfaces to turn the secondary display into a fully interactive tool belt: a latency-free, multi-cutout mirror of the primary screen, a virtual keyboard, a virtual touchpad, a configurable MacroPad, and a virtual gamepad — all driven by native input injection for sub-millisecond response. The app requires Android 13 or newer and only supports dual-screen handhelds; single-screen devices are permanently unsupported.

## Main Features

**Latency-Free Multi-Cutout Screen Mirroring** — Define up to 10 cropped regions of the primary screen and arrange them freely on the secondary display. Pan and pinch-to-zoom up to 10×, rotate cutouts in 90° steps, flip axes, and lock aspect ratios. Isolate stationary HUD elements (minimaps, health meters, dials) from moving scenery, freeze frames, and link MacroPad layouts to visual anchors that auto-switch when the HUD disappears. Includes smart alignment guides, edge blending, circular cutouts, temporal motion smoothing, and a Follow Touch mode that centers the viewport on your last touch. Anchor calibration is improved in the latest release.

**MacroPad Central Mode** — Create named profiles with custom button layouts and bind buttons to keyboard keystrokes, gamepad buttons, mouse actions, scroll wheels, layout/mirror actions, or app launchers using visual pickers. Profiles can auto-switch per app, and a visual macro editor lets you record or hand-craft timed sequences of key, mouse, and gamepad events with human-like timing randomizers. Version 0.11.0 adds:
- Left and Right virtual analog sticks with sensitivity settings, floating center, and rim-hit haptics.
- Stepless button resizing (with 1:1 snapping) and new button shapes — hexagons, diamonds, and triangles — with accurate hitboxes.
- New actions: switch profiles/layouts (with Hold-to-Shift), screenshots of the top, bottom, or both screens, screen tap coordinates, media controls, and Stop All Macros.
- Analog L2/R2 trigger macro support.
- Profile sharing via Android's share sheet, plus one-tap import by tapping `.mgrd` files from anywhere.

**Virtual Keyboard** — Compact full keyboard and ergonomic split layouts with QWERTY/QWERTZ/AZERTY variants, auto-open when a text field is focused on the primary screen, sticky modifiers, spacebar cursor scrubbing, an integrated trackpoint, and a quick macro toolbar. The latest release removes dead zones between keys and adds Shift/`?123` hold-and-slide, vertical spacebar cursor navigation, and a Backspace word-delete slide.

**Virtual Touchpad** — Relative mouse mode turns the bottom screen into a trackpad with tap-to-click, two-finger scrolling, and physical LMB/MMB/RMB buttons; Absolute Touch mode projects touches directly to matching coordinates on the primary screen. The latest release adds fling momentum and horizontal two-finger scrolling.

**Device Support & Extras** — Official support for the AYN Thor and the Retroid Pocket Duo, including 120 Hz displays, with performance improvements. Eden and DroidDeck are auto-detected, and a new Niflheim Dusk theme is included.

## Megingiard System Service

Megingiard System Service (formerly Privileged Mode) is an opt-in feature that unlocks advanced capabilities the standard Android sandbox cannot deliver. It is disabled by default and can be toggled on or off at any time in Global Settings. On the AYN Thor and Retroid Pocket Duo it activates with a single button tap, leveraging the PServerBinder system service found on these devices; a manual Wireless Debugging setup is available as a fallback. When enabled it provides:
- **Gamepad Merge** — games see only one controller, seamlessly blending MacroPad virtual inputs on top of your physical controller.
- **Controller Recording** — record macros from your real physical controller in real time while the target game continues to receive inputs.
- **Direct Mirror** — the screen mirror starts instantly without asking for MediaProjection consent every time.
- **Quick Screenshots** — save high-resolution screenshots of the primary screen directly from the Quick Menu without an active mirror session.
On devices with the native hardware root bridge, the service automatically restarts in the background after a device reboot.

## Setup guide

Download and install the latest release of Megingiard from the [releases page](https://github.com/stormpanda/megingiard/releases/latest). The app targets the AYN Thor and Retroid Pocket Duo running Android 13 or newer; single-screen devices are not supported. After installation, launch the app from the secondary display (or pin it there via your launcher) and grant the requested permissions to use the mirror, MacroPad, keyboard, and touchpad. For advanced features, enable the Megingiard System Service with a single tap in Global Settings or via the Welcome Tour, and optionally enable the Megingiard Accessibility Service for app-aware profile switching and auto-open keyboard. For help and community-shared MacroPad profiles, join the [Megingiard Discord](https://discord.gg/F6RtHv9YqR).
