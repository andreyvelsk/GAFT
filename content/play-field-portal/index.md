---
title: "Play Field Portal"
description: "A controller-first Android game launcher inspired by the PSP's XMB that unifies ROMs, Android games, PC titles, apps and media under one crossbar interface."
date: "2026-10-06 06:21"
slug: "play-field-portal"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wy34wh/release_play_field_portal_130/)

## Description

Play Field Portal (PFP) is a home-screen replacement for Android handhelds, tablets and phones that gives your whole library the look and feel of a PlayStation Portable. It is a unified game frontend: ROM emulation, Android games, PC-layer titles (Winlator and friends) and native apps brought together under one cohesive interface that is fully controller-navigable. Everything is one crossbar away:

- **Games** — ROMs launched through the emulators you already have installed, Android games, and PC-layer titles, unified under one Game category.
- **Media** — Music, Video and Photo sections that scan folders you choose.
- **Apps** — your installed apps, organized into categories you design.
- **Achievements** — Shiba Coins, one coin wallet across RetroAchievements, Steam, emulated Steam PC games and ARMSX3 PS3 trophies.
- **Personalization** — a deep theme system (custom wallpapers, one-color palettes, imported PSP themes), replaceable icons, sounds and boot videos, plus a desktop Theme Studio for authoring.

PFP is local-first: no account, no telemetry, and the network is only touched by features you turn on or connect. It ships in Full and Lite editions and is distributed as a side-loaded APK (not on the Play Store). Backup & Restore is temporarily unavailable in this build while its format is reworked.

## Features

Version 1.3.0 adds:

- **Animated XMB** — motion wallpapers, animated GIF icons you can edit live on the XMB, step and rewind motion on item lists, and playback control for animated images so they are only as busy as you want.
- **GameBoot** — now a single toggle with a built-in sequence; you can swap in your own clip.
- **Original menu sounds** — the Sony-derived menu sounds were replaced with an original set.
- **Organization** — create your own Memory Cards, move categories around live, pin items where you want them, and set the arrangement for each list.
- **UMD slot** — shows whatever game you have "inserted".
- **Games filter** — live search, hide games from All Games, multi-disc games shown as one game with a disc picker, and warnings when ROMs go missing instead of dead tiles.
- **Theme Studio** — rebuilt around a live XMB preview; author motion wallpapers, animated icons, physical media and UMD icons, and lock screen images. Video and audio previews play properly, and it ships with a Windows installer (.exe or .msi). Two themes are included in the release: Crisis Core Remix and Final Fantasy VII - Animated.
- **Shiba Coins achievements** — PS3 trophies (ARMSX3) and Xbox 360 achievements (X360 Mobile / XenDroid), fully offline.
- **Artwork Studio** — full rework with multi-art picks, crop previews, Steam as a source, and controller-friendly Change Match.
- **App Drawer** — redesigned, with a controller virtual keyboard.
- **Notifications** — now tell you what went wrong and how to fix it.
- **Emulator Knowledge Base** — a file you can import, export and share; the default one is attached to the release.
- **Lock screen images** and better battery life.

## Requirements

- Android 10 (API 29) or newer
- Phones, handhelds, tablets and foldables — the layout adapts to each
- A game controller is recommended; full touch navigation is also supported
- Emulators are installed separately — PFP launches them, it does not emulate anything itself

## Setup guide

1. Download the APK for your chosen edition (`PlayFieldPortal-<version>-full.apk` or `-lite.apk`) from the [latest release](https://github.com/JohnnyCollado/PlayFieldPortal/releases/latest).
2. Open the file on your device. Android will ask you to allow installs from your browser or file manager the first time — approve it.
3. Tap **Install**.
4. (Optional) Set PFP as your home screen: press the **Home** button, pick **Play Field Portal**, and choose **Always**. You can change this later under *Android Settings › Apps › Default apps › Home app*.
5. On first run, a guided setup wizard walks you through controller layout, ROM folders, media folders, artwork, online services, achievement services, emulators and more. Every page can be skipped, and everything it configures is the same setting you can reach later in Settings. Re-run it any time from *Settings › System › Setup Wizard*.

PFP does not ask for a runtime permission at first start. Optional permissions (usage access, display over other apps) are requested only when you use the feature that needs them.

See the project page: [github.com](https://github.com/JohnnyCollado/PlayFieldPortal)
