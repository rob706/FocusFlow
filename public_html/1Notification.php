<?php
@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $userID = $_COOKIE['UID'];

    $sql = "UPDATE notifications SET status = 'read' WHERE user_id = ? AND status = 'unread'";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("i", $userID);

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "error";
    }

    $stmt->close();
    $_conn->close();
}
?>
