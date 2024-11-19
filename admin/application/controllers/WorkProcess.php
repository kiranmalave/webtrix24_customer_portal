<?php
defined('BASEPATH') or exit('No direct script access allowed');

class WorkProcess extends CI_Controller
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


	public function WorkProcessMasterList()
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
		$this->menuID = $this->input->post('menuId');
		$join = array();
		
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
				$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			}else{
				$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			}
		}
		
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "work_order_id";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		$config["base_url"] = base_url() . "processDetailsList";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('work_order_id', "workorder_process", $wherec);
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
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*', 'workorder_process', $wherec, '', '', $join, $other);
		} else {
			// $jkey = (count($join)+1);
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="admin";
			// $join[$jkey]['alias'] ="am";
			// $join[$jkey]['key1'] ="assign_supervisor";
			// $join[$jkey]['key2'] ="adminID";
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*, am.name AS supervisorName', 'workorder_process', $wherec, $config["per_page"], $page, $join, $other);
		}
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

	public function WorkProcessMaster($process_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
	
		if ($method == "POST" || $method == "PUT") {
			$workDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$workDetails['process_title'] = $this->validatedata->validate('customer_name', 'customer_name', true, '', array());
			$workDetails['start_time'] = $this->validatedata->validate('material_availability', 'material_availability', false, '', array());
			$workDetails['end_time'] = $this->validatedata->validate('material_availability', 'material_availability', false, '', array());
			$workDetails['work_order_id'] = $this->validatedata->validate('available_material_date', 'available_material_date', false, '', array());
			$workDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());			
			
			// print_r($workDetails);exit;
			$fieldData = $this->datatables->mapDynamicFeilds("workorder_process",$this->input->post());
			$workDetails = array_merge($fieldData, $workDetails);
						
			if ($method == "PUT") {	
				
				$workDetails['created_by'] = $this->input->post('SadminID');
				$workDetails['created_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->saveMasterDetails('workorder_process', $workDetails);
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
				$where = array('work_order_id' => $work_id);
				if (!isset($work_id) || empty($work_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$workDetails['modified_by'] = $this->input->post('SadminID');
				$workDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('workorder_process', $workDetails, $where);
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
				$workDetails = array();
				$where = array('process_id' => $process_id);
				if (!isset($process_id) || empty($process_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('workorder_process', $where);
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

			$where = array("process_id" => $work_id);
			$workDetails = $this->CommonModel->getMasterDetails('workorder_process', '', $where);
			if (isset($workDetails) && !empty($workDetails)) {
				$status['data'] = $workDetails;
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
	
	public function WorkProcessChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('workorder_process', $statusCode, $ids,'process_id');	
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