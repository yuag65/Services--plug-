document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  const ADMIN_WHATSAPP = "233537747322";

  // SUPABASE CONNECTION
  const SUPABASE_URL = "https://zylsnoybjqmonetjaxbz.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ldvkime9049SXqUOPphDjA_gY9KgqFf";

  const supabaseClient = window.supabase
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      )
    : null;

  const HISTORY_KEY = "servicesPlugRequests";

  const form = document.getElementById("requestForm");
  const assistForm = document.getElementById("assistForm");
  const serviceSelect = document.getElementById("service");
  const locationInput = document.getElementById("location");
  const gpsBtn = document.getElementById("gpsBtn");
  const toast = document.getElementById("toast");
  const historyList = document.getElementById("requestHistory");
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // SP ASSIST
  if (assistForm) {
    assistForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const chosenService =
        document.getElementById("assistIssue").value;

      const details =
        document.getElementById("assistDetails").value.trim();

      if (!chosenService) {
        alert("Please choose the issue that is closest to your situation.");
        return;
      }

      serviceSelect.value = chosenService;

      const problemField =
        document.getElementById("problem");

      if (details) {
        problemField.value = details;
      }

      document.getElementById("request").scrollIntoView({
        behavior: "smooth"
      });

      window.setTimeout(function () {
        if (!details) {
          problemField.focus({ preventScroll: true });
        } else {
          locationInput.focus({ preventScroll: true });
        }
      }, 450);
    });
  }

  // READ SAVED DATA
  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "");
    } catch (_) {
      return fallback;
    }
  }

  // CREATE REQUEST ID
  function createRequestId() {
    const now = new Date();

    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const day = yy + mm + dd;
    const key = "servicesPlugDailyCount";

    const saved = readJSON(key, {}) || {};

    const count =
      saved.day === day
        ? (Number(saved.count) || 0) + 1
        : 1;

    localStorage.setItem(
      key,
      JSON.stringify({
        day: day,
        count: count
      })
    );

    return "SP-" + day + "-" + String(count).padStart(3, "0");
  }

  // SAFELY DISPLAY TEXT
  function safeText(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      }
    );
  }

  // LOAD REQUEST HISTORY
  function loadHistory() {
    if (!historyList) return;

    const requests = readJSON(HISTORY_KEY, []);

    if (!Array.isArray(requests) || !requests.length) {
      historyList.innerHTML =
        '<p class="empty-history">No requests on this device yet.</p>';
      return;
    }

    historyList.innerHTML = requests
      .slice(0, 5)
      .map(function (item) {
        return (
          '<div class="history-item">' +
          '<div><strong>' +
          safeText(item.id) +
          '</strong><small>' +
          safeText(item.service) +
          " · " +
          safeText(item.date) +
          '</small></div><span class="history-status">' +
          safeText(item.status) +
          "</span></div>"
        );
      })
      .join("");
  }

  // SAVE REQUEST LOCALLY
  function saveRequest(request) {
    const requests = readJSON(HISTORY_KEY, []);
    const list = Array.isArray(requests) ? requests : [];

    list.unshift(request);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(list.slice(0, 10))
    );

    loadHistory();
  }

  // SERVICE SELECTION BUTTONS
  document.querySelectorAll("[data-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      serviceSelect.value =
        button.getAttribute("data-service") || "";

      document.getElementById("request").scrollIntoView({
        behavior: "smooth"
      });

      window.setTimeout(function () {
        locationInput.focus({ preventScroll: true });
      }, 450);
    });
  });

  // GPS LOCATION
  if (gpsBtn) {
    gpsBtn.addEventListener("click", function () {
      if (!navigator.geolocation) {
        alert(
          "GPS is not supported. Please type your area or landmark."
        );
        return;
      }

      gpsBtn.textContent = "…";
      gpsBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat =
            position.coords.latitude.toFixed(6);

          const lng =
            position.coords.longitude.toFixed(6);

          locationInput.value =
            "GPS: " + lat + ", " + lng;

          locationInput.dataset.map =
            "https://www.google.com/maps?q=" + lat + "," + lng;

          gpsBtn.textContent = "✓";
          gpsBtn.disabled = false;

          if (toast) {
            toast.textContent =
              "Map location captured. Please review the rest of the form.";
          }
        },
        function () {
          gpsBtn.textContent = "⌖";
          gpsBtn.disabled = false;

          alert(
            "Location access was not allowed. Please type your area or landmark."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // CUSTOMER REQUEST FORM
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const service = serviceSelect.value.trim();
      const location = locationInput.value.trim();

      const problem =
        document.getElementById("problem").value.trim();

      const urgency =
        (document.getElementById("urgency") || {}).value ||
        "Normal";

      const name =
        document.getElementById("name").value.trim();

      const phone =
        document.getElementById("phone").value.trim();

      if (!service || !location || !problem || !name || !phone) {
        alert("Please complete all the fields.");
        return;
      }

      const submitButton =
        form.querySelector('button[type="submit"]');

      if (submitButton) {
        submitButton.disabled = true;
      }

      const requestId = createRequestId();
      const mapLink = locationInput.dataset.map || "";
      const date = new Date().toLocaleDateString();

      // WHATSAPP MESSAGE
      const message =
        "🔧 SERVICES PLUG REQUEST\n\n" +
        "Request ID: " + requestId + "  |  NEW\n\n" +
        "SERVICE\n" + service + "\n\n" +
        "PRIORITY\n" + urgency + "\n\n" +
        "LOCATION\n" + location + "\n" +
        (mapLink
          ? "📍 Google Maps: " + mapLink + "\n\n"
          : "\n") +
        "CUSTOMER\n" + name + "  |  " + phone + "\n\n" +
        "PROBLEM\n" + problem;

      // SAVE TO SUPABASE
      let databaseSaved = false;

      if (supabaseClient) {
        const { error } = await supabaseClient
          .from("service_requests")
          .insert({
            request_code: requestId,
            customer_name: name,
            customer_phone: phone,
            service: service,
            urgency: urgency,
            location_text: location,
            map_url: mapLink || null,
            problem: problem
          });

        if (!error) {
          databaseSaved = true;
        } else {
          console.error(
            "Supabase request insert failed:",
            error
          );
        }
      }

      // SAVE REQUEST HISTORY LOCALLY
      saveRequest({
        id: requestId,
        service: service,
        urgency: urgency,
        status: "NEW",
        date: date
      });

      // SHOW STATUS
      if (toast) {
        toast.textContent = databaseSaved
          ? "Request saved. Opening WhatsApp…"
          : "Database save failed. Opening WhatsApp so you can still send your request.";
      }

      // OPEN WHATSAPP
      const whatsappURL =
        "https://wa.me/" +
        ADMIN_WHATSAPP +
        "?text=" +
        encodeURIComponent(message);

      if (submitButton) {
        submitButton.disabled = false;
      }

      window.location.href = whatsappURL;
    });
  }

  // INITIALIZE REQUEST HISTORY
  loadHistory();
});
