<?php
@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");    

$query = $_GET['query'];
$results = [];

$searchQuery = "%$query%";
$userID = $_COOKIE['UID']; // Define userID from cookies

// Search Group Tasks
$groupTaskSql = "SELECT DISTINCT gt.id, gt.task_name, gt.team_name, gt.assigned_to, gt.assigned_by
                 FROM group_tasks gt 
                 JOIN team tm ON gt.team_name = tm.team_name 
                 WHERE (gt.task_name LIKE ?) 
                 AND (tm.member_id = ? OR tm.leader_id = ?) 
                 AND (gt.assigned_to = ? OR gt.assigned_by = ?)";

$stmt = $_conn->prepare($groupTaskSql);
$stmt->bind_param("siiii", $searchQuery, $userID, $userID, $userID, $userID);
$stmt->execute();
$groupTaskResult = $stmt->get_result();

while ($row = $groupTaskResult->fetch_assoc()) {
    // Determine if the task was assigned **to** or **by** the user
    if ($row["assigned_to"] == $userID) {
        $assignmentType = "assigned_to_me";
    } elseif ($row["assigned_by"] == $userID) {
        $assignmentType = "assigned_by_me";
    } else {
        $assignmentType = "unknown"; // Fallback case (shouldn't happen)
    }

    $results[] = [
        "type" => "group_task",
        "id" => $row["id"],
        "name" => $row["team_name"],
        "taskName" => $row["task_name"],
        "assignment_type" => $assignmentType
    ];
}
$stmt->close();

// Search Goals
$goalSql = "SELECT user_id, goal_title FROM goals WHERE goal_title LIKE ? AND user_id = ?";
$stmt = $_conn->prepare($goalSql);
$stmt->bind_param("si", $searchQuery, $userID);
$stmt->execute();
$goalResult = $stmt->get_result();

while ($row = $goalResult->fetch_assoc()) {
    $results[] = ["type" => "goal", "id" => $row["user_id"], "name" => $row["goal_title"]];
}
$stmt->close();

// Search Pages / Functions
$pages = [
    ["name" => "Dashboard", "link" => "Homepage.php"],
    ["name" => "Focus Timer", "link" => "Timer.php"],
    ["name" => "To-Do List", "link" => "Todo.php"],
    ["name" => "Calendar", "link" => "Calendar.php"],
    ["name" => "Analytics", "link" => "Analytic.php"],
    ["name" => "Goals", "link" => "Goal.php"],
    ["name" => "Direct Message", "link" => "CommunityDMPage.php"]
];

foreach ($pages as $page) {
    if (stripos($page["name"], $query) !== false) {
        $results[] = ["type" => "page", "name" => $page["name"], "link" => $page["link"]];
    }
}

// Search Members
$memberSql = "SELECT id, name FROM users WHERE name LIKE ?";
$stmt = $_conn->prepare($memberSql);
$stmt->bind_param("s", $searchQuery);
$stmt->execute();
$memberResult = $stmt->get_result();

while ($row = $memberResult->fetch_assoc()) {
    $results[] = ["type" => "member", "id" => $row["id"], "name" => $row["name"]];
}
$stmt->close();

// Close DB Connection
$_conn->close();

// Return JSON response
echo json_encode($results);
