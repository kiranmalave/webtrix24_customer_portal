<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	class BillingModel extends CI_Model{
	
	function __construct()
	{
		parent::__construct();
		$this->load->database();
	}
	
	public function getSkillDetailsByTrainee($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->select($select);
		// change process and get details from upload table.
		//$this->db->from('monthlyDataUploadProcessed as mad');
		$this->db->from('monthlyDataUpload as mad');
		$this->db->join("traineeMaster as tm"," ON mad.traineeCode = tm.ysfCode ","INNER");
		//$this->db->join("traineeSkillMaster as tsm"," ON tm.skillID = tsm.traineeSkillID ","INNER");
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		
		$result = $query->result();
		
		return $result;
	}
	public function getSkillDetailsByTraineeProcessed($select="*",$where=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		$this->db->select($select);
		$this->db->from('monthlyDataUploadProcessed as mad');
		$this->db->join("traineeMaster as tm"," ON mad.traineeCode = tm.ysfCode ","INNER");
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		
		$result = $query->result();
		
		return $result;
	}
	public function getStipendCommercials($select="cs.* ,csr.*",$where=array(),$join=array())
	{
		if(!isset($where) || empty($where))
		{
			return false;
		}
		
		$this->db->select($select);
		$this->db->from('companyCommercials as cs');
		//$this->db->join("commercialStipendRateMaster as csr"," ON cs.commercialsID = csr.commercialsID ","INNER");
		$this->db->where($where);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		//print $this->db->last_query();
		return $result;
	}
	public function getInvoiceNumber($select="*",$where=array(),$join=array())
	{
		$this->db->select($select);
		$this->db->from('invoiceHeader');
		if(isset($where) && !empty($where)){
			$this->db->where($where);	
		}
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		$result = $query->result();
		return $result;
	}

	public function saveinvoiceInfo($data)
	{
		$res = $this->db->insert("invoiceHeader",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $this->db->insert_id();
	}
	public function saveinvoiceItemDetails($data)
	{
		
		$res =  $this->db->insert_batch("invoiceLine", $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		//print $this->db->last_query();
		return $res;
	}
	public function delInvioce($ID)
	{
		$this->db->where("invoiceID",$ID);
		$this->db->delete("invoiceHeader");
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	public function saveCreditNoteInfo($data)
	{
		$res = $this->db->insert("creditHeader",$data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $this->db->insert_id();
	}
	public function saveCreditNoteItemDetails($data)
	{
		$res =  $this->db->insert_batch("creditLine", $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}
	public function delCreditNote($ID)
	{
		$this->db->where("creditID",$ID);
		$this->db->delete("creditHeader");
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $res;
	}

	
	
}

	