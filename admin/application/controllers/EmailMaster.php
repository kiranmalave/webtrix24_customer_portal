<?php
defined('BASEPATH') or exit('No direct script access allowed');

class EmailMaster extends CI_Controller
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

	public function getEmailDetailsList()
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
		$isSystem = $this->input->post('is_sys_temp');
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
			// print_r($whereData);exit;
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];

			// // create join for created by and modified data details
			// $jkey = (count($join)+1);
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="admin";
			// $join[$jkey]['alias'] ="ad";
			// $join[$jkey]['key1'] ="created_by";
			// $join[$jkey]['key2'] ="adminID";
			// $jkey = (count($join)+1);
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="admin";
			// $join[$jkey]['alias'] ="am";
			// $join[$jkey]['key1'] ="modified_by";
			// $join[$jkey]['key2'] ="adminID";
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
				// print_r($join);exit;
			}
			// if($selectC !=""){
			// 	$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			// }else{
			// 	$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			// }
		}

		// echo $statuscode;exit();
		
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "tempID";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy" => $orderBy, "order" => $order);

		// $wherec = $join = array();
		// if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'" . $textval . "%'";
		// }

		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["status"] = 'IN ("' . $statusStr . '")';
		// }
		// print_r($wherec);exit();
		if ($isAll == "Y") {
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
			
			$wherec["t.is_sys_temp ="] = "'no'";
		}

		$config["base_url"] = base_url() . "email_master";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.tempID', "email_master", $wherec);
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
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC="tempID,tempName,emailContent,smsContent",'email_master',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.tempName,t.subjectOfEmail,t.emailContent,t.created_date,".$selectC;
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'email_master', $wherec, $config["per_page"], $page, $join, $other);
		}

		// if ($isAll == "Y") {
		// 	$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'email_master', $wherec, '', '', $join, $other);
		// } else {
		// 	$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'email_master', $wherec, $config["per_page"], $page, $join, $other);
		// }
		// print $this->db->last_query();exit;
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
	public function emailMasterData($id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$emailMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT" || $method == "POST") {

			$emailMasterDetails['tempName'] = $this->validatedata->validate('tempName', 'Temp Name', true, '', array());

			$emailMasterDetails['readName'] = $this->validatedata->validate('readName', 'Email Name', false, '', array());

			$emailMasterDetails['emailContent'] = $this->validatedata->validate('emailContent', 'Email Content', false, '', array());

			$emailMasterDetails['smsContent'] = $this->validatedata->validate('smsContent', 'SMS Content', true, '', array());

			$emailMasterDetails['subjectOfEmail'] = $this->validatedata->validate('subjectOfEmail', 'Subject Of Email', false, '', array());

			$emailMasterDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			// print_r($this->input->post());exit();
			$fieldData = $this->datatables->mapDynamicFeilds("emailMaster",$this->input->post());
			// print_r($fieldData);exit();
			$emailMasterDetails = array_merge($fieldData, $emailMasterDetails);

			// print_r($emailMasterDetails);exit();
			if ($method == "PUT") {
				$emailMasterDetails['tempUniqueID'] = "temp_" . rand(0, 9999);
				$emailMasterDetails['created_by'] = $this->input->post('SadminID');
				$emailMasterDetails['created_date'] = $updateDate;
				$emailMasterDetails['modified_date'] = '0';

				$iscreated = $this->CommonModel->saveMasterDetails('email_master', $emailMasterDetails);
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

			if ($method == "POST") {
				$where = array('tempID' => $id);
				if (!isset($id) || empty($id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}


				$emailMasterDetails['modified_by'] = $this->input->post('SadminID');
				$emailMasterDetails['modified_date'] = $updateDate;

				$iscreated = $this->CommonModel->updateMasterDetails('email_master', $emailMasterDetails, $where);
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
		} else if ($method == "DELETE") {
			$emailMasterDetails = array();

			$where = array('tempID' => $id);
			if (!isset($id) || empty($id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('email_master', $where);
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

			if($id ==""){
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
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			
			$other = array();
			$wherec["t.tempID"] = "=".$id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$emailMasterDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			// print $this->db->last_query();exit;
			// $where = array("tempID" => $id);
			// $emailMasterDetails = $this->CommonModel->getMasterDetails('email_master', '', $where);
			if (isset($emailMasterDetails) && !empty($emailMasterDetails)) {

				$status['data'] = $emailMasterDetails;
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
	public function emailMasterDataChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('email_master', $statusCode, $ids, 'tempID');

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

	public function multipleemailChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['tempID']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('email_master', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('email_master', $action, $ids, 'tempID');
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
