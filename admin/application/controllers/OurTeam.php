<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class OurTeam extends CI_Controller {

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

	public function getteamDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$ITIID = $this->input->post('team_id');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		$filterSName = $this->input->post('filterSName');

		$config = $this->config->item('pagination');
		$this->menuID = $this->input->post('menuId');
		$wherec = $join = array();
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
					"category_id" => ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"],		
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
			$orderBy = "name";
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

		$config["base_url"] = base_url() . "teamDetails";
	    $config["total_rows"] = $this->CommonModel->getCountByParameter('t.team_id','our_team',$wherec,$other);
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
			$teamDetails = $this->CommonModel->GetMasterListDetails($selectC="team_id,name",'our_team',$wherec,'','',$join,$other);	
		}else{
			$selectC = "t.team_id,t.name,t.created_date,c.categoryName,".$selectC;
			$teamDetails = $this->CommonModel->GetMasterListDetails($selectC, 'our_team', $wherec, $config["per_page"], $page, $join, $other);
		}
		

		// if($isAll=="Y"){
		// 	$join = array();
		// 	$teamDetails = $this->CommonModel->GetMasterListDetails($selectC='*','our_team',$wherec,'','',$join,$other);	
		// }else{
			
		// 	// $join = array();
		// 	// $join[0]['type'] ="LEFT JOIN";
		// 	// $join[0]['table']="stateMaster";
		// 	// $join[0]['alias'] ="s";
		// 	// $join[0]['key1'] ="state";
		// 	// $join[0]['key2'] ="stateID";

		// 	// $join[1]['type'] ="LEFT JOIN";
		// 	// $join[1]['table']="districtMaster";
		// 	// $join[1]['alias'] ="d";
		// 	// $join[1]['key1'] ="district";
		// 	// $join[1]['key2'] ="districtID";
			
		// 	$selectC = "*";
		// 	$teamDetails = $this->CommonModel->GetMasterListDetails($selectC='*','our_team',$wherec,$config["per_page"],$page,$join,$other);

		// }
		//print_r($companyDetails);exit;
		$status['data'] = $teamDetails;
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
		if($teamDetails){
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

	public function ourTeam($team_id="")
	{
		
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		// echo $method;
		if($method=="POST"||$method=="PUT")
		{
				$teamDetails = array();
				$updateDate = date("Y/m/d H:i:s");
				// $teamDetails['regiNoYSF'] = $this->validatedata->validate('regiNoYSF','regiNoYSF',true,'',array());
				$teamDetails['team_id'] = $this->validatedata->validate('team_id','team_id',false,'',array());
				$teamDetails['name'] = $this->validatedata->validate('name','Member Name',true,'',array());
				$teamDetails['position'] = $this->validatedata->validate('position','Member Designation',false,'',array());
				$teamDetails['description'] = $this->validatedata->validate('description','Member Description',false,'',array());
				$teamDetails['member_image'] = $this->validatedata->validate('member_image','Member Image',false,'',array());
				// $teamDetails['category_id'] = $this->validatedata->validate('category_id','Category ',false,'',array());
				$teamDetails['instagram'] = $this->validatedata->validate('instagram','Instagram link',false,'',array());
				$teamDetails['facebook'] = $this->validatedata->validate('facebook','Facebook link',false,'',array());
				$teamDetails['linkedin'] = $this->validatedata->validate('linkedin','Linkedin link',false,'',array());
				$teamDetails['website'] = $this->validatedata->validate('website','Website link',false,'',array());
				$teamDetails['whatsapp'] = $this->validatedata->validate('whatsapp','Whatsapp link',false,'',array());
				$teamDetails['show_on_website'] = $this->validatedata->validate('show_on_website','Show on website',false,'',array());
				$teamDetails['team_order'] = $this->validatedata->validate('team_order','Team Order',false,'',array());

				$category_id = $this->input->post('category_id');
				// print(gettype($category_id));exit;
		
				if (gettype($category_id) == 'array') {
					$category_idString = str_replace(",", '","', $sys_user_id);
					$string = implode(',', $sys_user_idString);
					$teamDetails['category_id'] = $string;
				}else{
					$teamDetails['category_id'] = $category_id;
				}

				$fieldData = $this->datatables->mapDynamicFeilds("ourteam",$this->input->post());
				$teamDetails = array_merge($fieldData, $teamDetails);

				if($method=="PUT")
					{
						$iticode=$teamDetails['team_id'];
						$teamDetails['status'] = "active";
						$teamDetails['created_by'] = $this->input->post('SadminID');
						$teamDetails['created_date'] = $updateDate;
						$iscreated = $this->CommonModel->saveMasterDetails('our_team',$teamDetails);
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
						$where=array('team_id'=>$team_id);
						if(!isset($team_id) || empty($team_id)){
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status,200);
					}
					$teamDetails['modified_by'] = $this->input->post('SadminID');
					$teamDetails['modified_date'] = $updateDate;
					$iscreated = $this->CommonModel->updateMasterDetails('our_team',$teamDetails,$where);
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
			$teamDetails = array();
			$where=array('sID'=>$sID);
				if(!isset($sID) || empty($sID)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('our_team',$where);
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
			if($team_id ==""){
				$status['msg'] = $this->systemmsg->getSucessCode(400);
				$status['statusCode'] = 400;
				$status['data'] =array();
				$status['flag'] = 'S';
				$this->response->output($status,200);
			}

			$this->menuID = $this->input->post('menuId');
			// print($this->menuID);exit;
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
			$wherec["t.team_id"] = "=".$team_id;
			if($selectC != ""){
				$selectC="t.*,".$selectC;
			}
			$teamDetails = $this->CommonModel->GetMasterListDetails($selectC, $this->menuDetails->table_name, $wherec, '', '', $join, array());
				
				// $where = array("team_id"=>$team_id);
				// $teamDetails = $this->CommonModel->getMasterDetails('our_team','',$where);
				if(isset($teamDetails) && !empty($teamDetails)){

				$status['data'] = $teamDetails;
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

    public function OurTeamChangeStatus()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest(); 
		$action = $this->input->post("action");
		if(trim($action) == "changeStatus"){
			$ids = $this->input->post("list");
			$whereIn ['team_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('our_team', '',$whereIn);
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
	public function multipleteamChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$ids = $this->input->post("list");
		$statusCode = $this->input->post("status");
		$menuId = $this->input->post("menuId");
		if (trim($action) == "delete") {
			$whereIn ['team_id']= $ids;
			$changestatus = $this->CommonModel->multipleDeleteMasterDetails('our_team', '',$whereIn);
		}else{
			$changestatus = $this->CommonModel->changeMasterStatus('our_team', $action, $ids, 'team_id');
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