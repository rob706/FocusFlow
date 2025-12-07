<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

header("Content-Type: application/json");

// Get the team name from the request
$teamName = isset($_GET['team']) ? $_GET['team'] : '';

if (!$teamName) {
    echo json_encode(["error" => "No team name provided"]);
    exit;
}

// SQL query to fetch members based on the given team name
$sql = "SELECT DISTINCT u.id, u.name, 
        CASE WHEN t.leader_id = u.id THEN 'Leader' ELSE 'Member' END AS role
        FROM team t
        JOIN users u ON (t.leader_id = u.id OR t.member_id = u.id)
        WHERE t.team_name = ?";

$stmt = $_conn->prepare($sql);
$stmt->bind_param("s", $teamName);
$stmt->execute();
$result = $stmt->get_result();

$members = array();
while ($row = $result->fetch_assoc()) {
    $members[] = array(
        "id" => $row["id"],
        "name" => $row["name"],
        "role" => $row["role"]
    );
}
echo json_encode($members);
$_conn->close();
