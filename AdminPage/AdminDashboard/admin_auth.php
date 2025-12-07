<?php
session_start();

@include_once("../../config.php");

function requireAdminAuth() {
    // Debug statement to check session values
    error_log("Auth Check - UserID: " . (isset($_SESSION['userID']) ? $_SESSION['userID'] : 'not set') . 
              ", UserType: " . (isset($_SESSION['usertype']) ? $_SESSION['usertype'] : 'not set'));
    
    // Check if user is logged in
    if (!isset($_SESSION['userID']) || !isset($_SESSION['usertype'])) {
        // Check if we have cookie values we can use
        if (isset($_COOKIE['UID']) && isset($_COOKIE['USERTYPE']) && $_COOKIE['USERTYPE'] == 1) {
            // Set session from cookies to prevent redirect loop
            $_SESSION['userID'] = $_COOKIE['UID'];
            $_SESSION['usertype'] = $_COOKIE['USERTYPE'];
            if (isset($_COOKIE['USERNAME'])) {
                $_SESSION['username'] = $_COOKIE['USERNAME'];
            }
            error_log("Auth set session from cookies - continuing as admin");
            return true;
        }
        
        header("Location: ".$webroot."/RegisterLayout/Login.php");
        exit();
    }

    // Cast to integer for proper comparison
    $usertype = (int)$_SESSION['usertype'];
    
    if ($usertype !== 1) {
        header("Location: ".$webroot."/RegisterLayout/Login.php");
        exit();
    }

    return true;
}