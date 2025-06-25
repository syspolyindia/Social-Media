// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "../index.html"
}

// DOM Elements
const commentsTable = document.getElementById("comments-table")
const commentSearch = document.getElementById("comment-search")
const searchBtn = document.getElementById("search-btn")
const filterCommentBy = document.getElementById("filter-comment-by")
const filterDateFrom = document.getElementById("filter-date-from")
const filterDateTo = document.getElementById("filter-date-to")
const clearFiltersBtn = document.getElementById("clear-filters-btn")
const postModal = document.getElementById("post-modal")
const commentModal = document.getElementById("comment-modal")
const postModalContent = document.getElementById("modal-post-content")
const commentModalContent = document.getElementById("modal-comment-content")
const closePostModal = postModal.querySelector(".close-modal")
const closeCommentModal = commentModal.querySelector(".close-modal")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Close modals when clicking X or outside
closePostModal.addEventListener("click", () => (postModal.style.display = "none"))
closeCommentModal.addEventListener("click", () => (commentModal.style.display = "none"))

window.addEventListener("click", (e) => {
  if (e.target === postModal) postModal.style.display = "none"
  if (e.target === commentModal) commentModal.style.display = "none"
})

// Fetch all comments from API
async function fetchComments() {
  try {
    const response = await fetch("/api/v1/comment-management/", {
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
    console.error("Error fetching comments:", error)
    return []
  }
}

// Fetch total likes for a comment
async function fetchTotalLikes(commentId) {
  try {
    const response = await fetch(`/api/v1/comment-management/get-total-likes/${commentId}`, {
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

// Render comments in table
function renderComments(comments) {
  const tbody = commentsTable.querySelector("tbody")
  tbody.innerHTML = ""

  comments.forEach((comment) => {
    const tr = document.createElement("tr")

    // Format date
    const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-GB')

    // Truncate content for table view
    const truncatedContent = comment.content.length > 100 ? comment.content.substring(0, 100) + "..." : comment.content

    // Get comment author username
    const commentBy = comment.owner?.username || "N/A"

    tr.innerHTML = `
            <td>${commentBy}</td>
            <td>
                <a href="#" class="view-post" data-id="${comment._id}">View</a>
            </td>
            <td>${truncatedContent}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="view-btn" data-id="${comment._id}" title="View Comment">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" data-id="${comment._id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `

    tbody.appendChild(tr)
  })
}

// Show post details in modal
function showPostDetails(comment) {
  const post = comment.post
  const postOwner = post.owner

  // Replace line breaks with <br> tags for proper display
  const formattedContent = post.content.replace(/\n/g, "<br>")

  postModalContent.innerHTML = `
        <div class="post-details">
            <p><strong>Post Owner:</strong> ${postOwner.username}</p>
            <p><strong>Post Content:</strong> ${formattedContent}</p>
            ${post.image ? `<p><strong>Image:</strong><br><img src="${post.image}" alt="Post image" style="max-width: 100%;"></p>` : ""}
            ${post.link ? `<p><strong>Link:</strong> <a href="${post.link}" target="_blank" rel="noopener noreferrer">${post.link}</a></p>` : ""}
        </div>
    `

  postModal.style.display = "block"
}

// Show comment details in modal
async function showCommentDetails(comment) {
  const commentOwner = comment.owner

  // Replace line breaks with <br> tags for proper display
  const formattedContent = comment.content.replace(/\n/g, "<br>")

  // First, show the modal with loading state for likes
  commentModalContent.innerHTML = `
        <div class="comment-details">
            <p><strong>Comment By:</strong> ${commentOwner.username}</p>
            ${commentOwner.avatar ? `<p><strong>Avatar:</strong><br><img src="${commentOwner.avatar}" alt="User avatar" style="max-width: 200px;"></p>` : ""}
            <p><strong>Comment Content:</strong> ${formattedContent}</p>
            <p><strong>Commented on:</strong> ${new Date(comment.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Likes:</strong> <span id="totalLikes">Loading...</span></p>
        </div>
    `

  commentModal.style.display = "block"

  // Then fetch and update the likes count
  const totalLikes = await fetchTotalLikes(comment._id)
  const totalLikesElement = document.getElementById("totalLikes")
  if (totalLikesElement) {
    totalLikesElement.textContent = `${totalLikes}`
  }
}

// Delete comment
async function deleteComment(commentId) {
  try {
    const response = await fetch(`/api/v1/comment-management/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })

    const data = await response.json()

    if (data.statusCode === 200) {
      // Remove comment from local array
      allComments = allComments.filter((c) => c._id !== commentId)
      applyFilters()
      return true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return false
  }
}

// Filter comments based on search and filters
function filterComments(comments, searchText, filters) {
  searchText = searchText.toLowerCase()

  return comments.filter((comment) => {
    // Search filter (searches across username and content)
    const matchesSearch =
      !searchText ||
      comment.owner?.username?.toLowerCase().includes(searchText) ||
      comment.content.toLowerCase().includes(searchText)

    // Specific field filters
    const matchesCommentBy =
      !filters.commentBy || comment.owner?.username?.toLowerCase().includes(filters.commentBy.toLowerCase())

    // Date range filter
    const commentDate = new Date(comment.createdAt)
    const matchesDateFrom = !filters.dateFrom || commentDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || commentDate <= new Date(filters.dateTo + "T23:59:59")

    return matchesSearch && matchesCommentBy && matchesDateFrom && matchesDateTo
  })
}

// Apply all filters
function applyFilters() {
  const searchText = commentSearch.value.trim()
  const filters = {
    commentBy: filterCommentBy.value.trim(),
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  }

  const filteredComments = filterComments(allComments, searchText, filters)
  renderComments(filteredComments)
}

// Clear all filters
function clearAllFilters() {
  commentSearch.value = ""
  filterCommentBy.value = ""
  filterDateFrom.value = ""
  filterDateTo.value = ""
  renderComments(allComments)
}

// Sorting state
let currentSortOrder = "desc" // or 'asc'

// Sort comments by date
function sortComments(comments) {
  return [...comments].sort((a, b) => {
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
  const sortedComments = sortComments(allComments)
  renderComments(sortedComments)
})

// Event Listeners
let allComments = [] // Store all comments for filtering

// Load comments on page load
document.addEventListener("DOMContentLoaded", async () => {
  allComments = await fetchComments()
  allComments = sortComments(allComments) // Sort initially
  renderComments(allComments)
  updateSortIcon() // Set initial icon
})

// Search functionality
searchBtn.addEventListener("click", applyFilters)

// Search on enter key
commentSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Filter input event listeners
filterCommentBy.addEventListener("input", applyFilters)
filterDateFrom.addEventListener("change", applyFilters)
filterDateTo.addEventListener("change", applyFilters)

// Clear filters button
clearFiltersBtn.addEventListener("click", clearAllFilters)

// Table click event delegation
commentsTable.addEventListener("click", async (e) => {
  // View post
  if (e.target.classList.contains("view-post")) {
    e.preventDefault()
    const commentId = e.target.dataset.id
    const comment = allComments.find((c) => c._id === commentId)
    if (comment) showPostDetails(comment)
  }

  // View comment button
  else if (e.target.closest(".view-btn")) {
    const button = e.target.closest(".view-btn")
    const commentId = button.dataset.id
    const comment = allComments.find((c) => c._id === commentId)
    if (comment) showCommentDetails(comment)
  }

  // Delete button
  else if (e.target.closest(".delete-btn")) {
    const button = e.target.closest(".delete-btn")
    const commentId = button.dataset.id

    if (confirm("Are you sure you want to delete this comment?")) {
      const success = await deleteComment(commentId)
      if (success) {
        alert("Comment deleted successfully")
      } else {
        alert("Failed to delete comment")
      }
    }
  }
})
