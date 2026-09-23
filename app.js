document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_WHATSAPP = "233537747322";
  const form = document.getElementById("requestForm");
  const serviceSelect = document.getElementById("service");
  const locationInput = document.getElementById("location");
  const gpsBtn = document.getElementById("gpsBtn");
  const toast = document.getElementById("toast");

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  };

  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const service = card.dataset.service;
      serviceSelect.value = service;
      document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`${service} selected`);
    });
  });

  gpsBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("GPS is not available on this device.");
      return;
    }

    gpsBtn.disabled = true;
    gpsBtn.textContent = "…";
    showToast("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        locationInput.value = locationInput.value.trim()
          ? `${locationInput.value.trim()} | GPS: ${lat}, ${lng}`
          : `Current location | GPS: ${lat}, ${lng}`;
        locationInput.dataset.lat = lat;
        locationInput.dataset.lng = lng;
        gpsBtn.disabled = false;
        gpsBtn.textContent = "⌖";
        showToast("Exact map location added.");
      },
      () => {
        gpsBtn.disabled = false;
        gpsBtn.textContent = "⌖";
        showToast("GPS was not available. Type your area or landmark.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const service = serviceSelect.value.trim();
    const location = locationInput.value.trim();
    const problem = document.getElementById("problem").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!service || !location || !problem || !name || !phone) {
      showToast("Please complete all required fields.");
      return;
    }

    let message = `SERVICES PLUG REQUEST\n\nService: ${service}\nLocation: ${location}\nProblem: ${problem}\nName: ${name}\nPhone: ${phone}`;

    const { lat, lng } = locationInput.dataset;
    if (lat && lng) {
      message += `\nMap: https://www.google.com/maps?q=${lat},${lng}`;
    }

    window.location.href = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  });
});
