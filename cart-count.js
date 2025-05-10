// This script is responsible for updating the cart count in the header
// and ensuring cart toggle functionality works on all pages
// It should be included on all pages

document.addEventListener("DOMContentLoaded", function () {
  // Update cart count when page loads
  updateCartCountDisplay();

  // Setup cart toggle functionality if not already handled by cart.js
  const cartToggle = document.getElementById("cart-toggle");
  if (cartToggle) {
    // Check if the event listener is already attached by cart.js
    // by adding a custom property to the element
    if (!cartToggle.hasAttribute("data-cart-toggle-initialized")) {
      cartToggle.setAttribute("data-cart-toggle-initialized", "true");

      // Track if a cart toggle action is in progress
      let cartToggleActionInProgress = false;

      // Helper function to handle cart toggle action
      const handleCartToggleAction = (event) => {
        if (cartToggleActionInProgress) return;

        event.preventDefault();
        event.stopPropagation();

        // Set flag to prevent double triggers
        cartToggleActionInProgress = true;

        const cartSidebar = document.getElementById("cart-sidebar");
        if (cartSidebar) {
          cartSidebar.classList.add("active");

          // Load cart content if loadCart function exists
          if (typeof loadCart === "function") {
            loadCart();
          }

          // Add a click event listener to the document to close the sidebar when clicking outside
          setTimeout(() => {
            document.addEventListener("click", closeCartSidebarOnOutsideClick);
          }, 10);
        }

        // Reset the flag after a short delay
        setTimeout(() => {
          cartToggleActionInProgress = false;
        }, 300);
      };

      // Use touchend for mobile devices to prevent double triggering
      cartToggle.addEventListener("touchend", handleCartToggleAction, {
        passive: false,
      });

      // Use click for desktop devices
      cartToggle.addEventListener("click", (event) => {
        // Only process click events that aren't from touch events
        if (
          !event.sourceCapabilities ||
          !event.sourceCapabilities.firesTouchEvents
        ) {
          handleCartToggleAction(event);
        }
      });

      // Also handle any icons inside the cart toggle
      const cartIcon = cartToggle.querySelector("i");
      if (cartIcon) {
        // Use touchend for mobile devices
        cartIcon.addEventListener(
          "touchend",
          (event) => {
            event.preventDefault();
            event.stopPropagation();
            // Don't trigger click, use the same handler
            handleCartToggleAction(event);
          },
          { passive: false }
        );

        // Use click for desktop devices
        cartIcon.addEventListener("click", (event) => {
          // Only process click events that aren't from touch events
          if (
            !event.sourceCapabilities ||
            !event.sourceCapabilities.firesTouchEvents
          ) {
            event.preventDefault();
            event.stopPropagation();
            handleCartToggleAction(event);
          }
        });
      }
    }
  }

  // Setup close cart button if not already handled
  const closeCartBtn = document.getElementById("close-cart");
  if (closeCartBtn) {
    // Track if a close cart action is in progress
    let closeCartActionInProgress = false;

    // Helper function to handle close cart action
    const handleCloseCartAction = (event) => {
      if (closeCartActionInProgress) return;

      event.preventDefault();
      event.stopPropagation();

      // Set flag to prevent double triggers
      closeCartActionInProgress = true;

      closeCartSidebar();

      // Reset the flag after a short delay
      setTimeout(() => {
        closeCartActionInProgress = false;
      }, 300);
    };

    // Use touchend for mobile devices to prevent double triggering
    closeCartBtn.addEventListener("touchend", handleCloseCartAction, {
      passive: false,
    });

    // Use click for desktop devices
    closeCartBtn.addEventListener("click", (event) => {
      // Only process click events that aren't from touch events
      if (
        !event.sourceCapabilities ||
        !event.sourceCapabilities.firesTouchEvents
      ) {
        handleCloseCartAction(event);
      }
    });
  }
});

function updateCartCountDisplay() {
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

// Function to close the cart sidebar when clicking outside
function closeCartSidebarOnOutsideClick(event) {
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartToggle = document.getElementById("cart-toggle");

  // If the click is outside the cart sidebar and not on the cart toggle button
  if (
    cartSidebar &&
    cartToggle &&
    !cartSidebar.contains(event.target) &&
    !cartToggle.contains(event.target)
  ) {
    closeCartSidebar();
  }
}

// Function to close the cart sidebar
function closeCartSidebar() {
  const cartSidebar = document.getElementById("cart-sidebar");
  if (cartSidebar) {
    cartSidebar.classList.remove("active");

    // Remove the outside click event listener
    document.removeEventListener("click", closeCartSidebarOnOutsideClick);
  }
}
