	<?php
	defined('BASEPATH') or exit('No direct script access allowed');

	class GoogleCalenderApi extends CI_Controller
	{

		/**
		 * Index Page for this controller.
		 *
		 * Maps to the following URL
		 * 		http://example.com/index.php/welcome
		 *	- or -
		 * 		http://example.com/index.php/welcome/index
		 *	- or -
		 * Since this controller is set as the default controller in
		 * config/routes.php, it's displayed at http://example.com/
		 *
		 * So any other public methods not prefixed with an underscore will
		 * map to /index.php/welcome/<method_name>
		 * @see https://codeigniter.com/user_guide/general/urls.html
		 */
		function __construct()
		{
			parent::__construct();
			$this->load->database();
			$this->load->model('CommonModel');
			// $this->load->model('TraineeModel');
			$this->load->library("pagination");
			$this->load->library("response");
			$this->load->library("response");
			$this->load->library("ValidateData");
			$this->load->library("GoogleCalenderApi");
		}

		public function redirectLogin()
		{
			$client_id =  $this->config->item("client_id");	
			$client_secret =  $this->config->item("client_secret");	
			$client_redirect_url =  $this->config->item("client_redirect_url");	
			// Google passes a parameter 'code' in the Redirect Url
			if(isset($_GET['code'])) {
				try {
					// $capi = new GoogleCalendarApi();
					
					// Get the access token 
					$data = $this->GoogleCalenderApi->GetAccessToken($client_id , $client_secret,$client_redirect_url, $_GET['code']);
					
					// Save the access token as a session variable
					$config['access_token'] = $data['access_token'];

					// Redirect to the page where user can create event
					redirect('Appointment/appointmentMaster');
					exit();
				}
				catch(Exception $e) {
					// echo $e->getMessage();
					exit();
				}
			}
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
					$login_url = 'https://accounts.google.com/o/oauth2/auth?scope=' . urlencode('https://www.googleapis.com/auth/calendar') . '&redirect_uri=' . urlencode($client_redirect_url) . '&response_type=code&client_id=' . $client_id . '&access_type=online';
					?>
					<a id="logo" href="<?= $login_url ?>">Login with Google</a>
			</body>
			</html>
			<?php
		}

		// public function handleCalenderEvents()
		// {
		// 	print("here");exit;
		// 	// session_start();
		// 	try {
		// 		// Get event details
		// 		$event = $_POST['event_details'];
		// 		// $capi = new GoogleCalendarApi();
				
		// 		switch($event['operation']) {
		// 			case 'create':
		// 				// Get user calendar timezone
		// 				if(!isset($_SESSION['user_timezone']))
		// 					$_SESSION['user_timezone'] = $this->GoogleCalenderApi->GetUserCalendarTimezone($_SESSION['access_token']);
	
		// 				// Create event on primary calendar
		// 				$event_id = $this->GoogleCalenderApi->CreateCalendarEvent('primary', $event['title'], $event['all_day'], $event['event_time'], $_SESSION['user_timezone'], $_SESSION['access_token']);
	
		// 				echo json_encode([ 'event_id' => $event_id ]);
		// 				break;
	
		// 			case 'update':
		// 				// Update event on primary calendar
		// 				$this->GoogleCalenderApi->UpdateCalendarEvent($event['event_id'], 'primary', $event['title'], $event['all_day'], $event['event_time'], $_SESSION['user_timezone'], $_SESSION['access_token']);
	
		// 				echo json_encode([ 'updated' => 1 ]);
		// 				break;
	
		// 			case 'delete':
		// 				// Delete event on primary calendar
		// 				$this->GoogleCalenderApi->DeleteCalendarEvent($event['event_id'], 'primary', $_SESSION['access_token']);
	
		// 				echo json_encode([ 'deleted' => 1 ]);
		// 				break;
		// 		}
		// 	}
		// 	catch(Exception $e) {
		// 		header('Bad Request', true, 400);
		// 		echo json_encode(array( 'error' => 1, 'message' => $e->getMessage() ));
		// 	}
		// }
		
	}
