import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs";

// Firebase configuration
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
const auth = getAuth(app);

// Reference to the club_enrollment collection
const enrollmentCollection = collection(db, "club_enrollement");

// Allowed emails
const allowedEmails = [
  "sahildinesh.zambre2023@vitstudent.ac.in",
  "ajitesh.sharma2023@vitstudent.ac.in",
  "raybanpranav.mahesh2023@vitstudent.ac.in",
  "rohit.lalbahadur2023@vitstudent.ac.in",
];

// Check if the user is allowed
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (allowedEmails.includes(user.email)) {
      // User is allowed, fetch and display data
      fetchData();
    } else {
      // User is not allowed, redirect to login page
      window.location.href = "https://board.geospatialvit.site/";
    }
  } else {
    // User is not logged in, redirect to login page
    window.location.href = "https://board.geospatialvit.site/";
  }
});

// Fetch and display data in real-time
function fetchData() {
  const q = query(enrollmentCollection, orderBy("name")); // Sort by 'name' alphabetically
  onSnapshot(q, (querySnapshot) => {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Clear previous data

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td data-label="Name">${data.name}</td>
        <td data-label="Registration No.">${data.regNumber}</td>
        <td data-label="Email">${data.email}</td>
        <td data-label="Phone">${data.phone}</td>
        <td data-label="Preference 1">${data.preference1}</td>
        <td data-label="Preference 2">${data.preference2}</td>
        <td data-label="Submitted At">${data.timestamp.toDate().toLocaleString()}</td>
        <td>
          <button class="edit-btn" data-id="${doc.id}">Edit</button>
          <button class="delete-btn" data-id="${doc.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Edit button functionality
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        openEditModal(id);
      });
    });

    // Delete button functionality
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        deleteRecord(id);
      });
    });
  });
}

// Edit Modal functionality
let editingDocId = null;
function openEditModal(id) {
  editingDocId = id;
  const docRef = doc(db, "club_enrollement", id);

  getDoc(docRef).then((docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      document.getElementById("editName").value = data.name;
      document.getElementById("editRegNumber").value = data.regNumber;
      document.getElementById("editEmail").value = data.email;
      document.getElementById("editPhone").value = data.phone;
      document.getElementById("editPreference1").value = data.preference1;
      document.getElementById("editPreference2").value = data.preference2;

      document.getElementById("editModal").style.display = "block";
    }
  });
}

// Update data on form submit
document.getElementById("editForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const updatedData = {
    name: document.getElementById("editName").value,
    regNumber: document.getElementById("editRegNumber").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value,
    preference1: document.getElementById("editPreference1").value,
    preference2: document.getElementById("editPreference2").value,
  };

  const docRef = doc(db, "club_enrollement", editingDocId);
  updateDoc(docRef, updatedData).then(() => {
    closeEditModal();
    alert("Data updated successfully");
  }).catch((error) => {
    console.error("Error updating document: ", error);
  });
});

// Close the edit modal
document.querySelector(".close-btn").addEventListener("click", closeEditModal);

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

// Delete data functionality
function deleteRecord(id) {
  const docRef = doc(db, "club_enrollement", id);
  deleteDoc(docRef).then(() => {
    alert("Record deleted successfully");
  }).catch((error) => {
    console.error("Error deleting document: ", error);
  });
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#tableBody tr");

  rows.forEach((row) => {
    const regNumber = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
    row.style.display = regNumber.includes(searchTerm) ? "" : "none";
  });
});

// Download Excel functionality
document.getElementById("downloadExcel").addEventListener("click", async () => {
  const q = query(enrollmentCollection, orderBy("name"));
  const querySnapshot = await getDocs(q);

  const data = [];
  querySnapshot.forEach((doc) => {
    const entry = doc.data();
    data.push({
      Name: entry.name,
      "Registration Number": entry.regNumber,
      Email: entry.email,
      Phone: entry.phone,
      "Preference 1": entry.preference1,
      "Preference 2": entry.preference2,
      "Submitted At": entry.timestamp.toDate().toLocaleString(),
    });
  });

  // Convert JSON data to Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment Data");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, "Enrollment_Data.xlsx");
});



