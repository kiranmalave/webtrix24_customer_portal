<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Login extends CI_Controller {

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
	var $memberDetails;
	public function __construct(){
		parent::__construct();
		$this->load->model('LoginModel');
		$this->load->model('CommonModel');
	}
	public function index(){}

	public function verifyUser(){
		$this->response->decodeRequest();
		$username = $this->input->post('username');
		$password = $this->input->post('password');

		// EMPTY USERNAME || PASSWORD
		if(trim($username) =="" || trim($password) ==""){
			$this->outputErrorResponse(324);
		}	
		$this->memberDetails = $this->LoginModel->verifyUserDetails($username,$password);
		if(!isset($this->memberDetails) || empty($this->memberDetails)){
			$this->outputErrorResponse(325);			
		}
		if(isset($this->memberDetails[0]->roleID) && !empty($this->memberDetails[0]->roleID)){
			$whereRole = array("roleID" => $this->memberDetails[0]->roleID);
			$roleDetails = $this->CommonModel->getMasterDetails('user_role_master', '', $whereRole);
			if(isset($roleDetails) && empty($roleDetails)){
				$this->outputErrorResponse(274);			
			}
		}else{
			$this->outputErrorResponse(274);
		}
		// PROFILE NOT VERIFIED
		if($this->memberDetails[0]->isVerified == 'N'){
			$this->outputErrorResponse(314);
		}	
		// DEFAULT COMPANY NOT ASSINGNED
		$defaultCompany = $this->memberDetails[0]->default_company ?? null;
		if (empty($defaultCompany)) {
			$this->outputErrorResponse(294);
		}
		// GET DEFAULT COMPANY DETAILS
		$whereCompany = array("infoID" => $defaultCompany, "status" => "active");
		$companyDetails = $this->CommonModel->getMasterDetails('info_settings', '', $whereCompany);
		if(isset($companyDetails) && empty($companyDetails)){
			$status['msg'] = $this->systemmsg->getErrorCode(274);
			$status['statusCode'] = 274;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}

		if(isset($companyDetails[0]->date_format) && !empty($companyDetails[0]->date_format)){
			$this->memberDetails[0]->time_format = $companyDetails[0]->date_format;
		}
		$companyId = $this->memberDetails[0]->company_id ?? null;
		if (empty($companyId)) {
			$this->outputErrorResponse(315);
			return;
		}

		//conveted all password in md5 in DB no need to use this line
		// $md5val= md5($this->memberDetails[0]->password);

		$md5val=$this->memberDetails[0]->password;
		$res = substr($md5val,0,30);
		if(!isset($_SESSION['salt']) && empty($_SESSION['salt'])){
			$Bearer = $this->input->post('Bearer');
			$combine=$res.$Bearer;
		}else{
			if(!isset($_SESSION['salt']) || empty($_SESSION['salt'])){
				$status['msg'] = $this->systemmsg->getErrorCode(274);
				$status['statusCode'] = 274;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			$combine=$res.$_SESSION['salt'];
		}
      	
      	$shaval=sha1($combine);
      	$shaval_ss = substr($shaval,0,30);
	
      	if(!empty($this->memberDetails) && $password === $shaval_ss){
			$Candidatetatus = $this->checkStatus($this->memberDetails[0]->status);
			if($Candidatetatus){
				$roleDetails = $this->CommonModel->getMasterDetails('user_role_master','roleName , slug',array('roleID'=>$this->memberDetails[0]->roleID));
				if (isset($roleDetails[0]->roleName) && !empty($roleDetails[0]->roleName)) {
					$this->memberDetails[0]->userRole = $roleDetails[0]->roleName;
					$this->memberDetails[0]->slug = (isset($roleDetails[0]->slug) && !empty($roleDetails[0]->slug)) ? $roleDetails[0]->slug : '' ;
				}
				$this->setSession($this->memberDetails[0]);
				$nowdate = date("Y/m/d H:i:s");
				$datasave = array("lastLogin"=>$nowdate,"gfcmToken"=>$this->input->post('gfcmToken'));
				$this->LoginModel->saveadminInfo($datasave,$this->memberDetails[0]->adminID);
				$this->LoginModel->setSessionKey($this->memberDetails[0]->adminID);
				$keyecp = md5(session_id().$this->memberDetails[0]->adminID);
				$status['msg'] = $this->systemmsg->getSucessCode(410);
				$status['statusCode'] = 410;
				$status['keyDetails'] = session_id();
				$status['loginkey'] = $keyecp;
				$status['data'] = $this->memberDetails[0];
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}else{
			$this->outputErrorResponse(210);
		}
	}
	public function getsalt($userDetails=''){
		$salt = uniqid(mt_rand(), true);
		$_SESSION['salt'] = $salt;
		$status['msg'] = "sucess";
		$status['statusCode'] = 200;
		$status['data'] = array("salt"=>$salt);
		$status['flag'] = 'S';
		$this->response->output($status,200);
	}
	private function setSession($userDetails=''){
		$this->session->set_userdata("adminID",$userDetails->adminID);
		$this->session->set_userdata("name",$userDetails->name);
		$this->session->set_userdata("email",$userDetails->email);
	}

	public function logout(){
		$this->response->decodeRequest();
		$adminID = $this->input->post('adminID');
		$key = $this->input->post('key');
		$this->LoginModel->unsetSessionKey($adminID);
		//$this->LoginModel->setMemberOnlineStatus($adminID,'no');
		$this->session->unset_userdata("firstName");
		$this->session->unset_userdata("lastName");
		$this->session->unset_userdata("email");
		$status['msg'] = $this->systemmsg->getSucessCode(411);
		$status['statusCode'] = 411;
		$status['data'] = array();
		$status['flag'] = 'S';
		$this->response->output($status,200);	
	}

	public function resetPassword(){
		$this->load->library("emails");
		$this->response->decodeRequest();
		$userNameEmail = $this->input->post('txt__userNameEmail');
		$checkEmail = strpos($userNameEmail,"@");
		if($checkEmail){
			$where = array("email"=>addslashes($userNameEmail));
			$CandidateDetails = $this->CandidateModel->getCandidateDetailsByParameter("adminID,userName,firstName,lastName,email",$where);
			if(isset($CandidateDetails[0]->adminID) && !empty($CandidateDetails[0]->adminID)){
				$this->emails->sendForgotPasswordEmail($CandidateDetails);
			}
			else{
				$this->outputErrorResponse(215);
			}

		}
		elseif(!empty($userNameEmail) && isset($userNameEmail)){
			$where = array("userName"=>addslashes($userNameEmail));
			$CandidateDetails = $this->CandidateModel->getCandidateDetailsByParameter("adminID,userName,firstName,lastName,email",$where);
			if(isset($CandidateDetails[0]->adminID) && !empty($CandidateDetails[0]->adminID)){
				$this->emails->sendForgotPasswordEmail($CandidateDetails[0]);
			}
			else{
				$this->outputErrorResponse(215);
			}
		}
	}
	public function checkStatus($status=""){
		$resDetails = array();
		switch ($status){
			case 'inactive':{	
				$this->outputErrorResponse(211);
				break;
			}
			case 'delete':{
				$this->outputErrorResponse(214);
				break;
			}
			default:{
				return true;
				break;
			}
		}
	}
	public function outputErrorResponse($errorCode='',$status = array()) {
		if (isset($errorCode) && !empty($errorCode)) {
			$status['msg'] = $this->systemmsg->getErrorCode($errorCode);
			$status['statusCode'] = $errorCode;
			$status['data'] = array();
			$status['flag'] = 'F';
		}
		$this->response->output($status, 200);
	}
	public function outputSuccessResponse($sucessCode,$status = array()) {
		$status['msg'] = $this->systemmsg->getSucessCode($sucessCode);
		$status['statusCode'] = $sucessCode;
		$status['data'] = array();
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}

}
