<?php

@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");

if (!isset($_COOKIE['UID'])) {
    $cookiesToClear = ['AUTH_TOKEN', 'EMAIL', 'PHPSESSID', 'UID', 'USERNAME', 'USERTYPE'];
    
    foreach ($cookiesToClear as $cookieName) {
        setcookie($cookieName, '', time() - 3600, '/'); 
        unset($_COOKIE[$cookieName]); 
    }
    
    session_unset();
    session_destroy();
    header("Location: ".$webroot."/RegisterLayout/Login.php");
    exit();
}

if (!($_COOKIE['USERTYPE'] == 0)) {
    header("Location: ".$webroot."/RegisterLayout/Login.php");
    exit();
}

?>