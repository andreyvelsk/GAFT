---
title: "ECHO"
description: "A controller-first Android home screen inspired by the PSP's XMB, with a built-in book reader and dual-screen support for the AYN Thor."
date: "2026-10-07 06:25"
slug: "play-field-portal"
category: "tool"
generated: "ai"
media:
  - type: "image"
    url: "/content/play-field-portal/preview.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wzi2mc/echo_launcher_270_available_now_playfield_portal/)

## Description

ECHO (Extensible Console Handheld Operator) is a controller-first Android home screen inspired by the XMB (XrossMediaBar) of the PSP and PS3. It replaces the Android home screen with one crossbar: categories run left to right, their items run top to bottom. Games from the emulators you already have, Android apps, and your own music, video, photos and books all live on it, and all of it works from a controller.

ECHO is a fork of PlayFieldPortal. It is local-first: there is no account and no telemetry, and it only goes online when you ask it to fetch artwork or metadata.

On a handheld with a second screen, such as the AYN Thor, ECHO uses both: the XMB stays on the top screen and the bottom screen is a companion. Devices with one screen are unchanged.

## Setup guide

- Download `ECHO-<version>.apk` from the [latest release](https://github.com/Sonophage/echo-launcher/releases/latest) (not the `-debug` one, unless you want a second copy beside the normal app).
- Open it on the device, allow installs from that source when Android asks, and tap Install.
- Press Home, pick ECHO and choose Always. Importing shortcuts from other launchers needs it to be the default home app.
- Recommended: install through Obtainium so updates arrive by themselves — add the ECHO repository and set the APK filter to `^ECHO-[0-9.]+\\.apk$` to always get the normal app.
- First run: a fresh install opens the setup wizard. It asks what ECHO is for (Gaming and Media, each on or off), then permissions, your folders, emulators and accounts. Every step is optional and sets the same thing as the matching Settings screen; run it again any time from Settings ▸ Setup ▸ Setup Wizard.

## Features

- One crossbar for everything: games from the emulators you already have, Android apps, music, video, photos and books, all from a controller or by touch.
- The XMB feel: a PS3-style wave (or ECHO's own Rings and Arcs) tinted by the focused art, a boot sequence, a launch disc and GameBoot, menu music and a slot for every interface sound.
- A built-in book reader for EPUB, PDF and CBZ, and built-in music, video and photo players.
- Artwork that looks like a shelf: box covers fetched from ScreenScraper, SteamGridDB, IGDB and Steam, shown as VHS cases in the App Drawer and Search.
- Two screens on dual-screen handhelds such as the AYN Thor: the XMB on one, a companion on the other with the focused game's details, Last Played, the App Drawer, Search and Settings.
- A profile with RetroAchievements, Steam achievements and Discord presence.
- Almost everything is adjustable: controller glyphs, touch, layout, colours, icons, wallpaper, sounds and boot all have a setting.
- Local-first: no account, no telemetry, and an editable ECHO folder for your art and look.

## Requirements

- Android 10 (API 29) or newer.
- The emulators you want to use, installed separately; ECHO launches them and does not emulate anything itself.
- A controller is recommended; touch works throughout.
- Side-loaded APK — ECHO is not on the Play Store.

See the project page: [github.com](https://github.com/Sonophage/echo-launcher)
