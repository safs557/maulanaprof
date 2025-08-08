// Global variables
let loading = false;

// API configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    // Initialize Lucide icons
    lucide.createIcons();
});

// Initialize application
function initializeApp() {
    checkAuth();
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Password toggle
    document.getElementById('toggle-password').addEventListener('click', togglePasswordVisibility);
}

// Check if user is already authenticated
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/check-auth`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated && !data.first_login) {
                // User is authenticated and not first login, redirect to dashboard
                window.location.href = '/admin-dashboard.html';
            }
        }
    } catch (error) {
        console.log('Auth check failed:', error);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    if (loading) return;
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    setLoading(true);
    hideError();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login successful, redirect to dashboard
            window.location.href = '/admin-dashboard.html';
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please check if the backend server is running.');
    } finally {
        setLoading(false);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        passwordInput.type = 'password';
        passwordIcon.setAttribute('data-lucide', 'eye');
    }
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

// Set loading state
function setLoading(isLoading) {
    loading = isLoading;
    const loginBtn = document.getElementById('login-btn');
    const loginBtnContent = document.getElementById('login-btn-content');
    const loginSpinner = document.getElementById('login-spinner');
    
    if (isLoading) {
        loginBtn.disabled = true;
        loginBtnContent.classList.add('d-none');
        loginSpinner.classList.remove('d-none');
    } else {
        loginBtn.disabled = false;
        loginBtnContent.classList.remove('d-none');
        loginSpinner.classList.add('d-none');
        
        // Reinitialize Lucide icons
        lucide.createIcons();
    }
}

// Show error message
function showError(message) {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorAlert.classList.remove('d-none');
}

// Hide error message
function hideError() {
    const errorAlert = document.getElementById('error-alert');
    errorAlert.classList.add('d-none');
}
