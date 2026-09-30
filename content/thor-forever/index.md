---
title: "Thor Forever"
description: "An experimental setup that runs World of Warcraft: Forever Beta ARM64 locally on the AYN Thor with its own Wine runtime, ARM64 DXVK and a patched Turnip driver."
date: "2026-09-30 14:17"
slug: "thor-forever"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtgyeo/i_got_wow_forever_running_locally_on_my_thor_max/)

## Description

Thor Forever is an experimental, community-shared setup that runs World of Warcraft: Forever Beta ARM64 locally on the AYN Thor — no streaming required. It uses its own Wine 11 runtime and prefix, ARM64 DXVK, and a locally patched Turnip driver, and it does not replace the original GameHub runtime or include any WoW files. You need your own updated game installation and an account with access to the beta. The owner reports playable in-world gameplay at 30 FPS in open world and lightly populated areas like Crossroads, direct launch from GameHub, and persistent account-name and gamepad settings after the final configuration-path correction. This is a single-device report, not a compatibility guarantee or a benchmark.

## Setup guide

Download the Thor-Forever-v0.1.0-alpha.1.zip installer from the [release page](https://github.com/AeroNico/thor-forever/releases/latest) and follow the START-HERE.md instructions. Do not use Code > Download ZIP — that contains source code, not the installer payload. The installer does not download missing payloads automatically.

1. Download the official Battle.net installer on the Thor Max and add the EXE as a game in GameHub Lite Ludashi.
2. Launch the installer through GameHub, leaving the installation options at their defaults except for disabling automatic startup.
3. Close everything, return to GameHub, and enter the container desktop that was created for the Battle.net installer.
4. In the container, open Battle.net from its installation folder (usually C:\Program Files (x86)\Battle.net), log in, and install the WoW Forever Beta ARM64 client. Battle.net may freeze — restart the container and retry until the installation finishes.
5. Extract the complete Thor-Forever folder from the release ZIP into Android's shared Download folder so the final path is Download/Thor-Forever/Install-Thor-Forever.cmd.
6. Close Battle.net, enter the same container desktop, run Install-Thor-Forever.cmd, press a key when prompted, and follow the full repo instructions, checking the setup report before launching anything.
7. After setup finishes, point the container's GameHub Startup File Path to Download/Thor-Forever/Thor-Forever.exe so GameHub launches WoW Forever directly.

## Known limitations

This is an early community preview tested on one AYN Thor only. Other devices, other GameHub versions, and future WoW updates may not work. There is no automatic updater or uninstaller, and no game-update migration is provided. The owner does not plan to maintain the project, provide support, or keep it updated. Blizzard's anti-cheat could flag the setup as a false positive, which may result in an account penalty or ban — anyone trying it does so at their own risk. Battle.net can also freeze during client installation; patience and container restarts are required.

## Tested configuration

The working setup was validated on an AYN Thor with an Adreno 740 GPU, running GameHub Lite Ludashi, the Forever Beta ARM64 client (build 1.60.1.70009), a separate Android Wine 11 build, DXVK 2.4.1 with native Windows ARM64 DLLs, and Turnip from Mesa with a local scheduler patch. The starting profile is 1280×720, low graphics, VSync off, with a 30 FPS cap. Installation, login, gameplay, direct GameHub launch, console restart, and saved gamepad settings all passed manual testing on the owner's device.

See the project page: [github.com](https://github.com/AeroNico/thor-forever)
