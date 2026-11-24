---
title: "FightNight3OGX"
description: "A dual-screen recompilation of the original Xbox Fight Night Round 3 for ARM64 Android, built around the AYN Thor's second display."
date: "2026-11-24 17:35"
slug: "fightnight3ogx"
category: "game"
generated: "ai"
media:
  - type: "image"
    url: "/content/fightnight3ogx/preview.webp"
  - type: "image"
    url: "/content/fightnight3ogx/screenshot-2.webp"
  - type: "image"
    url: "/content/fightnight3ogx/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1y44ky6/fightnight3ogx_a_fight_night_round_3_original/"
project_page: "https://github.com/Oxide-Shift/FightNight3OGX"
---

## Description

FightNight3OGX is a recompilation of the original Xbox edition of Fight Night Round 3 that runs natively on ARM64 Android, with the AYN Thor's dual screens in mind. On a Thor, the broadcast stays on the upper screen while the lower screen becomes your corner: see who's winning the exchanges, work on a cut between rounds, and scout the next opponent for your career boxer. The project targets the North American (NTSC-U) original Xbox release (Disc ID EA13402A, Xbox Title ID 45410086) and requires your own disc image — the app extracts and compiles the game on your Android device, and the APK omits the retail executable, fighter and arena data, and original EA Trax recordings. FightNight3OGX is an independent fan project with no affiliation to Electronic Arts.

## Features

- Ayn Thor dual-screen support: the broadcast stays on the upper screen while the lower screen becomes your corner, including a touchscreen sweep pad for the cutman.
- Enhanced graphics: adjustable rendering resolution, graphics quality, filtering, and anti-aliasing options, plus sharpening and MSAA.
- Frame rate targets of 30, 45 and 60 FPS with VSync, widescreen and original 4:3 aspect ratios, and an optional on-screen FPS counter.
- Save import & export: bring your career save from hakuX and export it back, with timestamped backups by Xbox profile.
- Achievements: 100 illustrated awards worth 6,155 Fight Score, including the eight Xbox 360 career awards with their original point values.
- Music improvements: expanded soundtrack support with better handling of music during fighter entrances and matches, plus seven FN3 Expanded Music tracks.
- Custom launcher: a Fight Night-themed frontend for importing your ISO and configuring graphics.
- Performance optimization: attention to frame pacing, punch processing, animation timing, and responsive fights.
- Career features: scouting reports, the Fight Store, Edit Boxer, and heavy-bag training previews on the lower screen.

## Requirements

- ARM64 Android 11 or newer.
- The AYN Thor is the only handheld tested for dual-screen play; on a single-screen device, menu prompts stay on the main display.
- Your own North American original Xbox Fight Night Round 3 ISO (full-size Xbox XGD1, 7.29 GiB).
- If your file provider streams the ISO, allow about 11 GB free in addition to the disc image.

## Setup guide

- Install the APK listed under **Assets** on the [latest release](https://github.com/Oxide-Shift/FightNight3OGX/releases/latest).
- Open **Fight Setup** and choose a career backup folder you can find again after a reinstall.
- Tap **Choose Xbox ISO** and select your disc image. Keep Fight Setup open while the app extracts and compiles the game. If **Prepare game** appears, tap it to finish. A local file the app can read directly avoids a second full-size ISO copy.
- Choose your picture settings and tap **Enter the ring**. Later launches reuse the prepared game.
- Use **Check for updates** in Fight Setup for future releases. Your imported disc and saves carry over; let Fight Setup rebuild the game code once after updating.
- **From hakuX:** export your Fight Night save as a ZIP, then in Fight Setup open **Save & sound → Import Xbox save** and tap **Choose ZIP**. The imported career opens in a separate slot.
- **After reinstalling:** select the same backup folder on a fresh install to restore the newest usable career.
- **Back to hakuX:** choose **Save & sound → Export save** to write a compatible ZIP.
