<?php
require_once '../config/db.php';
require_once '../lib/security.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['text']) || !isset($input['source_lang']) || !isset($input['target_lang'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters: text, source_lang, target_lang']);
    exit;
}

$text = trim($input['text']);
$source_lang = $input['source_lang'];
$target_lang = $input['target_lang'];

if (empty($text)) {
    http_response_code(400);
    echo json_encode(['error' => 'Text cannot be empty']);
    exit;
}

if (strlen($text) > 5000) {
    http_response_code(400);
    echo json_encode(['error' => 'Text exceeds maximum length of 5000 characters']);
    exit;
}

$valid_langs = ['bn', 'en'];
if (!in_array($source_lang, $valid_langs) || !in_array($target_lang, $valid_langs)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid language codes. Supported: bn, en']);
    exit;
}

if ($source_lang === $target_lang) {
    http_response_code(400);
    echo json_encode(['error' => 'Source and target languages must be different']);
    exit;
}

$api_key = getenv('GEMINI_API_KEY');
if (empty($api_key)) {
    http_response_code(500);
    echo json_encode(['error' => 'Translation service not configured']);
    exit;
}

$language_names = [
    'bn' => 'Bengali',
    'en' => 'English'
];

$prompt = sprintf(
    "Translate the following text from %s to %s. Provide only the translation without any explanation or additional text.\n\nText: %s",
    $language_names[$source_lang],
    $language_names[$target_lang],
    $text
);

$request_body = [
    'contents' => [
        [
            'parts' => [
                [
                    'text' => $prompt
                ]
            ]
        ]
    ]
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={$api_key}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($request_body),
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curl_error = curl_error($curl);
curl_close($curl);

if ($curl_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to communicate with translation service', 'details' => $curl_error]);
    exit;
}

if ($http_code !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Translation service returned an error', 'status' => $http_code]);
    exit;
}

$gemini_response = json_decode($response, true);

if (!isset($gemini_response['candidates'][0]['content']['parts'][0]['text'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response from translation service']);
    exit;
}

$translated_text = trim($gemini_response['candidates'][0]['content']['parts'][0]['text']);

http_response_code(200);
echo json_encode([
    'success' => true,
    'translation' => $translated_text,
    'source_lang' => $source_lang,
    'target_lang' => $target_lang
]);
