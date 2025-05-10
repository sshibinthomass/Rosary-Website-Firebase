// This script handles the contact form submission via WhatsApp

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendMessageViaWhatsApp();
    });
  }
});

function sendMessageViaWhatsApp() {
  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  // Validate form
  if (!name || !email || !subject || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  // You should replace this with the actual WhatsApp number with country code
  // For example: const phoneNumber = "917904050237"; (for India +91)
  const phoneNumber = "917904050237"; // Replace with the actual WhatsApp number from the page

  // Format the message
  let whatsappMessage = `Hello, I'm ${name}.\n\n`;
  whatsappMessage += `Subject: ${subject}\n\n`;
  whatsappMessage += `${message}\n\n`;
  whatsappMessage += `My contact details:\n`;
  whatsappMessage += `Email: ${email}\n`;
  
  if (phone) {
    whatsappMessage += `Phone: ${phone}\n`;
  }

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(whatsappMessage);

  // Create the WhatsApp URL
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab
  window.open(whatsappURL, "_blank");
  
  // Reset the form after submission
  document.getElementById("contactForm").reset();
}

// Expose the function globally
window.sendMessageViaWhatsApp = sendMessageViaWhatsApp;
