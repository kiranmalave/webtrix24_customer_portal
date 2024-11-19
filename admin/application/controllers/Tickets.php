<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Tickets extends CI_Controller {

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


	public function getticketsDetails()
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
		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$category = $this->input->post('category');
		$ticket_by = $this->input->post('ticket_by');
		$approver_id = $this->input->post('approver_id');
		$statusfilter = $this->input->post('status');
		
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "ticket_id";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statusfilter) && !empty($statusfilter)){
			$statusString = str_replace(",",'","',$statusfilter);
			$wherec["t.status"] = 'IN ("' . $statusString . '")';
		}

		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["ticket_date >="] = "'".$sDate."'";
		}
		if (isset($endDate) && !empty($endDate)) {
			$eDate = date("Y-m-d", strtotime($endDate));
			$wherec["ticket_date <="] = "'" . $eDate . "'";
		}

		if (isset($category) && !empty($category)) {
			$categoryString = str_replace(",",'","',$category);
			$wherec["category"] = 'IN ("' . $categoryString . '")';
		}

		if (isset($approver_id) && !empty($approver_id)) {
			$approverString = str_replace(",",'","',$approver_id);
			$wherec["approver_id"] = 'IN ("' . $approverString . '")';
		}

		if (isset($ticket_by) && !empty($ticket_by)) {
			$ticketString = str_replace(",", '","', $ticket_by);
			$wherec["ticket_by"] = 'IN ("' . $ticketString . '")';
		}
		
		$adminID = $this->input->post('SadminID');
	
		$config["base_url"] = base_url() . "ticketDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('ticket_id','tickets',$wherec,$other);
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

		$join = array();

		if($isAll=="Y"){
			$selectC = "*";
			$ticketDetails = $this->CommonModel->GetMasterListDetails($selectC,'tickets',$wherec,'','',$join,$other);	
		}else{
			$selectC = "*";
			$ticketDetails = $this->CommonModel->GetMasterListDetails($selectC,'tickets',$wherec,$config["per_page"],$page,$join,$other);
		}
		$status['data'] = $ticketDetails;
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
		if($ticketDetails){
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

	public function ticket($tickets_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if($method=="POST"||$method=="PUT")
		{
				$ticketDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$ticketDetails['subject'] = $this->validatedata->validate('subject','Subject',true,'',array());
				$ticketDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
				$ticketDetails['email'] = $this->validatedata->validate('email','email',false,'',array());
				$ticketDetails['phone'] = $this->validatedata->validate('phone','Phone',false,'',array());
				$ticketDetails['customer_id'] = $this->validatedata->validate('customer_id','customer_id',false,'',array());
				$ticketDetails['due_date'] = $this->validatedata->validate('due_date','due_date',false,'',array());
				$ticketDetails['priority_id'] = $this->validatedata->validate('priority_id','priority_id',false,'',array());
				$ticketDetails['ticket_type'] = $this->validatedata->validate('ticket_type','ticket_type',false,'',array());
				$ticketDetails['ticket_category'] = $this->validatedata->validate('ticket_category','ticket_category',false,'',array());
				$ticketDetails['status'] = $this->validatedata->validate('status','status',false,'',array());

				if (isset($ticketDetails['due_date']) && !empty($ticketDetails['due_date']) && $ticketDetails['due_date'] != "0000-00-00") {
					$ticketDetails['due_date'] = str_replace("/", "-", $ticketDetails['due_date']);
					$ticketDetails['due_date'] = date("Y-m-d", strtotime($ticketDetails['due_date']));
				}

				$fieldData = $this->datatables->mapDynamicFeilds("tickets",$this->input->post());
				$ticketDetails = array_merge($fieldData, $ticketDetails);
					if($method=="PUT")
					{
						$ticketDetails['created_by'] = $this->input->post('SadminID');
						$ticketDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('tickets',$ticketDetails);
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
						$where=array('ticket_id'=>$tickets_id);
						if(!isset($tickets_id) || empty($tickets_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$ticketDetails['modified_by'] = $this->input->post('SadminID');
					$ticketDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('tickets',$ticketDetails,$where);
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
			$ticketDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('tickets',$where);
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
			$where = array("ticket_id"=>$tickets_id);
			$ticketDetails = $this->CommonModel->getMasterDetails('tickets','',$where);

			if(isset($ticketDetails) && !empty($ticketDetails)){

			$status['data'] = $ticketDetails;
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

    public function ticketsChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$where ['ticket_id']= $ids;
				$changestatus = $this->CommonModel->multipleDeleteMasterDetails('tickets','', $where);
				
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