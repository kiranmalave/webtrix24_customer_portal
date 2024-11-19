<?php
defined('BASEPATH') or exit('No direct script access allowed');

class VendorMaster extends CI_Controller
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
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}


	public function vendorMasterList(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		
		$statuscode = $this->input->post('status');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
		$selectC = '';
		$join = array();
		$other = array("orderBy" => $orderBy, "order" => $order);
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
				$colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
				$columnNames = [
					"company_id" => ["table" => "info_settings", "alias" => "dc", "column" => "companyName", "key2" => "infoID"],
					"modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
					"created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],	
					"service_type" => ["table" => "categories", "alias" => "ca", "column" => "categoryName", "key2" => "category_id"],			
				];
			
				foreach ($columnNames as $columnName => $columnData) {
					if (in_array($columnName, $colData)) {
						$jkey = count($join) + 1;
						$join[$jkey]['type'] = "LEFT JOIN";
						$join[$jkey]['table'] = $columnData["table"];
						$join[$jkey]['alias'] = $columnData["alias"];
						$join[$jkey]['key1'] = $columnName;
						$join[$jkey]['key2'] = $columnData["key2"];
						$join[$jkey]['column'] = $columnData["column"];
						$columnNameShow = $columnData["column"];
						$selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
					}
				}
				// Remove the leading comma if $selectC is not empty
				$selectC = ltrim($selectC, ',');
				// print_r($join);exit;
			}
		}
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "vendor_id";
			$order = "DESC";
		}
		$config = $this->config->item('pagination');
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		// if (isset($statuscode) && !empty($statuscode)) {
		// 	$statusStr = str_replace(",", '","', $statuscode);
		// 	$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		// }
		$config["base_url"] = base_url() . "vendorDetailsList";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('vendor_id', "vendors", $wherec,$other,$join);
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
			$vendorDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*', 'vendors', $wherec, '', '', $join, $other);
		} else {
			$vendorDetails = $this->CommonModel->GetMasterListDetails($selectC, 'vendors', $wherec, $config["per_page"], $page, $join, $other);
		}
		$status['data'] = $vendorDetails;
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
		if ($vendorDetails) {
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

	public function vendorMaster($vendor_id = "")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if ($method == "POST" || $method == "PUT") {
			$vendorDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			
			$vendorDetails['vendor_name'] = $this->validatedata->validate('vendor_name', 'Cendor Name', false, '', array());
			$vendorDetails['contact_no'] = $this->validatedata->validate('contact_no', 'Contact No', false, '', array());
			$vendorDetails['email'] = $this->validatedata->validate('email', 'Email', false, '', array());
			$vendorDetails['address'] = $this->validatedata->validate('address', 'Address', false, '', array());
			$vendorDetails['service_type'] = $this->validatedata->validate('service_type', 'Service Type', false, '', array());
			// $vendorDetails['profile'] = $this->validatedata->validate('profile', 'Profile', false, '', array());
			$vendorDetails['country_code'] = $this->validatedata->validate('country_code', 'Country Code', false, '', array());
			$vendorDetails['gst_no'] = $this->validatedata->validate('gst_no', 'GST No', false, '', array());
			$vendorDetails['pan'] = $this->validatedata->validate('pan', 'Pan', false, '', array());
			$vendorDetails['bank_name'] = $this->validatedata->validate('bank_name', 'Bank Name', false, '', array());
			$vendorDetails['account_no'] = $this->validatedata->validate('account_no', 'Account No', false, '', array());
			$vendorDetails['ifsc'] = $this->validatedata->validate('ifsc', 'IFSC Code', false, '', array());
			$vendorDetails['description'] = $this->validatedata->validate('description', 'Description', false, '', array());
			$fieldData = $this->datatables->mapDynamicFeilds("vendors",$this->input->post());
			$vendorDetails = array_merge($fieldData, $vendorDetails);
			if ($method == "PUT") {					
				$vendorDetails['created_by'] = $this->input->post('SadminID');
				$vendorDetails['created_date'] = $updateDate;
				$iscreated = $this->CommonModel->saveMasterDetails('vendors', $vendorDetails);
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
				$where = array('vendor_id' => $vendor_id);
				if (!isset($vendor_id) || empty($vendor_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$vendorDetails['modified_by'] = $this->input->post('SadminID');
				$vendorDetails['modified_date'] = $updateDate;
				$iscreated = $this->CommonModel->updateMasterDetails('vendors', $vendorDetails, $where);
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
				$vendorDetails = array();
				$where = array('vendor_id' => $vendor_id);
				if (!isset($vendor_id) || empty($vendor_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->deleteMasterDetails('vendors', $where);
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
			$where = array("vendor_id" => $vendor_id);
			$vendorDetails = $this->CommonModel->getMasterDetails('vendors', '', $where);
			if (isset($vendorDetails) && !empty($vendorDetails)) {
				$status['data'] = $vendorDetails;
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
	public function vendorChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$action = $action ?? '';
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$whereIn ['vendor_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('vendors', '',$whereIn);
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
	public function setVendorPic($vendorID='') {  
        $this->load->library('slim');
		$images = $this->slim->getImages();
		if (!empty($images) && isset($images[0]['input']['name'])) {
			$imagename = $images[0]['input']['name'];
			} else {
			echo 'No image name found.';
		}
        $imagename = 'profile_' . time(). ".jpg";
        try {
            $images = $this->slim->getImages();
        }
        catch (Exception $e) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'Unknown'
            ));
			return;
        }
        if ($images === false) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No data posted'
            ));
            return;
        }
        $image = array_shift($images);
        if (!isset($image)) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No images found'
            ));
            return;
        }
        if (!isset($image['output']['data']) && !isset($image['input']['data'])) {
            $this->slim->outputJSON(array(
                'status' => SlimStatus::FAILURE,
                'message' => 'No image data'
            ));
            return;
        }
        if (isset($image['output']['data'])) {
            $name = $image['output']['name'];
            $data = $image['output']['data'];
            $output =$this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'vendor/'.$vendorID.'/profilePic/');
        }
        if (isset($image['input']['data'])) {
            $name = $image['input']['name'];
            $data = $image['input']['data'];
			$input = $this->slim->saveFile($data, $name,$this->config->item("mediaPATH").'vendor/'.$vendorID.'/profilePic/');
        }
        $response = array(
            'status' => SlimStatus::SUCCESS,
			'newFileName' => $imagename
        );
        if (isset($output) && isset($input)) {
            $response['output'] = array(
                'file' => $output['name'],
                'path' => $output['path'],
            );
            $response['input'] = array(
                'file' => $input['name'],
                'path' => $input['path']
            );
        }
        else {
            $response['file'] = isset($output) ? $output['name'] : $input['name'];
            $response['path'] = isset($output) ? $output['path'] : $input['path'];
        }
        $updateDate = date("Y/m/d H:i:s");
        $data = array("profile"=>$imagename);
       	$isrename = rename(
			$this->config->item("mediaPATH").'vendor/'.$vendorID.'/profilePic/'.$response['file'],
			$this->config->item("mediaPATH").'vendor/'.$vendorID.'/profilePic/'. $imagename);
	   	$where = array("vendor_id" => $vendorID);
       	$isupdate = $this->CommonModel->updateMasterDetails('vendors',$data,$where);
       	$this->slim->outputJSON($response);
    }

	public function removeVendorPicFile($vendorID='') 
	{
		if($vendorID ==""){
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] =array();
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}

		$where = array("vendor_id" => $vendorID);
		$formData = array();
		$path = $this->config->item("mediaPATH").'vendor/'.$vendorID.'/profilePic/';
		$images = $this->CommonModel->getMasterDetails('vendors','profile',$where);
		$image = $images[0]->profile;
		$formData['profile'] = '';
		
		
		if (isset($image) && !empty($image)) {

			if (file_exists($path . $image)) {
				$formData['vendor_id'] = $vendorID;
				$iscreated = $this->CommonModel->updateMasterDetails("vendors",$formData,array('vendor_id'=>$vendorID));
				unlink($path . $image);
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			} else {
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['data'] = "";
				$status['flag'] = 'S';
				echo json_encode($status);
				exit;
			}
		}
	}
	public function multiplevendorChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['vendor_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('vendors', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('vendors', $action, $ids, 'vendor_id');
		}
		if ($changestatus) {				
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$this->response->outputErrorResponse(996);
		}
	}
}