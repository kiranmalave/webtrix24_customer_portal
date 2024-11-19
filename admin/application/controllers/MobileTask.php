<?php
defined('BASEPATH') or exit('No direct script access allowed');

class MobileTask extends CI_Controller
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
	 * So any other public methods not contacted with an underscore will
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
		if(!$this->config->item('development'))
		{
			$this->load->library("NotificationTrigger");
			$this->load->library("notifications");
			$this->load->library("emails");
			
		}
	}


	public function gettaskDetails()
	{
		// $this->access->checkTokenKey();
		// $this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('task_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$startDate2 = $this->input->post('fromDate2');
		$endDate2 = $this->input->post('toDate2');
		$assignee = $this->input->post('assignee');
		$task_priority =$this->input->post('task_priority');
		$task_status = $this->input->post('task_status');
		$customer =$this->input->post('customer_id');
		$createdBy = $this->input->post('created_by');
		$due_date = $this->input->post('due_date');
        $recordType = $this->input->post('record_type');
		// print_r($createdBy);exit;

		$customOrder = "CASE
			WHEN DATE(t.due_date) = CURDATE() THEN 1
			WHEN DATE(t.due_date) = CURDATE() + INTERVAL 1 DAY THEN 2
			ELSE 3
		END";

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = $customOrder . ", subject"; // You can add your default sorting field here
			$order = "ASC"; // Change this to "DESC" if you want descending order
		} else {
			$orderBy = $customOrder . ", " . $orderBy;
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		// print_r($wherec);exit;
		if (isset($assignee) && !empty($assignee)) {
			$assigneeArray = json_decode($assignee);
			$assigneeString = "'" . implode("','", $assigneeArray) . "'";
			$wherec["assignee IN"] =  "($assigneeString)";
		}

		if (isset($task_priority) && !empty($task_priority)) {
			$task_priorityArray = json_decode($task_priority);
			$task_priorityString = "'" . implode("','", $task_priorityArray) . "'";
			$wherec["task_priority IN"] = "($task_priorityString)";
		}


		if(isset($task_status) && !empty($task_status)){
			$task_statusArray = json_decode($task_status);
			$task_statusString = "'" . implode("','", $task_statusArray) . "'";
			$wherec["task_status IN"] = "($task_statusString)";
		}

		if(isset($customer) && !empty($customer)){
			$customerArray = json_decode($customer);
			$customerString = "'" . implode("','", $customerArray) . "'";
			$wherec["customer_id IN"] = "($customerString)";
		}
		
		if(isset($createdBy) && !empty($createdBy)){
			$createdByArray = json_decode($createdBy);
			$createdByString = "'" . implode("','", $createdByArray) . "'";
			$wherec["t.created_by IN"] = "($createdByString)";
		}

		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["start_date >="] = "'".$sDate."'";
		}
		if (isset($endDate) && !empty($endDate)) {
			$eDate = date("Y-m-d", strtotime($endDate));
			$wherec["start_date <="] = "'" . $eDate . "'";
		}
	
		if(isset($startDate2) && !empty($startDate2)){
			$sDate = date("Y-m-d",strtotime($startDate2));
			$wherec["due_date >="] = "'".$sDate."'";
		}
		if(isset($endDate2) && !empty($endDate2)){
			$eDate = date("Y-m-d",strtotime($endDate2));
			$wherec["due_date <="] = "'".$eDate."'";
		}

		if(isset($due_date) && !empty($due_date)){
			$eDate = date("Y-m-d",strtotime($due_date));
			$wherec["due_date ="] = "'".$eDate."'";
		}

		// $adminID = $this->input->post('SadminID');

		// $join1=array();
		

		// $selectC1="*";//,r.regionName
		// $wherec1=array("t.adminID ="=>$adminID);
		// $taskDetailsList = $this->CommonModel->GetMasterListDetails($selectC1,'admin',$wherec1,'','',$join1,$other1=array());
		
		// if($taskDetailsList[0]->roleOfUser!=101){
		// 	$wherec["assignee = "] = "'".$this->input->post('SadminID')."'";
		// }
		// print_r("<pre>");
		// print_r($wherec);exit();
		$join=array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="assignee";
		$join[0]['key2'] ="adminID";

		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="categories";
		$join[1]['alias'] ="c";
		$join[1]['key1'] ="task_status";
		$join[1]['key2'] ="category_id";

		$join[2]['type'] ="LEFT JOIN";
		$join[2]['table']="categories";
		$join[2]['alias'] ="ca";
		$join[2]['key1'] ="task_priority";
		$join[2]['key2'] ="category_id";

		$join[3]['type'] ="LEFT JOIN";
		$join[3]['table']="categories";
		$join[3]['alias'] ="ct";
		$join[3]['key1'] ="task_type";
		$join[3]['key2'] ="category_id";

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('task_id', 'tasks', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		$selectC = "t.*, c.categoryName AS status_slug, ca.categoryName AS priority_slug, a.name, c.cat_color AS statusColor, ca.cat_color AS priorityColor, ct.cat_color AS typeColor";
		if ($isAll == "Y") {
			$join = array();
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC, 'tasks', $wherec, '', '', $join, $other);
		} else {
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC, 'tasks', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $taskDetails;
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
		if ($taskDetails) {
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

	public function taskMaster($task_id="")
	{
		
		// $this->access->checkTokenKey();
		// $this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$watchers_name = $this->input->post("tasksWatchers");
		$task_attachments = $this->input->post("attachment_file");
		if ($method == "PUT" || $method == "POST") {
			$taskDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$taskDetails['subject'] = $this->validatedata->validate('subject', 'Subject', false, '', array());
			$taskDetails['description'] = $this->validatedata->validate('description', 'Description', false, '', array());
			$taskDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer', false, '', array());
			$taskDetails['task_status'] = $this->validatedata->validate('task_status', 'Task Status', false, '', array());
			$taskDetails['task_priority'] = $this->validatedata->validate('task_priority', 'Task Priority', false, '', array());
			$taskDetails['task_repeat'] = $this->validatedata->validate('task_repeat', 'Task Repeat', false, '', array());
			$taskDetails['start_date'] = $this->validatedata->validate('start_date', 'Start Date', false, '', array());
			$taskDetails['due_date'] = $this->validatedata->validate('due_date', 'End Date', false, '', array());
			$taskDetails['assignee'] = $this->validatedata->validate('assignee', 'Assignee', false, '', array());
			$taskDetails['task_type'] = $this->validatedata->validate('task_type', 'Task_Type', false, '', array());
			$taskDetails['status'] = $this->validatedata->validate('status', 'Status', false, '', array());
			$taskDetails['does_repeat'] = $this->validatedata->validate('does_repeat', 'does_repeat', false, '', array());
            $taskDetails['record_type'] = $this->validatedata->validate('record_type', 'record_type', false, '', array());
			$taskDetails['week_numb'] = $this->validatedata->validate('week_numb', 'week_numb', false, '', array());
			$taskDetails['repeat_on'] = $this->validatedata->validate('repeat_on', 'repeat_on', false, '', array());
			$taskDetails['days'] = $this->validatedata->validate('days', 'days', false, '', array());
			$taskDetails['monthly'] = $this->validatedata->validate('monthly', 'monthly', false, '', array());
			$taskDetails['ends'] = $this->validatedata->validate('ends', 'ends', false, '', array());
			$taskDetails['end_on_date'] = $this->validatedata->validate('end_on_date', 'end_on_date', false, '', array());
			$taskDetails['end_after_date'] = $this->validatedata->validate('end_after_date', 'end_after_date', false, '', array());
			$taskDetails['product_id'] = $this->validatedata->validate('product', 'Product', false, '', array());

			if (isset($taskDetails['start_date']) && !empty($taskDetails['start_date']) && $taskDetails['start_date'] != "0000-00-00") {
				$taskDetails['start_date'] = str_replace("/", "-", $taskDetails['start_date']);
				$taskDetails['start_date'] = date("Y-m-d", strtotime($taskDetails['start_date']));
			}

			if (isset($taskDetails['due_date']) && !empty($taskDetails['due_date']) && $taskDetails['due_date'] != "0000-00-00") {
				$taskDetails['due_date'] = str_replace("/", "-", $taskDetails['due_date']);
				$taskDetails['due_date'] = date("Y-m-d", strtotime($taskDetails['due_date']));
			}

            if (isset($taskDetails['end_on_date']) && !empty($taskDetails['end_on_date']) && $taskDetails['end_on_date'] != "0000-00-00") {
				$taskDetails['end_on_date'] = str_replace("/", "-", $taskDetails['end_on_date']);
				$taskDetails['end_on_date'] = date("Y-m-d", strtotime($taskDetails['end_on_date']));
			}else{
				$taskDetails['end_on_date'] = null;
			}
			$cat = $this->input->post("category_id");

			if ($method == "PUT") {
                $taskDetails['company_id'] = $this->validatedata->validate('company_id', 'company Id', false, '', array());
				$taskDetails['status'] = "active";
				$taskDetails['created_by'] = $this->input->post('SadminID');
				$taskDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('tasks', $taskDetails);

				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$taskID = $this->db->insert_id();
                    $status['lastID'] = $taskID;
					$customerEmail = $this->getCustomerEmail($taskDetails['customer_id']);
					$custEmailArr = "";
					
					if(isset($customerEmail[0]->email) && !empty($customerEmail[0]->email)){
						$custEmailArr = explode(" ", $customerEmail[0]->email);
					}
					if(!$this->config->item('development')){
						$this->notificationtrigger->prepareNotification('add','tasks','task_id',$taskID,array(),$this->menuID,$company_id);
					}

                    $notification = array(
						'title' => "Task assigned to you",
						'body' => $taskDetails['subject'],
					);
					
					if(!$this->config->item('development')){
						$this->notifications->sendmessage($notification,$taskDetails['assignee']);
						// get user details to send email
						$where = array("adminID" => $taskDetails['assignee']);
						$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
						$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array("adminID"=>$taskDetails['created_by']));
						$assignedBy ="";
						if(isset($assignByDetails)&& !empty($assignByDetails)){
							$assignedBy = $assignByDetails[0]->name;
						}
						if(isset($tDetails)&& !empty($tDetails)){
							$messageDetails = $taskDetails['subject']." <br> ";
							$this->emails->sendMailDetails("","",$tDetails[0]->email,'','',$assignedBy." assigned task-".$taskID." to you",);
						}
					}

					$this->addTaskHistory($taskID, 'Task Created', 'Created', $taskDetails['created_by']);
					if (isset($watchers_name) && !empty($watchers_name)) {
						$saveFlag = $this->saveWatchersDetails($watchers_name, $taskID, $taskDetails['created_by']);
						if ($saveFlag == true) {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getErrorCode(424);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
					if (isset($task_attachments) && !empty($task_attachments)) {
						$saveFlag = $this->saveAttachments($task_attachments, $taskID, $taskDetails['created_by']);
						if ($saveFlag == true) {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getErrorCode(424);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
                    $status['lastID'] = $taskID;
					$status['flag'] = 'S';
					$this->response->output($status, 200);

				}
				
			}elseif($method=="POST"){
				$where=array('task_id'=>$task_id);
				if(!isset($task_id) || empty($task_id)){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
				}
				
				$taskDetails['modified_by'] = $this->input->post('SadminID');
				$taskDetails['modified_date'] = $updateDate;

				$oldData = $this->CommonModel->getMasterDetails('tasks', '', $where) ;

				$iscreated = $this->CommonModel->updateMasterDetails('tasks',$taskDetails,$where);

				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}else{
					if(!$this->config->item('development'))
					{
						$this->notificationtrigger->prepareNotification('update','tasks','task_id',$task_id,$oldData,$this->menuID,$company_id);
					}
					$created['id'] = $this->input->post("created_by");
					if(isset($watchers_name) && !empty($watchers_name)){
						$clientWatchers = array_column($watchers_name, "id");
						
						foreach ($clientWatchers as $key => $value) {
							$messageDetails = '' ;
							$notification = array();
							if (!$this->config->item('development')) {
								$where = array("adminID" =>$value);
								$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
	
								$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array("adminID"=> $taskDetails['modified_by']));
								$assignedBy ="";
								if(isset($assignByDetails)&& !empty($assignByDetails)){
									$assignedBy = $assignByDetails[0]->name;
								}
	
								$join = array();
								$join[0]['type'] ="LEFT JOIN";
								$join[0]['table']="categories";
								$join[0]['alias'] ="c";
								$join[0]['key1'] ="old_val";
								$join[0]['key2'] ="category_id";
	
								$join[1]['type'] ="LEFT JOIN";
								$join[1]['table']="categories";
								$join[1]['alias'] ="ca";
								$join[1]['key1'] ="new_val";
								$join[1]['key2'] ="category_id";
								
								$whereT["record_id ="] = "'".$task_id."'";
								$whereT[" t.description ="] = "'update'";
								$whereT[" t.is_notify ="] = "'n'";
	
								$taskHistory = $this->CommonModel->GetMasterListDetails('t.*,c.categoryName AS oldName, ca.categoryName AS newName','history', $whereT ,'', '', $join, '');
	
								foreach($taskHistory as $key => $value1) {
									if(!empty($value1->oldName) && !empty($value1->newName)){
										$messageDetails.= $assignedBy." Updated".$value1->col." <br> From <del>'".$value1->oldName."'</del> To '".$value1->newName."'<br> <br>";
									}
								}
								if(isset($messageDetails) && !empty($messageDetails)){
									$notification = array(
										'title' => "Task Updated",
										'body' => $messageDetails,
									);
								}
								if(isset($notification) && !empty($notification)){
									// $this->notifications->sendmessage($notification,$value);
									if(isset($tDetails)&& !empty($tDetails)){
										$this->emails->sendMailDetails("","",$tDetails[0]->email,'','',"Task Updated:- ".$task_id, $messageDetails);
									}
								}
							}
						}
						$taskHistoryUpdate['is_notify'] = 'y';
						$whereH = array('record_id'=>$task_id);
						$history = $this->CommonModel->updateMasterDetails('history',$taskHistoryUpdate,$whereH);
					}
					if(isset($watchers_name) && !empty($watchers_name)){
						$saveFlag = $this->saveWatchersDetails($watchers_name,$task_id,$taskDetails['modified_by']);
					}
					if(isset($task_attachments) && !empty($task_attachments)){
						
						$saveFlag1 = $this->saveAttachments($task_attachments,$task_id,$taskDetails['modified_by']);	
					}
					
					if(isset($saveFlag1)&&!empty($saveFlag1)){
						if($saveFlag1 == true){
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] =array();
							$status['flag'] = 'S';
							$this->response->output($status,200);
						}else{
							$status['msg'] = $this->systemmsg->getErrorCode(424);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
					}elseif(isset($saveFlag)&&!empty($saveFlag)){
						if($saveFlag == true){
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] =array();
							$status['flag'] = 'S';
							$this->response->output($status,200);
						}else{
							$status['msg'] = $this->systemmsg->getErrorCode(424);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
					}else{
						$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] =array();
							$status['flag'] = 'S';
							$this->response->output($status,200);
					}

				}
			} elseif ($method == "dele") {
				$taskDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('tasks',$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
			}
	
		}else
		{ 
            if($task_id ==""){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] =array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
				$where = array("task_id"=>$task_id);
				$taskDetails = $this->CommonModel->getMasterDetails('tasks','',$where);
				if(isset($taskDetails) && !empty($taskDetails)){
					$whereGuest = array(
						"task_id" => $task_id,
						"status" => "active" // Add the additional WHERE condition for status
					);
					$whereAttachment = array(
						"task_id" => $task_id
					);
					$watchersDetailsName = $this->CommonModel->getMasterDetails('tasks_watchers', '', $whereGuest);
					if (!empty($watchersDetailsName)) {
						$watchers_name = array_column($watchersDetailsName,'watchers_name');
						$watchersID  = array_column($watchersDetailsName,'watcher_id');
						$taskDetails[0]->tasksWatchers = $watchers_name;
						$taskDetails[0]->tasks_watchersID = $watchersID;
					}
					$taskAttachments = $this->CommonModel->getMasterDetails('tasks_attachment','',$whereAttachment);
					if(!empty($taskAttachments)){
						$attachment = array_column($taskAttachments,'attachment_file');
						$attachmentID = array_column($taskAttachments,'attachment_id');
						$taskDetails[0]->attachment_file = $attachment;
						$taskDetails[0]->attachment_id = $attachmentID;
					}
					// print_r("<pre>");
					// print_r($watchersDetailsName);exit;
				$status['data'] = $taskDetails;
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);

				}else{

				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] =array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
				}	
		}
	}

	public function taskChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('tasks', $statusCode, $ids, 'task_id');

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

	public function saveAttachments($attachment = '', $task_id = '', $adminID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$tasks_attachments = array();
		if ($method == "PUT" || $method == "POST") {
			$where = array('task_id' => $task_id);
			$changestatus = $this->CommonModel->deleteMasterDetails('tasks_attachment', $where);
			$tasks_attachments['task_id'] = $task_id;
			$tasks_attachments['created_by'] = $adminID;
			if ($method == "PUT" || $method == "POST") {
				if (empty($attachment)) {
					// // print_r($guest_email);exit;	
					// $status['msg'] = "Watchers Name Required";
					// $status['statusCode'] = 998;
					// $status['data'] = array();
					// $status['flag'] = 'F';
					// $this->response->output($status, 200);
					return false;
				} else {
					foreach ($attachment as $single_attachment) {
						if (is_string($single_attachment)) {
							$tasks_attachments['attachment_file'] = $single_attachment;
						} elseif (is_object($single_attachment) && isset($single_attachment->url)) {
							$tasks_attachments['attachment_file'] = $single_attachment->url;
						}
						$iscreated = $this->CommonModel->saveMasterDetails('tasks_attachment', $tasks_attachments);
					}
				}
				if (!$iscreated) {
					return false;
				} else {
					return true;
				}
			}
		}
	}

	public function saveWatchersDetails($watchers_name = '', $task_id = '', $adminID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// print_r("<pre>");
		// print_r($method);exit;
		$tasks_watchers = array();
		if ($method == "PUT" || $method == "POST") {
			$where = array('task_id' => $task_id);
			$changestatus = $this->CommonModel->deleteMasterDetails('tasks_watchers', $where);
			$tasks_watchers['task_id'] = $task_id;
			$tasks_watchers['created_by'] = $adminID;
			if ($method == "PUT" || $method == "POST") {

				if (empty($watchers_name)) {
					// // print_r($guest_email);exit;	
					// $status['msg'] = "Watchers Name Required";
					// $status['statusCode'] = 998;
					// $status['data'] = array();
					// $status['flag'] = 'F';
					// $this->response->output($status, 200);
					return false;
				} else {
					foreach ($watchers_name as $single_guest) {
						if (is_string($single_guest)) {
							$tasks_watchers['watchers_name'] = $single_guest;
						} elseif (is_object($single_guest) && isset($single_guest->name)) {
							$tasks_watchers['watchers_name'] = $single_guest->name;
							$tasks_watchers['admin_id'] = $single_guest->id;
						}
						// print_r($tasks_watchers);exit;	
						$iscreated = $this->CommonModel->saveMasterDetails('tasks_watchers', $tasks_watchers);
					}
				}
				if (!$iscreated) {
					return false;
				} else {
					return true;
				}
			}
		}
	}

	public function removeWatchers()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$taskId= $this->input->post("taskID");
				$wherec["task_id ="] = $taskId;
				$wherec["admin_id ="] = $ids;
				// print_r($wherec);exit;
				// $changestatus = $this->CommonModel->changeMasterStatus('tasks_watchers',$statusCode,$ids,'admin_id');
				// $tableName = '', $where = '', $whereIn = array()
				$changestatus = $this->CommonModel->deleteMasterDetails('tasks_watchers',$wherec);
			if($changestatus){

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

	public function removeAttachment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("status");
			if(trim($action) == "delete"){
				$fileID = $this->input->post("fileID");
				$taskId= $this->input->post("taskID");
				$wherec["task_id ="] = $taskId;
				$wherec["attachment_id ="] = $fileID;
				$changestatus = $this->CommonModel->deleteMasterDetails('tasks_attachment',$wherec);
			if($changestatus){
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
	public function taskCommentMaster($task_id="")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		if ($method == "POST" || $method == "PUT") {
			//echo "|Dddd"; exit;
			$taskDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$taskDetails['comment_id'] = $this->validatedata->validate('comment_id', 'Comment ID', false, '', array());
			$taskDetails['task_id'] = $this->validatedata->validate('task_id', 'Task ID', true, '', array());
			$taskDetails['user_id'] = $this->validatedata->validate('user_id', 'User ID', false, '', array());
			$taskDetails['comment_text'] = $this->validatedata->validate('comment_text', 'Comment', true, '', array());
			$taskDetails['status'] = $this->validatedata->validate('status', 'Status', true, '', array());
			$method = "PUT";
			//print_r($taskDetails);exit();
			if ($method == "PUT") {
				$iticode = $taskDetails['task_id'];
				$taskDetails['status'] = "active";
				$taskDetails['user_id'] = $this->input->post('SadminID');
				//$taskDetails['created_by'] = $this->input->post('SadminID');
				$taskDetails['created_date'] = $updateDate;
				//print_r($taskDetails);exit();
				$iscreated = $this->CommonModel->saveMasterDetails('task_comments', $taskDetails);
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
			} elseif ($method == "POST") {
				$where = array('task_id' => $task_id);
				if (!isset($task_id) || empty($task_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				// $taskDetails['modified_by'] = $this->input->post('SadminID');
				// $taskDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('task_comments', $taskDetails, $where);
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
			} elseif ($method == "dele") {
				$taskDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('task_comments', $where);
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
		} elseif ($method == "GET") {
			//echo "sss".$user_id = $this->input->post('SadminID'); exit;
			$where = array("user_id" => 92); //array("user_id"=>$user_id);
			$taskDetails = $this->CommonModel->getMasterDetails('task_comments', '', $where);
			if (isset($taskDetails) && !empty($taskDetails)) {
				$status['data'] = $taskDetails;
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

	public function gettaskCommentDetails()
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
		$task_id = $this->input->post('task_id');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "comment_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($task_id) && !empty($task_id)) {
			$wherec["t.task_id"] = '= (' . $task_id . ')';
		}

		$adminID = $this->input->post('SadminID');

		$join = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('comment_id', 'task_comments', $wherec, $other);
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
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'task_comments', $wherec, '', '', $join, $other);
		} else {
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'task_comments', $wherec, $config["per_page"], $page, $join, $other);
		}
		// print_r("<pre>");
		// print_r($taskDetails);exit;
		$status['data'] = $taskDetails;
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
		if ($taskDetails) {
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

	public function addTaskHistory($task_id, $action_type, $description, $user_id)
	{
		
		$taskDetails = array(
			'task_id' => $task_id,
			'action_type' => $action_type,
			'description' => $description,
			'user_id' => $user_id,
			'col'=> 'Task',
			'timestamp' => date('Y-m-d H:i:s')
		);
		$iscreated = $this->CommonModel->saveMasterDetails('task_history', $taskDetails);
	}

	public function getTaskHistory()
	{
		$task_id = $this->input->post('task_id');
		$wherec = $join = array();
		if (isset($task_id) && !empty($task_id)) {
			$wherec["task_id"] = '= (' . $task_id . ')';
		}
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";

		$config = array();
		$orderBy = "history_id";
		$order = "DESC";
		$other = array("orderBy" => $orderBy, "order" => $order);
		$historyDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'task_history', $wherec, '', '', $join, $other);
		// print_r($historyDetails);exit;
		foreach ($historyDetails as $key => $value) {
			if($value->col == "Task Priority" || $value->col == "Task Type" || $value->col == "Task Status"){
			$where["category_id"] =$value->old_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			$historyDetails[$key]->old_val = $catoldval[0]->categoryName;

			$where["category_id"] =  $value->new_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			$historyDetails[$key]->new_val = $catoldval[0]->categoryName;
			}
			if($value->col == "Assignee" ){
				$wherea["adminID"] =$value->old_val;
				$adminoldval = $this->CommonModel->GetMasterDetails('admin','name',$wherea);
				$historyDetails[$key]->old_val = $adminoldval[0]->name;

				$wherea["adminID"] =  $value->new_val;
				$adminoldval = $this->CommonModel->GetMasterDetails('admin','name',$wherea);
				$historyDetails[$key]->new_val = $adminoldval[0]->name;
			}
			if($value->col == "Customer"){
				$whereu["customer_id"] =$value->old_val;
				$custoldval = $this->CommonModel->GetMasterDetails('customer','first_name,last_name',$whereu);
				$historyDetails[$key]->old_val = $custoldval[0]->first_name . ' ' . $custoldval[0]->last_name;

				$whereu["customer_id"] =  $value->new_val;
				$custoldval = $this->CommonModel->GetMasterDetails('customer','first_name,last_name',$whereu);
				$historyDetails[$key]->new_val = $custoldval[0]->first_name . ' ' . $custoldval[0]->last_name;
			}
		}
		$status['data'] = $historyDetails;
		if ($historyDetails) {
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

	public function stateList()
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

		// echo $statuscode;exit();
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "stateID";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}

		$config["base_url"] = base_url() . "statemaster";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('stateID', "statemaster", $wherec);
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
			$stateDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'statemaster', $wherec, '', '', $join, $other);
		} else {

			$stateDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'statemaster', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $stateDetails;
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
		if ($stateDetails) {
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

	public function siteList()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$task_id = $this->input->post('task_id');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "task_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();

		if (isset($task_id) && !empty($task_id)) {
			$wherec["task_id"] = "='" . $task_id . "'";
		}

		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}
		//print_r($wherec);exit;
		$config["base_url"] = base_url() . "taskmaster";

		$config["total_rows"] = $this->CommonModel->getCountByParameter('siteID', "sitemaster", $wherec);
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
			$siteDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'sitemaster', $wherec, '', '', $join, $other);
		} else {

			$siteDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'sitemaster', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $siteDetails;
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
		if ($siteDetails) {
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

	public function siteMaster($siteID = "", $task_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$siteDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $siteDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$siteDetails['task_id'] = $this->validatedata->validate('task_id', 'task ID', false, '', array());

			$siteDetails['siteID'] = $this->validatedata->validate('siteID', 'site ID', false, '', array());

			$siteDetails['siteName'] = $this->validatedata->validate('siteName', 'site Name', true, '', array());
			$siteDetails['shipName'] = $this->validatedata->validate('shipName', 'ship Name', true, '', array());
			$siteDetails['sitesaddress'] = $this->validatedata->validate('sitesaddress', 'site address', true, '', array());

			$siteDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());

			// print_r($method);exit();
			if ($method == "POST") {
				$iticode = $siteDetails['siteID'];
				$siteDetails['status'] = "active";
				$siteDetails['created_by'] = $this->input->post('SadminID');
				$siteDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('sitemaster', $siteDetails);
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
			} elseif ($method == "PUT") {
				$where = array('siteID' => $siteID);
				if (!isset($siteID) || empty($siteID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$siteDetails['modified_by'] = $this->input->post('SadminID');
				$siteDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('sitemaster', $siteDetails, $where);
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
			} elseif ($method == "dele") {
				$siteDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('sitemaster', $where);
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

			$where = array("siteID" => $siteID);

			$siteDetails = $this->CommonModel->getMasterDetails('sitemaster', '', $where);
			if (isset($siteDetails) && !empty($siteDetails)) {

				$status['data'] = $siteDetails;
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

	public function SiteChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatusOnSingle") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('sitemaster', $statusCode, $ids, 'siteID');

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

	public function contacttaskList()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$task_id = $this->input->post('task_id');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');

		// echo $statuscode;exit();
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "contactID";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($task_id) && !empty($task_id)) {
			$wherec["task_id"] = "='" . $task_id . "'";
		}

		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}

		$config["base_url"] = base_url() . "contactmaster";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('contactID', "contactmaster", $wherec);
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
			$contactDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'contactmaster', $wherec, '', '', $join, $other);
		} else {

			$contactDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'contactmaster', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $contactDetails;
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
		if ($contactDetails) {
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

	public function contacttaskMaster($contactID = "", $task_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$contactDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $contactDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$contactDetails['task_id'] = $this->validatedata->validate('task_id', 'task ID', false, '', array());

			$contactDetails['contactID'] = $this->validatedata->validate('contactID', 'contact ID', false, '', array());

			$contactDetails['personName'] = $this->validatedata->validate('personName', 'person Name', true, '', array());

			$contactDetails['designation'] = $this->validatedata->validate('designation', 'designation', true, '', array());
			$contactDetails['offphone'] = $this->validatedata->validate('offphone', 'office phone', true, '', array());
			$contactDetails['mobile'] = $this->validatedata->validate('mobile', 'Mobile', true, '', array());
			$contactDetails['emailID'] = $this->validatedata->validate('emailID', 'email ID', true, '', array());

			$contactDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());

			// print_r($method);exit();
			if ($method == "POST") {
				$iticode = $contactDetails['contactID'];
				$contactDetails['status'] = "active";
				$contactDetails['created_by'] = $this->input->post('SadminID');
				$contactDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('contactmaster', $contactDetails);
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
			} elseif ($method == "PUT") {
				$where = array('contactID' => $contactID);
				if (!isset($contactID) || empty($contactID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$contactDetails['modified_by'] = $this->input->post('SadminID');
				$contactDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('contactmaster', $contactDetails, $where);
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
			} elseif ($method == "dele") {
				$contactDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('contactmaster', $where);
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

			$where = array("contactID" => $contactID);
			$contactDetails = $this->CommonModel->getMasterDetails('contactmaster', '', $where);
			if (isset($contactDetails) && !empty($contactDetails)) {

				$status['data'] = $contactDetails;
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

	public function getcontactDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('contactID');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "contactName";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		// if(isset($filterSName) && !empty($filterSName)){
		// 	$wherec["t.companyStateid"] = ' = "'.$filterSName.'"';
		// }

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		// echo  $adminID;exit();
		// $where = array("adminID ="=>"'".$adminID."'");
		// $iti_registration = $this->CommonModel->GetMasterListDetails('*','iti_registration',$where,'','',array(),array());
		// if(isset($iti_registration) && !empty($iti_registration)){
		// 		//$wherec["cm.ITIID IN "] = "(".$iti_registration[0]->companyList.")";
		// }else{
		// 	$status['msg'] = $this->systemmsg->getErrorCode(263);
		// 	$status['statusCode'] = 263;
		// 	$status['flag'] = 'F';
		// 	$this->response->output($status,200);
		// }

		// Check is data process already
		// $other['whereIn'] = "ITIID";

		// $other["whereData"]=$iti_registration[0]->companyList;

		$config["base_url"] = base_url() . "contactDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('contactID', 'contactmaster', $wherec, $other);
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
			$contactDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'contactmaster', $wherec, '', '', $join, $other);
		} else {



			$selectC = "*";
			$contactDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'contactmaster', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		$status['data'] = $contactDetails;
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
		if ($contactDetails) {
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
	public function ContactChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatusOnSingle") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('contactmaster', $statusCode, $ids, 'contactID');

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
}