<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Product extends CI_Controller
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
     * So any other public methods not prefixed with an underscore will
     * map to /index.php/welcome/<method_name>
     * @see https://codeigniter.com/user_guide/general/urls.html
     */
    public function __construct()
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

    public function productMasterList()
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
        $this->menuID = $this->input->post('menuId');
        $selectC = '';
        $join = $other = array();
        if ($isAll != "Y") {
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
            if (isset($this->menuDetails->c_metadata) && !empty($this->menuDetails->c_metadata)) {
                $colData = array_column(json_decode($this->menuDetails->c_metadata), "column_name");
                $columnNames = [
                    "company_id" => ["table" => "info_settings", "alias" => "dc", "column" => "companyName", "key2" => "infoID"],
                    "modified_by" => ["table" => "admin", "alias" => "am", "column" => "name", "key2" => "adminID"],
                    "created_by" => ["table" => "admin", "alias" => "ad", "column" => "name", "key2" => "adminID"],
                    "product_type" => ["table" => "categories", "alias" => "c", "column" => "categoryName", "key2" => "category_id"],
                    "unit" => ["table" => "categories", "alias" => "cu", "column" => "categoryName", "key2" => "category_id"],
                    "product_id" => ["table" => "stocks", "alias" => "s", "column" => "qtyBalance", "key2" => "productID"],
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
                        if ($columnData["column"] == 'qtyBalance') {
                            $selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as qtyBalance";
                        } else {
                            $selectC .= "," . $columnData["alias"] . "." . $columnNameShow . " as " . $columnName;
                        }
                    }
                }
                $selectC = ltrim($selectC, ',');
            }
        }
        if ($selectC != '') {
            $selectC .= ',discount_type';
        } else {
            $selectC .= 'discount_type';
        }
        $config = array();
        $config = $this->config->item('pagination');

        if (!isset($orderBy) || empty($orderBy)) {
            $orderBy = "product_id";
            $order = "DESC";
        } else {
            $orderBy = "t." . $orderBy;
        }

        $other['orderBy'] = $orderBy;
        $other['order'] = $order;
        if (isset($statuscode) && !empty($statuscode)) {
            $statusStr = str_replace(",", '","', $statuscode);
            $wherec["t.status"] = 'IN ("' . $statusStr . '")';
        }
        $config["base_url"] = base_url() . "productDetailsList";

        // print_r($other);exit;
        $config["total_rows"] = $this->CommonModel->getCountByParameter('product_id', "products", $wherec, $other, $join);
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
            $pagesDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*,c.categoryName As product_type,s.qtyBalance,ad.name as created_by,am.name as modified_by', 'products', $wherec, '', '', $join, $other);
        } else {
            $pagesDetails = $this->CommonModel->GetMasterListDetails($selectC, 'products', $wherec, $config["per_page"], $page, $join, $other);
        }
        $status['data'] = $pagesDetails;
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

    public function productMaster($product_id = "")
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $method = $this->input->method(true);
        if ($method == "POST" || $method == "PUT") {
            $productDetails = array();
            $updateDate = date("Y/m/d H:i:s");
            $productDetails['product_description'] = $this->validatedata->validate('product_description', 'Product Description', false, '', array());
            $productDetails['product_type'] = $this->validatedata->validate('product_type', 'Product Type', true, '', array());
            $productDetails['product_Name'] = $this->validatedata->validate('product_name', 'Product Name', true, '', array());
            $productDetails['price'] = $this->validatedata->validate('price', 'Price', false, '', array());
            $productDetails['compare_price'] = $this->validatedata->validate('compare_price', 'Compare Price', false, '', array());
            $productDetails['actual_cost'] = $this->validatedata->validate('actual_cost', 'Actual Price', false, '', array());
            $productDetails['profit'] = $this->validatedata->validate('profit', 'Profit', false, '', array());
            $productDetails['margin'] = $this->validatedata->validate('margin', 'Margin', false, '', array());
            $productDetails['shipping'] = $this->validatedata->validate('shipping', 'Shipping', false, '', array());
            $productDetails['track_quantity'] = $this->validatedata->validate('track_quantity', 'Track Qauntity', false, '', array());
            $productDetails['barcode'] = $this->validatedata->validate('barcode', 'Barcode', false, '', array());
            $productDetails['with_gst'] = $this->validatedata->validate('with_gst', 'With GST', false, '', array());
            ($productDetails['with_gst'] == 'yes') ?
            $productDetails['gst'] = $this->validatedata->validate('gst', 'GST', true, '', array()) :
            $productDetails['gst'] = $this->validatedata->validate('gst', 'GST', false, '', array());
            $productDetails['unit'] = $this->validatedata->validate('unit', 'Unit', false, '', array());
            $productDetails['discount'] = $this->validatedata->validate('discount', 'Discount', false, '', array());
            $productDetails['discount_type'] = $this->validatedata->validate('discount_type', 'discount_type', false, '', array());
            $productDetails['is_amc'] = $this->validatedata->validate('is_amc', 'is Amc', false, '', array());
            $productDetails['free_servicing'] = $this->validatedata->validate('free_servicing', 'Free Servicing', false, '', array());
            $productDetails['amc_duration'] = $this->validatedata->validate('amc_duration', 'Amc Duration', false, '', array());
            ($productDetails['track_quantity'] == 'yes') ?
            $productDetails['quantity'] = $this->validatedata->validate('quantity', 'Quantity', true, '', array()) :
            $productDetails['quantity'] = $this->validatedata->validate('quantity', 'Quantity', false, '', array());
            $fieldData = $this->datatables->mapDynamicFeilds("products", $this->input->post());
            $productDetails = array_merge($fieldData, $productDetails);
            if ($method == "PUT") {
                $this->validProduct($productDetails);
                $this->db->trans_begin();
                $where = array("product_id" => $product_id);
                $productDetails['created_by'] = $this->input->post('SadminID');
                $productDetails['created_date'] = $updateDate;
                $iscreated = $this->CommonModel->saveMasterDetails('products', $productDetails);
                if (!$iscreated) {
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                } else {
                    $productID = $this->db->insert_id();
                    if ($productDetails['track_quantity'] == 'yes') {
                        $pd = array("productID" => $productID, "qtyOpen" => $productDetails['quantity'], "qtyBalance" => $productDetails['quantity']);
                        $iscreated = $this->CommonModel->saveMasterDetails('stocks', $pd);
                        if (!$iscreated) {
                            $this->db->trans_rollback();
                            $status['msg'] = $this->systemmsg->getErrorCode(998);
                            $status['statusCode'] = 998;
                            $status['data'] = array();
                            $status['flag'] = 'F';
                            $this->response->output($status, 200);
                        } else {
                            $this->db->trans_commit();
                        }
                    } else {
                        $this->db->trans_commit();
                    }
                    $status['msg'] = $this->systemmsg->getSucessCode(400);
                    $status['statusCode'] = 400;
                    $status['data'] = array();
                    $status['flag'] = 'S';
                    $this->response->output($status, 200);
                }
            } elseif ($method == "POST") {
                $this->validProduct($productDetails, $product_id);
                $where = array('product_id' => $product_id);
                if (!isset($product_id) || empty($product_id)) {
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }
                $productDetails['modified_by'] = $this->input->post('SadminID');
                $productDetails['modified_date'] = $updateDate;
                $where = array("product_id" => $product_id);
                $oldQty = $this->CommonModel->getMasterDetails('products', 'quantity', $where);
                $iscreated = $this->CommonModel->updateMasterDetails('products', $productDetails, $where);
                if (!$iscreated) {
                    $status['msg'] = $this->systemmsg->getErrorCode(998);
                    $status['statusCode'] = 998;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                } else {
                    if ($productDetails['track_quantity'] == 'yes') {
                        $whereP = array('productID' => $product_id);
                        $getStock = $this->CommonModel->getMasterDetails('stocks', '', $whereP);

                        if (isset($getStock) && !empty($getStock)) {
                            $qtyIn = $getStock[0]->qtyIn;
                            $qtyOut = $getStock[0]->qtyOut;
                            $qtyOpen = $getStock[0]->qtyOpen;
                            $qtyBalance = $getStock[0]->qtyBalance;
                            $getQtyOpen = number_format(((floatval($qtyOpen) - floatval($oldQty[0]->quantity)) + floatval($productDetails['quantity'])), 2, '.', '');
                            $getQtyBlce = number_format((floatval($getQtyOpen) + floatval($qtyIn)) - floatval($qtyOut), 2, '.', '');
                            $avblStock['qtyOpen'] = $getQtyOpen;
                            $avblStock['qtyBalance'] = $getQtyBlce;

                            $isinsert1 = $this->CommonModel->updateMasterDetails('stocks', $avblStock, $whereP);
                        }
                    }
                    $status['msg'] = $this->systemmsg->getSucessCode(400);
                    $status['statusCode'] = 400;
                    $status['data'] = array();
                    $status['flag'] = 'S';
                    $this->response->output($status, 200);
                }
            } elseif ($method == "dele") {
                $productDetails = array();
                $where = array('product_id' => $product_id);
                if (!isset($product_id) || empty($product_id)) {
                    $status['msg'] = $this->systemmsg->getErrorCode(996);
                    $status['statusCode'] = 996;
                    $status['data'] = array();
                    $status['flag'] = 'F';
                    $this->response->output($status, 200);
                }

                $iscreated = $this->CommonModel->deleteMasterDetails('products', $where);
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
            $where = array("product_id" => $product_id);
            $productDetails = $this->CommonModel->getMasterDetails('products', '', $where);
            if (isset($productDetails) && !empty($productDetails)) {
                $productDetails['stocks'] = $this->CommonModel->getMasterDetails('stocks', '', array('productID' => $product_id));
                if (isset($productDetails[0]->amc_duration) && !empty($productDetails[0]->amc_duration)) {
                    if (preg_match('/(\d+)(years|months|days)/', $productDetails[0]->amc_duration, $match)) {
                        $productDetails[0]->amc_duration = $match[1];
                        $productDetails[0]->time = $match[2];
                    }
                }
                $status['data'] = $productDetails;
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
    public function validProduct($productDetails, $product_id = '')
    {
        $isValid = true;
        $where = [
            'product_type' => $productDetails['product_type'], 
            'product_Name' => $productDetails['product_Name'], 
        ];
        $productDetailsValid = $this->CommonModel->getMasterDetails('products','product_id', $where);
        if (isset($productDetailsValid) && !empty($productDetailsValid)) {
            if (isset($product_id) && !empty($product_id)) {
                if ($productDetailsValid[0]->product_id != $product_id) {
                    $isValid = false;
                }
            }else{
                $isValid = false;
            }
        }
        if (!$isValid) {
            $status = [
                'msg' => $this->systemmsg->getErrorCode(339),
                'statusCode' => 339,
                'data' => [],
                'flag' => 'F'
            ];
            $this->response->output($status, 200);
        }
    }
    public function srNoExists($sr_no = '', $product_id = '')
    {
        $productDetails = $this->CommonModel->getMasterDetails('products', 'product_serial_no,product_id', array('product_serial_no' => $sr_no));
        if (isset($productDetails) && !empty($productDetails)) {
            if ($productDetails[0]->product_id == $product_id) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    public function productChangeStatus()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $action = $this->input->post("action");
        $action = $action ?? '';
        if (trim($action) == "changeStatus") {
            $ids = $this->input->post("list");
            $statusCode = $this->input->post("status");
            $changestatus = $this->CommonModel->changeMasterStatus('products', $statusCode, $ids, 'product_id');
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

    public function getSearchedProduct()
    {
        $this->response->decodeRequest();
        $t = $this->input->post('text');
        $select = 'product_id,product_name,price,unit,gst,with_gst,actual_cost,discount_type,discount,c11.qtyBalance,product_description';
        $text = trim($t);
        $join = array();
        $join[0]['type'] = "LEFT JOIN";
        $join[0]['table'] = "categories";
        $join[0]['alias'] = "c";
        $join[0]['key1'] = "product_type";
        $join[0]['key2'] = "category_id";

        $join[1]['type'] = "LEFT JOIN";
        $join[1]['table'] = "stocks";
        $join[1]['alias'] = "c11";
        $join[1]['key1'] = "product_id";
        $join[1]['key2'] = "productID";

        $wherec = array();
        $other = array();
        $wherec['t.status = '] = "'active'";
        if (isset($text) && !empty($text)) {
            $other['whereOR']['t.product_name'] = 'LIKE "%' . $text . '%"';
            $updateAns = $this->CommonModel->GetMasterListDetails($select, 'products', $wherec, '', '', $join, $other);
            if (isset($updateAns) && !empty($updateAns)) {
                $status['msg'] = "sucess";
                $status['data'] = $updateAns;
                $status['statusCode'] = 400;
                $status['flag'] = 'S';
                $this->response->output($status, 200);
            }
        }
    }
    public function getSearchedConfig()
    {
        $this->response->decodeRequest();
        $t = $this->input->post('text');
        $select = 'product_id,product_name,product_description,profit,margin,actual_cost,compare_price,quantity,price,c11.qtyBalance';
        $text = trim($t);
        $join = array();
        $join[0]['type'] = "LEFT JOIN";
        $join[0]['table'] = "categories";
        $join[0]['alias'] = "c";
        $join[0]['key1'] = "product_type";
        $join[0]['key2'] = "category_id";

        $join[1]['type'] = "LEFT JOIN";
        $join[1]['table'] = "stocks";
        $join[1]['alias'] = "c11";
        $join[1]['key1'] = "product_id";
        $join[1]['key2'] = "productID";

        $wherec = array();
        $wherec["t.status"] = 'IN ("active")';
        $other = array();
        $other['groupBy'] = 'product_name';
        if (isset($text) && !empty($text)) {
            $other['whereOR']['c.categoryName'] = 'LIKE "%' . $text . '%"';
            $updateAns = $this->CommonModel->GetMasterListDetails($select, 'products', $wherec, '', '', $join, $other);
            if (isset($updateAns) && !empty($updateAns)) {
                $status['msg'] = "sucess";
                $status['data'] = $updateAns;
                $status['statusCode'] = 400;
                $status['flag'] = 'S';
                $this->response->output($status, 200);
            }
        }
    }
    public function multipleproductChangeStatus()
    {
        $this->access->checkTokenKey();
        $this->response->decodeRequest();
        $action = $this->input->post("action");
        $ids = $this->input->post("list");
        $statusCode = $this->input->post("status");
        $menuId = $this->input->post("menuId");
        if (trim($action) == "delete") {
            $whereIn['product_id'] = $ids;
            $changestatus = $this->CommonModel->multipleDeleteMasterDetails('products', '', $whereIn);
        } else {
            $changestatus = $this->CommonModel->changeMasterStatus('products', $action, $ids, 'product_id');
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
