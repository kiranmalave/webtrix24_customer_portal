<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class FormMaster extends CI_Controller {

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

	public function getFormDetailsList()
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
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "formID";
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
		// print_r($wherec);exit();
		$config["base_url"] = base_url() . "pagesDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('formID',"formMaster",$wherec);
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
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','formMaster',$wherec,'','',$join,$other);	
		}else{
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','formMaster',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
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
	public function formMasterData($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$formMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			$formMasterDetails['formTitle'] = $this->validatedata->validate('formTitle','Form Title',false,'',array());

			$formMasterDetails['description'] = $this->validatedata->validate('description','description',false,'',array()); 

			$formMasterDetails['status'] = $this->validatedata->validate('status','status',true,'',array());

			$fieldData = $this->datatables->mapDynamicFeilds("formMaster",$this->input->post());
			$formMasterDetails = array_merge($fieldData, $formMasterDetails);

			if($method=="PUT")
			{
				
				$formMasterDetails['createdBy'] = $this->input->post('SadminID');
				$formMasterDetails['createdDate'] = $updateDate;
				$formMasterDetails['modified_date'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('formMaster',$formMasterDetails);
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
				$where=array('formID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				
				$formMasterDetails['modified_by'] = $this->input->post('SadminID');
				$formMasterDetails['modified_date'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('formMaster',$formMasterDetails,$where);
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
			$formMasterDetails = array();

			$where=array('formID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('formMaster',$where);
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
			$where = array("formID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('formMaster','',$where);
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
	public function formMasterDataChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('formMaster',$statusCode,$ids,'formID');
				
			if($changestatus){

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}

	public function formQuestionMaster($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$formQuestionMasterDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST") 
		{
			$formID = $this->validatedata->validate('formID','Form Title',false,'',array());
			$formQuestionMasterDetails['sectionID'] = $this->validatedata->validate('sectionID','section ID',true,'',array()); 

			$formQuestionMasterDetails['question'] = $this->validatedata->validate('question','question',true,'',array()); 

			

			
			$formQuestionMasterDetails['formID'] = $formID;
			$formQuestionMasterDetails['fieldType'] = $this->validatedata->validate('fieldType','fieldType',true,'',array());
			$formQuestionMasterDetails['questionFieldsValues'] = $this->validatedata->validate('questionFieldsValues','questionFieldsValues',false,'',array()); 
			 
			$formQuestionMasterDetails['status'] = $this->validatedata->validate('status','status',true,'',array());

			/////////images............
				$image64 = $this->validatedata->validate('uploadFormQuestionImage','form Question Image',false,'',array()); 
				if($image64!="")
				{


				$imageName = "formQuestionImage_".rand(10,1000).".jpg";
				$formQuestionMasterDetails['formQuestionImage'] = $imageName;

	
				$imagetoup = $this->config->item("imagesPATH")."formQuestionImages/".$imageName;
				// $imagesPATH = $this->config->item('imagesPATH')."formQuestionImages/";
				$saveImage = $this->base64_to_jpeg($image64,$imagetoup);

			}
				//........................


			if($method=="PUT")
			{
				$getLastRecord=$this->CommonModel->getLastRecordID("ab_formQuestionMaster",$where="formID = $formID","questionID");	

			 if(!isset($getLastRecord)||empty($getLastRecord))
                        {
                            $lastQuestionNumber=0;

                        }else
                        {
                            $lastQuestionNumber= $getLastRecord->fieldName;
                            
                            $lastQuestionNumber=explode("question",$lastQuestionNumber,2);
                            $lastQuestionNumber=$lastQuestionNumber[1];
                        }
                       
                        $number =$lastQuestionNumber+1;
                        	$newNumber="question".$number;



					$formQuestionMasterDetails['fieldName'] = $newNumber;
				
				$formQuestionMasterDetails['createdBy'] = $this->input->post('SadminID');
				$formQuestionMasterDetails['createdDate'] = $updateDate;
				$formQuestionMasterDetails['modifiedDate'] = '0';


				
				$iscreated = $this->CommonModel->saveMasterDetails('formQuestionMaster',$formQuestionMasterDetails);
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

				$where=array('questionID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				
				$formQuestionMasterDetails['modifiedBy'] = $this->input->post('SadminID');
				$formQuestionMasterDetails['modifiedDate'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('formQuestionMaster',$formQuestionMasterDetails,$where);
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
			$formQuestionMasterDetails = array();

			$where=array('questionID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('formQuestionMaster',$where);
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

			$where = array("questionID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('formQuestionMaster','',$where);
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
	
	public function formQuestionMasterList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$formID = $this->input->post('formID');
		$sectionID = $this->input->post('sectionID');

		$statuscode = $this->input->post('status');
		
		// echo $statuscode;exit();
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "position";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();

			if(!isset($formID)||empty($formID))
			{
					$status['msg'] = $this->systemmsg->getErrorCode(227);
					$status['statusCode'] = 227;
					$status['flag'] = 'F';
					$this->response->output($status,200);

			}else
			{

				$wherec["t.formID = "] = "'".$formID."'";
			}


			

				$wherec["t.sectionID = "] = "'".$sectionID."'";



		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}
		// print_r($wherec);exit();
		$config["base_url"] = base_url() . "formQuestionMaster";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('formID',"formQuestionMaster",$wherec);
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
		// print_r($wherec);exit();
		if($isAll=="Y"){
			$formQuestionMaster = $this->CommonModel->GetMasterListDetails($selectC='','formQuestionMaster',$wherec,'','',$join,$other);	
		}else{
			$formQuestionMaster = $this->CommonModel->GetMasterListDetails($selectC='','formQuestionMaster',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
		$status['data'] = $formQuestionMaster;
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
		if($formQuestionMaster){
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
	
	public function formQuestionMasterChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('formQuestionMaster',$statusCode,$ids,'questionID');
				
			if($changestatus){

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}

	public function formQuestionImage($cID,$adminID){

		
		$_POST['SadminID'] = $adminID;
		$docType="formQuestion";
		$this->load->library('realtimeupload');
		$imagesPATH = $this->config->item('imagesPATH')."formQuestionImages/";
		
		if (!is_dir($imagesPATH.$cID)) {
			mkdir($imagesPATH.$cID,0777);
    		chmod($imagesPATH.$cID,0777);         
		}
		else{
			if (!is_writable($imagesPATH.$cID)) {
				chmod($imagesPATH.$cID,0777);
			}
		}
		$settings = array(
			'uploadFolder' => $imagesPATH.$cID,
			'extension' => ['png','pdf','jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' =>0,
			'maxFolderSize' => 0,
			'returnLocation' => true,
			'uniqueFilename'=> false,
			'dbTable'=>'formQuestionMaster',
			'fileTypeColumn'=>'type',
			'fileColumn'=>'docName',
			'forignKey'=> 'questionID',
			'forignValue'=> $cID,
			'docType'=>"docType",
			'docTypeValue'=>$docType,
		);
		//$uploader = new RealTimeUpload();
		$this->realtimeupload->init($settings);
	}
	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changePositions"){
		$positions = $this->input->post("positions");
		
		 foreach ($positions as $positions) {
		 	$index=$positions[0];
		 	$newPosition=$positions[1];
		 	$menuPagesDetails['position']=$newPosition;
		 	$where=array('questionID'=>$index);
		 	$iscreated = $this->CommonModel->updateMasterDetails('formQuestionMaster',$menuPagesDetails,$where);
			 }
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
	
	function deleteQuestionImage()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$formQuestionMasterDetails=array();
		$formQuestionMasterDetails['formQuestionImage']="";
		$action = $this->input->post("action");
		$questionID = $this->input->post("questionID");
		$where=array("questionID"=>$questionID);

		$questionDetails = $this->CommonModel->getMasterDetails('formQuestionMaster','',$where);

		$mediapath = $this->config->item("imagesPATH");
		$folderName="formQuestionImages";

		$fileName=$questionDetails[0]->formQuestionImage;
		if($fileName!="")
		{
			$unlinkFile = $this->CommonModel->unlinkFileFromFolder($mediapath,$folderName,$fileName);	
		}

		$iscreated = $this->CommonModel->updateMasterDetails('formQuestionMaster',$formQuestionMasterDetails,$where);
		
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

	public function formQuestionMasterSection($id='')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$formQuestionMasterSectionDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST") 
		{
			$formQuestionMasterSectionDetails['sectionName'] = $this->validatedata->validate('sectionName','Section Name',true,'',array());
			$formQuestionMasterSectionDetails['formID'] = $this->validatedata->validate('formID','Form ID',true,'',array());


			if($method=="PUT")
			{
				$where = array("formID = "=>$formQuestionMasterSectionDetails['formID']);
				// get last section ID from form
				$lastID = $this->CommonModel->getMasterDetails('formQuestionMasterSection','sectionIndex',$where);
				if(isset($lastID) && !empty($lastID)){
					$sectionID = count($lastID) + 1;
				}else{
					$sectionID = 1;
				}
				$formQuestionMasterSectionDetails['createdBy'] = $this->input->post('SadminID');
				$formQuestionMasterSectionDetails['createdDate'] = $updateDate;
				$formQuestionMasterSectionDetails['modifiedDate'] = '0';
				$formQuestionMasterSectionDetails['sectionIndex'] = $sectionID;
				
				$iscreated = $this->CommonModel->saveMasterDetails('formQuestionMasterSection',$formQuestionMasterSectionDetails);
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

				$where=array('sectionID'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				
				$formQuestionMasterSectionDetails['modifiedBy'] = $this->input->post('SadminID');
				$formQuestionMasterSectionDetails['modifiedDate'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('formQuestionMasterSection',$formQuestionMasterSectionDetails,$where);
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
			$formQuestionMasterSectionDetails = array();

			$where=array('sectionID'=>$id);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('formQuestionMasterSection',$where);
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
			$where = array("sectionID"=>$id);
			$userRoleHistory = $this->CommonModel->getMasterDetails('formQuestionMasterSection','',$where);
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
	
	public function formMasterQuestionSectionsList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$formID = $this->input->post('formID');

		$statuscode = $this->input->post('status');
		

		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "sectionName";
			$order ="ASC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order);
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["status"] = 'IN ("'.$statusStr.'")';
		}

		if(isset($formID) && !empty($formID)){
		
		$wherec["formID"] = '= ("'.$formID.'")';
		}else
		{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);

		}

		
		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC='','formQuestionMasterSection',$wherec,'','',$join,$other);	
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
	
	function base64_to_jpeg($base64_string, $output_file) {
	    // open the output file for writing
	    $ifp = fopen( $output_file, 'wb' ); 

	    // split the string on commas
	    // $data[ 0 ] == "data:image/png;base64"
	    // $data[ 1 ] == <actual base64 string>
	    $data = explode( ',', $base64_string );

	    // we could add validation here with ensuring count( $data ) > 1
	    fwrite( $ifp, base64_decode( $data[ 1 ] ) );

	    // clean up the file resource
	    fclose( $ifp ); 

	    return $output_file; 
	}

	public function getFormAnsMasterList()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = trim($this->input->post('textSearch'));
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');

		$statuscode = $this->input->post('status');
		
		// echo $statuscode;exit();
		$config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "qaID";
			$order ="DESC";
		}
		$other = array("orderBy"=>$orderBy,"order"=>$order,"groupBy"=>"formID,userID,qaID");
		
		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		$wherec["$textSearch like  "] = "'".$textval."%'";
		}

		if(isset($statuscode) && !empty($statuscode)){
		$statusStr = str_replace(",",'","',$statuscode);
		$wherec["t.status"] = 'IN ("'.$statusStr.'")';
		}
		// print_r($wherec);exit();
		$config["base_url"] = base_url() . "userQuestionsAndAnswers";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('qaID',"userQuestionsAndAnswers",$wherec);
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

		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="formMaster";
		$join[0]['alias'] ="f";
		$join[0]['key1'] ="formID";
		$join[0]['key2'] ="formID";

		// $join[1]['type'] ="LEFT JOIN";
		// $join[1]['table']="userRegistration";
		// $join[1]['alias'] ="u";
		// $join[1]['key1'] ="userID";
		// $join[1]['key2'] ="userID";

		// $selectC="t.*,f.formTitle,u.firstName,u.lastName,u.email";
		$selectC="t.*,f.formTitle";


		if($isAll=="Y"){
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC,'userQuestionsAndAnswers',$wherec,'','',$join,$other);	
		}else{
			$pagesDetails = $this->CommonModel->GetMasterListDetails($selectC,'userQuestionsAndAnswers',$wherec,$config["per_page"],$page,$join,$other);	
		}
		
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
	public function formAnsMaster($formID='',$userID="")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$userQuestionsAndAnswersDetails = array();
		$updateDate = date("Y/m/d H:i:s");
		if($method=="PUT"||$method=="POST")
		{
			

			$userQuestionsAndAnswersDetails['tempName'] = $this->validatedata->validate('tempName','Temp Name',true,'',array()); 
			$userQuestionsAndAnswersDetails['subject'] = $this->validatedata->validate('subject','Subject',true,'',array()); 
			$userQuestionsAndAnswersDetails['emailContent'] = $this->validatedata->validate('emailContent','Email Content',true,'',array());
			$userQuestionsAndAnswersDetails['smsContent'] = $this->validatedata->validate('smsContent','SMS Content',true,'',array());
			$userQuestionsAndAnswersDetails['status'] = $this->validatedata->validate('status','status',true,'',array());

			if($method=="PUT")
			{
				$userQuestionsAndAnswersDetails['tempUniqueID'] = "temp_".rand(0,9999);
				$userQuestionsAndAnswersDetails['createdBy'] = $this->input->post('SadminID');
				$userQuestionsAndAnswersDetails['createdDate'] = $updateDate;
				$userQuestionsAndAnswersDetails['modifiedDate'] = '0';
				
				$iscreated = $this->CommonModel->saveMasterDetails('userQuestionsAndAnswers',$userQuestionsAndAnswersDetails);
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
				$where=array('formID'=>$formID);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				
				
				$userQuestionsAndAnswersDetails['modifiedBy'] = $this->input->post('SadminID');
				$userQuestionsAndAnswersDetails['modifiedDate'] = $updateDate;
				
				$iscreated = $this->CommonModel->updateMasterDetails('userQuestionsAndAnswers',$userQuestionsAndAnswersDetails,$where);
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
			$userQuestionsAndAnswersDetails = array();

			$where=array('qaID'=>$formID);
			if(!isset($id) || empty($id)){
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}

			$iscreated = $this->CommonModel->deleteMasterDetails('userQuestionsAndAnswers',$where);
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
			$join=array();
			$join[0]['type'] ="LEFT JOIN";
			$join[0]['table']="formMaster";
			$join[0]['alias'] ="f";
			$join[0]['key1'] ="formID";
			$join[0]['key2'] ="formID";

			// $join[1]['type'] ="LEFT JOIN";
			// $join[1]['table']="userRegistration";
			// $join[1]['alias'] ="u";
			// $join[1]['key1'] ="userID";
			// $join[1]['key2'] ="userID";

			$join[2]['type'] ="LEFT JOIN";
			$join[2]['table']="formQuestionMasterSection";
			$join[2]['alias'] ="s";
			$join[2]['key1'] ="sectionID";
			$join[2]['key2'] ="sectionIndex";

			// $selectC="t.*,f.formTitle,u.firstName,u.lastName,u.email,s.sectionName";
			$selectC="t.*,f.formTitle,s.sectionName";
			$where = array("t.formID"=>$formID,"t.userID"=>$userID);
			$userRoleHistory = $this->CommonModel->GetMasterListDetails($selectC="*",'userQuestionsAndAnswers',$where,'','',$join,$other=array());	
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
	public function formAnsMasterChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('emailMaster',$statusCode,$ids,'qaID');
				
			if($changestatus){

				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
		}
	}

	public function formAnsMasterList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$formID = $this->validatedata->validate('formID','formID',true,'',array()); 
		$userID = $this->validatedata->validate('userID','userID',true,'',array()); 
		$join=array();
		$join[0]['type'] ="LEFT JOIN";
		$join[0]['table']="formMaster";
		$join[0]['alias'] ="l";
		$join[0]['key1'] ="formID";
		$join[0]['key2'] ="formID";
		$selectC="t.*,l.formTitle";
		// echo strpos($userID, "temp");exit;
		if(strpos($userID, "temp")== false)
		{

			// $join[1]['type'] ="LEFT JOIN";
			// $join[1]['table']="userRegistration";
			// $join[1]['alias'] ="u";
			// $join[1]['key1'] ="userID";
			// $join[1]['key2'] ="userID";
			// $selectC="t.*,f.formTitle,u.firstName,u.lastName,u.email";
		}
		$join[2]['type'] ="LEFT JOIN";
		$join[2]['table']="formQuestionMasterSection";
		$join[2]['alias'] ="d";
		$join[2]['key1'] ="sectionID";
		$join[2]['key2'] ="sectionIndex";

		$where = array("t.formID = "=>$formID);
		$userRoleHistory = $this->CommonModel->GetMasterListDetails($selectC="*",'userQuestionsAndAnswers',$where,'','',$join,$other=array());	
		// print_r($userRoleHistory);exit;
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