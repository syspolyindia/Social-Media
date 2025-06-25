document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form")
  const avatarInput = document.getElementById("avatar")
  const coverImageInput = document.getElementById("coverImage")
  const avatarPreview = document.getElementById("avatar-preview")
  const coverImagePreview = document.getElementById("coverImage-preview")
  const avatarPlaceholder = document.getElementById("avatar-placeholder")
  const coverPlaceholder = document.getElementById("cover-placeholder")

  // Create a custom notification element
  function createNotification() {
    // Check if notification already exists
    let notification = document.getElementById("custom-notification")
    if (!notification) {
      notification = document.createElement("div")
      notification.id = "custom-notification"
      notification.style.position = "fixed"
      notification.style.top = "20px"
      notification.style.left = "50%"
      notification.style.transform = "translateX(-50%)"
      notification.style.padding = "15px 25px"
      notification.style.borderRadius = "5px"
      notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)"
      notification.style.zIndex = "9999"
      notification.style.fontWeight = "bold"
      notification.style.transition = "opacity 0.3s ease"
      document.body.appendChild(notification)
    }
    return notification
  }

  // Show notification
  function showNotification(message, type) {
    const notification = createNotification()
    notification.textContent = message

    if (type === "success") {
      notification.style.backgroundColor = "#059669"
      notification.style.color = "white"
    } else {
      notification.style.backgroundColor = "#dc2626"
      notification.style.color = "white"
    }

    notification.style.opacity = "1"

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 5000)
  }

  // Success notification function
  function showSuccessNotification() {
    showNotification("Registration successful! ✅", "success")
  }

  // Error notification function
  function showErrorNotification(message) {
    showNotification(message || "Registration failed", "error")
  }

  // Handle image previews
  function handleImagePreview(fileInput, previewElement, placeholderElement) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
          const img = document.createElement("img")
          img.src = e.target.result

          // Clear previous preview and show new image
          previewElement.innerHTML = ""
          previewElement.appendChild(img)
          previewElement.classList.add("has-image")

          // Hide placeholder
          if (placeholderElement) {
            placeholderElement.style.display = "none"
          }
        }

        reader.readAsDataURL(file)
      } else {
        previewElement.innerHTML = ""
        previewElement.classList.remove("has-image")
        if (placeholderElement) {
          placeholderElement.style.display = "block"
        }
      }
    })
  }

  handleImagePreview(avatarInput, avatarPreview, avatarPlaceholder)
  handleImagePreview(coverImageInput, coverImagePreview, coverPlaceholder)

  // Handle password visibility toggle
  document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target")
      const passwordInput = document.getElementById(targetId)

      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        this.textContent = "🔒"
      } else {
        passwordInput.type = "password"
        this.textContent = "👁️"
      }
    })
  })

  // Form validation
  function validateForm() {
    let isValid = true
    const errors = {}

    // Reset previous errors
    document.querySelectorAll(".error").forEach((error) => {
      error.textContent = ""
    })

    // Username validation
    const username = document.getElementById("username").value.trim()
    if (!username) {
      errors.username = "Username is required"
      isValid = false
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters"
      isValid = false
    }

    // Email validation
    const email = document.getElementById("email").value.trim()
    if (!email) {
      errors.email = "Email is required"
      isValid = false
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    // Full name validation
    const fullName = document.getElementById("fullName").value.trim()
    if (!fullName) {
      errors.fullName = "Full name is required"
      isValid = false
    }

    // Avatar validation
    if (!avatarInput.files[0]) {
      errors.avatar = "Profile picture is required"
      isValid = false
    }

    // Password validation
    const password = document.getElementById("password").value
    if (!password) {
      errors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
      isValid = false
    }

    // Confirm password validation
    const confirmPassword = document.getElementById("confirmPassword").value
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    // Display errors if any
    Object.keys(errors).forEach((field) => {
      const errorElement = document.getElementById(`${field}-error`)
      if (errorElement) {
        errorElement.textContent = errors[field]
      }
    })

    return isValid
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Form submission - COMPLETELY REWRITTEN
  if (form) {
    // Use the submit button click instead of form submit
    const submitButton = form.querySelector(".btn-register")

    submitButton.addEventListener("click", async (e) => {
      // Prevent any default behavior
      e.preventDefault()
      e.stopPropagation()

      console.log("Submit button clicked")

      if (validateForm()) {
        // Disable button
        const originalText = submitButton.textContent
        submitButton.disabled = true
        submitButton.textContent = "Creating Account..."

        try {
          // Create FormData object
          const formData = new FormData()

          // Get form field values
          const username = document.getElementById("username").value.trim()
          const email = document.getElementById("email").value.trim()
          const fullName = document.getElementById("fullName").value.trim()
          const password = document.getElementById("password").value

          // Append text fields and files
          formData.append("avatar", avatarInput.files[0])
          if (coverImageInput.files[0]) {
            formData.append("coverImage", coverImageInput.files[0])
          }
          formData.append("username", username)
          formData.append("email", email)
          formData.append("fullName", fullName)
          formData.append("password", password)

          console.log("Sending fetch request")

          // Use XMLHttpRequest instead of fetch for better compatibility
          const xhr = new XMLHttpRequest()
          xhr.open("POST", "/api/v1/users/register", true)

          xhr.onload = () => {
            console.log("XHR response received:", xhr.status)

            const response = xhr.responseText;

            let parsed;
            try {
              parsed = JSON.parse(response); // try parsing JSON response
            } catch (e) {
              parsed = {};
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              console.log("Registration successful")
              showSuccessNotification()
            } else {
              console.error("Registration failed:", parsed?.message || "Unknown error")
              showErrorNotification(parsed?.message || "Registration failed. Server returned an error.")
            }

            // Re-enable button
            submitButton.disabled = false
            submitButton.textContent = originalText
          }

          xhr.onerror = () => {
            console.error("XHR request failed")

            let parsed;
            try {
              parsed = JSON.parse(xhr.responseText);
            } catch (e) {
              parsed = {};
            }

            showErrorNotification(parsed?.message || "Registration failed. Network error.")
            submitButton.disabled = false
            submitButton.textContent = originalText
          }

          xhr.send(formData)
        } catch (error) {
          console.error("Registration error:", error)
          showErrorNotification("Registration failed. Please try again.")
          submitButton.disabled = false
          submitButton.textContent = originalText
        }
      }

      // Ensure the form doesn't submit
      return false
    })

    // Additional safety: prevent form from submitting via other means
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    })
  }

  // Handle logo click if it exists
  const logoElement = document.querySelector(".logo")
  if (logoElement) {
    logoElement.addEventListener("click", () => {
      window.location.href = "../userProfile/profile.html"
    })
  }
})
