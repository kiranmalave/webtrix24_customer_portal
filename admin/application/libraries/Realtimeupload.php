<?php
#[\AllowDynamicProperties]
class realtimeupload
{
	private $UPLOAD_SETTINGS = array(
		'uploadFolder' =>  'uploads', // name of the upload folder
		'maxFileSize' => 2097152, // max file size in KB
		'extension' => [''], // whitelist. If no extension is specified, nothing can be uploaded
		'rename' => true, // required for security
		'overwrite' => false, // if set to false, file with identical name will be renamed
		'maxFolderFiles' => 0, // number of file that can be uploaded in the destination folder (NOT file per user)
		'maxFolderSize' => 0, // size in KB, 0 means no limit
		'protectUploadDirectory' => true, // disallow listing or execution within the upload directory
		'denyUploadDirectoryAccess' => false, // disallow access to the upload folder
		'uniqueFilename' => false, // if set to true, generate a random filename for each uploaded file
		'returnLocation' => false, // return the url of the uploaded file
		'maxWidth' => 0, // maximum width allowed for an image
		'maxHeight' => 0, // maximum height allowed for an image
		'forignValue' => 0, // memberID to update databse records
		'fileType' => 'image',
		'dbTable' => null,
		'fileTypeColumn' => null,
		'fileColumn' => null,
		'forignKey' => null,
		'extraData' => null,
		'isSaveToDB' => "Y",
		'isUpdate' => "N",
		'primaryKey' => null,
		'primaryValue' => null,

	);

	private $UPLOAD_NAME;
	private $UPLOAD_TMPNAME;
	private $UPLOAD_TYPE;
	private $UPLOAD_ERROR;
	private $UPLOAD_SIZE;
	private $UPLOAD_TOTALSIZE = 0;

	var $live_url = "";
	var $appName = "";
	var $live_base_url = "";
	public function __construct()
	{

		//parent::__construct();
		$this->CI = &get_instance();
		$this->CI->load->model('CommonModel');
		$this->CI->load->library('ImageOpt');
		$this->CI->load->helper('url');
		$this->live_base_url = $this->CI->config->item('live_base_url');
	}

	public function name()
	{
		return $this->UPLOAD_NAME;
	}

	public function tmpname()
	{
		return $this->UPLOAD_TMPNAME;
	}

	public function type()
	{
		return $this->UPLOAD_TYPE;
	}

	public function error()
	{
		return $this->UPLOAD_ERROR;
	}

	public function size()
	{
		return $this->UPLOAD_SIZE;
	}

	public function totalsize()
	{
		return $this->UPLOAD_TOTALSIZE;
	}

	public function sanitize($folder = '')
	{
		if (isset($folder)) {
			return $this->sanitizeFilename($folder, '');
		} else {
			return false;
		}
	}

	// When called this function will removed all .tmp files older than 24h from the upload folder
	public function removeTmp($folder = '', $time = '')
	{
		if (!isset($time)) {
			$time = 24;
		}
		if (isset($folder)) {
			$files = glob($folder . "/*");
			$now   = time();
			$counter = 0;
			foreach ($files as $file) {
				if (is_file($file)) {
					if ($now - filemtime($file) >= 60 * 60 * $time && pathinfo($file, PATHINFO_EXTENSION) == 'tmp') {
						unlink($file);
						$counter++;
					}
				}
			}
			return $counter;
		} else {
			return false;
		}
	}

	public function init($settings = array())
	{

		foreach ($this->UPLOAD_SETTINGS as $key => $value) {
			if (array_key_exists($key, $settings)) {
				$this->UPLOAD_SETTINGS[$key] = $settings[$key];
			}
		}

		// Check if upload folder exists and is writable, if not create it with 0777 authorizations
		if (!file_exists($this->UPLOAD_SETTINGS['uploadFolder']) || !is_writable($this->UPLOAD_SETTINGS['uploadFolder'])) {
			mkdir($this->UPLOAD_SETTINGS['uploadFolder'], 0777, true);
		}

		// If 'protectUploadDirectory' is set to true, create an .htaccess that will prevent listing and script execution within the upload folder
		if ($this->UPLOAD_SETTINGS['protectUploadDirectory']) {
			$p = $this->UPLOAD_SETTINGS['uploadFolder'] . '/.htaccess';
			if (!file_exists($p)) {
				$htContent = "RemoveHandler .php\nOptions -Indexes";

				if ($this->UPLOAD_SETTINGS['denyUploadDirectoryAccess']) {
					$htContent .= "\ndeny from all";
				}

				$ht = fopen($p, 'c');
				// acquire an exclusive lock (avoid parallel overwriting)
				if (flock($ht, LOCK_SH | LOCK_NB) && flock($ht, LOCK_EX)) {
					fwrite($ht, $htContent);
					fflush($ht);
					flock($ht, LOCK_UN);
				}
				fclose($ht);
			}
		}

		// If files are being uploaded, start upload
		if (!empty($_FILES)) {
			$this->getFileStatus();
		}
	}

