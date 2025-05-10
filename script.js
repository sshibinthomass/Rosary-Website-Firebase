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

let allPlants = []; // Store all plants for filtering

async function fetchPlants() {
  const plantsCol = collection(db, "plants");
  const plantSnapshot = await getDocs(plantsCol);

  allPlants = plantSnapshot.docs.map((doc) => ({
    id: parseInt(doc.id), // Convert id to number for correct sorting
    ...doc.data(),
  }));

  // Log plants with availability status for debugging
  console.log(
    "Plants with availability status:",
    allPlants.map((plant) => ({
      id: plant.id,
      title: plant.title,
      available: plant.available,
    }))
  );

  // Sort plants by ID
  allPlants.sort((a, b) => a.id - b.id);

  // Note: Plants will be filtered by availability in the filterPlants function

  // Apply filter from URL if available
  applyFiltersFromURL();
}

function filterPlants() {
  // Get checkbox filter values for the standard checkboxes
  const motherChecked = document.getElementById("filter-mother").checked;
  const hangingChecked = document.getElementById("filter-hanging").checked;
  const comboChecked = document.getElementById("filter-combo").checked;
  const indoorChecked = document.getElementById("filter-indoor").checked;
  const restockedChecked = document.getElementById("filter-restocked").checked;

  // Get selected values from dropdown checkboxes
  const selectedWateringValues = getSelectedFilterValues("watering");
  const selectedCategoryValues = getSelectedFilterValues("category");
  const selectedTransitValues = getSelectedFilterValues("transit");
  const selectedSunlightValues = getSelectedFilterValues("sunlight");

  // For backward compatibility with the hidden select elements
  document.getElementById("watering-filter").value =
    selectedWateringValues.length === 1 ? selectedWateringValues[0] : "All";
  document.getElementById("category-filter").value =
    selectedCategoryValues.length === 1 ? selectedCategoryValues[0] : "All";
  document.getElementById("transit-filter").value =
    selectedTransitValues.length === 1 ? selectedTransitValues[0] : "All";
  document.getElementById("sunlight-filter").value =
    selectedSunlightValues.length === 1 ? selectedSunlightValues[0] : "All";

  // Update the URL query parameters dynamically
  const url = new URL(window.location);

  // Update URL parameters for dropdown filters
  updateUrlParams(url, "watering", selectedWateringValues);
  updateUrlParams(url, "category", selectedCategoryValues);
  updateUrlParams(url, "transit", selectedTransitValues);
  updateUrlParams(url, "sunlight", selectedSunlightValues);

  // Set checkboxes in URL
  motherChecked
    ? url.searchParams.set("mother", "true")
    : url.searchParams.delete("mother");
  hangingChecked
    ? url.searchParams.set("hanging", "true")
    : url.searchParams.delete("hanging");
  comboChecked
    ? url.searchParams.set("combo", "true")
    : url.searchParams.delete("combo");
  indoorChecked
    ? url.searchParams.set("indoor", "true")
    : url.searchParams.delete("indoor");
  restockedChecked
    ? url.searchParams.set("isRestocked", "true")
    : url.searchParams.delete("isRestocked");

  window.history.pushState({}, "", url);

  // Apply the filters
  // First filter out plants that are not available
  const unavailablePlants = allPlants.filter(
    (plant) => plant.available !== undefined && plant.available !== true
  );

  if (unavailablePlants.length > 0) {
    console.log(
      "Filtered out unavailable plants:",
      unavailablePlants.map((p) => ({ id: p.id, title: p.title }))
    );
  }

  let filteredPlants = allPlants.filter((plant) => {
    // If available property doesn't exist, default to true for backward compatibility
    return plant.available === undefined ? true : plant.available === true;
  });

  // Apply dropdown filters with multiple selection support
  if (
    !selectedWateringValues.includes("All") &&
    selectedWateringValues.length > 0
  ) {
    filteredPlants = filteredPlants.filter((plant) =>
      selectedWateringValues.includes(plant.watering)
    );
  }

  if (
    !selectedCategoryValues.includes("All") &&
    selectedCategoryValues.length > 0
  ) {
    filteredPlants = filteredPlants.filter((plant) =>
      selectedCategoryValues.includes(plant.category)
    );
  }

  if (
    !selectedTransitValues.includes("All") &&
    selectedTransitValues.length > 0
  ) {
    filteredPlants = filteredPlants.filter((plant) =>
      selectedTransitValues.includes(plant.transit)
    );
  }

  if (
    !selectedSunlightValues.includes("All") &&
    selectedSunlightValues.length > 0
  ) {
    filteredPlants = filteredPlants.filter((plant) =>
      selectedSunlightValues.includes(plant.sunlight)
    );
  }

  // Apply checkbox filters
  if (motherChecked)
    filteredPlants = filteredPlants.filter((plant) => plant.mother === true);
  if (hangingChecked)
    filteredPlants = filteredPlants.filter((plant) => plant.hanging === true);
  if (comboChecked)
    filteredPlants = filteredPlants.filter((plant) => plant.combo === true);
  if (indoorChecked)
    filteredPlants = filteredPlants.filter((plant) => plant.indoor === true);
  if (restockedChecked)
    filteredPlants = filteredPlants.filter(
      (plant) => plant.isRestocked === true
    );

  displayPlants(filteredPlants);
}

