// 0. Initialize AuthManager (Must be first)
if (typeof AuthManager !== 'undefined') {
    AuthManager.init();
} else {
    console.warn('AuthManager not found. RBAC features disabled.');
}

// 0.1 Sound Manager (Audio Experience)
var SoundManager = {
    audioEnabled: false,
    sounds: {},

    init() {
        // Preload sounds
        this.sounds['welcome'] = new Audio('backgroundsound/welcome.mp3');
        this.sounds['click'] = new Audio('backgroundsound/btn-click.mp3');

        // Adjust volumes
        this.sounds['welcome'].volume = 0.5;
        this.sounds['click'].volume = 0.3;

        // Check LocalStorage (Permanent Persistence)
        const savedPref = localStorage.getItem('sound_preference');

        if (!savedPref) {
            // No preference -> Show Modal (First time ever)
            this.showModal();
        } else {
            // Apply saved preference silently
            this.setPreference(savedPref, true);
        }

        // Keyboard Shortcuts (Y = Yes, N = No)
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('sound-modal');
            // Only react if modal is visible
            if (modal && modal.style.display !== 'none') {
                if (e.key.toLowerCase() === 'y') {
                    this.setPreference('yes');
                } else if (e.key.toLowerCase() === 'n') {
                    this.setPreference('no');
                }
            }
        });
    },

    showModal() {
        const modal = document.getElementById('sound-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Block scroll
        }
    },

    setPreference(choice, silent = false) {
        // Save preference to localStorage (Permanent)
        localStorage.setItem('sound_preference', choice);

        // Hide Modal
        const modal = document.getElementById('sound-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        // Logic
        if (choice === 'yes') {
            this.audioEnabled = true;
            this.setupListeners();
            // Play welcome sound only if explicit user CHOICE (not silent load)
            if (!silent) {
                this.playSound('welcome');
            }
        } else {
            this.audioEnabled = false;
        }

        // Update Toggle UI
        this.updateToggleUI();

        // START HERO ANIMATION triggers after choice is made (Yes OR No)
        // If silent (page load), we still want animation to start immediately.
        startHeroAnimation();
    },

    toggleSound() {
        const newChoice = this.audioEnabled ? 'no' : 'yes';
        // If turning ON manually, play a sound to confirm
        if (newChoice === 'yes') {
            this.audioEnabled = true; // Pre-enable to allow playing
            this.playSound('click');
        }
        this.setPreference(newChoice, true); // Silent = true prevents welcome spam, but we played click above
    },

    updateToggleUI() {
        const btn = document.getElementById('sound-toggle');
        if (btn) {
            btn.textContent = this.audioEnabled ? 'Sound: On' : 'Sound: Off';
            btn.style.opacity = this.audioEnabled ? '1' : '0.6';
        }
    },

    setupListeners() {
        // Global Click
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'A' || e.target.closest('a')) {
                this.playSound('click');
            }
        });

        // Hover Sounds for Interactive Elements
        const interactiveSelector = 'a, button, .work-item, .nav-link, .tool-tag';
        document.querySelectorAll(interactiveSelector).forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    },

    playSound(name) {
        if (!this.audioEnabled || !this.sounds[name]) return;

        if (name === 'click' || name === 'hover') {
            const clone = this.sounds[name].cloneNode();
            clone.volume = this.sounds[name].volume;
            clone.play().catch(err => console.log('Audio play blocked', err));
        } else {
            this.sounds[name].play().catch(err => console.log('Audio play blocked', err));
        }
    }
};

// Initialize Sound Manager immediately
document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();

    // Keyboard Shortcuts (Y = Yes, N = No) captured at document level for reliability
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('sound-modal');
        // Check computed style for visibility to be safe
        const isVisible = modal && (modal.style.display === 'flex' || getComputedStyle(modal).display !== 'none');

        if (isVisible) {
            if (e.key.toLowerCase() === 'y') {
                SoundManager.setPreference('yes');
            } else if (e.key.toLowerCase() === 'n') {
                SoundManager.setPreference('no');
            }
        }
    });
});


// 1. Initialize Lenis (Smooth Scroll)
// Wrap in try-catch to prevent script crash if CDN fails
try {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            mouseMultiplier: 1,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        console.warn("Lenis not loaded - Smooth scroll disabled");
    }
} catch (e) {
    console.error("Lenis Init Failed:", e);
}

// 2. Custom Cursor Logic (Safe)
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');

