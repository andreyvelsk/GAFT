---
title: "HandheldDash"
description: "A touch-friendly control panel and hardware daemon for the AYN Thor running Arch Linux with KDE Plasma/Wayland."
date: "2026-10-09 07:05"
slug: "handhelddash"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x19z5b/i_made_a_replication_of_ayn_panel_for_linuxplasma/)

## Description

HandheldDash is a touch-friendly handheld control panel and a system D-Bus hardware daemon for Arch Linux with KDE Plasma/Wayland. It currently supports and has been tested only on the AYN Thor running the Thorch BSP; support for other handhelds is planned. The daemon lets an active local user operate supported hardware without running the interface as root.

## Setup guide

On a compatible Thorch installation, download the latest release from the Releases page.

- Enable SSH and use scp to transfer the release into your device, or download the package directly on the handheld device.
- Install it with `sudo pacman -U <Package>`.
- Run `sudo systemctl enable --now inputplumber.service aynthor-hardwared.service` and `systemctl --user enable --now aynthor-control.service`.
- Press the AYN key to toggle the panel, or run `handhelddash` or `handhelddash --settings`.

## Features

- Performance and fan profiles with editable fan curves.
- Dual-screen brightness and application placement.
- Task switching, region/top/bottom screenshots, and playback volume.
- Independent joystick lighting with audio-reactive output and color dials.
- Configurable Home/Back actions, and gamepad/mouse input profiles.

## Known issues

- Android partition access requires a custom kernel and is extremely experimental: it may not work and may even prevent Android from booting.
- Unsupported controller layouts and bypass charging are to be supported by an upstream driver.
- Hardware support must not be assumed beyond the AYN Thor.

See the project page: [github.com](https://github.com/lurenjiamax/HandheldDash)
