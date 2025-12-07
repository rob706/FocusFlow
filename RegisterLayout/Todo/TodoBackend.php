<?php 
    session_start();

    @include_once("../../config.php");
    
    include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

    
    // Set timezone to Asia/Kuala_Lumpur
    date_default_timezone_set('Asia/Kuala_Lumpur');
    
    $userId = $_COOKIE['UID'];
    
    // Start processing API requests
    processRequests();
    
    function processRequests() {
        global $_conn;
        global $userId;
        
        // Enable error reporting for debugging
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
        
        // Set content type to JSON for all responses
        header("Content-Type: application/json");
        
        // Start output buffering to ensure clean JSON output
        ob_start();
        
        // Get JSON data from request
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Handle GET requests
        if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET['type'])) {
            $type = $_GET['type'];
            
            if (!$type) {
                ob_clean();
                echo json_encode(["error" => "No type specified"]);
                exit;
            } else {
                $response = [];
                
                switch ($type) {
                    case "FinalDate":
                        $response = ["Date" => ["Date"], "Time" => ["Time"]];
                        break;
                    
                    default:
                        $response = ["error" => "Invalid request"];
                }
                
                ob_clean();
                echo json_encode($response);
                exit;
            }
        } 
        // Handle POST requests
        else if ($_SERVER["REQUEST_METHOD"] === "POST") {
            if (!$data || !isset($data['type'])) {
                ob_clean();
                echo json_encode(["status" => "error", "error" => "No data received"]);
                exit;
            } else {
                $response = [];
                
                switch ($data['type']){
                    case "create_group":
                        // Check if the group_name is provided
                        if (!isset($data['group_name']) || empty($data['group_name'])) {
                            $response = ["status" => "error", "error" => "Group name is required"];
                        } else {
                            $groupName = htmlspecialchars($data['group_name'], ENT_QUOTES, 'UTF-8');
                            
                            // Insert the group into the database as a task with only the title
                            $sql = "INSERT INTO tasks (task_title, user_id) VALUES (?, ?)";
                            $stmt = $_conn->prepare($sql);
                            
                            if (!$stmt) {
                                $response = ["status" => "error", "error" => "Database error: " . $_conn->error];
                            } else {
                                $stmt->bind_param("si", $groupName, $userId);
                                
                                if ($stmt->execute()) {
                                    $response = [
                                        "status" => "success", 
                                        "data" => ["group_name" => $groupName]
                                    ];
                                } else {
                                    $response = ["status" => "error", "error" => "Failed to create group: " . $stmt->error];
                                }
                                $stmt->close();
                            }
                        }
                        break;
                        
                    case "create_task":
                        // Check if all required fields are provided
                        if (!isset($data['category'], $data['title'], $data['content'])) {
                            $response = ["status" => "error", "error" => "Missing required task data"];
                        } else {
                            $category = htmlspecialchars($data['category'], ENT_QUOTES, 'UTF-8');
                            $title = htmlspecialchars($data['title'], ENT_QUOTES, 'UTF-8');
                            $content = htmlspecialchars($data['content'], ENT_QUOTES, 'UTF-8');
                            
                            // Calculate deadline based on timer values
                            $days = isset($data['timer']['days']) ? (int)$data['timer']['days'] : 0;
                            $hours = isset($data['timer']['hours']) ? (int)$data['timer']['hours'] : 0;
                            $minutes = isset($data['timer']['minutes']) ? (int)$data['timer']['minutes'] : 0;
                            $seconds = isset($data['timer']['seconds']) ? (int)$data['timer']['seconds'] : 0;
                            
                            // Calculate end date and time
                            $now = new DateTime();
                            $deadline = clone $now;
                            $deadline->modify("+{$days} days +{$hours} hours +{$minutes} minutes +{$seconds} seconds");
                            
                            $endDate = $deadline->format('Y-m-d');
                            $endTime = $deadline->format('H:i:s');
                            
                            // Insert the task into the database
                            $sql = "INSERT INTO tasks (task_title, task_desc, start_date, start_time, end_date, end_time, user_id, category, status) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'incomplete')";
                            
                            $stmt = $_conn->prepare($sql);
                            
                            if (!$stmt) {
                                $response = ["status" => "error", "error" => "Database error: " . $_conn->error];
                            } else {
                                $startDate = date('Y-m-d');
                                $startTime = date('H:i:s');
                                
                                $stmt->bind_param("ssssssss", $title, $content, $startDate, $startTime, $endDate, $endTime, $userId, $category);
                                
                                if ($stmt->execute()) {
                                    $taskId = $stmt->insert_id;
                                    $response = [
                                        "status" => "success", 
                                        "data" => [
                                            "id" => $taskId,
                                            "category" => $category,
                                            "title" => $title,
                                            "description" => $content,
                                            "start_date" => $startDate,
                                            "start_time" => $startTime,
                                            "end_date" => $endDate,
                                            "end_time" => $endTime,
                                            "status" => "incomplete"
                                        ]
                                    ];
                                } else {
                                    $response = ["status" => "error", "error" => "Failed to create task: " . $stmt->error];
                                }
                                $stmt->close();
                            }
                        }
                        break;
                        
                    case "update_task_status":
                        // Check required data
                        if (!isset($data['task_id']) || !isset($data['status'])) {
                            $response = ["status" => "error", "error" => "Missing task_id or status parameter"];
                            break;
                        }

                        // Get and validate parameters
                        $taskId = (int)$data['task_id'];
                        $newStatus = strtolower(htmlspecialchars($data['status'], ENT_QUOTES, 'UTF-8'));
                        
                        // Validate status
                        $validStatuses = ['complete', 'incomplete', 'timeout'];
                        if (!in_array($newStatus, $validStatuses)) {
                            $response = ["status" => "error", "error" => "Invalid status value"];
                            break;
                        }
                        
                        // First verify if this is an actual task (has description)
                        $checkSql = "SELECT task_desc FROM tasks WHERE id = ? AND user_id = ?";
                        $checkStmt = $_conn->prepare($checkSql);
                        $checkStmt->bind_param("ii", $taskId, $userId);
                        $checkStmt->execute();
                        $checkResult = $checkStmt->get_result();
                        $taskData = $checkResult->fetch_assoc();
                        $checkStmt->close();
                        
                        if (!$taskData || empty($taskData['task_desc'])) {
                            $response = [
                                "status" => "error", 
                                "error" => "Cannot update status for categories/groups - only tasks"
                            ];
                            break;
                        }
                        
                        // Direct SQL update - most reliable approach
                        $updateSql = "UPDATE tasks SET status = '$newStatus' WHERE id = $taskId AND user_id = $userId";
                        if ($_conn->query($updateSql)) {
                            $response = [
                                "status" => "success",
                                "data" => [
                                    "task_id" => $taskId,
                                    "new_status" => $newStatus
                                ]
                            ];
                        } else {
                            $response = ["status" => "error", "error" => "Database update failed: " . $_conn->error];
                        }
                        break;
                        
                    case "move_task":
                        if (!isset($data['task_id']) || !isset($data['newCategory'])) {
                            $response = ["status" => "error", "error" => "Missing task_id or newCategory parameter"];
                            break;
                        }
                        
                        $taskId = (int)$data['task_id'];
                        $newCategory = htmlspecialchars($data['newCategory'], ENT_QUOTES, 'UTF-8');
                        $oldCategory = isset($data['oldCategory']) ? htmlspecialchars($data['oldCategory'], ENT_QUOTES, 'UTF-8') : null;
                        
                        // Update category
                        $sql = "UPDATE tasks SET category = ? WHERE id = ? AND user_id = ?";
                        $stmt = $_conn->prepare($sql);
                        if (!$stmt) {
                            $response = ["status" => "error", "error" => "Database error: " . $_conn->error];
                            break;
                        }
                        
                        $stmt->bind_param("sii", $newCategory, $taskId, $userId);
                        
                        if ($stmt->execute()) {
                            // Check if the old category is now empty (if old category known)
                            $categoryNowEmpty = false;
                            if ($oldCategory) {
                                $checkSql = "SELECT COUNT(*) as count FROM tasks WHERE category = ? AND user_id = ? AND task_desc IS NOT NULL";
                                $checkStmt = $_conn->prepare($checkSql);
                                $checkStmt->bind_param("si", $oldCategory, $userId);
                                $checkStmt->execute();
                                $result = $checkStmt->get_result();
                                $row = $result->fetch_assoc();
                                $categoryNowEmpty = ($row['count'] == 0);
                                $checkStmt->close();
                            }
                            
                            $response = [
                                "status" => "success",
                                "data" => [
                                    "task_id" => $taskId,
                                    "newCategory" => $newCategory,
                                    "categoryNowEmpty" => $categoryNowEmpty
                                ]
                            ];
                        } else {
                            $response = ["status" => "error", "error" => "Failed to move task: " . $stmt->error];
                        }
                        $stmt->close();
                        break;
                        
                    case "delete_task":
                        if (!isset($data['task_id'])) {
                            $response = ["status" => "error", "error" => "Missing task_id parameter"];
                            break;
                        }
                        
                        $taskId = (int)$data['task_id'];
                        
                        // Get category before deletion to check if it will be empty
                        $checkSql = "SELECT category FROM tasks WHERE id = ? AND user_id = ?";
                        $checkStmt = $_conn->prepare($checkSql);
                        $checkStmt->bind_param("ii", $taskId, $userId);
                        $checkStmt->execute();
                        $result = $checkStmt->get_result();
                        $category = null;
                        if ($row = $result->fetch_assoc()) {
                            $category = $row['category'];
                        }
                        $checkStmt->close();
                        
                        // Delete the task
                        $sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
                        $stmt = $_conn->prepare($sql);
                        $stmt->bind_param("ii", $taskId, $userId);
                        
                        if ($stmt->execute()) {
                            // Check if the category is now empty
                            $categoryNowEmpty = false;
                            if ($category) {
                                $countSql = "SELECT COUNT(*) as count FROM tasks WHERE category = ? AND user_id = ? AND task_desc IS NOT NULL";
                                $countStmt = $_conn->prepare($countSql);
                                $countStmt->bind_param("si", $category, $userId);
                                $countStmt->execute();
                                $countResult = $countStmt->get_result();
                                $countRow = $countResult->fetch_assoc();
                                $categoryNowEmpty = ($countRow['count'] == 0);
                                $countStmt->close();
                            }
                            
                            $response = [
                                "status" => "success",
                                "data" => [
                                    "categoryNowEmpty" => $categoryNowEmpty
                                ]
                            ];
                        } else {
                            $response = ["status" => "error", "error" => "Failed to delete task: " . $stmt->error];
                        }
                        $stmt->close();
                        break;

                    case "fetch_group_and_task":
                        // Get all tasks for the current user
                        $sql = "SELECT * FROM tasks WHERE user_id = ?";
                        $stmt = $_conn->prepare($sql);
                        $stmt->bind_param("i", $userId);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        $allTasks = $result->fetch_all(MYSQLI_ASSOC);
                        $stmt->close();
                        
                        // First pass: identify all top-level categories (tasks without descriptions)
                        $categories = [];
                        foreach ($allTasks as $task) {
                            // If this is a category entry (no task_desc)
                            if (empty($task['task_desc'])) {
                                $categories[$task['task_title']] = [
                                    'group' => $task['task_title'],
                                    'tasks' => []
                                ];
                            }
                        }
                        
                        // Second pass: add tasks to their categories
                        foreach ($allTasks as $task) {
                            if (!empty($task['task_desc'])) {
                                $groupName = !empty($task['category']) ? $task['category'] : 'Uncategorized';
                                
                                // If category doesn't exist yet, create it
                                if (!isset($categories[$groupName])) {
                                    $categories[$groupName] = [
                                        'group' => $groupName,
                                        'tasks' => []
                                    ];
                                }
                                
                                // Add the task to its category
                                $categories[$groupName]['tasks'][] = [
                                    'id' => $task['id'],
                                    'title' => $task['task_title'],
                                    'description' => $task['task_desc'],
                                    'status' => strtolower($task['status'] ?: 'incomplete'),
                                    'start_date' => $task['start_date'],
                                    'start_time' => $task['start_time'],
                                    'end_date' => $task['end_date'],
                                    'end_time' => $task['end_time']
                                ];
                            }
                        }
                        
                        $response = [
                            "status" => "success",
                            "data" => array_values($categories)
                        ];
                        break;

                    case "delete_group":
                        // Validate required fields
                        if (!isset($data['group_name'])) {
                            $response = ["status" => "error", "error" => "Group name is required"];
                            break;
                        }
                        
                        $groupName = htmlspecialchars($data['group_name'], ENT_QUOTES, 'UTF-8');
                        
                        try {
                            // Begin transaction for safety
                            $_conn->begin_transaction();
                            
                            // Delete all tasks in the group
                            $deleteTasksQuery = "DELETE FROM tasks WHERE category = ? AND user_id = ? AND task_desc IS NOT NULL";
                            $stmt = $_conn->prepare($deleteTasksQuery);
                            $stmt->bind_param('si', $groupName, $userId);
                            $stmt->execute();
                            
                            // Delete the group itself (which is a task entry with that title)
                            $deleteGroupQuery = "DELETE FROM tasks WHERE task_title = ? AND user_id = ? AND (task_desc IS NULL OR task_desc = '')";
                            $stmt = $_conn->prepare($deleteGroupQuery);
                            $stmt->bind_param('si', $groupName, $userId);
                            
                            if ($stmt->execute()) {
                                // Commit transaction
                                $_conn->commit();
                                $response = ["status" => "success"];
                            } else {
                                // Rollback on error
                                $_conn->rollback();
                                $response = ["status" => "error", "error" => "Failed to delete group: " . $_conn->error];
                            }
                        } catch (Exception $e) {
                            // Rollback on exception
                            if ($_conn->ping()) {
                                $_conn->rollback();
                            }
                            $response = ["status" => "error", "error" => "Database error: " . $e->getMessage()];
                        }
                        break;

                    case "update_task_description":
                        if (!isset($data['task_id']) || !isset($data['description'])) {
                            $response = ["status" => "error", "error" => "Missing task_id or description parameter"];
                            break;
                        }
                        
                        $taskId = (int)$data['task_id'];
                        $description = htmlspecialchars($data['description'], ENT_QUOTES, 'UTF-8');
                        
                        // Update the task description
                        $sql = "UPDATE tasks SET task_desc = ? WHERE id = ? AND user_id = ?";
                        $stmt = $_conn->prepare($sql);
                        
                        if (!$stmt) {
                            $response = ["status" => "error", "error" => "Database error: " . $_conn->error];
                            break;
                        }
                        
                        $stmt->bind_param("sii", $description, $taskId, $userId);
                        
                        if ($stmt->execute()) {
                            $response = [
                                "status" => "success",
                                "data" => [
                                    "task_id" => $taskId,
                                    "description" => $description
                                ]
                            ];
                        } else {
                            $response = ["status" => "error", "error" => "Failed to update description: " . $stmt->error];
                        }
                        $stmt->close();
                        break;
                        
                    default:
                        $response = ["status" => "error", "error" => "Invalid request type: " . $data['type']];
                }
                
                ob_clean();
                echo json_encode($response);
                exit;
            }
        } else {
            ob_clean();
            echo json_encode(["status" => "error", "error" => "Invalid request method"]);
            exit;
        }
    }
?>
