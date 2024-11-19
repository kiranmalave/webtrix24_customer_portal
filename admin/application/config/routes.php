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

///// page Route
$route['pagesMasterList'] = 'Pages/getPagesDetailsList';
$route['pagesMaster'] = 'Pages/pageMaster';
$route['pagesMaster/(:num)'] = 'Pages/pageMaster/$1';
$route['pagesMaster/status'] = 'Pages/pageChangeStatus';
$route['pagesMaster/copy'] = 'Pages/copyPage';
$route['pagesMaster/hardDelete'] = 'Pages/hardDelete';
///page Routes

$route['blogsMasterList'] = 'Blogs/getBlogDetailsList';
$route['blogsMaster'] = 'Blogs/blogMaster/';
$route['blogsMaster/(:num)'] = 'Blogs/blogMaster/$1';
$route['blogsMaster/status'] = 'Blogs/blogChangeStatus';


// $route['donorReceiptDeclined'] = 'DonorMaster/donorReceiptDeclined';
$route['donorReceiptDeclined/(:num)'] = 'DonorMaster/donorReceiptDeclined/$1';
$route['unlinkPanImage'] = 'DonorMaster/unlinkPanImage';

//reports generation
$route['donorReportDetails'] = 'ExcelExport/donorReportDetails';
$route['celebrateWithUsReport'] = 'ExcelExport/celebrateWithUsReport';
$route['reportDataPreview'] = 'ExcelExport/reportDataPreview';
$route['reports'] = 'ExcelExport/reports';
$route['customerReports'] = 'ExcelExport/customerReports';
$route['taskReports'] = 'ExcelExport/taskReports';
$route['campaignReports'] = 'ExcelExport/campaignReports';
$route['careerReports'] = 'ExcelExport/careerReports';
$route['emailReports'] = 'ExcelExport/emailReports';
$route['serviceReports'] = 'ExcelExport/serviceReports';
$route['ourTeamReports'] = 'ExcelExport/ourTeamReports';
$route['ourClientsReports'] = 'ExcelExport/ourClientsReports';
$route['testimonialsReports'] = 'ExcelExport/testimonialsReports';
$route['faqReports'] = 'ExcelExport/faqReports';
$route['eventsReports'] = 'ExcelExport/eventsReports';
$route['expensesReports'] = 'ExcelExport/expensesReports';
$route['receiptReports'] = 'ExcelExport/receiptReports';
$route['courseReports'] = 'ExcelExport/courseReports';
$route['adminReports'] = 'ExcelExport/adminReports';
$route['companyReports'] = 'ExcelExport/companyReports';
$route['userRoleReports'] = 'ExcelExport/userRoleReports';
$route['categoryReports'] = 'ExcelExport/categoryReports';
$route['templateReports'] = 'ExcelExport/templateReports';
$route['sliderReports'] = 'ExcelExport/sliderReports';
$route['pagesReports'] = 'ExcelExport/pagesReports';
$route['pushServiceReports'] = 'ExcelExport/pushServiceReports';
$route['accountingReports'] = 'ExcelExport/accountingReports';

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


######Oppportunity
$route['opportunityMasterList'] = 'opportunityMaster/getopportunityDetails';
$route['opportunityMaster'] = 'opportunityMaster/opportunityMaster';
$route['opportunityMaster/(:num)'] = 'opportunityMaster/opportunityMaster/$1';
$route['opportunityMaster/status'] = 'opportunityMaster/customerChangeStatus';
$route['opportunityMaster/delete'] = 'opportunityMaster/customerPermanentDelete';
$route['opportunityUpload'] = 'opportunityMaster/opportunityUpload';
$route['opportunityUpload/(:num)'] = 'opportunityMaster/opportunityUpload/$1';
$route['opportunityMaster/multipleHardDelete'] = 'opportunityMaster/multipleHardDelete';
$route['opportunityMaster/multipleopportunityChangeStatus'] = 'opportunityMaster/multipleopportunityChangeStatus';


###### notification
$route['notificationMasterList'] = 'systems/NotificationMaster/getNotificationList';
$route['notificationMaster'] = 'systems/NotificationMaster/notificationMaster';
$route['notificationMaster/(:num)'] = 'systems/NotificationMaster/notificationMaster/$1';
$route['notificationMaster/status'] = 'systems/notificationMaster/notificationChangeStatus';
$route['notificationattachment'] = 'systems/NotificationMaster/attachmentUpload';
$route['notificationattachment/(:num)'] = 'systems/NotificationMaster/attachmentUpload/$1';
$route['notificationMaster/removeAttach'] = 'systems/NotificationMaster/removeAttachment';

