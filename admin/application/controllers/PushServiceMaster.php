<?php
defined('BASEPATH') or exit('No direct script access allowed');

class PushServiceMaster extends CI_Controller
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
	 * So any other public methods not contacted with an underscore will
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
		$this->load->library("ValidateData");
	}


	public function getpushServiceDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('push_service_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$startDate = $this->input->post('fromDate');
		$endDate = $this->input->post('toDate');
		$type = $this->input->post('type');
		
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "push_service_id";
			$order = "ASC";
		}

		
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();

		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){			
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($type) || !empty($type)){
			$wherec["type ="] = "'".$type."'";

		}

		$adminID = $this->input->post('SadminID');

		$config["base_url"] = base_url() . "pushServiceDetails";

		$config["total_rows"] = $this->CommonModel->getCountByParameter('push_service_id', 'push_services', $wherec, $other);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		if ($isAll == "Y") {
			$join = array();

			$pushServiceDetails = $this->CommonModel->GetMasterListDetails($selectC='*','push_services',$wherec,'','',$join,$other);	
		}else{
			$selectC = "*";
			$pushServiceDetails = $this->CommonModel->GetMasterListDetails($selectC = '*','push_services', $wherec, $config["per_page"], $page, $join, $other);
		}
		// print_r($pushServiceDetails);exit;
		$status['data'] = $pushServiceDetails;

		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}

		if ($pushServiceDetails) {

			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function pushServiceMaster($push_service_id = "")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {

			$pushServiceDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$pushServiceDetails['push_service_id'] = $this->validatedata->validate('push_service_id', 'push_service_id', false, '', array());

			$pushServiceDetails['pushService_number'] = $this->validatedata->validate('pushService_number', 'pushService Number', false, '', array());

			$pushServiceDetails['customer_id'] = $this->validatedata->validate('customer_id', 'Customer', false, '', array());

			$pushServiceDetails['name'] = $this->validatedata->validate('name', 'Name', false, '', array());

			$pushServiceDetails['contact_number'] = $this->validatedata->validate('contact_number', 'Contact Number', false, '', array());

			$pushServiceDetails['email_id'] = $this->validatedata->validate('email_id', 'Email', false, '', array());

			$pushServiceDetails['payment_method'] = $this->validatedata->validate('payment_method', 'Payment Method', false, '', array());

			$pushServiceDetails['type_of_donation'] = $this->validatedata->validate('type_of_donation', 'Type Of Donation', false, '', array());

			$pushServiceDetails['donation_amount'] = $this->validatedata->validate('donation_amount', 'Donation amount', false, '', array());

			$pushServiceDetails['date_of_donation'] = $this->validatedata->validate('date_of_donation', 'Date Of Donation', false, '', array());

			$pushServiceDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());

			$pushServiceDetails['pushService_in_name_of'] = $this->validatedata->validate('pushService_in_name_of', 'Eeceipt Name', false, '', array());

			$pushServiceDetails['pan_number'] = $this->validatedata->validate('pan_number', 'Pan Number', false, '', array());

			$pushServiceDetails['aadhar_number'] = $this->validatedata->validate('aadhar_number', 'Aadhar Number', false, '', array());

			$pushServiceDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());

			if (isset($pushServiceDetails['date_of_donation']) && !empty($pushServiceDetails['date_of_donation']) && $pushServiceDetails['date_of_donation'] != "0000-00-00") {
				$pushServiceDetails['date_of_donation'] = str_replace("/", "-", $pushServiceDetails['date_of_donation']);
				$pushServiceDetails['date_of_donation'] = date("Y-m-d", strtotime($pushServiceDetails['date_of_donation']));
			}

			$fieldData = $this->datatables->mapDynamicFeilds("pushServices",$this->input->post());
			$pushServiceDetails = array_merge($fieldData, $pushServiceDetails);

			if ($method == "PUT") {
				$iticode = $pushServiceDetails['push_service_id'];
				$pushServiceDetails['status'] = "active";
				$pushServiceDetails['created_by'] = $this->input->post('SadminID');
				$pushServiceDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('push_services', $pushServiceDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('push_service_id' => $push_service_id);
				if (!isset($push_service_id) || empty($push_service_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}



				$pushServiceDetails['modified_by'] = $this->input->post('SadminID');
				$pushServiceDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('push_services', $pushServiceDetails, $where);

				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {

				$pushServiceDetails = array();

				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('push_services', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else {

			$where = array("push_service_id" => $push_service_id);

			$pushServiceDetails = $this->CommonModel->getMasterDetails('push_services', '', $where);
			if (isset($pushServiceDetails) && !empty($pushServiceDetails)) {

				$status['data'] = $pushServiceDetails;

				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {

				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function pushServiceChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$this->db->trans_start();
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			// print_r($ids);exit;
			$changestatus = $this->CommonModel->changeMasterStatus('push_services', $statusCode, $ids, 'push_service_id');
			$confirmationDate = date("Y/m/d H:i:s");
			if ($changestatus) {

				if($statusCode == "approved"){
					$where = array("docTypeID"=>1);
					$donorReciptsDetails['approved_declined_date'] = $confirmationDate;
					$docPreFix = $this->CommonModel->getMasterDetails('doc_prefix','',$where);
					if(!isset($docPreFix) && empty($docPreFix)){
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getErrorCode(227);
						$status['statusCode'] = 227;
						$status['data'] =array();
						$status['flag'] = 'F';
						$this->response->output($status,200);	
					}
						$docCurrNo=$docPreFix[0]->docCurrNo;    
                        $length = 4;
                        $docCurrNoStr= substr(str_repeat(0, $length).$docCurrNo, - $length);
						$docYearCD=$docPreFix[0]->docYearCD;
						$docPrefixCD=$docPreFix[0]->docPrefixCD;
						$donorReciptsDetails['pushService_number']=$docPrefixCD."".$docYearCD."/".$docCurrNoStr;
						$where = array("push_service_id"=>$ids);
						$iscreated = $this->CommonModel->updateMasterDetails('push_services',$donorReciptsDetails,$where);
						if (!$iscreated) {
							$this->db->trans_rollback();
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}else
						{
							$where = array("docTypeID"=>1);
							$docCurrNo++;
							$reciptsDetails=array("docCurrNo"=>$docCurrNo);
							$iscreated = $this->CommonModel->updateMasterDetails('doc_prefix',$reciptsDetails,$where);
							if (!$iscreated) {
								$this->db->trans_rollback();
								$status['msg'] = $this->systemmsg->getErrorCode(998);
								$status['statusCode'] = 998;
								$status['data'] = array();
								$status['flag'] = 'F';
								$this->response->output($status,200);
							}else
							{
								$this->db->trans_commit();
								$status = array();
								$status['data'] = array();
								$status['statusCode'] = 200;
								$status['flag'] = 'S';
								$this->response->output($status,200);

							}
						}
				}
				$this->db->trans_commit();
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function pushServiceNotificationMaster($push_service_id="")
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if ($method == "POST" || $method == "PUT") {
			$pushServiceDetails = array();
			$updateDate = date("Y/m/d H:i:s");

			$pushServiceDetails['push_service_name'] = $this->validatedata->validate('push_service_name', 'Push Service Name', true, '', array());

			$pushServiceDetails['to_email'] = $this->validatedata->validate('to_email', 'Donor Name', true, '', array());

			$pushServiceDetails['message_body'] = $this->validatedata->validate('message_body', 'message Body', false, '', array());
			
			$pushServiceDetails['sms_body'] = $this->validatedata->validate('sms_body', 'sms Body', false, '', array());

			$pushServiceDetails['whats_app_body'] = $this->validatedata->validate('whats_app_body', 'whatsApp Body', false, '', array());

			$pushServiceDetails['trigger_type'] = $this->validatedata->validate('trigger_type', 'trigger Type', false, '', array());

			$pushServiceDetails['trigger_date'] = $this->validatedata->validate('trigger_date', 'trigger Date', false, '', array());

			$pushServiceDetails['interval_type'] = $this->validatedata->validate('interval_type', 'interval Type', false, '', array());

			$pushServiceDetails['interval_month'] = $this->validatedata->validate('interval_month', 'interval Month', false, '', array());

			$pushServiceDetails['interval_week'] = $this->validatedata->validate('interval_week', 'interval Week', false, '', array());

			$pushServiceDetails['interval_span'] = $this->validatedata->validate('interval_span', 'interval Span', false, '', array());

			$pushServiceDetails['stop_type'] = $this->validatedata->validate('stop_type', 'stop Type', false, '', array());
			
			$pushServiceDetails['stop_value'] = $this->validatedata->validate('stop_value', 'stop Value', false, '', array());

			$pushServiceDetails['trigger_date'] = $this->validatedata->validate('trigger_date', 'Trigger Date', false, '', array());

			$pushServiceDetails['stop_date'] = $this->validatedata->validate('stop_date', 'Stop Date', false, '', array());
			
			$pushServiceDetails['status'] = $this->validatedata->validate('status', 'status', false, '', array());

			if (isset($pushServiceDetails['trigger_date']) && !empty($pushServiceDetails['trigger_date']) && $pushServiceDetails['trigger_date'] != "0000-00-00") {
				$pushServiceDetails['trigger_date'] = str_replace("/", "-", $pushServiceDetails['trigger_date']);
				$pushServiceDetails['trigger_date'] = date("Y-m-d", strtotime($pushServiceDetails['trigger_date']));
			}

			if (isset($pushServiceDetails['stop_date']) && !empty($pushServiceDetails['stop_date']) && $pushServiceDetails['stop_date'] != "0000-00-00") {
				$pushServiceDetails['stop_date'] = str_replace("/", "-", $pushServiceDetails['stop_date']);
				$pushServiceDetails['stop_date'] = date("Y-m-d", strtotime($pushServiceDetails['stop_date']));
			}

			$fieldData = $this->datatables->mapDynamicFeilds("pushServices",$this->input->post());
			$pushServiceDetails = array_merge($fieldData, $pushServiceDetails);

			if ($method == "PUT") {
				$pushServiceDetails['status'] = "active";
				$pushServiceDetails['created_by'] = $this->input->post('SadminID');
				$pushServiceDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('push_services', $pushServiceDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "POST") {
				$where = array('push_service_id' => $push_service_id);
				if (!isset($push_service_id) || empty($push_service_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}



				$pushServiceDetails['modified_by'] = $this->input->post('SadminID');
				$pushServiceDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('push_services', $pushServiceDetails, $where);

				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {

				$pushServiceDetails = array();

				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('push_services', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} else {

			$where = array("push_service_id" => $push_service_id);

			$pushServiceDetails = $this->CommonModel->getMasterDetails('push_services', '', $where);
			if (isset($pushServiceDetails) && !empty($pushServiceDetails)) {

				$status['data'] = $pushServiceDetails;

				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {

				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}

	public function multipleHardDelete()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$ids = $this->input->post("list");
		$whereIn ['push_service_id']= $ids;
		$action = $this->input->post("action");	
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('push_services', '',$whereIn);
			if ($changestatus) {
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
	

}
