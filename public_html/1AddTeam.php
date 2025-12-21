<?php
@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");

if ($_conn->connect_error) {
    die("Connection failed: " . $_conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $team_name = trim($_POST["team_name"]);
    $leader_id = $_COOKIE["UID"]; // Assuming the user is the leader & member

    // Step 1: Check if the team name already exists
    $check_sql = "SELECT id FROM team WHERE team_name = ?";
    $check_stmt = $_conn->prepare($check_sql);
    $check_stmt->bind_param("s", $team_name);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows > 0) {
        // Team name already exists, show error
        echo "<script>
        alert('$team_name name is already taken.');
        window.location.href = 'Homepage.php';
      </script>";
        exit();
    } else {
        // Step 2: Insert the new team
        $insert_sql = "INSERT INTO team (team_name, leader_id, member_id) VALUES (?, ?, ?)";
        $insert_stmt = $_conn->prepare($insert_sql);
        $insert_stmt->bind_param("sii", $team_name, $leader_id, $leader_id);

        if ($insert_stmt->execute()) {
            $team_id = $_conn->insert_id;
            $team_name_encoded = urlencode($team_name);

            // Redirect to community page with team details
            header("Location: CommunityPage.php?team_id=$team_id&team=$team_name_encoded");
            exit();
        } else {
            echo "Error: Could not create team!";
        }
        $insert_stmt->close();
    }

    $check_stmt->close();
    $_conn->close();
}
