<?php
include "conn.php";
session_start();
include "AccountVerify.php";

@include_once("../config.php");

/*

Note (rob706): I do not know what the below file is, I cannot see this within the repo or in the history as being included... should this be checklogin.php

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/verifyUserType.php";

*/

requireAuthentication($_conn);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pomodoro Timer</title>

    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="icon" href="img/SMALL_CLOCK_ICON.ico">
    <link rel="stylesheet" href="Registered.css">
    <link rel="stylesheet" href="Responsive.css">
</head>

<body>
    <?php 
    include "header.php";
    ?>
    <div class="TIMER__BODY">
        <?php
        include "sidebar.php";
        ?>
        <div class="container">
            <div class="timer">
                <h1>Pomodoro Timer</h1>

                <div class="button-container">
                    <button class="button" id="pomodoro-session">Pomodoro</button>
                    <button class="button" id="short-break">Short Break</button>
                    <button class="button" id="long-break">Long Break</button>
                </div>

                <main class="MAIN__TIMER">
                    <div class="timer-wrapper">
                        <!-- Plus and Minus Buttons (Stacked) -->
                        <div class="adjust-buttons">
                            <h6 style="margin:0;">MIN</h6>
                            <button id="plus-btn" class="adjust-btn">+</button>
                            <button id="minus-btn" class="adjust-btn">−</button>
                        </div>

                        <!-- Timer Display -->
                        <div class="timer-display active">
                            <h1 class="time"><span id="pomodoro-timer"></span></h1>
                            <h1 class="time"><span id="short-timer"></span></h1>
                            <h1 class="time"><span id="long-timer"></span></h1>
                        </div>

                        <div class="adjust-buttons">
                            <h6 style="margin:0;">SEC</h6>
                            <button id="plus-btn-second" class="adjust-btn">+</button>
                            <button id="minus-btn-second" class="adjust-btn">−</button>
                        </div>
                    </div>
                </main>

                <div class="pomodoro-settings">
                    <div class="settings-item">
                        <label for="long-break-interval">Pomodoro sessions before long break:</label>
                        <div class="settings-controls">
                            <button id="interval-minus" class="adjust-btn">−</button>
                            <span id="long-break-interval-display">4</span>
                            <button id="interval-plus" class="adjust-btn">+</button>
                        </div>
                    </div>
                </div>

                <div class="buttons">
                    <button id="start">START</button>
                    <button id="stop">STOP</button>
                </div>
            </div>
        </div>
    </div>

    <script src="Registered.js" defer></script>
    <script src="Timer/Timer.js" type="module" defer></script>
</body>

</html>