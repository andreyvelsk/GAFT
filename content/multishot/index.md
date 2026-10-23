---
title: "MultiShot"
description: "Screenshots with a floating button for dual-screen devices: capture both AYN Thor screens at once."
date: "2026-10-22 12:00"
slug: "multishot"
category: "tool"
tags:
  - screenshot
  - dual-screen
  - open-source
---

## Description
MultiShot captures **all screens at once** on the AYN Thor and saves them as one image, stacked top to bottom. You can also capture a single screen or save each screen to its own file. No root, no internet and no storage permissions needed.

Source and downloads: https://github.com/mkaflowski/MultiShot

## Setup guide

1. Download the APK from the [latest release](https://github.com/mkaflowski/MultiShot/releases/latest) (or add the repo to [Obtainium](https://github.com/ImranR98/Obtainium)) and install it.
2. Open MultiShot, tap **Accessibility settings** and enable **MultiShot – screenshots**.
3. Android 13+, sideloaded APK: if the setting is greyed out as restricted, go to **App info → ⋮ → Allow restricted settings** and try again.
4. Optional: tap **Add tile to Quick Settings** to show or hide the floating button from the panel.

## Tips

- Tap the floating button to take a screenshot, drag it to move it, long-press it to open settings.
- Choose which screen the button appears on, plus its size and transparency.
- Capture modes: all screens stacked in one image (default), all screens as separate files, or only one selected screen.
- Screenshots are saved as PNG in `Pictures/Screenshots`.
- The button hides itself while capturing, so it never appears in your screenshots.

## Known issues

- Requires an accessibility service, because it is the only non-root Android API that can capture a chosen screen. The service does not read the content of your apps.
- Turned-off screens are skipped.
