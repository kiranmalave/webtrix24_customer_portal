<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once APPPATH . '../vendor/autoload.php';
	class GoogleCalenderAPI  extends Google\Client
	{
		var $calendars;
		var $service;
		var $access_details;
		var $is_sync=false;
		var $token='';
		public function __construct()
		{
			parent::__construct();
			$this->CI =& get_instance();
			//$this->client = new Google\Client();
			// $this->reset();	
			
			$this->setAuthConfig($_SERVER['DOCUMENT_ROOT'].'/client_secret_google.json');
			//$this->addScope(Google\Service\Calendar::CALENDAR);
			$redirect_uri = $this->CI->config->item('base_url')."responseToken";
			$this->setRedirectUri($redirect_uri);
			$this->setAccessType('offline');
			$this->setPrompt('consent');
			$this->calendars = new Google\Service\Calendar($this);
			//$client->setScopes([Google_Service_Calendar::CALENDAR_EVENTS]);
			$this->setScopes([Google_Service_Calendar::CALENDAR_EVENTS]);
			$this->service = new Google_Service_Calendar($this);
			
			$this->getuserDetails();
		}
		public function getuserDetails(){
			$this->CI->load->model('CommonModel');
			$whereap = array('adminID' => 92);
			
			// $this->reset();
            $this->tokenDetails = $this->CI->CommonModel->getMasterDetails("admin","g_cal_token,is_google_sync",$whereap);
			
			$this->access_details = json_decode($this->tokenDetails[0]->g_cal_token);
			
			
			if(isset($this->access_details->access_token) && !empty($this->access_details->access_token) ){
				$this->is_sync = true;
				$this->token = $this->access_details->access_token ;
				$this->setAccessToken($this->access_details->access_token);
				
				$isexpired = $this->isAccessTokenExpired($this->token);
				
				if($isexpired){
					print('Token Expired');
					
					// $this->token = ;
					// var_dump($this->getRefreshToken());
					
					$this->token = $this->fetchAccessTokenWithAuthCode($this->access_details->user_code);
					// print_r($this->token);
					$this->setAccessToken($this->token);
				}else{
					$this->token = json_decode($this->access_details->access_token);
				}
				$this->watchCalender('primary');

			}else if($this->tokenDetails[0]->is_google_sync =="y" && $this->tokenDetails[0]->g_cal_token !=""){
					$this->is_sync = true;
					
					$this->token = $this->fetchAccessTokenWithAuthCode($this->access_details->user_code);
					
					// $refreshToken = $accessToken['refresh_token'];
					//print "sdfdsfsdf<pre>";
					// print_r($this->token);
					if(!isset($this->token['error']) && $this->token['error'] !="invalid_grant"){
						$this->updateAccesstoken($this->token);
						$this->setAccessToken($this->token);
						$this->watchCalender('primary');
					}
					
					//$this->token = $this->getAccessToken($token);
				}
				
			//$this->access_token = $this->codeDetails->access_token;
		}
		public function reset()
		{	
			$whereap = array('adminID' => 92);

			$det['is_google_sync'] = 'y';
			$det['g_cal_token'] = "";
			$this->CI->CommonModel->updateMasterDetails("admin",$det,$whereap);
		}
// update Access Token
		public function updateAccesstoken($token){
			
			$this->CI->load->model('CommonModel');
			$tokenDetails = $this->CI->CommonModel->getMasterDetails("admin","g_cal_token",array("adminID"=>92));
		   if(!isset($tokenDetails[0]->g_cal_token) || empty($tokenDetails[0]->g_cal_token)){
			   $tokenData = array();
			   $tokenData['access_token'] =  json_encode($token);
		   }else{
			   $tokenData = json_decode($tokenDetails[0]->g_cal_token);
			   $tokenData->access_token =  json_encode($token);
		   }
		   $userData = array("g_cal_token"=>json_encode($tokenData));
		   return $iscreated = $this->CI->CommonModel->updateMasterDetails('admin', $userData, array("adminID"=>92));	
		}

// create calender event
		public function CreateCalendarEvent($calendar_id,$eventDetails ) {
			$timezone = "Asia/Kolkata";
			$curlPost = array();
			$event_time = array(
				'start'=> $eventDetails['start_time'],
				'end'=>$eventDetails['end_time'],
				'event_date'=>$eventDetails['start_date']
			);
	
			// title
			if(isset($eventDetails['title']) && !empty($eventDetails['title'])){ 
				$curlPost = array('summary' => $eventDetails['title']);
			}

			// description
			if(isset($eventDetails['description']) && !empty($eventDetails['description'])){
				$curlPost['description'] = $eventDetails['description'];
			}	
			
			// MEETING
			if(isset($eventDetails['meeting_option']) && !empty($eventDetails['meeting_option']))
			{
				// Generate Zoom meeting link
				
				$conferenceData = new Google_Service_Calendar_ConferenceData();
				$createRequest = new Google_Service_Calendar_CreateConferenceRequest();
				
				
				if($eventDetails['meeting_option'] == "google_meet")
				{
					if(isset($eventDetails['google']) && !empty($eventDetails['google'])){
						// Set Google Meet conference data
						$entryPoints[] = [
							'entryPointType' => 'video',
							// 'uri' => 'meet.google.com/xbm-vget-oxw',
							'uri' => $eventDetails['google'],
							'label' => 'Google Meet',
						];

						$createRequest->setRequestId('req-'.time());
						$createRequest->setConferenceSolutionKey(
							new Google_Service_Calendar_ConferenceSolutionKey([
								'type' => 'hangoutsMeet',
								'version' => '1'
							])
						);

						$conferenceData->setCreateRequest($createRequest);
						$conferenceData->setEntryPoints($entryPoints);
						
						// $curlPost['location'] =  "Google Meet :".$eventDetails['google'];
					}
				}
				else if($eventDetails['meeting_option'] == "zoom_meet")
				{
					if(isset($eventDetails['zoom']) && !empty($eventDetails['zoom'])){
						// Set Google Meet conference data
						$entryPoints[] = [
							'entryPointType' => 'video',
							// 'uri' => 'meet.zoom.com/xbm-vget-oxw',
							'uri' => $eventDetails['zoom'],
							'label' => 'Zoom Meet',
						];
						$createRequest->setRequestId('req-'.time());
						$createRequest->setConferenceSolutionKey(
							$sol = new Google_Service_Calendar_ConferenceSolutionKey([
								'type' => 'addOn',
								'version' => '1'
							])
				
						);

						
						$conferenceData->setCreateRequest($createRequest);
						$conferenceData->setEntryPoints($entryPoints);
					
						// $curlPost['location'] =  "Zoom Meet :". $eventDetails['zoom'];
					}
				}else
				{
					$curlPost['location'] = $eventDetails['address'];
				}
			}

			// all_Day
			if($eventDetails['all_day'] == 'yes'){
				$curlPost['start'] = array('date' => $event_time['event_date']);
				$curlPost['end'] = array('date' => $event_time['event_date']);
			}
			else{
			// time 					
				$st = date('H:i:s', strtotime($event_time['start']));
				$start = $event_time['event_date']."T".$st;
				$et = date('H:i:s', strtotime($event_time['end']));
				$end = $event_time['event_date']."T".$et;
				$curlPost['start'] = array('dateTime' => $start, 'timeZone' => $timezone);
				$curlPost['end'] = array('dateTime' => $end, 'timeZone' => $timezone);
			}

			// add guest
			$attendees = [];
			if(isset($eventDetails['guest_mail']) && !empty($eventDetails['guest_mail'])){

				foreach ($eventDetails['guest_mail'] as $guestmail) {
					// Add attendee					
					$attendee = new Google_Service_Calendar_EventAttendee();
					if (is_string($guestmail)) {
						$attendee->setEmail($guestmail);
					} elseif (is_object($guestmail) && isset($guestmail->email)) {
						$attendee->setEmail($guestmail->email);
					}
					$attendees[] = $attendee;				
				}
			}
	
			// Set reminders (before the event)
			$reminders = new Google_Service_Calendar_EventReminders();
			if(isset($eventDetails['notif']) && !empty($eventDetails['notif']) )
			{
				$reminders->setUseDefault(false);
		
				$notifType = $eventDetails['notif'];
				if($notifType=="notify")
					$notifType = 'popup';
				$timeForm = $eventDetails['time_format'] ;
				switch ($timeForm) {
					case 'days':
						$reminders->setOverrides(array(
					
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 24) * 60), // 1 da before
						));
						break;
					case 'weeks':
						$reminders->setOverrides(array(
					
							array('method' => $notifType, 'minutes' => 	($eventDetails['time'] *( 7 * 24)) * 60), // 1 weeks before
						));
						break;
					case 'hours':
						$reminders->setOverrides(array(
					
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 60), // 1 hours before
						)));
						break;
					case 'minutes':
						$reminders->setOverrides(array(
					
							array('method' => $notifType, 'minutes' => ($eventDetails['time']), // 1 hours before
						)));
						break;
					default:
						# code...
						break;
				}
		
			}

			// set Recurrency of event		
			if(isset($eventDetails['does_repeat']) && !empty($eventDetails['does_repeat'])){
				if($eventDetails['does_repeat'] == "daily")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=DAILY',
					);
				}
				if($eventDetails['does_repeat'] == "mon_to_fir")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
					);
				}
				if($eventDetails['does_repeat'] == "every_first_monday")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=MONTHLY;BYDAY=1MO',
					);
				}
				if($eventDetails['does_repeat'] == "custom")
				{	
					if($eventDetails['repeat_on']=='daily')
					{
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=DAILY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if($eventDetails['repeat_on']=='weekly')
					{
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=WEEKLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if ($eventDetails['repeat_on']=='monthly') {
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=MONTHLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if ($eventDetails['repeat_on']=='yearly') {
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=YEARLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}
				}
			}	
	
			$event = new Google_Service_Calendar_Event($curlPost);
			$event->setAttendees($attendees);
			$event->setReminders($reminders);
			$calendarId = 'primary';
			$event = $this->service->events->insert($calendarId, $event);
			return $event->id;
		}

// Update Calender event

		public function UpdateCalendarEvent($event_id='',$calendar_id = 'primary', $eventDetails='') {
			
			$timezone = "Asia/Kolkata"; //$this->GetUserCalendarTimezone($this->codeDetails->access_token);
			$curlPost = array();
			$event_time = array(
				'start'=> $eventDetails['start_time'],
				'end'=>$eventDetails['end_time'],
				'event_date'=>$eventDetails['start_date']
			);
			
			//title	// print_r($eventDetails);exit;
			if(isset($eventDetails['title']) && !empty($eventDetails['title'])){
				$curlPost['summary'] = $eventDetails['title'];
			}
			
			//description					
			if(isset($eventDetails['description']) && !empty($eventDetails['description'])){
				$curlPost['description'] = $eventDetails['description'];
			}

			// does-repeat
			if(isset($eventDetails['does_repeat']) && !empty($eventDetails['does_repeat'])){
				if($eventDetails['does_repeat'] == "daily")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=DAILY',
					);
				}
				if($eventDetails['does_repeat'] == "mon_to_fir")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
					);
				}
				if($eventDetails['does_repeat'] == "every_first_monday")
				{
					$curlPost['recurrence'] = array(
						'RRULE:FREQ=MONTHLY;BYDAY=1MO',
					);
				}
				if($eventDetails['does_repeat'] == "custom")
				{	
					if($eventDetails['repeat_on']=='daily')
					{
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=DAILY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if($eventDetails['repeat_on']=='weekly')
					{
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=WEEKLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if ($eventDetails['repeat_on']=='monthly') {
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=MONTHLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}else if ($eventDetails['repeat_on']=='yearly') {
						$curlPost['recurrence'] = array(
							'RRULE:FREQ=YEARLY;INTERVAL='.$eventDetails['week_numb'].';BYDAY=MO,TH',
						);
					}
				}
			}

			// notify
			$reminders = new Google_Service_Calendar_EventReminders();
			if(isset($eventDetails['notif']) && !empty($eventDetails['notif']) )
			{
				$reminders->setUseDefault(false);

				$notifType = $eventDetails['notif'];
				if($notifType=="notify")
					$notifType = 'popup';
				$timeForm = $eventDetails['time_format'] ;
				switch ($timeForm) {
					case 'days':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 24) * 60), // 1 da before
						));
						break;
					case 'weeks':
						$reminders->setOverrides(array(				
							array('method' => $notifType, 'minutes' => 	($eventDetails['time'] *( 7 * 24)) * 60), // 1 weeks before
						));
						break;
					case 'hours':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 60), // 1 hours before
						)));
						break;
					case 'minutes':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time']), // 1 hours before
						)));
						break;
					default:
						# code...
						break;
				}
			}	

			// MEETING
			if(isset($eventDetails['meeting_option']) && !empty($eventDetails['meeting_option']))
			{
				// Generate Zoom meeting link
				
				$conferenceData = new Google_Service_Calendar_ConferenceData();
				$createRequest = new Google_Service_Calendar_CreateConferenceRequest();
				
				
				if($eventDetails['meeting_option'] == "google_meet")
				{
					if(isset($eventDetails['google']) && !empty($eventDetails['google'])){
						// Set Google Meet conference data
						$entryPoints[] = [
							'entryPointType' => 'video',
							'uri' => $eventDetails['google'],
							'label' => 'Google Meet',
						];

						$createRequest->setConferenceSolutionKey(
							new Google_Service_Calendar_ConferenceSolutionKey([
								'type' => 'hangoutsMeet',
								'version' => '1'
							])
						);

						$createRequest->setRequestId('req-'.time());
						$conferenceData->setCreateRequest($createRequest);
						$conferenceData->setEntryPoints($entryPoints);
						
						// $curlPost['location'] =  "Google Meet :".$eventDetails['google'];
					}
				}
				else if($eventDetails['meeting_option'] == "zoom_meet")
				{
					if(isset($eventDetails['zoom']) && !empty($eventDetails['zoom'])){
						// Set Google Meet conference data
						$entryPoints[] = [
							'entryPointType' => 'video',
							'uri' => $eventDetails['zoom'],
							'label' => 'Zoom Meet',
						];

						$createRequest->setRequestId('req-'.time());
						$createRequest->setConferenceSolutionKey(
							$sol = new Google_Service_Calendar_ConferenceSolutionKey([
								'type' => 'addOn',
							])
						);
						
						$conferenceData->setCreateRequest($createRequest);
						$conferenceData->setEntryPoints($entryPoints);
						
						// $curlPost['location'] =  "Zoom Meet :". $eventDetails['zoom'];
					}
				}
				else if($eventDetails['meeting_option'] == "in_person_meet")
				{
					if(isset($eventDetails['address']) && !empty($eventDetails['address'])){
						$curlPost['location'] =  $eventDetails['address'];
					}
				}
			}

			// all_day
			if($eventDetails['all_day'] == 'yes') {
				$curlPost['start'] = array('date' => $event_time['event_date']);
				$curlPost['end'] = array('date' => $event_time['event_date']);
			}
			else {
			// time	 
				$st = date('H:i:s', strtotime($event_time['start']));
				$start = $event_time['event_date']."T".$st;
				// print($start);exit;
				$et = date('H:i:s', strtotime($event_time['end']));
				$end = $event_time['event_date']."T".$et;
				// print($ft);exit;
				$curlPost['start'] = array('dateTime' => $start, 'timeZone' => $timezone);
				$curlPost['end'] = array('dateTime' => $end, 'timeZone' => $timezone);
			}
			
			// add guest
			$attendees = [];
			
			if(isset($eventDetails['guest_mail']) && !empty($eventDetails['guest_mail'])){
				
				foreach ($eventDetails['guest_mail'] as $guestmail) {
					// Add attendee			
					$attendee = new Google_Service_Calendar_EventAttendee();
					if (is_string($guestmail)) {
						$attendee->setEmail($guestmail);
					} elseif (is_object($guestmail) && isset($guestmail->email)) {					
						$attendee->setEmail($guestmail->email);
					}
					$attendees[] = $attendee;
				}
			}

			// Set reminders ( before he event)
			$reminders = new Google_Service_Calendar_EventReminders();
			if(isset($eventDetails['notif']) && !empty($eventDetails['notif']) )
			{
				$reminders->setUseDefault(false);
				$notifType = $eventDetails['notif'];
				if($notifType=="notify")
					$notifType = 'popup';
				$timeForm = $eventDetails['time_format'] ;
				switch ($timeForm) {
					case 'days':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 24) * 60), // 1 da before
						));
						break;
					case 'weeks':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 7 * 24) * 60), // 1 weeks before
						));
						break;
					case 'hours':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time'] * 60), // 1 hours before
						)));
						break;
					case 'minutes':
						$reminders->setOverrides(array(
							array('method' => $notifType, 'minutes' => ($eventDetails['time']), // 1 hours before
						)));
						break;
					default:
						# code...
						break;
				}
		
			}

			$event = new Google_Service_Calendar_Event($curlPost);
			$event->setAttendees($attendees);
			$event->setReminders($reminders);
			$event->setConferenceData($conferenceData);

			$res = $this->service->events->update($calendar_id,$event_id,$event);
			return $res->id;
		}

