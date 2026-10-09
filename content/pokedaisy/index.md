---
title: "PokeDaisy"
description: "A GBA and Game Boy player for dual-screen handhelds that runs Pokémon on the top screen and a live companion on the bottom one."
date: "2026-10-07 06:21"
slug: "pokedaisy"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/pokedaisy/preview.webp"
  - type: "image"
    url: "/content/pokedaisy/cover.webp"
  - type: "video"
    url: "https://www.youtube.com/watch?v=gMy6bqpS-LU"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wz5msk/yet_another_pokemon_dual_screen_app_but_it_also/)

## Description

PokeDaisy is a GBA player for dual-screen Android handhelds, made for Pokémon FireRed, LeafGreen, Emerald, Ruby, Sapphire and popular ROM hacks. The game runs on the top screen. The bottom screen is a live companion that reads your game's memory as you play, so it always shows your real party, bag and battle, drawn in the game's own menu style. It is free and open source, with no ads, accounts or tracking, and it updates itself. No games are included — bring your own legally dumped ROMs.

Made for the AYN Thor. It should also work on the Retroid Pocket Duo / Duo Lite and the Anbernic RG DS, though not yet tested on real hardware. The Retroid Pocket 6 (single screen) is tested. Any Android 8.0+ device runs the games. On a single-screen device the companion is a panel beside the game: press BACK to slide it in over the game, tap the padlock on its edge to lock it beside the game, and drag that tab sideways to resize it. Hold a phone upright and the game sits across the top with the companion docked underneath; drag the grip on the companion's top edge to pick its height, or tap the grip to step through small, normal and full. Without a controller, the touch controls fill the space between the game and the companion.

## Features

- **PARTY** – your team with HP, levels and status, in your game's own party screen. Tap a Pokémon for its full summary: stats, moves, EXP, and what it's weak or resistant to. STATS shows its exact IVs, EVs, nature and Hidden Power.
- **BAG** – every pocket, with item icons and descriptions.
- **BATTLE** – opens by itself when a battle starts. Shows move effectiveness, the foe's weaknesses, the best Pokémon and move for the fight, and the trainer's remaining team. INFO has a STATS button that puts your numbers next to the foe's (foe IVs are off by default; turn on FOE IVS in Settings). Touch buttons to fight, switch or run (FireRed and Emerald).
- **MAP** – the game's region map with you on it. Tap any place to name it, or search the list of every town and route.
- **DEX** – your Pokédex with seen/caught marks and full entries: sprite, types, stats, abilities, dex text.
- **GUIDE** – hints first, answers on a second tap: what's catchable here, the next gym leader's team, evolutions, plus "WHERE IS" and "STUCK?" pages.
- **CARD** – your trainer card, drawn exactly like the game's, front and back.
- **STATES** – 10 save-state slots with screenshots.
- **CHEATS** – GameShark, Action Replay and CodeBreaker codes per game, toggled live from the companion.
- **CHEEVOS** – RetroAchievements (beta, softcore): your progress and challenges, unlock popups, leaderboards and the game's own level-up fanfare on every unlock. Sign in from the top-screen Settings; your password is used once and never stored, only your username and RA's login token stay on the device, and the app talks only to RetroAchievements. Hardcore isn't available yet: RetroAchievements only accepts it from emulators it has validated, which takes 6+ months of the app being public.
- Customizable tabs: pick which ones show up in the tab bar.
- App text in English, Japanese, French, German, Italian and Spanish. It follows the ROM's language by default; change it with the LANGUAGE row in Settings. Pokémon, move and item names stay as the game has them. FireRed, LeafGreen, Ruby, Sapphire and Emerald in ES / DE / FR / IT / JP are supported, with names in the game's language.
- Smart fast-forward: drops to 1x in menus and keeps battles fast, plus slow motion.
- Fast-forward music (alpha) that keeps playing the song at its normal speed instead of chipmunk sound.
- Save states on hotkeys, with undo, full button remapping, themes, and an optional status bar (game, location, money, clock and battery). X and Y act as a second START/SELECT (configurable), and hotkeys can be turned off.
- Shaders (optional): an LCD grid (plain or on paper), scanlines or a CRT look, and the colours as the GBA's own screen showed them — on the game and, if you like, the companion screen too.
- Stretch option for 16:9 top screens.
- On-screen touch controls appear when no controller is connected, and hide once a controller is used. Bluetooth and USB controllers (8BitDo, GameSir, Xbox, ...) connect while a game is running without restarting it.
- Themes: PokéDaisy (the default) or one of eight game-coloured ones (FireRed, LeafGreen, Emerald, ...) for the library and settings, in Settings > THEME.
- Saves are standard `.sav`/`.srm` files, the same format as mGBA and RetroArch, so you can move them between emulators freely. Every start backs up your save (see RESTORE BACKUP in the Library).
- Library with SteamGridDB or RetroAchievements box art, list or grid view, recently played, clean game names, and long-press options to rename, hide, load a save or see game info. Refresh rescans your ROMs folder and tells you what it found.
- Zipped `.zip` and `.7z` ROMs work in your ROMs folder, the + import and frontends.
- Works with frontends like ES-DE, Cocoon and iiSU. They can launch a game straight into PokeDaisy.

