<?php
defined('BASEPATH') or exit('No direct script access allowed');

class courseMaster extends CI_Controller
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
		// $this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->helper('directory');
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}

	public function getSectionDetails()
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

		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		if($isAll !="Y"){
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
				// print_r($selectC);exit;
			}
		}

		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "section_id";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		// $wherec = $join = array();
		// if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'" . $textval . "%'";
		// }

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// }

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		if ($isAll == "Y") {
			$join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		$curPage = 0;
		$page = 0;
		// $join = array();
		// if ($isAll == "Y") {
		// 	$courseDetails = $this->CommonModel->GetMasterListDetails($selectC="course_id,title",'courses_sections',$wherec,'','',$join,$other);	
		// }
		// $courseDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'courses_sections', $wherec, '', '', $join, $other);

		if ($isAll == "Y") {
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC="course_id,title",'courses_sections',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.course_id,t.title,".$selectC;
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC, 'courses_sections', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $courseDetails;
		$status['paginginfo']["curPage"] = 0;

		$status['paginginfo']["pageLimit"] = 0;
		$status['paginginfo']["nextpage"] =  0;

		$status['loadstate'] = true;

		if ($courseDetails) {
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

	// set course trigger
	public function setCourseTrigger($schema_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$triggerDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$triggerDetails['schema_id'] = $this->validatedata->validate('schema_id', 'schema ID', false, '', array());
			$triggerDetails['module_id'] = $this->validatedata->validate('module_id', 'Module ID', false, '', array());
			$triggerDetails['trigger_name'] = $this->validatedata->validate('trigger_name', 'Trigger Name', true, '', array());
			$triggerDetails['notification_type'] = $this->validatedata->validate('notification_type', 'Notification Type', true, '', array());
			$triggerDetails['trigger_type'] = $this->validatedata->validate('trigger_type', 'Trigger Type', true, '', array());
			$triggerDetails['action'] = $this->validatedata->validate('action', 'Action', true, '', array());
			$triggerDetails['date_condition'] = $this->validatedata->validate('date_condition', 'Date Condition', false, '', array());
			$triggerDetails['inteval_type'] = $this->validatedata->validate('inteval_type', 'Interval Type', false, '', array());
			$triggerDetails['interval_span'] = $this->validatedata->validate('interval_span', 'Interval Span', false, '', array());
			$triggerDetails['total_complete_interval'] = $this->validatedata->validate('total_complete_interval', 'Total Complete Interval', false, '', array());
			$triggerDetails['stop_type'] = $this->validatedata->validate('stop_type', 'Stop Type', false, '', array());
			$triggerDetails['end_date'] = $this->validatedata->validate('end_date', 'Snd Date', false, '', array());
			$triggerDetails['send_on'] = $this->validatedata->validate('send_on', 'Send On', true, '', array());
			$triggerDetails['months_week'] = $this->validatedata->validate('months_week', 'Months Week', false, '', array());
			$triggerDetails['week_days'] = $this->validatedata->validate('week_days', 'Weeks days', false, '', array());
			$triggerDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			
			// print_r($triggerDetails);
			// if (isset($triggerDetails['end_date']) && !empty($triggerDetails['end_date']) && $triggerDetails['end_date'] != "0000-00-00") {
			// 	$triggerDetails['end_date'] = str_replace("/", "-", $triggerDetails['end_date']);
			// 	$triggerDetails['end_date'] = date("Y-m-d	", strtotime($triggerDetails['end_date']));
			// }
		
			if ($method == "PUT") {
				$iticode = $triggerDetails['schema_id'];
				$triggerDetails['status'] = "active";
				$triggerDetails['created_by'] = $this->input->post('SadminID');
				$triggerDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('notification_schema', $triggerDetails);
				if (!$iscreated) {
					print("last Schema ID : ");
					$last = $this->db->insert_id();
					print($last);
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
				
				$where = array('schema_id' => $schema_id);
				if (!isset($schema_id) || empty($schema_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$triggerDetails['modified_by'] = $this->input->post('SadminID');
				$triggerDetails['modified_date'] = $updateDate;
				// print("here");
				$iscreated = $this->CommonModel->updateMasterDetails('notification_schema', $triggerDetails, $where);
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
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
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
			}
		} else {

			$where = array("schema_id" => $schema_id);
			$triggerDetails = $this->CommonModel->getMasterDetails('notification_schema', '', $where);
			if (isset($triggerDetails) && !empty($triggerDetails)) {

				$status['data'] = $triggerDetails;
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
	public function changeTriggerStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("schema_id");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('notification_schema', $statusCode, $ids, 'schema_id');

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
	
//  get triggers list by using admin id who created  trigger
	public function getTriggers()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$module_id = $this->input->post('module_id');
		// print($module_id);exit;
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$adminID = $this->input->post('SadminID');
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "schema_id";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		
		// print_r($wherec);exit;
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
		$wherec["created_by="] = $adminID;
		$wherec["module_id="] = $module_id;							
		$join = array();
		$triggerDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'notification_schema', $wherec, '', '', $join, $other);
		
		$status['data'] = $triggerDetails;
	
		if ($triggerDetails) {
			$status['msg'] = "success";
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

	public function getcourseDetails()
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
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];

			// create join for created by and modified data details
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="ad";
			$join[$jkey]['key1'] ="created_by";
			$join[$jkey]['key2'] ="adminID";
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="am";
			$join[$jkey]['key1'] ="modified_by";
			$join[$jkey]['key2'] ="adminID";

			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			
				$columnNames = [
					"category_id" => ["table" => "categories", "alias" => "cat", "column" => "categoryName", "key2" => "category_id"],
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					if (in_array($columnName, $colData)) {
						$jkey = count($join) + 1;
						$join[$jkey]['type'] = "LEFT JOIN";
						$join[$jkey]['table'] = $columnData["table"];
						$join[$jkey]['alias'] = $columnData["alias"];
						$join[$jkey]['key1'] = $columnName;
						$join[$jkey]['key2'] = $columnData["key2"];
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}
			if($selectC !=""){
				$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			}else{
				$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			}
		}

		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "course_id";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;

		// $other = array("orderBy" => $orderBy, "order" => $order);

		// $config = $this->config->item('pagination');
		// $wherec = $join = array();
		// if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'" . $textval . "%'";
		// }

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// }

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

		$config["base_url"] = base_url() . "courseDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.course_id', 'courses', $wherec, $other);
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
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'courses', $wherec, '', '', $join, $other);
		} else {

			// $join = array();
			// $join[0]['type'] ="LEFT JOIN";
			// $join[0]['table']="stateMaster";
			// $join[0]['alias'] ="s";
			// $join[0]['key1'] ="state";
			// $join[0]['key2'] ="stateID";

			// $join[1]['type'] ="LEFT JOIN";
			// $join[1]['table']="districtMaster";
			// $join[1]['alias'] ="d";
			// $join[1]['key1'] ="district";
			// $join[1]['key2'] ="districtID";

			$selectC = "*";
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'courses', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		$status['data'] = $courseDetails;
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
		if ($courseDetails) {
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

	public function courseMaster($course_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$courseDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$courseDetails['course_id'] = $this->validatedata->validate('course_id', 'course ID', false, '', array());
			$courseDetails['title'] = $this->validatedata->validate('title', 'Name', false, '', array());
			$courseDetails['description'] = $this->validatedata->validate('description', 'Description', false, '', array());
			$courseDetails['cover_image'] = $this->validatedata->validate('cover_image', 'Cover Image', false, '', array());
			$courseDetails['course_paid'] = $this->validatedata->validate('course_paid', 'Course Paid', true, '', array());
			if($courseDetails['course_paid'] == "paid"){
			$courseDetails['amount'] = $this->validatedata->validate('amount', 'Amount', true, '', array());
				$courseDetails['discount'] = $this->validatedata->validate('discount', 'Discount', true, '', array());
							}else
			{
				$courseDetails['amount'] = $this->validatedata->validate('amount', 'Amount', false, '', array());
				$courseDetails['discount'] = $this->validatedata->validate('discount', 'Discount', false, '', array());
			}
			$courseDetails['selling_price'] = $this->validatedata->validate('selling_price', 'Selling Price', false, '', array());
			$courseDetails['author_id'] = $this->validatedata->validate('author_id', 'Author', false, '', array());
			$courseDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());

			$cat = $this->input->post("category_id");

			if (!is_array($cat)) {
				// If it's not an array, convert it into an array with a single element
				$cat = array($cat);
			}

			if (empty($cat)) {
				$status['msg'] = "Course Category Required";
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} else {
				$courseDetails['category_id'] = implode(",", $cat);
				//$this->validatedata->validate('category_id', 'Category', false, '', array());
			}

			$fieldData = $this->datatables->mapDynamicFeilds("course",$this->input->post());
			$courseDetails = array_merge($fieldData, $courseDetails);
			// print_r($method);exit();
			if ($method == "PUT") {
				$iticode = $courseDetails['course_id'];
				$courseDetails['status'] = "active";
				$courseDetails['created_by'] = $this->input->post('SadminID');
				$courseDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('courses', $courseDetails);
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
				$where = array('course_id' => $course_id);
				if (!isset($course_id) || empty($course_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$courseDetails['modified_by'] = $this->input->post('SadminID');
				$courseDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('courses', $courseDetails, $where);
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
				$courseDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('courses', $where);
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
			if($course_id ==""){
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
			$wherec["t.course_id"] = "=".$course_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
			// $where = array("course_id" => $course_id);
			// $courseDetails = $this->CommonModel->getMasterDetails('courses', '', $where);
			if (isset($courseDetails) && !empty($courseDetails)) {

				$status['data'] = $courseDetails;
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

	public function updateSectionPositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$section_ids = $this->input->post('section_ids');
			$section_index = $this->input->post('index');
			// $sectionDetails['section_index'] = $section_index;
			// $where['section_id'] = $section_ids;	
			for($i=0;$i<count($section_ids);$i++)
			{
				$sectionDetails['section_index'] = $section_index[$i];
				$where['section_id'] = $section_ids[$i];	
				$iscreated = $this->CommonModel->updateMasterDetails('courses_sections', $sectionDetails, $where);
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

	public function updateLessonPositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$section_ids = $this->input->post('lesson_ids');
			$section_index = $this->input->post('index');
			// $sectionDetails['section_index'] = $section_index;
			// $where['section_id'] = $section_ids;	
			for($i=0;$i<count($section_ids);$i++)
			{
				$lessonDetails['lesson_index'] = $section_index[$i];
				$where['lesson_id'] = $section_ids[$i];	
				$iscreated = $this->CommonModel->updateMasterDetails('course_lessons', $lessonDetails, $where);
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


	public function courseChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('courses', $statusCode, $ids, 'course_id');

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

	public function getLargeSectionIndex($course_id = '')
	{
		$where = array();
		$wherec['course_id']= $course_id ;
		$join = array();
		$other = array();
		$section_index =  $this->CommonModel->GetMasterListDetails($selectC = 'Max(section_index)', 'courses_sections', $wherec, '', '', $join, $other);
		return $section_index;
	}

	public function getaddsectionDetails($course_id = '')
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

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "section_index";
			$order = "ASC";
		}
		
		$other = array("orderBy" => $orderBy, "order" => $order);

		// $config = $this->config->item('pagination');

		// print_r($wherec);
		// exit;
		$wherec = $join = array();


		
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {

			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if ($course_id != '')
			$wherec["course_id="]  = $course_id;

		if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
	

		// get comapny access list
		$adminID = $this->input->post('SadminID');

		// $config["base_url"] = base_url() . "courseDetails";
		// $config["total_rows"] = $this->CommonModel->getCountByParameter('section_id', 'courses_sections', $wherec, $other);
		// $config["uri_segment"] = 2;
		// $this->pagination->initialize($config);
		// if (isset($curPage) && !empty($curPage)) {
			// 	$curPage = $curPage;
			// 	$page = $curPage * $config["per_page"];
		// } else {
			// 	$curPage = 0;
			// 	$page = 0;
		// }
		if ($isAll == "Y") {
			$join = array();
			$courseDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'courses_sections', $wherec, '', '', $join, $other);
				}
				$status['data'] = $courseDetails;
		
		if ($courseDetails) {
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

	public function sectionDetails($section_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$sectionDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$sectionDetails['section_id'] = $this->validatedata->validate('section_id', 'section ID', false, '', array());
			$sectionDetails['section_name'] = $this->validatedata->validate('section_name', 'section Name', false, '', array());
			$sectionDetails['course_id'] = $this->validatedata->validate('course_id', 'Course ID', false, '', array());

			// print_r($method);exit();
			if ($method == "PUT") {
				$iticode = $sectionDetails['section_id'];
				$sectionDetails['created_by'] = $this->input->post('SadminID');
				$sectionDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('courses_sections', $sectionDetails);
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
				$where = array('section_id' => $section_id);
				if (!isset($section_id) || empty($section_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$sectionDetails['modified_by'] = $this->input->post('SadminID');
				$sectionDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('courses_sections', $sectionDetails, $where);
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
				$sectionDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('courses_sections', $where);
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

			$where = array("section_id" => $section_id);
			$sectionDetails = $this->CommonModel->getMasterDetails('courses_sections', '', $where);
			if (isset($sectionDetails) && !empty($sectionDetails)) {

				$status['data'] = $sectionDetails;
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

	//lessons 

	public function getlessonDetails($section_id = '')
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

		// print_r($statuscode);exit;
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "lesson_id";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if ($section_id != '')
			$wherec["section_id="]  = $section_id;

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		
		// print_r($wherec);
		// get comapny access list
		$adminID = $this->input->post('SadminID');

		$config["base_url"] = base_url() . "lessonDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('lesson_id', 'course_lessons', $wherec, $other);
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
			$lessonDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'course_lessons', $wherec, '', '', $join, $other);
		} else {
			$selectC = "*";
			$lessonDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'course_lessons', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $lessonDetails;
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
		if ($lessonDetails) {
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

	public function sectionChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');
		if (trim($action) == "delete") {
			$id = $this->input->post("section_id");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('courses_sections', $statusCode, $id, 'section_id');

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


	public function getlessonList($section_id = '')
	{
		//$this->access->checkTokenKey();
		//$this->response->decodeRequest();
		$section_id = $this->input->post('section_id');
		$statuscode = $this->input->post('status');
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "lesson_index";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		$wherec = $join = array();
		if ($section_id != '')
			$wherec["section_id="]  = $section_id;

		if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
			
		$config["base_url"] = base_url() . "lessonDetails";

		$lessonDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'course_lessons', $wherec, '', '', $join, $other);
		
		// if ($lessonDetails) {

		// 	$status['data'] = array();
		// 	$status['statusCode'] = 200;
		// 	$status['flag'] = 'S';
		// 	$this->response->output($status, 200);
		// } else {
		// 	$status['data'] = array();
		// 	$status['msg'] = $this->systemmsg->getErrorCode(996);
		// 	$status['statusCode'] = 996;
		// 	$status['flag'] = 'F';
		// 	$this->response->output($status, 200);
		// }
		// print_r($lessonDetails);exit;
		$strList = "";
		if (count($lessonDetails) > 0) {
			for ($i = 0; $i < count($lessonDetails); $i++) {
				$strList .= "<div id='collapseOne_" . $lessonDetails[$i]->section_id . "' class=' panel-collapse collapse in ' role='tabpanel' aria-labelledby='headingOne_".$lessonDetails[$i]->section_id."' data-lesson_id='".$lessonDetails[$i]->lesson_id."'  data-section_id='".$lessonDetails[$i]->section_id ."'>
                            <div class='panel-body lesson-panel paddingDown' data-lesson_id ='" . $lessonDetails[$i]->lesson_id . "'>
                                <div style='border:solid;background-color:#607C8E; color:#FFFFFF; padding:14px 23px; border-radius: 7px;' class='addRow ws_add_lesson  '><h6 class='loadview' data-section_id ='".$lessonDetails[$i]->section_id."' data-course_id ='".$lessonDetails[$i]->course_id."' data-lesson_id ='" . $lessonDetails[$i]->lesson_id . "' data-view='singleLessonData' style='text-align:left;'> " . $lessonDetails[$i]->lesson_title . "</h6>
									<div class=' float-right deleteButton' id='". $lessonDetails[$i]->lesson_id."'  style='width: 10px ;padding-left: 5px;padding-right:0;margin-botton:3px; margin-right:20px;padding-top:0px;margin-top:-15px;'>
										<span type='button' class='changeLessonStatus justify-content-center ' data-lessonID='". $lessonDetails[$i]->lesson_id."' data-action='delete' data-toggle='tooltip' title='Delete Lesson'>
											<i class='material-icons icons-color' style=' border-radius: 50%; padding: 5px 5px 5px 5px; margin-top : -25px;'>delete</i>
										</span>
									</div>
								</div>
							</div>
                        </div>";
			}
		
		}
		echo $strList;
	}

	public function lessonList($course_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		// $course_id = $this->input->post('course_id');
		$statuscode = $this->input->post('status');
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "lesson_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		$wherec = $join = array();
		if ($course_id != '')
			$wherec["course_id="]  = $course_id;

		if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
			
		$config["base_url"] = base_url() . "lessonList";

		$lessonDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'course_lessons', $wherec, '', '', $join, $other);
		// print("<pre>");
		// print_r($lessonDetails);exit;
		if ($lessonDetails) {
			$status['data'] = $lessonDetails;
			$status['msg'] ='success';
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
		// print_r($lessonDetails);exit;
	}

	public function lessonChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');

		if (trim($action) == "delete") {
			$id = $this->input->post("lesson_id");
			$statusCode = $this->input->post("status");
			// print_r($statusCode);exit;
			$changestatus = $this->CommonModel->changeMasterStatus('course_lessons', $statusCode, $id, 'lesson_id');
		
			if ($changestatus) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				echo "".$status['data'];
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function changeLessonSection()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');

		if (trim($action) == "changeLessonSection") {
			$where = array();
			$data= array();
			$where['lesson_id']=  $this->input->post("lesson_id");
			$data['section_id'] = $this->input->post("section_id");
			// print_r($statusCode);exit;
			$changestatus = $this->CommonModel->updateMasterDetails('course_lessons', $data,$where);
		
			if ($changestatus) {

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				echo "".$status['data'];
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
	
	public function lessonDetails($lesson_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$lessonDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$lessonDetails['lesson_id'] = $this->validatedata->validate('lesson_id', 'lesson ID', false, '', array());
			$lessonDetails['section_id'] = $this->validatedata->validate('section_id', 'section ID', false, '', array());
			$lessonDetails['course_id'] = $this->validatedata->validate('course_id', 'Course ID', false, '', array());
			$lessonDetails['lesson_title'] = $this->validatedata->validate('lesson_title', 'Title', false, '', array());
			$lessonDetails['cover_image'] = $this->validatedata->validate('cover_image', 'Cover Image', false, '', array());
			$lessonDetails['introduction'] = $this->validatedata->validate('introduction', 'Introduction ', false, '', array());
			$lessonDetails['course_file'] = $this->validatedata->validate('course_file', 'Image URL', false, '', array());
			$lessonDetails['start_date'] = $this->validatedata->validate('start_date', 'Start Date', false, '', array());
			$lessonDetails['end_date'] = $this->validatedata->validate('end_date', 'End Date', false, '', array());
			$lessonDetails['start_time'] = $this->validatedata->validate('start_time', 'Start Time', false, '', array());
			$lessonDetails['end_time'] = $this->validatedata->validate('end_time', 'End Time', false, '', array());
			$lessonDetails['youtube_link'] = $this->validatedata->validate('youtube_link', 'Youtube Link', false, '', array());
			$lessonDetails['youtube_title'] = $this->validatedata->validate('youtube_title', 'Youtube Title', false, '', array());
			$lessonDetails['custom_link'] = $this->validatedata->validate('custom_link', 'Custom Link', false, '', array());
			$lessonDetails['custom_link_title'] = $this->validatedata->validate('custom_link_title', 'Custom Link Title', false, '', array());
			$lessonDetails['viemo_link'] = $this->validatedata->validate('viemo_link', 'Viemo Link', false, '', array());
			$lessonDetails['viemo_title'] = $this->validatedata->validate('viemo_title', 'Viemo Title', false, '', array());
			$lessonDetails['class_title'] = $this->validatedata->validate('class_title', 'Class_title Title', false, '', array());
			$lessonDetails['webinar_title'] = $this->validatedata->validate('webinar_title', 'Webinar Title', false, '', array());
			$lessonDetails['youtube_live'] = $this->validatedata->validate('youtube_live', 'Youtube Title', false, '', array());
			$lessonDetails['youtubelive_title'] = $this->validatedata->validate('youtubelive_title', 'Youtube Live Title', false, '', array());
			$lessonDetails['meeting_title'] = $this->validatedata->validate('meeting_title', 'Meeting Title', false, '', array());
			$lessonDetails['zoom_webinar'] = $this->validatedata->validate('zoom_webinar', 'Zoom Title', false, '', array());
			$lessonDetails['duration'] = $this->validatedata->validate('duration', 'Duration', false, '', array());
			$lessonDetails['password'] = $this->validatedata->validate('password', 'Password', false, '', array());
			$lessonDetails['upload_type'] = $this->validatedata->validate('upload_type', 'Upload Type', false, '', array());
			$lessonDetails['video_type'] = $this->validatedata->validate('video_type', 'video Type', false, '', array());
			$lessonDetails['live_type'] = $this->validatedata->validate('live_type', 'live Type', false, '', array());

			// print_r($lessonDetails['upload_type']);exit;
			if (isset($lessonDetails['start_date']) && !empty($lessonDetails['start_date']) && $lessonDetails['start_date'] != "0000-00-00") {
				$lessonDetails['start_date'] = str_replace("/", "-", $lessonDetails['start_date']);
				$lessonDetails['start_date'] = date("Y-m-d", strtotime($lessonDetails['start_date']));
			}

			if (isset($lessonDetails['end_date']) && !empty($lessonDetails['end_date']) && $lessonDetails['end_date'] != "0000-00-00") {
				$lessonDetails['end_date'] = str_replace("/", "-", $lessonDetails['end_date']);
				$lessonDetails['end_date'] = date("Y-m-d", strtotime($lessonDetails['end_date']));
			}

			// print_r($method);exit();
			if ($method == "PUT") {
				$iticode = $lessonDetails['lesson_id'];
				$lessonDetails['created_by'] = $this->input->post('SadminID');
				$lessonDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('course_lessons', $lessonDetails);
				if (!$iscreated) {

					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$mediaf = array();
					$lastLessonID = $this->db->insert_id();
					$course_id = $lessonDetails['course_id'];
					$mediaf['course_id'] = $course_id;
					$lessonID['lesson_id'] = $lastLessonID; 
					$section_id = $lessonDetails['section_id'];
					$mediaArr = $this->input->post('mediaArr');
					// print_r($mediaArr);
					foreach ($mediaArr as $media) {
						$mediaf['file_name'] = $media;
						$iscreated = $this->CommonModel->updateMasterDetails('course_media', $lessonID, $mediaf);
					}
					$this->renameFolder($lastLessonID,$course_id,$section_id);

					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('lesson_id' => $lesson_id);
				if (!isset($lesson_id) || empty($lesson_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$lessonDetails['modified_by'] = $this->input->post('SadminID');
				$lessonDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('course_lessons', $lessonDetails, $where);
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
				$lessonDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('course_lessons', $where);
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

			$where = array("lesson_id" => $lesson_id);
			//print_r($where);
			$lessonDetails = $this->CommonModel->getMasterDetails('course_lessons', '', $where);
			if (isset($lessonDetails) && !empty($lessonDetails)) {

				$status['data'] = $lessonDetails;
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

	public function courseMediaUpload($course = '', $section='',$lesson = '')
	{
		// print($lesson);exit;
		// print($dirRoot."  ".$pathTOSave);
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$extraData = array();
		//$mediapatharr = $this->config->item("adminmediaPATH");
		$mediapatharr = $this->config->item("mediaPATH") ."course/". $course . "/".$section.'/';
		
		if (!empty($lesson) && $lesson != 0){
			$mediapatharr = $mediapatharr . $lesson;
			$extraData['lesson_id']= $lesson;
			// print_r($extraData['lesson_id']);
		}
		else
		$mediapatharr = $this->config->item("mediaPATH") ."course/". $course . "/".$section.'/temp-'.$course.'-'.$section;

			if (!is_dir($mediapatharr)) {
			// The directory doesn't exist, so create it
			if (mkdir($mediapatharr, 0777, true)) {
				// echo "Directory created successfully: $mediapatharr";
			} else {
				//echo "Failed to create directory: $mediapatharr";
				$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} //else {
		// 	echo "Directory already exists: $mediapatharr";
		// }
		// exit;
		// if (!empty($pathTOSave) && $pathTOSave != 0) {
		// 	// get folder name from tabel
		// 	$dirname = $this->CommonModel->getMasterDetails("media", "*", array("media_id" => $pathTOSave));
		// 	//print_r($dirname); exit;
		// 	if (empty($dirname)) {
		// 		$status['msg'] = $this->systemmsg->getErrorCode(273);
		// 		$status['statusCode'] = 227;
		// 		$status['flag'] = 'F';
		// 		$this->response->output($status, 200);
		// 	} else {
		// 		$extraData["folder_id"] = $pathTOSave;
		// 		$pathTOSave = $mediapatharr . "/" . $dirname[0]->media_key;
		// 	}
		// } else {
		// 	$pathTOSave = $mediapatharr;
		// }
		// $extraData["folder_id"] = $pathTOSave;

		// print_r($mediapatharr);exit;
		$extraData["course_id"] = $course;

		// print_r($extraData);exit;
		// $extraData["media_value"] = $dirRoot;
		$this->load->library('realtimeupload');
		if (!is_dir($mediapatharr)) {
			mkdir($mediapatharr, 0777);
			chmod($mediapatharr, 0777);
		} else {
			if (!is_writable($mediapatharr)) {
				chmod($mediapatharr, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'course_media',
			'fileTypeColumn' => 'file_type',
			'fileColumn' => 'file_name',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		// print_r($settings);exit;
		$this->realtimeupload->init($settings);
	}

	public function readCourseFiles()
	{
		// print("here");exit;
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$course_id = $this->input->post('course_id');
		$lesson_id = $this->input->post('lesson_id');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if (isset($course_id) && !empty($course_id)) {
			$wherec["course_id"] = '= ' . $course_id . '';
		} else {
			$wherec["course_id"] = "IS NULL";
		}
		if (isset($lesson_id) && !empty($lesson_id)) {
			$wherec["lesson_id"] = '= ' . $lesson_id . '';
		} else {
			$wherec["lesson_id"] = "IS NULL";
		}

		$config["base_url"] = base_url() . "courseFiles";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('media_id', 'course_media', $wherec);
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
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'course_media', $wherec, '', '', $join, $other);
		} 
		else {
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'course_media', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $mediaDetails;
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
		if ($mediaDetails) {
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
	

	public function renameFolder($lesson_id ='',$course_id='',$section_id='')
	{
		// print('Here');
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$oldName = $this->config->item("mediaPATH") ."course/".$course_id."/".$section_id."/temp-".$course_id."-".$section_id;
		$newName = $this->config->item("mediaPATH") ."course/".$course_id."/".$section_id."/".$lesson_id;
		if (!is_dir($oldName)) {
			// echo "Directory doesnt exist " .$oldName;
		}else 
		{
			$is_renamed = rename($oldName,$newName);
		}
	}

	public function videoUpload($course = '', $section='',$lesson = '')
	{
		// print($lesson);exit;
		// print($dirRoot."  ".$pathTOSave);
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$extraData = array();
		//$mediapatharr = $this->config->item("adminmediaPATH");
		$mediapatharr = $this->config->item("mediaPATH") ."course/". $course . "/".$section.'/';
		
		if (!empty($lesson) && $lesson != 0){
			$mediapatharr = $mediapatharr . $lesson;
			$extraData['lesson_id']= $lesson;
			// print_r($extraData['lesson_id']);
		}
		else
		$mediapatharr = $this->config->item("mediaPATH") ."course/". $course . "/".$section.'/temp-'.$course.'-'.$section;

			if (!is_dir($mediapatharr)) {
			// The directory doesn't exist, so create it
			if (mkdir($mediapatharr, 0777, true)) {
				// echo "Directory created successfully: $mediapatharr";
			} else {
				//echo "Failed to create directory: $mediapatharr";
				$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} //else {
		// 	echo "Directory already exists: $mediapatharr";
		// }
		// exit;
		// if (!empty($pathTOSave) && $pathTOSave != 0) {
		// 	// get folder name from tabel
		// 	$dirname = $this->CommonModel->getMasterDetails("media", "*", array("media_id" => $pathTOSave));
		// 	//print_r($dirname); exit;
		// 	if (empty($dirname)) {
		// 		$status['msg'] = $this->systemmsg->getErrorCode(273);
		// 		$status['statusCode'] = 227;
		// 		$status['flag'] = 'F';
		// 		$this->response->output($status, 200);
		// 	} else {
		// 		$extraData["folder_id"] = $pathTOSave;
		// 		$pathTOSave = $mediapatharr . "/" . $dirname[0]->media_key;
		// 	}
		// } else {
		// 	$pathTOSave = $mediapatharr;
		// }
		// $extraData["folder_id"] = $pathTOSave;

		// print_r($mediapatharr);exit;
		$extraData["course_id"] = $course;

		// print_r($extraData);exit;
		// $extraData["media_value"] = $dirRoot;
		$this->load->library('realtimeupload');
		if (!is_dir($mediapatharr)) {
			mkdir($mediapatharr, 0777);
			chmod($mediapatharr, 0777);
		} else {
			if (!is_writable($mediapatharr)) {
				chmod($mediapatharr, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'course_lessons',
			'fileTypeColumn' => '',
			'fileColumn' => 'course_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "N",
			'extraData' => $extraData,
		);
		// print_r($settings);exit;
		
		$this->realtimeupload->init($settings);
	}
	public function multiplecourseChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['course_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('courses', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('courses', $action, $ids, 'course_id');
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
