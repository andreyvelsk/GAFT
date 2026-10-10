---
title: "Thor-SpeedrunSplits"
description: "A speedrunning built for dual-screen handhelds like the AYN Thor and Retroid Pocket Duo"
date: "2026-10-09 14:07"
slug: "thor-speedrunsplits"
category: "companion"
media:
  - type: "image"
    url: "/content/thor-speedrunsplits"
  
tags:
  - speedrunning
  - games
  - companion
---

## Setup guide

Build the application yourself or download the APK via the Releases section.
Link to project: [github.com](https://github.com/JonJon2005/Thor-SpeedrunSplits)


## Features

- LiveSplit-style timer with color-coded split rows, one-decimal formatting, PB comparisons, live ahead/behind deltas, golds/best segments, automatic active-row scrolling, and manual scroll-back.
- Large touch controls for starting, splitting, undoing, resetting, and finishing runs, with haptics, pressed states, and subtle animations.
- Persistent PBs, Sum of Best, attempts, total run time, completed-run history, run details, PB dates, gold management, and largest segment gain/loss reporting.
- Custom Room-backed presets with editable game/category, split names, colors, order, and row count; load, create, edit, delete, reset, and compatible PB-preserving updates.
- Validated multi-preset .thorbackup.json export/import through Android's file picker, including definitions, PBs, golds, stats, and history with repeat-safe merging and conflict protection.
- Collapsible icon-based settings drawer with sticky section headers for Customization, Presets, Runs & Records, Recording, Backup & Data, and About.
- Light, Dark, and OLED themes, optional Android system-theme following, toggleable OLED screen shifting, and six font choices: Default, Pixel, Pixel Bold, Princess, Breathe, and Red Hat.
- Automatic GitHub release checks with an in-app Update Now link, About links, version display, and internal/external display status for dual-screen devices.
- Run recording of Android's internal/default display: starts with a run, keeps a three-second post-run tail, and saves an MP4 to app storage or a persistent custom folder using the preset game, category, run length, and date.
- Optional opposite-screen recording target and internal playback-audio capture (device playback, not microphone input), plus a flashing red recording indicator while capture is active.
- Independent recording controls for 240p, 480p, 720p, or 1080p resolution and 2–16 Mbps bitrate; settings apply at capture time and recordings remain 60 FPS.
- Immersive fullscreen layout optimized for the AYN Thor's 1080x1240 AMOLED display, with large targets, long-title handling, and dual-screen-aware display labeling.

## Known issues

- Android currently only allows automatic screen recording on the internal screen only.
