import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvg1AhjEd9vIiYWgqQlI5BO0jU3AF84t8",
    authDomain: "vitgis-ba14f.firebaseapp.com",
    projectId: "vitgis-ba14f",
    storageBucket: "vitgis-ba14f.storage.app",
    messagingSenderId: "759209581914",
    appId: "1:759209581914:web:3432c0511eba57eca66763"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userTable = document.getElementById("userTable");
const mapModal = document.getElementById("mapModal");
const closeModal = document.getElementById("closeModal");
let map;
let markerGroup;

// Track displayed rows by latitude and longitude as unique identifiers
const displayedUsers = new Set();

// Listen for real-time updates in Firestore
function listenToUsers() {
    const locationCollection = collection(db, "VITian_location");

    // Use Firestore's onSnapshot for real-time updates
    onSnapshot(locationCollection, async (snapshot) => {
        // Loop through each change in the snapshot
        snapshot.docs.forEach(async (locationDoc) => {
            const { latitude, longitude } = locationDoc.data();
            const userRef = doc(db, "VITians", locationDoc.id);
            const userDoc = await getDoc(userRef);

            const name = userDoc.exists() ? userDoc.data().name : "Unknown";

            // Check if the user (latitude, longitude) already exists in the table
            const uniqueKey = `${latitude},${longitude}`;

            if (!displayedUsers.has(uniqueKey)) {
                // Add new user to the table
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${name}</td>
                    <td>${latitude}</td>
                    <td>${longitude}</td>
                    <td><button data-lat="${latitude}" data-lng="${longitude}" class="view-map">View Map</button></td>
                `;
                userTable.appendChild(row);

                // Mark this user as displayed
                displayedUsers.add(uniqueKey);
            }
        });
    });
}

// Open map modal
function openMapModal(lat, lng) {
    // Ensure modal is visible
    mapModal.style.display = "block";

    // Initialize map if not already created
    if (!map) {
        map = L.map('map').setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        markerGroup = L.layerGroup().addTo(map);
    } else {
        map.setView([lat, lng], 13);
        map.invalidateSize(); // Redraw map to fit container
    }

    // Clear old markers and add a new one
    markerGroup.clearLayers();
    L.marker([lat, lng]).addTo(markerGroup);
}

// Event listeners
userTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-map")) {
        const lat = parseFloat(e.target.dataset.lat);
        const lng = parseFloat(e.target.dataset.lng);
        openMapModal(lat, lng);
    }
});

closeModal.addEventListener("click", () => {
    mapModal.style.display = "none";
});

// Start listening for updates
listenToUsers();
