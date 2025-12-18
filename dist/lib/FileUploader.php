<?php
/**
 * File Upload Utility Class
 * Handles all file uploads securely
 */

class FileUploader
{
    private $config;
    private $publicPath;

    public function __construct()
    {
        $this->config = require __DIR__ . "/../config/uploads.php";

        // Detect the correct base path
        // Check if we're in dist/lib (production nested) or lib (production root) or public/lib (development)
        $currentDir = __DIR__;

        if (strpos($currentDir, "/dist/") !== false) {
            // We're in dist/lib - go up to dist/
            $this->publicPath = __DIR__ . "/../../";
        } elseif (basename(dirname(dirname($currentDir))) === "public") {
            // We're in public/lib (development) - go up to public/
            $this->publicPath = __DIR__ . "/../../public/";
        } else {
            // We're in domain root/lib (production) - go up to domain root/
            $this->publicPath = __DIR__ . "/../";
        }
    }

    /**
     * Upload a document
     */
    public function uploadDocument($file)
    {
        return $this->upload($file, "documents");
    }

    /**
     * Upload an image
     */
    public function uploadImage($file)
    {
        return $this->upload($file, "images");
    }

    /**
     * Upload a video
     */
    public function uploadVideo($file)
    {
        return $this->upload($file, "videos");
    }

    /**
     * Upload audio
     */
    public function uploadAudio($file)
    {
        return $this->upload($file, "audio");
    }

    /**
     * Generic upload handler
     */
    private function upload($file, $type)
    {
        // Validate file
        if (!isset($file["tmp_name"]) || $file["error"] !== UPLOAD_ERR_OK) {
            throw new Exception(
                "File upload failed: " . $this->getUploadError($file["error"]),
            );
        }

        $config = $this->config[$type];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

        // Block potentially dangerous file types (case-insensitive)
        $dangerousExtensions = [
            'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'php8', 'phps', 'pht', 'phar',
            'html', 'htm', 'js', 'jsp', 'jspx', 'pl', 'py', 'rb', 'sh', 'sql', 'htaccess',
            'htpasswd', 'exe', 'com', 'bat', 'cmd', 'pif', 'scr', 'vbs', 'vbe', 'jar',
            'shtml', 'shtm', 'stm', 'asa', 'asax', 'ascx', 'ashx', 'asmx', 'axd',
            'c', 'cpp', 'csharp', 'vb', 'asp', 'aspx', 'asmx', 'swf', 'cgi', 'dll', 'sys',
            'ps1', 'psm1', 'psd1', 'reg', 'msi', 'msp', 'lnk', 'inf', 'application', 'gadget',
            'hta', 'cpl', 'msc', 'ws', 'wsf', 'wsh', 'jse'
        ];

        // Check for dangerous extensions (including case variations like .PhP, .pHp, etc.)
        $originalExt = pathinfo($file["name"], PATHINFO_EXTENSION);
        if (in_array(strtolower($originalExt), $dangerousExtensions)) {
            throw new Exception("File type not allowed (potentially dangerous): ." . $originalExt);
        }

        // Validate extension
        if (!in_array($ext, $config["extensions"])) {
            throw new Exception("File type not allowed: ." . $ext);
        }

        // Validate size
        if ($file["size"] > $config["max_size"]) {
            throw new Exception(
                "File too large. Maximum: " .
                    $config["max_size"] / 1024 / 1024 .
                    "MB",
            );
        }

        // Verify MIME type
        if (
            $this->config["security"]["verify_mime_type"] &&
            isset($config["mime_types"])
        ) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file["tmp_name"]);
            finfo_close($finfo);

            if (!in_array($mime, $config["mime_types"])) {
                throw new Exception("Invalid file type: " . $mime);
            }
        }

        // Create directory
        $uploadDir = $this->publicPath . $config["directory"] . "/";
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $uniqueName = $this->generateFilename($type, $ext);
        $uploadPath = $uploadDir . $uniqueName;

        // Move file
        if (!move_uploaded_file($file["tmp_name"], $uploadPath)) {
            throw new Exception("Failed to save file");
        }

        // Set permissions
        @chmod($uploadPath, 0644);

        // Optimize images if needed
        if (
            $type === "images" &&
            $this->config["security"]["compress_images"]
        ) {
            $this->compressImage($uploadPath, $ext);
        }

        // Return relative path
        return $config["directory"] . "/" . $uniqueName;
    }

    /**
     * Generate unique filename
     */
    private function generateFilename($type, $ext)
    {
        $format = $this->config["filename_format"];
        $format = str_replace("{type}", $type, $format);
        $format = str_replace("{timestamp}", time(), $format);
        $format = str_replace("{random}", bin2hex(random_bytes(4)), $format);
        $format = str_replace("{ext}", $ext, $format);
        return $format;
    }

    /**
     * Compress image
     */
    private function compressImage($path, $ext)
    {
        if (!extension_loaded("gd")) {
            return;
        }

        $image = null;
        switch ($ext) {
            case "jpg":
            case "jpeg":
                $image = imagecreatefromjpeg($path);
                break;
            case "png":
                $image = imagecreatefrompng($path);
                break;
            case "gif":
                $image = imagecreatefromgif($path);
                break;
            case "webp":
                if (function_exists("imagecreatefromwebp")) {
                    $image = imagecreatefromwebp($path);
                }
                break;
        }

        if ($image) {
            switch ($ext) {
                case "jpg":
                case "jpeg":
                    imagejpeg($image, $path, 85);
                    break;
                case "png":
                    imagepng($image, $path, 8);
                    break;
            }
            imagedestroy($image);
        }
    }

    /**
     * Get upload error message
     */
    private function getUploadError($code)
    {
        $errors = [
            UPLOAD_ERR_OK => "No error",
            UPLOAD_ERR_INI_SIZE => "File exceeds upload_max_filesize",
            UPLOAD_ERR_FORM_SIZE => "File exceeds MAX_FILE_SIZE",
            UPLOAD_ERR_PARTIAL => "File partially uploaded",
            UPLOAD_ERR_NO_FILE => "No file uploaded",
            UPLOAD_ERR_NO_TMP_DIR => "Temporary folder missing",
            UPLOAD_ERR_CANT_WRITE => "Failed to write file",
            UPLOAD_ERR_EXTENSION => "Upload stopped by extension",
        ];
        return $errors[$code] ?? "Unknown error";
    }
}
?>
