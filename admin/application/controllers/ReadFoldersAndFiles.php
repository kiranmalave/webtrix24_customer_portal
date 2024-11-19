<?php
defined('BASEPATH') or exit('No direct script access allowed');

class ReadFoldersAndFiles extends CI_Controller
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
	 * So any other public methods not prefixed with an underscore will
	 * map to /index.php/welcome/<method_name>
	 * @see https://codeigniter.com/user_guide/general/urls.html
	 */
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
	}

	public function readFoldersAndFiles()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$folder_id = $this->input->post('folderID');
		$cmp_type = $this->input->post('cmp_type');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if (isset($folder_id) && !empty($folder_id)) {
			$wherec["folder_id"] = '= ' . $folder_id . '';
		} else {
			$wherec["folder_id"] = "IS NULL";
		}

		if(isset($cmp_type) && !empty($cmp_type)){
			$wherec["cmp_type = "] = "'".$cmp_type."'";
		}

		$config["base_url"] = base_url() . "mediaFiles";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('media_id', 'media', $wherec);
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
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'media', $wherec, '', '', $join, $other);
		} else {
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'media', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $mediaDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}
		if ($mediaDetails) {
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

	public function adminMFiles()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$textSearch = $this->input->post('textSearch');
		$isAll = $this->input->post('getAll');
		$curPage = $this->input->post('curpage');
		//$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$mType = $this->input->post('mType');
		$folder_id = $this->input->post('folderID');

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
		if (isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)) {
			$textSearch = trim($textSearch);
			$wherec["$textSearch like  "] = "'" . $textval . "%'";
		}
		if (isset($folder_id) && !empty($folder_id)) {
			$wherec["folder_id"] = '= ' . $folder_id . '';
		} else {
			$wherec["folder_id"] = "IS NULL";
		}

		$config["base_url"] = base_url() . "mediaFiles";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('media_id', 'admin_media', $wherec);
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
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'admin_media', $wherec, '', '', $join, $other);
		} else {
			$mediaDetails = $this->CommonModel->GetMasterListDetails($selectC = '', 'admin_media', $wherec, $config["per_page"], $page, $join, $other);
		}

		$status['data'] = $mediaDetails;
		$status['paginginfo']["curPage"] = $curPage;
		if ($curPage <= 1)
			$status['paginginfo']["prevPage"] = 0;
		else
			$status['paginginfo']["prevPage"] = $curPage - 1;

		$status['paginginfo']["pageLimit"] = $config["per_page"];
		$status['paginginfo']["nextpage"] =  $curPage + 1;
		$status['paginginfo']["totalRecords"] =  $config["total_rows"];
		$status['paginginfo']["start"] =  $page;
		$status['paginginfo']["end"] =  $page + $config["per_page"];
		$status['loadstate'] = true;
		if ($config["total_rows"] <= $status['paginginfo']["end"]) {
			$status['msg'] = $this->systemmsg->getErrorCode(232);
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$status['loadstate'] = false;
			$this->response->output($status, 200);
		}
		if ($mediaDetails) {
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
	/* DIR Read
	public function readFoldersAndFiles()
	{	

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$nestedFolderPath = $this->input->post('nestedFolderPath');
		$backto = $this->input->post('backto');
		$readedFiles = array();
		$mediaRoot = $this->config->item("mediaPATH");
		
		if(isset($backto) && !empty($backto) && $backto !="root"){
			$readToDir = $mediaRoot."/".$backto;
			$pth = explode("/",$backto);
			$nestedFolderPath = implode("/",$pth);
				if(count($pth) > 1){
					array_pop($pth);
					$paths['backto']= implode("/",$pth);
				}else{
					$paths['backto']= "root";
				}
				$paths['realpath']= $backto;
				
		}else{
			if(isset($nestedFolderPath) && !empty($nestedFolderPath)){
				$pth = explode("/",$nestedFolderPath);
				if(count($pth) > 1){
					array_pop($pth);
					$paths['backto']= implode("/",$pth);
				}else{
					$paths['backto']= "root";
				}
				
				$readToDir = $mediaRoot."/".$nestedFolderPath;
			}else{
				$paths['backto']= "";
				$readToDir = $mediaRoot;
			}
			$paths['realpath']= $nestedFolderPath;
		}
		
		if (is_dir($readToDir)){
			$preDIR = getcwd();
			chdir($readToDir);

			if ($dh = opendir($readToDir)){
				while (($file = readdir($dh)) !== false){
					$fname=pathinfo($file);
					if($fname['basename'] != "." && $fname['basename'] != "..")
					{
						if((isset($nestedFolderPath))&&(!empty($nestedFolderPath)))
						{	
							$fname['realpath']=$nestedFolderPath;
						}else
						{
							$fname['realpath']= $paths['backto'];
						}
						$readedFiles[]=	$fname;
					}
				}
				closedir($dh);
			}
			chdir($preDIR);
		}
		
		
		//$paths['folderCurrentPath']=$folderCurrentPath;
		
		$status['data'] = $readedFiles;
		$status['paths']=$paths;
		if($readedFiles){
		$status['msg'] = "sucess";
		$status['statusCode'] = 400;
		$status['flag'] = 'S';
		$this->response->output($status,200);

		}else{
		$status['msg'] = $this->systemmsg->getErrorCode(227);
		$status['statusCode'] = 227;
		$status['flag'] = 'F';
		$this->response->output($status,200);
		}	
	}
	*/
	public function addFilesInFolder($folder_id)
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		// echo $mediapath = $this->config->item("mediaPATH");exit();
		/////////media............
		$image64 = $this->input->post('fileList');

		$imagetoup = $this->validatedata->validate('folderPath', 'folderPath', false, '', array());


		foreach ($image64 as $value) {
			$myPath = $imagetoup . "myImage_" . rand(1, 9999) . ".png";
			$saveImage = $this->base64_to_jpeg($value, $myPath);
		}
		if ($saveImage) {
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

		//......................

	}

	public function mediaUpload($pathTOSave = '')
	{
		$pathTOSave = $pathTOSave ?? '';
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$extraData = array();
		// $cmpType = $_GET['cmpType'];
		// print_r($pathTOSave);exit;
		$cmsType = $_GET['cmsType'];
		if(isset($cmsType) && !empty($cmsType) && $cmsType == "gallery" ){
			$extraData["cmp_type"] = $cmsType;
		}
		$mediapatharr = $this->config->item("mediaPATH");
		//$coursemediaPATH = $this->config->item("coursemediaPATH");
		if (!empty($pathTOSave) && $pathTOSave != 0) {
			// get folder name from tabel
			$dirname = $this->CommonModel->getMasterDetails("media", "*", array("media_id" => $pathTOSave));
			//print_r($dirname); exit;
			if (empty($dirname)) {
				$status['msg'] = $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} else {
				$extraData["folder_id"] = $pathTOSave;
				$pathTOSave = $mediapatharr . "/" . $dirname[0]->media_key;
			}
		} else {
			$pathTOSave = $mediapatharr;
		}

		$this->load->library('realtimeupload');
		if (!is_dir($pathTOSave)) {
			mkdir($pathTOSave, 0777);
			chmod($pathTOSave, 0777);
		} else {
			if (!is_writable($pathTOSave)) {
				chmod($pathTOSave, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $pathTOSave,
			'extension' => ['webp','png', 'pdf', 'jpg', 'jpeg', 'svg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'returnLocation' => false,
			'rename'=>true,
			'uniqueFilename' => false,
			'dbTable' => 'media',
			'fileTypeColumn' => 'media_type',
			'fileColumn' => 'media_key',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		//$uploader = new RealTimeUpload();
		$this->realtimeupload->init($settings);
	}

	public function receiptUpload($pathTOSave = '')
	{
		//echo "dd".$pathTOSave; exit;
		$pathTOSave = $pathTOSave ?? '';
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$extraData = array();
		$mediapatharr = $this->config->item("mediaPATH");
		//$coursemediaPATH = $this->config->item("coursemediaPATH");
		if (!empty($pathTOSave) && $pathTOSave != 0) {
			// get folder name from tabel
			$dirname = $this->CommonModel->getMasterDetails("media", "*", array("media_id" => $pathTOSave));
			//print_r($dirname); exit;
			if (empty($dirname)) {
				$status['msg'] = $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			} else {
				$extraData["folder_id"] = $pathTOSave;
				$pathTOSave = $mediapatharr . "/" . $dirname[0]->media_key;
			}
		} else {
			$pathTOSave = $mediapatharr;
		}

		$this->load->library('realtimeupload');
		if (!is_dir($pathTOSave)) {
			mkdir($pathTOSave, 0777);
			chmod($pathTOSave, 0777);
		} else {
			if (!is_writable($pathTOSave)) {
				chmod($pathTOSave, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $pathTOSave,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'svg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'returnLocation' => false,
			'rename'=>true,
			'uniqueFilename' => false,
			'dbTable' => 'media',
			'fileTypeColumn' => 'media_type',
			'fileColumn' => 'media_key',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		//$uploader = new RealTimeUpload();
		$this->realtimeupload->init($settings);
	}

	public function otherMediaUpload($dirRoot = '', $pathTOSave = '')
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$extraData = array();
		//$mediapatharr = $this->config->item("adminmediaPATH");
		$mediapatharr = $this->config->item("adminmediaPATH") . $dirRoot . "/";

		if (!empty($pathTOSave) && $pathTOSave != 0)
			$mediapatharr = $mediapatharr . $pathTOSave;

		if (!is_dir($mediapatharr)) {
			// The directory doesn't exist, so create it
			if (mkdir($mediapatharr, 0777, true)) {
				echo "Directory created successfully: $mediapatharr";
			} else {
				//echo "Failed to create directory: $mediapatharr";
				$status['msg'] = "Failed to create directory: " . $mediapatharr . "</br>" . $this->systemmsg->getErrorCode(273);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		} //else {
		// 	echo "Directory already exists: $mediapatharr";
		// }
		// exit;
		// if (!empty($pathTOSave) && $pathTOSave != 0) {
		// 	// get folder name from tabel
		// 	$dirname = $this->CommonModel->getMasterDetails("media", "*", array("media_id" => $pathTOSave));
		// 	//print_r($dirname); exit;
		// 	if (empty($dirname)) {
		// 		$status['msg'] = $this->systemmsg->getErrorCode(273);
		// 		$status['statusCode'] = 227;
		// 		$status['flag'] = 'F';
		// 		$this->response->output($status, 200);
		// 	} else {
		// 		$extraData["folder_id"] = $pathTOSave;
		// 		$pathTOSave = $mediapatharr . "/" . $dirname[0]->media_key;
		// 	}
		// } else {
		// 	$pathTOSave = $mediapatharr;
		// }
		$extraData["folder_id"] = $pathTOSave;
		$extraData["media_value"] = $dirRoot;
		$this->load->library('realtimeupload');
		if (!is_dir($mediapatharr)) {
			mkdir($mediapatharr, 0777);
			chmod($mediapatharr, 0777);
		} else {
			if (!is_writable($mediapatharr)) {
				chmod($mediapatharr, 0777);
			}
		}
		//print $pathTOSave; exit;
		$settings = array(
			'uploadFolder' => $mediapatharr,
			'extension' => ['png', 'pdf', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav', 'docx', 'doc', 'xls', 'xlsx'],
			'maxFolderFiles' => 0,
			'maxFolderSize' => 0,
			'rename'=>true,
			'returnLocation' => false,
			'uniqueFilename' => false,
			'dbTable' => 'admin_media',
			'fileTypeColumn' => 'media_type',
			'fileColumn' => 'media_key',
			'forignKey' => '',
			'forignValue' => '',
			'docType' => "",
			'docTypeValue' => '',
			'isSaveToDB' => "Y",
			'extraData' => $extraData,
		);
		$this->realtimeupload->init($settings);
	}

	public function addDIR()
	{

		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$dirName = $this->input->post('dirName');
		$mediapatharr = explode("media", $this->config->item("mediaPATH"));
		$folderPath = $mediapatharr[0] . $this->input->post('folderPath');
		$dirName = str_replace(" ", "_", $dirName);
		if (!is_dir($folderPath . $dirName)) {
			mkdir($folderPath . $dirName, 0777);
			chmod($folderPath . $dirName, 0777);

			// save dir in db
			$issave = $this->CommonModel->saveFile("media", "media_key", $dirName, "", "media_type", "folder", "", array("is_folder" => "y"));
			if ($issave) {
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
		} else {

			$status['msg'] = $this->systemmsg->getErrorCode(281);
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}

	public function deleteFolder()
	{
		$folderPathToDelete = $this->input->post('folderPathToDelete');
		$mediapatharr = explode("media", $this->config->item("mediaPATH"));
		$dir = $mediapatharr[0] . $folderPathToDelete;
		// echo $dir;exit;
		// $dir = 'samples' . DIRECTORY_SEPARATOR . 'sampledirtree';
		$it = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
		$files = new RecursiveIteratorIterator($it, RecursiveIteratorIterator::CHILD_FIRST);
		// print_r($files); exit;
		foreach ($files as $file) {
			if ($file->isDir()) {
				rmdir($file->getRealPath());
			} else {
				unlink($file->getRealPath());
			}
		}
		$rem = rmdir($dir);
		if ($rem) {
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

	public function deleteFile()
	{
		$filePath = $this->input->post('filepath');
		$idsToRemove = $this->input->post('idsToRemove'); //by Sanjay
		$nestedFolderPath = $this->input->post('nestedFolderPath');
		// echo $nestedFolderPath;exit;
		$mediapatharr = explode("media", $this->config->item("mediaPATH"));
		$dir = $mediapatharr[0] . $nestedFolderPath . $filePath;
		//echo  $dir;exit;
		$issave = $this->CommonModel->deleteMasterDetails("media", "media_id=" . trim($idsToRemove));
		if (file_exists($dir) && $dir != '') {
			if ($issave) {
				chmod($dir, 0777);
				unlink($dir);
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
		} else {
			$status['msg'] = $this->systemmsg->getErrorCode(227);
			$status['statusCode'] = 227;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		}
	}

	function base64_to_jpeg($base64_string = '', $output_file = '')
	{
		// open the output file for writing
		$ifp = fopen($output_file, 'wb');

		// split the string on commas
		// $data[ 0 ] == "data:image/png;base64"
		// $data[ 1 ] == <actual base64 string>
		$data = explode(',', $base64_string);

		// we could add validation here with ensuring count( $data ) > 1
		fwrite($ifp, base64_decode($data[1]));

		// clean up the file resource
		fclose($ifp);

		return $output_file;
	}
}
