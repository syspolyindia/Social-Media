const postTextarea = document.querySelector('.post-textarea');
const addImageBtn = document.getElementById('add-image-btn');
const addLinkBtn = document.getElementById('add-link-btn');
const fileInput = document.getElementById('file-input');
const imagePreviewContainer = document.querySelector('.image-preview-container');
const imagePreview = document.querySelector('.image-preview');
const removeImageBtn = document.querySelector('.remove-image-btn');
const createPostBtn = document.getElementById('create-post-btn');
const toastContainer = document.getElementById('toast-container');

let imageUrl = '';
let postLink = '';

// Add logo click event to go to profile.html
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });
}

addImageBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageUrl = e.target.result;
            imagePreview.src = imageUrl;
            imagePreviewContainer.style.display = 'inline-block';
            addImageBtn.disabled = true;
            showToast('Image uploaded', 'Your image has been added to the post', 'success');
        };
        reader.readAsDataURL(file);
    }
});

removeImageBtn.addEventListener('click', () => {
    imageUrl = '';
    imagePreview.src = '';
    imagePreviewContainer.style.display = 'none';
    addImageBtn.disabled = false;
    fileInput.value = '';
});

addLinkBtn.addEventListener('click', () => {
    const url = prompt('Please enter a URL:');
    if (url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            postLink = url;
            showToast('Link added', 'Your link has been added to the post', 'success');
        } else {
            showToast('Invalid URL', 'Please enter a valid URL with http:// or https://', 'error');
        }
    }
});

createPostBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    let content = postTextarea.value.trim();
    const file = fileInput.files[0];
    let link = postLink;

    // Remove the link from content if user pasted it manually
    if (link && content.includes(link)) {
        content = content.replace(link, '').replace(/\n{2,}/g, '\n').trim();
    }

    if (!content) {
        showToast('Cannot create empty post', 'Please add some text to your post', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
        formData.append('image', file);
    }
    if (link) {
        formData.append('link', link);
    }

    const userData = localStorage.getItem('userData');
    const accessToken = userData ? JSON.parse(userData).accessToken : '';

    try {
        const response = await fetch('/api/v1/posts/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });
        const data = await response.json();
        if (response.ok && data && data.data && data.data._id) {
            showToast('Post created!', 'Your post has been published successfully', 'success');
            setTimeout(() => {
                window.location.href = "../post/post.html?postId=" + data.data._id;
            }, 1000);
        } else {
            showToast('Error', data.message || 'Failed to create post', 'error');
        }
    } catch (error) {
        showToast('Error', 'Failed to create post', 'error');
    }
});

function showToast(title, description, type = 'success') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    const toastTitle = document.createElement('div');
    toastTitle.classList.add('toast-title');
    toastTitle.textContent = title;

    const toastDesc = document.createElement('div');
    toastDesc.classList.add('toast-description');
    toastDesc.textContent = description;

    toast.appendChild(toastTitle);
    toast.appendChild(toastDesc);
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

const notificationBtn = document.getElementById('notificationBtn');
    notificationBtn.addEventListener('click', ()=>{
        window.location.href = '../viewReferral/viewReferral.html'
    })

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
            window.location.href = '../login/login.html';
        })
        .catch((error)=>{
            console.log("Error: ", error);
        })
    })