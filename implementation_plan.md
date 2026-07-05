# Detailed Implementation Plan - Interactive Storytelling & 3D Camera Angles

We will update [motion.html](file:///Users/jd/Dev/Website/Trace/motion.html) to incorporate premium **3D Perspective Camera Angles** (combining Y-axis side rotations and X-axis desk slants), integrate the website's signature 28-bar animated background wave, match the Summary screen text list layout of `index.html`, and build a premium glassmorphic bottom CTA card.

---

## User Review Required

> [!IMPORTANT]
> **Premium 3D perspective Transitions**:
> Instead of flat 2D slides, the device will animate dynamically in 3D space utilizing Y-axis and X-axis rotations:
> *   *Cut 1 (Flashback - Left shift)*: Tilts on Y-axis (`rotateY: 25deg`, `rotateZ: -4deg`) to show a gorgeous right-side bezel depth projection.
> *   *Cut 2 (Live Transcript - Right shift)*: Tilts on Y-axis (`rotateY: -28deg`, `rotateZ: 6deg`) to show a gorgeous left-side depth projection.
> *   *Cut 3 (Summary - Zoom)*: Zooms close and tilts slightly backward on X-axis (`rotateX: 18deg`).
> *   *Cut 4 (Security - Bottom)*: Tilts backward on X-axis (`rotateX: 38deg`) mimicking a desk presentation lay flat angle.
> 
> **Summary UI Matching**:
> Replaced checkboxes with the bulleted list lines matching `index.html` exactly:
> *   `• Streamline client onboarding flow`
> *   `• Remove steps 3 & 4 friction points`
> *   `• Integrate quick Stripe transactions`
> *   `• Schedule A/B test for next cohort`

---

## Proposed Changes

### 1. Updated Storyboard Timings & Camera Angles (30s)

#### Scene 1: The Kinetic Hook (0.0s - 5.0s)
*   **0.0s - 3.0s**: Visual clock ticking from `12:46:57 PM` to `12:47:00 PM` in sync with ticking sounds.
*   **3.0s - 5.0s**: Heavy sub-bass drum hits on masked text hooks flashing:
    *   *(3.0s)*: `"Too many tabs."`
    *   *(3.5s)*: `"Too many distractions."`
    *   *(4.0s)*: `"Ideas fade."`
    *   *(4.5s)*: `"Capture them."`

#### Scene 2: The Hardware Reveal (5.0s - 10.0s)
*   Device slides up flat (`translateY: 0`, `scale: 1.0`, all rotations: `0`). Equalizer waves bounce. Copy: *"Execute at the speed of thought."*
*   **Background Wave**: The **28-bar symmetrical background wave** (14 left, 14 right with a 260px gap) fades in (`opacity: 0.35`) and bounces in sync with the equalizer.

#### Scene 3: Rapid-Fire Edge Intelligence (10.0s - 20.0s)

*   **Cut 1: The Flashback Safety Net (10.0s - 13.5s)**:
    *   *10.0s - 11.5s*: Device slides off-screen left and tilts on Y-axis (`translateX: -160`, `translateY: 15`, `scale: 1.05`, `rotateY: 25`, `rotateZ: -4`). Center overlays chain-flash: `"Missed it?"` -> `"Don't worry."` -> `"Let's capture."`
    *   *11.5s*: Device slides back to center (`translateX: 0`, `translateY: 0`, `rotateY: 0`, `rotateZ: 0`, `scale: 1.05`).
    *   *12.0s*: A glowing click cursor taps EXACTLY in the center of the Flashback icon (`left: 50%`, `top: 50%`). Sound: mechanical click.
    *   *12.2s*: Concentric retroactive audio ripples suck from the right into the device. Tag overlay: `"Captures last 60s of audio"`.
    *   *12.3s*: Visual time-travel effect! The device clock (`#device-time`) rapidly rewinds (e.g. from 12:47 PM back to 12:46 PM). A glowing container of past "transcribed notes" slides up rapidly from the bottom of the device screen, simulating memories being recovered.
*   **Cut 2: Live Transcription (13.5s - 16.0s)**:
    *   *Camera Pan*: Device slides far right and tilts on Y-axis (`translateX: 170`, `translateY: -10`, `scale: 1.1`, `rotateY: -28`, `rotateZ: 6`).
    *   *Interactivity*: Drifting words flow from left to right, entering the screen. Typewriter transcript types.
*   **Cut 3: AI Action Extraction (16.0s - 18.0s)**:
    *   *Camera Pan*: Device centers and zooms in extremely close, tilting on X-axis (`scale: 1.75`, `translateY: 130`, `rotateX: 18`, `rotateY: 0`, `rotateZ: 0`).
    *   *Device UI*: Displays the bulleted list lines from `index.html` fading in sequentially.
    *   *Interactivity*: Scanner laser sweeps. As tasks check off, glowing sparks erupt from the bezel.
*   **Cut 4: Local Encryption Vault (18.0s - 20.0s)**:
    *   *Camera Pan*: Device slides to bottom edge and tilts back on X-axis (`translateY: 175`, `scale: 1.25`, `rotateX: 38`, `rotateY: 0`, `rotateZ: 0`).
    *   *Device UI*: Displays MicroSD card SVG shape with contact pins.
    *   *Interactivity*: Binary digits stream downward from the top. Padlock badge overlay pops on top of the MicroSD card, locking it. Status text transitions from `"Saving..."` to `"Storage Encrypted"`.

#### Scene 4: The Zero-App Sync (20.0s - 25.0s)
*   Device dims and pulls back to flat profile (`scale: 0.82`, `translateY: -20`, all rotations: `0`). Sync progress bar animates matching the storage and spin-slow presets. Spans highlight green sequentially: *"To Notion."* -> *"To Slack."* -> *"To Obsidian."* Particles shoot to logo badges.

#### Scene 5: The Outro & CTA Card (25.0s - 30.0s)
*   **Device UI State**: Device screen transitions back to standby `Capture` screen, displaying:
    *   Header: `"Ready to Record"`
    *   Center: A circular standby button with a pulsing white dot indicator.
    *   Subtext: `"Hold to Start"`.
*   Mockup centers flatly and floats. Premium glassmorphic card fades in below housing a green-glowing Pre-Order CTA button and clear pricing layout.

---

## Proposed Changes

### [MODIFY] [motion.html](file:///Users/jd/Dev/Website/Trace/motion.html)
*   Add `perspective: 1000px` to `#motion-canvas` container.
*   Update Summary screen HTML markup to match the bullet points of `index.html`.
*   Update Anime.js timeline to coordinate Y-axis and X-axis perspective rotations on `#device-container`.
*   Style the bottom CTA card.

---

## Verification Plan

### Manual Verification
*   Open [motion.html](file:///Users/jd/Dev/Website/Trace/motion.html) in browser.
*   Verify 3D slants during Cut 1 (tilts right), Cut 2 (tilts left), Cut 3 (zooms, tilts back), and Cut 4 (table lay slant). Verify that Summary screen elements match `index.html` bullets.
