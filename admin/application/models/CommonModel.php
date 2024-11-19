<?php

use Mpdf\Tag\Pre;
use PSpell\Config;

defined('BASEPATH') or exit('No direct script access allowed');

class CommonModel extends CI_Model
{

	function __construct()
	{
		parent::__construct();
		$this->load->database();
	}

	public function getLastInsertedID()
	{
		return $this->db->insert_id();
	}

	public function getCountByParameter($select = '', $table = '', $where = array(), $other = array(), $join = array()){
		$whereStr = "";
		$limitstr = "";
		$freeTextSearch = '';
		if (isset($other['freeTextSearch']) && !empty($other['freeTextSearch'])) {
			$freeTextSearch = $other['freeTextSearch'];
		}
		foreach ($where as $key => $value) {
			if ($whereStr == "")
				$whereStr .= $key . " " . $value . " ";
			else
				$whereStr .= " AND " . $key . " " . $value . " ";
		}
		if (isset($other['whereOR']) && !empty($other['whereOR'])) {
			foreach ($other['whereOR'] as $key => $value) {
				if ($whereStr == "")
					$whereStr .= $key . " " . $value . " ";
				else
					$whereStr .= " OR " . $key . " " . $value . " ";
			}
		}
		if (isset($other['find_in_set']) && !empty($other['find_in_set'])) {
			for ($i=0; $i < count($other['find_in_set']); $i++) { 
				$whereStrFindSet="";
				foreach ($other['find_in_set'][$i] as $key => $value) {
					if ($whereStrFindSet == "")
						$whereStrFindSet .= "FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0";
					else
						$whereStrFindSet .= " ".$other['find_in_set_type'][$i]." FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0 ";
				}
				if ($whereStr != ""){
					$whereStr .= "AND ( ";
				}else{
					$whereStr .= " ( ";
				}
				$whereStr .= $whereStrFindSet.")";
			}
		}
		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}
		if (isset($other['whereIn']) && !empty($other['whereIn'])) {
			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {

				if (isset($value['key1Alias']) && !empty($value['key1Alias'])) {

					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON " . $value['key1Alias'] . "." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				} else {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				}
			}
		} else {
			$joinsql = "";
		}
		
		if ($freeTextSearch != '') {
			$tableName = $this->db->dbprefix . $table;
			$fields = $this->db->field_data($tableName);
			$this->db->from($tableName);
			$searchStr = '';
			// FOR SELF TABLE FIELDS
			foreach ($fields as $field) {
				$searchTerm = '%' . $this->db->escape_like_str($freeTextSearch) . '%' ;
				if ($searchStr == "") {
					if ($whereStr == ''){
						$searchStr .= ' WHERE t.'.$this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
					}else{
						$searchStr .= ' t.'.$this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
					}
				} else {
					$searchStr .= " OR t." . $this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
				}
			}
			// FOR JOINED TABLE FIELDS
			if (isset($join) && !empty($join)) {
				
				foreach ($join as $joinTable) {
					if ($searchStr != "") {
						$searchStr .= " OR ";
					}
					$searchStr .= $joinTable['alias']. '.' . $joinTable['column'] . " LIKE " . $this->db->escape($searchTerm);
				}
			}
			($whereStr == '') ? $whereStr .= $searchStr : $whereStr .= ' AND ('.$searchStr.') ';
			$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . "{$table} as t " . $joinsql . $whereStr . "";
			$query = $this->db->query($sql);
		}else{
			$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . $table . " as t " . $joinsql . $whereStr . "";
			$query = $this->db->query($sql);
		}
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		$rowcount = $query->num_rows();
		return $rowcount;
	}
	public function GetMasterListDetails($select = '', $table = '', $where = array(), $limit = '', $start = '', $join = array(), $other = array())	{
		if ($select == '') {
			$select = "*";
		}
		$whereStr = "";
		$limitstr = "";
		$freeTextSearch = '';
		if (isset($other['freeTextSearch']) && !empty($other['freeTextSearch'])) {
			$freeTextSearch = $other['freeTextSearch'];
		}
		
		foreach ($where as $key => $value) {
			if ($whereStr == "")
				$whereStr .= $key . " " . $value . " ";
			else
				$whereStr .= " AND " . $key . " " . $value . " ";
		}
		if (isset($other['whereOR']) && !empty($other['whereOR'])) {

			foreach ($other['whereOR'] as $key => $value) {
				if ($whereStr == "")
				{
					$whereStr .= $key . " " . $value . " ";
				}
				else
				{		
					if (!strpos($whereStr,'AND')) {
						$whereStr .= " AND " . $key . " " . $value . " ";
					}else
					{
						$whereStr .= " OR " . $key . " " . $value . " ";
					}
				}		
			}
		}
		// print_r($whereStr);exit;
		if (isset($other['find_in_set']) && !empty($other['find_in_set'])) {
			for ($i=0; $i < count($other['find_in_set']); $i++) { 
				$whereStrFindSet="";
				foreach ($other['find_in_set'][$i] as $key => $value) {
					if ($whereStrFindSet == "")
						$whereStrFindSet .= "FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0";
					else
						$whereStrFindSet .= " ".$other['find_in_set_type'][$i]." FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0 ";
				}
				if ($whereStr != ""){
					$whereStr .= "AND ( ";
				}else{
					$whereStr .= " ( ";
				}
				$whereStr .= $whereStrFindSet.")";
			}
		}
		// change for all record. For linking to other form need all records. so skip pagination.
		if ($start != '' && $limit != '') {
			$limitstr = "LIMIT " . $start . "," . $limit;
		} else {
			if (isset($limit) && !empty($limit)) {
				$limitstr = "LIMIT 0," . $limit;
			} else {
				$limitstr = "";
			}
		}

		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}

