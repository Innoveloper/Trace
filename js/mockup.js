// Preloader start execution time tracking
const preloaderStartTime = performance.now();
window.deferDeviceBoot = true;

// Trigger fade-in entry animation for preloader device as soon as script runs
(function triggerPreloaderEntry() {
    const preloaderDevice = document.getElementById('preloader-device');
    if (preloaderDevice) {
        // Allow DOM to register the initial opacity(0) before transitioning
        setTimeout(() => {
            preloaderDevice.style.opacity = '1';
        }, 50);
    } else {
        // Fallback in case DOM is not ready
        document.addEventListener('DOMContentLoaded', () => {
            const device = document.getElementById('preloader-device');
            if (device) {
                setTimeout(() => {
                    device.style.opacity = '1';
                }, 50);
            }
        });
    }
})();

// Page preloader and fly-in morphing transition handler
let preloaderDismissed = false;

// Schedule dynamic preloader status text transitions
const statusTextTimer1 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Initializing Core UI Modules...';
    }
}, 400);

const statusTextTimer2 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Syncing Workspace Cache...';
    }
}, 850);

const statusTextTimer3 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Ready.';
    }
}, 1300);

function hidePreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;

    clearTimeout(statusTextTimer1);
    clearTimeout(statusTextTimer2);
    clearTimeout(statusTextTimer3);

    const preloader = document.getElementById('page-preloader');
    const preloaderDevice = document.getElementById('preloader-device');
    const heroDevice = document.getElementById('hero-device');
    const preloaderStatus = document.getElementById('preloader-status');

    if (!preloader) return;

    const elapsed = performance.now() - preloaderStartTime;
    const remaining = Math.max(0, 400 - elapsed);

    setTimeout(() => {
        if (preloaderDevice && heroDevice) {
            // Calculate scale and position coordinates relative to the viewport
            const preloaderRect = preloaderDevice.getBoundingClientRect();
            const heroRect = heroDevice.getBoundingClientRect();

            const preloaderCenterX = preloaderRect.left + preloaderRect.width / 2;
            const preloaderCenterY = preloaderRect.top + preloaderRect.height / 2;
            const heroCenterX = heroRect.left + heroRect.width / 2;
            const heroCenterY = heroRect.top + heroRect.height / 2;

            const deltaX = heroCenterX - preloaderCenterX;
            const deltaY = heroCenterY - preloaderCenterY;
            const scale = heroRect.width / preloaderRect.width;

            // Trigger the FLIP animation using translation and exact scale matching (prevents viewport/mobile size jumps)
            preloaderDevice.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
            preloaderDevice.style.opacity = '1';
        }

        // Fade out overlay background and status text separately to keep device visible
        preloader.classList.add('fade-out');
        if (preloaderStatus) {
            preloaderStatus.classList.remove('animate-pulse');
            preloaderStatus.classList.add('opacity-0');
        }

        // Clean up preloader and show hero mockup device after transition completes (0.5s duration)
        setTimeout(() => {
            // Instant swap: hide preloader device, show hero device without transition lag
            if (heroDevice) {
                heroDevice.style.transition = 'none';
                heroDevice.offsetHeight; // force browser repaint to apply transition: none instantly
                heroDevice.style.opacity = '1';
                heroDevice.classList.remove('opacity-0');
                // Restore transition properties in next frames for clean subsequent states
                setTimeout(() => {
                    heroDevice.style.transition = '';
                }, 50);

                // End boot deferral and trigger hero device boot transition sequence
                window.deferDeviceBoot = false;
                switchMode('capture', false);
            }
            if (preloaderDevice) {
                preloaderDevice.style.transition = 'none';
                preloaderDevice.style.opacity = '0';
            }
            const preloaderWrapper = document.getElementById('preloader-device-wrapper');
            if (preloaderWrapper) {
                preloaderWrapper.style.display = 'none';
            }
            preloader.style.display = 'none';
        }, 500);
    }, remaining);
}

// Fallback timeout to force preloader removal after 1.5 seconds if loading is slow
const preloaderFallbackTimeout = setTimeout(() => {
    console.warn("Preloader forced dismiss via timeout fallback.");
    hidePreloader();
}, 1500);

window.addEventListener('load', () => {
    clearTimeout(preloaderFallbackTimeout);
    hidePreloader();
});


// Loops.so Form Endpoint Configuration ID
const LOOPS_FORM_ID = 'cmr2br68g059u0jyri98r5fyc';

