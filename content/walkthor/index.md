---
title: "WalkThor"
description: "A free, open-source companion app that turns the AYN Thor's bottom screen into a second screen for whatever you're playing up top."
date: "2026-10-27 07:40"
slug: "walkthor"
category: "companion"
generated: "ai"
media:
  - type: "image"
    url: "/content/walkthor/preview.webp"
  - type: "image"
    url: "/content/walkthor/screenshot-2.webp"
  - type: "image"
    url: "/content/walkthor/screenshot-3.webp"
source: "https://www.reddit.com/r/AynThor/comments/1xggig9/walkthor_update_a_free_companion_app_for_your/"
project_page: "https://github.com/nerf-herder-29/WalkThor"
---

## Description

WalkThor is a free, open-source Android companion app for the AYN Thor's bottom screen. Start a game in Cocoon and the bottom screen becomes that game's companion: its guide, a live mirror of part of the top screen (like a minimap), its face buttons the way the game labels them, and a live FPS and battery monitor, all one tab away, while the game keeps full speed on the top screen.

WalkThor works alongside Cocoon by reading a log file Cocoon writes. It is an independent, unofficial project, not affiliated with or endorsed by Cocoon, AYN, ScreenScraper or SteamGridDB. It doesn't include any games, ROMs or guides; you add your own, and guides belong to their authors. It only goes online if you add a scraper account to fetch artwork; everything else stays on your device. It uses accessibility access only to open with a swipe, hand your game its performance back, and see which app is in front; it never reads your screen or what you type.

## Features

- **Now playing** — start a game in Cocoon and the bottom screen shows the game's hero art and logo, the emulator, and tabs across the top: Multi, Guide, Mirror, Face Buttons, Stats and Apps. Switching tabs keeps your place in each, and Back takes you to Now playing.
- **Your library** — with a ROMs folder linked, the library shows your games as covers, sorted by system folder. Games with a guide are tagged; long-press a game to choose its cover, its background on Now playing and its marquee, or hide it.
- **Guides that open themselves** — add a PDF or TXT walkthrough and WalkThor opens it to the game you just launched, right where you left off. Search the whole guide, zoom in, and read single page or two-page spread.
- **Multi view** — up to four panels on screen at once: any mix of guide, Mirror, face buttons, stats and your apps. Tap a panel to open that tab; press and hold a panel and drag it to rearrange them.
- **Mirror** — show part of the top screen, like a minimap or HUD, live on the bottom screen. Pick up to four areas per game, switch between them or see them all side by side, and WalkThor remembers them.
- **Face Buttons** — the four face buttons labelled the way the game's own system labels them (shapes, or letters with A at the bottom or on the right), picked automatically from the emulator, each where its Thor button sits and lighting up as you press it.
- **Stats** — live FPS with a one-minute graph, power draw and time left, heat, memory and CPU speed. It learns how much power each game uses and tells you how long that game usually lasts on a full charge.
- **Apps** — open any app on the bottom screen while your game keeps running up top. Pin the ones you use most; press and hold an app to open it on the top screen instead.
- **Artwork scraping** — add a ScreenScraper account and/or a SteamGridDB API key and WalkThor scrapes box art for your guides' covers, and a screenshot and marquee for each game.
- **Keeps your game at full speed** — while a game runs, WalkThor never takes Android's top-app priority from it, and after WalkThor opens it hands priority back with one tap on the top edge of the game's screen.
- **Comes back if a heavy game pushes it out** — if Android closes WalkThor while a demanding game loads, it reopens on the bottom screen right away and hands the game its priority back.
- **Animated book** — pages turn in 3D around the spine; single page or two-page spread, with adjustable text size. PDFs default to a two-page spread; TXT guides to a single wide page sized to 80 columns so GameFAQs-style ASCII tables stay aligned.
- **Reading lens and magnifier** — zoom a page to full width up to 500% with − / +, pinch or double-tap, or press and hold on a page for a magnifier loupe.
- **Search** — results as you type, a list of every matching page with snippets, ▲/▼ to step through matches, and highlights on the page (PDFs included).
- **Swipe down to open** — swipe from the top edge of the bottom screen to bring WalkThor up or put it away.
- **OLED-friendly** — true black, auto-dim after the time you choose to the darkness you choose, and a status bar with the time, battery and how long you've been playing.
- **Controller support** — L1/R1 (or D-pad left/right) turn pages, in the book and in the lens.
- **Remembers your place** in every guide, with a page scrubber for big jumps.

## Setup guide

Download `app-release.apk` from the [latest release](https://github.com/nerf-herder-29/WalkThor/releases/latest) and sideload it (allow "Install unknown apps" for your browser or file manager). To get updates automatically, add the repository to Obtainium, which installs straight from GitHub releases.

1. Install the APK from the latest release.
2. Add a guide: *Add guide* in your library, or *Open with* / *Share* a PDF or TXT from a file manager.
3. Link Cocoon's folder (the one with `launch_debug.log`) so WalkThor knows which game you started.
4. In Cocoon, choose WalkThor as the companion app for the bottom screen.
5. Allow accessibility access when WalkThor asks. It's what keeps the game at full priority (and lets you swipe WalkThor up and down).

Optional: link your artwork folder (Cocoon's media folder works) for game art, logos and guide covers. Every step is also in the app under Settings (⋮) → About → *How to set up WalkThor*, with a tick for each step that's done.

## Known issues

- Scanned PDFs without a text layer display fine but can't be searched (no OCR).
- Password-protected PDFs aren't supported.
- Matches that span a page break in TXT guides aren't found.
