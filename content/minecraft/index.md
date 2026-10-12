---
title: "AYN Thor Second Screen"
description: "A Fabric mod and companion Android app that move Minecraft's HUD, map, inventory and chat to the AYN Thor's second screen."
date: "2026-10-12 06:33"
slug: "minecraft"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x3mr9b/ayn_thor_gripcase_w_hidden_stylus_stl_linked_in/)

## Description

This Fabric mod hides the vanilla HUD and streams what it was drawing — health, hunger, armor, breath, XP, the hotbar, a live map, your open inventory and chat — to a companion Android app running on the same device, which draws it all on the second display using the game's own textures. The top screen becomes all game; the bottom screen becomes the interface.

The project has two halves: the Fabric mod that runs inside Minecraft, and the companion Android app. They talk to each other over a loopback socket (127.0.0.1:48291) and neither does anything on its own — you need both.

## Features

- HUD — hearts (including absorption, poison, wither, freezing and hardcore variants), hunger, armor, breathing bubbles, the XP bar and level, the hotbar with stack counts, durability bars and an animated enchantment glint, plus the off-hand slot under your thumb. Tap a slot to select it.
- Map — a live map of where you are, drawn on vanilla's paper sheet.
- Items — your inventory, or whatever container is open. Tap or drag to move items in Stack / Half / Single / Move (shift-click) modes; hold still then drag to spread a stack across slots, exactly as dragging does in game.
- Chat — the game's chat log in Minecraft's own font, with a keyboard to answer it (the app's own, or Android's — your choice in Settings).
- Input — nine buttons, each bound to any key binding the game has, yours or another mod's.
- Settings — turn any HUD element off and the game draws it again on the top screen, so between the two displays the HUD is always drawn exactly once.
- Every texture comes from Minecraft itself over the socket, so your resource pack applies to the second screen too, with nothing to copy anywhere.

## Requirements

- An AYN Thor, or any Android device that reports a second presentation-category display.
- Zalith Launcher 2 (or another PojavLauncher-based launcher).
- Minecraft 1.21.11.
- Fabric Loader 0.19.3 or newer.
- Fabric API for 1.21.11 — this mod will not load without it.

## Setup guide

Download the mod jar `aynthor_secondscreen_v1_21-1.0.0.jar` from the [latest release](https://github.com/exojosh/AynThorSecondScreen/releases/latest) and Fabric API for 1.21.11 from Modrinth.

In Zalith Launcher 2:
- Create or select a version: pick 1.21.11, then add Fabric 0.19.3.
- Open that version's gear icon → Mods.
- Tap + / Import, and add the Fabric API jar.
- Tap + / Import again, and add `aynthor_secondscreen_v1_21-1.0.0.jar`.
- Both should now be listed and enabled.

Install the companion app APK from the [companion app's releases](https://github.com/exojosh/Android_AynThor_MinecraftSecondScreen/releases). It needs no permissions and no setup.

Run it:
- Launch the app. On the Thor it paints the bottom screen and waits; on a single-screen device it shows a status page instead, which is the expected fallback.
- Launch Minecraft from ZL2 and load a world.
- The vanilla HUD disappears from the top screen and appears on the bottom one.

Either order works — the app reconnects on its own and survives the game being restarted under it.

See the project page: [github.com](https://github.com/exojosh/AynThorSecondScreen)
