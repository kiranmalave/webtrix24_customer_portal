<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DynamicForms extends CI_Controller
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
	}


	public function getFieldDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('form_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "form_name";
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

		$config["base_url"] = base_url() . "formDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('form_id', 'forms', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}

		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="ac";
		$join[0]['key1'] ="created_by";
		$join[0]['key2'] ="adminID";
	
		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="admin";
		$join[1]['alias'] ="am";
		$join[1]['key1'] ="modified_by";
		$join[1]['key2'] ="adminID";

		if ($isAll == "Y") {
			$join = array();
			$formDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*,ac.name as created_by,am.name as modified_by', 'forms', $wherec, '', '', $join, $other);
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
			$formDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*,ac.name as created_by,am.name as modified_by', 'forms', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		$status['data'] = $formDetails;
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
		if ($formDetails) {
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

	public function DynamicForm($form_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if($method=="POST"||$method=="PUT")
		{
				$formDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$formDetails['form_id'] = $this->validatedata->validate('form_id','FormID',false,'',array());
				$formDetails['form_name'] = $this->validatedata->validate('form_name','Form Name',false,'',array());
				$formDetails['from_description'] = $this->validatedata->validate('from_description','Form Description',false,'',array());
				
			if ($method == "PUT") {
				$iticode = $formDetails['form_id'];
				$formDetails['status'] = "active";
				$formDetails['created_by'] = $this->input->post('SadminID');
				$formDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('forms', $formDetails);
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
				$where = array('form_id' => $form_id);
				if (!isset($form_id) || empty($form_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$formDetails['modified_by'] = $this->input->post('SadminID');
				$formDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('forms', $formDetails, $where);
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
				$formDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('forms', $where);
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

			$where = array("form_id" => $form_id);
			$formDetails = $this->CommonModel->getMasterDetails('forms', '', $where);
			if (isset($formDetails) && !empty($formDetails)) {

				$status['data'] = $formDetails;
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

	public function DynamicFieldChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('forms', $statusCode, $ids, 'form_id');

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

	public function getFormFields()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$statuscode = $this->input->post('status');
		$formID = $this->input->post('form_id');

		$wherec = $join = array();

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($formID) && !empty($formID)) {
			$wherec["t.form_id ="] = $formID ;
		}

		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			$join = array();
			$fieldsDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'forms_fields', $wherec, '', '', $join, '');
		} else {
			$fieldsDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'forms_fields', $wherec, '', '',  $join, '');
		}
		
		$status['data'] = $fieldsDetails;
		if ($fieldsDetails) {
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

	public function DynamicQuestion($form_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if($method=="POST"||$method=="PUT")
		{
				$formDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$formDetails['form_id'] = $this->validatedata->validate('form_id','FormID',false,'',array());
				$formDetails['question'] = $this->validatedata->validate('question','Question Name',false,'',array());
				$formDetails['question_type'] = $this->validatedata->validate('question_type','Question Type',false,'',array());
				$formDetails['question_options'] = $this->validatedata->validate('question_options','Question Options',false,'',array());
				
			if ($method == "PUT") {
				$formDetails['status'] = "active";
				$formDetails['created_by'] = $this->input->post('SadminID');
				$formDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('forms_fields', $formDetails);
				$lastLessonID = $this->db->insert_id();
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['lastID'] = $lastLessonID;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('question_id' => $form_id);
				if (!isset($form_id) || empty($form_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$formDetails['modified_by'] = $this->input->post('SadminID');
				$formDetails['modified_date'] = $updateDate;
				// print(gettype($formDetails['question_options']));
				// print_r($formDetails);exit;
				$iscreated = $this->CommonModel->updateMasterDetails('forms_fields', $formDetails, $where);
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
				$formDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('forms_fields', $where);
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

			$where = array("form_id" => $form_id);
			$formDetails = $this->CommonModel->getMasterDetails('forms_fields', '', $where);
			if (isset($formDetails) && !empty($formDetails)) {

				$status['data'] = $formDetails;
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
}
