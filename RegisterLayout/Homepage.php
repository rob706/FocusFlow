<?php
session_start();

include "conn.php";
include "GeneralFunction.php";

@include_once("../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/checklogin.php";


if (!isset($_COOKIE['UID']) || !isset($_COOKIE['USERNAME']) || !isset($_COOKIE['USERTYPE'])) {
    header("Location: Login.php");
    exit();
}

// Set current user data
$userID = $_COOKIE['UID'];
$userName = $_COOKIE['USERNAME'];


// Fetch total tasks completed
$sql = "SELECT COUNT(*) as total_completed FROM tasks WHERE user_id = ? AND status = 'Complete'";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$totalCompleted = $row['total_completed'];

$startOfWeek = date("Y-m-d", strtotime('monday this week'));
$endOfWeek = date("Y-m-d", strtotime('sunday this week'));
$sql = "SELECT COUNT(*) as completed_this_week FROM tasks WHERE user_id = ? AND status = 'Complete' AND DATE(start_date) BETWEEN ? AND ?";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iss", $userID, $startOfWeek, $endOfWeek);
$stmt->execute();
$result = $stmt->get_result();
$completedTasksRow = $result->fetch_assoc();

$sql = "SELECT COUNT(*) as total_tasks_this_week FROM tasks WHERE user_id = ? AND DATE(start_date) BETWEEN ? AND ?";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iss", $userID, $startOfWeek, $endOfWeek);
$stmt->execute();
$result = $stmt->get_result();
$totalTasksRow = $result->fetch_assoc();

$totalTasksThisWeek = $totalTasksRow['total_tasks_this_week'];
$completedThisWeek = $completedTasksRow['completed_this_week'];

// Fetch total focus hours
$sql = "SELECT SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, start_time, end_time))) as total_time_spent FROM tasks WHERE user_id = ? AND status = 'Complete'";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$totalTimeSpent = $row['total_time_spent'];

// Fetch tasks for the current month
$currentMonth = date('m');
$currentYear = date('Y');
$sql = "SELECT * FROM tasks WHERE user_id = ? AND MONTH(start_date) = ? AND YEAR(start_date) = ?";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iii", $userID, $currentMonth, $currentYear);
$stmt->execute();
$result = $stmt->get_result();
$tasks = [];
while ($row = $result->fetch_assoc()) {
    $tasks[] = $row;
}

$sql = "SELECT DATE(start_date) as day, COUNT(*) as count 
        FROM tasks 
        WHERE user_id = ? 
        AND start_date BETWEEN ? AND ? 
        AND status = 'Complete'
        GROUP BY DATE(start_date)";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iss", $userID, $startOfWeek, $endOfWeek);
$stmt->execute();
$taskResults = $stmt->get_result();

// Get messages sent per day this week

$GetUserContactListID = Query("SELECT ContactID FROM contactlist WHERE UserID = ?", "i", $userID, "No data found", "array", "SELECT", null);

// $GetFriendIDFromContact = Query("SELECT FriendID FROM contact WHERE ContactListID = ?", "i", $GetUserContactListID, "No data found", "single", "SELECT", null);



// Get team tasks completed per day this week
$sql = "SELECT DATE(assigned_at) as day, COUNT(*) as count 
        FROM group_tasks 
        WHERE (assigned_by = ? OR assigned_to = ?)
        AND assigned_at BETWEEN ? AND ?
        AND status = 'completed'
        GROUP BY DATE(assigned_at)";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iiss", $userID, $userID, $startOfWeek, $endOfWeek);
$stmt->execute();
$teamTaskResults = $stmt->get_result();

// Initialize arrays for the week
$weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
$tasksPerDay = array_fill(0, 7, 0);
$messagesPerDay = array_fill(0, 7, 0);
$teamTasksPerDay = array_fill(0, 7, 0);

// Fill tasks data
while ($row = $taskResults->fetch_assoc()) {
    $dayOfWeek = date('w', strtotime($row['day']));
    $tasksPerDay[$dayOfWeek] = $row['count'];
}

