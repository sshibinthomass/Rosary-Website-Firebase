// Dark mode toggle functionality
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  
  // Save user preference to localStorage
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  
  // Update the toggle button icon
  updateDarkModeToggle();
}

function updateDarkModeToggle() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  if (isDarkMode) {
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    darkModeToggle.setAttribute('title', 'Switch to Light Mode');
  } else {
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeToggle.setAttribute('title', 'Switch to Dark Mode');
  }
}

// Check for saved user preference
function initDarkMode() {
  const savedDarkMode = localStorage.getItem('darkMode');
  
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
  }
  
  updateDarkModeToggle();
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', initDarkMode);

// Expose the toggle function globally
window.toggleDarkMode = toggleDarkMode;
