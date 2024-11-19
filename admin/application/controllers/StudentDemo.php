<?php
defined('BASEPATH') or exit('No direct script access allowed');

class StudentDemo extends CI_Controller
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


	public function getstudentDemoDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('stud_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('stud_name');
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
			if($selectC !=""){
				$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			}else{
				$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			}
		}
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "stud_name";
			$order ="ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);

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
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$config["base_url"] = base_url() . "studentDemoDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.stud_id', 'pratham', $wherec, $other);
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
			$studentDemoDetails = $this->CommonModel->GetMasterListDetails($selectC="stud_id,stud_name,mobile_no,whatsapp_no,gender,birth_date,faculty,project_name,product_name,created_date,created_by,modified_by,modified_date",'pratham',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.stud_id,t.stud_name,t.created_date,t.modified_date,".$selectC;
			$studentDemoDetails = $this->CommonModel->GetMasterListDetails($selectC, 'pratham', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $studentDemoDetails;
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
		if ($studentDemoDetails) {
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

	public function studentDemoMaster($stud_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
	    // print_r($stud_id);exit;
		if ($method == "POST" || $method == "PUT") {
			$studentDemoDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$studentDemoDetails['stud_id'] = $this->validatedata->validate('stud_id', 'stud_id', false, '', array());
			$studentDemoDetails['stud_name'] = $this->validatedata->validate('stud_name', 'Student Name', true, '', array());
			$studentDemoDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile Number', false, '', array());
			$studentDemoDetails['whatsapp_no'] = $this->validatedata->validate('whatsapp_no', 'Whatsapp Number', false, '', array());
			$studentDemoDetails['gender'] = $this->validatedata->validate('gender', 'Gender', false, '', array());
			$studentDemoDetails['birth_date'] = $this->validatedata->validate('birth_date', 'Birth Date', false, '', array());
			$studentDemoDetails['faculty'] = $this->validatedata->validate('faculty', 'Faculty', false, '', array());
			$studentDemoDetails['project_name'] = $this->validatedata->validate('project_name', 'Project Name', false, '', array());
			$studentDemoDetails['product_name'] = $this->validatedata->validate('product_name', 'Product Name', false, '', array());
			$studentDemoDetails['created_date'] = $this->validatedata->validate('created_date', 'Created Date', false, '', array());
			$studentDemoDetails['created_by'] = $this->validatedata->validate('created_by', 'Created By', false, '', array());
			$studentDemoDetails['modified_by'] = $this->validatedata->validate('modified_by', 'Modified By', false, '', array());
			$studentDemoDetails['modified_date'] = $this->validatedata->validate('modified_date', 'Modified Date', false, '', array());
			$studentDemoDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			$studentDemoDetails['file'] = $this->validatedata->validate('file', 'Attachment', false, array());

		    //print_r($studentDemoDetails);exit();
			$fieldData = $this->datatables->mapDynamicFeilds("pratham",$this->input->post());
			$studentDemoDetails = array_merge($fieldData, $studentDemoDetails);
			//prathamesh Added
			if (isset($studentDemoDetails['birth_date']) && !empty($studentDemoDetails['birth_date']) && $studentDemoDetails['birth_date'] != "0000-00-00") {
				$studentDemoDetails['birth_date'] = str_replace("/", "-", $studentDemoDetails['birth_date']);
				$studentDemoDetails['birth_date'] = date("Y-m-d", strtotime($studentDemoDetails['birth_date']));
			}else{
				$studentDemoDetails['birth_date'] = '';
			}
			//prathamesh Added end
			if ($method == "PUT") {
				$studentDemoDetails['stud_id'] = $stud_id;
				$studentDemoDetails['status'] = "active";
				$studentDemoDetails['created_by'] = $this->input->post('SadminID');
				$studentDemoDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('pratham', $studentDemoDetails);
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
				$where = array('stud_id' => $stud_id);
				if (!isset($stud_id) || empty($stud_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$studentDemoDetails['modified_by'] = $this->input->post('SadminID');
				$studentDemoDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('pratham', $studentDemoDetails, $where);
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
				$studentDemoDetails = array();
				$where = array('sID' => $stud_id);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('pratham', $where);
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
			if($stud_id ==""){
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
			$wherec["t.stud_id"] = "=".$stud_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$studentDemoDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
			if (isset($studentDemoDetails) && !empty($studentDemoDetails)) {

				$status['data'] = $studentDemoDetails;
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

	public function studentDemoChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$whereIn ['stud_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('pratham', '',$whereIn);
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
