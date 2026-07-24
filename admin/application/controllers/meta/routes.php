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

// ── Facebook Login for Business (Pages / Lead Ads) — separate config_id from WhatsApp above ──
$route['fb-pages-connect'] = 'meta/FacebookConnect/pagesConnect';
$route['fb-pages-process'] = 'meta/FacebookConnect/pagesProcess';

// Called by the tenant BE when it activates a Page, to register it in the central fb_pages
// table (used by fbWebhook()/_queueLeadForTenant() to resolve which tenant a leadgen event
// belongs to) — mirrors the existing WAHub/storeBusinessAccount shortcut route.
$route['FacebookConnect/storeFacebookPage'] = 'meta/FacebookConnect/storeFacebookPage';

// Meta's required Data Deletion Request Callback (App Dashboard > Settings > Basic)
$route['facebook/data-deletion']        = 'meta/DataDeletion/callback';
$route['facebook/data-deletion-status'] = 'meta/DataDeletion/status';

// ── Instagram Business Login — standalone, own App ID/Secret, NOT a Page-linked flow ──
$route['instagram-callback']              = 'meta/InstagramLogin/callback';
$route['InstagramLogin/storeAccount']     = 'meta/InstagramLogin/storeAccount';
// TEMPORARY DEBUG — remove after Facebook App is configured
$route['fb-debug']    = 'meta/WAHub/fbDebug';
//$route['facebook/webhook'] = 'meta/FacebookConnect/fbWebhook';
$route['facebook/webhook/receive'] = 'meta/FacebookConnect/fbWebhook';
?>