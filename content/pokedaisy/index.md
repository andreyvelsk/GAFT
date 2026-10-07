---
title: "PokeDaisy"
description: "A GBA player for dual-screen handhelds that runs Gen 3 Pokémon on the top screen and a live companion on the bottom one."
date: "2026-10-07 06:21"
slug: "pokedaisy"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/pokedaisy/preview.webp"
  - type: "video"
    url: "https://www.youtube.com/shorts/BGDGJgtDap8"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wz5msk/yet_another_pokemon_dual_screen_app_but_it_also/)

## Description

PokeDaisy is a GBA player for dual-screen Android handhelds, made for Pokémon FireRed, LeafGreen, Emerald, Ruby, Sapphire and popular ROM hacks. The game runs on the top screen. The bottom screen is a live companion that reads your game's memory as you play, so it always shows your real party, bag and battle, drawn in the game's own menu style. It is free and open source, with no ads, accounts or tracking, and it updates itself. No games are included — bring your own legally dumped ROMs.

Made for the AYN Thor. It should also work on the Retroid Pocket Duo / Duo Lite, though not yet tested on real hardware. Any Android 8.0+ device runs the games; the companion needs a second screen.

## Features

- **PARTY** – your team with HP, levels and status, in your game's own party screen. Tap a Pokémon for its full summary: stats, moves, EXP, and what it's weak or resistant to.
- **BAG** – every pocket, with item icons and descriptions.
- **BATTLE** – opens by itself when a battle starts. Shows move effectiveness, the foe's weaknesses, the best Pokémon and move for the fight, and the trainer's remaining team. Touch buttons to fight, switch or run (FireRed and Emerald).
- **MAP** – the game's region map with you on it. Tap any place to name it, or search the list of every town and route.
- **DEX** – your Pokédex with seen/caught marks and full entries: sprite, types, stats, abilities, dex text.
- **GUIDE** – hints first, answers on a second tap: what's catchable here, the next gym leader's team, evolutions, plus "WHERE IS" and "STUCK?" pages.
- **CARD** – your trainer card, drawn exactly like the game's, front and back.
- **STATES** – 10 save-state slots with screenshots.
- Customizable tabs: pick which ones show up in the tab bar.
- Smart fast-forward: drops to 1x in menus and keeps battles fast, plus slow motion.
- Fast-forward music (alpha) that keeps playing the song at its normal speed instead of chipmunk sound.
- Save states on hotkeys, with undo, full button remapping, themes, and an optional status bar (game, location, money, clock and battery).
- Saves are standard `.sav`/`.srm` files, the same format as mGBA and RetroArch, so you can move them between emulators freely.
- Library with SteamGridDB cover art, list or grid view, recently played, and long-press options to rename, hide, load a save or see game info.
- Works with frontends like ES-DE, Cocoon and iiSU.

## Supported games

Any GBA game plays. The companion needs one of the games below, in the exact version listed (ROM hacks are recognized by their file, so another version shows a "not supported" notice). ✅ works · ◐ partly · — not yet.

- Pokémon FireRed (USA/Europe, rev 0 and 1): ✅ Party, Bag, Battle, Map, Pokédex, Guide
- Pokémon LeafGreen (USA/Europe, rev 0 and 1): ◐ Battle
- Pokémon Emerald (USA/Europe): ✅ all features
- Pokémon Ruby (USA, rev 1 and 2): ◐ Battle
- Pokémon Sapphire (USA, rev 1 and 2): ◐ Battle
- Pokémon Unbound (2.1.1.1): ◐ Battle
- Pokémon Radical Red (4.1): ◐ Battle
- Pokémon Gaia (3.2): ◐ Battle
- Pokémon Odyssey (4.1.1): ◐ Battle
- Pokémon Heart and Soul (2.0.6): ◐ Map (place names only)
- Pokémon Amethyst (1.3.0): — Battle
- Celia's Stupid Romhack (1.1.4): ◐ Battle
- Pokémon Lazarus (2.0): — Battle, — Guide, ◐ Map
- Emerald Seaglass (3.0): — Battle, — Guide
- Too Many Types 2 (1.5.2): — Battle, — Guide
- Emerald Rogue (2.2.1-EX): — Guide
- Pokémon R.O.W.E. (2.1.9.1 Experimental): companion still in progress

Map ◐ means place names only, without the map picture. Battle ◐ means the battle panes work but haven't been checked in every kind of battle.

## Setup guide

1. Download `PokeDaisy-<version>.apk` from the [latest release](https://github.com/lidor30/pokedaisey/releases/latest) on the device.
2. Open it. If Android asks, allow your browser or file manager to install apps.
3. Open PokeDaisy. A short setup helps you:
   - **Link your ROMs folder** (optional). Every supported game in it shows up in your library, played right where it is. New games are picked up every time you open the app.
   - **Choose where saves go.** Use PokeDaisy's own folder, or point it at another emulator's (like RetroArch's) to keep playing the same saves.
   - **Add cover art** (optional) with a free SteamGridDB API key.
4. You can change all of this later in Settings.

No games are included — use your own legally dumped ROMs. PokeDaisy checks for a new version each time you open it and offers to install it; you can also check from Settings > VERSION.

See the project page: [github.com](https://github.com/lidor30/pokedaisy)
