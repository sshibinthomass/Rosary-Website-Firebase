function loadCart() {
  const cartContainer = document.getElementById("cart-container");
  cartContainer.innerHTML = "";

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  let totalPlants = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    totalPlants += item.quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
            <img src="${item.image}" class="cart-item-image" alt="${
      item.title
    }">
            <div class="cart-item-details">
              <h3 class="cart-item-title">${item.id}. ${item.title}</h3>
              <p class="cart-item-price">₹${item.price}*${item.quantity}=₹${
      item.price * item.quantity
    }</p>
              <div class="cart-item-controls">
                <div class="quantity-controls">
                  <button class="qty-btn decrease" data-index="${index}" aria-label="Decrease quantity">
                    <i class="fas fa-minus" aria-hidden="true"></i>
                  </button>
                  <span class="quantity-value">${item.quantity}</span>
                  <button class="qty-btn increase" data-index="${index}" aria-label="Increase quantity">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                  </button>
                </div>
                <button class="remove-btn" data-index="${index}" aria-label="Remove item">
                  <i class="fas fa-trash-alt" aria-hidden="true"></i> Remove
                </button>
              </div>
            </div>
          `;

    // Add click event to prevent closing when clicking on cart items
    cartItem.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    cartContainer.appendChild(cartItem);
  });

  // Update subtotal
  document.getElementById("cart-total").textContent = total.toFixed(2);

  // Calculate total (delivery fee will be added separately)
  const totalWithDelivery = total;
  document.getElementById("cart-total-with-delivery").textContent =
    totalWithDelivery.toFixed(2);

  // Update total plants count
  document.getElementById("cart-count-total").textContent = totalPlants;

  // Attach event listeners to buttons
  document.querySelectorAll(".increase").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the click from closing the sidebar
      // Get the index from the button's data attribute, not from the target
      // This ensures it works whether you click the button or the icon inside
      const index = button.dataset.index;
      changeQuantity(index, 1);
    });
  });

  document.querySelectorAll(".decrease").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the click from closing the sidebar
      // Get the index from the button's data attribute, not from the target
      const index = button.dataset.index;
      changeQuantity(index, -1);
    });
  });

  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent the click from closing the sidebar
      // Get the index from the button's data attribute, not from the target
      const index = button.dataset.index;
      removeFromCart(index);
    });
  });
}

function changeQuantity(index, amount) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += amount;

  if (cart[index].quantity < 1) {
    cart.splice(index, 1); // Remove item if quantity reaches 0
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();

  // Update cart count in header
  if (typeof updateCartCountDisplay === "function") {
    updateCartCountDisplay();
  } else {
    updateCartCount();
  }
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();

  // Update cart count in header
  if (typeof updateCartCountDisplay === "function") {
    updateCartCountDisplay();
  } else {
    updateCartCount();
  }
}

function clearCart() {
  localStorage.removeItem("cart");
  loadCart();

  // Update cart count in header
  if (typeof updateCartCountDisplay === "function") {
    updateCartCountDisplay();
  } else {
    updateCartCount();
  }
}

// Toggle cart sidebar
document.getElementById("cart-toggle").addEventListener("click", (event) => {
  event.stopPropagation(); // Prevent the click from immediately closing the sidebar
  const cartSidebar = document.getElementById("cart-sidebar");
  cartSidebar.classList.add("active");
  loadCart(); // Load the cart content when opening

  // Add a click event listener to the document to close the sidebar when clicking outside
  setTimeout(() => {
    document.addEventListener("click", closeCartSidebarOnOutsideClick);
  }, 10); // Small delay to prevent the event from triggering immediately
});

document.getElementById("close-cart").addEventListener("click", () => {
  closeCartSidebar();
});

// Function to close the cart sidebar when clicking outside
function closeCartSidebarOnOutsideClick(event) {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartToggle = document.getElementById("cart-toggle");

  // If the click is outside the cart sidebar and not on the cart toggle button
  if (
    !cartSidebar.contains(event.target) &&
    !cartToggle.contains(event.target)
  ) {
    closeCartSidebar();
  }
}

// Function to close the cart sidebar
function closeCartSidebar() {
  const cartSidebar = document.getElementById("cart-sidebar");
  cartSidebar.classList.remove("active");

  // Remove the outside click event listener
  document.removeEventListener("click", closeCartSidebarOnOutsideClick);
}

function placeOrderViaWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty. Please add items before placing an order.");
    return;
  }

  // You should replace this with your actual WhatsApp number with country code
  // For example: const phoneNumber = "919876543210"; (for India +91)
  const phoneNumber = "919876543210"; // Replace with your actual WhatsApp number

  // Format the order message
  let message = "Hello, i have chosen the following plants from your site\n";

  let totalAmount = 0;
  let totalPlants = 0;
  let shortSummary = "";

  // Add each plant to the message
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    totalPlants += item.quantity;

    // Add to the main message
    message += `${item.id}. ${item.title}- ₹${item.price} * ${item.quantity} = ₹${itemTotal} \n`;

    // Add to the short summary at the end
    shortSummary += `${item.id}-${item.quantity},`;
  });

  // Remove the last comma from the short summary
  shortSummary = shortSummary.slice(0, -1);

  // Add the total amount
  message += `Total Plants= ${totalPlants}\n`;
  message += `Total Price=₹${totalAmount} (delivery additional)\n\n`;
  message += `${shortSummary}`;

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create the WhatsApp URL
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab
  window.open(whatsappURL, "_blank");
}

// Expose functions globally
window.loadCart = loadCart;
window.clearCart = clearCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.placeOrderViaWhatsApp = placeOrderViaWhatsApp;
window.closeCartSidebar = closeCartSidebar;

// Add event listeners to cart summary buttons to prevent closing when clicked
document
  .querySelector(".place-order-btn")
  .addEventListener("click", (event) => {
    event.stopPropagation();
  });

document
  .querySelector("button[onclick='clearCart()']")
  .addEventListener("click", (event) => {
    event.stopPropagation();
  });

// Function to update cart count in the header
function updateCartCount() {
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = 0;
    cart.forEach((item) => {
      totalItems += item.quantity;
    });
    cartCountElement.textContent = totalItems;
  }
}

// Add event listener for DOMContentLoaded to ensure cart count is updated on all pages
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
});

// Load cart initially
loadCart();

// Update cart count in header
if (typeof updateCartCountDisplay === "function") {
  updateCartCountDisplay();
} else {
  updateCartCount();
}
