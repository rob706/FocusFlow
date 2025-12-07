<?php
@include_once("../RegisterLayout/conn.php");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

function logUserActivity($conn, $user_id, $status, $result)
{
    $stmt = $conn->prepare("INSERT INTO user_activity_log (user_id, status, result) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $user_id, $status, $result);
    if ($stmt->execute()) {
        return true;
    } else {
        return false;
    }
}

function logLogout($conn, $user_id, $success = true)
{
    if ($success) {
        $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->close();
    }

    return logUserActivity($conn, $user_id, 'Logout', $success ? 'Success' : 'Fail');
}

function logoutUser2()
{
    // Start the session if it's not already started
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    // Log logout activity
    if (isset($_COOKIE['UID'])) {
        logLogout($_conn, $_COOKIE['UID'], true);
    }

    // Clear session data
    $_SESSION = array();
    session_unset();
    session_destroy();

    // Clear cookies
    setcookie("UID", "", time() - 3600, '/');
    setcookie("AUTH_TOKEN", "", time() - 3600, '/');
    setcookie("EMAIL", "", time() - 3600, '/');
    setcookie("USERNAME", "", time() - 3600, '/');
    setcookie("USERTYPE", "", time() - 3600, '/');

    // Send JSON response before redirecting
    echo json_encode(["success" => true]);
    exit();
}

// Ensure it only runs for POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    logoutUser2();
} else {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
}
