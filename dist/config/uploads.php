<?php
/**
 * Upload Configuration
 * Centralized configuration for all file uploads
 */

return [
    // Base upload directory (relative to public/)
    "base_path" => "assets/uploads",

    // Directory mappings
    "directories" => [
        "images" => "assets/uploads/images",
        "images_articles" => "assets/uploads/images/articles",
        "images_profiles" => "assets/uploads/images/profiles",
        "documents" => "assets/uploads/documents",
        "media" => "assets/uploads/media",
        "media_videos" => "assets/uploads/media/videos",
        "media_audio" => "assets/uploads/media/audio",
    ],

    // File type configurations
    "documents" => [
        "extensions" => [
            "pdf",
            "zip",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "txt",
            "jpg",
            "jpeg",
            "png",
            "mp4",
            "mp3",
        ],
        "max_size" => 104857600, // 100MB
        "directory" => "assets/uploads/documents",
        "mime_types" => [
            "application/pdf",
            "application/zip",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "image/jpeg",
            "image/png",
        ],
    ],

    "images" => [
        "extensions" => ["jpg", "jpeg", "png", "gif", "webp"],
        "max_size" => 5242880, // 5MB
        "directory" => "assets/uploads/images/articles",
        "mime_types" => ["image/jpeg", "image/png", "image/gif", "image/webp"],
    ],

    "videos" => [
        "extensions" => ["mp4", "webm", "avi", "mov", "mkv"],
        "max_size" => 524288000, // 500MB
        "directory" => "assets/uploads/media/videos",
        "mime_types" => [
            "video/mp4",
            "video/webm",
            "video/x-msvideo",
            "video/quicktime",
            "video/x-matroska",
        ],
    ],

    "audio" => [
        "extensions" => ["mp3", "wav", "ogg", "m4a", "flac"],
        "max_size" => 104857600, // 100MB
        "directory" => "assets/uploads/media/audio",
        "mime_types" => [
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/mp4",
            "audio/flac",
        ],
    ],

    // Security settings
    "security" => [
        "verify_mime_type" => true,
        "scan_virus" => false, // Set to true if ClamAV is available
        "generate_thumbnails" => true,
        "compress_images" => true,
    ],

    // Filename generation
    "filename_format" => "{type}_{timestamp}_{random}.{ext}",
];
?>
