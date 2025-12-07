<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

@include_once("../config.php");

include 'conn.php';
include 'AccountVerify.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($_conn, $_POST['username'] ?? "");
    $password = mysqli_real_escape_string($_conn, $_POST['password'] ?? "");

    $sql = "SELECT * FROM users WHERE name = ? LIMIT 1";
    $stmt = mysqli_prepare($_conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($user = mysqli_fetch_assoc($result)) {
        // Debug output
        error_log("User found: " . print_r($user, true));

        if (password_verify($password, $user['password'])) {
            // Set ALL required session variables
            $_SESSION['authenticated'] = true;
            $_SESSION['userID'] = $user['id'];
            $_SESSION['userName'] = $user['name'];
            $_SESSION['usertype'] = (int)$user['usertype'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['UID'] = $user['id']; // Add this line

            if (!createAuthSession($user['id'], $_conn)) {
                error_log("Failed to create authentication session.");
                $_SESSION['error'] = "Authentication error.";
                header("Location: Login.php");
                exit();
            }

            // Check suspension
            if ($user['UserStatus'] === 'Suspended') {
                $suspension_end = strtotime($user['suspension_end']);
                if ($suspension_end > time()) {
                    $_SESSION['suspended'] = true;
                    $_SESSION['suspension_end'] = $suspension_end;
                    header("Location: ".$webroot."/AdminPage/AdminDashboard/suspensionpage.php");
                    exit();
                }
            }

            // Debug output
            error_log("User type: " . $_SESSION['usertype']);

            // Redirect based on user type
            switch ($_SESSION['usertype']) {
                case 1: // Admin
                    header("Location: ".$webroot."/AdminPage/AdminDashboard/AdminDashboard.php");
                    break;
                case 2: // Moderator
                    header("Location: ".$webroot."/ModeratorPage/Dashboard/ModDashboard.php");
                    break;
                case 0: // Regular user
                    header("Location: Homepage.php");
                    break;
                default:
                    error_log("Invalid user type: " . $_SESSION['usertype']);
                    $_SESSION['error'] = "Invalid user type";
                    header("Location: Login.php");
                    break;
            }
            exit();
        } else {
            error_log("Password verification failed for user: " . $username);
        }
    } else {
        error_log("User not found: " . $username);
    }
    
    $_SESSION['error'] = "Invalid username or password";
    header("Location: Login.php");
    exit();
}
?>