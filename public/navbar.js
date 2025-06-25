// Initialize navbar functionality
function initializeNavbar() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Logo click handler
    document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                fetch(`/api/v1/users/c/${e.target.value}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${userData.accessToken}`
                    }
                })
                    .then(response => response.json())
                    .then((data) => {
                        localStorage.setItem('otherProfileData', JSON.stringify(data.data))
                        window.location.href = '../otherProfile/otherProfile.html';
                    })
                    .catch(error => {
                        console.log('Error fetching user data:', error);
                    });
            }
        });
    }

    // Notification button click handler
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            window.location.href = '../viewReferral/viewReferral.html';
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            localStorage.removeItem('profileData');
            localStorage.removeItem('userData');
            fetch(`/api/v1/users/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userData.accessToken}`
                },
            })
                .then(response => response.json())
                .then((data) => {
                    console.log(data);                    window.location.href = '../index.html';
                })
                .catch((error) => {
                    console.log("Error: ", error);
                });
        });
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNavbar);