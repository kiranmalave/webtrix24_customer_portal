<?php
defined('BASEPATH') or exit('No direct script access allowed');

class CategoryMaster extends CI_Controller
{

    /**
     * Index Page for this controller.
     *
     * Maps to the following URL
     *         http://example.com/index.php/welcome
     *    - or -
     *         http://example.com/index.php/welcome/index
     *    - or -
     * Since this controller is set as the default controller in
     * config/routes.php, it's displayed at http://example.com/
     *
     * So any other public methods not categoryed with an underscore will
     * map to /index.php/welcome/<method_name>
     * @see https://codeigniter.com/user_guide/general/urls.html
     */
    public function __construct()
    {
        parent::__construct();
        $this->load->database();
        $this->load->model('CommonModel');
        // $this->load->model('TraineeModel');
        $this->load->library("pagination");
        $this->load->library("response");
        $this->load->library("ValidateData");
        $this->load->library("filters");
    }

    public function getcategoryDetails()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $isAll = $this->input->post('getAll');
        $textSearch = $this->input->post('textSearch');
        $curPage = $this->input->post('curpage');
        $category_id = $this->input->post('category_id');
        $is_parent = $this->input->post('is_parent');
        $textval = $this->input->post('textval');
        $orderBy = $this->input->post('orderBy'); //"t.created_date";
        $order = $this->input->post('order');
        $statuscode = $this->input->post('status');
        $parentID = $this->input->post('parent_id');
        $filterSName = $this->input->post('filterSName');
        $sub = $this->input->post('isSub');
        $childOf = $this->input->post('childOf');
        $isSystem = $this->input->post('is_system');
        $this->menuID = $this->input->post('menuId');
        $wherec = $join = array();
        $other = array("orderBy" => $orderBy, "order" => $order);

