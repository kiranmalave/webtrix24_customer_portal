<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Accounts extends CI_Controller
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


	public function accountMasterList()
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
		$fetchFrom = $this->input->post('fetchFrom');
		$wherec = $join = array();
		$selectC = '';
		$other = array("orderBy" => $orderBy, "order" => $order);
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
		if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
			$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			$columnNames = [
				// MANDATORY FOR ALL MODULES
				"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
				"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
				"company_id" => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
				// CUSTOM FOR ALL MODULES
				"account_type" => ["table" => "categories", "alias" => "cn", "column" => "categoryName", "key2" => "category_id"],
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
			$selectC = ltrim($selectC, ',');
		}
	}
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "account_id";
			$order = "DESC";
		}
		$config = $this->config->item('pagination');
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			// $wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		// if (isset($fetchFrom) && !empty($fetchFrom)) {
		// 	if ($fetchFrom == 'Y') {
		// 		$wherec["t.company_id = "] = $this->company_id ;
		// 	}
		// }
		// print_r($wherec);exit;
		$config["base_url"] = base_url() . "accountsDetailsList";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('account_id', "accounts", $wherec,$other,$join);
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
			$accountDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*', 'accounts', $wherec, '', '', $join, $other);
		} else {
			$accountDetails = $this->CommonModel->GetMasterListDetails($selectC, 'accounts', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $accountDetails;
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
		if ($accountDetails) {
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

	public function accountMaster($account_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$accountDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$accountDetails['name'] = $this->validatedata->validate('name', 'Account Name', true, '', array());
			$accountDetails['account_type'] = $this->validatedata->validate('account_type', 'Account Type', true, '', array());
			$accountDetails['currency'] = $this->validatedata->validate('currency', 'Currency', true, '', array());
			$accountDetails['record_acc_balance'] = $this->validatedata->validate('record_acc_balance', 'Record Account Balance', false, '', array());
			$accountDetails['opening_bal'] = $this->validatedata->validate('opening_bal', 'Opening Balance', false, '', array());
			$accountDetails['opening_balance_date'] = $this->validatedata->validate('opening_balance_date', 'Opening Balance Date', false, '', array());
			$accountDetails['company_id'] = $this->validatedata->validate('company_id', 'Company Name', false, '', array());
			
			if(isset($accountDetails['opening_balance_date']) && !empty($accountDetails['opening_balance_date']) && $accountDetails['opening_balance_date'] !="0000-00-00"){
				$accountDetails['opening_balance_date'] = str_replace("-","-",$accountDetails['opening_balance_date']);
				$accountDetails['opening_balance_date'] = date("Y-m-d",strtotime($accountDetails['opening_balance_date']));
			}else{
				$accountDetails['opening_balance_date'] = null;
			}

			$fieldData = $this->datatables->mapDynamicFeilds("accounts",$this->input->post());
			$accountDetails = array_merge($fieldData, $accountDetails);
			if ($method == "PUT") {					
				$accountDetails['created_by'] = $this->input->post('SadminID');
				$accountDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('accounts', $accountDetails);
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
				$where = array('account_id' => $account_id);
				if (!isset($account_id) || empty($account_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$accountDetails['modified_by'] = $this->input->post('SadminID');
				$accountDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('accounts', $accountDetails, $where);
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
				$accountDetails = array();
				$where = array('account_id' => $account_id);
				if (!isset($account_id) || empty($account_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->deleteMasterDetails('accounts', $where);
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
			$where = array("account_id" => $account_id);
			$accountDetails = $this->CommonModel->getMasterDetails('accounts', '', $where);
			if (isset($accountDetails) && !empty($accountDetails)) {
				$status['data'] = $accountDetails;
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
	public function accountChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$whereIn ['account_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('accounts', '',$whereIn);
			// $changestatus = $this->CommonModel->changeMasterStatus('accounts', $statusCode, $ids,'account_id');	
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
	
	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['account_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('accounts', '',$whereIn);
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

	public function multipleaccountChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "active" || trim($action) == "inactive") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$menuId = $this->input->post("menuId");
			$changestatus = $this->CommonModel->changeMasterStatus('accounts', $action, $ids, 'account_id');
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