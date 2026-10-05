---
title: "WoW Forever for Android"
description: "Play the World of Warcraft: Forever beta natively on Snapdragon 8 Gen 2 Android handhelds like the AYN Thor."
date: "2026-10-05 06:42"
slug: "wow-forever-android"
category: "game"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wxw5to/wow_forever_standalone_v2_for_thor_or_other_8gen2/)

## Description

WoW Forever for Android is a standalone launcher that plays the World of Warcraft: Forever beta on Snapdragon Android handhelds as a normal Android app — tap the icon, press Play, and the game runs. It uses Blizzard's own Windows ARM64 WoW client, so the game itself runs natively on the device's CPU; Wine translates the Windows calls, and DXVK plus a patched Turnip Vulkan driver render the game on the Adreno GPU. Nothing is emulated as x86. It is an unofficial community project, not affiliated with or endorsed by Blizzard Entertainment. You need your own Battle.net account with WoW Forever beta access, and the repository and its releases contain no Blizzard game files.

## Setup guide

1. Install the app. Download `WoW-Forever.apk` from the latest release and install it on your device. The package name is `app.wowforever`, so it can sit alongside GameNative or Winlator.

2. Copy your WoW game data to the device (one-time setup). Copy two things from your Battle.net install (on a Mac that's `/Applications/World of Warcraft/`) into a folder on the device. The default is `/storage/emulated/0/WoW Forever/`; any other folder works too, including one on an SD card:
- `.build.info` — a hidden file from the install root. Without it the game fails with "CAS system was unable to initialize".
- `Data/` — the whole Data folder (~67 GB). It is the same on every platform, so a Mac, Windows, or ARM install all work.

You don't need `WowB-ARM64.exe`; the app downloads the matching Windows ARM64 client from Blizzard's CDN when you press Play and checks its hashes. Transfer the files with an SD card (make sure your file manager shows hidden files so `.build.info` is included) or over USB in File Transfer / MTP mode. If you used a different folder, the launcher shows Locate Game Files — pick the folder that contains `.build.info` and `Data/`.

3. Play. Open WoW Forever. Once your game files are configured, the app automatically launches straight into the game. The first launch downloads the ARM64 game client and installs the Windows environment, which takes a few minutes and needs an internet connection.
- To access the setup screen (folder settings, forget credentials, environment status, updates), hold Start + Select + L2 + R2 (or tap the back button) during the loading splash.
- Built-in handheld controllers work in-game; WoW's own gamepad mode handles the mapping.
- Press Back to open the in-game sidebar with Keyboard, Sign in to Battle.net, on-screen controls, performance overlay and Exit. On dual-screen devices like the Thor, the keyboard appears on the bottom screen.
- Use Sign in to Battle.net to have the app fill in your credentials. The first time, it prompts for your email and password and stores them encrypted with the Android Keystore on-device only. Authenticator codes still have to be entered by hand.

Game updates are handled in-app: the launcher checks the live version against Blizzard's public patch service on startup, and if an update is detected you can tap UPDATE TO {version} to download the new client over Wi-Fi. You no longer need a computer or USB cables to keep the game updated.

## Features

- Native ARM64 launch: ARM64 executables launch directly, so the game never goes through x86 emulation.
- Direct launch & instant boot: once configured, the app skips the launcher and boots straight into the game.
- Native in-app game updater: live version check against Blizzard's patch services, direct-from-CDN ARM64 binary and manifest downloads, CASC index synchronization, and atomic `.build.info` updates on-device over Wi-Fi — no PC dependency.
- Battle.net sign-in: a sidebar item that types a saved, Keystore-encrypted login into WoW, with reliable field selection and cursor handling for clean controller play.
- Keyboard on the second screen: the keyboard always goes through the IME receiver, so it appears on the Thor's bottom screen.
- Lean runtime & startup: removed bloat from the game native code and the container; the game boots ultra fast with dramatically increased performance — locked 60 FPS in lower population areas and indoors, around 40 in cities on the Thor Max.
- Pre-configured container: bionic, Proton 11 ARM64EC, Turnip through the Vulkan wrapper, DXVK 2.4.1 aarch64, all 8 cores, 1920x1080, and `G:` mapped to the WoW Forever folder.

## Requirements

- Snapdragon 8 Gen 2 (Adreno 740). The bundled Turnip driver targets this GPU; other Adreno 7xx chips might work but haven't been tried.
- Android 10 or newer, 64-bit.
- About 80 GB free for the game data (internal storage or SD card), plus about 4 GB of internal storage for the app and its Windows environment.
- A Mac or PC with the WoW Forever beta installed through Battle.net, to copy the game data from.
- Your own Battle.net account with WoW Forever beta access.
- Tested devices: AYN Thor (Snapdragon 8 Gen 2 / Adreno 740) and Retroid Pocket 6 (Snapdragon 8 Gen 2 / Adreno 740); AYN Odin 2 / Odin 2 Portal / Mini are expected to work but untested.

See the project page: [github.com](https://github.com/jaredgei/wow-forever-android)
