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

// Store all plants data
let allPlants = [];

// DOM elements
const plantListInput = document.getElementById("plant-list");
const customerNameInput = document.getElementById("customer-name");
const customerPhoneInput = document.getElementById("customer-phone");
const customerAddressInput = document.getElementById("customer-address");
const customerPincodeInput = document.getElementById("customer-pincode");
const deliveryChargesInput = document.getElementById("delivery-charges");
const deliveryPartnerSelect = document.getElementById("delivery-partner");
const generateBillBtn = document.getElementById("generate-bill-btn");
const exportPdfBtn = document.getElementById("export-pdf-btn");
const printBillBtn = document.getElementById("print-bill-btn");
const newBillBtn = document.getElementById("new-bill-btn");
const billContainer = document.getElementById("bill-container");
const billContent = document.getElementById("bill-content");
const billItemsBody = document.getElementById("bill-items-body");
const billInvoiceNumber = document.getElementById("bill-invoice-number");
const billDate = document.getElementById("bill-date");
const billCustomerName = document.getElementById("bill-customer-name");
const billCustomerPhone = document.getElementById("bill-customer-phone");
const billCustomerAddress = document.getElementById("bill-customer-address");
const billSubtotal = document.getElementById("bill-subtotal");
const billDelivery = document.getElementById("bill-delivery");
const billGrandTotal = document.getElementById("bill-grand-total");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

// Constants
const DEFAULT_DELIVERY_CHARGE = 100; // Default delivery charge in rupees

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

    // Enable the generate bill button once plants are loaded
    generateBillBtn.disabled = false;
  } catch (error) {
    console.error("Error fetching plants:", error);
    showError("Error loading plant data. Please try again later.");
  }
}

// Parse the plant list input
function parsePlantList(input) {
  if (!input.trim()) {
    showError("Please enter plant IDs and quantities.");
    return null;
  }

  try {
    // Split by commas
    const items = input.split(",").map((item) => item.trim());

    // Use a map to track quantities by plant ID
    const plantQuantityMap = new Map();

    for (const item of items) {
      // Split by hyphen to get ID and quantity
      const [idStr, quantityStr] = item.split("-").map((part) => part.trim());

      // Validate ID and quantity
      const id = parseInt(idStr);
      const quantity = parseInt(quantityStr);

      if (isNaN(id) || isNaN(quantity)) {
        showError(
          `Invalid format: ${item}. Please use format: plant_id-quantity`
        );
        return null;
      }

      if (quantity <= 0) {
        showError(`Quantity must be greater than 0 for plant ID ${id}`);
        return null;
      }

      // Find the plant in our data
      const plant = allPlants.find((p) => p.id === id);
      if (!plant) {
        showError(`Plant with ID ${id} not found`);
        return null;
      }

      // Add to or update the quantity in the map
      if (plantQuantityMap.has(id)) {
        // If this plant ID is already in the map, add to its quantity
        const currentQuantity = plantQuantityMap.get(id).quantity;
        plantQuantityMap.get(id).quantity = currentQuantity + quantity;
      } else {
        // Otherwise, add a new entry to the map
        plantQuantityMap.set(id, {
          id,
          quantity,
          plant,
        });
      }
    }

    // Convert the map values to an array
    const parsedItems = Array.from(plantQuantityMap.values());

    return parsedItems;
  } catch (error) {
    console.error("Error parsing plant list:", error);
    showError(
      "Invalid format. Please use format: plant_id-quantity,plant_id-quantity"
    );
    return null;
  }
}

