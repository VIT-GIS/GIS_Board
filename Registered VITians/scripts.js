// Import Firebase and SheetJS modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut,} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Allowed email IDs
const allowedEmails = [
  "sahildinesh.zambre2023@vitstudent.ac.in",
  "ajitesh.sharma2023@vitstudent.ac.in",
  "raybanpranav.mahesh2023@vitstudent.ac.in",
  "rohit.lalbahadur2023@vitstudent.ac.in",
];

// Function to check if the user is authorized
function checkAuthorization() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userEmail = user.email;
      if (!allowedEmails.includes(userEmail)) {
        alert("Unauthorized access! Redirecting to login...");
        window.location.href = "https://board.geospatialvit.site/";
      } else {
        fetchAndDisplayData(); // Fetch and display data for authorized users
      }
    } else {
      alert("Please log in to access this page.");
      window.location.href = "https://board.geospatialvit.site/";
    }
  });
}

// Function to fetch and display data in real-time
function fetchAndDisplayData() {
  const tableBody = document.querySelector("#data-table tbody");
  const searchInput = document.getElementById("search-input");

  // Listen for real-time updates
  onSnapshot(
    collection(db, "VITians"),
    (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => data.push(doc.data()));

      // Render data in the table
      renderTable(data);

      // Search functionality
      searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase();
        const filteredData = data.filter((item) =>
          item.regNumber.toLowerCase().includes(searchValue)
        );
        renderTable(filteredData);
      });

      // Enable Excel download functionality
      document.getElementById("download-btn").addEventListener("click", () => downloadExcel(data));
    },
    (error) => {
      console.error("Error fetching real-time data: ", error);
    }
  );
}

// Function to render the table
function renderTable(data) {
  const tableBody = document.querySelector("#data-table tbody");
  tableBody.innerHTML = ""; // Clear the table

  data.forEach((item) => {
    const timestamp = item.timestamp ? formatTimestamp(item.timestamp) : "N/A";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.regNumber || "N/A"}</td>
      <td>${item.name || "N/A"}</td>
      <td>${item.email || "N/A"}</td>
      <td>${item.phone || "N/A"}</td>
      <td>${timestamp}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Function to format the timestamp
function formatTimestamp(timestamp) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); // Handle Firestore Timestamp or regular Date
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return date.toLocaleString("en-US", options);
}

// Function to download data as Excel
function downloadExcel(data) {
  const excelData = data.map((item) => ({
    "Reg. Number": item.regNumber || "N/A",
    Name: item.name || "N/A",
    Email: item.email || "N/A",
    Phone: item.phone || "N/A",
    "Reg. Date & Time": item.timestamp
      ? formatTimestamp(item.timestamp)
      : "N/A",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "VITians Data");
  XLSX.writeFile(workbook, "VITians_Data.xlsx");
}

// Logout Function
function handleLogout() {
  signOut(auth)
    .then(() => {
      alert("You have been logged out.");
      window.location.href = "https://board.geospatialvit.site/";
    })
    .catch((error) => {
      console.error("Logout failed:", error.message);
    });
}

// Attach logout event listener
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

// Load data when the page loads
document.addEventListener("DOMContentLoaded", checkAuthorization);
