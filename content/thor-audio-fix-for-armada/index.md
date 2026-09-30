---
title: "Thor Audio Fix for Armada"
description: "One-command installer that brings the JamesDSP audio fix to Armada OS on the AYN Thor with automatic profile switching."
date: "2026-09-30 07:08"
slug: "thor-audio-fix-for-armada"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtksqa/i_got_the_jamesdsp_eq_preset_working_on_armadaos/)

## Description

This project brings the popular JamesDSP audio profile to Armada OS on the AYN Thor, converted for Linux with JDSP4Linux. It installs the profile along with a daemon that automatically switches between the JamesDSP preset and a default preset depending on whether the speakers are in use, so you never have to switch profiles manually.

## Features

- Installs the JamesDSP flatpak in user mode.
- Installs a converted version of the audio profile by ItsRetroPup and places it in the presets folder.
- Installs a default preset to use when speakers are not in use.
- Installs a daemon and enables a service that runs JamesDSP on boot and switches between profiles automatically when the speakers are not in use.

## Setup guide

Copy and paste the install command from the repository into a terminal on desktop mode, then reboot. No other setup is required. Do not install DeckSP on top of this, and uninstall DeckSP if it is currently installed.

## Uninstall

Copy and paste the uninstall command from the repository into a terminal on desktop mode to remove the JamesDSP flatpak, the converted profile, the default preset, and the daemon and service.

See the project page: [github.com](https://github.com/winghugs/thor-armada-audio-fix)
