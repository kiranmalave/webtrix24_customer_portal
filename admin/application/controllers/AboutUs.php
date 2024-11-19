<?php
defined('BASEPATH') or exit('No direct script access allowed');

class AboutUs extends CI_Controller
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
		$this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
	}

	public function aboutUsImagesList()
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

		// echo $statuscode;exit();
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "aboutUsID ";
			$order = "ASC";
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
		// print_r($other);exit();
		$config["base_url"] = base_url() . "aboutus";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('aboutUsID ', "aboutus", $wherec);
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
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'aboutus', $wherec, '', '', $join, $other);
		} else {
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'aboutus', $wherec, $config["per_page"], $page, $join, $other);
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
	public function aboutUsImages($id = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$aboutusDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if ($method == "PUT" || $method == "POST") {


			$aboutusDetails['aboutUsName'] = $this->validatedata->validate('aboutUsName', 'Image Name', false, '', array());
			$aboutUsImage = $this->validatedata->validate('aboutUsImage', 'Images', false, '', array());
			$aboutusDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());

			if ($method == "POST") {

				$image64 = $this->validatedata->validate('uploadImage', 'upload Image', true, '', array());
				if ($image64 != "") {
					$imageName = "aboutUsImage" . rand(10, 1000) . ".jpg";
					$aboutusDetails['aboutUsImage'] = $imageName;

					$imagetoup = $this->config->item("imagesPATH") . "aboutUsImages/" . $imageName;
					$saveImage = $this->base64_to_jpeg($image64, $imagetoup);
				}
				$aboutusDetails['created_by'] = $this->input->post('SadminID');
				$aboutusDetails['created_date'] = $updateDate;
				$aboutusDetails['modified_date'] = '0';

				$iscreated = $this->CommonModel->saveMasterDetails('aboutus', $aboutusDetails);
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

			if ($method == "PUT") {
				$where = array('aboutUsID ' => $id);
				if (!isset($id) || empty($id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$image64 = "";
				if ($aboutUsImage == "") {
					$image64 = $this->validatedata->validate('uploadImage', 'Image', true, '', array());
				} else {
					$image64 = $this->validatedata->validate('uploadImage', 'Image', false, '', array());
				}
				if ($image64 != "") {
					$sliderImage = $this->CommonModel->getMasterDetails('aboutus', 'aboutUsImage', $where);
					if ($sliderImage == "") {
						$imageName = "aboutUsImage" . rand(10, 1000) . ".jpg";
					} else {
						$imageName = $sliderImage[0]->aboutUsImage;
					}
					$aboutusDetails['aboutUsImage'] = $imageName;

					$imagetoup = $this->config->item("imagesPATH") . "aboutUsImages/" . $imageName;
					$saveImage = $this->base64_to_jpeg($image64, $imagetoup);
				}

				$aboutusDetails['modified_by'] = $this->input->post('SadminID');
				$aboutusDetails['modified_date'] = $updateDate;

				$iscreated = $this->CommonModel->updateMasterDetails('aboutus', $aboutusDetails, $where);
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
		} else if ($method == "DELETE") {
			$aboutusDetails = array();

			$where = array('aboutUsID s' => $id);
			if (!isset($id) || empty($id)) {
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('aboutus', $where);
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
			$where = array("aboutUsID " => $id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('aboutus', '', $where);
			if (isset($userRoleHistory) && !empty($userRoleHistory)) {

				$status['data'] = $userRoleHistory;
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
	public function aboutUsImagesChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('aboutus', $statusCode, $ids, 'aboutUsID ');

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
	function base64_to_jpeg($base64_string = '', $output_file = '')
	{
		// open the output file for writing
		$ifp = fopen($output_file, 'wb');

		// split the string on commas
		// $data[ 0 ] == "data:image/png;base64"
		// $data[ 1 ] == <actual base64 string>
		$data = explode(',', $base64_string);

		// we could add validation here with ensuring count( $data ) > 1
		fwrite($ifp, base64_decode($data[1]));

		// clean up the file resource
		fclose($ifp);

		return $output_file;
	}
}
