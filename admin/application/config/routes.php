<?php
defined('BASEPATH') or exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES 
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
require_once(APPPATH . 'config/routes_custom.php');
$route['default_controller'] = 'welcome';

$route['login'] = 'Login/verifyUser';
$route['salt'] = 'Login/getsalt';
$route['logout'] = 'Login/logout';
$route['forgotPassword'] = 'Login/resetPassword';
$route['verifyUser'] = 'SearchAdmin/verifyUser';

$route['mSalt'] = 'Login/getsaltMobile';
$route['mLogin'] = 'Login/verifyUserMobile';

$route['dashboardDetails'] = 'Dashboard/getDashboardCount';
$route['alerts'] = 'Dashboard/alerts';

$route['tranDetails'] = 'SearchTransformer/index';
$route['tranDetailsSingle/(:num)'] = 'SearchTransformer/GetTransformerDetails/$1';
$route['changeProfilePic/(:num)'] = 'SearchAdmin/setprofilePic/$1';
$route['delProfilePic/(:num)'] = "SearchAdmin/removeProfilePicFile/$1";
$route['saveOnedriveToken'] = 'systems/OneDrive/onedriveSync';

######StudentDemo(prathamesh)
$route['studentDemoMasterList'] = 'StudentDemo/getstudentDemoDetails';
$route['studentDemoMaster'] = 'StudentDemo/studentDemoMaster';
$route['studentDemoMaster/(:num)'] = 'StudentDemo/studentDemoMaster/$1';
$route['studentDemoMaster/status'] = 'StudentDemo/studentDemoChangeStatus';

############### System API ##############

$route['getDefinations'] = 'systems/Application/getDefinations';

$route['getTables'] = 'systems/Application/getTables';
$route['imagethumCorection'] = 'systems/UpdateImage/imageThumbnailUpdate';
$route['menuMasterList'] = 'MenuMaster/getMenuDetails';
$route['menuMaster'] = 'MenuMaster/menuMaster';
$route['menuMaster/(:num)'] = 'MenuMaster/menuMaster/$1';
$route['menuMaster/status'] = 'MenuMaster/menuChangeStatus';
$route['getMenuList'] = 'MenuMaster/getMenuList';
$route['accessMenuList/(:num)'] = 'MenuMaster/accessMenuList/$1';
$route['getUserPermission'] = 'MenuMaster/getUserPermission';
$route['userAccess'] = 'MenuMaster/userAccess';
$route['accessCompanyList/(:num)'] = 'MenuMaster/accessCompanyList/$1';
$route['systemMenuUpdatePositions'] = 'MenuMaster/updatePositions';
$route['metadata'] = 'MenuMaster/saveMetaData';
$route['themeOptionMasterList'] = 'ThemeOptionMaster/getThemeOptionDetails';
$route['themeOptionMaster'] = 'ThemeOptionMaster/themeOptionMaster';
$route['themeOptionMaster/(:num)'] = 'ThemeOptionMaster/themeOptionMaster/$1';
$route['searchList'] = 'systems/Application/getFreeTextSearch';

//google calender sync API
$route['responseToken'] = 'systems/Google/getGoogleAccessResponse';
// $route['responseToken'] = 'systems/Google/getGoogleAccess';
$route['watchCalender'] = 'systems/Google/watchCalenderEvent';
$route['googleSync'] = 'systems/Google/googleSync';
// $route['themeOptionMaster/status'] = 'ThemeOptionMaster/themeOptionChangeStatus';

// sendEmails
$route['emailSend'] = 'systems/EmailSender/sendEmail';
$route['uploadAttachment'] = 'systems/EmailSender/uploadAttachment';
$route['removeEmailAttachments/(:any)'] = 'systems/EmailSender/removeAttachment/$1';
// -----------------------------------------

$route['admins'] = 'SearchAdmin/index';
$route['admins/status'] = 'SearchAdmin/changeStatus';
$route['addadmin/(:num)'] = 'SearchAdmin/getAdminDetails/$1';
$route['changePassword/(:num)'] = 'SearchAdmin/confirm_password/$1';
$route['addadmin'] = 'SearchAdmin/getAdminDetails';
$route['adduser'] = 'SearchAdmin/adduser';
$route['resetPasswordRequest'] = 'SearchAdmin/resetPasswordRequest';
$route['validateOtp/(:num)'] = 'SearchAdmin/validateOtp/$1';
$route['updatePassword/(:num)'] = 'SearchAdmin/updatePassword/$1';
$route['getSystemUsers'] = 'SearchAdmin/getSystemUserList';
$route['getSystemUserNameList'] = 'SearchAdmin/getSystemUserNameList';
$route['setModuleDefaultView'] = 'SearchAdmin/setModuleDefaultView';
$route['deleteUserForever'] = 'SearchAdmin/deleteForever';

///added by sanjay to update firebase token
$route['uToken'] = 'SearchAdmin/updateToken';

