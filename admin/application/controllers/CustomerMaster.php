<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CustomerMaster extends CI_Controller
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


	public function getcustomerDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('customer_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$startDate = $this->input->post('birthDateStart');
		$endDate = $this->input->post('birthDateEnd');
		$createdStartDate = $this->input->post('createdDateStart');
		$createdEndDate = $this->input->post('createdDateEnd');
		$last_activityStartDate = $this->input->post('last_activityStart');
		$last_activityEndDate = $this->input->post('last_activityEnd');
		$record_type = $this->input->post('record_type');
		$custType = $this->input->post('type'); 
		$stages = $this->input->post('stages');
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
			unset($postData['birthDateStart']);
			unset($postData['birthDateEnd']);
			unset($postData['createdDateStart']);
			unset($postData['createdDateEnd']);
			unset($postData['last_activityStart']);
			unset($postData['last_activityEnd']);
			$whereData = $this->filters->prepareFilterData($postData);
			// print_r($whereData);exit;
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
					"lead_source" => ["table" => "categories", "alias" => "cl", "column" => "categoryName", "key2" => "category_id"],
					"stages" => ["table" => "categories", "alias" => "css", "column" => "categoryName", "key2" => "category_id"],
					"assignee" => ["table" => "admin", "alias" => "aa", "column" => "name", "key2" => "adminID"],
					"company_id" => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
					"assignee" => ["table" => "admin", "alias" => "ai", "column" => "name", "key2" => "adminID"],
					"lead_priority" => ["table" => "categories", "alias" => "cat", "column" => "categoryName", "key2" => "category_id"],
					"gst_state" => ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"],
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
						if($columnName == 'stages'){
							$selectC = "css.cat_color as stage_color,".$selectC;
						}
						if($columnName == 'lead_source'){
							$selectC = "cl.cat_color as source_color,".$selectC;
						}

					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print($selectC);exit;
			}			
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
			$wherec["birth_date >="] = "'".$sDate."'";
		}

		if(isset($endDate) && !empty($endDate)){
			$eDate = date("Y-m-d",strtotime($endDate));
			$wherec["birth_date <="] = "'".$eDate."'";
		}

		if(isset($createdStartDate) && !empty($createdStartDate)){
			$sDate = date("Y-m-d",strtotime($createdStartDate));
			$wherec["Date(t.created_date) >="] = "'".$sDate."'";
		}

		if(isset($createdEndDate) && !empty($createdEndDate)){
			$eDate = date("Y-m-d",strtotime($createdEndDate));
			$wherec["Date(t.created_date) <="] = "'".$eDate."'";
		}

		if(isset($last_activityStartDate) && !empty($last_activityStartDate)){
			$sDate = date("Y-m-d",strtotime($last_activityStartDate));
			$wherec["t.last_activity_date >="] = "'".$sDate."'";
		}

		if(isset($last_activityEndDate) && !empty($last_activityEndDate)){
			$eDate = date("Y-m-d",strtotime($last_activityEndDate));
			$wherec["t.last_activity_date <="] = "'".$eDate."'";
		}

		if(isset($stages) && !empty($stages)){
			//print $stages;
			if($stages =="otherStatus"){
				//$wherec["t.stages ="] = "'0'";	
				$wherec["t.stages"] = "IS NULL";
			}else{
				$wherec["t.stages ="] = "'".$stages."'";
			}
		}
		if(isset($branch) && !empty($branch)){
			$wherec["t.branch_id ="] = "'".$branch."'";
			
		}
		if(isset($this->company_id) && !empty($this->company_id)){
			$wherec["t.company_id ="] = "'".$this->company_id."'";
		}
		$adminID = $this->input->post('SadminID');
		if (isset($custType) && !empty($custType)) {
			$statusStr = str_replace(",", '","', $custType);
			$wherec["t.type"] = 'IN ("' . $statusStr . '")';
		}
		if ($isAll == "Y") {
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}
		$config["base_url"] = base_url() . "customerDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.customer_id', 'customer', $wherec, $other,$join);
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

			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC="customer_id,name,pan_number,address,gst_state,email,mobile_no,zipcode,gst_no,customer_image",'customer',$wherec,'','',$join,$other);	

		}else{
			// print_r($join);exit;
			$selectC = "ai.photo AS assigneePhoto,ai.adminID AS assigneeID, ai.name AS assignee,".$selectC;
			$selectC = "css.category_id AS stageID,t.customer_image,t.type,t.salutation,t.created_date,t.last_activity_date, t.last_activity_type,t.record_type,cat.categoryName AS leadPriorityName,cat.cat_color AS priorityColor, t.email, t.mobile_no, t.name, t.status, st.state_name,".$selectC;
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC, 'customer', $wherec, $config["per_page"], $page, $join, $other);
		}
		foreach ($customerDetails as $key => $value) {
			$wherec = array();
			$wherec["t.record_id"] = ' = "' . $value->customer_id . '"';
			$customerNoteCount = $this->CommonModel->getCountByParameter('note_id', 'notes', $wherec, '');
			$customerDetails[$key]->noteCount = $customerNoteCount;
			
			$whereTask = array();
			$whereTask["start_date >="] = "'".date('Y-m-d')."'";
			$whereTask["customer_id = "] = $value->customer_id;
			$customerTaskUpcoming = $this->CommonModel->getCountByParameter('task_id', 'tasks', $whereTask, '');

			$whereAppoint = array();
			$whereAppoint["start_date >="] = "'".date('Y-m-d')."'";
			$whereAppoint["customer_id = "] = $value->customer_id;
			$customerAppUpcoming = $this->CommonModel->getCountByParameter('appointment_id', 'appointment', $whereAppoint, '');

			$whereNotes = array();
			$whereNotes["reminder_date >="] = "'".date('Y-m-d')."'";
			$whereNotes["record_id = "] = $value->customer_id;
			$customerNoteUpcoming = $this->CommonModel->getCountByParameter('note_id', 'notes', $whereNotes, '');
			
			$result = $customerTaskUpcoming + $customerAppUpcoming + $customerNoteUpcoming;
			$customerDetails[$key]->upcomingCount = $result;
		}
		// print_r($customerDetails);exit;
		$status['data'] = $customerDetails;
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
		if ($customerDetails) {
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

	public function customerMaster($customer_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$this->menuID = $this->input->post('menuId');
		$company_id = $this->input->post('company_id');
		
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$customerDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			// $customerDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
			$customerDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerDetails['salutation'] = $this->validatedata->validate('salutation', 'Salutation', false, '', array());
			$customerDetails['name'] = $this->validatedata->validate('name', 'Name', true, '', array());
			$customerDetails['email'] = $this->validatedata->validate('email', 'Email', false, '', array());
			$customerDetails['mobile_no'] = $this->validatedata->validate('mobile_no', 'Mobile', false, '', array());
			$customerDetails['birth_date'] = $this->validatedata->validate('birth_date', 'Birth Date', false, '', array());
			$customerDetails['record_type'] = $this->validatedata->validate('record_type', 'record Type', true, '', array());
			$customerDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());
			$customerDetails['address'] = $this->validatedata->validate('address','addresss',false,'',array());
			// $customerDetails['customer_image'] = $this->validatedata->validate('customer_image','Customer Image',false,'',array());
			$customerDetails['billing_name'] = $this->validatedata->validate('billing_name', 'Billing Address', false, '', array());
			$customerDetails['billing_address'] = $this->validatedata->validate('billing_address', 'Company Name', false, '', array());
			$customerDetails['branch_id	'] = $this->validatedata->validate('branch_id	', 'Branch Id	', false, '', array());
			$customerDetails['gst_no'] = $this->validatedata->validate('gst_no', ' Gst No', false, '', array());
			$customerDetails['adhar_number'] = $this->validatedata->validate('adhar_number', ' adhar Number', false, '', array());
			$customerDetails['pan_number'] = $this->validatedata->validate('pan_number', ' Pan Number', false, '', array());
			$customerDetails['website'] = $this->validatedata->validate('website', 'Website', false, '', array());
			$customerDetails['type'] = $this->validatedata->validate('type', 'Type', false, '', array());
			$customerDetails['stages'] = $this->validatedata->validate('stages', 'lead stages', false, '', array());
			$customerDetails['country'] = $this->validatedata->validate('country', 'Country', false, '', array());
			$customerDetails['state'] = $this->validatedata->validate('state', 'State', false, '', array());
			$customerDetails['city'] = $this->validatedata->validate('city', 'City', false, '', array());
			$customerDetails['latitude'] = $this->validatedata->validate('latitude', 'latitude', false, '', array());
			$customerDetails['longitude'] = $this->validatedata->validate('longitude', 'longitude', false, '', array());
			$customerDetails['zipcode'] = $this->validatedata->validate('zipcode', 'zipcode', false, '', array());
			$customerDetails['office_land_line'] = $this->validatedata->validate('office_land_line', 'office_land_line', false, '', array());
			$customerDetails['lead_source'] = $this->validatedata->validate('lead_source', 'lead source', false, '', array());
			$customerDetails['mailing_address'] = $this->validatedata->validate('mailing_address', 'Mailing Address', false, '', array());
			$customerDetails['gst_state'] = $this->validatedata->validate('gst_state', 'GST State', false, '', array());
			$customerDetails['assignee'] = $this->validatedata->validate('assignee', 'Assignee', false, '', array());
			$customerDetails['lead_priority'] = $this->validatedata->validate('lead_priority', 'lead_priority', false, '', array());
			$countryCodeNumber = $this->input->post('countryCode');
			

			if(isset($countryCodeNumber) && !empty($countryCodeNumber)){
				$countryarray = explode(" ", $countryCodeNumber);
				$mobNumberArray = explode(" ", $customerDetails['mobile_no']);
				// Assuming that the first element of $countryarray is the country code
				// and the first element of $mobNumberArray is the mobile number
				$formattedNumber = $countryarray[0] . '-' . $mobNumberArray[0];
				$customerDetails['mobile_no'] = $formattedNumber;
			}
			if($customerDetails['type'] =="lead"){
				$fieldData = $this->datatables->mapDynamicFeilds("leads",$this->input->post());
				$customerDetails = array_merge($fieldData, $customerDetails);
			}else{
				$fieldData = $this->datatables->mapDynamicFeilds("customer",$this->input->post());
				$customerDetails = array_merge($fieldData, $customerDetails);	
			}
			
			if (isset($customerDetails['birth_date']) && !empty($customerDetails['birth_date']) && $customerDetails['birth_date'] != "0000-00-00") {
				$customerDetails['birth_date'] = str_replace("/", "-", $customerDetails['birth_date']);
				$customerDetails['birth_date'] = date("Y-m-d", strtotime($customerDetails['birth_date']));
			}else{
				$customerDetails['birth_date'] = null;
			}

			if(!isset($customerDetails['pan_number']) && empty($customerDetails['pan_number'])){
				$customerDetails['pan_number'] = null;
			}

			if(!isset($customerDetails['branch_id']) && empty($customerDetails['branch_id'])){
				$customerDetails['branch_id'] = null;	
			}
			// print_r($customerDetails);exit;
			if ($method == "PUT") {
				$this->db->trans_start();
				if(isset($customerDetails['email']) && !empty($customerDetails['email'])){
					$where= array("email"=>$customerDetails['email']);
					$customerEmail = $this->CommonModel->getMasterDetails('customer','',$where);
					if(!empty($customerEmail)){
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(278);
						$status['statusCode'] = 278;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
				}
				$customerDetails['company_id'] = $this->company_id;
				$iticode = $customerDetails['customer_id'];
				$customerDetails['status'] = "active";
				$customerDetails['created_by'] = $this->input->post('SadminID');
				$customerDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('customer', $customerDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$customer_id = $this->db->insert_id();
					if(!$this->config->item('development'))
					{
						$this->notificationtrigger->prepareNotification('add','customer','customer_id',$customer_id,array(),$this->menuID,$this->company_id);
					}
					// $notificationlist = $this->CommonModel->getNotificationList('customer','add');
					// if(isset($notificationlist) && !empty($notificationlist)){
					// 	foreach ($notificationlist as $key => $value) 
					// 	{
					// 		$datatosend= array();
					// 		$datatosend['details']= $customerDetails;
					// 		$datatosend['user_type'] = $value->user_type;
					// 		$datatosend['email_customer'] = $customerDetails['email'];
					// 		$datatosend['notificationID'] = $value->notification_id;
					// 		$datatosend['sys_user_id'] = $value->sys_user_id;
					// 		$datatosend['template_id'] = $value->template_id;
					// 		if(!$this->config->item('development')){
					// 			$this->notificationtrigger->sendEmailNotification('customer','add',$datatosend);
					// 		}
					// 	}
					// }
					$this->db->trans_commit();
					$status['lastID'] = $customer_id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('customer_id' => $customer_id);
				if (!isset($customer_id) || empty($customer_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$customerDetails['modified_by'] = $this->input->post('SadminID');
				$customerDetails['modified_date'] = $updateDate;
				$oldData = $this->CommonModel->getMasterDetails('customer', '', $where);
				if($oldData[0]->stages != $customerDetails['stages']){
					$customerDetails['last_activity_date'] = date("Y/m/d H:i:s");
				}
				$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					if(!$this->config->item('development'))
					{
						$this->notificationtrigger->prepareNotification('update','customer','customer_id',$customer_id,$oldData,$this->menuID,$this->company_id);
					}
					$status['lastID'] = $customer_id;
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$customerDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('customer', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					
					if(!$this->config->item('development'))
					{	
						$where['customer_id'] = $customer_id;
						$oldData = $this->CommonModel->getMasterDetails('customer', '', $where) ;
						$this->notificationtrigger->prepareNotification('delete','customer','customer_id',$customer_id,$oldData,$this->menuID,$this->company_id);
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else {
			if($customer_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			$wherec["customer_id ="] = "'".$customer_id."'";

			$whereAttachment = array(
				"customer_id" => $customer_id
			);

			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="ad";
			$join[0]['key1'] ="assignee";
			$join[0]['key2'] ="adminID";

			$join[1]['type'] ="LEFT JOIN";
			$join[1]['table']="categories";
			$join[1]['alias'] ="cat";
			$join[1]['key1'] ="lead_priority";
			$join[1]['key2'] ="category_id";

			$join[2]['type'] ="LEFT JOIN";
			$join[2]['table']="categories";
			$join[2]['alias'] ="sor";
			$join[2]['key1'] ="lead_source";
			$join[2]['key2'] ="category_id";


			$join[3]['type'] ="LEFT JOIN";
			$join[3]['table']="categories";
			$join[3]['alias'] ="sta";
			$join[3]['key1'] ="stages";
			$join[3]['key2'] ="category_id";

			$selectC = "ad.name, ad.photo, cat.categoryName AS leadPriorityName, sor.categoryName AS leadSourceName, sta.categoryName AS leadStageName";


			$assignee = $this->CommonModel->GetMasterListDetails($selectC, 'customer', $wherec, '', '', $join, '');
			
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
			$wherec["t.customer_id"] = "=".$customer_id;
			//$customerDetails = $this->CommonModel->GetMasterListDetails('customer', '', $where);
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
									"record_id" => $customer_id,
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
			$customerDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			if (isset($customerDetails) && !empty($customerDetails)) {
				$custAttachments = $this->CommonModel->getMasterDetails('customer_attachment','',$whereAttachment);
				if(!empty($custAttachments)){
					$attachment = array_column($custAttachments,'attachment_file');
					$attachmentID = array_column($custAttachments,'attachment_id');
					$customerDetails[0]->attachment_file = $attachment;
					$customerDetails[0]->attachment_id = $attachmentID;
				}
				if(!empty($assignee)){
					$assigneeName = array_column($assignee,'name');
					$assigneePhoto = array_column($assignee,'photo');
					$leadPriorityName = array_column($assignee,'leadPriorityName');
					$leadSourceName = array_column($assignee, 'leadSourceName');
					$leadStageName = array_column($assignee, 'leadStageName');
					$customerDetails[0]->assigneeName = $assigneeName[0];
					$customerDetails[0]->leadPriority = $leadPriorityName[0];
					$customerDetails[0]->leadSource = $leadSourceName[0];
					$customerDetails[0]->leadStage = $leadStageName[0];
					$customerDetails[0]->assigneePhoto = $assigneePhoto[0];
				}
				if(isset($customerDetails[0]->mobile_no) && !empty($customerDetails[0]->mobile_no)) {
					$fullNumber = $customerDetails[0]->mobile_no;
					// Splitting the number into country code and mobile number
					$numberParts = explode('-', $fullNumber);
				
					if (count($numberParts) == 2) {
						$countryCode = $numberParts[0]; // The country code part
						$mobileNumber = $numberParts[1]; // The mobile number part
				
						// Assigning the separated values
						$customerDetails[0]->mobile_no = $mobileNumber;
						$customerDetails[0]->countryCode = $countryCode;
					} else {
						// Handle cases where the format is not as expected
						$customerDetails[0]->countryCode = '';
						$customerDetails[0]->mobile_no	 = $fullNumber;
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
				
						// Merge attachment data into $customerDetails for the current iteration
						$attachmentTosavetemp = array();
						$attachmentTosavetemp['attachFile'] = $attachmentFiles;
						$attachmentTosavetemp['attachment_id'] = $attachmentIDs;
						$attachmentTosavetemp['attachment_fieldID'] = $attachmentFieldIDs;
						$attachmentTosave[] = $attachmentTosavetemp;
					}
					// Assign the merged attachment data to $customerDetails
					$customerDetails[0]->uploadedMedia = $attachmentTosave;
					// print_r($customerDetails[0]->uploadedMedia);exit;
				}

				$status['data'] = $customerDetails;
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

	public function CustomerChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "active" || trim($action) == "inactive") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$menuId = $this->input->post("menuId");
			$changestatus = $this->CommonModel->changeMasterStatus('customer', $action, $ids, 'customer_id');
			if ($changestatus) {			
				if(!$this->config->item('development')){	
					$idlist = explode(",", $ids);
					foreach ($idlist as $key => $value) {
						$where['customer_id'] = $value;
						$oldData = $this->CommonModel->getMasterDetails('customer', '', $where);
						if (isset($oldData) && !empty($oldData)) {
							$this->notificationtrigger->prepareNotification('delete','customer','customer_id',$value,$oldData,$menuId,$this->company_id);
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

	public function removeAttachment(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("status");
			if(trim($action) == "delete"){
				$fileID = $this->input->post("fileID");
				$customerID= $this->input->post("customerID");
				$wherec["customer_id ="] = $customerID;
				$wherec["attachment_id ="] = $fileID;
				$changestatus = $this->CommonModel->deleteMasterDetails('customer_attachment',$wherec);
			if($changestatus){
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

	public function customerPermanentDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['customer_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$oldData = array();
			$idlist = explode(",", $ids);
			foreach ($idlist as $key => $value) {
				// PRIMARY DATA
				$where['customer_id'] = $value;
				$oldData1 = $this->CommonModel->getMasterDetails('customer', '', $where);
				// JOINED DATA
				$data['menuID'] = $menuId;
				$data['details']['customer_id'] = $value;
				$data['customer_id'] = $value;
				if(!$this->config->item('development')){	
					$joined = $this->notificationtrigger->getJoinedDetails('customer',$data);
					$oldData1[0]->joinedData = $joined['details'];
					$oldData[$value] = $oldData1;
				}
				
			}
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('customer', '',$whereIn);
			if ($changestatus) {
				$idlist = explode(",", $ids);
				foreach ($idlist as $key => $value) {
					$whereT = array('customer_id' => $value);
					$whereA = array('customer_id' => $value);
					$custTask = $this->CommonModel->deleteMasterDetails('tasks', $whereT);
					$custAppoint = $this->CommonModel->deleteMasterDetails('appointment', $whereT);
					if(!$this->config->item('development')){	
						if (isset($oldData[$value]) && !empty($oldData[$value])) {
							$this->notificationtrigger->prepareNotification('delete','customer','customer_id',$value,$oldData[$value],$menuId,$this->company_id);
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

	public function getcustomerNotesDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$customer = $this->input->post('customer_id');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "note_id";
			$order = "DESC";
		}

		$other = array("orderBy"=>$orderBy,"order"=>$order);

		if(isset($customer) && !empty($customer)){			
			$customer = trim($customer);
			$wherec["record_id ="] = "'".$customer."'";
		}

		$adminID = $this->input->post('SadminID');

		if ($isAll == "Y") {
			$join = array();
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC='*','notes',$wherec,'','','', $other);	
		}else{
			$selectC = "*";
			$customerNotesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'notes', $wherec, '', '', '', $other);
		}
		$status['data'] = $customerNotesDetails;
		if ($customerNotesDetails) {
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

	public function customerNote($note_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);

		// print_r($method);exit;
		if ($method == "POST" || $method == "PUT") {
			$customerNote = array();
			$updateDate = date("Y/m/d H:i:s");

			$customerNote['record_id'] = $this->validatedata->validate('customer_id', 'Customer ID', false, '', array());
			$customerNote['note_desc'] = $this->validatedata->validate('note_desc', 'Customer Note', false, '', array());
			$customerNote['title'] = $this->validatedata->validate('title', 'Title', false, '', array());
			$customerNote['reminder_date'] = $this->validatedata->validate('reminder_date', 'Reminder Date', false, '', array());
			$reminder_time = $this->validatedata->validate('reminder_time', 'Reminder Time', false, '', array());
			
		
			if(isset($customerNote['reminder_date']) && !empty($customerNote['reminder_date']) && $customerNote['reminder_date'] != "0000-00-00") {
				$customerNote['reminder_date'] = str_replace("/", "-", $customerNote['reminder_date']);
				$customerNote['reminder_date'] = date("Y-m-d", strtotime($customerNote['reminder_date']));
			} else {
				$customerNote['reminder_date'] = null;
			}
			if ($method == "PUT") {
				$customerNote['created_by'] = $this->input->post('SadminID');
				$customerNote['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('notes', $customerNote);
				$lastNoteID = $this->db->insert_id();
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
					$status['lastID'] = $lastNoteID;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('note_id' => $note_id);
				if (!isset($note_id) || empty($note_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$customerNote['modified_by'] = $this->input->post('SadminID');
				$customerNote['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('notes', $customerNote, $where);
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
				$customerNote = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('notes', $where);
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
				}
					$this->response->output($status, 200);
			}
		} else {

			$where = array("note_id" => $note_id);
			$customerDetails = $this->CommonModel->getMasterDetails('notes', '', $where);

			if (isset($customerDetails) && !empty($customerDetails)) {

				$status['data'] = $customerDetails;
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

	public function noteDelete(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$noteID= $this->input->post("id");
		$wherec["note_id ="] = $noteID;
		$changestatus = $this->CommonModel->deleteMasterDetails('notes',$wherec);
		if($changestatus){
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

	public function customerChangeType()
	{
		$customerID = $this->input->post('customerID');
		$setStatus = $this->input->post('status');
		$updateDate = date("Y/m/d H:i:s");
		$where = array('customer_id' => $customerID);
		$customerDetails['type'] = $setStatus;
		$customerDetails['modified_date'] = $updateDate;
		$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
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

	public function getcustomerActivityDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$customer = $this->input->post('customer_id');
		$customerType = $this->input->post('customerType');
		$historyType = $this->input->post('historyType');
		$wherec = $join = array();

		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "history_id";
			$order = "DESC";
		}
		if(isset($historyType) && !empty($historyType) && $historyType=="past"){

			$other = array("orderBy"=>$orderBy,"order"=>$order);

			if(isset($customer) && !empty($customer)){			
				$customer = trim($customer);
				$wherec["parent_record_id ="] = "'".$customer."'";
			}
			$adminID = $this->input->post('SadminID');
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="am";
			$join[0]['key1'] ="user_id";
			$join[0]['key2'] ="adminID";

			$join[1]['type'] ="LEFT JOIN";
			$join[1]['table']="categories";
			$join[1]['alias'] ="ca";
			$join[1]['key1'] ="old_val";
			$join[1]['key2'] ="category_id";

			$join[2]['type'] ="LEFT JOIN";
			$join[2]['table']="categories";
			$join[2]['alias'] ="cat";
			$join[2]['key1'] ="new_val";
			$join[2]['key2'] ="category_id";

			$config = $this->config->item('pagination');
			$config["base_url"] = base_url() . "historyDetails";
			$config["total_rows"] = $this->CommonModel->getCountByParameter('t.history_id', 'history', $wherec, $other);
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
				$join = array();
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*, am.name As createdName','history',$wherec,$config["per_page"], $page,$join, $other);	
			}else{
				$selectC = "t.*, am.name As createdName, ca.categoryName AS oldValName, cat.categoryName AS newValName";
				$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC, 'history', $wherec, $config["per_page"], $page, $join, $other);
			}
			
			// print_r($customerActivityDetails);exit;
			$status['data'] = $customerActivityDetails;
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
			if ($customerActivityDetails) {
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
		}else if($historyType=="upcoming"){
			$join = array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="admin";
			$join[0]['alias'] ="am";
			$join[0]['key1'] ="created_by";
			$join[0]['key2'] ="adminID";

			$whereTask = array();
			$whereTask["start_date >="] = "'".date('Y-m-d')."'";
			$whereTask["customer_id = "] = $customer;
			$customerTaskUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'tasks', $whereTask, '', '', $join, '');

			$whereAppoint = array();
			$whereAppoint["start_date >="] = "'".date('Y-m-d')."'";
			$whereAppoint["customer_id = "] = $customer;
			$customerAppUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'appointment', $whereAppoint, '', '', $join, '');

			$whereNotes = array();
			$whereNotes["reminder_date >="] = "'".date('Y-m-d')."'";
			$whereNotes["record_id = "] = $customer;
			$customerNoteUpcoming = $this->CommonModel->GetMasterListDetails("t.*, am.name As createdName", 'notes', $whereNotes, '', '', $join, '');
			$upcomingActivity = array();
			foreach ($customerTaskUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "task";
				$record->description =$value->subject;
				$record->task_id =$value->task_id;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->start_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			foreach ($customerAppUpcoming as $key => $value) {
				$record = new stdClass();
				$record->record_type = "appointment";
				$record->description =$value->title;
				$record->appointment_id = $value->appointment_id;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->start_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			foreach ($customerNoteUpcoming as $key => $value){
				$record = new stdClass();
				$record->record_type = "notes";
				$record->description =$value->title;
				$record->activity_date =$value->created_date;
				$record->start_date =$value->reminder_date;
				$record->createdName =$value->createdName;
				$upcomingActivity[]=$record;
			}
			array_multisort(array_map('strtotime',array_column($upcomingActivity,'activity_date')),
					SORT_ASC, 
					$upcomingActivity);
			if ($upcomingActivity) {
				$status['data'] = $upcomingActivity;
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

		} else if($historyType=="personal"){
			$adminID = $this->input->post('SadminID');
			$wherec["parent_record_id ="] = "'".$customer."'";
			$customerActivityDetails = $this->CommonModel->GetMasterListDetails($selectC="*", 'history', $wherec, '', '', '', '');
			$status['data'] = $customerActivityDetails;
			if ($customerActivityDetails) {
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
	public function getCustomerEmailList()
	{
		// print('here');exit;
		$this->response->decodeRequest();
		$t = $this->input->post('text');
		$t = $t ?? '';
		
		$text = trim($t);
		$wherec = array();
		if (isset($text) && !empty($text)) {
			$wherec["email like  "] = "'%" . $text . "%'";
			$wherec["status ="] = "'active'";
		}
		// print_r($wherec);
		$updateAns1 = $this->CommonModel->GetMasterListDetails("customer_id,email,status", "customer", $wherec);
		$updateAns2 = $this->CommonModel->GetMasterListDetails("adminID,email,status", "admin", $wherec);
		// print_r($updateAns1);
		// print_r($updateAns2);
		$updateAns1 = array_merge($updateAns1,$updateAns2);
		if (isset($updateAns1) && !empty($updateAns1)) {
			$status['msg'] = "sucess";
			$status['data'] = $updateAns1;
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	public function leadUpdate()
	{
		$this->access->checkTokenKey();
		$customerID = $this->input->post('customerID');
		$lead = $this->input->post('lead');
		$where = array('customer_id' => $customerID);
		$customerDetails['stages'] = $lead;
		$customerDetails['last_activity_date'] = date("Y/m/d H:i:s");
		$customerDetails['last_activity_type'] = "stage";
		$customerDetails['modified_by'] = $this->input->post('SadminID');
		$iscreated = $this->CommonModel->updateMasterDetails('customer', $customerDetails, $where);
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
				$categoryIndex['categories_index'] = $key;
				$iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
			}

		}
	}

	public function custUpload($customer_id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');
		$extraData = array();
		if(isset($customer_id) && !empty($customer_id)){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/".$customer_id ;
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($customer_id) || $customer_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") ."customer/temp-";
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
		
		
		$extraData["customer_id"] = $customer_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'customer_attachment',
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

	public function notesEmailReminder()
	{
		$where = array();
		$where["reminder_date ="] = "'".date('Y-m-d')."'";
		$reminderNotes = $this->CommonModel->GetMasterListDetails("*", 'notes', $where, '', '', '', '');
		foreach ($reminderNotes as $key => $value) {
			$whereCust["customer_id ="] = "'".$value->record_id."'";
			$customer_email = $this->CommonModel->GetMasterListDetails("email", 'customer', $whereCust, '', '', '', '');
			$this->emails->sendMailDetails('','',$customer_email[0]->email,'','','Note Reminder: '.$value->title, $value->note_desc);
		}
		// print_r($customer_email);
		
	}

	public function setclientPic($customerID='') {  
        $this->load->library('slim');
		$images = $this->slim->getImages();
		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'profile_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
		// No image found under the supplied input name
        if ($images === false) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }
        // Should always be one image (when posting async), so we'll use the first on in the array (if available)
        $image = array_shift($images);
        if (!isset($image)) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));
            return;
        }
        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));
            return;
        }
        // if we've received output data save as file
        if (isset($image['output']['data'])) {
            // get the name of the file
            $name = $image['output']['name'];
            // get the crop data for the output image
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'customer/'.$customerID.'/profilePic/');
        }
        if (isset($image['input']['data'])) {
            // get the name of the file
            $name = $image['input']['name'];
            // get the crop data for the output image
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$_SERVER['DOCUMENT_ROOT'].'/LMS/website/uploads/profilephoto/'.$customerID.'/profilePic/');
        }
        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );
        if (isset($output) && isset($input)) {
            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );
            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }
        $updateDate = date("Y/m/d H:i:s");
        $data = array("customer_image"=>$imagename);
       $isrename = rename($this->config->item("mediaPATH").'customer/'.$customerID.'/profilePic/'.$response['file'],$this->config->item("mediaPATH").'customer/'.$customerID.'/profilePic/' . $imagename);
	   $where = array("customer_id" => $customerID);
       $isupdate = $this->CommonModel->updateMasterDetails('customer',$data,$where);
	//    $whereAttachment1 = array(
	// 	"customer_id" => $customerID,
	// 	);
	// 	$customer = $this->CommonModel->getMasterDetails('customer','',$whereAttachment1);
	// 	print_r($customer);
       $this->slim->outputJSON($response);
    }

	public function removeClientPicFile($customerID='') 
	{
		if($customerID ==""){
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] =array();
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}

		$where = array("customer_id" => $customerID);
		$formData = array();
		$path = $this->config->item("mediaPATH").'customer/'.$customerID.'/profilePic/';
		$images = $this->CommonModel->getMasterDetails('customer','customer_image',$where);
		$image = $images[0]->customer_image;
		$formData['customer_image'] = '';
		
		
		if (isset($image) && !empty($image)) {

			if (file_exists($path . $image)) {
				$formData['customer_id'] = $customerID;
				$iscreated = $this->CommonModel->updateMasterDetails("customer",$formData,array('customer_id'=>$customerID));
				unlink($path . $image);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			} else {
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			}
		}
	}
	public function multiplecustChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['customer_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('customer', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('customer', $action, $ids, 'customer_id');
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
