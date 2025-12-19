<?php

function sanitize_html($html)
{
    if (empty($html)) {
        return "";
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);

    if (
        !$dom->loadHTML(
            mb_convert_encoding("<div>$html</div>", "HTML-ENTITIES", "UTF-8"),
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
        )
    ) {
        libxml_clear_errors();
        return "";
    }

    libxml_clear_errors();

    $allowed_tags = [
        "p",
        "b",
        "strong",
        "i",
        "em",
        "u",
        "a",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "br",
        "img",
        "blockquote",
        "span",
        "div",
    ];

    $allowed_attrs = ["href", "src", "alt", "title", "class", "target", "rel"];

    $strip_tags = [
        "script",
        "style",
        "iframe",
        "object",
        "embed",
        "applet",
        "link",
        "meta",
    ];

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query("//*");

    for ($i = $nodes->length - 1; $i >= 0; $i--) {
        $node = $nodes->item($i);

        if (in_array(strtolower($node->nodeName), $strip_tags)) {
            $node->parentNode->removeChild($node);
            continue;
        }

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

        if ($node->hasAttributes()) {
            foreach (iterator_to_array($node->attributes) as $attr) {
                if (!in_array(strtolower($attr->name), $allowed_attrs)) {
                    $node->removeAttribute($attr->name);
                    continue;
                }

                if (in_array(strtolower($attr->name), ["href", "src"])) {
                    $url = $attr->value;

                    if (
                        preg_match(
                            "/^\s*(?:javascript|vbscript|data|file|php|phar|zlib|glob|ssh2|expect|ogg|ftp|sftp):/i",
                            $url,
                        )
                    ) {
                        $node->removeAttribute($attr->name);
                    } elseif (
                        !preg_match("/^\s*(?:https?|mailto|#|\/)/i", $url)
                    ) {
                        $node->removeAttribute($attr->name);
                    }
                }

                if (
                    strtolower($attr->name) === "target" &&
                    strtolower($attr->value) === "_blank"
                ) {
                    $node->setAttribute("rel", "noopener noreferrer");
                }
            }
        }
    }

    $body = $dom->getElementsByTagName("div")->item(0);
    $sanitized_html = "";
    if ($body) {
        foreach ($body->childNodes as $child) {
            $sanitized_html .= $dom->saveHTML($child);
        }
    }

    return $sanitized_html;
}
