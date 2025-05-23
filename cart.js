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

  // Calculate total (delivery fee will be added separately)
  const totalWithDelivery = total;
  document.getElementById("cart-total-with-delivery").textContent =
    totalWithDelivery.toFixed(2);

  // Update total plants count
  document.getElementById("cart-count-total").textContent = totalPlants;

  // No need to adjust padding for fixed footer anymore as it's been removed

  // Variables to track touch start position and movement
  let touchStartY = 0;
  let touchStartX = 0;
  let isTouchScrolling = false;
  const scrollThreshold = 10; // Pixels of movement to consider it a scroll instead of a tap

  // Track if a button action is in progress to prevent double triggers
  let buttonActionInProgress = false;

  // Helper function to handle button actions with debounce
  const handleButtonAction = (button, action) => {
    if (buttonActionInProgress || isTouchScrolling) return;

    buttonActionInProgress = true;

    // Get the index from the button's data attribute
    const index = button.dataset.index;

    // Perform the action
    action(index);

    // Reset the flag after a short delay
    setTimeout(() => {
      buttonActionInProgress = false;
    }, 300); // 300ms delay to prevent double triggers
  };

  // Function to handle touch start on cart container
  const handleTouchStart = (event) => {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    isTouchScrolling = false;
  };

  // Function to handle touch move on cart container
  const handleTouchMove = (event) => {
    if (!touchStartY || !touchStartX) return;

    const touchY = event.touches[0].clientY;
    const touchX = event.touches[0].clientX;

    // Calculate distance moved
    const diffY = Math.abs(touchY - touchStartY);
    const diffX = Math.abs(touchX - touchStartX);

    // If moved more than threshold in any direction, consider it a scroll
    if (diffY > scrollThreshold || diffX > scrollThreshold) {
      isTouchScrolling = true;
    }
  };

  // Add touch event listeners to the cart container to detect scrolling
  cartContainer.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });
  cartContainer.addEventListener("touchmove", handleTouchMove, {
    passive: true,
  });

  // Attach event listeners to buttons with improved touch handling
  document.querySelectorAll(".increase").forEach((button) => {
    // Track touch start on the button itself
    button.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Use touchend for mobile devices with scroll detection
    button.addEventListener(
      "touchend",
      (event) => {
        event.stopPropagation();

        // Only trigger if not scrolling
        if (!isTouchScrolling) {
          event.preventDefault();
          handleButtonAction(button, (index) => changeQuantity(index, 1));
        }

        // Reset scrolling state after a short delay
        setTimeout(() => {
          isTouchScrolling = false;
        }, 100);
      },
      { passive: false }
    );

    // Keep click for desktop devices
    button.addEventListener("click", (event) => {
      // Only process click events that aren't from touch events
      if (
        event.pointerType !== "touch" &&
        event.sourceCapabilities &&
        !event.sourceCapabilities.firesTouchEvents
      ) {
        event.stopPropagation();
        event.preventDefault();
        handleButtonAction(button, (index) => changeQuantity(index, 1));
      }
    });
  });

  document.querySelectorAll(".decrease").forEach((button) => {
    // Track touch start on the button itself
    button.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Use touchend for mobile devices with scroll detection
    button.addEventListener(
      "touchend",
      (event) => {
        event.stopPropagation();

        // Only trigger if not scrolling
        if (!isTouchScrolling) {
          event.preventDefault();
          handleButtonAction(button, (index) => changeQuantity(index, -1));
        }

        // Reset scrolling state after a short delay
        setTimeout(() => {
          isTouchScrolling = false;
        }, 100);
      },
      { passive: false }
    );

    // Keep click for desktop devices
    button.addEventListener("click", (event) => {
      // Only process click events that aren't from touch events
      if (
        event.pointerType !== "touch" &&
        event.sourceCapabilities &&
        !event.sourceCapabilities.firesTouchEvents
      ) {
        event.stopPropagation();
        event.preventDefault();
        handleButtonAction(button, (index) => changeQuantity(index, -1));
      }
    });
  });

  document.querySelectorAll(".remove-btn").forEach((button) => {
    // Track touch start on the button itself
    button.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Use touchend for mobile devices with scroll detection
    button.addEventListener(
      "touchend",
      (event) => {
        event.stopPropagation();

        // Only trigger if not scrolling
        if (!isTouchScrolling) {
          event.preventDefault();
          handleButtonAction(button, (index) => removeFromCart(index));
        }

        // Reset scrolling state after a short delay
        setTimeout(() => {
          isTouchScrolling = false;
        }, 100);
      },
      { passive: false }
    );

    // Keep click for desktop devices
    button.addEventListener("click", (event) => {
      // Only process click events that aren't from touch events
      if (
        event.pointerType !== "touch" &&
        event.sourceCapabilities &&
        !event.sourceCapabilities.firesTouchEvents
      ) {
        event.stopPropagation();
        event.preventDefault();
        handleButtonAction(button, (index) => removeFromCart(index));
      }
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
  updateCartCount();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();

  // Update cart count in header
  updateCartCount();
}

function clearCart() {
  localStorage.removeItem("cart");
  loadCart();

  // Update cart count in header
  updateCartCount();
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
  const phoneNumber = "917904050237"; // Replace with your actual WhatsApp number

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
document.addEventListener("DOMContentLoaded", function () {
  // Track if a summary button action is in progress
  let summaryButtonActionInProgress = false;

  // Helper function to handle summary button actions
  const handleSummaryButtonAction = (event) => {
    if (summaryButtonActionInProgress) return;

    if (
      event.target.closest(".place-order-btn") ||
      event.target.closest(".clear-cart-btn") ||
      event.target.closest(".close-cart-btn")
    ) {
      event.stopPropagation();

      // Set flag to prevent double triggers
      summaryButtonActionInProgress = true;

      // Reset the flag after a short delay
      setTimeout(() => {
        summaryButtonActionInProgress = false;
      }, 300);
    }
  };

  // Use event delegation for click events on desktop
  document.addEventListener("click", function (event) {
    // Only process click events that aren't from touch events
    if (
      !event.sourceCapabilities ||
      !event.sourceCapabilities.firesTouchEvents
    ) {
      handleSummaryButtonAction(event);
    }
  });

  // Use touchend for mobile devices to prevent double triggering
  document.addEventListener(
    "touchend",
    function (event) {
      handleSummaryButtonAction(event);
    },
    { passive: false }
  );
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
updateCartCount();