$route['userRoleMasterList'] = 'Masters/getUserRoleDetails';
$route['userRoleMaster'] = 'Masters/userRoleMaster';
$route['userRoleMaster/(:num)'] = 'Masters/userRoleMaster/$1';
$route['userRoleMaster/status'] = 'Masters/userRoleChangeStatus';

// $route['customerList'] = 'Customer/customerList';
// $route['customer/(:num)'] = 'Customer/customer/$1';

$route['dynamicFormFieldList'] = 'systems/DynamicFormField/formFieldList';
$route['dynamicformfield'] = 'systems/DynamicFormField/dynamicformfield';
$route['dynamicformfield/(:num)'] = 'systems/DynamicFormField/dynamicformfield/$1';
$route['dynamicformfield/status'] = 'systems/DynamicFormField/changeStatus';
$route['dynamicFormDataList'] = 'systems/DynamicFormField/getFormData';
$route['linkedFormData'] = 'systems/DynamicFormField/getLinkedFormData';
$route['c_metadata'] = 'systems/DynamicFormField/updateColumnMetaDate';
$route['m_metadata'] = 'systems/DynamicFormField/updateMobileColumnMetaData';

$route['saveDyData'] = 'systems/DynamicFormData/dynamicformData';
$route['saveDyData/(:num)'] = 'systems/DynamicFormData/dynamicformData/$1';
$route['getDyData'] = 'systems/DynamicFormData/getDatadList';
$route['deleteFields/status'] = 'systems/DynamicFormData/changeStatus';


$route['infoSettingsList'] = 'InfoSetting/index';
$route['infoSettingsList/(:num)'] = 'InfoSetting/index/$1';

$route['emailMasterList'] = 'EmailMaster/getEmailDetailsList';
$route['emailMaster'] = 'EmailMaster/emailMasterData';
$route['emailMaster/(:num)'] = 'EmailMaster/emailMasterData/$1';
$route['emailMaster/status'] = 'EmailMaster/emailMasterDataChangeStatus';
$route['emailMaster/multipleHardDelete'] = 'EmailMaster/multipleHardDelete';
$route['emailMaster/multipleemailChangeStatus'] = 'EmailMaster/multipleemailChangeStatus';

$route['autoMailMasterList'] = 'AutoMailService/getEmailDetailsList';
$route['autoMailMaster'] = 'AutoMailService/autoMailMaster';
$route['autoMailMaster/(:num)'] = 'AutoMailService/autoMailMaster/$1';
$route['autoMailMaster/status'] = 'AutoMailService/autoMailMasterChangeStatus';
$route['autoMailAttachment/(:num)'] = 'AutoMailService/autoMailAttachment/$1';
$route['addAutoMailAttchments/(:num)/(:num)'] = 'AutoMailService/addAutoMailAttchments/$1/$2';
$route['sameDayNotification'] = 'Notifications/sameDayNotification';
$route['sendNotification'] = 'Notifications/sendNotification';
$route['sendEmail'] = 'SendEmail/sendEmail';
$route['autoMailService/document/(:num)'] = 'AutoMailService/documentChangeStatus/$1';
//////////////////////read server files from server
$route['readSeverFiles'] = 'ReadFoldersAndFiles/readFoldersAndFiles';
$route['adminMediaCollection'] = 'ReadFoldersAndFiles/adminMFiles';
$route['addFilesInFolder'] = 'ReadFoldersAndFiles/addFilesInFolder';
// $route['mediaUpload/(:any)/(:num)'] = 'ReadFoldersAndFiles/mediaUpload/$1/$2';
$route['otherUpload/(:any)/(:num)'] = 'ReadFoldersAndFiles/otherMediaUpload/$1/$2';

$route['mediaUpload/(:any)'] = 'ReadFoldersAndFiles/mediaUpload/$1';
$route['mediaUpload'] = 'ReadFoldersAndFiles/mediaUpload';
$route['receiptUpload'] = 'ReadFoldersAndFiles/receiptUpload';
$route['addDIR'] = 'ReadFoldersAndFiles/addDIR';
$route['deleteFolder'] = 'ReadFoldersAndFiles/deleteFolder';
$route['deleteFile'] = 'ReadFoldersAndFiles/deleteFile';


######prefix
$route['PrefixMasterList'] = 'PrefixMaster/getprefixDetails';
$route['PrefixMaster'] = 'PrefixMaster/prefixMaster';
$route['PrefixMaster/(:num)'] = 'PrefixMaster/prefixMaster/$1';
$route['PrefixMaster/status'] = 'PrefixMaster/PrefixChangeStatus';

######category
$route['categoryMasterList'] = 'categoryMaster/getcategoryDetails';
$route['categorySlugList'] = 'categoryMaster/getslugList';
$route['categoryMaster'] = 'categoryMaster/categoryMaster';
$route['categoryMaster/(:num)'] = 'categoryMaster/categoryMaster/$1';
$route['categoryMaster/status'] = 'categoryMaster/CategoryChangeStatus';
$route['categoryIndexUpdate'] = 'categoryMaster/changePosition';
$route['categoryMaster/multipleHardDelete'] = 'categoryMaster/multipleHardDelete';
$route['categoryMaster/multiplecategoryChangeStatus'] = 'categoryMaster/multiplecategoryChangeStatus';

