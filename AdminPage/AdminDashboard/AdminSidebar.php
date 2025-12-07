<?php

@include_once("../../config.php");

function isCurrentPage($pageName) {
    $currentPage = basename($_SERVER['PHP_SELF']);
    return ($currentPage === $pageName) ? 'active' : '';
}
?>

<link rel="stylesheet" href="<?php echo $webroot; ?>/AdminPage/Admin.css">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<div class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <img src="../img/icons8-admin-32.png" alt="FocusFlow Logo" class="logo">
        <h3>Admin Panel</h3>
    </div>
    <nav class="sidebar-nav">
        <ul>
            <li>
                <a href="<?php echo $webroot; ?>/AdminPage/AdminDashboard/AdminDashboard.php" 
                class="nav-link <?php echo isCurrentPage('AdminDashboard.php'); ?>">
                    <i class="material-icons">dashboard</i>
                    <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="<?php echo $webroot; ?>/AdminPage/AdminDashboard/AdminUserManagement.php" 
                class="nav-link <?php echo isCurrentPage('AdminUserManagement.php'); ?>">
                    <i class="material-icons">people</i>
                    <span>User Management</span>
                </a>
            </li>
            <li>
                <a href="<?php echo $webroot; ?>/AdminPage/AdminDashboard/AdminStaffManagement.php" 
                class="nav-link <?php echo isCurrentPage('AdminStaffManagement.php'); ?>">
                    <i class="material-icons">people</i>
                    <span>Moderator Management</span>
                </a>
            </li>
            <li>
                <a href="<?php echo $webroot; ?>/AdminPage/AdminDashboard/AdminSurveyview.php" 
                class="nav-link <?php echo isCurrentPage('AdminSurveyview.php'); ?>">
                    <i class="material-icons">assessment</i>
                    <span>Survey and Response</span>
                </a>
            </li>
        </ul>
    </nav>
    
    <div class="sidebar-footer">
        <a href="AdminLogOutBackend.php" class="nav-link">
            <i class="material-icons">logout</i>
            <span>Logout</span>
        </a>
    </div>
</div>