	private function getFileStatus()
	{
		foreach ($_FILES as $index => $tmpName) {
			try {
				if (is_array($_FILES[$index]['tmp_name'])) {
					for ($i = 0, $l = count($_FILES[$index]['tmp_name']); $i < $l; $i++) {
						$this->UPLOAD_NAME = $_FILES[$index]['name'][$i];
						$this->UPLOAD_TMPNAME = $_FILES[$index]['tmp_name'][$i];
						$this->UPLOAD_TYPE = $_FILES[$index]['type'][$i];
						$this->UPLOAD_ERROR = $_FILES[$index]['error'][$i];
						$this->UPLOAD_SIZE = $_FILES[$index]['size'][$i];
						$this->UPLOAD_TOTALSIZE += $_FILES[$index]['size'][$i];
						$this->uploadFile();
					}
				} else {
					$this->UPLOAD_NAME = $_FILES[$index]['name'];
					$this->UPLOAD_TMPNAME = $_FILES[$index]['tmp_name'];
					$this->UPLOAD_TYPE = $_FILES[$index]['type'];
					$this->UPLOAD_ERROR = $_FILES[$index]['error'];
					$this->UPLOAD_SIZE = $_FILES[$index]['size'];
					$this->UPLOAD_TOTALSIZE += $_FILES[$index]['size'];
					$this->uploadFile();
				}
			} catch (Exception $e) {
				$this->uploadDisplayError('Missing parameters' . $e);
			}
		}
	}

