<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class PurchaseOrder extends CI_Controller {

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
		$this->load->model('PurchaseOrderModel');
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
			$orderBy = "purchase_number";
			$order ="DESC";
		}
		
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
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
		
		$config["base_url"] = base_url() . "stocks";
		
		$config["total_rows"] = $this->PurchaseOrderModel->getTotalPurchaseOrder('purchase_id','purchase_header',$wherec,$other);
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
		
        $memberDetails = $this->PurchaseOrderModel->getPurchaseOrderDetails($selectC='',$wherec,$config["per_page"],$page,$join,$other);
		
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
	
	public function getPurchaseOrderDetails($ID='')
	{
		
		$this->response->decodeRequest();
		$this->access->checkTokenKey();
		
		$wherec = array("purchase_id"=>$ID);
		$select = "*,DATE_FORMAT(purchase_date,'%d-%m-%Y') as purchase_date,DATE_FORMAT(challan_date,'%d-%m-%Y') as challan_date";
	 	$PurchaseOrderData = $this->PurchaseOrderModel->getPurchaseOrderDetailsSingle($select,$wherec);
		$purchaseLine = $this->PurchaseOrderModel->getPurchaseLineDetails("*",$wherec);
		
		if(isset($PurchaseOrderData) && !empty($PurchaseOrderData)){
			$PurchaseOrderData[0]->purchaseLine = $purchaseLine;
			
			$status['data'] = $PurchaseOrderData;
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
	
	public function purchaseOrderChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->PurchaseOrderModel->changePurchaseOrderStatus('purchase_header',$statusCode,$ids,'purchase_id');
				
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
	public function deletePurchaseOrders()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "delete"){
				$ids = $this->input->post("list");
				$where['purchase_id'] = $ids;
				$changestatus = $this->PurchaseOrderModel->deletePurchaseOrder('',$where);
				
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
	public function purchaseItemList($value='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$purchaseLine = $this->input->post();
		// check is bill created
		$inDate =  dateFormat(($purchaseLine[0]->purchase_date));
		$today =date("Y-m-d");
		if($today <$inDate){
			// error Back dated purchase can not create
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(275);
			$status['statusCode'] = 275;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}

		$lastIn = $this->PurchaseOrderModel->getLastPurchaseOrder();
		$wherec = array("purchase_id"=>$purchaseLine[0]->purchase_id);
	 	$purchaseOrderData = $this->PurchaseOrderModel->getPurchaseOrderDetailsSingle("*",$wherec);
		if(!isset($purchaseOrderData) || empty($purchaseOrderData)){
			$isNew = "yes";
		// 	if(isset($lastIn) && !empty($lastIn)){
		// 		$inDate = dateFormat(($purchaseLine[0]->purchase_date));
		// 		$oldDate = dateFormat(($lastIn[0]->purchase_date));
		// 		if($oldDate >$inDate){
		// 			// error Back dated purchase can not create
		// 			$status['data'] = array();
		// 			$status['msg'] = $this->systemmsg->getErrorCode(276);
		// 			$status['statusCode'] = 276;
		// 			$status['flag'] = 'F';
		// 			$this->response->output($status,200);
		// 		}
		// 	}
		}else{
			$isNew = "old";
		// 	$inDate = dateFormat(($purchaseLine[0]->purchase_date));
		// 	$oldDate = dateFormat(($lastIn[0]->purchase_date));
		// 	$exDate = dateFormat(($purchaseOrderData[0]->purchase_date));
		// 	if(($oldDate >$inDate) && ($inDate !=$exDate)){
		// 		// error Back dated purchase can not create
		// 		$status['data'] = array();
		// 		$status['msg'] =  $this->systemmsg->getErrorCode(276);
		// 		$status['statusCode'] = 276;
		// 		$status['flag'] = 'F';
		// 		$this->response->output($status,200);
		// 	}
		}
		
		unset($purchaseLine['SadminID']);
		unset($purchaseLine['accessFrom']);
		$inline = array();
		$i=0;

		$wheredoct["docTypeID"] = "5";
		// Get Last Count for Purchase
		$lastPurchaseDetails = $this->CommonModel->getMasterDetails("doc_prefix","docPrefixCD,docYearCD,docCurrNo",$wheredoct);

		if(!$lastPurchaseDetails){
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(267);
			$status['statusCode'] = 267;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		$this->db->trans_begin();
		$datacc = array(
			"purchase_number"=>$lastPurchaseDetails[0]->docPrefixCD.$lastPurchaseDetails[0]->docCurrNo."/".$lastPurchaseDetails[0]->docYearCD,
			"purchase_date"=>dateFormat($purchaseLine[0]->purchase_date),
			"store_id"=>$purchaseLine[0]->store_id,
			"vender_id"=>$purchaseLine[0]->vender_id,
			"challan_date"=>dateFormat($purchaseLine[0]->challan_date),
			"challan_number"=>$purchaseLine[0]->challan_number,
			"remark"=>$purchaseLine[0]->remark,
			"status"=>'active',
			"created_by"=>$this->input->post('SadminID'),
			"created_date"=>date("Y-m-d H:i:s"));
		$headerDetails = (array) $purchaseLine[0];
		$fieldData = $this->datatables->mapDynamicFeilds($purchaseLine[0]->menu_name,$headerDetails);
		$datacc = array_merge($fieldData, $datacc);
		if($isNew=="yes"){

			$POID = $this->PurchaseOrderModel->createPurchaseOrderInfo($datacc);
			// print_r($datacc);exit;
			if(!$POID){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				$inID = array("docCurrNo"=>($lastPurchaseDetails[0]->docCurrNo+1));
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
			foreach ($purchaseLine as $key => $value) {
				
				$purchaseLine[$key]->purchase_id = $POID;
	 		}
	 	}else
		{
			$wherec = array("purchase_id"=>$purchaseLine[0]->purchase_id);
			$isup = $this->PurchaseOrderModel->savePurchaseOrderInfo($datacc,$wherec);
			// $POID = $this->PurchaseOrderModel->createPurchaseOrderInfo($datacc);
			// print_r($datacc);exit;
			if(!$isup){
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}else{
				$inID = array("docCurrNo"=>($lastPurchaseDetails[0]->docCurrNo+1));
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
		}
	 	$error = array();
	 	if(isset($purchaseLine) && !empty($purchaseLine)){
			
	 		foreach ($purchaseLine as $key => $value) {
				if($key !=0)
				{
					if(!isset($value->product_id ) || empty($value->product_id )){
						$error[] = "Item type can not blank. Row No.".$value->sr_no."\n";
					}
					if(!isset($value->product_qty) || empty($value->product_qty)){
						$error[] = "Item quantity can not blank. Row No.".$value->sr_no."\n";
					}
					// if(!isset($value->rate) || empty($value->rate)){
					// 	$error[] = "Item rate can not blank. Row No.".$value->srno."\n";
					// }
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
		if(isset($purchaseLine) && !empty($purchaseLine)){
			
			foreach ($purchaseLine as $key => $value) {
				if($key !=0){
					// print_r($value);
					$inline[$i]["sr_no"]=$value->sr_no;
					$inline[$i]["product_id"]=$value->product_id;
					$i++;
					$sel = "*";
					$wher = array("purchase_id"=>$value->purchase_id,"sr_no"=>$value->sr_no);
					$itemDetails = $this->PurchaseOrderModel->getPurchaseLineDetails($sel,$wher);
					if(isset($itemDetails) && !empty($itemDetails)){
						// update item			
						if($itemDetails[0]->is_edit == "no"){
							$data = array("product_qty"=>$value->product_qty);	
						}else{
							$data = array("product_id"=>$value->product_id,"product_qty"=>$value->product_qty);
						}	
						$wherup = array("purchase_id"=>$value->purchase_id,"sr_no"=>$value->sr_no);
						$isupdate = $this->PurchaseOrderModel->savePurchaseLineInfo($data,$wherup);
					}else{
						// Insert item
						$data = array("purchase_id"=>$value->purchase_id,"sr_no"=>$value->sr_no,"product_id"=>$value->product_id,"product_qty"=>$value->product_qty,"is_edit"=>"y");					
						$isupdate = $this->PurchaseOrderModel->createPurchaseLineInfo($data);
					}

					$whereP = array('productID' => $value->product_id);
					$getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);
					   
					if(isset($getStock) && !empty($getStock)){
						$qtyIn = $getStock[0]->qtyIn;
						$qtyOpen = $getStock[0]->qtyOpen;
						$qtyBalance = $getStock[0]->qtyBalance;
						$qtyOut = $getStock[0]->qtyOut;
						$getQtyIn = number_format((floatval($qtyIn) + floatval($value->product_qty)),2, '.', '');
						$getQtyBlce = number_format(floatval($qtyOpen) + floatval($getQtyIn) - floatval($qtyOut),2, '.', ''); //0+13-19-26

						$avblStock['qtyIn'] = $getQtyIn; 
						$avblStock['qtyBalance'] = $getQtyBlce;
						$isinsert1 = $this->CommonModel->updateMasterDetails('stocks',$avblStock,$whereP);
					}else{
						$qtyIn = 0;
						$qtyOpen = 0;
						$qtyBalance = 0;
						$qtyOut = 0;
						$getQtyIn = number_format((floatval($qtyIn) + floatval($value->product_qty)),2, '.', '');
						$getQtyBlce = number_format(floatval($qtyOpen) + floatval($getQtyIn) - floatval($qtyOut),2, '.', ''); //0+13-19-26

						$avblStock['qtyIn'] = $getQtyIn; 
						$avblStock['qtyBalance'] = $getQtyBlce;
						$avblStock['productID'] = $value->product_id;
						$isinsert1 = $this->CommonModel->saveMasterDetails('stocks',$avblStock);
					}			
					if(!$isupdate){
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(277);
						$status['statusCode'] = 277;
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
				}
			}
		}
	
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
			$datain['purchase_date'] = dateFormat(($purchaseLine[0]->purchase_date));
			$datain['modified_by'] = $this->input->post('SadminID');
			$datain['modified_date'] = date("Y-m-d H:i:s");
			$datain['status'] ='active';
			$wherec = array("purchase_id"=>$purchaseLine[0]->purchase_id);
			$isup = $this->PurchaseOrderModel->savePurchaseOrderInfo($datain,$wherec);

			if(!$isup){
				
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(277);
				$status['statusCode'] = 277;
				$status['flag'] = 'F';
				$this->response->output($status,200);	

			}else{

				$srnoarr = array_column($inline,"sr_no");
				$sel = "*";
				$wher = array("purchase_id"=>$purchaseLine[0]->purchase_id);
				$purchaseLineDetails = $this->PurchaseOrderModel->getPurchaseLineDetails($sel,$wher);
				// delete item which is not in list
				$todel = array();
				foreach ($purchaseLineDetails as $key => $value){
					if(!in_array($value->sr_no,$srnoarr)){
						$todel[] = $value->sr_no;
					}
				}
				if(isset($todel) && !empty($todel)){
					$wher = array("purchase_id"=>$purchaseLine[0]->purchase_id,"is_edit"=>"y");
					$this->PurchaseOrderModel->deleteitems($wher,$todel);
				}
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);	
			}
		}
	}

	public function getNarration($type="purchaseOrder"){

		$type = trim($type);
		
		// $where = array("type ="=>"'".$type."'");
		$getNarrList = $this->CommonModel->GetMasterListDetails("product_id,product_name,quantity,product_serial_no,product_type,product_description","products",$where = array());
		
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
	public function cancelPurchaseOrder($purchase_id){

		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		if(isset($purchase_id) && !empty($purchase_id)){

			$where = array("purchase_id"=>$purchase_id);
			$dd = array("status"=>"cancel");
			$isUpdate = $this->PurchaseOrderModel->savePurchaseOrderInfo($dd,$where);
			
			if(isset($isUpdate) && !empty($isUpdate)){

				$where = array("purchase_id"=>$purchase_id);
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

						$where = array("purchase_id"=>$purchase_id);
						$dd = array("status"=>"pending");
						$isUpdate = $this->PurchaseOrderModel->savePurchaseOrderInfo($dd,$where);
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
	 	$purchaseOrderData = $this->PurchaseOrderModel->getPurchaseOrderDetailsSingle("*",$wherec);
	 	$data['purchaseOrderData']= $purchaseOrderData;
	 	
	 	$sel = "*";
		$wher = array("invoiceID"=>$invoiceID);
		$invoiceLineDetails = $this->PurchaseOrderModel->getPurchaseOrderLineDetails($sel,$wher);
		$data['invoiceLineDetails']= $invoiceLineDetails;
		$data['counDetails']= "-";	
		//this the the PDF filename that user will get to download
	
		$wherec = array("customer_id"=>$purchaseOrderData[0]->customer_id);
	 	$customerDetails = $this->CommonModel->getMasterDetails("customer","name, address,gst_no,state_id,mobile_no",$wherec);
		
		if ( $customerDetails[0]->state_id != 0) {
			$wherec = array("state_id"=> $customerDetails[0]->state_id);
			$stateD = $this->CommonModel->getMasterDetails("states","*",$wherec);
			if(isset($stateD) && !empty($stateD))
			{
				$customerDetails[0]->customer_state = $stateD[0]->state_name;
			}
		}	
		$data['companyDetails'] = $customerDetails;
			

        //load mPDF library
        // $this->load->library('MPDFCI');
        // $this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
 	    print_r($pdfFilePath);exit;
		// $this->mpdfci->WriteHTML($pdfFilePath);
       	// $this->mpdfci->Output();  
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

	public function multiplepurchaseChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['purchase_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('purchase_header', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('purchase_header', $action, $ids, 'purchase_id');
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