<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Templates extends CI_Controller {

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

	public function getTemplateDetailsList()
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
		$module_name = $this->input->post('module_name');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
			$statusStr = str_replace(",",'","',$statuscode);
			$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}

		if(isset($module_name) && !empty($module_name)){
			// $wherec["t.module_name ="] = "'".$module_name."'";
			$moduleStr = str_replace(",",'","',$module_name);
			$wherec["t.module_name"] = 'IN ("'.$moduleStr.'")';
		}
		if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
			$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			$columnNames = [
				"company_id" => ["table" => "info_settings", "alias" => "dc", "column" => "companyName", "key2" => "infoID"],
				"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
				"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
				"module_name" => ["table" => "menu_master", "alias" => "mn", "column" => "menuName", "key2" => "menuID"],				
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

		$config["base_url"] = base_url() . "templateDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('temp_id',"dynamic_templates",$wherec,'',$join);
	    $config["uri_segment"] = 2;
	    $this->pagination->initialize($config);
	    if(isset($curPage) && !empty($curPage)){
		$curPage = $curPage;
		$page = $curPage * $config["per_page"];
		}
		else{
		$curPage = 0;
		$page = 0;
		}
		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*,ac.name as created_by,am.name as modified_by,mn.menuName as module_name','dynamic_templates',$wherec,'','',$join,$other);	
		}else{
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*,ac.name as created_by,am.name as modified_by,mn.menuName as module_name','dynamic_templates',$wherec,$config["per_page"],$page,$join,$other);	
		}
		// print_r($pagesDetails);exit;
		$status['data'] = $pagesDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if($curPage <=1)
		$status['paginginfo']["prevPage"] = 0;
		else
		$status['paginginfo']["prevPage"] = $curPage - 1 ;

		$status['paginginfo']["pageLimit"] = $config["per_page"] ;
		$status['paginginfo']["nextpage"] =  $curPage+1 ;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
		$status['loadstate'] = true;
		if($config["total_rows"] <= $status['paginginfo']["end"])
		{
		$status['msg'] = $this->systemmsg->getErrorCode(232);
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$status['loadstate'] = false;
		$this->response->output($status,200);
		}
		if($pagesDetails){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}				
	}

	public function templateData($temp_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$templateDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method == "POST"||$method == "PUT")
		{
            $templateDetails['temp_name'] = $this->validatedata->validate('temp_name','Template Name',false,'',array());
            $templateDetails['temp_image'] = $this->validatedata->validate('temp_image','Template Image',false,'',array());
            $templateDetails['module_name'] = $this->validatedata->validate('module_name','Module Name',false,'',array());
			$templateDetails['temp_code'] = htmlspecialchars($this->validatedata->validate('temp_code','Template Code',false,'',array()));
			$templateDetails['temp_content'] = htmlspecialchars($this->validatedata->validate('temp_content','Template Content',false,'',array()));
            $templateDetails['temp_css'] = $this->validatedata->validate('temp_css','Template Css',false,'',array());
			$templateDetails['css_for_temp'] = $this->validatedata->validate('css_for_temp','Template Css',false,'',array());

            if($method=="POST")
            {
				$where=array('temp_id'=>$temp_id);
				if(!isset($temp_id) || empty($temp_id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				$templateDetails['modified_by'] = $this->input->post('SadminID');
				$templateDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('dynamic_templates',$templateDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}

            }elseif($method=="PUT")
            {
				$templateDetails['created_by'] = $this->input->post('SadminID');
				$templateDetails['created_date'] = $updateDate;
				$templateDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('dynamic_templates',$templateDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}

            }else if($method=="DELETE")
			{	
				$templateDetails = array();
	
				$where=array('temp_id'=>$temp_id);
				if(!isset($temp_id) || empty($temp_id)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
	
				$iscreated = $this->CommonModel->deleteMasterDetails('dynamic_templates',$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
	
				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
			}	
		}else
		{ 
            $where = array("temp_id"=>$temp_id);
			$templateDetails = $this->CommonModel->getMasterDetails('dynamic_templates','',$where);
			if(isset($templateDetails) && !empty($templateDetails)){
				if(isset($templateDetails[0]->temp_code) && !empty($templateDetails[0]->temp_code)){
					$templateDetails[0]->temp_code = htmlspecialchars_decode($templateDetails[0]->temp_code);
				}	
				if(isset($templateDetails[0]->temp_content) && !empty($templateDetails[0]->temp_content)){
					$templateDetails[0]->temp_content = htmlspecialchars_decode($templateDetails[0]->temp_content);
				}
                $status['data'] = $templateDetails;
                $status['statusCode'] = 200;
                $status['flag'] = 'S';
                $this->response->output($status,200);
			}else{
                $status['msg'] = $this->systemmsg->getErrorCode(227);
                $status['statusCode'] = 227;
                $status['data'] =array();
                $status['flag'] = 'F';
                $this->response->output($status,200);
			}
			if($temp_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}
	}

    public function templateDataChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
            $ids = $this->input->post("list");
            $statusCode = $this->input->post("status");	
            $changestatus = $this->CommonModel->changeMasterStatus('dynamic_templates',$statusCode,$ids,'temp_id');
			if($changestatus){
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}
	public function multipletemplateChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['temp_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('dynamic_templates', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('dynamic_templates', $action, $ids, 'temp_id');
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