## Supported games

Any GBA game plays; Game Boy / Color games play too. The companion needs one of the games below, in the exact version listed (games are recognized by the ROM's contents, not its file name, so another version or a re-patched copy shows a "not supported" notice). ✅ works · ◐ partly · — not yet.

- Pokémon FireRed (USA/Europe, rev 0 and 1): ✅ Party, Bag, Battle, Map, Pokédex, Guide
- Pokémon FireRed (ES / DE / FR / IT / JP): ✅ Party, Bag, Battle, Map, Pokédex, Guide
- Pokémon LeafGreen (USA/Europe, rev 0 and 1): ◐ Battle
- Pokémon LeafGreen (ES / FR / IT / JP): ◐ Battle
- Pokémon Emerald (USA/Europe): ✅ all features
- Pokémon Emerald (ES / DE / FR / IT / JP): ✅ all features
- Pokémon Ruby (USA, rev 0, 1 and 2): ◐ Battle
- Pokémon Ruby (ES / DE / FR / IT / JP, rev 0-1): ◐ Battle
- Pokémon Sapphire (USA, rev 0, 1 and 2): ◐ Battle
- Pokémon Sapphire (ES / DE / FR / IT / JP, rev 0-1): ◐ Battle
- Pokémon Unbound (2.1.1.1): ◐ Battle
- Pokémon Radical Red (4.1): ◐ Battle
- Pokémon Gaia (3.2): ◐ Battle
- Pokémon Odyssey (4.1.1): ◐ Battle
- Pokémon Heart and Soul (2.0.6): ◐ Map (place names only)
- Pokémon Amethyst (1.3.0, 1.4.1): — Battle
- Celia's Stupid Romhack (1.1.4): ◐ Battle
- Pokémon Lazarus (2.0): ◐ Battle, — Guide
- Emerald Seaglass (3.0): ◐ Battle, — Guide
- Too Many Types 2 (1.5.2): — Battle, — Guide
- Emerald Rogue (2.2.1-EX): — Guide
- Pokémon SoulGold (1.1.4, 1.2, two builds): ◐ Battle, — Guide
- Pokémon R.O.W.E. (2.1.9.1 Experimental): companion still in progress
- Pokémon Yellow (GB, USA/Europe): ◐ Battle, — Guide

Map ◐ means place names only, without the map picture. Battle ◐ means the battle panes work but haven't been checked in every kind of battle. The guides were written from each game's own data and may contain mistakes; the app says so the first time you open one. Pokémon Yellow is the first Game Boy game the companion reads, in the game's own look (its font, icons and town map, rebuilt from your ROM).

## Setup guide

- Download `PokeDaisy-<version>.apk` from the [latest release](https://github.com/lidor30/pokedaisy/releases/latest) on the device.
- Open it. If Android asks, allow your browser or file manager to install apps.
- Open PokeDaisy. A short setup helps you:
  - **Link your ROMs folder** (optional). Every supported game in it shows up in your library, played right where it is. New games are picked up every time you open the app. `.zip` and `.7z` ROMs work too.
  - **Choose where saves go.** Use PokeDaisy's own folder, or point it at another emulator's (like RetroArch's) to keep playing the same saves.
  - **Add cover art** (optional) with a free SteamGridDB or RetroAchievements Web API key.
- You can change all of this later in Settings.

**Updating from the old PokeDaisey:** the app was renamed from PokeDaisey to PokeDaisy, and Android treats it as a brand new app, so uninstall the old PokeDaisey to avoid having both on your device. If your ROMs and saves live in your own folders (like RetroArch's), nothing is lost — just point the new app at them in the first-time setup. If you kept saves in the old app's own folder (`Android/data/com.pokedaisey.app/`), copy them out before uninstalling, since Android deletes that folder with the app. Settings start fresh in the new app.

No games are included — use your own legally dumped ROMs. PokeDaisy checks for a new version each time you open it and offers to install it; you can also check from Settings > VERSION.

The [PokeDaisy website](https://pokedaisy.web.app) lists the supported games and has a ROM checker that runs in your browser, so your ROM never gets uploaded.

Frontends: step-by-step guides to launch games from [iiSU](https://github.com/lidor30/pokedaisy/blob/main/docs/iisu/README.md) and [ES-DE](https://github.com/lidor30/pokedaisy/blob/main/docs/es-de/README.md).

See the project page: [github.com](https://github.com/lidor30/pokedaisy)
