---
title: "Emufii"
description: "Play your emulators online with friends using a six-character code — no ports to open, no IP address to share."
date: "2026-10-06 06:29"
slug: "emufii"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/emufii/preview.webp"
  - type: "video"
    url: "https://youtu.be/OVNh9BklLeA"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wyeyj9/emufii_20_drops_tomorrow_october_6_remote_ds/)

## Description

Emufii is an Android app that connects your emulators to your friends' emulators over the internet. The emulators think everyone is on the same Wi-Fi, so their own local multiplayer just works.

You create or join a session with a six-character code, and your devices end up on the same network. Emufii fills in the address in your emulator, launches the game, and the emulator does the rest. It doesn't emulate anything and it doesn't provide games, BIOS or keys. Each player runs their own copy of the game on their own device — it is not streaming.

To play: the host picks a game and shares the six-character code, friends enter the code or pick a public session, Emufii opens the emulator and fills in the address, and everyone plays as if on the same Wi-Fi.

## Features

- **Remote DS local wireless.** 752 DS games are playable in multiplayer with friends who are far away, through WatermelonDS Emufii Edition.
- **North America server.** A dedicated NA server reduces lag for US users, who previously went through a single server in France.
- **PSP revival servers.** On top of local play, compatible PSP games can be played truly online through community revival servers.
- **Refreshed interface**, support for Android 14 and 15, and covers from iiSU on top of SteamGridDB, ES-DE and Cocoon.

## Supported games

Games that had local multiplayer on the original console work in local wireless mode. For the DS online mode, games that used Nintendo Wi-Fi Connection work through the Kaeru WFC revival server. Every player needs the same emulator version and the same copy of the game.

Supported consoles and emulators:
- Switch (Eden) — local wireless
- 3DS (Azahar) — local wireless
- Wii / GameCube (Dolphin) — netplay
- PSP (PPSSPP) — ad hoc
- PS2 (ARMSX2) — System Link / LAN
- DS (WatermelonDS Emufii Edition) — local wireless
- DS (melonDS or WatermelonDS) — online via Kaeru WFC

See the full list of compatible games in the repository.

## Setup guide

- Install the emulators you want to use.
- [Download the latest APK](https://github.com/jojodogm-ctrl/emufii/releases/latest) and install it.
- Open Emufii and follow the setup.
- The app is free and still in beta, and works on Android 13, 14 and 15.
- DS local wireless requires WatermelonDS Emufii Edition, a fork of WatermelonDS that adds the netplay Emufii needs. It installs next to the official WatermelonDS, so your saves and settings are kept.
- If the autofill option is greyed out, Android blocks it for apps installed outside a store: go to **App info → ⋮ → Allow restricted settings**, then turn Emufii on in **Settings → Accessibility**.
- To update, download the new APK from the [releases page](https://github.com/jojodogm-ctrl/emufii/releases/latest) and install it over the old one. Your settings are kept.

See the project page: [github.com](https://github.com/jojodogm-ctrl/emufii)
