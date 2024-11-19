<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class SendEmail extends CI_Controller {

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
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
        $this->load->library("Emails");
		$this->load->library("ValidateData");

        $where = array("infoID"=>2);
        $infoData = $this->CommonModel->getMasterDetails('info_settings','',$where);
        $this->fromEmail=$infoData[0]->fromEmail;
        $this->fromName=$infoData[0]->fromName;
	}

	public function sendEmail()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$userGroup = $this->input->post("userGroup");
		$emailIds = $this->input->post("emails");
		$subject = $this->input->post("subject");
		$mediterText = $this->input->post("mediterText");

		if(empty($subject))
		{
			$status['msg'] = "subject Required";
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
						
		}

		if(empty($mediterText))
		{
			$status['msg'] = "Message Required";
			$status['statusCode'] = 998;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
						
		}

		if($emailIds!="")
		{

			$emailIdsArr=explode(",",$emailIds);

			foreach ($emailIdsArr as $key => $value) {
				// echo $value;
				$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$value,$cc='',$bcc='',$subject,$mediterText,'','','','');
				$log['emailID'] = $value;
				$log['lastSent'] = date("Y-m-d");
				$log['userGroup'] = "single";
				$log['subject'] = $subject;
				$log['message'] = $mediterText;
				$log['createdBy'] = $this->input->post('SadminID');
				if(!$isEmailSend)
				{
					$log['reason'] = "Email Function Issue";
					$log['status'] = "fail";

				}else
				{
					$log['reason'] = "sent";
					$log['status'] = "sent";
				}
			}

		}elseif($userGroup!="")
		{
			if($userGroup=="allPOC"){
				$join=array();
				$join[0]['type'] ="LEFT JOIN";
				$join[0]['table']="admin";
				$join[0]['alias'] ="a";
				$join[0]['key1'] ="adminID";
				$join[0]['key2'] ="adminID";
				$selectC="a.email as emailID";
				$wherec=array("roleOfUser ="=>"102","t.status="=>"'active'");
				$userEmails = $this->CommonModel->GetMasterListDetails($selectC,'user_extra_details',$wherec,'','',$join,$other=array());
			}elseif($userGroup=="allFriendsOfAnkur"){
				$selectC="emailID";
				$wherec=array("status"=>"active");
				$userEmails = $this->CommonModel->getMasterDetails('donorRegistration',$selectC,$wherec);
					
			}elseif($userGroup=="allCelebraters"){
				$selectC="emailID";
				$wherec=array("status"=>"active");
				$userEmails = $this->CommonModel->getMasterDetails('celebrateWithUs',$selectC,$wherec);

			}else
			{
				// echo $userGroup;exit();
				$selectC="emailID";
				$wherec=array("status"=>"active","category"=>$userGroup);

				$userEmails = $this->CommonModel->getMasterDetails('donorRegistration',$selectC,$wherec);
			}

			if(!empty($userEmails))
			{
				foreach ($userEmails as $key => $value) {
					$isEmailSend=$this->emails->sendMailDetails($this->fromEmail,$this->fromName,$value->emailID,$cc='',$bcc='',$subject,$mediterText,'','','','');

					$log['emailID'] = $value->emailID;
					$log['lastSent'] = date("Y-m-d");
					$log['userGroup'] = $userGroup;
					$log['subject'] = $subject;
					$log['message'] = $mediterText;
					$log['createdBy'] = $this->input->post('SadminID');
					if(!$isEmailSend)
					{
						$log['reason'] = "Email Function Issue";
						$log['status'] = "fail";

					}else
					{
						$log['reason'] = "sent";
						$log['status'] = "sent";
					}
					$iscreated = $this->CommonModel->saveMasterDetails('mailPushServiceLog',$log);

				}
				

				
			} 
			

		}

	}
}