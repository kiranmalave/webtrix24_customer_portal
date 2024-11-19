<?php
defined('BASEPATH') or exit('No direct script access allowed');

class LeadDashboard extends CI_Controller
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
	public function stagesWiseLeads()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		// dashboard_id : null,
		// type : 'invoice',
		// name: 'Income',
		// chart_type : 'line',
		// period_type : 'weeks',
		// view_type : 'graph',
		$data = $lables = $bgColors = $borderColors = [];
		$categoryList = $this->DashboardModel->getCategoryBySlug('lead_stages');
		foreach ($categoryList as $value) {
			$det = $this->DashboardModel->getLeadsByCategory($value->category_id);
			$lables[] = $value->categoryName;
			$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0;
			$bgColors[] = $value->cat_color;
		}
		$data['current']['title'] = 'Stages Wise Lead';
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
	public function sourceWiseLeads()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$data = $lables = $amounts = $bgColors = $borderColors = [];
		$categoryList = $this->DashboardModel->getCategoryBySlug('lead_source');
		foreach ($categoryList as $value) {
			$det = $this->DashboardModel->getLeadsBySources($value->category_id);
			$lables[] = $value->categoryName;
			$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0;
			$bgColors[] = $value->cat_color;
		}
		$data['current']['title'] = 'Source Wise Lead';
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
	public function generateRandomColor($i)
	{
		$colors = [
			['bgColor' => 'rgba(255, 94, 77, 0.6)', 'borderColor' => 'rgba(255, 94, 77, 1)'],   // Sunset Orange
			['bgColor' => 'rgba(255, 120, 68, 0.6)', 'borderColor' => 'rgba(255, 120, 68, 1)'],  // Deep Coral
			['bgColor' => 'rgba(255, 160, 58, 0.6)', 'borderColor' => 'rgba(255, 160, 58, 1)'],  // Golden Hour
			['bgColor' => 'rgba(255, 196, 87, 0.6)', 'borderColor' => 'rgba(255, 196, 87, 1)'],  // Sunset Yellow
			['bgColor' => 'rgba(255, 150, 180, 0.6)', 'borderColor' => 'rgba(255, 150, 180, 1)'], // Blush Pink
			['bgColor' => 'rgba(203, 153, 201, 0.6)', 'borderColor' => 'rgba(203, 153, 201, 1)'], // Soft Lavender
			['bgColor' => 'rgba(160, 100, 205, 0.6)', 'borderColor' => 'rgba(160, 100, 205, 1)'], // Twilight Purple
			['bgColor' => 'rgba(255, 80, 90, 0.6)', 'borderColor' => 'rgba(255, 80, 90, 1)'],    // Fiery Red
			['bgColor' => 'rgba(255, 190, 128, 0.6)', 'borderColor' => 'rgba(255, 190, 128, 1)'], // Peach Glow
			['bgColor' => 'rgba(255, 210, 140, 0.6)', 'borderColor' => 'rgba(255, 210, 140, 1)'], // Warm Sand
			['bgColor' => 'rgba(248, 131, 121, 0.6)', 'borderColor' => 'rgba(248, 131, 121, 1)'], // Rose Red
			['bgColor' => 'rgba(244, 117, 96, 0.6)', 'borderColor' => 'rgba(244, 117, 96, 1)'],  // Ember Glow
			['bgColor' => 'rgba(255, 94, 120, 0.6)', 'borderColor' => 'rgba(255, 94, 120, 1)'],  // Soft Red
			['bgColor' => 'rgba(250, 146, 81, 0.6)', 'borderColor' => 'rgba(250, 146, 81, 1)'],  // Autumn Orange
			['bgColor' => 'rgba(253, 212, 97, 0.6)', 'borderColor' => 'rgba(253, 212, 97, 1)'],  // Golden Sunset
			['bgColor' => 'rgba(227, 145, 114, 0.6)', 'borderColor' => 'rgba(227, 145, 114, 1)'], // Copper Rose
			['bgColor' => 'rgba(218, 118, 152, 0.6)', 'borderColor' => 'rgba(218, 118, 152, 1)'], // Rosy Dusk
			['bgColor' => 'rgba(206, 160, 205, 0.6)', 'borderColor' => 'rgba(206, 160, 205, 1)'], // Sunset Lavender
			['bgColor' => 'rgba(173, 99, 192, 0.6)', 'borderColor' => 'rgba(173, 99, 192, 1)'],  // Orchid Purple
			['bgColor' => 'rgba(245, 135, 100, 0.6)', 'borderColor' => 'rgba(245, 135, 100, 1)'], // Soft Tangerine
		];
		if ($i < count($colors)) {
			return $colors[$i];
		} else {
			return ['', ''];
		}
	}
	public function getUnattendedLeads()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$where = array();
		$startDate = $this->input->post('startDate');
		$endDate = $this->input->post('endDate');
		if (isset($startDate) && !empty($startDate)) {
			$where['startDate'] = $startDate;
		}
		if (isset($endDate) && !empty($endDate)) {
			$where['endDate'] = $endDate;
		}
		$data["unattended_leads"] = $this->DashboardModel->getUnattendedList($where);
		if (!empty($data)) {
			$status['data'] = $data;
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
	public function getpendingFollowupList()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$data['pendingFollowUps'] = $this->DashboardModel->getPendingFollowList();
		$data['current']['totalPending'] = count($data['pendingFollowUps']);
		if (!empty($data['pendingFollowUps'])) {
			$status['data'] = $data;
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
	public function getUpcomingFollowUp()
	{
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$data['upcomingFollowUps'] = $this->DashboardModel->getUpcomingFollowList();
		$data['current']['totalUpcoming'] = count($data['upcomingFollowUps']);
		if (!empty($data['upcomingFollowUps'])) {
			$status['data'] = $data;
			$status['msg'] = "success";
			$status['statusCode'] = 400;
			$status['flag'] = 'S';
			$this->response->output($status, 200);
		} else {
			$status['msg'] = "no data found";
			$status['statusCode'] = 227;
			$status['flag'] = 'F';
			$this->response->output($status, 200);
		}
	}
}
