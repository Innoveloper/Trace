// Preloader start execution time tracking
const preloaderStartTime = performance.now();

// Trigger fade-in entry animation for preloader device as soon as script runs
(function triggerPreloaderEntry() {
    const preloaderDevice = document.getElementById('preloader-device');
    if (preloaderDevice) {
        setTimeout(() => {
            preloaderDevice.style.opacity = '1';
        }, 50);
    } else {
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

// Update device status bar time dynamically to match device standards
function updateDeviceTime() {
    const timeElements = document.querySelectorAll('.device-time');
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeStr = `${hours}:${minutes} ${ampm}`;

    timeElements.forEach(el => {
        el.textContent = timeStr;
    });
}
updateDeviceTime();
setInterval(updateDeviceTime, 1000);

// Helper function to animate device screen state changes cleanly
function updatePreloaderScreenState(newTitleText, newIconText, newDescText, isSuccessColor = false) {
    const titleEl = document.getElementById('preloader-device-title');
    const iconEl = document.getElementById('preloader-device-icon');
    const textEl = document.getElementById('preloader-device-text');

    if (iconEl && textEl && titleEl) {
        // Fade out content
        titleEl.style.opacity = '0';
        iconEl.style.opacity = '0';
        iconEl.style.transform = 'scale(0.8)';
        textEl.style.opacity = '0';

        setTimeout(() => {
            // Swap content
            titleEl.textContent = newTitleText;
            iconEl.textContent = newIconText;
            textEl.textContent = newDescText;

            if (isSuccessColor) {
                iconEl.classList.remove('text-primary');
                iconEl.classList.add('text-secondary');
            }

            // Fade in content
            titleEl.style.opacity = '1';
            iconEl.style.opacity = '1';
            iconEl.style.transform = 'scale(1)';
            textEl.style.opacity = '1';
        }, 150);
    }
}

// Schedule the 3-stage visual state transitions (adjusted to checkout-ready states)
setTimeout(() => {
    updatePreloaderScreenState('SECURE', 'credit_card', 'Processing...');
}, 400);

setTimeout(() => {
    updatePreloaderScreenState('READY', 'verified_user', 'Connected.', true);
}, 800);

// Page preloader and fly-in morphing transition handler
let preloaderDismissed = false;

// Schedule dynamic preloader status text transitions
const statusTextTimer1 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Establishing SSL Tunnel...';
    }
}, 400);

const statusTextTimer2 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Validating API Handshake...';
    }
}, 850);

