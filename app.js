// SERVICES PLUG — MANUAL MVP

const ADMIN_WHATSAPP = "233537747322";

const form = document.getElementById("requestForm");
const service = document.getElementById("service");
const locationInput = document.getElementById("location");
const gpsBtn = document.getElementById("gpsBtn");
const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

document.querySelectorAll(".service-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".service-card")
      .forEach(item => item.classList.remove("selected"));

    card.classList.add("selected");
    service.value = card.dataset.service;

    const requestSection = document.getElementById("request");

    if (requestSection) {
      requestSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  });
});

if (gpsBtn) {
  gpsBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      showToast("GPS isn't available. Enter your area or landmark.");
      return;
    }

    gpsBtn.textContent = "…";

    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        locationInput.value = `GPS: ${latitude}, ${longitude}`;
        gpsBtn.textContent = "✓";

        showToast("Location added.");
      },
      () => {
        gpsBtn.textContent = "⌖";
        showToast("Couldn't get GPS. Enter your area or landmark.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  });
}

if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault();

    const serviceValue = service.value.trim();
    const locationValue = locationInput.value.trim();
    const problemValue = document.getElementById("problem").value.trim();
    const nameValue = document.getElementById("name").value.trim();
    const phoneValue = document.getElementById("phone").value.trim();

    if (
      !serviceValue ||
      !locationValue ||
      !problemValue ||
      !nameValue ||
      !phoneValue
    ) {
      showToast("Please complete all fields.");
      return;
    }

    const message =
`*SERVICES PLUG — NEW REQUEST*

Service: ${serviceValue}
Customer: ${nameValue}
Phone: ${phoneValue}
Location: ${locationValue}
Problem: ${problemValue}

Status: NEW — please check for an available provider.`;

    const whatsappURL =
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  });
});