######contactUs
$route['contactUsList'] = 'ContactUs/getcontactUsDetails';
$route['contactUs'] = 'ContactUs/ContactUs';
$route['contactUs/(:num)'] = 'ContactUs/ContactUs/$1';
$route['contactUs/status'] = 'ContactUs/ContactUsChangeStatus';
$route['contactUs/multipleHardDelete'] = 'ContactUs/multipleHardDelete';
$route['contactUs/multiplecontactusChangeStatus'] = 'ContactUs/multiplecontactusChangeStatus';

######customer
$route['customerMasterList'] = 'customerMaster/getcustomerDetails';
$route['customerMasterList/Notes'] = 'customerMaster/getcustomerNotesDetails';
$route['customerMaster'] = 'customerMaster/customerMaster';
$route['customerMaster/(:num)'] = 'customerMaster/customerMaster/$1';
$route['customerMaster/status'] = 'customerMaster/customerChangeStatus';
$route['customerMaster/delete'] = 'customerMaster/customerPermanentDelete';
$route['customerMaster/Note'] = 'customerMaster/customerNote';
$route['customerMaster/Note/(:num)'] = 'customerMaster/customerNote/$1';
$route['customerNote/delete'] = 'customerMaster/noteDelete';
$route['customerMaster/typeStatus'] = 'customerMaster/customerChangeType';
$route['customerMasterList/Activity'] = 'customerMaster/getcustomerActivityDetails';
$route['customerModule/removeAttachment'] = 'customerMaster/removeAttachment';
$route['getCustomerEmailList'] = 'customerMaster/getCustomerEmailList';
$route['getCountryList'] = 'systems/Application/getCountryList';
$route['getStateList'] = 'systems/Application/getStateList';
$route['getCityList'] = 'systems/Application/getCityList';
$route['customerMaster/leadUpdate'] = 'customerMaster/leadUpdate';
$route['leadColumnUpdatePositions'] = 'customerMaster/updatePositions';
$route['custUpload'] = 'customerMaster/custUpload';
$route['custUpload/(:num)'] = 'customerMaster/custUpload/$1';
$route['changeClientPic/(:num)'] = 'customerMaster/setclientPic/$1';
$route['delClientPic/(:num)'] = "customerMaster/removeClientPicFile/$1";
$route['copy'] = "systems/Application/copy";
$route['customerMaster/delete'] = 'customerMaster/multiplecustChangeStatus';

// $route['customerMaster/Activity'] = 'customerMaster/customerActivity';
// $route['customerMaster/Activity/(:num)'] = 'customerMaster/customerActivity/$1';

// LoginTemplate Route
$route['templateMasterList'] = 'LoginTemplate/getTemplateDetails';
$route['loginTemplate'] = 'LoginTemplate/slideMaster';
$route['loginTemplate/(:num)'] = 'LoginTemplate/slideMaster/$1';
$route['slideMaster/status'] = 'LoginTemplate/slideChangeStatus';
$route['slideMaster/multipleHardDelete'] = 'LoginTemplate/multipleHardDelete';
$route['slideMaster/multiplelogintemplateChangeStatus'] = 'LoginTemplate/multiplelogintemplateChangeStatus';

///LoginTemplate Route END
// LoginTemplate Route
$route['errorLogMasterList'] = 'ErrorLog/getErrorLogDetailList';
$route['errorLogMaster/(:num)'] = 'ErrorLog/getErrorLogDetails/$1';
$route['errorLogMaster/status'] = 'ErrorLog/ErrorLogChangeStatus';
///LoginTemplate Route END

$route['translate_uri_dashes'] = FALSE;
$route['404_override'] = '';


//BulkEdit
$route['editdata'] = 'systems/Application/getbulkeditdata';

// WHATS APP 
$route['sendWhatsAppMsg'] = 'systems/WASender/sendWhatsAppMsg';
$route['receiveWhatsAppMsg'] = 'systems/WASender/receiveWhatsAppMsg';
$route['waAllMsg'] = 'systems/WASender/getAllMsg';
$route['updateMsgStatus'] = 'systems/WASender/updateMsgStatus';


$route['registeruser'] = 'systems/RegisterUser/register';
$route['verifyDetails'] = 'systems/RegisterUser/verifyDetails';
$route['companySetup'] = 'systems/RegisterUser/companySetup';
$route['checkVerifyDetails'] = 'systems/RegisterUser/checkVerifyDetails';
$route['resendVerifyDetails'] = 'systems/RegisterUser/resendVerifyDetails';
$route['companyLogo/(:any)'] = 'systems/RegisterUser/companyLogo/$1';
$route['checkAccount'] = 'systems/RegisterUser/checkAccount';

$route['checklocal'] = 'systems/RegisterUser/checklocal';
