<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connecting Facebook — Webtrix24</title>
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
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px; height: 56px;
      border-radius: 50%;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .icon-fb      { background: #1877F2; color: #fff; }
    .icon-success { background: #d1fae5; color: #059669; }
    .icon-error   { background: #fee2e2; color: #dc2626; }
    h1 { font-size: 1.15rem; font-weight: 700; margin-bottom: 8px; }
    p  { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
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
  </style>
</head>
<body>
  <div class="card" id="card">
    <div class="spinner" id="spinner"></div>
    <h1 id="title">Finishing up&hellip;</h1>
    <p id="msg">Closing this window automatically.</p>
  </div>

  <script>
    var RETURN_ORIGIN = '<?php echo $return_origin; ?>';
    var ERROR_MSG     = <?php echo json_encode($error); ?>;

    function postAndClose(data) {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(data, RETURN_ORIGIN);
        try {
          window.opener.postMessage(JSON.stringify(data), RETURN_ORIGIN);
        } catch (e) {}
      }
      setTimeout(function () { window.close(); }, 1200);
    }

    if (ERROR_MSG) {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('card').querySelector('.icon-fb') &&
        document.getElementById('card').querySelector('.icon-fb').remove();

      var iconEl = document.createElement('div');
      iconEl.className = 'icon icon-error';
      iconEl.textContent = '✕';
      document.getElementById('card').insertBefore(iconEl, document.getElementById('title'));

      document.getElementById('title').textContent = 'Connection failed';
      document.getElementById('msg').textContent   = ERROR_MSG;

      postAndClose({ type: 'wa_fb_error', msg: ERROR_MSG });
    } else {
      document.getElementById('spinner').style.display = 'none';

      var iconEl = document.createElement('div');
      iconEl.className = 'icon icon-success';
      iconEl.textContent = '✓';
      document.getElementById('card').insertBefore(iconEl, document.getElementById('title'));

      document.getElementById('title').textContent = 'Facebook connected!';
      document.getElementById('msg').textContent   = 'Closing this window automatically.';

      postAndClose({ type: 'wa_fb_success' });
    }
  </script>
</body>
</html>