if (cursorDot && cursorCircle) {
    // Quick setter for better performance
    const setCursorX = typeof gsap !== 'undefined' ? gsap.quickSetter(cursorDot, "x", "px") : (v) => cursorDot.style.left = v + "px"; // Fallback
    const setCursorY = typeof gsap !== 'undefined' ? gsap.quickSetter(cursorDot, "y", "px") : (v) => cursorDot.style.top = v + "px";

    document.addEventListener('mousemove', (e) => {
        if (typeof gsap !== 'undefined') {
            setCursorX(e.clientX);
            setCursorY(e.clientY);
            gsap.to(cursorCircle, { x: e.clientX, y: e.clientY, duration: 0.15, ease: "power2.out" });
        } else {
            // Simple fallback
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            cursorCircle.style.left = e.clientX + 'px';
            cursorCircle.style.top = e.clientY + 'px';
        }
    });

    // Magnetic & Hover Interaction
    const hoverTriggers = document.querySelectorAll('.hover-trigger');
    hoverTriggers.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorCircle.classList.add('cursor-hover');
            if (typeof gsap !== 'undefined') gsap.to(cursorCircle, { scale: 2, duration: 0.3 });
        });
        link.addEventListener('mouseleave', () => {
            cursorCircle.classList.remove('cursor-hover');
            if (typeof gsap !== 'undefined') gsap.to(cursorCircle, { scale: 1, duration: 0.3 });
        });
    });
}

// 3. Reveal Sequence (Triggered by SoundManager)
function startHeroAnimation() {
    // Reveal Sequence
    if (typeof gsap !== 'undefined') {
        // Ensure visibility first (GSAP set matches CSS opacity 0)
        gsap.set('.hero-title, .hero-subtitle', { opacity: 1 });

        const tl = gsap.timeline();

        tl.from('.hero-title .word', {
            y: '140%',
            duration: 1.5,
            stagger: 0.1,
            ease: 'power4.out',
            skewY: 7,
            delay: 0.2
        })
            .to('.hero-title .word', {
                skewY: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=1")
            .from('.hero-subtitle', {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power2.out'
            }, "-=1");
    }
}
// Note: startHeroAnimation is now called inside SoundManager.setPreference
// Removed checking for DOMContentLoaded for hero animation as it is now gated.

// 4. "300IQ" Logic - Liquid Skew & Parallax
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    let proxy = { skew: 0 };
    let skewSetter = gsap.quickSetter(".work-item", "skewY", "deg");
    let clamp = gsap.utils.clamp(-15, 15);

    // Parallax for Background Marquee
    gsap.to(".marquee-text", {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: "#about",
            scrub: 1,
            start: "top bottom",
            end: "bottom top"
        }
    });

    // Velocity Skew
    ScrollTrigger.create({
        onUpdate: (self) => {
            let skew = clamp(self.getVelocity() / -400); // More damping
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, {
                    skew: 0,
                    duration: 1,
                    ease: "power3.out",
                    overwrite: true,
                    onUpdate: () => skewSetter(proxy.skew)
                });
            }
        }
    });

    // About Section Animations
    ScrollTrigger.create({
        trigger: ".about-section",
        start: "top 75%",
        onEnter: () => {
            gsap.from(".about-image", {
                scale: 1.3,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out"
            });

            gsap.from(".about-content > *", {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.2
            });
        }
    });

    // 4b. Profile Image Flashlight Effect & Mobile Scroll
    const aboutWrapper = document.querySelector('.about-image-wrapper');
    const colorImage = document.querySelector('.about-image-color');

    if (aboutWrapper && colorImage) {

        let currentRadius = 0;
        let targetRadius = 0;
        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;

        // Animate the brush size smoothly
        function animateBrush() {
            // Linear interpolation (lerp) for smooth size change
            currentRadius += (targetRadius - currentRadius) * 0.1;

            if (isHovering && Math.abs(targetRadius - currentRadius) > 0.5) {
                const maskStyle = `radial-gradient(circle ${currentRadius}px at ${mouseX}px ${mouseY}px, black 30%, transparent 100%)`;
                colorImage.style.webkitMaskImage = maskStyle;
                colorImage.style.maskImage = maskStyle;
                requestAnimationFrame(animateBrush);
            } else if (!isHovering && Math.abs(currentRadius) > 0.5) {
                // Shrinking out
                const maskStyle = `radial-gradient(circle ${currentRadius}px at ${mouseX}px ${mouseY}px, black 30%, transparent 100%)`;
                colorImage.style.webkitMaskImage = maskStyle;
                colorImage.style.maskImage = maskStyle;
                requestAnimationFrame(animateBrush);
            } else if (!isHovering) {
                // Fully hidden
                colorImage.style.webkitMaskImage = `none`;
                colorImage.style.maskImage = `none`;
            }
        }

        aboutWrapper.addEventListener('mouseenter', (e) => {
            isHovering = true;
            targetRadius = 250; // Bigger Brush Size
            const rect = aboutWrapper.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            animateBrush();
        });

        aboutWrapper.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            const rect = aboutWrapper.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            // Immediate update for position, size handled by animateBrush loop for smoothness
            const maskStyle = `radial-gradient(circle ${currentRadius}px at ${mouseX}px ${mouseY}px, black 30%, transparent 100%)`;
            colorImage.style.webkitMaskImage = maskStyle;
            colorImage.style.maskImage = maskStyle;
        });

        aboutWrapper.addEventListener('mouseleave', () => {
            isHovering = false;
            targetRadius = 0; // Shrink to 0
            animateBrush();
        });

        // Mobile Scroll Logic
        ScrollTrigger.matchMedia({
            "(hover: none), (max-width: 1024px)": function () {
                ScrollTrigger.create({
                    trigger: ".about-image-wrapper",
                    start: "top 60%",
                    end: "bottom 40%",
                    toggleClass: { targets: ".about-image-color", className: "color-visible" },
                    toggleActions: "play reverse play reverse"
                });
            }
        });
    }
}

