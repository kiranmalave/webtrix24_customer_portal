<?php
defined('BASEPATH') OR exit('No direct script access allowed');

	//include_once APPPATH.'/third_party/mpdf/Mpdf.php';
	require_once APPPATH . '../vendor/autoload.php';

	class MPDFCI extends \Mpdf\Mpdf
	{
		public $param= array();
		public function __construct($params = array()) {
			if(isset($params) && !empty($params)){
				$this->param['params'] = $params['params'];
			}else{
				$this->param['params'] = '"en-GB-x","A4","","",10,10,10,10,6,3';		
			}
        
	    parent::__construct($this->param);
	        
	    }
		
	}
	