// Update device status bar time dynamically
function updateDeviceTime() {
    const timeEl = document.getElementById('device-time');
    if (timeEl) {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        timeEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
}

setInterval(updateDeviceTime, 1000);

let captureTimer;
let bootTimer;
let voiceInterval;
let typewriterTimeout;
let syncTimer;
let volumeHistory = Array(14).fill(0.1);
let isSpeaking = true;
let speechTimer = 0;
let masterVolume = 0.1;
let hasBooted = false;

const transcriptionPool = [
    "so the idea is to streamline",
    "the onboarding process by",
    "reducing the number of steps.",
    "We can also automate follow-ups",
    "and sync the action items directly",
    "to our team workspace in real-time.",
    "This removes all administrative friction",
    "so we can focus on core product design.",
    "Let's test this prototype next week.",
    "Meeting concluded, actions generated."
];
let poolIndex = 0;

const bgLeftMultipliers = [4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 24, 16, 10, 6];
const bgRightMultipliers = [6, 10, 16, 24, 32, 28, 20, 16, 12, 10, 8, 6, 4, 4];
const deviceMultipliers = [0.25, 0.45, 0.75, 0.95, 1.0, 0.9, 0.7, 0.45, 0.25]; // 9 bars

function clearVoiceCaptureAnimation() {
    clearInterval(voiceInterval);
    document.querySelectorAll('.animate-waveform').forEach(el => el.style.height = '');
    document.querySelectorAll('.animate-bg-wave').forEach(el => el.style.height = '');
}

function startVoiceCaptureAnimation() {
    clearVoiceCaptureAnimation();
    volumeHistory = Array(14).fill(0.1);
    isSpeaking = true;
    speechTimer = 0;

    const deviceBars = document.querySelectorAll('.animate-waveform');
    const bgBars = document.querySelectorAll('.animate-bg-wave');

    voiceInterval = setInterval(() => {
        // Update conversational state
        speechTimer -= 80;
        if (speechTimer <= 0) {
            isSpeaking = !isSpeaking;
            // Talk for 1.8s to 3.2s. Pause for 0.6s to 1.2s.
            speechTimer = isSpeaking ? (1800 + Math.random() * 1400) : (600 + Math.random() * 600);
        }

        if (isSpeaking) {
            // Fluctuating voice level representing spoken syllables
            masterVolume = 0.25 + Math.random() * 0.75;
        } else {
            // Minimal voice level representing a breath/pause
            masterVolume = 0.05 + Math.random() * 0.08;
        }

        // Update history array (push to front, pop off oldest)
        volumeHistory.unshift(masterVolume);
        volumeHistory.pop();

        // 1. Update Centered Device Equalizer Bars (9 bars)
        deviceBars.forEach((bar, idx) => {
            const mult = deviceMultipliers[idx] || 0.5;
            const fluctuation = 0.85 + Math.random() * 0.3; // 85% to 115%
            // h-14 container height is 56px.
            const targetHeight = Math.max(4, masterVolume * mult * fluctuation * 56);
            bar.style.height = `${targetHeight}px`;
        });

        // 2. Update Symmetrical Propagating Background Wave (28 bars: 14 left, 14 right)
        bgBars.forEach((bar, idx) => {
            let historyIndex;
            let multiplier;
            if (idx < 14) {
                // Left side: far-left (idx=0, oldest) to near-left (idx=13, newest)
                historyIndex = 13 - idx;
                multiplier = bgLeftMultipliers[idx];
            } else {
                // Right side: near-right (idx=14, newest) to far-right (idx=27, oldest)
                historyIndex = idx - 14;
                multiplier = bgRightMultipliers[idx - 14];
            }
            const vol = volumeHistory[historyIndex] || 0.1;
            const fluctuation = 0.9 + Math.random() * 0.2; // 90% to 110%
            // Max background wave bar height is multiplier * 1.5
            const targetHeight = Math.max(4, vol * multiplier * fluctuation * 1.5);
            bar.style.height = `${targetHeight}px`;
        });
    }, 80);
}

function startTranscriptionMockup() {
    const container = document.getElementById('transcript-lines-container');
    if (!container) return;

    // Clear previous state
    container.innerHTML = '';
    clearTimeout(typewriterTimeout);

    // Start with the first two lines already typed out
    const p1 = document.createElement('p');
    p1.className = 'font-body-md text-text-muted text-[12px] leading-normal transition-all duration-500 opacity-40';
    p1.textContent = '...so the idea is to streamline';
    container.appendChild(p1);

    const p2 = document.createElement('p');
    p2.className = 'font-body-md text-text-muted text-[12px] leading-normal transition-all duration-500 opacity-65';
    p2.textContent = 'the onboarding process by';
    container.appendChild(p2);

    poolIndex = 2; // Next line to type is index 2

    function typeNextLine() {
        // If we have 3 lines, shift up
        const children = container.querySelectorAll('p');
        if (children.length >= 3) {
            // Fade out the first one
            children[0].style.opacity = '0';
            children[0].style.transform = 'translateY(-4px)';

            // Transition others
            children[1].className = 'font-body-md text-text-muted text-[12px] leading-normal transition-all duration-500 opacity-40';
            children[2].className = 'font-body-md text-text-muted text-[12px] leading-normal transition-all duration-500 opacity-65';

            setTimeout(() => {
                if (children[0] && children[0].parentNode) {
                    container.removeChild(children[0]);
                }
            }, 500);
        }

        // Create new paragraph for typing
        const newP = document.createElement('p');
        newP.className = 'font-body-md text-primary text-[12px] leading-normal font-medium transition-all duration-500 opacity-100';
        container.appendChild(newP);

        const fullText = transcriptionPool[poolIndex];
        poolIndex = (poolIndex + 1) % transcriptionPool.length;

        let charIndex = 0;

        function typeChar() {
            newP.textContent = fullText.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex < fullText.length) {
                typewriterTimeout = setTimeout(typeChar, 45 + Math.random() * 25);
            } else {
                // Wait before typing next line
                typewriterTimeout = setTimeout(typeNextLine, 1800);
            }
        }

        typeChar();
    }

    // Trigger typing of the first dynamic line after a short delay
    typewriterTimeout = setTimeout(typeNextLine, 500);
}

