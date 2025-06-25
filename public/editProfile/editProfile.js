document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const coverImageInput = document.getElementById('coverImageInput');
    const coverImage = document.getElementById('coverImage');
    const avatarInput = document.getElementById('avatarInput');
    const avatar = document.getElementById('avatar');
    const fullNameInput = document.getElementById('fullNameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const coverImageSpinner = document.getElementById('coverImageSpinner');
    const avatarSpinner = document.getElementById('avatarSpinner');
    
    // Original values
    const originalName = fullNameInput.value;

    let profileData = {};

    const userData = JSON.parse(localStorage.getItem('userData'));
    fetch(`/api/v1/users/c/${userData.user.username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${userData.accessToken}`
        }
    })
    .then(response => response.json())
    .then((data)=>{
        profileData = data.data;
        if (profileData.coverImage) coverImage.src = profileData.coverImage;
        if (profileData.avatar) avatar.src = profileData.avatar;
        if(profileData.fullName) fullNameInput.value = profileData.fullName;
        localStorage.setItem('profileData', JSON.stringify(profileData));

    })
    .catch(error => {
        console.log('Error fetching user data:', error);
    });

    
    // Function to show toast notifications
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Cover Image Change Handler
    coverImageInput.addEventListener('change', function(e) {
        e.preventDefault();
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            const formData = new FormData();

            formData.append('coverImage', this.files[0]);
            
            // Show spinner
            coverImageSpinner.style.display = 'block';
            coverImage.style.opacity = '0.5';

            reader.onload = function(event) {
                coverImage.src = event.target.result;
                // Action for when cover image is changed
                fetch('/api/v1/users/update-coverImage', {
                    method : 'PATCH',
                    body: formData,
                    headers: {
                        'Authorization' : `Bearer ${userData.accessToken}`
                    }
                })
                .then(response => response.json())
                .then(data =>{
                    console.log(data.data);
                    // Hide spinner
                    coverImageSpinner.style.display = 'none';
                    coverImage.style.opacity = '1';
                    
                    coverImage.src = data.data.coverImage;
                })
                .catch(error =>{
                    console.log("Error: ", error);
                    // Hide spinner
                    coverImageSpinner.style.display = 'none';
                    coverImage.style.opacity = '1';
                })
                showToast('Cover image updated successfully');
                console.log('Cover image changed!');
            };
            

            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Avatar Change Handler
    avatarInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            const formData = new FormData();

            formData.append('avatar', this.files[0]);
            
            // Show spinner
            avatarSpinner.style.display = 'block';
            avatar.style.opacity = '0.5';

            reader.onload = function(event) {
                avatar.src = event.target.result;
                // Action for when avatar is changed
                fetch('/api/v1/users/update-avatar', {
                    method : 'PATCH',
                    body: formData,
                    headers: {
                        'Authorization' : `Bearer ${userData.accessToken}`
                    }
                })
                .then(response => response.json())
                .then(data =>{
                    console.log(data.data);
                    avatar.src = data.data.avatar;
                    // Hide spinner
                    avatarSpinner.style.display = 'none';
                    avatar.style.opacity = '1';
                })
                .catch(error =>{
                    console.log("Error: ", error);
                    // Hide spinner
                    avatarSpinner.style.display = 'none';
                    avatar.style.opacity = '1';
                })
                showToast('Avatar updated successfully');
                console.log('Avatar changed!');
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Full Name Change Handler - Show save button when name changes
    fullNameInput.addEventListener('input', function() {
        if (this.value !== originalName && this.value.trim().length  !== 0) {
            saveNameBtn.classList.remove('hidden');
        } else {
            saveNameBtn.classList.add('hidden');
        }
    });
    
    // Save Name Button Handler
    saveNameBtn.addEventListener('click', function() {
        // Action for when save button is clicked
        const fetchBody = {
            fullName : fullNameInput.value
        }
        fetch('/api/v1/users/update-fullName', {
            method : 'PATCH',
            body: JSON.stringify(fetchBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${userData.accessToken}`
            },
            
        })
        .then(response => response.json())
        .then(data =>{
            console.log(data.data);
            fullNameInput.value = data.data.fullName;
            saveNameBtn.classList.add('hidden');
            showToast('Name updated successfully');
        })
        .catch(error =>{
            console.log("Error: ", error);
        })
        saveNameBtn.classList.add('hidden');
    });
    
    // Logout Button Handler
    document.getElementById('logout').addEventListener('click', function() {
        console.log('Logout clicked');
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
    });

    const notificationBtn = document.getElementById('notificationBtn');
    notificationBtn.addEventListener('click', ()=>{
        
    })

    document.getElementById('backToProfile').addEventListener('click', ()=>{
        window.location.href = "../userProfile/profile.html"
    })

    document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });
});