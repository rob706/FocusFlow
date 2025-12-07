<?php

session_start();
include "conn.php";


include "AccountVerify.php";
requireAuthentication($_conn);

@include_once("../config.php");

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar </title>

    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="icon" href="img\SMALL_CLOCK_ICON.ico">
    <link rel="stylesheet" href="Registered.css">
    <link rel="stylesheet" href="Responsive.css">
</head>

<body>
    <?php
    include "header.php";
    ?>
    <main>
        <?php
        include "sidebar.php";
        ?>

        <article class="GOAL__MAIN">
            <div class="GOAL__TITLE" style="display: flex; justify-content:space-between; align-items:center;">
                <h2>Your Goals</h2>
                <div>
                    <button class="GOAL__SET" onclick="togglePopup()">Add Goal</button>
                    <button class="GOAL__SET" onclick="toggleProgressPopup()">Update Goal</button>
                    <button class="GOAL__SET" onclick="toggleRemovalPopup()">Remove Goal</button>
                    <script>
                        function toggleProgressPopup() {
                            let form = document.getElementById("progressForm");
                            form.style.display = (form.style.display === "none" || form.style.display === "") ? "block" : "none";
                        }

                        function toggleRemovalPopup() {
                            let form = document.getElementById("removalForm");
                            form.style.display = (form.style.display === "none" || form.style.display === "") ? "block" : "none";
                        }
                    </script>
                </div>
            </div>
            <div class="GOAL__INPUT" style="display: none;">
                <h4>Set your goal</h4>
                <form action="<?php echo $webroot; ?>/RegisterLayout/Goal/GoalBackend.php" method="POST" class="GOAL__FORM">
                    <input type="hidden" name="action" value="Add">

                    <label class="INPUT__BOX">
                        <input type="text" name="goal_title" class="INPUT__INPUT" required>
                        <span class="INPUT__PLACEHOLDER">Goal Title</span>
                    </label>

                    <label class="INPUT__BOX">
                        <input type="text" name="goal_description" class="INPUT__INPUT" required>
                        <span class="INPUT__PLACEHOLDER">Description</span>
                    </label>


                    <label class="INPUT__BOX">
                        <select name="goal_type" required>
                            <option value="short-term">Short-Term</option>
                            <option value="long-term">Long-Term</option>
                        </select>
                        <span class="INPUT__PLACEHOLDER AUTOFOCUS" id="goal_ph">Goal Type</span>
                    </label>

                    <label class="INPUT__BOX">
                        <input type="date" name="start_time" id="start_time" class="INPUT__INPUT" max="2050-01-01" required>
                        <span class="INPUT__PLACEHOLDER AUTOFOCUS" id="start_time_ph">Starting Date</span>
                    </label>

                    <label class="INPUT__BOX">
                        <input type="date" name="end_time" id="end_time" class="INPUT__INPUT" max="2050-01-01" required>
                        <span class="INPUT__PLACEHOLDER AUTOFOCUS" id="end_time_ph">Ending Date</span>
                    </label>


                    <label class="INPUT__BOX">
                        <input type="datetime-local" name="reminder_time" id="reminder_time">
                        <span class="INPUT__PLACEHOLDER AUTOFOCUS" id="remainder_ph">Reminder Time</span>
                    </label>

                    <button type="submit" class="GOAL__SET">Set Goal</button>
                </form>
            </div>
            <div class="GOAL__DISPLAY">
                <?php

                $user_id = $_COOKIE['UID'];

                $sql = "SELECT * FROM goals WHERE user_id = ?";
                $stmt = $_conn->prepare($sql);
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $result = $stmt->get_result();

                $goals = [];
                if ($result->num_rows > 0) {
                    while ($row = $result->fetch_assoc()) {
                        $goals[] = $row;
                    }
                }

                $stmt->close();
                ?>

                <?php if (!empty($goals)): ?>
                    <?php foreach ($goals as $goal): ?>
                        <?php $goalClass = (htmlspecialchars($goal['status']) === 'completed') ? 'COMP' : ((htmlspecialchars($goal['status']) === 'in-progress') ? 'PROG' : 'DUE'); ?>
                        <div class="GOAL__CARD <?php echo $goalClass ?> ">
                            <h3 class="GOAL__TITLE"><?= htmlspecialchars($goal['goal_title']) ?></h3>
                            <p><strong>Goal ID:</strong> <?= htmlspecialchars($goal['goal_id']) ?></p>
                            <p><strong>Type:</strong> <?= htmlspecialchars($goal['goal_type']) ?></p>
                            <p><strong>Progress:</strong> <?= htmlspecialchars($goal['progress']) ?>%</p>
                            <p><strong>Status:</strong> <?= htmlspecialchars($goal['status']) ?></p>
                            <p><strong>Reminder:</strong> <?= htmlspecialchars($goal['reminder_time']) ?></p>

                            <div class="GOAL__BAR">
                                <div class="GOAL__BAR_FILL" style="width: <?= htmlspecialchars($goal['progress']) ?>%;">
                                    <?= htmlspecialchars($goal['progress']) ?>%
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>No goals set yet.</p>
                <?php endif; ?>
            </div>



            <div id="progressForm" style="display: none;">
                <form action="Goal.php" id="goalUpdateForm" method="POST">
                    <label>Goal ID:</label>
                    <input type="number" name="goal_id" required>

                    <label>Progress:</label>
                    <input type="number" name="progress" min="0" max="100" required>

                    <button type="submit" class="GOAL__SET UPDATE__GOAL">Update Progress</button>
                </form>
                <?php

                $user_id = $_COOKIE['UID'];

                if ($_SERVER["REQUEST_METHOD"] === 'POST') {
                    if (isset($_POST['goal_id']) && isset($_POST['progress'])) {
                        $goal_id = $_POST['goal_id'];
                        $progress = $_POST['progress'];

                        $sql = "UPDATE goals SET progress = ?, 
                status = CASE WHEN ? = 100 THEN 'completed' ELSE 'in-progress' END 
                WHERE goal_id = ? AND user_id = ?";

                        $stmt = $_conn->prepare($sql);
                        $stmt->bind_param("iiii", $progress, $progress, $goal_id, $user_id);

                        if ($stmt->execute()) {
                            if ($stmt->affected_rows > 0) {
                                echo "<script>alert('Goal Updated, Keep it up!')</script>";
                            } else {
                                echo "<script>alert('No goal found with the given ID for this user.')</script>";
                            }
                        } else {
                            $_SESSION['message'] = "Error: " . $_conn->error;
                        }

                        $stmt->close();
                        $_conn->close();

                        // ✅ Redirect to clear $_POST data
                        echo "<script>window.location.href='Goal.php'</script>";
                    } else {
                        $_SESSION['message'] = "Error: Missing goal_id or progress!";
                    }
                }
                ?>
            </div>
            <div id="removalForm" style="display: none;">
                <form action="<?php echo $webroot; ?>/RegisterLayout/Goal/GoalBackend.php" id="goalUpdateForm" method="POST">
                    <h3>Enter Goal ID to remove</h3>
                    <label>Goal ID:</label>
                    <input type="hidden" name="action" value="Remove">
                    <input type="hidden" name="action" value="Remove">
                    <input type="number" name="goal_id" required>

                    <button type="submit" class="GOAL__SET UPDATE__GOAL">Update Progress</button>
                </form>
            </div>
        </article>
    </main>
    <script src="Registered.js" defer></script>
    <script src="Goal/Goal.js" defer></script>
</body>

</html>