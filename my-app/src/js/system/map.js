let map;
let directionsService;
let directionsRenderer;

// Initialize the map
async function initMap() {
  getCurrentLocation()
    .then((userLocation) => {
      // Create the map centered on the user's location
      map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: userLocation,
        mapId: "e44c845d408c8533", // Customize your map ID if needed
      });

      // CUSTOM MARKERS
      const markers = [
        [
          "Butuan Medical Center",
          8.961870739363286,
          125.58611103413106,
          "./assets/markers/hospital.png",
          45,
          45,
        ],
        [
          "Manuel J. Santos Hospital",
          8.946988223371044,
          125.54097371992334,
          "./assets/markers/hospital.png",
          45,
          45,
        ],
        [
          "Butuan Doctor's Hospital",
          8.943879867808032,
          125.52224725775056,
          "./assets/markers/hospital.png",
          45,
          45,
        ],
        [
          "Agusan Del Norte Provincial Hospital",
          8.948074794552884,
          125.50548911366728,
          "./assets/markers/hospital.png",
          45,
          45,
        ],
        [
          "Red Cross Butuan City Chapter",
          8.941454909918606,
          125.5347397053076,
          "./assets/markers/blood-center.png",
          45,
          45,
        ],
      ];

      const alwaysVisibleMarkers = [];

      // Load all custom markers
      for (let i = 0; i < markers.length; i++) {
        const currMarker = markers[i];

        const marker = new google.maps.Marker({
          map: map,
          position: { lat: currMarker[1], lng: currMarker[2] },
          title: currMarker[0],
          icon: {
            url: currMarker[3],
            scaledSize: new google.maps.Size(currMarker[4], currMarker[5]),
          },
          animation: google.maps.Animation.DROP,
        });

        alwaysVisibleMarkers.push(marker);
      }

      // Initialize Directions Service and Renderer
      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Disable default markers (A & B)
      });
      directionsRenderer.setMap(map);

      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: "#b43929",
          strokeOpacity: 1,
          strokeWeight: 7,
        },
      });

      // Add a marker for the user's location with a custom icon
      const userMarker = new google.maps.Marker({
        map: map,
        position: userLocation,
        title: "You are here",
        icon: {
          url: "./assets/icon/current_location.png",
          size: new google.maps.Size(55, 55),
          scaledSize: new google.maps.Size(55, 55),
        },
      });

      // Now retrieve destination from URL and show directions
      const urlParams = new URLSearchParams(window.location.search);
      const lat = parseFloat(urlParams.get("lat")); // Get latitude from URL
      const lng = parseFloat(urlParams.get("lng")); // Get longitude from URL
      const orgType = urlParams.get("orgType"); // Get organization type from URL

      let destinationMarker;

      if (!isNaN(lat) && !isNaN(lng)) {
        const destination = { lat: lat, lng: lng }; // Destination coordinates

        // Create a custom marker for the destination
        destinationMarker = new google.maps.Marker({
          map: map,
          position: destination,
          title: orgType || "Destination",
          icon: {
            url:
              orgType === "Blood Center"
                ? "./assets/markers/blood-center.png"
                : "./assets/markers/hospital.png",
            scaledSize: new google.maps.Size(55, 55),
          },
        });

        // Hide all custom markers when a route is displayed
        showDirections(userLocation, destination, alwaysVisibleMarkers);
      } else {
        // Hide all markers if there's no destination
        alwaysVisibleMarkers.forEach((marker) => marker.setMap(null));
      }

      // Implement zoom-based visibility for custom markers
      const zoomThreshold = 11; // Set the threshold zoom level

      // Event listener for zoom change
      google.maps.event.addListener(map, "zoom_changed", () => {
        const zoomLevel = map.getZoom();
        if (zoomLevel < zoomThreshold) {
          // Hide markers when zoom level is below the threshold
          alwaysVisibleMarkers.forEach((marker) => marker.setMap(null));
        } else {
          // Show markers when zoom level is above the threshold
          if (!destinationMarker) {
            alwaysVisibleMarkers.forEach((marker) => marker.setMap(map));
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error getting location:", error);
    });
}

// Function to display directions from current location to destination
function showDirections(origin, destination, markers) {
  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);

      // Hide all custom markers except the origin and destination
      markers.forEach((marker) => marker.setMap(null));
    } else {
      console.error("Directions request failed due to " + status);
    }
  });
}

// Function to get user's current location with enhanced accuracy
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}
