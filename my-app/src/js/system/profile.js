import {
  backendURL,
  errorNotification,
  togglePassword,
  setRouter,
} from "../utils/utils";

let donor_id;
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
    donor_id = json.donor_id;
    console.log("Donor ID: ", donor_id); // Check if donor_id is fetched correctly

    // Redirect if fullname is null or empty
    if (!fullname || fullname.trim() === "") {
      console.log("Fullname is null or empty. Redirecting to setup.html...");
      window.location.href = "setup.html";
      return; // Exit the function after redirection
    }

    console.log("Inside getLoggedUserInfo:", fullname); // Correctly logs fullname

    // DISPLAY THE USER'S INFO
    document.getElementById("fullname").innerHTML = json.fullname;
    document.getElementById("email").innerHTML = json.email;
    document.getElementById("blood_type").innerHTML = "Type " + json.blood_type;
    document.getElementById("fullname1").innerHTML = json.fullname;
    document.getElementById("email1").innerHTML = json.email;
    document.getElementById("address").innerHTML = json.address;
    document.getElementById("phonenumber").innerHTML = "09" + json.phonenumber;
    document.getElementById("birthday").innerHTML = json.birthday;
    document.getElementById("age").innerHTML = json.age + " years old";
    document.getElementById("gender").innerHTML = json.gender;

    document.getElementById("medical_history").innerHTML =
      json.medical_history || "No data available";
    document.getElementById("current_medications").innerHTML =
      json.current_medications || "No data available";
    document.getElementById("allergies").innerHTML =
      json.allergies || "No data available";

    document.getElementById("emergency_name").innerHTML =
      json.emergency_name || "No data available";
    document.getElementById("emergency_relationship").innerHTML =
      json.emergency_relationship || "No data available";
    document.getElementById("emergency_phonenumber").innerHTML =
      "09" + json.emergency_phonenumber || "No data available";
    document.getElementById("status").innerHTML = json.status;
    document.getElementById("previous_donation").innerHTML =
      json.previous_donation || "No previous donation";

    // Check eligibility based on previous donation date
    const eligibilityElement = document.getElementById("eligibility_status");
    if (json.previous_donation) {
      const previousDate = new Date(json.previous_donation);
      const currentDate = new Date();
      const diffMonths =
        (currentDate.getFullYear() - previousDate.getFullYear()) * 12 +
        (currentDate.getMonth() - previousDate.getMonth());

      if (diffMonths >= 3) {
        eligibilityElement.textContent = "Eligible";
        eligibilityElement.style.backgroundColor = "#b43929"; // Redyawa color for eligible
      } else {
        eligibilityElement.textContent = "Not Eligible";
        eligibilityElement.classList.add("bg-secondary");
        eligibilityElement.style.backgroundColor = ""; // Default for not eligible
      }
    } else {
      eligibilityElement.textContent = "Eligible";
      eligibilityElement.style.backgroundColor = "#b43929";
    }

    // Update the status badge dynamically
    const statusElement = document.getElementById("status");

    if (json.status !== "Active") {
      statusElement.classList.add("bg-secondary"); // Add bg-secondary class
      statusElement.style.backgroundColor = ""; // Remove custom inline color
    } else {
      statusElement.classList.remove("bg-secondary"); // Ensure bg-secondary is not applied
      statusElement.style.backgroundColor = "#b43929"; // Keep the red color
    }

    // Optionally update the badge text
    statusElement.textContent = json.status;
  }
  // Get response if 422 status code | IF DILI OKAY
  else {
    const json = await response.json();
    console.log(json.message);
  }
}

//LOGOUT FUNCTIONALITY
const btn_logout = document.getElementById("btn_logout");

btn_logout.onclick = async () => {
  // Fetch API user login endpoint
  const response = await fetch(backendURL + "/api/donor/logout", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  // Get response if 200-299 status code | IF OKAY
  if (response.ok) {
    localStorage.clear();
    // Redirect to login page
    window.location.pathname = "/donor.html";
  }
  // Get response if 422 status code | IF DILI OKAY
  else {
    const json = await response.json();

    alert(json.message);
  }
};

// Update Donor Status

const form_stat = document.getElementById("form_stat");

form_stat.onsubmit = async (e) => {
  e.preventDefault();

  // Disable Button | WHILE GA LOADING
  document.querySelector("#form_stat #statusSubmit").disabled = true;
  document.querySelector(
    "#form_stat #statusSubmit"
  ).innerHTML = `<div class="spinner-border me-2" role="status"></div> 
                <span class="mt-1">Loading...</span>`;

  // Get Values of Form (input, textarea, select) set it as form-data
  const formData = new FormData(form_stat);

  formData.append("_method", "PUT");

  // Fetch API user login endpoint
  const response = await fetch(`${backendURL}/api/donor/status/${donor_id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: formData,
  });

  // Get response if 200-299 status code | IF OKAY
  if (response.ok) {
    document.querySelector("#form_stat #statusSubmit").disabled = true;

    const json = await response.json();
    console.log(json);

    document.querySelector(
      "#form_stat #statusSubmit"
    ).innerHTML = `<div class="spinner-border me-2" role="status"></div> 
                <span class="mt-1">Logging In</span>`;

    window.location.reload(); // Reloads the current page
  }
  // Get response if 422 status code | IF DILI OKAY
  else if (response.status == 422) {
    const json = await response.json();

    errorNotification(json.message);
  }
  // Enable Button | AFTER MAG LOADING
  document.querySelector("#form_stat #statusSubmit").disabled = false;
  document.querySelector("#form_stat #statusSubmit").innerHTML = `Save Changes`;
};

function checkEligibility(previousDonationDate) {
  // Get the current date
  const currentDate = new Date();

  // Convert the previous donation date string to a Date object
  const donationDate = new Date(previousDonationDate);

  // Calculate the difference in months
  const differenceInMonths =
    currentDate.getMonth() -
    donationDate.getMonth() +
    12 * (currentDate.getFullYear() - donationDate.getFullYear());

  // Determine eligibility
  const eligibilityStatus =
    differenceInMonths >= 3 ? "Eligible" : "Not Eligible";

  // Set the eligibility status in the HTML
  const eligibilityElement = document.getElementById("eligibility_status");
  eligibilityElement.textContent = eligibilityStatus;

  // Style the badge dynamically
  if (eligibilityStatus === "Eligible") {
    eligibilityElement.style.backgroundColor = "#b43929"; // Red for eligible
  } else {
    eligibilityElement.style.backgroundColor = "#6c757d"; // Grey for not eligible
  }
}

setRouter();
getLoggedUserInfo();

export { getLoggedUserInfo };