// Helper function to get selected values from dropdown checkboxes
function getSelectedFilterValues(filterType) {
  const checkboxes = document.querySelectorAll(
    `input[type="checkbox"][data-filter="${filterType}"]:checked`
  );
  const values = Array.from(checkboxes).map(
    (checkbox) => checkbox.dataset.value
  );

  // If "All" is selected or no options are selected, return just "All"
  if (values.includes("All") || values.length === 0) {
    return ["All"];
  }

  return values;
}

// Helper function to update URL parameters for multiple selections
function updateUrlParams(url, paramName, values) {
  if (!values.includes("All") && values.length > 0) {
    // For multiple values, use comma-separated string
    if (values.length === 1) {
      url.searchParams.set(paramName, values[0]);
    } else {
      url.searchParams.set(paramName, values.join(","));
    }
  } else {
    url.searchParams.delete(paramName);
  }
}

function applyFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  // Set the hidden select elements for backward compatibility
  document.getElementById("watering-filter").value =
    urlParams.get("watering") || "All";
  document.getElementById("category-filter").value =
    urlParams.get("category") || "All";
  document.getElementById("transit-filter").value =
    urlParams.get("transit") || "All";
  document.getElementById("sunlight-filter").value =
    urlParams.get("sunlight") || "All";

  // Load checkboxes from URL
  document.getElementById("filter-mother").checked =
    urlParams.get("mother") === "true";
  document.getElementById("filter-hanging").checked =
    urlParams.get("hanging") === "true";
  document.getElementById("filter-combo").checked =
    urlParams.get("combo") === "true";
  document.getElementById("filter-indoor").checked =
    urlParams.get("indoor") === "true";
  document.getElementById("filter-restocked").checked =
    urlParams.get("isRestocked") === "true";

  // Set dropdown checkboxes based on URL parameters
  setDropdownCheckboxesFromURL("watering", urlParams.get("watering"));
  setDropdownCheckboxesFromURL("category", urlParams.get("category"));
  setDropdownCheckboxesFromURL("transit", urlParams.get("transit"));
  setDropdownCheckboxesFromURL("sunlight", urlParams.get("sunlight"));

  // Update dropdown button text
  updateDropdownButtonText();

  // Apply filters based on URL parameters
  filterPlants();
}

