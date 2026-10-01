---
title: "WoW Forever for Android"
description: "Play the World of Warcraft: Forever beta natively on your AYN Thor with this standalone Android launcher."
date: "2026-10-01 06:52"
slug: "wow-forever-android"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/wow-forever-android/preview.webp"
  - type: "image"
    url: "/content/wow-forever-android/screenshot-2.webp"
  - type: "image"
    url: "/content/wow-forever-android/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wupt0w/wow_forever_standalone_apk_for_ayn_thor/)

## Description

Play the World of Warcraft: Forever beta on Snapdragon Android handhelds as a normal Android app — tap the icon, press Play, and the game runs. It uses Blizzard's own Windows ARM64 WoW client, so the game itself runs natively on the device's CPU; Wine translates the Windows calls, and DXVK plus a patched Turnip Vulkan driver render the game on the Adreno GPU. Nothing is emulated as x86.

This is an unofficial community project, not affiliated with or endorsed by Blizzard Entertainment. You need your own Battle.net account with WoW Forever beta access, and the app contains no Blizzard game files.

Supported devices: AYN Thor (tested — reaches the game world with controller support), Retroid Pocket 6 (tested by the original community setup), and AYN Odin 2 / Odin 2 Portal / Mini (expected to work, untested). Requirements: a Snapdragon 8 Gen 2 (Adreno 740) chip, Android 10 or newer (64-bit), about 80 GB free for the game data plus about 4 GB of internal storage, and a Mac or PC with the WoW Forever beta installed through Battle.net to copy the game data from.

## Setup guide

1. Install the app — download WoW-Forever.apk from the [latest release](https://github.com/jaredgei/wow-forever-android/releases/latest) and install it on your device. Its package name is app.wowforever, so it can sit alongside GameNative or Winlator.

2. Copy your WoW game data to the device — copy two things from your Battle.net install (on a Mac that's /Applications/World of Warcraft/) into a folder on the device. The default is /storage/emulated/0/WoW Forever/, but any other folder works too, including one on an SD card: the .build.info file (from the install root) and the whole Data/ folder (~67 GB). Data/ is the same on every platform, so a Mac, Windows or ARM install all work. .build.info is a hidden file — copy it too, because without it the game fails with "CAS system was unable to initialize". You don't need WowB-ARM64.exe: the app downloads the matching Windows ARM64 client from Blizzard's CDN when you press Play and checks its hashes. If you used a different folder, the launcher shows Locate Game Files — pick the folder that contains .build.info and Data/.

3. Play — open WoW Forever and press Play. The first launch downloads the ARM64 game client and installs the Windows environment, which takes a few minutes and needs an internet connection. After that it boots straight into the game.

Controls and signing in: built-in handheld controllers work in-game (WoW's own gamepad mode handles the mapping). Press Back to open the sidebar with Keyboard, Sign in to Battle.net, on-screen controls, a performance overlay and Exit. The sidebar's Keyboard opens the Android keyboard — on dual-screen devices like the Thor it appears on the bottom screen, and symbols like @ and pasting work. For Sign in to Battle.net, select WoW's email field first, then pick the option; the first time it asks for your email and password and saves them on the device, encrypted with the Android Keystore. Nothing is sent anywhere, and Forget Saved Login removes the saved credentials. Authenticator codes still have to be entered by hand.

## Features

Standalone launcher forked from GameNative, stripped down to a single pre-configured container: it opens straight to a WoW splash screen with no store logins or library. The game launches natively as an ARM64 executable, so it never goes through x86 emulation. The launcher writes a basic WTF/Config.wtf on first run and always forces the D3D11 renderer that works with DXVK. A sign-in shortcut remembers your username and password (stored locally only, encrypted on your device) so you don't have to type them with the on-screen keyboard every time — if you sign in normally through the game client, nothing is stored. The on-screen keyboard is fixed to appear on the Thor's bottom screen, and controller support works out of the box.

## Updating and troubleshooting

The app doesn't update the game. Every time Blizzard patches the beta, you have to copy the new files to the device yourself. If the game suddenly says "No realms available" or there are no servers to pick, an out-of-date client is almost always the reason. To update: let Battle.net patch the game on your computer, then sync the changed files to the device.

Common issues: "CAS system was unable to initialize" means .build.info or _classic_beta_/.flavor.info is missing on the device. "No realms available" or no servers listed means the device client is out of date. If the keyboard doesn't appear, force-stop Gboard (Settings → Apps → Gboard → Force stop) and open Keyboard again — it can get stuck on the second screen. If sign-in types into the wrong field, select WoW's email field before using Sign in to Battle.net. If the game returns to the launcher after "Launching Game…", check the files under _classic_beta_/Errors/ on the device. If a handheld frontend shows the wrong icon, set it with the frontend's Edit App Artwork or reinstall the app.

See the project page: [github.com](https://github.com/jaredgei/wow-forever-android)
