// Check for admin token and redirect if not present
const adminData = JSON.parse(localStorage.getItem("adminData"))
if (!adminData) {
  window.location.href = "../index.html"
}

// DOM Elements
const referralsTable = document.getElementById("referrals-table")
const referralSearch = document.getElementById("referral-search")
const searchBtn = document.getElementById("search-btn")
const filterReferredBy = document.getElementById("filter-referred-by")
const filterReferredTo = document.getElementById("filter-referred-to")
const filterReferredUser = document.getElementById("filter-referred-user")
const filterStatus = document.getElementById("filter-status")
const clearFiltersBtn = document.getElementById("clear-filters-btn")
const toggleSidebarBtn = document.getElementById("toggle-sidebar")
const sidebar = document.querySelector(".sidebar")
const filterDateFrom = document.getElementById("filter-date-from")
const filterDateTo = document.getElementById("filter-date-to")

// Referral Value Elements
const referralValueDisplay = document.querySelector(".referral-value-display")
const referralValueEdit = document.getElementById("referral-value-edit")
const referralValueSpan = document.getElementById("referral-value")
const editReferralBtn = document.getElementById("edit-referral-btn")
const referralValueInput = document.getElementById("referral-value-input")
const saveReferralBtn = document.getElementById("save-referral-btn")
const cancelReferralBtn = document.getElementById("cancel-referral-btn")

// Toggle sidebar
toggleSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
})

// Fetch current referral value

