<?php
session_start();

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

header("Content-Type: application/json");

if (!$_conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sender_id = $_COOKIE['UID'] ?? "";
    $receiver_id = $_POST['receiver_id'] ?? "";
    $message_text = trim($_POST['message'] ?? "");

    if (empty($sender_id) || empty($receiver_id) || empty($message_text)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
        exit();
    }

    // Sanitize inputs
    $sender_id = mysqli_real_escape_string($_conn, $sender_id);
    $receiver_id = mysqli_real_escape_string($_conn, $receiver_id);
    $message_text = mysqli_real_escape_string($_conn, $message_text);

    // Start transaction
    mysqli_begin_transaction($_conn);

    try {
        // Insert message
        $sql = "INSERT INTO message (sender_id, receiver_id, message_text) 
                VALUES ('$sender_id', '$receiver_id', '$message_text')";
        
        if (!mysqli_query($_conn, $sql)) {
            throw new Exception("Error inserting message: " . mysqli_error($_conn));
        }

        // Get the message ID that was just inserted
        $message_id = mysqli_insert_id($_conn);

        // Create notification message
        $notification_message = "You have a new message";  // You can customize this
        
        // Insert notification
        $sql_notification = "INSERT INTO notifications (
            user_id, 
            message_id, 
            sender_id, 
            type, 
            notification_message, 
            status
        ) VALUES (
            '$receiver_id',
            '$message_id',
            '$sender_id',
            'message',
            '$notification_message',
            'unread'
        )";

        if (!mysqli_query($_conn, $sql_notification)) {
            throw new Exception("Error inserting notification: " . mysqli_error($_conn));
        }

        // If we got here, commit the transaction
        mysqli_commit($_conn);
        echo json_encode(["status" => "success", "message" => "Message and notification sent"]);

    } catch (Exception $e) {
        // If there was an error, rollback changes
        mysqli_rollback($_conn);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

    exit();
}

mysqli_close($_conn);
?>