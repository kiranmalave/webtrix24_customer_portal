<?php
defined('BASEPATH') OR exit('No direct script access allowed');
	
	class Sms
	{
		var $live_url="";
		var $appName="";
		var $logoPath="";
		var $appLink="";

		public function __construct(){
		
			//parent::__construct();
			$this->CI = &get_instance();
			$this->CI->load->helper('url');
			$this->live_url = $this->CI->config->item('live_base_url');
			$this->appName = $this->CI->config->item('appName');
			$this->appLink = $this->CI->config->item('app_url');
			$this->logoPath = $this->CI->config->item('app_url')."/images/"."Ankur_Logo.jpg";
		}

		public function sendSms($destination='',$message='')
		{
			//echo  "here";exit;
			$uname="20201060";
			$pass="dms%40ankur567";
			$send="ANKRPR"; 
			$dest=$destination;
			$msg=$message;
			$base_url = "http://164.52.195.161/API/SendMsg.aspx?";

			// $donorName="Akshay";
			// $msg="Dear {#var#}, 
			// Thank you for your support.
			// Ankur Pratishthan acknowledges your donation %26 will issue a receipt of the same after realization.";
			// $msg = str_replace("{#var#}",$donorName,$msg);

			$url="uname=".$uname."&pass=".$pass."&send=".$send."&dest=".$dest."&msg=".$msg;
			$url = str_replace(" ", '%20', $url);
			$ch = curl_init();
			//$final_url = $base_url . curl_escape($ch, $url);
			//print $final_url;
			$final_url = $base_url.$url;
			$curlConfig = array(
			    CURLOPT_URL            => $final_url,
			    CURLOPT_POST           => false,
			    CURLOPT_RETURNTRANSFER => true,
			);
			curl_setopt_array($ch, $curlConfig);
			$result = curl_exec($ch);
			$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

			print_r($result);
			var_dump($httpcode);
			curl_close($ch);


		}

	}
	