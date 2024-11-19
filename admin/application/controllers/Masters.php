<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Masters extends CI_Controller {

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
	
	public function getStateDetails()
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
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "stateName";
			$order ="ASC";
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
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}


		$config["base_url"] = base_url() . "stateDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('stateID','stateMaster',$wherec);
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
			$stateDetails = $this->CommonModel->GetMasterListDetails($selectC='','stateMaster',$wherec,'','',$join,$other);	
		}else{
			$stateDetails = $this->CommonModel->GetMasterListDetails($selectC='','stateMaster',$wherec,$config["per_page"],$page,$join,$other);	
		}

		$status['data'] = $stateDetails;
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
		if($stateDetails){
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
	public function stateMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		
		switch ($method) {
			case "PUT":
			{
				$stateDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$stateDetails['stateName'] = $this->validatedata->validate('stateName','State Name',true,'',array());
				$stateDetails['stateCode'] = $this->validatedata->validate('stateCode','State Code',true,'',array());
				$stateDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				$stateDetails['created_by'] = $this->input->post('SadminID');
				$stateDetails['created_date'] = $updateDate;
				$stateDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('stateMaster',$stateDetails);
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
				break;
			}
				
			case "POST":
			{
				$stateDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$where=array('stateID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				$stateDetails['stateName'] = $this->validatedata->validate('stateName','State Name',true,'',array());
				$stateDetails['stateCode'] = $this->validatedata->validate('stateCode','State Code',true,'',array());
				$stateDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				$stateDetails['modifiedBy'] = $this->input->post('SadminID');
				$stateDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('stateMaster',$stateDetails,$where);
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
				break;
			}
			case "DELETE":
			{	
				$stateDetails = array();

				$where=array('stateID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('stateMaster',$where);
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
				break;
			}	
			default:
			{
				$where = array("stateID"=>$id);
				$stateHistory = $this->CommonModel->getMasterDetails('stateMaster','',$where);
				if(isset($stateHistory) && !empty($stateHistory)){

				$status['data'] = $stateHistory;
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
				break;
			}
				
		}
		
	}
	public function stateChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('stateMaster',$statusCode,$ids,'stateID');
				
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
	
	
	
	
	public function getUserRoleDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch =$this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "t.roleName";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch =trim($textSearch);
			$wherec["$textSearch like  "] = "'%".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
			$statusStr = str_replace(",",'","',$statuscode);
			$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}

		$config["base_url"] = base_url() . "userRoleDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('RoleID','user_role_master',$wherec);
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
		$selectC = "";
		if($isAll !="Y"){
			// create join for created by and modified data details
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="ad";
			$join[$jkey]['key1'] ="created_by";
			$join[$jkey]['key2'] ="adminID";
			$jkey = (count($join)+1);
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="am";
			$join[$jkey]['key1'] ="modified_by";
			$join[$jkey]['key2'] ="adminID";

			if($selectC !=""){
				$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			}else{
				$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			}
		}

		if($isAll=="Y"){
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC='','user_role_master',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.*,".$selectC;
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC,'user_role_master',$wherec,$config["per_page"],$page,$join,$other);	
		}

		$joinRole = array();
		$joinRole[0]['type'] ="LEFT JOIN";
		$joinRole[0]['table']="user_role_master";
		$joinRole[0]['alias'] ="ur";
		$joinRole[0]['key1'] ="roleID";
		$joinRole[0]['key2'] ="roleID";

		$whereRole["adminID ="] = "'". $this->input->post('SadminID') ."'";
		// $whereRole = array('adminID'=> $this->input->post('SadminID'));
		$selectC = "t.name,ur.roleName";
		$userRoleHistory = $this->CommonModel->GetMasterListDetails($selectC,'admin',$whereRole,'','',$joinRole,'');//$this->CommonModel->getMasterDetails('admin','',$whereRole);
		if(isset($userRoleDetails) && !empty($userRoleDetails)){
			if(isset($userRoleHistory) && !empty($userRoleHistory)){
				if($userRoleHistory[0]->roleName != "Super Admin"){		
					// Filter the array to remove the object with roleName == "Super Admin"
					$userRoleDetails = array_filter($userRoleDetails, function($role) {
						return $role->roleName !== "Super Admin";
					});
	
					// Reset array keys (optional, but useful if you need the array keys to be sequential)
					$userRoleDetails = array_values($userRoleDetails);		
				}
			}
		}
		
		$status['data'] = $userRoleDetails;
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
		if($userRoleDetails){
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
	public function userRoleMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		
		switch ($method) {
			case "PUT":
			{
				$userRoleDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$userRoleDetails['roleName'] = $this->validatedata->validate('roleName','User Role Name',true,'',array());
				$userRoleDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				$userRoleDetails['created_by'] = $this->input->post('SadminID');
				$userRoleDetails['created_date'] = $updateDate;
				$userRoleDetails['modified_date'] = '0';
				$where=array("roleName"=>$userRoleDetails['roleName'],"status"=>"active");
				$roleData=$this->CommonModel->getMasterDetails("user_role_master",'roleName',$where);
				if(!empty($roleData))
				{
					$status['msg'] = "Role Name Already Exist";
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);					
				}
				$iscreated = $this->CommonModel->saveMasterDetails('user_role_master',$userRoleDetails);
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
				break;
			}
				
			case "POST":
			{
				$userRoleDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$where=array('roleID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				$userRoleDetails['roleName'] = $this->validatedata->validate('roleName','User Role Name',true,'',array());
				$userRoleDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				$userRoleDetails['modified_by'] = $this->input->post('SadminID');
				$userRoleDetails['modified_date'] = $updateDate;
				$where=array("roleName"=>$userRoleDetails['roleName'],"status"=>"active");
				$roleData=$this->CommonModel->getMasterDetails("user_role_master",'roleName,roleID',$where);

				if(!empty($roleData))
				{
					if(count($roleData)>1)
					{
						$status['msg'] = "Role Name Alrady Exist";
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);					
					}

					if($roleData[0]->roleID!=$id)
					{
						$status['msg'] = "Role Name Alrady Exist";
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);						
					}

				}
				// print_r($userRoleDetails);exit;
				$where=array('roleID'=>$id);
				$iscreated = $this->CommonModel->updateMasterDetails('user_role_master',$userRoleDetails,$where);

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
				break;
			}
			case "DELETE":
			{	
				$userRoleDetails = array();

				$where=array('roleID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('user_role_master',$where);
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
				break;
			}	
			default:
			{
				if(isset($id) && !empty($id)){
					$where = array("roleID"=>$id);
					$userRoleHistory = $this->CommonModel->getMasterDetails('user_role_master','',$where);
					if(isset($userRoleHistory) && !empty($userRoleHistory)){
	
					$status['data'] = $userRoleHistory;
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
				break;
			}
				
		}
		
	}
	public function userRoleChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$updatedRoleId = $this->input->post("updatedRoleId"); 
		$this->db->trans_start();  
			if(trim($action) == "changeStatus"){
				$where=array('roleID'=>$ids);
				$iscreated = $this->CommonModel->deleteMasterDetails('user_role_master',$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}else{
					$changestatus = $this->CommonModel->changeMasterRoleStatus('admin',$ids,$updatedRoleId,'roleID');          
					if(!$changestatus){
						$this->db->trans_rollback();
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$this->db->trans_commit();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
		}
	}

	public function getPocMasterList()
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
		
		// echo $statuscode;exit();
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "pocID";
			$order ="ASC";
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

		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="adminID";
		$join[0]['key2'] ="adminID";

		// print_r($wherec);exit();
		$config["base_url"] = base_url() . "pocMaster";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('pocID',"pocMaster",$wherec);
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
		$selectC="t.*,a.name,a.email";
		if($isAll=="Y"){
			$donerDetails = $this->CommonModel->GetMasterListDetails($selectC,'pocMaster',$wherec,'','',$join,$other);	
		}else{
			$donerDetails = $this->CommonModel->GetMasterListDetails($selectC='','pocMaster',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
		$status['data'] = $donerDetails;
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
		if($donerDetails){
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
	public function pocMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$pocMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			
			$pocMasterDetails['adminID'] = $this->validatedata->validate('adminID','adminID',false,'',array()); 

			$pocMasterDetails['address'] = $this->validatedata->validate('address','address',false,'',array()); 
			
			$pocMasterDetails['contactNo'] = $this->validatedata->validate('contactNo','contactNo',false,'',array()); 
			
			$pocMasterDetails['whatsappNo'] = $this->validatedata->validate('whatsappNo','whatsappNo',false,'',array()); 
			
			$pocMasterDetails['dateOfBirth'] = $this->validatedata->validate('dateOfBirth','dateOfBirth',false,'',array()); 
			

			$pocMasterDetails['status'] = $this->validatedata->validate('status','status',true,'',array());

			if($method=="PUT")
			{
				
				$pocMasterDetails['created_by'] = $this->input->post('SadminID');
				$pocMasterDetails['created_date'] = $updateDate;
				$pocMasterDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('pocMaster',$pocMasterDetails);
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
				
			if($method=="POST")
			{
				$where=array('pocID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				
				$pocMasterDetails['modifiedBy'] = $this->input->post('SadminID');
				$pocMasterDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('pocMaster',$pocMasterDetails,$where);
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
			$pocMasterDetails = array();

			$where=array('pocID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('pocMaster',$where);
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
			$where = array("pocID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('pocMaster','',$where);
			if(isset($userRoleHistory) && !empty($userRoleHistory)){

			$status['data'] = $userRoleHistory;
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
	public function pocMasterChnageStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('pocMaster',$statusCode,$ids,'pocID');
				
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

}