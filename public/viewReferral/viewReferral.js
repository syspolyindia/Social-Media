// Sample referral data (this would be replaced with fetch data)
const sampleReferrals = [
    {
        _id: 1,
        referredUser: {
            fullName: "Roman Ceasar",
            username: "romanceasar1",
            avatar: null // Placeholder for avatar image
        },
        referredBy: null // No referrer for this one
    },
    {
        _id: 2,
        referredUser: {
            fullName: "Shrikant",
            username: "shrikant47",
            avatar: null // Placeholder for avatar image
        },
        referredBy: {
            username: "abcuser"
        }
    }
];

const userData = JSON.parse(localStorage.getItem('userData'));

// Function to create SVG elements for the action buttons
function createSVG(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.5");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    if (type === 'check') {
        path.setAttribute("d", "M20 6L9 17l-5-5");
    } else if (type === 'x') {
        path.setAttribute("d", "M18 6L6 18");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", "M6 6l12 12");
        svg.appendChild(path2);
    }
    
    svg.appendChild(path);
    return svg;
}

// Function to create a referral item
function createReferralItem(referral) {
    const referralItem = document.createElement('div');
    referralItem.className = 'referral-item';
    referralItem.dataset.id = referral._id; // Using MongoDB _id
    
    // User info section
    const userSection = document.createElement('div');
    userSection.className = 'referral-user';
    
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'referral-avatar';
    
    console.log("Here", referral)
    if (referral.referredUser.avatar) {
        // If user has an avatar, use it
        const img = document.createElement('img');
        img.src = referral.referredUser.avatar;
        img.alt = `${referral.referredUser.fullName}'s avatar`;
        avatar.appendChild(img);
    } else {
        // Default user icon if no avatar is provided
        const userIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        userIcon.setAttribute("viewBox", "0 0 24 24");
        userIcon.setAttribute("fill", "none");
        userIcon.setAttribute("stroke", "currentColor");
        userIcon.setAttribute("stroke-width", "1.5");
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "8");
        circle.setAttribute("r", "5");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M20 21a8 8 0 10-16 0");
        
        userIcon.appendChild(circle);
        userIcon.appendChild(path);
        avatar.appendChild(userIcon);
    }
    
    // User info
    const userInfo = document.createElement('div');
    userInfo.className = 'referral-info';
    
    const name = document.createElement('div');
    name.className = 'referral-name';
    name.textContent = referral.referredUser.fullName;
    
    const username = document.createElement('div');
    username.className = 'referral-username';
    username.textContent = `@${referral.referredUser.username}`;
    
    userInfo.appendChild(name);
    userInfo.appendChild(username);
    
    // Add referred by info
    const referredBy = document.createElement('div');
    referredBy.className = 'referred-by';
    
    if (referral.referredBy && referral.referredBy.username) {
        referredBy.innerHTML = `Referred By: <a href="#">@${referral.referredBy.username}</a>`;
    } else {
        referredBy.textContent = 'Referred By:';
    }
    
    userInfo.appendChild(referredBy);
    
    userSection.appendChild(avatar);
    userSection.appendChild(userInfo);
    
    // Actions section
    const actionsSection = document.createElement('div');
    actionsSection.className = 'referral-actions';
    
    // Accept button
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'action-btn accept-btn';
    acceptBtn.appendChild(createSVG('check'));
    acceptBtn.addEventListener('click', () => handleAccept(referral._id));
    
    // Reject button
    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'action-btn reject-btn';
    rejectBtn.appendChild(createSVG('x'));
    rejectBtn.addEventListener('click', () => handleReject(referral._id));
    
    actionsSection.appendChild(acceptBtn);
    actionsSection.appendChild(rejectBtn);
    
    // Append all sections to the referral item
    referralItem.appendChild(userSection);
    referralItem.appendChild(actionsSection);
    
    return referralItem;
}

