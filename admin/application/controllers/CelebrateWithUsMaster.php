<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class CelebrateWithUsMaster extends CI_Controller {

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
		$where = array("infoID"=>2);
		$infoData = $this->CommonModel->getMasterDetails('info_settings','',$where);

		$this->fromEmail=$infoData[0]->fromEmail;
		$this->ccEmail=$infoData[0]->ccEmail;
		$this->fromName=$infoData[0]->fromName;

	}

	// public function celebrateWithUsList()
	// {

	// 	$this->access->checkTokenKey();
	// 	$this->response->decodeRequest();
	// 	$textSearch = trim($this->input->post('textSearch'));
	// 	$isAll = $this->input->post('getAll');
	// 	$confirmationStatus = $this->input->post('confirmationStatus');
	// 	$curPage = $this->input->post('curpage');
	// 	$textval = $this->input->post('textval');
	// 	$orderBy = $this->input->post('orderBy');
	// 	$order = $this->input->post('order');
	// 	$occasion = $this->input->post('occasion');
	// 	$prefix = $this->input->post('prefix');
	// 	$startDate = $this->input->post('fromDate');
	// 	$endDate = $this->input->post('toDate');
	// 	$pocName = $this->input->post('pocName');
	// 	$area = $this->input->post('area');
		
	// 	$statuscode = $this->input->post('status');
		
	// 	// echo $statuscode;exit();
	// 	$config = array();
	// 	if(!isset($orderBy) || empty($orderBy)){
	// 		$orderBy = "celebrate_id";
	// 		$order ="ASC";
	// 	}
	// 	$other = array("orderBy"=>$orderBy,"order"=>$order);
		
	// 	$config = $this->config->item('pagination');
	// 	$wherec = $join =$join1= array();

	// 	if($textSearch =='createdDate'){
	// 		if(isset($startDate) && !empty($startDate)){
	// 			$sDate = date("Y-m-d",strtotime($startDate));
	// 			$wherec["expDateOfEvent >="] = "'".$sDate."'";
	// 		}
	// 		if(isset($endDate) && !empty($endDate)){
	// 			$eDate = date("Y-m-d",strtotime($endDate));
	// 			$wherec["expDateOfEvent <="] = "'".$eDate."'";
	// 		}
	// 	}
	// 	if($textSearch =='confirmationDate'){
	// 		if(isset($startDate) && !empty($startDate)){
	// 			$sDate = date("Y-m-d",strtotime($startDate));
	// 			$wherec["confirmationDate >="] = "'".$sDate."'";
	// 		}
	// 		if(isset($endDate) && !empty($endDate)){
	// 			$eDate = date("Y-m-d",strtotime($endDate));
	// 			$wherec["confirmationDate <="] = "'".$eDate."'";
	// 		}
	// 	}
	

	// 	if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
	// 		$wherec["t.$textSearch like  "] = "'%".$textval."%'";
	// 	}

	// 	if(isset($statuscode) && !empty($statuscode)){
	// 	$statusStr = str_replace(",",'","',$statuscode);
	// 	$wherec["t.status"] = 'IN ("'.$statusStr.'")';
	// 	}	
	// 	if(isset($confirmationStatus) && !empty($confirmationStatus)){
	// 		$wherec["confirmation_status ="] = '"'.$confirmationStatus.'"';
	// 	}	

	// 	// $join1=array();
	// 	// $join1[0]['type'] ="LEFT JOIN";
	// 	// $join1[0]['table']="userExtraDetails";
	// 	// $join1[0]['alias'] ="u";
	// 	// $join1[0]['key1'] ="adminID";
	// 	// $join1[0]['key2'] ="adminID";

	// 	// $selectC1="u.roleOfUser";
	// 	// $wherec1=array("t.adminID ="=>$this->input->post('SadminID'));
	// 	// $celebrateWithUs1 = $this->CommonModel->GetMasterListDetails($selectC1,'admin',$wherec1,'','',$join1,$other1=array());
	// 	// // print_r($celebrateWithUs1);
	// 	// if($celebrateWithUs1[0]->roleOfUser!=101){
			
	// 	// 	$wherec["t.pocName = "] = "'".$this->input->post('SadminID')."'";
	// 	// 	//$wherec["t.createdBy = "] = "'".$this->input->post('SadminID')."'";
	// 	// }

	// 	$join2=array();
	// 	// $join2[0]['type'] ="LEFT JOIN";
	// 	// $join2[0]['table']="occasionMaster";
	// 	// $join2[0]['alias'] ="o";
	// 	// $join2[0]['key1'] ="occasion";
	// 	// $join2[0]['key2'] ="occasionID";

	// 	// $join2[1]['type'] ="LEFT JOIN";
	// 	// $join2[1]['table']="prefixMaster";
	// 	// $join2[1]['alias'] ="p";
	// 	// $join2[1]['key1'] ="prefix";
	// 	// $join2[1]['key2'] ="prefixID";

	// 	// $join2[2]['type'] ="LEFT JOIN";
	// 	// $join2[2]['table']="userExtraDetails";
	// 	// $join2[2]['alias'] ="u";
	// 	// $join2[2]['key1'] ="pocName";
	// 	// $join2[2]['key2'] ="adminID";

	// 	// $join2[3]['type'] ="LEFT JOIN";
	// 	// $join2[3]['table']="regionMaster";
	// 	// $join2[3]['alias'] ="r";
	// 	// $join2[3]['key1'] ="area";
	// 	// $join2[3]['key2'] ="regionID";

	// 	// if(isset($occasion) && !empty($occasion)){
	// 	// 	$wherec["o.occasionID = "] = $occasion;
	// 	// }

	// 	// if(isset($prefix) && !empty($prefix)){
	// 	// 	$wherec["p.prefixID = "] = $prefix;
	// 	// }

	// 	// if(isset($pocName) && !empty($pocName)){
	// 	// 	$wherec["u.adminID = "] = $pocName;
	// 	// }

		
	// 	// if(isset($area) && !empty($area)){
	// 	// 	$wherec["r.regionID = "] = $area;
	// 	// }
	// 	//print_r($wherec);exit;

	// 	$config["base_url"] = base_url() . "celebrateWithUs";
	//     $config["total_rows"] = $this->CommonModel->getCountByParameter('celebrate_id',"celebrate_with_us",$wherec,$other,$join2);
	//     $config["uri_segment"] = 2;
	//     $this->pagination->initialize($config);
	//     if(isset($curPage) && !empty($curPage)){
	// 	$curPage = $curPage;
	// 	$page = $curPage * $config["per_page"];
	// 	}
	// 	else{
	// 	$curPage = 0;
	// 	$page = 0;
	// 	}
		
	// 	$isAll = $this->input->post('getAll');
	// 	$selectC="t.*";
	// 	if($isAll=="Y"){
	// 		$celebrateWithUs = $this->CommonModel->GetMasterListDetails($selectC,'celebrate_with_us',$wherec,'','',$join2,$other);	
	// 	}else{
			
	// 		$celebrateWithUs = $this->CommonModel->GetMasterListDetails($selectC,'celebrate_with_us',$wherec,$config["per_page"],$page,$join2,$other);	
	// 	}
		
	// 	$status['data'] = $celebrateWithUs;
	// 	$status['paginginfo']["curPage"] = $curPage;
	// 	if($curPage <=1)
	// 	$status['paginginfo']["prevPage"] = 0;
	// 	else
	// 	$status['paginginfo']["prevPage"] = $curPage - 1 ;

	// 	$status['paginginfo']["pageLimit"] = $config["per_page"] ;
	// 	$status['paginginfo']["nextpage"] =  $curPage+1 ;
	// 	$status['paginginfo']["totalRecords"] =  $config["total_rows"];
	// 	$status['paginginfo']["start"] =  $page;
	// 	$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
	// 	$status['loadstate'] = true;
	// 	if($config["total_rows"] <= $status['paginginfo']["end"])
	// 	{
	// 	$status['msg'] = $this->systemmsg->getErrorCode(232);
	// 	$status['statusCode'] = 400;
	// 	$status['flag'] = 'S';
	// 	$status['loadstate'] = false;
	// 	$this->response->output($status,200);
	// 	}
	// 	if($celebrateWithUs){
	// 	$status['msg'] = "sucess";
	// 	$status['statusCode'] = 400;
	// 	$status['flag'] = 'S';
	// 	$this->response->output($status,200);

	// 	}else{
	// 	$status['msg'] = $this->systemmsg->getErrorCode(227);
	// 	$status['statusCode'] = 227;
	// 	$status['flag'] = 'F';
	// 	$this->response->output($status,200);
	// 	}	
	// }

	public function celebrateWithUsList()
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$confirmationStatus = $this->input->post('confirmationStatus');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$occasion = $this->input->post('occasion');
		$prefix = $this->input->post('prefix');
		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$pocName = $this->input->post('pocName');
		$area = $this->input->post('area');
		
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
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
			if($selectC !=""){
				$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			}else{
				$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			}
		}
		
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "celebrate_id";
			$order ="ASC";
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
	
		$config["base_url"] = base_url() . "celebrateWithUs";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.celebrate_id','celebrate_with_us',$wherec,$other);
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
		$selectC="t.*";
		if ($isAll == "Y") {
			$celebrateWithUs = $this->CommonModel->GetMasterListDetails($selectC,'celebrate_with_us',$wherec,'','',$join,$other);	
		}else{
			$celebrateWithUs = $this->CommonModel->GetMasterListDetails($selectC, 'celebrate_with_us', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $celebrateWithUs;
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
		if($celebrateWithUs){
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

	public function celebrateWithUs($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$celebrateWithUs = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			
			$celebrateWithUs['prefix'] = $this->validatedata->validate('prefix','prefix',false,'',array()); 
			$celebrateWithUs['req_by_name'] = ucfirst($this->validatedata->validate('req_by_name','Name',true,'',array())); 
			$celebrateWithUs['poc'] = $this->validatedata->validate('poc','Point Of Contact',true,'',array());
			$celebrateWithUs['prefix'] = $this->validatedata->validate('prefix','Prefix',true,'',array());
			$celebrateWithUs['address'] = $this->validatedata->validate('address','Address',true,'',array()); 
			$celebrateWithUs['contact_no'] = $this->validatedata->validate('contact_no','Contact No',false,'',array());
			$celebrateWithUs['whatsapp_no'] = $this->validatedata->validate('whatsapp_no','Whatsapp Number',false,'',array()); 
			$celebrateWithUs['email_id'] = $this->validatedata->validate('email_id','Email ID',true,'',array());
			$celebrateWithUs['region'] = $this->validatedata->validate('region','Region',false,'',array()); 
			$celebrateWithUs['area'] = $this->validatedata->validate('area','Area',false,'',array()); 
			$celebrateWithUs['other_area'] = $this->validatedata->validate('other_area','Other Area',false,'',array());
			$celebrateWithUs['occasion'] = $this->validatedata->validate('occasion','Occasion',false,'',array());
			$celebrateWithUs['other_occasion'] = $this->validatedata->validate('other_occasion','Other Occasion',false,'',array());
			$celebrateWithUs['exp_date_of_event'] = $this->validatedata->validate('exp_date_of_event','expected Date',true,'',array());
			$celebrateWithUs['confirmation_status'] = $this->validatedata->validate('confirmation_status','Confirmation Status',false,'',array());

			if(isset($celebrateWithUs['exp_date_of_event']) && $celebrateWithUs['exp_date_of_event'] !="0000-00-00"){
				$celebrateWithUs['exp_date_of_event'] = str_replace("/","-",$celebrateWithUs['exp_date_of_event']);
				$celebrateWithUs['exp_date_of_event'] = date("Y-m-d",strtotime($celebrateWithUs['exp_date_of_event']));
			}

			$fieldData = $this->datatables->mapDynamicFeilds("celebrateWithUs",$this->input->post());
			$celebrateWithUs = array_merge($fieldData, $celebrateWithUs);

			if($method=="PUT")
			{
				$celebrateWithUs['company_id'] = $this->validatedata->validate('company_id', 'company Id', false, '', array());
				$celebrateWithUs['created_by'] = $this->input->post('SadminID');
				$celebrateWithUs['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('celebrate_with_us',$celebrateWithUs);
				
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}else{
					$lastID = $this->CommonModel->getLastInsertedID();
					$isSend=$this->sendInfoMails($lastID);
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				// $poc=$this->validatedata->validate('poc','poc',true,'',array());
				// $celebrateWithUs['poc']=$poc;

				// if($celebrateWithUs['poc']=="mySelf")
			 	// {	
				// 	$celebrateWithUs['pocName']= $this->input->post('SadminID');

			 	// }else if($celebrateWithUs['poc']=="Other")
			 	// {
				// 	$celebrateWithUs['pointOfContactNameOther'] = $this->validatedata->validate('pointOfContactNameOther','Other Point Of Contact Name',false,'',array()); 
			 	// }else{
				// 	$celebrateWithUs['pocName'] = $this->validatedata->validate('pocName','POC Name',true,'',array());
				// }
			}
			if($method=="POST")
			{
				$where=array('celebrate_id'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				$celebrateWithUs['modified_by'] = $this->input->post('SadminID');
				$celebrateWithUs['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('celebrate_with_us',$celebrateWithUs,$where);
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

			}
		}else if($method=="DELETE")
		{	
			$celebrateWithUs = array();

			$where=array('celebrate_id'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('celebrate_with_us',$where);
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
		else
		{
			$where = array("celebrate_id"=>$id);
			$celebrateWithUsData = $this->CommonModel->getMasterDetails('celebrate_with_us','',$where);
			if(isset($celebrateWithUsData) && !empty($celebrateWithUsData)){

			$status['data'] = $celebrateWithUsData;
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
	public function celebrateWithUsChangeStatus()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('celebrate_with_us',$statusCode,$ids,'celebrate_id');
				
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

	// public function celeChangeConfirmStatus()
	// {
	// 	$this->access->checkTokenKey();
	// 	$this->response->decodeRequest(); 
	// 	$confirmationDate = date("Y/m/d H:i:s");
	// 	$action = $this->input->post("action");
	// 	$celWithUsID = $this->input->post("celWithUsID");
	// 	$status = $this->input->post("status");
	// 	$celebrateWithUs=array();
		
	// 	$celebrateWithUs['confirmationStatus'] = $status;
	// 	$celebrateWithUs['approveOrDeclinedBy'] = $this->input->post('SadminID');
	// 	switch ($celebrateWithUs['confirmationStatus']) {
	// 		case 'Approved':
	// 			{	
	// 				$celebrateWithUs['confirmationDate'] = $confirmationDate;
	// 				$where=array("celWithUsID"=>$celWithUsID);
	// 				$iscreated = $this->CommonModel->updateMasterDetails('celebrateWithUs',$celebrateWithUs,$where);
	// 				if(!$iscreated){
	// 					$status['msg'] = $this->systemmsg->getErrorCode(998);
	// 					$status['statusCode'] = 998;
	// 					$status['data'] = array();
	// 					$status['flag'] = 'F';
	// 					$this->response->output($status,200);
	// 				}else
	// 				{
	// 					$this->sendCelebrationAproveMalis($celWithUsID);
	// 					$status = array();
	// 					$status['data'] = array();
	// 					$status['statusCode'] = 200;
	// 					$status['flag'] = 'S';
	// 					$this->response->output($status,200);

	// 				}

	// 			}
	// 			break;
	// 			case "Declined":
	// 			{
	// 			}
	// 			default:
	// 				# code...
	// 				break;
	// 		}

	// }


	public function prefixList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');
		
		// echo $statuscode;exit();
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "prefixID";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join= array();
		if(isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}	

		$config["base_url"] = base_url() . "prefixMaster";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('prefixID',"prefixMaster",$wherec);
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
			$prefixDetails = $this->CommonModel->GetMasterListDetails($selectC='','prefixMaster',$wherec,'','',$join,$other);	
		}else{
			
			$prefixDetails = $this->CommonModel->GetMasterListDetails($selectC='','prefixMaster',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
		$status['data'] = $prefixDetails;
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
		if($prefixDetails){
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

	public function celebrationApproved($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		if(!isset($id) || empty($id)){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$method = $this->input->method(TRUE);
		if($method=="PUT")
		{
			$celebrationApproved=array();
			$celebrationApproved['confirmation_date'] = date("Y-m-d");
			$celebrationApproved['confirmation_status'] = "Approved";
			$celebrationApproved['approve_or_declined_by'] = $this->input->post('SadminID');
			$celebrationApproved['app_event_date'] = $this->validatedata->validate('app_event_date','Approved Event Date',true,'',array()); 
			$celebrationApproved['app_event_time'] = $this->validatedata->validate('app_event_time','Approved Event Time',true,'',array()); 
			$celebrationApproved['cci_name'] = $this->validatedata->validate('cci_name','CCI Name',true,'',array()); 
			$celebrationApproved['cci_contact_no'] = $this->validatedata->validate('cci_contact_no','CCI Contact No',true,'',array()); 
			$celebrationApproved['event_address'] = $this->validatedata->validate('event_address','Event Address',true,'',array()); 
			$celebrationApproved['ankur_contact_no'] = $this->validatedata->validate('ankur_contact_no','Ankur C.O Contact No',true,'',array()); 
			$celebrationApproved['no_of_children'] = $this->validatedata->validate('no_of_children','No Of Childern',true,'',array()); 
			// print_r($celebrationApproved);

			if(isset($celebrationApproved['app_event_date']) && !empty($celebrationApproved['app_event_date']) && $celebrationApproved['app_event_date'] !="0000-00-00"){
				$celebrationApproved['app_event_date'] = date("Y-m-d",strtotime($celebrationApproved['app_event_date']));
			}

			$where = array("celebrate_id"=>$id);
			$iscreated = $this->CommonModel->updateMasterDetails('celebrate_with_us',$celebrationApproved,$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				// $this->sendCelebrationAproveMalis($id);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

		}
	}

	public function celebrationDeclined($id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		if(!isset($id) || empty($id)){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$method = $this->input->method(TRUE);
		if($method=="PUT")
		{
			$celebrationDeclined=array();
			$celebrationDeclined['reason'] = $this->validatedata->validate('reason','reason',false,'',array()); 
			$celebrationDeclined['confirmation_status'] = $this->validatedata->validate('confirmationStatus','confirmationStatus',false,'',array()); 
			$celebrationDeclined['approve_or_declined_by'] = $this->input->post('SadminID');
			// print_r($celebrationDeclined);exit;
			$where = array("celebrate_id"=>$id);
			$iscreated = $this->CommonModel->updateMasterDetails('celebrate_with_us',$celebrationDeclined,$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				// $this->sendCelebrationDeclinedMalis($id);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}
	}

	public function sendInfoMails($celWithUsID='')
	{
		return;
		$where = array("celebrate_id ="=>$celWithUsID);
		$celeData = $this->CommonModel->getMasterDetails('celebrate_with_us','',$where);
		//requested By Email
		$reqByName=$celeData[0]->req_by_name;//reqBySurName
		
		// All admin Emails 
		$join=array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="adminID";
		$join[0]['key2'] ="adminID";
		$wherec=array("t.roleOfUser ="=>101,"a.status ="=>"'active'");
		$selectC="t.roleOfUser,a.email,a.name,t.contactNo";
		//admin list here
		$adminDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$wherec,'','',$join,$other=array());
		
		$where=array("t.adminID ="=>$celeData[0]->createdBy);
		$userDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());
		//user name who created this entry
		
		if($userDetails[0]->roleOfUser==102)
		{
			$whereTemp=array("tempName = "=>"userCelebrationInfoTemp");
			$userMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
			//{{userName}},{{requestedByName}}
			
			$msg=$this->replaceContent($userMailTemp[0]->emailContent,$userDetails[0]->name,$reqByName);
			$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$userDetails[0]->email,$cc='',$bcc='',$subject=$userMailTemp[0]->subjectOfEmail,$msg);

			///reqBy SMS

			$SMSContent=$userMailTemp[0]->smsContent;
			$DLTID=$userMailTemp[0]->dlttemplateid;
			if(strpos($SMSContent, "{#reqByName#}") !== false){
			$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
			}

			if(strpos($SMSContent, "{#userName#}") !== false){
			$SMSContent = str_replace("{#userName#}",$userDetails[0]->name,$SMSContent);
			}
			// echo $SMSContent;exit;
			if(!empty($userDetails[0]->contactNo)&&!empty($SMSContent))
			{
				// OK
				$this->sms->sendSms($dest=$userDetails[0]->contactNo,$SMSContent,$DLTID);
			}

		}

		//// if user selected registered poc option then this 
		// print_r($celeData);exit;
		
		switch($celeData[0]->poc)
		{
			case 'POC':{
				
				$where=array("t.adminID="=>$celeData[0]->pocName);
				$pocDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());			

				$whereTemp=array("tempName="=>"POCCelebrationInfoTemp");
				$POCMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
				//{{POCName}},{{requestedByName}}
				$msg=$this->replaceContent($POCMailTemp[0]->emailContent,"",$reqByName,"","",$pocDetails[0]->name);

				$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$pocDetails[0]->email,$cc='',$bcc='',$subject=$POCMailTemp[0]->subjectOfEmail,$msg);


				$SMSContent=$POCMailTemp[0]->smsContent;
				$DLTID=$POCMailTemp[0]->dlttemplateid;
				if(strpos($SMSContent, "{#reqByName#}") !== false){
				$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
				}

				if(strpos($SMSContent, "{#pocName#}") !== false){
				$SMSContent = str_replace("{#pocName#}",$pocDetails[0]->name,$SMSContent);
				}
				if(!empty($pocDetails[0]->contactNo)&&!empty($SMSContent))
				{
					// OK
					$this->sms->sendSms($dest=$pocDetails[0]->contactNo,$SMSContent,$DLTID);
				 	// print_r($pocDetails);exit;
				}

				break;
			}
		}
		$whereTemp=array("tempName ="=>"requestedByCelebrationInfoTemp");
		
		$reqByTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		$msg=$this->replaceContent($reqByTemp[0]->emailContent,'',$reqByName);
		
		$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$celeData[0]->emailID,$cc='',$bcc='',$subject=$reqByTemp[0]->subjectOfEmail,$msg);
		
		///reqBy SMS

		$SMSContent=$reqByTemp[0]->smsContent;
		$DLTID=$reqByTemp[0]->dlttemplateid;
		if(strpos($SMSContent, "{#reqByName#}") !== false){
		$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent,$DLTID);
		}
		
		// print_r($celeData[0]);exit;
		// echo $celeData[0]->contactNo;exit;
		if(!empty($celeData[0]->contactNo)&&!empty($SMSContent))
		{
			// OK
			$this->sms->sendSms($dest=$celeData[0]->contactNo,$SMSContent,$DLTID);
		}
		
		$whereTemp=array("tempName"=>"AllAdminsCelebrationInfoTemp");
		$AllAdminsMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		//{{userName}},{{requestedByName}}
		foreach ($adminDetails as $key => $value) {
			///reqBy SMS

			$SMSContent=$AllAdminsMailTemp[0]->smsContent;
			$DLTID=$AllAdminsMailTemp[0]->dlttemplateid;
			if(strpos($SMSContent, "{#reqByName#}") !== false){
			$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
			}

			if(strpos($SMSContent, "{#pocName#}") !== false){
			$SMSContent = str_replace("{#pocName#}",$value->name,$SMSContent);
			}
			// echo $SMSContent;exit;
			if(!empty($value->contactNo)&&!empty($SMSContent))
			{
				// OK
				$this->sms->sendSms($dest=$value->contactNo,$SMSContent,$DLTID);
			}

		}

	}

	public function sendCelebrationAproveMalis($celWithUsID='')
	{
		$where = array("celebrate_id ="=>$celWithUsID);
		$celeData = $this->CommonModel->getMasterDetails('celebrate_with_us','',$where);
		//requested By Email
		$reqByEmail=$celeData[0]->emailID;
		$reqByName=$celeData[0]->reqByName; //reqBySurName
		// All admin Emails 
		$join=array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="adminID";
		$join[0]['key2'] ="adminID";


		$wherec=array("t.roleOfUser ="=>101,"a.status ="=>"'active'");
		$selectC="t.roleOfUser,a.email,a.name,t.contactNo";
		//admin list here
		$adminDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$wherec,'','',$join,$other=array());

		$where=array("t.adminID ="=>$celeData[0]->approveOrDeclinedBy);
		$AORDName=$this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$wherec,'','',$join,$other=array());

		$where=array("t.adminID ="=>$celeData[0]->createdBy);
		$userDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());
		//user name who created this entry
		if($userDetails[0]->roleOfUser==102)
		{
			$whereTemp=array("tempName = "=>"userCelebrationApproveTemp");
			$userMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
			//{{userName}},{{requestedByName}}{{approvedBy}}
			$msg=$this->replaceContent($userMailTemp[0]->emailContent,$userDetails[0]->name,$reqByName,'',$AORDName[0]->name);
			$msg=$this->replaceApprovedContent($msg,$celeData[0],$celeData[0]->appEventDate,$celeData[0]->appEventTime,$celeData[0]->cciName,$celeData[0]->cciContactNo,$celeData[0]->eventAddress,$celeData[0]->ankurContactNo,$celeData[0]->noOfChildern);
			$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$userDetails[0]->email,$cc='',$bcc='',$subject=$userMailTemp[0]->subjectOfEmail,$msg);

			$SMSContent=$userMailTemp[0]->smsContent;
			$DLTID=$userMailTemp[0]->dlttemplateid;
			if(strpos($SMSContent, "{#reqByName#}") !== false){
			$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
			}

			if(strpos($SMSContent, "{#userName#}") !== false){
			$SMSContent = str_replace("{#userName#}",$userDetails[0]->name,$SMSContent);
			}
			// echo $SMSContent;exit;
			if(!empty($userDetails[0]->contactNo)&&!empty($SMSContent))
			{
				// OK
				$this->sms->sendSms($dest=$userDetails[0]->contactNo,$SMSContent,$DLTID);
			}
		}

		// $join2=array();
		// $join2[0]['type'] ="LEFT JOIN";
		// $join2[0]['table']="occasionMaster";
		// $join2[0]['alias'] ="o";
		// $join2[0]['key1'] ="occasion";
		// $join2[0]['key2'] ="occasionID";

		// if(isset($occasion) && !empty($occasion)){
		// 	$wherec["o.occasionID = "] = $occasion;
		// }
		// $isAll = $this->input->post('getAll');
		// $selectC="t.*,o.occasionID,o.occasionName";
		// if($isAll=="Y"){
		// 	$celebrateWithUs = $this->CommonModel->GetMasterListDetails($selectC,'celebrateWithUs',$wherec,'','',$join2,$other);	
		// }

		//// if user selected registered poc option then this 
		// print_r($celeData);exit;
		switch($celeData[0]->poc)
		{
			case 'POC':{
				
				$where=array("t.adminID="=>$celeData[0]->pocName);
				$pocDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());			

				$whereTemp=array("tempName="=>"POCCelebrationApproveTemp");
				$POCMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
				//{{POCName}},{{requestedByName}}{{approvedBy}}
				$msg=$this->replaceContent($POCMailTemp[0]->emailContent,"",$reqByName,'',$AORDName[0]->name,$pocDetails[0]->name);
				$msg=$this->replaceApprovedContent($msg,$celeData[0],$celeData[0]->appEventDate,$celeData[0]->appEventTime,$celeData[0]->cciName,$celeData[0]->cciContactNo,$celeData[0]->eventAddress,$celeData[0]->ankurContactNo,$celeData[0]->noOfChildern);
				$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$pocDetails[0]->email,$cc='',$bcc='',$subject=$POCMailTemp[0]->subjectOfEmail,$msg);

				$SMSContent=$POCMailTemp[0]->smsContent;
				$DLTID=$POCMailTemp[0]->dlttemplateid;
				if(strpos($SMSContent, "{#reqByName#}") !== false){
				$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
				}

				if(strpos($SMSContent, "{#pocName#}") !== false){
				$SMSContent = str_replace("{#pocName#}",$pocDetails[0]->name,$SMSContent);
				}
				// echo $SMSContent;exit;
				if(!empty($pocDetails[0]->contactNo)&&!empty($SMSContent))
				{
					// OK
					$this->sms->sendSms($dest=$pocDetails[0]->contactNo,$SMSContent,$DLTID);
				}
				
				break;
			}
		}
		$whereTemp=array("tempName ="=>"requestedByCelebrationApproveTemp");
		$reqByTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		$msg=$this->replaceContent($reqByTemp[0]->emailContent,'',$reqByName,'',$AORDName[0]->name);
		$msg=$this->replaceApprovedContent($msg,$celeData[0],$celeData[0]->appEventDate,$celeData[0]->appEventTime,$celeData[0]->cciName,$celeData[0]->cciContactNo,$celeData[0]->eventAddress,$celeData[0]->ankurContactNo,$celeData[0]->noOfChildern);
		
		$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$celeData[0]->emailID,$cc='',$bcc='',$subject=$reqByTemp[0]->subjectOfEmail,$msg);

		$SMSContent=$reqByTemp[0]->smsContent;
		$DLTID=$reqByTemp[0]->dlttemplateid;
		if(strpos($SMSContent, "{#reqByName#}") !== false){
		$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
		}
		// echo $SMSContent;exit;
		if(!empty($celeData[0]->contactNo)&&!empty($SMSContent))
		{
			// OK
			$this->sms->sendSms($dest=$celeData[0]->contactNo,$SMSContent,$DLTID);
		}



		$whereTemp=array("tempName"=>"AllAdminsCelebrationApproveTemp");
		$AllAdminsMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		//{{userName}},{{requestedByName}}
		foreach ($adminDetails as $key => $value) {
			$msg=$this->replaceContent($AllAdminsMailTemp[0]->emailContent,$userDetails[0]->name,$reqByName,$value->name,$AORDName[0]->name);
			$msg=$this->replaceApprovedContent($msg,$celeData[0],$celeData[0]->appEventDate,$celeData[0]->appEventTime,$celeData[0]->cciName,$celeData[0]->cciContactNo,$celeData[0]->eventAddress,$celeData[0]->ankurContactNo,$celeData[0]->noOfChildern);
			$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$value->email,$cc='',$bcc='',$subject=$AllAdminsMailTemp[0]->subjectOfEmail,$msg);
		}		
	}

	public function sendCelebrationDeclinedMalis($celWithUsID='')
	{
		$where = array("celebrate_id ="=>$celWithUsID);
		$celeData = $this->CommonModel->getMasterDetails('celebrate_with_us','',$where);
		//requested By Email
		$reqByEmail=$celeData[0]->emailID;
		$reqByName=$celeData[0]->reqByName; //reqBySurName
		// All admin Emails 
		$join=array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="adminID";
		$join[0]['key2'] ="adminID";
		$wherec=array("t.roleOfUser ="=>101,"a.status ="=>"'active'");
		$selectC="t.roleOfUser,a.email,a.name";
		//admin list here
		$adminDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$wherec,'','',$join,$other=array());

		$where=array("t.adminID ="=>$celeData[0]->approveOrDeclinedBy);
		$AORDName=$this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$wherec,'','',$join,$other=array());

		$where=array("t.adminID ="=>$celeData[0]->createdBy);
		$userDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());
		//user name who created this entry
		//if($userDetails[0]->roleOfUser==102)
		//	{

			$whereTemp=array("tempName = "=>"userCelebrationDeclineTemp");
			$userMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
			//{{userName}},{{requestedByName}}{{approvedBy}}
			$msg=$this->replaceContent($userMailTemp[0]->emailContent,'',$reqByName,'','','',$celeData[0]->reason);
			$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$celeData[0]->email,$cc='',$bcc='',$subject=$userMailTemp[0]->subjectOfEmail,$msg);
		//}
			$SMSContent=$userMailTemp[0]->smsContent;
			$DLTID=$userMailTemp[0]->dlttemplateid;
			if(strpos($SMSContent, "{#reqByName#}") !== false){
			$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
			}
			if(strpos($SMSContent, "{#reason#}") !== false){
			$SMSContent = str_replace("{#reason#}",$celeData[0]->reason,$SMSContent);
			}
			// echo $SMSContent;exit;
			if(!empty($celeData[0]->contactNo)&&!empty($SMSContent))
			{
				// OK
				$this->sms->sendSms($dest=$celeData[0]->contactNo,$SMSContent,$DLTID);
			}

		//// if user selected registered poc option then this 
		// print_r($celeData);exit;
		switch($celeData[0]->poc)
		{
			case 'POC':{
				
				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="admin";
				$join[0]['alias'] ="a";
				$join[0]['key1'] ="adminID";
				$join[0]['key2'] ="adminID";

				$where=array("t.adminID="=>$celeData[0]->pocName);
				$pocDetails = $this->CommonModel->GetMasterListDetails($selectC,'userExtraDetails',$where,'','',$join,$other=array());			

				$whereTemp=array("tempName="=>"POCCelebrationDeclineTemp");
				$POCMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
				//{{POCName}},{{requestedByName}}{{approvedBy}}
				$msg=$this->replaceContent($POCMailTemp[0]->emailContent,"",$reqByName,'',$AORDName[0]->name,$pocDetails[0]->name,$celeData[0]->reason);

				$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$pocDetails[0]->email,$cc='',$bcc='',$subject=$POCMailTemp[0]->subjectOfEmail,$msg);

				$SMSContent=$POCMailTemp[0]->smsContent;
				$DLTID=$POCMailTemp[0]->dlttemplateid;
				if(strpos($SMSContent, "{#reqByName#}") !== false){
				$SMSContent = str_replace("{#reqByName#}",$reqByName,$SMSContent);
				}
				if(strpos($SMSContent, "{#adminName#}") !== false){
				$SMSContent = str_replace("{#adminName#}",$pocDetails[0]->name,$SMSContent);
				}
				if(strpos($SMSContent, "{#reason#}") !== false){
				$SMSContent = str_replace("{#reason#}",$celeData[0]->reason,$SMSContent);
				}
				// echo $SMSContent;exit;
				if(!empty($pocDetails[0]->contactNo)&&!empty($SMSContent))
				{
					// OK
					$this->sms->sendSms($dest=$pocDetails[0]->contactNo,$SMSContent,$DLTID);
				}

				break;
			}
		}
		$whereTemp=array("tempName ="=>"requestedByCelebrationDeclineTemp");
		$reqByTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		$msg=$this->replaceContent($reqByTemp[0]->emailContent,'',$reqByName,'',$AORDName[0]->name,'',$celeData[0]->reason);
		$occasion="";
		// print_r($occasion =	$celeData[0]->occasion);exit;
		if($celeData[0]->occasion!="0")
		{
			$occasion =	$celeData[0]->occasion;
		}else{
			$occasion=$celeData[0]->otherOccasion;
		}
		if(strpos($msg, "{{occasion}}") !== false){
			$msg = str_replace("{{occasion}}",$occasion,$msg);
		}

		$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$celeData[0]->emailID,$cc='',$bcc='',$subject=$reqByTemp[0]->subjectOfEmail,$msg);

		$whereTemp=array("tempName"=>"AllAdminsCelebrationDeclineTemp");
		$AllAdminsMailTemp=$this->CommonModel->getMasterDetails('emailMaster','',$whereTemp);
		//{{userName}},{{requestedByName}}
		foreach ($adminDetails as $key => $value) {
			$msg=$this->replaceContent($AllAdminsMailTemp[0]->emailContent,$userDetails[0]->name,$reqByName,$value->name,$AORDName[0]->name,'',$celeData[0]->reason);
			$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$to=$value->email,$cc='',$bcc='',$subject=$AllAdminsMailTemp[0]->subjectOfEmail,$msg);
		}		
	}

	public function replaceContent($mailContent="",$userName="",$requestedByName='',$adminName="",$approveOrDeclinedBy="",$pocName="",$reason="")
	{	

		if(strpos($mailContent, "{{userName}}") !== false){
		$mailContent = str_replace("{{userName}}",$userName,$mailContent);
		}
		if(strpos($mailContent, "{{requestedByName}}") !== false){
		$mailContent = str_replace("{{requestedByName}}",$requestedByName,$mailContent);
		}
		if(strpos($mailContent, "{{pocName}}") !== false){
		$mailContent = str_replace("{{pocName}}",$pocName,$mailContent);
		}
		if(strpos($mailContent, "{{adminName}}") !== false){
		$mailContent = str_replace("{{adminName}}",$adminName,$mailContent);
		}
		if(strpos($mailContent, "{{reason}}") !== false){
		$mailContent = str_replace("{{reason}}",$reason,$mailContent);

		}
		if(strpos($mailContent, "{{approvedBy}}") !== false){
		$mailContent = str_replace("{{approvedBy}}",$approveOrDeclinedBy,$mailContent);
		}

		if(strpos($mailContent, "{{declinedBy}}") !== false){
		$mailContent = str_replace("{{declinedBy}}",$approveOrDeclinedBy,$mailContent);
		}
		return $mailContent;
	}


	public function replaceApprovedContent($msg='',$celeData='',$appEventDate='',$appEventTime='',$cciName='',$cciContactNo='',$eventAddress='',$ankurContactNo='',$noOfChildern='')
	{
		if(strpos($msg, "{{eventDate}}") !== false){
			$msg = str_replace("{{eventDate}}",$appEventDate,$msg);
		}

		if(strpos($msg, "{{eventTime}}") !== false){
			$msg = str_replace("{{eventTime}}",$appEventTime,$msg);
		}

		if(strpos($msg, "{{CCIName}}") !== false){
			$msg = str_replace("{{CCIName}}",$cciName,$msg);
		}

		if(strpos($msg, "{{CCIContactNumber}}") !== false){
			$msg = str_replace("{{CCIContactNumber}}",$cciContactNo,$msg);
		}

		if(strpos($msg, "{{eventAddress}}") !== false){
			$msg = str_replace("{{eventAddress}}",$eventAddress,$msg);
		}

		if(strpos($msg, "{{ankurContactNo}}") !== false){
			$msg = str_replace("{{ankurContactNo}}",$ankurContactNo,$msg);
		}

		if(strpos($msg, "{{noOfChilderns}}") !== false){
			$msg = str_replace("{{noOfChilderns}}",$noOfChildern,$msg);
		}
		if(strpos($msg, "{{occasion}}") !== false){
			if($celeData->occasion!="0")
			{
				$oDetails = $this->CommonModel->getMasterDetails("occasionMaster","*",array("occasionID"=>$celeData->occasion));
				$occasion = $oDetails[0]->occasionName;
			}else{
				$occasion = $celeData->otherOccasion;
			}

			$msg = str_replace("{{occasion}}",$occasion,$msg);
		}
			return $msg;

	}
	
}