const backendURL = "http://capstone-backend-main.test";

// let fullname;

// async function getLoggedUserInfo() {
//   const response = await fetch(backendURL + "/api/mobile/profile/show", {
//     headers: {
//       Accept: "application/json",
//       Authorization: "Bearer " + localStorage.getItem("token"),
//     },
//   });

//   if (response.ok) {
//     const json = await response.json();
//     fullname = json.fullname; // Assign the fetched fullname to the global variable
//     console.log("Inside getLoggedUserInfo:", fullname); // Correctly logs fullname
//   } else {
//     const json = await response.json();
//     console.log(json.message);
//   }
// }

// async function initializeApp() {
//   await getLoggedUserInfo(); // Wait for fullname to be fetched
//   console.log("Globally logged fullname:", fullname); // Now logs the correct value
//   setRouter(); // Proceed with routing logic
// }

function setRouter() {
  switch (window.location.pathname) {
    case "/donor.html":
    case "/login.html":
    case "/register.html":
      if (localStorage.getItem("token")) {
        window.location.pathname = "/profile.html";
      }
      break;

    default:
      break;
  }
  switch (window.location.pathname) {
    case "/setup.html":
    case "/update.html":
    case "/profile.html":
      if (localStorage.getItem("token") == null) {
        window.location.pathname = "/donor.html";
      }
      break;

    default:
      break;
  }
}

// initializeApp(); // Call the function to start the app

export { setRouter };
