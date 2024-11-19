<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Appointment extends CI_Controller
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
	 * So any other public methods not categoryed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");		
		if(!$this->config->item('development'))
		{
			$this->load->library("notifications");
			$this->load->library("emails");
			$this->load->library("GoogleCalenderApi");
		}
		// $this->load->helper("url");

	}
	public function getappointmentDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$project_id = $this->input->post('project_id');


		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();

		$adminID = $this->input->post('SadminID');

		// $join1=array();
		// $join1[0]['type'] ="LEFT JOIN";
		// $join1[0]['table']="user_extra_details";
		// $join1[0]['alias'] ="u";
		// $join1[0]['key1'] ="adminID";
		// $join1[0]['key2'] ="adminID";

		$selectC1="t.roleID";
		$wherec1=array("t.adminID ="=>$adminID);
		$userRole = $this->CommonModel->GetMasterListDetails($selectC1,'admin',$wherec1,'','',$join1=array(),$other1=array());

		if($userRole[0]->roleID!=101){
			$wherec["created_by = "] = "'".$this->input->post('SadminID')."'";
		}

		if (isset($textSearch) && !empty($textSearch)) {
			if (isset($textval) && !empty($textval)) {
				if ($textSearch == "start_date") {
					$wherec['start_date <= '] = "'" . $textval . "'";
					$wherec['end_date >= '] = "'" . $textval . "'";
				} else {
					$textSearch = trim($textSearch);
					$wherec["$textSearch like  "] = "'" . $textval . "%'";
				}
			} else {
				$wherec['start_date <= '] = "'" . date("Y-m-d") . "'";
				$wherec['end_date >= '] = "'" . date("Y-m-d") . "'";
			}
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($project_id) && !empty($project_id)) {
			$wherec["t.project_id ="] = '"' . $project_id . '"';
		}

		$adminID = $this->input->post('SadminID');

		$config["base_url"] = base_url() . "appointmentDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('appointment_id', 'appointment', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if ($isAll == "Y") {
			$join = array();
			$appointmentDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'appointment', $wherec, '', '', $join, $other);
		} else {
			$selectC = "*";
			$appointmentDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'appointment', $wherec, '', $page, $join, $other);
		}
		// print_r("<pre>");
		// print_r($appointmentDetails);exit;
		$status['data'] = $appointmentDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}
		if ($appointmentDetails) {
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function appointmentMaster($appointment_id = "")
	{

		// $googlecal = new GoogleCalendarApi();
		
		// print($_SESSION['access_token']);
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
	
		$guest_email = $this->input->post("appointment_guest");
		
		if ($method == "POST" || $method == "PUT") {
			$appointmentDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			// $appointmentDetails['appointment_id'] = $this->validatedata->validate('appointment_id', 'Appointment ID', false, '', array());

			$appointmentDetails['title'] = $this->validatedata->validate('title', 'Title', false, '', array());

			$appointmentDetails['start_date'] = $this->validatedata->validate('start_date', 'Start Date', false, '', array());

			$appointmentDetails['start_time'] = $this->validatedata->validate('start_time', 'Start Time', false, '', array());

			$appointmentDetails['end_date'] = $this->validatedata->validate('end_date', 'End Date', false, '', array());

			$appointmentDetails['end_time'] = $this->validatedata->validate('end_time', 'End Time', false, '', array());

			$appointmentDetails['all_day'] = $this->validatedata->validate('all_day', 'All Day', false, '', array());

			$appointmentDetails['does_repeat'] = $this->validatedata->validate('does_repeat', 'Does Repeat', false, '', array());

			$appointmentDetails['google'] = $this->validatedata->validate('google', 'Google Meet Link', false, '', array());

			$appointmentDetails['zoom'] = $this->validatedata->validate('zoom', 'Zoom Link', false, '', array());

			$appointmentDetails['notif'] = $this->validatedata->validate('notif', 'Notification', false, '', array());

			$appointmentDetails['time'] = $this->validatedata->validate('time', 'Time', false, '', array());

			$appointmentDetails['time_format'] = $this->validatedata->validate('time_format', 'Time Format', false, '', array());

			$appointmentDetails['latitude'] = $this->validatedata->validate('latitude', 'Latitude', false, '', array());

			$appointmentDetails['longitude'] = $this->validatedata->validate('longitude', 'longitude', false, '', array());

			$appointmentDetails['address_url'] = $this->validatedata->validate('address_url', 'Location', false, '', array());

			$appointmentDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());

			$appointmentDetails['meeting_option'] = $this->validatedata->validate('meeting_option', 'Meeting Option', true, '', array());

			$appointmentDetails['week_numb'] = $this->validatedata->validate('week_numb', 'Repeat Every', false, '', array());

			$appointmentDetails['repeat_on'] = $this->validatedata->validate('repeat_on', 'Repeat On', false, '', array());

			$appointmentDetails['monthly'] = $this->validatedata->validate('monthly', 'Monthly', false, '', array());

			$appointmentDetails['end_on_date'] = $this->validatedata->validate('end_on_date', 'Ends On', false, '', array());

			$appointmentDetails['end_after_date'] = $this->validatedata->validate('end_after_date', 'Ends After Occurrences', false, '', array());

			$appointmentDetails['ends'] = $this->validatedata->validate('ends', 'Ends at', false, '', array());

			$appointmentDetails['days'] = $this->validatedata->validate('days', 'Days', false, '', array());

			$appointmentDetails['description'] = $this->validatedata->validate('description', 'Description', false, '', array());
			
			$appointmentDetails['other_details'] = $this->validatedata->validate('other_details', 'other details', false, '', array());

			$appointmentDetails['customer_ID'] = $this->validatedata->validate('customer_ID', 'Customer ID', false, '', array());

			$appointmentDetails['extra_notif'] = $this->validatedata->validate('extra_notif', 'ExtraNotif', false, '', array());

			$appointmentDetails['project_id'] = $this->validatedata->validate('project_id', 'Project', false, '', array());

			if (isset($appointmentDetails['start_date']) && !empty($appointmentDetails['start_date']) && $appointmentDetails['start_date'] != "0000-00-00") {
				$appointmentDetails['start_date'] = str_replace("/", "-", $appointmentDetails['start_date']);
				$appointmentDetails['start_date'] = date("Y-m-d", strtotime($appointmentDetails['start_date']));
			}

			if (isset($appointmentDetails['end_date']) && !empty($appointmentDetails['end_date']) && $appointmentDetails['end_date'] != "0000-00-00") {
				$appointmentDetails['end_date'] = str_replace("/", "-", $appointmentDetails['end_date']);
				$appointmentDetails['end_date'] = date("Y-m-d", strtotime($appointmentDetails['end_date']));
			}

			if (isset($appointmentDetails['end_on_date']) && !empty($appointmentDetails['end_on_date']) && $appointmentDetails['end_on_date'] != "0000-00-00") {
				$appointmentDetails['end_on_date'] = str_replace("/", "-", $appointmentDetails['end_on_date']);
				$appointmentDetails['end_on_date'] = date("Y-m-d", strtotime($appointmentDetails['end_on_date']));
			}


			$fieldData = $this->datatables->mapDynamicFeilds("appointment",$this->input->post());
			$appointmentDetails = array_merge($fieldData, $appointmentDetails);

			if ($method == "PUT") {
				// $iticode = $appointmentDetails['appointment_id'];
				$appointmentDetails['company_id'] = $this->validatedata->validate('company_id', 'company Id', false, '', array());
				$appointmentDetails['status'] = "active";
				$appointmentDetails['created_by'] = $this->input->post('SadminID');
				$appointmentDetails['created_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->saveMasterDetails('appointment', $appointmentDetails);
				
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$appointment_id = $this->db->insert_id();
					// check user permission and create google event
					$isAllowed = $this->CommonModel->getMasterDetails("admin","is_google_sync",array("adminID"=>$this->input->post('SadminID')));
					
					if($isAllowed[0]->is_google_sync == "y"){
						// print("here");
						$appointmentDetails['guest_mail'] = $guest_email;
						$whereap = array('appointment_id' => $appointment_id);
						$appointmentDetails1['other_details']= $this->googlecalenderapi->CreateCalendarEvent('primary', $appointmentDetails);
						$iscreated = $this->CommonModel->updateMasterDetails('appointment', $appointmentDetails1, $whereap);	
					}
					// print($guest_email);exit;
					$newguest = $this->input->post('new_guest');
					if (isset($newguest) && !empty($newguest)) {
						$this->saveGuestDetails($newguest, $appointment_id);
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				
				$where = array('appointment_id' => $appointment_id);
				// if (!isset($appointment_id) || empty($appointment_id)) {
				// 	$status['msg'] = $this->systemmsg->getErrorCode(998);
				// 	$status['statusCode'] = 998;
				// 	$status['data'] = array();
				// 	$status['flag'] = 'F';
				// 	$this->response->output($status, 200);
				// }
				$appointmentDetails['modified_by'] = $this->input->post('SadminID');
				$appointmentDetails['modified_date'] = $updateDate;
		
				$iscreated = $this->CommonModel->updateMasterDetails('appointment', $appointmentDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {

					$isAllowed = $this->CommonModel->getMasterDetails("admin","is_google_sync",array("adminID"=>$this->input->post('SadminID')));
					
					if($isAllowed[0]->is_google_sync == "y"){
						
						
						$appointmentDetails['guest_mail'] = $guest_email;
						$this->googlecalenderapi->UpdateCalendarEvent($appointmentDetails['other_details'], 'primary', $appointmentDetails);
					}
					$newguest = $this->input->post('new_guest');
					if (isset($newguest) && !empty($newguest)) {
						$this->saveGuestDetails($newguest, $appointment_id);
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$appointmentDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('appointment', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else {
			$where = array("appointment_id" => $appointment_id);
			$appointmentDetails = $this->CommonModel->getMasterDetails('appointment', '', $where);

			$wherec["appointment_id ="] = "'".$appointment_id."'";
				$join=array();

				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="customer";
				$join[0]['alias'] ="c";
				$join[0]['key1'] ="customer_ID";
				$join[0]['key2'] ="customer_id";


				$selectC = " c.name AS customerName";
				$createdBy = $this->CommonModel->GetMasterListDetails($selectC, 'appointment', $wherec, '', '', $join, '');
				// print_r($createdBy);exit;
				if(!empty($createdBy)){
					$customerName = array_column($createdBy,'customerName');
					$appointmentDetails[0]->customerName = $customerName;
				}
			if (isset($appointmentDetails) && !empty($appointmentDetails)) {
				$whereGuest = array(
					"appointment_id" => $appointment_id,
					"status" => "active" // Add the additional WHERE condition for status
				);
				$appointmentDetailsGuest = $this->CommonModel->getMasterDetails('appointment_guests', '', $whereGuest);
				if (!empty($appointmentDetailsGuest)) {
					$guestEmails = array_column($appointmentDetailsGuest, 'guest_email');
					$guestID = array_column($appointmentDetailsGuest, 'guest_id');
					$appointmentDetails[0]->appointment_guest = $guestEmails;
					$appointmentDetails[0]->appointment_guestID = $guestID;
				}

				$status['data'] = $appointmentDetails;
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {

				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function AppointmentChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$access_token = "ya29.a0AfB_byBxveTcwpdy43Y4SxKY8MJJqrTG9IhbYhDbebN68PAdwgyGtBV2zbTHZgzLXcdMdfK-SaF1N80c2AVkp2UkwYAIZQrKUSE4WTVdWL7GYgU61qs-x3sK05tvAu1ODzGDKBBa2caU36f3EXQ83cWhKe0BGMxu2OMaCgYKAboSARMSFQHGX2MikJrsRyarr8gv6LkfS0QUpg0170";
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$event_id = $this->input->post("g_event");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('appointment', $statusCode, $ids, 'appointment_id');

			$isAllowed = $this->CommonModel->getMasterDetails("admin","is_google_sync",array("adminID"=>$this->input->post('SadminID')));
			if($isAllowed[0]->is_google_sync == "y"){
				$this->googlecalenderapi->DeleteCalendarEvent($event_id, 'primary', $access_token);
			}
			
			
			if ($changestatus) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function saveGuestDetails($guest_email = '', $appointment_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$appointment_guests = array();
		if ($method == "PUT" || $method == "POST") {
			$appointment_guests['appointment_id'] = $appointment_id;
			$iscreated = '';
			if ($method == "PUT" || $method == "POST") {
				if (empty($guest_email)) {
					$status['msg'] = "Appointment Guest Required";
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					foreach ($guest_email as $single_guest) {
						if (is_string($single_guest)) {
							$appointment_guests['guest_email'] = $single_guest;
						} elseif (is_object($single_guest) && isset($single_guest->email)) {
							$appointment_guests['guest_email'] = $single_guest->email;
						}
						$iscreated = $this->CommonModel->saveMasterDetails('appointment_guests', $appointment_guests);
					}
				}
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		}
	}

	public function removeGuest()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$email = $this->input->post("list");
			// $this->guestExists();
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('appointment_guests', $statusCode, $email, 'guest_email');

			if ($changestatus) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
	public function getappointmentDate()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		$config = $this->config->item('pagination');
		$wherec = $join = array();

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		$adminID = $this->input->post('SadminID');

		$config["base_url"] = base_url() . "appointmentDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('appointment_id', 'appointment', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if ($isAll == "Y") {
			$join = array();
			$appointmentDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'appointment', $wherec, '', '', $join, $other);
		} else {
			$selectC = "*";
			$appointmentDetails = $this->CommonModel->GetMasterListDetails($selectC = 'start_date,end_date,title', 'appointment', $wherec, $config["per_page"], $page, $join, $other);
		}
		// print_r("<pre>");
		// print_r($wherec);exit;
		$allDates = [];

		foreach ($appointmentDetails as $event) {
			$startDate = new DateTime($event->start_date);
			$endDate = new DateTime($event->end_date);
			$dateInterval = new DateInterval('P1D'); // 1 day interval

			$period = new DatePeriod($startDate, $dateInterval, $endDate->modify('+1 day'));

			foreach ($period as $date) {
				$allDates[] = [
					'date' => $date->format('Y-m-d'),
					'title' => $event->title,
				];
			}
		}

		$scls = new stdClass();
		$scls->events = $allDates;
		$dd = array();
		$dd[] = $scls;
		$status['data'] = $dd;

		if ($appointmentDetails) {
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	// public function guestExists($email ='',$appointment_id='')
	// {
	// 	// print('here');exit;
	// 	$this->response->decodeRequest();
	// 	$t = $this->input->post('text');
	// 	$t = $t ?? '';
	// 	$text = trim($t);
	// 	$wherec = array();

	// 	if (isset($appointment_id) && !empty($appointment_id)) {
	// 		$wherec["appointment_id="] = $appointment_id ;
	// 	}

	// 	if (isset($text) && !empty($text)) {
	// 		$wherec["email like  "] = "'%" . $text . "%'";
	// 	}
	// 	//print_r($wherec);
	// 	$updateAns = $this->CommonModel->GetMasterListDetails("appointment_id,email", "appointment_guests", $wherec);
		
	// 	print_r($updateAns);exit;

	// 	// if(isse($updateAns) && !empty($updateAns))
	// 	// {	
	// 	// 	if($updateAns[0])

	// 	// }

		

	// }
	
	
}
