<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CampaignsMaster extends CI_Controller
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
	var $menuID="";
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		// $this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}

	public function getcampaignsDetails()
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
			// $wherec = $join = array();
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
				$selectC = ltrim($selectC, ',');
			}
		}

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "campaign_name";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		$adminID = $this->input->post('SadminID');
		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		$config["base_url"] = base_url() . "campaignsDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.campaign_id', 'campaigns', $wherec, $other,$join);
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
			$campaignsDetails = $this->CommonModel->GetMasterListDetails($selectC ="campaign_id,campaign_name",'campaigns', $wherec, '', '', $join, $other);
		} else {
			$selectC = "t.*,".$selectC;
			$campaignsDetails = $this->CommonModel->GetMasterListDetails($selectC, 'campaigns', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $campaignsDetails;
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
		if ($campaignsDetails) {
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

	public function campaignsMaster($campaign_id = ""){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$campaignsDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// print_r($_POST);exit;
			$campaignsDetails['campaign_name'] = $this->validatedata->validate('campaign_name', 'Campaign Name', true, '', array());
			// $campaignsDetails['campaign_type'] = $this->validatedata->validate('campaign_type', 'Type', true, '', array());
			$campaignsDetails['campaign_details'] = $this->validatedata->validate('campaign_detail', 'Campaign Details', false, '', array());
			$campaignsDetails['target_audience'] = $this->validatedata->validate('target_audience', 'Target Audience', true, '', array());			
			$campaignsDetails['start_date'] = $this->validatedata->validate('start_date', 'Start Date', true, '', array());
			$campaignsDetails['execution_period'] = $this->validatedata->validate('execution_period', 'Execution Period', true, '', array());
			$campaignsDetails['end_on'] = $this->validatedata->validate('end_on', 'End On', true, '', array());
			$campaignsDetails['specific_period_data'] = $this->validatedata->validate('specific_period_data', 'Specific Period Data', false, '', array());
			$campaignsDetails['target_table'] = $this->validatedata->validate('target_table', 'Target Table', false, '', array());
			$campaignsDetails['target_table_conditions'] = $this->validatedata->validate('target_table_conditions', 'Target Table Conditions', false, '', array());
			
			// print_r($campaignsDetails);exit;

			if (isset($campaignsDetails['last_send']) && !empty($campaignsDetails['last_send']) && $campaignsDetails['last_send'] != "0000-00-00") {
				$campaignsDetails['last_send'] = str_replace("/", "-", $campaignsDetails['last_send']);
				$campaignsDetails['last_send'] = date("Y-m-d", strtotime($campaignsDetails['last_send']));
			}
			
			$fieldData = $this->datatables->mapDynamicFeilds("campaign",$this->input->post());
			$campaignsDetails = array_merge($fieldData, $campaignsDetails);

			if ($method == "PUT") {
				$campaignsDetails['status'] = "active";
				$campaignsDetails['created_by'] = $this->input->post('SadminID');
				$campaignsDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('campaigns', $campaignsDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$last_id = $this->db->insert_id();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$status['lastID'] = $last_id;
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('campaign_id' => $campaign_id);
				if (!isset($campaign_id) || empty($campaign_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$campaignsDetails['modified_by'] = $this->input->post('SadminID');
				$campaignsDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('campaigns', $campaignsDetails, $where);
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
				$campaignsDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('campaigns', $where);
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
			if($campaign_id == ""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$wherec["t.campaign_id"] = "=".$campaign_id;
			$campaignsDetails = $this->CommonModel->GetMasterListDetails('t.*', 'campaigns', $wherec, '', '', array(), array());
			if (isset($campaignsDetails) && !empty($campaignsDetails)) {
				$status['data'] = $campaignsDetails;
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

	public function CampaignsChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('campaigns', $statusCode, $ids, 'campaign_id');

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


	public function multiplecampaignChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['campaign_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('campaigns', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('campaigns', $action, $ids, 'campaign_id');
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
