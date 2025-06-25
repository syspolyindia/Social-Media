// Utility to get postId from URL
function getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('postId');
}

// Render the post card
function renderPost(post) {
    const postCard = document.getElementById('postCard');
    if (!post) {
        postCard.innerHTML = '<p style="text-align:center;color:#888;font-size:1.2rem;">Post not found. (Note that you must be signed in to view posts.)</p>';
        return;
    }

    // Create share dialog
    const shareDialog = document.createElement('div');
    shareDialog.className = 'share-dialog';
    shareDialog.innerHTML = `
        <div class="share-content">
            <h3>Share this post</h3>
            <div class="share-link-container">
                <input type="text" readonly value="${window.location.href}" class="share-link-input">
                <button class="copy-link-btn">Copy</button>
            </div>
            <button class="close-dialog-btn">Close</button>
        </div>
    `;
    document.body.appendChild(shareDialog);

    const owner = post.owner || {};
    // Main post card content
    postCard.innerHTML = `
        <div class="post-main-content">
            <div class="post-user-row">
                <img src="${owner.avatar || '/placeholder.svg?height=54&width=54'}" alt="Avatar" class="post-user-avatar">
                <div class="post-user-info">
                    <div class="post-user-name">${owner.fullName || ''}</div>
                    <div class="post-user-username">@${owner.username || ''}</div>
                </div>
            </div>
            <div class="post-content-text">${(post.content || '').replace(/\n/g, '<br>')}</div>
            ${post.link ? `
            <div class="post-link-box">
                <img src="../assets/link.png" class="post-link-icon" alt="link icon" />
                <a href="${post.link}" target="_blank" style="color:inherit;text-decoration:none;">${post.link}</a>
            </div>
            ` : ''}
            ${post.image ? `<div class="post-image-container"><img src="${post.image}" alt="Post Image" class="post-image"></div>` : ''}
            <div class="post-actions-row">
                <div class="like-container">
                    <button class="post-action-btn" title="Like" id="likeBtn">
                        <img src="../assets/like.png" class="post-like-icon" alt="like icon" id="likeIcon" style="width: 28px; height: 28px; display: inline;" />
                        <img src="../assets/liked.png" class="post-like-icon" alt="like icon" id="likedIcon" style="width: 28px; height: 28px; display: none;" />
                    </button>
                    <span class="like-count" id="likeCount">0 likes</span>
                </div>
                <button class="post-action-btn" title="Share" id="shareBtn">
                    <img src="../assets/share.png" class="post-share-icon" alt="share icon" id="shareIcon" style="width: 30px; height: 30px; display: inline;" />
                </button>
            </div>
        </div>
    `;

    // Share button functionality
    const shareBtn = postCard.querySelector('#shareBtn');
    shareBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        shareDialog.style.display = 'flex';
    });

    // Copy button functionality
    const copyBtn = shareDialog.querySelector('.copy-link-btn');
    const linkInput = shareDialog.querySelector('.share-link-input');
    copyBtn.addEventListener('click', function () {
        linkInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    });

    // Close button functionality
    const closeBtn = shareDialog.querySelector('.close-dialog-btn');
    closeBtn.addEventListener('click', function () {
        shareDialog.style.display = 'none';
    });

    // Close dialog when clicking outside
    shareDialog.addEventListener('click', function (e) {
        if (e.target === shareDialog) {
            shareDialog.style.display = 'none';
        }
    });

    // Like button functionality
    document.querySelector('#likeBtn').addEventListener('click', function () {
        const likeIcon = document.getElementById('likeIcon');
        const likedIcon = document.getElementById('likedIcon');
        const postId = getPostIdFromUrl();
        fetch(`/api/v1/likes/toggle-post-like/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.data) {
                    if (likeIcon.style.display === 'inline') {
                        likeIcon.style.display = 'none';
                        likedIcon.style.display = 'inline';
                    }
                    else {
                        likeIcon.style.display = 'inline';
                        likedIcon.style.display = 'none';
                    }
                }
                updateLikeCount(postId);
            })
            .catch((error) => console.log("Error: ", error));
    })
}

// Fetch post data and render
// Fetch and update like count

function checkPostLike(postId){
    fetch(`/api/v1/likes/check-post-like/${postId}`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data && data.data){
            const likeIcon = document.getElementById('likeIcon');
            const likedIcon = document.getElementById('likedIcon');
            if(data.data.isLiked){
                likeIcon.style.display = 'none';
                likedIcon.style.display = 'inline';
            }
            else{
                likeIcon.style.display = 'inline';
                likedIcon.style.display = 'none';
            }
        }
    })
}
function updateLikeCount(postId) {
    fetch(`/api/v1/likes/get-post-likes/${postId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data && data.data) {
                const likeCountElement = document.getElementById('likeCount');
                const count = data.data.likeCount;
                likeCountElement.textContent = `${count} ${count === 1 ? 'like' : 'likes'}`;
            }
        })
        .catch(error => console.log("Error fetching like count:", error));
}

