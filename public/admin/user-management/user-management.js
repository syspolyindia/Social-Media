// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "../index.html"
}

// DOM Elements
const usersTable = document.getElementById("users-table")
const userSearch = document.getElementById("user-search")
const searchBtn = document.getElementById("search-btn")
const filterStatus = document.getElementById("filter-status")
const filterDateFrom = document.getElementById("filter-date-from")
const filterDateTo = document.getElementById("filter-date-to")
const clearFiltersBtn = document.getElementById("clear-filters-btn")
const userModal = document.getElementById("user-modal")
const modalContent = document.getElementById("modal-user-content")
const statusModal = document.getElementById("status-modal")
const closeUserModal = userModal.querySelector(".close-modal")
const closeStatusModal = statusModal.querySelector(".close-modal")
const cancelStatusBtn = statusModal.querySelector(".cancel-btn")
const saveStatusBtn = statusModal.querySelector(".save-btn")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Close modals when clicking X or outside
closeUserModal.addEventListener("click", () => (userModal.style.display = "none"))
closeStatusModal.addEventListener("click", () => (statusModal.style.display = "none"))
cancelStatusBtn.addEventListener("click", () => (statusModal.style.display = "none"))

window.addEventListener("click", (e) => {
  if (e.target === userModal) userModal.style.display = "none"
  if (e.target === statusModal) statusModal.style.display = "none"
})

