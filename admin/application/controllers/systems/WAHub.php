<?php
defined('BASEPATH') or exit('No direct script access allowed');

class WAHub extends CI_Controller
{
	function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model('CommonModel');
		$this->load->library("response");
		$this->load->library("ValidateData");
        if(!$this->config->item('development')){
            $this->load->library("WhatsAppApi");	
        }
    }

	/**
	 * 1️⃣ Store or Update Business Account details
	 * Called by subdomain after connecting WhatsApp
	 * POST params: company_id, subdomain, business_id, waba_id, access_token, token_expiry, business_name
	 */
	public function storeBusinessAccount()
	{
		$input = json_decode(file_get_contents('php://input'), true);
		if (empty($input)) $input = $this->input->post();
        //$subdomain = $this->getSubdomain(); // detect which tenant sent it
        $subdomain = $this->detectSubdomain();
        if (!isset($subdomain) || empty($subdomain)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant No subdomain Found. {$subdomain}",
                ], 400);
        }
        log_message('info', "Request received from subdomain: {$subdomain}");
        // find out the tenent details first
        $tenant = $this->CommonModel->getMasterDetails('customer', '*',array('sub_domain_name'=>$subdomain));
        if (!isset($tenant) || empty($tenant)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant: {$subdomain}",
                ], 400);
        }
		if (empty($input['company_id']) || empty($input['waba_id'])) {
			return $this->response->output([
				'flag' => 'F',
				'msg' => 'Missing required fields',
			], 400);
		}

		$where = [
            'tenant_id' => $tenant[0]->customer_id,
			'company_id' => $input['company_id'],
			'waba_id'    => $input['waba_id']
		];

		$data = [
            'tenant_id' => $tenant[0]->customer_id,
			'company_id'    => $input['company_id'],
			'business_id'   => $input['business_id'] ?? null,
			'waba_id'       => $input['waba_id'],
			'business_name' => $input['business_name'] ?? null,
			'modified_date' => date('Y-m-d H:i:s')
		];
		$exists = $this->CommonModel->getMasterDetails('wa_business_accounts', '*', $where);
		if (!empty($exists)) {
			$res = $this->CommonModel->updateMasterDetails('wa_business_accounts', $data, $where);
            if(!$res){
                echo json_encode(['flag' => 'F','msg'  => "DB Error"]);
            }
			$msg = 'Business account updated successfully.';
		} else {
			$data['created_date'] = date('Y-m-d H:i:s');
			$res = $this->CommonModel->saveMasterDetails('wa_business_accounts', $data);
            if(!$res){
                echo json_encode(['flag' => 'F','msg'  => "DB Error"]);
            }
			$msg = 'Business account added successfully.';
		}
		echo json_encode(['flag' => 'S','msg'  => $msg]);
	}


	/**
	 * 2️⃣ Store WhatsApp Numbers linked to the Business Account
	 * POST params: company_id, subdomain, waba_id, numbers: []
	 * numbers[] = {
	 *   phone_number_id, display_phone_number, verified_name, quality_rating, is_default
	 * }
	 */
	public function storeBusinessNumbers()
	{
        
		$input = json_decode(file_get_contents('php://input'), true);
		if (empty($input)) $input = $this->input->post();
        if (empty($input['company_id']) || empty($input['waba_id']) || empty($input['numbers'])) {
			 echo json_encode(['flag' => 'F','msg' => 'Missing required fields or number list.']);
			 exit;
		}
		$subdomain = $this->detectSubdomain();
		$tenant = $this->CommonModel->getMasterDetails('customer', '*',array('sub_domain_name'=>$subdomain));
        if (!isset($tenant) || empty($tenant)) {
            return $this->response->output([
                    'flag' => 'F',
                    'msg' => "Unauthorized or unknown tenant: {$subdomain}",
                ], 400);
        }
		foreach ($input['numbers'] as $num) {
			if (empty($num['id'])) continue;

			$where = [
				'tenant_id'=>$tenant[0]->customer_id,
				'phone_number_id' => $num['id'],
				'waba_id' => $input['waba_id']
			];

			$data = [
				'company_id' => $input['company_id'],
                'tenant_id'=>$tenant[0]->customer_id,
				'waba_id'    => $input['waba_id'],
				'phone_number_id' => $num['id'],
				'display_phone_number' => $num['display_phone_number'] ?? null,
				'verified_name' => $num['verified_name'] ?? null,
				'quality_rating' => $num['quality_rating'] ?? null,
				'is_default' => $num['is_default'] ?? 'n',
				'status' => $num['status'] ?? 'active',
				'modified_date' => date('Y-m-d H:i:s')
			];

			$exists = $this->CommonModel->getMasterDetails('wa_phone_numbers', '*', $where);
			if (!empty($exists)) {
				$this->CommonModel->updateMasterDetails('wa_phone_numbers', $data, $where);
			} else {
				$data['created_date'] = date('Y-m-d H:i:s');
				$this->CommonModel->saveMasterDetails('wa_phone_numbers', $data);
			}
		}

		echo json_encode([
			'flag' => 'S',
			'msg'  => 'Business numbers stored/updated successfully.',
		]);
	}
    private function detectSubdomain()
	{
	    // Always check header first
	    $headerSub = $this->input->get_request_header('X-WEBTRIX-SUBDOMAIN', true);
	    if (!empty($headerSub)) return strtolower($headerSub);

	    // Fallback to domain
	    $host = $_SERVER['HTTP_HOST'] ?? '';
	    $parts = explode('.', strtolower($host));

	    return (count($parts) >= 3) ? $parts[0] : null;
	}
}