		if (isset($other['whereIn']) && !empty($other['whereIn'])) {

			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}
		if (isset($other['orderBy']) && !empty($other['orderBy'])) {
			$orderBy = "ORDER BY " . $other['orderBy'] . " " . $other['order'];
		} else {
			$orderBy = "";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {

				if (isset($value['key1Alias']) && !empty($value['key1Alias'])) {

					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON " . $value['key1Alias'] . "." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				} else {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				}
			}
		} else {
			$joinsql = "";
		}
		if ($freeTextSearch != '') {
			$tableName = $this->db->dbprefix . $table;
			$fields = $this->db->field_data($tableName);
			$this->db->from($tableName);
			$searchStr = '';
			// FOR SELF TABLE FIELDS
			foreach ($fields as $field) {	
				$searchTerm = '%' . $this->db->escape_like_str($freeTextSearch) . '%' ;
				if ($searchStr == "") {
					if ($whereStr == '') {
						$searchStr .= ' WHERE t.'.$this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
					}else{
						$searchStr .= ' t.'.$this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
					}
				} else {
					$searchStr .= " OR t." . $this->db->protect_identifiers($field->name) . " LIKE " . $this->db->escape($searchTerm);
				}
			}
			// FOR JOINED TABLE FIELDS
			if (isset($join) && !empty($join)) {
				foreach ($join as $joinTable) {
					if ($searchStr != "") {
						$searchStr .= " OR ";
					}
					$searchStr .= $joinTable['alias']. '.' . $joinTable['column'] . " LIKE " . $this->db->escape($searchTerm);
				}
			}
			($whereStr == '') ? $whereStr .= $searchStr : $whereStr .= ' AND ('.$searchStr.') ';
			$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . "{$table} as t " . $joinsql . $whereStr . " " . $orderBy . " " . $limitstr;
			$query = $this->db->query($sql);
		}else{
			$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . "{$table} as t " . $joinsql . $whereStr . " " . $orderBy . " " . $limitstr;
			$query = $this->db->query($sql);
		}
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);

