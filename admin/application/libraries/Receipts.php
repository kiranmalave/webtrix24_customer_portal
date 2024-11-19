<?php
// require 'vendor/autoload.php'; // If you're using Composer (recommended)

defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Receipts
{


	public function __construct()
	{
		$this->CI = &get_instance();
		$this->CI->load->library('emails');
		$this->CI->load->model('CommonModel');
	}

    public function prepareNotification($action = '',$tableName = '' ,$primaryKey='',$primary_id='')
    {
        // print($action);
        // print($tableName);
        // print($primaryKey);
        // print($primary_id);
        // exit;
        $notificationlist = $this->CI->CommonModel->getNotificationList($tableName,$action);
        // print_r($notificationlist);exit;
        if(isset($notificationlist) && !empty($notificationlist)){
            foreach ($notificationlist as $key => $value) {
                $datatosend= array();
                $datatosend['user_type'] = $value->user_type;
                
                // print_r($datatosend);exit;
                if (isset($value->json_data) && !empty($value->json_data)) {
                    $jsonObj = json_decode($value->json_data);
                    // print_r($jsonObj);exit;
                    $isExist= 0;
                    $query = "SELECT * FROM ab_".$tableName." WHERE ".$primaryKey." = ".$primary_id." AND ";

                    foreach ($jsonObj as $key2 => $value2) {
                        $columnName = $value2->columnName;
                        $columnValue = $value2->value;
                        $conditionOP = $value2->conditionalOp;
                        $logicalC = $value2->logicalOp;
                        // Append conditions to the query
                            $query .= " $columnName $conditionOP '$columnValue' $logicalC ";
                    }
                    // Remove the trailing logical operator at the end of the query
                    $query = rtrim($query, ' ');
                    // Now $query holds the complete SQL query
                    $details = $this->CI->CommonModel->getDetailForNotification($query);

                    if($details)
                    {
                        $datatosend['notificationID'] = $value->notification_id;
                        $datatosend['sys_user_id'] = $value->sys_user_id;
                        $datatosend['template_id'] = $value->template_id;
                        if($tableName == 'customer'){
                            $datatosend['email_customer'] = $details[0]->email;   
                        }else{
                            $datatosend['email_customer'] = $details[0]->email_id;
                        }
                        $datatosend['details']= (array) $details[0];
                        if(!$this->CI->config->item('development')){
                            $this->sendEmailNotification($tableName,$action,$datatosend);
                        }
                    }
                }
            }
        }
    }

    public function sendEmailNotification($table='',$action='',$data= array())
    {

        // print_r($data);exit;
        $notificationDetails = array();
        
        $adminArray = array();
        $wheret = array();
        $template = array();

        if(isset($data['template_id']) && !empty($data['template_id']))
        {
            $wheret['tempID'] = $data['template_id']; 
            $template = $this->CI->CommonModel->getMasterDetails('email_master','',$wheret);
            
            if(empty($template))
            {
                $status['msg'] = "Email template not found";
                $status['statusCode'] = 998;
                $status['data'] = array();
                $status['flag'] = 'F';
                $this->CI->response->output($status, 200);
            }
        }else{
            return;
        }

        if(isset($data['sys_user_id']) && !empty($data['sys_user_id']))
        {
            if($data['sys_user_id'] == 'all')
            {
                $adminArray =$this->CI->CommonModel->getMasterDetails('admin','email,name',array());
                
            }else{
                $adminArray =$this->CI->CommonModel->getMasterDetails('admin','email,name',array('adminID'=>$data['sys_user_id']));
            }
            if(empty($adminArray))
            {
                $status['msg'] = "Users not found";
                $status['statusCode'] = 998;
                $status['data'] = array();
                $status['flag'] = 'F';
                $this->CI->response->output($status, 200);
            }
        }    
         // CHECK FOR TRIGGER
        if($action == "update"){
            // ON UPDATE
            $subject = $template[0]->subjectOfEmail;
            $content = $template[0]->emailContent;
            $details = array() ;

            if(isset($content) && !empty($content))
            {    
                if(isset($data['details']) && !empty($data['details']))            
                {
                   $details = $data['details']; 
                    // print_r($details);                        
                   foreach ($details as $C_key => $C_value) {
                        $key = "{{".$C_key."}}";
                       

                        if (strpos($content,$key) !== false) {
                            $content = str_replace($key, $C_value, $content);
                        }
                    }           
                }
            }
            
            // IF EXIST THEN SINGLE ROW ELSE MULTIPLE  
            if($data['user_type'] == 'system_user'){
                foreach ($adminArray as $admin) {
                    $mail = $this->CI->emails->sendMailDetails("","",$admin->email,'','', $subject,$content,'','','','','','');
                    if ($mail) {
                        $this->emailLogEntry($admin->email,$subject,$content,$mail);
                    } else {
                        $this->emailLogEntry($admin->email,$subject,$content,$mail);
                    }
                }
            }else{
                $mail =  $this->CI->emails->sendMailDetails("","",$data['email_customer'],'','', $subject,$content,'','','','','','');
                if ($mail) {
                    $this->emailLogEntry($data['email_customer'],$subject,$content,$mail);
                } else {
                    $this->emailLogEntry($data['email_customer'],$subject,$content,$mail);
                }
            }

        }else if($action == "add")
        {
            // ON ADD   
            $subject = $template[0]->subjectOfEmail;
            $content = $template[0]->emailContent;
            $details = array() ;

            if(isset($content) && !empty($content))
            {    
                if(isset($data['details']) && !empty($data['details']))
                {
                   $details = $data['details'];
                    foreach ($details as $C_key => $C_value) {
                        $key = "{{".$C_key."}}";
                        if (strpos($content,$key) !== false) {
                            $content = str_replace($key, $C_value, $content);
                        }
                    }           
                }
            }

            $mail = false;
            if($data['user_type'] == 'system_user'){
                foreach ($adminArray as $admin) {
                    $mail = $this->CI->emails->sendMailDetails("","",$admin->email,'','', $subject,$content,'','','','','','');
                    if($mail)
                        $this->emailLogEntry($admin->email,$subject,$content,$mail);
                }
            }else
            {
                $mail = $this->CI->emails->sendMailDetails("","",$details['email_id'],'','', $subject,$content,'','','','','','');
                if($mail)
                    $this->emailLogEntry($details['email_id'],$subject,$content,$mail);
            }
        }else if($action == 'delete'){
                
            // ON DELETE
            $subject = $template[0]->subjectOfEmail;
            $content = $template[0]->emailContent;
            $toDelete = explode(",", $data['dataToDelete']);

            $details = array() ;

            if(isset($content) && !empty($content))
            {    
                if(isset($data['details']) && !empty($data['details']))
                {
                   $details = $data['details'];
                   foreach ($details as $C_key => $C_value) {
                        $key = "{{".$C_key."}}";
                        if (strpos($content,$key) !== false) {
                            $content = str_replace($key, $C_value, $content);
                        }
                    }           
                }
            }
            foreach ($toDelete as $id) {
                if(isset($data['primary_key']) && !empty($data['primary_key']))
                    $wherer["".$data['primary_key']] = $id;
                
                $allData = $this->CI->CommonModel->getMasterDetails($table,'*',$wherer);
                
                if($data['user_type'] == 'system_user'){
                    foreach ($adminArray as $admin) {
                        $mail = $this->CI->emails->sendMailDetails("","",$admin->email,'','', $subject,$content,'','','','','','');
                    }
                }else
                {
                    $mail =  $this->CI->emails->sendMailDetails("","",$details[0]->email_id,'','', $subject,$content,'','','','','','');
                }
                
                $this->emailLogEntry($details[0]->email_id,$subject,$content,$mail);
                
                if ($mail) {
                    $status['msg'] = $this->systemmsg->getSucessCode(400);
                    $status['statusCode'] = 400;
                    $status['data'] = array();
                    $status['flag'] = 'S';
                    $this->response->output($status, 200);
                } else {                    
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }
            }
        }     
    }
	
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
        if(is_array($to))
        {
            foreach ($to as $key => $value) {
                $logDetails['to_email'] = $value;
                $iscreated = $this->CI->CommonModel->saveMasterDetails('email_logs', $logDetails);
            }   
        }else{
            $iscreated = $this->CI->CommonModel->saveMasterDetails('email_logs', $logDetails);
        }
    }

}
