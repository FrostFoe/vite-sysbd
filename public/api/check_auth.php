<?php
require_once "api_header.php";

if (basename(__FILE__) === basename($_SERVER["SCRIPT_FILENAME"])) {
    // header("Content-Type: application/json"); // Already done in api_header.php

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
