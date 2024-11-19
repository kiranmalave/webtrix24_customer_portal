<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	class CreditModel extends CI_Model{
	
	function __construct()
	{
		parent::__construct();
		$this->load->database();
	}
	public function getTotalCredit($where=array(),$other=array())
	{
		$whereStr = "";
		$limitstr = "";
		foreach ($where as $key => $value) {
			if($whereStr == "")
				$whereStr .= $key." ".$value." ";
			else
				$whereStr .= " AND ".$key." ".$value." ";
 
		}
		if(trim($whereStr) != '' ){
			$whereStr = " WHERE ".$whereStr;
		}
		else{
			$whereStr="";
		}
		//print $whereStr; exit; 
		if(isset($other['whereIn']) && !empty($other['whereIn'])){
				if(trim($whereStr) == ""){
					$whereStr = " WHERE ".$other['whereIn']." IN (".$other['whereData'].") ";
				}
				else{
					$whereStr .= " AND ".$other['whereIn']." IN (".$other['whereData'].") ";
				}
		}
		$sql = "SELECT i.*,cm.companyName FROM ".$this->db->dbprefix."creditHeader as i LEFT JOIN ".$this->db->dbprefix."companyMaster as cm ON i.companyID = cm.companyID ".$whereStr."";
		//$sql = "SELECT commercialsID FROM ".$this->db->dbprefix."companyCommercials ".$whereStr."";
		$query = $this->db->query($sql);
		$rowcount = $query->num_rows();
		return $rowcount;
		
	}
	
	public function getCreditDetails($select = '',$where= array(),$limit='',$start='',$join='',$other=array())
	{
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
		if(isset($other['whereIn']) && !empty($other['whereIn'])){
			if(trim($whereStr) == ""){
				$whereStr = " WHERE ".$other['whereIn']." IN (".$other['whereData'].") ";
			}
			else{
				$whereStr .= " AND ".$other['whereIn']." IN (".$other['whereData'].") ";
			}
		}
		if(isset($other['orderBy']) && !empty($other['orderBy']))
		{
			$orderBy = "ORDER BY ".$other['orderBy']." ".$other['order'];
		}else{
			$orderBy = "ORDER BY created_date DESC";
		}

		$sql = "SELECT i.*,cm.companyName FROM ".$this->db->dbprefix."creditHeader as i LEFT JOIN ".$this->db->dbprefix."companyMaster as cm ON i.companyID = cm.companyID ".$whereStr." ".$orderBy." ".$limitstr;
		//$sql = "SELECT * FROM ".$this->db->dbprefix."invoice_header ".$whereStr." ".$orderBy." ".$limitstr;
		
		$query = $this->db->query($sql);

		$result = $query->result();
		return $result;
	}


	public function getCreditDetailsSingle($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		
		$this->db->select($select);
		$this->db->from('creditHeader');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}
	public function getCreditLineDetails($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		
		$this->db->select($select);
		$this->db->from('creditLine');
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}
	public function saveCreditInfo($data,$where){

		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update("creditHeader",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function createCreditInfo($data){

		$res = $this->db->insert("creditHeader",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $this->db->insert_id();
	}
	
	public function changeCreditStatus($tableName,$statusCode,$ids,$primaryID){

		if(!isset($tableName) || empty($tableName)){
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
        $modifyBy = $this->input->post("SadminID");
        $data = array("status"=>$statusCode,"modified_date"=>date("Y/m/d H:i:s"),"modified_by"=>$modifyBy);
        $this->db->where_in($primaryID,$idlist);
        $res = $this->db->update($tableName,$data);
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
        return $res;
    }

    public function saveCreditNoteLineInfo($data,$where){

    	if(!isset($where) || empty($where)){
    		return false;
    	}
		$this->db->where($where);
		$res = $this->db->update("creditLine",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function createCreditNoteLineInfo($data){

		$res = $this->db->insert("creditLine",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $this->db->insert_id();
	}
	public function saveCreditNoteInfo($data,$where=array()){

		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update("creditHeader",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function deleteitems($where=array(),$whereIn=array()){
		if(!isset($where) || empty($where)){
			return false;
		}		
		if(isset($whereIn) && !empty($whereIn)){
			$this->db->where_in("srNo",$whereIn);
		}
		$this->db->where($where);
		$res = $this->db->delete("invoiceLine");
			   
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function getLastCreaditNote(){

		$sql ="select * from ".$this->db->dbprefix."creditHeader where creditID IN ( select MAX(creditID) from ".$this->db->dbprefix."creditHeader)";
		$query = $this->db->query($sql);
		$result = $query->result();
		return $result;

	}
}

	