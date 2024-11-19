<style type="text/css">
	body { 
	    font-family: serif; 
	    font-size: 8pt; 
	}
	.logo {
		width: 100px;
		height: 60px;
		object-fit: contain;
		margin-bottom: 8px;
	}
	table tr td {margin:0px;}
	.half{
		width: 50%;
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
		vertical-align:top;
	}
	.type{
		width: 30%;
		vertical-align:top;
	}
  	.qut{
			width: 20%;
			vertical-align:top;
  	}
  	.unit{
			width: 10%;
			vertical-align:top;
  	}
	.hsn{
		width: 10%;
		vertical-align:top;
  	}
	.uqc{
		width: 10%;
		vertical-align:top;
  	}
  	.rate{
			width: 25%;
  	}
  	.amt{
			width: 25%;
  	}
  	.desc{
			width: 40%;
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
  	p {
		font-size: 20pt;
		font-weight: 600;
		text-align: justify;
		padding-left: 85px;
	}
	.RHD {
		width:19%;
	}
</style>

<div style="padding-top: 38px; margin: 10px;">
	<div class="text-left" style="float: left;width:30%;">
	<img class="logo" src="<?php
			if (!empty($infoSettings[0]->invoice_logo)) {
				echo $this->config->item('media_url') . "/" . $infoSettings[0]->invoice_logo;
			}
		?>">
	</div>
	<div style="float:right; width:30%;">
		<h1 align="right"><strong>Receipt</strong></h1>
	</div>
</div>
<br>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>PAN No :</strong></td><td style="font-size: 8pt;"> <?php echo $infoSettings[0]->pan;?> </td>
					</tr	>
				</table>
			</td>
			<td class="">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>GSTIN  : </strong></td><td style="font-size: 8pt;"><?php echo $infoSettings[0]->gst_no;?></h3></td>
					</tr>
				</table>
			</td>
			<td class="">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>MSME   : </strong></td><td style="font-size: 8pt;"><?php echo $infoSettings[0]->msme_no;?></td>
					</tr>
				</table>
			</td>
			<td class="">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Lut No : </strong></td><td style="font-size: 8pt;"><?php echo $infoSettings[0]->lut_no;?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Receipt No:</strong></td>
						<td style="font-size: 8pt;"><?php echo $receiptDetails[0]->receipt_number; ?></td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Date:</strong></td><td style="font-size: 8pt;"><?php echo date("d F Y", strtotime($receiptDetails[0]->payment_log_date)); ?></td>
					</tr>
				</table>
			</td>	
		</tr>
		<tr>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;" >
							<strong>PO No:</strong></td><td style="font-size: 8pt;"><?php echo $receiptDetails[0]->receipt_number; ?>
						</td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>PO Date:</strong></td><td style="font-size: 8pt;"><?php echo date("d F Y", strtotime($receiptDetails[0]->payment_log_date)); ?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="half border-right" style="vertical-align:top;">
				<table>
					<tr style="border:1px solid black;">
						<td><strong>Office Address :</strong></td>
					</tr>
					<tr>
						<td><strong><?php echo $infoSettings[0]->companyName; ?></strong></td>
					</tr>
					<tr >
						<td><?php echo $infoSettings[0]->company_address; ?></td>
					</tr>
				</table>
			</td>
			<td class="half">

				<table>
					<tr style="border:1px solid black;">
						<td><strong>Received From :</strong></td>
					</tr>
					<tr>
						<td>Name : <strong><?php echo $customerDetails[0]->name; ?></strong></td> 
					</tr>
					<tr>
						<td>Address : <?php echo $customerDetails[0]->address; ?></td>
					</tr>
					<tr>
						<td>GSTN : <?php echo $customerDetails[0]->gst_no; ?></td>
					</tr>
					<tr>
						<td>State : <?php if (isset($customerDetails[0]->state)) {
							echo $customerDetails[0]->state; 
						} ?></td><td>Mobile : <?php echo $customerDetails[0]->mobile_no; ?></td>
					</tr>
				</table>
			</td>
		</tr>
		
	</tbody>
</table>	
<table id="recNarration" style="border: 1px solid black;" width="100%">
	<tbody>
		<tr height="150px">
			<td colspan='2'>
				<p class="p">
					I Have Received 
					<?php 
						echo $this->CommonModel->num2words(($receiptDetails[0]->amount), "INR").' & [ '.$receiptDetails[0]->amount.' ] '; 
					?>
					From 
					<?php 
						echo $customerDetails[0]->name .' .'; 
					?>
				</p>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;" class="items">
	<tbody>
		<tr class="borderBottom">
			<th colspan="5" class="srNo text-left">Transaction Details</th>	  
		</tr>
		
		<tr style="vertical-align:top; padding-top:3px;">
			<td></td>
			<td class="text-left" style="padding: 19px;">
				<?php 
					$str = 'Invoice Number : <br>';
					if (isset($taxInvoiceData) && !empty($taxInvoiceData)) {
						foreach ($taxInvoiceData as $key => $value) {
							if ($value->record_type == 'invoice') {
								if (isset($value->invoiceNumber)&& !empty($value->invoiceNumber)) {
									$str .= ($key+1).' . '.$value->invoiceNumber.'<br>';
								}else
								{
									$str .= 'Invoice is not approved yet.'.'<br>';
								}
								
							}else if($value->record_type == 'quotation')
							{
								if (isset($value->invoiceNumber) && !empty($value->invoiceNumber)) {
									$str .= 'Quotation Number : '.$value->invoiceNumber.'<br>';
								}else
								{
									$str .= 'Quotation is not approved yet.'.'<br>';
								}
							}
						}
					}
					echo $str;
				?>
			</td>
			<td style="padding: 19px;">
				<?php 
					if (isset($receiptDetails[0]->payment_log_date) && !empty($receiptDetails[0]->payment_log_date)) {
						echo 'Payment Date : '.$receiptDetails[0]->payment_log_date.'<br>';
					}
					if (isset($receiptDetails[0]->transaction_id) && !empty($receiptDetails[0]->transaction_id)) {
						echo 'Transaction ID : '.$receiptDetails[0]->transaction_id.'<br>';
					}
					if (isset($receiptDetails[0]->paymentMode) && !empty($receiptDetails[0]->paymentMode)) {
						echo 'Payment Mode : '.$receiptDetails[0]->paymentMode.'<br>';
					}
					if (isset($receiptDetails[0]->payment_log_date) && !empty($receiptDetails[0]->payment_log_date)) {
						echo 'Note : '.$receiptDetails[0]->notes;
					}
				?>
			</td>
		</tr>
   </tbody>
</table>

<?php 
if ($receiptDetails[0]->show_history == 'yes') { 
	if (isset($invoiceHistory) && !empty($invoiceHistory)) { ?>
	<table id="transactionDetails" width="100%" style="border:1px solid black; border-collapse:collapse" class="items">
		<tbody>
		<tr class="borderBottom">
				<th colspan="6" class="srNo text-left">Invoice Payment History</th>	  
		</tr>
		<tr class="borderBottom">
			<th class=" text-left">Sr. No.</th>	  
			<th class="RHD text-left">Amount Received</th>
			<th class="RHD text-left">Pending Amount</th>
			<th class="RHD text-left">Date</th>
			<th class="RHD text-left">Transaction Id</th>
			<th class="RHD text-left">Mode</th>
		</tr>
		<?php 
			foreach ($invoiceHistory as $key => $value) { ?>
				<tr class="borderBottom" style="vertical-align:top; padding-top:3px;">
					<td class="text-left border-right">
						<?php echo $key+1; ?>
					</td>
					<td class="text-left border-right"> 
						<?php if(isset($value->amount) && !empty($value->amount)){  echo $value->amount; }?>
					</td>
					<td class="text-left border-right"> 
						<?php if(isset($value->pending_amount) && !empty($value->pending_amount)){  echo $value->pending_amount; }?>
					</td>
					<td class="text-left border-right">
						<?php if(isset($value->payment_log_date) && !empty($value->payment_log_date)){ echo $value->payment_log_date; }?>
					</td>
					<td class="border-right">
						<?php if(isset($value->transaction_id) && !empty($value->transaction_id)){ echo $value->transaction_id ; }?>
					</td>
					<td>
						<?php if(isset($value->paymentMode) && !empty($value->paymentMode)){ echo $value->paymentMode; }?>
					</td>
				</tr>
		<?php } ?>
		<tr>
			<td colspan="6">
				<b>Pending Amount :<b> <?php if(isset($receiptDetails[0]->pending_amount) && !empty($receiptDetails[0]->pending_amount)){ echo $receiptDetails[0]->pending_amount;}else{ echo '0';}?>
			</td>
		</tr>
	</tbody>
	</table>
	<?php } 
	}?>