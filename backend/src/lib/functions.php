<?php

function time_ago($datetime, $lang = "bn")
{
    $time = strtotime($datetime);
    $diff = time() - $time;

    if ($diff < 60) {
        return $lang === "bn" ? "এইমাত্র" : "Just now";
    }

    $intervals = [
        31536000 => ["year", "বছর", "year"],
        2592000 => ["month", "মাস", "month"],
        604800 => ["week", "সপ্তাহ", "week"],
        86400 => ["day", "দিন", "day"],
        3600 => ["hour", "ঘণ্টা", "hour"],
        60 => ["minute", "মিনিট", "minute"],
    ];

    foreach ($intervals as $secs => $labels) {
        $d = $diff / $secs;
        if ($d >= 1) {
            $r = floor($d);
            if ($lang === "bn") {
                return convert_to_bengali_num($r) . " " . $labels[1] . " আগে";
            } else {
                return $r . " " . $labels[2] . ($r > 1 ? "s" : "") . " ago";
            }
        }
    }
}

function convert_to_bengali_num($num)
{
    $eng = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    $ban = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return str_replace($eng, $ban, (string) $num);
}
