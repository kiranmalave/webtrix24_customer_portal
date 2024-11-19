<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DynamicFormData extends CI_Controller
{	
	public $menuID;
	public $menuDetails = [];
	public $dyanamicForm_Fields = [];
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

	public function getDatadList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$config = array();
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$this->filters->menuID =$this->menuID;
		$this->filters->getMenuData();
		$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
		$this->menuDetails = $this->filters->menuDetails;
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$wherec = $join = array();
		$menuId = $this->input->post('menuId');
		$whereData = $this->filters->prepareFilterData($_POST);
		$wherec = $whereData["wherec"];
		$other = $whereData["other"];
		$join = $whereData["join"];
		$selectC = $whereData["select"];
		
		// create join for created by and modified data details
		$joinKey = (count($join)+1);
		$join[$joinKey]['type'] ="LEFT JOIN";
		$join[$joinKey]['table']="admin";
		$join[$joinKey]['alias'] ="ad";
		$join[$joinKey]['key1'] ="created_by";
		$join[$joinKey]['key2'] ="adminID";
		$joinKey = (count($join)+1);
		$join[$joinKey]['type'] ="LEFT JOIN";
		$join[$joinKey]['table']="admin";
		$join[$joinKey]['alias'] ="am";
		$join[$joinKey]['key1'] ="modified_by";
		$join[$joinKey]['key2'] ="adminID";
		if($selectC !=""){
			$selectC = $selectC.",ad.name as created_by,am.name as modified_by";
		}else{
			$selectC = $selectC."ad.name as created_by,am.name as modified_by";	
		}
		//print $selectC;exit;
		// $selectC = $selectC.",ad.name as createdBy,am.name as modifiedBy";
		$config["base_url"] = base_url() . "dynamicFormFieldDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('t.id', $this->menuDetails->table_name, $wherec,$other,$join);
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
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, $other);
		} else {
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, $config["per_page"], $page, $join, $other);
		}
		// print $this->db->last_query();exit;
		$status['data'] = $userRoleDetails;
		if(isset($primaryData) && !empty($primaryData)){
		$status['primary'] = $primaryData[0]->Column_name;
		}else{
			$status['primary'] ="";	
		}
		
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
		if ($userRoleDetails) {
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

	public function dynamicformData($id = '')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$action = $this->input->post('action');
		if ($method == "PUT" || $method == "POST") {
			$fieldDetails = array();
			$updateDate = date("Y/m/d H:i:s");
		}
		// get menuDetails
		$menuID = $this->input->get('menuId');
		if(isset($menuID) && !empty($menuID)){
			$this->menuID = $menuID;
		}else{
			$this->menuID = $this->validatedata->validate('menuId', 'Module ID required.', true, '', array());
		}
		$this->filters->menuID = $this->menuID;
		$this->filters->getMenuData();
		$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
		$this->menuDetails = $this->filters->menuDetails;
		
		//print_r($fieldDetails);
		$this->db->trans_start();
		if ($action != "" && $action == "DELETE")
			$method = "DELETE";
		// echo $method;
		// exit;
		if($method == "PUT" || $method == "POST"){
			$formFields = json_decode($this->menuDetails->metadata);
		$datafields = array();
		if(isset($formFields) && !empty($formFields)){
			foreach ($formFields as $key => $value) {
				if(is_object($value) && !empty($value)){
					//print_r($value->col1);
					
					foreach ($value as $key2 => $value2) {
						// print_r($value2->fieldID);
						if(is_object($value2) && !empty($value2->fieldID)){
						//foreach ($value2 as $key3 => $value3) {
							$datafields[] = $value2->fieldID;
						//}
						}
						
						//$datafields[] = $value2->fieldID;
					}
				}
			}
		}
		// print "<pre>";
		// print_r($this->dyanamicForm_Fields);exit;
		foreach ($this->dyanamicForm_Fields as $key => $value) {
			// check requried
			$requried = false;
			if(in_array($value->fieldID,$datafields)){
				if($value->isRequired=="Yes"){
					$requried = true;
				}
				// check for date and convert it
				if(strtolower($value->fieldType) == "datepicker"){
					$date = $this->validatedata->validate($value->column_name,$value->fieldLabel, $requried, '', array());
					//print $date;
					$fieldDetails[$value->column_name] = $this->dates->DATE_YY_MM_DD($date);
				}else{
					$fieldDetails[$value->column_name] = $this->validatedata->validate($value->column_name,$value->fieldLabel, $requried, '', array());
				}
			}
		}

		}
		switch ($method) {
			case "PUT": {
					$fieldDetails['created_by'] = $this->input->post('SadminID');
					$fieldDetails['created_date'] = $updateDate;
					$iscreated = $this->CommonModel->saveMasterDetails($this->menuDetails->table_name, $fieldDetails);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$last_id = $this->db->insert_id();
						$this->db->trans_commit();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$status['lastID'] = $last_id;
						$this->response->output($status, 200);
					}
					break;
				}

			case "POST": {
					//$fieldDetails = array();
					$updateDate = date("Y/m/d H:i:s");
					$wheredyn = array('id' => $id);
					if (!isset($id) || empty($id)) {
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}

					$fieldDetails['modified_by'] = $this->input->post('SadminID');
					$fieldDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails($this->menuDetails->table_name, $fieldDetails, $wheredyn);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					}
					break;
				}
			case "DELETE": {
					$fieldDetails = array();
					$fieldDetails['idsToRemove'] = $this->input->post('list');
					$fieldDetails['menuId'] = $this->input->post('menuId');
					$iscreated = "";
					if ($id != "") {
						$where = array('fieldID' => $id);
						if (!isset($id) || empty($id)) {
							$status['msg'] = $this->systemmsg->getErrorCode(996);
							$status['statusCode'] = 996;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
						$iscreated = $this->CommonModel->deleteMasterDetails($this->menuDetails->table_name, $where);
					}

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
					break;
				}
			default: {
					if($id ==""){
						$status['msg'] = $this->systemmsg->getErrorCode(227);
						$status['statusCode'] = 227;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
					$fieldIdDetails = array();
					$this->menuID = $this->input->post('menuId');
					$this->filters->menuID = $this->menuID;
					$this->filters->getMenuData();
					// $this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
					
					// $this->menuDetails = $this->filters->menuDetails;
					// $isAll = $this->input->post('getAll');
					// $curPage = $this->input->post('curpage');
					// $wherec = $join = array();
					// $menuId = $this->input->post('menuId');
					// $whereData = $this->filters->prepareFilterData($_POST);
					// $wherec = $whereData["wherec"];
					// $other = $whereData["other"];
					// $join = $whereData["join"];
					// print_r($whereData["select"]);
					// $selectC = "t.*,".$whereData["select"];

					// $this->filters->getMenuData();
					$join= $ccData = array();
					$extraData = array();
					$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$this->menuDetails->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData = $this->CommonModel->getdata($sql,array());
					
						
					if(isset($this->menuDetails->metadata) && !empty($this->menuDetails->metadata)){
						$cData = json_decode($this->menuDetails->metadata);
						//print_r($cData);
						$attachmentArray = array();
						foreach ($cData as $key => $value) {
							foreach ($value as $keycol => $valuecol) {
								if(isset($valuecol->column_name) && isset($valuecol->fieldID)){
									
									$ccData[] = "t.".$valuecol->column_name;
									$fieldIdDetails[] = $valuecol->fieldID;
									
									if ($valuecol->fieldType == 'File') {
										$whereAttachment = array(
											"record_id" => $id,
											"menu_id" => $this->menuID,
											"field_id" => $valuecol->fieldID,
										);
										
										$attachments = $this->CommonModel->getMasterDetails('custom_attachment','',$whereAttachment);
										// print"<pre>";
										// print_r($attachments);
										$attachmentArray[] = $attachments;
									}
									
								}
							}
						}
						// $attachments = $this->CommonModel->getMasterDetails('custom_attachment','',$whereAttachment);
						//$ccData = array_column($cData,'column_name');
						//$fieldIdDetails = array_column($cData,'fieldID');
						
						// check islinekd with
						$whereR = $otherR = $joinR = array();
						$joinR[0]['type'] ="LEFT JOIN";
						$joinR[0]['table']="menu_master";
						$joinR[0]['alias'] ="mm";
						$joinR[0]['key1'] ="linkedWith";
						$joinR[0]['key2'] ="menuID";
						if(!empty($fieldIdDetails)){
							$otherR['whereIn'] ="fieldID";
						$otherR['whereData'] = implode(",",$fieldIdDetails);
						}
						$whereR['t.menuID'] = "= ".$this->menuID;
						$whereR['linkedWith'] = "!= ''";
						$linkedFields = $this->CommonModel->GetMasterListDetails("t.allowMultiSelect,t.fieldOptions,t.column_name,t.fieldID,t.linkedWith,mm.menuID,mm.table_name","dynamic_fields", $whereR, '', '', $joinR, $otherR);
						//print_r($linkedFields);
						foreach ($linkedFields as $key => $value) {
							
							// $sql = "SHOW KEYS FROM ".$this->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
							// $primaryData2 = $this->CommonModel->getdata($sql,array());
							// $last = count($join);
							// $join[$last]['type'] ="LEFT JOIN";
							// $join[$last]['table']=$value->table_name;
							// $join[$last]['alias'] ="w".uniqid(2)."_".substr($value->table_name,0,2);
							// $join[$last]['key1'] = $value->column_name;
							// $join[$last]['key2'] =$primaryData2[0]->Column_name;
							// $extraData[] = $join[$last]['alias'].".".$value->fieldOptions." AS ".$value->linkedWith."_".$value->fieldOptions;//$value->fieldOptions;
							// //$extraData[] = $join[$last]['alias'].".".$value->fieldOptions;


							if($value->allowMultiSelect == "yes"){
								//print $value->column_name;
								$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
								$primaryData2 = $this->CommonModel->getdata($sql,array());
								$subSql = "( SELECT GROUP_CONCAT(".$value->fieldOptions.") FROM ".$this->db->dbprefix.$value->table_name." WHERE FIND_IN_SET(".$primaryData2[0]->Column_name.",t.".$value->column_name."))";
								$extraData[] = $subSql." AS ".$value->linkedWith."_".trim($value->column_name);
							}else{
								
								$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
								$primaryData2 = $this->CommonModel->getdata($sql,array());
								$last = count($join);
								$join[$last]['type'] ="LEFT JOIN";
								$join[$last]['table']=$value->table_name;
								$join[$last]['alias'] =uniqid("W")."_".substr($value->table_name,0,2);//"ws_".substr($value->table_name,0,2);
								$join[$last]['key1'] = $value->column_name;
								$join[$last]['key2'] =$primaryData2[0]->Column_name;
								$extraData[] = $join[$last]['alias'].".".$value->fieldOptions." AS ".$value->linkedWith."_".trim($value->column_name);//."_".$value->fieldOptions;//$value->fieldOptions;
							}



						}
						// commented by Sarika : Linked with multi-select dropdowns,checkboxes not working
						// if(isset($primaryData2) && !empty($primaryData2)){
						// 	if(!in_array($primaryData2[0]->Column_name,$ccData)){
						// 		$ccData[]=$join[$last]['alias'].".".$primaryData2[0]->Column_name;
						// 	}
						// }
						if(isset($primaryData) && !empty($primaryData)){
							if(!in_array($primaryData[0]->Column_name,$ccData)){
								$ccData[]="t.".$primaryData[0]->Column_name;
							}
						}
						$selectC =implode(",",array_merge($ccData,$extraData));
					}
					//print $selectC;
					$wherec["t.id"]= " =".$id;
					$recordData = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
					$attachmentTosave = array();
					
					if (!empty($attachmentArray)) {
						$attachmentTosave = array(); // Initialize the variable outside the loop
						foreach ($attachmentArray as $key => $attachments) {
							// Extract attachment details for the current iteration
							$attachmentFiles = array_column($attachments, 'attachment_file');
							$attachmentIDs = array_column($attachments, 'attachment_id');
							$attachmentFieldIDs = array_column($attachments, 'field_id');
					
							// Merge attachment data into $recordData for the current iteration
							$attachmentTosavetemp = array();
							$attachmentTosavetemp['attachFile'] = $attachmentFiles;
							$attachmentTosavetemp['attachment_id'] = $attachmentIDs;
							$attachmentTosavetemp['attachment_fieldID'] = $attachmentFieldIDs;
							$attachmentTosave[] = $attachmentTosavetemp;
						}
						// Assign the merged attachment data to $recordData
						$recordData[0]->uploadedMedia = $attachmentTosave;
						// print_r($recordData[0]->uploadedMedia);exit;
					}

					//$menuHistory = $this->CommonModel->getMasterDetails($this->menuDetails->table_name, '', $where);
					// print_r($recordData);exit;
					if (isset($recordData) && !empty($recordData)) {
						$status['data'] = $recordData;
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
					break;
				}
		}
	}
	// public function changeStatus()
	// {
	// 	$this->access->checkTokenKey();
	// 	$this->response->decodeRequest();
	// 	$action = $this->input->post("action");
	// 	if (trim($action) == "changeStatus") {
	// 		$ids = $this->input->post("list");
	// 		$statusCode = $this->input->post("status");
	// 		$changestatus = $this->CommonModel->changeMasterStatus('dynamic_fields', $statusCode, $ids, 'fieldID');
	// 		$this->db->trans_start();
	// 		if ($changestatus) {
	// 			$idlist = explode(",", $ids);
	// 			for ($i = 0; $i < count($idlist); $i++) {
	// 				$id = $idlist[$i];
	// 				$where = array('fieldID' => $id);
	// 				$menuHistory = $this->CommonModel->getMasterDetails('dynamic_fields','', $where);
	// 				if(isset($menuHistory) && !empty($menuHistory)){
	// 					$fieldLabel = $menuHistory[0]->column_name;
	// 					$menuId = $menuHistory[0]->menuID;
	// 					$whereMenu = array('menuId' => $menuId);
	// 					$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master','', $whereMenu);
	// 					$tabName = $tabNameMenu[0]->table_name;
	// 					if($this->datatables->check_field_exists($tabName,$menuHistory[0]->column_name)){
	// 						$iscreated = $this->datatables->remove_column($tabName, $fieldLabel);
	// 					}
	// 					$this->CommonModel->deleteMasterDetails("dynamic_fields",$where);
	// 				}
	// 			}
	// 			if ($this->db->trans_status() === FALSE) {
	// 				$this->db->trans_rollback();
	// 				$status['data'] = array();
	// 				$status['msg'] = $this->systemmsg->getErrorCode(996);
	// 				$status['statusCode'] = 996;
	// 				$status['flag'] = 'F';
	// 				$this->response->output($status, 200);

	// 			} else {
	// 				$this->db->trans_commit();
	// 				$status['data'] = array();
	// 				$status['statusCode'] = 200;
	// 				$status['flag'] = 'S';
	// 				$this->response->output($status, 200);
	// 			}
	// 		} else {
	// 			$status['data'] = array();
	// 			$status['msg'] = $this->systemmsg->getErrorCode(996);
	// 			$status['statusCode'] = 996;
	// 			$status['flag'] = 'F';
	// 			$this->response->output($status, 200);
	// 		}
	// 	}
	// }

	public function changeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$menuid = $this->input->post("menuID");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$where = array('menuId' => $menuid);
			$tabNameMenu = $this->CommonModel->getMasterDetails('menu_master', '', $where);
			$tabName = $tabNameMenu[0]->table_name; 
			$wherec= array();
			$wherec['id'] = $ids; 
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->dynamicFormDeleteMasterDetails($tabName, $wherec,$ids,'id');
			if ($changestatus) {
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

	public function customUpload()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->library('realtimeupload');

		$menu_id = $_GET['menuID'];
		$record_id = $_GET['recordID'];
		$field_id = $_GET['fieldID'];
		$module = $_GET['module'];
		$fileTypes = $_GET['fileTypes'];
		$fileTypesArray = explode(',', $fileTypes);
		$noOfFiles = $_GET['noOfFiles'];
		// print_r($fileTypes);
		// print($noOfFiles);exit;

		if(!isset($field_id) && empty($field_id)){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		if(!isset($menu_id) && empty($menu_id)){
			$status['msg'] = $this->systemmsg->getErrorCode(998);
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		
		$extraData = array();
		if(isset($record_id) && !empty($record_id)){
			$mediapatharr = $this->config->item("mediaPATH") . $module . "/" . $record_id;
			// print_r($mediapatharr);exit; 
			if (!is_dir($mediapatharr)) {
				mkdir($mediapatharr, 0777);
				chmod($mediapatharr, 0777);
			} else {
				if (!is_writable($mediapatharr)) {
					chmod($mediapatharr, 0777);
				}
			}
		}
		if (empty($record_id) || $record_id == 0){
			$mediapatharr = $this->config->item("mediaPATH") . $module . "/temp-";
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
		
		
		$extraData["record_id"] = $record_id;
		$extraData["field_id"] = $field_id;
		$extraData["menu_id"] = $menu_id;
		
		$settings = array(
			'uploadFolder' => $mediapatharr,
			// 'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif','docx', 'doc', 'xls', 'xlsx'],
			// 'maxFolderFiles' => 0,
			'extension' => $fileTypesArray,
			'maxFolderFiles' => $noOfFiles,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'custom_attachment',
			'fileTypeColumn' => 'attachment_file',
			'fileColumn' => 'attachment_file',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		// print"<pre>";
		// print_r($settings);
		$this->realtimeupload->init($settings);
	}
	
	public function removeAttachment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("status");
			if(trim($action) == "delete"){
				$fileID = $this->input->post("fileID");
				$recordId= $this->input->post("recordID");
				$wherec["record_id ="] = $recordId;
				$wherec["attachment_id ="] = $fileID;
				$changestatus = $this->CommonModel->deleteMasterDetails('custom_attachment',$wherec);
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

}
