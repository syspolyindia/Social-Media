const userData = JSON.parse(localStorage.getItem('userData'));

// Function to get user initials
function getUserInitials(fullName) {
    return fullName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

// Function to navigate to user profile
function navigateToProfile(username) {
    fetch(`/api/v1/users/c/${username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userData.accessToken}`
        }
    })
    .then(response => response.json())
    .then((data) => {
        localStorage.setItem('otherProfileData', JSON.stringify(data.data));
        window.location.href = '../otherProfile/otherProfile.html';
    })
    .catch(error => {
        console.log('Error fetching user data:', error);
    });
}

async function fetchSubscriptions() {
    const subscriptionsList = document.getElementById('subscriptions-list');
    try {
        const response = await fetch('/api/v1/subscriptions/', {
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`
            }
        });
        
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
            let html = '';
            data.data.forEach(subscription => {
                const user = subscription.subscribedUser;
                const initials = getUserInitials(user.fullName);
                html += `
                    <div class="subscription-item" onclick="navigateToProfile('${user.username}')" data-username="${user.username}">
                        <div class="user-avatar">
                            ${user.avatar
                                ? `<img src="${user.avatar}" alt="${user.fullName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                   <div class="user-avatar-placeholder" style="display: none;">${initials}</div>`
                                : `<div class="user-avatar-placeholder" style="display: flex;">${initials}</div>`
                            }
                        </div>
                        <div class="user-info">
                            <h3 class="user-name">${user.fullName}</h3>
                            <p class="user-username">@${user.username}</p>
                        </div>
                    </div>
                `;
            });
            subscriptionsList.innerHTML = html;
        } else {
            subscriptionsList.innerHTML = '<div class="no-subscriptions">No subscriptions found.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        subscriptionsList.innerHTML = '<div class="error">Failed to load subscriptions. Please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for navbar elements
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', (e) => {
        localStorage.removeItem('profileData');
        localStorage.removeItem('userData');
        fetch('/api/v1/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`
            },
        })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            window.location.href = '../index.html';
        })
        .catch((error) => {
            console.log("Error: ", error);
        })
    });

    document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });

    // Add notification button click handler
    const notificationBtn = document.getElementById('notificationBtn');
    notificationBtn.addEventListener('click', () => {
        window.location.href = "../viewReferral/viewReferral.html";
    });

    // Search input handler
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                navigateToProfile(e.target.value);
            }
        });
    }

    // Fetch subscriptions on page load
    fetchSubscriptions();
});