// Helper function to set dropdown checkboxes from URL parameters
function setDropdownCheckboxesFromURL(filterType, paramValue) {
  if (!paramValue) {
    // If no parameter, check only the "All" checkbox
    const allCheckbox = document.querySelector(
      `.dropdown-item input[data-filter="${filterType}"][data-value="All"]`
    );
    if (allCheckbox) {
      allCheckbox.checked = true;
    }
    return;
  }

  // Check if there are multiple values (comma-separated)
  const values = paramValue.split(",");

  // Uncheck all checkboxes for this filter type
  const checkboxes = document.querySelectorAll(
    `.dropdown-item input[data-filter="${filterType}"]`
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  // Check the appropriate checkboxes
  values.forEach((value) => {
    const checkbox = document.querySelector(
      `.dropdown-item input[data-filter="${filterType}"][data-value="${value}"]`
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  });

  // If "All" is among the values, uncheck all others
  if (values.includes("All")) {
    checkboxes.forEach((checkbox) => {
      if (checkbox.dataset.value !== "All") {
        checkbox.checked = false;
      }
    });
  }
}

// Helper function to update all dropdown button text
function updateDropdownButtonText() {
  const filterTypes = ["watering", "category", "transit", "sunlight"];

  filterTypes.forEach((filterType) => {
    const selectedValues = getSelectedFilterValues(filterType);
    let buttonText;

    if (selectedValues.includes("All") || selectedValues.length === 0) {
      buttonText = `${
        filterType.charAt(0).toUpperCase() + filterType.slice(1)
      }: All`;
    } else if (selectedValues.length === 1) {
      buttonText = `${
        filterType.charAt(0).toUpperCase() + filterType.slice(1)
      }: ${selectedValues[0]}`;
    } else {
      buttonText = `${
        filterType.charAt(0).toUpperCase() + filterType.slice(1)
      }: Multiple (${selectedValues.length})`;
    }

    // Find the dropdown toggle
    const toggleButtons = document.querySelectorAll(".dropdown-toggle");
    toggleButtons.forEach((button) => {
      if (
        button.textContent.includes(
          filterType.charAt(0).toUpperCase() + filterType.slice(1)
        )
      ) {
        button.innerHTML = `${buttonText} <i class="fas fa-chevron-down"></i>`;
      }
    });
  });
}

function displayPlants(plants) {
  const container = document.getElementById("plant-container");
  container.innerHTML = "";

  // Check if there are no plants to display
  if (plants.length === 0) {
    const noItemsMessage = document.createElement("div");
    noItemsMessage.classList.add("no-items-message");
    noItemsMessage.innerHTML = `
      <div class="no-items-icon">
        <i class="fas fa-leaf"></i>
      </div>
      <h3>No plants found for the current filters</h3>
      <p>Try adjusting your filter criteria or view all plants.</p>
      <button id="reset-filters-btn" class="reset-filters-btn">
        <i class="fas fa-sync-alt"></i> Show All Plants
      </button>
    `;
    container.appendChild(noItemsMessage);

    // Add event listener to the reset button
    document
      .getElementById("reset-filters-btn")
      .addEventListener("click", () => {
        resetAllFilters();
      });

    return;
  }

  // Display plants if there are any
  plants.forEach((plant) => {
    const plantCard = document.createElement("div");
    plantCard.classList.add("plant-card");
    console.log(plant);
    // Calculate discount percentage
    const originalPrice = parseFloat(plant.originalPrice);
    const salesPrice = parseFloat(plant.salesPrice);
    const discountPercentage = Math.round(
      ((originalPrice - salesPrice) / originalPrice) * 100
    );

    // Determine if plant should have a badge
    let badgeHTML = "";
    if (discountPercentage >= 15) {
      badgeHTML = `<div class="plant-badge sale-badge">SALE ${discountPercentage}% OFF</div>`;
    } else if (plant.isRestocked) {
      badgeHTML = `<div class="plant-badge new-badge">NEW</div>`;
    } else if (plant.mother) {
      badgeHTML = `<div class="plant-badge new-badge">BIG</div>`;
    }

    // Add care icons based on plant properties
    let careIconsHTML = '<div class="plant-care-icons">';

    // Water level icon
    if (plant.watering === "Low") {
      careIconsHTML +=
        '<div class="care-icon" title="Low Water Needs"><i class="fas fa-tint"></i></div>';
    } else if (plant.watering === "Moderate") {
      careIconsHTML +=
        '<div class="care-icon" title="Medium Water Needs"><i class="fas fa-tint-slash"></i></div>';
    } else if (plant.watering === "High") {
      careIconsHTML +=
        '<div class="care-icon" title="High Water Needs"><i class="fas fa-water"></i></div>';
    }

    // Sunlight icon
    if (plant.sunlight === "Low") {
      careIconsHTML +=
        '<div class="care-icon" title="Low Light Needs"><i class="fas fa-sun"></i></div>';
    } else if (plant.sunlight === "Moderate") {
      careIconsHTML +=
        '<div class="care-icon" title="Medium Light Needs"><i class="fas fa-cloud-sun"></i></div>';
    } else if (plant.sunlight === "High") {
      careIconsHTML +=
        '<div class="care-icon" title="High Light Needs"><i class="fas fa-sun"></i></div>';
    }

    careIconsHTML += "</div>";
    console.log(plant);
    plantCard.innerHTML = `
            <img src="${plant.url}" alt="${plant.title}">
            ${badgeHTML}
            ${careIconsHTML}
            <div class="plant-card-content">
                <h3 data-id="${plant.id}">${plant.id}. ${plant.title}</h3>
                <p class="price">
                  Price: ${
                    plant.originalPrice > plant.salesPrice
                      ? `<s>₹${plant.originalPrice}</s> ₹${plant.salesPrice}`
                      : `₹${plant.salesPrice}`
                  }
                </p>
             <div class="plant-specs">
                    <span class="plant-spec">Watering: ${plant.watering}</span>
                    <span class="plant-spec">Sunlight: ${plant.sunlight}</span>
                    <span class="plant-spec">Transit Risk: ${
                      plant.transit
                    }</span>
                    <span class="plant-spec">Category: ${plant.category}</span>
                </div>
            </div>
            <div class="cart-controls">
                <input type="number" id="qty-${plant.id}" min="1" value="1">
                <button class="add-to-cart" onclick="addToCart(event, '${
                  plant.id
                }', '${plant.title}', '${plant.salesPrice}', '${plant.url}', '${
      plant.watering
    }', '${plant.category}', '${plant.transit}', '${plant.sunlight}')">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        `;

    container.appendChild(plantCard);

    // Add click event to the plant name to show details popup
    const plantName = plantCard.querySelector("h3");
    plantName.addEventListener("click", () => {
      showPlantDetailsPopup(plant);
    });
  });
}

function addToCart(
  _,
  id,
  title,
  price,
  image,
  watering,
  category,
  transit,
  sunlight
) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const quantityInput = document.getElementById(`qty-${id}`);
  const quantity = parseInt(quantityInput.value);

  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id,
      title,
      price,
      image,
      quantity,
      watering,
      category,
      transit,
      sunlight,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  loadCart(); // Update cart sidebar instantly

  // Show the detailed popup instead of the simple notification
  showCartPopup(
    id,
    title,
    price,
    image,
    quantity,
    watering,
    category,
    transit,
    sunlight
  );

  quantityInput.value = 1;
}

// Function to show the detailed cart popup
function showCartPopup(
  id,
  title,
  price,
  image,
  quantity,
  watering,
  category,
  transit,
  sunlight
) {
  const popup = document.getElementById("cart-popup");
  const popupImage = document.getElementById("popup-image");
  const popupTitle = document.getElementById("popup-title");
  const popupId = document.getElementById("popup-id");
  const popupPrice = document.getElementById("popup-price");
  const popupQuantity = document.getElementById("popup-quantity");
  const popupTotal = document.getElementById("popup-total");
  const popupWatering = document.getElementById("popup-watering");
  const popupCategory = document.getElementById("popup-category");
  const popupTransit = document.getElementById("popup-transit");
  const popupSunlight = document.getElementById("popup-sunlight");

  // Set the popup content
  popupImage.src = image;
  popupImage.alt = title;
  popupTitle.textContent = title;
  popupId.textContent = id;
  popupPrice.textContent = `₹${price}`;
  popupQuantity.textContent = quantity;
  popupTotal.textContent = `₹${(price * quantity).toFixed(2)}`;

  // Set the additional plant details
  popupWatering.textContent = watering || "Not specified";
  popupCategory.textContent = category || "Not specified";
  popupTransit.textContent = transit || "Not specified";
  popupSunlight.textContent = sunlight || "Not specified";

  // Show the popup
  popup.classList.remove("hidden");
  popup.classList.add("visible");

  // Set up auto-close timer (1 second)
  const autoCloseTimer = setTimeout(() => {
    closeCartPopup();
  }, 1000);

  // Store the timer ID so we can clear it if the user manually closes the popup
  popup.dataset.timerId = autoCloseTimer;

  // Add click event to close popup when clicking outside
  // Use setTimeout to prevent the event from triggering immediately
  setTimeout(() => {
    document.addEventListener("click", closePopupOnOutsideClick);
  }, 10);
}

// Function to close popup when clicking outside
function closePopupOnOutsideClick(event) {
  const popupContent = document.querySelector(".popup-content");

  // If the click is outside the popup content
  if (!popupContent.contains(event.target)) {
    closeCartPopup();
  }

  // Note: We don't remove the event listener here anymore
  // It will be removed in the closeCartPopup function
}

// Function to close the cart popup
function closeCartPopup() {
  const popup = document.getElementById("cart-popup");

  // Clear the auto-close timer if it exists
  if (popup.dataset.timerId) {
    clearTimeout(parseInt(popup.dataset.timerId));
    delete popup.dataset.timerId;
  }

  // Remove the outside click event listener if it exists
  document.removeEventListener("click", closePopupOnOutsideClick);

  // Hide the popup
  popup.classList.remove("visible");
  popup.classList.add("hidden");
}

// This function is no longer used as we're using the popup instead
// Keeping the notification element in the HTML for potential future use

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  document.getElementById("cart-count").textContent = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
}

