<?php
defined('BASEPATH') or exit('No direct script access allowed');

class TaskDashBoard extends CI_Controller
{

	function __construct()
	{
		parent::__construct();
		$this->load->helper('form');
		$this->load->model('CommonModel');
		$this->load->model('DashboardModel');
	}
	public function index()
	{
		$this->load->view('welcome_message');
	}
    public function priorityWiseTasks()
	{
		// $this->access->checkTokenKey();
		$this->response->decodeRequest();
		$data = $lables = $amounts = $bgColors = $borderColors = [];
		$categoryList = $this->DashboardModel->getCategoryBySlug('task_priority');
		foreach ($categoryList as $value) {
			//$det = $this->DashboardModel->getTasksByPriority($value->category_id);
			$tasks = $this->DashboardModel->getTasksCount($value->category_id,['task_priority' => $value->category_id]);
			$lables[] = $value->categoryName;
			$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0;
			$bgColors[] = $value->cat_color;
		}
		$data['current']['title'] = 'Priority Wise Task';
		$data['current']['lables'] = $lables;
		$data['current']['amounts'] = $amounts;
		$data['current']['bgColors'] = $bgColors;
		if ($data) {
			$status['data'] = $data;
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
    public function projectWiseTasks()
    {
        // $this->access->checkTokenKey();
		$this->response->decodeRequest();
        $data = array();
        $select = 'project_id,title';
        $whereT = array();
        $whereT['related_to'] = 'project';
        $projectlist = $this->CommonModel->GetMasterListDetails($select,'projects');
        $categoryList = $this->DashboardModel->getCategoryBySlug('task_status'); 
		$data = array();      
        foreach ($projectlist as $project) {
            $data = array();
            foreach ($categoryList as $category) {
                // $det = $this->DashboardModel->getTasksByproject($category->category_id, $value->project_id);
                // $data[''.$category->categoryName]= $det[0]->amount;
				$tasks = $this->DashboardModel->getTasksCount($category->category_id,['project_id' => $project->project_id]);
				$data[$category->categoryName] = $tasks[0]->amount;             
            }   
            $project->data = $data;
		}       
        // print_r($projectlist);exit;
		$data["ProjectWise_tasks"] = $projectlist;
		if (!empty($projectlist)) {
			$status['data'] = $projectlist;
			$status['msg'] = "success";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = "No data found";
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
    }
	public function assigneeWiseTasks()
	{
		// $this->access->checkTokenKey();
		$this->response->decodeRequest();
		$select = 'name,adminID';
		$assigneelist = $this->CommonModel->GetMasterListDetails($select,'admin');
		// print_r($assigneelist);exit;
		$categoryList = $this->DashboardModel->getCategoryBySlug('task_status'); 
		// print_r($categoryList);exit;
		$data = array(); 
		foreach ($assigneelist as $assignee) {
			$data = array();
			foreach ($categoryList as $category) {
				$tasks = $this->DashboardModel->getTasksCount($category->category_id,['assignee' => $assignee->adminID]);
				$data[$category->categoryName] = $tasks[0]->amount;
				// $det = $this->DashboardModel->getTasksByassignee($category->category_id, $value->adminID);
				// $data[''.$category->categoryName]= $det[0]->amount;
			}
			$assignee->data = $data;
		}
		// print $this->db->last_query();exit;
		// print_r($assigneelist);exit;
		$data["AssigneeWise_tasks"] = $assigneelist;
		if (!empty($assigneelist)) {
			$status['data'] = $assigneelist;
			$status['msg'] = "success";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = "No data found";
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
	public function customerWiseTasks()
	{
		// $this->access->checkTokenKey();
		$this->response->decodeRequest();
		$select = 'name,customer_id';
		$customerlist = $this->CommonModel->GetMasterListDetails($select,'customer');
		// print_r($customerlist);exit;
		$categoryList = $this->DashboardModel->getCategoryBySlug('task_status'); 
		// print_r($categoryList);exit;
		$data = array(); 
		foreach ($customerlist as $customer) {
			$data = array();
			foreach ($categoryList as $category) {
				$tasks = $this->DashboardModel->getTasksCount($category->category_id,['customer_id' => $customer->customer_id]);
				$data[$category->categoryName] = $tasks[0]->amount;
				// $det = $this->DashboardModel->getTasksBycustomer($category->category_id, $value->customer_id);
				// $data[''.$category->categoryName]= $det[0]->amount;
			}
			$customer->data = $data;
		}
		// print $this->db->last_query();exit;
		// print_r($customerlist);exit;
		$data["CustomerWise_tasks"] = $customerlist;
		if (!empty($customerlist)) {
			$status['data'] = $customerlist;
			$status['msg'] = "success";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = "No data found";
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
}
