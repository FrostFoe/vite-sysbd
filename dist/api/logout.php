<?php
require_once "api_header.php";
session_destroy();
echo json_encode(["success" => true]);
?>
