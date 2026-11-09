---
title: "Heroes of Might and Magic III"
description: "Play Heroes of Might and Magic III on the AYN Thor with the adventure map on the top screen and a touch deck on the second screen."
date: "2026-11-09 07:15"
slug: "heroes-of-might-and-magic-iii"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/V5BhReTPpsc"
source: "https://www.reddit.com/r/AynThor/comments/1xqtew7/heroes_of_might_and_magic_iii_on_the_thor/"
project_page: "https://github.com/harmssi/thor-heroes3"
---

## Description

Thor Edition for VCMI is an unofficial dual-screen build of VCMI, the open-source engine for Heroes of Might and Magic III, made for the AYN Thor handheld. The top screen shows the adventure map in full screen (no side panel), with towns and battles as usual. The bottom screen is a touch deck that gives you quick access to the game's key information and actions, and it switches to a battle layout during combat. The controller keeps working as in VCMI, and the deck never takes the controller focus.

The build also supports the Steam HD Edition: that edition only ships Restoration of Erathia, which stock VCMI cannot start. On first start the app converts your own text tables on the device (about a second), hides the Armageddon's Blade / Shadow of Death content and repacks the seven original RoE campaigns. Complete editions (GOG etc.) are used as-is.

## Features

- Top screen: the adventure map fills the whole screen, with battles and towns as usual.
- Bottom screen (deck): tap the minimap to move the camera, hero and town lists (tap = select, tap again = open), army of the selection, resources, month/week/day, movement and spell points.
- Deck buttons: End turn, Spellbook, Sleep/Wake, Next hero, Game menu, Save.
- In battle the deck switches to: active unit, hero spell points, battle log, Spellbook, Wait, Defend, Auto, Retreat, Surrender.
- Controller works as in VCMI; the deck never takes the controller focus.
- Steam HD Edition support (RoE bridge): converts the owner's text tables, installs the roe-support mod and repacks the seven RoE campaigns as VCMI campaigns.

## Setup guide

1. Own the game. The app needs Heroes of Might and Magic III – HD Edition (Steam) or a complete edition (GOG "Complete", original SoD CD). It contains no game data.
2. Get the game folder onto the Thor – the whole folder `Heroes of Might & Magic III - HD Edition`:
   - From a PC: in Steam, right-click the game → Manage → Browse local files, go one folder up and copy the folder over USB to the Thor, e.g. into `Download`; or
   - With DroidDeck on the Thor: install the game in DroidDeck's Steam, then copy the same folder from `Android/data/com.droiddeck.launcher/files/steam/steamapps/common/` to `Download` with a PC over USB.
   - Only `HOMM3 2.0.exe` and the `data` folder are needed; the large `*.pak` files are skipped.
3. Install the APK from the latest release (allow installing from your browser).
4. First start: choose your language → Heroes III data → Copy existing data → pick the folder `Heroes of Might & Magic III - HD Edition` → Use this folder → Allow. The app copies about 330 MB, converts the tables for VCMI (RoE bridge, about a second) and shows Finish.
5. Play. Tap Play; the game opens on the top screen, the deck on the bottom screen. German HD Edition = German game; the deck follows the Android system language.

Saves live in `Android/data/de.harmssi.thorheroes/files/vcmi-data/Saves`.

## Known issues

- Tested with the German Steam HD Edition. Other languages use the same layout and should work, but are untested.
- RoE 1.0 campaigns run as plain scenario chains: no start-bonus choice and no hero carry-over.
- The in-game console (Tab, cheats) lives in the hidden status bar of the full-screen map.
- Arrow towers use the ballista portrait (RoE has no tower portrait).
- German HD Edition: some buttons inside the game keep their English artwork.
- Random maps, Armageddon's Blade and Shadow of Death content need a complete edition (GOG Complete etc. works as-is).
