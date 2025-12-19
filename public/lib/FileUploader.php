<?php

class FileUploader
{
    private $config;
    private $publicPath;

    public function __construct()
    {
        $this->config = require __DIR__ . "/../config/uploads.php";

        $currentDir = __DIR__;

        if (strpos($currentDir, "/dist/") !== false) {
            $this->publicPath = __DIR__ . "/../../";
        } elseif (basename(dirname(dirname($currentDir))) === "public") {
            $this->publicPath = __DIR__ . "/../../public/";
        } else {
            $this->publicPath = __DIR__ . "/../";
        }
    }

    public function uploadDocument($file)
    {
        return $this->upload($file, "documents");
    }

    public function uploadImage($file)
    {
        return $this->upload($file, "images");
    }

    public function uploadVideo($file)
    {
        return $this->upload($file, "videos");
    }

    public function uploadAudio($file)
    {
        return $this->upload($file, "audio");
    }

    private function upload($file, $type)
    {
        if (!isset($file["tmp_name"]) || $file["error"] !== UPLOAD_ERR_OK) {
            throw new Exception(
                "File upload failed: " . $this->getUploadError($file["error"]),
            );
        }

        $config = $this->config[$type];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

        $dangerousExtensions = [
            "php",
            "phtml",
            "php3",
            "php4",
            "php5",
            "php7",
            "php8",
            "phps",
            "pht",
            "phar",
            "html",
            "htm",
            "js",
            "jsp",
            "jspx",
            "pl",
            "py",
            "rb",
            "sh",
            "sql",
            "htaccess",
            "htpasswd",
            "exe",
            "com",
            "bat",
            "cmd",
            "pif",
            "scr",
            "vbs",
            "vbe",
            "jar",
            "shtml",
            "shtm",
            "stm",
            "asa",
            "asax",
            "ascx",
            "ashx",
            "asmx",
            "axd",
            "c",
            "cpp",
            "csharp",
            "vb",
            "asp",
            "aspx",
            "asmx",
            "swf",
            "cgi",
            "dll",
            "sys",
            "ps1",
            "psm1",
            "psd1",
            "reg",
            "msi",
            "msp",
            "lnk",
            "inf",
            "application",
            "gadget",
            "hta",
            "cpl",
            "msc",
            "ws",
            "wsf",
            "wsh",
            "jse",
        ];

        $originalExt = pathinfo($file["name"], PATHINFO_EXTENSION);
        if (in_array(strtolower($originalExt), $dangerousExtensions)) {
            throw new Exception(
                "File type not allowed (potentially dangerous): ." .
                    $originalExt,
            );
        }

        if (!in_array($ext, $config["extensions"])) {
            throw new Exception("File type not allowed: ." . $ext);
        }

        if ($file["size"] > $config["max_size"]) {
            throw new Exception(
                "File too large. Maximum: " .
                    $config["max_size"] / 1024 / 1024 .
                    "MB",
            );
        }

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

        $uploadDir = $this->publicPath . $config["directory"] . "/";
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $uniqueName = $this->generateFilename($type, $ext);
        $uploadPath = $uploadDir . $uniqueName;

        if (!move_uploaded_file($file["tmp_name"], $uploadPath)) {
            throw new Exception("Failed to save file");
        }

        @chmod($uploadPath, 0644);

        if (
            $type === "images" &&
            $this->config["security"]["compress_images"]
        ) {
            $this->compressImage($uploadPath, $ext);
        }

        return $config["directory"] . "/" . $uniqueName;
    }

    private function generateFilename($type, $ext)
    {
        $format = $this->config["filename_format"];
        $format = str_replace("{type}", $type, $format);
        $format = str_replace("{timestamp}", time(), $format);
        $format = str_replace("{random}", bin2hex(random_bytes(4)), $format);
        $format = str_replace("{ext}", $ext, $format);
        return $format;
    }

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
