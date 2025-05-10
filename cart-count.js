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

      // Improved click handler for the cart toggle button
      cartToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

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
      });

      // Also add click handler to any icons inside the cart toggle
      const cartIcon = cartToggle.querySelector("i");
      if (cartIcon) {
        cartIcon.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          // Trigger a click on the parent button
          cartToggle.click();
        });
      }
    }
  }

  // Setup close cart button if not already handled
  const closeCartBtn = document.getElementById("close-cart");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      closeCartSidebar();
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
