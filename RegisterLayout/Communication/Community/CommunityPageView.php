<?php
    @include_once("../../config.php");
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="<?php echo $webroot; ?>/RegisterLayout/Registered.css">
    <link rel="stylesheet" href="<?php echo $webroot; ?>/RegisterLayout/Responsive.css">
    <title>Team Files</title>
</head>

<body class="CM__POPUP">

    <h2 class="CM__POPUP__TITLE"><?php echo htmlspecialchars($_GET['team']); ?> : Files</h2>

    <?php
    // Database connection
    include_once $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/RegisterLayout/conn.php";

    if ($_conn->connect_error) {
        die("Connection failed: " . $_conn->connect_error);
    }

    $teamName = $_conn->real_escape_string($_GET['team']);
    $sql = "SELECT id, file_name, file_type, uploaded_at FROM files WHERE team_name = '$teamName'";
    $result = $_conn->query($sql);
    ?>

    <!-- File List -->
    <div class="CM__FILE__LIST">
        <?php if ($result->num_rows > 0): ?>
            <ul>
                <?php while ($row = $result->fetch_assoc()): ?>
                    <li>
                        <a href="CommnityDownload.php?id=<?php echo $row['id']; ?>">
                            <?php echo htmlspecialchars($row['file_name']); ?>
                        </a>
                        <span>(Uploaded: <?php echo $row['uploaded_at']; ?>)</span>
                    </li>
                <?php endwhile; ?>
            </ul>
        <?php else: ?>
            <p>No files uploaded yet.</p>
        <?php endif; ?>
    </div>

</body>

</html>