const statusTextTimer3 = setTimeout(() => {
    const statusEl = document.getElementById('preloader-status');
    if (statusEl && !preloaderDismissed) {
        statusEl.textContent = 'Connected.';
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
    // Set to 0.4 seconds minimum display duration
    const remaining = Math.max(0, 400 - elapsed);

    setTimeout(() => {
        if (preloaderDevice && heroDevice && heroDevice.offsetWidth > 0) {
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
        } else if (preloaderDevice) {
            // Fallback for mobile / hidden hero device: slide out and fade out the preloader device cleanly
            preloaderDevice.style.transform = 'translateY(24px) scale(0.95)';
            preloaderDevice.style.opacity = '0';
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

// Google Sheet Apps Script Integration
// Paste your web app deployment URL here: e.g. 'https://script.google.com/macros/s/.../exec'
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPSE8uEneh2NrwKFOh_tIUuypG8jLNRuEPxaAvAsItZh7jvSD9QxbcVUw3F0WOfTXEaw/exec';


// Loops.so Form Endpoint Configuration ID
const LOOPS_FORM_ID = 'cmr2br68g059u0jyri98r5fyc';

// Validation Logic
const submitBtn = document.getElementById('checkout-submit-btn');

if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        validateForm();
    });
}

// Persistent Receipt ID for the session/form completion tracking
let currentReceiptId = null;
let debounceSaveTimeout = null;

function getOrCreateReceiptId() {
    if (!currentReceiptId) {
        currentReceiptId = localStorage.getItem('trace_checkout_receipt_id');
        if (!currentReceiptId) {
            currentReceiptId = '#AE-' + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem('trace_checkout_receipt_id', currentReceiptId);
        }
    }
    return currentReceiptId;
}

function validateForm() {
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const mobile = document.getElementById('mobile');

    let isValid = true;

    // First Name
    if (firstName) {
        if (!firstName.value.trim()) {
            showError(firstName, 'error-first-name');
            isValid = false;
        } else {
            hideError(firstName, 'error-first-name');
        }
    }

    // Last Name
    if (lastName) {
        if (!lastName.value.trim()) {
            showError(lastName, 'error-last-name');
            isValid = false;
        } else {
            hideError(lastName, 'error-last-name');
        }
    }

    // Email
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            showError(email, 'error-email');
            isValid = false;
        } else {
            hideError(email, 'error-email');
        }
    }

    // Mobile
    if (mobile) {
        if (!mobile.value.trim()) {
            showError(mobile, 'error-mobile');
            isValid = false;
        } else {
            hideError(mobile, 'error-mobile');
        }
    }

    const receiptId = getOrCreateReceiptId();

    if (isValid) {
        if (debounceSaveTimeout) {
            clearTimeout(debounceSaveTimeout);
            debounceSaveTimeout = null;
        }
        // 1. Honeypot Spam Bot Trap
        const honeypotVal = document.getElementById('website_url_trap')?.value || '';
        if (honeypotVal) {
            console.warn("Spam bot submission blocked.");
            // Quietly open success modal to confuse the bot without submitting to backend
            openSuccessModal();
            return;
        }

        const receiptEl = document.getElementById('receipt-id');
        if (receiptEl) receiptEl.textContent = receiptId;

        const remarks = document.getElementById('remarks')?.value || '';
        const selectedRadio = document.querySelector('.payment-card input[type="radio"]:checked');
        const paymentMethod = selectedRadio ? selectedRadio.nextElementSibling.textContent.trim() : 'Unknown';
        const country = document.getElementById('checkout-country')?.value || '';

        const formData = {
            firstName: firstName ? firstName.value.trim() : '',
            lastName: lastName ? lastName.value.trim() : '',
            email: email ? email.value.trim() : '',
            mobile: mobile ? mobile.value.trim() : '',
            country: country,
            remarks: remarks,
            paymentMethod: paymentMethod,
            receiptId: receiptId,
            status: 'Completed',
            securityToken: "TracePreorderSecureToken2026"
        };

        // Track checkout submitting event
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture('checkout_funnel', {
                step: 'submitting',
                receipt_id: receiptId,
                payment_method: paymentMethod
            });
        }

        // Disable submit button during request
        const mobileSubmitBtn = document.getElementById('mobile-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            var originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Processing... <span class="material-symbols-outlined text-[20px] animate-spin">sync</span>';
        }
        if (mobileSubmitBtn) {
            mobileSubmitBtn.disabled = true;
            mobileSubmitBtn.innerHTML = 'Processing... <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>';
        }

        const promises = [];

        // 1. Google Sheets App Script submission
        if (GOOGLE_SCRIPT_URL) {
            promises.push(
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
            );
        } else {
            console.log("[Simulation] Saved data to Google Sheet:", formData);
        }

        // 2. Loops.so Contact submission
        promises.push(
            fetch(`https://app.loops.so/api/newsletter-form/${LOOPS_FORM_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    userGroup: 'Pre-order',
                    source: 'Preorder Form'
                })
            })
        );

        if (promises.length > 0) {
            Promise.allSettled(promises)
                .then((results) => {
                    results.forEach((res, i) => {
                        if (res.status === 'rejected') {
                            console.error(`Submission target ${i} failed:`, res.reason);
                        }
                    });
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    if (mobileSubmitBtn) {
                        mobileSubmitBtn.disabled = false;
                        mobileSubmitBtn.innerHTML = 'Pre-order <span class="material-symbols-outlined text-[16px]">arrow_forward</span>';
                    }
                    openSuccessModal();
                });
        } else {
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
                if (mobileSubmitBtn) {
                    mobileSubmitBtn.disabled = false;
                    mobileSubmitBtn.innerHTML = 'Pre-order <span class="material-symbols-outlined text-[16px]">arrow_forward</span>';
                }
                openSuccessModal();
            }, 800);
        }
    } else {
        const firstNameVal = firstName ? firstName.value.trim() : '';
        const lastNameVal = lastName ? lastName.value.trim() : '';
        const emailVal = email ? email.value.trim() : '';
        const mobileVal = mobile ? mobile.value.trim() : '';
        const remarksVal = document.getElementById('remarks')?.value.trim() || '';

        // 1. Capture validation failure in PostHog
        if (window.posthog && typeof window.posthog.capture === 'function') {
            const failedFields = [];
            if (firstName && !firstNameVal) failedFields.push('first_name');
            if (lastName && !lastNameVal) failedFields.push('last_name');
            if (email && !emailVal) failedFields.push('email');
            if (mobile && !mobileVal) failedFields.push('mobile');

            window.posthog.capture('checkout_funnel', {
                step: 'validation_failed',
                receipt_id: receiptId,
                failed_fields: failedFields
            });
        }

        // Scroll to the first error element for mobile view visibility
        const firstError = document.querySelector('.border-error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                firstError.focus();
            }, 300);
        }
    }
}

function showError(inputEl, errorId) {
    inputEl.classList.remove('border-border-subtle', 'focus:border-primary', 'focus:ring-primary');
    inputEl.classList.add('border-error', 'focus:border-error', 'focus:ring-error');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.classList.remove('hidden');
}

function hideError(inputEl, errorId) {
    inputEl.classList.remove('border-error', 'focus:border-error', 'focus:ring-error');
    inputEl.classList.add('border-border-subtle', 'focus:border-primary', 'focus:ring-primary');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.classList.add('hidden');
}

// Success Modal functions
function openSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');

    if (modal && modalContent) {
        modal.classList.remove('hidden');
        modal.offsetHeight;

        modal.classList.add('opacity-100');
        modal.classList.remove('opacity-0');
        modalContent.classList.add('scale-100');
        modalContent.classList.remove('scale-95');

        // Track checkout success funnel completion
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture('checkout_funnel', { step: 'completed' });
        }

        // Track Facebook Pixel Purchase event and custom conversion events
        if (typeof fbq === 'function') {
            // Standard Purchase event (highly recommended for Meta Ads optimization)
            fbq('track', 'Purchase', {
                value: 2499.00,
                currency: 'INR'
            });
            // Custom events matching user configurations
            fbq('trackCustom', 'Order Completed');
            fbq('trackCustom', 'Pre-Order');
        }

        // Clear current receipt ID after successful preorder to allow subsequent submissions to get a fresh ID
        currentReceiptId = null;
        localStorage.removeItem('trace_checkout_receipt_id');
        localStorage.removeItem('trace_checkout_pending_data');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    const modalContent = document.getElementById('success-modal-content');

    if (modal && modalContent) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');

        setTimeout(() => {
            modal.classList.add('hidden');
            window.location.href = 'index.html';
        }, 300);
    }
}

const countriesList = [
    { code: "AF", name: "Afghanistan" },
    { code: "AX", name: "Åland Islands" },
    { code: "AL", name: "Albania" },
    { code: "DZ", name: "Algeria" },
    { code: "AS", name: "American Samoa" },
    { code: "AD", name: "Andorra" },
    { code: "AO", name: "Angola" },
    { code: "AI", name: "Anguilla" },
    { code: "AQ", name: "Antarctica" },
    { code: "AG", name: "Antigua and Barbuda" },
    { code: "AR", name: "Argentina" },
    { code: "AM", name: "Armenia" },
    { code: "AW", name: "Aruba" },
    { code: "AU", name: "Australia" },
    { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "BS", name: "Bahamas" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BB", name: "Barbados" },
    { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BJ", name: "Benin" },
    { code: "BM", name: "Bermuda" },
    { code: "BT", name: "Bhutan" },
    { code: "BO", name: "Bolivia" },
    { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BW", name: "Botswana" },
    { code: "BV", name: "Bouvet Island" },
    { code: "BR", name: "Brazil" },
    { code: "IO", name: "British Indian Ocean Territory" },
    { code: "BN", name: "Brunei Darussalam" },
    { code: "BG", name: "Bulgaria" },
    { code: "BF", name: "Burkina Faso" },
    { code: "BI", name: "Burundi" },
    { code: "CV", name: "Cabo Verde" },
    { code: "KH", name: "Cambodia" },
    { code: "CM", name: "Cameroon" },
    { code: "CA", name: "Canada" },
    { code: "KY", name: "Cayman Islands" },
    { code: "CF", name: "Central African Republic" },
    { code: "TD", name: "Chad" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CX", name: "Christmas Island" },
    { code: "CC", name: "Cocos (Keeling) Islands" },
    { code: "CO", name: "Colombia" },
    { code: "KM", name: "Comoros" },
    { code: "CD", name: "Congo (Democratic Republic)" },
    { code: "CG", name: "Congo (Republic)" },
    { code: "CK", name: "Cook Islands" },
    { code: "CR", name: "Costa Rica" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "HR", name: "Croatia" },
    { code: "CU", name: "Cuba" },
    { code: "CW", name: "Curaçao" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czechia" },
    { code: "DK", name: "Denmark" },
    { code: "DJ", name: "Djibouti" },
    { code: "DM", name: "Dominica" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "GQ", name: "Equatorial Guinea" },
    { code: "ER", name: "Eritrea" },
    { code: "EE", name: "Estonia" },
    { code: "SZ", name: "Eswatini" },
    { code: "ET", name: "Ethiopia" },
    { code: "FK", name: "Falkland Islands" },
    { code: "FO", name: "Faroe Islands" },
    { code: "FJ", name: "Fiji" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GF", name: "French Guiana" },
    { code: "PF", name: "French Polynesia" },
    { code: "TF", name: "French Southern Territories" },
    { code: "GA", name: "Gabon" },
    { code: "GM", name: "Gambia" },
    { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" },
    { code: "GH", name: "Ghana" },
    { code: "GI", name: "Gibraltar" },
    { code: "GR", name: "Greece" },
    { code: "GL", name: "Greenland" },
    { code: "GD", name: "Grenada" },
    { code: "GP", name: "Guadeloupe" },
    { code: "GU", name: "Guam" },
    { code: "GT", name: "Guatemala" },
    { code: "GG", name: "Guernsey" },
    { code: "GN", name: "Guinea" },
    { code: "GW", name: "Guinea-Bissau" },
    { code: "GY", name: "Guyana" },
    { code: "HT", name: "Haiti" },
    { code: "HM", name: "Heard Island and McDonald Islands" },
    { code: "VA", name: "Holy See" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IR", name: "Iran" },
    { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" },
    { code: "IM", name: "Isle of Man" },
    { code: "IL", name: "Israel" },
    { code: "IT", name: "Italy" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "JE", name: "Jersey" },
    { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KE", name: "Kenya" },
    { code: "KI", name: "Kiribati" },
    { code: "KP", name: "Korea (Democratic People's Republic)" },
    { code: "KR", name: "Korea (Republic)" },
    { code: "KW", name: "Kuwait" },
    { code: "KG", name: "Kyrgyzstan" },
    { code: "LA", name: "Lao People's Democratic Republic" },
    { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" },
    { code: "LS", name: "Lesotho" },
    { code: "LR", name: "Liberia" },
    { code: "LY", name: "Libya" },
    { code: "LI", name: "Liechtenstein" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MO", name: "Macao" },
    { code: "MG", name: "Madagascar" },
    { code: "MW", name: "Malawi" },
    { code: "MY", name: "Malaysia" },
    { code: "MV", name: "Maldives" },
    { code: "ML", name: "Mali" },
    { code: "MT", name: "Malta" },
    { code: "MH", name: "Marshall Islands" },
    { code: "MQ", name: "Martinique" },
    { code: "MR", name: "Mauritania" },
    { code: "MU", name: "Mauritius" },
    { code: "YT", name: "Mayotte" },
    { code: "MX", name: "Mexico" },
    { code: "FM", name: "Micronesia" },
    { code: "MD", name: "Moldova" },
    { code: "MC", name: "Monaco" },
    { code: "MN", name: "Mongolia" },
    { code: "ME", name: "Montenegro" },
    { code: "MS", name: "Montserrat" },
    { code: "MA", name: "Morocco" },
    { code: "MZ", name: "Mozambique" },
    { code: "MM", name: "Myanmar" },
    { code: "NA", name: "Namibia" },
    { code: "NR", name: "Nauru" },
    { code: "NP", name: "Nepal" },
    { code: "NL", name: "Netherlands" },
    { code: "NC", name: "New Caledonia" },
    { code: "NZ", name: "New Zealand" },
    { code: "NI", name: "Nicaragua" },
    { code: "NE", name: "Niger" },
    { code: "NG", name: "Nigeria" },
    { code: "NU", name: "Niue" },
    { code: "NF", name: "Norfolk Island" },
    { code: "MK", name: "North Macedonia" },
    { code: "MP", name: "Northern Mariana Islands" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PW", name: "Palau" },
    { code: "PS", name: "Palestine" },
    { code: "PA", name: "Panama" },
    { code: "PG", name: "Papua New Guinea" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PN", name: "Pitcairn" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "PR", name: "Puerto Rico" },
    { code: "QA", name: "Qatar" },
    { code: "RE", name: "Réunion" },
    { code: "RO", name: "Romania" },
    { code: "RU", name: "Russian Federation" },
    { code: "RW", name: "Rwanda" },
    { code: "BL", name: "Saint Barthélemy" },
    { code: "SH", name: "Saint Helena" },
    { code: "KN", name: "Saint Kitts and Nevis" },
    { code: "LC", name: "Saint Lucia" },
    { code: "MF", name: "Saint Martin" },
    { code: "PM", name: "Saint Pierre and Miquelon" },
    { code: "VC", name: "Saint Vincent and the Grenadines" },
    { code: "WS", name: "Samoa" },
    { code: "SM", name: "San Marino" },
    { code: "ST", name: "Sao Tome and Principe" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "SN", name: "Senegal" },
    { code: "RS", name: "Serbia" },
    { code: "SC", name: "Seychelles" },
    { code: "SL", name: "Sierra Leone" },
    { code: "SG", name: "Singapore" },
    { code: "SX", name: "Sint Maarten" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "SB", name: "Solomon Islands" },
    { code: "SO", name: "Somalia" },
    { code: "ZA", name: "South Africa" },
    { code: "GS", name: "South Georgia and the South Sandwich Islands" },
    { code: "SS", name: "South Sudan" },
    { code: "ES", name: "Spain" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SD", name: "Sudan" },
    { code: "SR", name: "Suriname" },
    { code: "SJ", name: "Svalbard and Jan Mayen" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "SY", name: "Syrian Arab Republic" },
    { code: "TW", name: "Taiwan" },
    { code: "TJ", name: "Tajikistan" },
    { code: "TZ", name: "Tanzania" },
    { code: "TH", name: "Thailand" },
    { code: "TL", name: "Timor-Leste" },
    { code: "TG", name: "Togo" },
    { code: "TK", name: "Tokelau" },
    { code: "TO", name: "Tonga" },
    { code: "TT", name: "Trinidad and Tobago" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "TM", name: "Turkmenistan" },
    { code: "TC", name: "Turks and Caicos Islands" },
    { code: "TV", name: "Tuvalu" },
    { code: "UG", name: "Uganda" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "UM", name: "United States Minor Outlying Islands" },
    { code: "US", name: "United States" },
    { code: "UY", name: "Uruguay" },
    { code: "UZ", name: "Uzbekistan" },
    { code: "VU", name: "Vanuatu" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Viet Nam" },
    { code: "VG", name: "Virgin Islands (British)" },
    { code: "VI", name: "Virgin Islands (U.S.)" },
    { code: "WF", name: "Wallis and Futuna" },
    { code: "EH", name: "Western Sahara" },
    { code: "YE", name: "Yemen" },
    { code: "ZM", name: "Zambia" },
    { code: "ZW", name: "Zimbabwe" }
];

async function detectUserLocation(selectElement) {
    if (localStorage.getItem('trace_checkout_pending_data')) {
        const savedData = JSON.parse(localStorage.getItem('trace_checkout_pending_data'));
        if (savedData && savedData.country) {
            selectElement.value = savedData.country;
            const selectedText = document.getElementById('selected-country-text');
            if (selectedText) selectedText.textContent = savedData.country;
            if (typeof renderOptions === 'function') renderOptions();
            return;
        }
    }
    let detectedCountry = 'United States';
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
            if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Kolkata') || tz.includes('Asia/Calcutta')) {
                detectedCountry = 'India';
            } else if (tz.includes('London') || tz.includes('Europe/London')) {
                detectedCountry = 'United Kingdom';
            } else if (tz.includes('Canada') || tz.includes('Toronto') || tz.includes('Vancouver')) {
                detectedCountry = 'Canada';
            } else if (tz.includes('Australia') || tz.includes('Sydney') || tz.includes('Melbourne')) {
                detectedCountry = 'Australia';
            } else if (tz.includes('Singapore')) {
                detectedCountry = 'Singapore';
            } else if (tz.includes('Europe')) {
                if (tz.includes('Paris')) detectedCountry = 'France';
                else if (tz.includes('Berlin')) detectedCountry = 'Germany';
                else if (tz.includes('Rome')) detectedCountry = 'Italy';
                else if (tz.includes('Madrid')) detectedCountry = 'Spain';
            }
        }
    } catch (e) {
        console.error("Timezone detection failed", e);
    }
    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            const data = await res.json();
            if (data && data.country_name) {
                detectedCountry = data.country_name;
            }
        }
    } catch (e) {
        console.log("IP geolocation failed, using timezone/default.");
    }
    selectElement.value = detectedCountry;
    const selectedText = document.getElementById('selected-country-text');
    if (selectedText) selectedText.textContent = detectedCountry;
    if (typeof renderOptions === 'function') renderOptions();

    // Track the auto-detected country selection
    if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture('checkout_country_selected', {
            country: detectedCountry,
            detection_type: 'auto'
        });
    }
}

// Event Tracking Hookups
document.addEventListener('DOMContentLoaded', () => {
    // Populate custom country dropdown and auto-detect
    const dropdownTrigger = document.getElementById('country-dropdown-trigger');
    const dropdownPopover = document.getElementById('country-dropdown-popover');
    const dropdownChevron = document.getElementById('dropdown-chevron');
    const selectedCountryText = document.getElementById('selected-country-text');
    const hiddenCountryInput = document.getElementById('checkout-country');
    const searchInput = document.getElementById('country-search');
    const optionsContainer = document.getElementById('country-options-container');

    let dropdownTimeout = null;
    function toggleDropdown(show) {
        if (dropdownTimeout) {
            clearTimeout(dropdownTimeout);
            dropdownTimeout = null;
        }
        if (show) {
            if (dropdownPopover) {
                dropdownPopover.classList.remove('hidden');
                dropdownPopover.offsetHeight; // force layout reflow
                dropdownPopover.classList.remove('opacity-0', 'scale-95');
                dropdownPopover.classList.add('opacity-100', 'scale-100');
                if (dropdownChevron) dropdownChevron.style.transform = 'rotate(180deg)';
            }
            if (searchInput) searchInput.focus();
        } else {
            if (dropdownPopover) {
                dropdownPopover.classList.remove('opacity-100', 'scale-100');
                dropdownPopover.classList.add('opacity-0', 'scale-95');
                if (dropdownChevron) dropdownChevron.style.transform = 'rotate(0deg)';
                dropdownTimeout = setTimeout(() => {
                    dropdownPopover.classList.add('hidden');
                    dropdownTimeout = null;
                }, 200);
            }
        }
    }

    if (dropdownTrigger) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (dropdownPopover) {
                const isOpen = dropdownPopover.classList.contains('opacity-100');
                toggleDropdown(!isOpen);
            }
        });
    }

    document.addEventListener('click', (e) => {
        const customDropdown = document.getElementById('custom-country-dropdown');
        if (customDropdown && !customDropdown.contains(e.target)) {
            toggleDropdown(false);
        }
    });

    window.renderOptions = function (filterText = '') {
        if (!optionsContainer) return;
        optionsContainer.innerHTML = '';
        const filtered = countriesList.filter(c =>
            c.name.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = 'px-4 py-2.5 text-xs text-text-muted';
            noResult.textContent = 'No countries found';
            optionsContainer.appendChild(noResult);
            return;
        }

        filtered.forEach(c => {
            const opt = document.createElement('button');
            opt.type = 'button';
            opt.className = 'w-full text-left px-4 py-2.5 hover:bg-surface transition-colors text-sm font-body-md text-primary flex items-center justify-between';
            opt.innerHTML = `<span>${c.name}</span>`;

            if (hiddenCountryInput && hiddenCountryInput.value === c.name) {
                opt.classList.add('bg-surface', 'text-secondary');
                opt.innerHTML += `<span class="material-symbols-outlined text-[16px] text-secondary">check</span>`;
            }

            opt.addEventListener('click', () => {
                if (selectedCountryText) selectedCountryText.textContent = c.name;
                if (hiddenCountryInput) hiddenCountryInput.value = c.name;
                toggleDropdown(false);
                if (window.posthog && typeof window.posthog.capture === 'function') {
                    window.posthog.capture('checkout_country_selected', {
                        country: c.name,
                        detection_type: 'manual'
                    });
                }
                queueRealtimeSave();
            });
            optionsContainer.appendChild(opt);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderOptions(e.target.value);
        });
    }

    if (hiddenCountryInput) {
        renderOptions();
        detectUserLocation(hiddenCountryInput);
    }

    if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture('checkout_funnel', { step: 'started' });
    }

    // Track first input focus
    let hasFocusedForm = false;
    document.querySelectorAll('.checkout-input').forEach(input => {
        input.addEventListener('focus', () => {
            if (!hasFocusedForm) {
                hasFocusedForm = true;
                if (window.posthog && typeof window.posthog.capture === 'function') {
                    window.posthog.capture('checkout_funnel', { step: 'form_focused' });
                }
            }
        });
    });

    // Track payment selection changes
    document.querySelectorAll('.payment-card input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                const paymentVal = e.target.nextElementSibling.textContent.trim();
                if (window.posthog && typeof window.posthog.capture === 'function') {
                    window.posthog.capture('payment_preference_selected', { payment_method: paymentVal });
                }
                queueRealtimeSave();
            }
        });
    });

    // Real-time auto-saving on user input
    document.querySelectorAll('.checkout-input').forEach(input => {
        input.addEventListener('input', queueRealtimeSave);
    });

    function queueRealtimeSave() {
        if (debounceSaveTimeout) {
            clearTimeout(debounceSaveTimeout);
        }
        debounceSaveTimeout = setTimeout(executeRealtimeSave, 1000);
    }

    function executeRealtimeSave() {
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const mobile = document.getElementById('mobile');
        const remarks = document.getElementById('remarks');
        const country = document.getElementById('checkout-country');

        const firstNameVal = firstName ? firstName.value.trim() : '';
        const lastNameVal = lastName ? lastName.value.trim() : '';
        const emailVal = email ? email.value.trim() : '';
        const mobileVal = mobile ? mobile.value.trim() : '';
        const remarksVal = remarks ? remarks.value.trim() : '';
        const countryVal = country ? country.value : '';

        // If all fields are empty, do not save
        if (!firstNameVal && !lastNameVal && !emailVal && !mobileVal && !remarksVal) {
            return;
        }

        const selectedRadio = document.querySelector('.payment-card input[type="radio"]:checked');
        const paymentMethod = selectedRadio ? selectedRadio.nextElementSibling.textContent.trim() : 'Unknown';
        const receiptId = getOrCreateReceiptId();

        const payload = {
            firstName: firstNameVal,
            lastName: lastNameVal,
            email: emailVal,
            mobile: mobileVal,
            country: countryVal,
            remarks: remarksVal,
            paymentMethod: paymentMethod,
            receiptId: receiptId,
            status: 'Pending',
            securityToken: "TracePreorderSecureToken2026"
        };

        // Cache local copy of the filled details
        localStorage.setItem('trace_checkout_pending_data', JSON.stringify({
            firstName: firstNameVal,
            lastName: lastNameVal,
            email: emailVal,
            mobile: mobileVal,
            country: countryVal,
            remarks: remarksVal,
            paymentMethod: paymentMethod
        }));

        if (GOOGLE_SCRIPT_URL) {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }).catch(err => console.error("Real-time auto-save failed:", err));
        } else {
            console.log("[Simulation] Auto-saved data to Google Sheet:", payload);
        }
    }

    function prefillFormData() {
        const savedDataStr = localStorage.getItem('trace_checkout_pending_data');
        if (!savedDataStr) return;

        try {
            const savedData = JSON.parse(savedDataStr);
            if (!savedData) return;

            const firstName = document.getElementById('first-name');
            const lastName = document.getElementById('last-name');
            const email = document.getElementById('email');
            const mobile = document.getElementById('mobile');
            const remarks = document.getElementById('remarks');
            const country = document.getElementById('checkout-country');
            const selectedCountryText = document.getElementById('selected-country-text');

            if (firstName && savedData.firstName) firstName.value = savedData.firstName;
            if (lastName && savedData.lastName) lastName.value = savedData.lastName;
            if (email && savedData.email) email.value = savedData.email;
            if (mobile && savedData.mobile) mobile.value = savedData.mobile;
            if (remarks && savedData.remarks) remarks.value = savedData.remarks;
            if (country && savedData.country) {
                country.value = savedData.country;
                if (selectedCountryText) selectedCountryText.textContent = savedData.country;
            }

            // Prefill payment preference if saved
            if (savedData.paymentMethod) {
                document.querySelectorAll('.payment-card input[type="radio"]').forEach(radio => {
                    const text = radio.nextElementSibling.textContent.trim();
                    if (text.toLowerCase() === savedData.paymentMethod.toLowerCase()) {
                        radio.checked = true;
                    }
                });
            }

            console.log("Prefilled form data from localStorage:", savedData);
        } catch (e) {
            console.error("Failed to parse prefill data from localStorage:", e);
        }
    }

    // Prefill form inputs if cached data exists in localStorage
    prefillFormData();

    // Mobile sticky bottom bar click binding
    const mobileSubmitBtn = document.getElementById('mobile-submit-btn');
    if (mobileSubmitBtn && submitBtn) {
        mobileSubmitBtn.addEventListener('click', () => {
            submitBtn.click();
        });
    }

    // IntersectionObserver to show/hide mobile sticky bar
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const mainSubmitBtn = document.getElementById('checkout-submit-btn');
    if (mobileStickyBar && mainSubmitBtn) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mobileStickyBar.classList.add('translate-y-full', 'opacity-0');
                    mobileStickyBar.classList.remove('translate-y-0', 'opacity-100');
                } else {
                    mobileStickyBar.classList.remove('translate-y-full', 'opacity-0');
                    mobileStickyBar.classList.add('translate-y-0', 'opacity-100');
                }
            });
        }, {
            threshold: 0.05
        });
        observer.observe(mainSubmitBtn);
    }
});
