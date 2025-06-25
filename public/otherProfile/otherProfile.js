// DOM Elements
document.addEventListener('DOMContentLoaded', function () {
    // Profile elements
    const avatarElement = document.getElementById('avatar');
    const coverImageElement = document.getElementById('coverImage');
    const fullNameElement = document.getElementById('fullName');
    const usernameElement = document.getElementById('username');
    const subscribersElement = document.getElementById('subscribers');

    let otherProfileData = JSON.parse(localStorage.getItem('otherProfileData'));
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Example of how to update the profile with data from backend
    function updateProfile(otherProfileData) {
        // Update profile elements with data
        if (otherProfileData.username === userData.user.username) {
            document.getElementById('subscribeBtn').remove();
        }
        if (otherProfileData.avatar) {
            avatarElement.src = otherProfileData.avatar;
        }

        if (otherProfileData.coverImage) {
            coverImageElement.src = otherProfileData.coverImage;
        }

        if (otherProfileData.fullName) {
            fullNameElement.textContent = otherProfileData.fullName;
            document.title = `${otherProfileData.fullName} - Social Media Profile`;
        }

        if (otherProfileData.username) {
            usernameElement.textContent = `@${otherProfileData.username}`;
        }

        if (otherProfileData.subscribersCount !== undefined) {
            subscribersElement.textContent = `${otherProfileData.subscribersCount} subscribers`;
        }
    }




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
            postDiv.className = 'post-card';            // Create a share dialog div
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
                        </div>
                    </div>
                    <div class="post-image-col">
                        ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                    </div>
                </div>
            `;            // Add event for share button and dialog
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

            postDiv.addEventListener('click', function (e) {
                // Prevent click on action buttons from triggering card click
                if (e.target.closest('.post-action-btn')) return;
                window.location.href = `../post/post.html?postId=${post._id}`;
            });
            myPostsContainer.appendChild(postDiv);
        });
    }

    // Fetch posts from API
    function fetchUserPosts() {
        const userId = otherProfileData._id;
        fetch(`/api/v1/posts/u/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data && data.data) {
                    renderUserPosts(data.data);
                }
            })
            .catch(error => {
                console.log('Error fetching user posts:', error);
            });
    }

    // Initially hide the subscribe button
if(document.querySelector('.subscribe-btn')){
    document.querySelector('.subscribe-btn').style.display = 'none';
}
let userSubscribed = undefined;
function checkUserSubscription(){
    const otherUserId = otherProfileData._id;
    fetch(`/api/v1/subscriptions/check/${otherUserId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userData.accessToken}`
        }
    })
    .then((response) => response.json())
    .then((data) => {
        userSubscribed = data.data.subscription;
        if(data?.data?.subscription){
            document.querySelector('.subscribe-btn').innerHTML = "Unsubscribe";
            document.querySelector('.subscribe-btn').style.backgroundColor = "grey";
            document.querySelector('.subscribe-btn').style.boxShadow = "0 0 10px rgba(128, 128, 128, 0.3)";
        }
        else{
            document.querySelector('.subscribe-btn').innerHTML = "Subscribe";
            document.querySelector('.subscribe-btn').style.backgroundColor = "#ea384c";
        }
        // Show the subscribe button after the function has completed
        document.querySelector('.subscribe-btn').style.display = 'block';
    })
    .catch((error) => {
        console.log('Error checking user subscriptions:', error);
    });
}
async function fetchUserProfile(){
    try {
            const res = await fetch(`/api/v1/users/c/${otherProfileData.username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userData.accessToken}`
                }
            });
            const data = await res.json();
            otherProfileData = data.data;

            localStorage.setItem('otherProfileData', JSON.stringify(otherProfileData));

            updateProfile(otherProfileData);

        } catch (error) {
            console.log('Error fetching user data:', error);
        }
}
function toggleSubscription(){
    if(!document.querySelector('.subscribe-btn')) return;
    document.querySelector('.subscribe-btn').addEventListener('click', () => {
        const otherUserId = otherProfileData._id;
        fetch(`/api/v1/subscriptions/toggle/${otherUserId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            checkUserSubscription();
        })
        .catch(error => {
            console.log('Error toggling subscription:', error);
        });
    })
}
    fetchUserProfile();
    checkUserSubscription();
    toggleSubscription();
    fetchUserPosts();
})