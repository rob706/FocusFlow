<?php
session_start();
include "conn.php";
include "AccountVerify.php";

@include_once("../config.php");

requireAuthentication($_conn);

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account</title>

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
        <article class="CONTAINER">
            <div>
                <h1 class="CALENDAR_TITLE">Account Management</h1>
                <div class="ACC__BUTTON__CONTAINER">
                    <button class="ACC__BUTTON" data-target="section1">Account Details</button>
                    <button class="ACC__BUTTON" data-target="section2">Select a Theme</button>
                </div>
            </div>
            <div class="ACCOUNT__MAIN">
                <section id="section1" class="PROFILE__SEC ACCOUNT__SECTION">
                    <div class="PROFILE__PIC__CONT">
                        <span class="material-icons" style="font-size:10rem;">
                            account_circle
                        </span>
                    </div>
                    <div>
                        <?php
                        if (isset($_COOKIE['UID'])) {
                            $userID = $_COOKIE['UID'];

                            $stmt = $_conn->prepare("SELECT name, email FROM users WHERE id = ?");
                            $stmt->bind_param("i", $userID);

                            $stmt->execute();
                            $result = $stmt->get_result();

                            if ($result->num_rows > 0) {
                                $row = $result->fetch_assoc();

                                $user = [
                                    "name" => $row["name"],
                                    "email" => $row["email"],
                                ];
                            } else {
                                $user = ["error" => "User not found"];
                            }

                            $stmt->close();
                        } else {
                            $user = ["error" => "UID cookie not set"];
                        }

                        $_conn->close();

                        // Pass user data to JavaScript
                        echo "<script>";
                        echo "var User = " . json_encode($user) . ";";
                        echo "</script>";
                        ?>


                        <form action="<?php echo $webroot ?>/RegisterLayout/Account/AccountUpdate.php" method="POST" class="PROFILE__DETAILS" onsubmit="return verifyPassword()">

                            <div>
                                <p>Username :</p>
                                <label class="INPUT__BOX">
                                    <input type="text" name="username" class="INPUT__INPUT">
                                    <span class="INPUT__PLACEHOLDER" id="profile_name"></span>
                                </label>
                            </div>

                            <div>
                                <p>Email :</p>
                                <label class="INPUT__BOX">
                                    <input type="email" name="email" class="INPUT__INPUT">
                                    <span class="INPUT__PLACEHOLDER" id="profile_email"></span>
                                </label>
                            </div>

                            <div>
                                <p>Password</p>
                                <label class="INPUT__BOX">
                                    <input type="password" name="password" class="INPUT__INPUT" minlength="8"
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
                                        placeholder="********"
                                        title="Must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.">
                                    <span class="INPUT__PLACEHOLDER" id="profile_password"></span>
                                </label>
                            </div>

                            <div>
                                <p>Confirm Current Password</p>
                                <label class="INPUT__BOX">
                                    <input type="password" id="current_password" name="current_password" class="INPUT__INPUT" required>
                                    <span class="INPUT__PLACEHOLDER" id="accPassword">Enter current password</span>
                                </label>
                            </div>


                            <button type="submit" class="PROFILE__SAVE">Save Changes</button>
                            <button type="reset" class="PROFILE__SAVE" onclick="resetField()">Reset</button>
                        </form>
                    </div>
                    <div class="PROFILE__LOGOUT">
                        <a class="PROFILE__LOGOUT_B" href="<?php echo $webroot; ?>/RegisterLayout/Account/AccountLogOutBackend.php">Log Out</a>
                    </div>
                </section>


                <div id="section2" class="ACCOUNT__SECTION">
                    <article class="ACCOUNT__THEME">
                        <div>
                            <h3>Default</h3>
                            <button data-theme="default2" class="SETTING__BUTTON CLICKABLE" style="background-color: #3b3b3b; color: white;" onclick="changeTheme('default')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="default2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Ground Earthy</h3>
                            <button data-theme="theme_earth2" class="SETTING__BUTTON CLICKABLE" style="background-color: #7A3E1D; color: white;" onclick="changeTheme('theme_earth')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_earth2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Cyberpunk Neon</h3>
                            <button data-theme="theme_neon2" class="SETTING__BUTTON CLICKABLE" style="background-color: #8BE9FD; color: black;" onclick="changeTheme('theme_neon')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_neon2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Nature Forest</h3>
                            <button data-theme="theme_forest2" class="SETTING__BUTTON CLICKABLE" style="background-color: #52796F; color: white;" onclick="changeTheme('theme_forest')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_forest2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Ocean Breeze</h3>
                            <button data-theme="theme_blue2" class="SETTING__BUTTON CLICKABLE" style="background-color: #5B92E5; color: white;" onclick="changeTheme('theme_blue')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_blue2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Royal Amethyst</h3>
                            <button data-theme="theme_purple2" class="SETTING__BUTTON CLICKABLE" style="background-color: #8E44AD; color: white;" onclick="changeTheme('theme_purple')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_purple2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Twilight Glow</h3>
                            <button data-theme="theme_sunset2" class="SETTING__BUTTON CLICKABLE" style="background-color: #E67E22; color: white;" onclick="changeTheme('theme_sunset')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_sunset2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Shadow Eclipse</h3>
                            <button data-theme="theme_midnight2" class="SETTING__BUTTON CLICKABLE" style="background-color: #212529; color: gold;" onclick="changeTheme('theme_midnight')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_midnight2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                        <div>
                            <h3>Blossom Kiss</h3>
                            <button data-theme="theme_sakura2" class="SETTING__BUTTON CLICKABLE" style="background-color: #FF69B4; color: white;" onclick="changeTheme('theme_sakura')">
                                <div>
                                    <span class="material-icons ACCOUNT__RADIO">
                                        radio_button_unchecked
                                    </span>
                                </div>
                                <div class="THEME__DIV">
                                    <div data-theme="theme_sakura2" class="THEME_SHAPE"></div>
                                </div>
                            </button>
                        </div>

                    </article>
                </div>
            </div>

        </article>

    </main>


    <script src="Registered.js" defer></script>
    <script src="../RegisterLayout/Account/Account.js" defer></script>
</body>

</html>