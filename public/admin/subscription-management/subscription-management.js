// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "../index.html"
}

// DOM Elements
const subscriptionsTable = document.getElementById("subscriptions-table")
const subscriptionSearch = document.getElementById("subscription-search")
const searchBtn = document.getElementById("search-btn")
const filterSubscriber = document.getElementById("filter-subscriber")
const filterSubscribedUser = document.getElementById("filter-subscribed-user")
const filterDateFrom = document.getElementById("filter-date-from")
const filterDateTo = document.getElementById("filter-date-to")
const clearFiltersBtn = document.getElementById("clear-filters-btn")
const subscriptionModal = document.getElementById("subscription-modal")
const modalContent = document.getElementById("modal-subscription-content")
const closeModal = subscriptionModal.querySelector(".close-modal")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Close modal when clicking X or outside
closeModal.addEventListener("click", () => (subscriptionModal.style.display = "none"))

window.addEventListener("click", (e) => {
  if (e.target === subscriptionModal) subscriptionModal.style.display = "none"
})

// Fetch all subscriptions from API
async function fetchSubscriptions() {
  try {
    const response = await fetch("/api/v1/subscription-management/", {
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
    console.error("Error fetching subscriptions:", error)
    return []
  }
}

// Render subscriptions in table
function renderSubscriptions(subscriptions) {
  const tbody = subscriptionsTable.querySelector("tbody")
  tbody.innerHTML = ""

  subscriptions.forEach((subscription) => {
    const tr = document.createElement("tr")

    // Format date
    const formattedDate = new Date(subscription.createdAt).toLocaleDateString('en-GB')

    // Extract usernames from user objects
    const subscriber = subscription.subscriber?.username || "N/A"
    const subscribedUser = subscription.subscribedUser?.username || "N/A"

    tr.innerHTML = `
            <td>${subscriber}</td>
            <td>${subscribedUser}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="view-btn" data-id="${subscription._id}" title="View Subscription">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `

    tbody.appendChild(tr)
  })
}

// Show subscription details in modal
function showSubscriptionDetails(subscription) {
  const subscriber = subscription.subscriber
  const subscribedUser = subscription.subscribedUser

  modalContent.innerHTML = `
        <div class="subscription-details">
            <div class="user-section">
                <h3>Subscriber</h3>
                <p><strong>Username:</strong> ${subscriber.username}</p>
                <p><strong>Full Name:</strong> ${subscriber.fullName || "N/A"}</p>
                ${subscriber.avatar ? `<p><strong>Avatar:</strong><br><img src="${subscriber.avatar}" alt="Subscriber avatar" style="max-width: 150px;"></p>` : "<p><strong>Avatar:</strong> No avatar</p>"}
            </div>
            
            <div class="user-section">
                <h3>Subscribed User</h3>
                <p><strong>Username:</strong> ${subscribedUser.username}</p>
                <p><strong>Full Name:</strong> ${subscribedUser.fullName || "N/A"}</p>
                ${subscribedUser.avatar ? `<p><strong>Avatar:</strong><br><img src="${subscribedUser.avatar}" alt="Subscribed user avatar" style="max-width: 150px;"></p>` : "<p><strong>Avatar:</strong> No avatar</p>"}
            </div>
            
            <div class="subscription-info">
                <p><strong>Subscription Date:</strong> ${new Date(subscription.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    `

  subscriptionModal.style.display = "block"
}

function filterSubscriptions(subscriptions, searchText, filters) {
  searchText = searchText.toLowerCase()

  return subscriptions.filter((subscription) => {
    // Search filter (searches across both usernames)
    const matchesSearch =
      !searchText ||
      subscription.subscriber?.username?.toLowerCase().includes(searchText) ||
      subscription.subscribedUser?.username?.toLowerCase().includes(searchText)

    // Specific field filters
    const matchesSubscriber =
      !filters.subscriber || subscription.subscriber?.username?.toLowerCase().includes(filters.subscriber.toLowerCase())

    const matchesSubscribedUser =
      !filters.subscribedUser ||
      subscription.subscribedUser?.username?.toLowerCase().includes(filters.subscribedUser.toLowerCase())

    // Date range filter
    const subscriptionDate = new Date(subscription.createdAt)
    const matchesDateFrom = !filters.dateFrom || subscriptionDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || subscriptionDate <= new Date(filters.dateTo + "T23:59:59")

    return matchesSearch && matchesSubscriber && matchesSubscribedUser && matchesDateFrom && matchesDateTo
  })
}

// Apply all filters
function applyFilters() {
  const searchText = subscriptionSearch.value.trim()
  const filters = {
    subscriber: filterSubscriber.value.trim(),
    subscribedUser: filterSubscribedUser.value.trim(),
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  }

  const filteredSubscriptions = filterSubscriptions(allSubscriptions, searchText, filters)
  renderSubscriptions(filteredSubscriptions)
}

// Clear all filters
function clearAllFilters() {
  subscriptionSearch.value = ""
  filterSubscriber.value = ""
  filterSubscribedUser.value = ""
  filterDateFrom.value = ""
  filterDateTo.value = ""
  renderSubscriptions(allSubscriptions)
}

// Sorting state
let currentSortOrder = "desc" // or 'asc'

// Sort subscriptions by date
function sortSubscriptions(subscriptions) {
  return [...subscriptions].sort((a, b) => {
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
  const sortedSubscriptions = sortSubscriptions(allSubscriptions)
  renderSubscriptions(sortedSubscriptions)
})

// Event Listeners
let allSubscriptions = [] // Store all subscriptions for filtering

// Load subscriptions on page load
document.addEventListener("DOMContentLoaded", async () => {
  allSubscriptions = await fetchSubscriptions()
  allSubscriptions = sortSubscriptions(allSubscriptions) // Sort initially
  renderSubscriptions(allSubscriptions)
  updateSortIcon() // Set initial icon
})

// Search functionality
searchBtn.addEventListener("click", applyFilters)

// Search on enter key
subscriptionSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Filter input event listeners
filterSubscriber.addEventListener("input", applyFilters)
filterSubscribedUser.addEventListener("input", applyFilters)

// Filter inputs on enter key
filterSubscriber.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

filterSubscribedUser.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Clear filters button
clearFiltersBtn.addEventListener("click", clearAllFilters)

filterDateFrom.addEventListener("change", applyFilters)
filterDateTo.addEventListener("change", applyFilters)

// Table click event delegation (for view button)
subscriptionsTable.addEventListener("click", async (e) => {
  // View button
  if (e.target.closest(".view-btn")) {
    const button = e.target.closest(".view-btn")
    const subscriptionId = button.dataset.id
    const subscription = allSubscriptions.find((s) => s._id === subscriptionId)
    if (subscription) showSubscriptionDetails(subscription)
  }
})
