---
title: "Thor Reader"
description: "A reading app for the AYN Thor that turns its two screens into an open book for books, comics, and manga."
date: "2026-11-25 10:26"
slug: "thor-reader"
category: "app"
generated: "ai"
media: []
source: "https://www.reddit.com/r/AynThor/comments/1y4vow1/thor_reader_beta_02_search_and_other_qol_features/"
project_page: "https://github.com/dylosama/ThorReader"
---

## Description

Thor Reader is a reading app made for the AYN Thor, the dual-screen Android clamshell handheld. It uses both screens the way a book would: hold the Thor sideways and the two screens become the two pages of an open book, or keep it closed-clamshell style and read on one screen while the other stays free for something else. It reads books, comics, and manga in whatever orientation you want, and each book remembers its own reading mode.

Reading modes (switch from the reader menu):

- **Book** – hold the Thor sideways with the top screen on the left; the left page is on the top screen and the right page on the bottom screen.
- **Book reversed** – sideways the other way; the left page is on the bottom screen and the right page on the top screen.
- **Top screen** – held normally; a two-page spread on the top screen while the bottom screen is free.
- **Bottom screen** – held normally; one page (or two) on the bottom screen while the top screen is free.

## Features

- Books are laid out to the exact size of each screen; no line is ever cut between pages.
- Running chapter header and page numbers, in the book's own font.
- Themes: Paper, Sepia, and Night (pure black with grey text, for OLED).
- Comics and manga: fit-to-screen, double-page spreads split across both screens in book modes, right-to-left reading (auto-detected from ComicInfo.xml, or set per series), double-tap and pinch zoom. In book modes, swipe up on the small screen's page to see it on the big screen; swipe up again on the big screen to swap back. Buttons: d-pad right or Y in Mode 1, Y in Mode 2.
- Quick navigation: page scrubber, go to page, chapter list, and "back to where I was".
- Page turns by tap, swipe, d-pad and shoulder buttons (hold to flip quickly), always in the physically right direction for the current mode. In right-to-left manga the shoulders are swapped by default so the easy one goes forward ("Swap L1/R1 for manga" in the reader menu).
- Page-turn animations (reader menu, "Page turn"): a realistic paper curl drawn on the GPU, Flip, Slide, Fade or None, per book if you like, at Fast / Normal / Slow speed. Buttons and taps curl the page from its bottom (or top) outer corner. In the book modes one sheet turns across the hinge from one screen to the other; swipes make the page follow your finger. Held buttons and jumps use a quick slide; below 15 % battery pages fade.
- Opening a book lifts its cover out of the library and swings it open across the screens (and closes it back into its row); Settings: "Open & close animation".
- Inspect a book (popup on its mode button): a 3D book with the real cover, a spine, the back cover and its thickness; spin it, zoom, and read its details on the bottom screen.
- Theme colour: pick the app's accent colour in Settings (8 colours or any hue).
- Reading position, mode and text settings are remembered per book.
- Book modes can use a different text size on each screen ("Same text size on both screens" off in the reader menu); the text still flows from one screen to the next without losing a line.
- Library: "Library | Completed" switch, search, and one row to sort the list (Recently read, Recently added, Progress, Title) or group it (Author, Series, Genre, Type: Books / Manga / Comics); tap the active option again to reverse it. Names in the Author, Series and Genre lists can be hidden (swipe left or hold; Settings shows them again), and you can add an author or series to books yourself ("+ Add author" / "+ Add series"). Each row shows where you are, the page count, the year first published and the format ("277 / 1794 Pages · Published: 1965 · EPUB"); finished books get a gold star and are also listed under "Completed". Works with the d-pad and A/B as well as touch.
- Typing (search, Edit info, Settings) happens on a built-in keyboard on the bottom screen, so the list on the top screen stays visible and filters as you type. D-pad + A to type, B to delete, Start for Done; a physical or Bluetooth keyboard also works.
- A bookmark per book, shown as a ribbon on the page (choose its colour; swipe it up to remove). Closing the lid or leaving the app bookmarks your page automatically, and the ribbon slides away again when you come straight back.
- A short first-run tutorial (can be shown again from the reader menu).

## Requirements

- AYN Thor dual-screen Android clamshell handheld.
- Android with permission to install apps from unknown sources (for sideloading the APK).
- Supported book formats: EPUB, MOBI, AZW, AZW3 (KF8), FB2, TXT, HTML / HTM / XHTML, Markdown (.md), DOCX, ODT, RTF.
- Fixed layout: PDF, XPS.
- Comics / manga: CBZ, CBR (RAR4), CB7, CBT, single pictures (JPG, PNG, WEBP, GIF, AVIF), and a folder of pictures added with "Add folder" (shown as one comic).
- Kindle books (MOBI / AZW / AZW3) must be DRM-free; DRM-protected books show "This book is DRM-protected".
- Optional: a free ComicVine API key for automatic comic metadata lookup. Manga (AniList) and books (Open Library) are looked up automatically with no account needed.
- Optional: an internet connection for online book info lookup (can be turned off in Settings).

## Setup guide

- On the Thor, open the [Releases page](https://github.com/dylosama/ThorReader/releases/latest) and download the latest `ThorReader-x.y.z.apk` (or download it on a computer and copy it over).
- Open the APK on the Thor. If Android asks, allow installing apps from that source (Settings › Apps › Special app access › Install unknown apps).
- Open Thor Reader, tap **+ Add files** or **+ Add folder**, and pick your books. Files stay where they are; nothing is copied.
- Optional: for automatic comic metadata, tap ⚙ (Settings) in the library, then **Get a free key** to open the ComicVine API page, create a free account, copy the key, paste it into **ComicVine key**, tap **Save key**, then **Test key** ("Key works").
- Updates from Releases install over the previous version and keep your library.
