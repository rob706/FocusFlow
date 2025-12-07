<?php

@include_once("../../config.php");

include_once $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'fetch_user_name':
        if (isset($_GET['user_id'])) {
            $userId = intval($_GET['user_id']);

            $sql = "SELECT name FROM users WHERE id = $userId";
            $result = $_conn->query($sql);

            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                echo json_encode(["success" => true, "name" => $row['name']]);
            } else {
                echo json_encode(["success" => false, "error" => "User not found"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Missing user_id"]);
        }
        break;
    case 'fetch_messages':
        if (isset($_GET['sender_id']) && isset($_GET['receiver_id'])) {
            $senderId = intval($_GET['sender_id']);
            $receiverId = intval($_GET['receiver_id']);

            // Changed table name from 'message' to 'directmessage'
            $sql = "SELECT DirectMessageID, SenderID, ReceiverID, MessageText, CreatedTime 
                    FROM directmessage
                    WHERE (SenderID = $senderId AND ReceiverID = $receiverId) 
                       OR (SenderID = $receiverId AND ReceiverID = $senderId)
                    ORDER BY CreatedTime ASC";

            $result = $_conn->query($sql);
            $messages = [];

            while ($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }

            echo json_encode($messages);
        }
        break;

    case 'fetch_receivers':
        if (isset($_GET['sender_id'])) {
            $senderId = intval($_GET['sender_id']);

            $sql = "SELECT DISTINCT ReceiverID FROM directmessage WHERE SenderID = $senderId";
            $result = $_conn->query($sql);

            $receivers = [];
            while ($row = $result->fetch_assoc()) {
                $receivers[] = $row['ReceiverID'];
            }

            echo json_encode($receivers);
        }
        break;
    case 'delete_message':
        $messageId = intval($_GET['message_id']);

        $sql = "UPDATE directmessage SET MessageText = '(Deleted by Moderator)' WHERE DirectMessageID = $messageId";

        if ($_conn->query($sql) === TRUE) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $_conn->error, "sql" => $sql]);
        }

        break;

    default:
        echo json_encode(["error" => "Invalid action"]);
        break;
}
