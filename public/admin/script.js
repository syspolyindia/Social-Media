// Sample data for posts
const posts = [
  {
    id: 1,
    owner: "John Doe",
    content:
      "This is a long post about web development. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.",
    image: "https://via.placeholder.com/150",
    link: "https://example.com/post1",
    date: "2023-05-15",
  },
  {
    id: 2,
    owner: "Jane Smith",
    content:
      "Check out my new photography portfolio! I've been working on it for months and I'm really proud of how it turned out.",
    image: "https://via.placeholder.com/150",
    link: "https://example.com/post2",
    date: "2023-05-14",
  },
  {
    id: 3,
    owner: "Mike Johnson",
    content:
      "Just launched my new startup! We're building a platform for creators to monetize their content more effectively.",
    image: "https://via.placeholder.com/150",
    link: "https://example.com/post3",
    date: "2023-05-13",
  },
  {
    id: 4,
    owner: "Sarah Williams",
    content:
      "Here's my take on the latest tech trends. I think AI and machine learning will continue to dominate the conversation in the coming years.",
    image: "https://via.placeholder.com/150",
    link: "https://example.com/post4",
    date: "2023-05-12",
  },
  {
    id: 5,
    owner: "David Brown",
    content:
      "Just finished reading an amazing book on personal development. Highly recommend it to everyone looking to improve themselves.",
    image: "https://via.placeholder.com/150",
    link: "https://example.com/post5",
    date: "2023-05-11",
  },
]

// Sample data for users
const users = [
  {
    id: 1,
    username: "johndoe",
    fullName: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/800x200",
    referralPoints: 250,
    date: "2023-01-15",
    status: "active",
  },
  {
    id: 2,
    username: "janesmith",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/800x200",
    referralPoints: 120,
    date: "2023-02-20",
    status: "active",
  },
  {
    id: 3,
    username: "mikejohnson",
    fullName: "Mike Johnson",
    email: "mike.johnson@example.com",
    avatar: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/800x200",
    referralPoints: 75,
    date: "2023-03-10",
    status: "inactive",
  },
  {
    id: 4,
    username: "sarahwilliams",
    fullName: "Sarah Williams",
    email: "sarah.williams@example.com",
    avatar: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/800x200",
    referralPoints: 320,
    date: "2023-01-05",
    status: "active",
  },
  {
    id: 5,
    username: "davidbrown",
    fullName: "David Brown",
    email: "david.brown@example.com",
    avatar: "https://via.placeholder.com/150",
    coverImage: "https://via.placeholder.com/800x200",
    referralPoints: 0,
    date: "2023-04-25",
    status: "pending",
  },
]

// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "index.html"
}

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  // Toggle sidebar
  const toggleBtn = document.getElementById("toggle-sidebar")
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.querySelector(".admin-container").classList.toggle("sidebar-collapsed")
    })
  }

  // Initialize post management page if we're on that page
  const postsTable = document.getElementById("posts-table")
  if (postsTable) {
    initializePostManagement()
  }

  // Initialize user management page if we're on that page
  const usersTable = document.getElementById("users-table")
  if (usersTable) {
    initializeUserManagement()
  }

  // Load dashboard data
  loadDashboardData()
})

function initializePostManagement() {
  // Populate posts table
  populatePostsTable(posts)

  // Set up search functionality
  const searchInput = document.getElementById("post-search")
  const searchBtn = document.getElementById("search-btn")

  searchBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.toLowerCase()
    const filteredPosts = posts.filter(
      (post) => post.owner.toLowerCase().includes(searchTerm) || post.content.toLowerCase().includes(searchTerm),
    )
    populatePostsTable(filteredPosts)
  })

  // Search on enter key
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      searchBtn.click()
    }
  })

  // Set up modal functionality
  const modal = document.getElementById("post-modal")
  const closeModal = document.querySelector("#post-modal .close-modal")

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none"
    })
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none"
    }
  })
}

