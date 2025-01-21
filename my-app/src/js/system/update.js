import { backendURL, errorNotification } from "../utils/utils";

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

// Function to ensure +639 prefix always stays in the input field
function enforcePhilippinePrefix(inputElement) {
  const prefix = "+639";
  let value = inputElement.value;

  // If the value does not start with +639, re-add the prefix
  if (!value.startsWith(prefix)) {
    value = prefix + value.replace(/^\+?639?/, ""); // Remove any invalid prefix and re-add correct one
  }

  // Set the modified value back to the input
  inputElement.value = value;
}

// Ensure the form submission sends the correct data
document.addEventListener("DOMContentLoaded", function () {
  const form_update = document.getElementById("form_update");

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
        if (key === "phonenumber" || key === "emergency_phonenumber") {
          // Remove the +639 prefix if present, leaving only the rest of the digits
          if (value.startsWith("+639")) {
            formData[key] = value.slice(4); // Remove the "+639"
          } else if (value.startsWith("639")) {
            formData[key] = value.slice(3); // Remove the "639" if input lacks "+"
          } else {
            formData[key] = value; // Keep as-is if no "+639" or "639"
          }
        } else {
          formData[key] = value;
        }
      }

      // Fetch API donor update endpoint with JSON body
      const response = await fetch(
        `${backendURL}/api/donor/update/${donor_id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData), // Send data as JSON
        }
      );

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
      submitButton.innerHTML = `Save Changes`;
    }
  };
});

// Function to fetch and populate form fields with existing data
async function populateForm() {
  try {
    const response = await fetch(backendURL + "/api/mobile/profile/show", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (response.ok) {
      const json = await response.json();
      donor_id = json.donor_id; // Store donor_id globally
      console.log("Donor ID: ", donor_id);

      // Populate form fields with current values
      document.getElementById("fullname").value = json.fullname || "";
      document.getElementById("email").value = json.email || "";
      document.getElementById("birthday").value = json.birthday || ""; // Ensure date format matches yyyy-mm-dd
      document.getElementById("age").value = json.age || "";

      // Ensure the phone number always includes the +639 prefix
      let phonenumber = String(json.phonenumber || ""); // Convert to string

      document.getElementById("phonenumber").value = phonenumber;

      // Ensure the emergency phone number always includes the +639 prefix
      let emergencyPhonenumber = String(json.emergency_phonenumber || ""); // Convert to string

      document.getElementById("emergency_phonenumber").value =
        emergencyPhonenumber;

      document.getElementById("gender").value = json.gender || "";
      document.getElementById("address").value = json.address || "";
      document.getElementById("blood_type").value = json.blood_type || "";
      document.getElementById("medical_history").value =
        json.medical_history || "";
      document.getElementById("current_medications").value =
        json.current_medications || "";
      document.getElementById("allergies").value = json.allergies || "";
      document.getElementById("emergency_name").value =
        json.emergency_name || "";
      document.getElementById("emergency_relationship").value =
        json.emergency_relationship || "";
    } else {
      const error = await response.json();
      console.error("Error fetching profile data:", error.message);
      errorNotification(error.message);
    }
  } catch (err) {
    console.error("Error:", err.message);
    errorNotification("Failed to fetch user data. Please try again later.");
  }
}

// Call the populateForm function when the page loads
populateForm();

document.addEventListener("DOMContentLoaded", function () {
  const phonenumberInput = document.getElementById("phonenumber");
  const emergencyPhonenumberInput = document.getElementById(
    "emergency_phonenumber"
  );

  // Add event listeners to ensure +639 remains uneditable
  // [phonenumberInput, emergencyPhonenumberInput].forEach((inputElement) => {
  //   inputElement.addEventListener("input", (e) => {
  //     const prefix = "+639";
  //     let value = inputElement.value;

  //     // Ensure the input starts with +639
  //     if (!value.startsWith(prefix)) {
  //       value = prefix + value.replace(/^\+?639?/, ""); // Re-add the correct prefix
  //     }

  //     // Limit the input to 13 characters (e.g., +639123456789)
  //     inputElement.value = value.slice(0, 13);
  //   });

  //   // Prevent caret position from moving inside +639
  //   inputElement.addEventListener("keydown", (e) => {
  //     if (inputElement.selectionStart < 4) {
  //       e.preventDefault(); // Block editing in the +639 area
  //       inputElement.setSelectionRange(4, 4); // Move caret after +639
  //     }
  //   });
  // });
});
