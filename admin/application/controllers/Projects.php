<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Projects extends CI_Controller {

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


	public function getprojectDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('project_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
		
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "title";
			$order ="ASC";
		}
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"customer_id" => ["table" => "customer", "alias" => "cs", "column" => "name", "key2" => "customer_id"],
					"project_priority" => ["table" => "categories", "alias" => "cat", "column" => "categoryName", "key2" => "category_id"],
					"project_type" => ["table" => "categories", "alias" => "ct", "column" => "categoryName", "key2" => "category_id"],
					"project_stages" => ["table" => "categories", "alias" => "ps", "column" => "categoryName", "key2" => "category_id"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
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
						if(isset($orderBy) && !empty($orderBy)){
							if($orderBy == 't.'.$columnName){
								$orderBy = $columnData["alias"] . "." . $columnNameShow;
							}
						}
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
			}			
		}
		
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
	
		$config["base_url"] = base_url() . "projectDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.project_id','projects',$wherec,$other);
	    $config["uri_segment"] = 2;
	    $this->pagination->initialize($config);
	    if(isset($curPage) && !empty($curPage)){
		$curPage = $curPage;
		$page = $curPage * $config["per_page"];
		}
		else{
		$curPage = 0;
		$page = 0;
		}
		
		if ($isAll == "Y") {
			$projectDetails = $this->CommonModel->GetMasterListDetails($selectC="project_id,title",'projects',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.created_date,".$selectC;
			$projectDetails = $this->CommonModel->GetMasterListDetails($selectC, 'projects', $wherec, $config["per_page"], $page, $join, $other);
		}
		// print_r($projectDetails);exit
		// print $this->db->last_query();exit;	
		$status['data'] = $projectDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if($curPage <=1)
		$status['paginginfo']["prevPage"] = 0;
		else
		$status['paginginfo']["prevPage"] = $curPage - 1 ;

		$status['paginginfo']["pageLimit"] = $config["per_page"] ;
		$status['paginginfo']["nextpage"] =  $curPage+1 ;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
		$status['loadstate'] = true;
		if($config["total_rows"] <= $status['paginginfo']["end"]){
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status,200);
		}
		if($projectDetails){
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}				
	}

	public function projects($project_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
			$projectDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$projectDetails['title'] = $this->validatedata->validate('title','title',true,'',array());
			$projectDetails['project_priority'] = $this->validatedata->validate('project_priority','Priority',false,'',array());
			$projectDetails['project_type'] = $this->validatedata->validate('project_type','Type',false,'',array());
			$projectDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
			$projectDetails['expected_revenue'] = $this->validatedata->validate('expected_revenue','Revenue',false,'',array());
			$projectDetails['expected_expences'] = $this->validatedata->validate('expected_expences','Expences',false,'',array());
			$projectDetails['start_date'] = $this->validatedata->validate('start_date','Start Date',false,'',array());
			$projectDetails['end_date'] = $this->validatedata->validate('end_date','End Date',false,'',array());
			$projectDetails['customer_id'] = $this->validatedata->validate('customer_id','Customer',false,'',array());
			$projectDetails['project_status'] = $this->validatedata->validate('project_status','Status',false,'',array());
			$projectDetails['project_stages'] = $this->validatedata->validate('project_stages','Stage',false,'',array());
			$projectDetails['project_status_date'] = $this->validatedata->validate('project_status_date','Project Status Date',false,'',array());
			$projectDetails['additional_details '] = $this->validatedata->validate('additional_details','Additional Details',false,'',array());
			if (isset($projectDetails['start_date']) && !empty($projectDetails['start_date']) && $projectDetails['start_date'] != "0000-00-00") {
				$projectDetails['start_date'] = str_replace("/", "-", $projectDetails['start_date']);
				$projectDetails['start_date'] = date("Y-m-d", strtotime($projectDetails['start_date']));
			}else{
				$projectDetails['start_date'] = null;
			}

			if (isset($projectDetails['project_status_date']) && !empty($projectDetails['project_status_date']) && $projectDetails['project_status_date'] != "0000-00-00") {
				$projectDetails['project_status_date'] = str_replace("/", "-", $projectDetails['project_status_date']);
				$projectDetails['project_status_date'] = date("Y-m-d", strtotime($projectDetails['project_status_date']));
			}else{
				$projectDetails['project_status_date'] = null;
			}

			if (isset($projectDetails['end_date']) && !empty($projectDetails['end_date']) && $projectDetails['end_date'] != "0000-00-00") {
				$projectDetails['end_date'] = str_replace("/", "-", $projectDetails['end_date']);
				$projectDetails['end_date'] = date("Y-m-d", strtotime($projectDetails['end_date']));
			}else{
				$projectDetails['end_date'] = null;
			}
			// print_r($projectDetails);exit;
			$fieldData = $this->datatables->mapDynamicFeilds("projects",$this->input->post());
			$projectDetails = array_merge($fieldData, $projectDetails);
			if($method=="PUT"){
				$projectDetails['created_by'] = $this->input->post('SadminID');
				$projectDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('projects',$projectDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array("last_id"=>$this->db->insert_id());
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}

			}elseif($method=="POST"){
				$where=array('project_id'=>$project_id);
				if(!isset($project_id) || empty($project_id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				$projectDetails['modified_by'] = $this->input->post('SadminID');
				$projectDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('projects',$projectDetails,$where);
				// print $this->db->last_query();exit;
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
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
			}elseif($method=="dele"){
				$projectDetails = array();
				$where=array('sID'=>$sID);
					if(!isset($sID) || empty($sID)){
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}

					$iscreated = $this->CommonModel->deleteMasterDetails('projects',$where);
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
			if($project_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

			$this->menuID = $this->input->post('menuId');
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
			$other = array();
			$wherec["t.project_id"] = "=".$project_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}

			$join=array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="customer";
			$join[0]['alias'] ="cus";
			$join[0]['key1'] ="customer_id";
			$join[0]['key2'] ="customer_id";

			$wheretask["project_id ="] = $project_id;
			$projectTask = $this->CommonModel->getCountByParameter('t.task_id','tasks',$wheretask,array());

			$paidAmount = 0;
			$whereAmount["project_id = "] = $project_id;
			$incomeAmount = $this->CommonModel->getMasterDetails('invoice_header','(grossAmount - pending_amount) AS invoice_paid',$whereAmount);
			if(isset($incomeAmount) && !empty($incomeAmount)){
				foreach ($incomeAmount as $key => $value) {
					$paidAmount +=  $value->invoice_paid;
				}
			}

			$expencePaidAmount = 0;
			$whereExpAmount["project_id = "] = $project_id;
			$expenceAmount = $this->CommonModel->getMasterDetails('expenses','amount',$whereExpAmount);
			if(isset($expenceAmount) && !empty($expenceAmount)){
				foreach ($expenceAmount as $key => $value) {
					$expencePaidAmount +=  $value->amount;
				}
			}

			$whereTaskStatus = array( "slug" => "task_complete");
			$categoryTaskStatus = $this->CommonModel->getMasterDetails('categories','categoryName,category_id',$whereTaskStatus);
			$wheretaskComplete["project_id ="] = $project_id;
			$wheretaskComplete["task_status ="] = $categoryTaskStatus[0]->category_id ;
			$projectTaskComplete = $this->CommonModel->getCountByParameter('t.task_id','tasks',$wheretaskComplete,array());
			
			$selectC = $selectC.",cus.Name As customerName, cus.customer_image, cus.country, cus.state, cus.city, cus.lead_source";
			$projectDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			if(isset($projectDetails[0]->lead_source) && !empty($projectDetails[0]->lead_source)){
				$whereProject = array( "category_id" => $projectDetails[0]->lead_source);
				$category = $this->CommonModel->getMasterDetails('categories','categoryName',$whereProject);
				$projectDetails[0]->leadSource = $category[0]->categoryName;
			}
			if(isset($projectTask) && !empty($projectTask)){
				$projectDetails[0]->taskCount = $projectTask;
			}
			if(isset($projectTaskComplete) && !empty($projectTaskComplete)){
				$projectDetails[0]->taskCompleteCount = $projectTaskComplete;
			}else{
				$projectDetails[0]->taskCompleteCount = "0";
			}
			$projectDetails[0]->invoiceAmount = $paidAmount;
			$projectDetails[0]->expenseAmount = $expencePaidAmount;
			
			if(isset($projectDetails) && !empty($projectDetails)){
				$status['data'] = $projectDetails;
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

    public function projectsChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
			$ids = $this->input->post("list");
			$whereIn ['project_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('projects', '',$whereIn);
			if($changestatus){

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}
	
	public function completeProject()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$projectID = $this->input->post("id");

		if(isset($projectID) && !empty($projectID)){
			$where=array('project_id'=>$projectID);
			$projectDetails['status'] = 'completed';
			$changestatus = $this->CommonModel->updateMasterDetails('projects',$projectDetails, $where);
			if($changestatus){

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}

	public function getProjectCommentDetails()
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
		$project_id = $this->input->post('project_id');

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

		if (isset($project_id) && !empty($project_id)) {
			$wherec["t.project_id"] = '= "' . $project_id . '"';
		}

		$adminID = $this->input->post('SadminID');

		$join = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('comment_id', 'project_comments', $wherec, $other);
		$config["uri_segment"] = 2;
		
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
	
		$projectComments = $this->CommonModel->GetMasterListDetails($selectC = 't.*, a.name,a.adminID,a.photo', 'project_comments', $wherec, $config["per_page"], $page, $join, $other);
		// print_r($projectComments);exit;
		// print $this->db->last_query();

		foreach ($projectComments as $projectComment) {
			if (is_object($projectComment)) {
				$fullName = $projectComment->name;
				if(isset($fullName) && !empty($fullName)){
					$nameParts = explode(' ', $fullName);
					$firstLetterName = substr($nameParts[0], 0, 1);
					$firstLetterLastName = substr($nameParts[count($nameParts) - 1], 0, 1);
					$initials = $firstLetterName . $firstLetterLastName;
					$projectComment->initial = $initials;
				}
			}
		}

		$status['data'] = $projectComments;
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

	public function projectCommentMaster($comment_id="")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$commentID = $this->input->post("id");

		if ($method == "POST" || $method == "PUT") {
			$projectComments = array();
			$updateDate = date("Y/m/d H:i:s");
			$projectComments['project_id'] = $this->validatedata->validate('project_id', 'Project ID', true, '', array());
			$projectComments['comment_text'] = $this->validatedata->validate('comment_text', 'Comment', true, '', array());
			$projectComments['status'] = $this->validatedata->validate('status', 'Status', true, '', array());
			$mentions = $this->input->post('mentions');
			if ($method == "PUT") {
				$projectComments['status'] = "active";
				$projectComments['user_id'] = $this->input->post('SadminID');
				$projectComments['created_date'] = $updateDate;
		
				$iscreated = $this->CommonModel->saveMasterDetails('project_comments', $projectComments);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					if(!$this->config->item('development')){
						$cDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', array('adminID'=> $projectComments['user_id']));
						$messageDetails = $cDetails[0]->name ." mentioned you in Project comment"."<br>";
						$notification = array(
							'title' => "Mentioned in Comment",
							'body' => $messageDetails,
						);
						$to = array();
						foreach ($mentions as $value) {							
							$this->notifications->sendmessage($notification,$value);
							$where = array("adminID" => $value);	
							$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
							if(isset($tDetails)&& !empty($tDetails)){
								$to[] = $tDetails[0]->email;	
							}
						}
						$this->emails->sendMailDetails("","",$to,'','',$messageDetails,'Project Comment - '.$projectComments['comment_text']);
					}

					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('comment_id' => $comment_id);
				$projectComments['user_id'] = $this->input->post('SadminID');
				if (!isset($comment_id) || empty($comment_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				
				$iscreated = $this->CommonModel->updateMasterDetails('project_comments', $projectComments, $where);
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
				$projectComments = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('project_comments', $where);
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
			$where = array("user_id" => 92); //array("user_id"=>$user_id);
			$taskDetails = $this->CommonModel->getMasterDetails('project_comments', '', $where);
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

	public function getprojectNotesDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$project_id = $this->input->post('project_id');
		$record_type = $this->input->post('record_type');
		$where = array("record_id" => $project_id,"record_type" => $record_type);
		
		$projectNotesDetails = $this->CommonModel->getMasterDetails('notes', '', $where);
		foreach ($projectNotesDetails as $key => $value) {
			if(isset($value->created_by) && !empty($value->created_by)){
				$where = array(
					"adminID" => $value->created_by,
				);
				$adminPic = $this->CommonModel->getMasterDetails('admin','photo',$where);
				
				if(isset($adminPic) && !empty($adminPic)){
					$projectNotesDetails[$key]->photo = $adminPic[0]->photo;
				}
			}
		}
		$status['data'] = $projectNotesDetails;
		if (!empty($projectNotesDetails)) {
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

	public function projectrNote($note_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$customerNote = array();
			$updateDate = date("Y/m/d H:i:s");

			$customerNote['record_id'] = $this->validatedata->validate('project_id', 'Project ID', true, '', array());
			$customerNote['note_desc'] = $this->validatedata->validate('note_desc', 'Project Note', false, '', array());
			$customerNote['title'] = $this->validatedata->validate('title', 'Title', false, '', array());
			$customerNote['record_type'] = $this->validatedata->validate('record_type', 'Record Type', false, '', array());
			$customerNote['reminder_date'] = $this->validatedata->validate('reminder_date', 'Reminder Date', false, '', array());
			// $reminder_time = $this->validatedata->validate('reminder_time', 'Reminder Time', false, '', array());
			
			if (isset($customerNote['reminder_date']) && !empty($customerNote['reminder_date']) && $customerNote['reminder_date'] != "0000-00-00") {
				$customerNote['reminder_date'] = str_replace("/", "-", $customerNote['reminder_date']);
				$customerNote['reminder_date'] = date("Y-m-d", strtotime($customerNote['reminder_date']));
				
				// Convert time to the desired format
				$reminder_time = date("H:i:s", strtotime($reminder_time));

				// Concatenate date and time
				$customerNote['reminder_date'] .= ' ' . $reminder_time;
			} else {
				$customerNote['reminder_date'] = null;
			}
			if ($method == "PUT") {
				$customerNote['created_by'] = $this->input->post('SadminID');
				$customerNote['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('notes', $customerNote);
				$lastNoteID = $this->db->insert_id();
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
					$status['lastID'] = $lastNoteID;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('note_id' => $note_id);
				if (!isset($note_id) || empty($note_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$customerNote['modified_by'] = $this->input->post('SadminID');
				$customerNote['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('notes', $customerNote, $where);
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
				$customerNote = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('notes', $where);
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
				}
					$this->response->output($status, 200);
			}
		} else {

			$where = array("note_id" => $note_id);
			$customerDetails = $this->CommonModel->getMasterDetails('notes', '', $where);

			if (isset($customerDetails) && !empty($customerDetails)) {

				$status['data'] = $customerDetails;
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

	public function deleteComment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$projectID= $this->input->post("list");
		$wherec["comment_id ="] = $projectID;
		$changestatus = $this->CommonModel->deleteMasterDetails('project_comments',$wherec);
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

	public function hardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$project_id = $this->input->post("id");
		$action = $this->input->post("action");
		if($action == "delete"){
			if(isset($project_id) && !empty($project_id)){
				$this->db->trans_start();
				$wherep = array('project_id'=> $project_id);
				$isTaskDeleted = $this->CommonModel->deleteMasterDetails('projects', $wherep);
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

	public function noteDelete(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$noteID= $this->input->post("id");
		$wherec["note_id ="] = $noteID;
		$changestatus = $this->CommonModel->deleteMasterDetails('notes',$wherec);
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

	public function multipleprojectkChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['project_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('projects', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('projects', $action, $ids, 'project_id');
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
 }