function populatePostsTable(postsData) {
  const tableBody = document.querySelector("#posts-table tbody")
  tableBody.innerHTML = ""

  postsData.forEach((post) => {
    const row = document.createElement("tr")

    // Truncate content for table display
    const truncatedContent = post.content.length > 50 ? post.content.substring(0, 50) + "..." : post.content

    row.innerHTML = `
            <td>${post.owner}</td>
            <td class="truncate">${truncatedContent}</td>
            <td><a href="${post.image}" target="_blank" class="link">View Image</a></td>
            <td><a href="${post.link}" target="_blank" class="link">View Link</a></td>
            <td>${formatDate(post.date)}</td>
            <td class="action-cell">
                <button class="action-btn view-btn" data-id="${post.id}"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn delete-btn" data-id="${post.id}"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `

    tableBody.appendChild(row)
  })

  // Add event listeners to view buttons
  document.querySelectorAll(".view-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postId = Number.parseInt(this.getAttribute("data-id"))
      viewPost(postId)
    })
  })

  // Add event listeners to delete buttons
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const postId = Number.parseInt(this.getAttribute("data-id"))
      deletePost(postId)
    })
  })
}

function viewPost(postId) {
  const post = posts.find((p) => p.id === postId)
  if (!post) return

  const modalContent = document.getElementById("modal-post-content")
  modalContent.innerHTML = `
        <div class="post-details">
            <p><strong>Owner:</strong> ${post.owner}</p>
            <p><strong>Date:</strong> ${formatDate(post.date)}</p>
            <p><strong>Content:</strong> ${post.content}</p>
            <p><strong>Image:</strong> <a href="${post.image}" target="_blank" class="link">View Image</a></p>
            <p><strong>Link:</strong> <a href="${post.link}" target="_blank" class="link">${post.link}</a></p>
        </div>
    `

  document.getElementById("post-modal").style.display = "block"
}

function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    // Filter out the deleted post
    const postIndex = posts.findIndex((p) => p.id === postId)
    if (postIndex !== -1) {
      posts.splice(postIndex, 1)
      populatePostsTable(posts)
      alert("Post deleted successfully!")
    }
  }
}

function initializeUserManagement() {
  // Populate users table
  populateUsersTable(users)

  // Set up search functionality
  const searchInput = document.getElementById("user-search")
  const searchBtn = document.getElementById("search-btn")

  searchBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.toLowerCase()
    const filteredUsers = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.fullName.toLowerCase().includes(searchTerm),
    )
    populateUsersTable(filteredUsers)
  })

  // Search on enter key
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      searchBtn.click()
    }
  })

  // Set up user modal functionality
  const userModal = document.getElementById("user-modal")
  const closeUserModal = document.querySelector("#user-modal .close-modal")

  if (closeUserModal) {
    closeUserModal.addEventListener("click", () => {
      userModal.style.display = "none"
    })
  }

  window.addEventListener("click", (event) => {
    if (event.target === userModal) {
      userModal.style.display = "none"
    }
  })

  // Set up status modal functionality
  const statusModal = document.getElementById("status-modal")
  const closeStatusModal = document.querySelector("#status-modal .close-modal")
  const cancelStatusBtn = document.getElementById("cancel-status")
  const saveStatusBtn = document.getElementById("save-status")

  let currentUserId = null

  if (closeStatusModal) {
    closeStatusModal.addEventListener("click", () => {
      statusModal.style.display = "none"
    })
  }

  if (cancelStatusBtn) {
    cancelStatusBtn.addEventListener("click", () => {
      statusModal.style.display = "none"
    })
  }

  if (saveStatusBtn) {
    saveStatusBtn.addEventListener("click", () => {
      const selectedStatus = document.querySelector('input[name="status"]:checked').value

      // Update user status
      const userIndex = users.findIndex((u) => u.id === currentUserId)
      if (userIndex !== -1) {
        users[userIndex].status = selectedStatus
        populateUsersTable(users)
        statusModal.style.display = "none"
        alert("User status updated successfully!")
      }
    })
  }

  window.addEventListener("click", (event) => {
    if (event.target === statusModal) {
      statusModal.style.display = "none"
    }
  })

  // Function to open status edit modal
  window.editUserStatus = (userId) => {
    currentUserId = userId
    const user = users.find((u) => u.id === userId)

    if (user) {
      // Set the current status in the modal
      document.querySelectorAll('input[name="status"]').forEach((radio) => {
        radio.checked = radio.value === user.status
      })

      statusModal.style.display = "block"
    }
  }
}

