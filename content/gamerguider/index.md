---
title: "GamerGuider"
description: "A free, dark, text-only walkthrough reader that puts Fandom game guides on the AYN Thor's bottom screen."
date: "2026-10-02 06:26"
slug: "gamerguider"
category: "companion"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wvhg1s/i_made_a_free_walkthrough_app_for_the_ayn_thors/)

## Description

GamerGuider is a free, open-source walkthrough reader built for the AYN Thor's bottom screen. Point it at your ROM folder (the one with ps2, gc, psx, snes, switch, windows… inside) and it matches each game to its Fandom wiki, then builds a clean, text-only walkthrough. Every game gets the same layout: one tab per chapter, level or track, plus "at a glance" cards (bosses, items, collectibles) and boss cards with stats. The app was built with heavy help from an AI coding assistant, but the app itself uses no AI — the guide cleanup is plain rule-based code, there are no API keys, and nothing is sent anywhere except requests to Fandom. No accounts, no ads, no tracking.

## Setup guide

Download the latest APK from the Releases page and install it on your Thor. Open the app and choose your ROM folder — the folder holding your console folders (ps2, gc, psx, snes, windows…). Only recognized console folders are read, and only each console's game file types count; in a Windows/PC folder, each game folder counts as one game. The app then finds each game's Fandom wiki and page (green dot = found, amber = console not confirmed). Open a game to read its walkthrough.

## Features

Built for the bottom screen: pure black AMOLED theme, full screen, and a compact layout sized for the 3.92" display. Adjustable text size, a chapter list, and a reading-progress bar. The app remembers your chapter and scroll position, with a "Continue reading" shortcut on the library screen. Guides are saved offline, and you can search across everything you've saved. Console badges are color-coded.

## Known issues

Guides come from Fandom, so coverage depends on how good each game's wiki is. Most big games work well, but some wikis don't have walkthroughs; games without a written walkthrough get one tab per level, built from the wiki's level pages. If the app grabs the wrong game, tap "Wrong game? Pick a different guide" at the bottom of any chapter. Expect some rough edges.

See the project page: [github.com](https://github.com/DrewInsley/gamerguider)
