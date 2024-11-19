<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Testimonials extends CI_Controller {

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


	public function gettestimonialsDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('testimonial_id');
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
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "testimonial_name";
			$order ="ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);
		
		// $config = $this->config->item('pagination');
		// $wherec = $join = array();
		// if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'".$textval."%'";
		// }

		// if(isset($statuscode) && !empty($statuscode)){
		// $statusStr = str_replace(",",'","',$statuscode);
		// $wherec["t.status"] = 'IN ("'.$statusStr.'")';
		// }

		
		$adminID = $this->input->post('SadminID');
		if ($isAll == "Y") {
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		
		$config["base_url"] = base_url() . "testimonialsDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.testimonial_id','testimonials',$wherec,$other);
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

		if ($isAll == "Y") {
			$testimonialsDetails = $this->CommonModel->GetMasterListDetails($selectC="testimonial_id,testimonial_name",'testimonials',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.testimonial_id,t.testimonial_name,t.created_date,".$selectC;
			$testimonialsDetails = $this->CommonModel->GetMasterListDetails($selectC, 'testimonials', $wherec, $config["per_page"], $page, $join, $other);
		}

		// if($isAll=="Y"){
		// 	$join = array();
		// 	$testimonialsDetails = $this->CommonModel->GetMasterListDetails($selectC='*','testimonials',$wherec,'','',$join,$other);	
		// }else{
		// 	$selectC = "*";
		// 	$testimonialsDetails = $this->CommonModel->GetMasterListDetails($selectC='*','testimonials',$wherec,$config["per_page"],$page,$join,$other);
		// }
		$status['data'] = $testimonialsDetails;
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
		if($testimonialsDetails){
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

	public function testimonials($testimonial_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if($method=="POST"||$method=="PUT")
		{
				$testimonialsDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$testimonialsDetails['testimonial_id'] = $this->validatedata->validate('testimonial_id','testimonial_id',false,'',array());
				$testimonialsDetails['testimonial_name'] = $this->validatedata->validate('testimonial_name','Testimonials Name',true,'',array());
				$testimonialsDetails['testimonial_message'] = $this->validatedata->validate('testimonial_message','Testimonials Message',true,'',array());
				$testimonialsDetails['testimonial_image'] = $this->validatedata->validate('testimonial_image','Testimonials Image',false,'',array());
				$testimonialsDetails['designation'] = $this->validatedata->validate('designation','Testimonials designation',false,'',array());
				$testimonialsDetails['designation_show_on_website'] = $this->validatedata->validate('designation_show_on_website','Testimonials designation show on website',false,'',array());
	
				$fieldData = $this->datatables->mapDynamicFeilds("testimonials",$this->input->post());
				$testimonialsDetails = array_merge($fieldData, $testimonialsDetails);

					if($method=="POST")
					{
						$iticode=$testimonialsDetails['testimonial_id'];
						$testimonialsDetails['status'] = "active";
						$testimonialsDetails['created_by'] = $this->input->post('SadminID');
						$testimonialsDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('testimonials',$testimonialsDetails);
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
						$where=array('testimonial_id'=>$testimonial_id);
						if(!isset($testimonial_id) || empty($testimonial_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$testimonialsDetails['modified_by'] = $this->input->post('SadminID');
					$testimonialsDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('testimonials',$testimonialsDetails,$where);
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
			
	
		}elseif($method=="dele")
		{
			$testimonialsDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('testimonials',$where);
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
			if($testimonial_id ==""){
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
			$wherec["t.testimonial_id"] = "=".$testimonial_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$testimonialsDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
				// $where = array("testimonial_id "=>$testimonial_id );
				// $testimonialsDetails = $this->CommonModel->getMasterDetails('testimonials','',$where);
				if(isset($testimonialsDetails) && !empty($testimonialsDetails)){

				$status['data'] = $testimonialsDetails;
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
		}
	}

    public function testimonialsChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
			$ids = $this->input->post("list");
			$whereIn ['testimonial_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('testimonials', '',$whereIn);
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
	public function multipletestimonialChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['testimonial_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('testimonials', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('testimonials', $action, $ids, 'testimonial_id');
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