// Set up event listeners for the cart popup
document
  .getElementById("close-popup")
  .addEventListener("click", closeCartPopup);
document
  .getElementById("continue-shopping")
  .addEventListener("click", closeCartPopup);

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

  // Reset quantity input
  document.getElementById("plant-details-quantity").value = 1;

  // Set up Add to Cart button
  const addToCartBtn = document.getElementById("plant-details-add-to-cart");
  addToCartBtn.onclick = () => {
    const quantity = parseInt(
      document.getElementById("plant-details-quantity").value
    );
    addToCartFromPopup(plant, quantity);
    closePlantDetailsPopup();
  };

  // Show the popup
  popup.classList.remove("hidden");
  popup.classList.add("visible");

  // Set up auto-close timer (5 seconds)
  const autoCloseTimer = setTimeout(() => {
    closePlantDetailsPopup();
  }, 5000);

  // Store the timer ID so we can clear it if the user manually closes the popup
  popup.dataset.timerId = autoCloseTimer;

  // Add click event to close popup when clicking outside
  // Use setTimeout to prevent the event from triggering immediately
  setTimeout(() => {
    document.addEventListener("click", closePlantDetailsOnOutsideClick);
  }, 10);
}

function closePlantDetailsPopup() {
  const popup = document.getElementById("plant-details-popup");

  // Clear the auto-close timer if it exists
  if (popup.dataset.timerId) {
    clearTimeout(parseInt(popup.dataset.timerId));
    delete popup.dataset.timerId;
  }

  // Remove the outside click event listener if it exists
  document.removeEventListener("click", closePlantDetailsOnOutsideClick);

  // Hide the popup
  popup.classList.remove("visible");
  popup.classList.add("hidden");
}

