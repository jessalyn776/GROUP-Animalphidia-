// auth.js - Complete authentication manager
class AuthManager {
    constructor() {
        this.api = apiClient;
        this.currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        this.initEventListeners();
        this.checkAuthStatus();
    }

    initEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showLoginModal();
            });
        }

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Show register link
        const showRegister = document.getElementById('showRegister');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterModal();
            });
        }

        // Show login link
        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }
    }

    showLoginModal() {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    showRegisterModal() {
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();

        // Hide login modal if open
        const loginModalEl = document.getElementById('loginModal');
        const loginModal = bootstrap.Modal.getInstance(loginModalEl);
        if (loginModal) {
            loginModal.hide();
        }
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showNotification('Please enter both username and password', 'warning');
            return;
        }

        try {
            const loginBtn = document.querySelector('#loginForm button[type="submit"]');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            console.log('🔐 Login attempt for:', username);

            const response = await fetch('http://localhost:8081/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const responseText = await response.text();
            console.log('📥 Login response:', responseText);

            if (!response.ok) {
                let errorMessage = 'Login failed';
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch {
                    if (responseText) {
                        errorMessage = responseText;
                    }
                }
                throw new Error(errorMessage);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid response from server');
            }

            // Store authentication
            this.api.setToken(result.accessToken, result.refreshToken);
            this.currentUser = result;
            localStorage.setItem('user', JSON.stringify(this.currentUser));

            // Clear form
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (modal) {
                modal.hide();
            }

            // Update UI
            this.updateUIAfterLogin();

            // Show success message
            this.showNotification('Login successful! Welcome back, ' + result.username, 'success');

            // Redirect based on role after 1 second
            setTimeout(() => {
                this.redirectToDashboard(result.role || 'viewer');
            }, 1000);

        } catch (error) {
            console.error('❌ Login error:', error);
            this.showNotification(error.message || 'Login failed. Please check your credentials.', 'danger');
        } finally {
            const loginBtn = document.querySelector('#loginForm button[type="submit"]');
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const firstName = document.getElementById('registerFirstName').value;
        const lastName = document.getElementById('registerLastName').value;

        if (!username || !email || !password || !confirmPassword) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'warning');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'warning');
            return;
        }

        try {
            const registerBtn = document.querySelector('#registerForm button[type="submit"]');
            const originalText = registerBtn.textContent;
            registerBtn.textContent = 'Creating account...';
            registerBtn.disabled = true;

            const registerData = {
                username,
                email,
                password,
                passwordConfirm: confirmPassword,
                firstName: firstName || '',
                lastName: lastName || ''
            };

            console.log('📝 Registration attempt for:', email);

            const response = await fetch('http://localhost:8081/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const responseText = await response.text();
            console.log('📥 Registration response:', responseText);

            if (!response.ok) {
                let errorMessage = 'Registration failed';
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch {
                    if (responseText) {
                        errorMessage = responseText;
                    }
                }
                throw new Error(errorMessage);
            }

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error('Invalid response from server');
            }

            // Clear form
            document.getElementById('registerUsername').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
            document.getElementById('registerConfirmPassword').value = '';
            document.getElementById('registerFirstName').value = '';
            document.getElementById('registerLastName').value = '';

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (modal) {
                modal.hide();
            }

            this.showNotification(result.message || 'Registration successful! Please check your email to verify your account.', 'success');

        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showNotification(error.message || 'Registration failed. Please try again.', 'danger');
        } finally {
            const registerBtn = document.querySelector('#registerForm button[type="submit"]');
            if (registerBtn) {
                registerBtn.textContent = 'Register';
                registerBtn.disabled = false;
            }
        }
    }

    updateUIAfterLogin() {
        // Hide login button, show user dropdown
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

        // Create user dropdown if it doesn't exist
        this.createUserDropdown();
    }

    createUserDropdown() {
        // Check if dropdown already exists
        if (document.getElementById('userDropdownContainer')) {
            return;
        }

        const user = this.currentUser;
        if (!user) return;

        // Create dropdown container
        const container = document.createElement('div');
        container.id = 'userDropdownContainer';
        container.className = 'nav-item dropdown';

        // Create dropdown HTML
        container.innerHTML = `
            <a class="nav-link dropdown-toggle text-white" href="#" role="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                ${user.username}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li>
                    <div class="dropdown-item-text">
                        <strong>${user.username}</strong><br>
                        <small class="text-muted">${user.role}</small>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="/dashboard.html">
                    <i class="bi bi-speedometer2 me-2"></i>Dashboard
                </a></li>
                <li><a class="dropdown-item" href="/profile-settings.html">
                    <i class="bi bi-person-gear me-2"></i>Profile
                </a></li>
                ${user.role === 'admin' || user.role === 'moderator' ? `
                <li><a class="dropdown-item text-warning" href="/${user.role}-dashboard.html">
                    <i class="bi bi-shield-check me-2"></i>${user.role === 'admin' ? 'Admin Panel' : 'Moderation'}
                </a></li>
                ` : ''}
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">
                    <i class="bi bi-box-arrow-right me-2"></i>Logout
                </a></li>
            </ul>
        `;

        // Add to navbar
        const navbarNav = document.querySelector('.navbar-nav.me-auto');
        if (navbarNav) {
            navbarNav.appendChild(container);
        } else {
            // Try to add to the main nav container
            const navDiv = document.querySelector('.navbar-collapse .d-flex');
            if (navDiv) {
                navDiv.parentNode.insertBefore(container, navDiv);
            }
        }

        // Add logout event listener
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLogout();
                });
            }
        }, 100);
    }

    handleLogout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.currentUser = null;
        this.api.setToken(null, null);

        // Remove dropdown
        const dropdownContainer = document.getElementById('userDropdownContainer');
        if (dropdownContainer) {
            dropdownContainer.remove();
        }

        // Show login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }

        this.showNotification('Logged out successfully', 'info');

        // Reload page after 1 second
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    checkAuthStatus() {
        if (this.currentUser) {
            this.updateUIAfterLogin();
        }
    }

    redirectToDashboard(role) {
        console.log(`🔄 Redirecting to ${role} dashboard...`);

        const roleLower = role.toLowerCase();
        let dashboardUrl = '/dashboard.html';

        if (roleLower === 'admin') {
            dashboardUrl = '/admin-dashboard.html';
        } else if (roleLower === 'moderator') {
            dashboardUrl = '/moderator-dashboard.html';
        } else if (roleLower === 'contributor') {
            dashboardUrl = '/contributor-dashboard.html';
        }

        window.location.href = dashboardUrl;
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.alert-dismissible');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});