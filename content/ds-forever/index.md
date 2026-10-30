---
title: "DS Forever"
description: "A two-screen, controller-first companion that brings World of Warcraft: Forever to the AYN Thor's bottom screen."
date: "2026-10-14 07:45"
slug: "ds-forever"
category: "companion"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1x523sf/how_i_got_a_stranger_to_buy_me_a_mcgriddle/"
project_page: "https://github.com/Jreese702/DS-Forever"
---

## Description

DS Forever is a dual-screen companion for WoW Forever on the AYN Thor. The game runs on the top screen, and the bottom screen becomes a controller-first UI for everything else, so the game's own windows stay out of the way.

A companion add-on tells the app what's going on in the game. The app draws its own UI on the bottom screen and presses the game's own buttons for you — one action per button press, with no botting. Your saved login is encrypted, and it doesn't leave macros or keybinds behind on your character when you go back to PC.

It is an unofficial community project, not affiliated with or endorsed by Blizzard, WoW Forever's maintainers or GameNative. No Blizzard client files, extracted art or QuestieDB are bundled; you supply your own authorised game installation and account.

## Features

- Home screen with a live minimap, quest arrow, focused quest, chat and buffs
- Rooms for Bags, Quests, Spellbook/Talents, Character, Social, Group Finder, Professions, Map and Chat
- Pop-ups on the bottom screen for vendors, loot, dialogs and guild invites
- Radial pause menu and a consumables wheel
- Dynamic combat skill bar that swaps in when entering combat
- Companion shows observed NPCs, not database-only ghosts
- Old DS-created macros are removed silently, preserving user-created macros

## Requirements

- AYN Thor (other devices are unverified)
- Android 10 (API 29) or newer, arm64-v8a
- An authorised installation and account for World of Warcraft: Forever beta
- A game folder containing `.build.info` and `Data/`, including hidden files

## Setup guide

- Download and install the latest release APK: [DS-Forever-<version>.apk](https://github.com/Jreese702/DS-Forever/releases/latest).
- Choose the folder containing `.build.info` and `Data/`, including hidden files. Thor testing used `/storage/emulated/0/Documents/WoW Forever`.
- Run the two-screen setup; it checks environment readiness and automatically prepares art from your installed game.
- Complete the seven required steps; any required failure offers "Try again". QuestieDB downloads after the art check.
- Use Login / Update Login to manage sign-in; updating login restarts the game to read it.
- The app updater checks for and installs updates; offline checks do not block play.
