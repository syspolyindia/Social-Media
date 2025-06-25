// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Profile elements
    const avatarElement = document.getElementById('avatar');
    const coverImageElement = document.getElementById('coverImage');
    const fullNameElement = document.getElementById('fullName');
    const usernameElement = document.getElementById('username');
    const subscribersElement = document.getElementById('subscribers');
    const referralPointsElement = document.getElementById('referralPoints');

    let profileData = {};

    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log(userData)
    fetch(`/api/v1/users/c/${userData.user.username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userData.accessToken}`
        }
    })
    .then(response => response.json())
    .then((data)=>{
        profileData = data.data;
        updateProfile(profileData)
        localStorage.setItem('profileData', JSON.stringify(profileData));
    })
    .catch(error => {
        console.log('Error fetching user data:', error);
    });
    
    // Example of how to update the profile with data from backend
    function updateProfile(profileData) {
        // Update profile elements with data
        if (profileData.avatar) {
            avatarElement.src = profileData.avatar;
        }
        
        if (profileData.coverImage) {
            coverImageElement.src = profileData.coverImage;
        }
        
        if (profileData.fullName) {
            fullNameElement.textContent = profileData.fullName;
            document.title = `${profileData.fullName} - Social Media Profile`;
        }
        
        if (profileData.username) {
            usernameElement.textContent = `@${profileData.username}`;
        }
        
        if (profileData.subscribersCount !== undefined) {
            subscribersElement.textContent = `${profileData.subscribersCount} subscribers`;
        }
        
        if (profileData.referralPoints !== undefined) {
            referralPointsElement.textContent = `Referral Points: ${profileData.referralPoints}`;
        }
    }
    

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
            console.log(data);
            window.location.href = '../index.html';
        })
        .catch((error)=>{
            console.log("Error: ", error);
        })
    })

    const notificationBtn = document.getElementById('notificationBtn');
    notificationBtn.addEventListener('click', ()=>{
        window.location.href = "../viewReferral/viewReferral.html";
    })
    // Event listeners for buttons
    const createReferralBtn = document.querySelector('.create-referral');
    const subscriptionsBtn = document.querySelector('.subscriptions');
    const editProfileBtn = document.querySelector('.edit-profile');
    
    createReferralBtn.addEventListener('click', function() {
        console.log('Create Referral button clicked');
        window.location.href = '../createReferral/createReferral.html'
    });
    
    subscriptionsBtn.addEventListener('click', function() {
        console.log('Subscriptions button clicked');
        window.location.href = '../subscriptions/subscriptions.html';
    });
    
    editProfileBtn.addEventListener('click', function() {
        console.log('Edit Profile button clicked');
        window.location.href = '../editProfile/editProfile.html';
    });

    // Search input enter key event
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
                .then((data)=>{
                    localStorage.setItem('otherProfileData', JSON.stringify(data.data))
                    window.location.href = '../otherProfile/otherProfile.html';

                })
                .catch(error => {
                    console.log('Error fetching user data:', error);
                });
            }
        });
    }

    document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });

    // Fetch and render user's posts
    function renderUserPosts(posts) {
        const myPostsContainer = document.getElementById('myPostsContainer');
        myPostsContainer.innerHTML = '';
        if (!posts || posts.length === 0) {
            myPostsContainer.innerHTML = '<p class="no-posts-message">No Posts Yet.</p>';
            return;
        }
        posts.forEach(post => {
            // Truncate content for preview
            const previewContent = post.content.length > 300 ? post.content.slice(0, 300) + '...' : post.content;
            const postDiv = document.createElement('div');
            postDiv.className = 'post-card';
            // Create a share dialog div
            const shareDialog = document.createElement('div');
            shareDialog.className = 'share-dialog';
            shareDialog.innerHTML = `
                <div class="share-content">
                    <h3>Share this post</h3>
                    <div class="share-link-container">
                        <input type="text" readonly value="${window.location.origin}/frontend/post/post.html?postId=${post._id}" class="share-link-input">
                        <button class="copy-link-btn">Copy</button>
                    </div>
                    <button class="close-dialog-btn">Close</button>
                </div>
            `;
            document.body.appendChild(shareDialog);

            postDiv.innerHTML = `
                <div class="post-content-row">
                    <div class="post-content-col">
                        <div class="post-content">${previewContent}</div>
                        <div class="post-actions">
                            <button class="post-action-btn share-btn" title="Share">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                            </button>
                            <button class="post-action-btn delete-btn" title="Delete">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                        </div>
                    </div>
                    <div class="post-image-col">
                        ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                    </div>
                </div>
            `;
            // Add event for share button and dialog
            const shareBtn = postDiv.querySelector('.share-btn');
            shareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                shareDialog.style.display = 'flex';
            });

            // Add event for copy button
            const copyBtn = shareDialog.querySelector('.copy-link-btn');
            const linkInput = shareDialog.querySelector('.share-link-input');
            copyBtn.addEventListener('click', function() {
                linkInput.select();
                document.execCommand('copy');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });

            // Add event for close button
            const closeBtn = shareDialog.querySelector('.close-dialog-btn');
            closeBtn.addEventListener('click', function() {
                shareDialog.style.display = 'none';
            });

            // Close dialog when clicking outside
            shareDialog.addEventListener('click', function(e) {
                if (e.target === shareDialog) {
                    shareDialog.style.display = 'none';
                }
            });

            // Add event for delete button
            const deleteBtn = postDiv.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this post?')) {
                    const userData = JSON.parse(localStorage.getItem('userData'));
                    fetch(`/api/v1/posts/${post._id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${userData.accessToken}`
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.statusCode === 200) {
                            alert('Post deleted successfully');
                            postDiv.remove();
                        } else {
                            alert(data.message || 'Failed to delete post');
                        }
                    })
                    .catch(error => {
                        alert('Error deleting post');
                    });
                }
            });
            postDiv.addEventListener('click', function(e) {
                // Prevent click on action buttons from triggering card click
                if (e.target.closest('.post-action-btn')) return;
                window.location.href = `../post/post.html?postId=${post._id}`;
            });
            myPostsContainer.appendChild(postDiv);
        });
    }

    // Fetch posts from API
    function fetchUserPosts() {
        const userId = userData.user._id;
        console.log(userId)
        fetch(`/api/v1/posts/u/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.data);
            if (data && data.data) {
                renderUserPosts(data.data);
            }
        })
        .catch(error => {
            console.log('Error fetching user posts:', error);
        });
    }

    fetchUserPosts();

    const addPostBtn = document.querySelector('.add-post-btn');
    if (addPostBtn) {
        addPostBtn.addEventListener('click', function() {
            window.location.href = '../createPost/createPost.html';
        });
    }
});