try {
    // Create a simple array to store message counts for the last 7 days
    $weeklyCounts = array_fill(0, 7, 0); // Initialize with zeros for 7 days
    
    // Get dates for the last 7 days (from oldest to newest)
    $dates = [];
    for ($i = 6; $i >= 0; $i--) {
        $dates[] = date('Y-m-d', strtotime("-$i days"));
    }
    
    // Query for direct message counts by day (last 7 days)
    $directMessageQuery = "
        SELECT 
            DATE(CreatedTime) as message_date,
            COUNT(*) as message_count
        FROM directmessage 
        WHERE (SenderID = ? OR ReceiverID = ?) 
        AND CreatedTime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(CreatedTime)
    ";
    
    $directMessageCounts = Query($directMessageQuery, "ii", [$userID, $userID], "No direct messages found", "array", "SELECT", null);
    
    // Add direct message counts to the weekly counts array
    if (is_array($directMessageCounts) && !empty($directMessageCounts)) {
        foreach ($directMessageCounts as $dayCount) {
            $messageDate = $dayCount['message_date'];
            $dateIndex = array_search($messageDate, $dates);
            if ($dateIndex !== false) {
                $weeklyCounts[$dateIndex] += (int)$dayCount['message_count'];
            }
        }
    }
    
    // Get all user's groups
    $groupsQuery = "SELECT GroupInfoID FROM groupusers WHERE UserID = ?";
    $userGroups = Query($groupsQuery, "i", $userID, "No groups found", "array", "SELECT", null);
    
    // Process group messages if any groups exist
    if (is_array($userGroups) && !empty($userGroups)) {
        $groupIds = [];
        
        // Extract all group IDs
        foreach ($userGroups as $group) {
            if (isset($group['GroupInfoID'])) {
                $groupIds[] = $group['GroupInfoID'];
            }
        }
        
        // If we have any group IDs, query group message counts
        if (!empty($groupIds)) {
            // Build query directly with the group IDs instead of using IN with placeholders
            $groupIdList = implode(',', array_map('intval', $groupIds)); // Ensure IDs are integers for security
            
            $groupMessageQuery = "
                SELECT 
                    DATE(CreatedTime) as message_date,
                    COUNT(*) as message_count
                FROM groupchat 
                WHERE GroupID IN ($groupIdList)
                AND CreatedTime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE(CreatedTime)
            ";
            if (!empty($groupIdList)) {
                // Use empty string for type parameter instead of null, and pass empty array instead of null for params
                $groupMessageCounts = Query($groupMessageQuery, "", [], "No group messages found", "array", "SELECT", null);
            
                // Add group message counts to the weekly counts array
                if (is_array($groupMessageCounts) && !empty($groupMessageCounts)) {
                    foreach ($groupMessageCounts as $dayCount) {
                        $messageDate = $dayCount['message_date'];
                        $dateIndex = array_search($messageDate, $dates);
                        if ($dateIndex !== false) {
                            $weeklyCounts[$dateIndex] += (int)$dayCount['message_count'];
                        }
                    }
                }
            }
        }
    }
    
    // Return the simplified array of just the counts
    $messagesPerDay = $weeklyCounts;
} catch (Exception $e) {
    $messagesPerDay = [0, 0, 0, 0, 0, 0, 0]; // Return an array of zeros in case of an error
}

// Fill team tasks data
while ($row = $teamTaskResults->fetch_assoc()) {
    $dayOfWeek = date('w', strtotime($row['day']));
    $teamTasksPerDay[$dayOfWeek] = $row['count'];
}

