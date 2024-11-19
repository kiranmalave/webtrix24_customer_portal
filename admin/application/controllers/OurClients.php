<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class OurClients extends CI_Controller {

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


	public function getclientDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('clients_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('client_name');
		$order = $this->input->post('order');
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
		}
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "client_name";
			$order ="ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);
		
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
	
		$config["base_url"] = base_url() . "clientDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.clients_id','our_clients',$wherec,$other);
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
			$clientDetails = $this->CommonModel->GetMasterListDetails($selectC="clients_id,client_name",'our_clients',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.client_name,t.created_date,".$selectC;
			$clientDetails = $this->CommonModel->GetMasterListDetails($selectC, 'our_clients', $wherec, $config["per_page"], $page, $join, $other);
		}

		// if($isAll=="Y"){
		// 	$join = array();
		// 	$clientDetails = $this->CommonModel->GetMasterListDetails($selectC='*','our_clients',$wherec,'','',$join,$other);	
		// }else{
			
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
			
		// 	$selectC = "*";
		// 	$clientDetails = $this->CommonModel->GetMasterListDetails($selectC='*','our_clients',$wherec,$config["per_page"],$page,$join,$other);

		// }
		//print_r($companyDetails);exit;
		$status['data'] = $clientDetails;
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
		if($clientDetails){
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

	public function ourClients($clients_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				$clientDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $clientDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

				$clientDetails['clients_id'] = $this->validatedata->validate('clients_id','clients_id',false,'',array());
				$clientDetails['client_name'] = $this->validatedata->validate('client_name','Client Name',true,'',array());
				$clientDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
				$clientDetails['client_image'] = $this->validatedata->validate('client_image','Client Image',false,'',array());

				$fieldData = $this->datatables->mapDynamicFeilds("ourclients",$this->input->post());
				$clientDetails = array_merge($fieldData, $clientDetails);

					  // print_r($method);exit();
					if($method=="PUT")
					{
						$iticode=$clientDetails['clients_id'];
						$clientDetails['status'] = "active";
						$clientDetails['created_by'] = $this->input->post('SadminID');
						$clientDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('our_clients',$clientDetails);
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

					}elseif($method=="POST")
					{
						$where=array('clients_id'=>$clients_id);
						if(!isset($clients_id) || empty($clients_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$clientDetails['modified_by'] = $this->input->post('SadminID');
					$clientDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('our_clients',$clientDetails,$where);
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
			$clientDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('our_clients',$where);
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
			if($clients_id ==""){
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
			$wherec["t.clients_id"] = "=".$clients_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$clientDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				// $where = array("clients_id"=>$clients_id);
				// $clientDetails = $this->CommonModel->getMasterDetails('our_clients','',$where);
				if(isset($clientDetails) && !empty($clientDetails)){

				$status['data'] = $clientDetails;
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

    public function OurClientsChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
			$ids = $this->input->post("list");
			$whereIn ['clients_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('our_clients', '',$whereIn);
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
	public function multipleclientChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['clients_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('our_clients', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('our_clients', $action, $ids, 'clients_id');
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