		if (isset($other["resultType"]) && !empty($other["resultType"])) {
			$result = $query->result_array();
		} else {
			$result = $query->result();
		}
		return $result;
	}

	public function getFilteredCount($select = '', $table = '', $where = array(), $other = array(), $join = array()){
		$whereStr = "";
		$limitstr = "";
		$ORstr = "";
		foreach ($where as $key => $value) {
			$st = (strpos($value,'OR')) ? "( ".$key . " " . $value . " ) " : $key . " " . $value . " ";
			if ($whereStr == ""){
				$whereStr .= $st;
			}else{
				$whereStr .= "AND " . $st;
			}
		}
		if (isset($other['OR']) && !empty($other['OR'])) {
			foreach ($other['OR'] as $key => $value) {
				$st = (strpos($value,'OR')) ? "( ".$key . " " . $value . " ) " : $key . " " . $value . " ";
				if (count($other['OR']) == 1) {
					$ORstr .= "OR " . $st;
				}else{
					if ($ORstr == "") {
						$ORstr .= "(". $st . "";
					}else{
						$ORstr .= " OR " . $st;
					}
				}
			}
		}
		if ($ORstr != "") {
			if (count($other['OR']) > 1) {
				$ORstr .= ')';
				$whereStr .= 'AND '.$ORstr;
			}else {
				$whereStr .= $ORstr;
			}
		}
		if (isset($other['find_in_set']) && !empty($other['find_in_set'])) {
			for ($i=0; $i < count($other['find_in_set']); $i++) { 
				$whereStrFindSet="";
				foreach ($other['find_in_set'][$i] as $key => $value) {
					if ($whereStrFindSet == "")
						$whereStrFindSet .= "FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0";
					else
						$whereStrFindSet .= " ".$other['find_in_set_type'][$i]." FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0 ";
				}
				if ($whereStr != ""){
					$whereStr .= "AND ( ";
				}else{
					$whereStr .= " ( ";
				}
				$whereStr .= $whereStrFindSet.")";
			}
			
		}
		
		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}

		if (isset($other['whereIn']) && !empty($other['whereIn'])) {

			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}

		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {

				if (isset($value['key1Alias']) && !empty($value['key1Alias'])) {

					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON " . $value['key1Alias'] . "." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				} else {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				}
			}
		} else {
			$joinsql = "";
		}
		$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . $table . " as t " . $joinsql . $whereStr . "";
		$query = $this->db->query($sql);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		$rowcount = $query->num_rows();
		return $rowcount;
	}
	public function GetFilteredMasterList($select = '', $table = '', $where = array(), $limit = '', $start = '', $join = array(), $other = array()){	
		if ($select == '') {
			$select = "*";
		}
		$whereStr = "";
		$limitstr = "";
		$ORstr = "";
		foreach ($where as $key => $value) {
			$st = (strpos($value,'OR')) ? "( ".$key . " " . $value . " ) " : $key . " " . $value . " ";
			if ($whereStr == ""){
				$whereStr .= $st;
			}else{
				$whereStr .= "AND " . $st;
			}
		}
		if (isset($other['OR']) && !empty($other['OR'])) {
			foreach ($other['OR'] as $key => $value) {
				$st = (strpos($value,'OR')) ? "( ".$key . " " . $value . " ) " : $key . " " . $value . " ";
				if (count($other['OR']) == 1) {
					$ORstr .= "OR " . $st;
				}else{
					if ($ORstr == "") {
						$ORstr .= "(". $st . "";
					}else{
						$ORstr .= " OR " . $st;
					}
				}
			}
		}
		if ($ORstr != "") {
			if (count($other['OR']) > 1) {
				$ORstr .= ')';
				$whereStr .= 'AND '.$ORstr;
			}else {
				$whereStr .= $ORstr;
			}
		}
		if (isset($other['whereOR']) && !empty($other['whereOR'])) {
			foreach ($other['whereOR'] as $key => $value) {
				if ($whereStr == ""){
					$whereStr .= $key . " " . $value . " ";
				}else{		
					if (!strpos($whereStr,'AND')) {
						$whereStr .= " AND " . $key . " " . $value . " ";
					}else{
						$whereStr .= " OR " . $key . " " . $value . " ";
					}
				}		
			}
		}		
		if (isset($other['find_in_set']) && !empty($other['find_in_set'])) {
			for ($i=0; $i < count($other['find_in_set']); $i++) { 
				$whereStrFindSet="";
				foreach ($other['find_in_set'][$i] as $key => $value) {
					if ($whereStrFindSet == "")
						$whereStrFindSet .= "FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0";
					else
						$whereStrFindSet .= " ".$other['find_in_set_type'][$i]." FIND_IN_SET('".$value."',REPLACE(".$other['find_in_set_key'][$i].",' ','')) > 0 ";
				}
				if ($whereStr != ""){
					$whereStr .= "AND ( ";
				}else{
					$whereStr .= " ( ";
				}
				$whereStr .= $whereStrFindSet.")";
			}
		}
		// change for all record. For linking to other form need all records. so skip pagination.
		if ($start != '' && $limit != '') {
			$limitstr = "LIMIT " . $start . "," . $limit;
		} else {
			if (isset($limit) && !empty($limit)) {
				$limitstr = "LIMIT 0," . $limit;
			} else {
				$limitstr = "";
			}
		}
		if (trim($whereStr) != '') {
			$whereStr = " WHERE " . $whereStr;
		} else {
			$whereStr = "";
		}
		if (isset($other['whereIn']) && !empty($other['whereIn'])) {
			if (trim($whereStr) == "")
				$whereStr .= " WHERE " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
			else
				$whereStr .= " AND " . $other['whereIn'] . " IN (" . $other['whereData'] . ") ";
		}
		if (isset($other['orderBy']) && !empty($other['orderBy'])) {
			$orderBy = "ORDER BY " . $other['orderBy'] . " " . $other['order'];
		} else {
			$orderBy = "";
		}
		$joinsql = '';
		if (isset($join) && !empty($join)) {
			foreach ($join as $key => $value) {
				if (isset($value['key1Alias']) && !empty($value['key1Alias'])) {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON " . $value['key1Alias'] . "." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				} else {
					$joinsql .= " " . $value['type'] . " " . $this->db->dbprefix . $value['table'] . " as " . $value['alias'] . " ON t." . $value['key1'] . " = " . $value['alias'] . "." . $value['key2'];
				}
			}
		} else {
			$joinsql = "";
		}
		// print_r($whereStr);exit;
		$sql = "SELECT " . $select . " FROM " . $this->db->dbprefix . "{$table} as t " . $joinsql . $whereStr . " " . $orderBy . " " . $limitstr;
		// print_r($sql);exit;
		$query = $this->db->query($sql);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		if (isset($other["resultType"]) && !empty($other["resultType"])) {
			$result = $query->result_array();
		} else {
			$result = $query->result();
		}
		return $result;
	}
	public function saveContactDetails($data = '')
	{

		$res = $this->db->insert("contactus", $data);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	public function isSubscribed($email = '')
	{
		$this->db->select("*");
		$this->db->from("subscribe");
		$this->db->where('email', $email);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$result = $query->result();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $result;
	}

	public function countFiltered($table = '')
	{
		$this->db->select("*");
		$this->db->from($table);
		$query = $this->db->get();
		$sqlerror = $this->db->error();
		$result = $query->num_rows();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $result;
	}

	public function getUniqueCode($length = 6)
	{
		$token = "";
		$codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		$codeAlphabet .= "abcdefghijklmnopqrstuvwxyz";
		$codeAlphabet .= "0123456789";
		$max = strlen($codeAlphabet); // edited

		for ($i = 0; $i < $length; $i++) {
			$randomNumber = rand(0, $max - 1);
			$token .= substr($codeAlphabet, $randomNumber, 1);
		}
		return $token;
	}
	public function getMasterDetails($master = '', $select = "*", $where = array())
	{

		if (!isset($select) || empty($select)) {
			$select = "*";
		}
		if (!isset($master) || empty($master)) {
			return false;
		}

		$this->db->select($select);
		$this->db->from($master);
		if (isset($where) && !empty($where)) {
			$this->db->where($where);
		}

		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		// print $this->db->last_query();
		return $result;
	}
	public function getMobileDetails($where = '')
	{
		$this->db->select('*');
		$this->db->from('traineeMaster');
		if (isset($where) && !empty($where)) {
			$this->db->where('mobile', $where);
		}
		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		return $result;
	}
	public function getAadhaarDetails($where = '')
	{
		$this->db->select('*');
		$this->db->from('traineeMaster');
		if (isset($where) && !empty($where)) {
			$this->db->where('aadhaarNo', $where);
		}
		$query = $this->db->get();

		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		$result = $query->result();
		return $result;
	}

	public function saveMasterDetails($tableName = '', $data = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}

		if (!isset($data) || empty($data)) {
			return false;
		}
		$res = $this->db->insert($tableName, $data);
		$sqlerror = $this->db->error();
		
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function updateMasterDetails($tableName = '', $data = '', $where = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($data) || empty($data)) {
			return false;
		}
		if (!isset($where) || empty($where)) {
			return false;
		}
		$this->db->where($where);
		$res = $this->db->update($tableName, $data);
		$sqlerror = $this->db->error();
		// print $this->db->last_query();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function deleteMasterDetails($tableName = '', $where = '', $whereIn = array())
	{
		
		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		
		if (!isset($where) && empty($where) || !isset($whereIn) && empty($whereIn)) {
			return false;
		}
		if (isset($where) && !empty($where)) {
			
			$this->db->where($where);
		}
		
		if (isset($whereIn) && !empty($whereIn)) {
			foreach ($whereIn as $key => $value) {
				$idlist = explode(",", $value);
				$this->db->where_in($key, $idlist);
			}
		}
		$res = $this->db->delete($tableName);
		$sqlerror = $this->db->error();
		// print $this->db->last_query();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	

	public function multipleDeleteMasterDetails($tableName = '', $where = '', $whereIn = array())
	{
		
		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		
		if (!isset($where) && empty($where) || !isset($whereIn) && empty($whereIn)) {
			return false;
		}
		if (isset($where) && !empty($where)) {
			
			$this->db->where($where);
		}
		
		if (isset($whereIn) && !empty($whereIn)) {
			foreach ($whereIn as $key => $value) {
				$idlist = explode(",", $value);
				$this->db->where_in($key, $idlist);
			}
		}
		
		$res = $this->db->delete($tableName);
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function dynamicFormDeleteMasterDetails($tableName = '', $where = '', $whereIn = array(), $primaryID = '')
	{
		
		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
	
		if ((!isset($where) || empty($where))&&(!isset($whereIn) || empty($whereIn))) {
			return false;
		}
		

		$idlist = explode(",", $whereIn);
		// print_r($idlist);exit;
		// if (isset($where) && !empty($where)) {
		// 	$this->db->where($where);
		// }
		if (isset($whereIn) && !empty($whereIn)) {
				$this->db->where_in($primaryID, $idlist);
		}
		
		$res = $this->db->delete($tableName);
		// print $this->db->last_query();exit;
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function changeMasterStatus($tableName = '', $statusCode = '', $ids = '', $primaryID = '')
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($ids) || empty($ids)) {
			return false;
		}

		if (!isset($primaryID) || empty($primaryID)) {
			return false;
		}

		$idlist = explode(",", $ids);
		$modifyBy = $this->input->post("SadminID");
		$data = array("status" => $statusCode, "modified_date" => date("Y/m/d H:i:s"), "modified_by" => $modifyBy);
		$this->db->where_in($primaryID, $idlist);
		$res = $this->db->update($tableName, $data);
		// print($this->db->last_query());exit;
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}

	public function changeMasterRoleStatus($tableName = '', $ids = '',$updatedRoleId = '', $primaryID = ''){

        if (!isset($tableName) || empty($tableName)) {
            return false;
        }
        if (!isset($ids) || empty($ids)) {
            return false;
        }

        if (!isset($primaryID) || empty($primaryID)) {
            return false;
        }

        $idlist = explode(",", $ids);
        $modifyBy = $this->input->post("SadminID");
        $data = array("roleID" => $updatedRoleId, "modified_date" => date("Y/m/d H:i:s"), "modified_by" => $modifyBy);
        $this->db->where_in($primaryID, $idlist);
        $res = $this->db->update($tableName, $data);
        $sqlerror = $this->db->error();
        //$this->db->last_query();
        $this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        return $res;
    }

	public function getMonthByID($id = '')
	{
		$months = array("1" => "january", "2" => "february", "3" => "march", "4" => "april", "5" => "may", "6" => "june", "7" => "july", "8" => "august", "9" => "september", "10" => "october", "11" => "november", "12" => "december");
		return $months[$id];
	}
	public function num2words($num = '', $currency = '')
	{

		$ZERO = "zero";
		$MINUS = "minus";
		/* zero is shown as "" since it is never used in combined forms */ 		 /* 0 .. 19 */
		$lowName = array("", "One", "Two", "Three", "Four", "Five", 		 "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", 		 "Sixteen", "Seventeen", "Eighteen", "Nineteen");
		$tys = array("", "", "Twenty", "Thirty", "Forty", "Fifty", 		 "Sixty", "Seventy", "Eighty", "Ninety");
		/* 0, 10, 20, 30 ... 90 */

		switch ($currency) {

			case 'INR': 	//$groupName = array( "", "Hundred", "Thousand", "Lakh", "Crore","Arab", "Kharab"); 
				$groupName = array("", "Hundred", "Thousand", "Lakh", "Crore", "Hundred", "Thousand", "Lakh", "");

				// How many of this group is needed to form one of the succeeding group. 					
				// Indian: unit, hundred, thousand, lakh, crore 				

				//	$divisor = array( 100, 10, 100, 100,100000,100000000000) ;

				$divisor = array(100, 10, 100, 100, 100, 10, 100, 100, 10);
				break;
			case 'USD': 	//$groupName = array( "", "Hundred", "Thousand", "Lakh", "Crore","Arab", "Kharab"); 
				$groupName = array("", "Hundred", "Thousand", "Million", "Billion", "Trillion", "");

				// How many of this group is needed to form one of the succeeding group. 					
				// Indian: unit, hundred, thousand, lakh, crore 				

				//	$divisor = array( 100, 10, 100, 100,100000,100000000000) ;

				$divisor = array(100, 10, 1000, 100000, 1000000000);
				break;

			case 'Paise':
				$groupName = array();
				$divisor = array(100);
				break;
		}
		$num = str_replace(",", "", $num);
		$num = number_format($num, 2, '.', '');
		$cents = substr($num, strlen($num) - 2, strlen($num) - 1);
		$num = (int)$num;

		$s = "";

		if ($num == 0) $s = $ZERO;
		$negative = ($num < 0);
		if ($negative) $num = -$num;

		// Work least significant digit to most, right to left.
		// until high order part is all 0s.
		for ($i = 0; $num > 0; $i++) {
			$remdr = (int)($num % $divisor[$i]);
			$num = $num / $divisor[$i];
			if ($remdr == 0)
				continue;

			$t = "";
			if ($remdr < 20)
				$t = $lowName[$remdr];
			else if ($remdr < 100) {
				$units = (int)$remdr % 10;
				$tens = (int)$remdr / 10;
				$tens = floor($tens);
				$t = $tys[$tens];

				if ($units != 0)
					$t .= " " . $lowName[$units];
				} else
					$t = $inWords[$remdr];		
			if (isset($groupName[$i])) {
				$s = $t . " " . $groupName[$i] . " "  . $s;
			}else{
				$s = $t . " "  . $s;
			}
			$num = (int)$num;
		}

		$s = trim($s);
		if ($negative)
			$s = $MINUS . " " . $s;


		if (($cents != '00') && ($s == 'zero')) {
			$s = $cents . " Paise only";
			return $s;
		}


		switch ($currency) {

			case 'INR':
				$s .= " Rupees";
				if ($cents != '00')
					$s .= " and " . $this->num2words($cents, 'Paise');

				$s .= " Only";
				break;
			case 'USD':
				$s .= " Dollar";
				if ($cents != '00')
					$s .= " and " . $this->num2words($cents, 'Cents');

				$s .= " Only";
				break;
			case 'Paise':
				$s .= " Paise";
		}
		return $s;
	}
	public function saveFile($table = '', $fileColumn = '', $filename = '', $forignValue = '', $fileTypeColumn = '', $fileType = '', $forignKey = '', $extraData = array(), $opFile = '',$isUpdate = '',$where=array())
	{
		$adminID = $this->input->post("SadminID");
		$data = array();
		$data["created_by"] = $adminID;

		if (!empty($fileTypeColumn))
			$data["" . $fileTypeColumn] = $fileType;

		if (!empty($forignKey))
			$data["" . $forignKey] = $forignValue;

		if (!empty($fileColumn))
			$data["" . $fileColumn] = $filename;

		if (isset($extraData) && !empty($extraData)) {
			foreach ($extraData as $key => $value) {
				$data[$key] = $value;
			}
		}
		//below call by Sanjay
		if (!extension_loaded('imagick') && in_array($fileType,array("jpeg","jpg","png","gif"))) {
			$this->createThumbnail($opFile);
		}
		if ($isUpdate == 'Y') {
			if (isset($where) && !empty($where)) {
				$this->db->where($where);
				$res = $this->db->update($table, $data);
			}
			
		}else{
			$res = $this->db->insert($table, $data);
		}
		
		$sqlerror = $this->db->error();
		// print $this->db->last_query();exit;
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	function compress_image($src, $dest , $quality) 
	{
		$info = getimagesize($src);
	
		if ($info['mime'] == 'image/jpeg') 
		{
			$image = imagecreatefromjpeg($src);
		}
		elseif ($info['mime'] == 'image/gif') 
		{
			$image = imagecreatefromgif($src);
		}
		elseif ($info['mime'] == 'image/png') 
		{
			$image = imagecreatefrompng($src);
		}
		else
		{
			die('Unknown image file format');
		}
	
		//compress and save file to jpg
		imagejpeg($image, $dest, $quality);
	
		//return destination file
		return $dest;
	}
	private function parse_argv(array $argv): array
    {
        $request = [];
        foreach ($argv as $i => $a) {
            if (!$i) {
                continue;
            }
            if (preg_match('/^-*(.+?)=(.+)$/', $a, $matches)) {
                $request[$matches[1]] = $matches[2];
            } else {
                $request[$i] = $a;
            }
        }

        return array_values($request);
    }
	//Function added by Sanjay
	public function createThumbnail($imgUrl)
	{
		// $arrayimg = array('jpg', 'jpeg', 'png', 'gif');
		// $arrayVideo = array('mp4', 'mov', 'avi', '3gp');
		// $arraytxt = array('docx', 'doc', 'ppt', 'txt', 'pdf');
		$this->compress_image($imgUrl, $imgUrl, 90);
		//resize original image 
		// $img = new Image($file);
		// $size = $img->getSize();
		// Image::resize() takes care to maintain the proper aspect ratio, so this is easy
		// (default quality is 100% for JPEG so we get the cleanest resized images here)
		// $img->resize($this->options['maxImageDimension']['width'], $this->options['maxImageDimension']['height'])->save();
		// unset($img);

		//ffmpeg -i 1692702012.7795.mp4 -ss 00:00:00.000 -pix_fmt rgb24 -r 10 -s 320x240 -t 00:00:10.000 output.gif
		//perfect ffmpeg -ss 1.0 -t 2.5 -i 1692702012.7795.mp4 -filter_complex "[0:v] fps=12,scale=w=320:h=-1,split [a][b];[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1" StickAroundPerFrame.gif
		//convert -quiet C:\xampp\htdocs\LMS\website\uploads\1692702012.7795.mp4[10] 1692702012.7795_tn.gif
	}

	public function getMonth($key = '', $type = 'string')
	{

		if ($type == "string" && is_string($key)) {
			$d = date_parse($key);
			return $d['month'];
		}
		if ($type == "number" && is_numeric($key)) {
			$dateObj   = DateTime::createFromFormat('!m', $key);
			return $dateObj->format('F');
		}
		return false;
	}

	public function unlinkFile($filePath = '')
	{
		// echo  $filePath;exit;
		if (file_exists($filePath)) {
			// echo $filePath;exit;
			return unlink($filePath);
		} else {
			return false;
		}
	}

	public function getDynamicFieldHtml($menuId = '')
	{
		$dynamicFieldHtml = "";
		$wherec["menuID="] = $menuId;
		$other = array("orderBy" => "fieldIndex");
		$dynamicFields = $this->GetMasterListDetails($selectC = '', 'dynamic_fields', $wherec, '', '', '', $other);

		if (!empty($dynamicFields)) {
			return $dynamicFields;
			/*foreach($dynamicFields as $dynamicField){
				print_r($dynamicField->fieldType);
			}*/
		}
		return '';
	}
	public function updateAllRows($tableName, $data)
	{

		if (!isset($tableName) || empty($tableName)) {
			return false;
		}
		if (!isset($data) || empty($data)) {
			return false;
		}

		$res = $this->db->update($tableName, $data);
		//print $this->db->last_query();exit;
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror,'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		return $res;
	}
	public function getdata($sql,$other){
		$query = $this->db->query($sql);
		if (isset($other["resultType"]) && !empty($other["resultType"])) {
			$result = $query->result_array();
		} else {
			$result = $query->result();
		}
		return $result;
	}

	// NOTIFICATION 
	public function getDetailForNotification($sql=''){
		$query = $this->db->query($sql);
		$result = $query->result();
		return $result;	
	}

	public function getNotificationList($menuID = '',$action='',$company_id=""){
    	// get menu table name uisng menu link
		if (isset($menuID) && !empty($menuID)) {
            $menuDetails = $this->CommonModel->getMasterDetails("menu_master","menuLink",array('menuID'=> $menuID));
            if (isset($menuDetails) && !empty($menuDetails)) {
				$where=array();
				$where['module_name'] = $menuDetails[0]->menuLink;
				$where['action_on'] =$action;
				$where['status'] ='active';
				// $where['company_id'] =$company_id;
				// GET NOTIFICATION DETAILS
				$notificationDetails = $this->CommonModel->getMasterDetails('notification_schema', '', $where);
				if (isset($notificationDetails) && !empty($notificationDetails)) {
					return $notificationDetails;
				}
            }
        }
    }
	public function getLastDocPrefix(){
		$sql ="select * from ".$this->db->dbprefix."doc_prefix where docTypeID IN ( select MAX(docTypeID) from ".$this->db->dbprefix."doc_prefix)";
		$query = $this->db->query($sql);
		$result = $query->result();
		return $result;
	}
	public function isPrefixExist($company_id){
		$where =array('company_id'=>$company_id);
		$PreDetails = $this->getMasterDetails('doc_prefix','docPrefixID',$where);
		if (count($PreDetails) <= 6) {
			return true;
		}else{
			return false;
		}
	}
	// USED FOR COPYING ROWS 
	public function insertUsingSQL($sql){
		$query = $this->db->query($sql);
		return $query;
	}

	public function getCategoryBySlug($slug){
        $sql = 'SELECT category_id, slug, categoryName,cat_color 
        FROM ab_categories 
        WHERE slug = "'.$slug.'" AND status = "active" ';

        $query = $this->db->query($sql, array($slug));
        $sqlerror = $this->db->error();
        $this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
        $result = $query->result();
        return $result;
    }

	 //editing multiple Details
	 public function editMasterDetails($tableName, $detail, $where_in ,$primary_key) {        
		if (empty($tableName) || empty($detail) || empty($primary_key)) {
			return false;
		}

		$this->db->where_in($primary_key, $where_in);
		
		$res = $this->db->update($tableName, $detail);
		
		$sqlerror = $this->db->error();
		$this->errorlogs->checkDBError($sqlerror, 'SQL Error', dirname(__FILE__), __LINE__, __METHOD__);
		
		return $res;
	}

	
}
