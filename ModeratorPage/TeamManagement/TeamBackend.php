<?php

@include_once("../../config.php");

include_once $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");

$action = $_GET['action'] ?? '';

switch ($action) {
    // Fetch teams
    case 'fetch_teams':
        $sql = "SELECT id, team_name, COUNT(*) AS member_count
                FROM team
                GROUP BY team_name";

        $result = $_conn->query($sql);
        $teams = [];

        while ($row = $result->fetch_assoc()) {
            $teams[] = [
                "name" => $row["team_name"],
                "member_count" => $row["member_count"]
            ];
        }

        echo json_encode($teams);
        break;


    // Fetch tasks & members
    case 'fetch_tasks':
        $teamName = $_GET['team_id'];

        // Prepared statement for tasks
        $tasksStmt = $_conn->prepare("
        SELECT gt.*, 
               u1.name AS assigned_user, 
               u2.name AS assigned_by_user 
        FROM group_tasks gt
        JOIN users u1 ON gt.assigned_to = u1.id
        JOIN users u2 ON gt.assigned_by = u2.id
        WHERE gt.team_name = ?
    ");
        $tasksStmt->bind_param("s", $teamName);
        $tasksStmt->execute();
        $tasks = $tasksStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $tasksStmt->close();

        // Prepared statement for members
        $membersStmt = $_conn->prepare("
            SELECT t.member_id, u.name 
            FROM team t
            JOIN users u ON t.member_id = u.id
            WHERE t.team_name = ?");
        $membersStmt->bind_param("s", $teamName);
        $membersStmt->execute();
        $members = $membersStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $membersStmt->close();

        echo json_encode(["tasks" => $tasks, "members" => $members]);
        break;

    case 'remove_task':
        $data = json_decode(file_get_contents("php://input"), true);
        $taskId = $data['task_id'];
        $teamName = $data['team_name'];

        $stmt = $_conn->prepare("DELETE FROM group_tasks WHERE id = ? AND team_name = ?");
        $stmt->bind_param("is", $taskId, $teamName);
        $stmt->execute();
        $stmt->close();
        break;

    case 'remove_member':
        $data = json_decode(file_get_contents("php://input"), true);
        $memberId = $data['member_id'];
        $teamName = $data['team_name'];

        $stmt = $_conn->prepare("DELETE FROM team WHERE member_id = ? AND team_name = ?");
        $stmt->bind_param("is", $memberId, $teamName);
        $stmt->execute();
        $stmt->close();
        break;
}