// delete calender event
		public function DeleteCalendarEvent($event_id, $calendar_id,$access_token) {
			if(isset($event_id) && !empty($event_id))
				$res = $this->service->events->delete($calendar_id,$event_id);
		}

// watch events
		public function watchCalender($calendar_id='primary'){
			$webhook_url = "https://www.webtrixsolutions.com/watchCalender";//base_url().'watchCalender';
			$event = new Google_Service_Calendar_Channel();
			$event->setId(uniqid());
			$event->setType('web_hook');
			$event->setAddress($webhook_url);
			$res = $this->service->events->watch($calendar_id,$event);
			$this->CI->load->model('CommonModel');
			$tokenDetails = $this->CI->CommonModel->getMasterDetails("admin","g_cal_token",array("adminID"=>1));
			
			if(!isset($tokenDetails[0]->g_cal_token) || empty($tokenDetails[0]->g_cal_token)){
				$tokenData = array();
				$tokenData['watch'] = $res->id;
			}else{
				$tokenData = json_decode($tokenDetails[0]->g_cal_token);
				if(isset($tokenData->watch) && !empty($tokenData->watch)){
					return;
				}
				$tokenData->watch = $res->id;
			}
		    
		    $userData = array("g_cal_token"=>json_encode($tokenData));
			$this->CI->CommonModel->updateMasterDetails('admin', $userData, array("adminID"=>1));	

		}
// getCalenderList
		public function getCalenderList()
		{
			$events = $this->service->events->listEvents('primary');
			$eventsDetails = array();

			foreach ($events->getItems() as $event) {
				$eventDetails = array(
					'id' => $event->getId(),
					'summary' => $event->getSummary(),
					'description' => $event->getDescription(),
					'reminders' => $event->getReminders(),
					'conferenceDAta' => $event->getConferenceData(),

				);
				$eventsDetails[] = $eventDetails;
			}
			// print_r($eventsDetails);
		}
	}


?>
