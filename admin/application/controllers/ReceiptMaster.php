<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ReceiptMaster extends CI_Controller
{

	/** 
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the fdefault controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not contacted with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->model('TaxInvoiceModel');
		// $this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		if(!$this->config->item('development'))
		{
			// $this->load->library("EmailsNotifications");
			$this->load->library("NotificationTrigger");
		}
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}


	public function getreceiptDetails(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('receipt_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$donationFromDate = $this->input->post('donationFromDate');
		$donationToDate = $this->input->post('donationToDate');
		$createdFromDate = $this->input->post('createdFromDate');
		$createdToDate = $this->input->post('createdToDate');
		$company_id = $this->input->post('company_id');
		$project_id = $this->input->post('project_id');
		$wherec = $join = array();
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$columnNames = [
			"mode_of_payment" => ["table" => "categories", "alias" => "cpm", "column" => "categoryName", "key2" => "category_id"],
			"customer_id" => ["table" => "customer", "alias" => "c", "column" => "name", "key2" => "customer_id"],
			"company_id" => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
			"account_id" => ["table" => "accounts", "alias" => "ac", "column" => "name", "key2" => "account_id"],
			"created_by" => ["table" => "admin", "alias" => "cb", "column" => "name", "key2" => "adminID"],
		];
		$selectC = 'receipt_id,receipt_number,amount,payment_log_date';
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			unset($postData['donationFromDate']);
			unset($postData['donationToDate']);
			unset($postData['createdFromDate']);
			unset($postData['createdToDate']);
			
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];

			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				
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
			}
		}else{
			foreach ($columnNames as $columnName => $columnData) {
				$jkey = count($join) + 1;
				$join[$jkey]['type'] = "LEFT JOIN";
				$join[$jkey]['table'] = $columnData["table"];
				$join[$jkey]['alias'] = $columnData["alias"];
				$join[$jkey]['key1'] = $columnName;
				$join[$jkey]['key2'] = $columnData["key2"];
				$join[$jkey]['column'] = $columnData["column"];
				$columnNameShow = $columnData["column"];
				if ($selectC != '') {
					$selectC .= ','.$columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
				}else{
					$selectC .= $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
				}
			}
		}
		
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "receipt_number";
			$order = "ASC";
		}
		
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;

		if(isset($donationFromDate) && !empty($donationFromDate)){
			$sDate = date("Y-m-d",strtotime($donationFromDate));
			$wherec["date_of_donation >="] = "'".$sDate."'";
		}
		if(isset($donationToDate) && !empty($donationToDate)){
			$eDate = date("Y-m-d",strtotime($donationToDate));
			$wherec["date_of_donation <="] = "'".$eDate."'";
		}

		if(isset($createdFromDate) && !empty($createdFromDate)){
			$sDate = date("Y-m-d",strtotime($createdFromDate));
			$wherec["created_date >="] = "'".$sDate."'";
		}
		if(isset($createdToDate) && !empty($createdToDate)){
			$eDate = date("Y-m-d",strtotime($createdToDate));
			$wherec["created_date <="] = "'".$eDate."'";
		}
		if(isset($company_id) && !empty($company_id)){
			$wherec["t.company_id"] = ' = "'.$company_id.'"';
		}
		if(isset($project_id) && !empty($project_id)){
			$wherec["t.record_id"] = ' = "'.$project_id.'"';
		}
		
		$adminID = $this->input->post('SadminID');
		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		$config["base_url"] = base_url() . "receiptDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.receipt_id', 'receipts', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if ($isAll == "Y") {	
			$receiptDetails = $this->CommonModel->GetMasterListDetails($selectC,'receipts',$wherec,'','',$join,$other);	
		}else{
			$selectC = $selectC.',attachement';
			$receiptDetails = $this->CommonModel->GetMasterListDetails($selectC, 'receipts', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $receiptDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}
		if ($receiptDetails) {
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
	public function receiptMaster($receipt_id = ""){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$SadminID = $this->input->post('SadminID');
		$loadFrom = $this->input->post('loadFrom');
		$revenueType =$this->input->post('revenueType');
		$loadFrom = isset($loadFrom) ? $loadFrom : '';
		$revenueType = isset($revenueType) ? $revenueType : '';
		if ($loadFrom == 'project' && $revenueType == 'expected' ) {
			$this->expectedRevenue();
			// print_r($receiptDetails);exit;	
		}
		if ($method == "POST" || $method == "PUT") {
			$receiptDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$receiptDetails['company_id'] = $this->company_id;
			$receiptDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer Id', false, '', array());
			$receiptDetails['mode_of_payment'] = $this->validatedata->validate('mode_of_payment', 'Mode of payment', false, '', array());
			$receiptDetails['transaction_id'] = $this->validatedata->validate('transaction_id', 'Transaction id', false, '', array());
			$receiptDetails['notes'] = $this->validatedata->validate('notes', 'Payment Notes', false, '', array());
			$receiptDetails['show_history'] = $this->validatedata->validate('show_history', 'Show History', false, '', array());
			$receiptDetails['amount'] = $this->validatedata->validate('amount', 'payment_amount', false, '', array());
			$receiptDetails['payment_log_date'] = $this->validatedata->validate('payment_log_date', 'Payment Date', true, '', array());
			
			// NEW FIELDS ARE ADDED 
			$receiptDetails['related_to'] = $this->validatedata->validate('related_to', 'Related To', false, '', array());
			$receiptDetails['record_id'] = ($receiptDetails['related_to'] == 'project') ? $this->validatedata->validate('record_id', 'Project id', true, '', array()) : $this->validatedata->validate('record_id', 'Project_id', false, '', array());
			$receiptDetails['account_id'] = $this->validatedata->validate('account_id', 'Bank Account', false, '', array());
			$receiptDetails['income_id'] = $this->validatedata->validate('income_id', 'Income id', false, '', array());

			$fieldData = $this->datatables->mapDynamicFeilds("receipts",$this->input->post());
			$receiptDetails = array_merge($fieldData, $receiptDetails);
			if (isset($receiptDetails['payment_log_date']) && !empty($receiptDetails['payment_log_date']) && $receiptDetails['payment_log_date'] != "0000-00-00") {
				$receiptDetails['payment_log_date'] = str_replace("/", "-", $receiptDetails['payment_log_date']);
				$receiptDetails['payment_log_date'] = date("Y-m-d", strtotime($receiptDetails['payment_log_date']));
			}
			if ($method == "PUT") {	
				$paid_invoice = $this->input->post('paid_invoice'); 
				if (!empty($paid_invoice) && $paid_invoice != '{}') {
					$iscreated = 0;
					$this->db->trans_begin();
					$paid_invoice = json_decode($this->input->post('paid_invoice'),true);
					$invoiceIds = '';
					if (isset($paid_invoice) && !empty($paid_invoice)) {
						foreach ($paid_invoice as $key => $value) {							
							$where = array('invoiceID' => $value['invoiceID']);
							($invoiceIds == '') ?  $invoiceIds .= $value['invoiceID']: $invoiceIds .= ','.$value['invoiceID'] ;
							$this->CommonModel->updateMasterDetails('invoice_header', array('pending_amount'=>$value['new_pending_amt']), $where);
						}
					}
					$receiptDetails['receipt_number'] = $this->generateReceiptNumber('receipt',$company_id);
					$receiptDetails['invoice_id'] = $invoiceIds;
					$receiptDetails['created_by'] = $SadminID;
					
					$iscreated = $this->CommonModel->saveMasterDetails('receipts', $receiptDetails);
					if ($iscreated) {
						$this->db->trans_commit();	
						$lastlogID = $this->db->insert_id();
						$status['lastlogID'] = $lastlogID;
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					}else{
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(322);
						$status['statusCode'] = 322;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
				}else{
					$receiptDetails['amount'] = $this->validatedata->validate('amount', 'Payment Amount', false, '', array());
					$receiptDetails['receipt_number'] = $this->generateReceiptNumber('receipt',$this->company_id);

					$iscreated = $this->CommonModel->saveMasterDetails('receipts', $receiptDetails);
					if ($iscreated) {
						$lastlogID = $this->db->insert_id();
						$status['lastlogID'] = $lastlogID;
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
				}
			} elseif ($method == "POST") {
				$where = array('receipt_id' => $receipt_id);
				if (!isset($receipt_id) || empty($receipt_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->updateMasterDetails('receipts', $receiptDetails, $where);
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
				$receiptDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				
				$iscreated = $this->CommonModel->deleteMasterDetails('receipts', $where);
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
			if($receipt_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$this->menuID = $this->input->post('menuId');
			// print_r($this->menuID);exit;
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
			$wherec["t.receipt_id"] = "=".$receipt_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$receiptDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			if (isset($receiptDetails) && !empty($receiptDetails)) {
				$whereCustomer["t.customer_id ="] = "'".$receiptDetails[0]->customer_id."'";
				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="customer";
				$join[0]['alias'] ="i";
				$join[0]['key1'] ="customer_id";
				$join[0]['key2'] ="customer_id";
				$selectC = "i.name,i.customer_id";
				$createdBy = $this->CommonModel->GetMasterListDetails($selectC, 'customer', $whereCustomer, '', '', $join, '');
				if(!empty($createdBy)){
					$customer_name = $createdBy[0]->name;
					$customer_id = $createdBy[0]->customer_id;
					$receiptDetails[0]->customer_name = $customer_name;
					$receiptDetails[0]->customer_id = $customer_id;
				}
				$status['data'] = $receiptDetails;
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

	public function expectedRevenue(){
		$method = $this->input->method(TRUE);
		$SadminID = $this->input->post('SadminID');
		$expectedRevenue = array();
		$updateDate = date("Y/m/d H:i:s");
		$expectedRevenue['customer_id'] = $this->validatedata->validate('customer_id', 'Customer Id', false, '', array());
		$expectedRevenue['record_id']      = $this->validatedata->validate('record_id', 'Record ID', false, '', array());
		$expectedRevenue['title']          = $this->validatedata->validate('title', 'Title', false, '', array());
		$expectedRevenue['amount']         = $this->validatedata->validate('amount', 'Amount', false, '', array());
		$expectedRevenue['record_type']    = 'revenue';
		$expectedRevenue['customer_id']    = $this->validatedata->validate('customer_id', 'Customer ID', true, '', array());
		$expectedRevenue['account_id']     = $this->validatedata->validate('account_id', 'Account ID', false, '', array());
		$expectedRevenue['category_id']    = $this->validatedata->validate('category_id', 'Category ID', false, '', array());
		
		if ($method == "PUT") {	
			$expectedRevenue['created_by'] = $SadminID;
			$expectedRevenue['created_date']   = $updateDate;
			$iscreated = $this->CommonModel->saveMasterDetails('income_expenses', $expectedRevenue);
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

	public function getExpectedIncomeList(){
		$this->response->decodeRequest();
		$where = array();
		$select = '*';
		$record_type = 'revenue'; // expenses,revenue 
		$customer_id = $this->input->post('customer_id'); 
		$project_id = $this->input->post('project_id'); 
		$where['record_type ='] = "'".$record_type."'";
		$where['customer_id ='] = "'".$customer_id."'";
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

	public function receiptChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$this->db->trans_start();
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			// print_r($ids);exit;
			$changestatus = $this->CommonModel->changeMasterStatus('receipts', $statusCode, $ids, 'receipt_id');
			$confirmationDate = date("Y/m/d H:i:s");
			if ($changestatus) {

				if($statusCode == "approved"){
					$where = array("docTypeID"=>1);
					$donorReciptsDetails['approved_declined_date'] = $confirmationDate;
					$docPreFix = $this->CommonModel->getMasterDetails('doc_prefix','',$where);
					if(!isset($docPreFix) && empty($docPreFix)){
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(227);
						$status['statusCode'] = 227;
						$status['data'] =array();
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}
						$docCurrNo=$docPreFix[0]->docCurrNo;    
                        $length = 4;
                        $docCurrNoStr= substr(str_repeat(0, $length).$docCurrNo, - $length);
						$docYearCD=$docPreFix[0]->docYearCD;
						$docPrefixCD=$docPreFix[0]->docPrefixCD;
						$donorReciptsDetails['receipt_number']=$docPrefixCD."".$docYearCD."/".$docCurrNoStr;
						$where = array("receipt_id"=>$ids);
						$iscreated = $this->CommonModel->updateMasterDetails('receipts',$donorReciptsDetails,$where);
						if (!$iscreated) {
							$this->db->trans_rollback();
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}else
						{
							$this->notificationtrigger->prepareNotification('update','receipts','receipt_id',$ids);
							$where = array("docTypeID"=>1);
							$docCurrNo++;
							$reciptsDetails=array("docCurrNo"=>$docCurrNo);
						
							$iscreated = $this->CommonModel->updateMasterDetails('doc_prefix',$reciptsDetails,$where);
							if (!$iscreated) {
								$this->db->trans_rollback();
								$status['msg'] = $this->systemmsg->getErrorCode(998);
								$status['statusCode'] = 998;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status,200);
							}else
							{
								$this->db->trans_commit();
								$status = array();
								$status['data'] = array();
								$status['statusCode'] = 200;
								$status['flag'] = 'S';
								$this->response->output($status,200);

							}
						}
				}else
				{
					$where = array("receipt_id"=>$ids);
					$receiptDetails = $this->CommonModel->getMasterDetails('receipts', '', $where);
					$datatosend= array();
					$datatosend['field_name'] = 'status';
					$datatosend['field_value'] = 'declined';
					$datatosend['primary_key'] = 'receipt_id';
					$datatosend['primary_value'] = $ids;	
					
					$datatosend['details']= (array) $receiptDetails[0];

					$datatosend['user_type'] = 'system_user';
					if(!$this->config->item('development'))
						$this->notificationtrigger->sendEmailNotification('receipts','update',$datatosend);

					$datatosend['user_type'] = 'customer';
					if(!$this->config->item('development'))
						$this->notificationtrigger->sendEmailNotification('receipts','update',$datatosend);
				}
				$this->db->trans_commit();
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

	public function deleteReceipts()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		
		if (trim($action) == "changeStatus") {
			$where = array();
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$where['receipt_id'] = $ids;
			$changestatus = $this->CommonModel->deleteMasterDetails('receipts','', $where);
		
			if ($changestatus) {			
				// print_r($ids);exit;
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

	public function printReceipt($log_id)
	{
		$data= array();
		$pdfFilePath = '';
		// RECEIPT DETAILS
		$wherer['receipt_id = '] = $log_id;
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		$receiptDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$wherer,'','',$join,$other=array());
		// // INVOICE DETAILS
		if (isset($receiptDetails[0]->invoice_id) && !empty($receiptDetails[0]->invoice_id)) {
			$invoiceIDS = explode(',',$receiptDetails[0]->invoice_id);
			$taxInvoices = array();
			foreach ($invoiceIDS as $key => $ids) {
				$wheret = array("invoiceID"=>$ids);
				$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wheret);
				$taxInvoices[] = $taxInvoiceData[0];
			}		
		}	

		// INFO DETAILS
		$wherec = array("infoID"=> $receiptDetails[0]->company_id);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);

		// CUSTOMER DETAILS
		$wherec = array("customer_id"=>$receiptDetails[0]->customer_id);
		$customerDetails = $this->CommonModel->getMasterDetails("customer","name,address,gst_no,mobile_no,state",$wherec);

		$data['receiptDetails']= $receiptDetails;
		$data['infoSettings']= $contract;	
		$data['customerDetails'] = $customerDetails;
		$data['taxInvoiceData']= $taxInvoices;

		$pdfFilePath = $this->load->view("receiptPdf",$data,true);
		if(!$this->config->item('development')){
			// LOAD PDF LIB
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			$this->mpdfci->Output();  
		}else
		{
			print_r($pdfFilePath);
		}  
	}

	public function getAllInvoices(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$customerID = $this->input->post('customerID');
		$statusCode = $this->input->post('status');
		$wheredoct["customer_id = "] = $customerID;
		$wheredoct["status = "] = $statusCode;
		$wheredoct["record_type ="] = 'invoice';
		$wheredoct["pending_amount > "] = 0;
		$invoices = $this->CommonModel->getMasterDetails("invoice_header","",$wheredoct);
		if(!$invoices){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(307);
			$status['statusCode'] = 307;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}else
		{
			$status['data'] = $invoices;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}
	}
	
	public function generateReceiptNumber($record_type='',$company_id='')
	{
		$wheredoct = array();
		$wheredoct['company_id'] = $company_id;
		if (!isset($company_id) && empty($company_id)) {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(307);
			$status['statusCode'] = 307;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		if($record_type == "invoice")
			$wheredoct["docPrintForm"] = "Invoice";
		else if($record_type == "quotation")
			$wheredoct["docPrintForm"] = "Quotation";
		else if($record_type == "delivery")
			$wheredoct["docPrintForm"] = "Delivery Challan";
		else if($record_type == "receipt")
			$wheredoct["docPrintForm"] = "Receipts";
		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		// UPDATE INVOICE NUMBER
		$receiptDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.'/'.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo).'/'.$lastInvoiceDetails[0]->docYearCD;
		$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
		$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
		if(!$isupdate){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(277);
			$status['statusCode'] = 277;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}else
		{
			return $receiptDetails['invoiceNumber'];
		}
	}
	public function getCustomerList(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$tableName = $this->input->post('tableName');
		$where = $this->input->post('wherec');
		$select = $this->input->post('list');
		$company_id = $this->input->post('company_id');
		if(isset($company_id) && !empty($company_id) ){
			$wherec["t.company_id"] = 'IN ("'.$company_id.'")';
		}
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec[ "$where like  "] = "'%" . $text . "%'";
			$wherec[ "type like  "] = "'%customer%'";
			
			if($tableName != "country" && $tableName != "state" && $tableName != "city"){
				$wherec["t.status"] = 'IN ("active")';
			}
			$updateAns = $this->CommonModel->GetMasterListDetails($select, $tableName, $wherec);
			// print $this->db->last_query();exit;
			if (isset($updateAns) && !empty($updateAns)) {
				$status['msg'] = "sucess";
				$status['data'] = $updateAns;
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}
	}

	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['receipt_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('receipts', '',$whereIn);
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