// DASHBOARD
$route['dashboardList'] = 'Dashboard/getDashboardList';
$route['dashboard'] = 'Dashboard/dashboardMaster';
$route['dashboard/(:num)'] = 'Dashboard/dashboardMaster/$1';
$route['dashboard/delete'] = 'Dashboard/deleteDashboard';
$route['dashboard/update'] = 'Dashboard/updateDashboard';

// DASHBOARD DATA 
$route['DashboardData/income'] = 'DashboardData/IncomeDashboard/income';
$route['DashboardData/stagesWiseLeads'] = 'DashboardData/LeadDashboard/stagesWiseLeads';
$route['DashboardData/sourceWiseLeads'] = 'DashboardData/LeadDashboard/sourceWiseLeads';
$route['DashboardData/getUnattendedLeads'] = 'DashboardData/LeadDashBoard/getUnattendedLeads';
$route['DashboardData/getpendingFollowupList'] = 'DashboardData/LeadDashBoard/getpendingFollowupList';
$route['DashboardData/getUpcomingFollowUp'] = 'DashboardData/LeadDashBoard/getUpcomingFollowUp';
$route['DashboardData/priorityWiseTasks'] = 'DashboardData/TaskDashBoard/priorityWiseTasks';
$route['DashboardData/projectWiseTasks'] = 'DashboardData/TaskDashBoard/projectWiseTasks';
$route['DashboardData/assigneeWiseTasks'] = 'DashboardData/TaskDashBoard/assigneeWiseTasks';
$route['DashboardData/customerWiseTasks'] = 'DashboardData/TaskDashBoard/customerWiseTasks';

######  FILTERS
$route['filterMasterList'] = 'systems/DynamicFilter/filterMasterList';
$route['filterMaster'] = 'systems/DynamicFilter/filterMaster';
$route['filterMaster/(:num)'] = 'systems/DynamicFilter/filterMaster/$1';
$route['filterMaster/delete'] = 'systems/DynamicFilter/deleteFilter';
$route['setDefaultFilter'] = 'systems/DynamicFilter/setDefaultFilter';
$route['getDefaultFilter'] = 'systems/DynamicFilter/getDefaultFilter';
$route['getJoinedValues'] = 'systems/DynamicFilter/getJoinedValues';

######receipt
$route['receiptMasterList'] = 'receiptMaster/getreceiptDetails';
$route['receiptMaster'] = 'receiptMaster/receiptMaster';
$route['receiptMaster/(:num)'] = 'receiptMaster/receiptMaster/$1';
$route['receiptMaster/status'] = 'receiptMaster/receiptChangeStatus';
$route['receiptMaster/deleteReceipt'] = 'receiptMaster/deleteReceipts';
$route['receiptTriggersList'] = 'receiptMaster/receiptTriggersList';
$route['generateRecipt/(:num)'] = 'receiptMaster/generateDonorReciptPDF/$1';
$route['generateReceiptReport'] = 'systems/DynamicPDFGenerator/pdfReport';
$route['getAllInvoices'] = 'receiptMaster/getAllInvoices';
$route['getCustList'] = 'receiptMaster/getCustomerList';
$route['getExpectedIncomeList'] = 'receiptMaster/getExpectedIncomeList';
$route['receiptMaster/multipleHardDelete'] = 'receiptMaster/multipleHardDelete';


######push service
$route['pushServiceMasterList'] = 'pushServiceMaster/getpushServiceDetails';
$route['pushServiceMaster'] = 'pushServiceMaster/pushServiceMaster';
$route['pushServiceMaster/(:num)'] = 'pushServiceMaster/pushServiceMaster/$1';
$route['pushServiceMaster/status'] = 'pushServiceMaster/pushServiceChangeStatus';
$route['pushServiceNotificationMaster'] = 'pushServiceMaster/pushServiceNotificationMaster';
$route['pushServiceNotificationMaster/(:num)'] = 'pushServiceMaster/pushServiceNotificationMaster/$1';
$route['pushServiceMaster/multipleHardDelete'] = 'pushServiceMaster/multipleHardDelete';

######task
$route['taskMasterList'] = 'taskMaster/gettaskDetails';
$route['taskMaster'] = 'taskMaster/taskMaster';
$route['taskMaster/(:num)'] = 'taskMaster/taskMaster/$1';
$route['taskMaster/status'] = 'taskMaster/taskChangeStatus';
$route['taskMaster/saveWatchersDetails'] = 'taskMaster/saveWatchersDetails';
$route['taskMaster/removeWatchers'] = 'taskMaster/removeWatchers';
$route['taskMaster/timeEstimation'] = 'taskMaster/timeEstimation';
$route['addwatchers'] = 'taskMaster/addWatchers';

