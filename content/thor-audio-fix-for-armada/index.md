---
title: "Thor Audio Fix for Armada"
description: "Installs the popular JamesDSP EQ profile on ArmadaOS and automatically enables it only when the Thor's speakers are in use."
date: "2026-09-30 13:57"
slug: "thor-audio-fix-for-armada"
category: "tool"
generated: "ai"
media: []
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wtksqa/i_got_the_jamesdsp_eq_preset_working_on_armadaos/)

## Description

This installer brings the popular JamesDSP audio fix to the AYN Thor running ArmadaOS. The JamesDSP profile, originally created for the Thor, has been converted for use on Linux with JDSP4Linux. The fix is only enabled when the speakers are in use — you never need to switch the profile manually, because it switches automatically based on what is being used for audio.

## Features

The script installs the JamesDSP flatpak in user mode, installs a converted version of the audio profile and places it in the presets folder, and installs a default preset to use when the speakers are not in use. It also installs a daemon and enables a service that runs JamesDSP on boot and switches between profiles automatically depending on whether the speakers are in use.

## Setup guide

Copy and paste the install command from the GitHub repository into a terminal in desktop mode, then reboot. Nothing else should be required. Do not install DeckSP on top of this, and uninstall DeckSP if it is currently installed.

## Uninstall

To remove the fix, copy and paste the uninstall command from the GitHub repository into a terminal.

See the project page: [github.com](https://github.com/winghugs/thor-armada-audio-fix)
