<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../config/colors.php";

echo "\n--- Seeding Users ---\n";
$users = [
    [
        "admin@breachtimes.com",
        password_hash("admin123", PASSWORD_BCRYPT),
        "admin",
    ],
    ["john@example.com", password_hash("user123", PASSWORD_BCRYPT), "user"],
    ["sarah@example.com", password_hash("user123", PASSWORD_BCRYPT), "user"],
    ["mike@example.com", password_hash("user123", PASSWORD_BCRYPT), "user"],
    ["emma@example.com", password_hash("user123", PASSWORD_BCRYPT), "user"],
];
$stmt = $pdo->prepare(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
);
foreach ($users as $user) {
    try {
        $stmt->execute($user);
        echo "✓ User created: " . $user[0] . "\n";
    } catch (PDOException $e) {
        echo "- User already exists: " . $user[0] . "\n";
    }
}

$adminResult = $pdo
    ->query("SELECT id FROM users WHERE email = 'admin@breachtimes.com'")
    ->fetch(PDO::FETCH_ASSOC);
$adminId = $adminResult ? $adminResult["id"] : null;

$johnResult = $pdo
    ->query("SELECT id FROM users WHERE email = 'john@example.com'")
    ->fetch(PDO::FETCH_ASSOC);
$johnId = $johnResult ? $johnResult["id"] : null;

$sarahResult = $pdo
    ->query("SELECT id FROM users WHERE email = 'sarah@example.com'")
    ->fetch(PDO::FETCH_ASSOC);
$sarahId = $sarahResult ? $sarahResult["id"] : null;

$mikeResult = $pdo
    ->query("SELECT id FROM users WHERE email = 'mike@example.com'")
    ->fetch(PDO::FETCH_ASSOC);
$mikeId = $mikeResult ? $mikeResult["id"] : null;

$emmaResult = $pdo
    ->query("SELECT id FROM users WHERE email = 'emma@example.com'")
    ->fetch(PDO::FETCH_ASSOC);
$emmaId = $emmaResult ? $emmaResult["id"] : null;

if (!$adminId) {
    throw new Exception("Required admin user not found after seeding.");
}

echo "\n--- Seeding Categories ---\n";
$cats = [
    ["news", "খবর", "News", COLOR_BBC_RED],
    ["security", "নিরাপত্তা", "Security", COLOR_SECURITY],
    ["tech", "প্রযুক্তি", "Technology", COLOR_TECH],
    ["analysis", "বিশ্লেষণ", "Analysis", COLOR_ANALYSIS],
];
$stmt = $pdo->prepare(
    "INSERT INTO categories (id, title_bn, title_en, color) VALUES (?, ?, ?, ?)",
);
foreach ($cats as $cat) {
    $stmt->execute($cat);
    echo "✓ Category created: " . $cat[1] . " / " . $cat[2] . "\n";
}

echo "\n--- Seeding Sections ---\n";
$sections = [
    [
        "hero-stories",
        "প্রধান খবর",
        "Top Stories",
        "hero",
        COLOR_BBC_RED,
        "news",
        null,
        1,
    ],
];
$stmt = $pdo->prepare(
    "INSERT INTO sections (id, title_bn, title_en, type, highlight_color, associated_category, style, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
);
foreach ($sections as $sec) {
    $stmt->execute($sec);
    echo "✓ Section created: " . $sec[1] . " / " . $sec[2] . "\n";
}