$route['taskMaster/removeAttachment'] = 'taskMaster/removeAttachment';
$route['comment'] = 'systems/Comments/singleComment';
$route['comment/(:num)'] = 'systems/Comments/singleComment/$1';
$route['comments'] = 'systems/Comments/getCommentsDetails';
$route['history'] = 'systems/Comments/getTaskHistory';
$route['taskCommentDelete'] = 'taskMaster/deleteComment';
$route['getCustomerList'] = 'systems/Application/getList';
$route['getAssigneeList'] = 'systems/Application/getList';
$route['getList'] = 'systems/Application/getList';
$route['dynamicgetList'] = 'systems/Application/dynamicGetList';
$route['taskUpload'] = 'taskMaster/taskUpload';
$route['taskUpload/(:num)/(:num)'] = 'taskMaster/taskUpload/$1/$2';
$route['taskMaster/taskStatusUpdate'] = 'taskMaster/taskStatusUpdate';
$route['taskColumnUpdatePositions'] = 'taskMaster/updatePositions';
$route['taskRepeat'] = 'taskMaster/taskRepeat';
$route['taskDashboard/status'] = 'taskMaster/dashboardStatus';
$route['taskMaster/hardDelete'] = 'taskMaster/hardDelete';
$route['taskMaster/multipleHardDelete'] = 'taskMaster/multipleHardDelete';
$route['taskMaster/multipletaskChangeStatus'] = 'taskMaster/multipletaskChangeStatus';


// Mobile
$route['TaskMasterListStatic'] = 'taskMaster/gettaskDetailsStatic';
$route['TaskMasterStatic'] = 'taskMaster/taskMasterStatic';
$route['TaskMasterStatic/(:num)'] = 'taskMaster/taskMasterStatic/$1';

######campaigns
$route['campaignsMasterList'] = 'campaignsMaster/getcampaignsDetails';
$route['campaignsMaster'] = 'campaignsMaster/campaignsMaster';
$route['campaignsMaster/(:num)'] = 'campaignsMaster/campaignsMaster/$1';
$route['campaignsMaster/status'] = 'campaignsMaster/CampaignsChangeStatus';
$route['campaignsMaster/multipleHardDelete'] = 'campaignsMaster/multipleHardDelete';
$route['campaignsMaster/multiplecampaignChangeStatus'] = 'campaignsMaster/multiplecampaignChangeStatus';

######Company Master
$route['companyMasterList'] = 'companyMaster/getCompanyDetails';
$route['companyMaster'] = 'companyMaster/companyMaster';
$route['companyMaster/(:num)'] = 'companyMaster/companyMaster/$1';
$route['companyMaster/status'] = 'companyMaster/companyChangeStatus';
$route['getCompanyList'] = 'companyMaster/getCompanyList';
$route['getDefualtCompany'] = 'companyMaster/getDefualtCompany';
$route['setDefualtCompany'] = 'companyMaster/setDefualtCompany';
$route['companyMaster/copy'] = 'companyMaster/duplicateCompany';
$routr['companyMaster/hardDelete'] = 'companyMaster/hardDelete';



######service
// $route['serviceMasterList'] = 'serviceMaster/getserviceDetails';
// $route['serviceMaster'] = 'serviceMaster/serviceMaster';
// $route['serviceMaster/(:num)'] = 'serviceMaster/serviceMaster/$1';
// $route['serviceMaster/status'] = 'serviceMaster/ServiceChangeStatus';

$route['serviceMasterList'] = 'Service/getserviceDetails';
$route['serviceMaster'] = 'Service/ServiceMaster';
$route['serviceMaster/(:num)'] = 'Service/ServiceMaster/$1';
$route['serviceMaster/status'] = 'Service/ServiceChangeStatus';

######course
$route['courseMasterList'] = 'courseMaster/getcourseDetails';
$route['courseMaster'] = 'courseMaster/courseMaster';
$route['courseTrigger'] = 'courseMaster/setCourseTrigger';
$route['courseTrigger/(:num)'] = 'courseMaster/setCourseTrigger/$1';
$route['triggersList'] = 'courseMaster/getTriggers';
$route['triggerChangeStatus'] = 'courseMaster/changeTriggerStatus';
$route['courseMaster/(:num)'] = 'courseMaster/courseMaster/$1';
$route['courseMaster/status'] = 'courseMaster/CourseChangeStatus';
$route['courseMediaUpload/(:num)/(:num)'] = 'courseMaster/courseMediaUpload/$1/$2';
$route['courseMediaUpload/(:num)/(:num)/(:num)'] = 'courseMaster/courseMediaUpload/$1/$2/$3';
$route['lessonVideoUpload/(:num)/(:num)'] = 'courseMaster/videoUpload/$1/$2';
$route['lessonVideoUpload/(:num)/(:num)/(:num)'] = 'courseMaster/videoUpload/$1/$2/$3';
$route['courseMediaCollection'] = 'courseMaster/readCourseFiles';
$route['renameDir/(:any)/(:any)'] = 'courseMaster/renameDir/$1/$2';
$route['courseMaster/multipleHardDelete'] = 'courseMaster/multipleHardDelete';
$route['courseMaster/multiplecourseChangeStatus'] = 'courseMaster/multiplecourseChangeStatus';

