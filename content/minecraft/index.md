---
title: "AYN Thor Second Screen"
description: "A Fabric mod and companion app that move Minecraft's HUD, map, inventory and chat to the AYN Thor's second screen."
date: "2026-10-02 06:24"
slug: "minecraft"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wv6k2m/ayn_thor_standby_drain_enabling_android_doze_and/)

## Description

This project moves Minecraft's HUD to the AYN Thor's bottom screen. A Fabric mod hides the vanilla HUD and streams what it was drawing — health, hunger, armor, breath, XP, the hotbar, a live map, your open inventory and chat — to a companion Android app running on the same device, which draws it all on the second display using the game's own textures. The top screen becomes all game; the bottom screen becomes the interface.

You need both halves: the mod that runs inside Minecraft and the companion Android app. They talk to each other over a loopback socket (127.0.0.1:48291) and neither does anything on its own. Every texture comes from Minecraft itself over the socket, so your resource pack applies to the second screen too, with nothing to copy anywhere.

## Setup guide

Requirements: an AYN Thor (or any Android device that reports a second presentation-category display), Zalith Launcher 2 (or another PojavLauncher-based launcher), Minecraft 1.21.11, Fabric Loader 0.19.3 or newer, and Fabric API for 1.21.11.

1. Download aynthor_secondscreen_v1_21-1.0.0.jar from the Releases page, and Fabric API for 1.21.11 from Modrinth.
2. In Zalith Launcher 2, create or select a version: pick 1.21.11, then add Fabric 0.19.3.
3. Open that version's gear icon → Mods. Tap + / Import and add the Fabric API jar, then the mod jar. Both should now be listed and enabled.
4. Install the companion app APK from the companion app's releases. It needs no permissions and no setup — nothing to configure, no folder to grant, and no game files to copy.
5. Launch the app: on the Thor it paints the bottom screen and waits. Then launch Minecraft from Zalith Launcher 2 and load a world. The vanilla HUD disappears from the top screen and appears on the bottom one. Either order works — the app reconnects on its own and survives the game being restarted under it.

## Features

On the bottom screen you get:

- HUD — hearts (including absorption, poison, wither, freezing and hardcore variants), hunger, armor, breathing bubbles, the XP bar and level, the hotbar with stack counts, durability bars and an animated enchantment glint, plus the off-hand slot under your thumb. Tap a slot to select it.
- Map — a live map of where you are, drawn on vanilla's paper sheet.
- Items — your inventory, or whatever container is open. Tap or drag to move items in Stack / Half / Single / Move (shift-click) modes; hold still then drag to spread a stack across slots, exactly as dragging does in game.
- Chat — the game's chat log in Minecraft's own font, with a keyboard to answer it (the app's own, or Android's — your choice in Settings).
- Input — nine buttons, each bound to any key binding the game has, yours or another mod's.
- Settings — turn any HUD element off and the game draws it again on the top screen, so between the two displays the HUD is always drawn exactly once.

## Troubleshooting

- App says "Not connected" — Minecraft isn't running, or the mod didn't load. Check Zalith Launcher 2's mod list and that Fabric API is installed.
- Second screen never appears and the app fills the top screen — no presentation-category display was found. Expected on phones and emulators; on the Thor, check the second screen isn't disabled in system settings.
- HUD draws, but item icons are missing or the buttons look plain — the mod jar is older than the app (or the other way round). Both halves of a release are meant to be used together.
- HUD drawn twice, on both screens — an element was switched off on the second screen and handed back to the game; that's the feature. Settings → Show on this screen.
- Chat keyboard covers the game instead of the bottom screen — Settings → Chat → turn "Use the Android keyboard" off; the app draws its own, which always lands on the right screen.

See the project page: [github.com](https://github.com/exojosh/AynThorSecondScreen)
