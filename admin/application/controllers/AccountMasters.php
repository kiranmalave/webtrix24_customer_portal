<?php
defined('BASEPATH') or exit('No direct script access allowed');

class AccountMasters extends CI_Controller
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
		$this->load->model('AccCommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
	}

	public function getAccGroupDetails()
	{
		//$this->load->view('welcome_message');
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');


		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "accGroupName";
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


		$config["base_url"] = base_url() . "AccGroupDetails";
		$config["total_rows"] = $this->AccCommonModel->getCountByParameter('accGroupID', 'accountGroups', $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		$isAll = $this->input->post('getAll');
		if ($isAll == "Y") {
			$accGroupDetails = $this->AccCommonModel->GetMasterListDetails($selectC = '', 'accountGroups', $wherec, '', '', $join, $other);
		} else {
			$accGroupDetails = $this->AccCommonModel->GetMasterListDetails($selectC = '', 'accountGroups', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $accGroupDetails;
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
		if ($accGroupDetails) {
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

	public function accGroup($id = '')
	{

		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		if ($method === "PUT" || $method === "POST") {
			$accGroupDetails = array();

			$updateDate = date("Y/m/d H:i:s");
			$accGroupDetails['accGroupName'] = $this->validatedata->validate('accGroupName', 'accGroupName', true, '', array());
			$accGroupDetails['subGroupYesNo'] = $this->validatedata->validate('subGroupYesNo', 'subGroupYesNo', true, '', array());
			//$accGroupDetails['mainGroupID'] = $this->validatedata->validate('mainGroupID','mainGroupID',false,'',array());
			$accGroupDetails['scheduleNo'] = $this->validatedata->validate('scheduleNo', 'scheduleNo', false, '', array());



			$wherec = array("accGroupID" => $id);
			//print_r($wherec);
			$accGroupData = $this->AccCommonModel->getMasterDetails('accountGroups', '', $wherec);

			if (isset($accGroupData) && !empty($accGroupData)) {
				$accGroupDetails['modified_date'] = $updateDate;
				$accGroupDetails['modified_by'] = $this->input->post('SadminID');
				//$CommercialDetails['modified_by'] = $updateDate;
				$isinsert = $this->AccCommonModel->updateMasterDetails('accountGroups', $accGroupDetails, $wherec);
				if (!$isinsert) {
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
			} else {
				$projectDetails['status'] = "active";
				$accGroupDetails['created_by'] = $this->input->post('SadminID');
				$accGroupDetails['created_date'] = $updateDate;
				$accGroupDetails['modified_date'] = '0';
				$isinsert = $this->AccCommonModel->saveMasterDetails('accountGroups', $accGroupDetails);
				if (!$isinsert) {

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
		} else {
			$where = array("accGroupID" => $id);
			$accGroupHistory = $this->AccCommonModel->getMasterDetails('accountGroups', '', $where);
			if (isset($accGroupHistory) && !empty($accGroupHistory)) {

				$status['data'] = $accGroupHistory;
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
	public function accGroupChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->AccCommonModel->changeMasterStatus('accountGroups', $statusCode, $ids, 'accGroupID');

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
	public function getLedgerAccDetails()
	{
		//$this->load->view('welcome_message');
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');


		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "accName";
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


		$config["base_url"] = base_url() . "LedgerAccDetails";
		$config["total_rows"] = $this->AccCommonModel->getCountByParameter('ledgerAccID', 'ledgerAccount', $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		$isAll = $this->input->post('getAll');
		if ($isAll == "Y") {
			$ledgerAccDetails = $this->AccCommonModel->GetMasterListDetails($selectC = '', 'ledgerAccount', $wherec, '', '', $join, $other);
		} else {
			$ledgerAccDetails = $this->AccCommonModel->GetMasterListDetails($selectC = '', 'ledgerAccount', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $ledgerAccDetails;
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
		if ($ledgerAccDetails) {
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

	public function ledgerAcc($id = '')
	{

		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		if ($method === "PUT" || $method === "POST") {
			$ledgerAccDetails = array();

			$updateDate = date("Y/m/d H:i:s");
			$ledgerAccDetails['accName'] = $this->validatedata->validate('accName', 'accName', true, '', array());
			$ledgerAccDetails['accGroupID'] = $this->validatedata->validate('accGroupID', 'accGroupName', true, '', array());

			$wherec = array("ledgerAccID" => $id);

			$ledgerAccData = $this->AccCommonModel->getMasterDetails('ledgerAccount', '', $wherec);

			if (isset($ledgerAccData) && !empty($ledgerAccData)) {
				$ledgerAccDetails['modified_date'] = $updateDate;
				$ledgerAccDetails['modified_by'] = $this->input->post('SadminID');
				//$CommercialDetails['modified_by'] = $updateDate;
				$isinsert = $this->AccCommonModel->updateMasterDetails('ledgerAccount', $ledgerAccDetails, $wherec);
				if (!$isinsert) {
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
			} else {
				$projectDetails['status'] = "active";
				$ledgerAccDetails['created_by'] = $this->input->post('SadminID');
				$ledgerAccDetails['created_date'] = $updateDate;
				$ledgerAccDetails['modified_date'] = '0';
				$isinsert = $this->AccCommonModel->saveMasterDetails('ledgerAccount', $ledgerAccDetails);
				if (!$isinsert) {

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
		} else {
			$where = array("ledgerAccID" => $id);
			$ledgerAccHistory = $this->AccCommonModel->getMasterDetails('ledgerAccount', '', $where);
			if (isset($ledgerAccHistory) && !empty($ledgerAccHistory)) {

				$status['data'] = $ledgerAccHistory;
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
	public function ledgerAccChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->AccCommonModel->changeMasterStatus('ledgerAccount', $statusCode, $ids, 'ledgerAccID');

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
