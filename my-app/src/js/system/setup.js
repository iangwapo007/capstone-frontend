import { backendURL, errorNotification } from "../utils/utils";

let fullname;

async function getLoggedUserInfo() {
  const response = await fetch(backendURL + "/api/mobile/profile/show", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  // Get response if 200-299 status code | IF OKAY
  if (response.ok) {
    const json = await response.json();
    fullname = json.fullname; // Assign the fetched fullname to the global variable

    if (fullname && fullname.trim() !== "") {
      console.log("Fullname exists. Redirecting to profile.html...");
      window.location.href = "profile.html";
      return; // Exit the function after redirection
    }
  }
  // Get response if 422 status code | IF DILI OKAY
  else {
    const json = await response.json();
    console.log(json.message);
  }
}

getLoggedUserInfo();

// Global variable to store donor_id
let donor_id = null;

// Function to fetch and store the donor_id
async function getDonorID() {
  const response = await fetch(backendURL + "/api/mobile/profile/show", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  if (response.ok) {
    const json = await response.json();
    // Assuming the donor_id is in json.donor_id (adjust this based on your actual response structure)
    donor_id = json.donor_id;
    console.log("Donor ID: ", donor_id); // Check if donor_id is fetched correctly
  } else {
    const json = await response.json();
    console.log(json.message);
  }
}

// Call the function to fetch donor_id when the page loads
getDonorID();

async function getOrganizations() {
  const response = await fetch(backendURL + "/api/mobile/organization", {
    headers: {
      Accept: "application/json",
    },
  });

  // Check if the response is OK
  if (response.ok) {
    const json = await response.json();
    let container = "";

    // Loop through the organizations and check if the org_type is "Blood Center"
    json.forEach((org) => {
      if (org.org_type === "Blood Center") {
        // Create an <option> for each "Blood Center" organization with user_id as value
        container += `<option value="${org.user_id}">${org.org_name}</option>`;
        console.log(`Organization ID: ${org.user_id}`);
      }
    });

    // Insert the filtered organizations into the select dropdown
    document.getElementById("get_center").innerHTML += container;
  } else {
    // Handle errors
    const json = await response.json();
    console.error("Error fetching organizations:", json.message);
  }
}

// Call the function to populate the dropdown
getOrganizations();

const form_update = document.getElementById("form_update");

// Form submission handler
form_update.onsubmit = async (e) => {
  e.preventDefault();

  const submitButton = document.querySelector("#form_update #confirm");

  // Disable Button | While Loading
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <div class="spinner-border me-2" role="status"></div>
    <span class="mt-1">Loading...</span>
  `;

  try {
    // Create form data as a plain object (this can be sent as JSON)
    const formData = {};
    const formElements = new FormData(form_update);

    // Add form data to the object
    for (const [key, value] of formElements.entries()) {
      formData[key] = value;
    }

    // Add user_id from the Blood Center selection
    const selectedUserId = document.getElementById("get_center").value;
    if (!selectedUserId) {
      throw new Error("Please select a Blood Center.");
    }
    formData.user_id = selectedUserId;

    // Add blood_type from the dropdown
    const selectedBloodType = document.querySelector(
      'select[name="blood_type"]'
    ).value;
    if (!selectedBloodType) {
      throw new Error("Please select a Blood Type.");
    }
    formData.blood_type = selectedBloodType;

    // Use the global donor_id in the API endpoint
    if (!donor_id) {
      throw new Error("Donor ID not found.");
    }

    // Fetch API donor update endpoint with JSON body
    const response = await fetch(`${backendURL}/api/donor/setup/${donor_id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData), // Send data as JSON
    });

    if (response.ok) {
      // Redirect to profile page
      window.location.pathname = "/profile.html";
    } else {
      // Handle validation errors
      const json = await response.json();
      console.error("Validation Error:", json);
      errorNotification(json.message);
    }
  } catch (err) {
    // Handle network or other unexpected errors
    console.error("Error:", err.message);
    errorNotification(err.message);
  } finally {
    // Enable Button | After Loading
    submitButton.disabled = false;
    submitButton.innerHTML = `Confirm Setup`;
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const phonenumberInput = document.getElementById("phonenumber");
  const emergencyPhonenumberInput = document.getElementById(
    "emergency_phonenumber"
  );

  // Add event listeners to ensure 09 remains uneditable
  // [phonenumberInput, emergencyPhonenumberInput].forEach((inputElement) => {
  //   inputElement.addEventListener("input", (e) => {
  //     const prefix = "09";
  //     let value = inputElement.value;

  //     // Ensure the input starts with 09
  //     if (!value.startsWith(prefix)) {
  //       value = prefix + value.replace(/^09?/, ""); // Re-add the correct prefix
  //     }

  //     // Limit the input to 11 characters (e.g., 09123456789)
  //     inputElement.value = value.slice(0, 11);
  //   });

  //   // Prevent caret position from moving inside 09
  //   inputElement.addEventListener("keydown", (e) => {
  //     if (inputElement.selectionStart < 2) {
  //       e.preventDefault(); // Block editing in the 09 area
  //       inputElement.setSelectionRange(2, 2); // Move caret after 09
  //     }
  //   });
  // });
});
