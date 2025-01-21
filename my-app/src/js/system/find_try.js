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
        <div
            class="py-2 px-3 mt-3 m-2 rounded-3 bg-white position-relative mb-2"
            style="
              box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
              overflow-x: hidden;
              white-space: nowrap;
            "
          >
            <div
              class="position-absolute bg-secondary-subtle p-3 rounded-3 mt-1"
              style="left: 8px"
            >
              <img
                class="opacity-25"
                src="assets/icon/location.png"
                width="35px"
              />
            </div>
            <div class="position-relative mt-1" style="left: 68px">
              <span class="fw-bold" style="color: #b43929">${element.component} (${element.blood_type}${element.rh_factor})</span
              ><br />${element.org_type}
              <div><small>${element.organizationName}</small></div> <!-- Use organizationName -->
            </div>
            <span
              class="position-absolute p-2 text-white d-flex justify-content-center"
              style="
                right: 0px;
                top: 0px;
                width: 90px;
                background-color: #b43929;
                border-radius: 0px 10px 0px 10px;
              "
              >${element.avail_blood_units} Units</span
            >
          </div>`;
    });
  }

  document.getElementById("data_container").innerHTML = container;

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