function startSyncMockup() {
    const progressBar = document.getElementById('sync-progress-bar');
    const statusText = document.getElementById('sync-status-text');
    const storageText = document.getElementById('sync-storage-text');
    const syncIcon = document.getElementById('sync-icon');

    if (!progressBar || !statusText || !storageText || !syncIcon) return;

    // Reset layout to initial syncing state
    let syncProgress = 0;
    progressBar.style.width = '0%';
    statusText.textContent = 'Syncing...';
    storageText.textContent = 'Storage: 0.0 MB / 4.8 MB';
    syncIcon.textContent = 'sync';
    syncIcon.className = 'material-symbols-outlined text-primary text-sm animate-[spin-slow_3s_linear_infinite]';

    function updateSync() {
        if (syncProgress < 100) {
            // Increment progress randomly
            syncProgress += Math.floor(Math.random() * 8) + 4; // 4% to 11% step
            if (syncProgress > 100) syncProgress = 100;

            progressBar.style.width = `${syncProgress}%`;

            // Calculate storage sync amount
            const mbSynced = ((syncProgress / 100) * 4.8).toFixed(1);
            storageText.textContent = `Storage: ${mbSynced} MB / 4.8 MB`;

            syncTimer = setTimeout(updateSync, 120 + Math.random() * 80);
        } else {
            // Complete sync
            progressBar.style.width = '100%';
            statusText.textContent = 'Sync Complete';
            storageText.textContent = 'Storage: 4.8 MB / 4.8 MB';

            // Change icon to check
            syncIcon.textContent = 'check';
            syncIcon.className = 'material-symbols-outlined text-primary text-sm'; // stop spinning

            // Wait 3.5 seconds and restart loop
            syncTimer = setTimeout(startSyncMockup, 3500);
        }
    }

    // Start the sync interval loop
    syncTimer = setTimeout(updateSync, 300);
}

window.currentActiveMockupMode = 'capture';
window.handleMockupModeChange = null;

function startRecording() {
    const readyScreen = document.getElementById('capture-ready');
    const activeScreenContent = document.getElementById('capture-active');
    if (readyScreen && activeScreenContent) {
        clearTimeout(captureTimer);
        readyScreen.style.opacity = '0';
        setTimeout(() => {
            readyScreen.style.display = 'none';
            activeScreenContent.style.display = 'flex';
            activeScreenContent.offsetHeight; // trigger reflow
            activeScreenContent.style.opacity = '1';
            startVoiceCaptureAnimation();
        }, 300);
    }
}

