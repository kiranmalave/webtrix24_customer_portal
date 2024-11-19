<?php
defined('BASEPATH') or exit('No direct script access allowed');

class EventMaster extends CI_Controller
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
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}

	public function getEventDetailsList()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$startDate1 = $this->input->post('start_date1');
		$startDate2 = $this->input->post('start_date2');
		$endDate1 = $this->input->post('endDate1');
		$endDate2 = $this->input->post('endDate2');
		// print_r($textval);exit;

		$statuscode = $this->input->post('status');
		$wherec = $join = array();
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			unset($postData['start_date1']);
			unset($postData['start_date2']);
			unset($postData['end_date1']);
			unset($postData['end_date2']);
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"company_id" => ["table" => "info_settings", "alias" => "dc", "column" => "companyName", "key2" => "infoID"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],			
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					if (in_array($columnName, $colData)) {
						$jkey = count($join) + 1;
						$join[$jkey]['type'] = "LEFT JOIN";
						$join[$jkey]['table'] = $columnData["table"];
						$join[$jkey]['alias'] = $columnData["alias"];
						$join[$jkey]['key1'] = $columnName;
						$join[$jkey]['key2'] = $columnData["key2"];
						$join[$jkey]['column'] = $columnData["column"];
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print_r($join);exit;
			}
			if($selectC !=""){
				$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			}else{
				$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			}
		}			
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "event_id";
			$order ="ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);

		
		// if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'" . $textval . "%'";
		// }

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// }
		// print_r($wherec);exit();

		// $join=array();
		
		// $join[0]['type'] ="LEFT JOIN";
		// $join[0]['table']="event_schedule";
		// $join[0]['alias'] ="es";
		// $join[0]['key1'] ="event_id";
		// $join[0]['key2'] ="event_id";

		if(isset($startDate1) && !empty($startDate1)){
			$sDate = date("Y-m-d",strtotime($startDate1));
			$wherec["start_date >="] = "'".$sDate."'";
		}

		if(isset($startDate2) && !empty($startDate2)){
			$eDate = date("Y-m-d",strtotime($startDate2));
			$wherec["start_date <="] = "'".$eDate."'";
		}

		if(isset($endDate1) && !empty($endDate1)){
			$sDate = date("Y-m-d",strtotime($endDate1));
			$wherec["end_date >="] = "'".$sDate."'";
		}

		if(isset($endDate2) && !empty($endDate2)){
			$eDate = date("Y-m-d",strtotime($endDate2));
			$wherec["end_date <="] = "'".$eDate."'";
		}

		if ($isAll == "Y") {
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		
		$config["base_url"] = base_url() . "event";
		
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.event_id', "events", array());
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
			$wherec = $join = array();
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC="event_id,title",'events',$wherec,'','',$join,$other);	
		}else{
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="event_schedule";
			$join[$jkey]['alias'] ="es";
			$join[$jkey]['key1'] ="event_id";
			$join[$jkey]['key2'] ="event_id";

			$selectC = "t.title,t.start_date,t.created_date,es.schedule_detail_id AS event_scheduler_id,t.event_id,event_image,".$selectC;
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'events', $wherec, $config["per_page"], $page, $join, $other);
		}

		// $selectC = "t.*,es.schedule_detail_id AS event_scheduler_id";
		// if ($isAll == "Y") {
		// 	$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'events', $wherec, '', '', $join, $other);
		// } else {
		// 	$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'events', $wherec, $config["per_page"], $page, $join, $other);
		// }
		// print $this->db->last_query();exit;

		$status['data'] = $pagesDetails;
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
		if ($pagesDetails) {
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
	public function eventData($event_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$eventDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT" || $method == "POST") {
			$eventDetails['event_id'] = $this->validatedata->validate('event_id', 'event_id', false, '', array());
			$eventDetails['leader_id'] = $this->validatedata->validate('leader_id', 'Leader', false, '', array());
			$eventDetails['schedule'] = $this->validatedata->validate('schedule', 'Schedule', false, '', array());
			$eventDetails['appointment_schedule'] = $this->validatedata->validate('appointment_schedule', 'appointment Schedule', false, '', array());
			$eventDetails['title'] = $this->validatedata->validate('title', 'Title', false, '', array());
			$eventDetails['location'] = $this->validatedata->validate('location', 'Location', false, '', array());
			$eventDetails['latitude'] = $this->validatedata->validate('latitude', 'Latitude', false, '', array());
			$eventDetails['longitude'] = $this->validatedata->validate('longitude', 'longitude', false, '', array());
			$eventDetails['address_url'] = $this->validatedata->validate('address_url', 'Location', false, '', array());
			$eventDetails['description'] = $this->validatedata->validate('description', 'Description', false, '', array());
			$eventDetails['start_date'] = $this->validatedata->validate('start_date', 'Start Date', false, '', array());
			$eventDetails['end_date'] = $this->validatedata->validate('end_date', 'End Date', false, '', array());
			$eventDetails['future_date'] = $this->validatedata->validate('future_date', 'Future Date', false, '', array());
			$eventDetails['contact_person_name'] = $this->validatedata->validate('contact_person_name', 'Contact Person Name', false, '', array());
			$eventDetails['contact_person_email'] = $this->validatedata->validate('contact_person_email', 'Contact Person Email', false, '', array());
			$eventDetails['contact_person_phone'] = $this->validatedata->validate('contact_person_phone', 'Contact Person Phone', false, '', array());
			$eventDetails['price_type'] = $this->validatedata->validate('price_type', 'Paid', false, '', array());
			$eventDetails['event_type'] = $this->validatedata->validate('event_type', 'Event Type', false, '', array());
			$eventDetails['amount'] = $this->validatedata->validate('amount', 'Amount', false, '', array());
			$eventDetails['discount'] = $this->validatedata->validate('discount', 'Discount', false, '', array());
			$eventDetails['meeting_option'] = $this->validatedata->validate('meeting_option', 'Meeting Option', false, '', array());
			$eventDetails['webinar_link'] = $this->validatedata->validate('webinar_link', 'Webinar Link', false, '', array());
			$eventDetails['event_image'] = $this->validatedata->validate('event_image', 'Event Image', false, '', array());


			if (isset($eventDetails['start_date']) && !empty($eventDetails['start_date']) && $eventDetails['start_date'] != "0000-00-00") {
				$eventDetails['start_date'] = str_replace("/", "-", $eventDetails['start_date']);
				$eventDetails['start_date'] = date("Y-m-d", strtotime($eventDetails['start_date']));
			}

			if (isset($eventDetails['end_date']) && !empty($eventDetails['end_date']) && $eventDetails['end_date'] != "0000-00-00") {
				$eventDetails['end_date'] = str_replace("/", "-", $eventDetails['end_date']);
				$eventDetails['end_date'] = date("Y-m-d", strtotime($eventDetails['end_date']));
			}

			$fieldData = $this->datatables->mapDynamicFeilds("event",$this->input->post());
			$eventDetails = array_merge($fieldData, $eventDetails);

			if ($method == "PUT") {
				$iticode = $eventDetails['event_id'];
				$eventDetails['status'] = "active";
				$eventDetails['created_by'] = $this->input->post('SadminID');
				$eventDetails['created_date'] = $updateDate;
				$eventDetails['modified_date'] = '0';

				$iscreated = $this->CommonModel->saveMasterDetails('events', $eventDetails);
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

			if ($method == "POST") {
				$where = array('event_id' => $event_id);
				if (!isset($event_id) || empty($event_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}


				$eventDetails['modified_by'] = $this->input->post('SadminID');
				$eventDetails['modified_date'] = $updateDate;

				$iscreated = $this->CommonModel->updateMasterDetails('events', $eventDetails, $where);
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
		} else if ($method == "DELETE") {
			$eventDetails = array();

			$where = array('event_id' => $event_id);
			if (!isset($event_id) || empty($event_id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('events', $where);
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
		} else {
			if($event_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

			$this->menuID = $this->input->post('menuId');
			// print($this->menuID);exit;
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			// print_r($whereData);exit;
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			$other = array();
			$wherec["t.event_id"] = "=".$event_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$userRoleHistory = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
			// $where = array("event_id" => $event_id);
			// $userRoleHistory = $this->CommonModel->getMasterDetails('events', '', $where);
			if (isset($userRoleHistory) && !empty($userRoleHistory)) {

				$status['data'] = $userRoleHistory;
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
	public function eventDataChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$this->db->trans_start();
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('events', $statusCode, $ids, 'event_id');
			// print_r($action);exit;
			
			if ($this->db->trans_status() === FALSE) {
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}else{
				$this->db->trans_commit();
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
				$where = array('event_id' => $ids);
				$changeSchedulestatus = $this->CommonModel->deleteMasterDetails('ab_event_schedule', $where);
				if ($changeSchedulestatus) {
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
		} elseif (trim($action) == "changeScheduleStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$where = array('schedule_id' => $ids);
			$changestatus = $this->CommonModel->deleteMasterDetails('ab_event_schedule_list', $where);

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

	public function eventSchedulerDetails($schedule_detail_id = '')
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// print_r($method);exit;	
		$scheduleID = $schedule_detail_id;
		if ($method == "POST" || $method == "PUT") {
			$schedulesDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $schedulesDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$schedulesDetails['schedule_detail_id'] = $this->validatedata->validate('schedule_detail_id', 'Schedule Detail ID', false, '', array());
			$schedulesDetails['event_id'] = $this->validatedata->validate('event_id', 'Event ID', false, '', array());
			$schedulesDetails['schedule_id'] = $this->validatedata->validate('schedule', 'schedule ID', false, '', array());
			$schedulesDetails['event_scheduler'] = $this->validatedata->validate('event_scheduler', 'Event Scheduler', false, '', array());
			$schedulesDetails['override_dates'] = $this->validatedata->validate('override_dates', 'Date Override', false, '', array());
			// $schedulesDetails['schedule_name'] = $this->validatedata->validate('schedule_name','Schedule Name',true,'',array());

			//   print_r($method);exit;

			if ($method == "PUT") {
				$iticode = $schedulesDetails['schedule_detail_id'];
				$schedulesDetails['created_by'] = $this->input->post('SadminID');
				$schedulesDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('event_schedule', $schedulesDetails);
				$lastLessonID = $this->db->insert_id();
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['lastID'] = $lastLessonID;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {

				$where = array('schedule_detail_id' => $scheduleID);
				if (!isset($scheduleID) || empty($scheduleID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}


				$schedulesDetails['modified_by'] = $this->input->post('SadminID');
				$schedulesDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('event_schedule', $schedulesDetails, $where);
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
			} elseif ($method == "DELETE") {
				$schedulesDetails = array();
				$where = array('schedule_id' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('event_schedule', $where);
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

			$where = array("schedule_detail_id" => $scheduleID);
			$schedulesDetails = $this->CommonModel->getMasterDetails('event_schedule', '', $where);
			if (isset($schedulesDetails) && !empty($schedulesDetails)) {

				$status['data'] = $schedulesDetails;
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

	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['event_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('events', '',$whereIn);
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

	public function multipleeventChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "active" || trim($action) == "inactive") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$menuId = $this->input->post("menuId");
			$changestatus = $this->CommonModel->changeMasterStatus('events', $action, $ids, 'event_id');
			if ($changestatus) {				
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$this->response->outputErrorResponse(996);
			}
		}
	}
}
