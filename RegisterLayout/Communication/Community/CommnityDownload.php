<?php
// Database connection

@include_once("../../config.php");

include_once $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

if (isset($_GET['id'])) {
    $fileId = intval($_GET['id']);

    $sql = "SELECT file_name, file_type, file_data FROM files WHERE id = ?";
    $stmt = $_conn->prepare($sql);
    $stmt->bind_param("i", $fileId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($fileName, $fileType, $fileData);
    
    if ($stmt->fetch()) {
        header("Content-Type: " . $fileType);
        header("Content-Disposition: attachment; filename=" . $fileName);
        echo $fileData;
    } else {
        echo "File not found.";
    }

    $stmt->close();
}

$_conn->close();
?>