// Generate the bill
function generateBill() {
  // Hide any previous error
  hideError();

  // Get input values
  const plantListValue = plantListInput.value;
  const customerName = customerNameInput.value.trim();
  const customerPhone = customerPhoneInput.value.trim();
  const customerAddress = customerAddressInput.value.trim();
  const customerPincode = customerPincodeInput.value.trim();
  const deliveryPartner = deliveryPartnerSelect.value;

  // Get delivery charges (use default if empty or invalid)
  let deliveryCharge = DEFAULT_DELIVERY_CHARGE;
  if (deliveryChargesInput.value.trim() !== "") {
    const inputCharge = parseFloat(deliveryChargesInput.value.trim());
    if (!isNaN(inputCharge) && inputCharge >= 0) {
      deliveryCharge = inputCharge;
    }
  }

  // Validate inputs
  if (!customerName) {
    showError("Please enter customer name");
    return;
  }

  // Parse plant list
  const parsedItems = parsePlantList(plantListValue);
  if (!parsedItems) {
    return; // Error already shown in parsePlantList
  }

  // Generate invoice number and date
  const invoiceNumber = generateInvoiceNumber();
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Update bill header
  billInvoiceNumber.textContent = invoiceNumber;
  billDate.textContent = currentDate;

  // Update customer info
  billCustomerName.textContent = customerName;
  billCustomerPhone.textContent = customerPhone || "N/A";
  billCustomerAddress.textContent = customerAddress || "N/A";

  // Update pincode if provided
  const pincodeContainer = document.getElementById(
    "bill-customer-pincode-container"
  );
  const billCustomerPincode = document.getElementById("bill-customer-pincode");
  if (customerPincode) {
    billCustomerPincode.textContent = customerPincode;
    pincodeContainer.classList.remove("hidden");
  } else {
    pincodeContainer.classList.add("hidden");
  }

  // Update delivery partner
  const billDeliveryPartner = document.getElementById("bill-delivery-partner");
  billDeliveryPartner.textContent = deliveryPartner;

  // Generate bill items
  let subtotal = 0;
  let itemsHTML = "";

  parsedItems.forEach((item, index) => {
    const { plant, quantity } = item;
    const price = parseFloat(plant.salesPrice) || 0;
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    itemsHTML += `
      <tr>
        <td>${index + 1}</td>
        <td><img src="${plant.url}" alt="${
      plant.title
    }" class="bill-plant-image"></td>
        <td>${plant.id}</td>
        <td>${plant.title}</td>
        <td>₹${price.toFixed(2)}</td>
        <td>${quantity}</td>
        <td>₹${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  // Update bill items
  billItemsBody.innerHTML = itemsHTML;

  // Update totals
  const grandTotal = subtotal + deliveryCharge;
  billSubtotal.textContent = subtotal.toFixed(2);
  billDelivery.textContent = deliveryCharge.toFixed(2);
  billGrandTotal.textContent = grandTotal.toFixed(2);

  // Show the bill
  billContainer.classList.remove("hidden");

  // Scroll to the bill
  billContainer.scrollIntoView({ behavior: "smooth" });
}

// Generate a random invoice number
function generateInvoiceNumber() {
  const prefix = "RPH";
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
}

// Export bill as PDF
function exportAsPDF() {
  // Get the HTML element to convert
  const element = billContent;

  // Create a clone of the element to avoid modifying the original
  const clone = element.cloneNode(true);

  // Apply print styles to the clone
  clone.classList.add("print-mode");
  document.body.appendChild(clone);

  // Show loading message
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "pdf-loading-message";
  loadingMessage.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
  loadingMessage.style.position = "fixed";
  loadingMessage.style.top = "50%";
  loadingMessage.style.left = "50%";
  loadingMessage.style.transform = "translate(-50%, -50%)";
  loadingMessage.style.padding = "20px";
  loadingMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  loadingMessage.style.color = "white";
  loadingMessage.style.borderRadius = "8px";
  loadingMessage.style.zIndex = "9999";
  document.body.appendChild(loadingMessage);

  // Disable export button to prevent multiple clicks
  exportPdfBtn.disabled = true;

  // Wait for all images to load before generating PDF
  const images = clone.querySelectorAll("img");
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if an image fails to load
      });
    }
  });

  // When all images are loaded, generate the PDF
  Promise.all(imagePromises)
    .then(() => {
      // Use html2canvas to capture the element
      return html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000, // 15 seconds timeout for images
      });
    })
    .then((canvas) => {
      // Remove the clone and loading message from the document
      document.body.removeChild(clone);
      document.body.removeChild(loadingMessage);

      // Create PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");

      // Get dimensions
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      const customerName = customerNameInput.value.trim() || "customer";
      const fileName = `rosary_plant_house_bill_${customerName
        .replace(/\s+/g, "_")
        .toLowerCase()}.pdf`;
      pdf.save(fileName);

      // Re-enable export button
      exportPdfBtn.disabled = false;
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      document.body.removeChild(clone);
      document.body.removeChild(loadingMessage);
      showError("Error generating PDF. Please try again.");
      exportPdfBtn.disabled = false;
    });
}

// Print the bill
function printBill() {
  window.print();
}

// Reset the form for a new bill
function resetForm() {
  plantListInput.value = "";
  customerNameInput.value = "";
  customerPhoneInput.value = "";
  customerAddressInput.value = "";
  customerPincodeInput.value = "";
  deliveryChargesInput.value = "99";
  deliveryPartnerSelect.value = "DTDC Courier";
  billContainer.classList.add("hidden");
  hideError();

  // Focus on the plant list input
  plantListInput.focus();
}

// Show error message
function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove("hidden");
}

// Hide error message
function hideError() {
  errorMessage.classList.add("hidden");
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Disable generate button until plants are loaded
  generateBillBtn.disabled = true;

  // Fetch plants data
  fetchPlants();

  // Set up event listeners
  generateBillBtn.addEventListener("click", generateBill);
  exportPdfBtn.addEventListener("click", exportAsPDF);
  printBillBtn.addEventListener("click", printBill);
  newBillBtn.addEventListener("click", resetForm);
});
