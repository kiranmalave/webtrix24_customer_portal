<?php
defined('BASEPATH') or exit('No direct script access allowed');

class RegisterUser extends CI_Controller
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
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	private $api_token = '4YIIZ1jTkVwyboesGhDTbNVfc_3U24M7Vn6tHXBt';  // Replace with your Cloudflare API Token
	private $zone_id = '34770c11525b869106ee899822ea7f72';
	private $default_chars = 'abcdefghijklmnopqrstuvwxyz0123456789';  
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("emails");
		$this->load->library("Datatables");
		$this->en_key = "f4a2f7b1c4e8a2d3b15d8d0292c0d47ews";
		$this->load->library('encryption');
		  // Replace with your Cloudflare Zone ID
	}
	// $route['checkVerifyDetails'] = 'systems/RegisterUser/checkVerifyDetails';
	// $route['resendVerifyDetails'] = 'systems/RegisterUser/resendVerifyDetails';
	public function checkVerifyDetails(){
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$customerDetails = array();
		$user = $this->validatedata->validate('vcode', 'Unauthorized Access Attempt Detected', true, '', array());
		$userID = $this->decodeNumber($user,$this->en_key);
		$customer_id =  explode("_",$userID);
		$where = array("customer_id" => $customer_id[1]);
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){
			if($customerDetails[0]->email_verification_status == 'y' && $customerDetails[0]->mobile_verification_status == 'y'){
				if($customerDetails[0]->database_name){
					$status['setup'] = "done";	
				}else{
					$status['setup'] = "pending";	
				}
				$status['customer_id'] = $this->encodeNumber("ws_".$customer_id[1],$this->en_key);//$customer_id[1];
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] = array();
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else{
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(304);
			$status['statusCode'] = 304;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function resendVerifyDetails(){
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$customerDetails = array();
		$user = $this->validatedata->validate('vcode', 'Unauthorized Access Attempt Detected', true, '', array());
		$userID = $this->decodeNumber($user,$this->en_key);
		$customer_id =  explode("_",$userID);
		$where = array("customer_id" => $customer_id[1]);
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){
			$emailBody = "<p>Dear ".$customerDetails[0]->name.",</p>
			<p>I hope this email finds you well.<br>As requested, we are resending your verification code to ensure you can proceed without any issues. Please find the details below:</p>
			<p>Email OTP:".$customerDetails[0]->email_code."</p>
			<p>If you have any questions or need assistance, feel free to reach out to our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a>.</p>
			<p>Best regards,</p>
			<p>The Webtrix24 Team</p>";
			$to = $customerDetails[0]->email;
			$subject ="Resending Your Verification Code";
			$msg = $emailBody;
			if(!$this->config->item('development')){
				$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $to, $cc = '', $bcc = '', $subject, $msg);
			}
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] = array();
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(304);
			$status['statusCode'] = 304;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function register($id = '')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$customerDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT") {
			$customerDetails['name'] = $this->validatedata->validate('name', 'name', true, '', array());
			$cCode = $this->validatedata->validate('countryCode', 'countryCode', true, '', array());
			$number = $this->validatedata->validate('phone', 'phone', true, '', array());
			$customerDetails['mobile_no'] = $cCode."-".$number;
			$customerDetails['email'] = $this->validatedata->validate('email', 'Email', true, '', array());
			$getFaname = explode(" ",$customerDetails['name']);
			$customerDetails['userName'] = strtolower($getFaname[0]);
			$customerDetails['status'] = "active";//$this->validatedata->validate('status', 'status', false, '', array());
			$customerDetails['email_code'] = mt_rand(100000, 999999);
			$customerDetails['mobile_code'] = mt_rand(100000, 999999);
			// $customerDetails['sub_domain_name'] = $this->validatedata->validate('status', 'status', false, '', array());
			// $customerDetails['database_name'] = $this->validatedata->validate('status', 'status', false, '', array());
			
			if ($method == "PUT") {
				$iscreated = $this->CommonModel->saveMasterDetails('customer', $customerDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					//<p>Email code:".$encNumber."</p>
					$customer_id = $this->db->insert_id();
					$account_id = "WS-".str_pad($customer_id, 4, "0", STR_PAD_LEFT);
					$accountDetails['account_id'] = $account_id;
					$iscreated = $this->CommonModel->updateMasterDetails('customer', $accountDetails,array("customer_id"=>$customer_id));
					$encNumber = $this->encodeNumber("ws_".$customer_id,$this->en_key);
					$baseURL = $this->config->item("app_url")."#register?&vfcode=".$encNumber;
					$emailBody = "<p>Dear ".$customerDetails['name'].",</p>
							<p>Welcome to Webtrix24.com!</p>
							<p>Thank you for registering with us. We are excited to have you on board. To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
							<p><a href='".$baseURL."'>Verify Your Account using below code</a></p>
							<p>Account ID:".$account_id."</p>
							<p>User Name:".$customerDetails['userName']."</p>
							<p>Email OTP:".$customerDetails['email_code']."</p>
							<p>If you didn’t create an account with us, please ignore this email.</p>
							<p>If you have any questions or need assistance, feel free to reach out to our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a>.</p>
							<p>Best regards,</p>
							<p>The Webtrix24 Team</p>";
							$to = $customerDetails['email'];
							$subject ="Welcome to Webtrix24! Please Verify Your Account";
							$msg = $emailBody;
							if(!$this->config->item('development')){
								$issend =  $this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $to, $cc = '', $bcc = '', $subject, $msg);
							}else{
								$issend = true;
							}
							if($issend){
								$status['customer_id'] = $encNumber;
								$status['msg'] = $this->systemmsg->getSucessCode(400);
								$status['statusCode'] = 400;
								$status['data'] = array();
								$status['flag'] = 'S';
								$this->response->output($status, 200);
							}else{
								$status['msg'] = $this->systemmsg->getErrorCode(998);
								$status['statusCode'] = 998;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status, 200);
							}
				}
			}
		}
	}
	public function verifyDetails(){
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$customerDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		$emailOTP = $this->validatedata->validate('emailOTP', 'Email OTP', true, '', array());
		$mobileOTP = $this->validatedata->validate('mobileOTP', 'Mobile OTP', true, '', array());
		$user = $this->validatedata->validate('vcode', 'Unauthorized Access Attempt Detected', true, '', array());
		$password = $this->validatedata->validate('txt_password', 'Password', true, '', array());
		$userID = $this->decodeNumber($user,$this->en_key);
		// print "<pre>";
		// print_r($userID);
		// $encNumber = $this->encodeNumber("ws_10",$this->en_key);
		// print $encNumber;
		$customer_id =  explode("_",$userID);
		$where = array("customer_id" => $customer_id[1]);
		$where["email_code"] = $emailOTP;
		$where["mobile_code"] = $mobileOTP;
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){
			$accountDetails['email_verification_status'] = "y";
			$accountDetails['mobile_verification_status'] = "y";
			$accountDetails['password'] = md5($password);
			$iscreated = $this->CommonModel->updateMasterDetails('customer', $accountDetails, $where);
			if($iscreated){
				$baseURL = $this->config->item("app_url")."#register?&vfcode=".$this->encodeNumber("ws_".$customer_id[1],$this->en_key);
				$emailBody = "<p>Dear ".$customerDetails[0]->name.",</p>
						<p>Congratulations! Your email has been successfully verified, and your account is now active.</p>
						<p>We’re excited to have you as part of the Webtrix24 community. You can now log in and start exploring all the features we offer.</p>
						<p><a href='".$baseURL = $this->config->item("app_url")."#login"."'>Login in to your account</a></p>
						<p>If you have any questions or need assistance, feel free to reach out to our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a>.</p>
						<p>Best regards,</p>
						<p>The Webtrix24 Team</p>";
						$to = $customerDetails[0]->email;
						$subject ="Welcome to Webtrix24! Your Account is Verified";
						$msg = $emailBody;
						if(!$this->config->item('development')){
							$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $to, $cc = '', $bcc = '', $subject, $msg);
						}
				$status['customer_id'] = $this->encodeNumber("ws_".$customer_id[1],$this->en_key);//$customer_id[1];
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] = array();
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else{
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['msg'] = $this->systemmsg->getErrorCode(304);
			$status['statusCode'] = 304;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		
	}
	
	public function encodeNumber($number, $encryption_key) {
		$cipher = 'AES-128-CTR';
		$options = 0;
		$iv = random_bytes(openssl_cipher_iv_length($cipher)); // Generate a random IV
	
		// Encrypt the number
		$encodedNumber = openssl_encrypt($number, $cipher, $encryption_key, $options, $iv);
		
		// Combine the IV with the encoded data for storage or transmission
		return base64_encode($iv . $encodedNumber);
	}
	public function companySetup(){
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		//sleep for 3 seconds
		// sleep(3);
		// $status['customer_id'] = '1111';
		// $status['data'] = array("pass"=>"111","uname"=>'1111');
		// $status['msg'] = $this->systemmsg->getSucessCode(400);
		// $status['statusCode'] = 400;
		// $status['flag'] = 'S';
		// $status['account_name'] = "artwork";
		// $this->response->output($status, 200);exit;
		$customerDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		$otherDetails = array();
		$otherDetails['company_name'] = $this->validatedata->validate('comapnyName', 'Company Name', true, '', array());
		$otherDetails['gst_no'] = $this->validatedata->validate('gst', 'Mobile OTP', false, '', array());
		$otherDetails['website'] = $this->validatedata->validate('website', 'Website', false, '', array());
		$otherDetails['company_size']= $this->validatedata->validate('company_size', 'Company Size', false, '', array());
		$otherDetails['lead_source'] = $this->validatedata->validate('source', 'Source', false, '', array());
		$otherDetails['business_type'] = $this->validatedata->validate('business_type', 'Business Type', false, '', array());

		$otherDetails['customer_image'] = $this->validatedata->validate('companyLogo', 'Logo', false, '', array());
		$user_id = $this->validatedata->validate('vcode', 'User', true, '', array());
		$this->db->trans_start();
		$userID = $this->decodeNumber($user_id,$this->en_key);
		$customer_id =  explode("_",$userID);
		$where = array("customer_id" => $customer_id[1]);
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){
			// 1. create subdoamin
			$subdoamin = $this->create_subdomain($otherDetails['company_name']);
			$otherDetails['sub_domain_name'] = $subdoamin;
			$otherDetails['database_name'] = "webtrix24_customers_".$subdoamin;
			// create database table here
			$iscreatedDB = $this->datatables->createDatabase($otherDetails['database_name']);
			if(!$iscreatedDB){
				$this->db->trans_rollback();
				$status['msg'] = $this->systemmsg->getErrorCode(304);
				$status['statusCode'] = 304;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}else{
				// give permission to them
				$username = str_replace('-','_',$otherDetails['database_name']);
				$username = str_replace('webtrix24_customers_','',$username);
				$otherDetails['dbUserName'] = $username;
				$otherDetails['dbpassword'] = $this->generateDbPassword(10);
				$grantAccess = $this->datatables->create_user_and_grant_privileges($otherDetails['database_name'],$username,$otherDetails['dbpassword']);
				if(!$grantAccess){
					$this->db->trans_rollback();
					$status['msg'] = $this->systemmsg->getErrorCode(304);
					$status['statusCode'] = 304;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				// do database tables setup
				$setupDB = $this->datatables->copy_database("webtrix24_setup",$otherDetails,$customerDetails);
				
				if(!$setupDB){
					$this->db->trans_rollback();
					$status['msg'] = $this->systemmsg->getErrorCode(304);
					$status['statusCode'] = 304;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}
			$otherDetails['database_name'] = str_replace('webtrix24_customers_','',$otherDetails['database_name']);
			$otherDetails['account_setup'] = "y";
			
			$iscreated = $this->CommonModel->updateMasterDetails('customer', $otherDetails, $where);
			if($iscreated){
				// Now setup it's database and Cname record so user can access the subdoamins
				
				// 2. create A Record
				$Arecord = $this->create_cname_record($otherDetails['sub_domain_name']);
				//$baseURL = $this->config->item("app_url")."#register?&vfcode=".$this->encodeNumber("ws_".$customer_id,$this->en_key);
				// $emailBody = "<p>Dear ".$customerDetails['name'].",</p>
				// 		<p>Congratulations! Your email has been successfully verified, and your account is now active.</p>
				// 		<p>We’re excited to have you as part of the Webtrix24 community. You can now log in and start exploring all the features we offer.</p>
				// 		<p><a href='".$baseURL = $this->config->item("app_url")."#login"."'>Login in to your account</a></p>
				// 		<p>If you have any questions or need assistance, feel free to reach out to our support team at <a href='mailto:support@webtrixsolutions.com'>support@webtrixsolutions.com</a>.</p>
				// 		<p>Best regards,</p>
				// 		<p>The Webtrix24 Team</p>";
				// 		$to = $customerDetails['email'];
				// 		$subject ="Welcome to Webtrix24! Your Account is Verified";
				// 		$msg = $emailBody;
				// 		if(!$this->config->item('development')){
				// 			$this->emails->sendMailDetails("test@webtrix24.com", "Webtrix24", $to, $cc = '', $bcc = '', $subject, $msg);
				// 		}
				$this->db->trans_commit();
				$userPDetails = array();
				$userPDetails['username'] = $customerDetails[0]->userName;
				$userPDetails['password'] = $customerDetails[0]->password;
				$userPDetails['timestamp'] =time();
				// Encrypt payload
				$encrypted_data = $this->encryption->encrypt(json_encode($userPDetails));
			
				$status['customer_id'] = $customer_id[1];
				$status['account_name'] = $otherDetails['sub_domain_name'];
				$status['loadfrom'] = "account";
				$status['data'] = array();
				$status['token'] = base64_encode($encrypted_data);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}else{
				$this->db->trans_rollback();
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$this->db->trans_rollback();
			$status['msg'] = $this->systemmsg->getErrorCode(304);
			$status['statusCode'] = 304;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	
	public function decodeNumber($encodedNumberWithIV, $encryption_key) {
		$cipher = 'AES-128-CTR';
		$options = 0;
	
		// Decode the base64 encoded data
		$decodedData = base64_decode($encodedNumberWithIV);
		$iv_length = openssl_cipher_iv_length($cipher);
	
		// Extract the IV and the encrypted data
		$iv = substr($decodedData, 0, $iv_length);
		$encodedDataOnly = substr($decodedData, $iv_length);
	
		// Decrypt the data
		return openssl_decrypt($encodedDataOnly, $cipher, $encryption_key, $options, $iv);
	}
	public function create_cname_record($name) {
        // Prepare CNAME record details
        $cname_data = array(
            'type' => 'A',
            'name' => $name,           // The subdomain for CNAME (e.g., www.example.com)
            'content' => '184.168.127.218',  // The target of the CNAME (e.g., example.com)
            'ttl' => 3600,              // Time-to-live in seconds
            'proxied' => true         // Set to true if you want Cloudflare proxying the traffic
        );

        // Initialize cURL session
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudflare.com/client/v4/zones/{$this->zone_id}/dns_records");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Authorization: Bearer {$this->api_token}",
            "Content-Type: application/json"
        ));
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cname_data));

        // Execute the cURL request and get the response
        $response = curl_exec($ch);
        curl_close($ch);

        // Decode JSON response
        $result = json_decode($response, true);

        if (isset($result['success']) && $result['success']) {
            return true;
			// Success - Output result
            // echo "CNAME Record Created Successfully!";
            // print_r($result['result']);
        } else {
            // Error - Output error message
            // echo "Error creating CNAME record: ";
            // print_r($result['errors']);
			return false;
        }
    }
	public function create_subdomain($company_name) {
        // Step 1: Clean the company name to remove unwanted characters
        $cleaned_name = $this->sanitize_company_name($company_name);
        // Step 2: Shorten the name if necessary
        $shortened_name = $this->shorten_company_name($cleaned_name);
        // Step 3: Ensure the name is valid for a subdomain
        $subdomain = $this->validate_subdomain($shortened_name);
        
        // Step 4: If invalid, generate a fallback subdomain with random characters and a number
        if (!$this->is_valid_subdomain($subdomain)) {
            
        }
		while(!$this->validateDomain($subdomain)){
				$subdomain = $this->generate_fallback_subdomain();
		}
		return $subdomain;
    }
	private function validateDomain($subdomain){
		$where = array();
		$where["sub_domain_name"] = $subdomain;
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){
			return false;
		}else{
			return true;
			}
	}
	  // Check if the subdomain is valid
	private function is_valid_subdomain($subdomain) {
        // Subdomains must be between 1 and 63 characters and match the valid pattern
        return (strlen($subdomain) > 0 && strlen($subdomain) <= 63 && preg_match('/^[a-z0-9\-]+$/', $subdomain));
    }

    // Sanitize the company name (remove special characters, spaces)
    private function sanitize_company_name($company_name) {
        // Convert to lowercase
        $company_name = strtolower(trim($company_name));
        
        // Replace spaces with hyphens
        $company_name = str_replace(' ', '-', $company_name);
        
        // Remove any special characters (only keep letters, numbers, and hyphens)
        $company_name = preg_replace('/[^a-z0-9\-]/', '', $company_name);
        
        return $company_name;
    }

    // Shorten the name if it's too long (ensure it's within subdomain length limit)
    private function shorten_company_name($company_name) {
        // Define the max length for subdomains (usually 63 characters max)
        $max_length = 20;
        
        // Shorten the company name to the desired length
        if (strlen($company_name) > $max_length) {
            // If name is too long, use the first 20 characters and append an abbreviation or initials
            $company_name = substr($company_name, 0, $max_length);
        }
        
        return $company_name;
    }

	private function validate_subdomain($subdomain) {
        if (empty($subdomain) || !preg_match('/^[a-z0-9\-]+$/', $subdomain)) {
            return false;  // Invalid subdomain
        }
        return $subdomain;  // Valid subdomain
    }
	// Generate a fallback subdomain with random characters and a number
    private function generate_fallback_subdomain() {
        // Generate a random string (6 characters) from the predefined characters
        $random_string = '';
        for ($i = 0; $i < 6; $i++) {
            $random_string .= $this->default_chars[random_int(0, strlen($this->default_chars) - 1)];
        }

        // Append a random number to ensure uniqueness
        $random_number = random_int(1000, 9999);

        return $random_string . $random_number;  // Final fallback subdomain
    }
	function generateDbPassword($length = 16) {
		// Define a pool of characters for the password
		$characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
		$password = '';
		
		// Use a secure random generator to pick characters
		$maxIndex = strlen($characters) - 1;
		for ($i = 0; $i < $length; $i++) {
			$password .= $characters[random_int(0, $maxIndex)];
		}
	
		return $password;
	}
	public function companyLogo($customer_id)
	{
		$customer_id = str_replace(['-', '_'], ['+', '/'], $customer_id);
		$customer_id = base64_decode($customer_id);
		//print $customer_id;exit;
		$userID = $this->decodeNumber($customer_id,$this->en_key);
		$extraData = array();
		$mediapatharr = $this->config->item("client_upload").$userID."/";
		if (!is_dir($mediapatharr)) {
			// The directory doesn't exist, so create it
			if (mkdir($mediapatharr, 0777, true)) {
				// echo "Directory created successfully: $mediapatharr";
			} else {
				$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
		$customer_id =  explode("_",$userID);
		$extraData["customer_id"] = $customer_id[1];
		$this->load->library('realtimeupload');
		if(!is_dir($mediapatharr)){
			mkdir($mediapatharr, 0777);
			chmod($mediapatharr, 0777);
		}else{
			if (!is_writable($mediapatharr)) {
				chmod($mediapatharr, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png','jpg', 'jpeg'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>false,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'customer',
			'fileTypeColumn' => 'customer_image',
			'fileColumn' => 'customer_image',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'isUpdate'=>"Y",
			'primaryKey' => 'customer_id',
			'primaryValue' => $customer_id[1],
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}
	public function checkAccount(){
		$this->response->decodeRequest();
		$key = $this->config->item('encryption_key'); // Retrieve the key from config
		$this->encryption->initialize(['driver' => 'openssl', 'key' => $key]);
		$where = array();
		$where["account_id"] = $this->input->post('account_id');
		$customerDetails = $this->CommonModel->getMasterDetails('customer','',$where);
		if(isset($customerDetails) && !empty($customerDetails)){

			$otherDetails = array();
			$otherDetails['username'] = $this->validatedata->validate('username', 'User Name', true, '', array());
			$otherDetails['password'] = $this->validatedata->validate('password', 'Password', true, '', array());
			$otherDetails['timestamp'] = time();
			$encrypted_data = $this->encryption->encrypt(json_encode($otherDetails));
			
			$status['account_name'] = $customerDetails[0]->sub_domain_name;
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['loadfrom'] = "login";
			$status['data'] = array();
			$status['token'] = base64_encode($encrypted_data);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);

		}else{
			
			$status['msg'] = $this->systemmsg->getErrorCode(992);
			$status['statusCode'] = 992;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function checklocal(){
		$toekn1 = "M2Y5Mzc2M2VmMDlmY2M1ZjcwM2I2MjgwOWJkMGFjNzU4MzY5NjE2NDY3ODZiNzA4MzkyYWJmMTBjMDk5YWM2YmU5YWUxZTc1N2RjMTc3MDE0NmVlODQ4MzdkMWJjODYzZTc3MDk3NmI5YjRjNDE3OTQwMjEyZjY4ZDM0N2E4ZWZYSzJjTFozdnB6MFR5eERZZjhDelNMbWNoVm14NC9RbGhRbG9aaGJ5V2dBWHdxMitTUDU1TERFQnp1azMza1A0Y1hYWlZjU0FQWlkwZStUTlFsajM3RmdZeWVGVnkzdFRHU3RnWmlqSjM5cEM5UWNsNm93MWRmemc5YjB1T05ZelZlZTZncGpHTFF5SDF4UzNyOExuc2c9PQ==";
		$token = base64_decode($toekn1);
		
		$key = $this->config->item('encryption_key'); // Retrieve the key from config
		$this->encryption->initialize(['driver' => 'openssl', 'key' => $key]);
		// Decode and decrypt the token
		$decrypted_data = $this->encryption->decrypt($token);

		print_r($decrypted_data);
	}
}