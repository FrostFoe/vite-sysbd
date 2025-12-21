<?php
require_once "../config/db.php";
require_once "../lib/security.php";

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (
    !isset($input["title_bn"]) &&
    !isset($input["title_en"]) &&
    !isset($input["content_bn"]) &&
    !isset($input["content_en"])
) {
    http_response_code(400);
    echo json_encode([
        "error" =>
            "Missing required content parameters. At least one title or content field is required.",
    ]);
    exit();
}

// Clean and prepare input
$title_bn = isset($input["title_bn"]) ? trim($input["title_bn"]) : "";
$title_en = isset($input["title_en"]) ? trim($input["title_en"]) : "";
$content_bn = isset($input["content_bn"])
    ? trim(strip_tags($input["content_bn"]))
    : "";
$content_en = isset($input["content_en"])
    ? trim(strip_tags($input["content_en"]))
    : "";

$api_key = $gemini_api_key;
if (empty($api_key) || $api_key === "YOUR_GEMINI_API_KEY_HERE") {
    http_response_code(500);
    echo json_encode(["error" => "AI service not configured"]);
    exit();
}

// Construct prompt
$prompt_content =
    "Analyze the following article content and generate SEO-optimized metadata in English.\n\n";

if (!empty($title_en)) {
    $prompt_content .= "Title (English): " . $title_en . "\n";
}
if (!empty($title_bn)) {
    $prompt_content .= "Title (Bengali): " . $title_bn . "\n";
}
if (!empty($content_en)) {
    $prompt_content .=
        "Content (English): " . substr($content_en, 0, 3000) . "...\n";
} // Truncate for token limit safety
if (!empty($content_bn)) {
    $prompt_content .=
        "Content (Bengali): " . substr($content_bn, 0, 3000) . "...\n";
}

$prompt_content .=
    "\n\nProvide the output strictly in valid JSON format with the following keys:\n";
$prompt_content .=
    "- meta_title: A concise and catchy title for search engines (max 60 characters). English preferred.\n";
$prompt_content .=
    "- meta_description: A compelling summary for search results (max 160 characters). English preferred.\n";
$prompt_content .=
    "- meta_keywords: A comma-separated string of 5-8 relevant keywords. English preferred.\n";
$prompt_content .=
    "\nReturn ONLY the JSON object. Do not wrap it in markdown code blocks.";

$request_body = [
    "contents" => [
        [
            "parts" => [
                [
                    "text" => $prompt_content,
                ],
            ],
        ],
    ],
    "generationConfig" => [
        "responseMimeType" => "application/json",
    ],
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$api_key}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode($request_body),
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curl_error = curl_error($curl);
curl_close($curl);

if ($curl_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to communicate with AI service",
        "details" => $curl_error,
    ]);
    exit();
}

if ($http_code !== 200) {
    http_response_code(500);
    echo json_encode([
        "error" => "AI service returned an error",
        "status" => $http_code,
        "raw_response" => $response,
    ]);
    exit();
}

$gemini_response = json_decode($response, true);

if (!isset($gemini_response["candidates"][0]["content"]["parts"][0]["text"])) {
    http_response_code(500);
    echo json_encode([
        "error" => "Invalid response from AI service",
        "raw_response" => $gemini_response,
    ]);
    exit();
}

$generated_text = trim(
    $gemini_response["candidates"][0]["content"]["parts"][0]["text"],
);

// Robust JSON extraction
if (preg_match("/\{[\s\S]*\}/", $generated_text, $matches)) {
    $json_str = $matches[0];
} else {
    $json_str = $generated_text;
}

$metadata = json_decode($json_str, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to parse AI response",
        "raw_response" => $generated_text,
        "json_error" => json_last_error_msg(),
    ]);
    exit();
}

http_response_code(200);
echo json_encode([
    "success" => true,
    "metadata" => $metadata,
]);
