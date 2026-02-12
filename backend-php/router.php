<?php
// router.php for PHP built-in server
// Mimics the .htaccess logic: serve file if exists, else route to index.php

if (php_sapi_name() == 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false; // serve requested resource as-is.
    }
}

// Otherwise, include the main entry point
require __DIR__ . '/index.php';
