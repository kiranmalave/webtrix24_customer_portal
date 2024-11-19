<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Google extends CI_Controller
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
		//$this->load->library("response");
		
	}

	public function getGoogleAccessResponse(){
		//$this->load->library("GoogleCalenderAPI");
		if (isset($_GET['code']) && isset($_COOKIE['authid'])) {
		   $whereap = array('adminID' => $_COOKIE['authid']);
		   $tokenDetails = $this->CommonModel->getMasterDetails("admin","g_cal_token",array("adminID"=>$_COOKIE['authid']));
		   if(!isset($tokenDetails[0]->g_cal_token) || empty($tokenDetails[0]->g_cal_token)){
			   $tokenData = array();
			   $tokenData['user_code'] =  $_GET['code'];
		   }else{
			   $tokenData = json_decode($tokenDetails[0]->g_cal_token);
			   $tokenData->user_code =  $_GET['code'];
		   }
		//    print("here");
		//    print $_GET['code']; 
		   $userData = array("g_cal_token"=>json_encode($tokenData),"is_google_sync"=>"y");
			// print("<pre>");  
		//    print_r($userData);
		   $iscreated = $this->CommonModel->updateMasterDetails('admin', $userData, $whereap);	
		   if(!$iscreated){
			echo "Something was wrong!";
			//    $status['msg'] = $this->systemmsg->getErrorCode(998);
			//    $status['statusCode'] = 998;
			//    $status['data'] = array();	
			//    $status['flag'] = 'F';
			//    print_r($status);
			   //$this->response->output($status, 200);
		   }else{
			   // register for watch
			//    $this->googlecalenderapi->watchCalender('primary');app_url
				header('Location: '.$this->config->item('app_url')."#/userProfile");
				die();
			//    $status['msg'] = $this->systemmsg->getSucessCode(400);
			//    $status['statusCode'] = 400;
			//    $status['data'] = array();
			//    $status['flag'] = 'S';
			   //$this->response->output($status, 200);
       	
				// 	//print$_GET['code']; exit;
				// 	$token = $this->googlecalenderapi->fetchAccessTokenWithAuthCode($_GET['code']);
				//     $this->googlecalenderapi->setAccessToken($token);
				//     $t = $this->googlecalenderapi->getAccessToken($token);
				//      print_r($t);
				//      $event = new Google_Service_Calendar_Event([
				//     'summary' => 'Final Event new with aniket',
				//     'description' => 'Event Description',
				//     'start' => [
				//         'dateTime' => '2023-12-06T20:00:00+05:30',
				//         'timeZone' => 'Asia/Kolkata', // Replace with the desired timezone
				//     ],
				//     'end' => [
				//         'dateTime' => '2023-12-06T20:15:00+05:30',
				//         'timeZone' => 'Asia/Kolkata',
				//     ],
				// ]);
				// //print_r($event);
				// $accessToken = $this->googlecalenderapi->getAccessToken();
				// print_r($accessToken);
				// $calendarId = 'primary';
				// $event = $this->googlecalenderapi->service->events->insert($calendarId, $event);
				// printf('Event created: %s\n', $event->htmlLink);
			}
		}
    }

	public function watchCalenderEvent()
	{
		$this->load->library("GoogleCalenderAPI");
		// Read the incoming webhook data
		$requestPayload = file_get_contents("php://input");
		$decodedPayload = json_decode($requestPayload, true);

		// Handle the data as needed (update your logic here)

		//if ($decodedPayload) {
			// Do something with the decoded payload
		//$ss = print_r(getallheaders2());
			file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook_log.txt', "File Data -> ".print_r($_REQUEST,true), FILE_APPEND);
			file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook_log.txt', "headers -> ".print_r(getallheaders2(),true), FILE_APPEND);
		// } else {
		// 	// Handle error or log it
		// 	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook_log.txt', "Error decoding payload", FILE_APPEND);
		// }
		http_response_code(200); // Respond to Google Calendar with a 200 status code

		// file_put_contents('webhook.log', file_get_contents('php://input') . PHP_EOL, FILE_APPEND);

		echo 'Webhook notification received successfully';
		// print_r($_POST);
	}

	public function stop(){
		// $calendarId = 'primary'; // Replace with your calendar ID
		$this->load->library("GoogleCalenderAPI");
		// // Create an event
		$event = new Google_Service_Calendar_Event([
		    'summary' => 'Event Title',
		    'description' => 'Event Description',
		    'start' => [
		        'dateTime' => '2023-12-61T10:00:00',
		        'timeZone' => 'America/New_York', // Replace with the desired timezone
		    ],
		    'end' => [
		        'dateTime' => '2023-12-61T12:00:00',
		        'timeZone' => 'America/New_York',
		    ],
		]);
		//print_r($event);
		$accessToken = $this->googlecalenderapi->getAccessToken();
		print_r($accessToken);
		$calendarId = 'primary';
		$event = $this->googlecalenderapi->service->events->insert($calendarId, $event);
		printf('Event created: %s\n', $event->htmlLink);


		// Insert the event into the calendar
		//print $createdEvent = $this->googlecalenderapi->calendars->get('primary');
		print "sdf";
		// Print the ID of the created event
		//echo 'Event created. ID: ' . $createdEvent->getId();


		//$calendar =$this->googlecalenderapi->calendars->get('primary');
		//echo $calendar->getTimeZone();
	}

	public function googleSync()
	{
		// where are we posting to?
		$url = 'https://accounts.google.com/o/oauth2/auth?scope=' . urlencode('https://www.googleapis.com/auth/calendar') . '&redirect_uri=' . urlencode($this->config->item('CLIENT_REDIRECT_URL')) . '&response_type=code&client_id=' . $this->config->item('CLIENT_ID')  . '&access_type=online';
		// open connection
		// $ch = curl_init();
		// // set the url, number of POST vars, POST data
		// curl_setopt($ch, CURLOPT_URL, $url);
		// // execute post
		// $result = curl_exec($ch);

		// // close connection
		// curl_close($ch);
		echo "
          <script> setTimeout(function () {
          window.location.href= '".$url."'; // page redirects here
          },1000); // 5 seconds
          </script>";
	}

}