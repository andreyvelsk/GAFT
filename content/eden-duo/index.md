---
title: "Eden Duo"
description: "A Nintendo Switch emulator for dual-screen Android handhelds that adds live touch companion screens on the second display."
date: "2026-09-27 18:26"
slug: "eden-duo"
category: "emulator"
generated: "ai"
media:
  - type: "image"
    url: "/content/eden-duo/preview.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-2.webp"
  - type: "image"
    url: "/content/eden-duo/screenshot-3.webp"
  - type: "video"
    url: "https://www.youtube.com/watch?v=LaLfNIwAwHU"
source: "https://www.reddit.com/r/AynThor/comments/1y6ni7k/time_stranger_field_guide_a_live_secondscreen/"
project_page: "https://github.com/igawa6/eden-duo-companions"
---

## Description

Eden Duo is a fork of the Eden Nintendo Switch emulator for Android devices with two screens, such as the AYN Thor. The game runs on the top screen as usual, while the bottom screen shows a touch companion for the game you are playing: maps, party and inventory menus, status, and more, all driven by the running game's live state. Since Eden Duo 1.4.0, a companion can also share a single screen with the game, so a phone, tablet or foldable works too.

Companions are separate, installable `.dsmod.zip` packages, one per game, so a companion can be updated without updating the emulator. They ship no game assets — all art and text comes from your own game files. Dual-screen support is available for 40 games:

- **Persona 5 Royal**
- **Metroid Dread**
- **The Legend of Zelda: Link's Awakening**
- **Mario Kart 8 Deluxe**
- **Super Mario Bros. Wonder**
- **Animal Crossing: New Horizons**
- **Fire Emblem: Three Houses**
- **The Binding of Isaac: Afterbirth+ and Repentance DLC**
- **Pokémon Brilliant Diamond / Luminescent Platinum**
- **Pokémon Shining Pearl / Luminescent Platinum**
- **Crash Team Racing Nitro-Fueled**
- **Dragon Quest III HD-2D Remake**
- **Chained Echoes**
- **Yoru Tomosu**
- **Diablo III: Eternal Collection**
- **Farming Simulator: Nintendo Switch Edition**
- **VA-11 Hall-A: Cyberpunk Bartender Action**
- **The Legend of Zelda: Breath of the Wild**
- **Castlevania: Belmont's Curse**
- **Super Mario Odyssey**
- **The Legend of Zelda: Echoes of Wisdom**
- **Dave the Diver**
- **Persona 3 Portable**
- **Fire Emblem Engage**
- **Octopath Traveler 0**
- **Pokémon Sword**
- **Pokémon Shield**
- **Cult of the Lamb**
- **Kirby's Return to Dream Land Deluxe**
- **Monster Sanctuary**
- **My Time at Sandrock**
- **Resident Evil 4**
- **The Legend of Zelda: Skyward Sword HD**
- **Star Ocean: The Second Story R**
- **Pokémon Legends: Z-A**
- **FINAL FANTASY RESONANCE**
- **The Legend of Zelda: Tears of the Kingdom**
- **Digimon Story Time Stranger**
- **Pokémon Legends: Arceus**
- **Xenoblade Chronicles X: Definitive Edition**

## Features

- **Second-screen companion** — the game on the main screen and a touch companion page on the second display.
- **Live game state** — companions read the running game's memory every frame: no save-file snapshots and no polling delays.
- **Installable packages** — add a companion from the game's **Add-ons** menu with its `.dsmod.zip`; packages are validated (title, build, file layout and module checksums) before they are installed.
- **Native companion modules** — a package can carry a small native module for games whose data is too complex for a declarative manifest; modules talk to the emulator through a small, versioned C interface and never ship inside the APK.
- **Touch that feels native** — taps, press-and-hold gestures, drag and drop, animated page and layout changes, and haptic feedback on the second screen.
- **Second screen your way** — swap the screens, stretch the companion, or open another app on the second screen for games without a companion.
- **Single-screen mode** — since Eden Duo 1.4.0, a companion can also share a single screen with the game, so a phone, tablet or foldable works too.
- **Built for handhelds** — change-driven partial redraws, tile-based texture uploads and an optional GPU compositor keep the second screen at full frame rate without costing the game frames.
- **Every dual-screen game listed** — the game list ends with every game that has a companion, so you can see what is supported.
- **Hide the companion mid-game** — tap the game screen with four fingers (or use the Quick Settings tile) to free the second screen for another app; tap again to bring the companion back.
- **Improved import** — a clearer "Import from another emulator" flow and a fixed save import from Eden.
- **Follows Eden Nightly** — upstream fixes and improvements arrive sooner.

Requirements:

- Android 13 or newer (arm64).
- A device with a second display.
- Your own legally obtained game dump with the matching update.
- Your console's keys and firmware.

## Supported games