echo "\n--- Seeding Articles ---\n";
$articles = [
    [
        "art_001",
        "hero-stories",
        "tech",
        "সাইবার হুমকি থেকে রক্ষার নতুন উপায়",
        "হ্যাকাররা ক্রমাগত নতুন কৌশল ব্যবহার করে সিস্টেম ভেদ করার চেষ্টা করছে। এই নিবন্ধে জানুন কীভাবে নিজেকে সুরক্ষিত রাখবেন।",
        "<h2>সাইবার নিরাপত্তার গুরুত্ব</h2><p>ডিজিটাল যুগে সাইবার নিরাপত্তা অত্যন্ত গুরুত্বপূর্ণ। প্রতিদিন হাজার হাজার হ্যাকিং ঘটনা ঘটছে বিশ্বজুড়ে। আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে সঠিক পদক্ষেপ নিন।</p><p>শক্তিশালী পাসওয়ার্ড, দ্বি-স্তরীয় প্রমাণীকরণ এবং নিয়মিত আপডেট আপনার ডিভাইসকে সুরক্ষিত রাখে।</p>",
        "৪ মিনিট",
        "Cyber Protection Tips",
        "New ways to protect against cyber threats",
        "<h2>Importance of Cybersecurity</h2><p>In the digital age, cybersecurity is extremely important. Thousands of hacking incidents occur worldwide every day. Take proper steps to keep your personal information safe.</p><p>Strong passwords, two-factor authentication, and regular updates keep your devices secure.</p>",
        "4 min",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_002",
        "hero-stories",
        "security",
        "ব্যাংকিং সেক্টরে বড় নিরাপত্তা লঙ্ঘন",
        "সম্প্রতি একটি প্রধান ব্যাংকে নিরাপত্তা লঙ্ঘন ঘটেছে যেখানে লক্ষ লক্ষ টাকা চুরি হয়েছে।",
        "<h2>ব্যাংকিং নিরাপত্তা হুমকি</h2><p>একটি বড় ব্যাংকিং সংস্থা হ্যাকিং এর শিকার হয়েছে যেখানে গ্রাহকদের সংবেদনশীল তথ্য চুরি হয়েছে।</p><p>ব্যাংকগুলি এখন নিরাপত্তা ব্যবস্থা আরও শক্তিশালী করছে এবং গ্রাহকদের সতর্ক করছে।</p>",
        "৫ মিনিট",
        "Banking Sector Security Breach",
        "Major security incident affects millions of customers",
        "<h2>Banking Security Crisis</h2><p>A major banking institution has fallen victim to hacking with sensitive customer information stolen.</p><p>Banks are now strengthening security measures and warning customers about protective steps.</p>",
        "5 min",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_003",
        "hero-stories",
        "tech",
        "কৃত্রিম বুদ্ধিমত্তা সাইবার সিকিউরিটিতে বিপ্লব আনছে",
        "এআই প্রযুক্তি ব্যবহার করে এখন আরও দক্ষভাবে হুমকি সনাক্ত করা যাচ্ছে।",
        "<h2>এআই এবং সাইবার নিরাপত্তা</h2><p>কৃত্রিম বুদ্ধিমত্তা প্রযুক্তি ব্যবহার করে নিরাপত্তা বিশেষজ্ঞরা এখন অনেক দ্রুত হুমকি সনাক্ত করতে পারেন।</p><p>মেশিন লার্নিং অ্যালগরিদম নতুন ধরনের আক্রমণ প্রতিরোধে সাহায্য করছে।</p>",
        "৬ মিনিট",
        "AI Revolutionizing Cybersecurity",
        "Artificial intelligence detects threats more efficiently",
        "<h2>AI and Cybersecurity</h2><p>Using artificial intelligence technology, security experts can now detect threats much faster.</p><p>Machine learning algorithms are helping prevent new types of attacks.</p>",
        "6 min",
        "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_004",
        "hero-stories",
        "security",
        "নতুন ম্যালওয়্যার স্ট্রেইন সনাক্ত",
        "গবেষকরা একটি নতুন এবং বিপজ্জনক ম্যালওয়্যার স্ট্রেইন আবিষ্কার করেছেন যা লক্ষ কম্পিউটারকে আক্রমণ করতে পারে।",
        "<h2>নতুন ম্যালওয়্যার হুমকি</h2><p>নিরাপত্তা গবেষকরা একটি নতুন ম্যালওয়্যার স্ট্রেইন আবিষ্কার করেছেন যা অত্যন্ত বিপজ্জনক এবং সহজে ছড়িয়ে পড়ে।</p><p>ব্যবহারকারীদের তাদের সিস্টেম আপডেট রাখতে সুপারিশ করা হচ্ছে।</p>",
        "৩ মিনিট",
        "New Malware Strain Detected",
        "Researchers warn about dangerous new malware variant",
        "<h2>New Malware Threat</h2><p>Security researchers have discovered a new malware strain that is highly dangerous and spreads easily.</p><p>Users are advised to keep their systems updated.</p>",
        "3 min",
        "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],

    [
        "art_007",
        "hero-stories",
        "tech",
        "সম্পূর্ণ সাইবার সিকিউরিটি কোর্স",
        "১৫ মিনিটের ভিডিও টিউটোরিয়ালে শিখুন সাইবার সিকিউরিটির সব কিছু।",
        "<h2>সম্পূর্ণ সাইবার সিকিউরিটি কোর্স</h2><p>বিশেষজ্ঞদের কাছ থেকে সাইবার নিরাপত্তা সম্পর্কে সবকিছু শিখুন।</p><video src=\"https://www.w3schools.com/html/mov_bbb.mp4\" poster=\"https://via.placeholder.com/1280x720.png?text=Video+Thumbnail\" controls=\"controls\" style=\"max-width: 100%; height: auto;\"></video>",
        "১৫ মিনিট",
        "Complete Cybersecurity Course",
        "Learn cybersecurity from experts in 15 minutes",
        "<h2>Complete Cybersecurity Course</h2><p>Learn everything about cybersecurity from experts.</p><video src=\"https://www.w3schools.com/html/mov_bbb.mp4\" poster=\"https://via.placeholder.com/1280x720.png?text=Video+Thumbnail\" controls=\"controls\" style=\"max-width: 100%; height: auto;\"></video>",
        "15 min",
        "https://images.unsplash.com/photo-1510511459019-5dee995ad896?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_008",
        "hero-stories",
        "tech",
        "এআই এর ভবিষ্যৎ এবং সম্ভাবনা",
        "এআই প্রযুক্তি কীভাবে আমাদের জীবনকে পরিবর্তন করবে তার বিশ্লেষণ।",
        "<h2>The Future of AI</h2><p>কৃত্রিম বুদ্ধিমত্তা কীভাবে ভবিষ্যতকে গড়বে তা নিয়ে গভীর আলোচনা।</p>",
        "২০মিনিত",
        "The Future of AI and Its Possibilities",
        "Analysis of how AI will change our lives",
        "<h2>The Future of AI</h2><p>Deep discussion on how artificial intelligence will shape the future.</p>",
        "20 min",
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_009",
        "hero-stories",
        "analysis",
        "সাইবার নিরাপত্তা পডকাস্ট - এপিসোড ১",
        "বিশেষজ্ঞদের সাথে কথোপকথনে শুনুন সাইবার সিকিউরিটির সর্বশেষ খবর।",
        "<h2>Cybersecurity Podcast Episode 1</h2><p>সাইবার নিরাপত্তা বিশেষজ্ঞদের অন্তর্দৃষ্টিপূর্ণ আলোচনা।</p>",
        "৪৫ মিনিট",
        "Cybersecurity Podcast - Episode 1",
        "Listen to experts discussing latest cybersecurity news",
        "<h2>Cybersecurity Podcast Episode 1</h2><p>Insightful discussion from cybersecurity experts.</p>",
        "45 min",
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
    [
        "art_010",
        "hero-stories",
        "analysis",
        "ডেটা প্রাইভেসি পডকাস্ট - এপিসোড ১",
        "আপনার ব্যক্তিগত তথ্য সুরক্ষা নিয়ে বিস্তারিত আলোচনা।",
        "<h2>Data Privacy Podcast Episode 1</h2><p>ডেটা প্রাইভেসি এবং ব্যক্তিগত তথ্য রক্ষার উপায় সম্পর্কে।</p>",
        "৫০ মিনিট",
        "Data Privacy Podcast - Episode 1",
        "Detailed discussion about protecting your personal information",
        "<h2>Data Privacy Podcast Episode 1</h2><p>About data privacy and ways to protect personal information.</p>",
        "50 min",
        "https://images.unsplash.com/photo-1560732488-6b0df240254a?auto=format&fit=crop&q=80&w=1200",
        "",
        0,
        "published",
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO articles 
    (id, section_id, category_id, title_bn, summary_bn, content_bn, read_time_bn, title_en, summary_en, content_en, read_time_en, image_bn, image_en, use_separate_images, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
);

foreach ($articles as $article) {
    $stmt->execute($article);
    echo "✓ Article created: " . $article[3] . "\n";
}

echo "\n--- Seeding Comments and Replies ---\n";
$comments = [
    [
        "art_001",
        $johnId,
        "John Doe",
        "<p>এটি সত্যিই দরকারী তথ্য। আমি এই টিপসগুলি অবশ্যই অনুসরণ করব।</p>",
    ],
    [
        "art_001",
        $sarahId,
        "Sarah Smith",
        "<p>সাইবার নিরাপত্তা সবার জন্য গুরুত্বপূর্ণ। ধন্যবাদ এই নিবন্ধের জন্য।</p>",
    ],
    [
        "art_002",
        $mikeId,
        "Mike Johnson",
        "<p>এটি খুবই উদ্বেগজনক। আমাদের অ্যাকাউন্ট সুরক্ষিত আছে কিনা তা যাচাই করতে হবে।</p>",
    ],
    [
        "art_003",
        $johnId,
        "John Doe",
        "<p>এআই সত্যিই প্রযুক্তিতে অসাধারণ পরিবর্তন আনছে।</p>",
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO comments (article_id, user_id, user_name, text) VALUES (?, ?, ?, ?)",
);
$commentIds = [];
foreach ($comments as $index => $comment) {
    $stmt->execute($comment);
    $commentIds[$index] = $pdo->lastInsertId();
    echo "✓ Comment created by: " . $comment[2] . "\n";
}

echo "\n--- Seeding Replies ---\n";
$replies = [
    [
        $commentIds[0],
        $sarahId,
        "Sarah Smith",
        "<p>আমিও এই মত। এই টিপসগুলি খুবই কার্যকর।</p>",
    ],
    [
        $commentIds[1],
        $adminId,
        "ব্রিচটাইমস",
        "<p>আপনার মন্তব্যের জন্য ধন্যবাদ! নিরাপত্তা সবার জন্য জরুরি।</p>",
    ],
    [
        $commentIds[2],
        $johnId,
        "John Doe",
        "<p>হ্যাঁ, অবশ্যই আপনার অ্যাকাউন্ট পরীক্ষা করুন এবং পাসওয়ার্ড পরিবর্তন করুন।</p>",
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO comments (article_id, user_id, user_name, text, parent_comment_id) VALUES (?, ?, ?, ?, ?)",
);
foreach ($replies as $index => $reply) {
    $articleId = $pdo
        ->query("SELECT article_id FROM comments WHERE id = " . $reply[0])
        ->fetch(PDO::FETCH_ASSOC)["article_id"];
    $stmt->execute([$articleId, $reply[1], $reply[2], $reply[3], $reply[0]]);
    echo "✓ Reply created by: " . $reply[2] . "\n";
}

echo "\n--- Seeding Comment Votes ---\n";
$votes = [
    [$commentIds[0], $sarahId, "upvote"],
    [$commentIds[0], $mikeId, "upvote"],
    [$commentIds[1], $johnId, "upvote"],
    [$commentIds[2], $sarahId, "downvote"],
];

$stmt = $pdo->prepare(
    "INSERT INTO comment_votes (comment_id, user_id, vote_type) VALUES (?, ?, ?)",
);
foreach ($votes as $vote) {
    $stmt->execute($vote);
    echo "✓ Vote created\n";
}

echo "\n--- Seeding Documents ---\n";
$documents = [
    [
        "doc_001",
        "art_001",
        "security_guide.pdf",
        "pdf",
        "/uploads/documents/security_guide.pdf",
        "http://example.com/download/security_guide.pdf",
        2048000,
        "সাইবার নিরাপত্তা গাইড",
        "Cybersecurity Guide",
        "বিস্তারিত নিরাপত্তা গাইড এবং সর্বোত্তম অনুশীলন।",
        "Comprehensive security guide with best practices.",
        1,
    ],
    [
        "doc_002",
        "art_002",
        "banking_security.pdf",
        "pdf",
        "/uploads/documents/banking_security.pdf",
        "http://example.com/download/banking_security.pdf",
        3072000,
        "ব্যাংকিং নিরাপত্তা প্রতিবেদন",
        "Banking Security Report",
        "নিরাপত্তা লঙ্ঘনের বিস্তারিত বিশ্লেষণ।",
        "Detailed analysis of the security breach.",
        2,
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO documents (id, article_id, file_name, file_type, file_path, download_url, file_size, display_name_bn, display_name_en, description_bn, description_en, sort_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
);
foreach ($documents as $doc) {
    $stmt->execute($doc);
    echo "✓ Document created: " . $doc[7] . "\n";
}

echo "\n--- Seeding Article Submissions ---\n";
$submissions = [
    [
        "art_001",
        $johnId,
        "/uploads/submissions/document1.pdf",
        "এটি একটি গুরুত্বপূর্ণ নিরাপত্তা নথি যা শেয়ার করতে চাই।",
    ],
    [
        "art_002",
        $sarahId,
        "/uploads/submissions/document2.pdf",
        "ব্যাংকিং নিরাপত্তা সম্পর্কিত অতিরিক্ত তথ্য।",
    ],
];

$stmt = $pdo->prepare(
    "INSERT INTO article_submissions (article_id, user_id, file_path, message) VALUES (?, ?, ?, ?)",
);
foreach ($submissions as $sub) {
    $stmt->execute($sub);
    echo "✓ Submission created\n";
}

echo "\n" . str_repeat("=", 50) . "\n";

echo "\n" . str_repeat("=", 50) . "\n";
echo "✓ Database seeding completed successfully!\n";
echo str_repeat("=", 50) . "\n";
echo "\nDemo Credentials:\n";
echo "- Admin: admin@breachtimes.com / admin123\n";
echo "- User 1: john@example.com / user123\n";
echo "- User 2: sarah@example.com / user123\n";
echo "- User 3: mike@example.com / user123\n";
echo "- User 4: emma@example.com / user123\n";
echo "\nAll tables have been populated with sample data.\n";
?>
