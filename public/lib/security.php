<?php

function sanitize_html($html)
{
    if (empty($html)) {
        return "";
    }

    // Suppress warnings for malformed HTML
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);

    // Hack to handle UTF-8 correctly
    $dom->loadHTML(
        mb_convert_encoding("<div>$html</div>", "HTML-ENTITIES", "UTF-8"),
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
    );
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
    $allowed_attrs = ["href", "src", "alt", "title", "class", "target"];

    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query("//*");

    foreach ($nodes as $node) {
        if (!in_array($node->nodeName, $allowed_tags)) {
            // Remove the tag but keep content (except for script/style which should be gone entirely)
            if (
                in_array($node->nodeName, [
                    "script",
                    "style",
                    "iframe",
                    "object",
                    "embed",
                    "applet",
                    "meta",
                    "link",
                ])
            ) {
                $node->parentNode->removeChild($node);
            } else {
                // For other tags, we might want to unwrap, but for simplicity/safety, let's just strip invalid tags but keep text
                // Actually, DOMDocument doesn't easily "unwrap".
                // Let's just remove dangerous nodes entirely to be safe, or replace with text.
                // Replacing with text is better UX but harder.
                // Let's iterate backwards to safely remove.
            }
        } else {
            // Allowed tag, check attributes
            if ($node->hasAttributes()) {
                $attrs = [];
                foreach ($node->attributes as $attr) {
                    $attrs[] = $attr->name;
                }
                foreach ($attrs as $attr) {
                    if (!in_array($attr, $allowed_attrs)) {
                        $node->removeAttribute($attr);
                    } elseif ($attr === "href" || $attr === "src") {
                        $value = $node->getAttribute($attr);
                        // Basic protocol check
                        if (
                            preg_match(
                                "/^(javascript|vbscript|data):/i",
                                $value,
                            )
                        ) {
                            $node->removeAttribute($attr);
                        }
                    }
                }
            }
        }
    }

    // Second pass to remove forbidden tags that might have been skipped or structural issues
    // Actually, the loop above modifies the DOM. Iterating while modifying can be tricky.
    // A better approach:

    $process_node = function ($node) use (
        &$process_node,
        $allowed_tags,
        $allowed_attrs,
    ) {
        if ($node->nodeType === XML_ELEMENT_NODE) {
            if (!in_array($node->nodeName, $allowed_tags)) {
                return false; // Mark for removal
            }

            // Clean attributes
            $attrs = [];
            if ($node->hasAttributes()) {
                foreach ($node->attributes as $attr) {
                    $attrs[] = $attr->name;
                }
                foreach ($attrs as $name) {
                    if (!in_array($name, $allowed_attrs)) {
                        $node->removeAttribute($name);
                    } else {
                        $val = $node->getAttribute($name);
                        if (
                            preg_match("/^(javascript|vbscript|data):/i", $val)
                        ) {
                            $node->removeAttribute($name);
                        }
                    }
                }
            }
        }
        return true;
    };

    // Re-do with a safer loop: get all elements, iterate backwards
    $all = $xpath->query("//*");
    for ($i = $all->length - 1; $i >= 0; $i--) {
        $node = $all->item($i);
        if (
            in_array($node->nodeName, [
                "script",
                "style",
                "iframe",
                "object",
                "embed",
                "applet",
                "link",
            ])
        ) {
            $node->parentNode->removeChild($node);
        } elseif (!in_array($node->nodeName, $allowed_tags)) {
            // Replace with its children (unwrap)
            $fragment = $dom->createDocumentFragment();
            while ($node->firstChild) {
                $fragment->appendChild($node->firstChild);
            }
            $node->parentNode->replaceChild($fragment, $node);
        } else {
            // Clean attributes
            if ($node->hasAttributes()) {
                // Copy to array to avoid iterator issues
                $attrs = [];
                foreach ($node->attributes as $attr) {
                    $attrs[] = $attr->name;
                }
                foreach ($attrs as $name) {
                    if (!in_array($name, $allowed_attrs)) {
                        $node->removeAttribute($name);
                    } else {
                        $val = $node->getAttribute($name);
                        if (
                            preg_match("/^(javascript|vbscript|data):/i", $val)
                        ) {
                            $node->removeAttribute($name);
                        }
                    }
                }
            }
        }
    }

    // Get body content only
    $body = $dom->getElementsByTagName("div")->item(0);
    if ($body) {
        $output = "";
        foreach ($body->childNodes as $child) {
            $output .= $dom->saveHTML($child);
        }
        return $output;
    }

    return "";
}
