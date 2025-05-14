<?php
defined('BASEPATH') OR exit('No direct script access allowed');
	// This is used to check pre configuation for the user using domain name

	class Subscription
	{
		public function __construct()
		{
			$this->CI = &get_instance();
			$this->MasterDB = null;
			$this->CI->load->helper('url');
            $this->CI->load->driver('cache', array('adapter' => 'file'));
		}

		function checkAccess(){

			//print $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];exit;
			$doamin = explode('.',$_SERVER['HTTP_HOST']);
			if(count($doamin) != 2 && $doamin[0] != "www"){

                $subdomain = $doamin[0];

                // Check if database details are already cached
                $cacheKey = "db_config_" . $subdomain;
                $db_config = $this->CI->cache->get($cacheKey);
                if (!$db_config) {
                    $this->CI->load->database();
                    $where = array();
                    $sql = "SELECT * FROM ".$this->CI->db->dbprefix."customer as t where t.sub_domain_name ="."'".$doamin[0]."'";
                    $query = $this->CI->db->query($sql);
                    $result = $query->result();
                    if(!isset($result) || empty($result)){
                        //print $link = 'https://'.$doamin[1].".".$doamin[2];
                        header('Location: https://www.'.$doamin[1].".".$doamin[2]);
                        die();
                    }else{
                        //print_r($result);exit;
                        $db_config = array(
                            'dsn'   => '',
                            'hostname' => 'localhost',
                            'username' => $result[0]->dbUserName,
                            'password' => $result[0]->dbpassword,
                            'database' => "webtrix24_customers_".$result[0]->database_name,
                            'dbdriver' => 'mysqli',
                            'dbprefix' => 'ab_',
                            'pconnect' => FALSE,
                            'db_debug' => TRUE,
                            'cache_on' => FALSE,
                            'cachedir' => '',
                            'char_set' => 'utf8',
                            'dbcollat' => 'utf8_general_ci'
                        );
                        // Load the database based on the customer details
                        $this->CI->load->database($db_config, FALSE, TRUE);
                        $this->CI->db = $this->CI->db;
                        $this->checkSubscription($result[0]->subscription);
                        // define("DATABASE_LOAD",$result[0]->database_name);
                        // define("DATABASE_USER",$result[0]->dbUserName);
                        // define("DATABASE_PASSWORD",$result[0]->dbpassword);
                    }
                }
			}
		}
        private function checkSubscription($subscription){

            //
        }
	}

?>