// 5. Inquiry Focus Mode
const inputs = document.querySelectorAll('.form-input, .form-textarea');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to('body', { backgroundColor: '#020202', duration: 0.5 });
            gsap.to('.hero-wrapper, .work-section, #about', { opacity: 0.1, duration: 0.5 });
        } else {
            document.body.style.backgroundColor = '#020202';
        }
    });

    input.addEventListener('blur', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to('body', { backgroundColor: '#050505', duration: 0.5 });
            gsap.to('.hero-wrapper, .work-section, #about', { opacity: 1, duration: 0.5 });
        } else {
            document.body.style.backgroundColor = '#050505';
        }
    });
});

// 6a. User Badge Logic
// 6a. User Badge Logic
function updateUserBadge() {
    const badge = document.getElementById('user-badge');
    if (!badge || typeof AuthManager === 'undefined') return;

    const user = AuthManager.getCurrentUser();
    if (user && user.name) {
        // Use full name from config (e.g. "Dhruv (Owner)")
        badge.textContent = user.name;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
        badge.textContent = ''; // Clear text
    }
}

// Ensure it runs on load and after login actions
document.addEventListener('DOMContentLoaded', updateUserBadge);

// 6. Send Email Logic
function sendEmail(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const question = document.getElementById('question').value || "General Inquiry";
    const note = document.getElementById('note').value || "";

    const subject = `Portfolio Inquiry: ${name}`;
    const body = `Name: ${name}%0D%0AContact: ${contact}%0D%0A%0D%0AQuestion:%0D%0A${question}%0D%0A%0D%0ANote:%0D%0A${note}`;

    window.location.href = `mailto:drvpcl24@gmail.com?subject=${subject}&body=${body}`;
}

// 7. Password & Auth Logic (Refactored)
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('cv-password');
const loginModal = document.getElementById('login-modal');
const dashboard = document.getElementById('admin-dashboard');
const cvUrl = "Dhruv_Panchal_UIUX_Designer_compressed.pdf";

let pendingAction = null; // 'CV' or 'REDIRECT'
let pendingUrl = '';

// --- Navigation Handlers ---

function handleProjectClick(url) {
    if (AuthManager.canAccess(url)) {
        window.location.href = url;
    } else {
        pendingAction = 'REDIRECT';
        pendingUrl = url;
        openPasswordModal();
    }
}

function handleCVClick(event) {
    if (event) event.preventDefault();
    if (AuthManager.canAccess('cv')) {
        downloadCV();
    } else {
        pendingAction = 'CV';
        openPasswordModal();
    }
}

// --- Modal Controls ---

function openPasswordModal(event) {
    if (event) event.preventDefault();
    if (passwordModal && passwordInput) {
        passwordModal.classList.add('active');
        setTimeout(() => passwordInput.focus(), 100);
    }
}

function closePasswordModal() {
    if (passwordModal) passwordModal.classList.remove('active');
    if (passwordInput) passwordInput.value = '';
    pendingAction = null;
    pendingUrl = '';
}

// --- Modal Functions ---