        if ($isAll != "Y") {
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
                $selectC = ltrim($selectC, ',');
            }
        }
        if ($childOf == 'yes') {
            $wherecid["t.categoryName"] = ' = "' . $textval . '"';
            $t = $this->CommonModel->GetMasterListDetails($selectC = '*', 'categories', $wherecid, '', '');
            $parentID = $t[0]->category_id;
            if (isset($parentID) && !empty($parentID)) {
                $wherec["t.parent_id"] = ' = "' . $parentID . '"';
                $textval = "";
                $textSearch = "";
                $is_parent = "no";
            }
        }

        if (isset($isSystem) && !empty($isSystem)) {
            $wherec["t.is_sys_category"] = ' = "yes"';
        }

        $config = array();
        if (!isset($orderBy) || empty($orderBy)) {
            $orderBy = "categories_index";
            $order = "ASC";
        }

        $config = $this->config->item('pagination');
        if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
            $textSearch = trim($textSearch);
            $wherec["$textSearch like  "] = "'" . $textval . "%'";
        }

        if (isset($is_parent) && !empty($is_parent)) {
            $wherec["t.is_parent"] = ' = "' . $is_parent . '"';
        }
        if (isset($parentID) && !empty($parentID)) {
            $wherec["t.parent_id"] = ' = "' . $parentID . '"';
        }
        $adminID = $this->input->post('SadminID');
        $config["base_url"] = base_url() . "categoryDetails";
        $config["total_rows"] = $this->CommonModel->getCountByParameter('t.category_id', 'categories', $wherec, $other, $join);
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
            $categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = '*', 'categories', $wherec, '', '', $join, $other);
        } else {
            $selectC = "t.*," . $selectC;
            $categoryDetails = $this->CommonModel->GetMasterListDetails($selectC, 'categories', $wherec, $config["per_page"], $page, $join, $other);
        }
        if ($sub == "Y") {

            foreach ($categoryDetails as $key => $value) {
                $wherec = array();
                $wherec["t.parent_id"] = ' = "' . $value->category_id . '"';
                $wherec["t.status"] = ' = "active"';
                $SubcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id,t.categoryName,slug', 'categories', $wherec, '', '', $join, $other);

                $categoryDetails[$key]->SubList = $SubcategoryDetails;
            }
        } else {
            foreach ($categoryDetails as $key => $value) {
                if (isset($value->parent_id) && !empty($value->parent_id)) {

                    $wherec = array();
                    $wherec["t.category_id"] = ' = "' . $value->parent_id . '"';
                    $other = array("orderBy" => 't.categories_index', "order" => 'ASC');
                    $SubcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.categoryName', 'categories', $wherec, '', '', $join, $other);
                    if (isset($SubcategoryDetails) && !empty($SubcategoryDetails)) {
                        // usort($SubcategoryDetails, function($a, $b) {
                        //     return $a->categories_index <=> $b->categories_index;
                        // });

                        $categoryDetails[$key]->parentCatName = $SubcategoryDetails[0]->categoryName;
                    } else {
                        $categoryDetails[$key]->parentCatName = "--";
                    }
                    if (isset($parentID) && !empty($parentID)) {
                        usort($categoryDetails, function ($a, $b) {
                            return $a->categories_index <=> $b->categories_index;
                        });
                    }
                }
            }
        }
        $status['data'] = $categoryDetails;
        $status['paginginfo']["curPage"] = $curPage;
        if ($curPage <= 1) {
            $status['paginginfo']["prevPage"] = 0;
        } else {
            $status['paginginfo']["prevPage"] = $curPage - 1;
        }

        $status['paginginfo']["pageLimit"] = $config["per_page"];
        $status['paginginfo']["nextpage"] = $curPage + 1;
        $status['paginginfo']["totalRecords"] = $config["total_rows"];
        $status['paginginfo']["start"] = $page;
        $status['paginginfo']["end"] = $page + $config["per_page"];
        $status['loadstate'] = true;
        if ($config["total_rows"] <= $status['paginginfo']["end"]) {
            $status['msg'] = $this->systemmsg->getErrorCode(232);
            $status['statusCode'] = 400;
            $status['flag'] = 'S';
            $status['loadstate'] = false;
            $this->response->output($status, 200);
        }
        if ($categoryDetails) {
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

    public function categoryMaster($category_id = "")
    {

        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $method = $this->input->method(true);
        // echo $method;
        if ($method == "POST" || $method == "PUT") {
            $categoryDetails = array();
            $updateDate = date("Y/m/d H:i:s");

            $categoryDetails['category_id'] = $this->validatedata->validate('category_id', 'category ID', false, '', array());

            $categoryDetails['parent_id'] = $this->validatedata->validate('parent_id', 'Parent Menu', false, '', array());

            $categoryDetails['categoryName'] = $this->validatedata->validate('categoryName', 'Category Name', true, '', array());

            $categoryDetails['slug'] = $this->validatedata->validate('slug', 'Category Slug', true, '', array());

            $categoryDetails['is_parent'] = $this->validatedata->validate('is_parent', 'Category Parent', true, '', array());

            $categoryDetails['description'] = $this->validatedata->validate('description', 'description', false, '', array());

            $categoryDetails['cover_image'] = $this->validatedata->validate('cover_image', 'Select Picture', false, '', array());

            $categoryDetails['cat_color'] = $this->validatedata->validate('cat_color', 'Category Color', false, '', array());

            $categoryDetails['status'] = $this->validatedata->validate('status', 'Status', false, '', array());

            //$fieldData = $this->datatables->mapDynamicFeilds("categories",$this->input->post());
            //$categoryDetails = array_merge($fieldData, $categoryDetails);
            // print_r($method);exit();
            if ($method == "PUT") {

                $where = array("categoryName" => $categoryDetails['categoryName'], 'slug' => $categoryDetails['slug']);
                $categoryExist = $this->CommonModel->getMasterDetails('categories', '', $where);
                if (!empty($categoryExist)) {
                    $status['msg'] = $this->systemmsg->getErrorCode(330);
                    $status['statusCode'] = 330;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }
                $iticode = $categoryDetails['category_id'];
                $categoryDetails['status'] = "active";
                $categoryDetails['created_by'] = $this->input->post('SadminID');
                $categoryDetails['created_date'] = $updateDate;
                $iscreated = $this->CommonModel->saveMasterDetails('categories', $categoryDetails);
                if (!$iscreated) {
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                } else {
                    $catID = $this->db->insert_id();
                    $status['lastID'] = $catID;
                    $status['msg'] = $this->systemmsg->getSucessCode(400);
                    $status['statusCode'] = 400;
                    $status['data'] = array();
                    $status['flag'] = 'S';
                    $this->response->output($status, 200);
                }
            } elseif ($method == "POST") {
                $where = array('category_id' => $category_id);
                if (!isset($category_id) || empty($category_id)) {
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }
                $categoryDetails['modified_by'] = $this->input->post('SadminID');
                $categoryDetails['modified_date'] = $updateDate;
                $iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryDetails, $where);
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
                $categoryDetails = array();
                $where = array('sID' => $sID);
                if (!isset($sID) || empty($sID)) {
                    $status['msg'] = $this->systemmsg->getErrorCode(996);
                    $status['statusCode'] = 996;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }

                $iscreated = $this->CommonModel->deleteMasterDetails('categories', $where);
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

            $where = array("category_id" => $category_id);
            $categoryDetails = $this->CommonModel->getMasterDetails('categories', '', $where);
            if (isset($categoryDetails) && !empty($categoryDetails)) {

                $status['data'] = $categoryDetails;
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

    public function CategoryChangeStatus()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $action = $this->input->post("action");
        $action = $action ?? '';
        if (trim($action) == "changeStatus") {
            $ids = $this->input->post("list");
            $statusCode = $this->input->post("status");
            $changestatus = $this->CommonModel->changeMasterStatus('categories', $statusCode, $ids, 'category_id');

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
    public function getslugList()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $isAll = $this->input->post('getAll');

        $slug = $this->input->post('slug');
        $statuscode = $this->input->post('status');
        $category_id = $this->input->post('category_id');

        $config = array();
        if (!isset($orderBy) || empty($orderBy)) {
            $orderBy = "categories_index";
            $order = "ASC";
        }
        $other = array("orderBy" => $orderBy, "order" => $order);

        $wherec = $join = array();
        if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {

            $wherec["$textSearch like  "] = "'" . $textval . "%'";
        }

        if (isset($statuscode) && !empty($statuscode)) {
            $statusStr = str_replace(",", '","', $statuscode);
            $wherec["t.status"] = 'IN ("' . $statusStr . '")';
            // print_r($wherec);exit;
        }
        if (isset($is_parent) && !empty($is_parent)) {
            $parentStr = str_replace(",", '","', $is_parent);
            $wherec["t.is_parent"] = ' = "' . $parentStr . '"';
        }

        if (isset($slug) && !empty($slug)) {
            $slugStr = str_replace(",", '","', $slug);
            $wherec["t.slug"] = 'IN ("' . $slugStr . '")';
        }
        if (isset($category_id) && !empty($category_id)) {
            $categoryStr = str_replace(",", '","', $category_id);
            $wherec["t.category_id"] = 'IN ("' . $categoryStr . '")';
        }

        $adminID = $this->input->post('SadminID');

        $join = array();
        $categoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id,slug,categoryName,parent_id,is_parent,categories_index', 'categories', $wherec, '', '', $join, $other);
        // print_r($categoryDetails);exit;
        $wherec = array();
        foreach ($categoryDetails as $key => $value) {
            $wherec["t.parent_id"] = ' = "' . $value->category_id . '"';
            $wherec["t.status"] = 'IN ("active")';
            $subcategoryDetails = $this->CommonModel->GetMasterListDetails($selectC = 'category_id,slug,categoryName,parent_id,is_parent,categories_index,cat_color', 'categories', $wherec, '', '', $join, $other);
            $categoryDetails[$key]->sublist = $subcategoryDetails;
        }

        $status['data'] = $categoryDetails;

        $status['paginginfo'] = [];
        $status['loadstate'] = true;

        if ($categoryDetails) {
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

    public function changePosition()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $action = $this->input->post("action");
        if (trim($action) == "changePositions") {
            $menuIDs = $this->input->post("menuIDs");
            foreach ($menuIDs as $key => $value) {
                $where = array('category_id' => $value);
                $categoryIndex['categories_index'] = $key + 1;
                $iscreated = $this->CommonModel->updateMasterDetails('categories', $categoryIndex, $where);
                // print_r($this->db->last_query());
                // exit;
            }

        }
    }

    public function multiplecategoryChangeStatus()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $action = $this->input->post("action");
        $ids = $this->input->post("list");
        $statusCode = $this->input->post("status");
        $menuId = $this->input->post("menuId");
        if (trim($action) == "delete") {
            $whereIn['category_id'] = $ids;
            $changestatus = $this->CommonModel->multipleDeleteMasterDetails('categories', '', $whereIn);
        } else {
            $changestatus = $this->CommonModel->changeMasterStatus('categories', $action, $ids, 'category_id');
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
