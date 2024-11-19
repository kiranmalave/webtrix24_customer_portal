<?php
defined('BASEPATH') or exit('No direct script access allowed');
#[\AllowDynamicProperties]
class Systemmsg extends CI_Log
{
	public function __construct()
	{
		parent::__construct();
		$this->CI = &get_instance();
	}

	public function getErrorCode($codeID = '')
	{
		return $this->errorList($codeID);
	}
	public function getSucessCode($codeID = '')
	{
		return $this->sucessList($codeID);
	}
	private function errorList($codeID = '')
	{
		$errorList  = array();
		//$errorList[200] = "Sucess";
		$errorList[210] = "Invalid User name or Password.";
		$errorList[211] = "Your account is inactive. Please contact to administrator.";
		$errorList[212] = "Your account not verify yet. Please check your email for verification link.";
		$errorList[214] = "Your account is Deleted. Please contact to administrator.";
		$errorList[218] = "{fieldName} required.";
		$errorList[219] = "{fieldName} : Please enter at least {minchar} characters.";
		$errorList[220] = "{fieldName} : You can enter Max {maxchar} characters.";
		$errorList[227] = "No records found.";
		$errorList[232] = "Oh no. you have reached the end of the search result.";
		$errorList[233] = "Admin apply on charges required.";
		$errorList[234] = "Error while processing company data. Please try again or contact development team";
		$errorList[235] = "Following Trainee records not found in excel data.Please verify trainee status and try again";
		$errorList[236] = "Company not selected.";
		$errorList[237] = "Report Type Not valid.";
		$errorList[238] = "Report Year Not valid.";
		$errorList[239] = "Report Month Not valid.";
		$errorList[240] = "Error while processing data.Please contact to administrator";
		$errorList[241] = "No data available to process.";
		$errorList[242] = "New Record Found(s).";
		$errorList[243] = "Data could not process. Please resolve following error(s).";
		$errorList[244] = "Selected Month data already uploaded.Do you want to delete it?";
		$errorList[245] = "Selected Month data already uploaded and processed you can not modify it.";
		$errorList[246] = "Excel Columns does not match. All column names are case sensitive.Please check your column names.";
		$errorList[252] = "Duplicate Record(s) found.";
		$errorList[254] = "Error while saving invoice details.Please contact to administrator.";
		$errorList[267] = "Error while saving purchase details.Please contact to administrator.";
		$errorList[273] = "Selected Data information not found in database.";
		$errorList[274] = "Your Access Denied. Please contact to admin.";
		$errorList[275] = "You cannot save future date Invoice.";
		$errorList[276] = "You cannot save back dated Invoice.";
		$errorList[277] = "Failed to create Invoice.";
		$errorList[278] = "Email Already Exists.";
		$errorList[279] = "Contact Number Already Exists.";
		$errorList[280] = "Form name Invalid.";
		$errorList[281] = "Folder already exits.";
		

		//error for datatables
		$errorList[282] = "Table name cannot be empty.";
		$errorList[283] = "Invalid field name.";
		$errorList[284] = "Column name cannot be empty for setting primary key.";
		$errorList[285] = "Invalid field type for field, type must be a string.";
		$errorList[286] = "Invalid constraint value for field, constraint must be a positive numeric value.";
		$errorList[287] = "Duplicate module found. Please try with another name.";
		$errorList[288] = "Duplicate Column found. Please try with another name.";
		$errorList[289] = "Error while adding watchers.";
		$errorList[290] = "Entered amount is greater than totalamount.";
		$errorList[291] = "Customer's Address not Found !";
		$errorList[292] = "Customer's GST No not Found !";
		$errorList[293] = "Pending Amt is Greater Than Total Amt ! You cannot change product Row !";
		$errorList[294] = "You did't have Assigned Company...! Please Contact Admin...!";
		
		// EMAIL ERRORS
		$errorList[295] = "Please Enter Existing Email!";
		$errorList[296] = "Email not send!";
		$errorList[297] = "UserName Already exists!";
		$errorList[298] = "Email Template 'forgotPasswordOTPSendTemp' is Not Exists ! ";
		$errorList[299] = "Email Template 'updatePasswordByAdminTemp' is Not Exists ! ";
		$errorList[300] = "Email Template 'accountVerificationTemplate' is Not Exists ! ";
		$errorList[301] = "Confirm password not same as New password";
		$errorList[302] = "Invalid link..";
		$errorList[304] = "Invalid Verification Code..";
		$errorList[305] = "The link has expired.Please request new one.";
		$errorList[306] = "Receipt details not found !";
		$errorList[307] = "Invoice Details not found !";
		$errorList[308] = "Info settings not found !";
		$errorList[309] = "Invoice pdf not found !";
		$errorList[310] = "Email Attachment Upload Failed...!";
		$errorList[311] = "File not found...!";
		$errorList[312] = "Email attachment removal failed...!";
		$errorList[313] = "Template Not Found...!";
		$errorList[314] = "User Not Verified ...!";

		$errorList[315] = "You did't have Assigned Company...! Please Contact Admin...!";
		$errorList[316] = "Incorrect Old password..!";
		$errorList[317] = "Customer Not Found..!";
		$errorList[318] = "Invoice Row Feilds Required..!";
		$errorList[319] = "Error while updating stocks..!";
		$errorList[320] = "Error while updating item row ..!";
		$errorList[321] = "Error while inserting item row ..!";
		$errorList[322] = "Error while inserting Receipt Details ..!";
		$errorList[323] = "DocPrefix Not Found..! Add Prefixes First..";
		$errorList[324] = "Please enter username and password.";
		$errorList[325] = "No account was found with that email/username. Please check your input or sign up for an account.";
		$errorList[326] = "Unable to send response.";
		$errorList[327] = "Please verify your account before resetting your password. Check your email for instructions or contact support for assistance.";
		$errorList[328] = "Check your email for further instructions, if exits.";
		$errorList[329] = "Company Name already exits.";
		$errorList[330] = "Category Name or Catrgory Slug already exits.";
		$errorList[331] = "Filter Name already exist.";
		$errorList[332] = "Metadata and C-metadata not found!";
		$errorList[334] = "Library Not Found..!";
		$errorList[335] = "Company Email Details Not Found - {fieldName} ";
		$errorList[336] = "Error while inserting product.Please contact to administrator.";
		$errorList[337] = "Invoice Details are empty";
		$errorList[338] = "Menu Details not Found";
		$errorList[339] = "Duplicate Product found. Please try with another name.";

		$errorList[991] = "WhatsApp Error !";
		$errorList[992] = "CompanyDetails not found. Please contact to administrator.";
		$errorList[993] = "Error while deleting records. Please contact to administrator.";
		$errorList[994] = "Token expired.Please login again.";
		$errorList[995] = "";
		$errorList[996] = "Error while deleting record(s).Please contact to administrator.";
		$errorList[997] = "Login required.Please login to access video.";
		$errorList[998] = "Error while saving details. Please contact to administrator.";
		$errorList[999] = "Unknown Error. Please contact to administrator.";
		return $errorList[$codeID];
	}

	private function sucessList($codeID = '')
	{
		$sucessList = array();
		$sucessList[400] = "Success";
		$sucessList[410] = "Valid User";
		$sucessList[411] = "Logout success";
		$sucessList[412] = "Valid Email";
		$sucessList[413] = "Valid user name";
		$sucessList[419] = "Thank you for connecting with us.Our support team will contact you.";
		$sucessList[420] = "Thank you for subscription .We will send news and updates to you.";
		$sucessList[424] = "Your Record is saved successfully. But Error in saving Watcher";
		$sucessList[421] = "Excel data uploaded successfully.";
		$sucessList[422] = "Data deleted successfully.";
		$sucessList[423] = "Montly data validated successfully.";
		$sucessList[424] = "A password reset link has been sent to the registered email address.";
		$sucessList[425] = "The password has been reset successfully..!";
		$sucessList[426] = "Email Attachment Upload Succeed...!";
		$sucessList[427] = "Email Attachment Removed...!";
		return $sucessList[$codeID];
	}
}
