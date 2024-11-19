<style type="text/css">
	body { 
	    font-family: serif; 
	    font-size: 8pt; 
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
</style>
<div style="padding-top: 105px;">
	<div style="float: left; width:50%;">
		<h1 align="left"><strong>INVOICE</strong></h1>
	</div>
	<div class="text-right" style="float: right;width:50%;">
		<img src="<?php echo $infoSettings[0]->invoice_logo;?>" style="width:150px;">
	</div>
</div>
<br>
<table width="100%" style="border:1px solid black;">
	<tbady>
		<tr>
			<td class="half">
				<table>
					<tr>
						<td>
							<h2><strong>Invoice No:</strong></td><td><?php echo $taxInvoiceData[0]->invoiceNumber; ?></h3>
						</td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td><h2><strong>Invoice Date:</strong></td><td><?php echo date("d F Y", strtotime($taxInvoiceData[0]->invoiceDate)); ?></h3></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbady>
</table>
<table width="100%" style="border:1px solid black;">
	<tbady>
		<tr>
			<td class="half" class="border-right">
				<table>
					<tr style="border:1px solid black;">
						<td><strong>Client Details</strong></td>
					</tr>
					<tr>
						<td><strong><?php echo $companyDetails[0]->first_name; ?></strong></td>
					</tr>
					<tr >
						<td><?php echo $companyDetails[0]->address; ?></td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table width="100%">
					<tr>
						<td><strong>Company Details</strong></td>
					</tr>
					<tr>
						<td><?php echo $infoSettings[0]->companyName; ?><br><?php echo $infoSettings[0]->company_address; ?></td>
					</tr>
					<tr>
						<td><strong>PAN :</strong><?php echo $infoSettings[0]->pan; ?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbady>
</table>
<table width="100%" style="border:1px solid black;" class="items">
	<tbody>
	<tr class="borderBottom">
      <th class="srNo text-left">SR No.</th>
      <th class="desc text-left">Description</th>
      <th class="qut text-left">Quantity</th>
      <th class="unit text-left">Unit</th>
      <th class="rate text-right">Rate</th>
      <th class="amt text-right">Amount</th>
    </tr>
<?php 
    foreach ($invoiceLineDetails as $key => $value) {
    ?>
    <tr class="borderBottom">
		<td class="srNo border-right"><?php echo $value->srNo; ?></td>
		<td class="type border-right text-left"><?php echo $value->invoiceLineNarr; ?></td>
		<td class="qut border-right text-left"><?php echo number_format($value->invoiceLineQty,2, '.', ''); ?></td>
		<td class="unit border-right text-left"><?php echo $value->invoiceLineUnit; ?></td>
		<td class="rate border-right text-right"><?php echo number_format($value->invoiceLineRate,2, '.', ''); ?></td>
		<td class="amt text-right"><?php echo number_format($value->invoiceLineAmount,2, '.', ''); ?></td>
    </tr>
    <?php } ?>
   </tbady>
</table>
<table width="100%" style="border:1px solid black;">
	<tbady>
		<tr>
			<td class="half">
				<table width="100%">
					<tr>
						<td><h5>Amount in words:</h5></td>
					</tr>
					<tr>
						<td><?php echo $this->CommonModel->num2words(round($taxInvoiceData[0]->grossAmount),"USD");?></td>
					</tr>
					<tr>
						<td><hr><h5>Bank Details:</h5></td>
					</tr>
					<tr>
						<td><strong>Bank Name:</strong> <?php echo $infoSettings[0]->bank_details; ?></td>
					</tr>
					<tr>
						<td><strong>Bank A/C No.:</strong> <?php echo $infoSettings[0]->bank_acc_no; ?></td>
					</tr>
					<tr>
						<td><strong>Bank IFSC:</strong> <?php echo $infoSettings[0]->ifsc_code; ?></td>
					</tr>
					<tr>
						<td><strong>SWIFT Code:</strong> <?php echo $infoSettings[0]->mcir_code; ?></td>
					</tr>
				</table>
			</td>
			<td style="vertical-align: top;" class="half border-left">
				<table width="100%">
					<tr  class="borderBottom">
						<td class="text-left"><strong>Sub Total:</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->invoiceTotal,2, '.', ''); ?></td>
					</tr>		
					<?php if($taxInvoiceData[0]->stateGstAmount !=0 && $taxInvoiceData[0]->stateGstAmount !=null){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>S-GST (<?php echo $taxInvoiceData[0]->stateGstPercent; ?>%):</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->stateGstAmount,2, '.', ''); ?></td>
					</tr>	
					<?php } ?>
					<?php if($taxInvoiceData[0]->centralGstAmount !=0 && $taxInvoiceData[0]->centralGstAmount !=null){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>C-GST (<?php echo $taxInvoiceData[0]->centralGstPercent; ?>%):</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->centralGstAmount,2, '.', ''); ?></td>
					</tr>	
					<?php } ?>
					<?php if($taxInvoiceData[0]->interGstAmount !=0 && $taxInvoiceData[0]->interGstAmount !=null){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>I-GST (<?php echo $taxInvoiceData[0]->interGstPercent; ?>%):</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->interGstAmount,2, '.', ''); ?></td>
					</tr>	
					<?php } ?>
					<?php if($taxInvoiceData[0]->roundOff !=0){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>Round Off:</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->roundOff,2, '.', ''); ?></td>
					</tr>		
					<?php } ?>
					<tr class="">
						<td class="text-left"><strong>Gross Total:</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->grossAmount,2, '.', ''); ?></td>
					</tr>	
					
				</table>
			</td>
		</tr>
	</tbady>
</table>
<table width="100%" style="border:1px solid black;">
	<tbady>
		<tr>
			<td>
				<strong>CHEQUE IN FAVOR OF(PAYABLE AT OR @ METRO LOCATIONS) <?php echo $infoSettings[0]->cheque_in_favour; ?></strong><br>
			</td>
		</tr>
		<tr>
			<td class="border-top">
				<strong>Terms and Conditions</strong>
			</td>
		</tr>
		<tr>
			<td>
				<?php echo $infoSettings[0]->termsConditions; ?>
			</td>
		</tr>
		<tr>
			<td align="right"><br>
				<strong>Authorized Signatory</strong>
			</td>
		</tr>
	</tbady>
</table>