	private function uploadFile()
	{

		$uploaded = false;
		$uploadedFile = '';

		// Check if the upload folder maximum size has been reached
		$this->getUploadFolderSize();

		// Check if there are upload error
		switch ($this->UPLOAD_ERROR) {
			case UPLOAD_ERR_OK:
				break;
			case UPLOAD_ERR_NO_FILE:
				$this->uploadDisplayError('No file sent');
			case UPLOAD_ERR_INI_SIZE:
			case UPLOAD_ERR_FORM_SIZE:
				$this->uploadDisplayError('Exceeded filesize limit');
		}

		// If the x-filename header differs from the given filename, use the header
		if (isset($_SERVER['HTTP_X_FILENAME']) && $_SERVER['HTTP_X_FILENAME'] != null) {
			if ($_SERVER['HTTP_X_FILENAME'] != $this->UPLOAD_NAME) {
				$this->UPLOAD_NAME = $_SERVER['HTTP_X_FILENAME'];
			}
		}

		// If the client upload chunk, get the total file size
		$chunks = false;
		if (isset($_SERVER['HTTP_X_FILESIZE']) && $_SERVER['HTTP_X_FILESIZE'] != null) {
			if ($_SERVER['HTTP_X_FILESIZE'] > $this->UPLOAD_SIZE) {
				$chunks = true;
			}
		}

		// If the client has cancelled a chunk upload
		$remove = false;
		if (isset($_SERVER['HTTP_X_REMOVE']) && $_SERVER['HTTP_X_REMOVE'] != null) {
			$remove = true;
		}


		// Check if maximum number of files in the upload folder hasn't been reached
		if (isset($this->UPLOAD_SETTINGS['maxFolderFiles']) && $this->UPLOAD_SETTINGS['maxFolderFiles'] > 0) {
			$filesLength = array_diff(scandir($this->UPLOAD_SETTINGS['uploadFolder']), array(".", "..", ".htaccess"));
			if (count($filesLength) >= $this->UPLOAD_SETTINGS['maxFolderFiles']) {
				$this->uploadDisplayError('Maximum number of files allowed reached');
			}
		}


		// Check if the extension is allowed
		$extension = strtolower(pathinfo($this->UPLOAD_NAME, PATHINFO_EXTENSION));
		if (array_search(strtolower($extension), array_map('strtolower', $this->UPLOAD_SETTINGS['extension'])) === false && count($this->UPLOAD_SETTINGS['extension']) > 0) {
			$this->uploadDisplayError('File extension not allowed');
		}


		// Check if the filename is not too long
		if (strlen($this->UPLOAD_NAME) > 180) {
			$this->uploadDisplayError('File name is too long');
		}


		// Check if the file size is inferior to allowed file size			
		if (($this->UPLOAD_SIZE > ($this->UPLOAD_SETTINGS['maxFileSize'] * 1024)) || (isset($_SERVER['HTTP_X_FILESIZE']) && $_SERVER['HTTP_X_FILESIZE'] > ($this->UPLOAD_SETTINGS['maxFileSize'] * 1024))) {
			$this->uploadDisplayError('File size is too big');
		}


		// Rename the uploaded file to prevent security flaws
		if ($this->UPLOAD_SETTINGS['rename']) {
			$filename = $this->sanitizeFilename(basename($this->UPLOAD_NAME, '.' . $extension), $extension);
		} else {
			$filename = $this->UPLOAD_NAME;
		}


		// Rename the file if a file with the same name exists and 'overwrite' is set to false
		if (!$this->UPLOAD_SETTINGS['overwrite']) {
			$i = 1;
			$newfilename = $filename;
			while (file_exists($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $newfilename)) {
				$newfilename = basename($filename, '.' . $extension) . '(' . $i . ').' . $extension;

				// if renamed filename length is superior to 180
				$l = strlen($this->UPLOAD_NAME);
				if ($l > 180) {
					substr($string, 0, (180 - $l));
					$newfilename = substr(basename($filename, '.' . $extension), 0, (180 - $l)) . '(' . $i . ').' . $extension;
				}
				$i++;
			}
			$filename = $newfilename;
		}


		if ($chunks) { // if chunk upload
			if ($remove) { // remove file if upload has been canceled
				$s = unlink($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp');
			} else {

				// Add chunk to the temporary uploaded file
				file_put_contents($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp', file_get_contents($_FILES["file"]["tmp_name"]), FILE_APPEND);
				$resultSize = filesize($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp');

				// Stop chunks upload if the file is too big
				if ($resultSize > ($this->UPLOAD_SETTINGS['maxFileSize'] * 1024)) {
					unlink($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp');
					$this->uploadDisplayError('File size is too big');
				} else if ($_SERVER['HTTP_X_FILESIZE'] == $resultSize) { // all chunks have been uploaded

					// Check image width and height
					$this->checkImageSize(($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp'));

					// Rename file if unique filename is set to true
					if ($this->UPLOAD_SETTINGS['uniqueFilename']) {
						$n = $this->uniqueFilename($this->UPLOAD_SETTINGS['uploadFolder'], $extension); // generate a unique file id
						rename(($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp'), $n);
						$uploadedFile = $n;
					} else {
						rename($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename . '.tmp', $this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename);
						$uploadedFile = $this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename;
					}
				}
				$uploaded = true;
			}
		} else { // if classic upload

			// Move the file to the upload folder
			move_uploaded_file(
				$this->UPLOAD_TMPNAME,
				$this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename
			);

			// Check image width and height
			$this->checkImageSize(($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename));

			$uploadedFile = $this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename;

			// Rename file if unique filename is set to true
			if ($this->UPLOAD_SETTINGS['uniqueFilename']) {
				$n = $this->uniqueFilename($this->UPLOAD_SETTINGS['uploadFolder'], $extension); // generate a unique file id
				chmod($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename, 0777);
				rename(($this->UPLOAD_SETTINGS['uploadFolder'] . '/' . $filename), $n);
				chmod($n, 0644);
				$uploadedFile = $n;
			}

			$uploaded = true;
		}

		if ($uploaded && $uploadedFile != '') {
			$json = array(
				'status' => 'File uploaded'
			);
			if ($this->UPLOAD_SETTINGS['returnLocation']) {
				$json['url'] = $uploadedFile;
			}
			if ($this->UPLOAD_SETTINGS['isSaveToDB'] == "Y") {
				$this->updateDatabse($uploadedFile);
			}

			echo json_encode($json);
		} else {
			$json = array(
				'status' => 'Uploading'
			);
			echo json_encode($json);
		}
	}

	// This function is used to sanitize the file name (prevent security exploit)
	private function sanitizeFilename($filename = '', $extension = '')
	{
		$filename = preg_replace('/[^a-zA-Z0-9_-]/i', '_', $filename);
		if ($extension != '') {
			$filename .= '.' . $extension;
		}
		return $filename;
	}

	// If the file is an image, check its width and height
	private function checkImageSize($file = '')
	{
		if ($this->UPLOAD_SETTINGS['maxWidth'] != 0 || $this->UPLOAD_SETTINGS['maxHeight'] != 0) {
			list($width, $height) = getimagesize($file);
			if (($width > $this->UPLOAD_SETTINGS['maxWidth'] && $this->UPLOAD_SETTINGS['maxWidth'] > 0) && ($height > $this->UPLOAD_SETTINGS['maxHeight'] && $this->UPLOAD_SETTINGS['maxHeight'] > 0)) {
				$p = unlink($file);
				$this->uploadDisplayError('Image cannot exceeds ' . $this->UPLOAD_SETTINGS['maxWidth'] . 'px on ' . $this->UPLOAD_SETTINGS['maxHeight'] . 'px');
			}
		}
	}

	// Return an error code to the client if an error has occured
	private function uploadDisplayError($error = '')
	{
		$json = array(
			'error' => $error
		);
		echo json_encode($json);
		exit();
	}

	// Generate a unique file name
	private function uniqueFilename($folder = '', $extension = '')
	{
		//$uid = uniqid();
		$forignValue = $this->UPLOAD_SETTINGS['forignValue'];
		$imageName = microtime(true) . "{$forignValue}." . $extension;
		$filename = $folder . '/' . $imageName;

		/*$uSu = mt_rand(10000,99999);
		$filename = $folder.'/'.$uid.$uSu.'.'.$extension;
		while(file_exists($filename)) { // check if a file with the same name doesn't exist already
			$uSu = mt_rand(10000,99999);
			$filename = $folder.'/'.$uid.$uSu.'.'.$extension;
		}*/
		return $filename;
	}

	// Check the size of the upload folder
	private function getUploadFolderSize()
	{
		$path = $this->UPLOAD_SETTINGS['uploadFolder'];
		$limit = ($this->UPLOAD_SETTINGS['maxFolderSize'] * 1024);

		if ($limit > 0) {
			$size = 0;
			$path = realpath($path);
			if ($path !== false) {
				foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS)) as $object) {
					$size += $object->getSize();
				}
			}

			if ($size > $limit) {
				$this->uploadDisplayError('Upload folder maximum size reached');
			}
		}
	}
	private function updateDatabse($file = '')
	{
		$extension = strtolower(pathinfo($this->UPLOAD_NAME, PATHINFO_EXTENSION));
		$arrayimg = array('jpg','jpeg','png','gif');
		$arrayVideo = array('mp4','mov','avi','3gp');
		$arraytxt = array('docx','doc','ppt','txt','pdf','xls','xlsx');
		$fileType = "file";
		if (in_array(strtolower($extension), $arrayimg)) {
			$fileType = "image";
		}
		if (in_array(strtolower($extension), $arrayVideo)) {
			$fileType = "video";
		}
		if (in_array(strtolower($extension), $arraytxt)) {
			$fileType = "file";
		}
		$forignValue = $this->UPLOAD_SETTINGS['forignValue'];
		$table = $this->UPLOAD_SETTINGS['dbTable'];

		$isUpdate = 'N'; 
		
		$where = array();
		if (isset($this->UPLOAD_SETTINGS['isUpdate']) && !empty($this->UPLOAD_SETTINGS['isUpdate'])) {
			$isUpdate = $this->UPLOAD_SETTINGS['isUpdate'];
		}
		if (isset($this->UPLOAD_SETTINGS['primaryKey']) && !empty($this->UPLOAD_SETTINGS['primaryKey'])) {
			$where[''.$this->UPLOAD_SETTINGS['primaryKey']] = $this->UPLOAD_SETTINGS['primaryValue'];
		}
		// print_r($this->UPLOAD_SETTINGS);
		$fileTypeColumn = $this->UPLOAD_SETTINGS['fileTypeColumn'];
		$fileColumn = $this->UPLOAD_SETTINGS['fileColumn'];
		$forignKey = $this->UPLOAD_SETTINGS['forignKey'];
		if (isset($this->UPLOAD_SETTINGS['extraData']) && !empty($this->UPLOAD_SETTINGS['extraData']))
			$extraData = $this->UPLOAD_SETTINGS['extraData'];
		else
			$extraData = array();

		$imagename = explode("/", $file);
		$filename = end($imagename);
		
		if($this->CI->imageopt->optimize_image($file,$file)){
        	$this->CI->imageopt->create_thumbnails($file,$this->UPLOAD_SETTINGS['uploadFolder']);
        }
		$photos = $this->CI->CommonModel->saveFile($table, $fileColumn, $filename, $forignValue, $fileTypeColumn, $fileType, $forignKey, $extraData = $extraData, $file, $isUpdate,$where);
		if (!$photos) {
			$json = array(
				'status' => 'fail to upload.'
			);
			echo json_encode($json);
		}
	}
}