function populateUsersTable(usersData) {
  const tableBody = document.querySelector("#users-table tbody")
  tableBody.innerHTML = ""

  usersData.forEach((user) => {
    const row = document.createElement("tr")

    // Create status badge based on user status
    let statusBadgeClass = ""
    switch (user.status) {
      case "active":
        statusBadgeClass = "status-active"
        break
      case "inactive":
        statusBadgeClass = "status-inactive"
        break
      case "pending":
        statusBadgeClass = "status-pending"
        break
      default:
        statusBadgeClass = ""
    }

    row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><a href="${user.avatar}" target="_blank" class="link">View Avatar</a></td>
            <td><a href="${user.coverImage}" target="_blank" class="link">View Cover</a></td>
            <td class="text-center referral-points">${user.referralPoints}</td>
            <td>${formatDate(user.date)}</td>
            <td>
                <span class="status-badge ${statusBadgeClass}">${capitalizeFirstLetter(user.status)}</span>
                <button class="action-btn-transparent" onclick="editUserStatus(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td class="actions-cell">
                <button class="action-btn-transparent" onclick="viewUser(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn-transparent" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `

    tableBody.appendChild(row)
  })
}

// Function to delete a user
window.deleteUser = (userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    // Filter out the deleted user
    const userIndex = users.findIndex((u) => u.id === userId)
    if (userIndex !== -1) {
      users.splice(userIndex, 1)
      populateUsersTable(users)
      alert("User deleted successfully!")
    }
  }
}

// Fetch dashboard data from API
async function fetchDashboardData() {
  try {
    const response = await fetch("/api/v1/dashboard/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.statusCode === 200) {
      return data.data
    } else {
      throw new Error(data.message || "Failed to fetch dashboard data")
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return null
  }
}

// Update dashboard statistics
function updateDashboardStats(data) {
  // Update Post Management card
  const totalPostsElement = document.getElementById("total-posts")
  if (totalPostsElement) {
    totalPostsElement.textContent = data.postCount || 0
  }

  // Update User Management card
  const activeUsersElement = document.getElementById("active-users")
  const inactiveUsersElement = document.getElementById("inactive-users")
  if (activeUsersElement) {
    activeUsersElement.textContent = data.activeUserCount || 0
  }
  if (inactiveUsersElement) {
    inactiveUsersElement.textContent = data.inactiveUserCount || 0
  }

  // Update Referral Management card
  const acceptedReferralsElement = document.getElementById("accepted-referrals")
  const pendingReferralsElement = document.getElementById("pending-referrals")
  if (acceptedReferralsElement) {
    acceptedReferralsElement.textContent = data.acceptedReferralCount || 0
  }
  if (pendingReferralsElement) {
    pendingReferralsElement.textContent = data.pendingReferralCount || 0
  }

  // Update Comment Management card
  const totalCommentsElement = document.getElementById("total-comments")
  if (totalCommentsElement) {
    totalCommentsElement.textContent = data.commentCount || 0
  }

  // Update Subscription Management card
  const totalSubscriptionsElement = document.getElementById("total-subscriptions")
  if (totalSubscriptionsElement) {
    totalSubscriptionsElement.textContent = data.subscriptionCount || 0
  }
}

// Handle loading state
function setLoadingState(isLoading) {
  const statValues = document.querySelectorAll(".stat-value")
  statValues.forEach((element) => {
    if (isLoading) {
      element.textContent = "Loading..."
      element.style.color = "#7f8c8d"
    } else {
      element.style.color = "#2c3e50"
    }
  })
}

// Handle error state
function setErrorState() {
  const statValues = document.querySelectorAll(".stat-value")
  statValues.forEach((element) => {
    element.textContent = "Error"
    element.style.color = "#e74c3c"
  })
}

// Load and display dashboard data
async function loadDashboardData() {
  setLoadingState(true)

  try {
    const dashboardData = await fetchDashboardData()

    if (dashboardData) {
      updateDashboardStats(dashboardData)
      setLoadingState(false)
    } else {
      setErrorState()
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    setErrorState()
  }
}

// Helper function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" }
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", options)
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
