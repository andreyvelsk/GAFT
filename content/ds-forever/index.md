---
title: "DS Forever"
description: "A two-screen, controller-first companion that brings World of Warcraft: Forever to the AYN Thor's bottom screen, locally or streamed from a PC."
date: "2026-10-14 07:45"
slug: "ds-forever"
category: "companion"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xpmb14/wow_forever_dual_screen/"
project_page: "https://github.com/Jreese702/DS-Forever"
---

## Description

DS Forever is a dual-screen companion for WoW Forever on the AYN Thor. The game runs on the top screen, and the bottom screen becomes a controller-first UI for everything else, so the game's own windows stay out of the way. The game can run locally on the Thor or be streamed from a Windows PC.

A companion add-on tells the app what's going on in the game. The app draws its own UI on the bottom screen and presses the game's own buttons for you — one action per button press, with no botting. Your saved login is encrypted, and it doesn't leave macros or keybinds behind on your character when you go back to PC.

It is an unofficial community project, not affiliated with or endorsed by Blizzard, WoW Forever's maintainers or GameNative. No Blizzard client files, extracted art or QuestieDB are bundled; you supply your own authorised game installation and account.

## Features

- Local play on the Thor or streaming from a Windows PC via DS Forever Desktop
- Home screen with a live minimap, quest arrow, focused quest, chat and buffs
- Rooms for Bags, Quests, Spellbook/Talents, Character, Social, Group Finder, Professions, Map and Chat
- Pop-ups on the bottom screen for vendors, loot, dialogs and guild invites
- Radial pause menu and a consumables wheel
- Dynamic combat skill bar that swaps in when entering combat
- Companion shows observed NPCs, not database-only ghosts
- Old DS-created macros are removed silently, preserving user-created macros
- Streaming mode pairs the Thor with DS Forever Desktop over home Wi-Fi and starts WoW with the login saved on your Thor
- Your saved login stays sealed on the Thor; after pairing it is sent to the PC over an encrypted link and written to WoW's own `login.txt`, readable by your Windows account only and deleted about 20 seconds after sign-in starts (5 minutes at most, or as soon as the Thor disconnects)
- No keys are typed during streaming; authenticator challenges stay manual
- Desktop updates itself from these releases once no Thor is connected, checked against `SHA256SUMS`
- WoW closes itself 5 minutes after the stream ends, unless the PC is in use

## Requirements

- AYN Thor (other devices are unverified)
- Android 10 (API 29) or newer, arm64-v8a
- An authorised installation and account for World of Warcraft: Forever beta
- A game folder containing `.build.info` and `Data/`, including hidden files
- About 250 MB free for a direct install; the game streams the rest from Blizzard as you play, up to about 50 GB, so Wi-Fi and 60 GB free are needed
- A Windows PC on your home Wi-Fi with DS Forever Desktop for streaming mode

## Setup guide

- Download and install the latest release APK: [DS-Forever-<version>.apk](https://github.com/Jreese702/DS-Forever/releases/latest).
- On first start, choose **Install directly** (about 250 MB now; the game streams the rest from Blizzard as you play, up to about 50 GB; needs Wi-Fi and 60 GB free) or choose an existing folder containing `.build.info` and `Data/`, including hidden files. Thor testing used `/storage/emulated/0/Documents/WoW Forever`.
- Run the two-screen setup; it checks environment readiness and automatically prepares art from your installed game.
- Complete the seven required steps; any required failure offers "Try again". QuestieDB downloads after the art check.
- Use Login / Update Login to manage sign-in; updating login restarts the game to read it. Refused sign-in has recovery controls. Avoid repeated wrong-password tests.
- The app updater checks for and installs updates; offline checks do not block play.
- For streaming, download `DsForeverDesktop-<version>-win-x64.zip` from the same [latest release](https://github.com/Jreese702/DS-Forever/releases/latest) as the APK, unzip it to a folder you keep, and run `DsForeverDesktop.exe`.
- Pick Streaming on the Thor and enter the code Desktop shows. Connect on your home Wi-Fi; Desktop starts WoW and signs in with the login saved on your Thor.
- Desktop is not code-signed, so Windows may warn on first run. Authenticator challenges stay manual.
