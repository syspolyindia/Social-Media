document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');

    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.className = type;
        messageContainer.style.display = 'block';
        messageContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Show success notification in green
    function showSuccessNotification(message) {
        showMessage(message || 'Login successful!', 'success');
    }

    // Show error notification in red
    function showErrorNotification(message) {
        showMessage(message || 'Login failed', 'error');
    }

    function validateForm() {
        let isValid = true;
        const errors = {};

        // Reset previous errors
        document.querySelectorAll('.error').forEach(error => {
            error.textContent = '';
        });
        messageContainer.style.display = 'none';

        // Username validation
        const username = document.getElementById('username').value.trim();
        if (!username) {
            errors.username = 'Username is required';
            isValid = false;
        }

        // Password validation
        const password = document.getElementById('password').value;
        if (!password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        // Display errors if any
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
        });

        return isValid;
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (validateForm()) {
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                const loginData = { username: username, password: password };
                const finalLoginData = JSON.stringify(loginData);

                fetch('/api/v1/users/login', {
                    method: 'POST',
                    body: finalLoginData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showSuccessNotification(data.message || 'Login successful!');
                            localStorage.setItem('userData', JSON.stringify(data.data));
                            window.location.href = '../userProfile/profile.html';
                        } else {
                            if(data.message === "User does not exist" || data.message === "Incorrect password!"){
                                showErrorNotification("Invalid username or password");
                            }
                            else{
                                showErrorNotification(data.message || 'Login failed');
                            }
                        }
                    })
                    .catch(error => {
                        if(error.message){
                            showErrorNotification(error.message);
                        }
                    });
            }
            return false;
        });
    }
}); 