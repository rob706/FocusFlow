<?php 

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/ModeratorPage/checklogin.php"; ?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../Mod.css">
    <link rel="shortcut icon" href="../img/icons8-staff-32.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <title>Document</title>
</head>

<body>
    <?php include "../ModSidebar.php"; ?>

    <main class="DASH__MAIN">
        <div class="WIDGET__CONTAINER three">

            <!-- Search & Filter -->
            <div class="WIDGET tm_three">
                <h1>Search for Team</h1>
                <input type="text" id="searchTeam" placeholder="Search team..." onkeyup="filterTeams()">
            </div>

            <!-- Team List Table -->
            <div class="WIDGET tm_two">
                <table id="teamTable">
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>

            <div class="WIDGET tm_one">
                <p style="font-size: 1.3rem;" class="TEAM__HEADER">Group Tasks & Members</p style="font-size: 1.3rem;">

                <div class="group-container">
                    <div id="taskContainer">
                        <h4>Tasks</h4>
                        <ul id="taskList"></ul>
                    </div>

                    <div id="memberContainer">
                        <h4>Members</h4>
                        <ul id="memberList"></ul>
                    </div>
                </div>
            </div>


    </main>

    <footer></footer>
</body>
<script src="../Mod.js"></script>
<script src="Team.js"></script>

</html>