<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Google extends CI_Controller
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
		//$this->load->library("response");
		$this->load->library("GoogleCalenderApi");
	}

	public function getGoogleAccessResponse(){
       
        if(isset($_GET['code'])) {
            
                $whereap = array('adminID' => 1);
                $tokenDetails = $this->CommonModel->getMasterDetails("admin","g_cal_token",array("adminID"=>1));
                if(!isset($tokenDetails[0]->g_cal_token) || empty($tokenDetails[0]->g_cal_token)){
                    $tokenData = array();
                    $tokenData['user_code'] =  $_GET['code'];
                }else{
                    $tokenData = json_decode($tokenDetails[0]->g_cal_token);
                    $tokenData->user_code =  $_GET['code'];
                }
                $userData = array("g_cal_token"=>json_encode($tokenData));
                $iscreated = $this->CommonModel->updateMasterDetails('admin', $userData, $whereap);	
                if(!$iscreated){
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
                    print_r($status);
					//$this->response->output($status, 200);
                }else{
                	// register for watch
                	$this->googlecalenderapi->watchCalender();

                    $status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					//$this->response->output($status, 200);
                }
                print_r($status);
            
        }

    }

	public function watchCalenderEvent()
	{
		
	// Read the incoming webhook data
	$requestPayload = file_get_contents("php://input");
	//$decodedPayload = json_decode($requestPayload, true);

	// Handle the data as needed (update your logic here)
	//if ($decodedPayload) {
		// Do something with the decoded payload
	//$ss = print_r(getallheaders2());
		file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook_log.txt', "no data -> ".print_r($_POST,true), FILE_APPEND);
	// } else {
	// 	// Handle error or log it
	// 	file_put_contents($_SERVER['DOCUMENT_ROOT'].'/webhook_log.txt', "Error decoding payload", FILE_APPEND);
	// }

	http_response_code(200); // Respond to Google Calendar with a 200 status code

		// file_put_contents('webhook.log', file_get_contents('php://input') . PHP_EOL, FILE_APPEND);

		echo 'Webhook notification received successfully';
		// print_r($_POST);
	}
	public function stop(){
		$this->googlecalenderapi->stopNotification();
	}
	
	
}