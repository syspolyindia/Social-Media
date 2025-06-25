document.addEventListener('DOMContentLoaded', function() {    // Navigation buttons
    const loginBtn = document.querySelector('.login-btn');
    const getStartedBtn = document.querySelector('.get-started-btn');
    const logo = document.querySelector('.logo');

    // Event listeners for navigation
    loginBtn.addEventListener('click', () => {
        window.location.href = './login/login.html';
    });

    getStartedBtn.addEventListener('click', () => {
        window.location.href = './register/register.html';
    });

    logo.addEventListener('click', () => {
        window.location.href = './index.html';
    });

    // Add hover effect for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});