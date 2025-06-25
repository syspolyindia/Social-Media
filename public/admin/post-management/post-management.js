// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "../index.html"
}

// DOM Elements
const postsTable = document.getElementById("posts-table")
const postSearch = document.getElementById("post-search")
const searchBtn = document.getElementById("search-btn")
const filterOwner = document.getElementById("filter-owner")
const filterDateFrom = document.getElementById("filter-date-from")
const filterDateTo = document.getElementById("filter-date-to")
const clearFiltersBtn = document.getElementById("clear-filters-btn")
const modal = document.getElementById("post-modal")
const modalContent = document.getElementById("modal-post-content")
const closeModal = document.querySelector(".close-modal")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Close modal when clicking X or outside
closeModal.addEventListener("click", () => (modal.style.display = "none"))
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none"
})

// Fetch all posts from API
async function fetchPosts() {
  try {
    const response = await fetch("/api/v1/post-management/", {
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
    console.error("Error fetching posts:", error)
    return []
  }
}

// Fetch total likes for a post
async function fetchTotalLikes(postId) {
  try {
    const response = await fetch(`/api/v1/post-management/get-total-likes/${postId}`, {
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) {
      return data.data.likeCount
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error fetching total likes:", error)
    return 0
  }
}

// Render posts in table
function renderPosts(posts) {
  const tbody = postsTable.querySelector("tbody")
  tbody.innerHTML = ""

  posts.forEach((post) => {
    const tr = document.createElement("tr")

    // Truncate content for table view
    const truncatedContent = post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content

    // Format date
    const formattedDate = new Date(post.createdAt).toLocaleDateString('en-GB')

    tr.innerHTML = `
            <td>${post.owner.username}</td>
            <td>${truncatedContent}</td>
            <td>${post.image ? `<img src="${post.image}" alt="Post image" style="max-width: 50px;">` : "No image"}</td>
            <td>${post.link ? `<a href="${post.link}" target="_blank" rel="noopener noreferrer">View</a>` : "No link"}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="view-btn" data-id="${post._id}" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" data-id="${post._id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `

    tbody.appendChild(tr)
  })
}

// Show post details in modal
async function showPostDetails(post) {
  // Replace line breaks with <br> tags for proper display
  const formattedContent = post.content.replace(/\n/g, "<br>")

  // First, show the modal with loading state for likes
  modalContent.innerHTML = `
        <div class="post-details">
            <p><strong>Owner:</strong> ${post.owner.username}</p>
            <p><strong>Content:</strong> ${formattedContent}</p>
            ${post.image ? `<p><strong>Image:</strong><br><img src="${post.image}" alt="Post image" style="max-width: 100%;"></p>` : ""}
            ${post.link ? `<p><strong>Link:</strong> <a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.link}</a></p>` : ""}
            <p><strong>Posted on:</strong> ${new Date(post.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Likes:</strong> <span id="totalLikes">Loading...</span></p>
        </div>
    `
  modal.style.display = "block"

  // Then fetch and update the likes count
  const totalLikes = await fetchTotalLikes(post._id)
  const totalLikesElement = document.getElementById("totalLikes")
  if (totalLikesElement) {
    totalLikesElement.textContent = `${totalLikes}`
  }
}

// Delete post
async function deletePost(postId) {
  try {
    const response = await fetch(`/api/v1/post-management/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })

    const data = await response.json()

    if (data.statusCode === 200) {
      // Remove post from local array
      allPosts = allPosts.filter((p) => p._id !== postId)
      applyFilters()
      return true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error deleting post:", error)
    return false
  }
}

// Filter posts based on search and filters
function filterPosts(posts, searchText, filters) {
  searchText = searchText.toLowerCase()

  return posts.filter((post) => {
    // Search filter (searches across owner and content)
    const matchesSearch =
      !searchText ||
      post.owner.username.toLowerCase().includes(searchText) ||
      post.content.toLowerCase().includes(searchText)

    // Owner filter
    const matchesOwner = !filters.owner || post.owner.username.toLowerCase().includes(filters.owner.toLowerCase())

    // Date range filter
    const postDate = new Date(post.createdAt)
    const matchesDateFrom = !filters.dateFrom || postDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || postDate <= new Date(filters.dateTo + "T23:59:59")

    return matchesSearch && matchesOwner && matchesDateFrom && matchesDateTo
  })
}

// Apply all filters
function applyFilters() {
  const searchText = postSearch.value.trim()
  const filters = {
    owner: filterOwner.value.trim(),
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  }

  const filteredPosts = filterPosts(allPosts, searchText, filters)
  renderPosts(filteredPosts)
}

// Clear all filters
function clearAllFilters() {
  postSearch.value = ""
  filterOwner.value = ""
  filterDateFrom.value = ""
  filterDateTo.value = ""
  renderPosts(allPosts)
}

// Sorting state
let currentSortOrder = "desc" // or 'asc'

// Sort posts by date
function sortPosts(posts) {
  return [...posts].sort((a, b) => {
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
  const sortedPosts = sortPosts(allPosts)
  renderPosts(sortedPosts)
})

// Event Listeners
let allPosts = [] // Store all posts for filtering

// Load posts on page load
document.addEventListener("DOMContentLoaded", async () => {
  allPosts = await fetchPosts()
  allPosts = sortPosts(allPosts) // Sort initially
  renderPosts(allPosts)
  updateSortIcon() // Set initial icon
})

// Search functionality
searchBtn.addEventListener("click", applyFilters)

// Search on enter key
postSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Filter input event listeners
filterOwner.addEventListener("input", applyFilters)
filterDateFrom.addEventListener("change", applyFilters)
filterDateTo.addEventListener("change", applyFilters)

// Clear filters button
clearFiltersBtn.addEventListener("click", clearAllFilters)

// View button click event (using event delegation)
postsTable.addEventListener("click", async (e) => {
  const button = e.target.closest(".view-btn, .delete-btn")
  if (!button) return

  const postId = button.dataset.id
  const post = allPosts.find((p) => p._id === postId)
  if (!post) return

  if (button.classList.contains("view-btn")) {
    showPostDetails(post)
  } else if (button.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this post?")) {
      const success = await deletePost(postId)
      if (success) {
        alert("Post deleted successfully")
      } else {
        alert("Failed to delete post")
      }
    }
  }
})
