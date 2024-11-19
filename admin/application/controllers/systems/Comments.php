<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Comments extends CI_Controller
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
		$this->load->library("pagination");
		$this->load->library("response");
		$this->load->library("ValidateData");
		$this->load->library("Datatables");
		$this->load->library("Filters");
		if(!$this->config->item('development'))
		{
			$this->load->library("NotificationTrigger");
			$this->load->library("notifications");
			$this->load->library("emails");
		}
	}

	public function getCommentsDetails()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$isAll = $this->input->post('getAll');
		$textSearch = $this->input->post('textSearch');
		$curPage = $this->input->post('curpage');
		$textval = $this->input->post('textval');
		$orderBy = $this->input->post('orderBy');
		$order = $this->input->post('order');
		$statuscode = $this->input->post('status');
		//$task_id = $this->input->post('task_id');
        $record_id = $this->input->post('record_id');
        $type = $this->input->post('type');
        if(!isset($type) || empty($type)){
            $status['msg'] = $this->systemmsg->getErrorCode(227);
            $status['statusCode'] = 227;
            $status['flag'] = 'F';
            $this->response->output($status, 200);
        }
		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "t.created_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');
		$wherec = $join = array();
        if (isset($statuscode) && !empty($statuscode)) {
			$statusStr = str_replace(",", '","', $statuscode);
			$wherec["t.status"] = 'IN ("' . $statusStr . '")';
		}
        $table="";
		//print $record_id; exit;
        if($type=="task"){
            if (isset($record_id) && !empty($record_id)) {
                $wherec["t.task_id"] = '= (' . $record_id . ')';
                $table = "task_comments";
            }
        }
		if($type=="project"){
            if (isset($record_id) && !empty($record_id)) {
                $wherec["t.project_id"] = '= (' . $record_id . ')';
                $table = "project_comments";
            }
        } 
		$adminID = $this->input->post('SadminID');
		$join = array();
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";
		//print  $table;exit;
		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('comment_id', $table, $wherec, $other);
		$config["uri_segment"] = 2;
		
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}
        
		$taskDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*,a.name,a.photo,a.adminID',$table, $wherec, $config["per_page"], $page, $join, $other);
        //print $this->db->last_query();exit;
        // foreach ($taskDetails as $taskDetail) {
        //     if (is_object($taskDetail)) {
        //         $fullName = $taskDetail->name;
        //         if(isset($fullName) && !empty($fullName)){
        //             $nameParts = explode(' ', $fullName);
        //             $firstLetterName = substr($nameParts[0], 0, 1);
        //             $firstLetterLastName = substr($nameParts[count($nameParts) - 1], 0, 1);
        //             $initials = $firstLetterName . $firstLetterLastName;
        //             $taskDetail->initial = $initials;
        //         }
        //     }
        // }
		$status['data'] = $taskDetails;
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
		if ($taskDetails) {
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

	public function deleteComment()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$action = $this->input->post("action");
		$commentID= $this->input->post("list");
		$wherec["comment_id ="] = $commentID;
		$changestatus = $this->CommonModel->deleteMasterDetails('task_comments',$wherec);
		if($changestatus){
			$status['data'] = array();
			$status['statusCode'] = 200;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['data'] = array();
			$status['msg'] = $this->systemmsg->getErrorCode(996);
			$status['statusCode'] = 996;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function addTaskHistory($task_id, $action_type, $description, $user_id, $parentRecordID)
	{
		
		$taskDetails = array(
			'record_id' => $task_id,
			'action_type' => $action_type,
			'description' => $description,
			'user_id' => $user_id,
			'parent_record_id' => $parentRecordID,
			'record_type' => 'task',
			'col'=> 'Task',
			'old_date'=>null,
			'new_date'=>null,
			'activity_date' => date('Y-m-d H:i:s')
		);
		return $this->CommonModel->saveMasterDetails('history', $taskDetails);
		
	}
	public function getTaskHistory()
	{
        $this->access->checkTokenKey();
		$this->response->decodeRequest();
		$curPage = $this->input->post('curpage');
		$record_id = $this->input->post('record_id');
		
		$record_type = $this->input->post('type');
		$wherec = $join = array();
		if (isset($record_id) && !empty($record_id)) {
			$wherec["record_id"] = '= (' . $record_id . ')';
		}

		if (isset($record_type) && !empty($record_type)) {
			$wherec["record_type"] = '= "' . $record_type . '"';
		}
		
		$join[0]['type'] = "LEFT JOIN";
		$join[0]['table'] = "admin";
		$join[0]['alias'] = "a";
		$join[0]['key1'] = "user_id";
		$join[0]['key2'] = "adminID";

		$config = array();
		if (!isset($orderBy) || empty($orderBy)) {
			$orderBy = "activity_date";
			$order = "DESC";
		}
		$other = array("orderBy" => $orderBy, "order" => $order);

		$config = $this->config->item('pagination');

		$config["base_url"] = base_url() . "taskDetails";
		$config["total_rows"] = $this->CommonModel->getCountByParameter('history_id', 'history', $wherec, $other);
		$config["uri_segment"] = 2;
		//print_r($config);exit;
		$this->pagination->initialize($config);
		if (isset($curPage) && !empty($curPage)) {
			$curPage = $curPage;
			$page = $curPage * $config["per_page"];
		} else {
			$curPage = 0;
			$page = 0;
		}

		$historyDetails = $this->CommonModel->GetMasterListDetails($selectC = 't.*,a.adminID,a.name', 'history', $wherec, $config["per_page"], $page, $join, $other);

		
		foreach ($historyDetails as $key => $value) {
			if($value->col == "Task Priority" || $value->col == "Task Type" || $value->col == "Task Status"){
			$where["category_id"] =$value->old_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			$historyDetails[$key]->old_val = !empty($catoldval) ? $catoldval[0]->categoryName : null;

			$where["category_id"] =  $value->new_val;
			$catoldval = $this->CommonModel->GetMasterDetails('categories','categoryName',$where);
			if($value->new_val != 0){
				if( isset($catoldval) && !empty($catoldval)){
					$historyDetails[$key]->new_val = $catoldval[0]->categoryName;
				}
			}
			}
			if ($value->col == "Assignee") {
				$wherea["adminID"] = $value->old_val;
				$adminoldval = $this->CommonModel->GetMasterDetails('admin', 'name', $wherea);
				$historyDetails[$key]->old_val = !empty($adminoldval) ? $adminoldval[0]->name : null;
		
				$wherea["adminID"] = $value->new_val;
				$adminnewval = $this->CommonModel->GetMasterDetails('admin', 'name', $wherea);
				$historyDetails[$key]->new_val = !empty($adminnewval) ? $adminnewval[0]->name : null;
			}
		
			if ($value->col == "Customer") {
				$whereu["customer_id"] = $value->old_val;
				$custoldval = $this->CommonModel->GetMasterDetails('customer', 'name', $whereu);
				$historyDetails[$key]->old_val = !empty($custoldval) ? $custoldval[0]->name : null;
		
				$whereu["customer_id"] = $value->new_val;
				$custnewval = $this->CommonModel->GetMasterDetails('customer', 'name', $whereu);
				$historyDetails[$key]->new_val = !empty($custnewval) ? $custnewval[0]->name : null;
			}
		}
		$status['data'] = $historyDetails;
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
		// print_r($historyDetails);exit;
		if ($historyDetails) {
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

    public function singleComment($comment_id="")
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		
        $type = $this->input->post("type");
        $record_id = $this->input->post("record_id");

		if ($method == "POST" || $method == "PUT") {
            
			$taskDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$type = $this->validatedata->validate('type', 'Record Type', true, '', array());
			if(!isset($type) || empty($type)){
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
			$table = "";
			if($type == "task"){
				$taskDetails['task_id'] = $this->validatedata->validate('record_id', 'Task ID', true, '', array());
				$table = "task_comments";

			}
			if($type == "project"){
				$taskDetails['project_id'] = $this->validatedata->validate('record_id', 'Project ID', true, '', array());
				$table = "project_comments";
			}
			
			$taskDetails['user_id'] = $this->validatedata->validate('user_id', 'User ID', false, '', array());
			$taskDetails['comment_text'] = $this->validatedata->validate('comment_text', 'Comment', true, '', array());
			$taskDetails['status'] = $this->validatedata->validate('status', 'Status', true, '', array());
			$mentions = $this->input->post('mentions');
			if ($method == "PUT") {
				$taskDetails['status'] = "active";
				$taskDetails['user_id'] = $this->input->post('SadminID');
				$taskDetails['created_date'] = $updateDate;
		
				$iscreated = $this->CommonModel->saveMasterDetails($table,$taskDetails);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					if(!$this->config->item('development')){
						$cDetails = $this->CommonModel->getMasterDetails('admin', 'name,email,photo', array('adminID'=> $taskDetails['user_id']));
						$messageDetails = $cDetails[0]->name ." mentioned you in Task comment"."<br>";
						$notification = array(
							'title' => "Mentioned in Comment",
							'body' => $messageDetails,
						);
						$profie_pic = "";
						if(isset($cDetails[0]->photo) && !empty($cDetails[0]->photo)){
							$profie_pic = "<div style='width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><img src='".$this->config->item('media_url')."profilephoto/1/profilePic/".$cDetails[0]->photo."'alt='".getFirstAndLastWordInitials($cDetails[0]->name)."'></div>";
						}else{
							$profie_pic = "<div style='width: 30px;height: 30px;overflow: hidden;border-radius: 50%;background: #f1f3f9;align-content: center;justify-content: center;font-size: 12px;display:flex;align-items: center;'><span>".getFirstAndLastWordInitials($cDetails[0]->name)."</span></div>";
						}
						$to = array();
						if(isset($mentions) && !empty($mentions)){
							foreach ($mentions as $value) {							
								$this->notifications->sendmessage($notification,$value);
								$where = array("adminID" => $value);	
								$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
								if(isset($tDetails)&& !empty($tDetails)){
									$to[] = $tDetails[0]->email;	
								}
							}
							$mentionBy ="";
							if(isset($cDetails)&& !empty($cDetails)){
								$mentionBy = $cDetails[0]->name;
							}
						
							$messageDetails="";
							$messageDetails.= "<div><p style='border-bottom: 1px solid #dee2e6;margin: 8px 0px;padding-bottom: 6px;'>".$mentionBy."&nbsp;<b style='display:inline-block;color:#172b4d'>mention you in comment</b></p>";
							if($type == "task"){
								// get task details
								$where = array("task_id" => $taskDetails['task_id']);	
								$tDetails = $this->CommonModel->getMasterDetails('tasks', 'subject', $where);
								$messageDetails.= "<p style='margin-bottom: 10px;'>Task/".$taskDetails['task_id']."</p>";
								$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#task/".$taskDetails['task_id']."'>".$tDetails[0]->subject."</a></p>";
								$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
								<div style='flex:0 0 auto'>".$profie_pic."</div>  <div style='flex:0 0 auto'>&nbsp;".$mentionBy."&nbsp;&nbsp;".$taskDetails['comment_text']."</div></div>";
								$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$taskDetails['task_id'].'">View Task</a></div><br/><br/></div>';
								$this->emails->sendMailDetails("","",$to,'','','mention you in task comment - '.$taskDetails['task_id'],$messageDetails);
							}else{
								$where = array("project_id" => $taskDetails['project_id']);	
								$tDetails = $this->CommonModel->getMasterDetails('projects', 'title', $where);
								$messageDetails.= "<p style='margin-bottom: 10px;'>Project/".$taskDetails['project_id']."</p>";
								$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#projects/".$taskDetails['project_id']."'>".$tDetails[0]->title."</a></p>";
								$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'>
								<div style='flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>&nbsp;".$mentionBy."&nbsp;&nbsp;".$taskDetails['comment_text']."</div></div>";
								$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#projects/".$taskDetails['project_id'].'">View Project</a></div><br/><br/></div>';
								$this->emails->sendMailDetails("","",$to,'','','mention you in project comment - '.$taskDetails['project_id'],$messageDetails);
							}
								//$this->emails->sendMailDetails("","",$to,'','',$messageDetails,'Task Comment - '.$taskDetails['comment_text']);
						}
						if($type == "task"){
							$whereClient = array("task_id" => $taskDetails['task_id']);
							$clientWatchers = $this->CommonModel->getMasterDetails('tasks_watchers', 'watchers_name,admin_id', $whereClient);
							$adminID = $this->input->post('SadminID');
							$wherec1=array("t.adminID ="=>$adminID);
							$selectC1="*";
							$taskDetailsList = $this->CommonModel->GetMasterListDetails($selectC1,'admin',$wherec1,'','','','');
							$to= array();
							if(isset($clientWatchers) && !empty($clientWatchers)){
								$messageDetails="";
								$messageDetails.= "<div><p style='border-bottom: 1px solid #dee2e6;margin: 8px 0px;padding-bottom: 6px;'>".$mentionBy."&nbsp;<b style='display:inline-block;color:#172b4d'> comented on task.</b></p>";
								$messageDetails.= "<p style='margin-bottom: 10px;'>Task/".$taskDetails['task_id']."</p>";
								//$messageDetails.= "<p><a style='color:rgb(0, 82, 204);font-size:20px' href='".$this->config->item("app_url")."#task/".$taskDetails['task_id']."'>".$taskDetails['subject']."</a></p>";
								$messageDetails.= "<div style='display: flex;justify-content: left;align-items: start;align-content: start;gap: 10px;margin-top: 15px;line-height: 28px;'><div style='flex:0 0 auto'>".$profie_pic."</div><div style='flex:0 0 auto'>&nbsp;".$mentionBy."&nbsp;&nbsp;".$taskDetails['comment_text']." <br> "."</div></div>";
								$messageDetails.='<br><div style="background: #1962d1;color: #fff;width: auto;display: inline-block;padding: 8px 15px;border-radius: 4px;"><a style="color:#fff" href="'.$this->config->item("app_url")."#task/".$taskDetails['task_id'].'">View Task</a></div><br/><br/></div>';
								
								foreach ($clientWatchers as $key => $value) {
									$adminId = $value->admin_id;
									$watcherName = $value->watchers_name;
									//$messageDetails = $watcherName." mentioned you in Task comment"."<br>";
									$notification = array(
										'title' => $taskDetailsList[0]->name." Comented On Task. Task ID:-".$taskDetails['task_id'],
										'body' => 'Task Comment - '.$taskDetails['comment_text']);
									
									$this->notifications->sendmessage($notification,$adminId);
									$where = array("adminID" =>$adminId);
									$tDetails = $this->CommonModel->getMasterDetails('admin', 'name,email', $where);
									if(isset($tDetails)&& !empty($tDetails)){
										$to[] = $tDetails[0]->email;	
									}
									
								}
								if (!$this->config->item('development') && !empty($to)) {
									$this->emails->sendMailDetails("","",$to,'','',$mentionBy." Comented On Task. Task ID:-".$taskDetails['task_id'], 'Task Comment - '.$taskDetails['comment_text']);
								}
							}
						}
					}
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
				
			} elseif ($method == "POST") {
                $comment_id = $this->input->post("comment_id");
				$where = array('comment_id' => $comment_id);
				$taskDetails['user_id'] = $this->input->post('SadminID');
                $taskDetails['modified_date'] =  date("Y/m/d H:i:s");
				if (!isset($comment_id) || empty($comment_id)) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}
				$iscreated = $this->CommonModel->updateMasterDetails('task_comments', $taskDetails, $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			} elseif ($method == "dele") {
				$taskDetails = array();
				$where = array('sID' => $sID);
				if (!isset($sID) || empty($sID)) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('task_comments', $where);
				if (!$iscreated) {
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status, 200);
				} else {
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] = array();
					$status['flag'] = 'S';
					$this->response->output($status, 200);
				}
			}
		} elseif ($method == "GET") {
			//$where = array("user_id" => 92); //array("user_id"=>$user_id);
			$taskDetails = $this->CommonModel->getMasterDetails('task_comments', '', $where);
			if (isset($taskDetails) && !empty($taskDetails)) {
				$status['data'] = $taskDetails;
				$status['statusCode'] = 200;
				$status['flag'] = 'S';
				$this->response->output($status, 200);
			} else {
				$status['msg'] = $this->systemmsg->getErrorCode(227);
				$status['statusCode'] = 227;
				$status['data'] = array();
				$status['flag'] = 'F';
				$this->response->output($status, 200);
			}
		}
	}
}