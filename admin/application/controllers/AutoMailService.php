	<?php
	defined('BASEPATH') or exit('No direct script access allowed');

	class AutoMailService extends CI_Controller
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
			$this->load->library("pagination");
			$this->load->library("response");
			$this->load->library("ValidateData");
			$this->load->library("Emails");
			$this->load->library("sms");
			$where = array("infoID" => 2);
			$infoData = $this->CommonModel->getMasterDetails('infoSettings', '', $where);

			$this->fromEmail = $infoData[0]->fromEmail;
			$this->ccEmail = $infoData[0]->ccEmail;
			$this->fromName = $infoData[0]->fromName;
		}
		public function getEmailDetailsList()
		{
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$textSearch = $this->input->post('textSearch');
			$isAll = $this->input->post('getAll');
			$curPage = $this->input->post('curpage');
			$textval = $this->input->post('textval');
			$orderBy = $this->input->post('orderBy');
			$order = $this->input->post('order');
			$statuscode = $this->input->post('status');
			$config = array();
			if (!isset($orderBy) || empty($orderBy)) {
				$orderBy = "ams_id";
				$order = "DESC";
			}
			$other = array("orderBy" => $orderBy, "order" => $order);
			$config = $this->config->item('pagination');
			$wherec = $join = array();
			if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
				$textSearch = trim($textSearch);
				$wherec["$textSearch like  "] = "'" . $textval . "%'";
			}

			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["status"] = 'IN ("' . $statusStr . '")';
			}
			// print_r($wherec);exit();
			$config["base_url"] = base_url() . "autoMailService";
			$config["total_rows"] = $this->CommonModel->getCountByParameter('ams_id', "auto_mail_service", $wherec);
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
				$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'auto_mail_service', $wherec, '', '', $join, $other);
			} else {
				$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'auto_mail_service', $wherec, $config["per_page"], $page, $join, $other);
			}

			$status['data'] = $pagesDetails;
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
			if ($pagesDetails) {
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
		public function autoMailMaster($id = "")
		{

			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$method = $this->input->method(TRUE);

			$amsDetaills = array();
			$updateDate = date("Y/m/d H:i:s");
			if ($method == "PUT" || $method == "POST") {
				$amsDetaills['amsName'] = $this->validatedata->validate('amsName', 'Auto mail Name', true, '', array());
				$amsDetaills['recursiveInterval'] = $this->validatedata->validate('recursiveInterval', 'Recursive Interval', false, '', array());
				if ($amsDetaills['recursiveInterval'] != "Other" || $amsDetaills['recursiveInterval'] == "") {
					$amsDetaills['recOtherValue'] = $this->validatedata->validate('recOtherValue', 'Recursive Other Value', false, '', array());
					$amsDetaills['recOtherType'] = $this->validatedata->validate('recOtherType', 'Recursive Other Type', false, '', array());
				} else {
					$amsDetaills['recOtherValue'] = $this->validatedata->validate('recOtherValue', 'Recursive Other Value', true, '', array());
					$amsDetaills['recOtherType'] = $this->validatedata->validate('recOtherType', 'Recursive Other Type', true, '', array());
				}
				// $amsDetaills['userType'] = $this->validatedata->validate('userType','userType Required',true);
				if (!empty($this->input->post('userType'))) {
					// echo  $this->input->post('userType');exit();
					if (is_array($this->input->post('userType'))) {
						$userType = implode(",", $this->input->post('userType'));
						$amsDetaills['userType'] = $userType;
					} else {
						$amsDetaills['userType'] = $this->input->post('userType');
					}
				} else {
					$amsDetaills['userType'] = "";
				}
				$amsDetaills['emailTemp'] = $this->validatedata->validate('emailTemp', 'Email Template', true, '', array());
				if ($amsDetaills['emailTemp'] != "Other") {
					$amsDetaills['mailSubject'] = $this->validatedata->validate('mailSubject', 'mailSubject', false, '', array());
					$amsDetaills['mailBody'] = $this->validatedata->validate('mailBody', 'mailBody', false, '', array());
				} else {
					$amsDetaills['mailSubject'] = $this->validatedata->validate('mailSubject', 'mailSubject', true, '', array());
					$amsDetaills['mailBody'] = $this->validatedata->validate('mailBody', 'mailBody', true, '', array());
				}
				$amsDetaills['actionType'] = $this->validatedata->validate('actionType', 'actionType', false, '', array());
				if ($amsDetaills['actionType'] == "upCommingBirthday") {
					$amsDetaills['birthWishBeforeDays'] = $this->validatedata->validate('birthWishBeforeDays', 'Birthdays Before Days', false, '', array());
				}
				$amsDetaills['executionDate'] = $this->validatedata->validate('executionDate', 'Execution Date', false, '', array());
				$amsDetaills['stopDate'] = $this->validatedata->validate('stopDate', 'Stop Date', false, '', array());
				if ($method == "POST") {
					$amsDetaills['status'] = "active";
					$amsDetaills['created_by'] = $this->input->post('SadminID');
					$amsDetaills['created_date'] = $updateDate;
					$iscreated = $this->CommonModel->saveMasterDetails('auto_mail_service', $amsDetaills);
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
				} elseif ($method == "PUT") {
					$where = array('ams_id' => $id);
					if (!isset($id) || empty($id)) {
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
					$amsDetaills['modified_by'] = $this->input->post('SadminID');
					$amsDetaills['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('auto_mail_service', $amsDetaills, $where);
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
				}
			} elseif ($method == "dele") {
				$amsDetaills = array();
				$where = array('ams_id' => $id);
				if (!isset($id) || empty($id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->deleteMasterDetails('amsDetaills', $where);
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
			} else {
				$where = array("ams_id" => $id);
				$amsDetaills = $this->CommonModel->getMasterDetails('auto_mail_service', '', $where);
				if (isset($amsDetaills) && !empty($amsDetaills)) {
					$status['data'] = $amsDetaills;
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
		public function autoMailServiceChangeStatus()
		{
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$action = $this->input->post("action");
			$action = $action ?? '';
			if (trim($action) == "changeStatus") {
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");
				$changestatus = $this->CommonModel->changeMasterStatus('auto_mail_service', $statusCode, $ids, 'ams_id');

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

		public function autoMailAttachment($id = "")
		{
			$where = array("ams_id" => $id);
			$photos = $this->CommonModel->getMasterDetails('auto_mail_attachments', '', $where);
			if (isset($photos) && !empty($photos)) {
				$status['data'] = $photos;
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
		public function addAutoMailAttchments($ams_id = '', $adminID = '')
		{
			$_POST['SadminID'] = $adminID;
			$this->load->library('realtimeupload');
			$imagepath = $this->config->item('imagesPATH') . "autoMailAttchments/";
			if (!is_dir($imagepath . $ams_id)) {
				mkdir($imagepath . $ams_id, 0777);
				chmod($imagepath . $ams_id, 0777);
			} else {
				if (!is_writable($imagepath . $ams_id)) {
					chmod($imagepath . $ams_id, 0777);
				}
			}
			$settings = array(
				'uploadFolder' => $imagepath . $ams_id,
				'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
				'maxFolderFiles' => 0,
				'maxFolderSize' => 0,
				'returnLocation' => true,
				'uniqueFilename' => false,
				'dbTable' => 'auto_mail_attachments',
				'fileTypeColumn' => 'type',
				'fileColumn' => 'file',
				'forignKey' => 'ams_id',
				'forignValue' => $ams_id,
				'extraData' => array('docType' => "auto_mail_attachments", "status" => "active"),
			);
			//$uploader = new RealTimeUpload();
			$this->realtimeupload->init($settings);
		}
		public function documentChangeStatus($id = '')
		{
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$action = $this->input->post("action");
			$action = $action ?? '';
			if (trim($action) == "delete") {

				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");
				$where = array("ams_id" => $id);
				$Where = array("ams_id =" => "'" . $id . "'");
				$wherein = array("AttachementID" => $ids);
				$whereIn = array("whereIn" => "AttachementID", "whereData" => $ids);
				$deleteList = $this->CommonModel->GetMasterListDetails('file,ams_id', 'auto_mail_attachments', $Where, '', '', array(), $whereIn);
				if (isset($deleteList) && !empty($deleteList)) {

					$changestatus = $this->CommonModel->deleteMasterDetails('auto_mail_attachments', $where, $wherein);

					if ($changestatus) {
						$baseURL = $this->config->item("imagesPATH");
						foreach ($deleteList as $key => $value) {
							if (file_exists($baseURL . "autoMailAttchments/" . $value->ams_id . "/" . $value->file) && $value->file != '') {
								chmod($baseURL . "autoMailAttchments/" . $value->ams_id . "/" . $value->file, 0777);
								unlink($baseURL . "autoMailAttchments/" . $value->ams_id . "/" . $value->file);
							}
						}
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$status['data'] = array();
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
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
