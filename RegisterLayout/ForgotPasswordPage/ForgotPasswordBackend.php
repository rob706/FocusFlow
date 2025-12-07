<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

$response = [];
// Check if the form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the form data
    // Compare this snippet from FocusFlow/RegisterLayout/ForgotPasswordPage/ForgotPasswordBackend.php:
    $name = isset($_POST['username']) ? $_POST['username'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

    // Fetch user details from the database
    $sql = "SELECT * FROM users WHERE email = ? AND name = ?";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("ss", $email, $name);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $userData = $result->fetch_assoc();
        if ($userData) {
            // Get the new password from POST
            $newPassword = $confirmPassword;
            
            // Hash the new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Use prepared statement for UPDATE to prevent SQL injection
            $updateSql = "UPDATE users SET password = ? WHERE email = ? AND name = ?";
            $updateStmt = $_conn->prepare($updateSql);
            $updateStmt->bind_param("sss", $hashedPassword, $email, $name);
            
            if ($updateStmt->execute()) {
                $response = [
                    'status' => 'success',
                    'message' => 'Password updated successfully.'
                ];
            } else {
                $response = [
                    'status' => 'error',
                    'message' => $_conn->error
                ];
            }
        }
        $updateStmt->close();
        $_conn->close();
    }else {
        $response = [
            'status' => 'error',
            'message' => 'User not found.'
        ];
    }
} 
else {
    $response = [
        'status' => 'error',
        'message' => 'Invalid request method.'
    ];
}
reponse($response);

function reponse ($response) {
    header('Content-Type: application/json');

    echo json_encode($response);
}
?>
