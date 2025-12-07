<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";


if (isset($_POST['action'])) {
    $action = $_POST['action'];

    switch ($action) {
        case "fetch_user":
            $query = "SELECT id, name FROM users";
            $result = $_conn->query($query);

            if ($result) {
                $users = [];
                while ($row = $result->fetch_assoc()) {
                    $users[] = $row;
                }

                // Always return valid JSON
                echo json_encode(["users" => $users]);
            } else {
                echo json_encode(["error" => "Query failed"]);
            }
            break;


        case "createTask":
            $task_title = $_POST['task_title'] ?? '';
            $task_desc = $_POST['task_desc'] ?? '';
            $category = $_POST['category'] ?? '';
            $assigned_to = $_POST['assigned_to'] ?? '';
            $due_date = $_POST['due_date'] ?? '';

            // Start date is today
            $start_date = date("Y-m-d");

            // Validate input
            if (empty($task_title) || empty($task_desc) || empty($assigned_to) || empty($due_date) || empty($category)) {
                echo json_encode(["success" => false, "message" => "All fields are required"]);
                exit;
            }

            // Ensure due date is in the future
            if (strtotime($due_date) < strtotime($start_date . " 00:00:00")) {
                echo json_encode(["success" => false, "message" => "Due date must be today or in the future"]);
                exit;
            }

            // Insert task
            $stmt = $_conn->prepare("INSERT INTO tasks (task_title, task_desc, user_id, start_date, end_date, status, category) VALUES (?, ?, ?, ?, ?, 'Incomplete', ?)");
            $stmt->bind_param("ssisss", $task_title, $task_desc, $assigned_to, $start_date, $due_date, $category);

            if ($stmt->execute()) {
                $notification_message = "A new task '$task_title' has been assigned to you.";
                $stmt = $_conn->prepare("INSERT INTO notifications (user_id, message_id, sender_id, type, notification_message, status) 
                                         VALUES (?, NULL, NULL, 'system', ?, 'unread')");
                $stmt->bind_param("is", $assigned_to, $notification_message);
                $stmt->execute();

                echo json_encode(["success" => true, "message" => "Task created successfully and system notification sent"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to create task"]);
            }

            $stmt->close();
            $_conn->close();
            break;
        case "getDetails":
            $user_id = $_POST['user_id'] ?? '';

            if ($user_id) {
                $stmt = $_conn->prepare("SELECT name FROM users WHERE id = ?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();

                echo json_encode(["name" => $result['name'] ?? ""]);
            } else {
                echo json_encode(["name" => ""]);
            }
            break;

        case "updateTask":
            $task_id = $_POST['task_id'] ?? null;
            $task_name = $_POST['task_name'] ?? '';
            $task_description = $_POST['task_description'] ?? '';
            $task_category = $_POST['task_category'] ?? '';
            $status = $_POST['status'] ?? '';
            $due_date = $_POST['due_date'] ?? '';
            $is_team_task = $_POST['is_team_task'] ?? '';
            $assignTo = $_POST['assignTo'] ?? '';

            // Validation: Ensure all fields are filled
            if (!$task_id || !$task_name || !$task_description || !$status || !$due_date) {
                echo json_encode(["success" => false, "message" => "All fields are required"]);
                exit;
            }



            if ($is_team_task == "true") {
                $stmt = $_conn->prepare("UPDATE group_tasks SET task_name = ?, task_description = ?, status = ?, due_date = ? WHERE id = ?");
                $stmt->bind_param("ssssi", $task_name, $task_description, $status, $due_date, $task_id);
            } else {
                $stmt = $_conn->prepare("UPDATE tasks SET task_title = ?, task_desc = ?, category = ?, status = ?, end_date = ? WHERE id = ?");
                $stmt->bind_param("sssssi", $task_name, $task_description, $task_category, $status, $due_date, $task_id);
            }



            if ($stmt->execute()) {
                $notification_message = "Your task '$task_name' has been updated by moderator.";
                $stmt = $_conn->prepare("INSERT INTO notifications (user_id, message_id, sender_id, type, notification_message, status) 
                                         VALUES (?, NULL, NULL, 'system', ?, 'unread')");
                $stmt->bind_param("is", $assignTo, $notification_message);
                $stmt->execute();
                echo json_encode(["success" => true, "message" => "Task updated successfully and notification sent"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update task"]);
            }
            break;

        case "deleteTask":
            $task_id = $_POST['task_id'] ?? null;
            $is_team_task = $_POST['is_team_task'] ?? '';

            if (!$task_id) {
                echo json_encode(["success" => false, "message" => "Task ID is required"]);
                exit;
            }

            if ($is_team_task == "true") {
                $stmt = $_conn->prepare("DELETE FROM group_tasks WHERE id = ?");
                $stmt->bind_param("i", $task_id);
            } else {
                $stmt = $_conn->prepare("DELETE FROM tasks WHERE id = ?");
                $stmt->bind_param("i", $task_id);
            }

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Task deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete task"]);
            }
            break;
    }
}