function closePlantDetailsOnOutsideClick(event) {
  const popupContent = document.querySelector(
    "#plant-details-popup .popup-content"
  );

  // If the click is outside the popup content
  if (!popupContent.contains(event.target)) {
    closePlantDetailsPopup();
  }
}

function addToCartFromPopup(plant, quantity) {
  // Similar to addToCart but takes a plant object and quantity directly
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItem = cart.find((item) => item.id === plant.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: plant.id,
      title: plant.title,
      price: plant.salesPrice,
      image: plant.url,
      quantity,
      watering: plant.watering,
      category: plant.category,
      transit: plant.transit,
      sunlight: plant.sunlight,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  loadCart(); // Update cart sidebar instantly

  // Show the detailed popup
  showCartPopup(
    plant.id,
    plant.title,
    plant.salesPrice,
    plant.url,
    quantity,
    plant.watering,
    plant.category,
    plant.transit,
    plant.sunlight
  );
}

// Set up event listeners for the plant details popup
document
  .getElementById("close-plant-details")
  .addEventListener("click", closePlantDetailsPopup);

// Attach functions to window object
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.filterPlants = filterPlants;
window.closeCartPopup = closeCartPopup;
window.closePlantDetailsPopup = closePlantDetailsPopup;

// Dropdown Menu Functionality
function setupDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");

  // Toggle dropdown on button click
  dropdowns.forEach((dropdown) => {
    const toggleButton = dropdown.querySelector(".dropdown-toggle");

    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();

      // Close all other dropdowns
      dropdowns.forEach((otherDropdown) => {
        if (
          otherDropdown !== dropdown &&
          otherDropdown.classList.contains("active")
        ) {
          otherDropdown.classList.remove("active");
        }
      });

      // Toggle current dropdown
      dropdown.classList.toggle("active");
    });

    // Add change event to dropdown checkboxes
    const checkboxes = dropdown.querySelectorAll(
      ".dropdown-menu input[type='checkbox']"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        event.stopPropagation();

        const filterType = checkbox.dataset.filter;
        const filterValue = checkbox.dataset.value;
        const isChecked = checkbox.checked;

        // Handle "All" checkbox special case
        if (filterValue === "All" && isChecked) {
          // Uncheck all other checkboxes in this dropdown
          checkboxes.forEach((cb) => {
            if (cb !== checkbox && cb.dataset.filter === filterType) {
              cb.checked = false;
            }
          });
        } else if (filterValue !== "All" && isChecked) {
          // If any other checkbox is checked, uncheck the "All" checkbox
          const allCheckbox = dropdown.querySelector(
            `.dropdown-item input[data-filter="${filterType}"][data-value="All"]`
          );
          if (allCheckbox) {
            allCheckbox.checked = false;
          }
        }

        // Check if multi-filter mode is enabled
        const multiFilterEnabled = document.getElementById(
          "multi-filter-checkbox"
        ).checked;

        // If multi-filter is NOT enabled and this is not an "All" selection
        if (!multiFilterEnabled && filterValue !== "All" && isChecked) {
          // Reset other filter dropdowns
          const allFilterTypes = [
            "watering",
            "category",
            "transit",
            "sunlight",
          ];

          allFilterTypes.forEach((otherFilterType) => {
            if (otherFilterType !== filterType) {
              // Find all checkboxes for this filter type
              const otherCheckboxes = document.querySelectorAll(
                `input[type="checkbox"][data-filter="${otherFilterType}"]`
              );

              // Uncheck all except "All"
              otherCheckboxes.forEach((cb) => {
                if (cb.dataset.value === "All") {
                  cb.checked = true;
                } else {
                  cb.checked = false;
                }
              });

              // Update the dropdown button text
              // Find the dropdown toggle by checking all toggle buttons
              let otherDropdownToggle = null;
              const allToggleButtons =
                document.querySelectorAll(".dropdown-toggle");
              const filterCapitalized =
                otherFilterType.charAt(0).toUpperCase() +
                otherFilterType.slice(1);

              allToggleButtons.forEach((button) => {
                if (button.textContent.includes(filterCapitalized)) {
                  otherDropdownToggle = button;
                }
              });

              if (otherDropdownToggle) {
                otherDropdownToggle.innerHTML = `${
                  otherFilterType.charAt(0).toUpperCase() +
                  otherFilterType.slice(1)
                }: All <i class="fas fa-chevron-down"></i>`;
              }
            }
          });
        }

        // If no checkbox is checked in this dropdown, check the "All" checkbox
        const checkedBoxes = Array.from(checkboxes).filter(
          (cb) => cb.checked && cb.dataset.filter === filterType
        );

        if (checkedBoxes.length === 0) {
          const allCheckbox = dropdown.querySelector(
            `.dropdown-item input[data-filter="${filterType}"][data-value="All"]`
          );
          if (allCheckbox) {
            allCheckbox.checked = true;
          }
        }

        // Apply the filter
        filterPlants();

        // Update dropdown button text
        const selectedValues = getSelectedFilterValues(filterType);
        let buttonText;

        if (selectedValues.includes("All") || selectedValues.length === 0) {
          buttonText = `${
            filterType.charAt(0).toUpperCase() + filterType.slice(1)
          }: All`;
        } else if (selectedValues.length === 1) {
          buttonText = `${
            filterType.charAt(0).toUpperCase() + filterType.slice(1)
          }: ${selectedValues[0]}`;
        } else {
          buttonText = `${
            filterType.charAt(0).toUpperCase() + filterType.slice(1)
          }: Multiple (${selectedValues.length})`;
        }

        toggleButton.innerHTML = `${buttonText} <i class="fas fa-chevron-down"></i>`;
      });
    });

    // Add click event to dropdown items to prevent closing when clicking on labels
    const dropdownItems = dropdown.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  });

  // Initialize dropdown button text based on current filter values
  dropdowns.forEach((dropdown) => {
    const toggleButton = dropdown.querySelector(".dropdown-toggle");
    const firstMenuItem = dropdown.querySelector(".dropdown-menu a");

    if (firstMenuItem) {
      const filterType = firstMenuItem.dataset.filter;
      const selectElement = document.getElementById(`${filterType}-filter`);

      if (selectElement) {
        const currentValue = selectElement.value;
        toggleButton.innerHTML = `${
          filterType.charAt(0).toUpperCase() + filterType.slice(1)
        }: ${currentValue} <i class="fas fa-chevron-down"></i>`;

        // Set active state in dropdown menu
        const activeMenuItem = dropdown.querySelector(
          `.dropdown-menu a[data-value="${currentValue}"]`
        );
        if (activeMenuItem) {
          activeMenuItem.classList.add("active");
        }
      }
    }
  });
}

