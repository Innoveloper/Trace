document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if test mode is active (?test=true or ?test-mode=true)
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = true //urlParams.has('test') || urlParams.has('test-mode');

        // 1. Injected HUD setup for Test Mode
        if (isTestMode) {
            injectTestModeHud();
        }

        // Helper to safely intercept and route PostHog capture events
        function captureAnalyticsEvent(eventName, properties = {}) {
            try {
                // Filter out noisy automatic recording events in Test Mode
                if (isTestMode && ['$snapshot', '$$heatmap', '$autocapture'].includes(eventName)) {
                    return;
                }

                // Add standard analytics metadata
                const payload = {
                    ...properties,
                    $current_url: window.location.href,
                    $browser: getBrowserName(),
                    $device_type: getDeviceType()
                };

                if (isTestMode) {
                    console.log(`%c[PostHog Test Mode] Captured event: ${eventName}`, 'color: #10b981; font-weight: bold;', payload);
                    logEventToHud(eventName, payload);
                } else {
                    if (window.posthog && typeof window.posthog.capture === 'function') {
                        window.posthog.capture(eventName, payload);
                    }
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] Failed to capture event:', err);
            }
        }

        // Override window.posthog.capture for other scripts on the page
        if (isTestMode) {
            window.posthog = window.posthog || {};
            window.posthog.capture = function (eventName, properties) {
                captureAnalyticsEvent(eventName, properties);
            };
        }

        // 2. Walkthrough Interaction tracking (Time & Clicks per Mode)
        const walkthroughContainer = document.getElementById('walkthrough-interactive-container');
        let mockupInteractionClicks = 0;
        let mockupInViewStartTime = null;
        let currentModeActiveDuration = 0;
        let isMockupIntersecting = false;

        if (walkthroughContainer) {
            // Capture any clicks inside the walkthrough container (screen, bezel, buttons, waveforms)
            walkthroughContainer.addEventListener('click', (e) => {
                const isBtn = e.target.closest('.walkthrough-btn');
                if (isTestMode) {
                    console.log(`[Mockup Click Debug] Click target:`, e.target, `| Is walkthrough-btn:`, !!isBtn);
                }
                // Ignore clicks on the mode change buttons themselves to avoid double-counting
                if (isBtn) {
                    return;
                }
                mockupInteractionClicks++;
                if (isTestMode) {
                    console.log(`[Mockup Click Debug] Mockup clicks incremented. Current total clicks:`, mockupInteractionClicks);
                }
            });

            // IntersectionObserver for tracking view duration of active mode
            const mockupObserver = new IntersectionObserver((entries) => {
                try {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                            isMockupIntersecting = true;
                            if (!mockupInViewStartTime) {
                                mockupInViewStartTime = performance.now();
                            }
                        } else {
                            isMockupIntersecting = false;
                            if (mockupInViewStartTime) {
                                currentModeActiveDuration += performance.now() - mockupInViewStartTime;
                                mockupInViewStartTime = null;
                            }
                            // Fire summary when user scrolls away from walkthrough
                            sendMockupSummary(window.currentActiveMockupMode);
                        }
                    });
                } catch (err) {
                    console.error('[PostHog Tracking Error] Mockup observer error:', err);
                }
            }, {threshold: [0, 0.5]});

            mockupObserver.observe(walkthroughContainer);
        }

        // Sends summary event for a given screen mode
        function sendMockupSummary(mode) {
            try {
                if (mockupInViewStartTime) {
                    currentModeActiveDuration += performance.now() - mockupInViewStartTime;
                    // If it remains in view, update active start time to current time
                    mockupInViewStartTime = performance.now();
                }
                const seconds = Math.round(currentModeActiveDuration / 1000);
                if (seconds > 0 || mockupInteractionClicks > 0) {
                    captureAnalyticsEvent('mockup_interaction_summary', {
                        duration_seconds: seconds,
                        clicks: mockupInteractionClicks,
                        screen_mode: mode
                    });
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] Mockup summary error:', err);
            } finally {
                // Reset counters for the next mode session
                currentModeActiveDuration = 0;
                mockupInteractionClicks = 0;
            }
        }

        // Hook called when screen mode is switched programmatically
        window.handleMockupModeChange = (oldMode, newMode) => {
            if (isTestMode) {
                console.log(`[Mockup Mode Change Debug] Switch from ${oldMode} to ${newMode}. Total clicks:`, mockupInteractionClicks);
            }
            sendMockupSummary(oldMode);
        };

        // 3. Section View Time and Click Tracking
        const sections = [
            document.getElementById('platform-section'),
            document.getElementById('philosophy-section'),
            document.getElementById('features-section'),
            document.getElementById('edge-section'),
            document.getElementById('intelligence-section'),
            document.getElementById('integrations-section'),
            document.getElementById('orchestration-section'),
            document.getElementById('specs-section'),
            document.getElementById('pricing-section'),
            document.getElementById('contact-section')
        ].filter(Boolean);

        let activeSectionId = null;
        let sectionStartTime = null;

        const sectionIntersectionRatios = {};
        const sectionClicks = {};

        // Initialize click counters for each section
        sections.forEach(sec => {
            sectionClicks[sec.id] = 0;
            sec.addEventListener('click', (e) => {
                const isInsideMockup = e.target.closest('#walkthrough-interactive-container');
                if (isTestMode) {
                    console.log(`[Section Click Debug] Click inside section: ${sec.id} | Target:`, e.target, `| Is inside walkthrough container:`, !!isInsideMockup);
                }
                // Ignore clicks originating inside the walkthrough mockup to avoid duplicate/unnecessary clicks
                if (isInsideMockup) {
                    return;
                }
                sectionClicks[sec.id]++;
                if (isTestMode) {
                    console.log(`[Section Click Debug] Section ${sec.id} clicks incremented. Total clicks:`, sectionClicks[sec.id]);
                }
            });
        });

        // Reduced steps to prevent lag during fast scrolling
        const sectionObserver = new IntersectionObserver((entries) => {
            try {
                entries.forEach(entry => {
                    sectionIntersectionRatios[entry.target.id] = entry.intersectionRatio;
                });

                let highestSectionId = null;
                let highestRatio = 0;

                for (const [id, ratio] of Object.entries(sectionIntersectionRatios)) {
                    if (ratio > highestRatio) {
                        highestRatio = ratio;
                        highestSectionId = id;
                    }
                }

                // Active section threshold is 15% visibility in viewport
                if (highestRatio > 0.15 && highestSectionId !== activeSectionId) {
                    recordSectionView(activeSectionId);
                    activeSectionId = highestSectionId;
                    sectionStartTime = performance.now();
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] Section observer error:', err);
            }
        }, {threshold: [0, 0.25, 0.5, 0.75, 1.0]});

        sections.forEach(sec => sectionObserver.observe(sec));

        function recordSectionView(sectionId) {
            try {
                if (sectionId && sectionStartTime) {
                    const durationMs = performance.now() - sectionStartTime;
                    const durationSec = Math.round(durationMs / 1000);
                    const clicks = sectionClicks[sectionId] || 0;

                    if (durationSec >= 1 || clicks > 0) { // Track if viewed for >= 1s OR clicked
                        captureAnalyticsEvent('section_viewed', {
                            section_name: sectionId,
                            duration_seconds: durationSec,
                            clicks: clicks
                        });
                    }
                    // Reset click count for this section for future active visits
                    sectionClicks[sectionId] = 0;
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] Record section view error:', err);
            }
        }

        // Send final stats when page is hidden, and resume timers when visible
        document.addEventListener('visibilitychange', () => {
            try {
                if (document.visibilityState === 'hidden') {
                    // Stop view timers
                    if (mockupInViewStartTime) {
                        currentModeActiveDuration += performance.now() - mockupInViewStartTime;
                        mockupInViewStartTime = null;
                    }
                    sendMockupSummary(window.currentActiveMockupMode);
                    if (activeSectionId) {
                        recordSectionView(activeSectionId);
                        sectionStartTime = null;
                    }
                } else if (document.visibilityState === 'visible') {
                    // Resume view timers
                    if (activeSectionId) {
                        sectionStartTime = performance.now();
                    }
                    if (isMockupIntersecting) {
                        mockupInViewStartTime = performance.now();
                    }
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] Visibility change error:', err);
            }
        });

        // 4. Test Mode Helper Functions
        function injectTestModeHud() {
            try {
                const hud = document.createElement('div');
                hud.id = 'test-mode-hud';
                hud.className = 'fixed top-4 right-4 z-[9999] w-76 bg-neutral-950/92 backdrop-blur-md border border-white/10 rounded-xl p-4 text-[11px] font-mono text-neutral-300 shadow-2xl flex flex-col gap-3 select-none transition-opacity duration-300 pointer-events-auto max-h-[90vh] overflow-y-auto';
                hud.innerHTML = `
                <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <div class="flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span class="text-white font-bold tracking-wider uppercase text-[9px]">Test Mode HUD</span>
                        </div>
                        <span class="text-neutral-500 text-[8px] bg-neutral-800 px-1.5 py-0.5 rounded">Active</span>
                </div>
                <div class="flex flex-col gap-2">
                        <!-- Section View Information -->
                        <div class="flex justify-between border-b border-white/5 pb-0.5"><span class="text-neutral-400 font-bold uppercase text-[8px]">Active Section Info</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Section Name:</span> <span id="hud-active-section" class="text-white font-semibold">platform-section</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Section Time:</span> <span id="hud-section-time" class="text-emerald-400 font-semibold">0.0s</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Section Clicks:</span> <span id="hud-section-clicks" class="text-white font-semibold">0</span></div>
                        
                        <!-- Mockup View Information -->
                        <div class="flex justify-between border-b border-white/5 pb-0.5 mt-1.5"><span class="text-neutral-400 font-bold uppercase text-[8px]">Mockup Interaction Info</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Mockup Mode:</span> <span id="hud-mockup-mode" class="text-white font-semibold">capture</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Mockup Time:</span> <span id="hud-mockup-time" class="text-emerald-400 font-semibold">0.0s</span></div>
                        <div class="flex justify-between"><span class="text-neutral-500">Mockup Clicks:</span> <span id="hud-mockup-clicks" class="text-white font-semibold">0</span></div>
                </div>
                <div class="border-t border-white/10 pt-2 flex flex-col gap-1">
                        <span class="text-neutral-500 uppercase tracking-widest text-[8px] mb-1 font-bold">Captured Events Log (click details):</span>
                        <div id="hud-event-log" class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                                <span class="text-neutral-600 italic">No events captured yet...</span>
                        </div>
                </div>
                `;
                document.body.appendChild(hud);

                // Live updating timer and variables loop
                setInterval(() => {
                    try {
                        // Update Mockup view duration timer
                        let durationMs = currentModeActiveDuration;
                        if (mockupInViewStartTime) {
                            durationMs += performance.now() - mockupInViewStartTime;
                        }
                        const timeDisplay = document.getElementById('hud-mockup-time');
                        const clicksDisplay = document.getElementById('hud-mockup-clicks');
                        const modeDisplay = document.getElementById('hud-mockup-mode');

                        if (timeDisplay) timeDisplay.textContent = (durationMs / 1000).toFixed(1) + 's';
                        if (clicksDisplay) clicksDisplay.textContent = mockupInteractionClicks;
                        if (modeDisplay) modeDisplay.textContent = window.currentActiveMockupMode;

                        // Update Section view duration timer
                        const sectionDisplay = document.getElementById('hud-active-section');
                        const sectionTimeDisplay = document.getElementById('hud-section-time');
                        const sectionClicksDisplay = document.getElementById('hud-section-clicks');

                        const elapsedSec = sectionStartTime ? (performance.now() - sectionStartTime) / 1000 : 0;
                        const sectionClicksCount = (activeSectionId && sectionClicks[activeSectionId]) || 0;

                        if (sectionDisplay) sectionDisplay.textContent = activeSectionId || 'None';
                        if (sectionTimeDisplay) sectionTimeDisplay.textContent = elapsedSec.toFixed(1) + 's';
                        if (sectionClicksDisplay) sectionClicksDisplay.textContent = sectionClicksCount;
                    } catch (err) {
                        // Silent catch for intervals to prevent console noise
                    }
                }, 100);
            } catch (err) {
                console.error('[PostHog Tracking Error] Failed to inject HUD:', err);
            }
        }

        function logEventToHud(eventName, properties) {
            try {
                const logContainer = document.getElementById('hud-event-log');
                if (!logContainer) return;

                const placeholder = logContainer.querySelector('.italic');
                if (placeholder) placeholder.remove();

                const item = document.createElement('div');
                item.className = 'hud-log-item border-b border-white/5 pb-1.5 mb-1.5 last:border-b-0 last:mb-0 last:pb-0 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors';

                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

                // Filter out properties for HUD key-value rendering
                const hudProps = {...properties};
                const sysProps = {};
                ['$current_url', '$browser', '$device_type'].forEach(key => {
                    if (hudProps[key]) {
                        sysProps[key] = hudProps[key];
                        delete hudProps[key];
                    }
                });

                const allProps = {...hudProps, ...sysProps};
                let propsHtml = '';
                if (Object.keys(allProps).length > 0) {
                    propsHtml = `<div class="hud-props-grid hidden grid grid-cols-2 gap-y-0.5 mt-1.5 pl-2 border-l border-emerald-500/30 text-[9px] text-neutral-400">`;
                    for (const [k, v] of Object.entries(allProps)) {
                        const isSystem = k.startsWith('$');
                        const keyClass = isSystem ? 'text-neutral-600' : 'text-neutral-400';
                        propsHtml += `<div class="${keyClass}">${k}:</div><div class="text-neutral-200 overflow-hidden text-ellipsis whitespace-nowrap" title="${v}">${v}</div>`;
                    }
                    propsHtml += `</div>`;
                }

                item.innerHTML = `
                <div class="flex justify-between items-center text-[10px]">
                        <div class="flex items-center gap-1">
                                <span class="text-neutral-500 text-[8px] transition-transform duration-200">▶</span>
                                <span class="text-emerald-400 font-semibold">${eventName}</span>
                        </div>
                        <span class="text-neutral-500 text-[8px]">${timeStr}</span>
                </div>
                ${propsHtml}
                `;

                // Add click handler to toggle key-value grid details
                item.addEventListener('click', () => {
                    const grid = item.querySelector('.hud-props-grid');
                    const arrow = item.querySelector('.text-neutral-500');
                    if (grid) {
                        const isHidden = grid.classList.toggle('hidden');
                        if (arrow) {
                            arrow.textContent = isHidden ? '▶' : '▼';
                            arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(90deg)';
                        }
                    }
                });

                logContainer.insertBefore(item, logContainer.firstChild);

                // Limit to last 5 events
                while (logContainer.children.length > 5) {
                    logContainer.lastChild.remove();
                }
            } catch (err) {
                console.error('[PostHog Tracking Error] HUD logging error:', err);
            }
        }

        // Analytics user agent helper functions
        function getBrowserName() {
            const ua = navigator.userAgent;
            if (ua.includes('Firefox')) return 'Firefox';
            if (ua.includes('Chrome')) return 'Chrome';
            if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
            if (ua.includes('Edge')) return 'Edge';
            return 'Unknown';
        }

        // Device helper function
        function getDeviceType() {
            const width = window.innerWidth;
            if (width < 768) return 'Mobile';
            if (width < 1024) return 'Tablet';
            return 'Desktop';
        }
    } catch (globalErr) {
        console.error('[PostHog Tracking Error] Global execution failed:', globalErr);
    }
});