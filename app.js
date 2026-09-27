document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ==========================================
  // SERVICES PLUG — CUSTOMER APP
  // ==========================================

  const ADMIN_WHATSAPP = "233537747322";

  const SUPABASE_URL =
    "https://zylsnoybjqmonetjaxbz.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ldvkime9049SXqUOPphDjA_gY9KgqFf";

  const HISTORY_KEY = "servicesPlugRequests";

  const supabaseClient =
    window.supabase &&
    typeof window.supabase.createClient === "function"
      ? window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY
        )
      : null;

  const $ = (id) => document.getElementById(id);

  const form = $("requestForm");
  const assistForm = $("assistForm");
  const serviceSelect = $("service");
  const locationInput = $("location");
  const gpsBtn = $("gpsBtn");
  const toast = $("toast");
  const historyList = $("requestHistory");
  const year = $("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  function notify(message, isError) {
    if (toast) {
      toast.textContent = message;
      toast.setAttribute("role", "status");
      toast.style.display = "block";
      toast.dataset.type = isError ? "error" : "success";
    } else {
      alert(message);
    }
  }

  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "null"
      );

      return value == null ? fallback : value;
    } catch (_) {
      return fallback;
    }
  }

  function safeText(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[char]
    );
  }

  // ==========================================
  // REQUEST ID GENERATOR
  // ==========================================

  function createRequestId() {
    const now = new Date();

    const day =
      String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const key = "servicesPlugDailyCount";

    const saved = readJSON(key, {});

    const count =
      saved.day === day
        ? (Number(saved.count) || 0) + 1
        : 1;

    localStorage.setItem(
      key,
      JSON.stringify({
        day,
        count
      })
    );

    const suffix = Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase();

    return (
      "SP-" +
      day +
      "-" +
      String(count).padStart(3, "0") +
      "-" +
      suffix
    );
  }

  // ==========================================
  // REQUEST HISTORY
  // ==========================================

  function getHistory() {
    const list = readJSON(HISTORY_KEY, []);

    return Array.isArray(list) ? list : [];
  }

  function saveRequest(request) {
    const list = getHistory();

    list.unshift(request);

    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(list.slice(0, 15))
      );
    } catch (error) {
      console.warn(
        "Could not save local request history",
        error
      );
    }

    loadHistory();
  }

  function loadHistory() {
    if (!historyList) return;

    const requests = getHistory();

    if (!requests.length) {
      historyList.innerHTML =
        '<p class="empty-history">' +
        "No requests on this device yet." +
        "</p>";

      return;
    }

    historyList.innerHTML = requests
      .slice(0, 8)
      .map((item) => {
        const id = safeText(
          item.id || item.request_code || "—"
        );

        const status = safeText(
          item.status || "New"
        );

        const service = safeText(
          item.service || "Service request"
        );

        const date = safeText(item.date || "");

        return (
          '<div class="history-item">' +
          "<div>" +
          "<strong>" +
          id +
          "</strong>" +
          "<small>" +
          service +
          " · " +
          date +
          "</small>" +
          "</div>" +
          '<span class="history-status">' +
          status +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  function scrollToRequest() {
    const target = $("request");

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  // ==========================================
  // SERVICE SELECTION CARDS
  // ==========================================

  document
    .querySelectorAll("[data-service]")
    .forEach((element) => {
      element.addEventListener("click", function (event) {
        const chosen =
          element.getAttribute("data-service") || "";

        if (serviceSelect && chosen) {
          const options = Array.from(
            serviceSelect.options || []
          );

          const exactMatch = options.find(
            (option) => option.value === chosen
          );

          const textMatch = options.find(
            (option) =>
              option.textContent.trim().toLowerCase() ===
              chosen.trim().toLowerCase()
          );

          if (exactMatch) {
            serviceSelect.value = exactMatch.value;
          } else if (textMatch) {
            serviceSelect.value = textMatch.value;
          } else {
            notify(
              "This service is not listed in the request form yet.",
              true
            );
          }

          serviceSelect.dispatchEvent(
            new Event("change", {
              bubbles: true
            })
          );
        }

        if (element.tagName === "A") {
          event.preventDefault();
        }

        scrollToRequest();

        window.setTimeout(() => {
          if (locationInput) {
            locationInput.focus({
              preventScroll: true
            });
          }
        }, 350);
      });
    });

  // ==========================================
  // SP ASSIST
  // ==========================================

  if (assistForm) {
    assistForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        const issue = $("assistIssue");
        const detailsField = $("assistDetails");

        const chosen = issue
          ? issue.value.trim()
          : "";

        const details = detailsField
          ? detailsField.value.trim()
          : "";

        if (!chosen) {
          return notify(
            "Please choose the issue closest to your situation.",
            true
          );
        }

        if (serviceSelect) {
          const options = Array.from(
            serviceSelect.options || []
          );

          const match =
            options.find(
              (option) => option.value === chosen
            ) ||
            options.find(
              (option) =>
                option.textContent
                  .trim()
                  .toLowerCase() ===
                chosen.toLowerCase()
            );

          if (match) {
            serviceSelect.value = match.value;
          } else {
            return notify(
              "That service is not available in the request form yet.",
              true
            );
          }
        }

        const problem = $("problem");

        if (problem && details) {
          problem.value = details;
        }

        scrollToRequest();

        window.setTimeout(() => {
          const focusTarget = details
            ? locationInput
            : problem;

          if (focusTarget) {
            focusTarget.focus({
              preventScroll: true
            });
          }
        }, 350);
      }
    );
  }

  // ==========================================
  // LOCATION INPUT
  // ==========================================

  if (locationInput) {
    locationInput.addEventListener(
      "input",
      function () {
        if (
          !/^GPS:\s*/i.test(
            locationInput.value.trim()
          )
        ) {
          delete locationInput.dataset.map;
        }
      }
    );
  }

  // ==========================================
  // GPS LOCATION
  // ==========================================

  if (gpsBtn) {
    gpsBtn.addEventListener("click", function () {
      if (!navigator.geolocation) {
        return notify(
          "GPS is not supported. Please type your area or landmark.",
          true
        );
      }

      const originalText = gpsBtn.textContent;

      gpsBtn.disabled = true;
      gpsBtn.textContent = "…";

      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat =
            position.coords.latitude.toFixed(6);

          const lng =
            position.coords.longitude.toFixed(6);

          if (locationInput) {
            locationInput.value =
              "GPS: " + lat + ", " + lng;

            locationInput.dataset.map =
              "https://www.google.com/maps?q=" +
              lat +
              "," +
              lng;
          }

          gpsBtn.textContent = "✓";
          gpsBtn.disabled = false;

          notify(
            "Location captured. Please review the rest of the form."
          );
        },

        function () {
          gpsBtn.textContent = originalText || "⌖";
          gpsBtn.disabled = false;

          notify(
            "Location access failed. Please allow location access or type your area or landmark.",
            true
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    });
  }

  // ==========================================
  // PHONE NUMBER VALIDATION
  // ==========================================

  function normalizePhone(phone) {
    return String(phone || "").replace(
      /[\s()-]/g,
      ""
    );
  }

  // ==========================================
  // REQUEST SUBMISSION
  // ==========================================

  if (form) {
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();

        const service = serviceSelect
          ? serviceSelect.value.trim()
          : "";

        const location = locationInput
          ? locationInput.value.trim()
          : "";

        const problem = $("problem")
          ? $("problem").value.trim()
          : "";

        const urgency =
          $("urgency") && $("urgency").value
            ? $("urgency").value
            : "Normal";

        const name = $("name")
          ? $("name").value.trim()
          : "";

        const phone = $("phone")
          ? $("phone").value.trim()
          : "";

        if (
          !service ||
          !location ||
          !problem ||
          !name ||
          !phone
        ) {
          return notify(
            "Please complete all required fields.",
            true
          );
        }

        if (
          normalizePhone(phone).length < 7
        ) {
          return notify(
            "Please enter a valid phone number.",
            true
          );
        }

        const submitButton = form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );

        if (submitButton && submitButton.disabled) {
          return;
        }

        const oldButtonText =
          submitButton &&
          (submitButton.tagName === "INPUT"
            ? submitButton.value
            : submitButton.textContent);

        if (submitButton) {
          submitButton.disabled = true;

          if (submitButton.tagName === "INPUT") {
            submitButton.value = "Sending…";
          } else {
            submitButton.textContent = "Sending…";
          }
        }

        const requestId = createRequestId();

        const mapLink =
          locationInput &&
          locationInput.dataset.map
            ? locationInput.dataset.map
            : "";

        const date = new Date().toLocaleString();

        const request = {
          id: requestId,
          service,
          urgency,
          status: "New",
          date,
          phone,
          location
        };

        let databaseSaved = false;

        try {
          // SAVE TO SUPABASE

          if (supabaseClient) {
            const result =
              await supabaseClient
                .from("service_requests")
                .insert({
                  request_code: requestId,
                  customer_name: name,
                  customer_phone: phone,
                  service,
                  urgency,
                  location_text: location,
                  map_url: mapLink || null,
                  problem
                });

            if (!result.error) {
              databaseSaved = true;
            } else {
              console.error(
                "Supabase request insert failed:",
                result.error
              );
            }
          }

          // SAVE LOCAL HISTORY

          saveRequest(request);

          // WHATSAPP MESSAGE

          const message =
            "🔧 SERVICES PLUG REQUEST\n\n" +
            "Request ID: " +
            requestId +
            " | NEW\n\n" +
            "SERVICE\n" +
            service +
            "\n\n" +
            "PRIORITY\n" +
            urgency +
            "\n\n" +
            "LOCATION\n" +
            location +
            "\n" +
            (mapLink
              ? "📍 Google Maps: " +
                mapLink +
                "\n"
              : "") +
            "\nCUSTOMER\n" +
            name +
            " | " +
            phone +
            "\n\nPROBLEM\n" +
            problem;

          notify(
            databaseSaved
              ? "Request saved. Opening WhatsApp…"
              : "Opening WhatsApp. Keep your request ID: " +
                  requestId
          );

          const whatsappURL =
            "https://wa.me/" +
            ADMIN_WHATSAPP +
            "?text=" +
            encodeURIComponent(message);

          window.location.href = whatsappURL;
        } catch (error) {
          console.error(
            "Request submission error:",
            error
          );

          saveRequest(request);

          notify(
            "We couldn't confirm the online save. Your request is kept on this device; please send it through WhatsApp.",
            true
          );

          const fallback =
            "Services Plug request " +
            requestId +
            "\nService: " +
            service +
            "\nLocation: " +
            location +
            "\nProblem: " +
            problem +
            "\nCustomer: " +
            name +
            " / " +
            phone;

          window.location.href =
            "https://wa.me/" +
            ADMIN_WHATSAPP +
            "?text=" +
            encodeURIComponent(fallback);
        } finally {
          if (submitButton) {
            submitButton.disabled = false;

            if (submitButton.tagName === "INPUT") {
              submitButton.value = oldButtonText;
            } else {
              submitButton.textContent = oldButtonText;
            }
          }
        }
      }
    );
  }

  // ==========================================
  // REQUEST TRACKING PANEL
  // ==========================================

  function addTrackingPanel() {
    if (
      !$("history") ||
      $("requestTrackingPanel")
    ) {
      return;
    }

    const panel = document.createElement("section");

    panel.id = "requestTrackingPanel";
    panel.className = "request-tracking-panel";

    panel.innerHTML =
      "<h3>Track a request</h3>" +
      "<p>Enter your request ID and the phone number used when requesting help.</p>" +
      '<form id="trackingForm">' +
      '<label for="trackingCode">Request ID</label>' +
      '<input id="trackingCode" autocomplete="off" placeholder="Enter your request ID" required>' +
      '<label for="trackingPhone">Phone number</label>' +
      '<input id="trackingPhone" type="tel" autocomplete="tel" placeholder="Phone number used for the request" required>' +
      '<button type="submit" id="trackingSubmit">Check status</button>' +
      "</form>" +
      '<div id="trackingResult" aria-live="polite"></div>';

    const historySection = $("history");

    historySection.insertBefore(
      panel,
      historySection.firstChild
    );

    const trackingForm = $("trackingForm");

    trackingForm.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();

        const code = $("trackingCode").value.trim();
        const phone = $("trackingPhone").value.trim();

        const button = $("trackingSubmit");
        const resultBox = $("trackingResult");

        button.disabled = true;
        button.textContent = "Checking…";

        resultBox.textContent =
          "Looking up your request…";

        try {
          if (!supabaseClient) {
            throw new Error(
              "Tracking service is not connected."
            );
          }

          const { data, error } =
            await supabaseClient.rpc(
              "lookup_service_request_status",
              {
                p_request_code: code,
                p_customer_phone: phone
              }
            );

          if (error) throw error;

          const row = Array.isArray(data)
            ? data[0]
            : data;

          if (!row) {
            resultBox.textContent =
              "No matching request found. Check your request ID and phone number.";
          } else {
            resultBox.innerHTML =
              '<div class="tracking-result-card">' +
              "<strong>" +
              safeText(
                row.request_code || code
              ) +
              "</strong>" +
              "<p>Service: " +
              safeText(row.service || "—") +
              "</p>" +
              "<p>Status: <strong>" +
              safeText(row.status || "—") +
              "</strong></p>" +
              "</div>";

            // UPDATE LOCAL HISTORY

            const local = getHistory();

            const updated = local.map((item) =>
              item.id ===
              (row.request_code || code)
                ? Object.assign({}, item, {
                    status:
                      row.status || item.status
                  })
                : item
            );

            try {
              localStorage.setItem(
                HISTORY_KEY,
                JSON.stringify(updated)
              );
            } catch (_) {}

            loadHistory();
          }
        } catch (error) {
          console.error(
            "Tracking lookup failed:",
            error
          );

          resultBox.textContent =
            "Couldn't check status right now. Please verify the details and try again later.";
        } finally {
          button.disabled = false;
          button.textContent = "Check status";
        }
      }
    );
  }

  // ==========================================
  // INITIALIZE APP
  // ==========================================

  addTrackingPanel();
  loadHistory();
});
