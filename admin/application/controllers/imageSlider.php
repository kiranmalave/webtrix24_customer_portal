<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ImageSlider extends CI_Controller
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
	public function getImageSliderDetails()
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
		}

		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "slider_id";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		// echo  $adminID;exit();

		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$config["base_url"] = base_url() . "imageSliderDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.slider_id', 'sliders', $wherec, $other);
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
			$sliderDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'sliders', $wherec, '', '', $join, $other);
		} else {

			// $selectC = "*";
			$sliderDetails = $this->CommonModel->GetMasterListDetails($selectC, 'sliders', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($companyDetails);exit;
		$status['data'] = $sliderDetails;
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
		if ($sliderDetails) {
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
	public function sliderMaster($slider_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$sliderDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$sliderDetails['slider_id'] = $this->validatedata->validate('slider_id', 'slider ID', false, '', array());
			$sliderDetails['title'] = $this->validatedata->validate('title', 'Name', false, '', array());
			// $sliderDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			$fieldData = $this->datatables->mapDynamicFeilds("sliders",$this->input->post());
			$sliderDetails = array_merge($fieldData, $sliderDetails);
			// print_r($method);exit();
			if ($method == "PUT") {
				// $iticode = $sliderDetails['slider_id'];
				// $sliderDetails['status'] = "active";
				$sliderDetails['created_by'] = $this->input->post('SadminID');
				$sliderDetails['created_date'] = $updateDate;
				$sliderDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('sliders', $sliderDetails);
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
				$where = array('slider_id' => $slider_id);
				if (!isset($slider_id) || empty($slider_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$sliderDetails['modified_by'] = $this->input->post('SadminID');
				$sliderDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('sliders', $sliderDetails, $where);
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
				$sliderDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('sliders', $where);
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
			if($slider_id ==""){
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
			$wherec["t.slider_id"] = "=".$slider_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$sliderDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
			
			if (isset($sliderDetails) && !empty($sliderDetails)) {

				$status['data'] = $sliderDetails;
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
	public function sliderChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('sliders', $statusCode, $ids, 'slider_id');

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
	public function sectionDetails($item_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$sectionDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$sectionDetails['item_id'] = $this->validatedata->validate('item_id', 'item ID', false, '', array());
			$sectionDetails['title'] = $this->validatedata->validate('title', 'title', false, '', array());
			$sectionDetails['slider_id'] = $this->validatedata->validate('slider_id', 'slider ID', false, '', array());
			$sectionDetails['description'] = $this->validatedata->validate('description', 'description ', false, '', array());
			$sectionDetails['position'] = $this->validatedata->validate('position', 'position', false, '', array());
			$sectionDetails['slider_data'] = json_encode($this->input->post('slider_data'));
			$sectionDetails['cover_image'] = $this->validatedata->validate('cover_image', 'Cover Image', false, '', array());
			$sectionDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			// print_r($method);exit();
			if ($method == "PUT") {
				$iticode = $sectionDetails['item_id'];
				$sectionDetails['created_by'] = $this->input->post('SadminID');
				$sectionDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('slider_items', $sectionDetails);
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
				$where = array('item_id' => $item_id);
				if (!isset($item_id) || empty($item_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$sectionDetails['modified_by'] = $this->input->post('SadminID');
				$sectionDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('slider_items', $sectionDetails, $where);
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

				$iscreated = $this->CommonModel->deleteMasterDetails('slider_items', $where);
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

			$where = array("item_id" => $item_id);
			$sectionDetails = $this->CommonModel->getMasterDetails('slider_items', '', $where);
			if (isset($sectionDetails) && !empty($sectionDetails)) {
				$sectionDetails[0]->slider_data = json_decode($sectionDetails[0]->slider_data);
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
	public function sliderSectionList()
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
		$slider_id = $this->input->post('slider_id');
		$wherec = $join = array();

		if(isset($slider_id) && !empty ($slider_id)){
			$slider_idStr = str_replace(",",'","',$slider_id);
			$wherec["t.slider_id"] = 'IN ("'.$slider_idStr.'")';
		}

		if(isset($statuscode) && !empty ($statuscode)){
			$statuscodeStr = str_replace(",",'","',$statuscode);
			$wherec["t.status"] = 'IN ("'.$statuscodeStr.'")';
		}

		$config = $this->config->item('pagination');
	
		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "slider_id";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		

		$config["base_url"] = base_url() . "imageSliderSectionDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.item_id', 'slider_items', $wherec, $other);
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
			$sliderSectionDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'slider_items', $wherec, '', '', $join, $other);
		} else {

			$sliderSectionDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'slider_items', $wherec, $config["per_page"], $page, $join, $other);
		}
		//print_r($sliderSectionDetails);exit;
		$status['data'] = $sliderSectionDetails;
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
		if ($sliderSectionDetails) {
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
	public function sliderSectionChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post('action');
		if (trim($action) == "delete") {
			$id = $this->input->post("item_id");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('slider_items', $statusCode, $id, 'item_id');
								// print $this->db->last_query();exit;
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
	public function multipleimagesliderChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['slider_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('sliders', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('sliders', $action, $ids, 'slider_id');
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