// Fetch all users from API
async function fetchUsers() {
  try {
    const response = await fetch("/api/v1/user-management/", {
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) {
      return data.data
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Render users in table
function renderUsers(users) {
  const tbody = usersTable.querySelector("tbody")
  tbody.innerHTML = ""

  users.forEach((user) => {
    const tr = document.createElement("tr")

    // Convert boolean status to text
    const statusText = user.status ? "Active" : "Inactive"
    const statusClass = user.status ? "active" : "inactive"

    // Format date
    const formattedDate = new Date(user.createdAt).toLocaleDateString("en-GB")

    tr.innerHTML = `
            <td>${user.username || "N/A"}</td>
            <td>${user.fullName || "N/A"}</td>
            <td>${user.email || "N/A"}</td>
            <td>${user.avatar ? `<a href="#" class="view-avatar" data-id="${user._id}">View</a>` : "No avatar"}</td>
            <td>${user.coverImage ? `<a href="#" class="view-cover" data-id="${user._id}">View</a>` : "No cover"}</td>
            <td class="referral-points">${user.referralPoints || 0}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
                <button class="edit-status-btn" data-id="${user._id}" data-status="${statusClass}" title="Edit Status">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>
    <button class="delete-btn" data-id="${user._id}" title="Delete">
        <i class="fas fa-trash"></i>
    </button>
</td>
        `

    tbody.appendChild(tr)
  })
}

// Show user details in modal
function showUserDetails(user, imageType) {
  let imageUrl = ""
  let imageTitle = ""

  if (imageType === "avatar") {
    imageUrl = user.avatar
    imageTitle = "Avatar"
  } else if (imageType === "cover") {
    imageUrl = user.coverImage
    imageTitle = "Cover Image"
  }

  modalContent.innerHTML = `
        <div class="user-details">
            <h3>${imageTitle}</h3>
            <img src="${imageUrl}" alt="${imageTitle}" style="max-width: 100%; border-radius: 8px;">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Full Name:</strong> ${user.fullName}</p>
        </div>
    `

  userModal.style.display = "block"
}

// Show status edit modal
function showStatusModal(userId, currentStatus) {
  const statusInputs = statusModal.querySelectorAll('input[name="status"]')

  // Set the current status
  for (const input of statusInputs) {
    if (input.value === currentStatus) {
      input.checked = true
    }
  }

  // Store the user ID for the save button
  saveStatusBtn.dataset.userId = userId

  statusModal.style.display = "block"
}

// Update user status
async function updateUserStatus(userId, newStatus) {
  try {
    // Convert text status to boolean for API
    const statusBoolean = newStatus === "active"

    const response = await fetch(`/api/v1/user-management/${userId}/change-status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminData.accessToken}`,
      },
      body: JSON.stringify({ status: statusBoolean }),
    })

    const data = await response.json()

    if (data.statusCode === 200) {
      // Update the user in the local array
      const userIndex = allUsers.findIndex((u) => u._id === userId)
      if (userIndex !== -1) {
        allUsers[userIndex].status = statusBoolean
        applyFilters() // Use applyFilters instead of renderUsers to maintain current filters
      }
      return true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error updating user status:", error)
    return false
  }
}

// Delete user
async function deleteUser(userId) {
  try {
    const response = await fetch(`/api/v1/user-management/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })

    const data = await response.json()

    if (data.statusCode === 200) {
      // Remove user from local array
      allUsers = allUsers.filter((u) => u._id !== userId)
      applyFilters() // Use applyFilters instead of renderUsers to maintain current filters
      return true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Filter users based on search and filters
function filterUsers(users, searchText, filters) {
  searchText = searchText.toLowerCase()

  return users.filter((user) => {
    // Search filter (searches across username, email, and fullName)
    const matchesSearch =
      !searchText ||
      user.username.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText) ||
      user.fullName.toLowerCase().includes(searchText)

    // Status filter
    const matchesStatus = !filters.status || (filters.status === "active" ? user.status : !user.status)

    // Date range filter
    const userDate = new Date(user.createdAt)
    const matchesDateFrom = !filters.dateFrom || userDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || userDate <= new Date(filters.dateTo + "T23:59:59")

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  })
}

// Apply all filters
function applyFilters() {
  const searchText = userSearch.value.trim()
  const filters = {
    status: filterStatus.value,
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  }

  const filteredUsers = filterUsers(allUsers, searchText, filters)
  renderUsers(filteredUsers)
}

// Clear all filters
function clearAllFilters() {
  userSearch.value = ""
  filterStatus.value = ""
  filterDateFrom.value = ""
  filterDateTo.value = ""
  renderUsers(allUsers)
}

// Sorting state
let currentSortOrder = "desc" // or 'asc'

// Sort users by date
function sortUsers(users) {
  return [...users].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return currentSortOrder === "asc" ? dateA - dateB : dateB - dateA
  })
}

// Update sort icon
function updateSortIcon() {
  const icon = document.querySelector(".sortable i")
  icon.className = `fas fa-sort-${currentSortOrder === "asc" ? "up" : "down"}`
}

// Add click handler for sort
document.querySelector(".sortable").addEventListener("click", () => {
  currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc"
  updateSortIcon()
  const sortedUsers = sortUsers(allUsers)
  renderUsers(sortedUsers)
})

// Event Listeners
let allUsers = [] // Store all users for filtering

// Load users on page load
document.addEventListener("DOMContentLoaded", async () => {
  allUsers = await fetchUsers()
  allUsers = sortUsers(allUsers) // Sort initially
  renderUsers(allUsers)
  updateSortIcon() // Set initial icon
})

// Search functionality
searchBtn.addEventListener("click", applyFilters)

// Search on enter key
userSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Filter input event listeners
filterStatus.addEventListener("change", applyFilters)
filterDateFrom.addEventListener("change", applyFilters)
filterDateTo.addEventListener("change", applyFilters)

// Clear filters button
clearFiltersBtn.addEventListener("click", clearAllFilters)

// Table click event delegation (for view, edit, delete buttons)
usersTable.addEventListener("click", async (e) => {
  // View avatar
  if (e.target.classList.contains("view-avatar")) {
    e.preventDefault()
    const userId = e.target.dataset.id
    const user = allUsers.find((u) => u._id === userId)
    if (user) showUserDetails(user, "avatar")
  }

  // View cover image
  else if (e.target.classList.contains("view-cover")) {
    e.preventDefault()
    const userId = e.target.dataset.id
    const user = allUsers.find((u) => u._id === userId)
    if (user) showUserDetails(user, "cover")
  }

  // Edit status button
  else if (e.target.closest(".edit-status-btn")) {
    const button = e.target.closest(".edit-status-btn")
    const userId = button.dataset.id
    const currentStatus = button.dataset.status
    showStatusModal(userId, currentStatus)
  }

  // Delete button
  else if (e.target.closest(".delete-btn")) {
    const button = e.target.closest(".delete-btn")
    const userId = button.dataset.id

    if (confirm("Are you sure you want to delete this user?")) {
      const success = await deleteUser(userId)
      if (success) {
        alert("User deleted successfully")
      } else {
        alert("Failed to delete user")
      }
    }
  }
})

// Save status changes
saveStatusBtn.addEventListener("click", async () => {
  const userId = saveStatusBtn.dataset.userId
  const selectedStatus = statusModal.querySelector('input[name="status"]:checked').value

  const success = await updateUserStatus(userId, selectedStatus)
  if (success) {
    statusModal.style.display = "none"
    alert("User status updated successfully")
  } else {
    alert("Failed to update user status")
  }
})
