# Project & Product Knowledge Base: Trace AI Voice Dictation

This document aggregates all specifications, marketing copy, features, OS screens, integrations, pricing, and storyboard details of the **Trace AI Voice Dictation** project.

---

## 1. Product Overview & Value Proposition
*   **Product Name**: Trace
*   **Tagline**: *Execute at the speed of thought.*
*   **Core Philosophy**: Technology should keep you focused, not distracted. Trace is a dedicated, screen-focused but distraction-free companion hardware device designed to capture spoken insights and immediately structure them into action points.
*   **No phone distraction**: No feeds, no notifications, no infinite scrolling—just a dedicated hardware recorder to capture thoughts instantly without pulling out your smartphone.

---

## 2. Core Features (Website Content)

### A. Capture (Frictionless Dictation)
*   Pocket-sized audio recording.
*   **Flashback Buffer**: The device securely listens in a rolling 60-second audio loop. When you have an idea, simply press the hardware record button to retroactively save the last minute of audio.

### B. Transcript (Live Translation & Dictation)
*   Real-time, stream-optimized voice-to-text.
*   Support for multilingual translation and live, on-screen transcription in English and regional languages.

### C. Summary (Intelligent Structuring)
*   Intelligent AI post-processing that organizes unorganized spoken audio drafts.
*   Automatically converts spoken notes into clean chapter structures, actionable checkmark tasks, shopping lists, and core insights.

### E. Security & Processing
*   **Voice Activity Detection (VAD)**: Low-power state that keeps the device on standby but wakes up instantly the moment you begin speaking or press the button.
*   **Local Audio Encryption**: Military-grade hardware encryption (AES-256) on-device. Even if the hardware is lost, the saved recordings remain completely inaccessible.
*   **Ask Your Notes**: conversational AI queries of your historical note database via the companion app (e.g., *"What did I say about the marketing budget last Tuesday?"*).

---

## 3. Technical Specifications

| Parameter | Specifications |
| :--- | :--- |
| **Display** | 1.8" Touch AMOLED Display Area, outdoor-readable (350 nits), ultra-high contrast ratio, rounded bezel glass cover |
| **Processor & Memory** | Dedicated Edge AI Processor, secure high-performance local storage, low-power RAM |
| **Connectivity** | Wi-Fi Direct (2.4GHz/5GHz), Bluetooth 5.2 |
| **Audio** | Onboard Mic, Speaker, Premium Audio Decoder |
| **Dimensions** | 37.60 x 45.20 x 15.00 mm |
| **Ports & Expansion** | USB-C Port (charging & data), MicroSD Card Slot, curved matte enclosure |
| **Operation** | Touch screen display + physical tactile operation buttons |

---

## 4. Trace OS Screens (Device UI Mockups)

The display screen simulates 5 distinct states inside the 1.8" AMOLED bezel display:
1.  **Voice Capture Screen**:
    *   Header: `Voice Capture`
    *   VAD standby microphone icon with pulsing circular rings.
    *   Symmetrical 9-bar equalizer waveform visualizer responding dynamically to speech levels.
    *   Status line: `Recording...` (pulsing).
2.  **Security Screen**:
    *   Header: `Security`
    *   Rotating secure combination dial ring.
    *   Security padlock graphic.
    *   Status line: `Storage Encrypted`.
3.  **Live Transcript Screen**:
    *   Header: `Live Transcript`
    *   Dynamic typewriter typing text block bounded by a vertical green margin bar (`border-l border-secondary/40`).
    *   Typing text example: *"Draft an email to the engineering team about the new specs. Also, review the budget at 3 PM."*
4.  **AI Summary Screen**:
    *   Header: `AI Summary`
    *   Checks listing area resolving parsed checklist notes with animated checkbox icons:
        *   `[x] Draft engineering specs email`
        *   `[x] Review budget at 3 PM`
5.  **Sync Screen**:
    *   Header: `Sync`
    *   Rotating digital sync loop icon + state status: `Syncing...` -> `Synced`.
    *   Progress bar loading dynamically.
    *   Dynamic storage counters incrementing: `0.0 MB / 4.8 MB` up to `4.8 MB / 4.8 MB`.

---

## 5. Ecosystem & Integration Workflow

Trace operates on a **Thought-to-Action** workflow:
1.  **Capture**: User speaks or relies on the 60s Flashback Buffer.
2.  **Process**: Edge AI performs initial on-screen transcription.
3.  **Categorize**: Notes are tagged (e.g. *Idea*, *Meeting*, *Task*).
4.  **Sync**: Audio is Opus-compressed and pushed directly via direct Wi-Fi sync.
5.  **Review**: Companion App (iOS, Android, and Desktop) displays finalized transcripts, summaries, and action integrations.
*   **Direct integrations**: Direct Wi-Fi Direct Sync pushes transcripts and note items directly to:
    *   Notion
    *   Slack
    *   Obsidian

---

## 6. Pre-Order & Pricing Details
*   **Standard pre-order Price**: ₹2,499.00 INR (discounted from original ₹4,999.00 value).
*   **Delivery Fees**: Free shipping (₹0.00 delivery cost).
*   **Domain / Landing Page**: `trace.innoveloper.com`
*   **Checkout URL**: `/checkout.html`
*   **E-Commerce Form Fields**: Email address, Full name, Shipping address (Street, Apartment, City, State, ZIP), Card information.

---

## 7. Pre-Launch Video Motion Graphic Details (`motion.html`)

A 30-second self-contained vertical motion graphic simulation page is built at [motion.html](file:///Users/jd/Dev/Website/Trace/motion.html), styled using standard Workspace video designs (Google Vids style) with:
*   **Masked Kinetic Typography**: Titles slide up from behind clipping borders (`overflow-hidden` containers) using decel timing.
*   **Workspace Synthesizer Audio**: Programmatic Web Audio API synthesizes warm A-major chords, high-passed bubble keyboard click taps, resonant swishing sweeps, lock clicks, and chime alerts without loading external files.
*   **2D Snapping slides**: Displays slide horizontally inside the AMOLED mockup.
