---
title: "Thor Audio Fix for Armada"
description: "Installs the popular JamesDSP audio profile on Armada OS for the AYN Thor, with automatic profile switching."
date: "2026-09-30 14:18"
slug: "thor-audio-fix-for-armada"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtksqa/i_got_the_jamesdsp_eq_preset_working_on_armadaos/)

## Description

This project installs the popular JamesDSP audio profile, converted for use on Linux with JDSP4Linux, on Armada OS specifically for the AYN Thor. The fix is only enabled when the speakers are in use — you never need to switch the profile manually, as it switches automatically based on what is being used for audio. Note: do not install DeckSP on top of this, and uninstall DeckSP if it is currently installed.

## Setup guide

Copy and paste the install command from the repository into a terminal on desktop mode, then reboot. Nothing else should be required. If you get errors or it does not work on your device, let the author know.

## Features

The script installs the JamesDSP flatpak in user mode, installs a converted version of the audio profile by ItsRetroPup and places it in the presets folder, and installs a default preset to use when the speakers are not in use. It also installs a daemon and enables a service that runs JamesDSP on boot and switches between the profiles automatically depending on whether the speakers are in use.

## Uninstall

To remove the fix, copy and paste the uninstall command from the repository into a terminal.

See the project page: [github.com](https://github.com/winghugs/thor-armada-audio-fix)
