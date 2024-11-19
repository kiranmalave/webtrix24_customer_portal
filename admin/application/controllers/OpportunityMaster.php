<?php
defined('BASEPATH') or exit('No direct script access allowed');

class opportunityMaster extends CI_Controller
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
	 * So any other public methods not contacted with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		// $this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
		if(!$this->config->item('development'))
		{
			$this->load->library("emails");
			$this->load->library("EmailsNotifications");
			$this->load->library("NotificationTrigger");
		}
	}


	public function getopportunityDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('opportunity_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$startDate = $this->input->post('end_dateStart');
		$endDate = $this->input->post('end_dateEnd');
		$record_type = $this->input->post('record_type');
		$opportunity_type = $this->input->post('opportunity_type'); 
		$stages = $this->input->post('stage');
		$branch = $this->input->post('branch_id');
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
		
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			unset($postData['end_dateStart']);
			unset($postData['end_dateEnd']);
			$whereData = $this->filters->prepareFilterData($postData);
			// print_r($whereData);exit;
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			// // create join for created by and modified data details
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
					"source" => ["table" => "categories", "alias" => "cl", "column" => "categoryName", "key2" => "category_id"],
					"opportunity_type" => ["table" => "categories", "alias" => "ct", "column" => "categoryName", "key2" => "category_id"],
					"stage" => ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"],
					"assignee" => ["table" => "admin", "alias" => "aa", "column" => "name", "key2" => "adminID"],
					"company_id" => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
					"customer_id" => ["table" => "customer", "alias" => "cs", "column" => "name", "key2" => "customer_id"],
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
						if($columnName == 'stage'){
							$selectC = "css.cat_color as stage_color,".$selectC;
						}
						if($columnName == 'lead_source'){
							$selectC = "cl.cat_color as source_color,".$selectC;
						}
						if($columnName == 'state_id'){
							$selectC = "st.state_name as state_id,st.state_code as state_code,".$selectC;
						}
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}
			
			// if($selectC != ""){
			// 	$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
			// }else{
			// 	$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
			// }
			
		}
		
		// $config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "name";
			$order = "ASC";
		}

		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		
		if(isset($startDate) && !empty($startDate)){
			$sDate = date("Y-m-d",strtotime($startDate));
			$wherec["end_date >="] = "'".$sDate."'";
		}

		if(isset($endDate) && !empty($endDate)){
			$eDate = date("Y-m-d",strtotime($endDate));
			$wherec["end_date <="] = "'".$eDate."'";
		}

		if(isset($createdStartDate) && !empty($createdStartDate)){
			$sDate = date("Y-m-d",strtotime($createdStartDate));
			$wherec["Date(t.created_date) >="] = "'".$sDate."'";
		}

		if(isset($createdEndDate) && !empty($createdEndDate)){
			$eDate = date("Y-m-d",strtotime($createdEndDate));
			$wherec["Date(t.created_date) <="] = "'".$eDate."'";
		}

		if(isset($stages) && !empty($stages)){
			if($stages =="other"){
				$wherec["t.stage ="] = "'0'";	
			}else{
				$wherec["t.stage ="] = "'".$stages."'";
			}
		}
		if(isset($this->company_id) && !empty($this->company_id)){
			$wherec["t.company_id ="] = "'".$this->company_id."'";
		}
		$adminID = $this->input->post('SadminID');
		if (isset($opportunity_type) && !empty($opportunity_type)) {
			$statusStr = str_replace(",", '","', $opportunity_type);
			$wherec["t.opportunity_type"] = 'IN ("' . $statusStr . '")';
		}
		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		$config["base_url"] = base_url() . "opportunityDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.opportunity_id', 'opportunity', $wherec, $other);
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
			$jkey = count($join) + 1;
			$join[$jkey]['type'] = "LEFT JOIN";
			$join[$jkey]['table'] = 'states';
			$join[$jkey]['alias'] = 'st';
			$join[$jkey]['key1'] = 'state_id';
			$join[$jkey]['key2'] = "state_id";
			$opportunityDetails = $this->CommonModel->GetMasterListDetails($selectC="opportunity_id,name,t.state_id,pan_number,address,email,mobile_no,zipcode,gst_no,st.gst_state_code",'opportunity',$wherec,'','',$join,$other);	
		}else{
			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="categories";
			$join[$jkey]['alias'] ="css";
			$join[$jkey]['key1'] ="stage";
			$join[$jkey]['key2'] ="category_id";

			$jkey = count($join)+1;
			$join[$jkey]['type'] ="LEFT JOIN";
			$join[$jkey]['table']="admin";
			$join[$jkey]['alias'] ="ai";
			$join[$jkey]['key1'] ="assignee";
			$join[$jkey]['key2'] ="adminID";
			$selectC = "ai.photo AS assigneePhoto,ai.adminID AS assigneeID, ai.name AS assignee,".$selectC;
			$selectC = "css.category_id AS stageID,t.created_date, ".$selectC;
			$opportunityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'opportunity', $wherec, $config["per_page"], $page, $join, $other);
		}
		
		$status['data'] = $opportunityDetails;
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
		if ($opportunityDetails) {
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

	public function opportunityMaster($opportunity_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$this->menuID = $this->input->post('menuId');
		$company_id = $this->input->post('company_id');
 		
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$opportunityDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$opportunityDetails['opportunity_id'] = $this->validatedata->validate('opportunity_id', 'opportunity ID', false, '', array());
			$opportunityDetails['opportunity_title'] = $this->validatedata->validate('opportunity_title', 'Opportunity Title', true, '', array());
			$opportunityDetails['source'] = $this->validatedata->validate('source', 'Source', false, '', array());
			$opportunityDetails['opportunity_type'] = $this->validatedata->validate('opportunity_type', 'Opportunity Type', false, '', array());
			$opportunityDetails['assignee'] = $this->validatedata->validate('assignee', 'Assignee', false, '', array());
			$opportunityDetails['stage'] = $this->validatedata->validate('stage', 'Stage', false, '', array());
			$opportunityDetails['opportunity_amount'] = $this->validatedata->validate('opportunity_amount', 'Opportunity Amount', false, '', array());
			$opportunityDetails['end_date'] = $this->validatedata->validate('end_date','End Date',false,'',array());
			$opportunityDetails['description'] = $this->validatedata->validate('description','Description',false,'',array());
			$opportunityDetails['opportunity_end'] = $this->validatedata->validate('opportunity_end', 'Opportunity End', false, '', array());
			$opportunityDetails['opportunity_start_date'] = $this->validatedata->validate('opportunity_start_date', 'Opportunity Start Date', false, '', array());
			$opportunityDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer', false, '', array());
			$opportunityDetails['status'] = $this->validatedata->validate('status', 'Status', false, '', array());

			
			
			if (isset($opportunityDetails['opportunity_end']) && !empty($opportunityDetails['opportunity_end']) && $opportunityDetails['opportunity_end'] != "0000-00-00") {
				$opportunityDetails['opportunity_end'] = str_replace("/", "-", $opportunityDetails['opportunity_end']);
				$opportunityDetails['opportunity_end'] = date("Y-m-d", strtotime($opportunityDetails['opportunity_end']));
			}else{
				$opportunityDetails['opportunity_end'] = null;
			}

			if (isset($opportunityDetails['opportunity_start_date']) && !empty($opportunityDetails['opportunity_start_date']) && $opportunityDetails['opportunity_start_date'] != "0000-00-00") {
				$opportunityDetails['opportunity_start_date'] = str_replace("/", "-", $opportunityDetails['opportunity_start_date']);
				$opportunityDetails['opportunity_start_date'] = date("Y-m-d", strtotime($opportunityDetails['opportunity_start_date']));
			}else{
				$opportunityDetails['opportunity_start_date'] = null;
			}
			

			if ($method == "PUT") {
				$this->db->trans_start();
				$opportunityDetails['company_id'] = $this->company_id;
				$opportunityDetails['status'] = "active";
				$opportunityDetails['created_by'] = $this->input->post('SadminID');
				$opportunityDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('opportunity', $opportunityDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$opportunity_id = $this->db->insert_id();
					$this->db->trans_commit();
					$status['lastID'] = $opportunity_id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('opportunity_id' => $opportunity_id);
				if (!isset($opportunity_id) || empty($opportunity_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$opportunityDetails['modified_by'] = $this->input->post('SadminID');
				$opportunityDetails['modified_date'] = $updateDate;
				$oldData = $this->CommonModel->getMasterDetails('opportunity', '', $where) ;
				$iscreated = $this->CommonModel->updateMasterDetails('opportunity', $opportunityDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					if(!$this->config->item('development'))
					{
						$this->notificationtrigger->prepareNotification('update','opportunity','opportunity_id',$opportunity_id,$oldData,$this->menuID,$this->company_id);
					}
					$status['lastID'] = $opportunity_id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$opportunityDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('opportunity', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					
					if(!$this->config->item('development'))
					{	
						$where['opportunity_id'] = $opportunity_id;
						$oldData = $this->CommonModel->getMasterDetails('opportunity', '', $where) ;
						$this->notificationtrigger->prepareNotification('delete','opportunity','opportunity_id',$opportunity_id,$oldData,$this->menuID,$this->company_id);
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else {
			if($opportunity_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$wherec["opportunity_id ="] = "'".$opportunity_id."'";

			$whereAttachment = array(
				"opportunity_id" => $opportunity_id
			);

			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="ad";
			$join[0]['key1'] ="assignee";
			$join[0]['key2'] ="adminID";

			$join[1]['type'] ="LEFT JOIN";
			$join[1]['table']="customer";
			$join[1]['alias'] ="c";
			$join[1]['key1'] ="customer_id";
			$join[1]['key2'] ="customer_id";

			$selectC = "ad.name, c.name AS customerName";

			$assignee = $this->CommonModel->GetMasterListDetails($selectC, 'opportunity', $wherec, '', '', $join, '');
			// print_r($assignee);exit;
			
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
			$wherec["t.opportunity_id"] = "=".$opportunity_id;
			//$opportunityDetails = $this->CommonModel->GetMasterListDetails('opportunity', '', $where);
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			if(isset($this->menuDetails->metadata) && !empty($this->menuDetails->metadata)){
				$cData = json_decode($this->menuDetails->metadata);
				// print_r($cData);exit;
				$attachmentArray = array();
				foreach ($cData as $key => $value) {
					foreach ($value as $keycol => $valuecol) {
						if(isset($valuecol->column_name) && isset($valuecol->fieldID)){
							
							$ccData[] = "t.".$valuecol->column_name;
							$fieldIdDetails[] = $valuecol->fieldID;
							
							if ($valuecol->fieldType == 'File') {
								$whereAttachment1 = array(
									"record_id" => $opportunity_id,
									"menu_id" => $this->menuID,
									"field_id" => $valuecol->fieldID,
								);
								
								$attachments = $this->CommonModel->getMasterDetails('custom_attachment','',$whereAttachment1);
								// print"<pre>";
								// print_r($attachments);exit;
								$attachmentArray[] = $attachments;
							}
							
						}
					}
				}
			}
			
			$opportunityDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			
			if (isset($opportunityDetails) && !empty($opportunityDetails)) {
				$custAttachments = $this->CommonModel->getMasterDetails('opportunity_attachment','',$whereAttachment);
				if(!empty($custAttachments)){
					$attachment = array_column($custAttachments,'attachment_file');
					$attachmentID = array_column($custAttachments,'attachment_id');
					$opportunityDetails[0]->attachment_file = $attachment;
					$opportunityDetails[0]->attachment_id = $attachmentID;
				}
				if(!empty($assignee)){
					$assigneeName = array_column($assignee,'name');
					$customerName = array_column($assignee,'customerName');
					$opportunityDetails[0]->assigneeName = $assigneeName;
					$opportunityDetails[0]->customerName = $customerName;
				}
				if(isset($opportunityDetails[0]->mobile_no) && !empty($opportunityDetails[0]->mobile_no)) {
					// $mobileNumberObject = $opportunityDetails[0]->mobile_no;
					$mobileNumberString = $opportunityDetails[0]->mobile_no;

					// Decoding the JSON-like string to get the actual array
					$mobileNumberArray = json_decode($mobileNumberString);

					// Extracting country code and number from the array
					if(is_array($mobileNumberArray)){
						$countryCode = $mobileNumberArray[0];
						$number = $mobileNumberArray[1];
						$opportunityDetails[0]->mobile_no = $number;
						$opportunityDetails[0]->countryCode = $countryCode;
					}
				}

				$attachmentTosave = array();
					
				if (!empty($attachmentArray)) {
					$attachmentTosave = array(); // Initialize the variable outside the loop
					foreach ($attachmentArray as $key => $attachments) {
						// Extract attachment details for the current iteration
						$attachmentFiles = array_column($attachments, 'attachment_file');
						$attachmentIDs = array_column($attachments, 'attachment_id');
						$attachmentFieldIDs = array_column($attachments, 'field_id');
				
						// Merge attachment data into $opportunityDetails for the current iteration
						$attachmentTosavetemp = array();
						$attachmentTosavetemp['attachFile'] = $attachmentFiles;
						$attachmentTosavetemp['attachment_id'] = $attachmentIDs;
						$attachmentTosavetemp['attachment_fieldID'] = $attachmentFieldIDs;
						$attachmentTosave[] = $attachmentTosavetemp;
					}
					// Assign the merged attachment data to $opportunityDetails
					$opportunityDetails[0]->uploadedMedia = $attachmentTosave;
					// print_r($opportunityDetails[0]->uploadedMedia);exit;
				}

				$status['data'] = $opportunityDetails;
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

	public function opportunityChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$menuId = $this->input->post("menuId");
			$changestatus = $this->CommonModel->changeMasterStatus('opportunity', $statusCode, $ids, 'opportunity_id');
			if ($changestatus) {			
				if(!$this->config->item('development')){	
					$idlist = explode(",", $ids);
					foreach ($idlist as $key => $value) {
						$where['opportunity_id'] = $value;
						$oldData = $this->CommonModel->getMasterDetails('opportunity', '', $where);
						if (isset($oldData) && !empty($oldData)) {
							$this->notificationtrigger->prepareNotification('delete','opportunity','opportunity_id',$value,$oldData,$menuId,$this->company_id);
						}
					}
				}
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$this->response->outputErrorResponse(996);
			}
		}
	}

	public function opportunityPermanentDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['opportunity_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "changeStatus") {
			$oldData = array();
			$idlist = explode(",", $ids);
			foreach ($idlist as $key => $value) {
				// PRIMARY DATA
				$where['opportunity_id'] = $value;
				$oldData1 = $this->CommonModel->getMasterDetails('opportunity', '', $where);
				// JOINED DATA
				$data['menuID'] = $menuId;
				$data['details']['opportunity_id'] = $value;
				$data['opportunity_id'] = $value;
				$joined = $this->notificationtrigger->getJoinedDetails('opportunity',$data);
				$oldData1[0]->joinedData = $joined['details'];
				$oldData[$value] = $oldData1;
			}
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('opportunity', '',$whereIn);
			if ($changestatus) {
				$idlist = explode(",", $ids);
				foreach ($idlist as $key => $value) {
					$whereT = array('opportunity_id' => $value);
					$whereA = array('opportunity_ID' => $value);
					$custTask = $this->CommonModel->deleteMasterDetails('tasks', $whereT);
					$custAppoint = $this->CommonModel->deleteMasterDetails('appointment', $whereT);
					if(!$this->config->item('development')){	
						if (isset($oldData[$value]) && !empty($oldData[$value])) {
							$this->notificationtrigger->prepareNotification('delete','opportunity','opportunity_id',$value,$oldData[$value],$menuId,$this->company_id);
						}
					}
				}
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

	public function leadUpdate()
	{
		$opportunityID = $this->input->post('opportunityID');
		$lead = $this->input->post('lead');
		$where = array('opportunity_id' => $opportunityID);
		$opportunityDetails['stages'] = $lead;
		$opportunityDetails['last_activity_date'] = date("Y/m/d H:i:s");
		$opportunityDetails['last_activity_type'] = "stage";
		$iscreated = $this->CommonModel->updateMasterDetails('opportunity', $opportunityDetails, $where);
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
	}

	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$menuIDs = $this->input->post("menuIDs");
			foreach ($menuIDs as $key => $value) {
				$where = array('category_id' => $value);
				$categoryIndex['lead_index'] = $key;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
			}

		}
	}

	public function opportunityUpload($opportunity_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($opportunity_id) && !empty($opportunity_id)){
			$mediapatharr = $this->config->item("mediaPATH") ."opportunity/".$opportunity_id ;
			print_r($mediapatharr);exit;
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($opportunity_id) || $opportunity_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."opportunity/temp-";
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
		
		
		$extraData["opportunity_id"] = $opportunity_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'opportunity_attachment',
			'fileTypeColumn' => 'attachment_file',
			'fileColumn' => 'attachment_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}

	public function multipleopportunityChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['opportunity_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('opportunity', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('opportunity', $action, $ids, 'opportunity_id');
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
