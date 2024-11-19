<?php
defined('BASEPATH') or exit('No direct script access allowed');

class NotificationMaster extends CI_Controller
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
	}

	public function getNotificationList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$module_name = $this->input->post('module_name');		// print_r($category);exit;
		$record_type = $this->input->post('record_type');	
		$company_id = $this->input->post('company_id');	 
		$config = array();
		$wherec = $join = array();
		if (!isset($company_id) && empty($company_id)) {
			$status['msg'] = $this->systemmsg->getErrorCode(294);
			$status['statusCode'] = 294;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}else{
			$wherec["t.company_id"] = 'IN ("' . $company_id . '")';
		}	
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($module_name) && !empty($module_name)) {
			
			$wherec["t.module_name"] = 'IN ("' . $module_name . '")';
		}
		if (isset($record_type) && !empty($record_type)) {
			
			$wherec["t.record_type"] = 'IN ("' . $record_type . '")';
		}
		$config["base_url"] = base_url() . "notificationDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('notification_id', "notification_schema", $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}

		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "assignee_id";
		$join[0]['key2'] = "adminID";

		if ($isAll == "Y") {
			$notificationDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*, a.name As assigneeName', 'notification_schema', $wherec, '', '', $join, $other);
		} else {
			$notificationDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*, a.name As assigneeName', 'notification_schema', $wherec, $config["per_page"], $page, $join, $other);
		}

		foreach ($notificationDetails as $key => $value) {
			$escalationTimeArray = explode(",", $value->escalation_time);
			if (isset($escalationTimeArray[0]) && isset($escalationTimeArray[1]) && isset($escalationTimeArray[2])) {
				$esc_time_days = $escalationTimeArray[0] . ' Day ';
				$esc_time_hrs = $escalationTimeArray[1] . 'hrs ';
				$esc_time_mins = $escalationTimeArray[2] . 'mins';
		
				// Concatenate the parts into a single string
				$formattedTime = $esc_time_days . $esc_time_hrs . $esc_time_mins;
		
				// Store the formatted time string in the array
				$notificationDetails[$key]->escalation_time = $formattedTime;
			} else {
				// Handle the case where the array does not have all the expected elements
				$notificationDetails[$key]->escalation_time = 'Invalid time format';
			}	
		}

		$status['data'] = $notificationDetails;
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
		if ($notificationDetails) {
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

	public function notificationMaster($id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$notificationMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT" || $method == "POST") {
			$notificationMasterDetails['name'] = $this->validatedata->validate('name', 'name', false, '', array());
			$notificationMasterDetails['user_type'] = $this->validatedata->validate('user_type', 'user_type', false, '', array());
			// $notificationMasterDetails['module_name'] = $this->validatedata->validate('module_name', 'module_name', false, '', array());
			$notificationMasterDetails['notification_type'] = $this->validatedata->validate('notification_type', 'notification_type', false, '', array());
			$notificationMasterDetails['action_on'] = $this->validatedata->validate('action_on', 'action_on', false, '', array());
			$notificationMasterDetails['template_id'] = $this->validatedata->validate('template_id', 'template_id', false, '', array());
			$notificationMasterDetails['field_name'] = $this->validatedata->validate('field_name', 'field_name', false, '', array());
			$notificationMasterDetails['field_value'] = $this->validatedata->validate('field_value', 'field_value', false, '', array());
			$notificationMasterDetails['escalate_to'] = $this->validatedata->validate('escalate_to', 'Escalate To', false, '', array());
			$notificationMasterDetails['assignee_id'] = $this->validatedata->validate('assignee_id', 'Assignee', false, '', array());
			$notificationMasterDetails['is_assignee_change'] = $this->validatedata->validate('is_assignee_change', 'Assignee Change', false, '', array());
			$notificationMasterDetails['attachment'] = $this->validatedata->validate('attachment', 'Attachment	', false, '', array());
			$notificationMasterDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());

			$escalationDay = $this->input->post('esc_time_days');
			$escalationHrs = $this->input->post('esc_time_hrs');
			$escalationMins = $this->input->post('esc_time_mins');
			$escalationTime = array($escalationDay, $escalationHrs, $escalationMins);
			$escalationTimeString = implode(",", $escalationTime);

			$notificationMasterDetails['escalation_time'] = $escalationTimeString;
			$sys_user_id = $this->input->post('sys_user_id');
			if (gettype($sys_user_id) == 'array') {
				$sys_user_idString = str_replace(",", '","', $sys_user_id);
				$string = implode(',', $sys_user_idString);
				$notificationMasterDetails['sys_user_id'] = $string;
			}else{
				$notificationMasterDetails['sys_user_id'] = $sys_user_id;
			}
			$notificationMasterDetails['json_data'] = $this->validatedata->validate('json_data', 'JSON Data', false, '', array());
			$notificationMasterDetails['record_type'] = $this->validatedata->validate('record_type','Record Type',false,'',array());
			$notificationMasterDetails['default_assignee'] = $this->validatedata->validate('default_assignee','Default Assignee',false,'',array());
			$notificationMasterDetails['assignee_to'] = $this->validatedata->validate('assignee_to','Assignee To',false,'',array());
			if ($method == "PUT") {
				$notificationMasterDetails['company_id'] = $this->validatedata->validate('company_id', 'Company Id', false, '', array());
				$notificationMasterDetails['module_name'] = $this->input->post('module_name');
				$notificationMasterDetails['created_by'] = $this->input->post('SadminID');
				$notificationMasterDetails['created_date'] = $updateDate;
				$notificationMasterDetails['modified_date'] = '0';
				$iscreated = $this->CommonModel->saveMasterDetails('notification_schema', $notificationMasterDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['last_id'] = $this->db->insert_id();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
			if ($method == "POST") {
				$where = array('notification_id' => $id);
				if (!isset($id) || empty($id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$notificationMasterDetails['modified_by'] = $this->input->post('SadminID');
				$notificationMasterDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('notification_schema', $notificationMasterDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['last_id'] = $id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else if ($method == "DELETE") {
			$notificationMasterDetails = array();
			$where = array('notification_id' => $id);
			if (!isset($id) || empty($id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('notification_schema', $where);
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
			
			$where["notification_id ="] = "'".$id."'";
			// $where["t.company_id ="] = "'".$company_id."'";
			$join=array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="a";
			$join[0]['key1'] ="escalate_to";
			$join[0]['key2'] ="adminID";

			$join[1]['type'] ="LEFT JOIN";
			$join[1]['table']="admin";
			$join[1]['alias'] ="aa";
			$join[1]['key1'] ="assignee_id";
			$join[1]['key2'] ="adminID";

			$selectC="t.*,a.name As escalateToName, aa.name As assigneeToName";

			$notificationDetails = $this->CommonModel->GetMasterListDetails($selectC, 'notification_schema', $where, '', '', $join, array());
			if(isset($notificationDetails) && !empty($notificationDetails)){
				
				$escalationTimeArray = explode(",", $notificationDetails[0]->escalation_time);
				if(isset($escalationTimeArray) && !empty($escalationTimeArray)){
					$notificationDetails[0]->esc_time_days = $escalationTimeArray[0];
					$notificationDetails[0]->esc_time_hrs = $escalationTimeArray[1];
					$notificationDetails[0]->esc_time_mins = $escalationTimeArray[2];
				}
				$status['data'] = $notificationDetails;
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
	public function notificationChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$statusCode = $this->input->post("status");
		$ids = $this->input->post("list");
		$where = array("notification_id" => $ids);
		if (trim($statusCode) == "inactive") {
			$changestatus = $this->CommonModel->changeMasterStatus('notification_schema', $statusCode, $ids, 'notification_id');
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
		}else if(trim($statusCode) == "delete"){
			$changestatus = $this->CommonModel->deleteMasterDetails('notification_schema', $where);
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
		}else if (trim($statusCode) == "active") {
			$details['status'] = 'active'; 
			$iscreated = $this->CommonModel->updateMasterDetails('notification_schema', $details, $where);
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
	 # UPLOAD NOTIFICATION ATTACHMENT
	 public function attachmentUpload($notification_id = '')
	 {	
		 $this->access->checkTokenKey();
		 $this->response->decodeRequest();
		 $this->load->library('realtimeupload');
		 $extraData = array();
		 if(isset($notification_id) && !empty($notification_id)){
			if ($notification_id != 0) {
				$mediapatharr = $this->config->item("mediaPATH") ."notificationAttach/".$notification_id.'/' ;
			}
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		 }
		 if (empty($notification_id) || $notification_id == 0){
			 $mediapatharr = $this->config->item("mediaPATH") ."notificationAttach/temp/";
			 if (!is_dir($mediapatharr)) {
				 if (mkdir($mediapatharr, 0777, true)) {
				 } else {
					 $status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(281);
					 $status['statusCode'] = 281;
					 $status['flag'] = 'F';
					 $this->response->output($status, 200);
				 }
			 }
		 }
		 $settings = array(
			 'uploadFolder' => $mediapatharr,
			 'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			 'maxFolderFiles' => 0,
			 'maxFolderSize' => 0,
			 'rename'=>true,
			 'returnLocation' => false,
			 'uniqueFilename' => false,
			 'dbTable' => 'notification_schema',
			 'fileTypeColumn' => '',
			 'fileColumn' => 'attachment',
			 'forignKey' => '',
			 'forignValue' => '',
			 'docType' => "",
			 'primaryKey'=>'notification_id',
			 'primaryValue' => $notification_id,
			 'docTypeValue' => '',
			 'isUpdate' => 'Y',
			 'isSaveToDB' => "N",
			 'extraData' => $extraData,
		 );
		 $this->realtimeupload->init($settings);
	 }
	 public function removeAttachment()
	 {
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$attachements =  $this->input->post('attached');
		$file =  $this->input->post('file');
		$notification_id =  $this->input->post('notification_id');
		$filePath = $this->config->item("mediaPATH").'notificationAttach/'.$notification_id.'/'.$file;
		if(file_exists($filePath))
		{
			$this->load->helper("file");
			unlink($filePath);
			if(!file_exists($filePath)){
				$update = $iscreated = $this->CommonModel->updateMasterDetails('notification_schema', array('attachment'=>$attachements), array('notification_id'=>$notification_id));
				$status['msg'] = $this->systemmsg->getSucessCode(427);
				$status['statusCode'] = 427;
				$status['data'] = array();
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else
			{
				$status['msg'] = $this->systemmsg->getErrorCode(312);
				$status['statusCode'] = 312;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(311);
			$status['statusCode'] = 311;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	 } 
}