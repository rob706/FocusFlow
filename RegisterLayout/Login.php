<?php

@include_once("../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
session_start();
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/AccountVerify.php";

// Add check to prevent redirect loop - only redirect if not already on admin dashboard
if (isset($_COOKIE['UID']) && isset($_COOKIE['USERNAME']) && isset($_COOKIE['USERTYPE']) && 
    strpos($_SERVER['PHP_SELF'], 'AdminDashboard.php') === false) {
    
    $username = htmlspecialchars($_COOKIE['USERNAME'], ENT_QUOTES, 'UTF-8');
    $usertype = $_COOKIE['USERTYPE'];
    
    // Store these values in the session to ensure auth checks work properly
    $_SESSION['userID'] = $_COOKIE['UID'];
    $_SESSION['usertype'] = $usertype;
    $_SESSION['username'] = $username;

    // Determine redirect page based on user type
        case 0:
            $redirectPage = $webroot."/RegisterLayout/Homepage.php";
            break;
        case 1:
            $redirectPage = $webroot."/AdminPage/AdminDashboard/AdminDashboard.php";
            break;
        case 2:
            $redirectPage = $webroot."/ModeratorPage/Dashboard/ModDashboard.php";
            break;
    }

    error_log("User logged in. Redirecting to: $redirectPage");
    
    echo "
    <script>
        alert('Welcome back, $username');
        window.location.href = '$redirectPage';
    </script>
    ";
    exit(); 
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <title>Log In</title>
    <link rel="stylesheet" href="loginandsignup.css">
</head>

<body>
    <div class="container">
        <!-- Left Section -->
        <div class="left-section">
            <div class="carousel-container">
                <button class="carousel-nav prev"> <span class="material-icons">
                        arrow_back_ios
                    </span></button>
                <button class="carousel-nav next">
                    <span class="material-icons">
                        arrow_forward_ios
                    </span></button>
                <div class="carousel-slide active">
                    <h3 class="slide-title">Focus on your task</h3>
                    <h2 class="slide-subtitle">Track your productivity seamlessly</h2>
                    <div class="image-placeholder">
                        <img src="img/undraw_dev-productivity_5wps.svg" alt="Productivity">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Manage your time</h3>
                    <h2 class="slide-subtitle">Set goals and achieve them</h2>
                    <div class="image-placeholder">
                        <img src="img/undraw_time-management_fedt.svg" alt="Time Management">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Stay organized</h3>
                    <h2 class="slide-subtitle">Keep your workflow structured</h2>
                    <div class="image-placeholder">
                        <img src="img/undraw_spreadsheet_g2tr.svg" alt="Organization">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Track Progress</h3>
                    <h2 class="slide-subtitle">Monitor your improvements</h2>
                    <div class="image-placeholder">
                        <img src="img/undraw_progress-data_gvcq.svg" alt="Progress">
                    </div>
                </div>
            </div>
            <!-- Pagination dots -->
            <div class="pagination">
                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
        <!-- Right Section -->
        <div class="right-section">
            <h1>FocusFlow</h1>
            <h2>Log In</h2>
            <h3>Don't have an account? <a href="Signup.php">Sign Up</a></h3>

            <form id="signinForm" action="LoginBackend.php" method="POST">
                <div class="form-input">
                    <input type="text" id="username" name="username" placeholder="Name" required>
                    <div id="usernameError" class="error"></div>
                    <input type="password" id="password" name="password" placeholder="Password" required>
                    <div id="passwordError" class="error"></div>
                    <a href="ForgotPasswordPage/ForgotPassword.php">Forgot password?</a>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    </div>
    <script src="loginandsignup.js" defer></script>
</body>

</html>