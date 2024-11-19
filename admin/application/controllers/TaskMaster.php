<?php
defined('BASEPATH') or exit('No direct script access allowed');

class TaskMaster extends CI_Controller
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
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
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
		$project = $this->input->post('project_id');

		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();

		if($isAll !="Y"){	
			

			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			unset($postData['fromDate']);
			unset($postData['fromDate2']);
			unset($postData['toDate']);
			unset($postData['toDate2']);
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					// MANDATORY FOR ALL MODULES
					"company_id" => ["table" => "info_settings", "alias" => "dc", "column" => "companyName", "key2" => "infoID"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
					// CUSTOM FOR ALL MODULES
					"customer_id" => ["table" => "customer", "alias" => "cs", "column" => "name", "key2" => "customer_id"],
					"assignee" => ["table" => "admin", "alias" => "a", "column" => "name", "key2" => "adminID"],
					"project_id" => ["table" => "projects", "alias" => "p", "column" => "title", "key2" => "project_id"],
					"task_priority" => ["table" => "categories", "alias" => "cat", "column" => "categoryName", "key2" => "category_id"],
					"task_type" => ["table" => "categories", "alias" => "ct", "column" => "categoryName", "key2" => "category_id"],
					"task_status" => ["table" => "categories", "alias" => "ca", "column" => "categoryName", "key2" => "category_id"],
					// "task_progress" => ["table" => "categories", "alias" => "cp", "column" => "categoryName", "key2" => "category_id"],	
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					$jkey = count($join) + 1;
					$join[$jkey]['type'] = "LEFT JOIN";
					$join[$jkey]['table'] = $columnData["table"];
					$join[$jkey]['alias'] = $columnData["alias"];
					$join[$jkey]['key1'] = $columnName;
					$join[$jkey]['key2'] = $columnData["key2"];
					$join[$jkey]['column'] = $columnData["column"];
					if (in_array($columnName, $colData)) {
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
						if($columnName == 'task_status'){
							$selectC = "ca.cat_color as status_color,".$selectC;
						}
						if($columnName == 'task_progress'){
							$selectC = "cp.categoryName AS status_slug,".$selectC;
						}
					}
				}
				$selectC = ltrim($selectC, ',');
			}
		}
		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);

		$customOrder = "CASE
			WHEN DATE(t.due_date) = CURDATE() THEN 1
			WHEN DATE(t.due_date) = CURDATE() + INTERVAL 1 DAY THEN 2
			ELSE 3
		END";

		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = $customOrder . ", subject"; // You can add your default sorting field here
			$order = "ASC"; // Change this to "DESC" if you want descending order
		} else {
			$orderBy = $customOrder . ", " . $orderBy;
		}
		//$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		
		// if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'%" . $textval . "%'";
		// }

		if(isset($recordType) && !empty ($recordType)){
			$TypeStr = str_replace(",",'","',$recordType);
			$wherec["t.record_type"] = 'IN ("'.$TypeStr.'")';
		}

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["status"] = 'IN ("' . $statusStr . '")';
		// }
		
		// if (isset($assignee) && !empty($assignee)) {
		// 	$assigneeString = str_replace(",", '","', $assignee);
		// 	$wherec["assignee "] = 'IN ("' . $assigneeString . '")';
		// }

		// if (isset($task_priority) && !empty($task_priority)) {
		// 	$task_priorityString = str_replace(",", '","', $task_priority);
		// 	$wherec["task_priority"] = 'IN ("' . $task_priorityString . '")';
		// }

		if(isset($task_status) && !empty($task_status)){
			$task_statusString = str_replace(",", '","', $task_status);
			if($task_status=="otherStatus" || $task_status== 0){
				$wherec["task_status"] = "IS NULL";
			}else{
				//$wherec["task_status IN"] = "($task_statusString)";
				$wherec["task_status"] = 'IN ("' . $task_statusString . '")';
			}
			
		}
		//print_r($task_status);exit;

		// if(isset($customer) && !empty($customer)){
		// 	$customerString = str_replace(",", '","', $customer);
		// 	$wherec["customer_id"] = 'IN ("' . $customerString . '")';
		// }
		
		// if(isset($createdBy) && !empty($createdBy)){
		// 	$createdByString = str_replace(",", '","', $createdBy);
		// 	$wherec["created_by"] = 'IN ("' . $createdByString . '")';
		// }
		if(isset($this->company_id) && !empty($this->company_id)){
			$wherec["t.company_id = "] = "'".$this->company_id."'";
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
		// $whereOR = array();
		if(isset($due_date) && !empty($due_date)){
			$eDate = date("Y-m-d",strtotime($due_date));
			$wherec["due_date ="] = "'".$eDate."'";
		}
		
		if(isset($project) && !empty($project)){
			$wherec["t.project_id ="] = "'".$project."'";
		}
		
		
		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$adminID = $this->input->post('SadminID');
		$wherec1 = array("adminID"=>$adminID);
		$taskDetailsList = $this->CommonModel->getMasterDetails('admin','roleID',$wherec1);
		
		if(isset($taskDetailsList[0]->roleID) && !empty($taskDetailsList[0]->roleID)){

			$where = array("roleID" => $taskDetailsList[0]->roleID);

			$roleSlug = $this->CommonModel->getMasterDetails('user_role_master','slug',$where);
			
			if($roleSlug[0]->slug != 'admin' && $roleSlug[0]->slug != 'super_admin' && $roleSlug[0]->slug != 'supervisor'){

				$wherec["t.assignee = "] = "'".$this->input->post('SadminID')."'";

			}

		}

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.task_id', 'tasks', $wherec, $other,$join);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		$taskDetails = $this->CommonModel->GetMasterListDetails("t.*",'tasks',$wherec,'','','','');
		if ($isAll == "Y") {
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC="task_id,name",'tasks',$wherec,'','',$join,$other);	
		}else{
			$selectC = "a.photo AS assigneePhoto,a.adminID AS assigneeID, a.name AS assignee,t.start_date,t.due_date, cat.categoryName AS task_priority, ca.categoryName AS task_status,ca.category_id AS task_statusID, ct.categoryName AS task_type, cat.cat_color AS priorityColor,ct.cat_color AS typeColor,t.subject,cs.customer_image AS customer_image,".$selectC;
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC, 'tasks', $wherec, $config["per_page"], $page, $join, $other);
		}
		if(isset($taskDetails) && !empty($taskDetails)){
			foreach ($taskDetails as $key => $value) {
				$date1 = date("Y-m-d");
				$date2 = $value->due_date;
				if(isset($date1) && !empty($date1) && isset($date2) && !empty($date2)){
					if ($date1 > $date2) {
						$taskDetails[$key]->overDeu = "inactive";
					} elseif ($date1 < $date2) {
						$taskDetails[$key]->overDeu = "active";
					} else {
						$taskDetails[$key]->overDeu = "active";
					}
				}
			}
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
		
		if(empty($taskDetails)){
			if ($config["total_rows"] <= $status['paginginfo']["end"]) {
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$status['loadstate'] = false;
				$this->response->output($status, 200);
			}
		}else{
			if ($config["total_rows"] <= $status['paginginfo']["end"]) {
				$status['msg'] = $this->systemmsg->getErrorCode(232);
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$status['loadstate'] = false;
				$this->response->output($status, 200);
			}
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
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$this->menuID = $this->input->post('menuId');
		$watchers_name = $this->input->post("tasksWatchersArray");
		$watchers_ID = $this->input->post("tasks_watchersAdminID");

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
			$taskDetails['related_to'] = $this->validatedata->validate('related_to', 'Related to', false, '', array());
			
			$taskDetails['task_type'] = $this->validatedata->validate('task_type', 'Task_Type', false, '', array());
			$taskDetails['status'] = $this->validatedata->validate('status', 'Status', true, '', array());
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
			$taskDetails['project_id'] = $this->validatedata->validate('project_id', 'Product', false, '', array());
			$taskDetails['estimate_time'] = $this->validatedata->validate('estimate_time', 'Estimated Time', false, '', array());
			//print_r($taskDetails);exit;
			if (isset($taskDetails['start_date']) && !empty($taskDetails['start_date']) && $taskDetails['start_date'] != "0000-00-00") {
				$taskDetails['start_date'] = str_replace("/", "-", $taskDetails['start_date']);
				$taskDetails['start_date'] = date("Y-m-d", strtotime($taskDetails['start_date']));
			}else{
				$taskDetails['start_date'] = null;
			}

			if (isset($taskDetails['due_date']) && !empty($taskDetails['due_date']) && $taskDetails['due_date'] != "0000-00-00") {
				$taskDetails['due_date'] = str_replace("/", "-", $taskDetails['due_date']);
				$taskDetails['due_date'] = date("Y-m-d", strtotime($taskDetails['due_date']));
			}else{
				$taskDetails['due_date'] = null;
			}

			if (isset($taskDetails['end_on_date']) && !empty($taskDetails['end_on_date']) && $taskDetails['end_on_date'] != "0000-00-00") {
				$taskDetails['end_on_date'] = str_replace("/", "-", $taskDetails['end_on_date']);
				$taskDetails['end_on_date'] = date("Y-m-d", strtotime($taskDetails['end_on_date']));
			}else{
				$taskDetails['end_on_date'] = null;
			}

			$cat = $this->input->post("category_id");

			$fieldData = $this->datatables->mapDynamicFeilds("task",$this->input->post());
			$taskDetails = array_merge($fieldData, $taskDetails);
			if ($method == "PUT"){
				$taskDetails['company_id'] = $this->company_id;
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
						$this->notificationtrigger->prepareNotification('add','tasks','task_id',$taskID,array(),$this->menuID,$this->company_id);
					}

					$notification = array(
						'title' => "Task assigned to you",
						'body' => $taskDetails['subject'],
					);
					
					if(!$this->config->item('development')){
						
						// get user details to send email
						if(isset($taskDetails['assignee']) && !empty($taskDetails['assignee'])){
							$where = array("adminID" => $taskDetails['assignee']);
							$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
							$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array("adminID"=>$taskDetails['created_by']));
							$assignedBy ="";
							if(isset($assignByDetails)&& !empty($assignByDetails)){
								$assignedBy = $assignByDetails[0]->name;
							}
							$profie_pic = "";
							if(isset($assignByDetails[0]->photo) && !empty($assignByDetails[0]->photo)){
								$profie_pic = "<div style=width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><img src='".$this->config->item('media_url')."profilephoto/1/profilePic/".$assignByDetails[0]->photo."'alt='".getFirstAndLastWordInitials($assignByDetails[0]->name)."'>";
							}else{
								$profie_pic = "<div style='width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><span>".getFirstAndLastWordInitials($assignByDetails[0]->name)."</span></div>";
							}
							$messageDetails="";
							$messageDetails.= "<div><p style='border-bottom: 1px solid #dee2e6;margin: 8px 0px;padding-bottom: 6px;'>".$assignedBy."&nbsp;<b style='display:inline-block;color:#172b4d'>assigned this task to you</b></p>";
							$messageDetails.= "<p style='margin-bottom: 10px;'>Task/".$taskID."</p>";
							$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#task/".$taskID."'>".$taskDetails['subject']."</a></p>";
							$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
							<div style='flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>&nbsp;".$assignedBy."&nbsp; Created Task at&nbsp;".$updateDate." <br> "."</div></div>";
							$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$taskID.'">View Task</a></div><br/><br/></div>';
							$this->emails->sendMailDetails("","",$tDetails[0]->email,'','','Task Assigned to you - '.$taskID,$messageDetails);
							$this->notifications->sendmessage($notification,$taskDetails['assignee']);
						}
						
					}
					$this->addTaskHistory($taskID, 'Task Created', 'Created', $taskDetails['created_by'],$taskDetails['customer_id']);
					if (isset($watchers_name) && !empty($watchers_name)) {
						$saveFlag = $this->saveWatchersDetails($watchers_name, $taskID, $taskDetails);
						// send notification to user
						
						if ($saveFlag == true) {
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$status['msg'] = $this->systemmsg->getErrorCode(289);
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
							$status['msg'] = $this->systemmsg->getErrorCode(289);
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
					$created['id'] = $this->input->post("created_by");
					if(!$this->config->item('development'))
					{
						// this will only call for customize updates
						$this->notificationtrigger->prepareNotification('update','tasks','task_id',$task_id,$oldData,$this->menuID,$this->company_id);
						// below code is used to send standard notification from system
						if(isset($taskDetails['assignee']) && !empty($taskDetails['assignee'])){
							// check if the assignee and task owner is same then no need to send the updates
							if($taskDetails['assignee'] != $created['id']){
								$this->sendTaskUpdateEmail($task_id,$taskDetails,$taskDetails['assignee'],$taskDetails['modified_by']);
							}
						}
					}
					
					if(isset($watchers_name) && !empty($watchers_name)){
						$clientWatchers = array_column($watchers_name, "id");
						
						foreach ($clientWatchers as $key => $value) {
							$messageDetails = '' ;
							$notification = array();
							if (!$this->config->item('development')) {
								$this->sendTaskUpdateEmail($task_id,$taskDetails,$value,$taskDetails['modified_by']);
							}
						}
						$taskHistoryUpdate['is_notify'] = 'yes';
						$whereH = array('record_id'=>$task_id);
						$history = $this->CommonModel->updateMasterDetails('history',$taskHistoryUpdate,$whereH);
					}
					/*
					* no need send update as it done from ajax front end
					*/
					// if(isset($watchers_name) && !empty($watchers_name)){
					// 	$saveFlag = $this->saveWatchersDetails($watchers_name,$task_id,$taskDetails);
					// }
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
							$status['msg'] = $this->systemmsg->getErrorCode(289);
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
							$status['msg'] = $this->systemmsg->getErrorCode(289);
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

				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="admin";
				$join[0]['alias'] ="aa";
				$join[0]['key1'] ="created_by";
				$join[0]['key2'] ="adminID";

				$selectC = "t.*,aa.name AS adminName";
				$taskDetails = $this->CommonModel->GetMasterListDetails($selectC, 'tasks', $wherec, '', '', $join, $other);

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
	
		}else{ 

			if($task_id ==""){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] =array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
			
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			$newKe = count($join)+1;
			$join[$newKe]['type'] ="LEFT JOIN";
			$join[$newKe]['table']="projects";
			$join[$newKe]['alias'] ="p";
			$join[$newKe]['key1'] ="project_id";
			$join[$newKe]['key2'] ="project_id";
			//print_r($join);exit;	
			$other = array();
			$wherec["t.task_id"] = "=".$task_id;
			if($selectC != ""){
				$selectC="t.*,p.title,".$selectC;
			}
			if(isset($this->menuDetails->metadata) && !empty($this->menuDetails->metadata)){
				$cData = json_decode($this->menuDetails->metadata);
				// print_r($cData);exit;
				$attachmentArray = array();
				foreach ($cData as $key => $value) {
					foreach ($value as $keycol => $valuecol) {
						if(isset($valuecol->column_name) && isset($valuecol->fieldID)){
							
							$ccData[] = "t.".$valuecol->column_name;
							$fieldIdDetails[] = $valuecol->fieldID;
							
							if ($valuecol->fieldType == 'File') {
								$whereAttachment1 = array(
									"record_id" => $task_id,
									"menu_id" => $this->menuID,
									"field_id" => $valuecol->fieldID,
								);
								
								$attachments = $this->CommonModel->getMasterDetails('custom_attachment','',$whereAttachment1);
								// print"<pre>";
								// print_r($attachments);exit;
								$attachmentArray[] = $attachments;
							}
							
						}
					}
				}
			}
			//print_r($join);exit;	
			$taskDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
			if(isset($taskDetails) && !empty($taskDetails)){
				$whereGuest = array(
					"task_id" => $task_id,
					"status" => "active" // Add the additional WHERE condition for status
				);
				$whereAttachment = array(
					"task_id" => $task_id
				);
				$wherec["task_id ="] = "'".$task_id."'";
				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="admin";
				$join[0]['alias'] ="aa";
				$join[0]['key1'] ="created_by";
				$join[0]['key2'] ="adminID";

				$join[1]['type'] ="LEFT JOIN";
				$join[1]['table']="customer";
				$join[1]['alias'] ="c";
				$join[1]['key1'] ="customer_id";
				$join[1]['key2'] ="customer_id";

				$join[2]['type'] ="LEFT JOIN";
				$join[2]['table']="admin";
				$join[2]['alias'] ="ad";
				$join[2]['key1'] ="assignee";
				$join[2]['key2'] ="adminID";
				$newKe = count($join)+1;
				$join[$newKe]['type'] ="LEFT JOIN";
				$join[$newKe]['table']="projects";
				$join[$newKe]['alias'] ="p";
				$join[$newKe]['key1'] ="project_id";
				$join[$newKe]['key2'] ="project_id";
				
				$selectC = "aa.name AS adminName, c.name AS customerName, ad.name,p.title";
				$createdBy = $this->CommonModel->GetMasterListDetails($selectC, 'tasks', $wherec, '', '', $join, '');
				// print_r($createdBy);exit;
				if(!empty($createdBy)){
					$created = array_column($createdBy,'adminName');
					$customerName = array_column($createdBy,'customerName');
					$assigneeName = array_column($createdBy,'name');
					$taskDetails[0]->createdByname = $created;
					$taskDetails[0]->customerName = $customerName;
					$taskDetails[0]->assigneeName = $assigneeName;
				}

				$watchersDetailsName = $this->CommonModel->getMasterDetails('tasks_watchers', '', $whereGuest);
				if (!empty($watchersDetailsName)) {
					$watchers_name = array_column($watchersDetailsName,'watchers_name');
					$watchersAdminID  = array_column($watchersDetailsName,'admin_id');
					$taskDetails[0]->tasksWatchers = $watchers_name;
					$taskDetails[0]->tasks_watchersAdminID = $watchersAdminID;
				}
				$taskAttachments = $this->CommonModel->getMasterDetails('tasks_attachment','',$whereAttachment);
				if(!empty($taskAttachments)){
					$attachment = array_column($taskAttachments,'attachment_file');
					$attachmentID = array_column($taskAttachments,'attachment_id');
					$taskDetails[0]->attachment_file = $attachment;
					$taskDetails[0]->attachment_id = $attachmentID;
				}

				$attachmentTosave = array();
					
				if (!empty($attachmentArray)) {
					$attachmentTosave = array(); // Initialize the variable outside the loop
					foreach ($attachmentArray as $key => $attachments) {
						// Extract attachment details for the current iteration
						$attachmentFiles = array_column($attachments, 'attachment_file');
						$attachmentIDs = array_column($attachments, 'attachment_id');
						$attachmentFieldIDs = array_column($attachments, 'field_id');
				
						// Merge attachment data into $taskDetails for the current iteration
						$attachmentTosavetemp = array();
						$attachmentTosavetemp['attachFile'] = $attachmentFiles;
						$attachmentTosavetemp['attachment_id'] = $attachmentIDs;
						$attachmentTosavetemp['attachment_fieldID'] = $attachmentFieldIDs;
						$attachmentTosave[] = $attachmentTosavetemp;
					}
					// Assign the merged attachment data to $taskDetails
					$taskDetails[0]->uploadedMedia = $attachmentTosave;
					// print_r($taskDetails[0]->uploadedMedia);exit;
				}
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
		$listOfIds = $this->input->post("list");
		$fullName = explode(',', $listOfIds);
		$this->db->trans_start();
		if (trim($action) == "changeStatus") {
			foreach ($fullName as $key => $value) {
				if(isset($value) && !empty($value)){
					$where = array('task_id' => $value);
					$changestatus = $this->CommonModel->deleteMasterDetails('tasks', $where);
					if (!$changestatus) {
						$this->db->trans_rollback();
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
				}
			}
			$this->db->trans_commit();
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
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
	public function saveWatchersDetails($watchers_name = array(), $task_id = '', $taskDetails = array(), $isRepeat = ''){
		$res = true;
		
		if(!empty($watchers_name)){
		foreach($watchers_name as $key => $value){
			if (isset($value->id)) {
				$res1 = $this->addWatchersAndNotify($task_id,$value->id);
				if(!$res1){
					$res = false;
				}
			}
		}
		return $res;
		}else{
			return true;
		}
		
	}
	// public function saveWatchersDetails($watchers_name = '', $task_id = '', $taskDetails = array(), $isRepeat = '')
	// {
	// 	if(isset($taskDetails['created_by']) && !empty(isset($taskDetails['created_by']))){
	// 		$adminId = $taskDetails['created_by'];
	// 	}else{
	// 		$adminId = $taskDetails;
	// 	}
	// 	$this->access->checkTokenKey();
	// 	$this->response->decodeRequest();
	// 	$method = $this->input->method(TRUE);
	// 	$notification = array(
	// 		'title' => "You have been Added as a watcher in a Task",
	// 		'body' => "Task ID = " . $task_id,
	// 	);
	// 	$tasks_watchers = array();
	// 	if ($method == "PUT" || $method == "POST") {
	// 		$where = array('task_id' => $task_id);
	// 		$tasks_watchers['task_id'] = $task_id;
	// 		$tasks_watchers['created_by'] = $adminId;

	// 		if ($method == "PUT" || $method == "POST") {

	// 			if(isset($isRepeat) && !empty($isRepeat) && $isRepeat == "yes"){
	// 				foreach($watchers_name as $key => $value){
	// 					if (is_array($value) && isset($value['id']) && isset($value['name'])) {
	// 						$add_watchers = array(
	// 							'admin_id' => $value['id'],
	// 							'watchers_name' => $value['name'],
	// 							'task_id' => $task_id
	// 						);
	// 						return $iscreated = $this->CommonModel->saveMasterDetails('tasks_watchers', $add_watchers);
	// 					}
	// 				}
	// 			}

	// 			if (empty($watchers_name)) {
	// 				return false;
	// 			} else {
	// 				$clientWatchers = array_column($watchers_name, "id");
	// 				$serverWatchers = $this->CommonModel->getMasterDetails('tasks_watchers','watchers_name,admin_id',$where);
	// 				$serverWatchersGet = array_column($serverWatchers, "admin_id");
	// 				foreach ($clientWatchers as $key => $value) {
	// 					if (!in_array($value, $serverWatchersGet)) {
	// 						$getWatcher = array_filter($watchers_name, function ($watcher) use ($value) {
	// 							return $watcher->id == $value;
	// 						});
	// 						if (!empty($getWatcher)) {

	// 							$getWatcher = reset($getWatcher); // Get the first element

	// 							$add_watchers = array(
	// 								'admin_id' => $getWatcher->id,  // Save 'id' property as 'admin_id'
	// 								'watchers_name' => $getWatcher->name,
	// 								'task_id' => $task_id  // Save 'name' property as 'watchers_name'
	// 							);

	// 							if (!$this->config->item('development')) {
	// 								$loggedInID = $this->input->post('SadminID');
	// 								if ($loggedInID != $getWatcher->id ){
	// 									$this->notifications->sendmessage($notification,$getWatcher->id);
	// 									$where = array("adminID" =>$getWatcher->id);
	// 									$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
	// 									$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array("adminID"=> $adminId));
	// 									$assignedBy ="";
	// 									if(isset($assignByDetails)&& !empty($assignByDetails)){
	// 										$assignedBy = $assignByDetails[0]->name;
	// 									}
	// 									if(isset($tDetails)&& !empty($tDetails)){
	// 										$messageDetails = $taskDetails['subject']."<br>";
	// 										$this->emails->sendMailDetails("","",$tDetails[0]->email,'','',"You have added as watcher to task:-".$task_id, "Subject :-".$messageDetails);
	// 									}
	// 								}
	// 							}				
	// 							$iscreated = $this->CommonModel->saveMasterDetails('tasks_watchers', $add_watchers);
	// 							if(!$iscreated){
	// 								//return false;
	// 							}
	// 						}
	// 					}
	// 				}
					

	// 				foreach ($serverWatchersGet as $key => $value) {
	// 					if (!in_array($value, $clientWatchers)) {
	// 						$where = array(
	// 							'task_id' => $task_id,
	// 						 	'admin_id' => $value
	// 						);
	// 						// $deleteWacther = $this->CommonModel->deleteMasterDetails('tasks_watchers', $where);
	// 					}
	// 				}
	// 			}
				
	// 		}
	// 	}
	// 	return true;
	// }
	public function addWatchers(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$task_id = $this->input->post("taskID");
		$watcher_id = $this->input->post("watcher_id");
		$iscreated = $this->addWatchersAndNotify($task_id,$watcher_id);
		if(!$iscreated){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function addWatchersAndNotify($task_id,$watcher_id){
		$where = array("adminID" =>$watcher_id);
		$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);

		$taskDetails = $this->CommonModel->getMasterDetails('tasks', 'subject', array("task_id" =>$task_id));

		$add_watchers = array(
			'admin_id' => $watcher_id,
			'watchers_name' => $tDetails[0]->name,
			'task_id' => $task_id
		);
		//print_r($add_watchers);
		$notification = array(
			'title' => "You have been Added as a watcher in a Task",
			'body' => "Task ID = " . $task_id,
		);
		$added = $this->CommonModel->saveMasterDetails('tasks_watchers', $add_watchers);
		if($added){
			$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
			$adminID = $this->input->post('SadminID');
			$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,photo,email', array("adminID"=>$adminID));
			$assignedBy ="";
			if(isset($assignByDetails)&& !empty($assignByDetails)){
				$assignedBy = $assignByDetails[0]->name;
			}
			$profie_pic = "";
			if(isset($assignByDetails[0]->photo) && !empty($assignByDetails[0]->photo)){
				$profie_pic = "<div style=width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><img src='".$this->config->item('media_url')."profilephoto/1/profilePic/".$assignByDetails[0]->photo."'alt='".getFirstAndLastWordInitials($assignByDetails[0]->name)."'>";
			}else{
				$profie_pic = "<div style='width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><span>".getFirstAndLastWordInitials($assignByDetails[0]->name)."</span></div>";
			}
			$messageDetails="";
			$messageDetails.= "<div><p style='border-bottom: 1px solid #dee2e6;margin: 8px 0px;padding-bottom: 6px;'>".$assignedBy."&nbsp;<b style='display:inline-block;color:#172b4d'>added you in wachters list</b></p>";
			$messageDetails.= "<p style='margin-bottom: 10px;'>Task/".$task_id."</p>";
			$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#task/".$task_id."'>".$taskDetails[0]->subject."</a></p>";
			$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$task_id.'">View Task</a></div><br/><br/></div>';
		}
		if(!$this->config->item('development')){
			$this->notifications->sendmessage($notification,$watcher_id);
			return $this->emails->sendMailDetails("","",$tDetails[0]->email,'','','You have added to the watchers list.',$messageDetails);
		}else{
			return $added;
		}
	}
	public function removeWatchers()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$task_id = $this->input->post("taskID");
		
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$wherec["admin_id ="] = $ids;
				$wherec["task_id ="] = $task_id;
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
	
		$taskDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'task_comments', $wherec, $config["per_page"], $page, $join, $other);


			foreach ($taskDetails as $taskDetail) {
				if (is_object($taskDetail)) {
					$fullName = $taskDetail->name;
					if(isset($fullName) && !empty($fullName)){
						$nameParts = explode(' ', $fullName);
						$firstLetterName = substr($nameParts[0], 0, 1);
						$firstLetterLastName = substr($nameParts[count($nameParts) - 1], 0, 1);
						$initials = $firstLetterName . $firstLetterLastName;
						$taskDetail->initial = $initials;
					}
				}
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

	public function deleteComment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$commentID= $this->input->post("list");
		$wherec["comment_id ="] = $commentID;
		$changestatus = $this->CommonModel->deleteMasterDetails('task_comments',$wherec);
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

	public function addTaskHistory($task_id, $action_type, $description, $user_id, $parentRecordID)
	{
		
		$taskDetails = array(
			'record_id' => $task_id,
			'action_type' => $action_type,
			'description' => $description,
			'user_id' => $user_id,
			'parent_record_id' => $parentRecordID,
			'record_type' => 'task',
			'col'=> 'Task',
			'old_date'=>null,
			'new_date'=>null,
			'activity_date' => date('Y-m-d H:i:s')
		);
		return $this->CommonModel->saveMasterDetails('history', $taskDetails);
		
	}

	public function getTaskHistory()
	{
		$curPage = $this->input->post('curpage');
		$task_id = $this->input->post('task_id');
		$project_id = $this->input->post('project_id');
		$record_type = $this->input->post('record_type');
		$wherec = $join = array();
		if (isset($task_id) && !empty($task_id)) {
			$wherec["record_id"] = '= (' . $task_id . ')';
		}

		if (isset($project_id) && !empty($project_id)) {
			$wherec["record_id"] = '= (' . $project_id . ')';
		}

		if (isset($record_type) && !empty($record_type)) {
			$wherec["record_type"] = '= "' . $record_type . '"';
		}
		
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "history_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('history_id', 'history', $wherec, $other);
		$config["uri_segment"] = 2;
		// print_r($config);exit;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}

		$historyDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'history', $wherec, $config["per_page"], $page, $join, $other);

		
		foreach ($historyDetails as $key => $value) {
			if($value->col == "Task Priority" || $value->col == "Task Type" || $value->col == "Task Status"){
			$where["category_id"] =$value->old_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			$historyDetails[$key]->old_val = !empty($catoldval) ? $catoldval[0]->categoryName : null;

			$where["category_id"] =  $value->new_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			if($value->new_val != 0){
				if( isset($catoldval) && !empty($catoldval)){
					$historyDetails[$key]->new_val = $catoldval[0]->categoryName;
				}
			}
			}
			if ($value->col == "Assignee") {
				$wherea["adminID"] = $value->old_val;
				$adminoldval = $this->CommonModel->GetMasterDetails('admin', 'name', $wherea);
				$historyDetails[$key]->old_val = !empty($adminoldval) ? $adminoldval[0]->name : null;
		
				$wherea["adminID"] = $value->new_val;
				$adminnewval = $this->CommonModel->GetMasterDetails('admin', 'name', $wherea);
				$historyDetails[$key]->new_val = !empty($adminnewval) ? $adminnewval[0]->name : null;
			}
		
			if ($value->col == "Customer") {
				$whereu["customer_id"] = $value->old_val;
				$custoldval = $this->CommonModel->GetMasterDetails('customer', 'name', $whereu);
				$historyDetails[$key]->old_val = !empty($custoldval) ? $custoldval[0]->name : null;
		
				$whereu["customer_id"] = $value->new_val;
				$custnewval = $this->CommonModel->GetMasterDetails('customer', 'name', $whereu);
				$historyDetails[$key]->new_val = !empty($custnewval) ? $custnewval[0]->name : null;
			}
		}
		$status['data'] = $historyDetails;
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
		// print_r($historyDetails);exit;
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

	public function dashboardStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$updateDate = date("Y/m/d H:i:s");
		$where=array('task_id'=>$ids);
		
		if(!isset($ids) || empty($ids)){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$whereCategory = array(
			"slug" => 'task_complete'
		);
		
		$completeCat = $this->CommonModel->getMasterDetails('categories','',$whereCategory);
		if(!empty($completeCat)){
			$categoryID = array_column($completeCat,'category_id');
		}
		$taskDetails['task_status'] = $categoryID[0];
		$taskDetails['modified_by'] = $this->input->post('SadminID');
		$taskDetails['modified_date'] = $updateDate;
		$iscreated = $this->CommonModel->updateMasterDetails('tasks',$taskDetails,$where);
		if ($iscreated) {
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

	public function taskUpload($task_id = '', $custID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($task_id) && !empty($task_id)){
			$mediapatharr = $this->config->item("mediaPATH") ."task/".$task_id ;
			// print_r($mediapatharr);exit; 
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($task_id) || $task_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."task/temp-";
			if (!is_dir($mediapatharr)) {
				if (mkdir($mediapatharr, 0777, true)) {
				} else {
					$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
		
		
		$extraData["task_id"] = $task_id;
		$extraData["customer_id"] = $custID;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'tasks_attachment',
			'fileTypeColumn' => 'attachment_file',
			'fileColumn' => 'attachment_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}

	public function renameFolder($task_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$oldName = $this->config->item("mediaPATH") ."task/temp-";
		$newName = $this->config->item("mediaPATH") ."task/".$task_id;
		if (is_dir($oldName)) 
		{
			$is_renamed = rename($oldName,$newName);
		}
	}

	public function updatePositions(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$menuIDs = $this->input->post("menuIDs");
			foreach ($menuIDs as $key => $value) {
				$where = array('category_id' => $value);
				$categoryIndex['categories_index'] = $key;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
			}

		}
	}

	public function taskStatusUpdate()
	{
		$taskStatus = $this->input->post('taskStatus');
		$taskID = $this->input->post('taskID');
		$where = array('task_id' => $taskID);
		$taskDetails['task_status'] = $taskStatus;
		$iscreated = $this->CommonModel->updateMasterDetails('tasks', $taskDetails, $where);
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

	public function getCustomerEmail($custID)
	{
		
		if(isset($custID) && !empty($custID))
		{
			$where = array(
				"customer_id" => $custID,
				"status" => "active" 
			);
			return $customerEmail = $this->CommonModel->getMasterDetails('customer', 'email', $where);
			
		}
	}

	public function taskRepeat()
	{
		# REPEAT DAILY 
		$wherec["repeated ="] = '"no"';
		$wherec["does_repeat ="] = '"daily"';
		$wherec["status ="] = '"active"';
		$taskDetails = $this->CommonModel->GetMasterListDetails('t.*', 'tasks', $wherec, '', '', array(), '');
		if(isset($taskDetails) && !empty($taskDetails)){
			foreach ($taskDetails as $key1 => $value1) {
				if ($value1->due_date != '0000-00-00') {
					$nextDate = date('Y-m-d', strtotime($value1->due_date .'+1 day'));
					$value1->due_date = $nextDate;
					$value1->start_date = $nextDate;
					$task_ID = $value1->task_id;
					$this->createTaskForRepeat($value1,$nextDate,$task_ID);
				}
			}
		}
		# REPEAT MON-TO-FRI
		$wherec["repeated ="] = '"no"';
		$wherec["does_repeat ="] = '"mon_to_fir"';
		$wherec["status ="] = '"active"';
		$taskDetailsMonToFri = $this->CommonModel->GetMasterListDetails('t.*', 'tasks', $wherec, '', '', array(), '');
		if(isset($taskDetailsMonToFri) && !empty($taskDetailsMonToFri)){
			foreach ($taskDetailsMonToFri as $key => $value) {
				if ($value->due_date != '0000-00-00') {
					$dueDayOfWeek = date('N', strtotime($value->due_date));
					if ($dueDayOfWeek >= 1 && $dueDayOfWeek < 5) {
						$nextDate = date('Y-m-d', strtotime($value->due_date . ' +1 day'));
						$value->due_date = $nextDate;
						$value->start_date = $nextDate;
					} elseif ($dueDayOfWeek == 5) { 
						$nextMonday = date('Y-m-d', strtotime('next Monday', strtotime($value->due_date)));
						$value->due_date = $nextMonday;
						$value->start_date = $nextMonday;
					}
					$task_ID = $value->task_id;
					$this->createTaskForRepeat($value,$nextDate,$task_ID);
					$ct++;
				}
			}
		}
		
		# REPEAT WEEKEND
		$wherec["repeated ="] = '"no"';
		$wherec["does_repeat ="] = '"weekend"'; 
		$wherec["status ="] = '"active"';
		$taskDetailsWeekend = $this->CommonModel->GetMasterListDetails('t.*', 'tasks', $wherec, '', '', array(), '');
		$currentDay = date('N'); // N returns the ISO-8601 numeric representation of the day of the week (1 for Monday, 2 for Tuesday, etc.)
		if(isset($taskDetailsWeekend) && !empty($taskDetailsWeekend)){
			if ($currentDay >= 6 && $currentDay <= 7) {
				foreach ($taskDetailsWeekend as $key => $value) {
					if ($value->due_date != '0000-00-00') {
						if ($currentDay == 7) {
							$nextSaturday = date('Y-m-d', strtotime('next Saturday'));
							$value->due_date = $nextSaturday;
							$value->start_date = $nextSaturday;
						} else {
							$nextDate = date('Y-m-d', strtotime('+1 day'));
							$value->due_date = $nextDate;
							$value->start_date = $nextDate;
						}
						$task_ID = $value->task_id;
						$this->createTaskForRepeat($value,$nextDate,$task_ID);
						$ct++;
					}
				}
			}
		}
		# REPEAT CUSTOM
		$wherec["repeated ="] = '"no"';
		$wherec["does_repeat ="] = '"custom"';
		$wherec["status ="] = '"active"';
		$taskDetailsCustom = $this->CommonModel->GetMasterListDetails('t.*', 'tasks', $wherec, '', '', array(), '');
		if (isset($taskDetailsCustom) && !empty($taskDetailsCustom)) {
			foreach ($taskDetailsCustom as $task) {
				if (isset($task->due_date) && $task->due_date != '0000-00-00') {
					$nextDate = null;
					$interval = isset($task->week_numb) ? $task->week_numb : 1;
					# STOP REPEATING
					$stopRepeating = false;
					if (isset($task->ends) && $task->ends == 'on' && strtotime($task->end_on_date) <= strtotime($task->due_date)) {
						$stopRepeating = true;
					}elseif (isset($task->ends) && $task->ends  == 'after' && isset($task->end_after_date) && $task->occurrence_count >= ($task->end_after_date-1)) { // here we have to add occurence count
						$stopRepeating = true;
					}
					if (isset($task->ends) && $task->ends == 'after') {
						$task->occurrence_count = $task->occurrence_count+1;
					}
					switch ($task->repeat_on) {
						case 'daily':
							$nextDate = date('Y-m-d', strtotime($task->due_date . " +$interval day"));
							break;
						case 'weekly':
							$repeatDays = explode(',',$task->days);
							$currentDayOfWeek = date('D', strtotime($task->due_date)); // Day of the week for the due date
							$currentIndex = array_search(strtolower($currentDayOfWeek), $repeatDays);
							if ($currentIndex !== false) {
								$nextIndex = ($currentIndex) % count($repeatDays);
								$nextDay = $repeatDays[$nextIndex];
								$nextDate = date('Y-m-d', strtotime("next $nextDay", strtotime($task->due_date)));
							}
							break;
						case 'monthly':
							$currentDay = (int) date('j', strtotime($task->due_date)); // Day of the month for the due date
							$currentMonth = (int) date('n', strtotime($task->due_date)); // Month of the due date
							$currentYear = (int) date('Y', strtotime($task->due_date)); // Year of the due date
							$nextDay = $task->monthly ;
							if (!$nextDay) {
								$nextDay = $repeatDays[0];
								$nextMonth = $currentMonth + $interval;
								$nextDate = date('Y-m-d', strtotime("$currentYear-$nextMonth-$nextDay"));
							} else {
								$nextDate = date('Y-m-d', strtotime("$currentYear-$currentMonth-$nextDay"));
							}
							break;
						case 'yearly':
							$currentMonthDay = date('m-d', strtotime($task->due_date)); // Month and day of the due date
							$currentYear = (int) date('Y', strtotime($task->due_date));
							$nextYear = $currentYear + $interval;
							$nextDate = date('Y-m-d', strtotime("$nextYear-$currentMonthDay"));
							$nextDate = date('Y-m-d', strtotime($task->due_date . " +$interval year"));
							break;
						default:
							// Handle unsupported types
							break;
					}
					if ($nextDate) {
						$task->due_date = $nextDate;
						$task->start_date = $nextDate;
						$taskID = $task->task_id;
						unset($task->task_id, $task->task_status);
						if ($stopRepeating) {
							$task->repeated = 'yes';
							$task->due_date = $nextDate;
							$this->CommonModel->updateMasterDetails('tasks', $task, ['task_id' => $taskID]);
							// continue;	
						}else{
							$this->createTaskForRepeat($task,$nextDate,$taskID);
						}
					}
				}
			}
		}
	}
	public function createTaskForRepeat($value,$nextDate,$task_ID){
		unset($value->task_id);
		unset($value->task_status);
		$updateDate = date("Y/m/d H:i:s");
		$value->created_date = $updateDate;
		$task_status = $this->CommonModel->getMasterDetails('categories', 'category_id', array("categoryName"=> 'To Do'));
		(isset($task_status) && !empty($task_status)) ? ($value->task_status = $task_status[0]->category_id) : ($value->task_status = '');
		$iscreated = $this->CommonModel->saveMasterDetails('tasks', $value);
		if (!$iscreated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$LastTaskID = $this->db->insert_id();
			// 	# MARK REPEATED TASK AS REPEATED AND UPDATE IT
			$upTask['repeated'] = 'yes';
			$updateRepeatedTask = $this->CommonModel->updateMasterDetails('tasks',$upTask, array('task_id'=>$task_ID));
			$notification = array(
				'title' => "Task assigned to you",
				'body' => $value->subject,
			);
			if(!$this->config->item('development')){
				$this->notifications->sendmessage($notification,$value->assignee);
				// get user details to send email
				$where = array("adminID" => $value->assignee);
				$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
				$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array("adminID"=> $value->created_by));
				$assignedBy ="";
				if(isset($assignByDetails)&& !empty($assignByDetails)){
					$assignedBy = $assignByDetails[0]->name;
				}
				if(isset($tDetails)&& !empty($tDetails)){
					$messageDetails = $value->subject."<br>";
					$this->emails->sendMailDetails("","",$tDetails[0]->email,'','',$assignedBy." assigned task-".$LastTaskID." to you",);
				}
			}
			$this->addTaskHistory($LastTaskID, 'Task Created', 'Created', $value->created_by,$value->customer_id);
			$whereGuest = array(
				"task_id" => $task_ID,
				"status" => "active" // Add the additional WHERE condition for status
			);
			$watchersDetailsName = $this->CommonModel->getMasterDetails('tasks_watchers', '', $whereGuest);
			if (!empty($watchersDetailsName)) {
				$watchers_name = array();
				foreach ($watchersDetailsName as $watcher) {
					$watchers_name[] = array('name' => $watcher->watchers_name, 'id' => $watcher->admin_id);
				}
			}
			$watcherSaveDetails = array(
				"created_by" => $value->created_by,
				"subject" => $value->subject,
			);
			// if (isset($watchers_name) && !empty($watchers_name)) {
			// 	$saveFlag = $this->saveWatchersDetails($watchers_name, $task_ID, $watcherSaveDetails, $isRepeat = "yes");
			// }
			
			$whereAttachment = array(
				"task_id" => $task_ID
			);
			$taskAttachments = $this->CommonModel->getMasterDetails('tasks_attachment','',$whereAttachment);
			if(!empty($taskAttachments)){
				$attachment = array_column($taskAttachments,'attachment_file');
				$attachmentID = array_column($taskAttachments,'attachment_id');
				$taskDetails[0]->attachment_file = $attachment;
				$taskDetails[0]->attachment_id = $attachmentID;
			}
			// if (isset($attachment) && !empty($attachment)) {
			// 	$saveFlag = $this->saveAttachments($attachment, $task_ID,  $value->created_by);
			// }

			// print_r($this->systemmsg->getSucessCode(400));exit;
			// $status['msg'] = $this->systemmsg->getSucessCode(400);
			// $status['statusCode'] = 400;
			// $status['data'] = array();
			// $status['lastID'] = $LastTaskID;
			// $status['flag'] = 'S';
			// $this->response->output($status, 200);
		}
	}


	// Static access data code for mobile
	public function gettaskDetailsStatic()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
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
			if($task_status=="other" || $task_status== 0){
				$wherec["task_status"] = "IS NULL";
			}else{
				$wherec["task_status IN"] = "($task_statusString)";
			}
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
		if(isset($recordType) && !empty ($recordType)){
			$TypeStr = str_replace(",",'","',$recordType);
			$wherec["t.record_type"] = 'IN ("'.$TypeStr.'")';
		}
		$wherec["t.company_id"] = "= '".$this->company_id."'";
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

	public function taskMasterStatic($task_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$watchers_name = $this->input->post("tasksWatchers");
		$task_attachments = $this->input->post("attachment_file");
		$this->menuID = $this->input->post('menuId');
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
			$taskDetails['company_id'] = $this->company_id;
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
                //$taskDetails['company_id'] = $this->validatedata->validate('company_id', 'company Id', true, '', array());
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
						$this->notificationtrigger->prepareNotification('add','tasks','task_id',$taskID,array(),$this->menuID,$this->company_id);
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
					$this->addTaskHistory($taskID, 'Task Created', 'Created', $taskDetails['created_by'],$taskDetails['customer_id']);
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
						$this->notificationtrigger->prepareNotification('update','tasks','task_id',$task_id,$oldData,$this->menuID,$this->company_id);
					}
					$created['id'] = $this->input->post("created_by");
					/****
					 *   no need to add watcher from here. will auto save after add from frontend
					**/

					// if(isset($watchers_name) && !empty($watchers_name)){
					// 	$clientWatchers = array_column($watchers_name, "id");
						
					// 	foreach ($clientWatchers as $key => $value) {
					// 		$messageDetails = '' ;
					// 		$notification = array();
					// 		if (!$this->config->item('development')) {
								
					// 		}
					// 	}
					// 	$taskHistoryUpdate['is_notify'] = 'yes';
					// 	$whereH = array('record_id'=>$task_id);
					// 	$history = $this->CommonModel->updateMasterDetails('history',$taskHistoryUpdate,$whereH);
					// }
					// if(isset($watchers_name) && !empty($watchers_name)){
					// 	$saveFlag = $this->saveWatchersDetails($watchers_name,$task_id,$taskDetails['modified_by']);
					// }
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
	
	public function sendTaskUpdateEmail($task_id,$taskDetails,$assignee,$modified_by){
		$where = array("adminID" =>$assignee);
		$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
		$assignByDetails = $this->CommonModel->getMasterDetails('admin', 'name,email,photo', array("adminID"=> $modified_by));
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
		
		$whereT["t.record_id ="] = "'".$task_id."'";
		$whereT["t.description ="] = "'update'";
		$whereT["t.record_type ="] = "'task'";
		$whereT["t.is_notify ="] = "'no'";

		$taskHistory = $this->CommonModel->GetMasterListDetails('t.*,c.categoryName AS oldName, ca.categoryName AS newName,old_date,new_date,old_desc,new_desc','history', $whereT ,'', '', $join, '');
		//print $this->db->last_query();exit;
		//print_r($task_id);
		
		$profie_pic = "";
		if(isset($assignByDetails[0]->photo) && !empty($assignByDetails[0]->photo)){
			$profie_pic = "<div style=width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:
flex;align-items: center;'><img style='width: 30px;height: 30px;' src='".$this->config->item('media_url')."profilephoto/1/profilePic/".$assignByDetails[0]->photo."'alt='".getFirstAndLastWordInitials($assignByDetails[0]->name)."'/></div>";
		}else{
			$profie_pic = "<div style='width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:
flex;align-items: center;'><span>".getFirstAndLastWordInitials($assignByDetails[0]->name)."</span></div>";
		}
		$messageDetails="";
		$messageDetails.= "<div><p style='border-bottom: 1px solid #dee2e6;margin: 8px 0px;padding-bottom: 6px;'>".$assignedBy."&nbsp;<b style='display:inline-block;color:#172b4d'>made ".count($taskHistory)." update</b></p>";
		$messageDetails.= "<p style='margin-bottom: 10px;'>Task/".$task_id."</p>";
		$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#task/".$task_id."'>".$taskDetails['subject']."</a></p>";
		$joinArray = array("task","task priority","task type","task status","assignee","project");
		//print_r($taskHistory);exit;
		$assignee_change = false;
		foreach($taskHistory as $key => $value1) {
			if(!empty($value1->new_val) && strtolower($value1->col) == "assignee"){
				$assignee_change = true;
				if($value1->old_val != null && $value1->old_val !=""){
					$fromDetails = $this->CommonModel->getMasterDetails('admin', 'name',array("adminID"=> $value1->old_val));
					$fromDetails = $fromDetails[0]->name;
				}else{
					$fromDetails = "Unassigned";
				}
				$toDetails = $this->CommonModel->getMasterDetails('admin', 'name,email',array("adminID"=>$value1->new_val));
				$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content:start;gap: 10px;margin-top: 15px;line-height: 28px;'>
				<div style='margin-right: 10px;flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>".$assignedBy."&nbsp; Updated &nbsp;".$value1->col." <br> From <del style='background: #ffe5e5;padding: 4px 10px;'>".$fromDetails."</del> To <span style='background:#e7ffe5;padding: 4px 10px;'>".$toDetails[0]->name."</span>"."</div></div>";
				//break;
			}else if(!empty($value1->new_val) && in_array(strtolower($value1->col),$joinArray)){
				$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content:start;gap: 10px;margin-top: 15px;line-height: 28px;'>
				<div style='margin-right: 10px;flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>".$assignedBy."&nbsp; Updated &nbsp;".$value1->col." <br> From <del style='background: #ffe5e5;padding: 4px 10px;'>".$value1->oldName."</del> To <span style='background:#e7ffe5;padding: 4px 10px;'>".$value1->newName."</span>"."</div></div>";
				
			}else if(!empty($value1->new_val)){
				if($value1->old_val == null || $value1->old_val ==""){
					$value1->old_val = "Not Set";
				}
				$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
				<div style='margin-right: 10px;flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>".$assignedBy."&nbsp; Updated &nbsp;".$value1->col." <br> From <del style='background: #ffe5e5;padding: 4px 10px;'>".$value1->old_val."</del> To <span style='background:#e7ffe5;padding: 4px 10px;'>".$value1->new_val."</span>"."</div></div>";
			}
			if(!empty($value1->new_date)){
				$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
				<div style='margin-right: 10px;flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>".$assignedBy."&nbsp; Updated &nbsp;".$value1->col." <br> From <del style='background: #ffe5e5;padding: 4px 10px;'>".$value1->old_date."</del> To <span style='background:#e7ffe5;padding: 4px 10px;'>".$value1->new_date."</span>"."</div></div>";
				//$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$task_id.'">View Task</a></div><br/><br/></div>';
			}
			if(!empty($value1->new_desc)){
				$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
				<div style='margin-right: 10px;flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>".$assignedBy."&nbsp; Updated &nbsp;".$value1->col." <br> From <del style='background: #ffe5e5;padding: 4px 10px;'>".$value1->old_desc."</del> To <span style='background:#e7ffe5;padding: 4px 10px;'>".$value1->new_desc."</span>"."</div></div>";
				
			}
			
		}
		$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$task_id.'">View Task</a></div><br/><br/></div>';
		if(isset($messageDetails) && !empty($messageDetails)){
			$notification = array(
				'title' => "Task Updated",
				'body' => $messageDetails,
			);
		}
		if(!empty($taskHistory)){
			
			// check is assignee changed
			
			
			if(isset($notification) && !empty($notification)){
				$this->notifications->sendmessage($notification,$assignee);
				if(isset($tDetails)&& !empty($tDetails)){
					if($assignee_change){
						$subject  = $assignedBy." assigned to you. - ".$task_id;
						$issent = $this->emails->sendMailDetails("","",$toDetails[0]->email,'','',$subject, $messageDetails);
					}else{
						$subject  = "Task Updated:- ".$task_id;
						$issent = $this->emails->sendMailDetails("","",$tDetails[0]->email,'','',$subject, $messageDetails);
					}
					if($issent){
						$history = array("is_notify"=>'yes');
						$iscreated = $this->CommonModel->updateMasterDetails('history',$history,array("record_id"=>$task_id));
						// send notification to watchers as well.
						// get watchers list
						$wherec = $join = array();
						$join[0]['type'] ="LEFT JOIN";
						$join[0]['table']="admin";
						$join[0]['alias'] ="ad";
						$join[0]['key1'] ="admin_id";
						$join[0]['key2'] ="adminID";
						$wherec['t.task_id'] = "='".$task_id."'";
						$watchersList = $this->CommonModel->GetMasterListDetails($selectC="ad.name,ad.email",'tasks_watchers',$wherec,'','',$join,array());
						//print_r($watchersList);//exit;
						//$watchersList = $this->CommonModel->getMasterDetails('tasks_watchers','',array("task_id",$task_id));
						if (!empty($watchersList)) {
							$subject  = "Task Updated:- ".$task_id;
							foreach ($watchersList as $key => $value){
								$issent = $this->emails->sendMailDetails("","",$value->email,'','',$subject, $messageDetails);					
							}
							//$watchers_name = array_column($watchersDetailsName,'watchers_name');
							//$watchersAdminID  = array_column($watchersDetailsName,'admin_id');
							//$taskDetails[0]->tasksWatchers = $watchers_name;
						}
					}
				}
			}
		}
	}
	public function hardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$task_id = $this->input->post("id");
		$action = $this->input->post("action");
		if($action == "delete"){
			if(isset($task_id) && !empty($task_id)){
				$this->db->trans_start();
				$wheret = array('task_id'=> $task_id);
				$isTaskDeleted = $this->CommonModel->deleteMasterDetails('tasks', $wheret);
				if(!$isTaskDeleted){
					$this->db->trans_rollback();
					$status['msg'] = $this->systemmsg->getErrorCode(296);
					$status['statusCode'] = 296;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}else{
					$this->db->trans_commit();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		}
	}
	public function multipletaskChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['task_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('tasks', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('tasks', $action, $ids, 'task_id');
		}
		if ($changestatus) {				
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$this->response->outputErrorResponse(996);
		}
	}
	public function timeEstimation(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$type = $this->input->post('type');
		$taskID = $this->input->post('taskID');


		switch ($type) {
			case 'put':
				$ETD = array();
				$ETD['task_id'] = $taskID;
				$ETD['spend_time'] = $this->validatedata->validate('EstLog', 'EstLog', false, '', array()); //$Estlog;
				$ETD['note'] = $this->validatedata->validate('note', 'Note', false, '', array()); //$Estlog;
				$ETD['log_date'] = date("Y/m/d H:i:s");
				$ETD['created_by'] = $this->input->post('SadminID');
				$iscreated = $this->CommonModel->saveMasterDetails('task_time_log', $ETD);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(289);
					$status['statusCode'] = 998;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
				break;
			default:
				$where = array("task_id ="=>$taskID);
				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="admin";
				$join[0]['alias'] ="aa";
				$join[0]['key1'] ="created_by";
				$join[0]['key2'] ="adminID";
				$taskDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,aa.name",'task_time_log',$where,'','',$join,array());
				if(isset($taskDetails) && !empty($taskDetails)){ 	
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = $taskDetails;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}else{
					$status['msg'] = $this->systemmsg->getErrorCode(227);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				break;
		}
		
	}
}