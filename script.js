// Removed AuthManager - No longer needed

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

                // --- iOS Gyroscope Permission ---
                // Must be triggered by user action (click). matches this context.
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(response => {
                            console.log('Gyro permission:', response);
                        })
                        .catch(console.error);
                }
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
            duration: 0.8,
            stagger: 0.06,
            ease: 'power4.out',
            skewY: 7,
            delay: 0.15
        })
            .to('.hero-title .word', {
                skewY: 0,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.6")
            .from('.hero-subtitle', {
                opacity: 0,
                y: 30,
                duration: 0.55,
                ease: "power2.out"
            }, "-=0.6");
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
                    duration: 0.55,
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
                duration: 0.8,
                ease: "power4.out"
            });

            gsap.from(".about-content > *", {
                y: 50,
                opacity: 0,
                duration: 0.55,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.15
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
const inputs = document.querySelectorAll('#contact-form .form-input, #contact-form .form-textarea');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to('body', { backgroundColor: '#020202', duration: 0.35 });
            gsap.to('.hero-wrapper, .work-section, #about', { opacity: 0.1, duration: 0.35 });
        } else {
            document.body.style.backgroundColor = '#020202';
        }
    });

    input.addEventListener('blur', () => {
        if (typeof gsap !== 'undefined') {
            gsap.to('body', { backgroundColor: '#050505', duration: 0.35 });
            gsap.to('.hero-wrapper, .work-section, #about', { opacity: 1, duration: 0.35 });
        } else {
            document.body.style.backgroundColor = '#050505';
        }
    });
});

// 6. Send Email Logic
function sendEmail(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const contact = document.getElementById('contact').value;
    const question = document.getElementById('question').value || "General Inquiry";
    const note = document.getElementById('note').value || "";

    const subject = `Portfolio Inquiry: ${name}`;
    const body = `Name: ${name}%0D%0AContact: ${contact}%0D%0A%0D%0AQuestion:%0D%0A${question}%0D%0A%0D%0ANote:%0D%0A${note}`;

    window.location.href = `mailto:panchaldhruv1819@gmail.com?subject=${subject}&body=${body}`;
}

// 7. Simplified Project Navigation (No Auth)
function handleProjectClick(url) {
    window.location.href = url;
}

// 8. Simplified CV Download (No Auth)
const cvUrl = "dhruvpanchal_uiux.pdf";

function handleCVClick(event) {
    if (event) event.preventDefault();
    window.open(cvUrl, '_blank');
}



