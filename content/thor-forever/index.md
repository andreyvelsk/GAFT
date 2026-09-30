---
title: "Thor Forever"
description: "An experimental setup that runs World of Warcraft: Forever Beta ARM64 locally on the AYN Thor — no streaming required."
date: "2026-09-30 07:07"
slug: "thor-forever"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtgyeo/i_got_wow_forever_running_locally_on_my_thor_max/)

## Description

Thor Forever is an experimental setup that runs World of Warcraft: Forever Beta (ARM64 client) locally on the AYN Thor Max — no streaming involved. It uses its own Wine 11 runtime and prefix, ARM64 DXVK, and a locally patched Turnip driver, and it does not replace the original GameHub runtime or include any WoW files. You need your own updated game installation and an account with access to the beta. On the owner's device, the game holds 30 FPS in the open world and lightly populated areas like Crossroads, with the worst performance in crowded cities; Ragefire Chasm was completed without issues. This is a single-device community preview, not a compatibility guarantee.

## Setup guide

Download Thor-Forever-v0.1.0-alpha.1.zip from the [release page](https://github.com/AeroNico/thor-forever/releases/latest) — use the release ZIP, not Code > Download ZIP, which contains source code. Then, on the Thor Max:

1. Download the official Battle.net installer and add the EXE as a game in GameHub Lite Ludashi.
2. Launch the installer through GameHub with default options (disable automatic startup) and let Battle.net install.
3. Close everything, return to GameHub, and enter the container desktop created for the Battle.net installer.
4. Open Battle.net from its installation folder (usually C:\Program Files (x86)\Battle.net), log in, and install the WoW Forever Beta ARM64 client. Battle.net may freeze — restart the container and continue until the installation finishes.
5. Extract the complete Thor-Forever folder from the release ZIP into Android's shared Download folder so the final path is Download/Thor-Forever/Install-Thor-Forever.cmd.
6. Close Battle.net, re-enter the same container desktop, run Install-Thor-Forever.cmd, press a key when prompted, and follow the full repo instructions, checking the setup report before launching anything.
7. After setup succeeds, point the container's GameHub Startup File Path to Download/Thor-Forever/Thor-Forever.exe so GameHub launches WoW Forever directly.

## Known limitations

This preview was tested on a single AYN Thor Max only. Other devices, other GameHub versions, and future WoW updates may not work. There is no automatic updater, uninstaller, or game-update migration, and the installer does not download missing payloads automatically. Battle.net can freeze during installation. The owner cannot guarantee that Blizzard's anti-cheat will never flag the setup as a false positive, so using it may carry a risk of account penalty or ban — use it at your own risk.

See the project page: [github.com](https://github.com/AeroNico/thor-forever)
