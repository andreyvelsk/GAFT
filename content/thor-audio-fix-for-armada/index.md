---
title: "Thor Audio Fix for Armada"
description: "Install the popular JamesDSP EQ profile on ArmadaOS with automatic profile switching based on audio output."
date: "2026-09-30 13:52"
slug: "thor-audio-fix-for-armada"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtksqa/i_got_the_jamesdsp_eq_preset_working_on_armadaos/)

## Description

This project installs the popular JamesDSP audio profile, converted for use on Linux with JDSP4Linux, on ArmadaOS for the AYN Thor. The EQ is only enabled when the speakers are in use — you never need to switch profiles manually, because a daemon does it automatically based on what is being used for audio.

## Setup guide

Copy and paste the install command from the repository into a terminal in desktop mode, then reboot. That is all that is required. To remove the fix, copy and paste the uninstall command from the repository into a terminal. Do not install DeckSP on top of this, and uninstall DeckSP if it is currently installed.

## Features

- Installs the JamesDSP flatpak in user mode.
- Installs a converted version of the audio profile by ItsRetroPup and places it in the presets folder.
- Installs a default preset to use when speakers are not in use.
- Installs a daemon and enables a service that runs JamesDSP on boot and switches between profiles depending on whether the speakers are in use.

See the project page: [github.com](https://github.com/winghugs/thor-armada-audio-fix)
