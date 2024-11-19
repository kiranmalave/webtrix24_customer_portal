<?php
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Filters
{
	var $module = "";
	var $module_data = "";
	var $menuID="";
	var $dyanamicForm_Fields="";
	var $menuDetails="";
	var $linkedFields=null;
	var $SadminID = null;
	public function __construct()
	{
		//parent::__construct();
		$this->CI = &get_instance();
	}
	public function prepareFilterData($appFilterData){
		$loadFrom = 'desktop';
		if (isset($appFilterData['loadFrom']) && !empty($appFilterData['loadFrom'])) {
			$loadFrom = $appFilterData['loadFrom'];
		}
		$prevOp = $whereStr = $stdCol = $freeTextSearch = "";		
        		$whereData = $wherec = $other = $join = $orConditions = $OR = array();
		$today = date("Y-m-d");
		// IF FILTER FILTER IS APPLIED
		if (isset($appFilterData['filterJson']) && !empty($appFilterData['filterJson'])) {
			$filterJson = $appFilterData['filterJson'];
			$filterJson = json_decode($filterJson,true);
		}
		if (isset($appFilterData['freeTextSearch']) && !empty($appFilterData['freeTextSearch'])) {
			$freeTextSearch = $appFilterData['freeTextSearch'];
		}
		$standardFieldDates = array('created_date','modified_date');
		// ORDER BY
        		if(isset($appFilterData['orderBy']) && !empty($appFilterData['orderBy'])){
			$orderBy = $appFilterData['orderBy'];
		}else{
			$orderBy ="";
		}
		// ORDER
		if(isset($appFilterData['order']) && !empty($appFilterData['order'])){
			$order = $appFilterData['order'];
		}else{
			$order ="";
		}
		$subSql =array();
        		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "";
			$order = "";
		}
		$this->SadminID = $appFilterData['SadminID'];
		unset($appFilterData['menuId'],$appFilterData['curpage'],$appFilterData['SadminID'],$appFilterData['accessFrom'],$appFilterData['orderBy'],$appFilterData['order'],$appFilterData['filter_id']);

		if ($loadFrom == 'mobile') {
			$this->menuDetails->c_metadata = $this->menuDetails->m_metadata;
		}
		// GET TABLE COLUMNS AND COLUMNS EXTRA DETAILS
        $sql = "SHOW COLUMNS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name;
		$metaDetails = $this->CI->CommonModel->getdata($sql,array());
		$other = array("orderBy" => $orderBy, "order" => $order);
		if (empty($this->menuDetails->c_metadata)) {
			$status['msg'] = $this->CI->systemmsg->getErrorCode(332);
			$status['statusCode'] = 332;	
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
		}
		$cData = json_decode($this->menuDetails->c_metadata,true);
		$columns = array_column($metaDetails, 'Field');
		if (isset($filterJson) && !empty($filterJson)) {
			foreach ($filterJson as $key => $filter) {
				// GET TYPE OF COLUMN FROM TABLE STUCTURE
				$type = '';
				if ($this->validateCondition($filter,$columns)) {
					foreach ($metaDetails as $meta) {
						if ($meta->Field == $filter['columnName']) {
							$type = $meta->Type;
							break;	
						}
					}
					
					if (str_contains($type, 'timestamp') || str_contains($type, 'datetime') || str_contains($type, 'date')) {
						if ($filter['condition'] != 'date_range') {
							$filter['value'] = date("Y-m-d",strtotime($filter['value']));
						}else{
							$date = explode('/', $filter['value']);
							if (count($date) > 1) {
								$date[0] = 	date("Y-m-d",strtotime($date[0]));
								$date[1] = 	date("Y-m-d",strtotime($date[1]));
							}
						}
					}
					// EACH CONDITION THAT SELECTED
					switch ($filter['condition']) {
						case 'equal_to':
								if (str_contains($type, 'timestamp') || str_contains($type, 'datetime')) {
									$wherec["Date(t." . $filter['columnName'].")"] = "='" . $filter['value']."'";
								}else{
									$checkMul = explode(",",$filter['value']);
									if(count($checkMul)>1){
										$filter_value_string = str_replace(",", "','", $filter['value']);
										$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
									}else{
										$wherec["t.".$filter['columnName']] = "='" . $filter['value']."'";
									}
								}
							break;
						case 'not_equal_to':
								if (str_contains($type, 'timestamp') || str_contains($type, 'datetime')) {
									$wherec["Date(t." . $filter['columnName'].")"] = "!='" . $filter['value']."'";
								}else{
									$checkMul = explode(",",$filter['value']);
									if(count($checkMul)>1){
										$filter_value_string = str_replace(",", "','", $filter['value']);
										$wherec["t.".$filter['columnName']] = "NOT IN('" . $filter_value_string. "')";
									}else{
										$wherec["t.".$filter['columnName']] = "!='" . $filter['value']."'";
									}
								}
							break;
						case 'is_empty':
								$wherec["t." . $filter['columnName']] = "IS NULL OR t." . $filter['columnName'] ." = ''";
							break;
						case 'is_not_empty':
								$wherec["t." . $filter['columnName']] = "IS NOT NULL AND t." . $filter['columnName'] ." != ''";
							break;
						case 'greater_than':
								$wherec["t." . $filter['columnName']] = ">'" . $filter['value'] . "'";
							break;
						case 'less_than':
								$wherec["t." . $filter['columnName']] = "<'" . $filter['value'] . "'";
							break;
						case 'start_with':
								if (str_contains($type, 'varchar') || str_contains($type, 'text') || str_contains($type, 'enum')) {
									$wherec["t." . $filter['columnName']] = "LIKE '" . $filter['value'] . "%'";
								}else if(str_contains($type, 'int') || str_contains($type, 'float') || str_contains($type, 'decimal')){
									$wherec["t." . $filter['columnName']] = ">='" . $filter['value'] . "'";
								}else if(str_contains($type, 'timestamp') || str_contains($type, 'datetime')){
									$wherec["t." . $filter['columnName']] = " BETWEEN '".$filter['value']."' AND '".$today."'";
								}
							break;
						case 'end_with':
								if (str_contains($type, 'varchar') || str_contains($type, 'text') || str_contains($type, 'enum')) {
									$wherec["t." . $filter['columnName']] = "LIKE '%" .$filter['value'] . "'" ;
								}else if(str_contains($type, 'int') || str_contains($type, 'float')){
									$wherec["t." . $filter['columnName']] = "<='" . $filter['value'] . "'";
								}else if(str_contains($type, 'timestamp') || str_contains($type, 'datetime')){
									$wherec["t." . $filter['columnName']] = "<='" . $filter['value']." 23:59:59'";
								}
							break;
						case 'is_in':
								if (str_contains($type, 'varchar') || str_contains($type, 'text') || str_contains($type, 'enum')) {
									$wherec["t.".$filter['columnName']." like "] = "'%" . $filter['value'] . "%'"; 
								}else{
									$filter_value_string = str_replace(",", "','", $filter['value']);
									$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
								}
							break;
						case 'exact':
								$wherec["Date(t." . $filter['columnName'].")"] = "='" . $filter['value']."'";
							break;
						case 'range':
								$value = explode('-',$filter['value']);
								if (count($value) > 1) {
									$wherec["t." . $filter['columnName']] = " BETWEEN '".$value[0]."' AND '".$value[1]."'";
								}
							break;
						case 'date_range':
								if (count($date) > 1) {
									$wherec["t." . $filter['columnName']] = " BETWEEN '".$date[0]."' AND '".$date[1]."'";
								}
							break;
						case 'this_month':
								$firstDayOfMonth = date('Y-m-01');
								$lastDayOfMonth = date('Y-m-t');
								$wherec["t." . $filter['columnName']] = " BETWEEN '".$firstDayOfMonth."' AND '".$lastDayOfMonth."'";
							break;
						case 'exact_date':
								$wherec["Date(t." . $filter['columnName'].")"] = "='" . $filter['value']."'";
							break;
						case 'this_week':
								$newDate = new DateTime();
								$l_monday = $newDate->modify('last monday');
								$l_monday = $l_monday->format('Y-m-d');	
								$wherec["t." . $filter['columnName']] = " BETWEEN '".$l_monday."' AND '".$today." 23:59:59'";								// }	
							break;
						default:
							break;
					}	
					
					// APPEND LOGICAL OPERATOR HERE
					// if (isset($filter['logicalOp']) && !empty($filter['logicalOp'])) {
					// 	switch ($prevOp) {
					// 		case 'OR':
					// 				$OR["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
					// 				unset($wherec["t.".$filter['columnName']]);
					// 			break;
					// 		case 'AND':
					// 				$wherec["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
					// 				if (strpos($wherec["t.".$filter['columnName']],'OR')) {
					// 					$wherec["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
					// 				}
					// 			break;
					// 		default:
					// 			break;
					// 	}
					// }
					// STORE LOGICAL OPERATOR FOR NEXT CONDITION
					// $prevOp = $filter['logicalOp'];
				
					// FOR NEXT CONDITION THAT MIGHT BE OVER-RIDDEN
					// if(str_contains($type, 'timestamp') || str_contains($type, 'datetime')){
					// 	$dates["t.".$filter['columnName']]['value'] = $filter['value'];
					// 	$dates["t.".$filter['columnName']]['logical_op'] = $filter['logicalOp'];
					// 	$dates["t.".$filter['columnName']]['condition'] = $filter['condition'];
					// }
				}
			}
		}
		// print_r($wherec);exit;
        	$whereR = $otherR = $joinR = array();
		$extraData= array();
		$selectC = "";
		// SELECT FOR DYANAMIC FIELDS
		if(isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)){
			$cData = json_decode($this->menuDetails->c_metadata);
			$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name." WHERE Key_name = 'PRIMARY'";
			$primaryData = $this->CI->CommonModel->getdata($sql,array());
			$ccData = array_column($cData,'column_name');
			$fieldIdDetails = array_filter(array_column($cData,'fieldID'),'strlen') ;
			if(isset($ccData) && !empty($ccData)){
				foreach ($ccData as $key => $value) {
					if($value !=""){
						$ccData[$key] = "t.".$value;
					}
				}
			}
			// CHECK IF FIELD IS LINKED WITH
			$joinR[0]['type'] ="LEFT JOIN";
			$joinR[0]['table']="menu_master";
			$joinR[0]['alias'] ="mm";
			$joinR[0]['key1'] ="linkedWith";
			$joinR[0]['key2'] ="menuID";
			if(isset($fieldIdDetails) && !empty($fieldIdDetails)){
				$otherR['whereIn'] ="fieldID";
				$otherR['whereData'] = implode(",",$fieldIdDetails);
			}
			$whereR['t.menuID'] = "= ".$this->menuID;
			$whereR['linkedWith'] = "!= ''";
			// GET DYNAMIC COLUMNS 
			$dyCol = array_column($cData,'column_name');
			$this->linkedFields = $this->CI->CommonModel->GetMasterListDetails("t.allowMultiSelect,t.fieldOptions,t.column_name,t.fieldID,t.linkedWith,mm.menuID,mm.table_name","dynamic_fields", $whereR, '', '', $joinR, $otherR);
			if(isset($primaryData) && !empty($primaryData)){
				if(!in_array($primaryData[0]->Column_name,$ccData)){
					array_unshift($ccData,"t.".$primaryData[0]->Column_name);
				}
			}
			foreach ($this->linkedFields as $key => $value) {
				if(!in_array($value->column_name,$dyCol)){
					break;
				}
				$chkcol = "t.".$value->column_name;
				if(in_array($chkcol,$ccData)){
					$ek = array_keys($ccData,"t.".$value->column_name);
					if(!empty($ek)){
						unset($ccData[$ek[0]]);
					}
				}
				$primaryData2 =array();
				if($value->allowMultiSelect == "yes"){
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
					$subSql = "( SELECT GROUP_CONCAT(".$value->fieldOptions.") FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE FIND_IN_SET(".$primaryData2[0]->Column_name.",t.".$value->column_name."))";
					$extraData[] = $subSql." AS ".$value->linkedWith."_".trim($value->column_name);
				}else{
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
					$last = count($join);
					$join[$last]['type'] ="LEFT JOIN";
					$join[$last]['table']=$value->table_name;
					$join[$last]['alias'] =uniqid("W")."_".substr($value->table_name,0,2);//"ws_".substr($value->table_name,0,2);
					$join[$last]['key1'] = $value->column_name;
					$join[$last]['key2'] =$primaryData2[0]->Column_name;
					$extraData[] = $join[$last]['alias'].".".$value->fieldOptions." AS ".$value->linkedWith."_".trim($value->column_name);//."_".$value->fieldOptions;//$value->fieldOptions;
				}
			}
			$selectC =implode(",",array_merge($ccData,$extraData));
		}
		// SELECT FOR SQL
        	if($selectC !=""){
            	$whereData["select"] = $selectC;
        	}else{
            	$whereData["select"] = "";
        	}
		// SUMMARIZED DATA
		$other['OR'] = $OR;
		$other["freeTextSearch"] = $freeTextSearch;
		$whereData["join"] =$join;
		$whereData["wherec"] = $wherec;
		$whereData["other"] = $other;
        return $whereData;
    }
	function validateCondition($filter,$columns){
		if (!in_array($filter['columnName'], $columns)) {
			return false;	
		}
		if (isset($filter['condition']) && !empty($filter['condition'])) {
			if (($filter['condition'] == 'is_empty' || $filter['condition'] == 'is_not_empty' || $filter['condition'] == 'this_month' || $filter['condition'] == 'this_week') && $filter['value'] == '' ) {
				return true;
			}else if( $filter['value'] == '') {
				return false;
			}else{
				return true;
			}	
		}else{
			return false;
		}
	}
	public function prepareFilterData1($appFilterData){
		$patterns = ['-startDate', '-endDate', '-startNo', '-endNo', '-startRange', '-endRange', '-startTime', '-endTime'];
		$defaultStanderdFeild = array("created_date-startDate","created_date-endDate","modified_date-startDate","modified_date-endDate");
		$defaultStanderdNo= array("id-startNo","id-endNo");
        	$whereData = $wherec = $other = $join = array();
		if (isset($appFilterData['filterJson']) && !empty($appFilterData['filterJson'])) {
			$filterJson = $appFilterData['filterJson'];
		}
		$stdCol ="";
		$standardFieldDates = array('created_date','modified_date');
        	if(isset($appFilterData['orderBy']) && !empty($appFilterData['orderBy'])){
			$orderBy = $appFilterData['orderBy'];
		}else{
			$orderBy ="";
		}
		if(isset($appFilterData['order']) && !empty($appFilterData['order'])){
			$order = $appFilterData['order'];
		}else{
			$order ="";
		}
		if(isset($appFilterData['textSearch']) && !empty($appFilterData['textSearch'])){
			$textSearch = $appFilterData['textSearch'];
		}else{
			$textSearch ="";
		}
		if(isset($appFilterData['textval']) && !empty($appFilterData['textval'])){
			$textval = $appFilterData['textval'];
		}else{
			$textval ="";
		}
		$subSql =array();
        if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "";//"created_date";
			$order = "";//"DESC";
		}
		$this->SadminID = $appFilterData['SadminID'];
        	unset($appFilterData['menuId']);
		unset($appFilterData['curpage']);
		unset($appFilterData['SadminID']);
		unset($appFilterData['accessFrom']);
		unset($appFilterData['orderBy']);
        	unset($appFilterData['order']);
		//unset($appFilterData['textSearch']);
		unset($appFilterData['textval']);
		unset($appFilterData['filter_id']);

		// get all columns metadata
		//$whereField['menuID'] = "= ".$menuID;
		//$metaDetails = $this->CI->CommonModel->GetMasterListDetails("*","dynamic_fields", $whereField, '', '', array(),array());
        //$metaDetails = $this->dyanamicForm_Fields;
        	$sql = "SHOW COLUMNS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name;
		$metaDetails = $this->CI->CommonModel->getdata($sql,array());
		$other = array("orderBy" => $orderBy, "order" => $order);
		$OR = array();
		$prevOp = '';
		foreach($appFilterData as $key => $value) {
			$recordKey=null;
			$dataType = $key;
			if( in_array($key,$defaultStanderdFeild)){
				$dataType ="Datepicker";
				$stdCol="t.";
			}
			if( in_array($key,$defaultStanderdNo)){
				$dataType ="Numeric";
				$stdCol="t.";
			}
			
			if(isset($this->dyanamicForm_Fields) && !empty($this->dyanamicForm_Fields)){
				foreach ($this->dyanamicForm_Fields as $key1 => $value1) {
					$NewKey = $key;
					foreach ($patterns as $pattern) {
						$NewKey = str_replace($pattern, '', $NewKey);
					}
					//print "New Key ".$NewKey."  -> ".$value1->column_name." <br>";
					if($NewKey == $value1->column_name){
						
						$dataType = $value1->fieldType;
						$recordKey = $key1;
						if($value1->linkedWith == "" || $value1->linkedWith == null){
							$stdCol = "t.";
						}else{
							$stdCol = "";
						}
						
						break;
					}
					else{
						//$dataType = $key;
						$stdCol="t.";
					}
				}
			}else{
				$stdCol="t.";
			}
            switch ($dataType) {
				case 'textSearch':{
					if (isset($value) && !empty($textSearch) && isset($textval) && !empty($textval)) {
						$wherec["$stdCol$textSearch like  "] = "'%" . $textval . "%'";
					}
					break;
				}
				case 'Dropdown':{
					if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
						$checkMul = explode(",",$appFilterData[$key]);
						if($this->dyanamicForm_Fields[$recordKey]->allowMultiSelect == "yes"){
							$other['find_in_set'][] = str_replace(" ","",$checkMul);
							$other['find_in_set_key'][] = $stdCol.$key;
							$other['find_in_set_type'][] = "OR";
						}else{
							$task_statusString = str_replace(",", "','", $appFilterData[$key]);
							$wherec[$stdCol.$key] = " IN('" . $task_statusString. "')";
						}
					}
					break;
				}
				case 'Checkbox':{
					if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
						$checkMul = explode(",",$appFilterData[$key]);
						if($this->dyanamicForm_Fields[$recordKey]->allowMultiSelect == "yes"){
							$other['find_in_set'][] = str_replace(" ","",$checkMul);
							$other['find_in_set_key'][] = $stdCol.$key;
							$other['find_in_set_type'][] = "OR";
						}else{
							$task_statusString = str_replace(",", "','", $appFilterData[$key]);
							$wherec[$stdCol.$key] = " IN('" . $task_statusString. "')";
						}
					}
				   break;
			   	}
				case 'Datepicker':{
					$col = $NewKey;
					if(isset($appFilterData[$col."-startDate"]) && !empty($appFilterData[$col."-startDate"])){
						$sDate = date("Y-m-d",strtotime($appFilterData[$col."-startDate"]));
					}
					if(isset($appFilterData[$col."-endDate"]) && !empty($appFilterData[$col."-endDate"])){
						$eDate = date("Y-m-d",strtotime($appFilterData[$col."-endDate"]));
					}
					if ((isset($sDate) && !empty($sDate)) && (isset($eDate) && !empty($eDate))){
						$wherec[$stdCol.$col] = " BETWEEN '" . $sDate. "' AND '".$eDate."'";
					}else if(isset($sDate) && !empty($sDate)){
						$wherec[$stdCol.$col] = " >='" . $sDate."'";
					}else if(isset($eDate) && !empty($eDate)){
						$wherec[$stdCol.$col] = " <='" . $eDate."'";
					}
					
				   break;
			   	}
				case 'Timepicker':{
					$col = $NewKey;
					if(isset($appFilterData[$col."-startTime"]) && !empty($appFilterData[$col."-startTime"])){
						$sDate = $appFilterData[$col."-startTime"];
					}
					if(isset($appFilterData[$col."-endTime"]) && !empty($appFilterData[$col."-endTime"])){
						$eDate = $appFilterData[$col."-endTime"];
					}
					if ((isset($sDate) && !empty($sDate)) && (isset($eDate) && !empty($eDate))){
						$wherec[$stdCol.$col] = " BETWEEN STR_TO_DATE('" . $sDate. "','%l:%i %p') AND STR_TO_DATE('".$eDate."','%l:%i %p')";
					}else if(isset($sDate) && !empty($sDate)){
						$wherec[$stdCol.$col] = " >='" . $sDate."'";
					}else if(isset($eDate) && !empty($eDate)){
						$wherec[$stdCol.$col] = " <='" . $eDate."'";
					}
				   break;
			   	}

				case 'Numeric':{
					$col = $NewKey;
					if ((isset($appFilterData[$col."-startNo"]) && !empty($appFilterData[$col."-startNo"])) && (isset($appFilterData[$col."-endNo"]) && !empty($appFilterData[$col."-endNo"]))){
						$wherec[$stdCol.$col] = " BETWEEN '" . $appFilterData[$col."-startNo"]. "' AND '".$appFilterData[$col."-endNo"]."'";
					}else if(isset($appFilterData[$col."-startNo"]) && !empty($appFilterData[$col."-startNo"])){
						$wherec[$stdCol.$col] = " >='" . $appFilterData[$col."-startNo"]."'";
					}else if(isset($appFilterData[$col."-endNo"]) && !empty($appFilterData[$col."-endNo"])){
						$wherec[$stdCol.$col] = " <='" . $appFilterData[$col."-endNo"]."'";
					}
					break;
			   	}

				case 'Range':{
					$col = $NewKey;
                    if ((isset($appFilterData[$col."-startRange"]) && !empty($appFilterData[$col."-startRange"])) && (isset($appFilterData[$col."-endRange"]) && !empty($appFilterData[$col."-endRange"]))){
						$wherec[$stdCol.$col] = " BETWEEN " . $appFilterData[$col."-startRange"]. " AND ".$appFilterData[$col."-endRange"]."";
					}else if(isset($appFilterData[$col."-startRange"]) && !empty($appFilterData[$col."-startRange"])){
                        $wherec[$stdCol.$col] = " >=" . $appFilterData[$col."-startRange"]."";
					}else if(isset($appFilterData[$col."-endRange"]) && !empty($appFilterData[$col."-endRange"])){
						$wherec[$stdCol.$col] = " <=" . $appFilterData[$col."-endRange"]."";
					}
					break;
			   	}
				default:
				{
					// // print("default");
					// if (isset($appFilterData[$key]) && !empty($appFilterData[$key])) {
					// 	$checkMul = explode(",",$appFilterData[$key]);
					// 	if(count($checkMul)>1){
					// 		$task_statusString = str_replace(",", "','", $appFilterData[$key]);
					// 		$wherec["t.".$key] = " IN('" . $task_statusString. "')";
					// 	}else{
					// 		$wherec["t.".$key] = "='" . $appFilterData[$key]. "'";
					// 	}
					// }
				}
				break;
			}
		}
		$whereStr = "";
		$orConditions = [];
		$prevOp = '';
		if (isset($filterJson) && !empty($filterJson)) {
			$filterJson = json_decode($filterJson,true);
			// print_r($filterJson);exit;
			foreach ($filterJson as $key => $filter) {
				if (in_array($filter['columnName'],$standardFieldDates)) {
					$filter['value'] = date("Y-m-d",strtotime($filter['value']));
				}
				switch ($filter['condition']) {
					case 'equal_to':
							$checkMul = explode(",",$filter['value']);
							if(count($checkMul)>1){
								$filter_value_string = str_replace(",", "','", $filter['value']);
								$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
							}else{
								$wherec["t.".$filter['columnName']] = "='" . $filter['value']."'";
							}
						break;
					case 'not_equal_to':
							$checkMul = explode(",",$filter['value']);
							if(count($checkMul)>1){
								$filter_value_string = str_replace(",", "','", $filter['value']);
								$wherec["t.".$filter['columnName']] = "NOT IN('" . $filter_value_string. "')";
							}else{
								$wherec["t.".$filter['columnName']] = "!='" . $filter['value']."'";
							}
						break;
					case 'is_empty':
							$wherec["t." . $filter['columnName']] = "IS NULL OR t." . $filter['columnName'] ." = ' '";
						break;
					case 'is_not_empty':
							$wherec["t." . $filter['columnName']] = "IS NOT NULL OR t." . $filter['columnName'] ." != ' '";
						break;
					case 'greater_than':
							$wherec["t." . $filter['columnName']] = ">'" . $filter['value'] . "'";
						break;
					case 'less_than':
							$wherec["t." . $filter['columnName']] = "<'" . $filter['value'] . "'";
						break;
					case 'start_with':
							$wherec["t." . $filter['columnName']] = "LIKE '" . $filter['value'] . "%'";
						break;
					case 'end_with':
							$wherec["t." . $filter['columnName']] = "LIKE '%" .$filter['value'] . "'" ;
						break;
					case 'is_in':
							$filter_value_string = str_replace(",", "','", $filter['value']);
							$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
						break;
					case 'is_in':
							$filter_value_string = str_replace(",", "','", $filter['value']);
							$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
						break;
					case 'is_in':
							$filter_value_string = str_replace(",", "','", $filter['value']);
							$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
						break;
					case 'is_in':
							$filter_value_string = str_replace(",", "','", $filter['value']);
							$wherec["t.".$filter['columnName']] = " IN('" . $filter_value_string. "')";
						break;
					default:
						break;
				}
				$lastValue = end($filterJson);
				if (isset($filter['logicalOp']) && !empty($filter['logicalOp'])) {
					switch ($prevOp) {
						case 'OR':
								$OR["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
								unset($wherec["t.".$filter['columnName']]);
							break;
						case 'AND':
								$wherec["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
								if (strpos($wherec["t.".$filter['columnName']],'OR')) {
									$wherec["t.".$filter['columnName']] = $wherec["t.".$filter['columnName']];
								}
							break;
						default:
							break;
					}
				}
				$prevOp = $filter['logicalOp'];
			}
		}
        	$whereR = $otherR = $joinR = array();
		$extraData= array();
		$selectC = "";
		if(isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)){
			$cData = json_decode($this->menuDetails->c_metadata);
			$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$this->menuDetails->table_name." WHERE Key_name = 'PRIMARY'";
			$primaryData = $this->CI->CommonModel->getdata($sql,array());
			$ccData = array_column($cData,'column_name');
			$fieldIdDetails = array_filter(array_column($cData,'fieldID'),'strlen') ;
			if(isset($ccData) && !empty($ccData)){
				foreach ($ccData as $key => $value) {
					if($value !=""){
						$ccData[$key] = "t.".$value;
					}
				}
			}
			// check islinekd with
			$joinR[0]['type'] ="LEFT JOIN";
			$joinR[0]['table']="menu_master";
			$joinR[0]['alias'] ="mm";
			$joinR[0]['key1'] ="linkedWith";
			$joinR[0]['key2'] ="menuID";
			if(isset($fieldIdDetails) && !empty($fieldIdDetails)){
				$otherR['whereIn'] ="fieldID";
				$otherR['whereData'] = implode(",",$fieldIdDetails);
			}
			$whereR['t.menuID'] = "= ".$this->menuID;
			$whereR['linkedWith'] = "!= ''";
			// get dynamic columns check if it is diaplay in column list or not and then only fetch the data
			$dyCol = array_column($cData,'column_name');
			$this->linkedFields = $this->CI->CommonModel->GetMasterListDetails("t.allowMultiSelect,t.fieldOptions,t.column_name,t.fieldID,t.linkedWith,mm.menuID,mm.table_name","dynamic_fields", $whereR, '', '', $joinR, $otherR);
			foreach ($this->linkedFields as $key => $value) {

				if(!in_array($value->column_name,$dyCol)){
					break;
				}
				$chkcol = "t.".$value->column_name;
				if(in_array($chkcol,$ccData)){
					$ek = array_keys($ccData,"t.".$value->column_name);
					if(!empty($ek)){
						unset($ccData[$ek[0]]);
					}
				}
				$primaryData2 =array();
				if($value->allowMultiSelect == "yes"){
					
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
					$subSql = "( SELECT GROUP_CONCAT(".$value->fieldOptions.") FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE FIND_IN_SET(".$primaryData2[0]->Column_name.",t.".$value->column_name."))";
					$extraData[] = $subSql." AS ".$value->linkedWith."_".trim($value->column_name);
				
				}else{
					
					$sql = "SHOW KEYS FROM ".$this->CI->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
					$primaryData2 = $this->CI->CommonModel->getdata($sql,array());
				
					$last = count($join);
					$join[$last]['type'] ="LEFT JOIN";
					$join[$last]['table']=$value->table_name;
					$join[$last]['alias'] =uniqid("W")."_".substr($value->table_name,0,2);//"ws_".substr($value->table_name,0,2);
					$join[$last]['key1'] = $value->column_name;
					$join[$last]['key2'] =$primaryData2[0]->Column_name;
					$extraData[] = $join[$last]['alias'].".".$value->fieldOptions." AS ".$value->linkedWith."_".trim($value->column_name);//."_".$value->fieldOptions;//$value->fieldOptions;
				}
			}
			
			// if(isset($primaryData2) && !empty($primaryData2)){
			// 	if(!in_array($primaryData2[0]->Column_name,$ccData)){
					
			// 		$ccData[] =$join[$last]['alias'].".".$primaryData2[0]->Column_name;
			// 	}
			// }
			if(isset($primaryData) && !empty($primaryData)){
				if(!in_array($primaryData[0]->Column_name,$ccData)){
					$ccData[]= "t.".$primaryData[0]->Column_name;
				}
			}
			$selectC =implode(",",array_merge($ccData,$extraData));
		}
		
        if($selectC !=""){
            $whereData["select"] = $selectC;
        }else{
            $whereData["select"] = "";
        }
		// print_r($other);exit;
		$other['OR'] = $OR;
        $whereData["join"] =$join;
        $whereData["wherec"] = $wherec;
		$whereData["other"] = $other;
		$whereData["freeTextSearch"] = $freeTextSearch;
        return $whereData;
    }
	public function getMenuData()
	{
		if (!isset($this->menuID) && !isset($this->menuID)) {
			$status['msg'] = $this->CI->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "menu_master";
		$join[0]['alias'] = "m";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";

		$dynamicFieldHtml = "";
		$wherec["m.menuID="] = "'" . $this->menuID . "'";
	
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CI->CommonModel->GetMasterListDetails($selectC = 't.*,m.menuLink', 'dynamic_fields', $wherec, '', '', $join, $other);
		$wheredata["menuID"] = $this->menuID;
		$dynamicFieldsMeta = $this->CI->CommonModel->getMasterDetails("menu_master","*",$wheredata);
		// need to reassign c_metadata as sote for users.
		$whereColData["menu_id"] = $this->menuID;
		$whereColData["user_id"] = $this->CI->input->post('SadminID');
		$dynamicColumnArrangement = $this->CI->CommonModel->getMasterDetails("user_column_data","c_metadata,m_metadata",$whereColData);
		$this->dyanamicForm_Fields  =  $dynamicFields;
		if(isset($dynamicFieldsMeta) && !empty($dynamicFieldsMeta)){
			if(isset($dynamicColumnArrangement) && !empty($dynamicColumnArrangement)){
				$dynamicFieldsMeta[0]->c_metadata = $dynamicColumnArrangement[0]->c_metadata;
				$dynamicFieldsMeta[0]->m_metadata = $dynamicColumnArrangement[0]->m_metadata;
			}
			$this->menuDetails= $dynamicFieldsMeta[0];
		}else{
			$this->menuDetails=  array();
		}
	}
}
