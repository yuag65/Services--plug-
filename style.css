document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_WHATSAPP = "233537747322";

  const form = document.getElementById("requestForm");
  const serviceSelect = document.getElementById("service");
  const locationInput = document.getElementById("location");
  const gpsBtn = document.getElementById("gpsBtn");
  const toast = document.getElementById("toast");
  const serviceCards = document.querySelectorAll(".service-card");

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  // When a service card is pressed, select that service
  // and move the customer to the request form.
  serviceCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();

      const selectedService = card.dataset.service;

      if (!selectedService || !serviceSelect) return;

      // The option text and value are the same in index.html,
      // so this selects the matching service.
      serviceSelect.value = selectedService;

      const requestSection = document.getElementById("request");
      if (requestSection) {
        requestSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      showToast(`${selectedService} selected`);
    });
  });

  // Use the phone's GPS to fill the location field.
  // We store coordinates directly so this works without another API.
  if (gpsBtn && locationInput) {
    gpsBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("Location is not supported on this phone.");
        return;
      }

      gpsBtn.disabled = true;
      gpsBtn.textContent = "…";
      showToast("Getting your location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(6);
          const longitude = position.coords.longitude.toFixed(6);

          locationInput.value = `GPS: ${latitude}, ${longitude}`;
          locationInput.dataset.latitude = latitude;
          locationInput.dataset.longitude = longitude;

          gpsBtn.disabled = false;
          gpsBtn.textContent = "⌖";
          showToast("Location added.");
        },
        (error) => {
          gpsBtn.disabled = false;
          gpsBtn.textContent = "⌖";

          if (error.code === error.PERMISSION_DENIED) {
            showToast("Please allow location access, then try again.");
          } else {
            showToast("Couldn't get your location. Enter your area or landmark.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  // Send the completed request to Services Plug on WhatsApp.
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const service = serviceSelect?.value.trim() || "";
      const location = locationInput?.value.trim() || "";
      const problem = document.getElementById("problem")?.value.trim() || "";
      const name = document.getElementById("name")?.value.trim() || "";
      const phone = document.getElementById("phone")?.value.trim() || "";

      if (!service) {
        showToast("Please select a service.");
        serviceSelect?.focus();
        return;
      }

      if (!location) {
        showToast("Please enter your location or use GPS.");
        locationInput?.focus();
        return;
      }

      if (!problem || !name || !phone) {
        showToast("Please complete all required fields.");
        return;
      }

      let message =
        `🔌 *SERVICES PLUG REQUEST*%0A%0A` +
        `*Service:* ${service}%0A` +
        `*Location:* ${location}%0A` +
        `*Problem:* ${problem}%0A` +
        `*Customer:* ${name}%0A` +
        `*Phone:* ${phone}`;

      const latitude = locationInput.dataset.latitude;
      const longitude = locationInput.dataset.longitude;

      if (latitude && longitude) {
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        message += `%0A*Map:* ${mapsLink}`;
      }

      const whatsappUrl =
        `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
          decodeURIComponent(message)
        )}`;

      window.location.href = whatsappUrl;
    });
  }
});