// Function to handle accept action
function handleAccept(id) {
    console.log(`Accepting referral with ID: ${id}`);
    
    // Show loading state
    const item = document.querySelector(`.referral-item[data-id="${id}"]`);
    if (item) {
        item.style.opacity = '0.7';
        const actions = item.querySelector('.referral-actions');
        if (actions) {
            actions.innerHTML = '<div class="loading">Processing...</div>';
        }
    }
    
    // Make API call to accept the referral
    fetch(`/api/v1/referrals/accept/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${userData.accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to accept referral');
        }
        return response.json();
    })
    .then(data => {
        console.log('Referral accepted successfully:', data);
        // Remove the item from the list with a fade-out effect
        if (item) {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '0';
            setTimeout(() => {
                item.remove();
                checkEmptyReferrals();
            }, 300);
        }
    })
    .catch(error => {
        console.error('Error accepting referral:', error);
        // Restore the item's original state
        if (item) {
            item.style.opacity = '1';
            const actions = item.querySelector('.referral-actions');
            if (actions) {
                actions.innerHTML = '';
                
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'action-btn accept-btn';
                acceptBtn.appendChild(createSVG('check'));
                acceptBtn.addEventListener('click', () => handleAccept(id));
                
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'action-btn reject-btn';
                rejectBtn.appendChild(createSVG('x'));
                rejectBtn.addEventListener('click', () => handleReject(id));
                
                actions.appendChild(acceptBtn);
                actions.appendChild(rejectBtn);
            }
        }
        
        // Show error message
        alert('Failed to accept referral. Please try again.');
    });
}

// Function to handle reject action
function handleReject(id) {
    console.log(`Rejecting referral with ID: ${id}`);
    
    // Show loading state
    const item = document.querySelector(`.referral-item[data-id="${id}"]`);
    if (item) {
        item.style.opacity = '0.7';
        const actions = item.querySelector('.referral-actions');
        if (actions) {
            actions.innerHTML = '<div class="loading">Processing...</div>';
        }
    }
    
    // Make API call to reject the referral
    fetch(`/api/v1/referrals/reject/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${userData.accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to reject referral');
        }
        return response.json();
    })
    .then(data => {
        console.log('Referral rejected successfully:', data);
        // Remove the item from the list with a fade-out effect
        if (item) {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '0';
            setTimeout(() => {
                item.remove();
                checkEmptyReferrals();
            }, 300);
        }
    })
    .catch(error => {
        console.error('Error rejecting referral:', error);
        // Restore the item's original state
        if (item) {
            item.style.opacity = '1';
            const actions = item.querySelector('.referral-actions');
            if (actions) {
                actions.innerHTML = '';
                
                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'action-btn accept-btn';
                acceptBtn.appendChild(createSVG('check'));
                acceptBtn.addEventListener('click', () => handleAccept(id));
                
                const rejectBtn = document.createElement('button');
                rejectBtn.className = 'action-btn reject-btn';
                rejectBtn.appendChild(createSVG('x'));
                rejectBtn.addEventListener('click', () => handleReject(id));
                
                actions.appendChild(acceptBtn);
                actions.appendChild(rejectBtn);
            }
        }
        
        // Show error message
        alert('Failed to reject referral. Please try again.');
    });
}

// Function to check if referrals list is empty and show a message
function checkEmptyReferrals() {
    const referralsList = document.getElementById('referrals-list');
    if (referralsList.children.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-referrals';
        emptyMessage.textContent = 'No referrals to display';
        emptyMessage.style.padding = '20px';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#666';
        referralsList.appendChild(emptyMessage);
    }
}

// Function to show loading state
function showLoading() {
    const referralsList = document.getElementById('referrals-list');
    referralsList.innerHTML = `
        <div class="loading-container" style="padding: 30px; text-align: center; color: #666;">
            <div>Loading referrals...</div>
        </div>
    `;
}

// Function to show error state
function showError(message) {
    const referralsList = document.getElementById('referrals-list');
    referralsList.innerHTML = `
        <div class="error-container" style="padding: 30px; text-align: center; color: #ea4335;">
            <div>${message}</div>
            <button id="retry-btn" style="margin-top: 15px; padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
    
    document.getElementById('retry-btn').addEventListener('click', fetchReferrals);
}

// Function to fetch referrals from the API
function fetchReferrals() {
    // Show loading state
    showLoading();
    
    // Make API call to get referrals
    fetch('/api/v1/referrals/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch referrals');
        }
        return response.json();
    })
    .then(data => {
        console.log('Referrals fetched successfully:', data);
        
        // Get the referrals from the response
        const referrals = data.data || [];
        
        // Clear and rebuild the referrals list
        const referralsList = document.getElementById('referrals-list');
        referralsList.innerHTML = '';
        
        if (referrals.length === 0) {
            // Show empty state
            checkEmptyReferrals();
            return;
        }
        
        // Add each referral to the list
        referrals.forEach(referral => {
            const referralItem = createReferralItem(referral);
            referralsList.appendChild(referralItem);
        });
    })
    .catch(error => {
        console.error('Error fetching referrals:', error);
        showError('Failed to load referrals. Please try again.');
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load referrals when the page loads
    fetchReferrals();
    
    // Set up refresh button in the header if needed
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
            <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Refresh
    `;
    refreshBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        background: #f1f3f4;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 10px;
        color: #5f6368;
        font-size: 14px;
    `;
    refreshBtn.addEventListener('click', fetchReferrals);
    
    // Add refresh button to the container
    const container = document.querySelector('.container');
    const refreshContainer = document.createElement('div');
    refreshContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
    `;
    refreshContainer.appendChild(refreshBtn);
    container.insertBefore(refreshContainer, document.querySelector('.referrals-container'));
});

document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });

const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', (e)=>{
        localStorage.removeItem('profileData');
        localStorage.removeItem('userData');
        fetch( `/api/v1/users/logout`, {
            method: 'POST', 
            headers: {
                'Authorization' : `Bearer ${userData.accessToken}`
            },
        })
        .then(response => response.json())
        .then((data)=>{
            console.log(data);            window.location.href = '../index.html';
        })
        .catch((error)=>{
            console.log("Error: ", error);
        })
    })