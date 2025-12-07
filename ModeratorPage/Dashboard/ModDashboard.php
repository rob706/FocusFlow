<?php

@include_once("../../config.php");

include $_SERVER['DOCUMENT_ROOT'] . "".$webroot."/ModeratorPage/checklogin.php"; ?>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../Mod.css">
    <link rel="stylesheet" href="../ModResponsive.css">
    <link rel="shortcut icon" href="../img/icons8-staff-32.png" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <title>Moderator Dashboard</title>
</head>

<body>
    <?php include "../ModSidebar.php"; ?>

    <main class="DASH__MAIN">
        <h1>Moderator Dashboard</h1>

        <section class="WIDGET__CONTAINER one">
            <div class="WIDGET one flex-col">
                <h3 class="WIDGET__TITLE">Overall FocusFlow Stats</h3>

                <div class="flex-col" style="flex-grow:1;justify-content: center;">
                    <?php include "ModDashboardBackend.php" ?>
                    <div class="WIDGET__OVERALL" style="display: flex; justify-content:space-around; flex-direction:column; flex-grow:1; gap:1rem;">
                        <div class="WIDGET__STATS">
                            <p>Total Users: <?php echo $total_users; ?></p>
                            <p>Total Teams: <?php echo $total_teams; ?></p>
                            <p>Total Group Messages: <?php echo $total_group_messages; ?></p>
                            <p>Total Direct Messages: <?php echo $total_direct_messages; ?></p>
                        </div>

                        <div>
                            <div class="WIDGET__PROGRESS">
                                <p>Group Task Progress</p>
                                <div style="display: flex; gap:1rem;">
                                    <p>Pending : <?php echo ($group_task_result['pending']); ?></p>
                                    <p>In Progress : <?php echo ($group_task_result['in_progress']); ?></p>
                                    <p>Completed : <?php echo ($group_task_result['completed']); ?></p>
                                    <strong>Total Task : <?php echo array_sum($group_task_result); ?></strong>
                                </div>
                            </div>

                            <div class="WIDGET__PROGRESS__BAR">
                                <div class="progress red" style="width: <?php echo ($group_task_result['pending'] / array_sum($group_task_result)) * 100; ?>%"></div>
                                <div class="progress yellow" style="width: <?php echo ($group_task_result['in_progress'] / array_sum($group_task_result)) * 100; ?>%"></div>
                                <div class="progress green" style="width: <?php echo ($group_task_result['completed'] / array_sum($group_task_result)) * 100; ?>%"></div>
                            </div>
                        </div>

                        <div>
                            <div class="WIDGET__PROGRESS">
                                <p>Individual Task Progress</p>
                                <div style="display: flex; gap:1rem;">
                                    <p>Timeout : <?php echo ($individual_task_result['timeout']); ?></p>
                                    <p>Incomplete : <?php echo ($individual_task_result['incomplete']); ?></p>
                                    <p>Completed : <?php echo ($individual_task_result['complete']); ?></p>
                                    <strong>Total Task : <?php echo array_sum($individual_task_result); ?></strong>
                                </div>
                            </div>

                            <div class="WIDGET__PROGRESS__BAR">
                                <div class="progress red" style="width: <?php echo ($individual_task_result['timeout'] / array_sum($individual_task_result)) * 100; ?>%"></div>
                                <div class="progress yellow" style="width: <?php echo ($individual_task_result['incomplete'] / array_sum($individual_task_result)) * 100; ?>%"></div>
                                <div class="progress green" style="width: <?php echo ($individual_task_result['complete'] / array_sum($individual_task_result)) * 100; ?>%"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="WIDGET two">

                <table class="WIDGET__USERM" class="flex-row" style="align-items: center; height:100%">
                    <tr>
                        <th colspan="2" class="WIDGET__TITLE">User & Team Management</th>
                    </tr>
                    <tr>
                        <td>Active Users Today</td>
                        <td><?php echo $active_users; ?></td>
                    </tr>
                    <tr>
                        <th colspan="2">Most Active Users <br> <small>(Interactions: Complete task/ Send Messages)</small></th>
                    </tr>
                    <?php while ($row = $most_active_result->fetch_assoc()) { ?>
                        <tr>
                            <td><?php echo $row['name']; ?></td>
                            <td><?php echo $row['interactions']; ?> Interactions</td>
                        </tr>
                    <?php } ?>
                    <tr>
                        <th colspan="2">Team's Member</th>
                    </tr>
                    <?php while ($row = $team_participation_result->fetch_assoc()) { ?>
                        <tr>
                            <td><?php echo $row['team_name']; ?></td>
                            <td><?php echo $row['total_users']; ?> Members</td>
                        </tr>
                    <?php } ?>
                </table>

            </div>
            <div class="WIDGET three">
                <h3 class="WIDGET__TITLE">Task Management</h3>
                <div class="flex-row" style="align-items: center; justify-content: space-around">
                    <div>
                        <p><strong>Task Completion Rate:</strong> <?php echo round($completion_rate, 2); ?>%</p>
                        <p><strong>Total Tasks:</strong> <?php echo $total_tasks; ?></p>
                        <p><strong>Overdue Tasks:</strong> <?php echo $overdue_count; ?></p>
                        <p><strong>Pending Tasks:</strong> <?php echo $pending_tasks; ?></p>
                        <p><strong>Completed Tasks:</strong> <?php echo $completed_tasks; ?></p>
                    </div>


                    <div class="chart-container">
                        <canvas id="taskChart"></canvas>
                    </div>
                </div>
                <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        var ctx = document.getElementById("taskChart").getContext("2d");
                        var taskChart = new Chart(ctx, {
                            type: "pie",
                            data: {
                                labels: ["Completed", "Pending", "Overdue"],
                                datasets: [{
                                    data: [<?php echo $completed_tasks; ?>, <?php echo $pending_tasks; ?>, <?php echo $overdue_count; ?>],
                                    backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
                                    hoverBackgroundColor: ["#218838", "#e0a800", "#c82333"]
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }
                        });
                    });
                </script>
            </div>

            <div class="WIDGET four">
                <h3 class="WIDGET__TITLE">Messaging Insights</h3>
                <div class="flex-row" style=" margin-top:1rem; align-items: center; justify-content: space-around">
                    <div>
                        <h4>Most Messaged Users</h4>
                        <ul>
                            <?php while ($row = $most_messaged_result->fetch_assoc()): ?>
                                <li><?php echo $row['name'] . " - " . $row['total_messages'] . " messages"; ?></li>
                            <?php endwhile; ?>
                        </ul>
                    </div>

                    <div>
                        <h4>Group Chats vs. Direct Messages</h4>
                        <div class="chart-container">
                            <canvas id="messageChart"></canvas>
                        </div>
                    </div>
                </div>
                <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        var ctx = document.getElementById("messageChart").getContext("2d");
                        var messageChart = new Chart(ctx, {
                            type: "pie",
                            data: {
                                labels: ["Group Chats", "Direct Messages"],
                                datasets: [{
                                    data: [<?php echo $group_messages; ?>, <?php echo $direct_messages; ?>],
                                    backgroundColor: ["#007bff", "#ff6384"],
                                    hoverBackgroundColor: ["#0056b3", "#e6004c"]
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    }
                                }
                            }
                        });
                    });
                </script>
            </div>

            <div class="WIDGET five flex-col" style="overflow-y: hidden;">
                <h3 class="WIDGET__TITLE">File Uploads & Storage</h3>

                <div class="flex-row" style="justify-content: center; flex-grow: 1;">
                    <div class="flex-col DASH__FILE__INFO" style="justify-content: space-around; flex-grow: 1; margin: 0 auto; align-items: center; gap:1rem;">
                        <div class="flex-row">
                            <span class="material-icons">
                                star
                            </span>
                            <div>
                                <h4>Top Uploaders</h4>
                                <ul>
                                    <?php while ($row = $top_uploaders_result->fetch_assoc()): ?>
                                        <li><?php echo $row['name'] . " : " . $row['file_count'] . " files"; ?></li>
                                    <?php endwhile; ?>
                                </ul>
                            </div>
                        </div>

                        <div class="flex-row">
                            <span class="material-icons">
                                folder
                            </span>
                            <div>
                                <h4>Total Storage Used</h4>
                                <p><?php echo $total_storage_mb; ?> MB</p>
                            </div>
                        </div>
                    </div>

                    <div class="DASH__RECENT__UPLOAD">
                        <div class="recent-header flex-row">
                            <span class="material-icons">schedule</span>
                            <h4>Recent File Uploads</h4>
                        </div>
                        <div class="recent-table-container">
                            <table class="recent-table">
                                <thead>
                                    <tr>
                                        <th>File</th>
                                        <th>Uploaded By</th>
                                        <th>Uploaded On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php while ($row = $recent_files_result->fetch_assoc()): ?>
                                        <tr>
                                            <td><?php echo $row['file_name']; ?></td>
                                            <td><?php echo $row['username']; ?></td>
                                            <td><?php echo $row['uploaded_at']; ?></td>
                                        </tr>
                                    <?php endwhile; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </section>

    </main>

</body>
<script src="../Mod.js"></script>
<script src="ModDashboard.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

</html>