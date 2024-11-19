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

<div style="padding-top: 38px; margin: 10px;">
	<div class="text-left" style="float: left;width:30%;">
	<img class="logo" src="<?php
			if (!empty($infoSettings[0]->invoice_logo)) {
				echo $this->config->item('media_url') . "/" . $infoSettings[0]->invoice_logo;
			}
		?>">
	</div>
	<div style="float:right; width:30%;">
		<h1 align="right"><strong>Tax Receipt</strong></h1>
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
						<td style="font-size: 8pt;"><?php echo $taxInvoiceData[0]->invoiceNumber; ?></td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Date:</strong></td><td style="font-size: 8pt;"><?php echo date("d F Y", strtotime($taxInvoiceData[0]->invoiceDate)); ?></td>
					</tr>
				</table>
			</td>	
		</tr>
		<tr>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;" >
							<strong>PO No:</strong></td><td style="font-size: 8pt;"><?php echo $taxInvoiceData[0]->invoiceNumber; ?>
						</td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>PO Date:</strong></td><td style="font-size: 8pt;"><?php echo date("d F Y", strtotime($taxInvoiceData[0]->invoiceDate)); ?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
	
		<tr>
			<td class="half" class="border-right">
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
				<table width="100%">
				</table>
			</td>
		</tr>
	</tbody>
</table>

<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="half" class="border-right">
				<table>
					<tr style="border:1px solid black;">
						<td><strong>Bill To :</strong></td>
					</tr>
					<tr>
						<!-- replace with invoice_header details -->
						<td>Name : <strong><?php echo $taxInvoiceData[0]->customer_name; ?></strong></td> 
					</tr>
					<tr >
						<td>Address : <?php echo $taxInvoiceData[0]->customer_address; ?></td>
					</tr>
					<tr >
						<td>GSTN : <?php echo $taxInvoiceData[0]->customer_gst; ?></td>
					</tr>
					<tr >
						<td>State : <?php if(isset($taxInvoiceData[0]->customer_state) && !empty($taxInvoiceData[0]->customer_state)){ echo $taxInvoiceData[0]->customer_state;} ?></td><td>Mobile : <?php echo $taxInvoiceData[0]->customer_mobile; ?></td>
					</tr>
				
				</table>
			</td>
			
			<td class="half">

				<table>
					<tr style="border:1px solid black;">
						<td><strong>Shipping Details :</strong></td>
					</tr>
					<tr>
						<!-- replace with invoice_header details -->
						<td>Name : <strong><?php echo $companyDetails[0]->name; ?></strong></td> 
					</tr>
					<tr>
						<td>Address : <?php echo $companyDetails[0]->address; ?></td>
					</tr>
					<tr>
						<td>GSTN : <?php echo $companyDetails[0]->gst_no; ?></td>
					</tr>
					<tr>
						<td>State : <?php if(isset($taxInvoiceData[0]->customer_state) && !empty($taxInvoiceData[0]->customer_state)){ echo $taxInvoiceData[0]->customer_state;} ?></td><td>Mobile : <?php echo $companyDetails[0]->mobile_no; ?></td>
					</tr>
			
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;" class="items">
	<tbody>
	<tr class="borderBottom">
      <th class="srNo text-left">SR No.</th>
      <th class="desc text-left">Description</th>
      <th class="qut text-left">Quantity</th>
      <th class="unit text-left">Unit</th>
	  <th class="unit text-left">HSN</th>
	  <th class="unit text-left">UQC</th>
      <th class="rate text-left">Rate</th>
      <th class="rate text-left">Discount</th>
      <th class="tax text-left">Tax</th>
      <th class="amt text-left">Amount</th>
    </tr>
