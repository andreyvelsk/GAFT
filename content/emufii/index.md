---
title: "Emufii"
description: "Play your emulators online with friends using a six-character code — no ports to open, no IPs to swap."
date: "2026-10-08 06:19"
slug: "emufii"
category: "tool"
generated: "ai"
media:
  - type: "video"
    url: "https://www.youtube.com/watch?v=OVNh9BklLeA"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wzszm8/emufii_20_release_trailer/)

## Description

Emufii is an Android app that connects your emulators to your friends' emulators over the internet. The emulators think everyone is on the same Wi-Fi, so their own local multiplayer just works.

How it works: the host picks a game and shares a six-character code; friends enter the code or pick a public session; Emufii opens the emulator and fills in the address; everyone plays as if on the same Wi-Fi.

Emufii is not an emulator — every game runs in the emulator you already use. It is not a frontend, not a downloader (no games, BIOS files, keys or emulators included) and not streaming: each player runs their own copy of the game on their own device. Emufii never connects to Nintendo's or Sony's servers, so games that needed them don't work online; DS games through the Kaeru WFC revival server are the exception.

## Features

- Connects the players: a private network between the players for the length of a session, through Android's VPN feature. Only game traffic goes through it.
- Sets up the emulator: opens it on its multiplayer screen and fills in the connection details for you.
- Shows your games: the games from your own ROM folder, with covers and a compatibility badge, to start a session from.
- Brings your friends: add them with a code, see who's online and what they're playing, and join their sessions.

## Supported games

Games that had local multiplayer on the original console work, and for the DS online mode, games that used Nintendo Wi-Fi Connection. Every player needs the same emulator version and the same copy of the game.

Supported consoles and emulators:
- Switch — Eden (local wireless, any recent version)
- 3DS — Azahar (local wireless, pre-release 2126.0-rc or newer)
- Wii / GameCube — Dolphin (netplay, Android build 2606a)
- PSP — PPSSPP (ad hoc, any recent version)
- PS2 — ARMSX2 (System Link / LAN, any recent version)
- DS — WatermelonDS Emufii Edition (local wireless, 0.8.0.rc2-emufii)
- DS — melonDS or WatermelonDS (online via Kaeru WFC, any recent version)

The full list of compatible games is available in the repository.

## Setup guide

1. Install the emulators you want to use.
2. [Download the latest APK](https://github.com/jojodogm-ctrl/emufii/releases/latest) and install it.
3. Open Emufii and follow the setup.

Emufii 2.0 is a beta that works on Android 13, 14 and 15. DS local wireless games need WatermelonDS Emufii Edition, a fork that installs next to the official WatermelonDS so you keep your saves and settings.

If the autofill option is greyed out, Android blocks it for apps installed outside a store. Go to App info → ⋮ → Allow restricted settings, then turn Emufii on in Settings → Accessibility.

To update, download the new APK from the [releases page](https://github.com/jojodogm-ctrl/emufii/releases/latest) and install it over the old one — your settings are kept.

In a public session, other players' devices can reach yours, like on shared Wi-Fi. If you're playing with friends, keep the session private.

See the project page: [github.com](https://github.com/jojodogm-ctrl/emufii)
