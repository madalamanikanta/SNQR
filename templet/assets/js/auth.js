// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    }
}

// Add logout functionality
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

// Check auth when page loads
document.addEventListener('DOMContentLoaded', checkAuth);