// Fetch tasks with due dates for the current month
$sql = "SELECT DATE(end_date) as due_date, status FROM tasks WHERE user_id = ? AND MONTH(end_date) = ? AND YEAR(end_date) = ?";
$stmt = $_conn->prepare($sql);
$stmt->bind_param("iii", $userID, $currentMonth, $currentYear);
$stmt->execute();
$result = $stmt->get_result();
$tasksDueDates = [];
while ($row = $result->fetch_assoc()) {
    $tasksDueDates[] = [
        'due_date' => $row['due_date'],
        'status' => $row['status']
    ];
}

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
    <link rel="stylesheet" href="Registered.css">
    <link rel="stylesheet" href="Responsive.css">
    <style>
        header {
            position: relative;
            /* Change from fixed/sticky to relative */
            width: 100%;
            z-index: 100;
        }

        .dashboard {
            padding: 2rem 3rem;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .metric-card {
            background: #f7f7f7;
            padding: 1.5rem;
            border-radius: 8px;
        }

        .metric-card__value {
            font-size: 2rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 0.5rem;
        }

        .metric-card__label {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .week-badge {
            background: white;
            color: #333;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.75rem;
            border: 1px solid #e5e7eb;
        }

        .chart-container {
            background: white;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;

            background: white;
            border-radius: 8px;
            /* padding: 1.5rem; */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .calendar-nav {
            display: flex;
            gap: 0.5rem;
        }

        .calendar-nav button {
            background: #4a5568;
            color: white;
            border: none;
            padding: 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0.5rem;
            text-align: center;
        }

        .calendar-day-label {
            font-weight: 500;
            color: #4a5568;
            padding: 0.5rem;
        }

        .calendar-date {
            padding: 0.5rem;
            cursor: pointer;
            border-radius: 4px;
        }

        .calendar-date:hover {
            background: #f3f4f6;
        }

        .calendar-date.current {
            background: #4a5568;
            color: white;
        }

        .group-tasks-container {
            margin-top: 2rem;
            background: white;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .group-tasks-title {
            font-size: 1.1rem;
            color: #4a5568;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f0f0f0;
        }

        .group-tasks-list {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 0.5rem;
        }

        .group-tasks-list::-webkit-scrollbar {
            width: 6px;
        }

        .group-tasks-list::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        .group-tasks-list::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }

        .task-card {
            background: #4a5568;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.2s;
        }

        .task-card:hover {
            transform: translateY(-2px);
        }

        .task-content {
            flex: 1;
        }

        .task-card__heading {
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .task-card__subheading {
            font-size: 0.875rem;
            color: #cbd5e1;
        }

        .task-meta {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .task-card__avatars {
            display: flex;
        }

        .task-card__avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #e5e7eb;
            margin-left: -8px;
            border: 2px solid #4a5568;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #4a5568;
            font-size: 0.875rem;
        }

        .task-card__status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4a5568;
            cursor: pointer;
            transition: all 0.2s;
        }

        .task-card__status.completed {
            background: #10B981;
            color: white;
        }

        .task-card__status:hover {
            transform: scale(1.1);
        }

        header .icons {
            display: flex;
        }

        header .icons span {
            height: 38px;
            width: 38px;
            margin: 0 1px;
            cursor: pointer;
            color: #878787;
            text-align: center;
            line-height: 38px;
            font-size: 1.9rem;
            user-select: none;
            border-radius: 50%;
        }

        .icons span:last-child {
            margin-right: -10px;
        }

        header .icons span:hover {
            background: #f2f2f2;
        }

        header .current-date {
            font-size: 1.45rem;
            font-weight: 500;
        }

        .calendar-container {
            position: relative;
            width: 100%;
            height: auto;
        }

        .calendar-container .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
        }

        .calendar-header .current-date {
            font-size: 1.2em;
            font-weight: bold;
        }

        .calendar-header .icons {
            cursor: pointer;
            font-size: 1.5em;
        }

        .calendar .weeks,
        .calendar .days {
            display: contents;
        }

        .weeks li,
        .days li {
            list-style-type: none;
            text-align: center;
            padding: 5px;
            font-size: 1em;
        }

        .days li {
            cursor: pointer;
        }

        .days li:hover {
            background-color: #ececec;
        }

        .days .today {
            background-color: #ffeb3b;
        }

        .wrapper header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 0 1rem;
        }

        .days li.has-task {
            background-color: #ffeb3b;
            border-radius: 50%;
        }

        .days li.has-task:hover {
            background-color: #ffd700;
        }

        .days li.overdue {
            background-color: #ff4d4d;
            color: white;
        }

        .days li.overdue:hover {
            background-color: #ff1a1a;
        }

        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.4);
        }

        .modal-content {
            background-color: #fefefe;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 600px;
            border-radius: 8px;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        #taskList {
            list-style-type: none;
            padding: 0;
        }

        #taskList li {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }

        #viewCalendarButton {
            background-color: #4a5568;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
        }

        #viewCalendarButton:hover {
            background-color: #3b4a5a;
        }

        /* Responsive Styles */
        @media screen and (max-width: 1200px) {
            .dashboard {
                padding: 1.5rem 2rem;
                gap: 1.5rem;
            }
        }

        @media screen and (max-width: 992px) {
            .dashboard {
                grid-template-columns: 1fr 250px;
                padding: 1rem 1.5rem;
                gap: 1rem;
            }
            
            .metrics-grid {
                gap: 0.75rem;
            }
            
            .metric-card {
                padding: 1.2rem;
            }
            
            .metric-card__value {
                font-size: 1.75rem;
            }
        }

        @media screen and (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
                margin-bottom: 1.5rem;
            }
            
            .sidebar {
                width: 100%;
                margin-top: 1.5rem;
            }
            
            .calendar-container {
                max-width: 450px;
                margin: 0 auto;
            }
            
            .task-card {
                padding: 0.8rem;
            }
            
            /* Improved calendar responsiveness */
            .wrapper {
                max-width: 450px;
                margin: 0 auto;
            }
            
            .calendar .weeks li, 
            .calendar .days li {
                font-size: 0.9rem;
                padding: 4px;
            }
            
            /* Improved modal responsiveness */
            .modal-content {
                margin: 10% auto;
                width: 90%;
                padding: 15px;
            }
        }

        @media screen and (max-width: 576px) {
            .dashboard {
                padding: 1rem;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 0.75rem;
            }
            
            .metric-card {
                padding: 1rem;
            }
            
            .metric-card__value {
                font-size: 1.5rem;
            }
            
            .metric-card__label {
                font-size: 0.8rem;
            }
            
            .chart-container {
                margin-bottom: 1.5rem;
                padding: 0.8rem;
            }
            
            .group-tasks-container {
                padding: 0.75rem;
            }
            
            .task-meta {
                gap: 0.5rem;
            }
            
            .task-card__heading {
                font-size: 0.9rem;
            }
            
            .task-card__subheading {
                font-size: 0.75rem;
            }
            
            .task-card__avatar {
                width: 24px;
                height: 24px;
                font-size: 0.75rem;
            }
            
            .calendar .weeks li, 
            .calendar .days li {
                font-size: 0.75rem;
                padding: 3px;
            }
            
            .calendar-header .current-date {
                font-size: 1rem;
            }
            
            .group-tasks-title {
                font-size: 1rem;
            }
            
            .modal-content {
                margin: 5% auto;
                padding: 10px;
            }
            
            #viewCalendarButton {
                padding: 8px 15px;
                font-size: 0.9rem;
            }
        }
        
        /* Additional styles for very small screens */
        @media screen and (max-width: 400px) {
            .metric-card__value {
                font-size: 1.3rem;
            }
            
            .metric-card {
                padding: 0.8rem;
            }
            
            .week-badge {
                font-size: 0.7rem;
                padding: 0.2rem 0.5rem;
            }
            
            .task-card {
                padding: 0.7rem;
                flex-direction: column;
                align-items: flex-start;
            }
            
            .task-meta {
                width: 100%;
                margin-top: 0.5rem;
                justify-content: space-between;
            }
            
            .calendar .weeks,
            .calendar .days {
                gap: 2px;
            }
            
            .wrapper header {
                padding: 0 0.5rem;
            }
            
            header .icons span {
                height: 30px;
                width: 30px;
                line-height: 30px;
                font-size: 1.5rem;
            }
            
            .calendar-header .current-date {
                font-size: 0.9rem;
            }
        }
    </style>
