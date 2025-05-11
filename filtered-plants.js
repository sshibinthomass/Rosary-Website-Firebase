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

// Store all plants for filtering
let allPlants = [];

// DOM elements
const filteredPlantsContainer = document.getElementById(
  "filtered-plants-container"
);
const noResultsMessage = document.getElementById("no-results-message");
const clearFiltersBtn = document.getElementById("clear-filters");
const applyFiltersBtn = document.getElementById("apply-filters");
const resetFiltersBtn = document.getElementById("reset-filters");

// Dropdown elements
const wateringDropdown = document.getElementById("watering-dropdown");
const sunlightDropdown = document.getElementById("sunlight-dropdown");
const transitDropdown = document.getElementById("transit-dropdown");
const categoryDropdown = document.getElementById("category-dropdown");
const availabilityDropdown = document.getElementById("availability-dropdown");
const priceDropdown = document.getElementById("price-dropdown");

// Filter state
const filterState = {
  watering: [],
  sunlight: [],
  transit: [],
  category: [],
  availability: [],
  price: [],
};

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
    filteredPlantsContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        Error loading plant data. Please try again later.
      </div>
    `;
  }
}

// Display plants in the table
function displayPlants(plants) {
  if (plants.length === 0) {
    noResultsMessage.classList.remove("hidden");
    filteredPlantsContainer.innerHTML = "";
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
    const originalPrice = parseFloat(plant.originalPrice) || 0;
    const salesPrice = parseFloat(plant.salesPrice) || 0;

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

    // Create price display
    const priceDisplay =
      originalPrice > salesPrice
        ? `<s>₹${originalPrice}</s> ₹${salesPrice}`
        : `₹${salesPrice}`;

    // Create table row HTML
    tableHTML += `
      <tr class="${available ? "plant-available" : "plant-unavailable"}">
        <td>${plant.id}</td>
        <td class="plant-name">
          <span class="plant-title" data-id="${plant.id}">${plant.title}</span>
        </td>
        <td class="plant-watering">
          ${wateringIcon} ${watering}
        </td>
        <td class="plant-sunlight">
          ${sunlightIcon} ${sunlight}
        </td>
        <td class="plant-transit">
          <span class="transit-${transit.toLowerCase()}">${transit}</span>
        </td>
        <td class="plant-category">${category}</td>
        <td class="plant-price">${priceDisplay}</td>
        <td class="plant-photo">
          <img src="${plant.url}" alt="${plant.title}" class="plant-thumbnail">
        </td>
        <td class="plant-status">
          ${availabilityBadge}
        </td>
      </tr>
    `;
  });

  filteredPlantsContainer.innerHTML = tableHTML;

  // Add click event to plant names to show details popup
  document.querySelectorAll(".plant-title").forEach((plantName) => {
    plantName.addEventListener("click", () => {
      const plantId = plantName.getAttribute("data-id");
      const plant = plants.find((p) => p.id == plantId);
      if (plant) {
        showPlantDetailsPopup(plant);
      }
    });
  });
}

// Filter plants based on selected criteria
function filterPlants() {
  // Get current filter selections
  updateFilterState();

  let filteredPlants = allPlants.filter((plant) => {
    // Filter by watering
    if (
      filterState.watering.length > 0 &&
      !filterState.watering.includes(plant.watering)
    ) {
      return false;
    }

    // Filter by sunlight
    if (
      filterState.sunlight.length > 0 &&
      !filterState.sunlight.includes(plant.sunlight)
    ) {
      return false;
    }

    // Filter by transit risk
    if (
      filterState.transit.length > 0 &&
      !filterState.transit.includes(plant.transit)
    ) {
      return false;
    }

    // Filter by category
    if (
      filterState.category.length > 0 &&
      !filterState.category.includes(plant.category)
    ) {
      return false;
    }

    // Filter by availability
    if (filterState.availability.length > 0) {
      if (
        filterState.availability.includes("Available") &&
        plant.available === false
      ) {
        return false;
      }
      if (
        filterState.availability.includes("Unavailable") &&
        (plant.available === true || plant.available === undefined)
      ) {
        return false;
      }
      // If both are selected or none are selected, show all plants
      if (filterState.availability.length === 1) {
        if (
          filterState.availability[0] === "Available" &&
          plant.available === false
        ) {
          return false;
        }
        if (
          filterState.availability[0] === "Unavailable" &&
          (plant.available === true || plant.available === undefined)
        ) {
          return false;
        }
      }
    }

    // Filter by price range
    if (filterState.price.length > 0) {
      const salesPrice = parseFloat(plant.salesPrice) || 0;
      let matchesPrice = false;

      for (const priceRange of filterState.price) {
        if (priceRange === "0-100" && salesPrice >= 0 && salesPrice <= 100) {
          matchesPrice = true;
          break;
        }
        if (
          priceRange === "100-200" &&
          salesPrice >= 100 &&
          salesPrice <= 200
        ) {
          matchesPrice = true;
          break;
        }
        if (
          priceRange === "200-300" &&
          salesPrice >= 200 &&
          salesPrice <= 300
        ) {
          matchesPrice = true;
          break;
        }
        if (priceRange === "300+" && salesPrice >= 300) {
          matchesPrice = true;
          break;
        }
      }

      if (!matchesPrice) {
        return false;
      }
    }

    return true;
  });

  // Display the filtered plants
  displayPlants(filteredPlants);
}

// Update filter state based on checkbox selections
function updateFilterState() {
  // Clear previous state
  Object.keys(filterState).forEach((key) => {
    filterState[key] = [];
  });

  // Update watering filter
  document
    .querySelectorAll('input[name="watering"]:checked')
    .forEach((checkbox) => {
      filterState.watering.push(checkbox.value);
    });

  // Update sunlight filter
  document
    .querySelectorAll('input[name="sunlight"]:checked')
    .forEach((checkbox) => {
      filterState.sunlight.push(checkbox.value);
    });

  // Update transit filter
  document
    .querySelectorAll('input[name="transit"]:checked')
    .forEach((checkbox) => {
      filterState.transit.push(checkbox.value);
    });

  // Update category filter
  document
    .querySelectorAll('input[name="category"]:checked')
    .forEach((checkbox) => {
      filterState.category.push(checkbox.value);
    });

  // Update availability filter
  document
    .querySelectorAll('input[name="availability"]:checked')
    .forEach((checkbox) => {
      filterState.availability.push(checkbox.value);
    });

  // Update price filter
  document
    .querySelectorAll('input[name="price"]:checked')
    .forEach((checkbox) => {
      filterState.price.push(checkbox.value);
    });

  // Update dropdown button text to show selected options
  updateDropdownText("watering", filterState.watering);
  updateDropdownText("sunlight", filterState.sunlight);
  updateDropdownText("transit", filterState.transit);
  updateDropdownText("category", filterState.category);
  updateDropdownText("availability", filterState.availability);
  updateDropdownText("price", filterState.price);
}

// Update dropdown button text to show selected options
function updateDropdownText(filterType, selectedValues) {
  const dropdown = document.getElementById(`${filterType}-dropdown`);
  const button = dropdown.querySelector(".dropdown-toggle");

  if (selectedValues.length === 0) {
    button.innerHTML = `Select Options <i class="fas fa-chevron-down"></i>`;
  } else if (selectedValues.length === 1) {
    button.innerHTML = `${selectedValues[0]} <i class="fas fa-chevron-down"></i>`;
  } else {
    button.innerHTML = `${selectedValues.length} selected <i class="fas fa-chevron-down"></i>`;
  }
}

// Set up event listeners
function setupEventListeners() {
  // Apply filters button
  applyFiltersBtn.addEventListener("click", filterPlants);

  // Clear filters button
  clearFiltersBtn.addEventListener("click", clearFilters);
  resetFiltersBtn.addEventListener("click", clearFilters);

  // Set up dropdown toggles
  document.querySelectorAll(".dropdown-toggle").forEach((button) => {
    button.addEventListener("click", function () {
      const dropdown = this.closest(".custom-dropdown");

      // Close all other dropdowns
      document
        .querySelectorAll(".custom-dropdown.open")
        .forEach((openDropdown) => {
          if (openDropdown !== dropdown) {
            openDropdown.classList.remove("open");
          }
        });

      // Toggle current dropdown
      dropdown.classList.toggle("open");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".custom-dropdown")) {
      document.querySelectorAll(".custom-dropdown.open").forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
    }
  });

  // Add change event to all checkboxes to update filters
  document
    .querySelectorAll('.dropdown-item input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // Update the dropdown text
        const filterType = this.name;
        const selectedValues = Array.from(
          document.querySelectorAll(`input[name="${filterType}"]:checked`)
        ).map((cb) => cb.value);

        updateDropdownText(filterType, selectedValues);
      });
    });
}

// Clear all filters
function clearFilters() {
  // Uncheck all checkboxes
  document
    .querySelectorAll('.dropdown-item input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });

  // Reset filter state
  Object.keys(filterState).forEach((key) => {
    filterState[key] = [];
  });

  // Reset dropdown button text
  document.querySelectorAll(".dropdown-toggle").forEach((button) => {
    button.innerHTML = `Select Options <i class="fas fa-chevron-down"></i>`;
  });

  // Apply filters
  filterPlants();
}

// Plant Details Popup Functions
function showPlantDetailsPopup(plant) {
  const popup = document.getElementById("plant-details-popup");
  const popupImage = document.getElementById("plant-details-image");
  const popupName = document.getElementById("plant-details-name");
  const popupId = document.getElementById("plant-details-id");
  const popupPrice = document.getElementById("plant-details-price");
  const popupWatering = document.getElementById("plant-details-watering");
  const popupCategory = document.getElementById("plant-details-category");
  const popupTransit = document.getElementById("plant-details-transit");
  const popupSunlight = document.getElementById("plant-details-sunlight");

  // Set the popup content
  popupImage.src = plant.url;
  popupImage.alt = plant.title;
  popupName.textContent = plant.title;
  popupId.textContent = plant.id;
  popupPrice.textContent = `₹${plant.salesPrice}`;

  // Set the additional plant details
  popupWatering.textContent = plant.watering || "Not specified";
  popupCategory.textContent = plant.category || "Not specified";
  popupTransit.textContent = plant.transit || "Not specified";
  popupSunlight.textContent = plant.sunlight || "Not specified";

  // Set up Close button
  const closeDetailsBtn = document.getElementById("close-details-btn");
  closeDetailsBtn.onclick = () => {
    closePlantDetailsPopup();
  };

  // Show the popup
  popup.classList.remove("hidden");
  popup.classList.add("visible");

  // Set up auto-close timer (5 seconds)
  const autoCloseTimer = setTimeout(() => {
    closePlantDetailsPopup();
  }, 5000);

  // Clear timer if user interacts with popup
  popup.addEventListener("click", () => {
    clearTimeout(autoCloseTimer);
  });
}

function closePlantDetailsPopup() {
  const popup = document.getElementById("plant-details-popup");
  popup.classList.remove("visible");
  popup.classList.add("hidden");
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Fetch plants data
  fetchPlants();

  // Set up close button for plant details popup
  document
    .getElementById("close-plant-details")
    .addEventListener("click", closePlantDetailsPopup);

  // Close popup when clicking outside
  document
    .getElementById("plant-details-popup")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("plant-details-popup")) {
        closePlantDetailsPopup();
      }
    });

  // Set up close button in the popup
  document
    .getElementById("close-details-btn")
    .addEventListener("click", closePlantDetailsPopup);
});
