import { backendURL } from "../utils/utils.js";

getEvents();

async function getEvents() {
  const response = await fetch(backendURL + "/api/mobile/event", {
    headers: {
      Accept: "application/json",
    },
  });

  if (response.ok) {
    const events = await response.json();
    let container = "";

    // JavaScript function to determine background color or class
    function getStatusAttributes(status) {
      switch (status) {
        case "Ongoing":
          return { backgroundColor: "#b43929", className: "" }; // Custom color for ongoing
        case "Upcoming":
          return { backgroundColor: "", className: "bg-secondary" }; // Bootstrap secondary class
        case "Cancelled":
          return { backgroundColor: "black", className: "" }; // Black color for cancelled
        default:
          return { backgroundColor: "transparent", className: "" }; // Fallback color
      }
    }

    events.forEach((element) => {
      const { backgroundColor, className } = getStatusAttributes(
        element.status
      );
      container += `<div class="container">
        <div class="d-flex justify-content-center my-4 event-item" data-event='${JSON.stringify(
          element
        )}'>
          <div style="width: 27rem" data-bs-toggle="modal" data-bs-target="#eventModal">
            <div class="position-relative rounded-3">
              <img src="${
                element.image
                  ? `${backendURL}/storage/images/${element.image}`
                  : "./assets/imgs/default_event.png" // Path to default image
              }" class="card-img-top rounded-3" height="180px"/>
              <div class="gradient-overlay rounded-bottom-3">
                <h4 class="fw-bold position-absolute bottom-0 mx-2 start-0 text-white card-margin"
                  style="text-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24)">
                  <small>${element.event_name}</small>
                </h4>
              </div>
              <div class="d-flex align-items-start position-absolute bottom-0 pb-2 mx-2 start-0 text-white">
                <img class="hours-margin" src="./assets/icon/calendar_white.png" alt="" width="15px"/>
                <small class="ps-2 league-spartan-regular text-white">
                  ${element.start_date} - ${element.time_start}
                  <small class="fw-bold text-white rounded-1 px-2 py-1 ms-2 ${className}"
                   style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px; 
                          background-color: ${backgroundColor};">
                ${element.status}
              </small>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    });

    document.getElementById("get_data").innerHTML = container;

    // After rendering the events, add click listeners to populate the modal
    document.querySelectorAll(".event-item").forEach((item) => {
      item.addEventListener("click", (event) => {
        const eventData = JSON.parse(
          event.currentTarget.getAttribute("data-event")
        );
        populateModal(eventData);
      });
    });
  }
}

// Function to populate modal with event data
function populateModal(event) {
  // Set image source, using a default image if none is provided
  document.getElementById("modal-event-image").src = event.image
    ? `${backendURL}/storage/images/${event.image}`
    : "./assets/imgs/default_event.png"; // Path to default image

  // Set event details, with fallbacks if any are missing
  document.getElementById("modal-event-name").textContent =
    event.event_name || "No Name Available";
  document.getElementById("modal-event-date&time").textContent = `${
    event.start_date || "N/A"
  } - ${event.time_start || "N/A"}`;

  const statusAttributes = getStatusAttributes(event.status || "Unknown");
  const statusElement = document.getElementById("modal-event-status");
  statusElement.textContent = event.status || "Unknown";
  statusElement.style.backgroundColor = statusAttributes.backgroundColor;

  document.getElementById("modal-event-location").textContent =
    event.event_location || "No Location available.";
  document.getElementById("modal-event-description").textContent =
    event.description || "No Description available.";
  document.getElementById("modal-event-gender").textContent =
    event.gender || "N/A";
  document.getElementById("modal-event-weight").textContent =
    event.weight || "N/A";

  // Concatenate min_age and max_age for age range display
  document.getElementById("modal-event-age").textContent = `${
    event.min_age || "N/A"
  } - ${event.max_age || "N/A"} years`;

  // Display contact info
  document.getElementById("modal-event-contact").textContent =
    event.contact_info || "N/A";
}

// Function to get status attributes
function getStatusAttributes(status) {
  switch (status) {
    case "Ongoing":
      return { backgroundColor: "#b43929" }; // Custom color for ongoing
    case "Upcoming":
      return { backgroundColor: "#6c757d" }; // Bootstrap secondary color
    case "Cancelled":
      return { backgroundColor: "black" }; // Black color for cancelled
    default:
      return { backgroundColor: "transparent" }; // Fallback color
  }
}