async function fetchReferralValue() {
  console.log(adminData.accessToken)
  try {
    const response = await fetch("/api/v1/referral-management/fetch-referral-value", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminData.accessToken}`,
      },
    })
    const data = await response.json()
    console.log(data);
    if (data.statusCode === 200) {
      return data.data.referralValue
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error fetching referral value:", error)
    return null
  }
}

// Update referral value
async function updateReferralValue(newValue) {  try {
    const payload = { value: Number.parseInt(newValue) };
    console.log('Sending payload:', payload);
    const response = await fetch("/api/v1/referral-management/update-referral-value", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminData.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (data.statusCode === 200) {
      return true
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error("Error updating referral value:", error)
    return false
  }
}

// Display referral value
function displayReferralValue(value) {
  if (value !== null) {
    referralValueSpan.textContent = value
  } else {
    referralValueSpan.textContent = "Error"
    referralValueSpan.style.color = "#e74c3c"
  }
}

// Show edit mode
function showEditMode() {
  const currentValue = referralValueSpan.textContent
  referralValueInput.value = currentValue !== "Error" ? currentValue : ""
  referralValueDisplay.style.display = "none"
  referralValueEdit.style.display = "flex"
  referralValueInput.focus()
  referralValueInput.select()
}

// Hide edit mode
function hideEditMode() {
  referralValueDisplay.style.display = "flex"
  referralValueEdit.style.display = "none"
  referralValueInput.value = ""
}

// Save referral value
async function saveReferralValue() {
  const newValue = referralValueInput.value.trim()

  if (!newValue || isNaN(newValue) || Number.parseInt(newValue) < 0) {
    alert("Please enter a valid positive integer value")
    return
  }

  const success = await updateReferralValue(newValue)
  if (success) {
    displayReferralValue(Number.parseInt(newValue))
    hideEditMode()
    alert("Referral value updated successfully!")
  } else {
    alert("Failed to update referral value. Please try again.")
  }
}

// Referral Value Event Listeners
editReferralBtn.addEventListener("click", showEditMode)
cancelReferralBtn.addEventListener("click", hideEditMode)
saveReferralBtn.addEventListener("click", saveReferralValue)

// Save on Enter key
referralValueInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveReferralValue()
  } else if (e.key === "Escape") {
    hideEditMode()
  }
})

// Only allow integers
referralValueInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "")
})

// Fetch all referrals from API
async function fetchReferrals() {
  try {
    console.log("refe" , adminData.accessToken)
    const response = await fetch("/api/v1/referral-management/", {
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
    console.error("Error fetching referrals:", error)
    return []
  }
}

// Render referrals in table
function renderReferrals(referrals) {
  const tbody = referralsTable.querySelector("tbody")
  tbody.innerHTML = ""

  referrals.forEach((referral) => {
    const tr = document.createElement("tr")

    // Convert boolean status to text
    const statusText = referral.status ? "Accepted" : "Not Accepted"
    const statusClass = referral.status ? "active" : "inactive"

    // Format date
    const formattedDate = new Date(referral.createdAt).toLocaleDateString("en-GB")

    // Extract usernames from user objects
    const referredBy = referral.referredBy?.username || "N/A"
    const referredTo = referral.referredTo?.username || "N/A"
    const referredUser = referral.referredUser?.username || "N/A"

    tr.innerHTML = `
            <td>${referredBy}</td>
            <td>${referredTo}</td>
            <td>${referredUser}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
        `

    tbody.appendChild(tr)
  })
}

// Filter referrals based on search and filters
function filterReferrals(referrals, searchText, filters) {
  searchText = searchText.toLowerCase()

  return referrals.filter((referral) => {
    // Search filter (searches across all username fields)
    const matchesSearch =
      !searchText ||
      referral.referredBy?.username?.toLowerCase().includes(searchText) ||
      referral.referredTo?.username?.toLowerCase().includes(searchText) ||
      referral.referredUser?.username?.toLowerCase().includes(searchText)

    // Specific field filters
    const matchesReferredBy =
      !filters.referredBy || referral.referredBy?.username?.toLowerCase().includes(filters.referredBy.toLowerCase())

    const matchesReferredTo =
      !filters.referredTo || referral.referredTo?.username?.toLowerCase().includes(filters.referredTo.toLowerCase())

    const matchesReferredUser =
      !filters.referredUser ||
      referral.referredUser?.username?.toLowerCase().includes(filters.referredUser.toLowerCase())

    // Status filter
    const matchesStatus = !filters.status || (filters.status === "accepted" ? referral.status : !referral.status)

    // Date range filter
    const referralDate = new Date(referral.createdAt)
    const matchesDateFrom = !filters.dateFrom || referralDate >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || referralDate <= new Date(filters.dateTo + "T23:59:59")

    return (
      matchesSearch &&
      matchesReferredBy &&
      matchesReferredTo &&
      matchesReferredUser &&
      matchesStatus &&
      matchesDateFrom &&
      matchesDateTo
    )
  })
}

// Apply all filters
function applyFilters() {
  const searchText = referralSearch.value.trim()
  const filters = {
    referredBy: filterReferredBy.value.trim(),
    referredTo: filterReferredTo.value.trim(),
    referredUser: filterReferredUser.value.trim(),
    status: filterStatus.value,
    dateFrom: filterDateFrom.value,
    dateTo: filterDateTo.value,
  }

  const filteredReferrals = filterReferrals(allReferrals, searchText, filters)
  renderReferrals(filteredReferrals)
}

// Clear all filters
function clearAllFilters() {
  referralSearch.value = ""
  filterReferredBy.value = ""
  filterReferredTo.value = ""
  filterReferredUser.value = ""
  filterStatus.value = ""
  filterDateFrom.value = ""
  filterDateTo.value = ""
  renderReferrals(allReferrals)
}

// Sorting state
let currentSortOrder = "desc" // or 'asc'

// Sort referrals by date
function sortReferrals(referrals) {
  return [...referrals].sort((a, b) => {
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
  const sortedReferrals = sortReferrals(allReferrals)
  renderReferrals(sortedReferrals)
})

// Event Listeners
let allReferrals = [] // Store all referrals for filtering

// Load referrals and referral value on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Load referral value
  const referralValue = await fetchReferralValue()
  displayReferralValue(referralValue)

  // Load referrals
  allReferrals = await fetchReferrals()
  allReferrals = sortReferrals(allReferrals) // Sort initially
  renderReferrals(allReferrals)
  updateSortIcon() // Set initial icon
})

// Search functionality
searchBtn.addEventListener("click", applyFilters)

// Search on enter key
referralSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Filter input event listeners
filterReferredBy.addEventListener("input", applyFilters)
filterReferredTo.addEventListener("input", applyFilters)
filterReferredUser.addEventListener("input", applyFilters)
filterStatus.addEventListener("change", applyFilters)

// Filter inputs on enter key
filterReferredBy.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

filterReferredTo.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

filterReferredUser.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    applyFilters()
  }
})

// Clear filters button
clearFiltersBtn.addEventListener("click", clearAllFilters)

filterDateFrom.addEventListener("change", applyFilters)
filterDateTo.addEventListener("change", applyFilters)
