let date = new Date();
let selectedDay = null;
let events = JSON.parse(localStorage.getItem("events")) || [];


function getCurrentDayIndex() {
    const now = new Date();
    const local = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return local.getDay();
}

function renderCalendar() {
    const month = date.getMonth();
    const year = date.getFullYear();
    document.getElementById("monthYear").innerText =
        date.toLocaleString("default", { month: "long" }) + " " + year;

    const calendar = document.getElementById("calendarDays");
    calendar.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isTodayMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let i = 0; i < firstDay; i++) calendar.innerHTML += `<div></div>`;

    for (let d = 1; d <= totalDays; d++) {
        let isToday = isTodayMonth && today.getDate() === d;
        let cell = document.createElement("div");
        cell.className = isToday ? "today" : "";
        cell.innerHTML = `<strong>${d}</strong>`;
        cell.onclick = () => openPopup(d);

        // load events
        // load events
    events
        .filter(e => e.day === d && e.month === month && e.year === year)
        .forEach((e, index) => {
        let tag = document.createElement("div");
        tag.className = "event";

        tag.innerHTML = `
            ${e.title} @ ${e.time}
            <span class="deleteEvent" onclick="deleteEvent(${index})">🗑</span>
        `;

        cell.appendChild(tag);
    });


        calendar.appendChild(cell);
    }
}

function deleteEvent(index) {
    if (confirm("Delete this event?")) {
        events.splice(index, 1);
        localStorage.setItem("events", JSON.stringify(events));
        renderCalendar();
    }
}


document.getElementById("prevMonth").onclick = () => {
    date.setMonth(date.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    date.setMonth(date.getMonth() + 1);
    renderCalendar();
};

function openPopup(day) {
    selectedDay = day;
    document.getElementById("eventPopup").classList.remove("hidden");
}

document.getElementById("closePopup").onclick = () => {
    document.getElementById("eventPopup").classList.add("hidden");
};

document.getElementById("saveEvent").onclick = () => {
    let title = document.getElementById("eventTitle").value;
    let time = document.getElementById("eventTime").value;
    let repeat = document.getElementById("eventRepeat").value;
    let notifyBefore = parseInt(document.getElementById("eventNotify").value);

    const m = date.getMonth();
    const y = date.getFullYear();

    events.push({ title, time, repeat, notifyBefore, day: selectedDay, month: m, year: y });
    localStorage.setItem("events", JSON.stringify(events));

    setNotification(events[events.length - 1]);
    renderCalendar();
    document.getElementById("eventPopup").classList.add("hidden");
};

// HANDLES NOTIFICATIONS
function setNotification(event) {
    function schedule() {
        let [hour, minute] = event.time.split(":").map(Number);
        let now = new Date();
        let eventTime = new Date(event.year, event.month, event.day, hour, minute);

        // subtract notify-before time
        eventTime.setMinutes(eventTime.getMinutes() - event.notifyBefore);

        let diff = eventTime - now;

        if (diff >= 0) {
            setTimeout(() => {
                let [h, m] = event.time.split(":");
                h = Number(h);

                let ampm = h >= 12 ? "PM" : "AM";
                let hour12 = h % 12;
                if (hour12 === 0) hour12 = 12;

                let formattedTime = hour12 + ":" + m + " " + ampm;

            alert(
                "Reminder: " +
                event.title +
                " at " + formattedTime +
                " (Notifying " + beforeText + ")"
            );  
            }, diff);
        }
    }

    // daily repeating events
    if (event.repeat === "daily") {
        setInterval(schedule, 86400000); // 24 hours
    }

    schedule();
}


events.forEach(e => setNotification(e));

renderCalendar();
