<?php
    @include_once("../../config.php");
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="<?echo $webroot; ?>/RegisterLayout/loginandsignup.css">
    <title>Forgot Password</title>
</head>
<body>
    <div class="container">
        <!-- Left Section -->
        <div class="left-section">
            <div class="carousel-container">
                <div class="carousel-slide active">
                    <h3 class="slide-title">Focus on your task</h3>
                    <h2 class="slide-subtitle">Track your productivity seamlessly</h2>
                    <div class="image-placeholder">
                        <img src="<?echo $webroot; ?>/RegisterLayout/img/undraw_dev-productivity_5wps.svg" alt="Productivity">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Manage your time</h3>
                    <h2 class="slide-subtitle">Set goals and achieve them</h2>
                    <div class="image-placeholder">
                        <img src="<?echo $webroot; ?>/RegisterLayout/img/undraw_time-management_fedt.svg" alt="Time Management">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Stay organized</h3>
                    <h2 class="slide-subtitle">Keep your workflow structured</h2>
                    <div class="image-placeholder">
                        <img src="<?echo $webroot; ?>/RegisterLayout/img/undraw_spreadsheet_g2tr.svg" alt="Organization">
                    </div>
                </div>
                <div class="carousel-slide">
                    <h3 class="slide-title">Track Progress</h3>
                    <h2 class="slide-subtitle">Monitor your improvements</h2>
                    <div class="image-placeholder">
                        <img src="<?echo $webroot; ?>/RegisterLayout/img/undraw_progress-data_gvcq.svg" alt="Progress">
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
            <h2>Forgot Password</h2>
            
            <form id="signinForm" action="" method="POST">
                <div class="form-input">
                    <input type="text" id="username" name="username" placeholder="Name" required>
                    <div id="usernameError" class="error"></div>
                    <input type="text" id="email" name="email" placeholder="Email" required>
                    <div id="emailError" class="error"></div>
                    <input type="password" id="password" name="password" placeholder="New password" required>
                    <div id="passwordError" class="error"></div>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
                    <div id="passwordconfirmError" class="error"></div>
                    <a href="../Login.php">Login</a>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    </div>
    <script type="module" src="ForgotPassword.js"></script>
</body>
</html>