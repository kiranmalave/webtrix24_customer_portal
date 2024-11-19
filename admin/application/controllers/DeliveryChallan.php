<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class DeliveryChallan extends CI_Controller {

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
	public function index()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$statuscode = $this->input->post('status');
		// $record_type = $this->input->post('record_type');
		$record_type = 'delivery';
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$filterCName = $this->input->post('filterCName');
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$join = array();
		
		if($isAll !="Y"){
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

			// create join for created by and modified data details
			// $jkey = (count($join)+1);
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="admin";
			// $join[$jkey]['alias'] ="ad";
			// $join[$jkey]['key1'] ="created_by";
			// $join[$jkey]['key2'] ="adminID";
			// $jkey = (count($join)+1);
			// $join[$jkey]['type'] ="LEFT JOIN";
			// $join[$jkey]['table']="admin";
			// $join[$jkey]['alias'] ="am";
			// $join[$jkey]['key1'] ="modified_by";
			// $join[$jkey]['key2'] ="adminID";
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
			// if($selectC !=""){
			// 	$selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
			// }else{
			// 	$selectC = $selectC."ad.name as createdBy,am.name as modifiedBy";	
			// }
		}
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "invoiceNumber";
			$order ="DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		// $wherec = $join = array();
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
		
        $memberDetails = $this->TaxInvoiceModel->getTaxInvoiceDetails($selectC='',$wherec,$config["per_page"],$page,$join,$other);
		
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
			$this->response->output($status,200);

		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
	}
	
	public function getDeliveryDetails($ID='')
	{
		$this->response->decodeRequest();
		$this->access->checkTokenKey();
		$join = array();
		$wherec = array("invoiceID"=>$ID);
		$select = "*,DATE_FORMAT(invoiceDate,'%d-%m-%Y') as invoiceDate";
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle($select,$wherec);
		 
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="categories";
		$join[0]['alias'] ="c10";
		$join[0]['key1'] ="product_name";
		$join[0]['key2'] ="category_id";
		
		$invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$wherec);
	 	
	 	if(isset($taxInvoiceData) && !empty($taxInvoiceData)){
			$taxInvoiceData[0]->invoiceLine = $invoiceLine;
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
	
	public function deliveryChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->TaxInvoiceModel->changeTaxInvoiceStatus('invoice_header',$statusCode,$ids,'invoiceID');
				
				if($changestatus){
					if ($statusCode == 'approved')
					{
						// IF STATUS IS APPROVED
						$wheredoct = array();
						// if($invoiceLine[0]->record_type == "invoice")
						// 	$wheredoct["docTypeID"] = "1";
						// else if($invoiceLine[0]->record_type == "qoutation")
						// 	$wheredoct["docTypeID"] = "3";	
						// else if($invoiceLine[0]->record_type == "delivery")
							$wheredoct["docTypeID"] = "4";
						// else if($invoiceLine[0]->record_type == "receipt")
						// 	$wheredoct["docTypeID"] = "2";

						// LAST COUNT INVOICE					
						$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);		
						if(!$lastInvoiceDetails){
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getErrorCode(267);
							$status['statusCode'] = 267;
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
						// UPDATE DELIVERY NUMBER
						$deliveryDetails['invoiceNumber']= $lastInvoiceDetails[0]->docPrefixCD.$lastInvoiceDetails[0]->docYearCD.'/'.sprintf('%02d', $lastInvoiceDetails[0]->docCurrNo);
						$isupdate = $this->CommonModel->updateMasterDetails("invoice_header",$deliveryDetails, array('invoiceID'=>$ids));
						if($isupdate){
							$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
							$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
							if(!$isupdate){
								$status['data'] = array();
								$status['msg'] = $this->systemmsg->getErrorCode(277);
								$status['statusCode'] = 277;
								$status['flag'] = 'F';
								$this->response->output($status,200);
							}	
							// UPDATE STOCKS FOR APPROVED							
							$oldqty = 0 ;
							$inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$ids));
							if(isset($inLineData) && !empty($inLineData)){
								foreach ($inLineData as $key => $value) {
									$whereP = array('productID' => $value->invoiceLineChrgID);
									$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
										
									if(isset($getStock) && !empty($getStock)){
										if($getStock[0]->qtyBalance >= $value->invoiceLineQty)
										{
											$orderIn = $getStock[0]->orderIn;
											$qtyIn = $getStock[0]->qtyIn;
											$qtyOut = $getStock[0]->qtyOut;
											$qtyOpen = $getStock[0]->qtyOpen;
											$qtyBalance = $getStock[0]->qtyBalance;
											$orderSettle = $getStock[0]->orderSettle;
											$orderOpen = $getStock[0]->orderOpen;
											$orderCancel = $getStock[0]->orderCancel;
											$orderBalance = $getStock[0]->orderBalance;
											$out = $qtyOut + $value->invoiceLineQty;
											// $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');
											// $avblStock['orderIn'] = $getOrderIn; 
											// $avblStock['orderBalance'] = $getOrderBlce;
											$getQtyOut = number_format((floatval($qtyOut) + floatval($value->invoiceLineQty)),2, '.', '');
											$getQtyBlce = number_format((floatval($qtyOpen) + floatval($qtyIn)) - floatval($getQtyOut),2, '.', ''); 

											$orderSettle = number_format((floatval($orderSettle) + floatval($value->invoiceLineQty)),2, '.', '');
											$getOrderBlce = number_format(((floatval($orderOpen) + floatval($orderIn)) - floatval($orderSettle)) - floatval($orderCancel),2, '.', '');
											$avblStock['orderSettle'] = $orderSettle;
											$avblStock['orderBalance'] = $getOrderBlce;
											$avblStock['qtyOut'] = $getQtyOut; 
											$avblStock['qtyBalance'] = $getQtyBlce;
											$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
										
										}else
										{
											$status['data'] = array();
											$status['msg'] = "Insufficient Stock for Sr no ".$value->srNo;
											$status['statusCode'] = 227;
											$status['flag'] = 'F';
											$this->response->output($status,200);	
										}
									}
								}					
							}
						}
					}else{
						// IF STATUS IS CANCELED
						// UPDATE STOCK FOR CANCELED
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
									$orderSettle = number_format((floatval($orderSettle) + floatval($value->invoiceLineQty)),2, '.', '');
									$getOrderBlce = number_format(((floatval($orderOpen) + floatval($orderIn)) - floatval($orderSettle)) - floatval($orderCancel),2, '.', ''); 
									$orderCancel =	$orderCancel + $value->invoiceLineQty;
									$avblStock['orderCancel'] = $orderCancel;
									$avblStock['orderBalance'] = $getOrderBlce;
									$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
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
			}
	}

	public function deleteChallan()
	{
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
	public function deliveryItemList($value='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$invoiceLine = $this->input->post();
		// check is bill created
		$inDate =  dateFormat(($invoiceLine[0]->invoiceDate));
		$today =date("Y-m-d");
		if($today <$inDate){
			// error Back dated invoice can not create
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(275);
			$status['statusCode'] = 275;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}

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
		
		if(!isset($invoiceLine[0]->customerID) && !empty($invoiceLine[0]->customerID)){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(236);
			$status['statusCode'] = 236;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		unset($invoiceLine['SadminID']);
		unset($invoiceLine['accessFrom']);
		$subTotal = 0;
		$grossAmount = 0;
		$sGst = $invoiceLine[0]->sgst;
		$cGst = $invoiceLine[0]->cgst;
		$iGst = $invoiceLine[0]->igst;
		$roundOff = 0;
		$inline = array();
		$i=0;

		$wheredoct = array();
		if($invoiceLine[0]->record_type == "invoice")
			$wheredoct["docTypeID"] = "1";
		else if($invoiceLine[0]->record_type == "qoutation")
			$wheredoct["docTypeID"] = "3";	
		else if($invoiceLine[0]->record_type == "delivery")
			$wheredoct["docTypeID"] = "4";
		else if($invoiceLine[0]->record_type == "receipt")
			$wheredoct["docTypeID"] = "2";

		// Get Last Count for Invoice
		$lastInvoiceDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);

		if(!$lastInvoiceDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$this->db->trans_begin();
		if($isNew=="yes"){
			
			$datacc = array(
				"invoiceDate"=>dateFormat($invoiceLine[0]->invoiceDate),
				"customer_id"=>$invoiceLine[0]->customerID,
				"record_type"=>$invoiceLine[0]->record_type,
				"stateGstPercent"=>$invoiceLine[0]->stateGstPercent,
				"centralGstPercent"=>$invoiceLine[0]->centralGstPercent,
				"interGstAmount"=>$invoiceLine[0]->interGstPercent,
				"invoiceNumber"=>'',
				"status"=>'draft',
				"created_by"=>$this->input->post('SadminID'),"created_date"=>date("Y-m-d H:i:s"));
			$cDetails = $this->getCustomerDetails($invoiceLine[0]->customerID);
			$datacc['customer_name'] = $cDetails[0]->name;
			$datacc['customer_mobile']=$cDetails[0]->mobile_no;
			$datacc['customer_address']=$cDetails[0]->address;
			$datacc['customer_gst']=$cDetails[0]->gst_no;
			$datacc['customer_s_address']=$cDetails[0]->address;
			$datacc['customer_s_mobile']=$cDetails[0]->mobile_no;
			$datacc['customer_state']=$cDetails[0]->customer_state;
			$datacc['terms']=$cDetails[0]->terms;
			$headerDetails = (array) $invoiceLine[0];
			$fieldData = $this->datatables->mapDynamicFeilds($invoiceLine[0]->record_type,$headerDetails);
			$datacc = array_merge($fieldData, $datacc);
			$invoiceID = $this->TaxInvoiceModel->createTaxInvoiceInfo($datacc);
			if(!$invoiceID){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				$inID = array("docCurrNo"=>($lastInvoiceDetails[0]->docCurrNo+1));
				$isupdate = $this->CommonModel->updateMasterDetails("doc_prefix",$inID,$wheredoct);
				if(!$isupdate){
					$this->db->trans_rollback();
				   	$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(277);
					$status['statusCode'] = 277;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
			foreach ($invoiceLine as $key => $value) {
				$invoiceLine[$key]->invoiceID = $invoiceID;
	 		}
	 	}
	 	$error = array();
	 	if(isset($invoiceLine) && !empty($invoiceLine)){

	 		foreach ($invoiceLine as $key => $value) {
				
				if($key !=0)
				{
					if(!isset($value->invoiceLineChrgID ) || empty($value->invoiceLineChrgID )){
						$error[] = "Item type can not blank. Row No.".$value->srno."\n";
					}
					if(!isset($value->quantity) || empty($value->quantity)){
						$error[] = "Item quantity can not blank. Row No.".$value->srno."\n";
					}
					if($invoiceLine[0]->record_type != "delivery"){
						if(!isset($value->rate) || empty($value->rate)){
							$error[] = "Item rate can not blank. Row No.".$value->srno."\n";
						}
					}else
					{
						if($value->rate== '' ){
							$value->rate == 0 ;
						}
					}
				}
			}
		}
		if(isset($error) && !empty($error)){
			
				$strer = implode(' ', $error);
				$status['data'] = array();
				$status['msg'] =$strer;
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
		}
		if(isset($invoiceLine) && !empty($invoiceLine)){
			// print_r($invoiceLine);exit;
			foreach ($invoiceLine as $key => $value) {
				if($key !=0){
					$inline[$i]["srNo"]=$value->srno;
					$inline[$i]["invoiceID"]=$value->invoiceID;
					$i++;
					$sel = "*";
					$wher = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
					$itemDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
					$rate = 0 ;
					$amt = 0 ;

                    if($invoiceLine[0]->record_type == "delivery"){
                     $oldQuantity = 0 ;
                     $inLineData = $this->CommonModel->getMasterDetails('invoice_line', '', array('invoiceID'=>$invoiceLine[0]->invoiceID));
                     // print_r($inLineData);
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

                     }else{
                         $orderIn = 0;
                         $orderSettle = 0;
                         $orderOpen = 0;
                         $orderCancel = 0;
                         $getOrderIn = number_format((floatval($orderIn) + floatval($value->quantity)) - floatval($oldQuantity),2, '.', '');

                         $getOrderBlce = number_format(floatval($orderOpen) + floatval($getOrderIn) - floatval($orderSettle) - floatval($orderCancel),2, '.', ''); 

                         $avblStock['orderIn'] = $getOrderIn; 
                         $avblStock['orderBalance'] = $getOrderBlce;
                         //$avblStock['orderCancel'] = $getOrderBlce;
                         $avblStock['productID'] = $value->productID;

                         $isinsert1 = $this->CommonModel->saveMasterDetails('stocks',$avblStock);
                     }
                    }    

					if(isset($itemDetails) && !empty($itemDetails)){
						
						// update item
						if($value->rate!= '' ){
							$rate = number_format($value->rate,2, '.', '');
							$amt = number_format(($value->quantity * $rate),2, '.', '');
						}
											
						if($itemDetails[0]->isEdit == "no"){
							$data = array("invoiceLineNarr"=>$value->description);	

						}else{
							$data = array("invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineNarr"=>$value->description,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit , "is_gst" =>$value->apply_taxes);
						}
						if($value->apply_taxes == "y")
						{
							$data['sgst'] = $value->stateGstPercent;
							$data['cgst']= $value->centralGstPercent;
							$data['igst'] = $value->interGstPercent;
							$data['sgst_amt'] = $value->stateGstAmount;
							$data['cgst_amt'] = $value->centralGstAmount;
							$data['igst_amt'] = $value->interGstAmount;
						}else
						{
							$data['sgst'] = 0;
							$data['cgst']= 0;
							$data['igst'] = 0;
							$data['sgst_amt'] = 0;
							$data['cgst_amt'] = 0;
							$data['igst_amt'] = 0;
						}	
						// print_r($data);
						$wherup = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno);
						$isupdate = $this->TaxInvoiceModel->saveInvoiceLineInfo($data,$wherup);
					}else{
						// Insert item
						if($value->rate!= '' ){
							$rate = number_format($value->rate,2, '.', '');
							$amt = number_format(($value->quantity * $rate),2, '.', '');
						}

						$data = array("invoiceID"=>$value->invoiceID,"srNo"=>$value->srno,"invoiceLineNarr"=>$value->description,"invoiceLineChrgID"=>$value->invoiceLineChrgID,"invoiceLineAmount"=>$amt,"invoiceLineQty"=>$value->quantity,"invoiceLineRate"=>$rate,"invoiceLineUnit"=>$value->unit,"isEdit"=>"yes", "is_gst" =>$value->apply_taxes);
						if($value->apply_taxes == 'y')
						{
							$data['sgst'] = $value->stateGstPercent;
							$data['cgst']= $value->centralGstPercent;
							$data['igst'] = $value->interGstPercent;
							$data['sgst_amt'] = $value->stateGstAmount;
							$data['cgst_amt'] = $value->centralGstAmount;
							$data['igst_amt'] = $value->interGstAmount;
						}else
						{
							$data['sgst'] = 0;
							$data['cgst']= 0;
							$data['igst'] = 0;
							$data['sgst_amt'] = 0;
							$data['cgst_amt'] = 0;
							$data['igst_amt'] = 0;
						}	
						// print_r($data);exit;
						$isupdate = $this->TaxInvoiceModel->createInvoiceLineInfo($data);
						if($isupdate){
							// if($invoiceLine[0]->record_type == "delivery")
							// {
							// 	$whereP = array('productID' => $value->invoiceLineChrgID);
							// 	$pdet = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
								
							// 	if (isset($pdet) && !empty($pdet))
							// 	{
							// 		if($isNew == "yes")
							// 		{
							// 			$bal = $pdet[0]->qtyBalance ;
							// 			if($bal > 0 && $bal >= $value->quantity )
							// 			{
							// 				$bal = $bal -  $value->quantity;
							// 			}else{
							// 				$status['data'] = array();
							// 				$status['msg'] = "Insufficient Stock Row No ".$value->srno ;
							// 				$status['statusCode'] = 277;
							// 				$status['flag'] = 'F';
							// 				$this->response->output($status,200);
							// 			}
							// 			$qtout = $value->quantity;
							// 			$pd = array("qtyBalance"=>$bal,"qtyOut"=>$qtout);
							// 			$iscreated = $this->CommonModel->updateMasterDetails('stocks', $pd,$whereP);
							// 		}
							// 	}		
							// }
						}
					}
					if(!$isupdate){

						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(277);
						$status['statusCode'] = 277;
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$subTotal += $amt;
				}
			}
		}
	
		$subTotal = number_format($subTotal,2, '.', ''); 
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

			$this->db->trans_commit();
			$datain = array();
			$datain['invoiceDate'] = dateFormat(($invoiceLine[0]->invoiceDate));
			$datain['invoiceTotal'] = $subTotal;
			
			if($sGst == "yes"){
				
				$datain['stateGstPercent'] =$invoiceLine[0]->stateGstPercent;
				$datain['stateGstAmount'] = number_format(($subTotal*$invoiceLine[0]->stateGstPercent/100),2, '.', ''); 
			}else{
				$datain['stateGstPercent'] =$invoiceLine[0]->stateGstPercent;
				$datain['stateGstAmount'] = number_format((float)$invoiceLine[0]->stateGstAmount,2, '.', ''); 
			}
			if($cGst == "yes"){

				$datain['centralGstPercent'] = $invoiceLine[0]->centralGstPercent;
				$datain['centralGstAmount'] = number_format(($subTotal*$invoiceLine[0]->centralGstPercent/100),2, '.', ''); 
			}else{
				$datain['centralGstPercent'] = $invoiceLine[0]->centralGstPercent;
				$datain['centralGstAmount'] = number_format((float)$invoiceLine[0]->centralGstAmount,2, '.', ''); 
			}
			if($iGst == "yes"){

				$datain['interGstPercent'] = $invoiceLine[0]->interGstPercent;
				$datain['interGstAmount'] = number_format(($subTotal*$invoiceLine[0]->interGstPercent/100),2, '.', ''); 
			}else{
				$datain['interGstPercent'] = $invoiceLine[0]->interGstPercent;
				$datain['interGstAmount'] = number_format((float)$invoiceLine[0]->interGstAmount,2, '.', ''); 
			}
			$gm = number_format(($subTotal + $datain['stateGstAmount'] + $datain['centralGstAmount'] + $datain['interGstAmount']),2, '.', '');
			$datain['grossAmount'] = round($gm);

			$datain['roundOff'] = number_format($datain['grossAmount']-$gm,2,'.', '');
			$datain['modified_by'] = $this->input->post('SadminID');
			$datain['modified_date'] = date("Y-m-d H:i:s");
			$datain['status'] ='draft';
			$datain['company_id'] = $this->company_id;
			$wherec = array("invoiceID"=>$invoiceLine[0]->invoiceID,"customer_id"=>$invoiceLine[0]->customerID);
			$isup = $this->TaxInvoiceModel->saveTaxInvoiceInfo($datain,$wherec);

			if(!$isup){
				
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);	

			}else{

				$srnoarr = array_column($inline,"srNo");
				$sel = "*";
				$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID);
				$invoiceLineDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher);
				// delete item which is not in list
				$todel = array();
				foreach ($invoiceLineDetails as $key => $value){
					if(!in_array($value->srNo,$srnoarr)){
						$todel[] = $value->srNo;
					}
				}
				if(isset($todel) && !empty($todel)){
					$wher = array("invoiceID"=>$invoiceLine[0]->invoiceID,"isEdit"=>"yes");
					$this->TaxInvoiceModel->deleteitems($wher,$todel);
					
				}
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);	
			}
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

		// $where = array("type ="=>"'".$type."'");
		
		$getNarrList = $this->CommonModel->GetMasterListDetails($selectC="*",'products',$where = array(),'','',$join,$other=array());	
		// $getNarrList = $this->CommonModel->GetMasterListDetails(,"",);

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
	public function cancelChallan($invoiceID){

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
	
	public function printBill($invoiceID)
	{
		// check is bill created
		$data= array();
		$pdfFilePath = '';
		$wherec = array("infoID"=>1);
	 	$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
	 	$data['infoSettings']= $contract;

		$invoiceLine = $this->input->post();
		// check is bill created
		
		$wherec = array("invoiceID"=>$invoiceID);
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle("*",$wherec);
	 	$data['taxInvoiceData']= $taxInvoiceData;
	 	
	 	$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount,count(itemID) as total";
		$wher = array("invoiceID"=>$invoiceID);
		
		$invoiceLineDetails = $this->TaxInvoiceModel->getTaxInvoiceLineDetails($sel,$wher,true);
		$data['invoiceLineDetails']= $invoiceLineDetails;
		
		$sel = "itemID,invoiceID,srNo,invoiceLineChrgID,invoiceLineNarr,invoiceLineQty,invoiceLineUnit,invoiceLineRate,invoiceLineAmount";
		$wher = array("invoiceID"=>$invoiceID);
		
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="products";
		$join[0]['alias'] ="p";
		$join[0]['key1'] ="invoiceLineChrgID";
		$join[0]['key2'] ="product_id";
		$wher = array("invoiceID"=>"= ".$invoiceID);
		$invoiceLineDetailsDesc = $this->CommonModel->GetMasterListDetails("t.invoiceLineNarr,t.usb_mouse,t.usb_keyboard,t.laptop_backpack,t.wifi_adapter,t.serial_no,t.display_connector,t.usb_c_type_connector,t.hdmi_cable,t.charger,p.product_serial_no",'invoice_line',$wher,'','',$join);
		$data['invoiceLineDetailsDesc']= $invoiceLineDetailsDesc;
		//print_r($invoiceLineDetailsDesc); exit;
		$data['counDetails']= "-";	
		//this the the PDF filename that user will get to download
	
		$wherec = array("customer_id"=>$taxInvoiceData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","name,address,gst_no,state_id,mobile_no",$wherec);
		
		if ( $customerDetails[0]->state_id != 0) {
			$wherec = array("state_id"=> $customerDetails[0]->state_id);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD))
			{
				$customerDetails[0]->customer_state = $stateD[0]->state_name;
			}
		}	
		$data['companyDetails'] = $customerDetails;
			
		if($taxInvoiceData[0]->record_type == 'delivery')	
			$pdfFilePath = $this->load->view("deliveryPdf",$data,true);	
		else if($taxInvoiceData[0]->record_type == 'receipt')
        	$pdfFilePath = $this->load->view	("taxReceiptPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'qoutation')
        	$pdfFilePath = $this->load->view("qoutationPdf",$data,true);
		else if($taxInvoiceData[0]->record_type == 'invoice')
			$pdfFilePath = $this->load->view("invoicepdf",$data,true);

		if(!$this->config->item('development')){
			//load mPDF library
			$this->load->library('MPDFCI');
			$this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
			$this->mpdfci->WriteHTML($pdfFilePath);
			// Add the watermark
			$this->mpdfci->SetWatermarkText($taxInvoiceData[0]->status);
			$this->mpdfci->showWatermarkText = true;
			$this->mpdfci->watermark_font = 'Arial';
			$this->mpdfci->watermarkTextAlpha = 0.3;
			$this->mpdfci->watermark_font_size = 36;
			$this->mpdfci->watermarkTextColor = array(192, 192, 192);
			$this->mpdfci->Output();  
		}else
		{
			print_r($pdfFilePath);
		}  
	}

	public function getAllDeliveries($customerID='')
	{
		$this->response->decodeRequest();
		$this->access->checkTokenKey();

		$wherec = array("customer_id"=>$customerID);
		$select = "*,DATE_FORMAT(invoiceDate,'%d-%m-%Y') as invoiceDate";
	 	$taxInvoiceData = $this->TaxInvoiceModel->getTaxInvoiceDetailsSingle($select,$wherec);
		if(isset($taxInvoiceData) && !empty($taxInvoiceData))
		{
			foreach ($taxInvoiceData as $key => $value) {
				$where = array("invoiceID"=>$value->invoiceID);
				$invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$where);		
				$value->invoiceLine = $invoiceLine;
			}
		}
		// $invoiceLine = $this->TaxInvoiceModel->getTaxInvoiceLineDetails("*",$wherec);
	 	if(isset($taxInvoiceData) && !empty($taxInvoiceData)){
			$taxInvoiceData[0]->invoiceLine = $invoiceLine;
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

	public function getCustomerDetails($cust_id ='')
	{
		$wherec = array("customer_id"=>$cust_id);
	 	$cDetails = $this->CommonModel->getMasterDetails("customer","*",$wherec);
		
		if(isset($cDetails) && !empty($cDetails))
		{	
			$wherec = array("infoID"=>1);
	 		$contract = $this->CommonModel->getMasterDetails("info_settings","*",$wherec);
			if(isset($contract) && !empty($contract))
			{
				$cDetails[0]->terms = $contract[0]->termsConditions;
			}
			if ( $cDetails[0]->state_id != '0') {
				$wherec = array("state_id"=> $cDetails[0]->state_id);
				$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
				if(isset($stateD) && !empty($stateD))
				{
					$cDetails[0]->customer_state = $stateD[0]->state_name;
				}
			}else{
				$status['msg'] = "Customer's State is not exists! ";
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);	
			}
			return $cDetails;
		}		
	}
}