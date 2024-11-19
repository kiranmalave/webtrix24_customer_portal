<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class TaxInvoice extends CI_Controller {

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
		$this->load->helper('form');
		$this->load->model('TaxInvoiceModel');
		$this->load->model('CreditModel');
		$this->load->model('BillingModel');
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library('ValidateData');
		$this->load->library("Datatables");
		$this->load->library("Filters");
		
	}
	public function index(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = $this->input->post('SadminID');
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$statuscode = $this->input->post('status');
		$record_type = $this->input->post('record_type');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$filterCName = $this->input->post('filterCName');
		$config = $this->config->item('pagination');
		$projectID = $this->input->post('project_id');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join  = $other = array();
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"company_id" => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
					"project_id" => ["table" => "projects", "alias" => "pr", "column" => "title", "key2" => "project_id"],	
					"state_id" => ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"],
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
				$selectC = ltrim($selectC, ',');
			}
		}
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "invoiceNumber";
			$order ="DESC";
		}

		$other['orderBy'] = $orderBy;
		$other['order'] = $order;
		
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}
		if(isset($filterCName) && !empty($filterCName)){
			$wherec["t.customer_id"] = ' = "'.$filterCName.'"';
		}
		if(isset($record_type) && !empty($record_type)){
			$wherec["t.record_type"] = ' = "'.$record_type.'"';
		}
		if(isset($statuscode) && !empty($statuscode)){
			$wherec["t.status"] = ' = "'.$statuscode.'"';
		}
		if(isset($this->company_id) && !empty($this->company_id)){
			$wherec["t.company_id"] = ' = "'.$this->company_id.'"';
		}
		if(isset($projectID) && !empty($projectID)){
			$wherec["t.project_id"] = ' = "'.$projectID.'"';
		}
		// get comapny access list
		$adminID = $this->input->post('SadminID');
		
		// if ($isAll == "Y") {
		// 	$join = $wherec = array();
		// 	if (isset($statuscode) && !empty($statuscode)) {
		// 		$statusStr = str_replace(",", '","', $statuscode);
		// 		$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// 	}
		// }
		$config["base_url"] = base_url() . "members";
		$config["total_rows"] = $this->TaxInvoiceModel->getTotalTaxInvoice('invoiceID','invoice_header',$wherec,$other);
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
			$memberDetails = $this->TaxInvoiceModel->getTaxInvoiceDetails($selectC = 't.*', 'invoice_header', $wherec, '', '', $join, $other);
		} else {
			$memberDetails = $this->TaxInvoiceModel->getTaxInvoiceDetails($selectC,'invoice_header',$wherec,$config["per_page"],$page,$join,$other);
		}
		
		$status['data'] = $memberDetails;
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
		if($memberDetails){
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['noRecords'] = false;
			$this->response->output($status,200);

		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$status['noRecords'] = true;
			$this->response->output($status,200);
		}
	}
	public function getTaxInvoiceDetails($ID=''){
		$this->response->decodeRequest();
		$this->access->checkTokenKey();
		$wherec = array("invoiceID"=>$ID);
		$select = "*,DATE_FORMAT(invoiceDate,'%d-%m-%Y') as invoiceDate,DATE_FORMAT(payment_date,'%d-%m-%Y') as payment_date,DATE_FORMAT(valid_until_date,'%d-%m-%Y') as valid_until_date,DATE_FORMAT(reminder_send_date,'%d-%m-%Y') AS reminder_send_date";
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle($select,$wherec);
	 	$invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$wherec);
	 	$wherelogs = array("invoice_id = "=>$ID);
		$inDetails = $this->CommonModel->GetMasterListDetails($selectC="t.receipt_number,t.amount",'receipts',$wherelogs,'','',array(),$other=array());
	 	if(isset($taxInvoiceData) && !empty($taxInvoiceData)){
			$taxInvoiceData[0]->invoiceLine = $invoiceLine;
			$taxInvoiceData[0]->paymentLogs = $inDetails;
			// print_r($taxInvoiceData);
			$status['data'] = $taxInvoiceData;
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
	public function taxInvoiceChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$record_type = $this->input->post("record_type");
			if ($statusCode == 'approved')
			{
				$wheredoct['company_id'] = $this->company_id;
				if($record_type == "invoice")
					$wheredoct["docPrintForm"] = "Invoice";
				else if($record_type == "quotation")
					$wheredoct["docPrintForm"] = "Quotation";
				else if($record_type == "delivery")
					$wheredoct["docPrintForm"] = "Delivery Challan";
				else if($record_type == "receipt")
					$wheredoct["docPrintForm"] = "Receipt";
				// LAST COUNT INVOICE					
				$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
				if(!$lastInvoiceDetails){
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(267);
					$status['statusCode'] = 267;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				// UPDATE INVOICE NUMBER
				$deliveryDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.''.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo).'/'.$lastInvoiceDetails[0]->docYearCD;
				$deliveryDetails['status'] = 'approved';
				$isupdate1 = $this->CommonModel->updateMasterDetails("invoice_header",$deliveryDetails, array('invoiceID'=>$ids));
				if($isupdate1){
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
						$amcDetails = array();
						$oldqty = 0 ;
						$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$ids));

						if(isset($inLineData) && !empty($inLineData)){
							foreach ($inLineData as $key => $value) {
								$whereP = array('productID' => $value->invoiceLineChrgID);
								$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
									
								if(isset($getStock) && !empty($getStock)){
									$orderIn = $getStock[0]->orderIn;
									$orderSettle = $getStock[0]->orderSettle;
									$orderOpen = $getStock[0]->orderOpen;
									$orderCancel = $getStock[0]->orderCancel;
									$orderBalance = $getStock[0]->orderBalance;
									// $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
									// $avblStock['orderIn'] = $getOrderIn; 
									// $avblStock['orderBalance'] = $getOrderBlce;
									$orderSettle = $orderSettle + $value->invoiceLineQty;
									$getOrderBlce = number_format(floatval($orderOpen) + floatval($orderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26
									$avblStock['orderSettle'] = $orderSettle;
									$avblStock['orderBalance'] = $getOrderBlce;
									$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);	
								}

								$where = array('product_id'=>$value->invoiceLineChrgID);
								$productData = $this->CommonModel->getMasterDetails('products', '', $where);
								$whereInvoice = array('invoiceID'=>$value->invoiceID);
								$invoiceLine = $this->CommonModel->getMasterDetails('invoice_header', '', $whereInvoice);
								$tomorrow = new DateTime('tomorrow');
								if ($productData[0]->is_amc == "yes") {
									$amcDuration = $productData[0]->amc_duration; // e.g., "6 months", "1 year", "30 days"
									
									// Get the current date
									$currentDate = new DateTime();
									$futureDate = clone $currentDate;
									
									// Parse the duration string
									if (preg_match('/(\d+)\s*days?/i', $amcDuration, $matches)) {
										$daysToAdd = (int)$matches[1];
										$futureDate->modify("+{$daysToAdd} days");
									} elseif (preg_match('/(\d+)\s*months?/i', $amcDuration, $matches)) {
										$monthsToAdd = (int)$matches[1];
										$futureDate->modify("+{$monthsToAdd} months");
									} elseif (preg_match('/(\d+)\s*years?/i', $amcDuration, $matches)) {
										$yearsToAdd = (int)$matches[1];
										$futureDate->modify("+{$yearsToAdd} years");
									} else {
										throw new Exception('Invalid AMC duration format');
									}
									
									$amcDetails['subject'] = $productData[0]->product_name . " Maintenance";
									$amcDetails['start_date'] = $futureDate->format('Y-m-d'); // Format the date as 'YYYY-MM-DD'
									$amcDetails['record_type'] = "amc";
									$amcDetails['company_id'] = $this->company_id;
									$amcDetails['customer_id'] = $invoiceLine[0]->customer_id;
									$amcDetails['product_id'] = $value->invoiceLineChrgID;
									$amcDetails['created_by'] = $invoiceLine[0]->created_by;
									$iscreated = $this->CommonModel->saveMasterDetails('tasks', $amcDetails);
								}
							}

						}else{
							// if($invoiceLine[0]->record_type == "delivery"){
							$oldqty = 0 ;
							$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$ids));
							if(isset($inLineData) && !empty($inLineData)){
								foreach ($inLineData as $key => $value) {
									$whereP = array('productID' => $value->invoiceLineChrgID);
									$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
										
									if(isset($getStock) && !empty($getStock)){
										$orderIn = $getStock[0]->orderIn;
										$orderSettle = $getStock[0]->orderSettle;
										$orderOpen = $getStock[0]->orderOpen;
										$orderCancel = $getStock[0]->orderCancel;
										$orderBalance = $getStock[0]->orderBalance;
										// $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
										// $avblStock['orderIn'] = $getOrderIn; 
										// $avblStock['orderBalance'] = $getOrderBlce;
										$orderSettle = $orderSettle + $value->invoiceLineQty;
										$getOrderBlce = number_format(floatval($orderOpen) + floatval($orderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26
										$orderCancel =	$orderCancel + $value->invoiceLineQty;
										$avblStock['orderCancel'] = $orderCancel;
										$avblStock['orderBalance'] = $getOrderBlce;
										$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
									}
								}						
							}
						}
					}	
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
		}else
			{
				$deliveryDetails['status'] = 'cancel';
				$isupdate = $this->CommonModel->updateMasterDetails("invoice_header",$deliveryDetails, array('invoiceID'=>$ids));
				if ($isupdate) {
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}else
				{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
		}
	}
	public function deleteTaxInvoices(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "delete"){
				$ids = $this->input->post("list");
				$where['invoiceID'] = $ids;
				$changestatus = $this->TaxInvoiceModel->deleteInvoices('',$where);
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
	public function createInvoice(&$invoiceLine){
		// CHECK BILL IS CREATED
		$today =date("Y-m-d");
		$inDate =  dateFormat(($invoiceLine[0]->invoiceDate));
		if (!isset($invoiceLine[0]) && empty($invoiceLine[0])) {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(337);
			$status['statusCode'] = 337;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$invoiceLine[0]->inDate = $inDate;
		if($today <$inDate){
			// BACKDATED INVOICE ERROR
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(275);
			$status['statusCode'] = 275;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		// GET LAST INVOICE
		$lastIn = $this->TaxInvoiceModel->getLastInvoice();
		$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID);
		$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
		if(!isset($taxInvoiceData) || empty($taxInvoiceData)){
			$isNew = "yes";
			if(isset($lastIn) && !empty($lastIn)){
				$inDate = dateFormat(($invoiceLine[0]->invoiceDate));
				$oldDate = dateFormat(($lastIn[0]->invoiceDate));
				if($oldDate >$inDate){
					// error Back dated invoice can not create
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(276);
					$status['statusCode'] = 276;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
		}else{
			$isNew = "old";
			$inDate = dateFormat(($invoiceLine[0]->invoiceDate));
			$oldDate = dateFormat(($lastIn[0]->invoiceDate));
			$exDate = dateFormat(($taxInvoiceData[0]->invoiceDate));
			if(($oldDate >$inDate) && ($inDate !=$exDate)){
				// error Back dated invoice can not create
				$status['data'] = array();
				$status['msg'] =  $this->systemmsg->getErrorCode(276);
				$status['statusCode'] = 276;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
		$invoiceLine[0]->isNew = $isNew;
		$invoiceLine[0]->inDate = $inDate;
		if(!isset($invoiceLine[0]->customerID) && !empty($invoiceLine[0]->customerID)){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(317);
			$status['statusCode'] = 317;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$wheredoct = array();
		$wheredoct['company_id'] = $this->company_id;
		switch ($invoiceLine[0]->record_type) {
			case 'invoice':
					$wheredoct["docPrintForm"] = "Invoice";
				break;
			case 'quotation':
					$wheredoct["docPrintForm"] = "Quotation";
				break;
			case 'delivery':
					$wheredoct["docPrintForm"] = "Delivery Challan";
				break;
			case 'receipt':
					$wheredoct["docPrintForm"] = "Receipt";
				break;
			default:
				break;
		}
		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docPrintForm,docCurrNo",$wheredoct);
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(323);
			$status['statusCode'] = 323;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		if (isset($invoiceLine[0]->inconvertToInvoice) && $invoiceLine[0]->inconvertToInvoice == 'yes') {
			$isNew="yes";
		}
		if($isNew=="yes"){
			$datacc = array(
				"invoiceDate"=>dateFormat($invoiceLine[0]->invoiceDate),
				"valid_until_date"=>dateFormat($invoiceLine[0]->valid_until_date),
				"customer_id"=>$invoiceLine[0]->customerID,
				"record_type"=>$invoiceLine[0]->record_type,
				"ship_to"=>$invoiceLine[0]->ship_to,
				"invoiceNumber"=>'',
				"status"=>'draft',
				"payment_date"=>$invoiceLine[0]->payment_date,
				"is_gst_billing"=>$invoiceLine[0]->isGstBilling,
				"is_shipping"=>$invoiceLine[0]->is_shipping,
				"created_by"=>$this->input->post('SadminID'),"created_date"=>date("Y-m-d H:i:s")
			);
			switch ($invoiceLine[0]->record_type) {
				case 'quotation':
						if (!isset($invoiceLine[0]->inconvertToInvoice)) {
							$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type,$this->company_id);
							$datacc["status"]='approved';
						}
					break;
				case 'receipt':
						$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type,$this->company_id);
						$datacc["status"]='approved';	
					break;
				default:
					break;
			}			
			if (isset($invoiceLine[0]->inconvertToInvoice) && $invoiceLine[0]->inconvertToInvoice == 'yes') {
				$datacc["invoiceNumber"] = $this->generateReceiptNumber($invoiceLine[0]->record_type,$this->company_id);
				$datacc["status"]='approved';
				$datacc["ref_quot_no"] = (isset($taxInvoiceData[0]->invoiceNumber) && !empty($taxInvoiceData[0]->invoiceNumber))  ? $taxInvoiceData[0]->invoiceNumber : '';
				$invoiceLine[0]->invoiceNumberConvert = $datacc["invoiceNumber"] ;
				$invoiceLine[0]->quotationNumber = isset($taxInvoiceData[0]->invoiceNumber) && !empty($taxInvoiceData[0]->invoiceNumber) ? $taxInvoiceData[0]->invoiceNumber : '';
			}
			$cDetails = $this->getCustomerDetails($invoiceLine[0]->customerID,$this->company_id,$invoiceLine[0]->record_type);
			$datacc['customer_address'] = (isset($cDetails[0]->address)) ? $datacc['customer_address']= $cDetails[0]->address:'';
			$datacc['customer_name'] = (isset($cDetails[0]->name)) ? $cDetails[0]->name : '';
			$datacc['customer_mobile'] = (isset($cDetails[0]->mobile_no)) ? $cDetails[0]->mobile_no : '' ;
			$datacc['customer_gst'] = (isset($cDetails[0]->gst_no)) ?  $cDetails[0]->gst_no : '';
			$datacc['customer_s_mobile'] = (isset($cDetails[0]->mobile_no)) ?  $cDetails[0]->mobile_no : '';
			$datacc['customer_state'] = (isset($cDetails[0]->customer_state)) ? $cDetails[0]->customer_state : ''; 
			$datacc['terms'] = (isset($cDetails[0]->terms)) ? $cDetails[0]->terms : $datacc['terms'] = ''; 
			$datacc['state_id'] = (isset($invoiceLine[0]->state_id)) ? $invoiceLine[0]->state_id : ''; 
			$datacc['gst_state_code'] = (isset($invoiceLine[0]->gst_state_code)) ? $invoiceLine[0]->gst_state_code : '';
			// (isset($cDetails[0]->mobile_no)) ? $datacc['customer_mobile']= $cDetails[0]->mobile_no : $datacc['customer_mobile']= '' ;
			// (isset($cDetails[0]->gst_no)) ? $datacc['customer_gst']= $cDetails[0]->gst_no : $datacc['customer_gst']= '';
			// (isset($cDetails[0]->mobile_no)) ? $datacc['customer_s_mobile']= $cDetails[0]->mobile_no : $datacc['customer_s_mobile']= '';
			// (isset($cDetails[0]->customer_state)) ? $datacc['customer_state'] = $cDetails[0]->customer_state : $datacc['customer_state'] = ''; 
			// (isset($cDetails[0]->terms)) ? $datacc['terms'] = $cDetails[0]->terms : $datacc['terms'] = ''; 
			// (isset($invoiceLine[0]->state_id)) ? $datacc['state_id'] = $invoiceLine[0]->state_id : $datacc['state_id'] = ''; 
			// (isset($invoiceLine[0]->gst_state_code)) ? $datacc['gst_state_code'] = $invoiceLine[0]->gst_state_code : $datacc['gst_state_code'] = '';
			$headerDetails = (array) $invoiceLine[0];
			$fieldData = $this->datatables->mapDynamicFeilds($invoiceLine[0]->record_type,$headerDetails);
			$datacc = array_merge($fieldData, $datacc);
			$invoiceID = $this->TaxInvoiceModel->createTaxInvoiceInfo($datacc);
			if(!$invoiceID){
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				foreach ($invoiceLine as $key => $value) {
					$invoiceLine[$key]->invoiceID = $invoiceID;
				}
			}
		}
	}
	public function validateRow(&$value){
		$error = array();
		// if(!isset($value->invoiceLineChrgID ) || empty($value->invoiceLineChrgID )){
		// 	$error[] = "Item type can not blank. Row No.".$value->srno."\n";
		// }
		if(!isset($value->quantity) || empty($value->quantity)){
			$error[] = "Item quantity can not blank. Row No.".$value->srno."\n";
		}
		if($value->record_type != "delivery"){
			if(!isset($value->rate) || empty($value->rate)){
				$error[] = "Item rate can not blank. Row No.".$value->srno."\n";
			}
		}else
		{
			if($value->rate== '' ){
				$value->rate = 0 ;
			}
		}
		if(isset($error) && !empty($error)){
			$strer = implode(' ', $error);
			$this->db->trans_rollback();
			$status['data'] = array();
			$status['msg'] =$strer;
			$status['statusCode'] = 318;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
	}
	public function stockUpdates(&$value){
		$oldQuantity = 0 ;
		$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$value->invoiceID));
		if (isset($inLineData) && !empty($inLineData)) {
			if($value->invoiceLineChrgID == $inLineData[0]->invoiceLineChrgID)
			$oldQuantity = $inLineData[0]->invoiceLineQty;
		}
		$whereP = array('productID' => $value->invoiceLineChrgID);
		$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
		
		if(isset($getStock) && !empty($getStock)){
			$orderIn = $getStock[0]->orderIn;
			$orderSettle = $getStock[0]->orderSettle;
			$orderOpen = $getStock[0]->orderOpen;
			$orderCancel = $getStock[0]->orderCancel;
			$orderBalance = $getStock[0]->orderBalance;
			
			$getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
			$getOrderBlce = number_format(floatval($orderOpen) + floatval($getOrderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); //0+13-19-26

			$avblStock['orderIn'] = $getOrderIn; 
			$avblStock['orderBalance'] = $getOrderBlce;
			
			$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
			if(!$isinsert1){
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(319);;
				$status['statusCode'] = 319;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}else{
			$orderIn = 0;
			$orderSettle = 0;
			$orderOpen = 0;
			$orderCancel = 0;
			$getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
			$getOrderBlce = number_format(floatval($orderOpen) + floatval($getOrderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); 
			$avblStock['orderIn'] = $getOrderIn; 
			$avblStock['orderBalance'] = $getOrderBlce;
			$avblStock['productID'] = $value->invoiceLineChrgID;

			$isinsert1 = $this->CommonModel->saveMasterDetails('stocks',$avblStock);
			if(!$isinsert1){
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(319);;
				$status['statusCode'] = 319;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}
	public function rowTotal(&$value){
		$sel = "*";
		$wher = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
		$itemDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
		$rate = number_format($value->rate, 2, '.', '');
		$amt = number_format($value->quantity * $rate, 2, '.', '');
		$rate1 = $rate;
		$dis = 0;
		$value->itemDiscount = $value->itemDiscount ?? 0;
		$value->amt = 0;
		if($value->rate!= '' ){
			if (isset($value->itemDiscountType)) {
				if ($value->itemDiscountType == 'amt') {
					$amt -= ( $value->itemDiscount * $value->quantity) ;
					$rate1 -= $value->itemDiscount;
				}else{
					$dis = $rate1 * ($value->itemDiscount / 100) ;
					$rate1 -= $dis ;
					$amt -= ( $dis * $value->quantity) ;	
				}
				$value->priceAmt = $amt;
			}
			$gs = 0 ;	
			if ($value->interGstPercent != '') {
				if($value->isGstBilling == 'yes'){
					$gstAmt =  $rate1 * ($value->interGstPercent / 100) ; 
					$gs = $gstAmt * ( $value->quantity ) ;
					$amt = $amt + $gs;
					$value->priceAmt = $amt - $gs;
				}
			}
			$value->amt = $amt;
			$value->gs = $gs;
		}
		($value->withGst == 'yes' || $value->withGst == 'y' ) ? $withGst =  'y' :$withGst =  'n';
		switch ($value->isGstBilling) {
			case 'no':
					$data = array('discount_type'=>$value->itemDiscountType,'is_gst'=>$withGst ,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineNarr"=>$value->invoiceLineNarr,"discount"=>$value->itemDiscount,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit);//,"igst"=>$value->interGstPercent,"igst_amt"=>$gs,"cgst_amt"=>($gs / 2),"sgst_amt"=>($gs / 2)//,"invoiceLineNarr"=>$value->description
				break;
			case 'yes':
					$data = array('discount_type'=>$value->itemDiscountType,'is_gst'=>$withGst ,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineNarr"=>$value->invoiceLineNarr,"discount"=>$value->itemDiscount,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit,"igst"=>$value->interGstPercent,"igst_amt"=>$gs,"cgst_amt"=>($gs / 2),"sgst_amt"=>($gs / 2));//,"invoiceLineNarr"=>$value->description
				break;
			default:
				break;
		}

		if(isset($itemDetails) && !empty($itemDetails)){
			// UPDATE ITEM ROW
			$wherup = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
			$isupdate = $this->TaxInvoiceModel->saveInvoiceLineInfo($data,$wherup);
			if (!$isupdate) {
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(320);;
				$status['statusCode'] = 320;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}else{
			// INSERT ITEM ROW
			$data['invoiceID'] = $value->invoiceID;
			$data['srNo'] = $value->srno;
			$isupdate = $this->TaxInvoiceModel->createInvoiceLineInfo($data);
			if (!$isupdate) {
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(321);;
				$status['statusCode'] = 321;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}
	public function paymentStatement($invoiceLine,&$datain){
		if (isset($invoiceLine[0]->payment_status) && !empty($invoiceLine[0]->payment_status)) {
			if ($invoiceLine[0]->payment_date != '') {
				$datain['payment_date'] = dateFormat(($invoiceLine[0]->payment_date)) ;
			}
			if( $invoiceLine[0]->payment_status =="partially"){
				if ( isset($invoiceLine[0]->payment_date) && $invoiceLine[0]->payment_date != '') {
					$datain['payment_date'] = dateFormat(($invoiceLine[0]->payment_date)) ;
				}
				if($invoiceLine[0]->gm == $invoiceLine[0]->payment_amount)
				{
					$datain['pending_amount'] = '0';
					$datain['payment_status'] = 'fully';
				}else
				{
					if ($invoiceLine[0]->payment_amount > 0) {
						$totalAmt1 = $invoiceLine[0]->gm - $invoiceLine[0]->payment_amount;
						if($totalAmt1 == $invoiceLine[0]->gm){
							$datain['pending_amount'] = '0';
							$datain['payment_status'] = 'fully';
						}	else{
							$datain['pending_amount'] = $totalAmt1;
							$datain['payment_status'] = 'partially';
						}
					}else{
						$datain['pending_amount'] = $invoiceLine[0]->gm;
						$datain['payment_status'] = 'partially';
					}	
				}
			}else{
				$datain['pending_amount']= 0;
				$datain['payment_status'] = 'fully';
			}
		}else
		{
			$datain['pending_amount'] = $invoiceLine[0]->gm;
			$datain['payment_status'] = 'partially';
		}
	}
	public function invoiceItemList($value=''){
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$invoiceLine = $this->input->post();
		$created_by = $invoiceLine['SadminID'];
		unset($invoiceLine['SadminID']);
		unset($invoiceLine['accessFrom']);

		// CREATE INVOICE
		$this->db->trans_begin();
		$this->createInvoice($invoiceLine);	 	
		$subTotal = 0;
		$grossAmount = 0;
		$interGstAmount = 0;
		$grossAmount = 0;
		$roundOff = 0;
		$i=0;
		$inline = array();

	 	if(isset($invoiceLine) && !empty($invoiceLine)){
	 		foreach ($invoiceLine as $key => $value) {
				if($key !=0){

					// VALIDATE FOR RECORD TYPE
					$value->record_type = $invoiceLine[0]->record_type;
					$value->isGstBilling = $invoiceLine[0]->isGstBilling;
					$this->validateRow($value);
					
					// PRODUCT ENTRY IF NOT EXISTS
					if (isset($value->invoiceLineChrgID) && empty($value->invoiceLineChrgID)) {
						$value->created_by = $created_by;
						$value->invoiceLineChrgID = $this->addNewProduct($value);
					}

					// IF UPDATE THEN ONLY UPDATED ROW WILL INSERTED INTO DB, ANOTHER REMOVED
					$inline[$i]["srNo"]=$value->srno;
					$inline[$i]["invoiceID"]=$value->invoiceID;
					$i++;
					
					// UPDATE STOCKS
					if($invoiceLine[0]->record_type == "delivery"){
						$this->stockUpdates($value);
                    }
					// CALCULATE ROW TOTAL
					$this->rowTotal($value);
					$subTotal += $value->priceAmt;
					$interGstAmount += $value->gs;
				}
			}
		}
		$subTotal = number_format($subTotal,2, '.', ''); 
		$interGstAmount = number_format($interGstAmount,2, '.', ''); 
		$subTotal = $subTotal + intval($invoiceLine[0]->additionalCharges);
		$interGstAmount = $interGstAmount + intval($invoiceLine[0]->additionalChargesGST);
		$invoiceLine[0]->gm = number_format($subTotal + $interGstAmount,2, '.', '');
		if($this->db->trans_status() === FALSE)
		{
			$sqlerror = $this->db->error();
			$this->errorlogs->checkDBError($sqlerror,dirname(__FILE__),__LINE__,__METHOD__);
		   	$this->db->trans_rollback();
		   	$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(277);
			$status['statusCode'] = 277;
			$status['flag'] = 'F';
			$this->response->output($status,200);

		}else{
			$datain = array();
			$datain['invoiceDate'] = dateFormat(($invoiceLine[0]->invoiceDate));
			$datain['valid_until_date'] = dateFormat(($invoiceLine[0]->valid_until_date));
			$datain['ship_to'] = $invoiceLine[0]->ship_to;
			$datain['shipping_address'] = $invoiceLine[0]->shipping_address;
			$datain['customer_s_mobile'] = $invoiceLine[0]->shipping_mobile;
			$datain['invoiceTotal'] = $subTotal;
			$datain['interGstAmount'] = $interGstAmount;

			if (isset($invoiceLine[0]->logsAmt) && $invoiceLine[0]->isnewInvoice == 'no') {
				if ($invoiceLine[0]->logsAmt <= $subTotal) {
					$datain['pending_amount']= $invoiceLine[0]->gm - $invoiceLine[0]->logsAmt;
				}else{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(293);
					$status['statusCode'] = 293;
					$status['flag'] = 'F';
					$this->response->output($status,200);	
				}
			}else{
				if ($invoiceLine[0]->isnewInvoice == 'yes') {
					$invoiceLine[0]->subTotal = $subTotal;
					$this->paymentStatement($invoiceLine,$datain);
				}	
			}
		}
		
		(isset($invoiceLine[0]->roundOff) && !empty($invoiceLine[0]->roundOff)) ? $datain['grossAmount'] = round($invoiceLine[0]->gm) : $datain['grossAmount'] = $invoiceLine[0]->gm;
		(isset($invoiceLine[0]->roundOff) && !empty($invoiceLine[0]->roundOff)) ? $datain['roundOff'] = number_format($datain['grossAmount'] - $invoiceLine[0]->gm,2,'.', '') : $datain['roundOff'] = 0 ;
		if ($invoiceLine[0]->isNew == 'old') {
			$datain['modified_by'] = $this->input->post('SadminID');
			$datain['modified_date'] = date("Y-m-d H:i:s");
		}
		// IF RELATED TO PROJECTS
		(isset($invoiceLine[0]->related_to)) ? $datain['related_to'] = $invoiceLine[0]->related_to : $datain['related_to'] = '';
		(isset($invoiceLine[0]->project_id)) ? $datain['project_id'] = $invoiceLine[0]->project_id : $datain['project_id'] = '';
		$datain['company_id'] = $this->company_id;
		$datain['show_on_pdf'] = $invoiceLine[0]->show_on_pdf;
		$datain['additional_char'] = $invoiceLine[0]->additional_char;
		$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID,"customer_id"=>$invoiceLine[0]->customerID);
		$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($datain,$wherec);
		
		if(!$isup){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(277);
			$status['statusCode'] = 277;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}else{
			
			if (isset($invoiceLine[0]->inconvertToInvoice) && $invoiceLine[0]->inconvertToInvoice == 'yes') {
				$d1['ref_quot_no'] = $invoiceLine[0]->invoiceNumberConvert ; 			
				$wherec = array("invoiceNumber"=>$invoiceLine[0]->quotationNumber);
				$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($d1,$wherec);
			}
			$lastlogID = '' ;
			if ($invoiceLine[0]->isnewInvoice == 'yes' && !isset($invoiceLine[0]->inconvertToInvoice)) {
				if(isset($invoiceLine[0]->payment_status) && !empty($invoiceLine[0]->payment_status))
				{
					if (!isset($invoiceLine[0]->payment_note) && empty($invoiceLine[0]->payment_note)) {
						$invoiceLine[0]->payment_note = ' ';
					}
					$receiptNumber = $this->generateReceiptNumber('receipt',$this->company_id);
					if ($invoiceLine[0]->payment_status == 'fully') {
						$data = array('customer_id'=>$invoiceLine[0]->customerID,'notes'=>$invoiceLine[0]->payment_note,'receipt_number'=>$receiptNumber,'payment_log_date'=>$invoiceLine[0]->inDate,"amount" =>$datain['grossAmount'],"transaction_id"=>$invoiceLine[0]->transaction_id,"mode_of_payment"=>$invoiceLine[0]->payment_mode,'invoice_id'=>$invoiceLine[0]->invoiceID,'company_id'=>$this->company_id,'pending_amount'=>'0');	
						$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
						if($isinsert2){
							$lastlogID = $this->CommonModel->getLastInsertedID();
							$this->db->trans_commit();	
							$status['lastInvoiceID'] = $invoiceLine[0]->invoiceID;
							$status['lastlogID'] = $lastlogID;
						}
					}else{
						if ($invoiceLine[0]->payment_amount > 0) {
							$pend_amt = 0; 
							$pend_amt = $invoiceLine[0]->gm - $invoiceLine[0]->payment_amount;	
							$data = array('customer_id'=>$invoiceLine[0]->customerID,'notes'=>$invoiceLine[0]->payment_note,'receipt_number'=>$receiptNumber,'payment_log_date'=>dateFormat($invoiceLine[0]->payment_date),"amount" =>$invoiceLine[0]->payment_amount,"transaction_id"=>$invoiceLine[0]->transaction_id,"mode_of_payment"=>$invoiceLine[0]->payment_mode,'invoice_id'=>$invoiceLine[0]->invoiceID,'company_id'=>$this->company_id,'pending_amount'=>$pend_amt);
							$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
							if($isinsert2){
								$lastlogID = $this->CommonModel->getLastInsertedID();
								$this->db->trans_commit();	
								$status['lastInvoiceID'] = $invoiceLine[0]->invoiceID;
								$status['lastlogID'] = $lastlogID;
							}
						}else{
							$this->db->trans_commit();	
						}	
					}
				}else{
					$this->db->trans_commit();	
				}
			}else{
				$this->db->trans_commit();	
			}
			// END OF THE TOTAL
			$srnoarr = array_column($inline,"srNo");
			$sel = "*";
			$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID);
			
			$invoiceLineDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
			// DELETE THE ITEM WHICH ARE NOT IN THE LIST
			$todel = array();
			foreach ($invoiceLineDetails as $key => $value){
				if(!in_array($value->srNo,$srnoarr)){
					$todel[] = $value->srNo;
				}
			}	
			
			if(isset($todel) && !empty($todel)){
				$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID);
				$this->TaxInvoiceModel->deleteitems($wher,$todel);
			}
			$status['data'] = array();
			$status['lastInvoiceID'] = $invoiceLine[0]->invoiceID;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);	
		}
	}
	public function generateReceiptNumber($record_type='',$company_id=''){
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
		$receiptDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.''.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo).'/'.$lastInvoiceDetails[0]->docYearCD;
		
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
	public function getNextDocNumber($record_type=''){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$wheredoct = array();
		$wheredoct['company_id'] = $this->company_id;
		if($record_type == "invoice")
			$wheredoct["docPrintForm"] = "Invoice";
		else if($record_type == "quotation")
			$wheredoct["docPrintForm"] = "Quotation";
		else if($record_type == "delivery")
			$wheredoct["docPrintForm"] = "Delivery Challan";
		else if($record_type == "receipt")
			$wheredoct["docPrintForm"] = "Receipt";

		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$invoiceNumber = $lastInvoiceDetails[0]->docPrefixCD.''.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo).'/'.$lastInvoiceDetails[0]->docYearCD;
		if (isset($invoiceNumber) && !empty($invoiceNumber)) {
			$status['data'] = $invoiceNumber;
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}
	}
	public function partialPayment(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$SadminID = $this->input->post('SadminID');
		$record_type =$this->input->post('record_type');
		$invoiceID = $this->input->post('invoiceID');
		$action = $this->input->post('action');
		$customer_id = $this->input->post('customer_id');
		$this->validatedata->validate('paymentAmt', 'Payment Amount', true, '', array());
		$this->validatedata->validate('paymentDate', 'Payment Date', true, '', array());
		$this->validatedata->validate('mode_of_payment', 'Payment Mode', true, '', array());
		$p_date = dateFormat($this->input->post('paymentDate'));
		$amt =	intval($this->input->post('paymentAmt'));
		$mode_of_payment = $this->input->post('mode_of_payment');
		$payment_note = $this->input->post('payment_note');
		$transaction_id = $this->input->post('transaction_id');
		$show_history = 'yes';
		$receiptNumber = '';
		if(isset($invoiceID) && !empty($invoiceID))
		{
			$where = array("invoiceID"=>$invoiceID);
			$inDetails = $this->CommonModel->getMasterDetails("invoice_header","pending_amount,company_id",$where);
			if(isset($inDetails) && !empty($inDetails)){
				if(isset($inDetails[0]->company_id) && !empty($inDetails[0]->company_id)){
					$receiptNumber = $this->generateReceiptNumber('receipt',$inDetails[0]->company_id);
				}
			}else
			{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);	
			}
		}
		if($action == "savePayment"){
			if(isset($invoiceID) && !empty($invoiceID))
			{
				$where = array("invoiceID"=>$invoiceID);
				$inDetails = $this->CommonModel->getMasterDetails("invoice_header","pending_amount",$where);
				$pending_amt = 0;
				if(isset($inDetails) && !empty($inDetails)){
					$totalAmt = intval($inDetails[0]->pending_amount );
					if($totalAmt < $amt ){
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(290);
						$status['statusCode'] = 290;
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}else
					{
						if($totalAmt == $amt)
						{
							$data = array('payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
						}else
						{
							$totalAmt1 = $totalAmt - $amt;	
							$pending_amt = $totalAmt1;
							if($totalAmt1 == $totalAmt)
								$data = array('payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
							else
								$data = array('payment_date'=>$p_date,"pending_amount" =>$totalAmt1,"payment_status"=>"partially");
						}	
						$isinsert1 = $this->CommonModel->updateMasterDetails('invoice_header',$data,$where);
						if(!$isinsert1)
						{
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['flag'] = 'F';
							$this->response->output($status,200);	
						}
					}				
				}else{
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);	
				}
				$data = array('customer_id'=>$customer_id,'company_id'=>$this->company_id,'notes'=>$payment_note,'pending_amount'=>$pending_amt ,'receipt_number'=>$receiptNumber,'payment_log_date'=>$p_date,"amount" =>$amt,"transaction_id"=>$transaction_id,"mode_of_payment"=>$mode_of_payment,'invoice_id'=>$invoiceID,'show_history'=>$show_history,'created_by'=>$SadminID);
				$isinsert2 = $this->CommonModel->saveMasterDetails('receipts',$data);
				if($isinsert2)
				{
					$lastlogID = $this->db->insert_id();
					$status['lastlogID'] = $lastlogID;
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['flag'] = 'S';
					$this->response->output($status,200);	
				}
			}
		}else{
			// $data = array('receipt_number'=>$receiptNumber,'payment_date'=>$p_date,"pending_amount" =>'0',"payment_status"=> "fully");
			// $isinsert1 = $this->CommonModel->updateMasterDetails('invoice_header',$data,array("invoiceID",$invoiceID));
			// if($isinsert1)
			// {
			// 	$status['data'] = array();
			// 	$status['msg'] = $this->systemmsg->getSucessCode(400);
			// 	$status['statusCode'] = 400;
			// 	$status['flag'] = 'S';
			// 	$this->response->output($status,200);	
			// }
		}
	}
	public function paymentLogsList($invoiceID=''){
		$where = array("invoice_id = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		
		$inDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$where,'','',$join,$other=array());
		if(isset($inDetails) && !empty($inDetails)){
			$status['data'] = $inDetails;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
				
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}
	}
	public function getNarration($type="invoice"){
		$type = trim($type);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="product_type";
		$join[0]['key2'] ="category_id";
		$getNarrList = $this->CommonModel->GetMasterListDetails($selectC="*",'products',$where = array(),'','',$join,$other=array());	
		if(isset($getNarrList) && !empty($getNarrList)){
			$status['data'] = $getNarrList;
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
	public function cancelInvoice($invoiceID){

		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		if(isset($invoiceID) && !empty($invoiceID)){

			$where = array("invoiceID"=>$invoiceID);
			$dd = array("status"=>"cancel");
			$isUpdate = $this->TaxInvoiceModel->saveTaxInvoiceInfo($dd,$where);
			
			if(isset($isUpdate) && !empty($isUpdate)){

				$where = array("invoiceID"=>$invoiceID);
				$isPresent = $this->CreditModel->getCreditDetailsSingle($where);
				if(isset($isPresent) && !empty($isPresent)){

					$where = array("creditID"=>$isPresent[0]->creditID);
					$dd = array("status"=>"cancel");
					$isUpdate = $this->CreditModel->saveCreditInfo($dd,$where);
					
					if(isset($isUpdate) && !empty($isUpdate)){
						$status['data'] = array();
						$status['statusCode'] = 200;
						$status['flag'] = 'S';
						$this->response->output($status,200);
					}else{
						$where = array("invoiceID"=>$invoiceID);
						$dd = array("status"=>"pending");
						$isUpdate = $this->TaxInvoiceModel->saveTaxInvoiceInfo($dd,$where);
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}
				}
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
		}else{

			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}
		
	}
	public function printBill($invoiceID){
		$data= array();
		$pdfFilePath = '';

		// TAXINVOICE DATA 
		$wherec = array("invoiceID"=>$invoiceID);
		$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);

		// INFOSETTINGS 
		$wherec = array("infoID"=>$taxInvoiceData[0]->company_id);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
		// print_r($contract);exit;
		// INVOICELINE DETAILS
	 	$sel = "t.*,c.categoryName";
		$wher = array("invoiceID = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="invoiceLineUnit";
		$join[0]['key2'] ="category_id";
		$invoiceLineDetails = $this->CommonModel->getMasterListDetails($sel,'invoice_line',$wher,'','',$join,'');
		$invoiceLineGST = array();
		// IF PRODUCT IS NUMERRIC OR NOT NUMERIC
		foreach ($invoiceLineDetails as $key => $inv) {
			// IF PRODUCT HAVING WITHGST
			// if ($inv->is_gst == 'n') {
				$invoiceLineGST[$key] = $inv;
			// }
			if(is_numeric($inv->invoiceLineChrgID))
			{
				$wherec = array("product_id"=>$inv->invoiceLineChrgID);
				$product = $this->CommonModel->getMasterDetails("products","product_name",$wherec);
				$inv->product_name = $product[0]->product_name;
			}else
			{
				$inv->product_name = $inv->invoiceLineChrgID;
			}		
		}
		// DEATAILS
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr",'invoice_line',$wher,'','');

		if ($taxInvoiceData[0]->customer_state != 0) {
			$wherec = array("state_name"=>$taxInvoiceData[0]->customer_state);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD)){
				$taxInvoiceData[0]->customer_state = $stateD[0]->state_name;
				$taxInvoiceData[0]->gst_state_code = $stateD[0]->state_code;
				$taxInvoiceData[0]->customer_state_id = $stateD[0]->state_id;
			}else{
				$taxInvoiceData[0]->customer_state = '';
				$taxInvoiceData[0]->gst_state_code = '';
				$taxInvoiceData[0]->customer_state_id = '';
			}
		}
		// PAYMENT LOGS
		$wherer['invoice_id = '] = $taxInvoiceData[0]->invoiceID;
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		$paymentLogsDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$wherer,'','',$join,$other=array());
		// DATA ABSTRACTED
		// print('<pre>');
		// print_r($contract);exit;
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		$data['infoSettings']= $contract;
		$data['taxInvoiceData']= $taxInvoiceData;
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['invoiceLineGST']= $invoiceLineGST;
		$data['paymentDetails']= $paymentLogsDetails;
		$data['counDetails']= "-";	
		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'quotation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'proforma')
			$pdfFilePath = $this->load->view("proformapdf",$data,true);
		
			// print_r($pdfFilePath);exit;
		if(!$this->config->item('development')){
			//load mPDF library
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			// Add the watermark
			// $this->mpdfci->SetWatermarkText($taxInvoiceData[0]->status);
			// $this->mpdfci->showWatermarkText = true;
			// $this->mpdfci->watermark_font = 'Arial';
			// $this->mpdfci->watermarkTextAlpha = 0.3;
			// $this->mpdfci->watermark_font_size = 36;
			// $this->mpdfci->watermarkTextColor = array(192, 192, 192);
			$this->mpdfci->Output();  
		}else
		{
			print_r($pdfFilePath);
		}  
	}
	public function attachmentUpload($log_id = '',$invoiceID=''){	
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($log_id) && !empty($log_id)){
			if ($invoiceID == 0) {
				$mediapatharr = $this->config->item("mediaPATH") ."receipts/".$log_id ;
			}else{
				$mediapatharr = $this->config->item("mediaPATH") ."invoiceLog/".$invoiceID."/".$log_id ;
			}
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($log_id) || $log_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."invoiceLog/temp-";
			if (!is_dir($mediapatharr)) {
				if (mkdir($mediapatharr, 0777, true)) {
				} else {
					$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(281);
					$status['statusCode'] = 281;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
		}
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'receipts',
			'fileTypeColumn' => '',
			'fileColumn' => 'attachement',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'primaryKey'=>'receipt_id',
			'primaryValue' => $log_id,
			'docTypeValue' => '',
			'isUpdate' => 'Y',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}
	public function getCustomerDetails($cust_id ='',$defComp='', $record_type = ''){
		if(!isset($cust_id) && empty($cust_id)){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(317);
			$status['statusCode'] = 317;
			$status['flag'] = 'F';
			$this->response->output($status,200);	
		}
		$wherec = array("customer_id"=>$cust_id);
	 	$cDetails = $this->CommonModel->getMasterDetails("customer","gst_state, address, name, mobile_no, gst_no",$wherec);
		
		if(isset($cDetails) && !empty($cDetails)){
			$wherec = array("infoID"=>$defComp);
	 		$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
			if(isset($contract) && !empty($contract)){
				if ($record_type == 'quotation') {
					$cDetails[0]->terms = $contract[0]->quotation_terms_conditions;
				}elseif ($record_type == 'invoice' || $record_type == 'proforma') {
					$cDetails[0]->terms = $contract[0]->invoice_terms_condotions;
				}else{
					$cDetails[0]->terms = $contract[0]->receipt_terms_condotions;
				}
			}
			if ( $cDetails[0]->gst_state != '0') {
				$wherec = array("state_id"=> $cDetails[0]->gst_state);
				$stateD = $this->CommonModel->getMasterDetails("states","state_name",$wherec);
				if(isset($stateD) && !empty($stateD)){
					$cDetails[0]->customer_state = $stateD[0]->state_name;
				}
			}else{
				$cDetails[0]->customer_state = '';
			}
			return $cDetails;
		}		
	}
	public function getLastLogId(){
		$orderBy = "receipt_id";
		$order ="DESC";
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		$lastID= $this->CommonModel->GetMasterListDetails($selectC="receipt_id",'receipts',$where=array(),'1','','',$other);
		
		if(isset($lastID) && !empty($lastID))	
		{
			$status['data'] = $lastID[0]->receipt_id;
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);	
		}
	}
	public function validateLine($value){
		$this->validate($value->invoiceLineChrgID ,'Product', false);
		$this->validate($value->srno,'Serial no', false);
		$this->validate($value->rate,'rate', true);
		$this->validate($value->itemDiscountType,'item Discount Type', true);
		$this->validate($value->itemDiscount,'item Discount', true);
		$this->validate($value->quantity,'quantity', true);
		$this->validate($value->interGstPercent,'interGstPercent', false);
		$this->validate($value->interGstAmount,'interGstAmount', false);
		$this->validate($value->withGst,'withGst', true);
	}
	public function validate($fieldName = '', $lable = null, $isRequired = false){
		$fieldName = $fieldName ?? '';
		$textCheck = trim($fieldName);
		if ($isRequired == true) {
			if (!isset($textCheck) && empty($textCheck)) {
				$status['msg'] = str_replace("{fieldName}", $lable, $this->systemmsg->getErrorCode(218));
				$status['statusCode'] = 218;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
	public function addNewProduct($value){
		$updateDate = date("Y/m/d H:i:s");
		$productDetails['product_description'] = (isset($value->invoiceLineNarr)) ? $value->invoiceLineNarr : '';
		$productDetails['product_Name'] = (isset($value->product_name)) ? $value->product_name : '';
		$productDetails['price'] = (isset($value->rate)) ? $value->rate : 0 ;
		$productDetails['actual_cost'] = (isset($value->rate)) ? $value->rate : 0 ;
		$productDetails['gst'] = (isset($value->interGstPercent)) ? $value->interGstPercent : 0 ;
		$productDetails['unit'] = $value->unit;(isset($value->unit)) ? $value->unit : 0 ;
		$productDetails['discount'] = (isset($value->itemDiscount)) ? $value->itemDiscount : 0 ;
		$productDetails['discount_type'] =(isset($value->itemDiscountType)) ? $value->itemDiscountType : 'per' ;
		$productDetails['created_by'] = $value->created_by;
		$productDetails['created_date'] = $updateDate;
		$iscreated = $this->CommonModel->saveMasterDetails('products', $productDetails);
		if (!$iscreated) {
			$status['msg'] = $this->systemmsg->getErrorCode(336);
			$status['statusCode'] = 336;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			return $this->db->insert_id();
		}
	}
	public function getPdf($invoiceID){
		$data= array();
		$pdfFilePath = '';

		// TAXINVOICE DATA 
		$wherec = array("invoiceID"=>$invoiceID);
		$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);

		// INFOSETTINGS 
		$wherec = array("infoID"=>$taxInvoiceData[0]->company_id);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);

		// INVOICELINE DETAILS
	 	$sel = "t.*,c.categoryName";
		$wher = array("invoiceID = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="invoiceLineUnit";
		$join[0]['key2'] ="category_id";
		$invoiceLineDetails = $this->CommonModel->getMasterListDetails($sel,'invoice_line',$wher,'','',$join,'');
		$invoiceLineGST = array();
		// IF PRODUCT IS NUMERRIC OR NOT NUMERIC
		foreach ($invoiceLineDetails as $key => $inv) {
			// IF PRODUCT HAVING WITHGST
			// if ($inv->is_gst == 'n') {
				$invoiceLineGST[$key] = $inv;
			// }
			if(is_numeric($inv->invoiceLineChrgID))
			{
				$wherec = array("product_id"=>$inv->invoiceLineChrgID);
				$product = $this->CommonModel->getMasterDetails("products","product_name",$wherec);
				$inv->product_name = $product[0]->product_name;
			}else
			{
				$inv->product_name = $inv->invoiceLineChrgID;
			}		
		}
		// DEATAILS
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr",'invoice_line',$wher,'','');

		if ($taxInvoiceData[0]->customer_state != 0) {
			$wherec = array("state_name"=>$taxInvoiceData[0]->customer_state);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD)){
				$taxInvoiceData[0]->customer_state = $stateD[0]->state_name;
				$taxInvoiceData[0]->gst_state_code = $stateD[0]->state_code;
				$taxInvoiceData[0]->customer_state_id = $stateD[0]->state_id;
			}else{
				$taxInvoiceData[0]->customer_state = '';
				$taxInvoiceData[0]->gst_state_code = '';
				$taxInvoiceData[0]->customer_state_id = '';
			}
		}
		// PAYMENT LOGS
		$wherer['invoice_id = '] = $taxInvoiceData[0]->invoiceID;
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		$paymentLogsDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$wherer,'','',$join,$other=array());
		// DATA ABSTRACTED
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		$data['infoSettings']= $contract;
		$data['taxInvoiceData']= $taxInvoiceData;
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['invoiceLineGST']= $invoiceLineGST;
		$data['paymentDetails']= $paymentLogsDetails;
		$data['counDetails']= "-";	
		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'quotation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'proforma')
			$pdfFilePath = $this->load->view("proformapdf",$data,true);
		
		$fileName = $taxInvoiceData[0]->customer_name.'.pdf';
		$fileName = str_replace(' ','_',$fileName);

		$filePath = $this->config->item("mediaPATH").'temp-invoice/';

		if (!is_dir($filePath)) {
			mkdir($filePath, 0777);
			chmod($filePath, 0777);
		} else {
			if (!is_writable($filePath)) {
				chmod($filePath, 0777);
			}
		}
		$file = $filePath.$fileName;
		if(!$this->config->item('development')){
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			$this->mpdfci->Output($file, 'F');  
			
			if(file_exists($file))
			{
				$status['data'] = $fileName;
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else
			{
				$status['msg'] = $this->systemmsg->getErrorCode(309);
				$status['statusCode'] = 309;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);	
			}
		}else
		{
			if(!file_exists($file))
			{
				$status['data'] = $fileName;
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else
			{
				$status['msg'] = $this->systemmsg->getErrorCode(309);
				$status['statusCode'] = 309;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);	
			}
		}  
	}	
	public function getInvoiceCustomer(){
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$company_id = $this->input->post('company_id');
		if(isset($company_id) && !empty($company_id) ){
			$wherec["t.company_id"] = 'IN ("'.$company_id.'")';
		}
		$text = trim($t);
		$select = 'customer_id, name, email, gst_state, address, country, city, state, zipcode, billing_name, type, salutation, customer_image';
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec[ "name like "] = "'%" . $text . "%'";
			$wherec[ "type = "] = "'customer'";
			$wherec[ "status = "] = "'active'";

			$updateAns = $this->CommonModel->GetMasterListDetails($select, 'customer', $wherec);
			if (isset($updateAns) && !empty($updateAns)) {
				$status['msg'] = "sucess";
				$status['data'] = $updateAns;
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}
	}
	public function getInvoicePreview($invoiceID = ''){
		$data= array();
		$pdfFilePath = '';
		// TAXINVOICE DATA 
		$wherec = array("invoiceID"=>$invoiceID);
		$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);

		// INFOSETTINGS 
		$wherec = array("infoID"=>$taxInvoiceData[0]->company_id);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);

		// INVOICELINE DETAILS
	 	$sel = "t.*,c.categoryName";
		$wher = array("invoiceID = "=>$invoiceID);
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="invoiceLineUnit";
		$join[0]['key2'] ="category_id";
		$invoiceLineDetails = $this->CommonModel->getMasterListDetails($sel,'invoice_line',$wher,'','',$join,'');
		$invoiceLineGST = array();
		// IF PRODUCT IS NUMERRIC OR NOT NUMERIC
		foreach ($invoiceLineDetails as $key => $inv) {
			// IF PRODUCT HAVING WITHGST
			// if ($inv->is_gst == 'n') {
				$invoiceLineGST[$key] = $inv;
			// }
			if(is_numeric($inv->invoiceLineChrgID))
			{
				$wherec = array("product_id"=>$inv->invoiceLineChrgID);
				$product = $this->CommonModel->getMasterDetails("products","product_name",$wherec);
				$inv->product_name = $product[0]->product_name;
			}else
			{
				$inv->product_name = $inv->invoiceLineChrgID;
			}		
		}
		// DEATAILS
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr",'invoice_line',$wher,'','');

		if ($taxInvoiceData[0]->customer_state != 0) {
			$wherec = array("state_name"=>$taxInvoiceData[0]->customer_state);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD)){
				$taxInvoiceData[0]->customer_state = $stateD[0]->state_name;
				$taxInvoiceData[0]->gst_state_code = $stateD[0]->state_code;
				$taxInvoiceData[0]->customer_state_id = $stateD[0]->state_id;
			}else{
				$taxInvoiceData[0]->customer_state = '';
				$taxInvoiceData[0]->gst_state_code = '';
				$taxInvoiceData[0]->customer_state_id = '';
			}
		}
		// PAYMENT LOGS
		$wherer['invoice_id = '] = $taxInvoiceData[0]->invoiceID;
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c";
		$join[0]['key1'] ="mode_of_payment";
		$join[0]['key2'] ="category_id";
		$paymentLogsDetails = $this->CommonModel->GetMasterListDetails($selectC="t.*,c.categoryName As paymentMode",'receipts',$wherer,'','',$join,$other=array());
		// DATA ABSTRACTED
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		$data['infoSettings']= $contract;
		$data['taxInvoiceData']= $taxInvoiceData;
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['invoiceLineGST']= $invoiceLineGST;
		$data['paymentDetails']= $paymentLogsDetails;
		$data['counDetails']= "-";	
		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'quotation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'proforma')
			$pdfFilePath = $this->load->view("proformapdf",$data,true);
		
		
		if (!empty($pdfFilePath)) {
			$status['data'] = $data['taxInvoiceData'];
			$status['preview'] = $pdfFilePath;
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
	// WHEN INVOICE REMINDER IS SEND 
	public function isEmailSend($invoiceID) {
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$invoiceMailDetails = array();
		$invoiceMailDetails['reminder_send_date'] = date("Y/m/d H:i:s");
		$invoiceMailDetails['is_reminder_send'] = 'yes';
		$wherec['invoiceID'] = $invoiceID;
		$iscreated = $this->CommonModel->updateMasterDetails('invoice_header', $invoiceMailDetails ,$wherec);
		if (!$iscreated) {
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		} else {
			$status['data'] = array();
			$status['msg'] = "sucess";
			$status['flag'] = 'S';
			$status['statusCode'] = 200;
			$this->response->output($status,200);
		}
	}

	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['invoiceID']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('invoice_header', '',$whereIn);
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