<?php
session_start();
@include_once("../../config.php");
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/AccountVerify.php";

// Log the admin logout activity
if (isset($_SESSION['userID'])) {
    logLogout($_conn, $_SESSION['userID'], true);
}

// Clear all session data
$_SESSION = array();
session_unset();
session_destroy();

// Clear authentication cookies
setcookie("UID", "", time() - 3600, '/');
setcookie("AUTH_TOKEN", "", time() - 3600, '/');
setcookie("USERNAME", "", time() - 3600, '/');
setcookie("USERTYPE", "", time() - 3600, '/');

// Redirect to login page
header("Location: ".$webroot."/RegisterLayout/Login.php");
exit();
?>