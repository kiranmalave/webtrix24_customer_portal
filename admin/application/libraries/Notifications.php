<?php
defined('BASEPATH') OR exit('No direct script access allowed');
// require_once APPPATH . '../vendor/autoload.php';
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\Notification;
//use Kreait\Firebase\ServiceAccount;
use Kreait\Firebase\Messaging\CloudMessage;
#[\AllowDynamicProperties]
	class Notifications
	{
		var $firebase;
        var $tosend;
		public function __construct() {
            $this->CI = &get_instance();
            $this->CI->load->model('CommonModel');
            try{
                if (class_exists('Kreait\Firebase\Factory')) {
                    $this->firebase = (new Factory)->withServiceAccount($_SERVER['DOCUMENT_ROOT'].'/google_key/webtrix-report-firebase-adminsdk-a3qcw-c4d1f742dd.json');
                }
            } catch (NotFound $e) {
                // Handle NotFound error (e.g., token is invalid or unregistered)
                //echo 'Error: Device token not found or invalid';
            } catch (MessagingException $e) {
                // Handle other Firebase messaging errors
                //echo 'Messaging Error: ' . $e->getMessage();
            } catch (\Exception $e) {
                // Handle any other errors
                //echo 'General Error: ' . $e->getMessage();
            }
        
		}
        public function sendmessage($data,$tosend){
            $this->tosend = $tosend;

            try {
                
            $token = $this->getRegisterUserToken();
            $notification = Notification::fromArray([
                    'title' => $data['title'],
                    'body' => $data['body'],
                    'image' => "",
                ]);
                $messaging = $this->firebase->createMessaging();
                //print $token;
                if($token != null){
                $notification = Notification::create($data['title'], $data['body']);
                $message = CloudMessage::withTarget('token',$token)->withNotification($notification);

                // $message = CloudMessage::withTarget(/* see sections below */)
                //     ->withNotification(Notification::create('Title', 'Body'))
                //     ->withData(['key' => 'value']);

                $messaging->send($message);
                }
            } catch (NotFound $e) {
                // Handle NotFound error (e.g., token is invalid or unregistered)
                //echo 'Error: Device token not found or invalid';
            } catch (MessagingException $e) {
                // Handle other Firebase messaging errors
                //echo 'Messaging Error: ' . $e->getMessage();
            } catch (\Exception $e) {
                // Handle any other errors
                //echo 'General Error: ' . $e->getMessage();
            }
            

        }
        private function getRegisterUserToken(){
            $where = array("adminID" => $this->tosend);
			$tDetails = $this->CI->CommonModel->getMasterDetails('admin', 'gfcmToken', $where);
            if(isset($tDetails)&& !empty($tDetails)){
                return $tDetails[0]->gfcmToken;
            }else{
                return null;
            }
        }
		
	}