-- Focus Flow
-- DB Setup Script Version: 1.0

--
-- Database: `assignment`
--

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ContactListID` int(11) NOT NULL,
  `FriendID` int(11) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `CONTACTLISTID` (`ContactListID`),
  KEY `FRIEND_ID` (`FriendID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `contactlist`
--

CREATE TABLE `contactlist` (
  `ContactID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(10) NOT NULL,

  PRIMARY KEY (`ContactID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `directmessage`
--

CREATE TABLE `directmessage` (
  `DirectMessageID` int(11) NOT NULL AUTO_INCREMENT,
  `MessageText` varchar(255) NOT NULL,
  `MessageType` varchar(10) NOT NULL,
  `CreatedTime` datetime NOT NULL DEFAULT current_timestamp(),
  `SenderID` int(10) NOT NULL,
  `ReceiverID` int(10) NOT NULL,
  `FriendID` int(11) NOT NULL,
  `Status` enum('sent','delivered','read','failed') NOT NULL DEFAULT 'sent',

  PRIMARY KEY (`DirectMessageID`),
  KEY `RelationID` (`FriendID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `team_name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_data` longblob DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friendrequests`
--

CREATE TABLE `friendrequests` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(10) UNSIGNED NOT NULL,
  `receiver_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),

  PRIMARY KEY (`request_id`),
  UNIQUE KEY `sender_id` (`sender_id`,`receiver_id`),
  KEY `ReceiverID` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `friend_id` int(10) UNSIGNED NOT NULL,
  `status` enum('None','Blocked','Accepted') NOT NULL DEFAULT 'None',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `friend_id` (`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `goal_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `goal_title` varchar(255) NOT NULL,
  `goal_description` text DEFAULT NULL,
  `goal_type` enum('short-term','long-term') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `progress` int(11) DEFAULT 0 CHECK (`progress` between 0 and 100),
  `status` enum('in-progress','completed','failed') DEFAULT 'in-progress',
  `reminder_time` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`goal_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupbannedusers`
--

CREATE TABLE `groupbannedusers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_time` datetime NOT NULL DEFAULT current_timestamp(),
  `GroupID` int(11) NOT NULL,
  `UserID` int(11) UNSIGNED NOT NULL,

  PRIMARY KEY (`id`),
  KEY `BannedUser` (`UserID`),
  KEY `BannedUserGroup` (`GroupID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupchat`
--

CREATE TABLE `groupchat` (
  `GroupMessageID` int(11) NOT NULL AUTO_INCREMENT,
  `GroupMessage` varchar(255) NOT NULL,
  `CreatedTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `GroupID` int(11) NOT NULL,
  `GroupMessageStatus` enum('Seen','Delivered') NOT NULL DEFAULT 'Delivered',
  `GroupStatus` enum('muted','none') NOT NULL DEFAULT 'none',
  `GroupMessageType` enum('TEXT','FILE','VIDEO','AUDIO','IMAGE') DEFAULT 'TEXT',
  `user_id` int(10) UNSIGNED NOT NULL,

  PRIMARY KEY (`GroupMessageID`),
  KEY `GroupId` (`GroupID`),
  KEY `USER_ID_FK` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupinfo`
--

CREATE TABLE `groupinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `GroupName` varchar(50) NOT NULL,
  `GroupDesc` varchar(100) NOT NULL,
  `GroupMemberNo` int(11) NOT NULL DEFAULT 0,
  `GroupCreatedTime` datetime NOT NULL DEFAULT current_timestamp(),
  `GroupStatus` varchar(10) NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groupusers`
--

CREATE TABLE `groupusers` (
  `GroupID` int(11) NOT NULL AUTO_INCREMENT,
  `GroupRole` enum('ADMIN','CO_ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `GroupUserStatus` enum('Muted','Banned','None') NOT NULL DEFAULT 'None',
  `CreatedTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `UserID` int(10) UNSIGNED NOT NULL,
  `GroupInfoID` int(11) NOT NULL,

  PRIMARY KEY (`GroupID`),
  KEY `UserIdForeignKey` (`UserID`),
  KEY `GroupInfo_ID` (`GroupInfoID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_tasks`
--

CREATE TABLE `group_tasks` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_name` varchar(255) NOT NULL,
  `assigned_by` int(10) UNSIGNED NOT NULL,
  `assigned_to` int(10) UNSIGNED NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `task_description` text NOT NULL,
  `status` enum('pending','in progress','completed') DEFAULT 'pending',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `due_date` date NOT NULL,
  `completed_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `assigned_to` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `group_tasks`
--
DELIMITER $$
CREATE TRIGGER `update_group_task_completed_time` BEFORE UPDATE ON `group_tasks` FOR EACH ROW BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SET NEW.completed_at = NOW();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message_id` int(11) DEFAULT NULL,
  `sender_id` int(10) UNSIGNED DEFAULT NULL,
  `type` enum('DirectMessage','system','GroupMessage') NOT NULL,
  `notification_message` varchar(255) DEFAULT NULL,
  `status` enum('unread','read') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `sender_id` (`sender_id`),
  KEY `message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `profession_role` varchar(255) NOT NULL,
  `ease_of_use` varchar(255) NOT NULL,
  `most_used_feature` varchar(255) NOT NULL,
  `impact` varchar(255) NOT NULL,
  `suggestions` text NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_title` varchar(255) NOT NULL,
  `task_desc` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(10) UNSIGNED NOT NULL,
  `status` enum('Incomplete','Complete','Timeout') DEFAULT 'Incomplete',
  `category` varchar(255) NOT NULL,
  `end_date` date DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `tasks`
--
DELIMITER $$
CREATE TRIGGER `update_completed_time` BEFORE UPDATE ON `tasks` FOR EACH ROW BEGIN
    IF NEW.status = 'Complete' AND OLD.status != 'Complete' THEN
        SET NEW.completed_at = NOW();
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_task_status_timeout` BEFORE UPDATE ON `tasks` FOR EACH ROW BEGIN
    IF NEW.end_date < NOW() AND NEW.status != 'completed' THEN
        SET NEW.status = 'Timeout';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

CREATE TABLE `team` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `team_name` varchar(255) NOT NULL,
  `leader_id` int(10) UNSIGNED NOT NULL,
  `member_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  KEY `leader_id` (`leader_id`),
  KEY `member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userblocks`
--

CREATE TABLE `userblocks` (
  `BlockID` int(11) NOT NULL AUTO_INCREMENT,
  `blocker_id` int(10) UNSIGNED NOT NULL,
  `blocked_id` int(10) UNSIGNED NOT NULL,
  `Created_time` datetime NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`BlockID`),
  KEY `BlockerID` (`blocker_id`),
  KEY `BlockedID` (`blocked_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `usertype` tinyint(1) DEFAULT 0,
  `last_login` timestamp NOT NULL DEFAULT current_timestamp(),
  `auth_token` varchar(255) DEFAULT NULL,
  `token_expires` datetime DEFAULT NULL,
  `UserStatus` enum('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active',
  `suspension_end` datetime DEFAULT NULL,
  `suspension_reason` text DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_auth_token` (`auth_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `usertype`, `last_login`, `auth_token`, `token_expires`, `UserStatus`, `suspension_end`, `suspension_reason`) VALUES
(NULL, 'Admin', 'admin@gmail.com', '$2y$10$v26PlIub5VDYq3KBCoVIROBcEJ72K3Lsu22NSJgbQARdcS8sD9iay', '2025-03-29 15:38:53', 1, '2025-04-09 01:43:44', '8923e0627828930447b8e82d11269a934f241d20ffb8f111', '2025-05-09 09:41:42', 'Inactive', NULL, NULL),
(NULL, 'Moderator', 'c@gmail.com', '$2y$10$yI/K2N/ZRvxUFN4hV/pRau85xqfnkxNKtAbHFIT1HZmDSkJc0EIT2', '2025-03-30 13:58:16', 2, '2025-04-09 01:41:31', '05f57070feb8c6280b33dfd5202377c6e3e5339b3f634792', '2025-05-09 09:41:06', 'Inactive', NULL, NULL);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `activate_user_on_login` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    -- Check if the user is currently inactive and is logging in within 1 month
    IF OLD.UserStatus = 'Inactive' AND NEW.last_login >= NOW() - INTERVAL 1 MONTH THEN
        -- Set the status to Active
        SET NEW.UserStatus = 'Active';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_user_update` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    IF NEW.last_login < NOW() - INTERVAL 1 MONTH THEN
        SET NEW.UserStatus = 'Inactive';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `welcome_back_notification` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    IF OLD.UserStatus = 'Inactive' AND NEW.last_login >= NOW() - INTERVAL 1 DAY THEN

        SET NEW.UserStatus = 'Active';


        INSERT INTO notifications (user_id,type ,notification_message, created_at)
        VALUES (NEW.id, 'system','Welcome back! Your account is now active.', NOW());
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_activity_log`
--

CREATE TABLE `user_activity_log` (
  `log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Login','Logout','Signup') NOT NULL,
  `result` enum('Success','Fail') NOT NULL,

  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contact`
--
ALTER TABLE `contact`
  ADD CONSTRAINT `CONTACTLISTID` FOREIGN KEY (`ContactListID`) REFERENCES `contactlist` (`ContactID`),
  ADD CONSTRAINT `FRIEND_ID` FOREIGN KEY (`FriendID`) REFERENCES `friends` (`id`);

--
-- Constraints for table `directmessage`
--
ALTER TABLE `directmessage`
  ADD CONSTRAINT `RelationID` FOREIGN KEY (`FriendID`) REFERENCES `friends` (`id`);

--
-- Constraints for table `friendrequests`
--
ALTER TABLE `friendrequests`
  ADD CONSTRAINT `ReceiverID` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `SenderID` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `groupbannedusers`
--
ALTER TABLE `groupbannedusers`
  ADD CONSTRAINT `BannedUser` FOREIGN KEY (`UserID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `BannedUserGroup` FOREIGN KEY (`GroupID`) REFERENCES `groupinfo` (`id`);

--
-- Constraints for table `groupchat`
--
ALTER TABLE `groupchat`
  ADD CONSTRAINT `GroupId` FOREIGN KEY (`GroupID`) REFERENCES `groupinfo` (`id`),
  ADD CONSTRAINT `USER_ID_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `groupusers`
--
ALTER TABLE `groupusers`
  ADD CONSTRAINT `GroupInfo_ID` FOREIGN KEY (`GroupInfoID`) REFERENCES `groupinfo` (`id`),
  ADD CONSTRAINT `UserIdForeignKey` FOREIGN KEY (`UserID`) REFERENCES `users` (`id`);

--
-- Constraints for table `group_tasks`
--
ALTER TABLE `group_tasks`
  ADD CONSTRAINT `group_tasks_ibfk_1` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notificationsForDirectMessageID` FOREIGN KEY (`message_id`) REFERENCES `directmessage` (`DirectMessageID`),
  ADD CONSTRAINT `notificationsForGroupMessageID` FOREIGN KEY (`message_id`) REFERENCES `groupchat` (`GroupMessageID`),
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team`
--
ALTER TABLE `team`
  ADD CONSTRAINT `team_ibfk_1` FOREIGN KEY (`leader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `userblocks`
--
ALTER TABLE `userblocks`
  ADD CONSTRAINT `BlockedID` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `BlockerID` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_activity_log`
--
ALTER TABLE `user_activity_log`
  ADD CONSTRAINT `user_activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
