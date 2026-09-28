---
title: "Jesty Thor Fix"
description: "A free, open-source utility that truly powers off the Thor's bottom display, stops AYN Dashboard from pinning CPU clocks, and shows live CPU/display telemetry."
date: "2026-09-28 03:58"
slug: "jesty-thor-fix"
category: "tool"
media:
  - type: "image"
    url: "/content/jesty-thor-fix/preview.webp"
  - type: "image"
    url: "/content/jesty-thor-fix/screenshot-2.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wrsmmo/found_two_weird_ayn_thor_issues_top_only_doesnt/)

## Description

Jesty Thor Fix addresses two separate AYN Thor firmware problems. First, Top Only mode can leave the lower display looking black while its physical display hardware is still active — the display controller stays on and can even come back after wake. Second, the AYN Dashboard can leave LITTLE/BIG CPU cores pinned at maximum clocks instead of letting them scale down at low load, which wastes power and produces extra heat. The app is free and open source, and requires no accounts, credentials or cloud services.

## What it fixes

The app provides two independent switches, because the Thor has two different problems:

- **True Bottom Display Fix** — in TOP mode it powers down the lower display hardware; after sleep or wake it checks and restores true-off if Android reactivated it; in BOTH or BOTTOM mode it leaves the lower display available normally. It never chooses a display mode for you.
- **AYN Dashboard CPU Fix** — stops CPU cores from staying pinned at maximum clocks while the AYN Dashboard is open.

Which switches should you use? If you use TOP mode and want the lower display truly powered off, enable **True Bottom Display Fix**. If you use the AYN Dashboard or regularly use both screens, enable **AYN Dashboard CPU Fix**. If you switch between TOP and BOTH, enable **both fixes**. Your choices are saved and restored after a normal reboot.

The app also shows live telemetry — the current display mode, CPU clocks and a live power estimate — so you can see both fixes working.

## Setup guide

Download and install the latest release ([v1.3.0](https://github.com/JestyLabs/Jesty-Thor-Fix/releases/latest)). No Magisk, no terminal and no rooting are required, and you don't need to keep the app open. Install it, enable the fix or fixes you need, and forget about it.

See the project page: [github.com](https://github.com/JestyLabs/Jesty-Thor-Fix)
