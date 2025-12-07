<?php
include "../../RegisterLayout/conn.php";
require_once 'admin_auth.php';
@include_once("../../config.php");
include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/AdminPage/checklogin.php";
requireAdminAuth();
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="Admin.css">
    <link rel="shortcut icon" href="../img/icons8-staff-32.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <title>Admin Dashboard</title>
    <style>
        .DASH__MAIN {
            margin-left: 250px; /* Match sidebar width */
            padding: 20px;
            min-height: 100vh;
        }

        .dashboard-top {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: space-between;
        }

        .stats-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            flex: 1;
            min-width: 200px;
            margin: 0;
        }

        .stats-number {
            font-size: 2em;
            font-weight: bold;
            color: #2c3e50;
        }
        .stats-label {
            color: #7f8c8d;
            margin-top: 5px;
        }
        .task-stats {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .task-stat {
            padding: 8px;
            border-radius: 4px;
            text-align: center;
        }
        .recent-list {
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
        }
        .recent-item {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .active-users-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }

        .active-section {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }

        .toggle-buttons {
            display: flex;
            gap: 10px;
        }

        .toggle-buttons button {
            padding: 8px 16px;
            border: none;
            background: #eee;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .toggle-buttons button:hover {
            background: #2c3e50;
            color: white;
        }

        .toggle-buttons button.active {
            background: #2c3e50;
            color: white;
        }

        .hidden {
            display: none;
        }

        .message-type {
            font-size: 0.8em;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 5px;
        }

        .message-type:contains('Group') {
            background-color: #e3f2fd;
            color: #1976d2;
        }

        .message-type:contains('Direct') {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }

        .context {
            font-size: 0.8em;
            color: #666;
            margin-left: 5px;
        }

        .user-status {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-left: 5px;
        }

        .user-status.Active {
            background-color: #d4edda;
            color: #155724;
        }

        .user-status.Inactive {
            background-color: #f8d7da;
            color: #721c24;
        }

        .online-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 5px;
        }

        .online-indicator.online {
            background-color: #2ecc71;  /* Green for online */
            box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.2);
        }

        .online-indicator.offline {
            background-color: #e74c3c;  /* Red for offline */
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
        }

        .message-type.direct {
            background-color: #e3f2fd;
            color: #1976d2;
        }

        .message-type.group {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }

        .message-text {
            display: block;
            margin: 5px 0;
            color: #333;
        }

        @media screen and (max-width: 1024px) {
            .dashboard-top {
                gap: 15px;
            }
            
            .stats-card {
                min-width: calc(50% - 15px);
                flex: 0 0 calc(50% - 15px);
            }
            
            .DASH__MAIN {
                margin-left: 200px;
                padding: 15px;
            }
        }
        
        @media screen and (max-width: 768px) {
            .DASH__MAIN {
                margin-left: 0;
                padding: 10px;
            }
            
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
                position: fixed;
                z-index: 1000;
            }
            
            .sidebar.active {
                transform: translateX(0);
            }
            
            .stats-card {
                padding: 15px;
            }
            
            .stats-number {
                font-size: 1.5em;
            }
            
            .HEADER__MENU_BUTTON {
                display: block;
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 1001;
                background: #2c3e50;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
            }
        }

        @media screen and (max-width: 480px) {
            /* Collapse dashboard layout to one column */
            .dashboard-top {
                flex-direction: column;
                gap: 10px;
            }
            
            .stats-card {
                min-width: 100%;
                padding: 10px;
                font-size: 0.85rem;
            }
            
            .stats-number {
                font-size: 1.3em;
            }
            
            /* Adjust sidebar (if visible) or hide it */
            .sidebar {
                display: none;
                width: 80%;
            }
            
            .sidebar.active {
                display: block;
            }
            
            /* Adjust header icons and text sizes for better mobile readability */
            header .icons span {
                height: 32px;
                width: 32px;
                line-height: 32px;
                font-size: 1.3rem;
            }
            
            /* Ensure charts and lists are scrollable if content overflows */
            .chart-container,
            .recent-list {
                overflow-x: auto;
                max-height: 150px;
            }
            
            /* Reduce padding in main container */
            .DASH__MAIN {
                padding: 5px;
            }
            
            .task-stats {
                flex-direction: column;
                gap: 5px;
            }
            
            .task-stat {
                padding: 5px;
            }
        }
        
        /* Menu button styles */
        .HEADER__MENU_BUTTON {
            display: none;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px;
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1001;
            cursor: pointer;
        }
        
        @media screen and (max-width: 768px) {
            .HEADER__MENU_BUTTON {
                display: block;
            }
        }
    </style>
</head>

