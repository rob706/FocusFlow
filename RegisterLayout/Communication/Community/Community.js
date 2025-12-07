// Community Pop up
function openPopup() {
    const teamID = new URLSearchParams(window.location.search).get("team_id");
    const teamName = new URLSearchParams(window.location.search).get("team");

    // Open the upload page with team_id passed in URL
    document.getElementById("popupIframe").src = "./Communication/Community/CommunityPageUpload?team_id=" + encodeURIComponent(teamID) + "&team=" + encodeURIComponent(teamName);
    document.getElementById("popupOverlay").style.opacity = "1";
    document.getElementById("popupOverlay").style.zIndex = "1000";
}

function closePopup() {
    document.getElementById("popupOverlay").style.opacity = "0";
    document.getElementById("popupOverlay").style.zIndex = "-1";
}

function openPopup1() {

    const teamID = new URLSearchParams(window.location.search).get("team_id");
    const teamName = new URLSearchParams(window.location.search).get("team");

    // Open the upload page with team_id passed in URL
    document.getElementById("popupIframe").src = "./Communication/Community/CommunityPageView?team_id=" + encodeURIComponent(teamID) + "&team=" + encodeURIComponent(teamName);
    document.getElementById("popupOverlay").style.opacity = "1";
    document.getElementById("popupOverlay").style.zIndex = "1000";
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}



function checkMemberExists(memberName, callback) {
    fetch("./Communication/Community/CommunityBackend.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `action=CheckMember&member_name=${encodeURIComponent(memberName)}`
    })
        .then(response => response.json())
        .then(data => callback(data.exists))
        .catch(error => console.error("Error:", error));
}

function addMember() {
    let memberName = prompt("Enter member name:");
    let teamName = getQueryParam("team");

    if (!memberName) {
        alert("Member name is required!");
        return;
    }

    checkMemberExists(memberName, function (exists) {
        if (!exists) {
            alert("Member does not exist!");
            return;
        }

        // Proceed with adding the member
        fetch("./Communication/Community/CommunityBackend.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=AddMember&team_name=${encodeURIComponent(teamName)}&member_name=${memberName}`
        })
            .then(response => response.text())
            .then(data => {
                alert(data);
                location.reload();
            })
            .catch(error => console.error("Error:", error));
    });
}


function removeMember() {
    let memberName = prompt("Enter member name:");
    let teamName = getQueryParam("team");

    if (teamName && memberName) {
        fetch("./Communication/Community/CommunityBackend.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=RemoveMember&team_name=${teamName}&member_name=${memberName}`
        })
            .then(response => response.text())
            .then(data => {
                alert(data);
                location.reload();
            })
            .catch(error => console.error("Error:", error));
    }
}


// edit status for group task
function toggleDropdown(button) {
    let dropdown = button.nextElementSibling;
    dropdown.classList.toggle('show');
}

function updateStatus(taskID, newStatus) {
    fetch('./Communication/Community/CommunityBackend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=UpdateTask&task_id=${taskID}&status=${newStatus}`
    })
        .then(response => response.text())
        .then(data => {
            if (data === 'success') {
                location.reload();
            } else {
                alert('Failed to update status');
            }
        });
}


// add task pop up
document.getElementById("openTaskForm").addEventListener("click", function () {
    document.getElementById("taskPopUp").classList.toggle("ADD_TASK__SURVEY_SHOW");
});

document.getElementsByClassName("CONTROLS__CLOSE")[0].addEventListener("click", function () {
    document.getElementById("taskPopUp").classList.remove("ADD_TASK__SURVEY_SHOW");
});

document.getElementsByClassName("CONTROLS__CLOSE")[0].addEventListener("click", function () {
    document.getElementById("taskPopUp").classList.remove("ADD_TASK__SURVEY_SHOW");
});

// Pop up survey validation
let INPUTS = getQueryAll('.INPUT__BOX');


INPUTS.forEach((element) => {
    // set min date to today
    document.getElementById("due_date").min = new Date().toISOString().split("T")[0];

    let INPUT = element.querySelector(".INPUT__INPUT");
    let PLACEHOLDER = element.querySelector(".INPUT__PLACEHOLDER");

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

    });
});

document.getElementsByClassName("CONTROLS__RESET")[0].addEventListener("click", ResetInput);
function ResetInput() {
    let INPUTS = getQueryAll('.INPUT__BOX');

    INPUTS.forEach((element) => {
        let INPUT = element.querySelector(".INPUT__INPUT");
        let PLACEHOLDER = element.querySelector(".INPUT__PLACEHOLDER");
        INPUT.classList.remove("INVALID_BORDER");
        PLACEHOLDER.classList.remove("INVALID_PLACEHOLDER");
        INPUT.classList.remove("VALID_BORDER");
        PLACEHOLDER.classList.remove("VALID_PLACEHOLDER");
    });
}


let form = document.getElementById("taskPopUpForm");

