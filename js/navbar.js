// Global flag to track if navbar components are initialized or not
window.navbarLoaded = false;

// Add this to your JavaScript file that handles registration
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the CSRF token when page loads
    fetch('get_csrf_token.php')
        .then(response => response.json())
        .then(data => {
            document.getElementById('csrf_token').value = data.csrf_token;
        });
    
    // Your existing form submission code
});

// Toggle forgot password modal
window.toggleForgotPasswordModal = function () {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    }
};

// Password visibility toggle function
window.togglePasswordVisibility = function (inputId, icon) {
    const passwordInput = document.getElementById(inputId);

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
};

// Expose modal functions to global scope to make them accessible
window.toggleLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    }
};

window.toggleRegisterModal = function () {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
    }
};

window.switchToRegister = function () {
    window.toggleLoginModal();
    window.toggleRegisterModal();
};

window.switchToForgotPassword = function () {
    window.toggleLoginModal();
    window.toggleForgotPasswordModal();
};

window.switchToLogin = function () {
    // Close any other open modals
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');

    if (registerModal && registerModal.style.display !== 'none') {
        window.toggleRegisterModal();
    }

    if (forgotPasswordModal && forgotPasswordModal.style.display !== 'none') {
        window.toggleForgotPasswordModal();
    }

    window.toggleLoginModal();
};

// Close modal when clicking outside
window.onclick = function (event) {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');

    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }

    if (event.target == registerModal) {
        registerModal.style.display = 'none';
    }
    
    if (event.target == forgotPasswordModal) {
        forgotPasswordModal.style.display = 'none';
    }
}

function setActiveNavLink() {
    // Get current page filename from URL
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Remove all active classes first
    const navLinks = document.querySelectorAll('.navbar-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Find the link that matches the current page and add active class
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
}

// Make this function globally available
window.initializeNavbarComponents = function () {
    // Connect login/register buttons to modal toggles
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    const logoutBtn = document.querySelector('.btn-logout');

    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.toggleLoginModal();
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.toggleRegisterModal();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Set up form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    // Add close button functionality for modals
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Initialize mobile menu
    initMobileMenu();

    setActiveNavLink();

    // Set flag to indicate navbar is initialized
    window.navbarLoaded = true;

    // console.log("Navbar components initialized successfully");
};

// Handle login form submission (keep the rest of your functions as they were)
function handleLogin(e) {
    e.preventDefault();

    const teamName = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!teamName || !password) {
        alert('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('team_name', teamName);
    formData.append('password', password);
    
    // fetch('php/login.php', {
    fetch('http://gatebreakersctf.wuaze.com/php/login.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                toggleLoginModal();
                updateNavbarUI(data.role, data.username);
                window.location.href = 'rules.html';
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login');
        });
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();

    const teamName = document.getElementById('register-teamname').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!teamName || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const formData = new FormData();
    formData.append('team_name', teamName);
    formData.append('email', email);
    formData.append('password', password);

    fetch('php/register.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                toggleRegisterModal();
                toggleLoginModal(); // Show login modal after successful registration
            } else {
                alert(data.message || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during registration');
        });
}

function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('reset-email').value;

    if (!email) {
        alert('Please enter your email address');
        return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    const formData = new FormData();
    formData.append('email', email);

    // Show loading state
    const submitButton = document.querySelector('#forgot-password-form button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    fetch('php/reset_password_request.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            if (data.status === 'success') {
                alert('If an account exists with this email, a password reset link has been sent.');
                toggleForgotPasswordModal();
            } else {
                alert(data.message || 'Password reset request failed');
            }
        })
        .catch(error => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            console.error('Error:', error);
            alert('An error occurred while processing your request');
        });
}

// Add this function to switch from register to login
window.switchToLogin = function () {
    window.toggleRegisterModal();
    window.toggleLoginModal();
};

// Handle logout
function handleLogout() {
    fetch('php/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateNavbarUI(null, null);
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Check authentication status
// Modify window.checkAuthStatus function in navbar.js
window.checkAuthStatus = function () {
    return fetch('php/auth_status.php')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                // Wait until navbar is fully loaded before updating UI
                const updateUI = function () {
                    if (document.querySelector('.guest-controls') && document.querySelector('.user-controls')) {
                        updateNavbarUI(data.role, data.username);
                    } else {
                        // If elements aren't available yet, retry after a short delay
                        setTimeout(updateUI, 100);
                    }
                };
                updateUI();
                return data; // Make sure we return the data
            } else {
                // Only update UI if not authenticated, don't reload
                updateNavbarUI(null, null);
                return data; // Make sure we return the data
            }
        })
        .catch(error => {
            console.error('Error checking auth status:', error);
            return { authenticated: false };
        });
};

function updateNavbarUI(role, username) {
    const guestControls = document.querySelector('.guest-controls');
    const userControls = document.querySelector('.user-controls');

    if (!guestControls || !userControls) {
        console.error("UI controls not found, retrying...");
        // Retry after a short delay if elements aren't available yet
        setTimeout(() => updateNavbarUI(role, username), 100);
        return;
    }

    const roleIndicator = document.querySelector('.role-indicator');
    const usernameElement = document.querySelector('.username');

    if (role) {
        // User is logged in
        guestControls.classList.add('hidden');
        userControls.classList.remove('hidden');

        if (username && usernameElement) {
            usernameElement.textContent = username;
        }

        if (roleIndicator) {
            if (role === 'admin') {
                roleIndicator.textContent = 'Admin';
                roleIndicator.style.background = 'linear-gradient(to right, #e74c3c, #c0392b)';
            } else {
                roleIndicator.textContent = 'Player';
                roleIndicator.style.background = 'linear-gradient(to right, var(--primary-blue), var(--primary-purple))';
            }
        }
    } else {
        // User is logged out
        userControls.classList.add('hidden');
        guestControls.classList.remove('hidden');
    }

    // console.log(`Navbar UI updated: User ${username} with role ${role}`);
}

// Mobile menu toggle functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function () {
            navbarMenu.classList.toggle('active');
            // Toggle icon between bars and X (optional)
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// console.log("navbar.js loaded");
