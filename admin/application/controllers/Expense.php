<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Expense extends CI_Controller {

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


	public function getexpensesDetails()
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
		$projectID = $this->input->post('project_id');
		// $category = $this->input->post('category');
		// $expense_by = $this->input->post('expense_by');
		// $approver_id = $this->input->post('approver_id');
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
			unset($postData['fromDate']);
			unset($postData['toDate']);
			// unset($postData['category']);
			// unset($postData['expense_by']);
			// unset($postData['approver_id']);
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];

			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"expense_by" => ["table" => "admin", "alias" => "ae", "column" => "name", "key2" => "adminID"],
					"approver_id" => ["table" => "admin", "alias" => "aa", "column" => "name", "key2" => "adminID"],
					"bank_account" => ["table" => "accounts", "alias" => "ac", "column" => "name", "key2" => "account_id"],
					"expense_type" => ["table" => "categories", "alias" => "et", "column" => "categoryName", "key2" => "category_id"],
					"project_id" => ["table" => "projects", "alias" => "p", "column" => "title", "key2" => "project_id"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],	
				];
				foreach ($columnNames as $columnName => $columnData) {
					$jkey = count($join) + 1;
					$join[$jkey]['type'] = "LEFT JOIN";
					$join[$jkey]['table'] = $columnData["table"];
					$join[$jkey]['alias'] = $columnData["alias"];
					$join[$jkey]['key1'] = $columnName;
					$join[$jkey]['key2'] = $columnData["key2"];
					$join[$jkey]['column'] = $columnData["column"];
					if (in_array($columnName, $colData)) {
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}				
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}
		}
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "expenses_id";
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

		// if(isset($statusfilter) && !empty($statusfilter)){
		// 	$statusString = str_replace(",",'","',$statusfilter);
		// 	$wherec["t.status"] = 'IN ("' . $statusString . '")';
		// }

		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["expense_date >="] = "'".$sDate."'";
		}
		if (isset($endDate) && !empty($endDate)) {
			$eDate = date("Y-m-d", strtotime($endDate));
			$wherec["expense_date <="] = "'" . $eDate . "'";
		}

		// if (isset($category) && !empty($category)) {
		// 	$categoryString = str_replace(",",'","',$category);
		// 	$wherec["category"] = 'IN ("' . $categoryString . '")';
		// }

		// if (isset($approver_id) && !empty($approver_id)) {
		// 	$approverString = str_replace(",",'","',$approver_id);
		// 	$wherec["approver_id"] = 'IN ("' . $approverString . '")';
		// }

		// if (isset($expense_by) && !empty($expense_by)) {
		// 	$expenseString = str_replace(",", '","', $expense_by);
		// 	$wherec["expense_by"] = 'IN ("' . $expenseString . '")';
		// }
		
		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
			if (isset($projectID) && !empty($projectID)) {
				$wherec["t.project_id ="] = '"' . $projectID . '"';
			}
		}
	
		$config["base_url"] = base_url() . "expenseDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.expenses_id','expenses',$wherec,$other);
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
			$expenseDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*",'expenses',$wherec,'','',$join,$other);	
		}else{
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="a";
			$join[$jkey]['key1'] ="expense_by";
			$join[$jkey]['key2'] ="adminID";

			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="categories";
			$join[$jkey]['alias'] ="c";
			$join[$jkey]['key1'] ="category";
			$join[$jkey]['key2'] ="category_id";
			
			$selectC = "t.expenses_id,t.expense_date,t.merchant,t.amount,t.status,a.name,c.categoryName AS expense_Category,".$selectC;
			$expenseDetails = $this->CommonModel->GetMasterListDetails($selectC, 'expenses', $wherec, $config["per_page"], $page, $join, $other);
		}

		// $join = array();
		// $join[0]['type'] ="LEFT JOIN";
		// $join[0]['table']="admin";
		// $join[0]['alias'] ="a";
		// $join[0]['key1'] ="expense_by";
		// $join[0]['key2'] ="adminID";

		// $join[1]['type'] ="LEFT JOIN";
		// $join[1]['table']="categories";
		// $join[1]['alias'] ="c";
		// $join[1]['key1'] ="category";
		// $join[1]['key2'] ="category_id";

		// if($isAll=="Y"){
		// 	$selectC = "*";
		// 	$expenseDetails = $this->CommonModel->GetMasterListDetails($selectC,'expenses',$wherec,'','',$join,$other);	
		// }else{
		// 	$selectC = "t.*, a.name, c.categoryName AS expense_Category";
		// 	$expenseDetails = $this->CommonModel->GetMasterListDetails($selectC,'expenses',$wherec,$config["per_page"],$page,$join,$other);
		// }

		$status['data'] = $expenseDetails;
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
		if($expenseDetails){
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

	public function expence($expenses_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$loadFrom = $this->input->post('loadFrom');
		$revenueType =$this->input->post('revenueType');
		$loadFrom = isset($loadFrom) ? $loadFrom : '';
		$revenueType = isset($revenueType) ? $revenueType : '';
		if ($loadFrom == 'project' && $revenueType == 'expected' ) {
			$this->expectedExpense();
		}
		if($method=="POST"||$method=="PUT")
		{
				$expenseDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				$expenseDetails['expense_title'] = $this->validatedata->validate('expense_title','Expense Title',true,'',array());
				$expenseDetails['category'] = $this->validatedata->validate('category','category',false,'',array());
				$expenseDetails['expense_by'] = $this->validatedata->validate('expense_by','expense_by',false,'',array());
				$expenseDetails['expense_type'] = $this->validatedata->validate('expense_type','expense_type',false,'',array());
				$expenseDetails['expense_date'] = $this->validatedata->validate('expense_date','expense_date',false,'',array());
				$expenseDetails['merchant'] = $this->validatedata->validate('merchant','merchant',false,'',array());
				$expenseDetails['amount'] = $this->validatedata->validate('amount','amount',false,'',array());
				$expenseDetails['claim_reimbursement'] = $this->validatedata->validate('claim_reimbursement','claim_reimbursement',false,'',array());
				$expenseDetails['paid_by'] = $this->validatedata->validate('paid_by','paid_by',false,'',array());
				$expenseDetails['transaction_id'] = $this->validatedata->validate('transaction_id','transaction_id',false,'',array());
				$expenseDetails['payee_name'] = $this->validatedata->validate('payee_name','payee_name',false,'',array());
				$expenseDetails['comment'] = $this->validatedata->validate('comment','comment',false,'',array());
				$expenseDetails['attachment'] = $this->validatedata->validate('attachment','attachment',false,'',array());
				$expenseDetails['status'] = $this->validatedata->validate('status','status',false,'',array());
				$expenseDetails['approver_id'] = $this->validatedata->validate('approver_id','approver_id',false,'',array());
				$expenseDetails['related_to'] = $this->validatedata->validate('related_to','Related To',false,'',array());
				
				if (isset($expenseDetails['related_to']) && !empty($expenseDetails['related_to'])) {
					($expenseDetails['related_to'] == 'project') ? 
						$expenseDetails['project_id'] = $this->validatedata->validate('project_id','Project',true,'',array()):
						$expenseDetails['project_id'] = $this->validatedata->validate('project_id','Project',false,'',array());
				}
				$expenseDetails['bank_account'] = $this->validatedata->validate('bank_account','Bank Account',false,'',array());

				if (isset($expenseDetails['expense_date']) && !empty($expenseDetails['expense_date']) && $expenseDetails['expense_date'] != "0000-00-00") {
					$expenseDetails['expense_date'] = str_replace("/", "-", $expenseDetails['expense_date']);
					$expenseDetails['expense_date'] = date("Y-m-d", strtotime($expenseDetails['expense_date']));
				}

				$fieldData = $this->datatables->mapDynamicFeilds("expences",$this->input->post());
				$expenseDetails = array_merge($fieldData, $expenseDetails);
					if($method=="PUT")
					{
						$expenseDetails['created_by'] = $this->input->post('SadminID');
						$expenseDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('expenses',$expenseDetails);
						if(!$iscreated){
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);

						}else{
							$lastLessonID = $this->db->insert_id();
							$this->renameFolder($lastLessonID);
							
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] =array();
							$status['flag'] = 'S';
							$this->response->output($status,200);
						}

					}elseif($method=="POST")
					{
						$where=array('expenses_id'=>$expenses_id);
						if(!isset($expenses_id) || empty($expenses_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$expenseDetails['modified_by'] = $this->input->post('SadminID');
					$expenseDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('expenses',$expenseDetails,$where);
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
			$expenseDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('expenses',$where);
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
			if($expenses_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

			$this->menuID = $this->input->post('menuId');
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
			$wherec["t.expenses_id"] = "=".$expenses_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$expenseDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());

			// $where = array("expenses_id"=>$expenses_id);
			// $expenseDetails = $this->CommonModel->getMasterDetails('expenses','',$where);

			$wherec["expenses_id ="] = "'".$expenses_id."'";
			$join=array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="a";
			$join[0]['key1'] ="expense_by";
			$join[0]['key2'] ="adminID";
			$selectC = "a.name AS adminName";
			$adminName = $this->CommonModel->GetMasterListDetails($selectC, 'expenses', $wherec, '', '', $join, '');
			if(!empty($adminName)){
				$name = array_column($adminName,'adminName');
				$expenseDetails[0]->adminName = $name;
			}

			if(isset($expenseDetails) && !empty($expenseDetails)){

			$status['data'] = $expenseDetails;
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

    public function expencesChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$where ['expenses_id']= $ids;
				$changestatus = $this->CommonModel->multipleDeleteMasterDetails('expenses','', $where);
				
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

	public function receiptUpload($expense_id = ''){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		
		$extraData = array();
		$mediapatharr = $this->config->item("mediaPATH") ."expense/".$expense_id ;
		
		if (empty($expense_id) || $expense_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."expense/temp-";
			if (!is_dir($mediapatharr)) {
				if (mkdir($mediapatharr, 0777, true)) {
				} else {
					$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
		if (!is_dir($mediapatharr)) {
			mkdir($mediapatharr, 0777);
			chmod($mediapatharr, 0777);
		} else {
			if (!is_writable($mediapatharr)) {
				chmod($mediapatharr, 0777);
			}
		}
		$extraData["expenses_id"] = $expense_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'expenses',
			'fileTypeColumn' => '',
			'fileColumn' => 'attachment',
			'forignKey' => '',
			'forignValue' => '',
			'primaryKey' => 'expenses_id',
			'primaryValue' => $expense_id,
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'isUpdate' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}

	public function renameFolder($expense_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$oldName = $this->config->item("mediaPATH") ."expense/temp-";
		$newName = $this->config->item("mediaPATH") ."expense/".$expense_id;
		if (!is_dir($oldName)) {

		}else 
		{
			$is_renamed = rename($oldName,$newName);
		}
	}

	public function expectedExpense(){
		$method = $this->input->method(TRUE);
		$SadminID = $this->input->post('SadminID');
		$expectedExpense = array();
		$updateDate = date("Y/m/d H:i:s");
		$expectedExpense['customer_id'] = $this->validatedata->validate('customer_id', 'Customer Id', false, '', array());
		$expectedExpense['record_id']      = $this->validatedata->validate('project_id', 'Record ID', false, '', array());
		$expectedExpense['title']          = $this->validatedata->validate('expense_title', 'Title', false, '', array());
		$expectedExpense['amount']         = $this->validatedata->validate('amount', 'Amount', false, '', array());
		$expectedExpense['record_type']    = 'expenses';
		$expectedExpense['account_id']     = $this->validatedata->validate('bank_account','Bank Account',false,'',array());
		$expectedExpense['category_id']    = $this->validatedata->validate('category_id', 'Category ID', false, '', array());
		
		if ($method == "PUT") {	
			$expectedExpense['created_by'] = $SadminID;
			$expectedExpense['created_date']   = $updateDate;
			$iscreated = $this->CommonModel->saveMasterDetails('income_expenses', $expectedExpense);
			if ($iscreated) {
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] = array();
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else{
				$status['msg'] = $this->systemmsg->getErrorCode(322);
				$status['statusCode'] = 322;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} elseif ($method == "POST") {
			// $expectedRevenue['modified_by']    = $SadminID;
			// $expectedRevenue['modifies_date']  = $updateDate;
			// $where = array('receipt_id' => $receipt_id);
			// if (!isset($receipt_id) || empty($receipt_id)) {
			// 	$status['msg'] = $this->systemmsg->getErrorCode(998);
			// 	$status['statusCode'] = 998;
			// 	$status['data'] = array();
			// 	$status['flag'] = 'F';
			// 	$this->response->output($status, 200);
			// }
			// $iscreated = $this->CommonModel->updateMasterDetails('income_expenses', $receiptDetails, $where);
			// if (!$iscreated) {
			// 	$status['msg'] = $this->systemmsg->getErrorCode(998);
			// 	$status['statusCode'] = 998;
			// 	$status['data'] = array();
			// 	$status['flag'] = 'F';
			// 	$this->response->output($status, 200);
			// } else {
			// 	$status['msg'] = $this->systemmsg->getSucessCode(400);
			// 	$status['statusCode'] = 400;
			// 	$status['data'] = array();
			// 	$status['flag'] = 'S';
			// 	$this->response->output($status, 200);
			// }
		}
	}

	public function getExpectedExpenseList(){
		$this->response->decodeRequest();
		$where = array();
		$select = '*';
		$record_type = 'expenses'; // expenses,revenue 
		$project_id = $this->input->post('project_id') ; 
		$where['record_type ='] = "'".$record_type."'";
		$where['record_id ='] = "'".$project_id."'";
		$expetedIncomeList = $this->CommonModel->GetMasterListDetails($select, 'income_expenses', $where);
		if ($expetedIncomeList) {
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] = $expetedIncomeList;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function removeAttachents(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$expense_id = $this->input->post('expense_id') ; 
		$attachment_name = $this->input->post('attachment_name') ; 

		$file = $this->config->item("mediaPATH").'expense/'.$expense_id.'/'.$attachment_name;

		if(file_exists($file)){
			$this->load->helper("file");
			unlink($file);
			if(!file_exists($file)){
				$status['msg'] = $this->systemmsg->getSucessCode(427);
				$status['statusCode'] = 427;
				$status['data'] = array();
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else{
				$status['msg'] = $this->systemmsg->getErrorCode(312);
				$status['statusCode'] = 312;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(311);
			$status['statusCode'] = 311;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
        	}
	}

	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['expenses_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('expenses', '',$whereIn);
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

 }