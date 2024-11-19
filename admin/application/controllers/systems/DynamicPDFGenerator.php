<?php
defined('BASEPATH') or exit('No direct script access allowed');

class DynamicPDFGenerator extends CI_Controller
{	
	public $menuID;
	public $menuDetails = [];
	public $dyanamicForm_Fields = [];
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
	}
    public function receiptReport()
	{
		$data = $_POST['data'];
		$dataArray = json_decode($data, true);
       
	}

	public function pdfReport()
	{
        $data = $_POST['data'];
		$dataArray = json_decode($data, true);

        foreach ($dataArray as $key => $value) {
            if (isset($value) && !empty($value)) {
                $whereConditions["t.$key"] = 'IN ("' . $value . '")';
            }
        }

        print_r($whereConditions);exit;
		$statuscode = $this->input->post('status');
		$config = array();
        
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "";//"created_date";
			$order = "";//"DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		
		$this->menuID = $this->input->post('menuId');
		$this->getMenuData();
		$extraData= array();
		$selectC = "";
		if(isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)){
			$cData = json_decode($this->menuDetails->c_metadata);
			$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$this->menuDetails->table_name." WHERE Key_name = 'PRIMARY'";
			$primaryData = $this->CommonModel->getdata($sql,array());
			$ccData = array_column($cData,'column_name');
			$fieldIdDetails = array_column($cData,'fieldID');
			$whereR = $otherR = $joinR = array();
			$joinR[0]['type'] ="LEFT JOIN";
			$joinR[0]['table']="menu_master";
			$joinR[0]['alias'] ="mm";
			$joinR[0]['key1'] ="linkedWith";
			$joinR[0]['key2'] ="menuID";
			
			if(isset($fieldIdDetails) && !empty($fieldIdDetails)){
				$otherR['whereIn'] ="fieldID";
				$otherR['whereData'] = implode(",",$fieldIdDetails);
			}
			$whereR['t.menuID'] = "= ".$this->menuID;
			$whereR['linkedWith'] = "!= ''";
			$linkedFields = $this->CommonModel->GetMasterListDetails("t.fieldOptions,t.column_name,t.fieldID,t.linkedWith,mm.menuID,mm.table_name","dynamic_fields", $whereR, '', '', $joinR, $otherR);
			foreach ($linkedFields as $key => $value) {
				$sql = "SHOW KEYS FROM ".$this->db->dbprefix.$value->table_name." WHERE Key_name = 'PRIMARY'";
				$primaryData2 = $this->CommonModel->getdata($sql,array());
				$last = count($join);
				$join[$last]['type'] ="LEFT JOIN";
				$join[$last]['table']=$value->table_name;
				$join[$last]['alias'] ="w".uniqid(2)."_".substr($value->table_name,0,2);
				$join[$last]['key1'] = $value->column_name;
				$join[$last]['key2'] =$primaryData2[0]->Column_name;
				$extraData[] = $join[$last]['alias'].".".$value->fieldOptions;
			}
			if(isset($primaryData2) && !empty($primaryData2)){
				if(!in_array($primaryData2[0]->Column_name,$ccData)){
					$ccData[]=$primaryData2[0]->Column_name;
				}
			}
			if(isset($primaryData) && !empty($primaryData)){
				if(!in_array($primaryData[0]->Column_name,$ccData)){
					$ccData[]=$primaryData[0]->Column_name;
				}
			}
			$selectC =implode(",",array_merge($ccData,$extraData));
		}
		$config["base_url"] = base_url() . "dynamicFormFieldDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('id', $this->menuDetails->table_name, $wherec);
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
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, $other);
		} else {
			$userRoleDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $userRoleDetails;
		$pdfFilePath = $this->load->view("dynamic_pdf",$status['data'],true);

        //load mPDF library
        $this->load->library('MPDFCI');
        $this->mpdfci->SetHTMLFooter('<div style="text-align: center">{PAGENO} of {nbpg}</div>');
 	    $this->mpdfci->WriteHTML($pdfFilePath);
       	$this->mpdfci->Output();  
	}

	public function getMenuData()
	{
		if (!isset($this->menuID) && !isset($this->menuID)) {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 280;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$join = $other = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "menu_master";
		$join[0]['alias'] = "m";
		$join[0]['key1'] = "menuID";
		$join[0]['key2'] = "menuID";

		$dynamicFieldHtml = "";
		$wherec["m.menuID="] = "'" . $this->menuID . "'";
	
		$other = array("orderBy" => "fieldIndex", "order" => "ASC");
		$dynamicFields = $this->CommonModel->GetMasterListDetails($selectC = 't.*,m.menuLink', 'dynamic_fields', $wherec, '', '', $join, $other);
		$wheredata["menuID"] = $this->menuID;
		$dynamicFieldsMeta = $this->CommonModel->getMasterDetails("menu_master","*",$wheredata);
		$this->dyanamicForm_Fields  =  $dynamicFields;
		if(isset($dynamicFieldsMeta) && !empty($dynamicFieldsMeta)){
			$this->menuDetails=  $dynamicFieldsMeta[0];
		}else{
			$this->menuDetails=  array();
		}
	}	
}
