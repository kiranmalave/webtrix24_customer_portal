<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use Twilio\Rest\Client;
require_once APPPATH . '../vendor/autoload.php';
#[\AllowDynamicProperties]

class WhatsAppApi{
	private $sid;
	private $token;
	public function __construct(){
		$this->CI =& get_instance();
		$from ;
		$sids ;
		$token ;		
		// GET DETAILS ABOUT WA API KEY
		
	}
	public function getCompanyDetails(){
		// REPLACE 6 WITH NEAREST COMMENTED CODE
		$wherec = array("infoID"=> $this->CI->company_id ); //
		$companyDetails = $this->CI->CommonModel->getMasterDetails("info_settings","*",$wherec);
		
		if (!isset($companyDetails) && empty($companyDetails)) {
			$status['msg'] = $this->CI->systemmsg->getErrorCode(992);
			$status['statusCode'] = 992;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->CI->response->output($status, 200);
			$this->CI->errorlogs->checkDBError($this->CI->systemmsg->getErrorCode(227),'WhatsApp Error', dirname(__FILE__), __LINE__, __METHOD__);
		}
		// ASSIGN CREDENTIAL VALUES TO DATA-MENBERS
		if (isset($companyDetails[0]->wa_token) && !empty($companyDetails[0]->wa_token)) {
			$this->token = $companyDetails[0]->wa_token;
		}
		if (isset($companyDetails[0]->wa_ids) && !empty($companyDetails[0]->wa_ids)) {
			$this->sids = $companyDetails[0]->wa_ids;
		}
		if (isset($companyDetails[0]->wa_from) && !empty($companyDetails[0]->wa_from)) {
			$this->from = $companyDetails[0]->wa_from;
		}
	}
	public function sendWhatsAppMsg($to, $msg, $mediaUrl){
		$this->getCompanyDetails();
		// CREATE CLIENT
		$twilio = new Client($this->sids, $this->token);

		$param = array() ;
		if (isset($this->from) && !empty($this->from)) {
			$param['from'] = "whatsapp:$this->from"; 
		}
		if (isset($msg) && !empty($msg)) {
			$param['body'] = $msg;
		}
		// MEDIA LINKS
		if (isset($mediaUrl) && !empty($mediaUrl)) {
			$mediaUrl = explode(',',$mediaUrl);
			$param['mediaUrl'] = $mediaUrl;	
		}
		try{
			$WAlogs = array();
			$message = $twilio->messages->create(
				"whatsapp:{$to}",
				$param
			);
			$WAlogs['from'] = $this->from;
			$WAlogs['body'] = $msg;
			$WAlogs['to'] = $to;
			$WAlogs['profile_name'] = " ";
			$WAlogs['message_Sid'] = $message->sid;
			
			$WAlogs['message_status'] = $message->status;
			$WAlogs['timestamp'] = "2024-10-30T12:34:56Z";
			
			// INSERT INTO DATABASE
			$this->CI->insertLogs($WAlogs);
			
		} catch (Exception $e) {
			// ERROR WHILE SENDING WHATSAPP MESSAGES
			$this->CI->errorlogs->checkDBError(array('code'=>'991','message'=>$e->getMessage()),'WhatsApp Error', dirname(__FILE__), __LINE__, __METHOD__);
		}
	}
}