// Fetch and display plants on page load
fetchPlants();
updateCartCount();

// Function to reset all filters and show all plants
function resetAllFilters() {
  // Get all filter types
  const allFilterTypes = ["watering", "category", "transit", "sunlight"];

  // Reset all filters to "All"
  allFilterTypes.forEach((filterType) => {
    // Reset the select element
    const selectElement = document.getElementById(`${filterType}-filter`);
    if (selectElement) {
      selectElement.value = "All";
    }

    // Find all checkboxes for this filter type
    const checkboxes = document.querySelectorAll(
      `input[type="checkbox"][data-filter="${filterType}"]`
    );

    // Uncheck all except "All"
    checkboxes.forEach((cb) => {
      if (cb.dataset.value === "All") {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    });

    // Find the dropdown
    let dropdownToggle = null;
    const allToggleButtons = document.querySelectorAll(".dropdown-toggle");
    const filterCapitalized =
      filterType.charAt(0).toUpperCase() + filterType.slice(1);

    allToggleButtons.forEach((button) => {
      if (button.textContent.includes(filterCapitalized)) {
        dropdownToggle = button;
      }
    });

    if (dropdownToggle) {
      // Reset the dropdown button text
      dropdownToggle.innerHTML = `${filterCapitalized}: All <i class="fas fa-chevron-down"></i>`;
    }
  });

  // Reset checkbox filters
  document.getElementById("filter-mother").checked = false;
  document.getElementById("filter-hanging").checked = false;
  document.getElementById("filter-combo").checked = false;
  document.getElementById("filter-indoor").checked = false;
  document.getElementById("filter-restocked").checked = false;

  // Reset multi-filter checkbox
  const multiFilterCheckbox = document.getElementById("multi-filter-checkbox");
  if (multiFilterCheckbox) {
    multiFilterCheckbox.checked = false;
  }

  // Apply the filter to show all plants
  filterPlants();
}

// Setup multi-filter checkbox
function setupMultiFilterCheckbox() {
  const multiFilterCheckbox = document.getElementById("multi-filter-checkbox");

  multiFilterCheckbox.addEventListener("change", function () {
    // If checkbox is unchecked, reset all filters
    if (!this.checked) {
      resetAllFilters();
    }
  });
}

// Setup dropdown menus and multi-filter checkbox
document.addEventListener("DOMContentLoaded", () => {
  setupDropdowns();
  setupMultiFilterCheckbox();
});
