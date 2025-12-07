document.addEventListener("DOMContentLoaded", function () {
    fetchSuggestedTasks();
});

function fetchSuggestedTasks() {
    fetch("AnalyticBackend.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "action=fetch"
    })
        .then(response => response.json())
        .then(tasks => {
            let taskContainer = document.querySelectorAll(".stat-card")[2];
            taskContainer.innerHTML = "<h3>Tasks History</h3>";

            tasks.forEach(task => {
                let taskItem = document.createElement("div");
                taskItem.classList.add("task-item");
                taskItem.innerHTML = `
                <p>${task.task_title}</p>
                <button class="add-task" data-task="${task.task_title}">Add</button>
            `;
                taskContainer.appendChild(taskItem);
            });

            document.querySelectorAll(".add-task").forEach(button => {
                button.addEventListener("click", function () {
                    console.log(button)
                    
                    document.querySelector('.deadline-container').classList.add("show");

                    // Validate duedate
                    const addButton = document.querySelector(".deadline-button");
                    const customAlert = document.getElementById("customAlert");
                    const alertMessage = document.getElementById("alertMessage");
                    const closeAlert = document.getElementById("closeAlert");
                
                    addButton.addEventListener("click", function () {
                        let daysInput = document.getElementById("timerDays");
                        let hoursInput = document.getElementById("timerHours");
                        let minutesInput = document.getElementById("timerMinutes");
                
                        let days = daysInput.value.trim();
                        let hours = hoursInput.value.trim();
                        let minutes = minutesInput.value.trim();
                
                        days = parseInt(days, 10);
                        hours = parseInt(hours, 10);
                        minutes = parseInt(minutes, 10);
                
                        if (isNaN(days) || isNaN(hours) || isNaN(minutes)) {
                            showAlert("Please fill in all fields with valid numbers.");
                            daysInput.value = "0";
                            hoursInput.value = "0";
                            minutesInput.value = "0";
                            return;
                        }
                
                        if (days < 0 || days > 30) {
                            showAlert("Days must be between 0 and 30.");
                            daysInput.value = "0";
                            hoursInput.value = "0";
                            minutesInput.value = "0";
                            return;
                        }
                
                        if (hours < 0 || hours > 23) {
                            showAlert("Hours must be between 0 and 23.");
                            daysInput.value = "0";
                            hoursInput.value = "0";
                            minutesInput.value = "0";
                            return;
                        }
                
                        if (minutes < 0 || minutes > 59) {
                            showAlert("Minutes must be between 0 and 59.");
                            daysInput.value = "0";
                            hoursInput.value = "0";
                            minutesInput.value = "0";
                            return;
                        }
                
                        if (days == 0 && hours == 0 && minutes == 0) {
                            showAlert("Please set a due date");
                            daysInput.value = "0";
                            hoursInput.value = "0";
                            minutesInput.value = "0";
                            return;
                        }
                
                        let now = new Date();
                        let startDate = now.toISOString().split("T")[0];
                        let startTime = now.toTimeString().split(" ")[0];
                
                        // Calculate end date
                        let endDate = new Date(now);
                        endDate.setDate(endDate.getDate() + days);
                        endDate.setHours(endDate.getHours() + hours);
                        endDate.setMinutes(endDate.getMinutes() + minutes);
                
                        let endDateFormatted = endDate.toISOString().split("T")[0];
                        let endTimeFormatted = endDate.toTimeString().split(" ")[0];
                

                        let taskTitle = button.getAttribute("data-task");
                
                
                        fetch("./AnalyticBackend.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: `action=add&task_title=${encodeURIComponent(taskTitle)}&start_date=${startDate}&start_time=${startTime}&end_date=${endDateFormatted}&end_time=${endTimeFormatted}`
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    showAlert("Task added successfully!");
                                } else {
                                    showAlert("Error adding task: " + data.error);
                                }
                            })
                            .catch(error => console.error("Error:", error));
                
                        daysInput.value = "0";
                        hoursInput.value = "0";
                        minutesInput.value = "0";
                    });
                
                    function showAlert(message) {
                        alertMessage.innerText = message;
                        customAlert.classList.add("show");
                    }
                
                    closeAlert.addEventListener("click", function () {
                        customAlert.classList.remove("show");
                    });
                
                
                    let Close_Deadline = document.querySelector(".deadline__close");
                
                
                    // close deadline
                    Close_Deadline.addEventListener('click', function () {
                        document.querySelector('.deadline-container').classList.remove("show");
                    })
                });


            });
        })
        .catch(error => console.error("Error fetching suggested tasks:", error));
}






