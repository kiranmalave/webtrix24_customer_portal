<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ThemeOptionMaster extends CI_Controller {

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
		$this->load->library("ValidateData");


	}
	// public function getThemeOptionDetails()
	// {
	// 	$this->access->checkTokenKey();
	// 	$this->response->decodeRequest();
	// 	$textSearch = trim($this->input->post('textSearch'));
	// 	$isAll = $this->input->post('getAll');
	// 	$curPage = $this->input->post('curpage');
	// 	$textval = $this->input->post('textval');
	// 	$statuscode = $this->input->post('status');
	// 	$config = array();
	// 	if(!isset($orderBy) || empty($orderBy)){
	// 		$orderBy = "theme_option_id";
	// 		$order ="ASC";
	// 	}
	// 	$other = array();
		
	// 	$config = $this->config->item('pagination');
	// 	$wherec = $join = array();
	// 	if(isset($textSearch) && !empty($textSearch) && isset($textval) && !empty($textval)){
	// 	$wherec["$textSearch like  "] = "'".$textval."%'";
	// 	}

	// 	$config["base_url"] = base_url() . "themeOptionDetails";
	//     $config["total_rows"] = $this->CommonModel->getCountByParameter('theme_option_id','themeoption',$wherec);
	//     $config["uri_segment"] = 2;
	//     $this->pagination->initialize($config);
	//     if(isset($curPage) && !empty($curPage)){
	// 	$curPage = $curPage;
	// 	$page = $curPage * $config["per_page"];
	// 	}
	// 	else{
	// 		$curPage = 0;
	// 		$page = 0;
	// 	}
	// 	if($isAll=="Y"){
	// 		$themeOptionDetails = $this->CommonModel->GetMasterListDetails($selectC='','themeoption',$wherec,'','',$join,$other);	
	// 	}else{
	// 		$themeOptionDetails = $this->CommonModel->GetMasterListDetails($selectC='','themeoption',$wherec,$config["per_page"],$page,$join,$other);	
	// 	}
	// 	$status['data'] = $themeOptionDetails;
	// 	$status['paginginfo']["curPage"] = $curPage;
	// 	if($curPage <=1)
	// 	$status['paginginfo']["prevPage"] = 0;
	// 	else
	// 	$status['paginginfo']["prevPage"] = $curPage - 1 ;

	// 	$status['paginginfo']["pageLimit"] = $config["per_page"] ;
	// 	$status['paginginfo']["nextpage"] =  $curPage+1 ;
	// 	$status['paginginfo']["totalRecords"] =  $config["total_rows"];
	// 	$status['paginginfo']["start"] =  $page;
	// 	$status['paginginfo']["end"] =  $page+ $config["per_page"] ;
	// 	$status['loadstate'] = true;
	// 	if($config["total_rows"] <= $status['paginginfo']["end"])
	// 	{
	// 	$status['msg'] = $this->systemmsg->getErrorCode(232);
	// 	$status['statusCode'] = 400;
	// 	$status['flag'] = 'S';
	// 	$status['loadstate'] = false;
	// 	$this->response->output($status,200);
	// 	}
	// 	if($themeOptionDetails){
	// 	$status['msg'] = "sucess";
	// 	$status['statusCode'] = 400;
	// 	$status['flag'] = 'S';
	// 	$this->response->output($status,200);

	// 	}else{
	// 	$status['msg'] = $this->systemmsg->getErrorCode(227);
	// 	$status['statusCode'] = 227;
	// 	$status['flag'] = 'F';
	// 	$this->response->output($status,200);
	// 	}				
	// }
	public function themeOptionMaster($id='')
	{
		$this->response->decodeRequest();
		$method = $this->input->method(TRUE);
		if($method == "PUT" || $method == "POST"){

			$themeOptionDetails = array();
			$updateDate = date("Y/m/d H:i:s");
			$themeOptionDetails['theme_option_id'] = $this->validatedata->validate('theme_option_id','Theme Option Id',false,'',array());
			$themeOptionDetails['primary_color'] = $this->validatedata->validate('primary_color','Primary Color',false,'',array());
			$themeOptionDetails['secondary_color'] = $this->validatedata->validate('secondary_color','Secondary Color',false,'',array());
			$themeOptionDetails['user_signup'] = $this->validatedata->validate('user_signup','User Signup',false,'',array());
			$themeOptionDetails['instant_signup'] = $this->validatedata->validate('instant_signup','Instant Signup',false,'',array());
			$themeOptionDetails['page_title_h1'] = $this->validatedata->validate('page_title_h1','Page Title h1',false,'',array());
			$themeOptionDetails['custom_css'] = $this->validatedata->validate('custom_css','Custom css',false,'',array());	
			// $customJS = $this->input->post('custom_js');
			// if(isset($customJS) && !empty($customJS)){
			// 	$themeOptionDetails['custom_js'] = html_entity_decode($customJS);
			// }
			
			$themeOptionDetails['custom_js'] = $this->validatedata->validate('custom_js','Custom js',false,'',array());
			$themeOptionDetails['body_font'] = json_encode($this->input->post('body_font'));
			$themeOptionDetails['navigation_style_and_anchor'] = json_encode($this->input->post('navigation_style_and_anchor'));
			$themeOptionDetails['heading_h1_style'] = json_encode($this->input->post('heading_h1_style'));
			$themeOptionDetails['heading_h2_style'] = json_encode($this->input->post('heading_h2_style'));
			$themeOptionDetails['heading_h3_style'] = json_encode($this->input->post('heading_h3_style'));
			$themeOptionDetails['heading_h4_style'] = json_encode($this->input->post('heading_h4_style'));
			$themeOptionDetails['heading_h5_style'] = json_encode($this->input->post('heading_h5_style'));
			$themeOptionDetails['heading_h6_style'] = json_encode($this->input->post('heading_h6_style'));
			$themeOptionDetails['para_and_small_elm'] = json_encode($this->input->post('para_and_small_elm'));
			$themeOptionDetails['show_strip_header'] = $this->validatedata->validate('show_strip_header','Show Strip Header',false,'',array());
			$themeOptionDetails['office_address'] = $this->validatedata->validate('office_address','Office Address',false,'',array());
			$themeOptionDetails['office_timing'] = $this->validatedata->validate('office_timing','Office Timing',false,'',array());
			$themeOptionDetails['strip_header_background_color'] = $this->validatedata->validate('strip_header_background_color','Strip Header Background Color',false,'',array());
			$themeOptionDetails['strip_header_font_color'] = $this->validatedata->validate('strip_header_font_color','Strip Header Font Color',false,'',array());
			$themeOptionDetails['contact_no'] = $this->validatedata->validate('contact_no','Contact Number',false,'',array());
			$themeOptionDetails['email_id'] = $this->validatedata->validate('email_id','Email',false,'',array());
			$themeOptionDetails['header_layout'] = $this->validatedata->validate('header_layout','Header Layout',false,'',array());
			$themeOptionDetails['fixed_header'] = $this->validatedata->validate('fixed_header','Fixed Header',false,'',array());
			$themeOptionDetails['fixed_header_in_inner_pages'] = $this->validatedata->validate('fixed_header_in_inner_pages','Fixed Header in Inner Pages',false,'',array());
			$themeOptionDetails['header_background_color'] = $this->validatedata->validate('header_background_color','Header Background Color',false,'',array());
			$themeOptionDetails['header_background_color_inner_pages'] = $this->validatedata->validate('header_background_color_inner_pages','Header background Color Inner Pages',false,'',array());
			$themeOptionDetails['header_text_and_border_color'] = $this->validatedata->validate('header_text_and_border_color','Header Text and Border Color',false,'',array());
			$themeOptionDetails['header_text_layout'] = $this->validatedata->validate('header_text_layout','Header Text layout',false,'',array());
			$themeOptionDetails['header_search'] = $this->validatedata->validate('header_search','Header Search',false,'',array());
			$themeOptionDetails['header_page_logo'] = $this->validatedata->validate('header_page_logo','Header Page Logo',false,'',array());
			$themeOptionDetails['logo_for_inner_pages'] = $this->validatedata->validate('logo_for_inner_pages','Logo for Inner Pages',false,'',array());
			$themeOptionDetails['favicon'] = $this->validatedata->validate('favicon','Favicon',false,'',array());
			$themeOptionDetails['google_reCaptcha'] = $this->validatedata->validate('google_reCaptcha','Google reCaptcha',false,'',array());
			$themeOptionDetails['footer_layout'] = $this->validatedata->validate('footer_layout','Footer Layout',false,'',array());
			// $themeOptionDetails['select_footer_widget_layout'] = $this->validatedata->validate('select_footer_widget_layout','Select Footer Widget layout',false,'',array());
			$themeOptionDetails['footer_top_area_background_color'] = $this->validatedata->validate('footer_top_area_background_color','Footer top area background color',false,'',array());
			$themeOptionDetails['footer_bottom_area_background_color'] = $this->validatedata->validate('footer_bottom_area_background_color','Footer Bottom area background color',false,'',array());
			$themeOptionDetails['footer_top_text_color'] = $this->validatedata->validate('footer_top_text_color','Footer top text Color',false,'',array());
			$themeOptionDetails['footer_bottom_text_color'] = $this->validatedata->validate('footer_bottom_text_color','Footer Bottom text color',false,'',array());
			$themeOptionDetails['facebook_url'] = $this->validatedata->validate('facebook_url','Facebook URL',false,'',array());
			$themeOptionDetails['twitter_url'] = $this->validatedata->validate('twitter_url','Twitter URL',false,'',array());
			$themeOptionDetails['instagram_url'] = $this->validatedata->validate('instagram_url','Instagram URL',false,'',array());
			$themeOptionDetails['tumbler_url'] = $this->validatedata->validate('tumbler_url','Tumbler URl',false,'',array());
			$themeOptionDetails['youtube_url'] = $this->validatedata->validate('youtube_url','Youtube URL',false,'',array());
			$themeOptionDetails['linkdin_url'] = $this->validatedata->validate('linkdin_url','LinkedIn URL',false,'',array());
			$themeOptionDetails['pinterest_url'] = $this->validatedata->validate('pinterest_url','Pintrest URL',false,'',array());
			$themeOptionDetails['vk_url'] = $this->validatedata->validate('vk_url','VK URL',false,'',array());
			$themeOptionDetails['whatsapp'] = $this->validatedata->validate('whatsapp','Whatsapp',false,'',array());
			$themeOptionDetails['website'] = $this->validatedata->validate('website','website',false,'',array());
			$themeOptionDetails['termsConditions'] = $this->validatedata->validate('termsConditions','termsConditions',false,'',array());
			$themeOptionDetails['font_family'] = $this->validatedata->validate('font_family','font_family',false,'',array());
			$themeOptionDetails['social_header'] = $this->validatedata->validate('social_header','show social handlers in header',false,'',array());
			$themeOptionDetails['social_footer'] = $this->validatedata->validate('social_footer','show social handlers in footer',false,'',array());
			$themeOptionDetails['social_footer_strip'] = $this->validatedata->validate('social_footer_strip','show social handlers in footer strip',false,'',array());
			$themeOptionDetails['social_navbar'] = $this->validatedata->validate('social_navbar','show social handlers in navbar',false,'',array());
			$themeOptionDetails['google_secret_key'] = $this->validatedata->validate('google_secret_key','Google secret key',false,'',array());
			$themeOptionDetails['google_client_key'] = $this->validatedata->validate('google_client_key','Google client key',false,'',array());
			$themeOptionDetails['page_banner_image'] = $this->validatedata->validate('page_banner_image','Page Banner Image',false,'',array());
			$themeOptionDetails['page_banner_color'] = $this->validatedata->validate('page_banner_color','Page Banner Color',false,'',array());
			$themeOptionDetails['footer_layout_one'] = json_encode($this->input->post('footer_layout_one'));
			$themeOptionDetails['footer_layout_two'] = json_encode($this->input->post('footer_layout_two'));
			$themeOptionDetails['footer_layout_three'] = json_encode($this->input->post('footer_layout_three'));
			$themeOptionDetails['footer_layout_four'] = json_encode($this->input->post('footer_layout_four'));
			$themeOptionDetails['show_footer_home'] = $this->validatedata->validate('show_footer_home','Show Footer On Home',false,'',array());
			$themeOptionDetails['show_footer_inner_page'] = $this->validatedata->validate('show_footer_inner_page','Select Footer Inner Page',false,'',array());
			$themeOptionDetails['Swiggy'] = $this->validatedata->validate('Swiggy','Swiggy URL',false,'',array());
			$themeOptionDetails['Zomato'] = $this->validatedata->validate('Zomato','Zomato URL',false,'',array());
			$themeOptionDetails['show_recent_blogs'] = $this->validatedata->validate('show_recent_blogs','Show Recent Blogs On Website',false,'',array()); 
			$themeOptionDetails['blog_limit'] = $this->validatedata->validate('blog_limit','Blog Limit',false,'',array()); 
			$themeOptionDetails['footer_strip_text'] = $this->validatedata->validate('footer_strip_text','Footer Strip Text',false,'',array()); 
			$themeOptionDetails['show_footer_strip'] = $this->validatedata->validate('show_footer_strip','Show Footer Strip',false,'',array()); 
			$themeOptionDetails['show_header_strip_mobile'] = $this->validatedata->validate('show_header_strip_mobile','Set View Show Header Strip',false,'',array()); 
			$themeOptionDetails['menu_text_transform'] = $this->validatedata->validate('menu_text_transform','Menu Text Transform',false,'',array()); 
			$themeOptionDetails['logo_width'] = $this->validatedata->validate('logo_width','Set Logo Width',false,'',array()); 
			$themeOptionDetails['show_enquiry_form'] = $this->validatedata->validate('show_enquiry_form','Show enquiry form',false,'',array()); 

			$countryCodeNumber = $this->input->post('countryCode');
			if ($countryCodeNumber !== null && is_string($countryCodeNumber)) {
				$countryarray = explode(" ", $countryCodeNumber);
			} else {
				$countryarray = [];
			}
			$mobNumberArray = explode(" ", $themeOptionDetails['contact_no']);
			$myObj = array_merge($countryarray,$mobNumberArray);
			$myJSON = json_encode($myObj);
			$themeOptionDetails['contact_no'] = $myJSON;

		}
		switch ($method) {
			case "POST":
			{
				$updateDate = date("Y/m/d H:i:s");
				$where=array('theme_option_id'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				$iscreated = $this->CommonModel->updateMasterDetails('themeoption',$themeOptionDetails,$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(998);
					$status['statusCode'] = 998;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				break;
			}
			case "DELETE":
			{	
				$themeOptionDetails = array();

				$where=array('theme_option_id'=>$id);
				if(!isset($id) || empty($id)){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}

				$iscreated = $this->CommonModel->deleteMasterDetails('themeoption',$where);
				if(!$iscreated){
					$status['msg'] = $this->systemmsg->getErrorCode(996);
					$status['statusCode'] = 996;
					$status['data'] = array();
					$status['flag'] = 'F';
					$this->response->output($status,200);

				}else{
					$status['msg'] = $this->systemmsg->getSucessCode(400);
					$status['statusCode'] = 400;
					$status['data'] =array();
					$status['flag'] = 'S';
					$this->response->output($status,200);
				}
				break;
			}	
			default:
			{
				$where = array("theme_option_id"=>$id);
				$themeOptionHistory = $this->CommonModel->getMasterDetails('themeoption','',$where);
				if(isset($themeOptionHistory) && !empty($themeOptionHistory)){
					// $themeOptionHistory[0]->custom_js = html_entity_decode($themeOptionHistory[0]->custom_js);
					$themeOptionHistory[0]->body_font = json_decode($themeOptionHistory[0]->body_font);
					$themeOptionHistory[0]->navigation_style_and_anchor = json_decode($themeOptionHistory[0]->navigation_style_and_anchor);
					$themeOptionHistory[0]->heading_h1_style = json_decode($themeOptionHistory[0]->heading_h1_style);
					$themeOptionHistory[0]->heading_h2_style = json_decode($themeOptionHistory[0]->heading_h2_style);
					$themeOptionHistory[0]->heading_h3_style = json_decode($themeOptionHistory[0]->heading_h3_style);
					$themeOptionHistory[0]->heading_h4_style = json_decode($themeOptionHistory[0]->heading_h4_style);
					$themeOptionHistory[0]->heading_h5_style = json_decode($themeOptionHistory[0]->heading_h5_style);
					$themeOptionHistory[0]->heading_h6_style = json_decode($themeOptionHistory[0]->heading_h6_style);
					$themeOptionHistory[0]->para_and_small_elm = json_decode($themeOptionHistory[0]->para_and_small_elm);

					$themeOptionHistory[0]->footer_layout_one = json_decode($themeOptionHistory[0]->footer_layout_one);
					$themeOptionHistory[0]->footer_layout_two = json_decode($themeOptionHistory[0]->footer_layout_two);
					$themeOptionHistory[0]->footer_layout_three = json_decode($themeOptionHistory[0]->footer_layout_three);
					$themeOptionHistory[0]->footer_layout_four = json_decode($themeOptionHistory[0]->footer_layout_four);
					// print($themeOptionHistory[0]->contact_no);exit;
					if(isset($themeOptionHistory[0]->contact_no) && !empty($themeOptionHistory[0]->contact_no)) {
						// $mobileNumberObject = $themeOptionHistory[0]->contact_no;
						$mobileNumberString = $themeOptionHistory[0]->contact_no;
	
						// Decoding the JSON-like string to get the actual array
						$mobileNumberArray = json_decode($mobileNumberString);
						// print_r($mobileNumberArray);exit;
						// Extracting country code and number from the array
						if (is_array($mobileNumberArray)) {
							if (count($mobileNumberArray) == 1) {
								$number = $mobileNumberArray[0];
								$themeOptionHistory[0]->contact_no = $number;
							} elseif (count($mobileNumberArray) >= 2) {
								$countryCode = $mobileNumberArray[0];
								$number = $mobileNumberArray[1];
								$themeOptionHistory[0]->contact_no = $number;
								$themeOptionHistory[0]->countryCode = $countryCode;
							}
						}
					}

					$status['data'] = $themeOptionHistory;
					$status['statusCode'] = 200;
					$status['flag'] = 'S';
					$this->response->output($status,200);
					}else{

					$status['msg'] = $this->systemmsg->getErrorCode(227);
					$status['statusCode'] = 227;
					$status['data'] =array();
					$status['flag'] = 'F';
					$this->response->output($status,200);
				}
				break;
			}
		}
	}	
}
?>