######Section
$route['sections'] = 'courseMaster/sectionDetails';
$route['sections/(:num)'] = 'courseMaster/sectionDetails/$1';
$route['sectionMasterList'] = 'courseMaster/getaddsectionDetails';
$route['sectionMasterList/(:num)'] = 'courseMaster/getaddsectionDetails/$1';
$route['addSection'] = 'courseMaster/getSectionDetails';
$route['sections/status'] = 'courseMaster/sectionChangeStatus';
$route['updateSectionPositions'] = 'courseMaster/updateSectionPositions';


######Lesson
//$route['lessonMasterList'] = 'courseMaster/getlessonDetails';
$route['lesson'] = 'courseMaster/lessonDetails';
$route['lesson/(:num)'] = 'courseMaster/lessonDetails/$1';
$route['lessonMasterList'] = 'courseMaster/getlessonList';
$route['lessonMasterList/(:num)'] = 'courseMaster/getlessonList/$1';
$route['lessonsList'] = 'courseMaster/lessonList';
$route['lessonsList/(:num)'] = 'courseMaster/lessonList/$1';
$route['lesson/status'] = 'courseMaster/lessonChangeStatus';
$route['lesson/changeLessonSection'] = 'courseMaster/changeLessonSection';
$route['updateLessonPositions'] = 'courseMaster/updateLessonPositions';

######appointment  
$route['appointmentList'] = 'appointment/getappointmentDetails';
$route['appointmentMaster'] = 'appointment/appointmentMaster';
$route['appointmentMaster/(:num)'] = 'appointment/appointmentMaster/$1';
$route['appointmentMaster/status'] = 'appointment/AppointmentChangeStatus';
$route['customRepeatMaster'] = 'appointment/customRepeatMaster';
$route['customRepeatMaster/(:num)'] = 'appointment/customRepeatMaster/$1';
$route['saveAppointmentGuest'] = 'appointment/saveGuestDetails';
$route['appointmentMaster/removeGuest'] = 'appointment/removeGuest';
$route['appointmentDateList'] = 'appointment/getappointmentDate';

######employee
$route['EmployeeMasterList'] = 'EmployeeMaster/getemployeeDetails';
$route['EmployeeMaster'] = 'EmployeeMaster/employeeMaster';
$route['EmployeeMaster/(:num)'] = 'EmployeeMaster/employeeMaster/$1';
$route['EmployeeMaster/status'] = 'EmployeeMaster/EmployeeChangeStatus';

$route['ContactMasterList'] = 'SupplierMaster/contactList';
$route['contactMaster'] = 'SupplierMaster/contactMaster';
$route['contactMaster/(:num)'] = 'SupplierMaster/contactMaster/$1';
$route['contactMaster/status'] = 'SupplierMaster/ContactChangeStatus';

######Invoice
$route['taxInvoiceList'] = 'TaxInvoice/index';
$route['getInvoiceCustomer'] = 'TaxInvoice/getInvoiceCustomer';
$route['taxInvoice'] = 'TaxInvoice/getTaxInvoiceDetails';
$route['taxInvoice/(:num)'] = 'TaxInvoice/getTaxInvoiceDetails/$1';
$route['taxInvoice/status'] = 'TaxInvoice/taxInvoiceChangeStatus';
$route['deleteTaxInvoices'] = 'TaxInvoice/deleteTaxInvoices';
$route['invoiceItemList'] = 'TaxInvoice/invoiceItemList';
$route['getNarration/(:any)'] = 'TaxInvoice/getNarration/$1';
$route['getNextDocNumber/(:any)'] = 'TaxInvoice/getNextDocNumber/$1';
$route['getNarration'] = 'TaxInvoice/getNarration';
$route['cancelInvoice/(:num)'] = 'TaxInvoice/cancelInvoice/$1';
$route['printBill/(:num)'] = 'TaxInvoice/printBill/$1';
$route['getPdf/(:num)'] = 'TaxInvoice/getPdf/$1';
$route['removeInvoicePdf/(:any)'] = 'TaxInvoice/removeInvoicePdf/$1';
$route['printReceipt/(:num)'] = 'ReceiptMaster/printReceipt/$1';
$route['partialPayment'] = 'TaxInvoice/partialPayment';
$route['paymentLogsList/(:num)'] = 'TaxInvoice/paymentLogsList/$1';
$route['logsUpload'] = 'TaxInvoice/attachmentUpload';
$route['lastLog'] = 'TaxInvoice/getLastLogId';
$route['logsUpload/(:num)/(:num)'] = 'TaxInvoice/attachmentUpload/$1/$2';
$route['getInvoicePreview/(:num)'] = 'TaxInvoice/getInvoicePreview/$1';
$route['sendReminder/(:num)'] = 'TaxInvoice/isEmailSend/$1';
$route['taxInvoice/multipleHardDelete'] = 'TaxInvoice/multipleHardDelete';

