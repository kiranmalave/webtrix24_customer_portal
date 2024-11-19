<?php
class ExcelExportModel extends CI_Model
{
 	public function fetch_data()
 	{
	   	$this->db->order_by("traineeID","ASC");
	   	$query = $this->db->get("traineeMaster");
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error',dirname(__FILE__),__LINE__,__METHOD__);
		return $query->result();
 	}
}