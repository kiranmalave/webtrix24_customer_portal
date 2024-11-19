<?php
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class UpdateImage extends CI_Controller
{

	/** 
	 * Index Page for this controller.
	 *
	 * Maps to the following URL
	 * 		http://example.com/index.php/welcome
	 *	- or -
	 * 		http://example.com/index.php/welcome/index
	 *	- or -
	 * Since this controller is set as the default controller in
	 * config/routes.php, it's displayed at http://example.com/
	 *
	 * So any other public methods not contacted with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("ImageOpt");
	}

    public function imageThumbnailUpdate()
	{
        
		$mediaArray = $this->CommonModel->GetMasterListDetails("*",'media',array(),'','',array(),array());

		foreach ($mediaArray as $key => $value) {
			$path = $this->config->item("mediaPATH") . $value->media_key;
            //list($orig_width, $orig_height, $image_type) = getimagesize($path);
			print $pathTh = $this->config->item("mediaPATH")."/".pathinfo($path, PATHINFO_FILENAME)."_150x150.".pathinfo($path, PATHINFO_EXTENSION);
            if(file_exists($path)){
				if(!file_exists($pathTh)){
					print $path;
					print "<br>";
					$image = $this->imageopt->optimize_image($path,$path);
					if($image){
						$this->imageopt->create_thumbnails($path,$this->config->item("mediaPATH"));
						
					}else{
						echo "converted fail";
					}
				}else{
					echo "Present";
				}
            }
		}
	}
}