######Invoice
$route['deliveryChallanList'] = 'DeliveryChallan/index';
$route['deliveryChallan'] = 'DeliveryChallan/getDeliveryDetails';
$route['deliveryChallan/(:num)'] = 'DeliveryChallan/getDeliveryDetails/$1';
$route['deliveryChallan/status'] = 'DeliveryChallan/deliveryChangeStatus';
$route['deleteChallan'] = 'DeliveryChallan/deleteChallan';
$route['getAllDeliveries/(:num)'] = 'DeliveryChallan/getAllDeliveries/$1';
$route['deliveryItemList'] = 'DeliveryChallan/deliveryItemList';
$route['cancelChallan/(:num)'] = 'DeliveryChallan/cancelChallan/$1';
// $route['printDeliveryChallan/(:num)'] = 'DeliveryChallan/printBill/$1';

######stock
$route['stockMasterList'] = 'PurchaseOrder/index';
$route['stockMaster'] = 'PurchaseOrder/getPurchaseOrderDetails';
$route['stockMaster/(:num)'] = 'PurchaseOrder/getPurchaseOrderDetails/$1';
$route['stockMaster/status'] = 'PurchaseOrder/stockChangeStatus';
$route['purchaseItemList'] = 'PurchaseOrder/purchaseItemList';
$route['deletePurchase'] = 'PurchaseOrder/deletePurchaseOrders';
$route['stockMaster/multipleHardDelete'] = 'PurchaseOrder/multipleHardDelete';
$route['stockMaster/multiplepurchaseChangeStatus'] = 'PurchaseOrder/multiplepurchaseChangeStatus';
######Event
$route['eventList'] = 'EventMaster/getEventDetailsList';
$route['event'] = 'EventMaster/eventData';
$route['event/(:num)'] = 'EventMaster/eventData/$1';
$route['event/status'] = 'EventMaster/eventDataChangeStatus';
$route['eventSchedule'] = 'EventMaster/eventSchedule';
$route['eventschedulerdetails'] = 'EventMaster/eventSchedulerDetails';
$route['eventschedulerdetails/(:num)'] = 'EventMaster/eventSchedulerDetails/$1';
$route['EventMaster/multipleHardDelete'] = 'EventMaster/multipleHardDelete';
$route['EventMaster/multipleeventChangeStatus'] = 'EventMaster/multipleeventChangeStatus';


######Avablity
$route['schedulesMasterList'] = 'AvablityMaster/getSchedulesDetails';
$route['schedulesMaster'] = 'AvablityMaster/schedulesMaster';
$route['schedulesMaster/(:num)'] = 'AvablityMaster/schedulesMaster/$1';
$route['schedulesMaster/status'] = 'AvablityMaster/schedulesDataChangeStatus';
$route['schedulesListMaster'] = 'AvablityMaster/getScheduleNameDetails';
$route['schedules'] = 'AvablityMaster/schedules';
$route['schedules/(:num)'] = 'AvablityMaster/schedules/$1';


######services

$route['serviceGallery/(:num)'] = "Service/servicegallery/$1";
$route['serviceGal/(:any)/(:num)'] = "Service/serviceGal/$1/$2";
$route['delGalleryFile/(:num)'] = "Service/deleteFile/$1";

######Product
$route['productMasterList'] = 'Product/productMasterList';
$route['productMaster'] = 'Product/productMaster';
$route['productMaster/(:num)'] = 'Product/productMaster/$1';
$route['productMaster/status'] = 'Product/productChangeStatus';
$route['getSearchedProduct'] = 'Product/getSearchedProduct';
$route['productMaster/multipleHardDelete'] = 'Product/multipleHardDelete';
$route['productMaster/multipleproductChangeStatus'] = 'Product/multipleproductChangeStatus';