const userData = JSON.parse(localStorage.getItem('userData'));
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

function deleteComment(commentId) {
    fetch(`/api/v1/comments/delete/${commentId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${userData.accessToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.statusCode === 200) {
                fetchAndRenderPost();
            } else {
                console.error('Error deleting comment:', data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting comment:', error);
        });
}

function addComment(postId, comment) {
    fetch(`/api/v1/comments/add/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.accessToken}`
        },
        body: JSON.stringify({ content: comment })
    })
        .then(response => response.json())
        .then(data => {
            if (data.statusCode === 200) {
                fetchAndRenderPost();
            } else {
                console.error('Error adding comment:', data.message);
            }
        })
        .catch(error => {
            console.error('Error adding comment:', error);
        });
}
// Fetch and render comments
async function fetchComments(postId) {
    try {
        const response = await fetch(`/api/v1/comments/${postId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
            }
        });
        const data = await response.json();

        if (data.statusCode === 200) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

function renderComments(comments, callback) {
    const commentsHeader = document.querySelector('.comments-header');
    const commentsList = document.querySelector('.comments-list');
    const userAvatar = document.querySelector('.comment-user-avatar');
    const userData = JSON.parse(localStorage.getItem('userData'));

    // Update comment count
    commentsHeader.textContent = `${comments.length} comment${comments.length !== 1 ? 's' : ''}`;

    // Set current user's avatar
    if (userData && userData.user.avatar) {
        userAvatar.src = userData.user.avatar;
    }

    // Sort comments - user's comments first, then others
    const sortedComments = [...comments].sort((a, b) => {
        const isAOwnComment = userData && a.owner.username === userData.user.username;
        const isBOwnComment = userData && b.owner.username === userData.user.username;

        if (isAOwnComment && !isBOwnComment) return -1;
        if (!isAOwnComment && isBOwnComment) return 1;
        return 0;
    });    // Render comments
    commentsList.innerHTML = sortedComments.map(comment => {
        const isOwnComment = userData && comment.owner.username === userData.user.username;
        const profileLink = isOwnComment ? '../userProfile/profile.html' : `../otherProfile/otherProfile.html?username=${comment.owner.username}`;

        return `            <div class="comment-item">
                <a href="#" onclick="event.preventDefault();navigateToProfile('${comment.owner.username}')" class="comment-user-link">
                    <img src="${comment.owner.avatar || '../assets/user.png'}" alt="${comment.owner.username}'s avatar" class="comment-user-avatar">
                </a>
                <div class="comment-content">
                    <div class="comment-header">
                        <div class="comment-header-left">
                            <a href="#" onclick="event.preventDefault();navigateToProfile('${comment.owner.username}')" class="comment-username">${comment.owner.username}</a>
                        </div>
                        ${isOwnComment ? `
                            <div class="comment-options">
                                <button class="comment-options-btn" data-comment-id="${comment._id}">
                                    <i class="fas fa-ellipsis-h"></i>
                                </button>
                                <div class="comment-options-menu">
                                    <button class="delete-comment-btn">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <p class="comment-text">${comment.content}</p>
                    <div class="comment-actions">
                        <div class="comment-like-container">
                            <button class="comment-like-btn" data-comment-id="${comment._id}">
                                <img src="../assets/like.png" class="comment-like-icon" alt="like icon" id="commentLikeIcon-${comment._id}" style="width: 20px; height: 20px; display: inline;" />
                                <img src="../assets/liked.png" class="comment-like-icon" alt="like icon" id="commentLikedIcon-${comment._id}" style="width: 20px; height: 20px; display: none;" />
                            </button>
                            <span class="comment-like-count" id="commentLikeCount-${comment._id}">0 likes</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (callback) {
        callback();
    }
}

// Function to check if a comment is liked
function checkCommentLike(commentId) {
    fetch(`/api/v1/likes/check-comment-like/${commentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data && data.data) {
            const likeIcon = document.getElementById(`commentLikeIcon-${commentId}`);
            const likedIcon = document.getElementById(`commentLikedIcon-${commentId}`);
            if(data.data.isLiked) {
                likeIcon.style.display = 'none';
                likedIcon.style.display = 'inline';
            } else {
                likeIcon.style.display = 'inline';
                likedIcon.style.display = 'none';
            }
        }
    })
    .catch(error => console.log("Error checking comment like:", error));
}

// Function to update comment like count
function updateCommentLikeCount(commentId) {
    fetch(`/api/v1/likes/get-comment-likes/${commentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data && data.data) {
            const likeCountElement = document.getElementById(`commentLikeCount-${commentId}`);
            const count = data.data.likeCount;
            likeCountElement.textContent = `${count} ${count === 1 ? 'like' : 'likes'}`;
        }
    })
    .catch(error => console.log("Error fetching comment like count:", error));
}

// Function to toggle comment like
function toggleCommentLike(commentId) {
    fetch(`/api/v1/likes/toggle-comment-like/${commentId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data && data.data) {
            const likeIcon = document.getElementById(`commentLikeIcon-${commentId}`);
            const likedIcon = document.getElementById(`commentLikedIcon-${commentId}`);
            if(likeIcon.style.display === 'inline') {
                likeIcon.style.display = 'none';
                likedIcon.style.display = 'inline';
            } else {
                likeIcon.style.display = 'inline';
                likedIcon.style.display = 'none';
            }
            updateCommentLikeCount(commentId);
        }
    })
    .catch(error => console.log("Error toggling comment like:", error));
}

// Update fetchAndRenderPost function


async function fetchAndRenderPost() {
    const postId = getPostIdFromUrl();
    if (!postId) {
        renderPost(null);
        return;
    }

    try {
        const [postResponse, commentsResponse] = await Promise.all([
            fetch(`/api/v1/posts/${postId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).accessToken : ''}`
                }
            }),
            fetchComments(postId)
        ]);

        const postData = await postResponse.json();

        if (postData && postData.data) {
            renderPost(postData.data);
        renderComments(commentsResponse, () => {
                // Add event listener for delete comment button
                document.querySelectorAll('.delete-comment-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const commentId = e.target.closest('.comment-options').querySelector('.comment-options-btn').dataset.commentId;
                    });
                });

                // Add event listeners for comment like buttons and initialize like states
                document.querySelectorAll('.comment-like-btn').forEach(btn => {
                    const commentId = btn.dataset.commentId;
                    btn.addEventListener('click', () => toggleCommentLike(commentId));
                    checkCommentLike(commentId);
                    updateCommentLikeCount(commentId);
                });

                document.querySelector('.comment-send-btn').addEventListener('click', () => {
                    const commentInput = document.querySelector('.comment-input');
                    const comment = commentInput.value.trim();
                    if (comment) {
                        addComment(postId, comment);
                        commentInput.value = '';
                    }
                });

                document.querySelector('.comment-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {  
                        const commentInput = document.querySelector('.comment-input');
                        const comment = commentInput.value.trim();
                        if (comment) {
                            addComment(postId, comment);
                            commentInput.value = '';
                        }
                    }
                });
            });

            // Fetch and display like count
            checkPostLike(postId);
            updateLikeCount(postId);
        } else {
            renderPost(null);
            renderComments([]);
        }
    } catch (error) {
        console.error('Error:', error);
        renderPost(null);
        renderComments([]);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    fetchAndRenderPost();
    document.querySelector('.logo').addEventListener('click', function () {
        window.location.href = '../userProfile/profile.html';
    });

    // After rendering comments, add event listeners for options menu
    document.addEventListener('click', (e) => {
        // Close any open menus when clicking outside
        if (!e.target.closest('.comment-options')) {
            document.querySelectorAll('.comment-options-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }

        // Toggle menu when clicking three dots
        if (e.target.closest('.comment-options-btn')) {
            const btn = e.target.closest('.comment-options-btn');
            const menu = btn.nextElementSibling;

            // Close other menus
            document.querySelectorAll('.comment-options-menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });

            // Toggle this menu
            menu.classList.toggle('active');
            e.stopPropagation();
        }

        // Handle delete button click
        if (e.target.closest('.delete-comment-btn')) {
            const commentId = e.target.closest('.comment-options').querySelector('.comment-options-btn').dataset.commentId;
            if (confirm('Are you sure you want to delete this comment?')) {
                console.log('Delete comment:', commentId);
                deleteComment(commentId);
            }
            e.target.closest('.comment-options-menu').classList.remove('active');
        }
    });
});


