---
title: "RACiT (Ratchet & Clank: A Crack in Time)"
description: "RACiT is a recompilation of Ratchet & Clank: A Crack in Time that brings the PS3 classic to Windows and Android."
date: "2026-11-25 10:27"
slug: "racit"
category: "game"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1y4qjbv/ratchet_and_clank_future_a_crack_in_time_is_now/"
project_page: "https://github.com/HighDrexler/RACiT"
---

## Description

RACiT is a project that brings Ratchet & Clank: A Crack in Time to Windows and Android through static recompilation. It takes the original PS3 code and converts it to native C/C++ using ps3recomp. The Android target is ARM64, and there is also a Linux build for debugging (not yet public). The game is playable and targets 60 fps, though it dips frequently during big gun fights.

## Setup guide

- Download and install the latest release from the releases page.
- Extract and run the launcher, which takes you through the setup process.
- Import your .iso directly or direct the launcher to your PS3GAME folder.
- The game checks for a decrypted EBOOT.elf; if your dump's .elf shows as encrypted, the easier way to fix it is with RPCS3.

## Requirements

- Game data is not included; you need your own decrypted dump of the North American disc version (BCUS98124).
- The dump must include EBOOT.ELF and USRDIR.
- A legally dumped version of Ratchet & Clank Future: A Crack in Time is required; no assets are or will ever be included with this project.

## Features

- Vulkan-based RSX renderer
- DualSense (PS5 controller) speaker and trigger mod integrated
- General controller support for most Windows-compatible controllers
- Mouse and keyboard controls (bindable in the launcher)
- Toggles for enhanced internal resolution and graphics settings
- Android and macOS versions available, along with a Windows build for Into the Nexus
- Saves are currently not transferable between Windows and Android; a feature to sync saves between devices is planned for the future.
