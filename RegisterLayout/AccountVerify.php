<?php

@include_once("../config.php");

include_once "conn.php"; // Use include_once to prevent duplicate inclusions

/**
 * Get the application secret key
 * 
 * @return string Secret key for token signing
 */
function getAppSecret()
{
    // Fallback to a default secret if config file doesn't exist
    $configFile = 'D:/xampp/config/app_config.php';
    if (file_exists($configFile)) {
        $config = include $configFile;
        return $config['APP_SECRET'] ?? 'FocusFlow_Secret_Key_Default';
    } else {
        return 'FocusFlow_Secret_Key_Default'; // Use this as default
    }
}

/**
 * Create an authentication session for a user with HMAC token signing
 * 
 * @param int $userId User ID to create session for
 * @param mysqli $conn Database connection
 * @return bool Success or failure
 */
function createAuthSession($userId, $conn)
{
    try {
        // Ensure required columns exist
        ensureAuthColumns($conn);

        // Generate a strong random token
        $token = bin2hex(random_bytes(24)); // 48 hex characters

        // Sign the token with our secret key using HMAC
        $secret = getAppSecret();
        $signature = hash_hmac('sha256', $userId . $token, $secret);

        // Store base token in database
        $sql = "UPDATE users SET auth_token = ?, token_expires = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $token, $userId);
        $result = $stmt->execute();

        if (!$result) {
            error_log("Failed to update auth_token: " . $conn->error);
            return false;
        }

        // Set the UID cookie
        setcookie("UID", $userId, [
            'expires' => time() + 86400 * 30,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        // Store signed token in cookie (token.signature format)
        $secureToken = $token . '.' . $signature;
        setcookie("AUTH_TOKEN", $secureToken, [
            'expires' => time() + 86400 * 30,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        if (isset($_COOKIE['UID'])) {
            $userId = $_COOKIE['UID'];
        }
        // Set legacy cookies for backward compatibility
        // Get user data for legacy cookies
        $sql = "SELECT name, email, usertype FROM users WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            setcookie("USERNAME", $user['name'], time() + 86400 * 30, '/');
            setcookie("EMAIL", $user['email'], time() + 86400 * 30, '/');
            setcookie("USERTYPE", $user['usertype'], time() + 86400 * 30, '/');
        }

        return true;
    } catch (Exception $e) {
        error_log("Error in createAuthSession: " . $e->getMessage());
        return false;
    }
}

/**
 * Ensure the auth columns exist in the database
 */
function ensureAuthColumns($conn)
{
    // Check if the required columns exist
    $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'auth_token'");
    if ($columnCheck->num_rows === 0) {
        // Add auth_token column if it doesn't exist
        $conn->query("ALTER TABLE users ADD COLUMN auth_token VARCHAR(255) DEFAULT NULL");
    }

    $columnCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'token_expires'");
    if ($columnCheck->num_rows === 0) {
        // Add token_expires column if it doesn't exist
        $conn->query("ALTER TABLE users ADD COLUMN token_expires DATETIME DEFAULT NULL");
    }
}

/**
 * Verify if the current user's auth token is valid with HMAC verification
 * 
 * @param mysqli $conn Database connection
 * @return bool True if valid, false otherwise
 */
function verifyUser($conn)
{
    if (!isset($_COOKIE['UID']) || !isset($_COOKIE['AUTH_TOKEN'])) {
        return false;
    }

    $userId = $_COOKIE['UID'];
    $secureToken = $_COOKIE['AUTH_TOKEN'];

    // Check for simple tokens (backward compatibility)
    if (strpos($secureToken, '.') === false) {
        // Legacy format - no signature
        return verifyLegacyToken($conn, $userId, $secureToken);
    }

    // HMAC signed format
    $tokenParts = explode('.', $secureToken, 2);
    if (count($tokenParts) !== 2) {
        return false; // Invalid token format
    }

    $token = $tokenParts[0];
    $providedSignature = $tokenParts[1];

    // Re-create the signature to verify it matches
    $secret = getAppSecret();
    $expectedSignature = hash_hmac('sha256', $userId . $token, $secret);

    // Verify signature using hash_equals (constant time comparison to prevent timing attacks)
    if (!hash_equals($expectedSignature, $providedSignature)) {
        return false;
    }

    // Verify token matches and hasn't expired
    $sql = "SELECT id FROM users WHERE id = ? AND auth_token = ? AND (token_expires > NOW() OR token_expires IS NULL)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $userId, $token);
    $stmt->execute();
    $result = $stmt->get_result();

    return $result->num_rows > 0;
}

/**
 * Verify a legacy token without signature
 */
function verifyLegacyToken($conn, $userId, $token)
{
    $sql = "SELECT id FROM users WHERE id = ? AND auth_token = ? AND (token_expires > NOW() OR token_expires IS NULL)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $userId, $token);
    $stmt->execute();
    $result = $stmt->get_result();

    // If valid, upgrade to signed token on next request
    if ($result->num_rows > 0) {
        // Flag for token upgrade on next request
        $_SESSION['upgrade_token'] = true;
        return true;
    }

    return false;
}

function checkSuspension($_conn, $userID)
{
    $sql = "SELECT UserStatus, suspension_end FROM users WHERE id = ?";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user['UserStatus'] === 'Suspended') {
        $suspension_end = strtotime($user['suspension_end']);
        if ($suspension_end > time()) {
            $_SESSION['suspended'] = true;
            $_SESSION['suspension_end'] = $suspension_end;
            header("Location: ".$webroot."/AdminPage/AdminDashboard/suspensionpage.php");
            exit();
        }
    }
    return false;
}

/**
 * Check if user is authenticated, redirect if not
 * 
 * @param mysqli $conn Database connection
 * @param string $redirect_url URL to redirect to if not authenticated
 */
function requireAuthentication($conn, $redirect_url = '../Landing_Page/Homepage.php'){
    if (!verifyUser($conn)) {
        // Clear invalid cookies
        setcookie("UID", "", time() - 3600, '/');
        setcookie("AUTH_TOKEN", "", time() - 3600, '/');

        // Redirect to login page
        header("Location: $redirect_url");
        exit();
    }
}

if (isset($_SESSION['userID'])) {
    checkSuspension($_conn, $_SESSION['userID']);
}

/**
 * Log out the current user
 */
function logoutUser()
{
    echo "Logging out...";

    // Log log out activity 
    include "conn.php";
    logLogout($_conn, $_COOKIE['UID'], true);

    // Start the session if it's not already started
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
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

    // Redirect to homepage
    header("Location: ".$webroot."/Landing_Page/Homepage.php");
    exit();
}

/**
 * Refresh and upgrade authentication token if needed
 */
function refreshAuthTokenIfNeeded($conn)
{
    // Only for logged in users
    if (!isset($_COOKIE['UID']) || !verifyUser($conn)) {
        return;
    }

    $userId = $_COOKIE['UID'];

    // Check if token needs upgrading (old format or session flag)
    $needsUpgrade = false;

    if (isset($_SESSION['upgrade_token']) && $_SESSION['upgrade_token'] === true) {
        $needsUpgrade = true;
        unset($_SESSION['upgrade_token']);
    }

    // Check if token is nearing expiration (5 days left)
    $sql = "SELECT token_expires FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if ($row['token_expires']) {
            $expiryDate = new DateTime($row['token_expires']);
            $now = new DateTime();
            $interval = $now->diff($expiryDate);

            // If less than 5 days left, refresh token
            if ($interval->days < 5) {
                $needsUpgrade = true;
            }
        }
    }

    if ($needsUpgrade) {
        createAuthSession($userId, $conn);
    }
}

// Run token refresh check on every page load
if (isset($_COOKIE['UID']) && session_status() !== PHP_SESSION_NONE) {
    // Using the correct connection variable
    global $_conn;
    refreshAuthTokenIfNeeded($_conn);
}

// IMPORTANT: For now, let's disable the automatic verification to prevent redirect loops
// This code will run only if AccountVerify.php is accessed directly
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    echo "<h1>Authentication System</h1>";
    echo "<p>This file should not be accessed directly.</p>";
}


// log user activity
// Password verification function
function verifyPassword($inputPassword, $storedHash)
{
    // Handle both hashed and non-hashed passwords
    if (substr($storedHash, 0, 1) === '$') {
        // Password is already hashed
        return password_verify($inputPassword, $storedHash);
    } else {
        // Legacy password (not hashed)
        return $inputPassword === $storedHash;
    }
}

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

// Logging a user signup
function logSignup($conn, $user_id, $success = true)
{
    return logUserActivity($conn, $user_id, 'Signup', $success ? 'Success' : 'Fail');
}
// Logging a user login
function logLogin($conn, $user_id, $success = true)
{
    return logUserActivity($conn, $user_id, 'Login', $success ? 'Success' : 'Fail');
}

// Logging a user logout
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
