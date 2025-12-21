<?php
/**
 * Executes a prepared SQL statement with parameter binding and error handling.
 *
 * @param string $sql SQL query to execute
 * @param string $type Parameter types (e.g., "s" for string, "i" for integer)
 * @param mixed $params Single value or array of values to bind
 * @param string $errorMessage Error message if no results (default: "No data found")
 * @param string $returnType Return format: "array", "single", "none", or "bool"
 * @param string $action SQL operation type: "SELECT", "INSERT", "UPDATE"
 * @param bool|null $Exit Error behavior: true (exit on error), false (return JSON error), null (return false)
 * 
 * @return mixed Query result based on $returnType, or false on failure
 * @throws Exception If query preparation fails
 */

function Query($sql, $type, $params, $errorMessage = "No data found", $returnType = "none", $action = "SELECT", $Exit = true){
    global $_conn;
    $stmt = $_conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database error: " . $_conn->error);
    }
    
    // Only bind parameters if the type is not empty and params are provided
    if ($type !== "" && $type !== null && $params !== null) {
        if (is_array($params) && count($params) > 1) {
            // This is a single array of parameters - extract values
            $bindParams = array_values($params);
            $stmt->bind_param($type, ...$bindParams);
        } else if ($params !== null) {
            // This is either a single value or already the right format
            $stmt->bind_param($type, $params);
        }
    }

    $stmt->execute();
    
    if($action === "SELECT"){
        $result = $stmt->get_result();
        // Only throw exceptions for no results if we're not doing a boolean check
        if($result->num_rows === 0 && $returnType !== "bool" && $returnType !== "none"){
            if (!empty($errorMessage)) {
                if ($Exit) {
                    $response = [
                        'status' => 'warning',
                        'message' => $errorMessage
                    ]; 
                    echo json_encode($response);
                    exit;
                }else if($Exit === null){
                    return false;
                } else {
                    $response = [
                        'status' => 'warning',
                        'message' => $errorMessage
                    ]; 
                    echo json_encode($response);
                    return false;
                }
            }
        }
        if ($returnType === "array") {
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            $stmt->close();
            return $rows;
        } else if($returnType === "single"){
            $row = $result->fetch_assoc();
            $stmt->close();
            return $row;
        } else if ($returnType === "none") {
            $stmt->close();
            return true;
        } else if ($returnType === "bool"){
            $stmt->close();
            return $result->num_rows > 0;
        } else {
            // Default case if an invalid return type is provided
            $stmt->close();
            return false;
        }
    }
    if($action === "INSERT" || $action === "UPDATE" || $action === "DELETE"){
        if ($stmt->affected_rows === 0) {
            if (!empty($errorMessage)) {
                if ($Exit) {
                    $response = [
                        'status' => 'error',
                        'message' => $errorMessage
                    ]; 
                    echo json_encode($response);
                    exit;
                }else if($Exit === null){
                    return false;
                } else {
                    $response = [
                        'status' => 'error',
                        'message' => $errorMessage
                    ]; 
                    echo json_encode($response);
                    return false;
                }
            }
        }
        $stmt->close();
        return true;
    }
}