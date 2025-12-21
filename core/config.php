<?php

// File Structure Settings

$basedir = $_SERVER['DOCUMENT_ROOT'] . "/";
$webroot = ""; # No Trailing Slash

/*

-- Settings for Original FocusFlow Project --

$basedir = $webroot = "/RWD_assignment/FocusFlow";

*/

// Database Config

$host = 'localhost';
$username = 'root';
$password = '';
$db = 'focusflow';

## Do Not adjust below this line ##
    
try {
    $_conn = mysqli_connect($host,$username,$password,$db);
} catch (mysqli_sql_exception) {
    die("<script>alert('Database failed to connect');</script>");
};

?>