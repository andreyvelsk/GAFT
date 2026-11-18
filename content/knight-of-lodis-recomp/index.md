---
title: "Knight of Lodis Recomp"
description: "A native enhanced port of Tactics Ogre: The Knight of Lodis for Android with widescreen, 3D-feeling battles, HD audio and second-screen support."
date: "2026-11-18 13:50"
slug: "knight-of-lodis-recomp"
category: "game"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xz5gi3/tactics_ogre_the_knight_of_lodis_enhanced_static/"
project_page: "https://github.com/lucdubois/KnightOfLodisRecomp"
---

## Description

A native port of **Tactics Ogre: The Knight of Lodis** (Game Boy Advance, USA, game code `ATOE`) for Android and desktop, built on gbarecomp: the game's code is statically recompiled to C++ and runs natively, with the real GBA hardware behaviour underneath and a set of optional enhancements on top. The project does not include the game — you need your own legally obtained copy of the cartridge ROM (and, optionally, the GBA BIOS).

## Features

- Widescreen, always 16:9: the battlefield, towns and scenes extended past the GBA's 240x160, at 320x180, 384x216 or 480x270.
- A 3D-feeling battlefield: perspective that follows the camera (right stick, or a finger drag on touch screens), lighting with shadows, ambient occlusion, torchlight, window light and night scenes, water and ice reflections, rain and snow of its own, plants that sway, props that stand off the ground, depth of field.
- Second screen (dual-screen handhelds such as the AYN Thor): the unit's status sheet, the army list, HELP text and the options menu; on Android you can view unit sheets while a unit is highlighted, quickly view item/equipment/talent/medal descriptions, list all units in battle with a quick tap to select one, use shortcuts to different actions in the world map, and view equipment stat deltas in stores.
- Sound: a high-quality re-render of the game's music engine, stereo, and optional HD instruments.
- Quality of life: fast loading, faster walking, actions and enemy turns, numbered save states, an analog cursor, rumble, analog stick support, shortcuts on X and Y, button remap, Swap Face Buttons.
- Cheats (off by default): Rewind, Shop Anywhere, No Random Battles.
- Mods: IPS, UPS or BPS patches made for the game that change its data (text, stats, graphics) can be played over your ROM.
- RetroAchievements (softcore).
- On-screen controls on phones when no controller is connected.
- Some cutscene maps have been expanded for a better widescreen and zoomed-out view.
- All enhancements can be toggled individually in-game, with presets available.

## Requirements

- Your own `Tactics Ogre: The Knight of Lodis (USA)` ROM (SHA-1 `85a46320a31f16f5c6dda27fc094edd078dbe43d`). It can be named anything.
- Optionally the GBA BIOS (SHA-1 `300c20df6731a33952ded8c436f7f186d25d3492`). Without it, a built-in HLE BIOS is used, which is less tested.

## Setup guide

Download and install the latest release APK from the [release page](https://github.com/lucdubois/KnightOfLodisRecomp/releases/latest). On first start, the setup screen asks for the ROM, and optionally the BIOS and a mod; press **Play**. BACK (or the second screen's button) opens the options menu.

Your save and save states are in Android's **Files** app, under the location **Knight of Lodis**: `totkol.sav` is the game's save, and the folder `states` holds the save states of the Save States page, three files each (`0007.state`, its picture `0007.png` and its details `0007.txt`). Copy them out to back them up, or copy them in to use them (a file that is replaced is kept as `<name>.bak`). Replace the save with the game closed: it is read at start. A state copied in shows on the Save States page after a restart. A mod has its own save and its own states folder, each named with the mod's code (`totkol-1a2b3c4d.sav`, `states-1a2b3c4d`).