form.addEventListener("submit", function (event) {

    let Today = new Date().toISOString().split("T")[0];
    let Duedate = document.getElementById("due_date").value;


    if (Duedate <= Today) {
        alert("Duedate must be set in the future (no more than 1/1/2040)");
        event.preventDefault();
        return;
    }

});

function ValidInput(INPUT, PLACEHOLDER) {
    INPUT.classList.remove("INVALID_BORDER");
    INPUT.classList.add("VALID_BORDER");
    if (PLACEHOLDER != "") {
        PLACEHOLDER.classList.remove("INVALID_PLACEHOLDER");
        PLACEHOLDER.classList.add("VALID_PLACEHOLDER");
    }
}

function InvalidInput(INPUT, PLACEHOLDER) {
    INPUT.classList.add("INVALID_BORDER");
    INPUT.classList.remove("VALID_BORDER");
    if (PLACEHOLDER != "") {
        PLACEHOLDER.classList.add("INVALID_PLACEHOLDER");
        PLACEHOLDER.classList.remove("VALID_PLACEHOLDER");
    }
}


// populate combo box for select member/ leader
let teamName = getQueryParam("team");
fetch(`./Communication/Community/CommunityFetchTeamMembers.php?team=${encodeURIComponent(teamName)}`) // Fetch members from PHP
    .then(response => response.json())
    .then(data => {
        let dropdown = document.getElementById("assigned_to");
        data.forEach(member => {
            let option = document.createElement("option");
            option.value = member.id; // Assuming 'id' is the unique identifier
            option.textContent = member.name; // Assuming 'name' is the member's name
            dropdown.appendChild(option);
        });
    })
    .catch(error => console.error("Error fetching team members:", error));



// add data into database (use AJAX)
document.getElementById("taskPopUpForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    let formData = new FormData(this);

    fetch(`./Communication/Community/CommunityBackend.php?team=${encodeURIComponent(teamName)}`, {
        method: "POST",
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Task added successfully!");
                location.reload(); // Reload page to update task list
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => console.error("Error:", error));
});



// remove task 
const removeTaskBtn = document.getElementById("removeTaskBtn");
const taskList = document.getElementById("taskList");

let isRemoving = false;

// Click "Remove Task" to highlight tasks
if (removeTaskBtn) {
    removeTaskBtn.addEventListener("click", function () {
        isRemoving = !isRemoving;
        document.querySelectorAll(".REMOVE__OVERLAY").forEach(overlay => {
            if (isRemoving) {
                overlay.classList.add("REMOVE__OVERLAY__SHOW");
                overlay.classList.remove("REMOVE__OVERLAY__HIDE");
            } else {
                overlay.classList.add("REMOVE__OVERLAY__HIDE");
                overlay.classList.remove("REMOVE__OVERLAY__SHOW");
            }
            console.log("Overlay classList:", overlay.classList, "Remove Mode:", isRemoving);
        });
    });

}

// Click a task to delete it
if (taskList) {
    taskList.addEventListener("click", function (event) {
        const taskElement = event.target.closest(".TASK_ITEM");
        if (isRemoving && taskElement) {

            const taskId = taskElement.dataset.taskId;


            fetch("./Communication/Community/CommunityBackend.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `action=DeleteTask&task_id=${taskId}`
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        taskElement.remove();
                    } else {
                        alert("Error: " + data.message);
                    }
                })
                .catch(error => console.error("Error:", error));
        }
    });
}

// delete team
const deleteButton = document.getElementById("deleteTeam");

if (deleteButton) {
    deleteButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior
        if (deleteButton) {
            deleteButton.addEventListener("click", function (event) {
                event.preventDefault(); // Prevent default link behavior

                // Show confirmation popup
                let confirmDelete = confirm("Are you sure you want to delete this team? This action cannot be undone.");

                if (confirmDelete) {
                    // Get team name & ID from the URL
                    const urlParams = new URLSearchParams(window.location.search);
                    const teamName = urlParams.get("team");

                    if (teamName) {
                        // Send delete request to PHP
                        fetch("./Communication/Community/CommunityBackend.php", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: `action=DeleteTeam&team=${encodeURIComponent(teamName)}`
                        })
                            .then(response => response.text())
                            .then(data => {
                                alert(data); // Show response from server
                                window.location.href = "Homepage.php"; // Redirect to homepage after deletion
                            })
                    } else {
                        alert("Error: Team name not found!");
                    }
                }
            });
        }



        // responsive

        document.querySelector(".RESPONSIVE__MEMBER_BUTTON").addEventListener("click", function () {
            let MemberList = document.querySelector(".COMMUNITY1__MEMBER");
            let MemberListIcon = document.querySelector(".RESPONSIVE__SHOW_ICON");

            MemberList.classList.toggle("SHOW__MEMBER");
            if (MemberList.classList.contains("SHOW__MEMBER")) {
                MemberListIcon.innerHTML = "keyboard_double_arrow_right";
            } else {
                MemberListIcon.innerHTML = "keyboard_double_arrow_left";
            }
        });
    });
}
