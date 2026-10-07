---
title: "Termux Dualscreen"
description: "An unofficial Termux fork that keeps the terminal on the top screen and all controls on the bottom screen of dual-screen handhelds like the AYN Thor."
date: "2026-10-07 06:19"
slug: "termux-dualscreen"
category: "app"
generated: "ai"
media:
  - type: "image"
    url: "/content/termux-dualscreen/preview.webp"
  - type: "image"
    url: "/content/termux-dualscreen/screenshot-2.webp"
  - type: "image"
    url: "/content/termux-dualscreen/screenshot-3.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1wyvmrs/termux_dualscreen_fork_for_aynthor/)

## Description

Termux Dualscreen is an unofficial fork of Termux for Android handhelds with two screens, like the AYN Thor. The terminal stays on the top screen and everything you press is on the bottom one. It is not affiliated with the Termux team. It installs as Termux (com.termux) in place of it, since Termux plugins and packages expect that name.

## Features

- Terminal controls on the bottom screen: session tabs, new session, the extra keys and a menu with everything from the long press menu of the terminal
- A keyboard on the bottom screen, so that no keyboard covers the terminal. It picks the layout from your phone's keyboards and language, and covers more than 45 languages including Cyrillic, Greek, Arabic, Hebrew and Georgian. For scripts it cannot type, such as Chinese, Japanese or Korean, the phone's own keyboard is one key away
- Dialogs like renaming a session are typed into with the bottom keyboard too
- Swap the screens with one button if you would rather have the terminal at the bottom
- D-pad navigation across both screens as if they were one, including the keyboard, the extra keys, menus and settings
- The left stick types the arrow keys and the right stick scrolls the terminal, also in programs like less and vim
- Gamepad buttons for Enter, Backspace, Tab, Escape, Ctrl, Alt, switching sessions and more, and every one of them can be changed
- A bottom panel on the other screens, like settings and help, with your sessions and shortcuts
- Nothing appears twice: if the top screen already shows something, the bottom one leaves it out
- Everything else Termux does, including packages, plugins like Termux:API and your existing data

## Requirements

- Any device whose second screen shows up in Android as a separate display should work. The layout adjusts to the size of the second screen.
- AYN Thor (3.92", 1240×1080) is what this was built on
- Anbernic RG DS (4", 640×480) and AYANEO Pocket DS (5", 1024×768) were tested at their screen sizes. On the RG DS, Android treats the bottom screen as the main one, so use Swap screens
- OneXSugar Sugar 1, Retroid Pocket Duo and the Retroid Dual Screen Add-on should work but have not been tried

## Setup guide

- Download Termux-Dualscreen.apk from the [latest release](https://github.com/asa07-salihg/Termux-Dualscreen/releases/latest). Every release has a SHA256SUMS.txt next to the APK so you can check the download.
- The app installs as Termux (com.termux) in place of it. It is signed with the same public test key as the official GitHub builds of Termux, so it installs over one of them and keeps your data, and it works with the plugins from GitHub.
- If your Termux is from F-Droid or Google Play, it is signed with a different key: back it up, uninstall it and its plugins, then install this and the plugins from GitHub.
- Since anyone can sign with the test key, only install this APK from the releases here.
- The options are under Settings > Termux > Dual Screen. The buttons can be changed in Settings > Termux > Dual Screen > Gamepad.
- In the terminal, A is Enter, B is Backspace, X is Tab and Y is Escape. L1 and R1 switch sessions, L2 and R2 hold Ctrl and Alt for the next key, Start opens the menu and Select swaps the screens. B also closes the menu.
- The left stick types the arrow keys, faster the further it is pushed, and the right stick scrolls. On the other screens both sticks scroll and B goes back.

See the project page: [github.com](https://github.com/asa07-salihg/Termux-Dualscreen)
