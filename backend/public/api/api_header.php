<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../src/config/db.php";

function send_response($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit();
}
?>
