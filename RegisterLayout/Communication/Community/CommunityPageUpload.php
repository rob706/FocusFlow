<?php
    @include_once("../../config.php");
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="<?php echo $webroot; ?>/RegisterLayout/Registered.css">
    <link rel="stylesheet" href="<?php echo $webroot; ?>/RegisterLayout/Responsive.css">
    <title>File Upload</title>
</head>

<body class="CM__POPUP">

    <h2 class="CM__POPUP__TITLE"><?php echo $_GET['team'] ?> : Upload a File</h2>
    <form class="CM__POPUP__FORM" action="CommunityBackend.php" method="POST" enctype="multipart/form-data" onsubmit="return validateFileSize()">
        <!-- send team name to back end -->
        <input type="hidden" name="action" value="UploadFile">
        <input type="hidden" name="team_name" value="<?php echo htmlspecialchars($_GET['team']); ?>">
        <input class="CM__POPUP__INPUT" type="file" name="file" required>
        <button type="submit" name="upload" class="CM__POPUP__BUTTON">Upload</button>
    </form>

</body>

<script>
    function validateFileSize() {
        const maxSize = 40 * 1024 * 1024; // 40MB
        const fileInput = document.querySelector('input[type="file"]');

        if (fileInput.files.length > 0) {
            const fileSize = fileInput.files[0].size;
            if (fileSize > maxSize) {
                fileInput.value = "";
                alert("File size exceeds 40MB! Please choose a smaller file.");
                return false;
            }
        }
        return true;
    }
</script>

</html>