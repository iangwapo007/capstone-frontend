import { backendURL } from "../utils/utils.js";

const bloodTypeSelect = document.getElementById("bloodTypeSelect");
const componentSelect = document.getElementById("componentSelect");

document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");

  searchButton.addEventListener("click", function () {
    const selectedBloodType = bloodTypeSelect.value;
    const selectedComponent = componentSelect.value;

    performSearch(selectedBloodType, selectedComponent);
  });
});

// Fetch data and render it
async function fetchData() {
  try {
    const inventoryResponse = await fetch(backendURL + "/api/mobile/inventory");
    const organizationResponse = await fetch(
      backendURL + "/api/mobile/organization"
    );

    if (!inventoryResponse.ok || !organizationResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const inventoryData = await inventoryResponse.json();
    const organizationData = await organizationResponse.json();

    const mergedData = inventoryData.map((item) => {
      const organization = organizationData.find(
        (org) => org.org_id === item.user_id
      );

      return {
        ...item,
        org_name: organization ? organization.org_name : "Unknown Organization",
        org_type: organization ? organization.org_type : "Unknown Type",
        address: organization ? organization.address : "No address available",
        contact_info: organization
          ? organization.contact_info
          : "No contact available",
        org_email: organization ? organization.org_email : "No email available",
        operating_hour: organization
          ? organization.operating_hour
          : "No operating hours available",
      };
    });

    renderData(mergedData, inventoryData);

    // Attach the search function
    window.performSearch = (selectedBloodType, selectedComponent) => {
      const filteredData = mergedData.filter((item) => {
        // Define compatibility function
        const isCompatible = (donor_blood, recipient_blood) => {
          const compatibilityChart = {
            "O-": ["O-"],
            "O+": ["O-", "O+"],
            "A-": ["A-", "O-"],
            "A+": ["A+", "A-", "O-", "O+"],
            "B-": ["B-", "O-"],
            "B+": ["B+", "B-", "O-", "O+"],
            "AB-": ["AB-", "B-", "O-", "A-"],
            "AB+": ["AB+", "AB-", "A-", "A+", "B+", "B-", "O-", "O+"],
          };
          return compatibilityChart[recipient_blood].includes(donor_blood);
        };

        // Check for blood type and component match
        const bloodTypeMatch =
          `${item.blood_type}${item.rh_factor}` === selectedBloodType;
        const componentMatch = item.component === selectedComponent;

        // If blood type is selected and component is "None", apply compatibility check
        if (selectedBloodType !== "None" && selectedComponent === "None") {
          return isCompatible(
            item.blood_type + item.rh_factor,
            selectedBloodType
          );
        }

        // If component is selected and blood type is "None", just filter by component
        if (selectedBloodType === "None" && selectedComponent !== "None") {
          return componentMatch;
        }

        // Otherwise, check if both blood type and component match
        return bloodTypeMatch && componentMatch;
      });
      console.log(filteredData);
      renderData(filteredData, inventoryData); // Assuming this function renders the filtered data
    };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Render data function
function renderData(data, inventoryData) {
  const container = document.getElementById("data-container");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `
      <div style="margin-top: 100px">
        <img class="mx-auto d-block w-50" src="./assets/icon/no_results.png" alt="No results" />
        <p class="text-center mt-3">No results found.</p>
      </div>`;
    return;
  }

  const containerHTML = data
    .map(
      (item) => `
      <div class="py-2 px-3 mt-3 m-2 rounded-3 bg-white position-relative mb-2" 
           data-bs-toggle="modal" data-bs-target="#center_${item.user_id}" 
           style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px; overflow-x: hidden; white-space: nowrap;">
        <div class="position-absolute bg-secondary-subtle p-3 rounded-3 mt-1" style="left: 8px">
          <img class="opacity-25" src="assets/icon/location.png" width="35px" />
        </div>
        <div class="position-relative mt-1" style="left: 68px">
          <span class="fw-bold" style="color: #b43929">
            ${item.component} (${item.blood_type}${item.rh_factor})
          </span><br/>
          ${item.org_type}<br/>
          <div style="max-width: 200px;">
            <small style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${item.org_name}
            </small>
          </div>
        </div>
        <span class="position-absolute p-2 text-white d-flex justify-content-center" 
              style="right: 0px; top: 0px; width: 90px; background-color: #b43929; border-radius: 0px 10px 0px 10px;">
          ${item.avail_blood_units} Units
        </span>
      </div>
      
      <div class="modal fade" id="center_${
        item.user_id
      }" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1">
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="position-relative">
              <div>
                <img id="modal-event-image" src="${
                  item.image
                    ? `${backendURL}/storage/${item.image}`
                    : "./assets/imgs/default_center.png"
                }" class="w-100" height="180px" />
                <div class="gradient-overlay">
                  <h5 id="modal-center-name" class="card-title fw-bold position-absolute bottom-0 mx-2 start-0 text-white" 
                      style="text-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24)">
                    ${item.org_name}
                  </h5>
                </div>
              </div>
            </div>

            <button type="button" class="btn-secondary mt-4 ms-5 position-absolute top-0 start-0 translate-middle btn rounded-2 text-white d-flex justify-content-center align-items-center" 
                    data-bs-dismiss="modal" style="height: 25px; box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">
              <img src="./assets/icon/left-arrow.png" alt="Back" style="width: 8px; height: 8px" />
              <span class="ms-1 mt-1"><small>Back</small></span>
            </button>

            <div class="card-body modal-body">
              <div class="container rounded-3 py-3 px-3" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px">
                <div class="mb-2 d-flex align-items-start">
                  <img src="./assets/icon/address.png" alt="Address" width="15px" />
                  <small class="ps-2">${item.address}</small>
                </div>
                <div class="my-2 d-flex align-items-start">
                  <img src="./assets/icon/phone_num.png" alt="Phone" width="15px" />
                  <small class="ps-2">${item.contact_info}</small>
                </div>
                <div class="my-2 d-flex align-items-start">
                  <img src="./assets/icon/email.png" alt="Email" width="15px" />
                  <small class="ps-2">${item.org_email}</small>
                </div>
                <div class="mt-2 d-flex align-items-start">
                  <img src="./assets/icon/center.png" alt="Type" width="15px" />
                  <small class="ps-2">${item.org_type}</small>
                </div>
                <div class="mt-2 d-flex align-items-start">
                  <img src="./assets/icon/operating_hours.png" alt="Hours" width="15px" />
                  <small class="ps-2">${item.operating_hour}</small>
                </div>
              </div>

              <div class="container mt-3 py-3 rounded-3" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px">
                <p class="fw-bold">Available Stocks:</p>
                <div>
                  <div class="row mt-2 mx-2 text-white fw-semibold text-center">
                    <div class="col py-2 bg-secondary custom-margin rounded-start-3" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">Blood Type</div>
                    <div class="col py-2 bg-secondary custom-margin" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">Component</div>
                    <div class="col py-2 bg-secondary custom-margin rounded-end-3" style="box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;">Units</div>
                  </div>
                  <div id="modal-center-stocks">${getInventory(
                    item.user_id,
                    inventoryData
                  )}</div>
                </div>
              </div>
            </div>

            <button type="button" class="btn rounded-2 m-2 text-white" 
                    style="background-color: #b43929; box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;" 
                    onclick="navigateToMap('${item.org_name}', '${
        item.org_type
      }')">
              Go to Map
            </button>
          </div>
        </div>
      </div>
  `
    )
    .join("");
  // console.log(containerHTML);
  container.innerHTML = containerHTML;
}

window.populateModal = populateModal;

function populateModal(item) {
  document.getElementById("modal-center-name").innerText = `${item.org_name}`;
  document.getElementById(
    "modal-blood-type"
  ).innerText = `${item.blood_type}${item.rh_factor}`;
  document.getElementById("modal-center-address").innerText =
    item.address || "No address available";
  document.getElementById("modal-center-contact").innerText =
    item.contact_info || "No contact available";
  document.getElementById("modal-center-email").innerText =
    item.org_email || "No email available";
  document.getElementById("modal-center-type").innerText =
    item.org_type || "Unknown Type";
  document.getElementById("modal-center-time").innerText =
    item.operating_hour || "No operating hours available";

  document.getElementById("modal-event-image").src = item.image
    ? `${backendURL}/storage/images/${item.image}`
    : "./assets/imgs/default_center.png";

  const stocksContainer = document.getElementById("modal-center-stocks");

  stocksContainer.innerHTML = `
    <div class="row mt-1 mx-2 fw-normal text-center">
      <div class="col py-2 border">${item.blood_type}${item.rh_factor}</div>
      <div class="col py-2 border">${item.component}</div>
      <div class="col py-2 border">${item.avail_blood_units}</div>
    </div>
  `;
}

function getInventory(id, inventoryData) {
  let stocksHTML = "";

  for (const stocks of inventoryData) {
    if (stocks.user_id == id) {
      stocksHTML += `<div class="row mt-1 mx-2 fw-normal text-center">
      <div class="col py-2 border">${stocks.blood_type}${stocks.rh_factor}</div>
      <div class="col py-2 border">${stocks.component}</div>
      <div class="col py-2 border">${stocks.avail_blood_units}</div>
    </div>`;
    }
  }
  return stocksHTML;
}

navigateToMap();
fetchData();
