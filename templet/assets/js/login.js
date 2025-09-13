document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    const form = document.getElementById('loginForm');
    if (form) {
        console.log('Login form found, attaching submit handler');
        form.addEventListener('submit', (e) => {
            console.log('Form submit event triggered');
            handleLogin(e);
        });
    } else {
        console.error('Login form not found!');
    }

    // Test localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('LocalStorage is working');
    } catch (e) {
        console.error('LocalStorage is not available:', e);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    // Get form data
    const email = document.getElementById('email').value;
    const password = document.getElementById('signin-password').value; // Updated to match the HTML ID
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    console.log('Attempting login with email:', email); // Debug line

    try {
        console.log('Making login request...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                rememberMe
            })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug line

        if (!response.ok) {
            console.error('Server error:', response.status, response.statusText);
            throw new Error(data.message || 'Server error');
        }

        if (data.status === 'success') {
            console.log('Login successful, storing user data...');
            // Store the token and user data
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', data.token);
            storage.setItem('userData', JSON.stringify(data.data.user));
            
            console.log('Data stored successfully, attempting redirect...');
            
            // Add token to subsequent requests
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            }).then(response => {
                if (response.ok) {
                    // Redirect to landing page
                    console.log('Token verified, redirecting...');
                    window.location.replace('/landing_page.html');
                } else {
                    throw new Error('Token verification failed');
                }
            }).catch(err => {
                console.error('Verification error:', err);
                // Try direct redirect as fallback
                window.location.href = '/landing_page.html';
            });
        } else {
            showError('password', data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('password', 'Login failed. Please try again.');
    }
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}