###### AccountMaster
$route['accountMasterList'] = 'Accounts/accountMasterList';
$route['accountMaster'] = 'Accounts/accountMaster';
$route['accountMaster/(:num)'] = 'Accounts/accountMaster/$1';
$route['accountMaster/status'] = 'Accounts/accountChangeStatus';
$route['accountMaster/multipleHardDelete'] = 'Accounts/multipleHardDelete';
$route['accountMaster/multipleaccountChangeStatus'] = 'Accounts/multipleaccountChangeStatus';

###### CurrencyMaster
$route['currencyMasterList'] = 'CurrencyMaster/currencyMasterList';
$route['currencyMaster'] = 'CurrencyMaster/currencyMaster';
$route['currencyMaster/(:num)'] = 'CurrencyMaster/currencyMaster/$1';
$route['currencyMaster/status'] = 'CurrencyMaster/currencyChangeStatus';
$route['currencyMaster/multipleHardDelete'] = 'CurrencyMaster/multipleHardDelete';
$route['currencyMaster/multiplecurrencyChangeStatus'] = 'CurrencyMaster/multiplecurrencyChangeStatus';

###### VendorMaster
$route['vendorMasterList'] = 'VendorMaster/vendorMasterList';
$route['vendorMaster'] = 'VendorMaster/vendorMaster';
$route['vendorMaster/(:num)'] = 'VendorMaster/vendorMaster/$1';
$route['vendorMaster/status'] = 'VendorMaster/vendorChangeStatus';
$route['changeVendorPic/(:num)'] = 'VendorMaster/setVendorPic/$1';
$route['delVendorPic/(:num)'] = "VendorMaster/removeVendorPicFile/$1";
$route['VendorMaster/multipleHardDelete'] = 'VendorMaster/multipleHardDelete';
$route['VendorMaster/multiplevendorChangeStatus'] = 'VendorMaster/multiplevendorChangeStatus';

######Process
$route['processMasterList'] = 'Process/processMasterList';
$route['processMaster'] = 'Process/processMaster';
$route['processMaster/(:num)'] = 'Process/processMaster/$1';
$route['processMaster/status'] = 'Product/processChangeStatus';


###### Work Order Process
$route['workProcessMasterList'] = 'WorkProcess/workProcessMasterList';
$route['workProcessrocessMaster'] = 'WorkProcess/workProcessMaster';
$route['workProcessMaster/(:num)'] = 'WorkProcess/workProcessMaster/$1';
$route['workProcessMaster/status'] = 'WorkProduct/workProcessChangeStatus';

######career
$route['careerMasterList'] = 'Career/getcareerDetails';
$route['careerMaster'] = 'Career/CareerMaster';
$route['careerMaster/(:num)'] = 'Career/CareerMaster/$1';
$route['careerMaster/status'] = 'Career/CareerChangeStatus';
$route['careerMaster/multipleHardDelete'] = 'Career/multipleHardDelete';
$route['careerMaster/multipletaskChangeStatus'] = 'Career/multipletaskChangeStatus';

######StudentDemo(prathamesh)
$route['studentDemoMasterList'] = 'StudentDemo/getstudentDemoDetails';
$route['studentDemoMaster'] = 'StudentDemo/studentDemoMaster';
$route['studentDemoMaster/(:num)'] = 'StudentDemo/studentDemoMaster/$1';
$route['studentDemoMaster/status'] = 'StudentDemo/studentDemoChangeStatus';

######ourclients
$route['ourClientsList'] = 'OurClients/getclientDetails';
$route['ourClient'] = 'OurClients/OurClients';
$route['ourClient/(:num)'] = 'OurClients/OurClients/$1';
$route['ourClient/status'] = 'OurClients/OurClientsChangeStatus';
$route['ourClient/multipleHardDelete'] = 'OurClients/multipleHardDelete';
$route['ourClient/multipleclientChangeStatus'] = 'OurClients/multipleclientChangeStatus';

######projects
$route['projectsList'] = 'Projects/getprojectDetails';
$route['projects'] = 'Projects/projects';
$route['projects/(:num)'] = 'Projects/projects/$1';
$route['projects/status'] = 'Projects/projectsChangeStatus';
$route['projects/completeProject'] = 'Projects/completeProject';
$route['commentsListProject'] = 'Projects/getProjectCommentDetails';
$route['projectComment'] = 'Projects/projectCommentMaster';
$route['projectComment/(:num)'] = 'Projects/projectCommentMaster/$1';
$route['projectMasterList/Notes'] = 'Projects/getprojectNotesDetails';
$route['projectMaster/Note'] = 'Projects/projectrNote';
$route['projectMaster/Note/(:num)'] = 'Projects/projectrNote/$1';
$route['projectCommentDelete'] = 'Projects/deleteComment';
$route['project/hardDelete'] = 'Projects/hardDelete';
$route['projectNote/delete'] = 'Projects/noteDelete';
$route['projects/multipleHardDelete'] = 'Projects/multipleprojectkChangeStatus';

