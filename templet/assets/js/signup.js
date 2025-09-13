function togglePassword(id, icon) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    if (form) {
        console.log('Form found, attaching submit handler');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('create-password').value,
                confirmPassword: document.getElementById('confirm-password').value,
                reason: document.getElementById('reason').value
            };

    try {
        console.log('Sending signup request:', formData);
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            console.error('Server error:', response.status, response.statusText);
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.message || 'Server error');
        }

        const data = await response.json();
        console.log('Server response:', data);

        if (data.status === 'success') {
          // Store the user data in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('userData', JSON.stringify(data.data.user));
          // Redirect to login page
          window.location.href = '/login';
        } else {
          alert(data.message || 'Something went wrong!');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to sign up. Please try again.');
      }
    });
  }
});