<body>
    <?php include "AdminSidebar.php"; ?>
    
    <button class="HEADER__MENU_BUTTON" id="menuToggle">
        <i class="material-icons">menu</i>
    </button>
    
    <div class="DASH__MAIN">
        <div class="dashboard-top">
            <div class="stats-card">
                <h3>Users Overview</h3>
                <div class="stats-number" id="totalUsers">0</div>
                <div class="stats-label">Total Users</div>
                <div class="stats-number" id="activeUsers">0</div>
                <div class="stats-label">Currently Active</div>
            </div>

            <div class="stats-card">
                <h3>Task Overview</h3>
                <div class="task-stats">
                    <div class="task-stat" style="background: #fff3cd">
                        <div id="pendingTasks">0</div>
                        <small>Pending</small>
                    </div>
                    <div class="task-stat" style="background: #d4edda">
                        <div id="completedTasks">0</div>
                        <small>Completed</small>
                    </div>
                    <div class="task-stat" style="background: #f8d7da">
                        <div id="overdueTasks">0</div>
                        <small>Overdue</small>
                    </div>
                </div>
            </div>

            <div class="stats-card">
                <h3>Recent Logins</h3>
                <div class="recent-list" id="recentLogins"></div>
            </div>

            <div class="stats-card">
                <h3>Teams</h3>
                <div class="stats-number" id="totalTeams">0</div>
                <div class="stats-label">Total Teams</div>
            </div>

        </div>

        <div class="stats-card">
            <h3>Recent Messages</h3>
            <div class="recent-list" id="recentMessages"></div>
        </div>
    </div>

    <script>
    function updateStats() {
        fetch('get_stats.php')
            .then(response => response.json())
            .then(data => {
                // Update basic stats
                document.getElementById('totalUsers').textContent = data.totalUsers;
                document.getElementById('activeUsers').textContent = data.activeUsers;
                document.getElementById('totalTeams').textContent = data.totalTeams;
                document.getElementById('pendingTasks').textContent = data.taskStats.Incomplete;
                document.getElementById('completedTasks').textContent = data.taskStats.Complete;
                document.getElementById('overdueTasks').textContent = data.taskStats.overdue;

                // Replace the recent logins section in updateStats() function
                const loginsList = document.getElementById('recentLogins');
                if (data.recentLogins && data.recentLogins.length > 0) {
                    loginsList.innerHTML = data.recentLogins.map(login => {
                        const lastLogin = new Date(login.last_login);
                        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                        const isOnline = login.status === 'Active' && lastLogin >= fiveMinutesAgo;
                        
                        return `
                            <div class="recent-item">
                                <span class="online-indicator ${isOnline ? 'online' : 'offline'}"></span>
                                ${login.name}
                                <span class="user-status ${login.status}">${login.status}</span><br>
                                <small>Last seen: ${lastLogin.toLocaleTimeString()}</small>
                            </div>
                        `;
                    }).join('');
                } else {
                    loginsList.innerHTML = '<div class="recent-item">No recent logins</div>';
                }

                // Update recent messages
                const messagesList = document.getElementById('recentMessages');
                if (data.recentMessages && data.recentMessages.length > 0) {
                    messagesList.innerHTML = data.recentMessages.map(msg => `
                        <div class="recent-item">
                            <strong>${msg.sender}</strong> 
                            <span class="message-type ${msg.message_type.toLowerCase()}">${msg.message_type}</span>
                            <span class="context">
                                ${msg.message_type === 'Group' ? `(in ${msg.context})` : `(to ${msg.context})`}
                            </span><br>
                            <span class="message-text">${msg.message_text}</span><br>
                            <small>${new Date(msg.sent_at).toLocaleString()}</small>
                        </div>
                    `).join('');
                } else {
                    messagesList.innerHTML = '<div class="recent-item">No recent messages</div>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('recentMessages').innerHTML = 
                    '<div class="recent-item">Error loading messages</div>';
            });
        }
    // Update more frequently for active users
    setInterval(updateStats, 30000); // Every 30 seconds
    // Initial update
    updateStats();
    </script>
    <script src="Admin.js"></script>
    <script>
    // Remove duplicate menu button creation - only use the one in the HTML
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        
        // Close sidebar when clicking outside
        if(sidebar.classList.contains('active')) {
            document.addEventListener('click', function closeMenu(e) {
                if(!e.target.closest('.sidebar') && !e.target.closest('.HEADER__MENU_BUTTON')) {
                    sidebar.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }
    }

    // Update mobile menu toggle functionality
    document.getElementById('menuToggle').addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
        
        // Close sidebar when clicking outside
        if(sidebar.classList.contains('active')) {
            document.addEventListener('click', function closeMenu(e) {
                if(!e.target.closest('.sidebar') && !e.target.closest('#menuToggle')) {
                    sidebar.classList.remove('active');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const sidebar = document.querySelector('.sidebar');
        if(window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
    </script>
</body>
</html>