<?php 
    foreach ($invoiceLineDetails as $key => $value) {
    ?>
    <tr class="borderBottom">
		<td style="font-size:12pt;" class="srNo border-right"><?php echo $value->srNo; ?></td>	
		<td style="font-size:12pt;" class="type border-right text-left"><?php echo $value->product_name; ?></td>
		<td style="font-size:12pt;" class="qut border-right text-left"><?php echo number_format($value->invoiceLineQty,2, '.', ''); ?></td>
		<td style="font-size:12pt;" class="unit border-right text-left"><?php if($value->invoiceLineUnit > 0){echo $value->categoryName; }else{ echo '---'; }?></td>
		<td style="font-size:12pt;" class="hsn border-right text-left"><?php echo '---'; ?></td>
		<td style="font-size:12pt;" class="uqc border-right text-left"><?php echo '---'; ?></td>
		<td style="font-size:12pt; vertical-align: top;" class="rate border-right text-right">
			<table style="width: 100%;">
				<tbody>
					<tr>
						<td style="border:none;font-size :12pt;" class="text-right"><?php echo number_format($value->invoiceLineRate,2, '.', '');?></td>
					</tr>
				</tbody>
			</table>
		</td>
		<td style="font-size:12pt;" class="uqc border-right text-left">
			<?php if($value->discount != 0) {?>
				<?php
					 if ($value->discount_type == 'amt') {
						echo (number_format(($value->invoiceLineRate - $value->discount ),2, '.', '') * number_format($value->invoiceLineQty,2, '.', '')).'<br>'; echo '('.$value->discount." amt".')'; 
					 }else
					 {
						echo (number_format(( $value->invoiceLineRate * ($value->discount / 100) ),2, '.', '') * number_format($value->invoiceLineQty,2, '.', '')).'<br>'; echo '('.$value->discount."%".')'; 
					 }
				}else{
					echo '---';
				}	?>	
		</td>
		<td style="font-size:12pt;" class="uqc border-right text-left">
			<?php if($value->igst_amt != 0) {
				if ($value->is_gst == 'y') {
					echo (number_format($value->invoiceLineQty,2, '.', '') * number_format($value->igst_amt,2, '.', '')).'<br>'; echo '('.$value->igst."%".')'.'<br>'; echo 'With gst';
				}else
				{
					echo (number_format($value->invoiceLineQty,2, '.', '') * number_format($value->igst_amt,2, '.', '')).'<br>'; echo '('.$value->igst."%".')'.'<br>'; echo 'Without gst'; 
				}
			}
		?>	
		</td>
		<td class="amt text-right" style='vertical-align: top;'>	
			<table>
				<tbody>
					<tr>
						<td  style="border:none;font-size:12pt;" class="text-right" ><?php echo number_format($value->invoiceLineAmount,2, '.', ''); ?></td>
					</tr>
				</tbody>
			</table>
		</td>
    </tr>
    <?php } ?>
   </tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="half">
				<table width="100%">
					<tr>
						<td style=""><h5>Amount in words:</h5></td>
					</tr>
					<tr>
						<td><?php echo $this->CommonModel->num2words(($taxInvoiceData[0]->grossAmount), "INR"); ?></td>
					</tr>
					<tr>
						<td><hr><h5>Bank Details:</h5></td>
					</tr>
					<tr>
						<td style="font-size: 10pt;"><strong>Bank Name: </strong><?php echo $infoSettings[0]->bank_details; ?></td>
					</tr>
					<tr>
						<td style="font-size: 10pt;"><strong>Bank A/C No.:</strong> <?php echo $infoSettings[0]->bank_acc_no; ?></td>
					</tr>
					<tr>
						<td style="font-size: 10pt;"><strong>Bank IFSC: </strong> <?php echo $infoSettings[0]->ifsc_code; ?></td>
					</tr>
					<tr>
						<td style="font-size: 10pt;"><strong>SWIFT Code: </strong> <?php echo $infoSettings[0]->mcir_code; ?></td>
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
						<td class="text-left"><strong>S-GST :</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->stateGstAmount,2, '.', ''); ?></td>
					</tr>	
					<?php } ?>
					<?php if($taxInvoiceData[0]->centralGstAmount !=0 && $taxInvoiceData[0]->centralGstAmount !=null){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>C-GST :</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->centralGstAmount,2, '.', ''); ?></td>
					</tr>	
					<?php } ?>
					<?php if($taxInvoiceData[0]->interGstAmount !=0 && $taxInvoiceData[0]->interGstAmount !=null){?>
					<tr class="borderBottom">
						<td class="text-left"><strong>I-GST :</strong></td>
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
	</tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td>
				<strong>CHEQUE IN FAVOR OF(PAYABLE AT OR @ METRO LOCATIONS) <?php echo $infoSettings[0]->cheque_in_favour; ?></strong><br>
			</td>
		</tr>
		<tr>
			<td class="border-top">
				<strong	>Terms and Conditions</strong>
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
	</tbody>
</table>
