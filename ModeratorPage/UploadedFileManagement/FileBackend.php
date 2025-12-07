<?php

@include_once("../../config.php");

include_once $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === "fetch") {
    fetchFiles($_conn);
} elseif ($action === "delete" && isset($_GET['id'])) {
    deleteFile($_conn, $_GET['id']);
} elseif ($action === "download" && isset($_GET['id'])) {
    downloadFile($_conn, $_GET['id']);
} elseif ($action === "preview" && isset($_GET['id'])) {
    previewFile($_conn, $_GET['id']); // New preview function
} else {
    echo json_encode(["error" => "Invalid action"]);
}


// Fetch all files
function fetchFiles($_conn)
{
    $sql = "SELECT id, file_name, file_type, file_size, uploaded_at FROM files";
    $result = $_conn->query($sql);

    $files = [];
    while ($row = $result->fetch_assoc()) {
        $row['file_size'] = round($row['file_size'] / 1024, 2); // Convert bytes to KB
        $files[] = $row;
    }

    echo json_encode($files);
}

// Delete file
function deleteFile($_conn, $id)
{
    $stmt = $_conn->prepare("DELETE FROM files WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => "File deleted successfully."]);
    } else {
        echo json_encode(["error" => "Failed to delete file."]);
    }

    $stmt->close();
    exit();
}

// Download file
function downloadFile($_conn, $id)
{
    $file_name = '';
    $file_type = '';
    $file_data = '';

    $stmt = $_conn->prepare("SELECT file_name, file_type, file_data FROM files WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->store_result();

    // Bind variables **before** fetching
    $stmt->bind_result($file_name, $file_type, $file_data);

    if ($stmt->fetch()) {
        header("Content-Type: " . $file_type);
        header("Content-Disposition: attachment; filename=\"" . basename($file_name) . "\"");
        header("Content-Length: " . mb_strlen($file_data, '8bit')); // Corrected file size

        echo $file_data;
    } else {
        http_response_code(404);
        echo "File not found!";
    }

    $stmt->close();
}

// for preview
function previewFile($_conn, $id)
{
    $file_name = '';
    $file_type = '';
    $file_data = '';

    $stmt = $_conn->prepare("SELECT file_name, file_type, file_data FROM files WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($file_name, $file_type, $file_data);

    if ($stmt->fetch()) {
        header("Content-Type: " . $file_type);
        
        // Don't force download for previewable files
        if (strpos($file_type, "image/") !== false || strpos($file_type, "video/") !== false || $file_type === "application/pdf") {
            echo $file_data;
        } else {
            echo json_encode(["error" => "Preview not available for this file type."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["error" => "File not found!"]);
    }

    $stmt->close();
}
