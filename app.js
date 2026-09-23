document.addEventListener("DOMContentLoaded", function () {
  const ADMIN_WHATSAPP = "233537747322";
  const HISTORY_KEY = "servicesPlugRequests";

  const form = document.getElementById("requestForm");
  const serviceSelect = document.getElementById("service");
  const locationInput = document.getElementById("location");
  const gpsBtn = document.getElementById("gpsBtn");
  const toast = document.getElementById("toast");
  const historyList = document.getElementById("requestHistory");

  function createRequestId() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const key = "servicesPlugDailyCount";
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    const day = yy + mm + dd;

    saved.day = day;
    saved.count = saved.day === day ? (saved.count || 0) + 1 : 1;

    localStorage.setItem(key, JSON.stringify({
      day: day,
      count: saved.count
    }));

    return "SP-" + day + "-" + String(saved.count).padStart(3, "0");
  }

  function loadHistory() {
    if (!historyList) return;

    const requests = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");

    if (!requests.length) {
      historyList.innerHTML = '<p class="empty-history">No requests on this device yet.</p>';
      return;
    }

    historyList.innerHTML = requests.slice(0, 5).map(function (item) {
      return (
        '<div class="history-item">' +
          '<div>' +
            '<strong>' + item.id + '</strong>' +
            '<small>' + item.service + " · " + item.date + '</small>' +
          '</div>' +
          '<span class="history-status">' + item.status + '</span>' +
        '</div>'
      );
    }).join("");
  }

  function saveRequest(request) {
    const requests = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    requests.unshift(request);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(requests.slice(0, 10)));
    loadHistory();
  }

  document.querySelectorAll("[data-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      serviceSelect.value = button.getAttribute("data-service");
      document.getElementById("request").scrollIntoView({
        behavior: "smooth"
      });

      setTimeout(function () {
        locationInput.focus();
      }, 450);
    });
  });

  if (gpsBtn) {
    gpsBtn.addEventListener("click", function () {
      if (!navigator.geolocation) {
        alert("GPS is not supported. Please type your area or landmark.");
        return;
      }

      gpsBtn.textContent = "…";
      gpsBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);

          locationInput.value = "GPS: " + lat + ", " + lng;
          locationInput.dataset.map =
            "https://www.google.com/maps?q=" + lat + "," + lng;

          gpsBtn.textContent = "✓";
          gpsBtn.disabled = false;

          if (toast) {
            toast.textContent = "Exact map location captured.";
          }
        },
        function () {
          gpsBtn.textContent = "⌖";
          gpsBtn.disabled = false;
          alert("Location access was not allowed. Please type your area or landmark.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const service = serviceSelect.value.trim();
    const location = locationInput.value.trim();
    const problem = document.getElementById("problem").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!service || !location || !problem || !name || !phone) {
      alert("Please complete all the fields.");
      return;
    }

    const requestId = createRequestId();
    const mapLink = locationInput.dataset.map || "";
    const date = new Date().toLocaleDateString();

    let message =
  "🔧 SERVICES PLUG REQUEST\n\n" +
  "Request ID: " + requestId + "\n" +
  "Status: NEW\n\n" +

  "SERVICE\n" +
  service + "\n\n" +

  "LOCATION\n" +
  location + "\n" +
  (mapLink ? "📍 Google Maps: " + mapLink + "\n\n" : "\n") +

  "CUSTOMER\n" +
  "Name: " + name + "\n" +
  "Phone: " + phone + "\n\n" +

  "PROBLEM\n" +
  problem;
    saveRequest({
      id: requestId,
      service: service,
      status: "NEW",
      date: date
    });

    const whatsappURL =
      "https://wa.me/" +
      ADMIN_WHATSAPP +
      "?text=" +
      encodeURIComponent(message);

    window.location.href = whatsappURL;
  });

  loadHistory();
});
