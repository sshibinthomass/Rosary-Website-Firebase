document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      
      // Change icon based on state
      const icon = mobileNavToggle.querySelector('i');
      if (icon) {
        if (mainNav.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }
  
  // Close mobile nav when clicking outside
  document.addEventListener('click', function(event) {
    if (mainNav && mainNav.classList.contains('active')) {
      // Check if click is outside the navigation
      if (!mainNav.contains(event.target) && event.target !== mobileNavToggle) {
        mainNav.classList.remove('active');
        
        // Reset icon
        const icon = mobileNavToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    }
  });
  
  // Add active class to current page link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage) {
      link.classList.add('active');
    } else if (currentPage === 'index.html' && linkHref === 'index.html') {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});
