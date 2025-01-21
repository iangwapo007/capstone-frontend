import { setRouter } from "../router/router.js";

setRouter();

// Backend URL
const backendURL = "http://capstone-backend-main.test";

// ERR0R NOTIFICATION
function errorNotification(message, seconds = "") {
  document.querySelector(".alert").classList.remove("d-none");
  document.querySelector(".alert").classList.add("d-show");
  document.querySelector(".alert").innerHTML = message;

  if (seconds != "") {
    setTimeout(function () {
      document.querySelector(".alert").classList.remove("d-show");
      document.querySelector(".alert").classList.add("d-none");
    }, seconds * 1000);
  }
}

// SEE PASSWORD TOGGLE
function togglePassword(inputId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const toggleIcon = document.getElementById(iconId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.src = "./assets/icon/see_password_on.png"; // Update with your hide icon
  } else {
    passwordInput.type = "password";
    toggleIcon.src = "./assets/icon/see_password.png"; // Update with your show icon
  }
}

window.togglePassword = togglePassword;

export { backendURL, errorNotification, togglePassword, setRouter };