function openLoginModal(event) {
    if (event) event.preventDefault();

    // Check if already logged in
    const user = AuthManager.getCurrentUser();

    if (user && loginModal) {
        // Show "Already Logged In" State
        const content = loginModal.querySelector('.modal-content');

        // Simple Dynamic Switch
        content.innerHTML = `
            <h3 class="modal-title">Account Status</h3>
            <p class="modal-desc" style="margin-bottom: 2rem;">You are currently logged in as:<br><strong style="color: var(--color-accent);">${user.email}</strong></p>
            
            <div class="modal-actions" style="flex-direction: column; gap: 1rem;">
                <button onclick="handleLogout()" class="submit-btn hover-trigger" style="width: 100%; background: #333;">Logout</button>
                ${user.role === 'ADMIN' ? '<button onclick="openAdminDashboard(); closeLoginModal();" class="submit-btn hover-trigger" style="width: 100%;">Open Dashboard</button>' : ''}
                <button onclick="closeLoginModal(); window.location.reload();" class="cv-link hover-trigger" style="border: none; background: none; font-size: 0.8rem;">Cancel</button>
            </div>
        `;

        loginModal.classList.add('active');

    } else if (loginModal) {
        const content = loginModal.querySelector('.modal-content');
        // Restore Default Login Form
        content.innerHTML = `
            <h3 class="modal-title">Sign In</h3>
            <p class="modal-desc">Enter your credentials to access the portfolio manager.</p>

            <div class="form-group">
                <input type="email" id="login-email" class="form-input hover-trigger" placeholder=" " autocomplete="off">
                <label for="login-email" class="form-label">Email Address</label>
            </div>
            
            <div class="form-group" style="margin-bottom: 2rem;">
                <input type="password" id="login-pass" class="form-input hover-trigger" placeholder=" " autocomplete="off">
                <label for="login-pass" class="form-label">Password</label>
            </div>

            <div class="modal-actions">
                <button onclick="handleLogin()" class="submit-btn hover-trigger" style="width: 100%;">Login</button>
                <button onclick="closeLoginModal()" class="cv-link hover-trigger"
                    style="border: none; background: none; font-size: 0.8rem; margin-top: 1rem;">Cancel</button>
            </div>
        `;

        loginModal.classList.add('active');
        // setTimeout(() => document.getElementById('login-email').focus(), 100);
    }
}

function handleLogout() {
    AuthManager.logout();
    closeLoginModal();
}

function closeLoginModal() {
    if (loginModal) loginModal.classList.remove('active');
}

// --- Auth Actions ---

function checkPassword() {
    if (!passwordInput) return;
    const inputPass = passwordInput.value;

    // Verify against Common Password (for Guest Access)
    // OR if User is VIP/Admin (though they shouldn't see this modal ideally)
    if (AuthManager.verifyCommonPassword(inputPass)) {
        localStorage.setItem('portfolio_auth', 'true');
        closePasswordModal();
        executePendingAction();
    } else {
        alert("Incorrect password.");
        passwordInput.value = '';
    }
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    const result = AuthManager.login(email, pass);

    if (result.success) {
        closeLoginModal();
        updateUserBadge(); // Update UI immediately
        if (result.role === 'ADMIN') {
            openAdminDashboard();
        } else {
            // VIP just gets access
            alert(`Welcome back, ${email}! You now have full access.`);
            window.location.reload(); // Refresh to update UI/State
        }
    } else {
        alert(result.message);
    }
}

function executePendingAction() {
    if (pendingAction === 'REDIRECT' && pendingUrl) {
        window.location.href = pendingUrl;
    } else if (pendingAction === 'CV') {
        downloadCV();
    }
}

function downloadCV() {
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'Dhruv_Panchal_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- Admin Dashboard Logic ---

function openAdminDashboard() {
    if (!AuthManager.isAdmin()) return;
    dashboard.style.display = 'block';
    renderProjectList();

    // Pre-fill inputs (optional)
    document.getElementById('vip-pass-input').placeholder = "Enter new password for VIP";
}

function updateVIPPassword() {
    const newPass = document.getElementById('vip-pass-input').value;
    if (newPass) {
        const success = AuthManager.updateUserPassword('drvpcl24@gmail.com', newPass);
        if (success) alert("VIP Password Updated!");
    }
}

function updateCommonPassword() {
    const newPass = document.getElementById('common-pass-input').value;
    if (newPass) {
        const success = AuthManager.updateCommonPassword('common', newPass);
        if (success) alert("Global Access Password Updated!");
    }
}

function renderProjectList() {
    const list = document.getElementById('admin-project-list');
    list.innerHTML = '';

    const projects = AuthManager.config.projects;
    for (const [url, config] of Object.entries(projects)) {
        const row = document.createElement('div');
        row.className = `project-row ${config.locked ? 'locked' : 'unlocked'}`;

        // Shorten URL for display
        const name = url.split('/').pop();

        row.innerHTML = `
            <span>${name}</span>
            <button onclick="toggleLock('${url}')">
                ${config.locked ? 'LOCKED' : 'PUBLIC'}
            </button>
        `;
        list.appendChild(row);
    }
}

window.toggleLock = function (url) {
    AuthManager.toggleProjectLock(url);
    renderProjectList(); // Re-render
};

// --- Event Listeners ---

// Close Login on Outside Click
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) closeLoginModal();
    });
}
// Enter Key Setup
const loginPass = document.getElementById('login-pass');
if (loginPass) {
    loginPass.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
}
if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) closePasswordModal();
    });
}
