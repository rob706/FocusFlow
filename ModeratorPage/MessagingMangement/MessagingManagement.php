<?php 

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/ModeratorPage/checklogin.php"; ?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../Mod.css">
    <link rel="shortcut icon" href="../img/icons8-staff-32.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <title>Messages Management</title>
</head>

<body>
    <?php include "../ModSidebar.php"; ?>

    <main class="DASH__MAIN">
        <div class="WIDGET__CONTAINER four">
            <div class="WIDGET msg_one flex-col">
                <div class="flex-row" style="justify-content: space-between;">
                    <h3>User List</h3>
                </div>

                <div class="USER__LIST">
                    <?php
                    $sql = "SELECT id, name, email FROM users";
                    $result = $_conn->query($sql);

                    if ($result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            echo "<div class='USER__LI' data-user-id='" . $row['id'] . "' onclick='showReceiverDropdown(" . $row['id'] . ")'>";
                            echo "<h4>" . htmlspecialchars($row['name']) . "</h4>";
                            echo "<p>Email: " . htmlspecialchars($row['email']) . "</p>";
                            echo "</div>";
                        }
                    } else {
                        echo "<p>No users found.</p>";
                    }
                    ?>
                </div>

                <!-- receiver dropdown -->
                <div id="receiverPopup" class="popup-container">
                    <div class="popup-content">
                        <h3>Select a Receiver</h3>
                        <ul id="receiverList"></ul>
                        <button onclick="closePopup()">Cancel</button>
                    </div>
                </div>


            </div>
            <div class="WIDGET msg_two">
                <h3>Conversation</h3>
                <div class="CONVO">
                    <p class="CONVO_FROM"></p>
                    <p class="CONVO_TO"></p>

                </div>
                <div class="CHAT__CONTAINER">
                    <div id="chatBox"></div>
                </div>
            </div>
        </div>
    </main>

    <footer></footer>
</body>
<script src="../Mod.js"></script>
<script src="../MessagingMangement/Message.js"></script>

</html>