function switchMode(mode, trackEvent = true) {
    const previousMode = window.currentActiveMockupMode;
    window.currentActiveMockupMode = mode;

    // Clear active timers for capture animation
    clearTimeout(captureTimer);
    clearTimeout(bootTimer);
    clearTimeout(typewriterTimeout);
    clearTimeout(syncTimer);
    clearVoiceCaptureAnimation();

    // Ensure status bar is visible by default
    const statusBar = document.getElementById('device-status-bar');
    if (statusBar) {
        statusBar.style.display = 'flex';
    }

    // Reset all buttons to default state
    const buttons = document.querySelectorAll('.walkthrough-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Set active button state
    const activeBtn = document.getElementById(`btn-${mode}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Track screen switch event in PostHog
    if (trackEvent && typeof window.handleMockupModeChange === 'function') {
        window.handleMockupModeChange(previousMode, mode);
    }

    if (trackEvent && window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture('mockup_screen_switched', {screen_mode: mode});
    }

    // Hide all screens
    const screens = document.querySelectorAll('.screen-content');
    screens.forEach(screen => {
        screen.style.opacity = '0';
        screen.style.pointerEvents = 'none';
    });

    // Show active screen
    const activeScreen = document.getElementById(`screen-${mode}`);
    if (activeScreen) {
        activeScreen.style.opacity = '1';
        activeScreen.style.pointerEvents = 'auto';

        // Capture State sequence
        if (mode === 'capture') {
            const bootScreen = document.getElementById('capture-boot');
            const readyScreen = document.getElementById('capture-ready');
            const activeScreenContent = document.getElementById('capture-active');

            if (!hasBooted) {
                // Hide status bar during boot
                if (statusBar) statusBar.style.display = 'none';

                // Initial layout: Boot screen visible, others hidden
                bootScreen.style.display = 'flex';
                bootScreen.style.opacity = '1';
                readyScreen.style.display = 'none';
                readyScreen.style.opacity = '0';
                activeScreenContent.style.display = 'none';
                activeScreenContent.style.opacity = '0';

                if (!window.deferDeviceBoot) {
                    hasBooted = true;

                    // Transition 1: Boot -> Ready (after 0.4 seconds)
                    bootTimer = setTimeout(() => {
                        bootScreen.style.opacity = '0';
                        setTimeout(() => {
                            bootScreen.style.display = 'none';
                            readyScreen.style.display = 'flex';
                            readyScreen.offsetHeight; // trigger reflow
                            readyScreen.style.opacity = '1';
                            // Restore status bar
                            if (statusBar) statusBar.style.display = 'flex';
                        }, 300);
                    }, 400);
                }
            } else {
                // Skip boot screen, show ready screen immediately
                bootScreen.style.display = 'none';
                bootScreen.style.opacity = '0';
                readyScreen.style.display = 'flex';
                readyScreen.style.opacity = '1';
                activeScreenContent.style.display = 'none';
                activeScreenContent.style.opacity = '0';

                // Enforce status bar is visible
                if (statusBar) statusBar.style.display = 'flex';
            }
        }

        // Start dynamic looping transcription typewriter
        if (mode === 'transcribe') {
            startTranscriptionMockup();
        }

        // Start dynamic looping sync progress bar
        if (mode === 'sync') {
            startSyncMockup();
        }
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        hamburgerIcon.textContent = 'close';
    } else {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.textContent = 'menu';
    }
}

function scrollToSpecs() {
    const specsEl = document.getElementById('specs-section');
    if (specsEl) {
        specsEl.scrollIntoView({behavior: 'smooth'});
    }
}

function trackCta(location, text) {
    if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture('cta_clicked', {
            cta_location: location,
            cta_text: text
        });
    }
    if (typeof fbq === 'function') {
        if (text === 'Reserve Now') {
            fbq('trackCustom', 'Reserve Now');
            fbq('track', 'Lead');
        } else if (text === 'Pre-order Now') {
            fbq('trackCustom', 'Pre-Order');
            fbq('track', 'Lead');
        }
    }
}

function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Scroll listener for Back to Top button
window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
});

function initializeWaitlistForm() {
    const waitlistForm = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('waitlist-email');
    const submitBtn = document.getElementById('waitlist-submit-btn');
    const errorMsg = document.getElementById('waitlist-error-msg');
    const formContainer = document.getElementById('waitlist-form-container');

    if (!waitlistForm) return;

    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        // Reset error state
        errorMsg.textContent = '';
        errorMsg.classList.add('opacity-0');
        emailInput.classList.remove('animate-shake', 'border-error');

        // Set loading state
        const btnText = submitBtn.querySelector('span');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        emailInput.disabled = true;
        submitBtn.innerHTML = `
                                <svg class="animate-spin h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Joining...</span>
                        `;

        // Track submission intent in PostHog
        const signupMode = (!LOOPS_FORM_ID || LOOPS_FORM_ID === '<YOUR_LOOPS_FORM_ID>') ? 'mockup' : 'live';
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture('newsletter_signup', {status: 'submitting', mode: signupMode});
        }

        // Mockup or real submit
        if (!LOOPS_FORM_ID || LOOPS_FORM_ID === '<YOUR_LOOPS_FORM_ID>') {
            // Simulating successful submit in Mockup mode
            setTimeout(() => {
                console.log("Mock newsletter submission to Loops.so successful:", email);

                if (window.posthog && typeof window.posthog.capture === 'function') {
                    window.posthog.capture('newsletter_signup', {status: 'success', mode: 'mockup'});
                }

                // Transition to success state with spring animation
                formContainer.classList.add('animate-scale-in');
                formContainer.innerHTML = `
                                                <div class="flex items-center gap-3 text-secondary p-4 bg-accent-green-glass border border-secondary/20 rounded-lg">
                                                        <span class="material-symbols-outlined text-secondary text-2xl font-bold">check_circle</span>
                                                        <span class="font-body-md text-primary text-sm font-medium">You're on the list. Presence awaits you.</span>
                                                </div>
                                        `;
            }, 1000);
        } else {
            try {
                const response = await fetch(`https://app.loops.so/api/newsletter-form/${LOOPS_FORM_ID}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        email: email,
                        source: 'Waitlist Form'
                    })
                });

                if (response.ok) {
                    if (window.posthog && typeof window.posthog.capture === 'function') {
                        window.posthog.capture('newsletter_signup', {status: 'success', mode: 'live'});
                    }

                    formContainer.classList.add('animate-scale-in');
                    formContainer.innerHTML = `
                                                        <div class="flex items-center gap-3 text-secondary p-4 bg-accent-green-glass border border-secondary/20 rounded-lg">
                                                                <span class="material-symbols-outlined text-secondary text-2xl font-bold">check_circle</span>
                                                                <span class="font-body-md text-primary text-sm font-medium">You're on the list. Presence awaits you.</span>
                                                        </div>
                                                `;
                } else {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'Submission failed. Please try again.');
                }
            } catch (err) {
                console.error("Loops submission error:", err);
                if (window.posthog && typeof window.posthog.capture === 'function') {
                    window.posthog.capture('newsletter_signup', {status: 'error', error: err.message});
                }

                // Reset loading state
                submitBtn.disabled = false;
                emailInput.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                // Shake effect on error
                emailInput.classList.add('animate-shake', 'border-error');
                errorMsg.textContent = err.message || 'Something went wrong. Please check your connection.';
                errorMsg.classList.remove('opacity-0');

                // Remove shake class after animation finishes so it can be re-triggered
                setTimeout(() => {
                    emailInput.classList.remove('animate-shake');
                }, 500);
            }
        }
    });
}

// Initialize animations and update clock on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDeviceTime();
    switchMode('capture', false);
    initializeWaitlistForm();

    // Setup record button click listener
    const recordBtn = document.getElementById('device-record-button');
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (window.posthog && typeof window.posthog.capture === 'function') {
                window.posthog.capture('mockup_recording_started');
            }
            startRecording();
        });
    }

    // Toggle header "Pre-order Now" visibility based on Hero "Reserve Now" button visibility
    const headerPreorderBtn = document.getElementById('header-preorder-btn');
    const heroReserveBtn = document.getElementById('hero-reserve-btn');

    if (headerPreorderBtn && heroReserveBtn) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Hero button is visible: hide header button
                    headerPreorderBtn.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                    headerPreorderBtn.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                } else {
                    // Hero button scrolled away: show header button
                    headerPreorderBtn.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                    headerPreorderBtn.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
                }
            });
        }, {threshold: 0});
        observer.observe(heroReserveBtn);
    }
});