######expense
$route['expenseList'] = 'expense/getexpensesDetails';
$route['expense'] = 'expense/expence';
$route['expense/(:num)'] = 'expense/expence/$1';
$route['expense/status'] = 'expense/expencesChangeStatus';
$route['expenseReceiptUpload'] = 'expense/receiptUpload';
$route['expenseReceiptUpload/(:num)'] = 'expense/receiptUpload/$1';
$route['getExpectedExpenseList'] = 'expense/getExpectedExpenseList';
$route['expenses/removeAttachment'] = 'expense/removeAttachents';
$route['expense/multipleHardDelete'] = 'expense/multipleHardDelete';

######tickets
$route['ticketList'] = 'tickets/getticketsDetails';
$route['ticket'] = 'tickets/ticket';
$route['ticket/(:num)'] = 'tickets/ticket/$1';
$route['ticket/status'] = 'tickets/ticketsChangeStatus';

######ourteams
$route['ourTeamList'] = 'OurTeam/getteamDetails';
$route['ourTeam'] = 'OurTeam/OurTeam';
$route['ourTeam/(:num)'] = 'OurTeam/OurTeam/$1';
$route['ourTeam/status'] = 'OurTeam/OurTeamChangeStatus';
$route['ourTeam/multipleHardDelete'] = 'OurTeam/multipleHardDelete';
$route['ourTeam/multipleteamChangeStatus'] = 'OurTeam/multipleteamChangeStatus';

######testimonials
$route['testimonialsList'] = 'Testimonials/gettestimonialsDetails';
$route['testimonials'] = 'Testimonials/testimonials';
$route['testimonials/(:num)'] = 'Testimonials/testimonials/$1';
$route['testimonials/status'] = 'Testimonials/testimonialsChangeStatus';
$route['testimonials/multipleHardDelete'] = 'Testimonials/multipleHardDelete';
$route['testimonials/multipletestimonialChangeStatus'] = 'Testimonials/multipletestimonialChangeStatus';

######DynamicField
$route['dynamicFormsList'] = 'DynamicForms/getFieldDetails';
$route['dynamicForms'] = 'DynamicForms/DynamicForm';
$route['dynamicForms/(:num)'] = 'DynamicForms/DynamicForm/$1';
$route['dynamicForms/status'] = 'DynamicForms/DynamicFieldChangeStatus';
$route['dynamicFormsQuestion'] = 'DynamicForms/DynamicQuestion';
$route['dynamicFormsQuestion/(:num)'] = 'DynamicForms/DynamicQuestion/$1';
$route['dynamicFormsFieldsList'] = 'DynamicForms/getFormFields';

$route['customUpload'] = 'systems/DynamicFormData/customUpload';
// $route['customUpload/(:num)'] = 'systems/DynamicFormData/customUpload/$1';
// $route['customUpload/(:num)/(:num)'] = 'systems/DynamicFormData/customUpload/$1/$2';
// $route['customUpload/(:num)/(:num)/(:num)/(:any)'] = 'systems/DynamicFormData/customUpload/$1/$2/$3/$4';
$route['customModule/removeAttachment'] = 'systems/DynamicFormData/removeAttachment';

////////////////// server files reading end  //////////////////

///FAQ Route

$route['faqList'] = 'Faq/getFaqDetailsList';
$route['faq'] = 'Faq/faqData';
$route['faq/(:num)'] = 'Faq/faqData/$1';
$route['faq/status'] = 'Faq/faqDataChangeStatus';
$route['faq/multipleHardDelete'] = 'Faq/multipleHardDelete';
$route['faq/multiplefaqChangeStatus'] = 'Faq/multiplefaqChangeStatus';

//////////FAQ ROUTE END

///ImageSlider Route
$route['imageSliderMasterList'] = 'ImageSlider/getImageSliderDetails';
$route['imageSlider'] = 'ImageSlider/sliderMaster';
$route['imageSlider/(:num)'] = 'ImageSlider/sliderMaster/$1';
$route['sliderMaster/status'] = 'ImageSlider/sliderChangeStatus';

$route['sliderSectionMasterList'] = 'ImageSlider/sliderSectionList';
$route['sliderSections/status'] = 'ImageSlider/sliderSectionChangeStatus';
$route['sliderSections'] = 'ImageSlider/sectionDetails';
$route['sliderSections/(:num)'] = 'ImageSlider/sectionDetails/$1';
$route['sliderSections/multipleHardDelete'] = 'ImageSlider/multipleHardDelete';
$route['sliderSections/multipleimagesliderChangeStatus'] = 'ImageSlider/multipleimagesliderChangeStatus';

///ImageSlider Route END

