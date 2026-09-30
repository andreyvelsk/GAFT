---
title: "Thor Forever"
description: "An experimental setup that runs World of Warcraft: Forever Beta ARM64 locally on the AYN Thor — no streaming required."
date: "2026-09-30 13:57"
slug: "thor-forever"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtgyeo/i_got_wow_forever_running_locally_on_my_thor_max/)

## Description

Thor Forever is an experimental, community-preview setup that runs World of Warcraft: Forever Beta (ARM64 client) directly on the AYN Thor handheld — no streaming. It was built and tested on a single AYN Thor Max using GameHub Lite Ludashi, a separate patched Wine 11 runtime and prefix, ARM64 DXVK 2.4.1, and a locally patched Mesa Turnip driver. The project is not affiliated with Blizzard, AYN, GameHub, Wine or Mesa, and it does not include any WoW files — you need your own updated installation and an account with access to the beta.

The owner reports playable in-world gameplay at 30 FPS in the open world and lightly populated areas such as Crossroads, with the worst performance in crowded cities. Ragefire Chasm was completed with this setup. Direct launch from GameHub, restarting the console, and saved gamepad settings all passed manual testing on the owner's device.

## Setup guide

1. Download the official Battle.net installer on the Thor Max and add the installer EXE as a game in GameHub Lite Ludashi.
2. Launch the installer through GameHub, leaving the installation options at their defaults except for disabling automatic startup.
3. Close everything, return to GameHub, and enter the container desktop that was created for the Battle.net installer.
4. In the container, open Battle.net from its installation folder (usually "C:\Program Files (x86)\Battle.net"), log in, and install the WoW Forever Beta ARM64 client. Battle.net may fail to open or freeze completely — restart the entire container, reopen Battle.net, and continue the installation until it finishes.
5. Download the Thor Forever release ZIP and extract the complete "Thor-Forever" folder into Android's shared "Download" folder. The final path must be "Download/Thor-Forever/Install-Thor-Forever.cmd" (Android calls this location "/sdcard/Download").
6. Close Battle.net, enter the same container desktop, open the extracted folder, and run "Install-Thor-Forever.cmd". Press a key when prompted, then follow the full instructions in the repository and check the setup report before launching anything.
7. After setup finishes, point the container's GameHub Startup File Path to "Download/Thor-Forever/Thor-Forever.exe" so GameHub launches WoW Forever directly.

Download the latest release from the [release page](https://github.com/AeroNico/thor-forever/releases/latest) and follow the START-HERE.md instructions. Do not use "Code > Download ZIP" — that contains source code, not the installer payload. The installer does not download missing payloads automatically.

## Features

- Runs WoW Forever Beta ARM64 locally on the Thor — no streaming required.
- Direct launch from GameHub after setup.
- Persistent account name and gamepad settings after a normal exit and restart.
- Uses its own Wine prefix and runtime, so the original GameHub runtime is not replaced.
- Release includes the installer, full instructions, a source companion, and SHA-256 checksums.

## Known limitations

- Experimental: tested on one AYN Thor Max only. Other devices, GameHub versions, and future WoW updates may not work.
- No automatic updater or uninstaller, and no game-update migration.
- The owner does not plan to maintain, support, or update the project.
- Blizzard's anti-cheat could flag the setup as a false positive, which may result in an account penalty or ban — use at your own risk.
- Battle.net can fail to open or freeze during installation; restarting the container and retrying is part of the process.
- The installer does not download missing payloads automatically.

See the project page: [github.com](https://github.com/AeroNico/thor-forever)
