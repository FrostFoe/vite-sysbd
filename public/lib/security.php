<?php

function sanitize_html($html)
{
    if (empty($html)) {
        return "";
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);

    // A hack to handle UTF-8 characters correctly.
    // The alternative is to use the 'encoding' parameter in loadHTML,
    // but that requires a proper HTML document with a meta charset tag.
    if (!$dom->loadHTML(mb_convert_encoding("<div>$html</div>", 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD)) {
        // If loading fails, return an empty string for safety.
        // You might want to log the errors from libxml_get_errors() here.
        libxml_clear_errors();
        return "";
    }

    libxml_clear_errors();

    $allowed_tags = [
        "p", "b", "strong", "i", "em", "u", "a", "ul", "ol", "li",
        "h1", "h2", "h3", "h4", "h5", "h6", "br", "img",
        "blockquote", "span", "div"
    ];

    $allowed_attrs = ["href", "src", "alt", "title", "class", "target", "rel"];

    // A list of tags to be removed completely with their content.
    $strip_tags = ['script', 'style', 'iframe', 'object', 'embed', 'applet', 'link', 'meta'];

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query('//*');

    for ($i = $nodes->length - 1; $i >= 0; $i--) {
        $node = $nodes->item($i);

        // Remove dangerous tags and their content
        if (in_array(strtolower($node->nodeName), $strip_tags)) {
            $node->parentNode->removeChild($node);
            continue;
        }

        // Unwrap unwanted tags but keep their content
        if (!in_array(strtolower($node->nodeName), $allowed_tags)) {
            if ($node->hasChildNodes()) {
                $fragment = $dom->createDocumentFragment();
                while ($node->firstChild) {
                    $fragment->appendChild($node->firstChild);
                }
                $node->parentNode->replaceChild($fragment, $node);
            } else {
                $node->parentNode->removeChild($node);
            }
            continue;
        }

        // Sanitize attributes of allowed tags
        if ($node->hasAttributes()) {
            foreach (iterator_to_array($node->attributes) as $attr) {
                if (!in_array(strtolower($attr->name), $allowed_attrs)) {
                    $node->removeAttribute($attr->name);
                    continue;
                }

                // Sanitize 'href' and 'src' attributes
                if (in_array(strtolower($attr->name), ['href', 'src'])) {
                    $url = $attr->value;
                    // A more robust regex to filter out dangerous protocols.
                    // It also checks for html entities.
                    if (preg_match('/^\s*(?:javascript|vbscript|data|file|php|phar|zlib|glob|ssh2|expect|ogg|ftp|sftp):/i', $url)) {
                        $node->removeAttribute($attr->name);
                    }
                    // Optional: You might also want to ensure that the URL is well-formed.
                    // and points to http, https, or mailto.
                    elseif (!preg_match('/^\s*(?:https?|mailto|#|\/)/i', $url)) {
                        $node->removeAttribute($attr->name);
                    }
                }

                // Sanitize 'target' attribute to prevent tabnabbing
                if (strtolower($attr->name) === 'target' && strtolower($attr->value) === '_blank') {
                    $node->setAttribute('rel', 'noopener noreferrer');
                }
            }
        }
    }

    // Extract the sanitized HTML content from the div wrapper.
    $body = $dom->getElementsByTagName('div')->item(0);
    $sanitized_html = '';
    if ($body) {
        foreach ($body->childNodes as $child) {
            $sanitized_html .= $dom->saveHTML($child);
        }
    }

    return $sanitized_html;
}
