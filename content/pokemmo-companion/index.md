---
title: "PokeMMO Companion"
description: "A companion app for PokeMMO that watches the game on the Thor's top screen and shows alerts, battle help and Pokédex tools on the bottom screen."
date: "2026-10-03 06:20"
slug: "pokemmo-companion"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/pokemmo-companion/preview.webp"
  - type: "image"
    url: "/content/pokemmo-companion/screenshot-2.webp"
  - type: "image"
    url: "/content/pokemmo-companion/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wvy4r1/i_made_a_companion_app_for_pokemmo_for_the_thor/)

## Description

PokeMMO Companion is a free, open-source Android app built for dual-screen handhelds like the AYN Thor: the game runs on the top screen and the companion on the bottom. It watches the game through Android's screen capture and reacts to what's happening on screen. It buzzes and plays a sound when a shiny shows up, and a different buzz when a wild Pokémon is still missing from your Pokédex. It also includes a battle helper that pops up on its own and ranks your moves by damage using PokeMMO's numbers, reads your party from the in-game summary screens, and offers a Pokédex with spawn locations, an EV horde finder, berry timers, breeding and egg-move tools, GTL prices and an encounter counter. The app never touches the game — no inputs, no memory reading — and nothing gets saved or uploaded. It is built around the Thor's dual screens, so it probably won't work right on other devices, and OCR isn't perfect: if something reads wrong you can edit it by hand in the app.

## Setup guide

Download the latest APK from the [releases page](https://github.com/PokeMMOCompanion/pokemmo-companion/releases/latest) and open it on your device to install — Android will ask you to allow installs from your browser or file manager. Put the app on the bottom screen and PokeMMO on the top screen, then tap the lens icon (top left) and allow screen capture of the entire screen. In the app, go to Party → Read party, then open each Pokémon's summary in the game and page through its tabs. Optional: Tools → Settings → Pokémon sprites → Download to fetch sprites. The app is built for a 1920×1080 top screen running PokeMMO in landscape and requires Android 10 or newer (arm64). When a new version is out, the app tells you (Settings → Updates); install the newer APK over the old one and your data is kept.

## Features

Alerts: a strong buzz and sound for shinies and for Pokémon still needed for your Pokédex. Battle Assistant: reads your Pokémon and the opponent, ranks your moves by damage using PokeMMO mechanics (weather, screens, burn, stat stages), shows threats, speed and possible abilities, and remembers what trainers reveal — moves, abilities, items and stats worked out from the damage dealt and taken — plus catch chances per ball and a team builder for test matchups. Party: read from the in-game summary screens or entered by hand, with HP from the overworld rings, EV tracking toward targets, and level-up / new-move detection. Pokédex: all 649 Pokémon with stats, EV yields, evolutions and wild locations; the Here view shows what spawns where you are right now (from the pause menu); an EV horde finder; caught / needed tracking. Tools: berry farm timers with water, harvest and wither reminders, a breeding planner, egg-move chains, GTL prices and an encounter counter. Quests: a gym and League checklist per region, with your party's matchup against the next one.

## Privacy

Screen capture sounds scary, but nothing leaves your phone: frames are looked at in memory a couple of times a second and then thrown away — the app never saves screenshots or recordings and never uploads what's on your screen. There is no account, login, ads or tracking, and the app never asks for your PokeMMO login and has no way to control the game. Internet is only used when you tap Download (Pokémon sprites from PokemonDB), open GTL prices (PokeMMO Hub's price API), or check for app updates (at most twice a day; can be turned off in Settings → Updates) — none of these requests contain anything from your screen. Text recognition runs on the phone (Google ML Kit, bundled model); ML Kit sends Google anonymous performance stats (phone model, OS version, timing), never the images or the text it reads. What it keeps on the phone: your party, settings, berry timers, encounter counts and Pokédex progress. A diagnostic log of what it reads is off unless you turn it on (Settings → Privacy), and turning it off deletes it. Android shows its own warning when capture starts and a notification while it runs — tap the lens or the notification's Stop to end it any time. PokeMMO's rules forbid automating the game, modifying the client and reading its memory or network traffic; this app does none of that. It only looks at the screen and only notifies, vibrates, plays sounds and counts — a person always plays the game.

See the project page: [github.com](https://github.com/PokeMMOCompanion/pokemmo-companion)
