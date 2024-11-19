<?php
defined('BASEPATH') or exit('No direct script access allowed');

class WASender extends CI_Controller
{
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("response");
		$this->load->library("ValidateData");
        // LOAD WHATSAPP APLI LIB LIBRARY 
        if(!$this->config->item('development')){
            $this->load->library("WhatsAppApi");	
        }
    }
    // SEND WHATS-APP MESSAGE
    public function sendWhatsAppMsg(){
        $this->access->checkTokenKey();
        $this->response->decodeRequest();

        $to = $this->validatedata->validate('to','to',true,'',array());
        $msg = $this->validatedata->validate('msg','msg',true,'',array());
        $mediaUrl = $this->validatedata->validate('mediaUrl','mediaUrl',false,'',array());
        
        // LIB FUNCTION CALLED 
        $msgSend = $this->whatsappapi->sendWhatsAppMsg($to, $msg, $mediaUrl);
        if ($msgSend) {
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
    // RECEIVE WHATS APP MESSAGE [CALLED FROM TWILIO]
    public function receiveWhatsAppMsg(){
        // $this->access->checkTokenKey();
        $this->response->decodeRequest();
        // print $filePath = $_SERVER['DOCUMENT_ROOT'].'/response.txt';
        // file_put_contents($filePath,json_encode($_POST));
        // print_r($_POST);
        $WAlogs = array();
        $WAlogs['from'] = $this->validatedata->validate('From', 'From', false, '', array());
        $WAlogs['body'] = $this->validatedata->validate('Body', 'Body', false, '', array()); 
        $WAlogs['to'] = $this->validatedata->validate('To', 'To', false, '', array()); 
        $WAlogs['profile_name'] = $this->validatedata->validate('ProfileName', 'ProfileName', false, '', array()); 
        $WAlogs['message_Sid'] = $this->validatedata->validate('SmsMessageSid', 'SmsMessageSid', false, '', array()); 
        $WAlogs['message_status'] = $this->validatedata->validate('SmsStatus', 'SmsStatus', false, '', array()); 
        //$WAlogs['timestamp'] = $this->validatedata->validate('Timestamp', 'Timestamp', false, '', array());      
        $this->insertLogs($WAlogs);
    }  
    // INSERT MESSAGE INTO LOGS
    public function insertLogs($msgDetails = array()){
        $iscreated = $this->CommonModel->saveMasterDetails('messages', $msgDetails);
        if (!$iscreated) {
            $status['msg'] = $this->systemmsg->getErrorCode(289);
            $status['statusCode'] = 998;
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }else{
            $status['msg'] = $this->systemmsg->getSucessCode(400);
            $status['statusCode'] = 400;
            $status['flag'] = 'S';
            $this->response->output($status, 200);
        }
    }
    // GET ALL MESSAGES 
    public function getAllMsg(){
        // $this->access->checkTokenKey();
        // $this->response->decodeRequest();
        $msgDetails = $this->CommonModel->getMasterDetails('messages','',array());
        if ($msgDetails) {
            $status['msg'] = $this->systemmsg->getErrorCode(289);
            $status['statusCode'] = 998;
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }else{
            $status['msg'] = $this->systemmsg->getSucessCode(400);
            $status['data'] = $msgDetails;
            $status['statusCode'] = 400;
            $status['flag'] = 'S';
            $this->response->output($status, 200);
        }
    }
    // UPDATE MESSAGES STATUS SENT FROM SYSTEM 
    public function updateMsgStatus(){
        $this->response->decodeRequest();
        //   print $filePath = $_SERVER['DOCUMENT_ROOT'].'/response.txt';
        // file_put_contents($filePath,json_encode($_POST));
        // print_r($_POST);exit;
        $where = array();
        $message_Sid = $this->validatedata->validate('MessageSid', 'MessageSid', false, '', array()); 
        $WAlogs['message_status'] = $this->validatedata->validate('SmsStatus', 'SmsStatus', false, '', array()); 
        //$WAlogs['timestamp'] = $this->validatedata->validate('Timestamp', 'Timestamp', false, '', array());

        if (isset($message_Sid) && !empty($message_Sid)) {
            $where['message_Sid'] = $message_Sid;
        }
        $iscreated = $this->CommonModel->updateMasterDetails('messages',$WAlogs,$where);
        if (!$iscreated) {
            $status['msg'] = $this->systemmsg->getErrorCode(998);
            $status['statusCode'] = 998;
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }else{
            $status['msg'] = $this->systemmsg->getSucessCode(400);
            $status['statusCode'] = 400;
            $status['flag'] = 'S';
            $this->response->output($status, 200);
        }
    }       
}