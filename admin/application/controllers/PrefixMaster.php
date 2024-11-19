<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PrefixMaster extends CI_Controller {

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
		$this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
	}


	public function getprefixDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('prefixID');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "prefixName";
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

		$config["base_url"] = base_url() . "prefixDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('prefixID','prefixmaster',$wherec,$other);
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
			$join = array();
			$prefixDetails = $this->CommonModel->GetMasterListDetails($selectC='*','prefixmaster',$wherec,'','',$join,$other);	
		}else{
			
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
			$prefixDetails = $this->CommonModel->GetMasterListDetails($selectC='*','prefixmaster',$wherec,$config["per_page"],$page,$join,$other);

		}
		//print_r($companyDetails);exit;
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

	public function prefixMaster($prefixID="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				$prefixDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $prefixDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

				$prefixDetails['prefixID'] = $this->validatedata->validate('prefixID','prefix ID',false,'',array());

				$prefixDetails['prefixName'] = $this->validatedata->validate('prefixName','Prefix Name',true,'',array());

				$prefixDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				
				$fieldData = $this->datatables->mapDynamicFeilds("prefixmaster",$this->input->post());
				$prefixDetails = array_merge($fieldData, $prefixDetails);

					if($method=="PUT")
					{
						$iticode=$prefixDetails['prefixID'];
						$prefixDetails['status'] = "active";
						$prefixDetails['createdBy'] = $this->input->post('SadminID');
						$prefixDetails['createdDate'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('prefixmaster',$prefixDetails);
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
						$where=array('prefixID'=>$prefixID);
						if(!isset($prefixID) || empty($prefixID)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$prefixDetails['modifiedBy'] = $this->input->post('SadminID');
					$prefixDetails['modifiedDate'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('prefixmaster',$prefixDetails,$where);
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
			$prefixDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('prefixmaster',$where);
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
				
				$where = array("prefixID"=>$prefixID);
				$prefixDetails = $this->CommonModel->getMasterDetails('prefixmaster','',$where);
				if(isset($prefixDetails) && !empty($prefixDetails)){

				$status['data'] = $prefixDetails;
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

    public function PrefixChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('prefixmaster',$statusCode,$ids,'prefixID');
				
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