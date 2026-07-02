Here is the updated, comprehensive Product Requirements Document (PRD) and Project Overview. This version strips out the payment complexities and heavily leans into the premium, hardware-accelerated features that justify the 5k–6k price point while keeping your development stack lean.

You can copy this directly into Notion, Obsidian, or GitHub.

---

# **PRD: Smart AI Voice Dictation & Intelligence Device**

## **1. Project Overview**

A dedicated, pocket-sized hardware device designed for frictionless audio capture, intelligent summarization, and task extraction. Built to replace clunky smartphone voice recorder apps, it leverages edge-processing and cloud AI to instantly transcribe, summarize, and sync thoughts, meetings, and lists without requiring the user to pull out a phone.

* **Target Retail Price:** ₹5,000 – ₹6,000
* **Development Timeline:** 1 Month (Phase 1: Breadboard Prototype & Core API integrations)
* **Target Audience:** Founders, professionals, writers, and students who need instant, organized thought capture.

---

## **2. Hardware Specifications**

The hardware architecture revolves around the **WaveShare ESP32-S3 1.8inch AMOLED Touch Display Development Board**, taking advantage of its AI vector instructions, dual-core processing, and native wireless stacks to keep costs low while delivering a premium feel.

---

## **3. Core Features & Software Architecture**

### **3.1 Premium Edge-Hardware Features (Zero Extra BoM Cost)**

* **"Flashback" Audio Buffer:** The device continuously records a rolling 60-second loop into the low-power PSRAM. Pressing the "Save" button commits the *previous* 60 seconds to the SD card, ensuring users never miss a fleeting thought.
* **Voice Activity Detection (VAD) Standby:** The main CPU sleeps while the ultra-low-power (ULP) co-processor listens. The device wakes up instantly to record upon detecting human speech or a button press, drastically extending battery life.
* **Local Audio Encryption:** AES-XTS hardware acceleration encrypts audio blocks as they are written to the SD card. If the device or card is lost, the data remains a completely unreadable vault.
* **Opus Compression Engine:** Shrinks raw WAV files by up to 90% locally before transmission, enabling lightning-fast BLE sync and reducing cloud bandwidth costs.

### **3.2 AI & Cloud Intelligence**

* **Real-time Voice to Text:** Streams compressed audio to a cloud backend for live transcription, displaying the text on the OLED screen.
* **AI Context & Summarization:** Cloud LLM processes the transcript to generate:
* Chapter structures and bullet points.
* Actionable Task/Shopping lists extracted from natural speech.


* **Ask Your Notes (Chat):** Users can query their past notes via the companion app or web dashboard ("What did I say about the marketing budget last Tuesday?").
* **Native Language Support:** Supports transcription and translation for regional languages alongside English.
* **Text to Voice (TTS):** The device can read back AI summaries, daily schedules, or selected notes through the onboard speaker.

### **3.3 Ecosystem & Synchronization**

* **Zero-App Direct Sync (Wi-Fi):** When in range of a known Wi-Fi network, the device bypasses the phone entirely, pushing audio and transcripts directly to cloud storage, Notion, or Slack via Webhooks.
* **Companion Application (KMP):** Utilizing Kotlin Multiplatform (KMP), a unified codebase powers the Android, iOS, and Desktop companion apps. This app handles:
* Initial device setup (Wi-Fi provisioning via BLE).
* Note browsing, playback, and AI chat interface.
* Decryption key management for the SD card.


* **Over-The-Air (OTA) Updates:** Firmware updates pushed directly to the device via Wi-Fi to continuously improve edge AI models and UI.

---

## **4. User Flow**

1. **Capture:** User taps the record button (or triggers the VAD wake word). The OLED lights up.
2. **Process:** As the user speaks, the OLED displays real-time transcription.
3. **Categorize:** User taps a side button to cycle through categories (e.g., "Idea," "Meeting," "To-Do").
4. **Sync:** Once recording stops, the device compresses the file (Opus) and encrypts it. If connected to Wi-Fi, it pushes the file to the cloud. If offline, it waits for a BLE connection to the KMP companion app.
5. **Review:** The cloud backend generates the AI summary and tasks, which sync back to the device's OLED and populate instantly on the user's mobile app.

---

## **5. Development Roadmap: 1-Month Prototype Phase**

Since 1 month is a tight window, the focus must be entirely on validating the core technical risks on a breadboard/dev-kit before designing custom PCBs.

* **Week 1: Hardware Bring-up & Core Audio**
* Wire ESP32-S3 dev board to the OLED, INMP441 (Mic), and SD card module.
* Write firmware to successfully record I2S audio to the SD card.
* Get the OLED displaying basic status text.


* **Week 2: Connectivity & Companion App Base**
* Implement BLE pairing and Wi-Fi credential provisioning.
* Initialize the Kotlin Multiplatform (KMP) repository for the companion app.
* Establish basic file transfer (dummy files) from ESP32 to the KMP Android app.


* **Week 3: Audio Compression & Cloud Pipeline**
* Implement Opus compression on the ESP32 to shrink the audio payload.
* Set up a simple cloud backend (e.g., Ktor or Firebase) to receive the audio payload.
* Integrate a Voice-to-Text API (e.g., OpenAI Whisper API or Deepgram) on the backend.


* **Week 4: AI Integration & Polish**
* Integrate LLM API on the backend to generate summaries and task lists from the transcripts.
* Send the generated text data back down to the KMP app and the ESP32 OLED.
* Test the end-to-end flow: Speak into dev board -> Audio sent to cloud -> Summary appears on phone screen.