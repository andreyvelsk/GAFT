---
title: "WiiDS"
description: "WiiDS brings Wii games to the AYN Thor and puts the handheld's bottom screen to real use."
date: "2026-10-23 06:59"
slug: "wiids"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/wiids/preview.webp"
  - type: "image"
    url: "/content/wiids/screenshot-2.webp"
  - type: "image"
    url: "/content/wiids/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xcodmi/update_wiids_v10_live_now/"
project_page: "https://github.com/Maddex712/WiiDS"
---

## Description

WiiDS is a project for the AYN Thor that brings Wii and GameCube games to the handheld with full use of both screens. Making the bottom screen useful was a major focus — it isn't just something to look at every now and then. v1.1 ships with 8 games (including mods). Note that Super Mario Galaxy looks slightly different than the pictures in the post — check the GitHub for the current look.

## Features

- Makes full use of the AYN Thor's two screens, with the bottom screen serving a real purpose
- Ships with 8 games (including mods) in v1.1
- Save manager with dated backups, export/restore and supported Dolphin in-game save imports (no root needed) for all 8 game/mod profiles; your current save is backed up automatically before importing
- Galaxy trackpad controls: move the Star Pointer from the bottom screen, lifting and repositioning your finger without it jumping; planet mode is still available
- Galaxy graphics and camera fixes: corrected opening-attack colors and Toad palettes, restored camera restrictions, and Original / Smooth / Smooth + glow picture options
- Cocoon/frontend shortcuts for individual games and mods, including returning to an already-running game
- NSMB/MSMBWii improvements: physical tilt and shake enabled by default (unless previously turned off), plus a fix for the resume crash
- RetroAchievements browser with descriptions, badges and existing account progress across both screens; earning new achievements or points is not supported yet
- In-app updates: check for updates, download in the background and install with checksum/signature verification and Android confirmation
- Fixed missing menu music and artwork on fresh installs

## Supported games

- 8 games (including mods) included with v1.1
- Mario Kart Wii and the Retro Rewind expansion
- New Super Mario Bros. Wii and MSMBWii: Just a Little Adventure
- Super Mario Sunshine and Super Mario Eclipse 1.1.0
- Super Mario Galaxy 1 and Kaizo Mario Galaxy Rebalanced 2.1 (new in 1.1, with its own saves, settings and lower-screen maps)
- Super Mario Galaxy is among them — it looks slightly different than the pictures in the post (check the GitHub for details)

## Setup guide

Download the latest release from the GitHub repository and install the APK on your AYN Thor. Open WiiDS and wait for it to prepare its files. You need your own compatible game dumps — games are not included. Copy a dump to the Thor through Options → Your games (it opens automatically on first use), then use Choose file on the game's card or Search again to find your dump. For Super Mario Galaxy, use a clean USA Galaxy 1 ISO (RMGE01, revision 0) and press Set up Galaxy. Return to the library, press A to choose a game (Original or its mod), A to open its case, then A to launch the disc. B goes back; X opens Options.

To update from v1.0, close your game and install 1.1 over the existing app — don't uninstall or clear your data. The GitHub has a very easy-to-follow installation guide with more information.

Join the WiiDS Discord: https://discord.gg/vTEKP8wpQm
