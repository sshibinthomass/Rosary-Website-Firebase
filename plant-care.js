import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_vqxq0RbqV20wwB1rJVip3m3AFPUnanQ",
  authDomain: "test1-b59ab.firebaseapp.com",
  projectId: "test1-b59ab",
  storageBucket: "test1-b59ab.firebasestorage.app",
  messagingSenderId: "37000814648",
  appId: "1:37000814648:web:c91298a7c343cf54a1c6cd",
  measurementId: "G-E7FVPF29VE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Store all plants for filtering and sorting
let allPlants = [];
let currentSortColumn = "id";
let currentSortDirection = "asc";

// DOM elements
const plantTableBody = document.getElementById("plant-care-table-body");
const noResultsMessage = document.getElementById("no-results-message");
const filterWatering = document.getElementById("filter-watering");
const filterSunlight = document.getElementById("filter-sunlight");
const filterAvailability = document.getElementById("filter-availability");
const clearFiltersBtn = document.getElementById("clear-filters");
const resetFiltersBtn = document.getElementById("reset-filters");
const sortableHeaders = document.querySelectorAll("th.sortable");

// Fetch all plants from Firebase
async function fetchPlants() {
  try {
    const plantsCol = collection(db, "plants");
    const plantSnapshot = await getDocs(plantsCol);

    allPlants = plantSnapshot.docs.map((doc) => ({
      id: parseInt(doc.id), // Convert id to number for correct sorting
      ...doc.data(),
    }));

    // Sort plants by ID
    allPlants.sort((a, b) => a.id - b.id);

    // Display all plants initially
    displayPlants(allPlants);

    // Set up event listeners after data is loaded
    setupEventListeners();
  } catch (error) {
    console.error("Error fetching plants:", error);
    plantTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="error-message">
          Error loading plant data. Please try again later.
        </td>
      </tr>
    `;
  }
}

// Display plants in the table
function displayPlants(plants) {
  if (plants.length === 0) {
    noResultsMessage.classList.remove("hidden");
    plantTableBody.innerHTML = "";
    return;
  }

  noResultsMessage.classList.add("hidden");

  let tableHTML = "";

  plants.forEach((plant) => {
    // Set default values for missing properties
    const watering = plant.watering || "Not specified";
    const sunlight = plant.sunlight || "Not specified";
    const transit = plant.transit || "Not specified";
    const category = plant.category || "Not specified";
    const available = plant.available === undefined ? true : plant.available;

    // Create care icons HTML
    let wateringIcon = "";
    if (watering === "Low") {
      wateringIcon = '<i class="fas fa-tint" title="Low Water Needs"></i>';
    } else if (watering === "Moderate") {
      wateringIcon =
        '<i class="fas fa-tint-slash" title="Medium Water Needs"></i>';
    } else if (watering === "High") {
      wateringIcon = '<i class="fas fa-water" title="High Water Needs"></i>';
    }

    let sunlightIcon = "";
    if (sunlight === "Low") {
      sunlightIcon = '<i class="fas fa-sun" title="Low Light Needs"></i>';
    } else if (sunlight === "Moderate") {
      sunlightIcon =
        '<i class="fas fa-cloud-sun" title="Medium Light Needs"></i>';
    } else if (sunlight === "High") {
      sunlightIcon = '<i class="fas fa-sun" title="High Light Needs"></i>';
    }

    // Create availability badge
    const availabilityBadge = available
      ? '<span class="availability-badge available">Available</span>'
      : '<span class="availability-badge unavailable">Unavailable</span>';

    tableHTML += `
      <tr class="${available ? "plant-available" : "plant-unavailable"}">
        <td>${plant.id}</td>
        <td class="plant-name">${plant.title}</td>
        <td class="plant-watering">
          ${wateringIcon} ${watering}
        </td>
        <td class="plant-sunlight">
          ${sunlightIcon} ${sunlight}
        </td>
        <td class="plant-photo">
          <img src="${plant.url}" alt="${plant.title}" class="plant-thumbnail">
        </td>
        <td class="plant-status">
          ${availabilityBadge}
        </td>
      </tr>
    `;
  });

  plantTableBody.innerHTML = tableHTML;
}

// Filter plants based on selected criteria
function filterPlants() {
  const wateringValue = filterWatering.value;
  const sunlightValue = filterSunlight.value;
  const availabilityValue = filterAvailability.value;

  let filteredPlants = allPlants.filter((plant) => {
    // Filter by watering
    if (wateringValue !== "All" && plant.watering !== wateringValue) {
      return false;
    }

    // Filter by sunlight
    if (sunlightValue !== "All" && plant.sunlight !== sunlightValue) {
      return false;
    }

    // Filter by availability
    if (availabilityValue === "Available" && plant.available === false) {
      return false;
    }
    if (
      availabilityValue === "Unavailable" &&
      (plant.available === true || plant.available === undefined)
    ) {
      return false;
    }

    return true;
  });

  // Sort the filtered plants
  sortPlants(filteredPlants);

  // Display the filtered and sorted plants
  displayPlants(filteredPlants);
}

// Sort plants by the specified column and direction
function sortPlants(plants) {
  plants.sort((a, b) => {
    let valueA = a[currentSortColumn];
    let valueB = b[currentSortColumn];

    // Handle undefined values
    if (valueA === undefined) valueA = "";
    if (valueB === undefined) valueB = "";

    // For string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      if (currentSortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    }

    // For numeric comparison
    if (currentSortDirection === "asc") {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return plants;
}

// Set up event listeners
function setupEventListeners() {
  // Filter change events
  filterWatering.addEventListener("change", filterPlants);
  filterSunlight.addEventListener("change", filterPlants);
  filterAvailability.addEventListener("change", filterPlants);

  // Clear filters button
  clearFiltersBtn.addEventListener("click", clearFilters);
  resetFiltersBtn.addEventListener("click", clearFilters);

  // Sortable headers
  sortableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.getAttribute("data-sort");

      // Toggle sort direction if clicking the same column
      if (column === currentSortColumn) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = column;
        currentSortDirection = "asc";
      }

      // Update sort icons
      updateSortIcons(header);

      // Apply filters and sorting
      filterPlants();
    });
  });
}

// Update sort icons in the table headers
function updateSortIcons(activeHeader) {
  sortableHeaders.forEach((header) => {
    // Remove all sort icons
    const icon = header.querySelector("i");
    icon.className = "fas fa-sort";

    // Add the appropriate icon to the active header
    if (header === activeHeader) {
      icon.className =
        currentSortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
}

// Clear all filters
function clearFilters() {
  filterWatering.value = "All";
  filterSunlight.value = "All";
  filterAvailability.value = "All";

  // Reset sort to ID ascending
  currentSortColumn = "id";
  currentSortDirection = "asc";

  // Update sort icons
  updateSortIcons(document.querySelector('th[data-sort="id"]'));

  // Apply filters
  filterPlants();
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  fetchPlants();
});
