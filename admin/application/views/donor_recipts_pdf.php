<?php
?></!DOCTYPE html>
<html>
<head>

<style type="text/css">
	body { 
	    font-family: serif; 
	    font-size: 9pt; 
	}
	table tr td {margin:0px;padding:2px;}
	.half{
		width: 50%;
	}
	.half3{
		width: 30%;
	}
	.border-top{
		border-top-style:solid;border-top-width:1px;
	}
	.border-right{
		border-right-style:solid;border-right-width:1px;
	}
	.border-bottom{
		border-bottom-style:solid;border-bottom-width:1px;
	}
	.border-left{
		border-left-style:solid;border-left-width:1px;
	}
	.borderAll td,.borderAll th{
		border-style:solid;border-width:1px;
	}
	.borderBottom td,.borderBottom th{
		border-bottom-style:solid;border-bottom-width:1px;
		padding:4px;
	}
	.srNo{
		width: 10%;
		text-align:center;
		
	}
	.desc{
			width: 40%;
  	}
  	.qut{
			width: 20%;
  	}
  	.unit{
			width: 10%;
  	}
  	.rate{
			width: 15%;
  	}
  	.amt{
			width: 15%;
  	}
  	.text-center{
  		text-align: center;
  	}
	.text-left{
  		text-align: left;
  	}
  	.text-right{
  		text-align: right;
  	}
  	.items tr {

  	}
  	.bg{
  		background: #84BCC6;
  	}
  	.titlepad{
  		padding:10px 20px;
  	}
  	.margin-top-20{
  		margin-top:100px;
  	}
  	.text-blue{
  		color: #488ea1;
  	}
  	.color-orenge{
  		color: #E36C0A	;
  		font-size: 11px;
  	}
  	.padding-0{
  		padding: 0px;
  	}
  	.margin-0{
  		margin-bottom: -10px;
  	}
  	.mytable {	width:100%;}
</style>
</head>
<body>
<p align="center" style="font-size:15px" class="text-blue padding-0 margin-0"><strong>DONATION RECEIPT</strong></p>
<div >
<table>
	<tr>
		<td><div><img src="<?php echo $this->config->item( 'imagesPATH' );?>logo.png" width="15%"></div>
		</td>
		<td>
			<!-- <table>
				<tr>
					<td class="color-orenge text-center"><strong>Registration No.: </strong>Trust: F 40378 (Mumbai) | Society: Maharashtra State, Mumbai 2696, 2009, G.B.B.S.D.</td>
				</tr>
				<tr>
					<td class="color-orenge text-center"><strong>PAN:</strong> AADTA0477E | <strong>12AA Registration No.:</strong> 2019-20/A/10285 | <strong>80G Registration No.:</strong> 2020-21/A/10154 <strong></td>
				</tr>
				<tr>
					<td class="color-orenge text-center"><strong>Registered Office :</strong> 304, Hrishikesh Apartment, Veer Savarkar Road, Dadar W., Mumbai - 400028</td>
				</tr>
				<tr>
					<td class="color-orenge text-center"><strong>Contact No.: </strong> 9969607247 | <strong>Email ID:</strong> ngoankar@gmail.com | <strong>Website:</strong> www.ankurpratishthan.org</td>
				</tr>
			</table> -->
			<?php echo $header;  ?>


			<!-- <div class="color-orenge"><p class="text-center"><strong>Registration No.: </strong>Trust: F 40378 (Mumbai) | Society: Maharashtra State, Mumbai 2696, 2009, G.B.B.S.D. <strong>PAN:</strong> AADTA0477E | <strong>12AA Registration No.:</strong> 2019-20/A/10285 | <strong>80G Registration No.:</strong> 2020-21/A/10154 <strong>Registered Office :</strong> 304, Hrishikesh Apartment, Veer Savarkar Road, Dadar W., Mumbai - 400028 <strong>Contact No.: </strong> 9969607247 | <strong>Email ID:</strong> ngoankar@gmail.com | <strong>Website:</strong> www.ankurpratishthan.org</p></div> -->
		</td>
	</tr>
</table>
</div>
<div class="" style="border-bottom: 2px solid; border-color:#729fcf;"></div>
<br/>
	<table  class="mytable" >
		<tr>
			<td class="half3"><strong>Receipt No : </strong> <?php if($value->receipt_id!=""){echo $value->receipt_id;}else{ echo "NA";}?></td>
			<td ><strong>Date Of Donation : </strong><?php if($value->date_of_donation!=0){ echo date("d-M-Y", strtotime($value->date_of_donation));}else{echo "NA";}?></td>
			<td ><strong>Issuance Date : </strong><?php if($value->approved_declined_date!="0000-00-00"){ echo date("d-M-Y", strtotime($value->approved_declined_date));}else{echo "NA";}?></td>
		</tr>
		<tr>
			<td ><strong>Donated By : </strong> <?php $value->name;?></td>
			<td ><strong>In the Name of : </strong><?php if($value->receipt_in_name_of!=""){echo $value->receipt_in_name_of;}else{echo  "NA";}?></td>
			<td ><strong>Contact No : </strong> <?php if($value->contact_number!=""){ echo $value->contact_number;}else{echo "NA";}?></td>
		</tr>
		<tr>
			<td colspan="3"><strong>Residential Address : </strong> <?php echo $value->address?></td>
		</tr>
		<tr>
			<td class="half"><strong>Email ID : </strong><?php echo $value->email_id?></td>
			<td class="half3"><strong>Date of Birth : </strong> N/A</td>
			<td class="half3"><strong>Amount in Figures : </strong>&#8377;<?php echo $value->donation_amount?>/-</td>
		</tr>
		
		<tr>
			
			<td colspan="3"><strong>Amount in Words : </strong>
				<?php echo $this->CommonModel->num2words(round($value->donation_amount),"INR");  ?>
		</tr>
		<tr>
			<td ><strong>PAN : </strong><?php if($value->pan_number!=""){echo $value->pan_number;}else{echo "NA";}?></td>
			<td ><strong>Donation Towards : </strong> <?php if($value->receipt_in_name_of!=""){echo $value->receipt_in_name_of;}else{echo "NA";}?></td> 
			<td><strong>Mode of Donation : </strong> <?php if($value->type_of_donation!=""){echo $value->type_of_donation;}else{echo "NA";}?></td>
		</tr>
		<tr>
			<td>
				<br/>
				<strong>Received By,</strong><br/>
			 <img src="<?php echo $this->config->item( 'imagesPATH' );?>/signImages/signature.jpg" width="15%"><br/>
			 <strong><?php echo $name; ?><br>
			 <?php echo $designation; ?></strong> 
			</td>
			
		</tr>
		
	</table>
			

<div class="" style="border-bottom: 2px solid; border-color:#d68044;"></div>
<br/>
<div><strong>Please Note : </strong></div>
<div>
	<?php echo $termsAndConditions;  ?>
</div>
<div>
	<hr>
</div>
<!-- <div>
		<?php echo $footer;  ?>
</div> -->
</body>
