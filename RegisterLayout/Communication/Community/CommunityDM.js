let chatform = document.getElementById("chatForm");
if (chatform) {
    chatform.addEventListener("submit", sendMSG);
}

function sendMSG(event) {
    event.preventDefault(); // Prevent form submission refresh

    let messageInput = document.getElementById("message1");
    let messageText = messageInput.value.trim();
    let receiverID = document.querySelector("input[name='receiver_id']").value;

    if (messageText === "") return; // Prevent empty messages

    // Create form data
    let formData = new FormData();
    formData.append("message", messageText);
    formData.append("receiver_id", receiverID);


    // Send the data using Fetch API
    fetch("./Communication/Community/CommunityDMPageSendMsg.php", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                let conversationSection = document.querySelector(".DMPAGE__CONVERSATION");

                let newMessage = document.createElement("div");
                newMessage.classList.add("CONVERSATION", "SENT");
                newMessage.textContent = messageText;

                conversationSection.appendChild(newMessage);
                conversationSection.scrollTop = conversationSection.scrollHeight; // Auto-scroll

                messageInput.value = ""; // Clear input field
            } else {
                alert("Error: " + data.message); // Show error message
            }
        })
        .catch(error => console.error("Error:", error));
}

let EnterMessage = document.querySelector(".ENTER__MESSAGE");
if (EnterMessage) {
    EnterMessage.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMSG(event);
        }
    });
}

// for toggle member list sidebar

document.getElementById("toggleDMList").addEventListener("click", function () {
    document.querySelector(".DMLIST__SIDEBAR").classList.add("show");
});

document.querySelector(".SIDEBAR__CLOSE").addEventListener('click', function () {
    document.querySelector(".DMLIST__SIDEBAR").classList.remove("show");
});