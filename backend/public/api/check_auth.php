<?php
session_start();

// Only output JSON if this file is called directly, not when included
if (basename(__FILE__) === basename($_SERVER["SCRIPT_FILENAME"])) {
    header("Content-Type: application/json");

    if (isset($_SESSION["user_id"])) {
        echo json_encode([
            "authenticated" => true,
            "user" => [
                "email" => $_SESSION["user_email"],
                "role" => $_SESSION["user_role"],
            ],
        ]);
    } else {
        echo json_encode(["authenticated" => false]);
    }
}
?>
