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
    <title>File Management</title>
</head>

<body>
    <?php include "../ModSidebar.php"; ?>

    <main class="DASH__MAIN">
        <section class="WIDGET__CONTAINER four">

            <div class="WIDGET fl_one">
                <table id="fileTable">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Uploaded At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="fileList"></tbody>
                </table>
            </div>

            <div class="WIDGET fl_two">
                <!-- Search Bar -->
                <div>
                    <h3>Search File Name</h3>
                    <input type="text" id="searchInput" placeholder="Search files..." oninput="searchFiles()">
                </div>

                <div class="flex-row" style="gap:3rem">
                    <!-- Filter by File Type -->
                    <div>
                        <h4>Filter by Type:</h4>
                        <div class="flex-row" style="gap: 1rem;">
                            <label><input type="radio" name="filterType" value="" checked onchange="filterFiles()"> All</label>
                            <label><input type="radio" name="filterType" value="image/jpeg" onchange="filterFiles()"> JPEG</label>
                            <label><input type="radio" name="filterType" value="image/png" onchange="filterFiles()"> PNG</label>
                            <label><input type="radio" name="filterType" value="image/svg+xml" onchange="filterFiles()"> SVG</label>
                        </div>
                    </div>

                    <div>
                        <!-- Sort Options -->
                        <h4>Sort by:</h4>
                        <div class="flex-row" style="gap: 1rem;">
                            <label><input type="radio" name="sortOption" value="name" checked onchange="sortFiles()"> Name</label>
                            <label><input type="radio" name="sortOption" value="size" onchange="sortFiles()"> Size</label>
                            <label><input type="radio" name="sortOption" value="date" onchange="sortFiles()"> Date</label>
                        </div>
                    </div>
                </div>
            </div>


            <div class="WIDGET fl_three" id="fileDetails">
                <h3 class="fl__other">File Details</h3>
                <div class="fl__details">
                    <div class="fl__details__text">
                        <h3><strong>File Name</strong> <br> <span id="fileName"></span></h3>

                        <p><strong>Type</strong> <br> <span id="fileType"></span></p>
                        <p><strong>Size</strong> <br> <span id="fileSize"></span></p>
                        <p><strong>Uploaded At</strong> <br> <span id="fileDate"></span></p>

                    </div>
                    <div id="filePreviewContainer"></div>
                </div>
                <div class="fl__other">
                    <button id="downloadBtn">Download</button>
                    <button id="deleteBtn">Delete</button>
                </div>
            </div>
        </section>
    </main>
</body>
<script src="../Mod.js"></script>
<script src="FileManagement.js"></script>

</html>