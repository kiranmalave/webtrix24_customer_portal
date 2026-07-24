<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facebook Authorization — Webtrix24</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f0f4ff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1e293b;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      max-width: 380px;
      width: 90%;
      text-align: center;
    }
    .fb-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px; height: 56px;
      border-radius: 50%;
      background: #1877F2;
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
    p  { font-size: 0.875rem; color: #64748b; margin-bottom: 24px; line-height: 1.5; }
    .spinner {
      display: inline-block;
      width: 36px; height: 36px;
      border: 4px solid #e2e8f0;
      border-top-color: #1877F2;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #status { font-size: 0.875rem; color: #64748b; }
    .error { color: #dc2626 !important; }
  </style>
</head>
<body>
  <div class="card">
    <div class="fb-icon">f</div>
    <h1>Connect Facebook Pages</h1>
    <p>Starting Facebook Login for Business (Pages / Lead Ads) from the central portal.</p>
    <div class="spinner" id="spinner"></div>
    <div id="status">Opening Facebook login&hellip;</div>
  </div>

  <script>
    var RETURN_ORIGIN = '<?php echo $return_origin; ?>';
    var COMPANY_ID    = <?php echo (int) $company_id; ?>;
    var FB_APP_ID     = '<?php echo $app_id; ?>';
    var FB_CONFIG_ID  = '<?php echo isset($config_id) ? $config_id : ''; ?>';
    var PROCESS_URL   = '<?php echo $process_url; ?>';

    function setStatus(msg, isError) {
      var el = document.getElementById('status');
      el.textContent = msg;
      if (isError) {
        el.className = 'error';
      }
      document.getElementById('spinner').style.display = isError ? 'none' : 'inline-block';
    }

    function postToOpener(data) {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(data, RETURN_ORIGIN);
        try {
          window.opener.postMessage(JSON.stringify(data), RETURN_ORIGIN);
        } catch (e) {}
      }
    }

    function finalizeSignup(payload) {
      fetch(PROCESS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.flag === 'S') {
          setStatus('Connected! Closing window…', false);
          postToOpener({ type: 'meta_pages_success', pages: data.data && data.data.pages ? data.data.pages : [] });
          setTimeout(function () { window.close(); }, 1200);
        } else {
          var msg = data.msg || 'Server error. Please try again.';
          setStatus(msg, true);
          postToOpener({ type: 'meta_pages_error', msg: msg });
          setTimeout(function () { window.close(); }, 2500);
        }
      })
      .catch(function () {
        setStatus('Network error. Please try again.', true);
        postToOpener({ type: 'meta_pages_error', msg: 'Network error while connecting. Please try again.' });
        setTimeout(function () { window.close(); }, 2500);
      });
    }

    function onFBReady() {
      if (!FB_CONFIG_ID) {
        setStatus('Facebook Login for Business (Pages) is not configured on my.webtrix24.com.', true);
        postToOpener({ type: 'meta_pages_error', msg: 'FB_PAGES_CONFIG_ID is missing on the central portal.' });
        return;
      }

      setStatus('Opening Facebook Login for Business…', false);

      // response_type: 'token' — the popup gets a usable access token directly from Facebook,
      // no server-side code exchange needed. The alternative ('code' + override_default_response_type)
      // requires exchanging the code at /oauth/access_token with a redirect_uri that must exactly
      // match what the OAuth dialog internally used — which for a JS-SDK popup (not a real page
      // redirect) reliably fails with "Error validating verification code... redirect_uri must be
      // identical" (error 100 / subcode 36008), regardless of what redirect_uri value is sent
      // server-side. Requesting the token directly avoids that failure mode entirely.
      var loginOptions = {
        config_id: FB_CONFIG_ID,
        response_type: 'token',
        override_default_response_type: true,
      };

      FB.login(function (response) {
        var authResponse = response && response.authResponse ? response.authResponse : null;
        var code = authResponse ? authResponse.code : null;
        var accessToken = authResponse ? authResponse.accessToken : null;

        if (!code && !accessToken) {
          setStatus('Login was cancelled or permissions were not granted.', true);
          postToOpener({ type: 'meta_pages_error', msg: 'Facebook login cancelled or permissions not granted.' });
          setTimeout(function () { window.close(); }, 2500);
          return;
        }

        setStatus('Discovering your Facebook Pages…', false);
        finalizeSignup({
          code: code,
          access_token: accessToken,
          return_origin: RETURN_ORIGIN,
          company_id: COMPANY_ID,
        });
      }, loginOptions);
    }

    window.fbAsyncInit = function () {
      FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v23.0'
      });
      onFBReady();
    };

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  </script>
</body>
</html>
