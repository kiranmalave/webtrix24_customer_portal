<?php
require 'vendor/autoload.php'; // If you're using Composer (recommended)
use SendGrid\Mail\To;
use SendGrid\Mail\Cc;
use SendGrid\Mail\Bcc;
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Emails
{
	var $live_url = "";
	var $appName = "";
	var $logoPath = "";
	var $appLink = "";
	var $mail_server="";
	private $companyInfo=array();

	public function __construct()
	{
		//parent::__construct();
		$this->CI = &get_instance();
		// Findout user default company
		$this->CI->load->helper('url');
		$this->live_url = $this->CI->config->item('live_base_url');
		//$this->appName = $this->CI->config->item('appName');
		$this->appLink = $this->CI->config->item('app_url');
		$this->logoPath = $this->CI->config->item('app_url') . "images/" ;
		$this->supportEmail = $this->CI->config->item('supportEmail');
		$this->supportEmailName = $this->CI->config->item('supportEmailName');
		//$this->mail_server = $this->CI->config->item('mail_server');
	}
	private function getCompanyDetails($email=''){
		$wherec = array("infoID"=>1);
	 	$d = $this->CI->CommonModel->getMasterDetails("info_settings","*",$wherec);
		if(isset($d) && !empty($d)){
			$this->companyInfo = $d[0];
			$this->mail_server = $this->companyInfo->email_provider;
			$this->appName = $this->companyInfo->companyName;
			$config['protocol'] = 'mail'; // smtp
			$config['smtp_host'] = $this->companyInfo->smtp_host;//'mail.mkvisolutions.com';
			$config['smtp_user'] = $this->companyInfo->smtp_user;//'test@e.webtrixsolutions.com';
			$config['smtp_pass'] = $this->companyInfo->smtp_pass;
			if(isset($this->companyInfo->smtp_post))
			$config['smtp_port'] = $this->companyInfo->smtp_post; // 465
			else
			$config['smtp_port'] = 465;

			$config['charset'] = 'UTF-8';
			$config['mailtype'] = 'html';
			$config['wordwrap'] = TRUE;
			$this->CI->load->library('email', $config);
			$this->CI->email->clear(TRUE);
			$this->CI->email->set_newline("\r\n");
			$this->CI->email->set_crlf("\r\n");
			$this->CI->email->set_newline("\r\n");
			return true;
		}else{
			return false;
		}
	}
	public function sendMailDetails($from = '', $fromName = '', $to = '', $cc = '', $bcc = '', $subject = '', $msg = '', $attachment = array())
	{
		if(!$this->getCompanyDetails($to)){
			return false;
		}	
		if(!isset($from) || empty($from)){
			$from = $this->companyInfo->fromEmail;
		}
		if(!isset($fromName) || empty($fromName)){
			$fromName = "[".$this->companyInfo->fromName."]";
		}
		if($this->mail_server == "sendgrid"){
			return $this->sendMailDetailsSendGrid($from,$fromName,$to,$cc,$bcc,$subject,$this->mailFormat($msg),$attachment);
		}
		if($this->mail_server == "brevo"){
			return $this->sendMailDetailsBrevo($from,$fromName,$to,$cc,$bcc,$subject,$this->mailFormat($msg),$attachment);
		}
		
		$this->CI->email->set_mailtype("html");
		$this->CI->email->from($from, $fromName);
		if(is_array($to)){
			$this->CI->email->to(implode(',',$to));
		}else{
			$this->CI->email->to($to);
		}
		
		if (!empty($cc)){
			if(is_array($to)){
				$this->CI->email->cc(implode(', ', $cc));
			}else{
				$this->CI->email->cc($cc);
			}
		}
		if (!empty($bcc)){
			if(is_array($to)){
				$this->CI->email->bcc(implode(', ', $bcc));
			}else{
				$this->CI->email->bcc($bcc);
			}
		}
		$path = $this->CI->config->item('mediaPATH');
		if (isset($attachment) && !empty($attachment)){
			foreach ($attachment as $key => $value){
				$this->CI->email->attach($path."/".$value['path']."/".$value['fileName']);
			}
		}
		if (!empty($dyanamicAttchments)) {
			foreach ($attachment as $key => $value){
				$this->CI->email->attach($path."/".$value['path']."/".$value['fileName']);
			}
		}
		$this->CI->email->subject($subject);
		$this->CI->email->message($this->mailFormat($msg));
		if ($this->CI->email->send()) {
			return true;
		} else {
			$error = $this->CI->email->print_debugger();
			$emailError['message'] = $error;
			$emailError['code'] = 296;
            $this->CI->errorlogs->checkDBError($emailError,'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
			return false;
		}
	}
	public function mailFormat($message = '')
	{
		$mainTemp = $this->mailFormatHTML();
		$mainTemp = str_replace("{appName}", $this->appName, $mainTemp);
		$mainTemp = str_replace("{appLink}", $this->appLink, $mainTemp);
		
		if($this->companyInfo->email_logo != ''){
			if(file_exists($this->CI->config->item('mediaPATH').$this->companyInfo->email_logo)){
				$this->logoPath = $this->CI->config->item('media_url').$this->companyInfo->email_logo;
			}else
			{
				$this->logoPath = '' ;	
			}
		}else{
			$this->logoPath = '' ;
		}
		
		$mainTemp = str_replace("{logoPath}", $this->logoPath, $mainTemp);
		$mainTemp = str_replace("{{mainMailBody}}", $message, $mainTemp);
		// print_r($mainTemp);exit;
		return $mainTemp;
	}
	public function mailFormatHTML()
	{
		return $mailFormat = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
		<title>{appName}</title>
		<style type="text/css">
		body{width:100%;margin:0px;padding:0px;background:##f0f0f0;text-align:center; -webkit-font-smoothing: antialiased;mso-margin-top-alt:0px; mso-margin-bottom-alt:0px; mso-padding-alt: 0px 0px 0px 0px;}
		html{width: 100%; }
		img {border:0px;text-decoration:none;display:block; outline:none;}
		a,a:hover{text-decoration:none;}.ReadMsgBody{width: 100%; background-color: #ffffff;}.ExternalClass{width: 100%; background-color: #ffffff;}
		table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }  
		p,h1,h2,h3,h4{margin-top:0;margin-block-start:0;margin-block-end:0;margin-bottom:0;padding-top:0;padding-bottom:0;}
		.main-bg{ background:#323030;}
		.footer-border{border-top: solid 1px #f5666e; }
		@media only screen and (max-width:640px)
		{
			body{width:auto!important;}
			table[class=main] {width:440px !important;}
			table[class=inner-part]{width:400px !important;}
			table[class=inner-full]{width:100% !important;}
			table[class=inner-center]{width:400px !important; text-align:center;}
			table[class=inner-service]{width:80% !important;}
			.alaine{ text-align:center;}
		
			}
		
		@media only screen and (max-width:479px)
		{
			body{width:auto!important;}
			table[class=main] {width:280px !important;}
			table[class=inner-part]{width:260px !important;}
			table[class=inner-full]{width:100% !important;}
			table[class=inner-center]{width:260px !important; text-align:center;}
			table[class=inner-service]{width:185px !important;}
			.alaine{ text-align:center;}
		}
		</style>
		</head>
		<body>
		<!--Main Table Start-->
		<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0" bgcolor="#f0f3f7" style="background:#f0f3f7;">
		  <tr>
			<td align="center" valign="top">
			<!--Top space Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
				
				<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  <tr>
					<td height="60" align="left" valign="top">&nbsp;</td>
				  </tr>
				</table>
				
				</td>
			  </tr>
			</table>
			
			<!--Top space End-->
			<!--Logo Part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td align="center" valign="top">
						<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
							<tr>
								<td align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;">
									<table border="0" align="center" cellpadding="0" cellspacing="0">
									<tr>
										<td height="25" align="center" valign="top">&nbsp;</td>
									</tr>
									<tr>
										<td align="center" valign="top"><a href="{appLink}"><img editable="true" mc:edit="logo" src="{logoPath}" height="70" alt="{appName}" /></a></td>
									</tr>
									<tr>
										<td height="25" align="center" valign="top">&nbsp;</td>
									</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<tr>
					<td height="1" align="center" bgcolor="#f0f3f7" style="background:#f0f3f7;" valign="top">&nbsp;</td>
				</tr>
			</table>
			<!--Logo Part End-->
			<!--Welcome Text Part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
				<tr>
					<td align="center" valign="top">
					
						<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
							<tr>
							<td align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;"><table width="525" border="0" align="center" cellpadding="0" cellspacing="0" class="inner-part">
							<tr>
								<td height="10" align="center" valign="top">&nbsp;</td>
							</tr>
							<tr>
								<td valign="top" color="#4d6575" style="color:#4d6575;">
								<multiline>
									{{mainMailBody}}
								</multiline><br>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			</td>
			  </tr>
			</table>
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
					<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  	<tr>
						<td height="10" align="left" valign="top" bgcolor="#FFFFFF" style="background:#FFF;">&nbsp;</td>
				  	</tr>
					</table>
				</td>
			  </tr>
			</table>
			<!--Space End-->
			<!--Copyright part Start-->
			<table width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center" valign="top">
				<table width="650" border="0" align="center" cellpadding="0" cellspacing="0" class="main">
				  <tr>
					<td align="left" valign="top" bgcolor="#f0f3f7" style="background:#f0f3f7;"><table width="80%" border="0" align="center" cellpadding="0" cellspacing="0">
					  <tr>
						<td height="25" align="center" valign="top">&nbsp;</td>
					  </tr>
					  <tr>
						<td align="center" valign="top"  color="#4d6575" style="color:#4d6575;font:Bold 12px Arial, Helvetica, sans-serif; padding-bottom:8px;" mc:edit="copyright"><multiline>Copyright &copy; 2023 {appName}. All Rights Reserved.</multiline></td>
					  </tr>
					  <tr>
						<!-- <td align="center" valign="top" style="font:Bold 12px Arial, Helvetica, sans-serif; color:#FFF;" mc:edit="support"> <multiline>Support  /</multiline>  <unsubscribe> unsubscribe </unsubscribe></td> -->
					  </tr>
					  <tr>
						<td height="25" align="center" valign="top">&nbsp;</td>
					  </tr>
					</table>
				  </td>
				  </tr>
				</table>
				</td>
			  </tr>
			</table>
			<!--Copyright part End-->
			</td>
		  </tr>
		</table>
		<!--Main Table End-->
		</body>
		</html>
		';
	}
	function sendMailDetailsSendGrid($from,$fromName,$to,$cc,$bcc,$subject,$msg,$attachment){

		if (!class_exists('\SendGrid\Mail\Mail')) {
			$emailError['message'] = $this->CI->systemmsg->getErrorCode(334);
			$emailError['code'] = 313;
            $this->CI->errorlogs->checkDBError($emailError,'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
		}
		$email = new \SendGrid\Mail\Mail(); 
		// personalization
		$personalization = new \SendGrid\Mail\Personalization();
		//print gettype($to);
		if(gettype($to) =="string"){
			$to =array($to);
		}
		foreach ($to as $To) {
			$personalization->addTo(new To($To, ''));
		}
		if(isset($cc) && !empty($cc)){
			foreach ($cc as $CC) {
				$personalization->addCc(new Cc($CC,""));
			}
			
		}
		if(isset($bcc) && !empty($bcc)){
			foreach ($bcc as $BCC) {
				$personalization->addBcc(new Bcc($BCC,""));
			}
			
		}

		$email->setFrom($from,$fromName);
		$email->setSubject($subject);
		$email->addPersonalization($personalization); // add personalization
		
		if (isset($attachment) && !empty($attachment)) {
			foreach ($attachment as $key => $value) {
				$file = $this->CI->config->item("mediaPATH") . $value['path'] . $value['fileName'];
				$fileType = $this->attType($value['fileName']);
				$file_encoded = base64_encode(file_get_contents($file));
				$email->addAttachment(
					$file_encoded,
					$fileType,
					$value['fileName'],
					"attachment"
				);
			}
		}
		//$email->addContent("text/html", "and easy to do anywhere, even with PHP");
		$email->addContent(
			"text/html",$msg
		);
		$sendgrid = new \SendGrid($this->companyInfo->sendgrid_API);
		try {
			$response = $sendgrid->send($email);
			if($response->statusCode() == "202"){
				return true;
			}else{
				$emailError['message'] = $response->body();
				$emailError['code'] = $response->statusCode();
				$this->CI->errorlogs->checkDBError($emailError,'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
				return false;
			}
		} catch (Exception $e) {
			// print_r('bdsjvbhjdbv');exit;
			return false;
			//echo 'Caught exception: '. $e->getMessage() ."\n";
		}
	}
	public function attType($fileName)
	{
		$fileType = explode('.',$fileName);
		switch ($fileType[1]) {
			case 'pdf':
					return 'application/pdf';
				break;
			case 'gif':
					return 'image/gif';
				break;
			case 'png':
					return 'image/png';
				break;
			case 'jpeg':
					return 'image/jpeg';
				break;
			case 'csv':
					return 'text/csv';
				break;
			case 'txt':
					return 'text/plain';
				break;
			
			default:
				break;
		}
	}
	public function sendMailDetailsBrevo($from,$fromName,$to,$cc,$bcc,$subject,$msg,$attachment){
		// print "<br>############################################ Email ########################################";
		// var_dump($to);
		// return true;
		// Configure API key authorization: api-key
		$config = Brevo\Client\Configuration::getDefaultConfiguration()->setApiKey('api-key',$this->companyInfo->brevo_API);
		// Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
		// $config = Brevo\Client\Configuration::getDefaultConfiguration()->setApiKeyPrefix('api-key', 'Bearer');
		// Configure API key authorization: partner-key
		//$config = Brevo\Client\Configuration::getDefaultConfiguration()->setApiKey('partner-key', 'YOUR_API_KEY');
		// Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
		// $config = Brevo\Client\Configuration::getDefaultConfiguration()->setApiKeyPrefix('partner-key', 'Bearer');

		$apiInstance = new Brevo\Client\Api\TransactionalEmailsApi(
			// If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
			// This is optional, `GuzzleHttp\Client` will be used as default.
			new GuzzleHttp\Client(),
			$config
		);
		//var_dump($to);exit;
		$configData = array(
			'subject' => $subject,
			'sender' => ['name' => $fromName, 'email' => $from],
			'replyTo' => ['name' => $this->appName, 'email' => $from],
			'htmlContent' => $msg,
		);

		
		$toBrevo = array();
		if(isset($to) && !empty($to)){
			if(is_array($to)){
				foreach ($to as $key => $value) {
					// code...
					$toBrevo[] = array("email"=>$value);
				}
				if(isset($toBrevo)&& !empty($toBrevo)){
					$configData['to'] =$toBrevo;
				}
			}else{
				$configData['to'][] = array("email"=>$to);
			}
			
		}
		//print_r($configData);exit;
		$ccBrevo = array();
		if(isset($cc) && !empty($cc)){
			if(is_array($cc)){
				foreach ($cc as $key => $value) {
					// code...
					$ccBrevo[] = array("email"=>$value);
				}
				if(isset($ccBrevo)&& !empty($ccBrevo)){
					$configData['cc'] =$ccBrevo;
				}
			}else{
				$configData['cc'][] = array("email"=>$cc);
			}
		}
		$bccBrevo = array();
		if(isset($bcc) && !empty($bcc)){
			if(is_array($bcc)){
				foreach ($bcc as $key => $value) {
					// code...
					$bccBrevo[] = array("email"=>$value);
				}
				if(isset($bccBrevo)&& !empty($bccBrevo)){
					$configData['bcc'] =$bccBrevo;
				}
			}else{
				$configData['bcc'][] = array("email"=>$bcc);
			}
		}

		$attachments = array();
		if (isset($attachment) && !empty($attachment) && is_array($attachment)) {
			foreach ($attachment as $key => $value) {
				$file = $this->CI->config->item("mediaPATH") . $value['path'] . $value['fileName'];
				$attachments[] = array(
					'name' => $value['fileName'],
					'content' => base64_encode(file_get_contents($file))
				);
			}
			if (!empty($attachments)) {
				$configData['attachment'] = $attachments;
			}
		}
		
		$sendSmtpEmail = new \Brevo\Client\Model\SendSmtpEmail($configData); // \Brevo\Client\Model\SendSmtpEmail | Values to send a transactional email

		try {
			$result = $apiInstance->sendTransacEmail($sendSmtpEmail);
			return true;
			print_r($result);
			
		} catch (Exception $e) {
			//return false;
			echo 'Exception when calling TransactionalEmailsApi->sendTransacEmail: ', $e->getMessage(), PHP_EOL;
		}
	}
}