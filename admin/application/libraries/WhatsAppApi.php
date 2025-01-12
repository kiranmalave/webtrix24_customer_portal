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
		$token;
		$messagingServiceSid;
		// GET DETAILS ABOUT WA API KEY
		
	}
	public function getCompanyDetails(){
		// REPLACE 6 WITH NEAREST COMMENTED CODE
		$wherec = array("infoID"=> 1 ); //
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
		if (isset($companyDetails[0]->wa_message_sid) && !empty($companyDetails[0]->wa_message_sid)) {
			$this->messagingServiceSid = $companyDetails[0]->wa_message_sid;
		}
	}
	public function sendWhatsAppMsg($to, $msg = '', $mediaUrl = '', $messageID = '', $templateName = '', $templateParams = [],$otherDetails=[])
	{
		$this->getCompanyDetails(); // Ensure Twilio credentials and settings are initialized
		$twilio = new Client($this->sids, $this->token); // Initialize Twilio client

		try {
			$param = [];

			// Determine whether to send a template or a direct message
			if (!empty($templateName)) {
				// Sending a message using a template
				$param['ContentSid'] = $messageID;//HXfa44ce54d84960b13cc6af8570116aea;
				$param['messagingServiceSid'] = $this->messagingServiceSid; // Use Messaging Service SID
				$param['template'] = [
					'name' => $templateName, // Template name
					'languageCode' => 'en', // Template language code
					'ContentVariables' => $templateParams
				];
			} else {
				// Sending a direct message (freeform message within 24-hour window)
				if (!empty($this->from)) {
					$param['from'] = "whatsapp:$this->from"; // WhatsApp-approved number
				}
				if (!empty($msg)) {
					$param['body'] = $msg; // Message body
				}
				if (!empty($mediaUrl)) {
					$mediaUrls = explode(',', $mediaUrl);
					$param['mediaUrl'] = array_filter($mediaUrls, function ($url) {
						return filter_var($url, FILTER_VALIDATE_URL);
					});
				}
			}
			// Send the message
			$message = $twilio->messages->create("whatsapp:{$to}", $param);

			// Prepare message log
			$WAlogs = [
				'from' => !empty($templateName) ? $this->messagingServiceSid : $this->from,
				'body' => !empty($templateName) ? json_encode($templateParams) : $msg,
				'to' => $to,
				'profile_name' => " ",
				'message_Sid' => $message->sid,
				'message_status' => $message->status,
				'timestamp' => date('Y-m-d H:i:s')
			];

			if(isset($otherDetails['customer_id']) && !empty($otherDetails['customer_id'])){
				$WAlogs['to_id'] = $otherDetails['customer_id'];
			}
			// Insert log into database
			$this->insertLogsOutgoing($WAlogs);
			return [
				'success' => true,
				'message' => 'Message sent successfully!',
				'sid' => $message->sid
			];
		} catch (Exception $e) {
			// Handle errors
			$this->CI->errorlogs->checkDBError(
				['code' => '991', 'message' => $e->getMessage()],
				'WhatsApp Error',
				dirname(__FILE__),
				__LINE__,
				__METHOD__
			);

			return [
				'success' => false,
				'error' => $e->getMessage()
			];
		}
	}
	public function sendVerificationCode($phone){
		$this->getCompanyDetails();
		$twilio = new Client($this->sids, $this->token); // Create Twilio client
		$verification = $twilio->verify->v2->services("VAe678a07e59948cf3ec6186c8855f166f")->verifications->create($phone, "sms");
		if($verification->sid){
			return $verification->sid;
		}else{
			return null;
		}
	}
	public function verifyMobileOTP($code,$phone){
		$this->getCompanyDetails();
		$twilio = new Client($this->sids, $this->token); // Twilio client initialization
		try {
			$verificationCheck = $twilio->verify->v2->services("VAe678a07e59948cf3ec6186c8855f166f")
				->verificationChecks
				->create([
					"to" => $phone,
					"code" => $code
				]);

			if ($verificationCheck->status === "approved") {
				return true;
				// Proceed with user registration/login
			} else {
				return false;
			}
		} catch (Exception $e) {
			return false;
		}
	}
	public function insertLogs($msgDetails = array()){
        $iscreated = $this->CI->CommonModel->saveMasterDetails('messages', $msgDetails);
        if (!$iscreated) {
            return false;
        }else{
            return true;
        }
    }
	public function insertLogsOutgoing($msgDetails = array()){
        //$iscreated = $this->CI->CommonModel->saveMasterDetails('messages', $msgDetails);
		// check is user exits in idex table
		//print_r($msgDetails);
		if(isset($msgDetails['to_id']) && !empty($msgDetails['to_id'])){
			$wherec = array("customer_id" => $msgDetails['to_id']);
			$isCust = $this->CI->CommonModel->getMasterDetails('messages_index','wa_number',$wherec);
			if(isset($isCust) && !empty($isCust)){
				// update index
				$indexDetails = array();
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->updateMasterDetails('messages_index',$indexDetails,$wherec);
			}else{
				//inser new index
				$indexDetails = array();
				$indexDetails['customer_id'] = $msgDetails['to_id'];
				$indexDetails['wa_number'] = $msgDetails['to'];
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->saveMasterDetails('messages_index',$indexDetails);
			}
		}else{
			// check whats app number
			$wherec = array("wa_number" => $msgDetails['to']);
			$isCust = $this->CI->CommonModel->getMasterDetails('messages_index','wa_number',$wherec);
			if(isset($isCust) && !empty($isCust)){
				// update index
				$indexDetails = array();
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->updateMasterDetails('messages_index',$indexDetails,$wherec);
			}else{
				//inser new index
				$indexDetails = array();
				$indexDetails['wa_number'] = $msgDetails['to'];
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->saveMasterDetails('messages_index',$indexDetails);
			}
		}
		$iscreated = $this->CI->CommonModel->saveMasterDetails('messages', $msgDetails);
        if (!$iscreated) {
            return false;
        }else{
            return true;
        }
    }
	public function insertLogsIncoming($msgDetails = array()){
        // checkin incoming number is assiciate with lead or customer
		if(isset($msgDetails['from']) && !empty($msgDetails['from'])){
			$wherec = array("wa_number" => $msgDetails['from']);
			$iscustomerNumber = $this->CI->CommonModel->getMasterDetails('customer','customer_id',$wherec);
		}
		if(isset($iscustomerNumber) && !empty($iscustomerNumber)){
			$msgDetails['to_id'] = $iscustomerNumber[0]->customer_id;
			$msgDetails['from_id'] = 0;
		}
		// check is user exits in idex table
		if(isset($msgDetails['to_id']) && !empty($msgDetails['to_id'])){
			$wherec = array("customer_id" => $msgDetails['to_id']);
			$isCust = $this->CI->CommonModel->getMasterDetails('messages_index','wa_number',$wherec);
			if(isset($isCust) && !empty($isCust)){
				// update index
				$indexDetails = array();
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->updateMasterDetails('messages_index',$indexDetails,$wherec);
			}else{
				//inser new index
				$indexDetails = array();
				$indexDetails['customer_id'] = $msgDetails['to_id'];
				$indexDetails['wa_number'] = $msgDetails['to'];
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->saveMasterDetails('messages_index',$indexDetails);
			}
		}else{
			// check whats app number
			$wherec = array("wa_number" => $msgDetails['from']);
			$isCust = $this->CI->CommonModel->getMasterDetails('messages_index','wa_number',$wherec1);
			if(isset($isCust) && !empty($isCust)){
				// update index
				$indexDetails = array();
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->updateMasterDetails('messages_index',$indexDetails,$wherec);
			}else{
				//inser new index
				$indexDetails = array();
				$indexDetails['wa_number'] = $msgDetails['to'];
				$indexDetails['last_msg'] = $msgDetails['body'];
				$iscreated = $this->CI->CommonModel->saveMasterDetails('messages_index',$indexDetails);
			}
		}
		//$this->sendMessageToWebSocketServer($msgDetails);
		$iscreated = $this->CI->CommonModel->saveMasterDetails('messages', $msgDetails);
        if (!$iscreated) {
            return false;
        }else{
            return true;
        }
    }
}