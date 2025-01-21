import {
  backendURL,
  errorNotification,
  togglePassword,
  setRouter,
} from "../utils/utils.js";

setRouter();

//Form Login

const form_login = document.getElementById("form_login");

form_login.onsubmit = async (e) => {
  e.preventDefault();

  // Disable Button | WHILE GA LOADING
  document.querySelector("#form_login #login").disabled = true;
  document.querySelector(
    "#form_login #login"
  ).innerHTML = `<div class="spinner-border me-2" role="status"></div> 
                <span class="mt-1">Loading...</span>`;

  // Get Values of Form (input, textarea, select) set it as form-data
  const formData = new FormData(form_login);

  // Fetch API user login endpoint
  const response = await fetch(backendURL + "/api/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  // Get response if 200-299 status code | IF OKAY
  if (response.ok) {
    document.querySelector("#form_login #login").disabled = true;

    const json = await response.json();
    console.log(json);

    localStorage.setItem("token", json.token);
    console.log("token");

    document.querySelector(
      "#form_login #login"
    ).innerHTML = `<div class="spinner-border me-2" role="status"></div> 
                <span class="mt-1">Logging In</span>`;

    // Redirect to login page
    setTimeout(() => {
      window.location.pathname = "/profile.html";
    });
  }
  // Get response if 422 status code | IF DILI OKAY
  else if (response.status == 422) {
    const json = await response.json();

    errorNotification(json.message);
  }
  // Enable Button | AFTER MAG LOADING
  document.querySelector("#form_login #login").disabled = false;
  document.querySelector("#form_login #login").innerHTML = `Login`;
};