- **Persona 5 Royal (1.0.2)** — the full start menu on the bottom screen: skills, items, equipment, Persona, stats, confidants, requests and the calendar with the Daily Log. You can use items and change equipment or Persona by tapping, and see enemy affinities in battle.
- **Metroid Dread (2.1.0)** — a live area map with Samus's position, EMMI zones, water levels, and energy and missiles.
- **The Legend of Zelda: Link's Awakening (1.0.1)** — a live map with your own pins, plus gear and items, with X/Y equip from the touch screen. [Watch a video showcase](https://www.youtube.com/watch?v=LaLfNIwAwHU).
- **Mario Kart 8 Deluxe (4.0.1, 4.0.0, 3.0.3)** — a live rank bar with every racer's items, a course map showing all racers, and a big horn button. Also works with CTGP-DX v1.1.1 custom tracks.
- **Super Mario Bros. Wonder (1.2.1)** — a course page with a progress rail from start to goal, your 10-flower coins, world Wonder Seeds, current form and item balloon, and a world map page with the selected course and an Open Courses button.
- **Animal Crossing: New Horizons (3.0.3)** — island map, Pockets, Critterpedia, DIY, Today and NookPhone pages on the second screen.
- **Fire Emblem: Three Houses (1.2.0)** — combat information, maps, academy information and more on the second screen. [Watch a video showcase](https://www.youtube.com/watch?v=gt7DaUXBABY).
- **The Binding of Isaac: Afterbirth+ and Repentance DLC (1.7.9b)** — a parchment companion with MAP, ITEMS and ROOM pages, run counters and optional External Item Descriptions.
- **Pokémon Brilliant Diamond / Luminescent Platinum (1.3.0)** — a field map, party, bag, Pokédex, Pokétch and battle controls. Works with vanilla or Luminescent Platinum 2.2F.
- **Pokémon Shining Pearl / Luminescent Platinum (1.3.0)** — a field map, party, bag, Pokédex, Pokétch and battle controls. Works with vanilla or Luminescent Platinum 2.2F.
- **Crash Team Racing Nitro-Fueled (1.0.15)** — live standings with portraits, racer positions on the course map, lap and race clock, and options to hide the native HUD.
- **Dragon Quest III HD-2D Remake (1.1.0.0)** — field map, party status and gear, bag, journal, Heal All and battle info, including possible enemy spells.
- **Chained Echoes (1.41)** — area map and objectives, battle turn strip and Overdrive, skills, crystals and formation.
- **Yoru Tomosu (1.0.0)** — dialogue log, options and unlocked CG gallery on the second screen.
- **Diablo III: Eternal Collection (2.7.7, 2.7.6)** — map, hero sheet, activities and gear on the second screen, read live from the running game.
- **Farming Simulator: Nintendo Switch Edition (1.5.0.1)** — map, garage, operations, prices, finances, statistics, animals, shop and guide on the second screen.
- **VA-11 Hall-A: Cyberpunk Bartender Action (1.0.0)** — mix drinks on the second screen while the story plays on the main one.
- **The Legend of Zelda: Breath of the Wild (1.9.0 or 1.6.0)** — the Sheikah Slate on the second screen: a live map with your pins and quest markers, secondary weapon, inventory with instant equip, sort and eat, Champion abilities, and the Travel Medallion. Works with or without DLC.
- **Castlevania: Belmont's Curse (1.1.0)** — the pause-menu map always open with fog and landmarks, pins placed straight from the touch screen, and the equipment screen with arcana, weapons, relics and stats.
- **Super Mario Odyssey (1.4.1)** — Mario's Travel Brochure on the second screen: track Moons, check in with Toadette and warp across Kingdoms.
- **The Legend of Zelda: Echoes of Wisdom (1.1.0)** — Zelda's map, Echoes and gear on the second screen, so you can swap, eat and plan without opening the pause menu.
- **Dave the Diver (1.0.6.1267)** — dive maps, cargo, missions and the sushi bar on the second screen. Companion contributed by jadesigns.
- **Persona 3 Portable (1.0.0)** — a bottom-screen version of the camp menu, in blue or pink to match the protagonist. Companion for the base game, contributed by jschroeder1.
- **Fire Emblem Engage (2.0.0)** — the War map with the danger zone on the second screen, unit details, Engage and Emblem bonds, the attack Matchup forecast, a live Somniel map with everyone's location, Units, Roster and the World Map.
- **Octopath Traveler 0 (1.0.5)** — a live map, party status and equipment, items and quests, and a battle screen with BP forecast, shields, Break and revealed weaknesses.
- **Pokémon Sword (1.3.2)** — Town Map with wild Pokémon and Fly, party (drag to reorder), Pokédex, Bag (use items right from the bottom screen), League Card, and touch battles with type matchups and Max Raids. Includes Isle of Armor and Crown Tundra; runs in multiple languages.
- **Pokémon Shield (1.3.2)** — Town Map with wild Pokémon and Fly, party (drag to reorder), Pokédex, Bag (use items right from the bottom screen), League Card, and touch battles with type matchups and Max Raids. Includes Isle of Armor and Crown Tundra; runs in multiple languages.
- **Star Ocean: The Second Story R (1.1.0)** — the party in the game's Party Formation look with level, HP and MP, status, equipment, Special Arts/Spells and Skills; the Guide Map with the game's minimap and world map; Missions; and battle controls with the other members' cards, ailments, the bonus gauge and Assault Actions. An optional Hide HUD switch hides the top screen's shortcut list, minimaps, place names and field icons. Use NCE, not JIT. Requires Eden Duo 1.3.2.2 or newer. Companion contributed by jadesigns.
- **Cult of the Lamb (1.5.27, 1.5.28)** — live status of your cult and your current run on the bottom screen, and follower commands by touch. Requires Eden Duo 1.3.2 or newer. Contributed by AlterDigga.
- **Kirby's Return to Dream Land Deluxe (1.0.0)** — the game's own menus, maps and boss effects on the second screen, from the title screen to the staff roll. Requires Eden Duo 1.1.0 or newer. Contributed by Fab (fabvx on Discord).
- **Monster Sanctuary (2.1.0.32)** — your team, the map and the battle commands on the second screen, drawn in the game's own windows. Requires Eden Duo 1.3.2 or newer. Commissioned companion.
- **My Time at Sandrock (1.4.2)** — the calendar, accepted missions, inventory, townsfolk and workshop progress on the second screen. Requires Eden Duo 1.4.0 or newer. Commissioned companion.
- **Resident Evil 4 (1.0.2)** — the field map, your weapons and your Attache Case on the second screen. Requires Eden Duo 1.4.0 or newer. Poll winner.
- **The Legend of Zelda: Skyward Sword HD (1.0.1)** — a minimap, your gear, the Adventure Pouch and every map on the second screen, with touch controls for the sword. Requires Eden Duo 1.3.3 or newer. Contributed by eminham.
- **Pokémon Legends: Z-A (2.0.2)** — live party, Lumiose map and reference screens on the second screen. Needs Eden Duo 1.4.0 or later. Contributed by Sickops. This companion changes your game.
- **FINAL FANTASY RESONANCE (1.0.1)** — the map, your party, your items, your quests and the battle on the second screen, drawn in the game's own look. Requires Eden Duo 1.4.0 or later. Contributed by danielcamilo1. This companion changes your game.
- **The Legend of Zelda: Tears of the Kingdom (1.4.3)** — a read-only second screen in the game's own look: status, maps, items and info. Requires runtime 22. Contributed by aldotms89. Tested on Peanuts Native on an AYN Thor; not yet verified on Eden Duo.
- **Digimon Story Time Stranger (1.2.2)** — a field guide on the second screen: Now, Quests, Digimon dex, type chart, tips, items and area guide. It reads the running game and never changes it. Requires Eden Duo 1.2.0 or newer. Contributed by TorchicIsla. Also compatible with Peanuts Native.
- **Pokémon Legends: Arceus (1.1.1)** — the area map, your party, the Pokédex, the Satchel and your missions on the second screen. Requires Eden Duo 1.4.0 or newer. Poll winner. This companion changes your game.
- **Xenoblade Chronicles X: Definitive Edition (1.0.2)** — the FrontierNav map, your party and your Skell on the second screen. Requires Eden Duo 1.4.0 or newer. Commissioned companion. This companion changes your game.

Compatibility is intentionally strict: each companion is written for one exact game build and checks the running build before it loads. On any other version it does not load and shows a notice, instead of reading memory it does not understand.

Details, screenshots and downloads for each companion: [Eden Duo Companions](https://github.com/igawa6/eden-duo-companions).

## Setup guide

- Download the latest EdenDuo APK from the [Releases page](https://github.com/igawa6/eden-duo/releases/latest) and install it. Some companions require Eden Duo 1.4.0 or newer, so check the companion's release notes.
- Set up the emulator as usual: keys, firmware, and your games folder.
- Download a companion package from the [Eden Duo Companions repository](https://github.com/igawa6/eden-duo-companions).
- In Eden Duo, long-press the game, open **Add-ons** and tap **Install**. In the **Content type** dialog choose **Dual screen mods**, tap **OK**, then select the `.dsmod.zip` file. The companion appears in the Add-ons list as `Name-version`, for example `MetroidDreadDS-1.0.0`.
- Launch the game — the companion appears on the second screen, or next to the game on a single screen, once gameplay starts.

Each companion needs an exact game version, listed in the companion repository. Eden Duo uses its own app ID, so it installs alongside other Eden builds and keeps separate data.

Second-screen options are in **Settings → Graphics → Second Screen**, and each game can have its own values (long-press the game, then **Settings → Graphics → Second Screen**). You can swap which display runs the game, stretch the companion, or choose what the second screen shows for games without a companion — including launching another installed app on it.

Eden Duo can also be launched from frontends: CocoonFE has built-in support (open **Settings → Library & Data → Refetch Platforms**, then set **Player Override** to **Eden Duo** for each game), and ES-DE (Android) works by copying the provided `es_systems.xml` and `es_find_rules.xml` into `ES-DE/custom_systems/` and restarting.
