<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pages extends CI_Controller {

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
	}

	public function getPagesDetailsList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$pageType = $this->input->post('page_type');
		$statuscode = $this->input->post('status');
		$created_by = $this->input->post('created_by');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "t.created_date";
			$order ="DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($pageType) && !empty ($pageType)){
			$pageTypeStr = str_replace(",",'","',$pageType);
			$wherec["t.page_type"] = 'IN ("'.$pageTypeStr.'")';
		}

		if(isset($statuscode) && !empty($statuscode)){
			$statusStr = str_replace(",",'","',$statuscode);
			$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}

		if(isset($created_by) && !empty($created_by)){
			$createdByString = str_replace(",", '","', $created_by);
			$wherec["t.created_by"] = 'IN ("' . $createdByString . '")';
		}
		
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="admin";
		$join[0]['alias'] ="a";
		$join[0]['key1'] ="created_by";
		$join[0]['key2'] ="adminID";

		$join[1]['type'] ="LEFT JOIN";
		$join[1]['table']="categories";
		$join[1]['alias'] ="c";
		$join[1]['key1'] ="category_id";
		$join[1]['key2'] ="category_id";

		$join[2]['type'] ="LEFT JOIN";
		$join[2]['table']="admin";
		$join[2]['alias'] ="ad";
		$join[2]['key1'] ="created_by";
		$join[2]['key2'] ="adminID";
	
		$join[3]['type'] ="LEFT JOIN";
		$join[3]['table']="admin";
		$join[3]['alias'] ="am";
		$join[3]['key1'] ="modified_by";
		$join[3]['key2'] ="adminID";


		$config["base_url"] = base_url() . "pagesDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('pageID',"pages_master",$wherec,'',$join);
	    $config["uri_segment"] = 2;
	    $this->pagination->initialize($config);
	    if(isset($curPage) && !empty($curPage)){
		$curPage = $curPage;
		$page = $curPage * $config["per_page"];
		}
		else{
		$curPage = 0;
		$page = 0;
		}
		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*,t.status as status,a.name,c.categoryName','pages_master',$wherec,'','',$join,$other);	
		}else{
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='t.*,t.status as status,a.name,c.categoryName,ad.name as created_by,am.name as modified_by','pages_master',$wherec,$config["per_page"],$page,$join,$other);	
		}
		// print_r($pagesDetails);exit;
		$status['data'] = $pagesDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if($curPage <=1)
		$status['paginginfo']["prevPage"] = 0;
		else
		$status['paginginfo']["prevPage"] = $curPage - 1 ;

		$status['paginginfo']["pageLimit"] = $config["per_page"] ;
		$status['paginginfo']["nextpage"] =  $curPage+1 ;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
		$status['loadstate'] = true;
		if($config["total_rows"] <= $status['paginginfo']["end"])
		{
		$status['msg'] = $this->systemmsg->getErrorCode(232);
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$status['loadstate'] = false;
		$this->response->output($status,200);
		}
		if($pagesDetails){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}				
	}
	public function pageMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$pagesMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			$pagesMasterDetails['pageTitle'] = $this->validatedata->validate('pageTitle','page title',false,'',array());

			$pagesMasterDetails['pageSubTitle'] = $this->validatedata->validate('pageSubTitle','page Sub Link',false,'',array());

			$pagesMasterDetails['pageLink'] = $this->validatedata->validate('pageLink','page Link',false,'',array());

			$pagesMasterDetails['keywords'] = $this->validatedata->validate('keywords','Keywords',false,'',array());

			$pagesMasterDetails['metaDesc'] = $this->validatedata->validate('metaDesc','metaDesc',false,'',array());

			$pagesMasterDetails['description'] = $this->validatedata->validate('description','description',false,'',array());

			$pagesMasterDetails['isParent'] = $this->validatedata->validate('isParent','isParent',false,'',array()); 
			$pageCode = $this->validatedata->validate('pageCode','Page Code',false,'',array());
			(isset($pageCode) && !empty($pageCode) )?
				$pagesMasterDetails['PageCode'] = htmlspecialchars($pageCode):
				$pagesMasterDetails['PageCode'] = $pageCode;

			$pagesMasterDetails['pageCss'] = $this->validatedata->validate('pageCss','Page Css',false,'',array());
			
			$pageContent = $this->validatedata->validate('pageContent','Page Content',false,'',array());
			(isset($pageContent) && !empty($pageContent) )?
				$pagesMasterDetails['pageContent'] = htmlspecialchars($pageContent):
				$pagesMasterDetails['pageContent'] = $pageContent;
			
			$pagesMasterDetails['isHome'] = $this->validatedata->validate('isHome','isHome',false,'',array());

			$pagesMasterDetails['scriptForPage'] = $this->validatedata->validate('scriptForPage','scriptForPage',false,'',array());
			
			$pagesMasterDetails['cssForPage'] = $this->validatedata->validate('cssForPage','cssForPage',false,'',array());

			$pagesMasterDetails['status'] = $this->validatedata->validate('status','status',true,'',array());

			$pagesMasterDetails['page_type'] = $this->validatedata->validate('page_type','Page Type',false,'',array());

			$pagesMasterDetails['tempType'] = $this->validatedata->validate('tempType','Template Type',true,'',array());

			$pagesMasterDetails['feture_image'] = $this->validatedata->validate('feture_image','Cover Image',false,'',array());

			// $pagesMasterDetails['category_id'] = $this->validatedata->validate('category_id','Category',false,'',array());

			$pagesMasterDetails['is_external_link'] = $this->validatedata->validate('is_external_link','is external link',false,'',array()); 

			$pagesMasterDetails['external_link'] = $this->validatedata->validate('external_link','External link',false,'',array()); 

			$pagesMasterDetails['show_banner_image'] = $this->validatedata->validate('show_banner_image','Show Banner Image',false,'',array()); 

			$pagesMasterDetails['show_description_on_website'] = $this->validatedata->validate('show_description_on_website','Show Description on Website',false,'',array()); 

			$category_id = $this->input->post('category_id');
		
			if (gettype($category_id) == 'array') {
				$category_idString = str_replace(",", '","', $category_id);
				$string = implode(',', $category_idString);
				$pagesMasterDetails['category_id'] = $string;
			}else{
				$pagesMasterDetails['category_id'] = $category_id;
			}

			// print_r($pagesMasterDetails);exit;
			if($pagesMasterDetails['isHome']=="yes")
			{

				$iscreated = $this->CommonModel->updateAllRows('pages_master',$isHomeUpdate=array("isHome"=>"no"));
			}

			if($method=="PUT")
			{
				
				$pagesMasterDetails['created_by'] = $this->input->post('SadminID');
				$pagesMasterDetails['created_date'] = $updateDate;
				$pagesMasterDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('pages_master',$pagesMasterDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
				
			if($method=="POST")
			{
				$where=array('pageID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				$pagesMasterDetails['modified_by'] = $this->input->post('SadminID');
				$pagesMasterDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('pages_master',$pagesMasterDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
		}else if($method=="DELETE")
		{	
			$pagesMasterDetails = array();

			$where=array('pageID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('pages_master',$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}	
		else
		{
			$where = array("pageID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('pages_master','',$where);
			if(isset($userRoleHistory) && !empty($userRoleHistory)){

			if(isset($userRoleHistory[0]->pageCode) && !empty($userRoleHistory[0]->pageCode)){
				$userRoleHistory[0]->pageCode = htmlspecialchars_decode($userRoleHistory[0]->pageCode);
			}	
			if(isset($userRoleHistory[0]->pageContent) && !empty($userRoleHistory[0]->pageContent)){
				$userRoleHistory[0]->pageContent = htmlspecialchars_decode($userRoleHistory[0]->pageContent);
			}	
				
			$status['data'] = $userRoleHistory;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
			}else{

			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
			}
		}
		
	}
	public function pageChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				// $ids = $this->input->post("list");
				// $statusCode = $this->input->post("status");	
				// $changestatus = $this->CommonModel->changeMasterStatus('pages_master',$statusCode,$ids,'pageID');
				// $changestatus = $this->CommonModel->changeMasterStatus('menu_pages_master',$statusCode,$ids,'pageID');
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			foreach ($ids as $key => $value) {
				$where = array('pageID' => $value);
				$changestatus = $this->CommonModel->deleteMasterDetails('pages_master', $where);
				$changestatus = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
				if(!$changestatus){
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
			}
			if($changestatus){
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}
	}

	public function hardDelete(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$page_id = $this->input->post("id");
		$this->db->trans_start();
		$where = array('pageID' => $page_id);
		$changestatus = $this->CommonModel->deleteMasterDetails('pages_master', $where);
		$changestatus = $this->CommonModel->deleteMasterDetails('menu_pages_master', $where);
		if ($changestatus) {
			$this->db->trans_commit();
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$this->db->trans_rollback();
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function copyPage()
	{
		$id = $this->input->post("id");
		$adminID= $this->input->post('adminID');
		$where = array("pageID"=>$id);
		$pageDetail = $this->CommonModel->getMasterDetails('pages_master','',$where);
		if(isset($pageDetail)&&!empty($pageDetail)){
			$pageDetailArray = json_decode(json_encode($pageDetail[0]), true);
			unset($pageDetailArray['pageID']);
			$updateDate = date("Y/m/d H:i:s");
			$pageDetailArray['status'] = 'inactive';
			$pageDetailArray['created_date'] = $updateDate;
			$pageDetailArray['created_by'] = $adminID;
			$iscreated = $this->CommonModel->saveMasterDetails('pages_master',$pageDetailArray);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
			
		}
		
	}

	public function getPagesMenuMasterList()
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
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "menuName";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}

		
		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','pages_menu',$wherec,'','',$join,$other);	
		}
		
		$status['data'] = $pagesDetails;
		if($pagesDetails){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}				
	}

	
	public function pagesMenuMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$pagesMenuDetails=array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			$pagesMenuDetails['menuName'] = $this->validatedata->validate('menuName','menu Name',true,'',array());
			$pagesMenuDetails['isPrimary'] = $this->input->post('isPrimary');
			$pagesMenuDetails['isSecondary'] = $this->input->post('isSecondary');
			$pagesMenuDetails['isFooter'] = $this->input->post('isFooter');
			$pagesMenuDetails['status'] = $this->input->post('status');

			if($method=="PUT")
			{
				

				if($pagesMenuDetails['isPrimary'])
				{	
					
					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isPrimary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isSecondary'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isSecondary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isFooter'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isFooter']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				
				$pagesMenuDetails['created_by'] = $this->input->post('SadminID');
				$pagesMenuDetails['created_date'] = $updateDate;
				$pagesMenuDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('pages_menu',$pagesMenuDetails);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
				 
			if($method=="POST")
			{
				$where=array('menuID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
					// echo "jiiii";exit();
				}
				if($pagesMenuDetails['isPrimary'])
				{
					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isPrimary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isSecondary'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isSecondary']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				if($pagesMenuDetails['isFooter'])
				{

					$pagesMenuDetails1 =array();
					$pagesMenuDetails1['isFooter']=false;
					$iscreated = $this->CommonModel->updateAllRows('pages_menu',$pagesMenuDetails1);

				}
				
				$pagesMenuDetails['status'] = $this->input->post('status');
				$pagesMenuDetails['modified_by'] = $this->input->post('SadminID');
				$pagesMenuDetails['modified_date'] = $updateDate;
				// print_r($pagesMenuDetails);
				$iscreated = $this->CommonModel->updateMasterDetails('pages_menu',$pagesMenuDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				
			}
		}else if($method=="DELETE")
		{	
			$pagesMenuDetails = array();

			$where=array('menuID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('pages_menu',$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}	
		else
		{
			$where = array("menuID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('pages_menu','',$where);
			if(isset($userRoleHistory) && !empty($userRoleHistory)){

			$status['data'] = $userRoleHistory;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
			}else{

			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);
			}
		}
		
	}

	public function addCustomLinks()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method('method');
		// print($method);
		$pagesMenuDetails=array();
		$updateDate = date("Y/m/d H:i:s");
		// $url = $this->validatedata->validate('url','URL',true,'',array());
		// $title = $this->validatedata->validate('title','Title',true,'',array());
		
		$pagesMenuDetails['custom_link'] = $this->input->post('custom_link');
		$pagesMenuDetails['menuPageID'] = $this->input->post('menuPageID');
		$pagesMenuDetails['menuID'] = $this->input->post('menuID');
		$pagesMenuDetails['position'] = $this->input->post('position');
		$pagesMenuDetails['created_by'] = $this->input->post('SadminID');
		$pagesMenuDetails['created_date'] = $updateDate;
		$pagesMenuDetails['modified_date'] = '0';
		

		if($method == "PUT")
		{
			$iscreated = $this->CommonModel->saveMasterDetails('menu_pages_master',$pagesMenuDetails);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
		}else if($method == "POST")
		{
		
			$where['menuPageID'] = $pagesMenuDetails['menuPageID'];
			// print_r($pagesMenuDetails);
			$iscreated = $this->CommonModel->updateMasterDetails('menu_pages_master',$pagesMenuDetails,$where);
			if(!$iscreated){
				$status['msg'] = $this->systemmsg->getErrorCode(998);
				$status['statusCode'] = 998;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
				
		}
		
	}

	public function deleteMenuList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$menuID = $this->input->post('menuID');
		$where=array("menuID"=>$menuID);

		$ids = $this->input->post("menuID");
		$statusCode = 'delete';	
		// $changestatus = $this->CommonModel->changeMasterStatus('pages_menu',$statusCode,$ids,'menuID');

		$changestatus = $this->CommonModel->deleteMasterDetails('pages_menu',$where);
		if(!$changestatus){

			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status,200);

		}else{
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] =array();
			$status['flag'] = 'S';	
			$this->response->output($status,200);
		}
	}
	public function updatemenuPagesList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$menuID = $this->input->post("menuID");
		$updatedList = $this->input->post("updatedList");
		$pageIDs = $this->input->post("pageIDs");
		if(isset($menuID)&&!empty($menuID))
		{
			$where=array('menuID'=>$menuID);
			$isDeleted = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
			$idlist = explode(",",$updatedList);
			
			$created_by = $this->input->post("SadminID");
			$updateDate = date("Y/m/d H:i:s");
			$position=0;
			$pageIDs = json_decode($this->input->post("pageIDs"), true);
			foreach($pageIDs as $pos=>$pageData){	
				$menuPagesList=array(
						'menuID'=>$menuID,
						'pageID'=>$pageData['pageid'],
						"created_by"=>$created_by,
						"created_date"=>$updateDate,
						"position"=>$position++
					);
				$iscreated = $this->CommonModel->saveMasterDetails('menu_pages_master',$menuPagesList);
				if(isset($pageData['children'])){
					$lastMenuPageId = $this->db->insert_id();
					foreach($pageData['children'] as $cpos=>$children){
						$menuPagesChildrenList=array(
							'menuID'=>$menuID,
							'pageID'=>$children['pageid'],
							'created_by'=>$created_by,
							'created_date'=>$updateDate,
							'parentPageID'=>$lastMenuPageId,
							'position'=>$cpos+1,
						);							
						$iscreated = $this->CommonModel->saveMasterDetails('menu_pages_master',$menuPagesChildrenList);
					}
				}
			}
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}else
		{
			$status['msg'] = "Please Select Menu";
			$status['statusCode'] = 227;
			$status['data'] =array();
			$status['flag'] = 'F';
			$this->response->output($status,200);

		}
	}
	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		$menuID = $this->input->post("menuID");
		if(trim($action) == "changePositions"){
			$pageIDs = json_decode($this->input->post("pageIDs"), true);
			// print_r($pageIDs);exit;
			foreach($pageIDs as $pos=>$pageData){
				if(isset($pageData['children'])){
					$childrens = [];
					foreach($pageData['children'] as $cpos=>$children){
						
						$subMenuPagesDetails['position']=$cpos+1;
						$subMenuPagesDetails['parentPageID']=$pageData['menupageid'];
						$where=array('menuPageID'=>$children['menupageid'],"menuID"=>$menuID);

						$this->CommonModel->updateMasterDetails('menu_pages_master',$subMenuPagesDetails,$where);
					}
				}
				$menuPagesDetails['position']=$pos+1;
				$menuPagesDetails['parentPageID']="0";
				$where=array('menuPageID'=>$pageData['menupageid'],"menuID"=>$menuID);

				$iscreated = $this->CommonModel->updateMasterDetails('menu_pages_master',$menuPagesDetails,$where);
			}
		
		//  print_r($positions);exit();
		 	/*
			$positions = $this->input->post("positions");
			foreach ($positions as $positions) {
		 	$index=$positions[0];
		 	$newPosition=$positions[1];
		 	$menuPagesDetails['position']=$newPosition;
		 	$where=array('menuPageID'=>$index);
		 	$iscreated = $this->CommonModel->updateMasterDetails('menu_pages_master',$menuPagesDetails,$where);
			 }*/
					 if(!$iscreated){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);

					}else{
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] =array();
						$status['flag'] = 'S';
						$this->response->output($status,200);
					}
		}
	}

	public function menuPagesList()	
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$menuID = $this->input->post('menuID');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "position";
			$order ="ASC";
		}

		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}
		if(isset($menuID) && !empty($menuID)){
			$wherec["menuID"] = '= ("'.$menuID.'")';
		}
		$wherec["parentPageID"] = '= 0';
		$join = array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="pages_master";
		$join[0]['alias'] ="p";
		$join[0]['key1'] ="pageID";
		$join[0]['key2'] ="pageID";
		$selectC="t.*,p.pageTitle,p.pageLink";
		if($isAll=="Y"){
			$pageList = $this->CommonModel->GetMasterListDetails($selectC,'menu_pages_master',$wherec,'','',$join,$other);
		}
		// print "<pre>";
		// print("pagelist = ");
		// print_r($pageList);exit;
		$status['data'] = '';
		if($pageList){
			$pagesDetails = [];
			foreach($pageList as $page){
				if(!empty($menuID))
					$wherec["menuID"] = '= '.$menuID;
				if($page->menuPageID != "0" && !empty($page->menuPageID))
					$wherec["parentPageID"] = '= '.$page->menuPageID;
				// print_r($wherec);
				// print("subpagelist = ");
				$subPageList = $this->CommonModel->GetMasterListDetails($selectC,'menu_pages_master',$wherec,'','',$join,$other);
				// print_r($subPageList);exit;
				$page->subMenu = $subPageList;
				$pagesDetails[] = $page;
			}
			$status['data'] = $pagesDetails;
			
			$status['msg'] = "sucess";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}
		// print "<pre>";
		// print_r($pageList);exit;
	}
	
	public function deletePageFromSelectedMenu()
	{		
			$this->access->checkTokenKey();
			$this->response->decodeRequest();
			$pageID = $this->input->post('pageID');
			$menuID = $this->input->post('menuID');
			$where=array("menuPageID"=>$pageID,"menuID"=>$menuID);

			

			$iscreated = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
			if(!$iscreated){
				// Delete child
				$where=array("parentPageID"=>$pageID,"menuID"=>$menuID);
				$iscreated = $this->CommonModel->deleteMasterDetails('menu_pages_master',$where);
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);

			}else{
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}
	}

	

	public function multiplepagesChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['pageID']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('pages_master', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('pages_master', $action, $ids, 'pageID');
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