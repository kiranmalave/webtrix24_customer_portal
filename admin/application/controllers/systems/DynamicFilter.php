<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DynamicFilter extends CI_Controller
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
	public function filterMasterList(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');	
		$selectC = $this->input->post('select');	
		$statuscode = $this->input->post('status');
		$menu_id = $this->input->post('menu_id');		
		$user_id = $this->input->post('SadminID');	
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "filter_id";
			$order = "DESC";
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
		if (isset($menu_id) && !empty($menu_id)) {
			$wherec["t.menu_id"] = 'IN ("' . $menu_id . '")';
		}
		$config["base_url"] = base_url() . "filterList";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('filter_id', "filter_data", $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if (isset($user_id) && !empty($user_id)) {
			$wherec["t.visibility ="] = '"public"';
		}
		if ($isAll == "Y") {
			$filterDetails1 = $this->CommonModel->GetMasterListDetails($selectC, 'filter_data', $wherec, '', '', $join, $other);
		} else {
			$filterDetails1 = $this->CommonModel->GetMasterListDetails($selectC, 'filter_data', $wherec, $config["per_page"], $page, $join, $other);
		}
		if (isset($user_id) && !empty($user_id)) {
			$wherec["t.user_id"] = 'IN ("' . $user_id . '")';
			$wherec["t.visibility ="] = '"private"';
		}
		if ($isAll == "Y") {
			$filterDetails2 = $this->CommonModel->GetMasterListDetails($selectC, 'filter_data', $wherec, '', '', $join, $other);
		} else {
			$filterDetails2 = $this->CommonModel->GetMasterListDetails($selectC, 'filter_data', $wherec, $config["per_page"], $page, $join, $other);
		}
		$filterDetails = array_merge($filterDetails2,$filterDetails1);
		$status['data'] = $filterDetails;
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
		if ($filterDetails) {
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

	public function filterMaster($filter_id = ""){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$productDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$filterDetails['filter_name'] = $this->validatedata->validate('filter_name', 'Filter Name', true, '', array());
			$filterDetails['conditions'] = $this->validatedata->validate('conditions', 'Conditions', true, '', array());
			$filterDetails['user_id'] = $this->input->post('SadminID');
			$filterDetails['menu_id'] = $this->validatedata->validate('menu_id', 'Menu ID', true, '', array());
			$filterDetails['visibility'] = $this->validatedata->validate('visibility', 'Filter Visibility', true, '', array());
			$where2 = array("filter_name" => $filterDetails['filter_name']);
			$al_fitler = $this->CommonModel->getMasterDetails('filter_data', 'filter_id', $where2);
			if ($method == "PUT") {	
				if (isset($al_fitler) && !empty($al_fitler)) {
					$status['msg'] = $this->systemmsg->getErrorCode(331);
					$status['statusCode'] = 331;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$filterDetails['created_by'] = $this->input->post('SadminID');
				$filterDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('filter_data', $filterDetails);
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
					$status['filter_id'] = $this->db->insert_id();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				if (isset($al_fitler) && !empty($al_fitler)) {
					if (isset($filter_id) && !empty($filter_id) ) {
						if ($al_fitler[0]->filter_id != $filter_id) {
							$status['msg'] = $this->systemmsg->getErrorCode(331);
							$status['statusCode'] = 331;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
				}
				$where['filter_id'] = $filter_id;
				$filterDetails['modified_by'] = $this->input->post('SadminID');
				$filterDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('filter_data', $filterDetails, $where);
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
				$iscreated = $this->CommonModel->deleteMasterDetails('filter_data', $where);
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
			$where = array("filter_id" => $filter_id);
			$filterDetails = $this->CommonModel->getMasterDetails('filter_data', '', $where);
			if (isset($filterDetails) && !empty($filterDetails)) {
				$status['data'] = $filterDetails;
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
	public function filterChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('filter_data', $statusCode, $ids,'filter_id');	
			if ($changestatus) {
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}	
	public function deleteFilter(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$filter_id = $this->input->post("filter_id");
		$deleteFilter = $this->CommonModel->deleteMasterDetails('filter_data',array('filter_id'=>$filter_id));	
		if ($deleteFilter) {
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
	public function setDefaultFilter(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		// UNSET DEFAULT FILTER BEFORE
		$whereunset = array();
		$user_id = $this->validatedata->validate('SadminID', 'User ID', true, '', array());
		$isDefault = $this->validatedata->validate('isDefault', 'Select Default', true, '', array());
		$menu_id = $this->validatedata->validate('menu_id', 'Menu ID', true, '', array());
		$filterDetails['is_default'] = 'no';
		$unsetDefault = $this->CommonModel->updateMasterDetails('filter_data', $filterDetails,array('user_id'=>$user_id,'menu_id'=>$menu_id,'is_default'=>'yes'));
		if (isset($unsetDefault) && !empty($unsetDefault)) {
			// SET DEFAULT FILTER AFTER
			$filter_id = $this->input->post("filter_id");
			$filterDetails['is_default'] = $isDefault;
			$setDefault = $this->CommonModel->updateMasterDetails('filter_data', $filterDetails,array('filter_id'=>$filter_id));
			if ($setDefault) {
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function getJoinedValues(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$tableName = $this->input->post('joinedTable');
		if (!isset($tableName) && empty($tableName)) {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(282);
			$status['statusCode'] = 282;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$fields = $this->db->list_fields($tableName);
		// print_r($fields);exit;
		$select = $this->input->post('select');
		$slug = $this->input->post('slug');
		$company_id = $this->company_id;
		$wherec = array();
		if (in_array('status',$fields)) {
			$wherec["t.status"] = 'IN ("active")';
		}
		
		if (isset($slug) && !empty($slug)) {
			$category = $this->CommonModel->getCategoryBySlug($slug);
			if (isset($category) && !empty($category)) {
				$wherec['parent_id'] = '='.$category[0]->category_id;
			}
		}
		
		$updateAns = $this->CommonModel->GetMasterListDetails($select, $tableName, $wherec);
		// print $this->db->last_query();exit;
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
		
	}		

	public function getDefaultFilter(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$whereunset = array();
		$user_id = $this->validatedata->validate('SadminID', 'User ID', true, '', array());
		$menu_id = $this->validatedata->validate('menu_id', 'Menu ID', true, '', array());
		$getDefaultFilter = $this->CommonModel->getMasterDetails('filter_data','',array('user_id'=>$user_id,'menu_id'=>$menu_id,'is_default'=>'yes'));
		if (isset($getDefaultFilter) && !empty($getDefaultFilter)) {
			$status['data'] = $getDefaultFilter;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}		
}