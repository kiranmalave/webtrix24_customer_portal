<?php
// require 'vendor/autoload.php'; // If you're using Composer (recommended)

defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class NotificationTrigger
{
	public function __construct()
	{
		$this->CI = &get_instance();
		$this->CI->load->library('emails');
		$this->CI->load->model('CommonModel');
	}
    public function prepareNotification($action = '',$tableName = '' ,$primaryKey='',$primary_id='',$oldData=array(),$menuID='',$company_id=''){
        if (!isset($company_id) && empty($company_id)) {
			$status['msg'] = $this->CI->systemmsg->getErrorCode(294);
			$status['statusCode'] = 294;
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
		}
        $notificationlist = $this->CI->CommonModel->getNotificationList($menuID,$action,$company_id);
        if(isset($notificationlist) && !empty($notificationlist)){
            foreach ($notificationlist as $key => $value) {
                $datatosend= array();
                $datatosend['user_type'] = $value->user_type;
                $datatosend['menuID'] = $menuID;
                $datatosend['attachment'] = $value->attachment;
                $forChange = array();
                if (isset($value->json_data) && !empty($value->json_data)) {
                    $jsonObj = json_decode($value->json_data);
                    $getStructureSQl = "SHOW COLUMNS FROM ab_".$tableName; 
			        $structure = $this->CI->CommonModel->getdata($getStructureSQl,array());		
                    $query = "SELECT * FROM ab_".$tableName." WHERE ".$primaryKey." = '".$primary_id."' AND ";
                    $i=0;
                    foreach ($jsonObj as $key2 => $value2){
                        $columnName = $value2->columnName;
                        $columnType = $this->findFieldType($structure,$value2->columnName);
                        $columnValue = $value2->value;
                        $conditionOP = $value2->conditionalOp;
                        $logicalC = $value2->logicalOp;
                        if ($conditionOP == 'change') {
                            $forChange[$i]['columnName']=$columnName;
                            $forChange[$i]['columnValue']=$columnValue;
                            $forChange[$i]['logicalOp']=$logicalC;
                            $i++;
                        }else{
                            if ($columnType == 'datetime' || $columnType == 'timestamp' ) {
                                $query .= "DATE($columnName) $conditionOP '$columnValue' $logicalC ";
                            }else{
                                $query .= "$columnName $conditionOP '$columnValue' $logicalC ";
                            }
                        }
                    }
                    $query = preg_replace('/\s+(AND|OR)\s*$/i', '', $query);
                    $query = rtrim($query, ' ');      
                    $details = $this->CI->CommonModel->getDetailForNotification($query);
                    if (empty($details) && $action == 'delete') {
                        $details = $oldData;
                    }
                    
                    if($details){
                        $datatosend['notificationID'] = $value->notification_id;
                        $datatosend['sys_user_id'] = $value->sys_user_id;
                        $datatosend['template_id'] = $value->template_id;
                        $datatosend['details']= (array) $details[0];
                        if($tableName == 'customer' || $tableName == 'tasks'){
                            ($datatosend['user_type'] == "assignee") ? 
                            $customerDet = $this->CI->CommonModel->getMasterDetails('admin','email',array('adminID='=>$details[0]->assignee,'status'=>'active')) : 
                            $customerDet = $this->CI->CommonModel->getMasterDetails('customer','email',array('customer_id='=>$details[0]->customer_id,'status'=>'active'));
                            (isset($customerDet[0]->email) && !empty($customerDet[0]->email)) ? $datatosend['email_customer'] = array($customerDet[0]->email) : '';
                        }else{
                            $datatosend['email_customer'] = array($details[0]->email_id);
                        }
                        
                        if (isset($forChange) && !empty($forChange)) {
                            $isval = 0;
                            foreach ($forChange as $key => $value) {
                                $colName = $value['columnName'];
                                $valNew = $details[0]->$colName;
                                $valOld = $oldData[0]->$colName;
                                if ($value['logicalOp'] == 'OR') {
                                    $isval ? $isval = 1 : (($valOld != $valNew)? $isval = 1 :  $isval = 0);
                                }else if($value['logicalOp'] == 'AND'){
                                    ($valOld != $valNew)? $isval = 1 :  $isval = 0;
                                }else{
                                    $isval ? $isval = 1 : (($valOld != $valNew)? $isval = 1 :  $isval = 0);
                                }
                            }
                            if ($isval) {
                                if(!$this->CI->config->item('development')){
                                    $this->sendEmailNotification($tableName,$action,$datatosend,$company_id);
                                }
                            }
                        }else{

                            if(!$this->CI->config->item('development')){
                                $this->sendEmailNotification($tableName,$action,$datatosend,$company_id);
                            }
                        }
                    }
                }
            }
        }
    }
    // RETURN FIELD TYPE
    function findFieldType($array, $fieldName) {
        foreach ($array as $item) {
            if ($item->Field === $fieldName) {
                return $item->Type;
            }
        }
        return null; 
    }

    public function sendEmailNotification($table='',$action='',$data= array(),$company_id='')   {   
        $notificationDetails = array();
        $adminArray = array();
        $wheret = array();
        $template = array();
        // GET TEMPLATE
        if(isset($data['template_id']) && !empty($data['template_id'])){
            $wheret['tempID'] = $data['template_id']; 
            $wheret['status'] = 'active'; 
            $template = $this->CI->CommonModel->getMasterDetails('email_master','',$wheret);
            if(empty($template))
            {
                $emailError['message'] = $this->CI->systemmsg->getErrorCode(313);
                $emailError['code'] = 313;
                $this->CI->errorlogs->checkDBError($emailError,'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
                $status['msg'] = $this->CI->systemmsg->getErrorCode(313);
                $status['statusCode'] = 313;
                $status['data'] = array();
                $status['flag'] = 'F';
                $this->CI->response->output($status, 200);
            }
        }else{
            $emailError['message'] = $this->systemmsg->getErrorCode(313);
            $emailError['code'] = 313;
            $this->errorlogs->checkDBError($emailError,'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
            return;
        }
        $subject = $template[0]->subjectOfEmail;
        $content = $template[0]->emailContent;
        $details = array();
        $columnMappings = [
            'assignee' => 'Assignee',
            'assignee_email' => 'Assignee Email',
            'assignee_whatsapp_no' => 'Assignee WhatsApp number',
            'assignee_contact_no' => 'Assignee Contact No',
            'pan_number'=>'PAN No.',
            'company_id'=>'Company name',
            'gst_no'=>'GST No.',
            'adhar_number'=>'Adhar No',
        ];
        switch ($table) {
            case 'customer':
                if (isset($data['details']) && $data['details']['type'] == 'lead') {
                    // $columnMappings['name'] = 'Lead Name';
                    // $columnMappings['email'] = 'Lead Email';
                    // $columnMappings['stages'] = 'Lead Stage';
                }else{
                    // $columnMappings['name'] = 'Customer Name';
                    // $columnMappings['email'] = 'Customer Email';
                    // $columnMappings['stages'] = 'Customer Stage';
                }
                break;
            default:break;
        }
        $staticCol = $this->getStaticColData($table);
        if (isset($staticCol) && !empty($staticCol)) {
            $staticCol = array_merge($staticCol, $columnMappings);
        }   
        // GET JOINED DATA FROM ROW
        if ($action == 'delete' && isset($data['details']['joinedData'])) {
            $data['details'] = $data['details']['joinedData'];
        }else {
            $data = $this->getJoinedDetails($table,$data);
        }
        $isSub = (!empty($subject)) ? 1 : 0 ;
        if(isset($content) && !empty($content)){    
            if(isset($data['details']) && !empty($data['details'])){
               $details = $data['details'];
                foreach ($details as $C_key => $C_value) {
                    (isset($staticCol[$C_key])) ? $key = "{{".$staticCol[$C_key]."}}" : $key = "{{".$C_key."}}";
                    if (strpos($content,$key) !== false) {
                        if (isset($C_value) && !empty($C_value)) {
                            $content = str_replace($key, $C_value, $content);
                        }else{
                            $content = str_replace($key, '[data not exists]', $content);
                        }
                    }
                    // IF KEY PRESENT IN SUBJECT
                    if ($isSub) {
                        if (strpos($subject,$key) !== false) {
                            if (isset($C_value) && !empty($C_value)) {
                                $subject = str_replace($key, $C_value, $subject);
                            }
                            else{
                                $subject = str_replace($key, '[data not exists]', $subject);
                            }
                        }
                    }
                }           
            }
        }
        // IF USER TYPE SYSTEM USER
        if(isset($data['sys_user_id']) && !empty($data['sys_user_id'])){
            if($data['sys_user_id'] == 'all'){
                $adminArray =$this->CI->CommonModel->getMasterDetails('admin','email,name,whatsappNo,contactNo,company_id',array('status ='=>"active"));
            }else{
                $other = array();
                $other['whereIn'] = "adminID";
                $other["whereData"]= "'".implode("','",explode(",",$data['sys_user_id']))."'";
                $adminArray =$this->CI->CommonModel->GetMasterListDetails('email,name,whatsappNo,contactNo,company_id','admin',array('status ='=>"'active'"),'','',array(),$other);
            }
            if (isset($adminArray) && !empty($adminArray)) {
                foreach ($adminArray as $key => $value) {
                    if (strpos($value->company_id, $company_id) === false) {
                        unset($adminArray[$key]);
                    }
                }
            }else{
                $status['msg'] = $this->CI->systemmsg->getErrorCode(325);
                $status['statusCode'] = 325;
                $status['data'] = array();
                $status['flag'] = 'F';
                $this->CI->response->output($status, 200);
            }
        }    
        // FOR ATTACHMENTS
        $attachments = array();  
        if (isset($data['attachment']) && !empty($data['attachment'])) {
            $attachments = explode(',',$data['attachment']);
            foreach ($attachments as $key => $attachment) {
                if (!empty($attachment)) {
                    $attachments[$key] = array(
                        'path' => 'notificationAttach/'.$data['notificationID'].'/',
                        'fileName' => $attachment
                    );
                }else{
                    unset($attachments[$key]);
                }
            }
        }
        // SEND EAIL NOTIFICATION
        if($data['user_type'] == 'system_user'){
            // IF EXIST THEN MULTIPLE EMAILS
            foreach ($adminArray as $admin) {
                if (isset($admin->email) && !empty($admin->email)) {
                    $mail = $this->CI->emails->sendMailDetails("","",array($admin->email),'','', $this->replaceSysUserSubject($subject,$admin),$this->replaceSysUser($content,$admin),$attachments,'','','','','');
                    $this->emailLogEntry($admin->email,$this->replaceSysUserSubject($subject,$admin,'y'),$this->replaceSysUser($content,$admin,'y'),$mail);
                }
            }
        }else{  
            // IF EXIST THEN SINGLE EMAIL
            if (isset($data['email_customer']) && !empty($data['email_customer'])) {
                $mail =  $this->CI->emails->sendMailDetails("","",$data['email_customer'],'','', $subject,$content,$attachments,'','','','','');
                $this->emailLogEntry($data['email_customer'],$subject,$content,$mail);
            }
        }   
    }
    // GET DYANAMIC FEILD THAT ARE LINKEDWITH
    public function getFormData($pluginId=''){
		if (!isset($form) && !isset($pluginId)) {
			return array();
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "dynamic_fields";
		$join[0]['alias'] = "d";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";
		$dynamicFieldHtml = "";
		if(isset($pluginId) && !empty($pluginId)){
			$wherec["t.menuID="] = "'" . $pluginId . "'";
		}else{
			$wherec["t.menuLink="] = "'" . $form . "'";
		}
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CI->CommonModel->GetMasterListDetails($selectC = 't.menuLink,t.menuID,d.*', 'menu_master', $wherec, '', '', $join, $other);
		if (isset($dynamicFields) && !empty($dynamicFields)) {
            $data = array();
            foreach ($dynamicFields as $key => $value) {
                if (isset($value->linkedWith) && !empty($value->linkedWith)) {
                    $menuDetails = $this->CI->CommonModel->getMasterDetails("menu_master","table_name",array('menuID'=> $value->linkedWith));
                    $value->linkedTableName = $menuDetails[0]->table_name;
                    if ($value->linkedTableName == 'categories' ) {
                        $data["" . $value->column_name . ""]    = ["table" => $value->linkedTableName, "alias" => $this->getAlias($value->column_name), "column" => "categoryName", "key2" => 'category_id'];
                    }elseif ($value->linkedTableName == 'admin') {
                        $data["" . $value->column_name . ""]    = ["table" => $value->linkedTableName, "alias" => $this->getAlias($value->column_name), "column" => "name", "key2" => 'adminID'];
                    }elseif ($value->linkedTableName == 'customer') {
                        $data["" . $value->column_name . ""]    = ["table" => $value->linkedTableName, "alias" => $this->getAlias($value->column_name), "column" => "name", "key2" => 'customer_id'];
                    }
                }
            }
			return $data; 
		}else{
            return array();
        }
	}
    // GENERATE ALIAS NAME FOR DYNAMIC FIELD JOINS
    public function getAlias($string){
        $alias = '';
        $parts = explode('_', $string);
        if (count($parts) == 1) {
            $firstPart = substr($parts[0], 0, 3);
            $alias = $firstPart;
        }elseif (count($parts) > 1) {
            $firstPart = substr($parts[0], 0, 3);
            $secondPart = substr($parts[1], 0, 3);
            $alias = $firstPart.$secondPart;
        }
        return $alias; 
    }
    // GET JOINED DATA TO REPLACE
    public function getJoinedDetails($table,$data){
        // REPLACE FOREIGN VALUES USING JOIN
        $columnNames = [
            "modified_by"  => ["table" => "admin", "alias" => "mb", "column" => "modified_by", "key2" => "adminID"],
            "created_by"   => ["table" => "admin", "alias" => "cb", "column" => "created_by", "key2" => "adminID"],
            "customer_id"  => ["table" => "customer", "alias" => "cs", "column" => "name", "key2" => "customer_id"],
            "assignee"     => ["table" => "admin", "alias" => "a", "column" => "name", "key2" => "adminID"],
            "company_id"   => ["table" => "info_settings", "alias" => "i", "column" => "companyName", "key2" => "infoID"],
        ];
        $dynamicFormData = $this->getFormData($data['menuID']);
        if (isset($dynamicFormData) && !empty($dynamicFormData)) {
            $columnNames = array_merge($columnNames, $dynamicFormData);
        }
        // REPLACE FOREIGN COLUMNS VALUE
        if ($table == 'tasks') {
            $wherec = array();
            $columnNames["task_status"]   = ["table" => "categories", "alias" => "ca", "column" => "categoryName", "key2" => "category_id"];
            $columnNames["task_priority"] = ["table" => "categories", "alias" => "cat", "column" => "categoryName", "key2" => "category_id"];
            $columnNames["task_type"]     = ["table" => "categories", "alias" => "ct", "column" => "categoryName", "key2" => "category_id"];
            $wherec['t.task_id = ']= $data['details']['task_id'];
        }elseif ($table == 'customer') {
            // $columnNames["state_id"]    = ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"];
            $columnNames["lead_source"] = ["table" => "categories", "alias" => "cl", "column" => "categoryName", "key2" => "category_id"];
            $columnNames["stages"]      = ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"];
            // $columnNames["city_id"]     = ["table" => "cities", "alias" => "ci", "column" => "city_name", "key2" => "city_id"];
            // $columnNames["country_id"] = ["table" => "country", "alias" => "cn", "column" => "country_name", "key2" => "country_id"];
            // $columnNames["state_id"]    = ["table" => "states", "alias" => "st", "column" => "state_name", "key2" => "state_id"];
            $columnNames["  "] = ["table" => "categories", "alias" => "cl", "column" => "categoryName", "key2" => "category_id"];
            $columnNames["stages"]      = ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"];
            $wherec['t.customer_id = ']= $data['details']['customer_id'];
        }
        $selectC = 't.*';
        $join = array();
        foreach ($columnNames as $columnName => $columnData) {
            $jkey = count($join) + 1;
            $join[$jkey]['type'] = "LEFT JOIN";
            $join[$jkey]['table'] = $columnData["table"];
            $join[$jkey]['alias'] = $columnData["alias"];
            $join[$jkey]['key1'] = $columnName;
            $join[$jkey]['key2'] = $columnData["key2"];
            $join[$jkey]['column'] = $columnData["column"];
            $columnNameShow = $columnData["column"];
            if ($columnNameShow == 'modified_by' || $columnNameShow == 'created_by') {
                $selectC .= "," . $columnData["alias"] . ".name as " . $columnName;
            }else{
                if ($columnData["table"] == 'admin') {
                    $selectC .= "," . $columnData["alias"] . ".name as assignee";
                    $selectC .= "," . $columnData["alias"] . ".email as assignee_email";
                    $selectC .= "," . $columnData["alias"] . ".whatsAppNo as assignee_whatsapp_no";
                    $selectC .= "," . $columnData["alias"] . ".contactNo as assignee_contact_no";
                }else{
                    $selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
                }
            }
        }
        $details =  $this->CI->CommonModel->GetMasterListDetails($selectC,$table,$wherec,'','',$join,$other=array());
        if (isset($details) && !empty($details)) {
            $data['details'] = (array) $details[0];
        }
        return $data;
    }
    // GET COLUMN NAMES LIST
    public function getStaticColData($tableName=''){
        $data = array();
        if(!isset($tableName) || empty($tableName)){
			$status['msg'] = $this->CI->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
		}
        $sql = "SHOW COLUMNS FROM ab_".$tableName; 
		$res = $this->CI->CommonModel->getdata($sql,array());
        if (isset($res) && !empty($res)) {
          foreach ($res as $key => $value) {
            $fieldt = $value->Field;
            $value->Field = str_replace('_', ' ', $value->Field);
            $value->Field = ucfirst($value->Field);
            $data[$fieldt] = $value->Field;
          }
        }
		return $data;
    }
    // REPLACE SYSTEM USERS FEILDS IN CONTENT
    public function replaceSysUser($content,$admin,$isEntry='n'){
        if ($isEntry=='n') {
            $columnMappings = [
                'name' => 'System User Name',
                'email' => 'System User Email',
                'contactNo' => 'System User Mobile No',
                'whatsappNo' => 'System User Whatsapp No',
            ];
            foreach ($admin as $C_key => $C_value) {
                (isset($columnMappings[$C_key])) ? $key = "{{".$columnMappings[$C_key]."}}" : $key = "{{".$C_key."}}";
                if (strpos($content,$key) !== false) {
                    if (isset($C_value) && !empty($C_value)) {
                        $content = str_replace($key, $C_value, $content);
                    }else{
                        $content = str_replace($key, '[data not exists]', $content);
                    }
                }
            } 
        }else{
            if (strpos($content,"{{System User Name}}") !== false) {
                if (isset($admin->name) && !empty($admin->name)) {
                    $content = str_replace("{{System User Name}}", $admin->name, $content);
                }else{
                    $content = str_replace("{{System User Name}}", '[data not exists]', $content);
                }
            }
        }
        return $content;
    }
    // REPLACE SYSTEM USERS FEILDS IN SUBJECT
    public function replaceSysUserSubject($subject,$admin,$isEntry='n')
    {
        if ($isEntry == 'n') {
            $columnMappings = [
                'name' => 'System User Name',
                'email' => 'System User Email',
                'contactNo' => 'System User Mobile No',
                'whatsappNo' => 'System User Whatsapp No',
            ];
            foreach ($admin as $C_key => $C_value) {
                (isset($columnMappings[$C_key])) ? $key = "{{".$columnMappings[$C_key]."}}" : $key = "{{".$C_key."}}";
                if (strpos($subject,$key) !== false) {
                    if (isset($C_value) && !empty($C_value)) {
                        $subject = str_replace($key, $C_value, $subject);
                    }else{
                        $subject = str_replace($key, '[data not exists]', $subject);
                    }
                }
            } 
        }else{
            if (strpos($subject,"{{System User Name}}") !== false) {
                if (isset($admin->name) && !empty($admin->name)) {
                    $subject = str_replace("{{System User Name}}", $admin->name, $subject);
                }else{
                    $subject = str_replace("{{System User Name}}", '[data not exists]', $subject);
                }
            }
        }
        return $subject;
    }
    // LOG TO EMAIL LOGS
    public function emailLogEntry($to ='' , $sub='', $body='',$isDel = '')
    {
        $logDetails = array();
        $logDetails['to_email'] = $to;
        $logDetails['subject'] = $sub ;
        $logDetails['body'] = $body ;
        $logDetails['created_date'] = date("Y/m/d H:i:s");;
        $logDetails['sender_id'] = $this->CI->input->post('SadminID');
        $logDetails['type'] = 'email';
        $logDetails['for_event'] = 'general';
        if($isDel){
            $logDetails['status'] = "delivered";
        }else{
            $logDetails['status'] = "not_delivered";
        }
        if(is_array($to)){
            foreach ($to as $key => $value) {
                $logDetails['to_email'] = $value;
                $iscreated = $this->CI->CommonModel->saveMasterDetails('email_logs', $logDetails);
            }   
        }else{
            $iscreated = $this->CI->CommonModel->saveMasterDetails('email_logs', $logDetails);
        }
    }
}
