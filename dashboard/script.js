// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvg1AhjEd9vIiYWgqQlI5BO0jU3AF84t8",
  authDomain: "vitgis-ba14f.firebaseapp.com",
  projectId: "vitgis-ba14f",
  storageBucket: "vitgis-ba14f.appspot.com",
  messagingSenderId: "759209581914",
  appId: "1:759209581914:web:3432c0511eba57eca66763",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch Data from Firestore
async function fetchRegistrations() {
  const timestamps = [];

  const querySnapshot = await getDocs(collection(db, "VITians"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    timestamps.push(new Date(data.timestamp.seconds * 1000)); // Convert Firestore timestamp
  });

  // Group data by date
  const dataCount = timestamps.reduce((acc, date) => {
    const key = date.toISOString().split("T")[0]; // Group by Date
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return { labels: Object.keys(dataCount), counts: Object.values(dataCount), total: timestamps.length };
}

// Render Chart
async function renderChart() {
  const { labels, counts, total } = await fetchRegistrations();

  const ctx = document.getElementById("registrationChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Registrations",
          data: counts,
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Date" },
        },
        y: {
          title: { display: true, text: "Registrations" },
          beginAtZero: true,
        },
      },
    },
  });

  // Display total registrations
  document.getElementById("total-registrations-count").textContent = total;

  // Download Button
  document.getElementById("download-btn").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = chart.toBase64Image();
    link.download = "registration_chart.png";
    link.click();
  });
}


// Initial Chart Render
renderChart();

// Logout function
function logout() {
  signOut(auth).then(() => {
    // Redirect to login page and prevent back navigation
    window.location.replace("https://board.geospatialvit.site/");  // Use replace() to prevent going back
  }).catch((error) => {
    console.error("Error signing out: ", error);
  });
}

// Attach logout function to the logout button
document.getElementById("logoutBtn").addEventListener("click", logout);
