<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	class PurchaseOrderModel extends CI_Model{
	
	function __construct()
	{
		parent::__construct();
	}
	public function getTotalPurchaseOrder($select = '', $table = '', $where = array(), $other = array(), $join = array()){
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if ($whereStr == "")
				$whereStr .= $key . " " . $value . " ";
			else
				$whereStr .= " AND " . $key . " " . $value . " ";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {
				$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
			}
		} else {
			$joinsql = "";
		}
		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}
		if (isset($other['whereOR']) && !empty($other['whereOR'])) {
			foreach ($other['whereOR'] as $key => $value) {
				if ($whereStr == "")
					$whereStr .= $key . " " . $value . " ";
				else
					$whereStr .= " OR " . $key . " " . $value . " ";
			}
		}
		if (isset($other['whereIn']) && !empty($other['whereIn'])) {
			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}
		$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . $table . " as t " . $joinsql . $whereStr . "";
		$query = $this->db->query($sql);
		$rowcount = $query->num_rows();
		return $rowcount;
	}
	function getPurchaseOrderDetails($select = '',$where= array(),$limit='',$start='',$join='',$other=array()){
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if($whereStr == "")
				$whereStr .= $key." ".$value." ";
			else
				$whereStr .= " AND ".$key." ".$value." ";
		}
		if($start !='' && $limit!='')
		{
			$limitstr = "LIMIT ".$start.",".$limit;
		}
		else{
			$limitstr = "LIMIT 0,".$limit;
		}
		if(trim($whereStr) != '' ){
			$whereStr = " WHERE ".$whereStr;
		}
		else{
			$whereStr="";
		}
		if(isset($other['orderBy']) && !empty($other['orderBy']))
		{
			$orderBy = "ORDER BY ".$other['orderBy']." ".$other['order'];
		}else{
			$orderBy = "ORDER BY created_date DESC";
		}
		$sql = "SELECT *  FROM ".$this->db->dbprefix."purchase_header ".$whereStr." ".$orderBy." ".$limitstr;
		//$sql = "SELECT * FROM ".$this->db->dbprefix."invoice_header ".$whereStr." ".$orderBy." ".$limitstr;
		$query = $this->db->query($sql);
		$result = $query->result();
		return $result;
	}
	public function getPurchaseOrderDetailsSingle($select="*",$where=array()){
		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->select($select);
		$this->db->from('purchase_header');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}
	public function getPurchaseLineDetails($select="*",$where=array()){
		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->select($select);
		$this->db->from('purchase_line');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}
	public function savePurchaseOrderInfo($data,$where=array()){
		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update("purchase_header",$data);
		// print_r($this->db->last_query()) ; 
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function createPurchaseOrderInfo($data){
		$res = $this->db->insert("purchase_header",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		//print $this->db->last_query();
		return $this->db->insert_id();
	}	
	public function changePurchaseOrderStatus($tableadminID,$statusCode,$ids,$primaryID){

		if(!isset($tableadminID) || empty($tableadminID)){
			return false;
		}
		if(!isset($ids) || empty($ids)){
			return false;
		}	

		if(!isset($primaryID) || empty($primaryID)){
			return false;
		}	

        $idlist = explode(",",$ids);
        $data = array("status"=>$statusCode);
        $modified_by = $this->input->post("SadminID");
        $data = array("status"=>$statusCode,"modified_date"=>date("Y/m/d H:i:s"),"modified_by"=>$modified_by);
        $this->db->where_in($primaryID,$idlist);
        $res = $this->db->update($tableadminID,$data);
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
        return $res;
    }
    public function savePurchaseLineInfo($data,$where){
    	if(!isset($where) || empty($where)){
    		return false;
    	}
		$this->db->where($where);
		$res = $this->db->update("purchase_line",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function createPurchaseLineInfo($data){

		$res = $this->db->insert("purchase_line",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		//print $this->db->last_query();
		return $this->db->insert_id();
	}
	public function deleteitems($where=array(),$whereIn=array()){
		if(!isset($where) || empty($where)){
			return false;
		}		
		if(isset($whereIn) && !empty($whereIn)){
			$this->db->where_in("sr_no",$whereIn);
		}
		$this->db->where($where);
		$res = $this->db->delete("purchase_line");
			   
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function deletePurchaseOrder($where=array(),$whereIn=array()){
		if (!isset($where) && empty($where) || !isset($whereIn) && empty($whereIn)) {
			return false;
		}	
		if (isset($where) && !empty($where)) {	
			$this->db->where($where);
		}
		if (isset($whereIn) && !empty($whereIn))
		{
			foreach ($whereIn as $key => $value) {
				
				$idlist = explode(",", $value);
				$this->db->where_in($key, $idlist);
			}
		}
		$res = $this->db->delete("purchase_header");

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function getLastPurchaseOrder(){

		$sql ="select * from ".$this->db->dbprefix."purchase_header where purchase_id IN ( select MAX(purchase_id) from ".$this->db->dbprefix."purchase_header)";
		$query = $this->db->query($sql);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;

	}
}

	