</head>

<body>
    <?php
    include "header.php";
    ?>
    <main>
        <!-- temp SIDEBAR_SHOW -->
        <?php
        include "sidebar.php";
        ?>


        <div class="dashboard">
            <div class="main-content">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-card__value" id="total-tasks-completed"><?php echo $totalCompleted; ?></div>
                        <div class="metric-card__label">Total Tasks Completed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-card__value" id="weekly-tasks-completed"><?php echo $completedThisWeek . '/' . $totalTasksThisWeek; ?></div>
                        <div class="metric-card__label">Tasks Completed <span class="week-badge">This Week</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-card__value" id="total-focus-hours"><?php echo $totalTimeSpent; ?></div>
                        <div class="metric-card__label">Total Focus Hours</div>
                    </div>
                </div>

                <div class="chart-container">
                    <canvas id="productivityChart"></canvas>
                </div>
            </div>

            <div id="taskModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Tasks for <span id="modalDate"></span></h2>
                    <ul id="taskList"></ul>
                    <button id="viewCalendarButton">View in Calendar</button>
                </div>
            </div>

            <div class="sidebar">
                <div class="wrapper">
                    <header style="z-index:1;">
                        <p class="current-date"></p>
                        <div class="icons">
                            <span id="prev" class="material-symbols-rounded">&lt</span>
                            <span id="next" class="material-symbols-rounded">&gt</span>
                        </div>
                    </header>
                    <div class="calendar">
                        <ul class="weeks">
                            <li>Sun</li>
                            <li>Mon</li>
                            <li>Tue</li>
                            <li>Wed</li>
                            <li>Thu</li>
                            <li>Fri</li>
                            <li>Sat</li>
                        </ul>
                        <ul class="days"></ul>
                    </div>
                </div>

                <div class="group-tasks-container">
                    <h3 class="group-tasks-title">Group Tasks</h3>
                    <div class="group-tasks-list">
                        <?php
                        // Fetch group tasks for the current user (either assigned to or by them)
                        $sql = "SELECT DISTINCT gt.*, 
                        t.team_name,
                        u1.name as assigned_by_name,
                        u1.id as assigned_by_id,
                        u2.name as assigned_to_name,
                        u2.id as assigned_to_id
                        FROM group_tasks gt
                        JOIN team t ON gt.team_name = t.team_name
                        JOIN users u1 ON gt.assigned_by = u1.id
                        JOIN users u2 ON gt.assigned_to = u2.id
                        WHERE gt.assigned_by = ? OR gt.assigned_to = ?
                        ORDER BY gt.due_date ASC";

                        $stmt = $_conn->prepare($sql);
                        if (!$stmt) {
                            echo $_conn->error;
                        }
                        $stmt->bind_param("ii", $userID, $userID);
                        $stmt->execute();
                        $result = $stmt->get_result();

                        while ($task = $result->fetch_assoc()):
                        ?>
                            <div class="task-card" data-task-id="<?php echo $task['id']; ?>">
                                <div class="task-content">
                                    <div class="task-card__heading"><?php echo htmlspecialchars($task['task_name']); ?></div>
                                    <div class="task-card__subheading">
                                        <?php echo htmlspecialchars($task['team_name']); ?> •
                                        Due: <?php echo date('M d', strtotime($task['due_date'])); ?>
                                    </div>
                                </div>
                                <div class="task-meta">
                                    <div class="task-card__avatars">
                                        <div class="task-card__avatar" title="<?php echo htmlspecialchars($task['assigned_by_name']); ?>">
                                            <?php echo strtoupper(substr($task['assigned_by_name'], 0, 1)); ?>
                                        </div>
                                        <div class="task-card__avatar" title="<?php echo htmlspecialchars($task['assigned_to_name']); ?>">
                                            <?php echo strtoupper(substr($task['assigned_to_name'], 0, 1)); ?>
                                        </div>
                                    </div>
                                    <div class="task-card__status <?php echo $task['status'] === 'completed' ? 'completed' : ''; ?>"
                                        onclick="updateTaskStatus(<?php echo $task['id']; ?>)">
                                        ✓
                                    </div>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                </div>

                <script src="Registered.js" defer></script>
                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                <script>
                    const tasksDueDates = <?php echo json_encode($tasksDueDates); ?>;
                    const ctx = document.getElementById('productivityChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                            datasets: [{
                                label: 'Tasks Completed',
                                data: <?php echo json_encode($tasksPerDay); ?>,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1
                            }, {
                                label: 'Messages Sent',
                                data: <?php echo json_encode($messagesPerDay); ?>,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1
                            }, {
                                label: 'Team Tasks Completed',
                                data: <?php echo json_encode($teamTasksPerDay); ?>,
                                borderColor: 'rgb(54, 162, 235)',
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Weekly Activity Overview'
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1
                                    }
                                }
                            }
                        }
                    });

                    function updateTaskStatus(taskId) {
                        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
                        const statusButton = taskCard.querySelector('.task-card__status');

                        statusButton.classList.toggle('completed');

                        // Send AJAX request to update status
                        fetch('updateGroupTaskStatus.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: `task_id=${taskId}&status=${statusButton.classList.contains('completed') ? 'completed' : 'pending'}`
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (!data.success) {
                                    // Revert the visual change if update failed
                                    statusButton.classList.toggle('completed');
                                    alert('Failed to update task status');
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                // Revert the visual change if request failed
                                statusButton.classList.toggle('completed');
                                alert('Failed to update task status');
                            });
                    }

                    const daysTag = document.querySelector(".days"),
                        currentDate = document.querySelector(".current-date"),
                        prevNextIcon = document.querySelectorAll(".icons span"),
                        taskModal = document.getElementById("taskModal"),
                        modalContent = document.querySelector(".modal-content"),
                        closeModal = document.querySelector(".close"),
                        modalDate = document.getElementById("modalDate"),
                        taskList = document.getElementById("taskList"),
                        viewCalendarButton = document.getElementById("viewCalendarButton");

                    let date = new Date(),
                        currYear = date.getFullYear(),
                        currMonth = date.getMonth();
                    const months = ["January", "February", "March", "April", "May", "June", "July",
                        "August", "September", "October", "November", "December"
                    ];

                    const renderCalendar = () => {
                        let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
                            lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
                            lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
                            lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
                        let liTag = "";
                        for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
                            liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
                        }
                        for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
                            // adding active class to li if the current day, month, and year matched
                            let isToday = i === date.getDate() && currMonth === new Date().getMonth() &&
                                currYear === new Date().getFullYear() ? "active" : "";

                            // Check if the current day has a task due
                            let task = tasksDueDates.find(task => task.due_date === `${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
                            let hasTask = task ? "has-task" : "";
                            let isOverdue = task && task.status !== 'completed' && new Date(task.due_date) < new Date() ? "overdue" : "";

                            liTag += `<li class="${isToday} ${hasTask} ${isOverdue}" data-date="${currYear}-${String(currMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">${i}</li>`;
                        }
                        for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
                            liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
                        }
                        currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
                        daysTag.innerHTML = liTag;

                        // Add event listeners to days
                        document.querySelectorAll(".days li").forEach(day => {
                            day.addEventListener("click", (e) => {
                                const date = e.target.getAttribute("data-date");
                                showTasksForDate(date);
                            });
                        });
                    }

                    const showTasksForDate = (date) => {
                        const tasksForDate = tasksDueDates.filter(task => task.due_date === date);
                        modalDate.innerText = date;
                        taskList.innerHTML = tasksForDate.map(task => `<li>${task.status === 'completed' ? '✓' : '✗'} ${task.due_date}</li>`).join('');
                        taskModal.style.display = "block";
                    }

                    closeModal.onclick = () => {
                        taskModal.style.display = "none";
                    }

                    window.onclick = (event) => {
                        if (event.target == taskModal) {
                            taskModal.style.display = "none";
                        }
                    }

                    viewCalendarButton.onclick = () => {
                        window.location.href = "Calendar.php";
                    }

                    renderCalendar();
                    prevNextIcon.forEach(icon => {
                        icon.addEventListener("click", () => {
                            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
                            if (currMonth < 0 || currMonth > 11) {
                                date = new Date(currYear, currMonth, new Date().getDate());
                                currYear = date.getFullYear();
                                currMonth = date.getMonth();
                            } else {
                                date = new Date();
                            }
                            renderCalendar();
                        });
                    });

                    // Add to pages where users are active
                    function updateUserActivity() {
                        fetch('<?php echo $webroot; ?>/AdminPage/AdminDashboard/get_user_statuses.php')
                            .then(response => response.json())
                            .catch(error => console.error('Error updating activity:', error));
                    }

                    // Update every minute
                    setInterval(updateUserActivity, 60000);

                    // Initial update
                    updateUserActivity();

                    // Update on page visibility change
                    document.addEventListener('visibilitychange', function() {
                        if (!document.hidden) {
                            updateUserActivity();
                        }
                    });
                </script>
    </main>
</body>

</html>