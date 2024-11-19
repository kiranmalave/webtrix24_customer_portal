<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class IncomeDashboard extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		$this->load->helper('form');
		$this->load->model('CommonModel');
		$this->load->model('DashboardModel');
	}
	public function index(){
		$this->load->view('welcome_message');
	}
	// INCOME
	public function income(){
		$this->access->checkTokenKey();
		$this->response->decodeRequest();
		$period_type = $this->input->post('period_type');
		$interval = $this->input->post('interval');
		$data = $lables = $amounts =[];
		$now = new DateTime();
		switch ($period_type) {
			case 'day':
				$lastDay = clone $now;
				$lastDay->modify('-6 days');
				for ($i=1; $i <= 7; $i++) { 
					$lables[] = $lastDay->format('d M');
					$incomeDate = $lastDay->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
					$det = $this->DashboardModel->incomeLastWeek($incomeDate);
					$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0 ;
					$lastDay->modify('+1 day');
				}
				$data['current']['lables'] = $lables;
				$data['current']['amounts'] = $amounts;
				$data['current']['title'] = 'Last 7 Days';
				break;
			case 'current_week':
				$l_monday = clone $now;
				$l_monday = $l_monday->modify('monday');
				$data['current'] = $this->getWeeksData($l_monday,$interval);
				$data['current']['title'] = 'Current week';
				$p_l_monday = clone $now;
				$p_l_monday = $p_l_monday->modify('last monday'); 
				$data['last'] = $this->getWeeksData($p_l_monday);
				$data['last']['title'] = 'Last week';
				break;
			case 'current_month':
				// CURRENT MONTH
				$current_month = clone $now;
				$current_month->modify('first day of this month');
				$current_month_end = clone $now;
				$current_month_end->modify('last day of this month');
				$data['current'] = $this->getDataWeekWise($current_month,$current_month_end);
				$data['current']['title'] = 'Current month';
				// LAST MONTH
				$last_month = clone $now;
				$last_month->modify('first day of last month');
				$last_month_end = clone $now;
				$last_month_end->modify('last day of last month');
				
				$data['last'] = $this->getDataWeekWise($last_month,$last_month_end);
				$data['last']['title'] = 'Last month';

				break;
			case 'current_quarter':
				$currentMonth = clone $now;
				$iteration = 4;

				$currentMonth = $currentMonth->modify('-'.$iteration.' months');
				for ($i=0; $i < $iteration ; $i++) { 
					$firstDate = $currentMonth->modify('first day of this month');
					$lastDate = $currentMonth->modify('last day of this month');
					$lables[] = $firstDate->format('M');
					$startDate = $firstDate->format('Y-m-d');
					$endDate = $lastDate->format('Y-m-d');
					$det = $this->DashboardModel->incomeByMonths($startDate, $endDate);
					$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0 ;
					$currentMonth = $lastDate;
					$currentMonth->modify('+1 day');	
				}

				$data['current']['amounts'] = $amounts; 
				$data['current']['lables'] = $lables; 
				$data['current']['title'] = 'Current Quarter';
				break;
			case 'current_fin_year':
				$currentMonth = clone $now;
				$iteration = 12;
				$currentMonth->modify('first day of January this year');
				for ($i=0; $i < $iteration ; $i++) { 
					$firstDate = $currentMonth->modify('first day of this month');
					$lastDate = $currentMonth->modify('last day of this month');
					$lables[] = $firstDate->format('M');
					$startDate = $firstDate->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
					$endDate = $lastDate->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
					$det = $this->DashboardModel->incomeByMonths($startDate, $endDate);
					$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0 ;
					$currentMonth = $lastDate;
					$currentMonth->modify('+1 day');	
				}

				$data['current']['amounts'] = $amounts; 
				$data['current']['lables'] = $lables; 
				$data['current']['title'] = 'Current Financial Year';
				break;
			default:
				break;
		}
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
	public function getDataWeekWise($week_start,$current_month_end){
		$weeksData = $weeksLabels =[];
		$week_c = 1 ;
		while ($week_start <= $current_month_end) {
			$week_end = clone $week_start;
			$week_end->modify('next sunday');
			$startDate = $week_start->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
			$endDate = $week_end->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
			$det = $this->DashboardModel->incomeByMonths($startDate, $endDate);
			$weeksData[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0 ;
			$weeksLabels[]  = 'Week '.$week_c;
			$week_start->modify('next monday');
			$week_c++;
		}
		return ['amounts' => $weeksData , 'lables'=>$weeksLabels , 'week_count'=>$week_c]; 
	}
	public function getWeeksData($startDate,$interval=''){
		$amounts = $lables = $bgColors = $borderColors = [];
		$interval = ($interval == '') ? 14 : 7 ;
		for ($i=1; $i <= $interval; $i++) { 
			$lables[] = $startDate->format('D');
			$incomeDate = $startDate->format('Y-m-d');//date("Y-m-d",strtotime($l_monday));
			$det = $this->DashboardModel->incomeLastWeek($incomeDate);
			$amounts[] = (isset($det[0]->amount) && !empty($det[0]->amount)) ? $det[0]->amount : 0 ;
			$startDate->modify('+1 day');	
			// COLORS FOR PIE AND DOUGHNUT
			$color = $this->generateRandomColor($i - 1);
			$bgColors[] = $color['bgColor'];
			$borderColors[] = $color['borderColor'];
		}
		
		return [ 'lables' =>$lables, 'amounts' =>$amounts, 'bgColors'=>$bgColors, 'borderColors'=> $borderColors];
	}
	public function generateRandomColor($i) {
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
		}else{
			return ['', ''];
		}
	}
}
