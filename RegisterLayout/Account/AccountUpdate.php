<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_COOKIE['UID'])) {
        echo "<script>alert('User not authenticated. Please log in.'); window.location.href='Account.php';</script>";
        exit();
    }

    $userID = $_COOKIE['UID'];

    // Ensure userID is a valid number
    if (!is_numeric($userID)) {
        echo "<script>alert('Invalid user ID.'); window.location.href='Account.php';</script>";
        exit();
    }

    // Fetch user details from the database
    $sql = "SELECT name, email, password FROM users WHERE id = ?";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
    $stmt->close();

    if ($userData) {
        $currentPassword = $userData['password'];
        $newName = !empty(trim($_POST['username'])) ? mysqli_real_escape_string($_conn, trim($_POST['username'])) : $userData['name'];
        if ($newEmail != $userData['email']) {
            $newEmail = !empty(trim($_POST['email'])) ? mysqli_real_escape_string($_conn, trim($_POST['email'])) : $userData['email'];
        }else{
            echo "Email address cannot be same as previous.";
            echo "<script>setTimeout(function() { window.location.href='<?php echo $webroot; ?>/RegisterLayout/Account.php'; }, 3000);</script>";
        }
        // $newEmail = !empty(trim($_POST['email'])) ? mysqli_real_escape_string($_conn, trim($_POST['email'])) : $userData['email'];
        $newPassword = !empty(trim($_POST['password'])) ? mysqli_real_escape_string($_conn, trim($_POST['password'])) : $currentPassword; // Use DB password if no new password is provided
    }

    // Check if new name and email were entered, else keep old values
    $newName = !empty($newName) ? mysqli_real_escape_string($_conn, $newName) : $userData['name'];
    $newEmail = !empty($newEmail) ? mysqli_real_escape_string($_conn, $newEmail) : $userData['email'];

    // If a new password is provided, hash it; otherwise, keep the old one
    $hashedPassword = (!empty($newPassword)) ? password_hash($newPassword, PASSWORD_DEFAULT) : $currentPasswordHash;

    // Prepare the SQL statement to update the database
    $sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("sssi", $newName, $newEmail, $hashedPassword, $userID);

    if ($stmt->execute()) {
        // Update cookies with the new name and email
        setcookie("USERNAME", $newName, time() + (86400 * 30), "/");
        setcookie("EMAIL", $newEmail, time() + (86400 * 30), "/");

        // Now it's safe to output
        echo "Profile updated successfully. Refreshing...";
        echo "<script>window.location.href='<?php echo $webroot; ?>/RegisterLayout/Account.php';</script>";

        exit();
    } else {
        echo "<script>alert('Error updating profile. Please try again.'); window.location.href='Account.php';</script>";
        exit();
    }

    $stmt->close();
}
