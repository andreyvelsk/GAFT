---
title: "Thor Forever"
description: "Run World of Warcraft: Forever Beta ARM64 locally on your AYN Thor with this experimental Wine, DXVK and Turnip setup."
date: "2026-09-30 13:52"
slug: "thor-forever"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtgyeo/i_got_wow_forever_running_locally_on_my_thor_max/)

## Description

Thor Forever is an experimental setup that lets you run World of Warcraft: Forever Beta (ARM64 client) locally on an AYN Thor — no streaming required. It was built and tested on the owner's Thor Max and uses its own Wine 11 runtime and prefix, ARM64 DXVK, and a locally patched Turnip driver. It does not replace the original GameHub runtime and does not include any WoW files: you need your own updated installation and an account with access to the beta.

In the owner's testing, the game stays at 30 FPS in the open world and lightly populated areas such as Crossroads, with the worst performance seen in crowded cities. Ragefire Chasm was completed without issues. The package was tested for installation, login, gameplay, direct GameHub launch, restarting the console, and saved gamepad settings.

## Setup guide

Download the Thor-Forever release ZIP from the [release page](https://github.com/AeroNico/thor-forever/releases/latest) and extract the complete "Thor-Forever" folder into Android's shared "Download" folder — the final path must be "Download/Thor-Forever/Install-Thor-Forever.cmd". Do not use the repository's "Code > Download ZIP" option, which contains source code rather than the installer payload.

1. Download the official Battle.net installer on the Thor Max and add the EXE as a game in GameHub Lite Ludashi.
2. Launch the installer through GameHub, leaving installation options at their defaults except for disabling automatic startup.
3. Close everything, return to GameHub, and enter the container desktop created for the Battle.net installer.
4. In the container, open Battle.net from its installation folder (usually "C:\Program Files (x86)\Battle.net"), log in, and install the WoW Forever Beta ARM64 client. Battle.net may freeze or fail to open — restart the container and retry until the installation finishes.
5. Close Battle.net, enter the same container desktop again, open the extracted folder, and run "Install-Thor-Forever.cmd". Press a key when prompted, then follow the full instructions in the repository and check the setup report before launching anything.
6. After setup finishes, point the container's GameHub Startup File Path to "Download/Thor-Forever/Thor-Forever.exe". GameHub should then be able to launch WoW Forever directly.

## Known limitations

This is an early community preview, not a compatibility guarantee. It was tested on a single AYN Thor Max, so other devices, other GameHub versions, and future WoW updates may not work. There is no automatic updater or uninstaller, and no game-update migration is provided. The owner does not plan to maintain the project or troubleshoot individual installations. Because the game runs through Wine and DXVK, Blizzard's anti-cheat could flag the setup as a false positive, which may result in an account penalty or ban — use it at your own risk. The repository includes steps for switching back to your previous GameHub launcher.

## What's included

The release ZIP contains the installer, instructions, a source companion, and SHA-256 checksums. The setup uses its own Wine 11 runtime and prefix, ARM64 DXVK 2.4.1, and a Turnip driver from Mesa with a local scheduler patch. It keeps the original GameHub/Battle.net container intact and prepares a separate Wine prefix instead of replacing global components. The recommended starting profile is 1280×720, low graphics, VSync off, with a 30 FPS cap.

See the project page: [github.com](https://github.com/AeroNico/thor-forever)
