---
title: "Thor's Lightning"
description: "Controller-driven dual-screen brightness control for the AYN Thor."
date: "2026-11-14 07:16"
slug: "thors-lightning"
category: "game"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1xv0qff/lightning_returns_ffxiii_on_the_thor_xbox_360/"
project_page: "https://github.com/HughesTechNZ/Thors-Lightning"
---

## Description

Thor's Lightning is an unofficial Android utility for controller-driven dual-screen brightness control on the AYN Thor. It has been tested on the February 2026 Android 13 firmware. It is an independent community utility and is not developed, sponsored, endorsed, or supported by Shenzhen AYN Technologies Co., Ltd.

When **Both** is selected, Thor's Lightning adjusts the top and bottom screens relative to their current brightness. Each press applies the same step to each screen, so if the top screen is brighter than the bottom screen, it stays brighter while both move up or down together. The screens only become equal when they already start at the same brightness, or when one screen reaches the minimum or maximum brightness limit and the other screen continues until it reaches the same limit. This keeps manual top/bottom brightness differences intact during normal adjustment.

## Features

- **Modifier-held brightness control:** hold a configurable controller button and press mapped Bright or Dimmer controls to adjust brightness.
- **Dual-screen targeting:** adjust the top screen, bottom screen, or both screens together.
- **Configurable mappings:** choose the modifier, Bright, and Dimmer controls from standard Android controller buttons.
- **Non-root volume support:** volume up and volume down work without root and are reserved while mapped for brightness.
- **Optional privileged input support:** devices with Root or Shizuku can record any D-pad or analog-stick direction for Bright and Dimmer controls.
- **Modifier reservation option:** root users can optionally reserve the modifier itself while brightness controls are held.
- **Service conflict handling:** select multiple accessibility services to pause temporarily while the modifier is held, preventing other controller tools from reacting to the same buttons at the same time.
- **Clear setup status:** the in-app setup buttons show whether each required permission is needed or enabled.
- **Boot persistence:** Android can restart the accessibility service after reboot once the service has been enabled by the user.
- **Sleep/Wake brightness:** hold both screens dark briefly after wake, then ramp back to the brightness levels saved before closing or sleeping.
- **Long-close reset:** optionally use a chosen default brightness after a configurable period closed, from 0 minutes to 24 hours.

## Requirements

- AYN Thor running the compatible Android 13 firmware
- Accessibility service enabled for Thor's Lightning
- Android brightness write permission
- Root or Shizuku access only if using D-pad or analog-stick mappings

Root axis input has platform limits. D-pad and stick directions may still be visible to games, and analog sticks cannot physically send both directions on the same axis at the same time. Use volume or standard buttons when complete input reservation matters.

## Setup guide

- Download the APK from the [latest GitHub release](https://github.com/HughesTechNZ/Thors-Lightning/releases/latest) and install it as a normal Android APK.
- Open **Thor's Lightning** and tap **Set up permissions**.
- Follow the on-screen guide to allow **Modify system settings**, then enable **Thor's Lightning controls** under Android Accessibility. Return to the app after each settings page; the guide will take you to the next step.
- Choose the modifier, Bright, Dimmer, and screen-target options. For root input, tap a Bright or Dimmer **Record** button and move the direction you want to assign; the app identifies the D-pad or stick automatically.
- Enable privileged input only if you want D-pad or analog-stick mappings, then approve Root or Shizuku access when prompted.
- If another accessibility app responds to the same controller buttons, turn on **Suspend services during hold** and select the services to pause while the modifier is held.
- To configure wake behavior, open **Sleep/Wake brightness**. Set the black hold, ramp duration, optional long-close reset, reset time, and reset level. The long-close reset is off by default.