// 14. 3D Constellation Hero (Global) - "Avant-Garde Digital Ecosystem"
function initHero3D() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035); // Match CSS bg

    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 1, 1000);
    camera.position.set(0, 0, 24);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group
    const uiGroup = new THREE.Group();
    scene.add(uiGroup);

    // --- Materials (Strict Brand Palette) ---
    // Bg: #050505, Text: #E0E0E0, Accent: #FFFFFF, Muted: #666666
    const matCardBg = new THREE.MeshBasicMaterial({ color: 0x050505 }); // Deep Black
    const matCardBorder = new THREE.LineBasicMaterial({ color: 0x333333 }); // Subtle border
    const matTextWhite = new THREE.MeshBasicMaterial({ color: 0xE0E0E0 });
    const matTextMuted = new THREE.MeshBasicMaterial({ color: 0x666666 });
    const matAccent = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    // --- Geometry Helper: Rounded Rect Plane ---
    function createRoundedShape(w, h, r = 0.1) {
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + r, h / 2);
        shape.lineTo(w / 2 - r, h / 2);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - r);
        shape.lineTo(w / 2, -h / 2 + r);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2 - r, -h / 2);
        shape.lineTo(-w / 2 + r, -h / 2);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + r);
        shape.lineTo(-w / 2, h / 2 - r);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2 + r, h / 2);
        return shape;
    }

    // --- Component Generator ---
    function createDevice(type) {
        const group = new THREE.Group();

        let w, h;
        // Scale Factor 1.4x applied
        if (type === 'mobile') {
            w = 1.4 * 1.4; h = 3.0 * 1.4; // 9:16 approx
        } else {
            w = 4.0 * 1.4; h = 2.5 * 1.4; // 16:9 approx
        }

        // 1. Base Card Background (Filled)
        const shape = createRoundedShape(w, h, 0.15); // Increased radius slightly
        const geom = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geom, matCardBg);
        group.add(mesh);

        // 2. Border Outline (Wireframe look on edges)
        const edges = new THREE.EdgesGeometry(geom);
        const line = new THREE.LineSegments(edges, matCardBorder);
        group.add(line);

        // 3. UI Elements (Filled internal blocks)
        if (type === 'mobile') {
            // Header
            const header = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.28, 0.42), matTextMuted);
            header.position.set(0, h / 2 - 0.42, 0.01);
            group.add(header);
            // Hero Block
            const hero = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.28, 1.4), matTextMuted); // Darker grey placeholder
            hero.material = new THREE.MeshBasicMaterial({ color: 0x222222 });
            hero.position.set(0, 0.28, 0.01);
            group.add(hero);
            // Text Lines
            const t1 = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.56, 0.14), matTextMuted);
            t1.position.set(-0.14, -0.84, 0.01);
            group.add(t1);
            const t2 = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.56, 0.14), matTextMuted);
            t2.position.set(-0.14, -1.12, 0.01);
            group.add(t2);
            // Button
            const btn = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.28), matAccent);
            btn.position.set(0, -1.68, 0.01);
            group.add(btn);

        } else { // Web
            // Browser Bar
            const bar = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.42), matCardBg); // Mask
            bar.position.set(0, h / 2 - 0.21, 0.005);
            // Dots
            const dot = new THREE.CircleGeometry(0.07, 16);
            const d1 = new THREE.Mesh(dot, matTextMuted); d1.position.set(-w / 2 + 0.28, h / 2 - 0.21, 0.01); group.add(d1);
            const d2 = new THREE.Mesh(dot, matTextMuted); d2.position.set(-w / 2 + 0.49, h / 2 - 0.21, 0.01); group.add(d2);

            // Sidebar
            const side = new THREE.Mesh(new THREE.PlaneGeometry(1.12, h - 0.56), matTextMuted);
            side.material = new THREE.MeshBasicMaterial({ color: 0x111111 });
            side.position.set(-w / 2 + 0.56, -0.28, 0.01);
            group.add(side);

            // Dashboard Grid
            const cardW = 1.12, cardH = 0.84;
            const card1 = new THREE.Mesh(new THREE.PlaneGeometry(cardW, cardH), matTextMuted);
            card1.material = new THREE.MeshBasicMaterial({ color: 0x222222 });
            card1.position.set(0, 0.7, 0.01);
            group.add(card1);

            const card2 = new THREE.Mesh(new THREE.PlaneGeometry(cardW, cardH), matTextMuted);
            card2.material = new THREE.MeshBasicMaterial({ color: 0x222222 });
            card2.position.set(1.4, 0.7, 0.01);
            group.add(card2);

            const bigCard = new THREE.Mesh(new THREE.PlaneGeometry(2.52, 1.12), matTextMuted);
            bigCard.material = new THREE.MeshBasicMaterial({ color: 0x222222 });
            bigCard.position.set(0.7, -0.56, 0.01);
            group.add(bigCard);
        }

        return group;
    }

    // --- Assembly: The Growth Spiral ---
    const devices = [];
    const total = 12;

    // Responsive Settings
    function getLayoutSettings() {
        const isMobile = window.innerWidth < 768;
        return {
            cameraZ: isMobile ? 36 : 24, // Pull back more on mobile
            radiusWeb: isMobile ? 3.5 : 6, // Tighter spiral on mobile
            radiusMobile: isMobile ? 6 : 9,
            verticalSpreadWeb: isMobile ? 6 : 5,
            verticalSpreadMobile: isMobile ? 4 : 3
        };
    }

    let settings = getLayoutSettings();
    camera.position.z = settings.cameraZ;

    // Create 4 Webs (The Core Foundation)
    for (let i = 0; i < 4; i++) {
        const d = createDevice('web');
        setupDevice(d, i, 'web');
        uiGroup.add(d);
        devices.push(d);
    }

    // Create 8 Mobiles (The Orbiting Growth)
    for (let i = 0; i < 8; i++) {
        const d = createDevice('mobile');
        setupDevice(d, i, 'mobile');
        uiGroup.add(d);
        devices.push(d);
    }

    function setupDevice(mesh, index, type) {
        updateDevicePosition(mesh, index, type);

        mesh.userData = {
            index: index,
            type: type,
            speed: 0.008,
            yLimit: 12,
            yReset: -12,
            rotSpeed: (Math.random() - 0.5) * 0.0005
        };
    }

    function updateDevicePosition(mesh, index, type) {
        if (type === 'web') {
            const angle = (index / 4) * Math.PI * 2;
            const y = (index - 2) * settings.verticalSpreadWeb;
            mesh.position.set(
                Math.cos(angle) * settings.radiusWeb,
                y,
                Math.sin(angle) * settings.radiusWeb
            );
            mesh.lookAt(0, y, 0);
            mesh.rotateY(Math.PI);
            mesh.userData.initialY = y; // Update reference for loop
        } else {
            const angle = (index / 8) * Math.PI * 2 + (Math.PI / 4);
            const y = (index - 4) * settings.verticalSpreadMobile;
            mesh.position.set(
                Math.cos(angle) * settings.radiusMobile,
                y,
                Math.sin(angle) * settings.radiusMobile
            );
            mesh.lookAt(0, y, 0);
            mesh.rotateY(Math.PI);
            mesh.userData.initialY = y;
        }
    }

    // --- State ---
    let time = 0;
    let mouse = new THREE.Vector2(0, 0);
    let targetMouse = new THREE.Vector2(0, 0);

    // --- Interaction ---
    document.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('deviceorientation', (e) => {
        if (e.beta && e.gamma) {
            targetMouse.x = Math.max(-1, Math.min(1, e.gamma / 30));
            targetMouse.y = Math.max(-1, Math.min(1, e.beta / 30));
        }
    });

    // --- Animation ---
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        // Interaction
        uiGroup.rotation.y += 0.001 + (mouse.x * 0.01);
        uiGroup.rotation.x = mouse.y * 0.1;

        // "Graph Ascent" - Infinite Vertical Upward Flow
        devices.forEach(d => {
            d.position.y += d.userData.speed;

            // Loop functionality
            if (d.position.y > d.userData.yLimit) {
                d.position.y = d.userData.yReset;
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    // Hande Resize & Layout Update
    window.addEventListener('resize', () => {
        // Update Camera
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);

        // Update Layout Settings
        settings = getLayoutSettings();
        camera.position.z = settings.cameraZ;

        // Reposition Devices
        devices.forEach(d => {
            // Re-calculate X/Z based on new radius, keep current Y (for animation continuity)
            // But we need to update the spiral structure width
            const index = d.userData.index;
            const type = d.userData.type;

            // Recalculate base position logic
            if (type === 'web') {
                const angle = (index / 4) * Math.PI * 2;
                d.position.x = Math.cos(angle) * settings.radiusWeb;
                d.position.z = Math.sin(angle) * settings.radiusWeb;
            } else {
                const angle = (index / 8) * Math.PI * 2 + (Math.PI / 4);
                d.position.x = Math.cos(angle) * settings.radiusMobile;
                d.position.z = Math.sin(angle) * settings.radiusMobile;
            }
        });
    });
}
// Initialize on Load
document.addEventListener('DOMContentLoaded', initHero3D);