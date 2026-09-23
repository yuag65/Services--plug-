document.addEventListener("DOMContentLoaded", function () {

  const ADMIN_WHATSAPP = "233537747322";

  const form = document.getElementById("requestForm");
  const serviceSelect = document.getElementById("service");
  const locationInput = document.getElementById("location");
  const gpsBtn = document.getElementById("gpsBtn");
  const toast = document.getElementById("toast");

  // SERVICE CARDS
  document.querySelectorAll(".service-card").forEach(function (card) {

    card.addEventListener("click", function () {

      const service = card.getAttribute("data-service");

      serviceSelect.value = service;

      document.getElementById("request").scrollIntoView({
        behavior: "smooth"
      });

    });

  });


  // GPS BUTTON
  if (gpsBtn) {

    gpsBtn.addEventListener("click", function () {

      if (!navigator.geolocation) {
        locationInput.value = "Location not supported";
        return;
      }

      gpsBtn.textContent = "...";

      navigator.geolocation.getCurrentPosition(

        function (position) {

          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);

          locationInput.value =
            "GPS: " + lat + ", " + lng;

          gpsBtn.textContent = "⌖";

        },

        function () {

          gpsBtn.textContent = "⌖";

          alert(
            "Location access was not allowed. Please type your area or landmark."
          );

        }

      );

    });

  }


  // WHATSAPP REQUEST
  form.addEventListener("submit", function (event) {

    event.preventDefault();

    const service = serviceSelect.value;
    const location = locationInput.value;
    const problem = document.getElementById("problem").value;
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;


    if (!service) {
      alert("Please select a service.");
      return;
    }

    if (!location) {
      alert("Please enter your location.");
      return;
    }


    const message =
      "SERVICES PLUG REQUEST\n\n" +
      "Service: " + service + "\n" +
      "Location: " + location + "\n" +
      "Problem: " + problem + "\n" +
      "Name: " + name + "\n" +
      "Phone: " + phone;


    const whatsappURL =
      "https://wa.me/" +
      ADMIN_WHATSAPP +
      "?text=" +
      encodeURIComponent(message);


    window.location.href = whatsappURL;

  });

});
