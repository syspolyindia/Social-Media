document.querySelector('.logo').addEventListener('click', function() {
        window.location.href = '../userProfile/profile.html';
    });

const userData = JSON.parse(localStorage.getItem('userData'));

const form = document.getElementById('referral-form');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const referredUserUsername = document.getElementById('referred-user').value;
    const referredToUsername = document.getElementById('shared-with-user').value;

    let data;

    if(referredUserUsername && referredToUsername){
        data = {
            referredToUsername,
            referredUserUsername
        }
    }
    else{
        console.error("You need to fill the usernames");
    }

    
    try {
        const response = await fetch('/api/v1/referrals/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userData.accessToken}`,
                'Content-Type': 'application/json'
                
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            showMessage('Referral created successfully!', 'success');
            document.getElementById('referred-user').value = "";
            document.getElementById('shared-with-user').value = "";
        } else {
            console.error('Error creating referral:', response.statusText);
            showMessage('Failed to create referral. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
});

// Add message display function at the end of the file
function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create and style the message element
    const messageElement = document.createElement('div');
    messageElement.className = `message-popup ${type}`;
    messageElement.textContent = message;

    // Add to document
    document.body.appendChild(messageElement);

    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}
