---
title: "Super Metroid Android"
description: "An Android port of Super Metroid with a second screen mod for dual screen devices like the AYN Thor"
date: "2026-08-02 20:00"
slug: "super-metroid"
category: "game"
media:
  - type: "image"
    url: "/content/super-metroid/preview.jpeg"
---

source: [reddit](https://www.reddit.com/r/AynThor/comments/1vdopik/super_metroid_dual_screen_mod/)

## Description
While you play on the main screen, the second panel shows a live map, your equipment, and your ammo, so you don't have to pause and dig through menus to check where you are or what you're carrying.

The second screen graphics are decoded straight from your own ROM at runtime, so there is no extra setup and the app contains no game assets.

## Dual-screen mod
On a device with a second physical display (e.g. the AYN Thor), the second screen shows automatically once you're in-game, with three tabs along the bottom:

**Map** tab. The real in-game pause-menu map tiles, decoded from your ROM. Pinch or use the +/- buttons to zoom from a single room out to the full connected world map, and pan with a drag. The nested-squares button snaps between a close-up of the room you're standing in and the full world view.

By default, only rooms you've actually explored are shown. Once you collect an area's Map Station item, that area's entire known room layout is also shown - including rooms you've never visited - the same way the real in-game pause map works. Rooms revealed this way but not yet visited are rendered dimmer than rooms you've walked through.

**Items** tab. Your currently equipped suit, boots, beams, and misc items, shown as a list next to a full-color Samus sprite with callout lines to each equipped item. The suit art is recolored live to match whichever suit you actually have equipped (Power, Varia, or Gravity).

**Ammo** tab. Tap a missile, super missile, or power bomb slot to arm it, the same effect as pressing Select on the controller. Tap the already-armed slot again to disarm it back to your plain beam.

## Controls
Gamepad input works out of the box. On the Thor specifically:
- A/B are remapped to match its Nintendo-style physical layout.
- L2/R2 cycle your armed ammo type without needing to open the second screen's Ammo tab.
- Quicksave/quickload: hold L1+R1 and press Start to save, Back/Select to load.

## Setup guide
See the project page: [github.com](https://github.com/Raekwon1603/super_metroid-android)

You need your own legally-dumped copy of the ROM (`sm.smc`/`.sfc`) to build or run this. The app reads graphics, audio, and level data from your ROM at runtime. No game assets are included anywhere in the repository or shipped in the built app.
