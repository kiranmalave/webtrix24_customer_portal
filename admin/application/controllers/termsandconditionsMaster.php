<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class TermsandconditionsMaster extends CI_Controller {

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
	 * So any other public methods not termsandconditionsed with an underscore will
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


	public function gettermsandconditionsDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('termsandconditionsID');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "termsandconditionsName";
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
		$adminID = $this->input->post('SadminID');
		$config["base_url"] = base_url() . "termsandconditionsDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('termsandconditionsID','termsandconditionsmaster',$wherec,$other);
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
			$termsandconditionsDetails = $this->CommonModel->GetMasterListDetails($selectC='*','termsandconditionsmaster',$wherec,'','',$join,$other);	
		}else{
			$selectC = "*";
			$termsandconditionsDetails = $this->CommonModel->GetMasterListDetails($selectC='*','termsandconditionsmaster',$wherec,$config["per_page"],$page,$join,$other);
		}
		$status['data'] = $termsandconditionsDetails;
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
		if($termsandconditionsDetails){
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

	public function termsandconditionsMaster($termsandconditionsID="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				$termsandconditionsDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $termsandconditionsDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

				$termsandconditionsDetails['termsandconditionsID'] = $this->validatedata->validate('termsandconditionsID','termsandconditions ID',false,'',array());

				$termsandconditionsDetails['termsandconditionsName'] = $this->validatedata->validate('termsandconditionsName','termsandconditions Name',true,'',array());

				$termsandconditionsDetails['status'] = $this->validatedata->validate('status','status',true,'',array());
				
				$fieldData = $this->datatables->mapDynamicFeilds("termsandconditionsmaster",$this->input->post());
				$termsandconditionsDetails = array_merge($fieldData, $termsandconditionsDetails);

					if($method=="PUT")
					{
						$iticode=$termsandconditionsDetails['termsandconditionsID'];
						$termsandconditionsDetails['status'] = "active";
						$termsandconditionsDetails['created_by'] = $this->input->post('SadminID');
						$termsandconditionsDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('termsandconditionsmaster',$termsandconditionsDetails);
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
						$where=array('termsandconditionsID'=>$termsandconditionsID);
						if(!isset($termsandconditionsID) || empty($termsandconditionsID)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$termsandconditionsDetails['modified_by'] = $this->input->post('SadminID');
					$termsandconditionsDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('termsandconditionsmaster',$termsandconditionsDetails,$where);
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
			$termsandconditionsDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('termsandconditionsmaster',$where);
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
				
				$where = array("termsandconditionsID"=>$termsandconditionsID);
				$termsandconditionsDetails = $this->CommonModel->getMasterDetails('termsandconditionsmaster','',$where);
				if(isset($termsandconditionsDetails) && !empty($termsandconditionsDetails)){

				$status['data'] = $termsandconditionsDetails;
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

    public function TermsandconditionsChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('termsandconditionsmaster',$statusCode,$ids,'termsandconditionsID');
				
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