---
title: "pb-os"
description: "A SteamOS port for ARM handhelds that turns the AYN Thor's bottom screen into a second display with an app launcher, keyboard, trackpad and performance dashboard."
date: "2026-10-05 06:36"
slug: "pb-os"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wxqafk/pbos_is_live/)

## Description

pb-os is a port of Valve's SteamOS for ARM (the Steam Frame build) that runs on Snapdragon handhelds. It is a fork of hashtagbasit's SteamOS-ARM-Handhelds. Alpha v0.3 images for the Retroid Pocket 6, the KONKR Pocket FIT and the AYN Thor are available on the Releases page with flashing steps. On the AYN Thor, the bottom screen works as a second display in Game Mode, powered by the Barry Launcher.

## Features

- App Launcher on the bottom screen
- Companion App Pairing
- Keyboard and trackpad in both Game Mode and Desktop Mode
- Performance Dashboard
- Build your own apps for the bottom screen and install them from a zip
- Barry Launcher Decky plugin
- Snapdragon 8 Gen 2 (SM8550) support for the Retroid Pocket 6 and AYN Thor in one image
- Linux 7.2.8 on both chips
- Valve's stable channel (SteamOS 0.3.0) as the base
- Shared tuning: EAS scheduling by default, no hard CPU pinning, GPU interrupts kept off the little cores, zstd zram, and fixes for GPU hangs, sleep, UFS and udisks CPU storms
- Tailscale installed but switched off, with no account in the image

## Requirements

- AYN Thor handheld (Snapdragon 8 Gen 2 / SM8550)
- Alpha v0.3 image from the Releases page
- A microSD card — the AYN Thor build is tested from microSD

## Setup guide

Download the latest release from the Releases page and follow the flashing steps provided there. The AYN Thor build is tested from microSD.

See the project page: [github.com](https://github.com/project-barry/pb-os)
