console.log("TEST 1: Checking if start time is later than end time");

// Simulate invalid date values
document.getElementById("start_time").value = "2025-04-05T15:00";
document.getElementById("end_time").value = "2025-04-04T10:00";

// Manually trigger the validation logic
let startTime = document.getElementById("start_time").value;
let endTime = document.getElementById("end_time").value;

if (startTime >= endTime) {
    console.error("Start time is later than end time. Validation failed.");
} else {
    console.log("Start time is before end time.");
}


function togglePopup() {
    let popup = document.querySelector(".GOAL__INPUT");
    let button = document.querySelector(".GOAL__SET");

    // Check if the popup is currently displayed
    if (popup.style.display === "block") {
        button.innerHTML = "Show";
        popup.style.display = "none"; // Hide the popup
    } else {
        popup.style.display = "block"; // Show the popup
        button.innerHTML = "Close";
    }
}

// set min date for starting and ending date
document.addEventListener("DOMContentLoaded", function () {
    let today = new Date().toISOString().split("T")[0];
    document.getElementById("start_time").setAttribute("min", today);
    document.getElementById("end_time").setAttribute("min", today);

    let reminderInput = document.getElementById("reminder_time");

    function setMinDateTime() {
        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for time zone

        let minDateTime = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:MM
        reminderInput.min = minDateTime;
    }

    setMinDateTime(); // Set initial min datetime



    let INPUTS = document.querySelectorAll('.INPUT__BOX');
    let StartTime = null;
    let EndTime = null;


    INPUTS.forEach((element) => {
        let INPUT = element.querySelector(".INPUT__INPUT");
        let PLACEHOLDER = element.querySelector(".INPUT__PLACEHOLDER");

        if (INPUT != null) {
            INPUT.addEventListener('input', function () {
                // If the input is invalid, add the INVALID class
                if (INPUT.value.trim() == '') {
                    InvalidInput(INPUT, PLACEHOLDER);
                } else if (!INPUT.checkValidity()) {
                    InvalidInput(INPUT, PLACEHOLDER);
                } else {
                    // If the input is valid, remove the INVALID class
                    ValidInput(INPUT, PLACEHOLDER);
                }

                let inputElement = element.querySelector(".INPUT__INPUT");
                let inputValue = inputElement.value;


                if (inputElement.id == "start_time" && inputValue) {
                    // Assign null if no value is entered
                    StartTime = inputValue || null;
                } else if (inputElement.id == "end_time" && inputValue) {
                    EndTime = inputValue || null;
                }

                if ((StartTime >= EndTime) && StartTime && EndTime) {
                    InvalidInput(getQuery("#end_time"), getQuery("#end_time_ph"));
                    InvalidInput(getQuery("#start_time"), getQuery("#start_time_ph"));
                } else {
                    if (StartTime) {
                        ValidInput(getQuery("#start_time"), getQuery("#start_time_ph"));
                    }
                    if (EndTime) {
                        ValidInput(getQuery("#end_time"), getQuery("#end_time_ph"));
                    }
                }

                if (inputElement.id == "reminder_time") {
                    if (reminderInput.value < reminderInput.min) {
                        reminderInput.value = "";
                        InvalidInput(getQuery("#reminder_time"), getQuery("#end_time_ph"));
                    } else {
                        ValidInput(getQuery("#reminder_time"), getQuery("#end_time_ph"));
                    }
                }
            });
        }
    });



    let form = document.getElementsByClassName("GOAL__FORM")[0];

    form.addEventListener("submit", function (event) {
        console.log("Form submission triggered");

        let startTime = document.getElementById("start_time").value;
        let endTime = document.getElementById("end_time").value;


        if ((startTime >= endTime) && startTime && endTime) {
            console.log("Validation failed: End Time must be later than Start Time.");
            alert("End Time must be later than Start Time.");
            event.preventDefault();
            return;
        }

    });

    function ValidInput(INPUT, PLACEHOLDER) {
        INPUT.classList.remove("INVALID_BORDER");
        PLACEHOLDER.classList.remove("INVALID_PLACEHOLDER");
        INPUT.classList.add("VALID_BORDER");
        PLACEHOLDER.classList.add("VALID_PLACEHOLDER");
    }

    function InvalidInput(INPUT, PLACEHOLDER) {
        INPUT.classList.add("INVALID_BORDER");
        PLACEHOLDER.classList.add("INVALID_PLACEHOLDER");
        INPUT.classList.remove("VALID_BORDER");
        PLACEHOLDER.classList.remove("VALID_PLACEHOLDER");
    }

    // check for overdue goal

    function updateOverdueTasks() {
        fetch("./Goal/GoalBackend.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "action=Update"
        })
            .then(response => response.text())
            .then(data => console.log("Overdue tasks check:", data))
            .catch(error => console.error("Error updating tasks:", error));
    }

    updateOverdueTasks();

    setInterval(updateOverdueTasks, 300000);
});

setInterval(() => {
    fetch("GoalBackend.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, // Correct content type
        body: "action=Reminder" 
    })
    .then(response => response.text()) 
    .then(text => {
        console.log("Raw response:", text); 
        return JSON.parse(text); 
    })
    .then(data => console.log("Reminder check:", data))
    .catch(error => console.error("Error parsing JSON:", error));
}, 10000);