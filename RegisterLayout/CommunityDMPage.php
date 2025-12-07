<?php

session_start();

@include_once("../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/AccountVerify.php";
requireAuthentication($_conn);

$result = $_conn->query("SELECT * FROM message ORDER BY sent_at ASC");

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}


echo "<script>";
echo "var MessageList = " . json_encode($messages) . ";";
echo "</script>";

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Direct Message</title>

    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="icon" href="img\SMALL_CLOCK_ICON.ico">
    <link rel="stylesheet" href="Registered.css">
    <link rel="stylesheet" href="Responsive.css">
</head>

<body>
    <?php
    include "header.php";
    ?>
    <main style="overflow-y: auto;">
        <!-- temp SIDEBAR_SHOW -->
        <?php
        include "sidebar.php";
        ?>
        <div class="DM__MAIN">

            <div class="DMLIST__SIDEBAR">
                <?php

                // display recently text
                // display all person who have a convo b4
                $sql2 = "SELECT users.id, users.name, MAX(message.sent_at) as last_message_time
        FROM message 
        JOIN users ON (message.receiver_id = users.id OR message.sender_id = users.id) 
        WHERE message.sender_id = " . $_COOKIE['UID'] . " OR message.receiver_id = " . $_COOKIE['UID'] . " 
        GROUP BY users.id, users.name 
        ORDER BY last_message_time DESC";


                $result2 = $_conn->query($sql2);
                ?>

                <div>
                    <button class="SIDEBAR__CLOSE CLICKABLE">
                        <span class="material-icons">
                            close
                        </span>
                    </button>
                    <h3 style="text-align: center;">Direct Messages</h3>

                    <ul class="DM__LIST__UL">
                        <?php
                        if ($result2->num_rows > 0) {
                            while ($row = $result2->fetch_assoc()) {
                                if ($row['id'] == $_COOKIE['UID']) {
                                    echo "<li class='DM__LIST__PERSON'><span class='material-icons'>perm_identity</span><a href='CommunityDMPage.php?receiver_id=" . $row['id'] . "&name=" . urlencode($row['name']) . "'> (You) </a></li>";
                                } else {
                                    echo "<li class='DM__LIST__PERSON'><span class='material-icons'>perm_identity</span><a href='CommunityDMPage.php?receiver_id=" . $row['id'] . "&name=" . urlencode($row['name']) . "'>" . htmlspecialchars($row['name']) . "</a></li>";
                                }
                            }
                        } else {
                            echo "<li>No messages found</li>";
                        }
                        ?>
                    </ul>
                </div>
            </div>

            <article class="DMPage">
                <section class="DMPAGE__HEADER">
                    <button class="DM__TOGGLE CLICKABLE" id="toggleDMList">
                        <span class="material-icons" style="font-size: 2rem;">
                            list
                        </span>
                    </button>

                    <div class="DMPAGE__HEADER2">
                        <span class="material-icons PROFILE_ICON">
                            face
                        </span>
                        <?php
                        $senderID = $_COOKIE['UID'];


                        if (!isset($_GET['receiver_id'])) {
                            $sqlLastPerson = "SELECT receiver_id FROM message 
  WHERE sender_id = '$senderID' 
  ORDER BY sent_at DESC LIMIT 1";

                            $resultLastPerson = mysqli_query($_conn, $sqlLastPerson);
                            if ($rowLastPerson = mysqli_fetch_assoc($resultLastPerson)) {
                                $receiverID = $rowLastPerson['receiver_id'];

                                $sqlGetName = "SELECT * FROM users 
                                WHERE '$receiverID' = id";
                                $resultName = mysqli_query($_conn, $sqlGetName);
                                if ($rowName = mysqli_fetch_assoc($resultName)) {
                                    $userName = $rowName['name'];
                                }
                            } else {
                                $receiverID = null; // No messages yet
                            }
                        } else {
                            $receiverID = $_GET['receiver_id'];
                        }


                        // Get the name from URL
                        $name = isset($_GET['name']) ? $_GET['name'] : $userName;
                        ?>
                        <h1><?php echo htmlspecialchars($name); ?></h1>

                    </div>
                    <span class="material-icons PROFILE_CAM">
                        videocam
                    </span>
                </section>

                <section class="DMPAGE__CONVERSATION">
                    <?php
                    $sql3 = "SELECT * FROM message 
        WHERE (sender_id = '$senderID' AND receiver_id = '$receiverID') 
        OR (sender_id = '$receiverID' AND receiver_id = '$senderID')
        ORDER BY sent_at ASC";

                    $result3 = mysqli_query($_conn, $sql3);
                    if (!$result3) {
                        echo "<p>Error loading messages: " . mysqli_error($_conn) . "</p>";
                    } else {
                        while ($row = mysqli_fetch_assoc($result3)) {
                            $messageText = htmlspecialchars($row['message_text']); // Prevent XSS
                            $isSent = ($row['sender_id'] == $senderID) ? "SENT" : "RECEIVE"; // Identify sender

                            echo "<div class='CONVERSATION $isSent'>$messageText</div>";
                        }
                    }


                    ?>
                </section>

                <section class="DMPAGE__MESSAGE">

                    <form action="<?php echo $webroot; ?>/RegisterLayout/Communication/Community/CommunityDMPageSendMsg.php" method="POST" class="MESSAGE__BOX" id="chatForm">
                        <!-- change this dynamically -->
                        <input type="hidden" name="receiver_id" value=<?php echo $receiverID; ?>>
                        <input class="ENTER__MESSAGE" type="text" name="message" id="message1" placeholder="Type something...">
                        <button type="submit" class="SEND__MESSAGE">
                            <span class="material-icons">
                                send
                            </span>
                        </button>
                    </form>
                </section>
            </article>
        </div>
    </main>
    <script src="Registered.js" defer></script>
    <script src="Communication/Message.js" defer></script>
</body>

</html>