<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Service extends CI_Controller {

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
		// $this->load->model('TraineeModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
	}


	public function getserviceDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('service_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');
		$wherec = $join = array();
		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		if($isAll !="Y"){
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$menuId = $this->input->post('menuId');
			$postData = $_POST;
			$whereData = $this->filters->prepareFilterData($postData);
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
		
		// $config = array();
		if(!isset($orderBy) || empty($orderBy)){
			$orderBy = "serviceTitle";
			$order ="ASC";
		}

		$other["orderBy"] = $orderBy;
		$other["order"]= $order;
		// $other = array("orderBy"=>$orderBy,"order"=>$order);
		
		// $config = $this->config->item('pagination');
		// $wherec = $join = array();
		// if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
		// 	$textSearch = trim($textSearch);
		// 	$wherec["$textSearch like  "] = "'".$textval."%'";
		// }

		// if(isset($statuscode) && !empty($statuscode)){
		// $statusStr = str_replace(",",'","',$statuscode);
		// $wherec["t.status"] = 'IN ("'.$statusStr.'")';
		// }

		// if(isset($filterSName) && !empty($filterSName)){
		// 	$wherec["t.companyStateid"] = ' = "'.$filterSName.'"';
		// }

		// get comapny access list
		$adminID = $this->input->post('SadminID');
		// echo  $adminID;exit();
		// $where = array("adminID ="=>"'".$adminID."'");
		// $iti_registration = $this->CommonModel->GetMasterListDetails('*','iti_registration',$where,'','',array(),array());
		// if(isset($iti_registration) && !empty($iti_registration)){
		// 		//$wherec["cm.ITIID IN "] = "(".$iti_registration[0]->companyList.")";
		// }else{
		// 	$status['msg'] = $this->systemmsg->getErrorCode(263);
		// 	$status['statusCode'] = 263;
		// 	$status['flag'] = 'F';
		// 	$this->response->output($status,200);
		// }

		// Check is data process already
		// $other['whereIn'] = "ITIID";

		// $other["whereData"]=$iti_registration[0]->companyList;
		if ($isAll == "Y") {
			// $join = $wherec = array();
			if (isset($statuscode) && !empty($statuscode)) {
				$statusStr = str_replace(",", '","', $statuscode);
				$wherec["t.status"] = 'IN ("' . $statusStr . '")';
			}
		}

		$config["base_url"] = base_url() . "serviceDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('service_id','services',$wherec,$other);
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

		if ($isAll == "Y") {
			$serviceDetails = $this->CommonModel->GetMasterListDetails($selectC="service_id,serviceTitle",'services',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.service_id,t.serviceTitle,".$selectC;
			$serviceDetails = $this->CommonModel->GetMasterListDetails($selectC, 'services', $wherec, $config["per_page"], $page, $join, $other);
		}

		// $selectC="t.*,c.categoryID,c.categoryName";
		// if($isAll=="Y"){
		// 	$serviceDetails = $this->CommonModel->GetMasterListDetails($selectC='','services',$wherec,'','',$join,$other);	
		// }else{
		// 	$serviceDetails = $this->CommonModel->GetMasterListDetails($selectC='','services',$wherec,$config["per_page"],$page,$join,$other);	
		// }
		
		//print_r($companyDetails);exit;
		$status['data'] = $serviceDetails;
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
		if($serviceDetails){
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

	public function ServiceMaster($service_id="")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$serviceDetails = array();
		$updateDate = date("Y/m/d H:i:s");
			// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				// $serviceDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());

				//$serviceDetails['service_id'] = $this->validatedata->validate('service_id','service_id',false,'',array());
				$serviceDetails['serviceTitle'] = $this->validatedata->validate('serviceTitle','service Title',true,'',array());
				$serviceDetails['parent_id'] = $this->validatedata->validate('parent_id','Parent service',false,'',array());
				$serviceDetails['category_id'] = $this->validatedata->validate('category_id','Service Category',false,'',array());
				$serviceDetails['service_type'] = $this->validatedata->validate('service_type','Service Type',true,'',array());
				$serviceDetails['serviceDescription'] = $this->validatedata->validate('serviceDescription','service Description',true,'',array());
				$serviceDetails['serviceLink'] = $this->validatedata->validate('serviceLink','service Link',true,'',array());
				$serviceDetails['pageCode'] = htmlspecialchars($this->validatedata->validate('pageCode','Page Code',false,'',array()));
				$serviceDetails['pageCss'] = $this->validatedata->validate('pageCss','Page Css',false,'',array());
				$serviceDetails['pageContent'] = $this->validatedata->validate('pageContent','Page Content',false,'',array());
				$serviceDetails['serviceImage'] = $this->validatedata->validate('serviceImage','Service Image',false,'',array());
				
				if(!empty($this->input->post('category')))
				{
					// echo  $this->input->post('category');exit();
					if(is_array($this->input->post('category')))
					{
						$category=implode(",",$this->input->post('category'));
						$serviceDetails['category'] = $category;
					}else
					{
						$serviceDetails['category']=$this->input->post('category');
					}
					
				}else
				{
					$serviceDetails['category'] = "";
				}

				$fieldData = $this->datatables->mapDynamicFeilds("service",$this->input->post());
				$serviceDetails = array_merge($fieldData, $serviceDetails);
					if($method=="PUT")
					{
						// $image64 = $this->validatedata->validate('addServiceImage','Service Image',true,'',array()); 
						// if($image64!="")
						// {
						// 	$imageName = "serviceImage".rand(10,1000).".jpg";
						// 	$serviceDetails['serviceImage'] = $imageName;

						// 	$imagetoup = $this->config->item("imagesPATH")."serviceImages/".$imageName;
						// 	$saveImage = $this->base64_to_jpeg($image64,$imagetoup);
						// }
						
						//$iticode=$serviceDetails['service_id'];
						$serviceDetails['status'] = "active";
						$serviceDetails['created_by'] = $this->input->post('SadminID');
						$serviceDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('services',$serviceDetails);
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

					}elseif($method=="POST")
					{
						$where=array('service_id'=>$service_id);
						if(!isset($service_id) || empty($service_id)){
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status,200);
						}
						
						$serviceDetails['modified_by'] = $this->input->post('SadminID');
						$serviceDetails['modified_date'] = $updateDate;
						$iscreated = $this->CommonModel->updateMasterDetails('services',$serviceDetails,$where);
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
				
		
			}elseif($method=="dele")
			{
				$serviceDetails = array();
				$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('services',$where);
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
		

		}else
		{ 
			if($service_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

			$this->menuID = $this->input->post('menuId');
			$this->filters->menuID = $this->menuID;
			$this->filters->getMenuData();
			$this->dyanamicForm_Fields = $this->filters->dyanamicForm_Fields;
			$this->menuDetails = $this->filters->menuDetails;
			$wherec = $join = array();
			$menuId = $this->input->post('menuId');
			$whereData = $this->filters->prepareFilterData($_POST);
			$wherec = $whereData["wherec"];
			$other = $whereData["other"];
			$join = $whereData["join"];
			$selectC = $whereData["select"];
			
			$other = array();
			$wherec["t.service_id"] = "=".$service_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$serviceDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
			
				// $where = array("service_id"=>$service_id);
				// $serviceDetails = $this->CommonModel->getMasterDetails('services','',$where);
				if(isset($serviceDetails) && !empty($serviceDetails)){

					if(isset($serviceDetails[0]->pageCode) && !empty($serviceDetails[0]->pageCode)){
						$serviceDetails[0]->pageCode = htmlspecialchars_decode($serviceDetails[0]->pageCode);
					}	
					if(isset($serviceDetails[0]->pageContent) && !empty($serviceDetails[0]->pageContent)){
						$serviceDetails[0]->pageContent = htmlspecialchars_decode($serviceDetails[0]->pageContent);
					}
			
					
				$status['data'] = $serviceDetails;
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

    public function serviceChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
			if(trim($action) == "changeStatus"){
				$ids = $this->input->post("list");
				$statusCode = $this->input->post("status");	
				$changestatus = $this->CommonModel->changeMasterStatus('services',$statusCode,$ids,'service_id');
				
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

	public function serviceGal($docType,$service_id){

    	$this->response->decodeRequest();
		$memberID=$service_id;
		$this->load->library('realtimeupload');
		
		$imagepath = $this->config->item('imagesPATH')."serviceGallery/";
		if (!is_dir($imagepath.$memberID)) {
			mkdir($imagepath.$memberID,0777);
    		chmod($imagepath.$memberID,0777);         
		}
		else{
			if (!is_writable($imagepath.$memberID)) {
				chmod($imagepath.$memberID,0777);
			}
		}
		$settings = array(
			'uploadFolder' => $imagepath.$memberID,
			'extension' => ['png','pdf','jpg', 'jpeg', 'gif'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'returnLocation' => true,
			'uniqueFilename'=> false,
			'dbTable'=>'service_gallery',
			'fileTypeColumn'=>'type',
			'fileColumn'=>'galleryImage',
			'forignKey'=> 'service_id',
			'forignValue'=> $memberID,
			'extraData'=>array('docType'=>$docType)
		);
		//$uploader = new RealTimeUpload();
		 // print_r($docType);exit(); 
		$this->realtimeupload->init($settings);

    }
	
	public function servicegallery($masterID){

    	$where = array("service_id"=>$masterID);
		$photos = $this->CommonModel->getMasterDetails('service_gallery','',$where);
		if(isset($photos) && !empty($photos)){

			$status['data'] = $photos;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status,200);
		}
		else{
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status,200);
		}
    }

	public function deleteFile($galleryID){
	
		$where = array("galleryID"=>$galleryID);
		$tdetails = $this->CommonModel->getMasterDetails('service_gallery','service_id,galleryImage',$where);
		if(isset($tdetails) && !empty($tdetails)){

			// delete file from server
			$filePath = $this->config->item("imagesPATH");
			$del = unlink($filePath."service_gallery/".$tdetails[0]->service_id."/".$tdetails[0]->galleryImage);

			$isDel = $this->CommonModel->deleteMasterDetails('service_gallery',$where,array());
			if($isDel){
				$status['msg'] = "File Deleted";
				$status['statusCode'] = 265;
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}else{
				$status['msg'] = "Error While deleting file";
				$status['statusCode'] = 265;
				$status['flag'] = 'F';
				$this->response->output($status,200);
			}
			

		}
	
	}

	function base64_to_jpeg($base64_string, $output_file) {
	    // open the output file for writing
	    $ifp = fopen( $output_file, 'wb' );

	    // split the string on commas
	    // $data[ 0 ] == "data:image/png;base64"
	    // $data[ 1 ] == <actual base64 string>
	    $data = explode( ',', $base64_string );
		//print_r($data); exit;
	    // we could add validation here with ensuring count( $data ) > 1
	    fwrite( $ifp, base64_decode( $data[ 1 ] ) );

	    // clean up the file resource
	    fclose( $ifp ); 

	    return $output_file; 
	}

 }