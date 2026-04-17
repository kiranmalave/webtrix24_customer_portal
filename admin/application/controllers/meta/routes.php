<?php
$route['WAWebhook/receive'] = 'meta/WAHub/receive';
$route['WAHub/storeBusinessAccount'] = 'meta/WAHub/storeBusinessAccount';
$route['WAHub/storeBusinessNumbers'] = 'meta/WAHub/storeBusinessNumbers';
// Step 1: tenant opens popup → portal redirects to Facebook OAuth
$route['fb-connect']  = 'meta/WAHub/fbConnect';
$route['fb-callback'] = 'meta/WAHub/fbCallback';

// Optional fallback path for popup-based token processing
$route['fb-process']  = 'meta/WAHub/fbProcess';
// TEMPORARY DEBUG — remove after Facebook App is configured
$route['fb-debug']    = 'meta/WAHub/fbDebug';
//$route['facebook/webhook'] = 'meta/FacebookConnect/fbWebhook';
$route['facebook/webhook/receive'] = 'meta/FacebookConnect/fbWebhook';
?>