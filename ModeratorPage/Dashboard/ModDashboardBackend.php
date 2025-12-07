<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
// Get total normal users

$sql_users = "SELECT COUNT(*) AS total_users FROM users WHERE usertype = 0";
$total_users = $_conn->query($sql_users)->fetch_assoc()['total_users'];

// Get total teams
$sql_teams = "SELECT COUNT(*) AS total_teams FROM team";
$total_teams = $_conn->query($sql_teams)->fetch_assoc()['total_teams'];

// Get group task counts
$sql_group_tasks = "SELECT 
    SUM(status = 'pending') AS pending, 
    SUM(status = 'in_progress') AS in_progress, 
    SUM(status = 'completed') AS completed 
    FROM group_tasks";
$group_task_result = $_conn->query($sql_group_tasks)->fetch_assoc();

// Get individual task counts
$sql_individual_tasks = "SELECT 
    SUM(status = 'incomplete') AS incomplete, 
    SUM(status = 'complete') AS complete, 
    SUM(status = 'timeout') AS timeout 
    FROM tasks";
$individual_task_result = $_conn->query($sql_individual_tasks)->fetch_assoc();

// Get total group messages
$sql_group_messages = "SELECT COUNT(*) AS total_group_messages FROM groupchat";
$total_group_messages = $_conn->query($sql_group_messages)->fetch_assoc()['total_group_messages'];

// Get total direct messages
$sql_direct_messages = "SELECT COUNT(*) AS total_direct_messages FROM directmessage";
$total_direct_messages = $_conn->query($sql_direct_messages)->fetch_assoc()['total_direct_messages'];


// =========UserM=============
// Get active users today
$sql_active_users = "SELECT COUNT(*) AS active_users FROM users WHERE DATE(last_login) = CURDATE()";
$active_users = $_conn->query($sql_active_users)->fetch_assoc()['active_users'];

// Get most active users based on interactions (tasks completed + messages sent)
$sql_most_active = "SELECT u.name, 
    (COALESCE(t.completed_tasks, 0) + COALESCE(m.sent_messages, 0) + COALESCE(gt.completed_group_tasks, 0)) AS interactions
    FROM users u
    -- Individual Completed Tasks
    LEFT JOIN (SELECT user_id, COUNT(*) AS completed_tasks 
               FROM tasks 
               WHERE status = 'completed' 
               GROUP BY user_id) t 
        ON u.id = t.user_id
    -- Direct Messages Sent
    LEFT JOIN (SELECT SenderID, COUNT(*) AS sent_messages 
               FROM directmessage 
               GROUP BY SenderID) m
        ON u.id = m.SenderID
    -- Completed Group Tasks
    LEFT JOIN (SELECT assigned_to, COUNT(*) AS completed_group_tasks 
               FROM group_tasks 
               WHERE status = 'completed' 
               GROUP BY assigned_to) gt
        ON u.id = gt.assigned_to
    ORDER BY interactions DESC
    LIMIT 5";
$most_active_result = $_conn->query($sql_most_active);

// Get team participation (number of users per team)
$sql_team_participation = "SELECT t.team_name, COUNT(u.id) AS total_users 
    FROM team t 
    LEFT JOIN users u ON t.member_id = u.id 
    GROUP BY t.team_name";
$team_participation_result = $_conn->query($sql_team_participation);



// ===========TaskM========

// Fetch Overdue Tasks Count
$sql_overdue_tasks = "SELECT COUNT(*) AS overdue_count 
    FROM tasks 
    WHERE end_date < NOW() AND status != 'Complete' AND status != 'Incomplete'";
$overdue_result = $_conn->query($sql_overdue_tasks);
$overdue_count = $overdue_result->fetch_assoc()['overdue_count'];

// Fetch Total, Completed, and Pending Tasks
$sql_task_completion = "SELECT 
    COUNT(*) AS total_tasks,
    COUNT(CASE WHEN status = 'Complete' THEN 1 END) AS completed_tasks,
    COUNT(CASE WHEN status = 'Incomplete' THEN 1 END) AS pending_tasks
    FROM tasks";

$completion_result = $_conn->query($sql_task_completion);
$row = $completion_result->fetch_assoc();

$total_tasks = $row['total_tasks'] ?? 1; 
$completed_tasks = $row['completed_tasks'] ?? 0;
$pending_tasks = $row['pending_tasks'] ?? 0;
$completion_rate = ($completed_tasks / $total_tasks) * 100;

// ========MessageM========
$sql_most_messaged = "
    SELECT u.name, 
        (COALESCE(sent.sent_count, 0) + COALESCE(received.received_count, 0)) AS total_messages
    FROM users u
    LEFT JOIN (SELECT SenderID, COUNT(*) AS sent_count FROM directmessage GROUP BY SenderID) sent 
        ON u.id = sent.SenderID
    LEFT JOIN (SELECT ReceiverID, COUNT(*) AS received_count FROM directmessage GROUP BY ReceiverID) received
        ON u.id = received.ReceiverID
    ORDER BY total_messages DESC
    LIMIT 5";
$most_messaged_result = $_conn->query($sql_most_messaged);

$sql_message_distribution = "
    SELECT 
        (SELECT COUNT(*) FROM groupchat) AS group_messages,
        (SELECT COUNT(*) FROM directmessage) AS direct_messages";
$message_distribution_result = $_conn->query($sql_message_distribution);
$row = $message_distribution_result->fetch_assoc();
$group_messages = $row['group_messages'];
$direct_messages = $row['direct_messages'];

// ========FileM==========
$sql_recent_files = "SELECT f.file_name, f.uploaded_at, u.name AS username
                     FROM files f
                     JOIN users u ON f.user_id = u.id
                     ORDER BY f.uploaded_at DESC 
                     LIMIT 5";

$recent_files_result = $_conn->query($sql_recent_files);


$sql_top_uploaders = "SELECT u.name, COUNT(f.id) AS file_count 
                      FROM users u
                      JOIN files f ON u.id = f.user_id
                      GROUP BY u.id
                      ORDER BY file_count DESC
                      LIMIT 5";
$top_uploaders_result = $_conn->query($sql_top_uploaders);

$sql_total_storage = "SELECT SUM(file_size) AS total_storage FROM files";
$total_storage_result = $_conn->query($sql_total_storage);
$total_storage = $total_storage_result->fetch_assoc()['total_storage'];
$total_storage_mb = round($total_storage / 1024 / 1024, 2); // Convert bytes to MB


// Close connection
$_conn->close();
