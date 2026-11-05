---
title: "Thor D2"
description: "Diablo II: Lord of Destruction 1.13d on the AYN Thor with a live deck on the second screen."
date: "2026-11-05 06:50"
slug: "thor-d2"
category: "game"
generated: "ai"
media:
  - type: "video"
    url: "https://youtu.be/-4ygDPPjIVM"
source: "https://www.reddit.com/r/AynThor/comments/1xno5g0/diablo_2_lod_113d_on_the_thor_with_a_live_deck_on/"
project_page: "https://github.com/harmssi/thor-d2"
---

## Description

Thor D2 is a fork of D2Android that runs the real Diablo II: Lord of Destruction 1.13d on the AYN Thor. The game fills the upper screen as a clean widescreen picture — D2Android's 960×540 scaled exactly 2× to the 1920×1080 OLED, sharp and without borders, touch buttons or the menu row — while the lower screen shows a live deck with your character, items, skills and quests, read live from the game.

The app contains no game files. You need your own, purchased copy of Diablo II and Lord of Destruction: two CD keys from your Battle.net account (Games & Subscriptions → classic games), or an existing 1.13d installation.

## Features

- Live deck on the second screen: character name, class, level and difficulty; life, mana and experience to the next level; resistances as the character screen shows them (difficulty penalty included); strength, dexterity, vitality, energy, defense, magic find, unspent stat and skill points; gold and stash gold.
- Effects and auras with time left, area and act, town or not.
- The deck's frames, life and mana orbs, fonts, skill icons and item pictures are read at runtime from your own game files; without them it falls back to a plain dark look of its own.
- Items by touch: tap an item to take it (it shows gold), then tap a cell to put it there — inventory, stash, cube, belt slots and equipment slots; use, sell (with a shop open), drop and cancel work too.
- Skills on keys: tap a learnt skill in the Skills tab, then put it on the left/right mouse button or F1–F8, mapped to the pad.
- Tabs for Inventory (item names in quality colours, belt, equipped items), Stash, Cube, Mercenary (life, level, equipment) and Quests (state of every quest of the current act, next goal).
- Sort inventory: moves items with the game's own pick-up and put-down actions, never by writing to memory; single player only, and it does not run while a shop, trade or the stash is open, a monster is near, or the game is paused.
- Portal and Potion buttons; full Thor controller layout with a second skill row on RB and remappable buttons under Settings → Controls → Gamepad.
- Measured in play: about 118 fps on the 120 Hz OLED (frames interpolated, game logic stays at the original 25 ticks/s), about 2 of 8 CPU cores, battery at most 34 °C on AC.

## Setup guide

- Download the ThorD2 APK from the [latest release](https://github.com/harmssi/thor-d2/releases/latest) and install it. Play Protect may warn because the app targets an older Android version — choose More details → Install anyway. It installs next to D2Android, so both can stay.
- Open Thor D2 and allow storage, notifications and background running.
- Install the game without a PC: choose English or German and type in your two CD keys (Diablo II and Lord of Destruction). The app downloads Blizzard's official installers, installs into its own storage and patches to 1.13d (about 2 GB download — use Wi-Fi). The keys go straight to Blizzard's installer and are never stored.
- Or copy an existing Diablo II 1.13d folder (with Game.exe, d2data.mpq, d2exp.mpq, …) to the device and use Choose game folder.
- Start a character — the deck appears on the lower screen by itself.

## Known issues

- Identifying items isn't enabled yet.
- The cube is untested.
- Screen recordings have no game audio.
