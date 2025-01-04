import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, getDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyCvg1AhjEd9vIiYWgqQlI5BO0jU3AF84t8",
  authDomain: "vitgis-ba14f.firebaseapp.com",
  projectId: "vitgis-ba14f",
  storageBucket: "vitgis-ba14f.firebaseapp.com",
  messagingSenderId: "759209581914",
  appId: "1:759209581914:web:3432c0511eba57eca66763",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const noticesCollection = collection(db, "VITian Notice");

// Allowed email IDs
const allowedEmails = [
   "sahildinesh.zambre2023@vitstudent.ac.in",
  "ajitesh.sharma2023@vitstudent.ac.in",
  "raybanpranav.mahesh2023@vitstudent.ac.in",
  "rohit.lalbahadur2023@vitstudent.ac.in"
];

let currentUserName = "";
let currentNoticeId = null; // Track if we are editing a notice

// Fetch current user and display their name
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userEmail = user.email;

        // Check if the user's email is in the allowed list
        if (!allowedEmails.includes(userEmail)) {
            alert("You do not have access to this page.");
            window.location = 'https://board.geospatialvit.site/'; // Redirect to login if not authorized
            return;
        }

        // Fetch the user's name from Firestore using their UID
        const userDocRef = doc(db, "VITians", user.uid); // Assuming the document ID in VITians is the UID
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            currentUserName = userData.name || user.email.split('@')[0]; // Fallback to email if name is not found
        } else {
            currentUserName = user.email.split('@')[0];
        }

        // Display the current user's name in the 'currentUserName' element
        const nameElement = document.getElementById("currentUserName");
        if (nameElement) {
            nameElement.textContent = currentUserName;
        }

    } else {
        alert("You are not logged in. Please log in to access this page.");
        window.location = 'https://board.geospatialvit.site/'; // Redirect to login if not authenticated
        return;
    }

    const nameElement = document.getElementById("name");
    if (nameElement) {
        nameElement.textContent = currentUserName;
    }
});

// Function to add a new notice or update an existing one
async function saveNotice(title, content) {
    if (currentNoticeId) {
        // Update existing notice
        try {
            const noticeDocRef = doc(db, "VITian Notice", currentNoticeId);
            await updateDoc(noticeDocRef, {
                title,
                content
            });
            currentNoticeId = null; // Reset after editing
            document.getElementById("noticeSubmitBtn").textContent = "Post Notice"; // Change button back
        } catch (error) {
            console.error("Error updating notice: ", error);
        }
    } else {
        // Add new notice
        try {
            await addDoc(noticesCollection, {
                title,
                content,
                createdAt: serverTimestamp(),
                postedBy: currentUserName
            });
        } catch (error) {
            console.error("Error adding notice: ", error);
        }
    }
    loadNotices();
}

// Function to load notices
async function loadNotices() {
    const noticesContainer = document.getElementById("noticesContainer");
    noticesContainer.innerHTML = "";
    showLoading(); // Show spinner before loading notices

    const querySnapshot = await getDocs(noticesCollection);
    querySnapshot.forEach((doc) => {
        const notice = doc.data();
        const noticeItem = document.createElement("div");
        noticeItem.classList.add("notice-item");

        const createdAt = notice.createdAt ? notice.createdAt.toDate().toLocaleString() : "No date available";

        noticeItem.innerHTML = `
            <h3>${notice.title}</h3>
            <div class="meta">Posted by: ${notice.postedBy || "Unknown"} | Date: ${createdAt}</div>
            <p>${notice.content}</p>
            <div class="actions">
                <button onclick="editNotice('${doc.id}')">Edit</button>
                <button onclick="deleteNotice('${doc.id}')">Delete</button>
            </div>
        `;
        noticesContainer.appendChild(noticeItem);
    });

    hideLoading(); // Hide spinner after loading notices
}

// Function to edit a notice
window.editNotice = async function (id) {
    const docRef = doc(db, "VITian Notice", id);
    const noticeDoc = await getDoc(docRef);
    if (noticeDoc.exists()) {
        const notice = noticeDoc.data();
        document.getElementById("noticeTitle").value = notice.title;
        document.getElementById("noticeContent").value = notice.content;

        // Track the notice being edited
        currentNoticeId = id;
        document.getElementById("noticeSubmitBtn").textContent = "Update Notice"; // Change button text to indicate edit mode
    }
}

// Function to delete a notice
window.deleteNotice = async function (id) {
    try {
        await deleteDoc(doc(db, "VITian Notice", id));
        loadNotices();
    } catch (error) {
        console.error("Error deleting notice: ", error);
    }
};

// Loading Spinner functions
function showLoading() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'flex'; // Show spinner
}

function hideLoading() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'none'; // Hide spinner
}

// Form submit event listener
document.getElementById("noticeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("noticeTitle").value;
    const content = document.getElementById("noticeContent").value;
    await saveNotice(title, content);
    document.getElementById("noticeForm").reset();
});

// Load notices on page load
window.onload = loadNotices;
