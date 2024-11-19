<?php
// require 'vendor/autoload.php'; // If you're using Composer (recommended)

defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class EmailsNotifications
{


	public function __construct()
	{
		$this->CI = &get_instance();
		// $this->CI->load->library('emails');
		$this->CI->load->model('CommonModel');
	}

    public function sendEmailNotification($table='',$action='',$data= array())
    {

        $tableName = $table;

        if(isset($table) && !empty($table))
        {
            $this->CI->load->library("plugins/" . $table);
            $this->$table = new $table();
            $this->$table->sendEmailNotification($tableName,$action,$data);
        }else
        {
            return false;
        }
   }
}
