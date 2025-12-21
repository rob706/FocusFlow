<?php
@include_once($_SERVER['DOCUMENT_ROOT']."/core/config.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? "";

    switch ($action) {
        case "Add":
            $required_fields = ['task_title', 'task_desc', 'task_group', 'start_date', 'end_date', 'start_time', 'end_time'];

            foreach ($required_fields as $field) {
                if (empty($_POST[$field])) {
                    die("<script>alert('$_POST[$field], $field is Empty...');window.location.href='Calendar.htm'</script>");
                }
            }

            //     // Retrieve inputs
            $task_title = trim($_POST['task_title']);
            $task_desc = trim($_POST['task_desc']);
            $task_group = trim($_POST['task_group']);
            $start_date = $_POST['start_date'];
            $end_date = $_POST['end_date'];
            $start_time = $_POST['start_time'];
            $end_time = $_POST['end_time'];
            $user_id = $_COOKIE['UID'];
            $created_at = date("Y-m-d H:i:s");

            // Insert task
            $stmt = $_conn->prepare("INSERT INTO tasks (task_title, task_desc, start_date, start_time, end_time, created_at, user_id, category, end_date) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssssssss", $task_title, $task_desc, $start_date, $start_time, $end_time, $created_at, $user_id, $task_group, $end_date);

            $message = $stmt->execute() ? 'Task added successfully' : 'Task failed to upload';
            $stmt->close();
            $_conn->close();

            die("<script>alert('$message');window.location.href='Calendar.htm'</script>");

            break;
        case "Update":
            if (isset($_POST['task_id']) && isset($_POST['status'])) {
                // Update a specific task's status
                $taskID = $_POST['task_id'];
                $newStatus = $_POST['status'];

                $sql = "UPDATE tasks SET status = ? WHERE id = ?";
                $stmt = $_conn->prepare($sql);
                $stmt->bind_param("si", $newStatus, $taskID);

                echo $stmt->execute() ? "success" : "error";
                $stmt->close();
            } else {
                // Update overdue tasks, checking both date and time
                $currentDateTime = date('Y-m-d H:i:s');

                $sql = "UPDATE tasks 
                            SET status = 'Timeout' 
                            WHERE CONCAT(end_date, ' ', end_time) < ? 
                            AND (status != 'Timeout' AND status != 'Complete')";

                $stmt = $_conn->prepare($sql);
                $stmt->bind_param("s", $currentDateTime);

                echo $stmt->execute() ? "success" : "error";
                $stmt->close();
            }
            $_conn->close();
            break;
        case "Delete":
            $task_id = isset($_POST["task_id"]) ? $_POST["task_id"] : null;
            $status = isset($_POST["status"]) ? $_POST["status"] : null;



            $stmt = $_conn->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->bind_param("i", $task_id);

            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Task deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to delete task"]);
            }
            $stmt->close();
            $_conn->close();
            break;

        case "Category":
            header('Content-Type: application/json');

            if (!isset($_COOKIE['UID'])) {
                echo json_encode(["success" => false, "message" => "User not authenticated"]);
                exit();
            }

            $userID = $_COOKIE['UID'];

            // Validate userID to be numeric
            if (!is_numeric($userID)) {
                echo json_encode(["success" => false, "message" => "Invalid user ID"]);
                exit();
            }

            try {
                $sql = "SELECT DISTINCT category FROM tasks WHERE user_id = ?";
                $stmt = $_conn->prepare($sql);
                $stmt->bind_param("i", $userID);
                $stmt->execute();
                $result = $stmt->get_result();

                $categories = [];
                while ($row = $result->fetch_assoc()) {
                    $categories[] = $row['category'];
                }

                // Close the statement and connection
                $stmt->close();
                $_conn->close();

                // Ensure JSON response is always structured properly
                echo json_encode([
                    "success" => true,
                    "categories" => $categories
                ]);
            } catch (Exception $e) {
                echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
            }
            exit();
    }
}
