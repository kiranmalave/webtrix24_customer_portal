<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CompanyMaster extends CI_Controller
{

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
	 * So any other public methods not categoryed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	var $menuID="";
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

	public function getCompanyDetails()
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
			$whereData = $this->filters->prepareFilterData($postData);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
			
				$columnNames = [
					"country" => ["table" => "country", "alias" => "cn", "column" => "country_name", "key2" => "country_id"],
					"state" => ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"],
					"city" => ["table" => "cities", "alias" => "ci", "column" => "city_name", "key2" => "city_id"],
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
				// print($selectC);exit;
			}

			if($selectC !=""){
				$selectC = $selectC.",t.is_duplicate, t.status";
			}else{
				$selectC = $selectC."t.is_duplicate, t.status";	
			}
		}

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "companyName";
			$order = "ASC";
		}
		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$config["base_url"] = base_url() . "companyDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.infoID', 'info_settings', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		// print_r($wherec);
		if ($isAll == "Y") {
			$companyDetails = $this->CommonModel->GetMasterListDetails($selectC ="infoID,companyName",'info_settings', $wherec, '', '', $join, $other);
		} else {
			$selectC = "t.infoID,t.companyName,".$selectC;
			$companyDetails = $this->CommonModel->GetMasterListDetails($selectC, 'info_settings', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $companyDetails;
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
		if ($companyDetails) {
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

	public function companyMaster($infoID = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
	
		if ($method == "POST" || $method == "PUT") {
			$infoDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$infoDetails['companyName'] = $this->validatedata->validate('companyName','Company Name',false,'',array());
			$infoDetails['company_address'] = $this->validatedata->validate('company_address','Company Address',false,'',array());
			$infoDetails['fromEmail'] = $this->validatedata->validate('fromEmail','from Email',false,'',array());
			$infoDetails['ccEmail'] = $this->validatedata->validate('ccEmail','CC Email',false,'',array());
			$infoDetails['fromName'] = $this->validatedata->validate('fromName','From Name',false,'',array());
			$infoDetails['bank_acc_no'] = $this->validatedata->validate('bank_acc_no','bank acc no',false,'',array());
			$infoDetails['ifsc_code'] = $this->validatedata->validate('ifsc_code','ifsc code',false,'',array());
			$infoDetails['record_per_page'] = $this->validatedata->validate('record_per_page','record per page',false,'',array());
			$infoDetails['pan'] = $this->validatedata->validate('pan','pan',false,'',array());
			$infoDetails['gst_no'] = $this->validatedata->validate('gst_no','gst no',false,'',array());
			$infoDetails['msme_no'] = $this->validatedata->validate('msme_no','msme no',false,'',array());
			$infoDetails['lut_no'] = $this->validatedata->validate('lut_no','lut no',false,'',array());
			$infoDetails['mcir_code'] = $this->validatedata->validate('mcir_code','mcir code',false,'',array());
			$infoDetails['bank_details'] = $this->validatedata->validate('bank_details','bank details',false,'',array());
			$infoDetails['is_gst_billing'] = $this->validatedata->validate('is_gst_billing','gst billing',false,'',array());
			$infoDetails['is_display_payment'] = $this->validatedata->validate('is_display_payment','is Display Payment',false,'',array());
			$infoDetails['country'] = $this->validatedata->validate('country','country',false,'',array());
			$infoDetails['state'] = $this->validatedata->validate('state','state',false,'',array());
			$infoDetails['city'] = $this->validatedata->validate('city','city',false,'',array());
			$infoDetails['zip'] = $this->validatedata->validate('zip','zip',false,'',array());
			$infoDetails['stateGst'] = $this->validatedata->validate('stateGst','State Gst',false,'',array());
			$infoDetails['centralGst'] = $this->validatedata->validate('centralGst','central Gst',false,'',array());
			$infoDetails['interGst'] = $this->validatedata->validate('interGst','inter Gst',false,'',array());
			$infoDetails['mobile_number'] = $this->validatedata->validate('mobile_number','mobile number',false,'',array());
			$infoDetails['invoice_logo'] = $this->validatedata->validate('invoice_logo','Invoice Logo',false,'',array());
			$infoDetails['quotation_terms_conditions'] = $this->validatedata->validate('quotation_terms_conditions','quotation terms conditions',false,'',array());
			$infoDetails['invoice_terms_condotions'] = $this->validatedata->validate('invoice_terms_condotions','invoice terms condotions',false,'',array());
			$infoDetails['receipt_terms_condotions'] = $this->validatedata->validate('receipt_terms_condotions','receipt terms condotions',false,'',array());
			$infoDetails['date_format'] = $this->validatedata->validate('date_format','date format',false,'',array());
			$infoDetails['email_provider'] = $this->validatedata->validate('email_provider','email provider',false,'',array());
			$infoDetails['smtp_host'] = $this->validatedata->validate('smtp_host','smtp host',false,'',array());
			$infoDetails['smtp_user'] = $this->validatedata->validate('smtp_user','smtp user',false,'',array());
			$infoDetails['smtp_pass'] = $this->validatedata->validate('smtp_pass','smtp pass',false,'',array());
			$infoDetails['smtp_post'] = $this->validatedata->validate('smtp_post','smtp port',false,'',array());
			// WHATS APP INTEGRATION
			$infoDetails['wa_token'] = $this->validatedata->validate('wa_token','WhatsApp Token',false,'',array());
			$infoDetails['wa_ids'] = $this->validatedata->validate('wa_ids','WhatsApp ID',false,'',array());
			$infoDetails['wa_from'] = $this->validatedata->validate('wa_from','WhatsApp From Number',false,'',array());
			
			$infoDetails['sendgrid_API'] = $this->validatedata->validate('sendgrid_API','Sendgrid API',false,'',array());
			$infoDetails['brevo_API'] = $this->validatedata->validate('brevo_API','Brevo API',false,'',array());
			$infoDetails['email_logo'] = $this->validatedata->validate('email_logo','Email Logo',false,'',array());
			$infoDetails['status'] = $this->validatedata->validate('status','status',false,'',array());	

			$countryCodeNumber = $this->input->post('countryCodeNumber');
			if(isset($countryCodeNumber) && !empty($countryCodeNumber)){
				$countryarray = explode(" ", $countryCodeNumber);
				$mobNumberArray = explode(" ", $infoDetails['mobile_number']);
				/* Assuming that the first element of $countryarray is the country code
				 and the first element of $mobNumberArray is the mobile number */
				$formattedNumber = $countryarray[0] . '-' . $mobNumberArray[0];
				$infoDetails['mobile_number'] = $formattedNumber;
			}
			// DOC PREFIXES
			// print_r($_POST);exit;
			$docDetails =  array( 
				array(
					'docPrintForm'=> 'Invoice',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_in'),
					'docYearCD'=> $this->validatedata->validate('doc_year_in'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_in'),
					'docTypeID'=> 1,
				),
				array(
					'docPrintForm'=> 'Receipts',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_rec'),
					'docYearCD'=> $this->validatedata->validate('doc_year_rec'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_rec'),
					'docTypeID'=> 2,
				),
				array(
					'docPrintForm'=> 'Quotation',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_quo'),
					'docYearCD'=> $this->validatedata->validate('doc_year_quo'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_quo'),
					'docTypeID'=> 3,
				),
				array(
					'docPrintForm'=> 'Delivery Challan',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_dc'),
					'docYearCD'=> $this->validatedata->validate('doc_year_dc'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_dc'),
					'docTypeID'=> 4,
				),
				array(
					'docPrintForm'=> 'Purchase',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_pur'),
					'docYearCD'=> $this->validatedata->validate('doc_year_pur'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_pur'),
					'docTypeID'=> 5,
				),
				array(
					'docPrintForm'=> 'Proforma',
					'docPrefixCD'=> $this->validatedata->validate('doc_prefix_pro'),
					'docYearCD'=> $this->validatedata->validate('doc_year_pro'),
					'docCurrNo'=> $this->validatedata->validate('doc_curr_no_pro'),
					'docTypeID'=> 6,
				),
			);
			// add dynamic feild data
			$fieldData = $this->datatables->mapDynamicFeilds("companyMaster",$this->input->post());
			$infoDetails = array_merge($fieldData, $infoDetails);

			if ($method == "PUT") {
				$where = array("companyName" => $infoDetails['companyName']);
				$companyName = $this->CommonModel->getMasterDetails('info_settings', '', $where);
				if (!empty($companyName)) {
					$status['msg'] = $this->systemmsg->getErrorCode(329);
					$status['statusCode'] = 329;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$infoDetails['created_by'] = $this->input->post('SadminID');
				$infoDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('info_settings', $infoDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$company_id = $this->db->insert_id();
					$this->docPrefix($company_id,$docDetails,$method);
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('infoID' => $infoID);
				if (!isset($infoID) || empty($infoID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$whereCheckName = array('companyName' => $infoDetails['companyName'] );
				$checkCompanyName = $this->CommonModel->getMasterDetails('info_settings', 'infoID, companyName, status', $whereCheckName);
				if(isset($checkCompanyName) && !empty($checkCompanyName)){
					if($checkCompanyName[0]->companyName == $infoDetails['companyName'] && $checkCompanyName[0]->infoID != $infoID ){
						$status['msg'] = $this->systemmsg->getErrorCode(329);
						$status['statusCode'] = 329;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
				}
				$infoDetails['modified_by'] = $this->input->post('SadminID');
				$infoDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('info_settings', $infoDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$this->docPrefix($infoID,$docDetails,$method);
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$infoDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->deleteMasterDetails('info_settings', $where);
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
			if($infoID == ""){
				$status['msg'] = $this->systemmsg->getErrorCode(236);
				$status['statusCode'] = 236;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			$wherec = $join = array();
			$other = array();
			$selectC = '';
			$wherec["t.infoID"] = "=".$infoID;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}

			$infoDetails = $this->CommonModel->GetMasterListDetails($selectC, 'info_settings', $wherec, '', '', $join, array());
			if (isset($infoDetails) && !empty($infoDetails)) {
				$fullNumber = $infoDetails[0]->mobile_number;
				$numberParts = explode('-', $fullNumber);
			
				if (count($numberParts) == 2) {
					$countryCode = $numberParts[0]; // The country code part
					$mobileNumber = $numberParts[1]; // The mobile number part
					$infoDetails[0]->mobile_number = $mobileNumber;
					$infoDetails[0]->countryCode = $countryCode;
				} else {
					$infoDetails[0]->countryCode = '';
					$infoDetails[0]->mobile_number = $fullNumber;
				}

				$printForm = array('Invoice','proforma','Delivery Challan','Quotation','Purchase','Receipts');
				foreach ($printForm as $key => $value) {					
					$wherec = array();
					$wherec['company_id'] = $infoID ; 
					$wherec['docPrintForm'] = $value ; 
					$sel = '' ;
					if ($value == 'Invoice') {
						$trailing = 'in';
					}else if ($value == 'proforma') {
						$trailing = 'pro';
					}else if ($value == 'Delivery Challan') {
						$trailing = 'dc';
					}else if ($value == 'Quotation') {
						$trailing = 'quo';
					}else if ($value == 'Purchase') {
						$trailing = 'pur';
					}else if ($value == 'Receipts') {
						$trailing = 'rec';
					}
					$sel = 'docPrefixCD As doc_prefix_'.$trailing.', docTypeID as doc_type_id_'.$trailing.',docYearCD As doc_year_'.$trailing.',docCurrNo As doc_curr_no_'.$trailing;
					$docPrefix =  $this->CommonModel->getMasterDetails('doc_prefix',$sel,$wherec);
					if (isset($docPrefix) && !empty($docPrefix)) {
						foreach ($docPrefix[0] as $key => $value) {
							$infoDetails[0]->$key = $value;
						}
					}
				}
				$status['data'] = $infoDetails;
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
	public function docPrefix($company_id='',$details= array(),$method=''){
		if ($method == 'PUT') {
			$docTypeID = $this->CommonModel->getLastDocPrefix();
			if (!isset($docTypeID) && empty($docTypeID)) {
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} 
			$docTypeID = $docTypeID[0]->docTypeID ;
			$updateDate = date("Y/m/d H:i:s");
			foreach ($details as $key => $doc) {
				$docTypeID = $docTypeID + 1;
				$doc['status'] = "active";
				$doc['docTypeID'] = $docTypeID;
				$doc['created_by'] = $this->input->post('SadminID');
				$doc['created_date'] = $updateDate;
				$doc['company_id'] = $company_id;
				$isExistRow = $this->CommonModel->getMasterDetails('doc_prefix','docPrefixID',array('company_id'=>$doc['company_id'],'docPrintForm'=>$doc['docPrintForm']));
				if (isset($isExistRow) && !empty($isExistRow)) {
					$where['docPrintForm'] = $doc['docPrintForm'];
					$where['company_id'] = $company_id;
					$doc['modified_by'] = $this->input->post('SadminID');
					$doc['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('doc_prefix', $doc, $where);
				}else{
					$iscreated = $this->CommonModel->saveMasterDetails('doc_prefix', $doc);
				}
			}
		}else{
			if (!isset($company_id) || empty($company_id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			if ($this->CommonModel->isPrefixExist($company_id)) {
				$this->docPrefix($company_id,$details,'PUT');
			}
			$updateDate = date("Y/m/d H:i:s");
			$where = array('company_id' => $company_id);
			foreach ($details as $key => $doc) {
				$where['docPrintForm'] = $doc['docPrintForm'];
				$doc['modified_by'] = $this->input->post('SadminID');
				$doc['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('doc_prefix', $doc, $where);
			}
		}
		
	}

	public function duplicateCompany()
	{
		$id = $this->input->post("id");
		$adminID= $this->input->post('adminID');
		$where = array("infoID"=>$id);
		$docDetails = array();

		$companyDetail = $this->CommonModel->getMasterDetails('info_settings','',$where);
		if(isset($companyDetail)&&!empty($companyDetail)){
			$companyDetailArray = json_decode(json_encode($companyDetail[0]), true);
			unset($companyDetailArray['infoID']);
			unset($companyDetailArray['modified_date']);
			unset($companyDetailArray['modified_by']);
			$updateDate = date("Y/m/d H:i:s");
			$companyDetailArray['status'] = 'inactive';
			$companyDetailArray['is_duplicate'] = 'yes';
			$companyDetailArray['created_date'] = $updateDate;
			$companyDetailArray['created_by'] = $adminID;

			$printForm = array('Invoice','proforma','Delivery Challan','Quotation','Purchase','Receipts');
			foreach ($printForm as $key => $value) {					
				$wherec = array();
				$wherec['company_id'] = $id ; 
				$wherec['docPrintForm'] = $value ; 
				$sel = 'docPrintForm, docPrefixCD ,docYearCD ,docCurrNo';
				$docPrefix =  $this->CommonModel->getMasterDetails('doc_prefix',$sel,$wherec);
				if (isset($docPrefix) && !empty($docPrefix)) {
					$docDetails[] = (array)$docPrefix[0];
				}
			}
			$iscreated = $this->CommonModel->saveMasterDetails('info_settings',$companyDetailArray);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$company_id = $this->db->insert_id();
				$this->docPrefix($company_id,$docDetails,'PUT');
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}	
		}
		
	}

	public function companyChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$tables = array('admin', 'appointment', 'customer', 'invoice_header', 'opportunity', 'purchase_header', 'receipts', 'tasks');
		$action = $this->input->post("action");
		$action = $action ?? '';
		$this->db->trans_start();
		if (trim($action) == "delete") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			foreach ($ids as $key => $value) {
				$where = array('infoID' => $value);
				$changestatus = $this->CommonModel->deleteMasterDetails('info_settings', $where);
				if ($changestatus) {
					foreach ($tables as $key2 => $value2) {
						$where = array('company_id' => $value);
						$iscreated = $this->CommonModel->deleteMasterDetails($value2, $where);
						if (!$iscreated) {
							$this->db->trans_rollback();
							$status['data'] = array();
							$status['msg'] = $this->systemmsg->getErrorCode(996);
							$status['statusCode'] = 996;
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}	
					}
					$this->db->trans_commit();
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				} else {
					$this->db->trans_rollback();
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}	
			}
		}
	}

	public function hardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$tables = array('admin', 'appointment', 'customer', 'invoice_header', 'opportunity', 'receipts', 'tasks');
		$company_id = $this->input->post("id");
		$this->db->trans_start();
		$where = array('infoID' => $company_id);
		$changestatus = $this->CommonModel->deleteMasterDetails('info_settings', $where);
		if ($changestatus) {
			foreach ($tables as $key2 => $value2) {
				if ($this->db->table_exists($value2)) {
					$where = array('company_id' => $company_id);
					$iscreated = $this->CommonModel->deleteMasterDetails($value2, $where);
					if (!$iscreated) {
						$this->db->trans_rollback();
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}	
				}
			}
			$this->db->trans_commit();
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$this->db->trans_rollback();
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function setDefualtCompany()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$user_id = $this->input->post("user_id");
		$company_id = $this->input->post("company_id");
		$where = array("adminID"=> $user_id);
		$adminDetails['default_company'] = $company_id;
		
		$updated = $this->CommonModel->updateMasterDetails('admin', $adminDetails, $where);
		if ($updated) {
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
	public function getDefualtCompany()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$where = array("adminID"=> $this->input->post("SadminID"));
		$default = $this->CommonModel->getMasterDetails('admin','default_company', $where);
		if ($default) {
			$status['data'] = $default[0];
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
	public function getCompanyList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		
		$wherec = $join = $other =  array();
		$adminID = $this->input->post('SadminID');
		$companyList =  $this->CommonModel->getMasterDetails('admin','company_id,default_company',array('adminID'=>$adminID));
		$company_ids = array();
		
		if (isset($companyList[0]->company_id) && !empty($companyList[0]->company_id)) {
			$company_id = $companyList[0]->company_id;
			$company_ids = explode(',',$company_id);
		} 
		if (isset($companyList[0]->default_company) && !empty($companyList[0]->default_company)) {
			$status['default_company'] = $companyList[0]->default_company;
		} 
		$wherec["status = "] = "'active'";
		// $selectC = "t.infoID,t.companyName";
		$selectC = "t.*";
		$companyDetails = $this->CommonModel->GetMasterListDetails($selectC, 'info_settings', $wherec,'', '', $join, $other);
		
		$companyDetails1 = $companyDetails;
		$companyDetails = array();
		if (isset($company_ids) && !empty($company_ids)) {
			foreach ($company_ids as $C_key => $C_value) {
				foreach ($companyDetails1 as $key => $value) {
					if ($C_value == $value->infoID) {
						$companyDetails[] = $value;
					}
				}
			}
		}
		if ($companyDetails) {
			$status['data'] = $companyDetails;
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

}
