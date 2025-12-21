function getID(element) {
    return document.getElementById(element);
}

function getClass(element) {
    return document.getElementsByClassName(element);
}

function getQuery(element) {
    return document.querySelector(element);
}

function getQueryAll(element) {
    return document.querySelectorAll(element);
}


// TODO: HOMEPAGE
let SIDEBAR = getClass("SIDEBAR")[0];
let MENU_BUTTON = getClass("HEADER__MENU_BUTTON")[0];
let MENU_ICON = getClass("HEADER__MENU_ICON")[0];

MENU_BUTTON.addEventListener('click', function () {
    if (MENU_ICON.classList.contains("ACTIVE")) {
        MENU_ICON.classList.remove("ACTIVE");
        MENU_ICON.classList.toggle("NOT_ACTIVE");
    } else {
        MENU_ICON.classList.toggle("ACTIVE");
        MENU_ICON.classList.remove("NOT_ACTIVE");
    }
    SIDEBAR.classList.toggle("SIDEBAR_SHOW");
});

// let NOTI__BUTTON = document.querySelector("#notiButton");
// if (NOTI__BUTTON) {
//     NOTI__BUTTON.addEventListener("click", function () {
//         let popup = document.getElementById("notificationPopup");

//         if (popup.style.display === "none" || popup.style.display === "") {
//             popup.style.display = "block";
//         } else {
//             popup.style.display = "none";
//         }
//     });
// }

let = openNoti = false

document.getElementById("notiButton").addEventListener("click", function () {
    let notificationPopup = document.getElementById("notificationPopup");

    // Toggle visibility
    if (notificationPopup.style.display === "none" || notificationPopup.style.display === "") {
        notificationPopup.style.display = "block";

        // if there is unread message 
        if (document.querySelector(".NOTI__ITEM.UNREAD")) {
            // trigger to mark message read when close
            openNoti = true;
        }

    } else {
        notificationPopup.style.display = "none";

        if (openNoti) {
            markNotificationsAsRead();
            openNoti = false;
        }
    }
});

function markNotificationsAsRead() {
    fetch("1Notification.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
        .then(response => response.text())
        .then(data => {
            if (data === "success") {
                console.log("Notifications marked as read");
            } else {
                console.error("Failed to update notifications");
            }
        })
        .catch(error => console.error("Error:", error));
}

// create new team
let ToggleNewComms = document.querySelector(".NAV__TITLE__ADD");

if (ToggleNewComms) {
    ToggleNewComms.addEventListener('click', function () {
        let NEW__TEAM__SURVEY = document.querySelector(".NEW__TEAM__SURVEY");
        NEW__TEAM__SURVEY.classList.toggle("NEW__TEAM__SURVEY_SHOW");
    });
}

let CloseNewComms = document.querySelector(".close");

if (CloseNewComms) {
    CloseNewComms.addEventListener('click', function () {
        let NEW__TEAM__SURVEY = document.querySelector(".NEW__TEAM__SURVEY");
        NEW__TEAM__SURVEY.classList.remove("NEW__TEAM__SURVEY_SHOW");
    });
}


let INPUTSB = getQueryAll('.INPUT__BOX__SIDEBAR');

INPUTSB.forEach((element) => {
    let INPUT = element.querySelector(".INPUT__INPUT__SB");
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

document.getElementById("createCommunityForm").onsubmit = function (event) {
    event.preventDefault();
    let communityName = document.getElementById("newteam").value;
    fetch("RegisteredBackend.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "communityName=" + encodeURIComponent(communityName)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload(); 
            } else {
                document.getElementById("errorMsg").textContent = data.message;
            }
        });
};




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







// TODO: Goals noti

// Settings page
function changeTheme(theme) {
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme'); // Remove stored theme
    } else {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme); // Save theme in localStorage

    }
}

// Apply the saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
});


// search
function searchFunction() {
    let query = document.getElementById("searchInput").value;
    let resultDiv = document.getElementById("searchResults");

    if (query.length < 2) {
        resultDiv.style.display = "none";
        return;
    }

    fetch(`1Search.php?query=${query}`)
        .then(response => response.json())
        .then(data => {
            resultDiv.innerHTML = "";
            if (data.length === 0) {
                resultDiv.innerHTML = "<p class='SEARCH__NO_RESULT'>No results found</p>";
            } else {
                let resultList = "<ul>";
                data.forEach(item => {
                    if (item.type === "task") {
                        resultList += `<li onclick="redirectToTask(${item.id})"><span class="material-icons">task_alt</span> Task :  ${item.name}</li>`;
                    } else if (item.type === "page") {
                        resultList += `<li onclick="redirectToPage('${item.link}')"><span class="material-icons">tab</span> Page : ${item.name}</li>`;
                    } else if (item.type === "member") {
                        resultList += `<li onclick="redirectToDM('${item.id}','${item.name}')"><span class="material-icons">chat</span> User : ${item.name}</li>`;
                    } else if (item.type === "group_task") {
                        let assignmentText = item.assignment_type === "assigned_to_me"
                            ? `(Task assigned to you in ${item.name})`
                            : `(You assigned this task in ${item.name})`;

                        resultList += `<li onclick="redirectToTeam('${item.id}','${item.name}')">
                                        <span class="material-icons">groups</span>
                                        <div class='RESULT__GROUP_TASK'>
                                            <div>Task: ${item.taskName}</div>
                                            <small>${assignmentText}</small>
                                        </div>
                                      </li>`;
                    }
                    else if (item.type === "goal") {
                        resultList += `<li onclick="redirectToGoal()"><span class="material-icons">track_changes</span> Goal : ${item.name}</li>`;
                    }
                });
                resultList += "</ul>";
                resultDiv.innerHTML = resultList;
            }
            resultDiv.style.display = "block";
        });
}

function redirectToTask(taskId) {
    window.location.href = `Todo.php?task_id=${taskId}`;
}

function redirectToPage(pageLink) {
    window.location.href = pageLink;
}

function redirectToDM(memberId, memberName) {
    window.location.href = `CommunityDMPage.php?receiver_id=${memberId}&name=${memberName}`;
}

function redirectToGoal() {
    window.location.href = `Goal.php`;
}

function redirectToTeam(teamID, teamName) {
    window.location.href = `CommunityPage.php?team_id=${teamID}&team=${teamName}`;
}





