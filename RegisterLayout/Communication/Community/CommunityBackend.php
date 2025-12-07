<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

if ($_SERVER['REQUEST_METHOD'] === "POST") {
    $action = isset($_POST['action']) ? $_POST['action'] : '';

    switch ($action) {
        case "AddMember":
            $team_name = $_POST['team_name'];
            $memberName = $_POST['member_name'];

            // Get member_id based on member name
            $sql = "SELECT id FROM users WHERE name = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("s", $memberName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                $member_id = $row['id'];
            } else {
                die("Error: Member not found!");
            }
            $stmt->close();

            $leaderSql = "SELECT leader_id FROM team WHERE team_name = ? LIMIT 1";
            $leaderStmt = $_conn->prepare($leaderSql);
            $leaderStmt->bind_param("s", $team_name);
            $leaderStmt->execute();
            $leaderResult = $leaderStmt->get_result();

            if ($leaderRow = $leaderResult->fetch_assoc()) {
                $leader_id = $leaderRow['leader_id'];
                error_log("Leader ID found: " . $leader_id); // Debugging output
            } else {
                die("Error: Team not found or leader_id is missing!");
            }
            $leaderStmt->close();

            // Check if the member already exists in the team
            $checkSql = "SELECT id FROM team WHERE team_name = ? AND (member_id = ? OR leader_id = ?)";
            $checkStmt = $_conn->prepare($checkSql);
            $checkStmt->bind_param("sii", $team_name, $member_id, $member_id);
            $checkStmt->execute();
            $exists = $checkStmt->fetch(); // Fetch result to check if row exists
            $checkStmt->close();

            if ($exists) {
                echo "Member already exists in the team!";
            } else {
                // Insert new member if they do not exist
                $insertSql = "INSERT INTO team (team_name, leader_id, member_id) VALUES (?, ?, ?)";
                $insertStmt = $_conn->prepare($insertSql);
                $insertStmt->bind_param("sii", $team_name, $leader_id, $member_id);

                if ($insertStmt->execute()) {
                    echo "Member added successfully!";
                } else {
                    echo "Error adding member.";
                }
                $insertStmt->close();
            }

            $_conn->close();
            break;


        case "CheckMember":
            $member_name = $_POST['member_name'];

            if (empty($member_name)) {
                echo json_encode(["exists" => false]);
                exit;
            }

            $sql = "SELECT id FROM users WHERE name = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("s", $member_name);
            $stmt->execute();
            $stmt->store_result();

            echo json_encode(["exists" => $stmt->num_rows > 0]);
            $stmt->close();
            break;

        case "RemoveMember":
            $team_name = $_POST['team_name'];
            $memberName = $_POST['member_name'];

            // Query to find the member ID based on the provided name
            $sql = "SELECT id FROM users WHERE name = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("s", $memberName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                $member_id = $row['id'];
            } else {
                die("Error: Member not found!");
            }

            $stmt->close();

            // check if member in team
            $checkTeamSql = "SELECT id FROM team WHERE team_name = ? AND member_id = ?";
            $checkTeamStmt = $_conn->prepare($checkTeamSql);
            $checkTeamStmt->bind_param("si", $team_name, $member_id);
            $checkTeamStmt->execute();
            $checkTeamStmt->store_result();

            if ($checkTeamStmt->num_rows == 0) {
                $checkTeamStmt->close();
                $_conn->close();
                die("Error: $memberName is not a member of this team!");
            }

            $checkTeamStmt->close();

            $_conn->begin_transaction(); // Start transaction

            try {
                // First, delete the member from the team
                $sql1 = "DELETE FROM team WHERE team_name = ? AND member_id = ?";
                $stmt1 = $_conn->prepare($sql1);
                $stmt1->bind_param("si", $team_name, $member_id);
                $stmt1->execute();
                $stmt1->close();

                // Then, delete tasks where this member is assigned_to
                $sql2 = "DELETE FROM group_tasks WHERE FIND_IN_SET(?, assigned_to)";
                $stmt2 = $_conn->prepare($sql2);
                $stmt2->bind_param("i", $member_id);
                $stmt2->execute();
                $stmt2->close();

                // Then, delete tasks where this member is the assigned_by
                $sql3 = "DELETE FROM group_tasks WHERE assigned_by = ?";
                $stmt3 = $_conn->prepare($sql3);
                $stmt3->bind_param("i", $member_id);
                $stmt3->execute();
                $stmt3->close();

                $_conn->commit(); // Commit transaction
                echo "$memberName has been removed!";
            } catch (Exception $e) {
                $_conn->rollback(); // Rollback transaction in case of an error
                echo "Error removing member and tasks: " . $e->getMessage();
            }

            $_conn->close();
            break;

        case "UploadFile":
            $file = $_FILES['file'];

            // File properties
            $fileName = basename($file['name']);
            $fileType = $file['type'];
            $fileSize = $file['size'];
            $fileTmp = $file['tmp_name'];
            $teamName = isset($_POST['team_name']) ? $_POST['team_name'] : '';

            // Set max file size (40MB)
            $maxFileSize = 40 * 1024 * 1024;
            if ($fileSize > $maxFileSize) {
                echo "<script>alert('File size exceeds 40MB!'); window.history.back();</script>";
                exit();
            }

            // Read file content
            $fileData = file_get_contents($fileTmp);

            $userID = $_COOKIE['UID'];

            // Insert file details into the database
            $sql = "INSERT INTO files (user_id, team_name, file_name, file_type, file_size, file_data, uploaded_at) 
                        VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("isssis", $userID, $teamName, $fileName, $fileType, $fileSize, $fileData);

            if ($stmt->execute()) {
                echo "<script>
                            alert('File uploaded successfully!');
                            window.parent.closePopup();
                          </script>";
            } else {
                echo "Database error: " . $stmt->error;
            }
            break;
        case "AddTask":
            // Ensure UID cookie and team name exist
            if (!isset($_COOKIE['UID']) || !isset($_GET['team'])) {
                echo json_encode(["status" => "error", "message" => "Unauthorized request."]);
                exit;
            }

            // Retrieve and sanitize inputs
            $assign_by = (int) $_COOKIE['UID']; // Ensure it is an integer
            $teamName = htmlspecialchars(urldecode($_GET['team']));
            $task_name = htmlspecialchars(trim($_POST["task_name"]));
            $assigned_to = (int) trim($_POST["assigned_to"]); // Ensure integer
            $task_description = htmlspecialchars(trim($_POST["task_desc"])); // Fixed field name
            $due_date = trim($_POST["due_date"]);

            // Prepare SQL statement (ensure `task_description` is used)
            $sql = "INSERT INTO group_tasks (team_name, task_name, assigned_by, assigned_to, task_description, due_date, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending')";

            $stmt = $_conn->prepare($sql);

            if (!$stmt) {
                echo json_encode(["status" => "error", "message" => "Database error: " . $_conn->error]);
                exit;
            }

            // Bind parameters correctly
            $stmt->bind_param("ssiiss", $teamName, $task_name, $assign_by, $assigned_to, $task_description, $due_date);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Task added successfully!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
            }

            $stmt->close();
            $_conn->close();
            break;

        case "DeleteTask":
            $task_id = intval($_POST["task_id"]);

            $sql = "DELETE FROM group_tasks WHERE id = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("i", $task_id);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Task deleted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete task"]);
            }

            $stmt->close();
            $_conn->close();
            break;

        case "UpdateTask":
            $taskID = $_POST['task_id'];
            $newStatus = $_POST['status'];



            $sql = "UPDATE group_tasks SET status = ? WHERE id = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("si", $newStatus, $taskID);

            if ($stmt->execute()) {
                echo "success";
            } else {
                echo "error";
            }

            $stmt->close();
            $_conn->close();
            break;

        case "DeleteTeam":

            if (!isset($_POST['team'])) {
                die("Error: No team specified!");
            }

            $teamName = $_POST['team'];

            // delete all group task
            $deleteTasksSql = "DELETE FROM group_tasks WHERE team_name = ?";
            $deleteTasksStmt = $_conn->prepare($deleteTasksSql);
            $deleteTasksStmt->bind_param("s", $teamName);
            $deleteTasksStmt->execute();
            $deleteTasksStmt->close();


            // Get team ID before deleting
            $sql = "SELECT id FROM team WHERE team_name = ?";
            $stmt = $_conn->prepare($sql);
            $stmt->bind_param("s", $teamName);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($row = $result->fetch_assoc()) {
                $teamID = $row['id'];

                // Delete team from database
                $deleteSql = "DELETE FROM team WHERE team_name = ?";
                $deleteStmt = $_conn->prepare($deleteSql);
                $deleteStmt->bind_param("s", $teamName);

                if ($deleteStmt->execute()) {
                    echo "Team deleted successfully!";
                } else {
                    echo "Error deleting team.";
                }

                $deleteStmt->close();
            } else {
                echo "Error: Team not found.";
            }

            $stmt->close();
            $_conn->close();
            break;
    }
}
