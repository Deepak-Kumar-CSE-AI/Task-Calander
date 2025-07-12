import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 🔧 Your Firebase config here:
const firebaseConfig = {
    apiKey: "AIzaSyCjcqged6XMaJ1bC-ciGtfyDCOEkipNFKM",
    authDomain: "calendarapp-79920.firebaseapp.com",
    projectId: "calendarapp-79920",
    storageBucket: "calendarapp-79920.firebasestorage.app",
    messagingSenderId: "390900204268",
    appId: "1:390900204268:web:195b420e9df759093cdbc9"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let selectedCellDate = null;
let taskData = {};

document.getElementById("closeModal").onclick = function () {
  document.getElementById("taskModal").style.display = "none";
};

async function loadAllTasks() {
  const snapshot = await get(child(ref(db), "tasks"));
  return snapshot.exists() ? snapshot.val() : {};
}

export async function generateCalendar() {
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  if (isNaN(from) || isNaN(to) || from > to) {
    alert("Please select a valid date range in the same month.");
    return;
  }

  if (from.getMonth() !== to.getMonth()) {
    alert("From and To dates must be in the same month.");
    return;
  }

  taskData = await loadAllTasks();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    const div = document.createElement("div");
    div.className = "weekday";
    div.textContent = day;
    calendar.appendChild(div);
  });

  const month = from.getMonth();
  const year = from.getFullYear();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= totalDays; d++) {
    const fullDate = new Date(year, month, d);
    const dateStr = fullDate.toLocaleDateString("en-CA");

    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = d;

    if (fullDate.toDateString()===from.toDateString()||(fullDate >= from && fullDate <= to)) {
      cell.classList.add("highlight");
    }

    if (taskData[dateStr]) {
      const task = document.createElement("div");
      task.className = "task";
      task.textContent = taskData[dateStr].task;
      cell.appendChild(task);
    }

    cell.onclick = () => openTaskModal(dateStr);
    calendar.appendChild(cell);
  }
}

function openTaskModal(dateStr) {
  selectedCellDate = dateStr;
  document.getElementById("selectedDate").textContent = dateStr;
  document.getElementById("taskInput").value =
    taskData[dateStr]?.task || "";
  document.getElementById("taskModal").style.display = "block";
}

window.saveTask = async function () {
  const taskText = document.getElementById("taskInput").value.trim();
  if (!taskText) {
    alert("Please enter a task.");
    return;
  }

  await set(ref(db, "tasks/" + selectedCellDate), {
    task: taskText
  });

  document.getElementById("taskModal").style.display = "none";
  generateCalendar();
};

window.generateCalendar = generateCalendar;
