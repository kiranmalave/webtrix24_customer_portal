<?php
$route['WAWebhook/receive'] = 'meta/WAHub/receive';
$route['WAHub/storeBusinessAccount'] = 'meta/WAHub/storeBusinessAccount';
$route['WAHub/storeBusinessNumbers'] = 'meta/WAHub/storeBusinessNumbers';
// Step 1: tenant opens popup → portal redirects to Facebook OAuth

// ── Embedded Signup (requires FB_EMBEDDED_SIGNUP_CONFIG_ID permission) ──
$route['fb-connect']  = 'meta/WAHub/fbConnect';
$route['fb-callback'] = 'meta/WAHub/fbCallback';

// ── Standard FB login (no extra permissions required; use while ES pending) ──
$route['fb-normal-connect'] = 'meta/WAHub/fbNormalConnect';

// Optional fallback path for popup-based token processing
$route['fb-process']  = 'meta/WAHub/fbProcess';
// TEMPORARY DEBUG — remove after Facebook App is configured
$route['fb-debug']    = 'meta/WAHub/fbDebug';
//$route['facebook/webhook'] = 'meta/FacebookConnect/fbWebhook';
$route['facebook/webhook/receive'] = 'meta/FacebookConnect/fbWebhook';
?>