///templates Route
$route['templateList'] = 'Templates/getTemplateDetailsList';
$route['template'] = 'Templates/templateData';
$route['template/(:num)'] = 'Templates/templateData/$1';
$route['template/status'] = 'Templates/templateDataChangeStatus';
$route['template/multipleHardDelete'] = 'Templates/multipleHardDelete';
$route['template/multipletemplateChangeStatus'] = 'Templates/multipletemplateChangeStatus';

///templates Route END

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

///FormMaster Route

$route['formMasterList'] = 'FormMaster/getFormDetailsList';
$route['formMaster'] = 'FormMaster/formMasterData';
$route['formMaster/(:num)'] = 'FormMaster/formMasterData/$1';
$route['formMaster/status'] = 'FormMaster/formMasterDataChangeStatus';
$route['formQuestionMaster'] = 'FormMaster/formQuestionMaster';
$route['formQuestionMaster/(:num)'] = 'FormMaster/formQuestionMaster/$1';
$route['formQuestionMasterList'] = 'FormMaster/formQuestionMasterList';
$route['formQuestionMaster/status'] = 'FormMaster/formQuestionMasterChangeStatus';
$route['formQuestionImage/(:num)/(:num)'] = 'FormMaster/formQuestionImage/$1/$2';
$route['formQuestions/updatePositions'] = 'FormMaster/updatePositions';
$route['deleteQuestionImage'] = 'FormMaster/deleteQuestionImage';
$route['formQuestionMasterSection'] = 'FormMaster/formQuestionMasterSection';
$route['formMasterQuestionSectionsList'] = 'FormMaster/formMasterQuestionSectionsList';

///FormAnsMaster Route
$route['formAnsMasterList'] = 'FormMaster/getFormAnsMasterList';
$route['formAnsSingleList'] = 'FormMaster/getFormAnsMasterList';
// $route['formAnsMaster'] = 'FormMaster/getFormAnsMasterList';

$route['formAnsMaster'] = 'FormMaster/formAnsMaster';
$route['formAnsMaster/(:num)'] = 'FormMaster/formAnsMaster/$1';
$route['formAnsMaster/status'] = 'FormMaster/formAnsMasterChangeStatus';


//////////FormMaster ROUTE END
///pages Menu Master Route

$route['pagesMenuMasterList'] = 'Pages/getPagesMenuMasterList';
$route['pagesMenuMaster'] = 'Pages/pagesMenuMaster';
$route['pagesMenuMaster/(:num)'] = 'Pages/pagesMenuMaster/$1';
$route['pagesMenuMaster/status'] = 'Pages/pagesMenuMasterChangeStatus';
$route['updatemenuPagesList'] = 'Pages/updatemenuPagesList';
$route['menuPagesList'] = 'Pages/menuPagesList';
$route['addCustomLinks'] = 'Pages/addCustomLinks';
$route['deletePageFromSelectedMenu'] = 'Pages/deletePageFromSelectedMenu';
$route['deleteMenuList'] = 'Pages/deleteMenuList';
$route['menuPagesMaster/updatePositions'] = 'Pages/updatePositions';
$route['pagesMenuMaster/multipleHardDelete'] = 'Pages/multipleHardDelete';
$route['pagesMenuMaster/multiplepagesChangeStatus'] = 'Pages/multiplepagesChangeStatus';

$route['translate_uri_dashes'] = FALSE;
$route['404_override'] = '';

// celebrateWithUs
$route['celebrateWithUsList'] = 'CelebrateWithUsMaster/celebrateWithUsList';
$route['celebrateWithUs'] = 'CelebrateWithUsMaster/celebrateWithUs';
$route['celebrateWithUs/(:num)'] = 'CelebrateWithUsMaster/celebrateWithUs/$1';
$route['celebrateWithUs/status'] = 'CelebrateWithUsMaster/celebrateWithUsChangeStatus';
$route['celebrationApproved/(:num)'] = 'CelebrateWithUsMaster/celebrationApproved/$1';
$route['celebrationDeclined/(:num)'] = 'CelebrateWithUsMaster/celebrationDeclined/$1';
$route['occasionList'] = 'CelebrateWithUsMaster/occasionList';
$route['prefixList'] = 'CelebrateWithUsMaster/prefixList';

//BulkEdit
$route['editdata'] = 'systems/Application/getbulkeditdata';

// WHATS APP 
$route['sendWhatsAppMsg'] = 'systems/WASender/sendWhatsAppMsg';
$route['receiveWhatsAppMsg'] = 'systems/WASender/receiveWhatsAppMsg';
$route['waAllMsg'] = 'systems/WASender/getAllMsg';
$route['updateMsgStatus'] = 'systems/WASender/updateMsgStatus';