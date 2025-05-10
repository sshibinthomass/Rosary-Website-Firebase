// This script is responsible for updating the cart count in the header
// and ensuring cart toggle functionality works on all pages
// It should be included on all pages

// Variables to track touch start position and movement
let touchStartY = 0;
let touchStartX = 0;
let isTouchScrolling = false;
const scrollThreshold = 10; // Pixels of movement to consider it a scroll instead of a tap

// Function to handle touch start
const handleTouchStart = (event) => {
  touchStartY = event.touches[0].clientY;
  touchStartX = event.touches[0].clientX;
  isTouchScrolling = false;
};

// Function to handle touch move
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

document.addEventListener("DOMContentLoaded", function () {
  // Update cart count when page loads
  updateCartCountDisplay();

  // Add touch event listeners to the cart container to detect scrolling
  const cartContainer = document.getElementById("cart-container");
  if (cartContainer) {
    cartContainer.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    cartContainer.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
  }

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
        if (cartToggleActionInProgress || isTouchScrolling) return;

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

      // Track touch start on the button itself
      cartToggle.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });

      // Use touchend for mobile devices with scroll detection
      cartToggle.addEventListener(
        "touchend",
        (event) => {
          event.stopPropagation();

          // Only trigger if not scrolling
          if (!isTouchScrolling) {
            event.preventDefault();
            handleCartToggleAction(event);
          }

          // Reset scrolling state after a short delay
          setTimeout(() => {
            isTouchScrolling = false;
          }, 100);
        },
        { passive: false }
      );

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
        // Track touch start on the icon itself
        cartIcon.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });

        // Use touchend for mobile devices with scroll detection
        cartIcon.addEventListener(
          "touchend",
          (event) => {
            event.stopPropagation();

            // Only trigger if not scrolling
            if (!isTouchScrolling) {
              event.preventDefault();
              handleCartToggleAction(event);
            }

            // Reset scrolling state after a short delay
            setTimeout(() => {
              isTouchScrolling = false;
            }, 100);
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
      if (closeCartActionInProgress || isTouchScrolling) return;

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

    // Track touch start on the button itself
    closeCartBtn.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    // Use touchend for mobile devices with scroll detection
    closeCartBtn.addEventListener(
      "touchend",
      (event) => {
        event.stopPropagation();

        // Only trigger if not scrolling
        if (!isTouchScrolling) {
          event.preventDefault();
          handleCloseCartAction(event);
        }

        // Reset scrolling state after a short delay
        setTimeout(() => {
          isTouchScrolling = false;
        }, 100);
      },
      { passive: false }
    );

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
