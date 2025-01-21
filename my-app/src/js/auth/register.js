import {
  backendURL,
  errorNotification,
  togglePassword,
  setRouter,
} from "../utils/utils.js";

//
setRouter();

//Form Register

const form_register = document.getElementById("form_register");

form_register.onsubmit = async (e) => {
  e.preventDefault();

  // Disable Button | WHILE GA LOADING
  document.querySelector("#form_register #register").disabled = true;
  document.querySelector(
    "#form_register #register"
  ).innerHTML = `<div class="spinner-border me-2" role="status"></div> 
                <span class="mt-1">Loading...</span>`;

  // Get Values of Form (input, textarea, select) set it as form-data
  const formData = new FormData(form_register);

  // Fetch API user register endpoint
  const response = await fetch(backendURL + "/api/donor/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  // Get response if 200-299 status code | IF OKAY
  if (response.ok) {
    form_register.reset();

    document.querySelector(".custom-modal-overlay").classList.remove("d-none");

    document.querySelector("#form_register #register").disabled = true;

    // Redirect to login page
    setTimeout(() => {
      window.location.pathname = "/login.html";
    }, 5000);
  }
  // Get response if 422 status code | IF DILI OKAY
  else if (response.status == 422) {
    const json = await response.json();

    errorNotification(json.message);
  }

  // Enable Button | AFTER MAG LOADING
  document.querySelector("#form_register #register").disabled = false;
  document.querySelector("#form_register #register").innerHTML = `Register`;
};
