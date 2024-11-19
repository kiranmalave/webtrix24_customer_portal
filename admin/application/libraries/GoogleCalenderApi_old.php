<?php
defined('BASEPATH') OR exit('No direct script access allowed');
#[\AllowDynamicProperties]
	class GoogleCalenderApi
	{
		var $client_id='';
		var $client_secret='';
		var $client_redirect_url='';
		var $access_token='';
		var $tokenDetails=array();
		var $codeDetails='';
		public function __construct()
		{
			$this->CI =& get_instance();
			$this->client_id = "1047776072197-pqg1v82oqb70nhmshii3bskg4t0i3sr0.apps.googleusercontent.com";
			$this->client_secret = "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";
			$this->client_redirect_url = $this->CI->config->item('base_url')."responseToken" ;
			$this->CI->load->model('CommonModel');
			$whereap = array('adminID' => 92);
            $this->tokenDetails = $this->CI->CommonModel->getMasterDetails("admin","g_cal_token",array("adminID"=>92));
			
			$this->codeDetails = json_decode($this->tokenDetails[0]->g_cal_token);
			$this->access_token = $this->codeDetails->access_token;
			// print_r($this->codeDetails);

			if(!$this->isValid())
			{
				$this->GetAccessToken();
			}
		}
		public function GetAccessToken() {	
			$url = 'https://accounts.google.com/o/oauth2/token';			
			if(isset($this->tokenDetails[0]->g_cal_token) && !empty($this->tokenDetails[0]->g_cal_token)){
				
				if(isset($this->codeDetails->user_code) && !empty($this->codeDetails->user_code)){
					print $this->codeDetails->user_code;
					$curlPost = 'client_id=' . $this->client_id . '&redirect_uri=' . $this->client_redirect_url . '&client_secret=' . $this->client_secret . '&code='. $this->codeDetails->user_code . '&grant_type=authorization_code';
					$ch = curl_init();		
					curl_setopt($ch, CURLOPT_URL, $url);		
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
					curl_setopt($ch, CURLOPT_POST, 1);		
					curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
					curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);	
					$data = json_decode(curl_exec($ch), true);
					$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);		
					$this->codeDetails->access_token = $data['access_token'];
					$this->access_token =  $data['access_token'];
					$whereap = array('adminID' => 92);
					$userData = array("g_cal_token"=>json_encode($this->codeDetails));
					$iscreated = $this->CI->CommonModel->updateMasterDetails('admin', $userData, $whereap);		
					return $data;
				}
				else{
					return false;
				}
			}else{
				return false;
			}
		}
	
		public function GetUserCalendarTimezone($access_token) {
			$url_settings = 'https://www.googleapis.com/calendar/v3/users/me/settings/timezone';
			
			$ch = curl_init();		
			curl_setopt($ch, CURLOPT_URL, $url_settings);		
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);	
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $access_token));	
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);	
			$data = json_decode(curl_exec($ch), true); //echo '<pre>';print_r($data);echo '</pre>';
			$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);		
			//print_r($http_code);
			if($http_code == "401"){
				// regenrate access token
				$result = $this->GetAccessToken();
				if(!$result){
					//$this->GetUserCalendarTimezone($result['access_token']);
				}
			}
			// if($data['error']['status']=="UNAUTHENTICATED")
			// {
			// 	// $this->CI->load->view('googel_login');
			// 	// throw new Exception('Error : Token Expired !');
			// 	$data['value'] = "UNAUTHENTICATED";
			// }
			if($http_code != 200) 
				return false;
	
			return $data['value'];
		}
	
		public function GetCalendarsList($access_token) {
			$url_parameters = array();
	
			$url_parameters['fields'] = 'items(id,summary,timeZone,items)';
			$url_parameters['minAccessRole'] = 'owner';
	
			$url_calendars = 'https://www.googleapis.com/calendar/v3/users/me/calendarList?'. http_build_query($url_parameters);
			
			$ch = curl_init();		
			curl_setopt($ch, CURLOPT_URL, $url_calendars);		
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);	
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $access_token));	
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);	
			$data = json_decode(curl_exec($ch), true); //echo '<pre>';print_r($data);echo '</pre>';
			$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);	
			//print_r($data);	
			if($http_code != 200) 
				throw new Exception('Error : Failed to get calendars list');
	
			return $data['items'];
		}
	
		public function CreateCalendarEvent($calendar_id,$eventDetails ) {
			$url_events = 'https://www.googleapis.com/calendar/v3/calendars/' . $calendar_id . '/events';
			// print_r($event_time['event_date']);exit;
			$event_time = array(
				'start'=> $eventDetails['start_time'],
				'end'=>$eventDetails['end_time'],
				'event_date'=>$eventDetails['start_date']
			);
			
			$timezone = $this->GetUserCalendarTimezone($this->codeDetails->access_token);

			if(isset($eventDetails['title']) && !empty($eventDetails['title'])){
				$curlPost = array('summary' => $eventDetails['title']);
			}
				
			if(isset($eventDetails['description']) && !empty($eventDetails['description'])){
				$curlPost['description'] = $eventDetails['description'];
			}
				
			if(isset($eventDetails['location']) && !empty($eventDetails['location'])){
				$curlPost['location'] =  $eventDetails['address'];
			}
			
			if($eventDetails['all_day'] == 'yes') {
				$curlPost['start'] = array('date' => $event_time['event_date']);
				$curlPost['end'] = array('date' => $event_time['event_date']);
			}
			else {
				$st = date('H:i:s', strtotime($event_time['start']));
				$start = $event_time['event_date']."T".$st;
				$et = date('H:i:s', strtotime($event_time['end']));
				$end = $event_time['event_date']."T".$et;
				// print($ft);exit;
				$curlPost['start'] = array('dateTime' => $start, 'timeZone' => $timezone);
				$curlPost['end'] = array('dateTime' => $end, 'timeZone' => $timezone);
			}
			//print_r($curlPost);
			$ch = curl_init();		
			curl_setopt($ch, CURLOPT_URL, $url_events);		
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
			curl_setopt($ch, CURLOPT_POST, 1);		
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $this->access_token, 'Content-Type: application/json'));	
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($curlPost));	
			$data = json_decode(curl_exec($ch), true);
			$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
			// print(curl_getinfo($ch,CURLINFO_HTTP_CODE));exit;		
			if($http_code != 200) 
				throw new Exception('Error : Failed to create event');
			return $data['id'];
		}
	
		public function UpdateCalendarEvent($event_id='',$calendar_id = 'primary', $eventDetails='') {
			$url_events = 'https://www.googleapis.com/calendar/v3/calendars/' . $calendar_id . '/events/' . $event_id;
			
			$timezone = $this->GetUserCalendarTimezone($this->codeDetails->access_token);

			$event_time = array(
				'start'=> $eventDetails['start_time'],
				'end'=>$eventDetails['end_time'],
				'event_date'=>$eventDetails['start_date']
			);

			if(isset($eventDetails['title']) && !empty($eventDetails['title'])){
				$curlPost = array('summary' => $eventDetails['title']);
			}
				
			if(isset($eventDetails['description']) && !empty($eventDetails['description'])){
				$curlPost['description'] = $eventDetails['description'];
			}
				
			if(isset($eventDetails['location']) && !empty($eventDetails['location'])){
				$curlPost['location'] =  $eventDetails['address'];
			}
			if($eventDetails['all_day'] == 'yes') {
				$curlPost['start'] = array('date' => $event_time['event_date']);
				$curlPost['end'] = array('date' => $event_time['event_date']);
			}
			else {
				$st = date('H:i:s', strtotime($event_time['start']));
				$start = $event_time['event_date']."T".$st;
				// print($start);exit;
				$et = date('H:i:s', strtotime($event_time['end']));
				$end = $event_time['event_date']."T".$et;
				// print($ft);exit;
				$curlPost['start'] = array('dateTime' => $start, 'timeZone' => $timezone);
				$curlPost['end'] = array('dateTime' => $end, 'timeZone' => $timezone);
			}
			print_r($curlPost);	
			$ch = curl_init();		
			curl_setopt($ch, CURLOPT_URL, $url_events);		
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');		
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $this->access_token, 'Content-Type: application/json'));	
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($curlPost));	
			$data = json_decode(curl_exec($ch), true);
			$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);		
			// print_r($data);exit;
			if($http_code != 200) 
				throw new Exception('Error : Failed to update event');
		}
	
		public function DeleteCalendarEvent($event_id, $calendar_id, $access_token) {
			$url_events = 'https://www.googleapis.com/calendar/v3/calendars/' . $calendar_id . '/events/' . $event_id;
	
			$ch = curl_init();		
			curl_setopt($ch, CURLOPT_URL, $url_events);		
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');		
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $access_token, 'Content-Type: application/json'));		
			$data = json_decode(curl_exec($ch), true);
			// print("here");
			// print_r($data);
			$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
			if($http_code != 204) 
				throw new Exception('Error : Failed to delete event');
		}
		public function CreateGoogleCalendarEvent($calenderId='primary',$appointmentDetails='',$time=''){
			
			//$access_token = "ya29.a0AfB_byBxveTcwpdy43Y4SxKY8MJJqrTG9IhbYhDbebN68PAdwgyGtBV2zbTHZgzLXcdMdfK-SaF1N80c2AVkp2UkwYAIZQrKUSE4WTVdWL7GYgU61qs-x3sK05tvAu1ODzGDKBBa2caU36f3EXQ83cWhKe0BGMxu2OMaCgYKAboSARMSFQHGX2MikJrsRyarr8gv6LkfS0QUpg0170";
			// if(!isset($this->codeDetails->access_token)){
				
			// 	$this->GetAccessToken();
			// }
			// print("here");
			
			//print "getting time".$timezone;
			// if($timezone !== false){
			// 	//print "create event";
			// 	return $this->CreateCalendarEvent($calenderId, $appointmentDetails, $time, $timezone,$this->codeDetails->access_token);
			// }else{
			// 	return false;
			// }

		}
		
	public function isValid() {
		$url_settings = 'https://www.googleapis.com/calendar/v3/users/me/settings/timezone';
		// print("access");	
		// print($this->access_token);
		$ch = curl_init();		
		curl_setopt($ch, CURLOPT_URL, $url_settings);		
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);	
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '. $this->access_token));	
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);	
		$data = json_decode(curl_exec($ch), true); //echo '<pre>';print_r($data);echo '</pre>';
		$http_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);		
		// print_r($data);
		if($http_code == "401"){
			return false;
		}
		else
		{
			return true ;
		}
	}
	

	}
