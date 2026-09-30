---
title: "Thor Audio Fix for Armada"
description: "Installs the JamesDSP audio profile on Armada OS with automatic profile switching for the AYN Thor."
date: "2026-09-30 14:11"
slug: "thor-audio-fix-for-armada"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtksqa/i_got_the_jamesdsp_eq_preset_working_on_armadaos/)

## Description

This installs the popular JamesDSP audio profile, converted for use on Linux with JDSP4Linux, on Armada OS for the AYN Thor. The profile is only enabled when the speakers are in use — you never need to switch profiles manually, as a daemon does it automatically based on what is being used for audio.

## Features

The installer sets up everything in one go: it installs the JamesDSP flatpak in user mode, installs a converted version of the audio profile by ItsRetroPup into the presets folder, installs a default preset for when the speakers are not in use, and installs a daemon with an enabled service that runs JamesDSP on boot and switches between profiles depending on whether the speakers are in use. Note: do not install DeckSP on top of this, and uninstall DeckSP if it is currently installed.

## Setup guide

Copy and paste the install command from the repository into a terminal on desktop mode, then reboot. Nothing else should be required. It is confirmed working on the AYN Thor; if you get errors or it does not work, let the author know.

## Uninstall

To remove the fix, copy and paste the uninstall command from the repository into a terminal.

See the project page: [github.com](https://github.com/winghugs/thor-armada-audio-fix)
