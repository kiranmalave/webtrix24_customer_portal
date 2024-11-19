<?php
defined('BASEPATH') or exit('No direct script access allowed');

class MenuMaster extends CI_Controller
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
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
	}
	public function getMenuDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$show_on_website = $this->input->post('show_on_website');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "menuIndex";
			$order = "ASC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}

		if (isset($show_on_website) && !empty($show_on_website)) {
			$statusStr = str_replace(",", '","', $show_on_website);
			$wherec["show_on_website"] = 'IN ("' . $statusStr . '")';
		}

		if (isset($show_on_website) && !empty($show_on_website)) {
			$showStr = str_replace(",", '","', $show_on_website);
			$wherec["show_on_website"] = 'IN ("' . $showStr . '")';
		}

		$config["base_url"] = base_url() . "menuDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('menuID', 'menu_master', $wherec);
		$config["uri_segment"] = 2;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
		// if($isAll=="Y"){
		// 	$menuDetails = $this->CommonModel->GetMasterListDetails($selectC='','menu_master',$wherec,'','',$join,$other);	
		// }else{
		// 	$menuDetails = $this->CommonModel->GetMasterListDetails($selectC='','menu_master',$wherec,$config["per_page"],$page,$join,$other);	
		// }

		if($isAll == "Y"){
			$menuList = $this->CommonModel->GetMasterListDetails($selectC = '', 'menu_master', $wherec, '', '', $join, $other);
		}else{
			$wherec["isParent"] = '= "yes"';
			$menuList = $this->CommonModel->GetMasterListDetails($selectC = '', 'menu_master', $wherec, '', '', $join, $other);
		}

		// $wherec["isParent"] = '= "yes"';
		// $menuList = $this->CommonModel->GetMasterListDetails($selectC = '', 'menu_master', $wherec, '', '', $join, $other);
		//print count($menuList);
		// print $this->db->last_query();
		$menuDetails = [];
		foreach ($menuList  as $key => $menu) {
			if (!empty($menu))
				$wherec = array();
			$wherec["parentID"] = '= ' . $menu->menuID;
			$subMenuList = $this->CommonModel->GetMasterListDetails($selectC, 'menu_master', $wherec, '', '', $join, $other);
			$menu->subMenu = $subMenuList;
			$menuDetails[] = $menu;
		}
		//$status['data'] = $pagesDetails;

		$status['data'] = $menuDetails;

		if ($menuDetails) {
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
	public function menuMaster($id = '')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		$SadminId = $this->input->post('SadminID');
		if ($method == "PUT" || $method == "POST") {			
			$menuDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$menuDetails['isParent'] = $this->validatedata->validate('isParent','Is Parent Status',true,'',array());
			$menuDetails['menuIndex'] = $this->validatedata->validate('menuIndex','Menu Index',true,'',array());
			$menuDetails['isClick'] = $this->validatedata->validate('isClick','is clickable',true,'',array());
			$menuDetails['iconName'] = $this->validatedata->validate('iconName','Icon',false,'',array());
			$menuDetails['mobile_screen'] = $this->validatedata->validate('mobile_screen','Mobile Screen',false,'',array());
			$menuDetails['linked'] = $this->validatedata->validate('linked','Is Linked',true,'',array());
			$menuDetails['is_custom'] = $this->validatedata->validate('is_custom','Is Custom',true,'',array());
			$menuDetails['custom_module'] = $this->validatedata->validate('custom_module','Custom Module',true,'',array());
			$menuDetails['plural_label'] = $this->validatedata->validate('plural_label','Plural Label',false,'',array());
			$menuDetails['label'] = $this->validatedata->validate('label','Label',false,'',array());
			$menuDetails['module_desc'] = $this->validatedata->validate('module_desc','Description',false,'',array());
			$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
			$menuDetails['menu_custom_link'] = $this->validatedata->validate('menu_custom_link','Custom Link',false,'',array());
			$menuDetails['table_name'] = $this->validatedata->validate('table_name', 'Table Name', false, '', array());
			$menuDetails['show_on_website'] = $this->validatedata->validate('show_on_website','show on website',false,'',array());
			$menuDetails['mobile_screen'] = $this->validatedata->validate('mobile_screen','show on mobile',false,'',array());

			if ($menuDetails['isParent'] == "no") {
				$menuDetails['parentID'] = $this->validatedata->validate('parentID', 'Parent ID', true, '', array());
			} else {
				$menuDetails['parentID'] = $this->validatedata->validate('parentID', 'Parent ID', false, '', array());
			}
			$menuDetails['status'] = $this->validatedata->validate('status', 'status', true, '', array());
			if ($menuDetails['custom_module'] == "yes") {
				$menuDetails['menuLink'] = $this->validatedata->validate('menuLink', 'Menu Link', true, '', array());
			}
		}
		$this->db->trans_start();
		switch ($method) {
			case "PUT": {
					if ($menuDetails['custom_module'] == "yes") {
						$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
						// $menuDetails['module_name'] = strtolower(str_replace(" ", "_", $this->validatedata->validate('module_name', 'Module Name', false, '', array())));
					} else {
						$menuDetails['module_name'] = strtolower(str_replace(" ", "_", $this->validatedata->validate('module_name', 'Module Name', true, '', array())));
						//$menuDetails['menuName'] = $this->validatedata->validate('menuName', 'Menu Name', false, '', array());
						$menuDetails['menuLink'] = $menuDetails['module_name'];
						if(!isset($menuDetails['table_name']) || empty($menuDetails['table_name'])){
							$menuDetails['table_name'] = $menuDetails['module_name'];
						}
					}
					// check is menu name exits and rename it
					// check is menu name exits and rename it
					// I THINK NO NEED THIS CODE- Kiran
					// $where = array("menuName" => $menuDetails['menuName']);
					// $menuHistory = $this->CommonModel->getMasterDetails('menu_master', '', $where);
					// if(isset($menuHistory) && !empty($menuHistory)){
					// 	$menuDetails['menuName'] = $menuDetails['menuName']."_".rand(1,10);
					// }
					$menuDetails['created_by'] = $this->input->post('SadminID');
					$menuDetails['created_date'] = $updateDate;
					$iscreated = $this->CommonModel->saveMasterDetails('menu_master', $menuDetails);
					if (!$iscreated) {
						// if menu create and it`s not link with cutom module then create table
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					} else {
						$lastMenuID = $this->db->insert_id();
						$createdByRole = $this->getUserRoleDetails($SadminId);
						// UPDATE ACCESSLIST FOR ADMIN 
						if ($menuDetails['custom_module'] != "yes" && $menuDetails['is_custom'] != "y") {
							$this->datatables->create_table($menuDetails['module_name']);
							$accesUpdates = $this->updateForAdmin($lastMenuID,$menuDetails);
						}else{
							if ($createdByRole == 'admin') {
								$accesUpdates = $this->updateForAdmin($lastMenuID,$menuDetails);
							}
						}
						// UPDATE ACCESSLIST FOR SUPER-ADMIN EVERY TIME
						$accesUpdates = $this->updateForSuperAdmin($lastMenuID,$menuDetails);

						if ($this->db->trans_status() === FALSE) {
							$this->db->trans_rollback();
							$status['msg'] = $this->systemmsg->getSucessCode(400);
							$status['statusCode'] = 400;
							$status['data'] = array();
							$status['flag'] = 'S';
							$this->response->output($status, 200);
						} else {
							$this->db->trans_commit();
						}
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					}
					break;
				}

			case "POST": {
					$updateDate = date("Y/m/d H:i:s");
					$where = array('menuID' => $id);
					if (!isset($id) || empty($id)) {
						$status['msg'] = $this->systemmsg->getErrorCode(998);
						$status['statusCode'] = 998;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}
					$menuDetails['modified_by'] = $this->input->post('SadminID');
					$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuDetails, $where);
					if ($iscreated) {
						if ($menuDetails['isParent'] == "no") {
							if ($menuDetails['mobile_screen'] == 'yes') {
								$menuPagesDetails['mobile_screen'] = "yes";
								$where = array('menuID' => $menuDetails['parentID']);
								$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuPagesDetails, $where);
								if (!$iscreated) {
									$status['msg'] = $this->systemmsg->getErrorCode(998);
									$status['statusCode'] = 998;
									$status['data'] = array();
									$status['flag'] = 'F';
									$this->response->output($status, 200);
								}
							}
						}
					}
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
					}
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
					break;
				}
			case "DELETE": {
					$menuDetails = array();

					$where = array('menuID' => $id);
					if (!isset($id) || empty($id)) {
						$status['msg'] = $this->systemmsg->getErrorCode(996);
						$status['statusCode'] = 996;
						$status['data'] = array();
						$status['flag'] = 'F';
						$this->response->output($status, 200);
					}

					$iscreated = $this->CommonModel->deleteMasterDetails('menu_master', $where);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
						$status['msg'] = $this->systemmsg->getSucessCode(400);
						$status['statusCode'] = 400;
						$status['data'] = array();
						$status['flag'] = 'S';
						$this->response->output($status, 200);
					} else {
						$this->db->trans_commit();
					}

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
					break;
				}
			default: {
					$where = array("menuID" => $id);

					$menuHistory = $this->CommonModel->getMasterDetails('menu_master', '', $where);

					$whereColData["menu_id"] = $id;
					$whereColData["user_id"] = $this->input->post('SadminID');
					$dynamicColumnArrangement = $this->CommonModel->getMasterDetails("user_column_data","c_metadata",$whereColData);
					if ($this->db->trans_status() === FALSE) {
						$this->db->trans_rollback();
					} else {
						$this->db->trans_commit();
					}

					if (isset($menuHistory) && !empty($menuHistory)) {
						if(isset($dynamicColumnArrangement) && !empty($dynamicColumnArrangement)){
							$menuHistory[0]->c_metadata = $dynamicColumnArrangement[0]->c_metadata;
						}
						$dynamicFieldHtml = "";
						$wherec["menuID="] = $id;
						$other = array("orderBy" => "fieldIndex", "order" => "ASC");
						$dynamicFields = $this->CommonModel->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, '', '', '', $other);
						$menuHistory["dynamicFields"] = $dynamicFields;
						$status['data'] = $menuHistory;
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
					break;
				}
		}
	}
	public function updateForSuperAdmin($menuID,$menuDetails){
		$mdata = array();
		
		$mdata['menuID'] = $menuID;
		$mdata['menuName'] = $menuDetails['menuName'];
		$mdata['parentID'] = $menuDetails['parentID'] ;
		$mdata['menuLink'] = $menuDetails['menuLink'];
		$mdata['add'] = 'yes';
		$mdata['edit'] = 'yes';
		$mdata['delete'] = 'yes';
		$mdata['view'] = 'yes';
		$mdata['module_access'] = 'yes';

		$where = array("slug"=>'super_admin');
		$userRoleDetails = $this->CommonModel->getMasterDetails('user_role_master','slug,roleID',$where);
		if (isset($userRoleDetails) && !empty($userRoleDetails)) {
			if (isset($userRoleDetails[0]->roleID) && !empty($userRoleDetails[0]->roleID)) {
				$where = array("roleID =" => "'" . $userRoleDetails[0]->roleID . "'");
				$preMenuList =  array();
				$modelAccess = $this->CommonModel->GetMasterListDetails('*', 'model_access', $where, '', '', array(), array());	
				if (isset($modelAccess) && !empty($modelAccess)) {
					$preMenuList = json_decode($modelAccess[0]->accessList);
				} else {
					$preMenuList = array();
				}
				$preMenuList[] = $mdata;
				$data['roleID'] = $userRoleDetails[0]->roleID;
				$data['accessList'] = json_encode($preMenuList);
				$where = array('roleID' => $userRoleDetails[0]->roleID);
				$issave = $this->CommonModel->updateMasterDetails("model_access", $data, $where);
				if ($issave) {
					return true;
				} else {
					return false;
				}
			}else{
				return false;
			}
		}else{
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function updateForAdmin($menuID,$menuDetails){
		$mdata = array();
		$mdata['menuID'] = $menuID;
		$mdata['menuName'] = $menuDetails['menuName'];
		$mdata['parentID'] = $menuDetails['parentID'] ;
		$mdata['menuLink'] = $menuDetails['menuLink'];
		$mdata['add'] = 'no';
		$mdata['edit'] = 'no';
		$mdata['delete'] = 'no';
		$mdata['view'] = 'yes';
		$mdata['module_access'] = 'yes';

		$where = array("slug"=>'admin');
		$userRoleDetails = $this->CommonModel->getMasterDetails('user_role_master','slug,roleID',$where);
		if (isset($userRoleDetails) && !empty($userRoleDetails)) {
			if (isset($userRoleDetails[0]->roleID) && !empty($userRoleDetails[0]->roleID)) {
				$where = array("roleID =" => "'" . $userRoleDetails[0]->roleID . "'");
				$preMenuList =  array();
				$modelAccess = $this->CommonModel->GetMasterListDetails('*', 'model_access', $where, '', '', array(), array());	
				if (isset($modelAccess) && !empty($modelAccess)) {
					$preMenuList = json_decode($modelAccess[0]->accessList);
				} else {
					$preMenuList = array();
				}
				$preMenuList[] = $mdata;
				$data['roleID'] = $userRoleDetails[0]->roleID;
				$data['accessList'] = json_encode($preMenuList);
				$where = array('roleID' => $userRoleDetails[0]->roleID);
				$issave = $this->CommonModel->updateMasterDetails("model_access", $data, $where);
				if ($issave) {
					return true;
				} else {
					return false;
				}
			}else{
				return false;
			}
		}else{
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function getUserRoleDetails($adminID){
		$whereA = array("adminID"=> $adminID);
		$adminDetails = $this->CommonModel->getMasterDetails('admin','roleID',$whereA);
		if (isset($adminDetails) && !empty($adminDetails)) {
			$whereR = array("roleID"=> $adminDetails[0]->roleID);
			$userRoleDetails = $this->CommonModel->getMasterDetails('user_role_master','slug,roleID',$whereR);
			if (isset($userRoleDetails) && !empty($userRoleDetails)) {
				return $userRoleDetails[0]->slug;
			}else{
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}else{
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function menuChangeStatus(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changeStatus") {
			$ids = $this->input->post("list");
			$statusCode = $this->input->post("status");
			$changestatus = $this->CommonModel->changeMasterStatus('menu_master', $statusCode, $ids, 'menuID');

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
		if (trim($action) == "permanentDelete") {
			
			$ids = $this->input->post("list");
			//delete menu
			$this->db->trans_start();
			$tableDetails = $this->CommonModel->getMasterDetails("menu_master","table_name,custom_module",array("menuID"=>$ids));
			if(isset($tableDetails[0]->custom_module) && $tableDetails[0]->custom_module == "yes"){
				// print("permanentDelete");exit;
				// $this->db->trans_rollback();
				// $status['data'] = array();
				// $status['msg'] = $this->systemmsg->getErrorCode(235);
				// $status['statusCode'] = 996;
				// $status['flag'] = 'F';
				// $this->response->output($status, 200);
				$del = $this->CommonModel->deleteMasterDetails("menu_master",array("menuID"=>$ids),array());
				// $submenuDetails["isParent"]= "yes";
				// $submenuDetails["parentID"]= null;
				// $submenuDetails["menuIndex"]= 999;
				// $whereS = array('parentID' =>$ids);
				// $subMenuUpdate = $this->CommonModel->updateMasterDetails("menu_master", $submenuDetails, $whereS);

				if ($this->db->trans_status() === FALSE) {
					$this->db->trans_rollback();
					$status['data'] = array();
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}else{
					$this->db->trans_commit();
					$status['data'] = array();
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
			$del = $this->CommonModel->deleteMasterDetails("menu_master",array("menuID"=>$ids),array());
			// $submenuDetails["isParent"]= "yes";
			// $submenuDetails["parentID"]= null;
			// $submenuDetails["menuIndex"]= 999;
			// $whereS = array('parentID' =>$ids);
			// $subMenuUpdate = $this->CommonModel->updateMasterDetails("menu_master", $submenuDetails, $whereS);
			if(isset($tableDetails[0]->table_name) && !empty($tableDetails[0]->table_name)){
				$this->datatables->delete_table($tableDetails[0]->table_name);
			}
			if ($this->db->trans_status() === FALSE) {
				$this->db->trans_rollback();
				$status['data'] = array();
				$status['msg'] = $this->systemmsg->getErrorCode(996);
				$status['statusCode'] = 996;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}else{
				$this->db->trans_commit();
				$status['data'] = array();
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			}
		}
	}
	public function getMenuList(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$order = array("orderBy" => "menuIndex", "order" => "ASC");
		$where = array("status =" => "'active'", "isParent =" => "'yes'");
		$menuHistory = $this->CommonModel->GetMasterListDetails('*', 'menu_master', $where, '', '', array(), $order);
		foreach ($menuHistory as $key => $value) {

			$whereSub = array("status" => "active", "isParent" => "no", "parentID" => $value->menuID);
			$subMenuHistory = $this->CommonModel->getMasterDetails('menu_master', '', $whereSub);
			$menuHistory[$key]->subMenu = $subMenuHistory;
		}
		if (isset($menuHistory) && !empty($menuHistory)) {
			$status['data'] = $menuHistory;
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
	public function accessMenuList($roleID = ''){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = $this->input->post('SadminID');
		$method = $this->input->method(TRUE);

		$order = array();
		$where = array("roleID =" => "'" . $roleID . "'");
		$modelAccess = $this->CommonModel->GetMasterListDetails('*', 'model_access', $where, '', '', array(), array());
		if (isset($modelAccess) && !empty($modelAccess)) {
			$preMenuList = json_decode($modelAccess[0]->accessList);
		} else {
			$preMenuList = array();
		}
		if ($method == "PUT" || $method == "POST") {

			$updateDate = date("Y/m/d H:i:s");
			$saveAccess =  array();
			foreach ($_POST as $key => $value) {
				if (is_object($value) && !empty($value->menuID)) {
					unset($value->subMenu);
					$saveAccess[] = $value;
				}
			}
			$data['roleID'] = $roleID;
			$data['accessList'] = json_encode($saveAccess);
			// print"<pre>";
			// print_r($saveAccess);exit;
			if (isset($modelAccess) && !empty($modelAccess)) {
				// update
				$data['modified_by'] = $adminID;
				$data['modified_date'] = $updateDate;
				$where = array('roleID' => $roleID);
				$issave = $this->CommonModel->updateMasterDetails("model_access", $data, $where);
			} else {
				// add 
				$data['created_by'] = $adminID;
				$data['created_date'] = $updateDate;
				$issave = $this->CommonModel->saveMasterDetails("model_access", $data);
			}

			if ($issave) {

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

		$where = array("status =" => "'active'");
		$order = array("orderBy" => "menuIndex", "order" => "ASC");
		$where["isParent"] = '= "yes"';
		$menuHistory = $this->CommonModel->GetMasterListDetails('menuID,menuName,parentID,menuLink', 'menu_master', $where, '', '', array(), $order);
		$menuDetails = [];
		// print_r($menuHistory);
		foreach ($menuHistory as $key => $value) {

			if (!empty($value))
				$wherec = array();
			$wherec["parentID"] = '= ' . $value->menuID;
			$subMenuList = $this->CommonModel->GetMasterListDetails('menuID,menuName,parentID,menuLink', 'menu_master', $wherec, '', '',array(),array());
			$submenuDetails = array();
			// print "<pre>";
			// print_r($preMenuList);
			foreach ($subMenuList as $key_sub => $value_sub) {
				# code...
				$submenuDetails[] = $value_sub;
				$submenuDetails[$key_sub]->add = "no";
				$submenuDetails[$key_sub]->edit = "no";
				$submenuDetails[$key_sub]->delete = "no";
				$submenuDetails[$key_sub]->view = "no";
				$submenuDetails[$key_sub]->module_access = "no";
			
				foreach ($preMenuList as $key2_sub => $value2_sub) {
					if (isset($value2_sub) && !empty($value2_sub)) {
						if ($value2_sub->menuID == $value_sub->menuID) {
							$submenuDetails[$key_sub]->add = isset($value2_sub->add) ? $value2_sub->add : "no";
							$submenuDetails[$key_sub]->edit = isset($value2_sub->edit) ? $value2_sub->edit : "no";
							$submenuDetails[$key_sub]->delete = isset($value2_sub->delete) ? $value2_sub->delete : "no";
							$submenuDetails[$key_sub]->view = isset($value2_sub->view) ? $value2_sub->view : "no";
							$submenuDetails[$key_sub]->module_access = isset($value2_sub->module_access) ? $value2_sub->module_access : "no";
						}
					}
				}
				
			}
			$value->subMenu = $submenuDetails;
			$menuDetails[$key] = $value;
			$menuDetails[$key]->add = "no";
			$menuDetails[$key]->edit = "no";
			$menuDetails[$key]->delete = "no";
			$menuDetails[$key]->view = "no";
			$menuDetails[$key]->module_access = "no";

			foreach ($preMenuList as $key1 => $value_m) {
				if (isset($value_m) && !empty($value_m)) {
					if ($value->menuID == $value_m->menuID) {
						$menuDetails[$key]->add = $value_m->add;
						$menuDetails[$key]->edit = $value_m->edit;
						$menuDetails[$key]->delete = $value_m->delete;
						$menuDetails[$key]->view = $value_m->view;
						if(isset($value_m->module_access))
							$menuDetails[$key]->module_access =$value_m->module_access;
						else
							$menuDetails[$key]->module_access ="no";
					}
				}
			}
		}
		if (isset($menuDetails) && !empty($menuDetails)) {
			$status['data'] = $menuDetails;
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
	public function getUserPermission(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$adminID = $this->input->post('SadminID');
		$where = array("adminID" => $adminID);
		$userDetails = $this->CommonModel->getMasterDetails("admin", "roleID", $where);
		if (!isset($userDetails) || empty($userDetails)) {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
		$order = array();
		$where = array("roleID =" => "'" . $userDetails[0]->roleID . "'");
		$modelAccess = $this->CommonModel->GetMasterListDetails('roleID,accessList', 'model_access', $where, '', '', array(), array());
		$roleArr = array();
		if (isset($modelAccess) && !empty($modelAccess)) {
			$preMenuList = json_decode($modelAccess[0]->accessList);
			foreach ($preMenuList as $key => $value) {
				$where  = array("menuID = "=>$value->menuID);
				$getMobileName = $this->CommonModel->GetMasterListDetails('mobile_screen','menu_master',$where,'','',array(),array());
				if(isset($getMobileName) && !empty($getMobileName)){
					$value->mobile_screen =  $getMobileName[0]->mobile_screen;
				}else{
					$value->mobile_screen =  "";
				}
				$roleArr[$value->menuLink] = $value;
			}
			$status['data'] = $roleArr;
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(274);
			$status['statusCode'] = 274;
			$status['data'] = array();
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function userAccess()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$updateDate = date("Y/m/d H:i:s");
		$list = $this->input->post('list');
		$userID = $this->input->post('adminID');
		$adminID = $this->input->post('SadminID');

		$where = array("adminID =" => "'" . $userID . "'");
		$companyAccess = $this->CommonModel->GetMasterListDetails('*', 'companyAccess', $where, '', '', array(), array());

		$data['adminID'] = $userID;
		$data['companyList'] = $list;

		if (isset($companyAccess) && !empty($companyAccess)) {
			// update
			$data['modified_by'] = $adminID;
			$data['modified_date'] = $updateDate;
			$where = array('adminID' => $userID);
			$issave = $this->CommonModel->updateMasterDetails("companyAccess", $data, $where);
		} else {
			// add 
			$data['created_by'] = $adminID;
			$data['created_date'] = $updateDate;
			$issave = $this->CommonModel->saveMasterDetails("companyAccess", $data);
		}

		if ($issave) {

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
	public function accessCompanyList($userID = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$this->load->model('SearchAdminModel');
		$where = array("status =" => "'active'");
		$companyList = $this->CommonModel->GetMasterListDetails('*', 'companyMaster', $where, '', '', array(), array());

		$where = array("adminID =" => "'" . $userID . "'");
		$companyAccess = $this->CommonModel->GetMasterListDetails('*', 'companyAccess', $where, '', '', array(), array());


		if (isset($companyAccess) && !empty($companyAccess)) {
			$list = explode(",", $companyAccess[0]->companyList);
			$accList = $this->SearchAdminModel->getAccessCompanyList($list);
			$data['companyAccess'] = $accList;
		} else {
			$data['companyAccess'] = array();
		}
		$data['companyList'] =  $companyList;
		$status['data'] = $data;
		$status['statusCode'] = 200;
		$status['flag'] = 'S';
		$this->response->output($status, 200);
	}
	public function updatePositions()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		if (trim($action) == "changePositions") {
			$iscreated = false;
			$menuIDs = json_decode($this->input->post("menuIDs"), true);
			foreach ($menuIDs as $pos => $menuData) {
				$mobile_screen = 'no';
				if (isset($menuData['children']) && !empty($menuData['children'])) {
					$childrens = [];
					foreach ($menuData['children'] as $cpos => $children) {
						$subMenuPagesDetails['menuIndex'] = $cpos + 1;
						$subMenuPagesDetails['parentID'] = $menuData['id'];
						$subMenuPagesDetails['isParent'] = "no";
						$where = array("menuID" => $children['id']);
						$show_mobile = $this->menuDetails($children['id']);
						if ($show_mobile == 'yes') {
							$mobile_screen = $show_mobile;
						}
						$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $subMenuPagesDetails, $where);
						if (!$iscreated) {
							$status['msg'] = $this->systemmsg->getErrorCode(998);
							$status['statusCode'] = 998;
							$status['data'] = array();
							$status['flag'] = 'F';
							$this->response->output($status, 200);
						}
					}
				}
				$menuPagesDetails['menuIndex'] = $pos + 1;
				$menuPagesDetails['isParent'] = "yes";
				$menuPagesDetails['parentID'] = "0";
				if ($mobile_screen == 'yes') {
					$menuPagesDetails['mobile_screen'] = "yes";
				}

				$where = array('menuID' => $menuData['id']);
				$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $menuPagesDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
			}

			
			$status['msg'] = $this->systemmsg->getSucessCode(400);
			$status['statusCode'] = 400;
			$status['data'] = array();
			$status['flag'] = 'S';
			$this->response->output($status, 200);
			
		}
	}

	public function menuDetails($menuID){
		$where = array('menuID' => $menuID);
		$menuDetails = $this->CommonModel->getMasterDetails('menu_master', 'mobile_screen', $where);
		if (isset($menuDetails) && !empty($menuDetails)) {
			return $menuDetails[0]->mobile_screen;
		}else{
			return 'no';
		}
	}
	public function saveMetaData(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$menuId = $this->input->post("menuId");
		$metadata = $this->input->post("htmlContent");
		$arr = array("metadata" => $metadata);
		$where = array("menuID" => $menuId);
		$iscreated = $this->CommonModel->updateMasterDetails('menu_master', $arr, $where);
		
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
}
