<?php

// // / Google App Client Id /
// define('CLIENT_ID', '1047776072197-pqg1v82oqb70nhmshii3bskg4t0i3sr0.apps.googleusercontent.com');

// // / Google App Client Secret /
// define('CLIENT_SECRET', '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');

// // / Google App Redirect Url /
// define('CLIENT_REDIRECT_URL', 'http://localhost/g_calender/google-login.php');

// require_once('google-calendar-api.php');
// require_once('settings.php');

// // Google passes a parameter 'code' in the Redirect Url
// if(isset($_GET['code'])) {
// 	try {
// 		$capi = new GoogleCalendarApi();
		
// 		// Get the access token 
// 		$data = $capi->GetAccessToken(CLIENT_ID, CLIENT_REDIRECT_URL, CLIENT_SECRET, $_GET['code']);
		
// 		// Save the access token as a session variable
// 		$_SESSION['access_token'] = $data['access_token'];

// 		// Redirect to the page where user can create event
// 		header('Location: home.php');
// 		exit();
// 	}
// 	catch(Exception $e) {
// 		echo $e->getMessage();
// 		exit();
// 	}
// }

?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style type="text/css">

#logo {
	text-align: center;
	width: 200px;
    display: block;
    margin: 100px auto;
    border: 2px solid #2980b9;
    padding: 10px;
    background: none;
    color: #2980b9;
    cursor: pointer;
    text-decoration: none;
}

</style>
</head>

<body>

<?php

// $login_url = 'https://accounts.google.com/o/oauth2/auth?scope=' . urlencode('https://www.googleapis.com/auth/calendar') . '&redirect_uri=' . urlencode(CLIENT_REDIRECT_URL) . '&response_type=code&client_id=' . CLIENT_ID . '&access_type=online';

?>

<a id="logo" href="google.com">Login with Google</a>

</body>
</html>