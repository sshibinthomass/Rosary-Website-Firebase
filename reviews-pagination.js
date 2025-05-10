// This script handles the pagination for the reviews page

document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const REVIEWS_PER_PAGE = 10;
  const TOTAL_REVIEWS = 64;
  const TOTAL_PAGES = Math.ceil(TOTAL_REVIEWS / REVIEWS_PER_PAGE);

  // DOM Elements
  const reviewCards = document.querySelectorAll(".review-card");
  const paginationPages = document.querySelectorAll(".pagination-page");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const showingStart = document.getElementById("showing-start");
  const showingEnd = document.getElementById("showing-end");
  const totalReviews = document.getElementById("total-reviews");

  // Set total reviews
  if (totalReviews) {
    totalReviews.textContent = TOTAL_REVIEWS;
  }

  // Current page state
  let currentPage = 1;

  // Initialize pagination
  function initPagination() {
    // Show only the first page of reviews
    updateReviewsDisplay();

    // Add event listeners to pagination buttons
    paginationPages.forEach(pageBtn => {
      pageBtn.addEventListener("click", function() {
        const page = parseInt(this.dataset.page);
        if (page !== currentPage) {
          changePage(page);
        }
      });
    });

    // Add event listeners to prev/next buttons
    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", function() {
        if (currentPage > 1) {
          changePage(currentPage - 1);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", function() {
        if (currentPage < TOTAL_PAGES) {
          changePage(currentPage + 1);
        }
      });
    }
  }

  // Change page
  function changePage(page) {
    // Update current page
    currentPage = page;

    // Update active page button
    paginationPages.forEach(pageBtn => {
      const btnPage = parseInt(pageBtn.dataset.page);
      if (btnPage === currentPage) {
        pageBtn.classList.add("active");
      } else {
        pageBtn.classList.remove("active");
      }
    });

    // Update prev/next button states
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage === TOTAL_PAGES;
    }

    // Update reviews display
    updateReviewsDisplay();

    // Scroll to top of reviews container
    const reviewsContainer = document.querySelector(".reviews-container");
    if (reviewsContainer) {
      reviewsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Update which reviews are displayed
  function updateReviewsDisplay() {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = Math.min(startIndex + REVIEWS_PER_PAGE, reviewCards.length);

    // Update showing text
    if (showingStart && showingEnd) {
      showingStart.textContent = startIndex + 1;
      showingEnd.textContent = Math.min(endIndex, reviewCards.length);
    }

    // Hide all reviews
    reviewCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  // Fix image display issues
  function fixImageDisplay() {
    const reviewImages = document.querySelectorAll(".review-image");
    
    reviewImages.forEach(img => {
      // Add error handler to replace broken images
      img.onerror = function() {
        this.src = "https://via.placeholder.com/150?text=Plant+Photo";
        this.alt = "Plant photo placeholder";
      };
      
      // Force reload images
      const currentSrc = img.src;
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Transparent GIF
      setTimeout(() => {
        img.src = currentSrc;
      }, 50);
    });
  }

  // Initialize
  initPagination();
  fixImageDisplay();
});
