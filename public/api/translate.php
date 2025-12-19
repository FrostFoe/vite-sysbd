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

if (strlen($text) > 50000) {
    http_response_code(400);
    echo json_encode(['error' => 'Content is too long. Maximum 50000 characters allowed']);
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

$api_key = $gemini_api_key;
if (empty($api_key) || $api_key === 'YOUR_GEMINI_API_KEY_HERE') {
    http_response_code(500);
    echo json_encode(['error' => 'Translation service not configured']);
    exit;
}

$language_names = [
    'bn' => 'Bengali',
    'en' => 'English'
];

function extractMediaAndText($html) {
    $media_placeholders = [];
    $media_counter = 0;
    
    $text_only = $html;
    
    $img_pattern = '/<img[^>]*>/i';
    preg_match_all($img_pattern, $text_only, $img_matches);
    foreach ($img_matches[0] as $img_tag) {
        $placeholder = "###MEDIA_" . $media_counter . "###";
        $media_placeholders[$placeholder] = $img_tag;
        $media_counter++;
    }
    $text_only = preg_replace($img_pattern, '', $text_only);
    
    $video_pattern = '/<video[^>]*>.*?<\/video>/is';
    preg_match_all($video_pattern, $text_only, $video_matches);
    foreach ($video_matches[0] as $video_tag) {
        $placeholder = "###MEDIA_" . $media_counter . "###";
        $media_placeholders[$placeholder] = $video_tag;
        $media_counter++;
    }
    $text_only = preg_replace($video_pattern, '', $text_only);
    
    $iframe_pattern = '/<iframe[^>]*>.*?<\/iframe>/is';
    preg_match_all($iframe_pattern, $text_only, $iframe_matches);
    foreach ($iframe_matches[0] as $iframe_tag) {
        $placeholder = "###MEDIA_" . $media_counter . "###";
        $media_placeholders[$placeholder] = $iframe_tag;
        $media_counter++;
    }
    $text_only = preg_replace($iframe_pattern, '', $text_only);
    
    $text_only = strip_tags($text_only, '<p><br><strong><em><ul><li><ol><h1><h2><h3><h4><h5><h6><blockquote><a><div><span>');
    
    $text_only = htmlspecialchars_decode($text_only, ENT_QUOTES);
    $text_only = trim($text_only);
    
    return [
        'text' => $text_only,
        'media' => $media_placeholders
    ];
}

$content_data = extractMediaAndText($text);
$text_to_translate = $content_data['text'];
$media_elements = $content_data['media'];

if (empty($text_to_translate)) {
    http_response_code(400);
    echo json_encode(['error' => 'কোনো পাঠ্য বিষয়বস্তু খুঁজে পাওয়া যায়নি অনুবাদের জন্য | No text content found to translate']);
    exit;
}

if (strlen($text_to_translate) > 5000) {
    http_response_code(400);
    echo json_encode(['error' => 'পাঠ্য খুব দীর্ঘ (৫০০০ অক্ষরের চেয়ে বেশি) | Text is too long (more than 5000 characters)']);
    exit;
}

$prompt = sprintf(
    "Translate the following text from %s to %s. Provide only the translation without any explanation or additional text.\n\nText: %s",
    $language_names[$source_lang],
    $language_names[$target_lang],
    $text_to_translate
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

$final_content = $translated_text;
foreach ($media_elements as $placeholder => $media_html) {
    $final_content = str_replace($placeholder, $media_html, $final_content);
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'translation' => $final_content,
    'source_lang' => $source_lang,
    'target_lang' => $target_lang
]);
