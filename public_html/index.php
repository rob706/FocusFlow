<?php
session_start();

@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");
@include_once($basedir."core/GeneralFunction.php");
@include_once($basedir."core/checklogin.php");


if (!isset($_COOKIE['UID']) || !isset($_COOKIE['USERNAME']) || !isset($_COOKIE['USERTYPE'])) {
    header("Location: Login.php");
    exit();
}

// Set current user data
$userID = $_COOKIE['UID'];
$userName = $_COOKIE['USERNAME'];

$pg = "dashboard";
$dpage = "pages/app-".$pg.".pg";
if(!empty($_GET['pg'])) $pg = $_GET['pg'];

$page = "pages/app-".$pg.".pg";

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FocusFlow</title>

    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="icon" href="img/SMALL_CLOCK_ICON.ico">
    <link rel="stylesheet" href="core/css/Registered.css">
    <link rel="stylesheet" href="core/css/Responsive.css">
    <link rel="stylesheet" href="core/css/app.css">
</head>

<body>
    <?php
    @include_once("header.php");
    ?>
    <main>
        <!-- temp SIDEBAR_SHOW -->
        <?php
        @include_once("sidebar.php");

        if(file_exists($page)){
        include($page);
        } else {
        include($dpage);
        }

        ?>
        
    </main>
</body>

</html>