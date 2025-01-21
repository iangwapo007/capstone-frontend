import { backendURL } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  getEvents(); // Fetch all events on page load

  // Add event listener to the search button
  document
    .getElementById("searchButton")
    .addEventListener("click", async () => {
      // Show the loading indicator
      showLoadingIndicator();

      // Get the search input value
      const searchInput = document.getElementById("searchInput").value.trim();

      // Fetch and filter events based on the search input
      await searchEvents(searchInput);

      // Hide the loading indicator after fetching data
      hideLoadingIndicator();
    });
});

async function getEvents() {
  try {
    const response = await fetch(backendURL + "/api/mobile/organization", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();
    renderEvents(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    hideLoadingIndicator(); // Hide loading in case of error
  }
}

async function searchEvents(searchInput) {
  try {
    const response = await fetch(backendURL + "/api/mobile/organization", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch events");

    const events = await response.json();

    // Filter events based on the search input
    const filteredEvents = events.filter((event) =>
      event.org_name.toLowerCase().includes(searchInput.toLowerCase())
    );

    renderEvents(filteredEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

function renderEvents(events) {
  let container = "";

  if (events.length === 0) {
    container = `<div style="margin-top: 100px">
      <img
        class="mx-auto d-block w-50"
        src="./assets/icon/no_results.png"
        alt=""
      />
      <p class="text-center mt-3">No results found.</p>
    </div>`;
  } else {
    events.forEach((element) => {
      const eventData = JSON.stringify(element).replace(/'/g, "&#39;");

      container += `
        <div class="container">
          <div class="d-flex justify-content-center my-4 event-item" data-event='${eventData}'>
            <div style="width: 27rem" data-bs-toggle="modal" data-bs-target="#center">
              <div class="position-relative rounded-3">
                <img src="./assets/imgs/default_center.png" class="card-img-top rounded-3" height="180px" />
                <div class="gradient-overlay rounded-bottom-3">
                  <h5 class="fw-bold position-absolute bottom-0 mx-2 start-0 text-white card-margin" style="text-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24)">
                    <small style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                      ${element.org_name}
                    </small>
                  </h5>
                </div>
                <div class="d-flex align-items-start position-absolute bottom-0 pb-2 mx-2 start-0 text-white">
                  <img src="./assets/icon/location(1).png" alt="" width="15px" style="padding-top: 1px" />
                  <small class="ps-2 league-spartan-regular text-white" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 350px;">
                    ${element.address}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    });
  }

  document.getElementById("get_data").innerHTML = container;

  document.querySelectorAll(".event-item").forEach((item) => {
    item.addEventListener("click", async (event) => {
      const eventData = JSON.parse(
        event.currentTarget.getAttribute("data-event")
      );
      await populateModal(eventData);
    });
  });
}

async function populateModal(event) {
  try {
    const inventoryResponse = await fetch(
      `${backendURL}/api/mobile/inventory`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!inventoryResponse.ok) throw new Error("Failed to fetch inventory");

    const inventoryData = await inventoryResponse.json();

    // Filter inventory data to get only blood stocks for the specific organization
    const bloodStocks = inventoryData.filter(
      (stock) => stock.user_id === event.org_id
    );

    // Populate modal fields with organization details
    document.getElementById("modal-event-image").src = event.image
      ? `${backendURL}/storage/images/${event.image}`
      : "./assets/imgs/default_center.png";

    document.getElementById("modal-center-name").textContent =
      event.org_name || "N/A";
    document.getElementById("modal-center-address").textContent =
      event.address || "No Location Available";
    document.getElementById("modal-center-contact").textContent =
      event.contact_info || "No Contact Info";
    document.getElementById("modal-center-email").textContent =
      event.org_email || "No Email";
    document.getElementById("modal-center-type").textContent =
      event.org_type || "No Type";
    document.getElementById("modal-center-time").textContent =
      event.operating_hour || "No Operating Hours";
    document.getElementById("modal-center-description").textContent =
      event.description || "No Description";

    // Display blood stock data
    const bloodStockContainer = document.getElementById("modal-center-stocks");
    bloodStockContainer.innerHTML = "";

    if (bloodStocks.length > 0) {
      bloodStocks.forEach((stock) => {
        const row = `
          <div class="row mt-1 mx-2 fw-normal text-center">
            <div class="col py-2 border">${stock.blood_type}${stock.rh_factor}</div>
            <div class="col py-2 border">${stock.component}</div>
            <div class="col py-2 border">${stock.avail_blood_units}</div>
          </div>`;
        bloodStockContainer.insertAdjacentHTML("beforeend", row);
      });
    } else {
      bloodStockContainer.innerHTML =
        "<div class='text-center mt-3'>No Blood Stock Available</div>";
    }
  } catch (error) {
    console.error("Error populating modal:", error);
  }
}

// Function to show the loading indicator
function showLoadingIndicator() {
  document.getElementById("get_data").innerHTML = `
    <div role="status">
      <div class="container mt-5 mb-5">
        <div class="container">
          <h5 class="placeholder-glow">
            <span class="placeholder col-6 rounded-1"></span>
          </h5>
          <p class="placeholder-glow rounded-1">
            <span class="placeholder col-7 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-6 rounded-1"></span>
            <span class="placeholder col-8 rounded-1"></span>
          </p>
          <p class="placeholder-glow col-6">
            <span
              class="placeholder col-6 rounded-1"
              style="background-color: #b43929; opacity: 100%"
            ></span>
          </p>
        </div>
      </div>
      <div class="container mt-3 mb-5">
        <div class="container">
          <h5 class="placeholder-glow">
            <span class="placeholder col-6 rounded-1"></span>
          </h5>
          <p class="placeholder-glow rounded-1">
            <span class="placeholder col-7 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-6 rounded-1"></span>
            <span class="placeholder col-8 rounded-1"></span>
          </p>
          <p class="placeholder-glow col-6">
            <span
              class="placeholder col-6 rounded-1"
              style="background-color: #b43929; opacity: 100%"
            ></span>
          </p>
        </div>
      </div>
      <div class="container mt-3 mb-5">
        <div class="container">
          <h5 class="placeholder-glow">
            <span class="placeholder col-6 rounded-1"></span>
          </h5>
          <p class="placeholder-glow rounded-1">
            <span class="placeholder col-7 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-4 rounded-1"></span>
            <span class="placeholder col-6 rounded-1"></span>
            <span class="placeholder col-8 rounded-1"></span>
          </p>
          <p class="placeholder-glow col-6">
            <span
              class="placeholder col-6 rounded-1"
              style="background-color: #b43929; opacity: 100%"
            ></span>
          </p>
        </div>
      </div>
    </div>`;
}

// Function to hide the loading indicator
function hideLoadingIndicator() {
  // You can add any additional logic to hide the loading indicator if needed
}
