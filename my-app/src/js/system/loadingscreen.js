// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Function to switch from spinner to content
    function showContent() {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('content').style.display = 'block';
    }
  
    // Display the content after 3 seconds
    setTimeout(showContent, 3000);
  
    // Redirect to another page on click
    document.addEventListener('click', function() {
      window.location.href = 'map.html'; // Update this to your actual page
    });
  });