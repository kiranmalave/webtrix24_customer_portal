<?php
defined('BASEPATH') or exit('No direct script access allowed');

class EmailSender extends CI_Controller
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
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("response");
		$this->load->library("ValidateData");
        if(!$this->config->item('development'))
		{
            $this->load->library("emails");	
        }
    }

    public function sendEmail()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        
        $emailDetails = array();
        $updateDate = date("Y/m/d H:i:s");
        $emailDetails['fromField'] = $this->input->post('fromField');
        $emailDetails['toFeild'] = $this->input->post('toField');
        if (!isset($emailDetails['toFeild'] ) || empty($emailDetails['toFeild'] )) {
            $status['msg'] = 'Recipient Required';
            $status['statusCode'] = 218;
            $status['data'] = array();
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }
        $emailDetails['cc'] = $this->input->post('cc');
        $emailDetails['bcc'] = $this->input->post('bcc');
        $emailDetails['subject'] = $this->validatedata->validate('subject', 'Subject', false, '', array());
        $emailDetails['mail_description'] = $this->validatedata->validate('mail_description', 'Mail Description', false, '', array());
        $emailDetails['attachement'] = json_decode($this->input->post('attachmentArray'),true);

        $logDetails = array();
        $logDetails['to_email'] = $emailDetails['toFeild'];
        $logDetails['subject'] = $emailDetails['subject'] ;
        $logDetails['body'] = $emailDetails['mail_description'] ;
        $logDetails['cc'] = $emailDetails['cc'];
        $logDetails['bcc'] = $emailDetails['bcc'] ;
        $logDetails['created_date'] = $updateDate;
        $logDetails['sender_id'] = $this->input->post('SadminID');
        $logDetails['type'] = 'email';
        $logDetails['for_event'] = 'general';
        $logDetails['created_date'] = $updateDate;
        if(!$this->config->item('development')){
            $mail = $this->emails->sendMailDetails($emailDetails['fromField'],"",$emailDetails['toFeild'],$emailDetails['cc'],$emailDetails['bcc'],$emailDetails['subject'],$emailDetails['mail_description'],$emailDetails['attachement'],'','');
        }else{
            $this->errorlogs->checkDBError(array('code'=>'296','message'=>'Application is in Developement Mode'),'Email Error', dirname(__FILE__), __LINE__, __METHOD__);
        }

        if($mail){
            $logDetails['status'] = "delivered";
        }else{
            $logDetails['status'] = "not_delivered";
        }
        if (gettype($logDetails["bcc"]) == "array") {
            $logDetails['bcc'] = implode(',', $logDetails['bcc']);
        }
        if (gettype($logDetails["cc"]) == "array") {
            $logDetails['cc'] = implode(',', $logDetails['cc']);
        }
        
        foreach ($emailDetails['toFeild'] as $key => $value) {
            $logDetails['to_email'] = $value;
            $where = array("email" => $value);
            $custID = $this->CommonModel->getMasterDetails('customer','customer_id',$where);
            if (isset($custID) && !empty($custID)) 
                $logDetails['to_id'] = $custID[0]->customer_id;
            else
                $logDetails['to_id'] = 0;
            $iscreated = $this->CommonModel->saveMasterDetails('email_logs', $logDetails);
        }
        if ($mail) {
            if(isset($emailDetails['attachement']) && !empty($emailDetails['attachement'])){
                if(is_array($emailDetails['attachement'])){
                    foreach ($emailDetails['attachement'] as $key => $value) {
                        $file = $this->config->item("mediaPATH").$value['path'].$value['fileName'];
                        if(file_exists($file))
                        {
                            $this->load->helper("file");
                            unlink($file);
                        }
                    }
                }
            }
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

    
    public function uploadAttachment() {
        $this->access->checkTokenKey();
		$this->response->decodeRequest(); 

        $uploadPath = $this->config->item("mediaPATH").'temp-attachment/';
       
        if (!is_dir($uploadPath)) {
			mkdir($uploadPath, 0777);
			chmod($uploadPath, 0777);
		} else {
			if (!is_writable($uploadPath)) {
				chmod($uploadPath, 0777);
			}
		}

        $config['upload_path']   = $uploadPath;
        $config['allowed_types'] = 'gif|jpg|png|pdf|sql';
        $config['max_size']      = 4194304; // Maximum file size in kilobytes
        $config['max_width']     = 1024;
        $config['max_height']    = 768;

        $this->load->library('upload', $config);
        if ( ! $this->upload->do_upload('fileInputValue')) {
            $status['msg'] = $this->systemmsg->getErrorCode(310).'<br>'.$this->upload->display_errors();
            $status['statusCode'] = 310;
            $status['data'] = array();
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }
        else {
            $data = array('upload_data' => $this->upload->data());
            $status['msg'] = $this->systemmsg->getSucessCode(426);
            $status['statusCode'] = 426;
            $status['data'] = array();
            $status['flag'] = 'S';
            $this->response->output($status, 200);
        }
    }

    public function removeAttachment($file='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 

		$filePath = $this->input->post('filePath');
		$file = $this->config->item("mediaPATH").$filePath.$file;
        
		if(file_exists($file))
		{
			$this->load->helper("file");
			unlink($file);
			if(!file_exists($file)){
                $status['msg'] = $this->systemmsg->getSucessCode(427);
                $status['statusCode'] = 427;
                $status['data'] = array();
                $status['flag'] = 'S';
                $this->response->output($status, 200);
            }else
            {
                $status['msg'] = $this->systemmsg->getErrorCode(312);
                $status['statusCode'] = 312;
                $status['data'] = array();
                $status['flag'] = 'F';
                $this->response->output($status, 200);
            }
		}else{
            $status['msg'] = $this->systemmsg->getErrorCode(311);
            $status['statusCode'] = 311;
            $status['data'] = array();
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }
	} 
}