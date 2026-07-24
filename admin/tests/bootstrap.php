<?php
// Minimal bootstrap so plain CI3 library files (which guard on BASEPATH) can be
// require'd directly in unit tests without booting the full framework.
if (!defined('BASEPATH')) {
    define('BASEPATH', __DIR__ . '/../');
}

require_once __DIR__ . '/../application/libraries/Meta_signature.php';
