---
title: "ThorPad"
description: "A trackpad and keyboard app that turns the AYN Thor's bottom screen into a laptop-style trackpad and full-screen keyboard for the top screen."
date: "2026-10-10 06:22"
slug: "thorpad"
category: "app"
generated: "ai"
media:
  - type: "image"
    url: "/content/thorpad/preview.webp"
---

source: [reddit.com](https://www.reddit.com/r/AynThor/comments/1x230sz/thorpad_a_trackpad_and_keyboard_for_the_ayn_thors/)

## Description

ThorPad turns the AYN Thor's bottom screen into a laptop-style trackpad that controls a mouse pointer on the top screen, plus a full-screen keyboard for typing. With Shizuku it acts like a real USB mouse, so games in GameNative get real mouse movement, clicks and scroll-wheel input.

ThorPad runs in two modes. Mouse mode (needed for GameNative / Winlator games) plugs in a virtual USB mouse using Android's built-in uinput tool, started through Shizuku; Android and every app see a real mouse, the system cursor shows on the top screen, and two-finger scrolling sends real scroll-wheel notches. Touch mode (no Shizuku) uses an accessibility service that draws its own pointer and turns clicks and scrolls into touch gestures, which works fine for ordinary Android apps. ThorPad uses mouse mode whenever Shizuku is running and has allowed it, and falls back to touch mode otherwise.

## Features

- Real mouse mode: with Shizuku, ThorPad plugs in a virtual USB mouse, so Android and every app see a real mouse and the system cursor shows on the top screen.
- Works with GameNative / Winlator games that need an actual mouse, not touches.
- Real scroll wheel: swipe two fingers up or down and games get real mouse-wheel notches.
- Tap to click, with two-finger tap or press and hold for right click.
- Drag: tap, touch again, pause a moment, then slide; the short pause keeps you from starting drags by accident.
- Swipe two fingers right to go back and left to go forward, like a browser's back and forward buttons.
- Swipe three fingers up for recent apps, and down to close the app on the top screen.
- A gesture guide along the bottom of the trackpad lists every gesture for one, two and three fingers.
- Full-screen keyboard: keys go edge to edge with no wasted space and type the moment your finger lands; numbers, symbols, Esc, Tab and arrow keys are one tap away.
- Keyboard opens by itself: pick ThorPad as your keyboard in Settings, and any text box on the top screen opens the keyboard on the bottom screen, with no other keyboard popping up.
- Clear all: hold backspace and the space bar turns into a red Clear all key.
- In mouse mode the keyboard acts like a real USB keyboard, so keys reach games too.
- iPhone-style autocorrect: it fixes typos when you finish a word, you can tap to keep your own spelling, and backspace undoes a correction; it learns the words you keep and can be switched off in Settings.
- Haptic feedback on every action, with a selectable feel (Tick, Click, Heavy, Double or Buzz) and strength for each one, with a preview as you change them.
- Top bar with Keyboard, Home, Apps, Settings and Close, all acting on the top screen.
- The trackpad never steals focus, so your game keeps the controller and keyboard while you use it.
- Check for updates: ThorPad shows what's new in the latest version, then downloads and installs it with one tap.
- Settings for pointer speed and acceleration, scroll speed and direction, pointer size, swap screens, autocorrect, type-on-release, keyboard choice and haptics.
- Touch mode fallback: no Shizuku? An accessibility service draws its own pointer and turns clicks and scrolls into touches, which works fine for regular Android apps.

## Requirements

- AYN Thor handheld with its bottom screen (1240 × 1080).
- Latest ThorPad release from GitHub.
- For mouse mode: Shizuku installed and started (Shizuku > Start via Wireless debugging), with ThorPad allowed in Shizuku; Shizuku has to be started again after each reboot.
- For touch mode: the ThorPad trackpad accessibility service enabled; if Android says the setting is restricted, allow restricted settings via Settings > Apps > ThorPad > ⋮ > "Allow restricted settings".
- Optional: pick "ThorPad keyboard" in Settings > Choose keyboard so the keyboard opens by itself for text boxes on the top screen.

## Setup guide

1. Copy ThorPad.apk to the Thor and open it to install.
2. For mouse mode: install Shizuku, start it (Shizuku > Start via Wireless debugging), open ThorPad, tap "Allow ThorPad in Shizuku" and allow it. Shizuku has to be started again after each reboot.
3. For touch mode: tap "Accessibility settings" in ThorPad and turn on "ThorPad trackpad". If Android says the setting is restricted: Settings > Apps > ThorPad > ⋮ > "Allow restricted settings", then try again.
4. Optional: in ThorPad's Settings, tap "Choose keyboard" and pick "ThorPad keyboard", so the keyboard opens by itself for text boxes on the top screen.
5. To update: tap "Check for updates" at the bottom of ThorPad's Settings, or install the newest ThorPad.apk from the [latest release](https://github.com/ajhockey88/ThorPad/releases/latest) over the old one.

See the project page: [github.com](https://github.com/ajhockey88/ThorPad)
