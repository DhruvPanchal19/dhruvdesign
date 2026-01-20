/**
 * AuthManager - Handles Client-Side Authentication & Role-Based Access
 */
const AuthManager = {
    // Default Configuration
    config: {
        users: {
            'dhruvpanchal1819@gmail.com': {
                pass: 'admin2201@Dhruv',
                role: 'ADMIN',
                name: 'Dhruv (Owner)'
            },
            'drvpcl24@gmail.com': {
                pass: 'Dhruv1912@N',
                role: 'VIP',
                name: 'Recruiter / VIP'
            }
        },
        // Global Passwords (fallback for non-logged in users)
        passwords: {
            'common': 'Dhruv191298@', // For general access if locked
            'cv': 'Dhruv191298@'
        },
        // Project Specific Locks (true = locked/password required for public)
        projects: {
            'casestudies/case-study-design-system.html': { locked: true },

            'casestudies/case-study-smart-university.html': { locked: true },
            'casestudies/case-study-macro.html': { locked: true },
            'casestudies/case-study-esign-app.html': { locked: true },
            'casestudies/case-study-emanager-playlist.html': { locked: true },
            'casestudies/case-study-emanager-home.html': { locked: true },
            'casestudies/case-study-noc-dashboard.html': { locked: true },
            'casestudies/case-study-noc-work-panel.html': { locked: true },
            'casestudies/case-study-unique-case.html': { locked: true },
            'casestudies/case-study-support-call.html': { locked: true },
            'casestudies/case-study-procurement.html': { locked: true },
            'casestudies/case-study-pats-dashboard.html': { locked: true },
            'casestudies/case-study-emanager-resource.html': { locked: true },
            'casestudies/case-study-employee-data.html': { locked: true },
            'casestudies/case-study-pm-work-panel.html': { locked: true },
            'casestudies/case-study-university-help.html': { locked: true },
            'casestudies/case-study-ecrm-responsive.html': { locked: true },
            'casestudies/case-study-ecw-university-responsive.html': { locked: true },
            'casestudies/case-study-hr-module.html': { locked: true },
            'casestudies/case-study-support-portal-slots.html': { locked: true },
            'casestudies/case-study-fax-alert.html': { locked: true },
            'casestudies/case-study-printing-material.html': { locked: true },
            'casestudies/case-study-auto-assign-webinar.html': { locked: true },
            'casestudies/case-study-support-portal-2fa.html': { locked: true },
            'casestudies/case-study-ai-case-summary.html': { locked: true },
            'casestudies/case-study-scrum-ecw.html': { locked: true },
            'casestudies/case-study-rm-module.html': { locked: true },
            'casestudies/case-study-rm-stakeholder.html': { locked: true },
            'casestudies/case-study-ecrm-ai-search.html': { locked: true },
            'casestudies/case-study-lms-admin.html': { locked: true },
            'casestudies/case-study-lms-user.html': { locked: true }
        }
    },

    // Initialization
    init() {
        // Load from LocalStorage or Seed Defaults
        const storedConfig = localStorage.getItem('portfolio_rbac_config');
        if (storedConfig) {
            this.config = JSON.parse(storedConfig);
        } else {
            this.saveConfig(); // Seed defaults
        }

        // Expose to window for UI
        window.AuthManager = this;
    },

    saveConfig() {
        localStorage.setItem('portfolio_rbac_config', JSON.stringify(this.config));
    },

    // --- Authentication ---

    login(email, password) {
        const user = this.config.users[email];
        if (user && user.pass === password) {
            // Save name, email, and role
            localStorage.setItem('currentUser', JSON.stringify({
                email,
                role: user.role,
                name: user.name
            }));
            return { success: true, role: user.role };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.reload();
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'ADMIN';
    },

    isVIP() {
        const user = this.getCurrentUser();
        return user && (user.role === 'VIP' || user.role === 'ADMIN');
    },

    // --- Access Control ---

    /**
     * Checks if the current user can access a specific resource.
     * @param {string} resourceUrl - 'cv' or project path
     * @returns {boolean} true if access granted immediately
     */
    canAccess(resourceUrl) {
        // 1. VIP/Admin always has access
        if (this.isVIP()) return true;

        // 2. Check if user previously entered correct password for this session
        // We'll keep the simple 'portfolio_auth' for guest password persistence
        if (localStorage.getItem('portfolio_auth') === 'true') return true;

        // 3. For Projects: Check if specific project is locked
        if (this.config.projects[resourceUrl]) {
            return !this.config.projects[resourceUrl].locked;
        }

        // Default: Locked if not explicitly open? Or Open? 
        // Let's assume CV is locked by default for non-auth
        if (resourceUrl === 'cv') return false;

        return false; // Default safe
    },

    // --- Admin Functions ---

    updateUserPassword(targetEmail, newPassword) {
        if (!this.isAdmin()) return false;
        if (this.config.users[targetEmail]) {
            this.config.users[targetEmail].pass = newPassword;
            this.saveConfig();
            return true;
        }
        return false;
    },

    updateCommonPassword(type, newPassword) {
        if (!this.isAdmin()) return false;
        if (this.config.passwords[type]) {
            this.config.passwords[type] = newPassword;
            this.saveConfig();
            return true;
        }
        return false;
    },

    toggleProjectLock(projectUrl) {
        if (!this.isAdmin()) return;
        if (!this.config.projects[projectUrl]) {
            this.config.projects[projectUrl] = { locked: true };
        }
        this.config.projects[projectUrl].locked = !this.config.projects[projectUrl].locked;
        this.saveConfig();
    },

    // For Guest Password Check
    verifyCommonPassword(inputPassword) {
        // Only one common password for now as per requirement implied by "case studies access password"
        return inputPassword === this.config.passwords['common'];
    }
};

// AuthManager.init(); // Moved to script.js for better load order control
