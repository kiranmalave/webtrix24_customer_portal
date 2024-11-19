<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Application extends CI_Controller
{
    function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->helper('form');
		// $this->load->model('SearchAdminModel');
		$this->load->model('CommonModel');
		// $this->load->library("pagination");
		// $this->load->library("ValidateData");
		// if(!$this->config->item('development'))
		// {
		// 	$this->load->library("emails");
		// }
		// $this->load->library("response");

    }
	public function getTables(){
        $sql = "SHOW TABLES";
		$res = $this->CommonModel->getdata($sql,array());
    }

	public function getDefinations(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$table = $this->input->post('table');
		
		if(!isset($table) || empty($table)){
			$menuID = $this->input->post('menuID');
			
			if(!isset($menuID) || empty($menuID)){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			$moduleDetails = $this->CommonModel->getMasterDetails("menu_master","*",array("menuID"=>$menuID));
			$table = $this->db->dbprefix.$moduleDetails[0]->table_name;
		}
		if(!isset($table) || empty($table)){
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		
		$sql = "SHOW COLUMNS FROM ".$table; 
		$res = $this->CommonModel->getdata($sql,array());
		if (isset($res) && !empty($res)) {

			$status['data'] = $res;
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

	public function getList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$tableName = $this->input->post('tableName');
		$where = $this->input->post('wherec');
		$type = $this->input->post('type');
		$select = $this->input->post('list');
		$company_id = $this->input->post('company_id');
		if(isset($company_id) && !empty($company_id) ){
			$wherec["t.company_id"] = 'IN ("'.$company_id.'")';
		}
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec[ "$where like  "] = "'%" . $text . "%'";
			if($tableName != "country" && $tableName != "state" && $tableName != "city"){
				$wherec["t.status"] = 'IN ("active")';
			}
			if(isset($type) && !empty($type) ){
				$wherec["t.type"] = 'IN ("'.$type.'")';
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

	public function dynamicGetList()
	{
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		// print($t);exit;
		$pluginID = $this->input->post('pluginID');
		$fieldID = $this->input->post('fieldID');
		
		$where = $this->input->post('wherec');
		//$select = $this->input->post('list');
		$text = trim($t);

		if(isset($fieldID) && !empty($fieldID)){
			$wheret = array();
			$wheret[ "fieldID"] = " = '".$fieldID."'";
			$wheret[ "linkedWith"] = "='".$pluginID."'";
			$fieldDetails = $this->CommonModel->GetMasterListDetails($selectC='', 'dynamic_fields', $wheret, '', '', '','');
			if(!$fieldDetails){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		if(isset($pluginID) && !empty($pluginID)){
			$wheret = array();
			$wheret[ " menuID"] = "= '" . $pluginID ."'";
			$selectC = "table_name";
			$tableDetails = $this->CommonModel->GetMasterListDetails($selectC, 'menu_master', $wheret, '', '', '','');
			if(!$tableDetails){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		// check is linekd with $fieldDetails
		$wherec= $whereOR = array(); 
		// print_r($fieldDetails[0]->fieldOptions);exit;
		// $where = $fieldDetails[0]->fieldOptions;
		if($fieldDetails[0]->fieldOptions == "categoryName"){
			$wherec["parent_id"] = "=".$fieldDetails[0]->parentCategory;
			if(isset($text) && !empty($text)) {
				$wherec[ "$where like  "] = "'%" . $text . "%'";
			}
		}else{
			if(isset($text) && !empty($text)) {
				$wherec[ "$where like  "] = "'%" . $text . "%'";
			}
			// $option = explode(",",$fieldDetails[0]->fieldOptions);
			// if (isset($option) && !empty($option)) {
			// 	foreach ($option as $key => $value) {
			// 		if (isset($text) && !empty($text)) {
			// 			$whereOR[ "$value like  "] = "'%" . $text . "%'";
			// 		}
			// 	}
			// }
		}
		$other = array("whereOR"=>$whereOR);
		// print_r($other);exit;
		$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$tableDetails[0]->table_name." WHERE Key_name = 'PRIMARY'";
		$res = $this->CommonModel->getdata($sql,array());
		$select=$res[0]->Column_name.",".$fieldDetails[0]->fieldOptions;
		$updateAns = $this->CommonModel->GetMasterListDetails($select,$tableDetails[0]->table_name, $wherec,'','',array(),$other);
		// print $this->db->last_query();exit;
		if (isset($updateAns) && !empty($updateAns)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns;
			$status['lookup'] =array("pKey"=>$res[0]->Column_name);
			$status['statusCode'] = 400;
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

	public function getCountryList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');

		
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "country_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'%" . $textval . "%'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$countryDetails = $this->CommonModel->GetMasterListDetails($selectC, 'country', $wherec, '', '', $join, $other);
		} else {
			$countryDetails = $this->CommonModel->GetMasterListDetails($selectC, 'country', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $countryDetails;
		
		if ($countryDetails) {
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

	public function getStateList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$countryId = $this->input->post('country');

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "state_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = array();
		if (isset($countryId) && !empty($countryId)) {
			$wherec["country_id ="] = "'". $countryId . "'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$statesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'states', $wherec, '', '', $join, $other);
		} else {
			$statesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'states', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $statesDetails;
		if ($statesDetails) {
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
	public function copy(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$record_id = $this->input->post('record_id');
		$menuID = $this->input->post('menuId');
		if(!isset($menuID) || empty($menuID)){
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$moduleDetails = $this->CommonModel->getMasterDetails("menu_master","*",array("menuID"=>$menuID));
		$table = $this->db->dbprefix.$moduleDetails[0]->table_name;
		$menuLink = $moduleDetails[0]->menuLink;
		if(!isset($table) || empty($table)){
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$copiedStatus = $this->copyData($table,$record_id);
		if ($copiedStatus) {
			$lastID = $this->db->insert_id();
			if ($table == 'ab_invoice_header') {
				// UPDATE INVOICE NUMBER
				$invoiceNumber = $this->generateReceiptNumber($lastID,$menuLink,$this->company_id);
				$whereR = array("invoiceID"=> $lastID);
				$inData = array("invoiceNumber"=> $invoiceNumber);
				$invoiceNumberUpdate = $this->CommonModel->updateMasterDetails($table,$inData,$whereR);
				// INSERT INVOICE LINE RECORDS IN INVOICE_LINE
				$invoiceLineSql = "SHOW COLUMNS FROM ab_invoice_line"; 
				$invoiceLineStructure = $this->CommonModel->getdata($invoiceLineSql,array());
				if (isset($invoiceLineStructure) && !empty($invoiceLineStructure)) {
					$primary_key = '';
					$includeFields = array();
					foreach ($invoiceLineStructure as $key => $value) {
						if ($value->Key == 'PRI') {
							$primary_key = $value->Field;
						}else{
							$includeFields[] = $value->Field;
						}
					}
					$fieldsToSelect = array_diff($includeFields, array('invoiceID'));
    					$fieldsToSelect = implode(', ', $fieldsToSelect);
					$includeFields = implode(', ', $includeFields);
					$includedFields = '( '.$includeFields.')';
				}
				$insertInvoiceLine = 'INSERT INTO ab_invoice_line' . $includedFields .' SELECT "' . $lastID . '" AS invoiceID, '. $fieldsToSelect . ''  . ' FROM ab_invoice_line WHERE invoiceID = "' . $record_id . '";';
				$copiedStatus = $this->CommonModel->insertUsingSQL($insertInvoiceLine);
			}
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
		
	}
	public function copyData($table,$record_id){
		$sql = "SHOW COLUMNS FROM ".$table; 
		$structure = $this->CommonModel->getdata($sql,array());
		if (isset($structure) && !empty($structure)) {
			$primary_key = '';
			$includeFields = array();
			foreach ($structure as $key => $value) {
				if ($value->Key == 'PRI') {
					$primary_key = $value->Field;
				}else{
					$includeFields[] = $value->Field;
				}
			}
			$includeFields = implode(', ', $includeFields);
			$includedFields = '( '.$includeFields.')';
			$sql2 = 'INSERT INTO '.$table.''.$includedFields.' '.'SELECT '.$includeFields.' FROM '.$table.' WHERE '.$primary_key.' = "'.$record_id.'";' ;
			$copiedStatus = $this->CommonModel->insertUsingSQL($sql2);
			if ($copiedStatus) {
				return true;
			} else {
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
				
		}
	}
	public function getCityList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$stateId = $this->input->post('state');

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "city_name";
			$order = "ASC";
		}

		$other = array("orderBy" => $orderBy, "order" => $order);

		$wherec = array();

		if (isset($stateId) && !empty($stateId)) {
			$wherec["state_id ="] = "'". $stateId . "'";
		}
	
		$join=array();

		$selectC = "*";
		if ($isAll == "Y") {
			$join = array();
			$cityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'cities', $wherec, '', '', $join, $other);
		} else {
			$cityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'cities', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $cityDetails;
		if ($cityDetails) {
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
	public function getFreeTextSearch(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$tableName = $this->input->post('tableName');
		$where = $this->input->post('wherec');
		$select = $this->input->post('list');
		$stat= $this->input->post('status');
		
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec[ "$where like  "] = "'%" . $text . "%'";
			//$wherec[ "type like  "] = "'%customer%'";
			if($stat =="true"){
				$wherec["t.status"] = 'IN ("active")';
			}
			$updateAns = $this->CommonModel->GetMasterListDetails($select, $tableName, $wherec);
			if (isset($updateAns) && !empty($updateAns)) {
				$status['msg'] = "sucess";
				$status['data'] = $updateAns;
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}
	}
	public function generateReceiptNumber($lastID,$record_type='',$company_id=''){
		$wheredoct = array();
		$wheredoct['company_id'] = $company_id;
		if (!isset($company_id) && empty($company_id)) {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(307);
			$status['statusCode'] = 307;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
		if (isset($lastID) && !empty($lastID)) {
			$invoiceDetails = $this->CommonModel->getMasterDetails("invoice_header","invoiceNumber,status",array("invoiceID"=>$lastID));		
			if (isset($invoiceDetails) && !empty($invoiceDetails)) {
				if ($invoiceDetails[0]->invoiceNumber == '') {
					return '' ;
				}
			}
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

	public function getbulkeditdata() {
		$this->access->checkTokenKey();
		$this->response->decodeRequest();		
		$ids = $this->input->post("list");
		$detail = $this->input->post("formdata");
		$menuID = $this->input->post("menuId");

		$wheredata["menuID"] = $menuID;
		$menudetails = $this->CommonModel->getMasterDetails("menu_master","*",$wheredata);
				
		if (!isset($menudetails) || empty($menudetails)) {
			$status['msg'] = $this->systemmsg->getErrorCode(338);
			$status['statusCode'] = 338;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}		
		if (isset($detail) && !empty($detail)) {
			$detail = json_decode($detail, true);			
			// Get primary key
			$sql = "SHOW COLUMNS FROM ab_".$menudetails[0]->table_name; 
			$structure = $this->CommonModel->getdata($sql,array());			
			$primary_key = '';
			foreach ($structure as $value) {
				if ($value->Key == 'PRI') {
					$primary_key = $value->Field;
					break;
				}
			}
			$detail['modified_date'] = date("Y/m/d H:i:s");
			if (isset($ids) && !empty($ids)) {
				$whereIn =  explode(",", $ids);
			}		
			// $whereIn =  explode(",", $ids);
			$updateAns = $this->CommonModel->editMasterDetails($menudetails[0]->table_name, $detail,$whereIn,$primary_key);
			// print_r($updateAns);exit;	
			
			if ($updateAns) {
				$status['msg'] = "success";
				$status['data'] = $updateAns;
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}           
		}
	}
}
