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

// 3. Reveal Sequence (Immediate)
document.addEventListener('DOMContentLoaded', () => {
    // Reveal Sequence
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();

        tl.from('.hero-title .word', {
            y: '140%',
            duration: 1.5,
            stagger: 0.1,
            ease: 'power4.out',
            skewY: 7,
            delay: 0.5 // Short delay for smoothness
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
});

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

// 7. Password Logic
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('cv-password');
const cvUrl = "Dhruv_Panchal_UIUX_Designer_compressed.pdf"; // The file to download

function openPasswordModal(event) {
    if (event) event.preventDefault();
    passwordModal.classList.add('active');
    setTimeout(() => passwordInput.focus(), 100);
}

function closePasswordModal() {
    passwordModal.classList.remove('active');
    passwordInput.value = ''; // Clear input
}

function checkPassword() {
    const password = passwordInput.value;

    if (password === '1234567890') {
        // Correct Password
        closePasswordModal();

        // Trigger Download
        const link = document.createElement('a');
        link.href = cvUrl;
        link.download = 'Dhruv_Panchal_CV.pdf'; // Optional: rename file on download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } else {
        // Wrong Password
        closePasswordModal();

        // Redirect to Inquiry
        if (typeof gsap !== 'undefined') {
            gsap.to(window, { duration: 1, scrollTo: "#inquiry", ease: "power2.out" });
        } else {
            document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
        }

        // Optional: Shake effect or visual feedback could be added here before closing
    }
}

// Allow Enter key to submit
if (passwordInput) {
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// Close on background click
if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            closePasswordModal();
        }
    });
}
