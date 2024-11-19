<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->helper('form');
		$this->load->model('CommonModel');
		$this->load->model('DashboardModel');
		if(!$this->config->item('development'))
		{
			$this->load->library("emails");
		}
		$this->load->library('ValidateData');
	}
	public function index(){
		$this->load->view('welcome_message');
	}
	public function getDashboardList(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();

		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$user_id = $this->input->post('SadminID');
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "dashboard_id";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		$wherec = $join = array();
		if (isset($user_id) || !empty($user_id)) {
			$wherec['user_id = '] = $user_id;
		}
		$dashboardList = $this->CommonModel->GetMasterListDetails($selectC = '', 'dashboard', $wherec, '', '', $join, $other);
		$status['data'] = $dashboardList;
		if ($dashboardList) {
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
	public function dashboardMaster($dashboard_id = ""){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$user_id = $this->input->post('SadminID');
		
		if ($method == "POST" || $method == "PUT") {
			$dashboardDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$dashboardDetails['name'] = $this->validatedata->validate('name', 'Title', true, '', array());
			$dashboardDetails['body'] = $this->validatedata->validate('body', 'Body', false, '', array());
			$dashboardDetails['details'] = $this->validatedata->validate('details', 'details', false, '', array());
			$dashboardDetails['status'] = $this->validatedata->validate('status', 'details', false, '', array());

			if ($method == "PUT") {
				$dashboardDetails['user_id'] = $user_id;
				$dashboardDetails['created_by'] = $this->input->post('SadminID');
				$dashboardDetails['created_date'] = $updateDate;
				if (!isset($dashboardDetails['details']) || empty($dashboardDetails['details'])) {
					$dashboardDetails['details'] = '{}';
				}
				$iscreated = $this->CommonModel->saveMasterDetails('dashboard', $dashboardDetails);
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
				$where = array('dashboard_id' => $dashboard_id);
				if (!isset($dashboard_id) || empty($dashboard_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$dashboardDetails['modified_by'] = $this->input->post('SadminID');
				$dashboardDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('dashboard', $dashboardDetails, $where);
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
				$dashboardDetails = array();
				$where = array('dashboard_id' => $dashboard_id);
				if (!isset($dashboard_id) || empty($dashboard_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('dashboard', $where);
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
			$wherec["user_id"] = $user_id;
			if($dashboard_id !=""){
				// MAKE ALL DASHBAORDS INACTIVE
				$dashboardDetails['status'] = 'inactive';
				$updateStatus = $this->CommonModel->updateMasterDetails('dashboard', $dashboardDetails, $wherec);
				// MAKE SELECTED DASHBAORDS ACTIVE
				$wherec["dashboard_id"] = $dashboard_id;
				$dashboardDetails['status'] = 'active';
				$updateStatus = $this->CommonModel->updateMasterDetails('dashboard', $dashboardDetails, $wherec);
				$dashboardDetails = $this->CommonModel->GetMasterDetails('dashboard', '*', $wherec);
			}else{
				$wherec["status"] = 'active';
				$dashboardDetails = $this->CommonModel->GetMasterDetails('dashboard', '*', $wherec);
			}
			if (isset($dashboardDetails) && !empty($dashboardDetails)) {
				$status['data'] = $dashboardDetails;
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

	public function deleteDashboard(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$dashboard_id = $this->input->post('dashboard_id');
		if (!isset($dashboard_id) || empty($dashboard_id)) {
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$where = array('dashboard_id' => $dashboard_id);
		$iscreated = $this->CommonModel->deleteMasterDetails('dashboard', $where);
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
	public function updateDashboard(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$dashboard_id = $this->input->post('dashboard_id');
		$name = $this->input->post('name');
		$details = $this->input->post('details');
		if (!isset($dashboard_id) || empty($dashboard_id)) {
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$where = array('dashboard_id' => $dashboard_id);
		if (isset($name) && !empty($name)) {
			$dashboardDetails['name'] = $name;
		}
		if (isset($details) && !empty($details)) {
			$dashboardDetails['details'] = $details;
		}
		$dashboardDetails['modified_by'] = $this->input->post('SadminID');
		$dashboardDetails['modified_date'] = date("Y/m/d H:i:s");
		$isUpdated = $this->CommonModel->updateMasterDetails('dashboard', $dashboardDetails, $where);
		if (!$isUpdated) {
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

	public function getDashboardCount(){
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID=$this->input->post('SadminID');
		$statusInfo = new stdClass();
		$statusInfo->ourTarget = 0;
		$statusInfo->OurAchived = 0;
		$statusInfo->myaTarget = 0;
		$statusInfo->achived = 0;
		// $statusInfo->totalItem = $totalItem;
		
		$where=array("infoID"=>2);
		$ourTarget=$this->CommonModel->getMasterDetails("info_settings","ourTarget",$where);
		
		$where=array("adminID"=>$adminID);
		$myTarget=$this->CommonModel->getMasterDetails("user_extra_details","myTarget",$where);

		$where=array("status"=>"active","pointOfContactName"=>$adminID,"confirmationStatus"=>"Approved");
		$achivedData=$this->CommonModel->getMasterDetails("donorRecipts","amountInFigure",$where);

		$where=array("status"=>"active","confirmationStatus"=>"Approved");
		$OurAchivedData=$this->CommonModel->getMasterDetails("donorRecipts","amountInFigure",$where);

		
		$pocwisedata=$this->DashboardModel->getAllPOCArchivedTarget($where=array("t.status"=>"active","confirmationStatus"=>"Approved"));
		$pocwisedataOther=$this->DashboardModel->getAllPOCArchivedTargetOther($where=array("status"=>"active","confirmationStatus"=>"Approved","pointOfContact"=>"Other"));


		$ourAchivedAmt=0;
		if(isset($OurAchivedData)&&!empty($OurAchivedData))
		{
			foreach ($OurAchivedData as $key => $value) {
				$ourAchivedAmt+=$value->amountInFigure;
			}

		}

		$achivedAmt=0;
		if(isset($achivedData)&&!empty($achivedData))
		{
			foreach ($achivedData as $key => $value) {
				$achivedAmt+=$value->amountInFigure;
			}

		}
		$statusInfo->ourTarget = $ourTarget[0]->ourTarget;
		$statusInfo->myTarget = $myTarget[0]->myTarget;
		$statusInfo->achived = $achivedAmt;
		$statusInfo->ourAchivedAmt = $ourAchivedAmt;
		$statusInfo->pocwisedata = $pocwisedata;
		$statusInfo->pocwisedataOther = $pocwisedataOther;
		$status['data'] =$statusInfo;
		$status['statusCode'] = 200;
		$status['flag'] = 'S';
		$this->response->output($status,200);
	}
	public function getReceiptsTotal(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$now = new DateTime();

		$this_month = 0;
		$this_week = 0;
		$total = 0;

		// $curPage = $this->input->post('curpage');
		$filterSName = $this->input->post('filterSName');
		$donationFromDate = $this->input->post('donationFromDate');
		$donationToDate = $this->input->post('donationToDate');
		$createdFromDate = $this->input->post('createdFromDate');
		$createdToDate = $this->input->post('createdToDate');
		$payment_id = $this->input->post('payment_id');
		$donation_id = $this->input->post('donation_id');
	
		//total
		// last week
		$l_sunday = $now->modify('last sunday');
		$l_monday = clone $now;
		$l_monday = $l_monday->modify('last monday');

		$l_monday = $l_monday->format('Y-m-d');	
		$l_sunday = $l_sunday->format('Y-m-d');
		
		// print($l_monday);
		// print($l_sunday);
		//last monnth 
		// $startOfMonth = clone $now;
		// $startOfMonth->modify('first day of this month');

		// $endOfMonth = clone $now;
		// $endOfMonth->modify('last day of this month');
		
		// $endOfMonth = $endOfMonth->format('Y-m-d');
		// $startOfMonth = $startOfMonth->format('Y-m-d');
		$firstDayOfMonth = date('Y-m-01');
		$lastDayOfMonth = date('Y-m-t');

		$amountData['totalamount'] = number_format($this->getDetailsbet('receipts','approved','','')); 
		$amountData['totalthisweek'] = number_format($this->getDetailsbet('receipts','approved',$l_monday,$l_sunday)); 
		$amountData['totalthismonth'] = number_format($this->getDetailsbet('receipts','approved',$firstDayOfMonth,$lastDayOfMonth));  
		if ($amountData) {
			$status['data'] = $amountData;
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
	public function getDonours(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$now = new DateTime();

		$this_month = 0;
		$this_week = 0;
		$total = 0;

		// last week
		$l_sunday = $now->modify('sunday');
		$l_monday = clone $l_sunday;
		$l_monday = $l_monday->modify('last monday');

		$l_monday = $l_monday->format('Y-m-d');	
		$l_sunday = $l_sunday->format('Y-m-d');
	
		$firstDayOfMonth = date('Y-m-01');
		$lastDayOfMonth = date('Y-m-t');

		$amountData['totalDonors'] = $this->getDetailsbet('customer','active','',''); 
		$amountData['donorsthisweek'] = $this->getDetailsbet('customer','active',$l_monday,$l_sunday); 
		$amountData['donorsthismonth'] = $this->getDetailsbet('customer','active',$firstDayOfMonth,$lastDayOfMonth);  
		if ($amountData) {
			$status['data'] = $amountData;
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
	public function getDetailsbet($table='',$statuscode = '',$startDate='',$endDate=''){
		$total = 0 ;
		$wherec = array();
		$other = $join = array();
		
		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
		// print_r($wherec);
		if(isset($table) && $table == 'receipts')
		{
			if(isset($startDate) && !empty($startDate)){
				$sDate = date("Y-m-d",strtotime($startDate));
				$wherec["approved_declined_date >="] = "'".$sDate."'";
			}
			if(isset($endDate) && !empty($endDate)){
				$eDate = date("Y-m-d",strtotime($endDate));
				$wherec["approved_declined_date <="] = "'".$eDate."'";
			}
			 
			$details = $this->CommonModel->GetMasterListDetails($selectC='*',$table,$wherec,'','',$join,$other);	
			foreach ($details as $det => $detail) {
				$total = $total + $detail->donation_amount;
			}
			// print_r($details);
		}
		else if (isset($table) && $table == 'customer') {
			// print_r($wherec);
			if(isset($startDate) && !empty($startDate)){
				$sDate = date("Y-m-d",strtotime($startDate));
				$wherec["created_date >="] = "'".$sDate."'";
			}
			if(isset($endDate) && !empty($endDate)){
				$eDate = date("Y-m-d",strtotime($endDate));
				$wherec["created_date <="] = "'".$eDate."'";
			} 
			
			$details = $this->CommonModel->GetMasterListDetails($selectC='*',$table,$wherec,'','',$join,$other);		
			$total = count($details);
		}
		return $total;
	}
	public function getVolunteersDetail(){
	
		$this->access->checkTokenKey();
		$this->response->decodeRequest();

		$statuscode = 'active';
	
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$other = array("orderBy" => $orderBy, "order" => $order);
		
		$wherec = $join = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}

		if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["status"] = 'IN ("' . $statusStr . '")';
		}
		
		$adminDetails = $this->CommonModel->GetMasterListDetails($selectC="*", 'admin', $wherec, '', '', $join, $other);
		if(isset($adminDetails) && !empty($adminDetails))
		{
			foreach ($adminDetails as  $admin) {
				$admin->total = $this->getVolunteerContribution($admin->adminID);
			}
		}	
		$adminDetails = $this->sortVolunteers($adminDetails);
		$adminDetails = array_slice($adminDetails,0,10);
		foreach ($adminDetails as $ind => $admin) {
			if ($admin->total['totalDonationAmt'] == 0 ) {
				unset($adminDetails[$ind]);
			}
		}
		if ($adminDetails) {
			$status['data'] = $adminDetails;
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else
		{
			$status['data'] = $adminDetails;
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function getVolunteerContribution($adminID=''){
		$total = array('totalDonors'=>0,'totalDonationAmt'=>0) ;
		
		$wherec = array();
		$wherec['acknowledge_by='] = $adminID;
		// $wherec['status'] = "IN 'Approved'";
		$wherec["t.status"] = 'IN ("Approved")';

		$other = $join = array();
	
		$details = $this->CommonModel->GetMasterListDetails($selectC='*','receipts',$wherec,'','',$join,$other);	
		foreach ($details as $detail) {
			$total['totalDonationAmt'] = $total['totalDonationAmt'] + $detail->donation_amount;
			$total['totalDonors'] = $total['totalDonors'] + 1;
		}
		return $total;
	}
	public function sortVolunteers($details){
		$data = array();
		function compareDonation($a, $b) {
			return $a->total['totalDonationAmt'] - $b->total['totalDonationAmt'];
		}
		usort($details, 'compareDonation');
		
		return array_reverse($details);
	}
	public function getChartDetails(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$chartData = array();

		$isAll = $this->input->post('getAll');
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "categoryName";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);
		$wherec = $join = array();
		$wherec["t.status"] = 'IN ("active")';		
		$wherec["t.slug"] = 'IN ("payment")';
		$adminID = $this->input->post('SadminID');
		$join = array();
		$paymentMethods = array();
		$categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id', 'categories', $wherec, '', '', $join, $other);
		$wherec = array();
		foreach ($categoryDetails as $key => $value) {
			$wherec["t.parent_id"] = ' = "'.$value->category_id.'"';
			$wherec["t.status"] = 'IN ("active")';
			$subcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC='category_id,categoryName','categories',$wherec,'','',$join,$other);
			$paymentMethods =  $subcategoryDetails;
		}
		$chartData['paymentMethods'] = $paymentMethods; 

		$chartData['total'] = $this->getDetailsByMethods($paymentMethods);
		// print_r($chartData['paymentMethods']);
		// print_r($chartData['total']);exit;
		if ($chartData) {
			$status['data'] = $chartData;
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
	public function getDetailsByMethods($paymentMethods = ''){		
		$wherec = array();
		$total = array();

		foreach ($paymentMethods as $key => $value) {
			$wherec["t.status"] = 'IN ("Approved")';	
			$wherec['payment_method ='] = $value->category_id ;
			$other = $join = array();	
			$details = $this->CommonModel->GetMasterListDetails($selectC='*','receipts',$wherec,'','',$join,$other);	
			$total[$key]['category_id'] = $value->category_id ;
			$total[$key]['categoryName'] = $value->categoryName ;
			$total[$key]['count'] = count($details) ;
		}
		return $total;
	}

}
