<style type="text/css">
	body { 
	    	font-family: serif; 
		font-size: 8pt;
		color:#343434;
		border-collapse:collapse;
	}
	.logo {
		width: 100px;
		height: 60px;
		object-fit: contain;
		margin-bottom: 8px;
	}
	.text-color{
		color:#343434;
	}
	
	table {
		border-spacing: 0;
		overflow: wrap;
		min-width: 100%;
	}
	table tr td {margin:0px;}
	.half{
		width: 50%;
	}
	.border-top{
		border-top-style:solid ;
		border-top-color:#343434 ;
		border-top-width:1px;
	}
	.border-right{
		border-right-style:solid;
		border-right-width:1px;
		border-right-color:#343434 ;
	}
	.border-bottom{
		border-bottom-style:solid;
		border-bottom-width:1px;
		border-bottom-color:#343434 ;
	}
	.border-left{
		border-left-style:solid;
		border-left-width:1px;
		border-left-color:#343434 ;
	}
	.borderAll td,.borderAll th{
		border-style:solid;
		border-width:1px;
		border-color:#343434 ;
	}
	.borderBottom td,.borderBottom th{
		border-bottom-style:solid;border-bottom-width:1px;
		border-top-style:solid ;
		border-top-color:#343434 ;
		border-top-width:1px;
	}
	.border-right{
		border-right-style:solid;
		border-right-width:1px;
		border-right-color:#343434 ;
	}
	.border-bottom{
		border-bottom-style:solid;
		border-bottom-width:1px;
		border-bottom-color:#343434 ;
	}
	.border-left{
		border-left-style:solid;
		border-left-width:1px;
		border-left-color:#343434 ;
	}
	.borderAll td,.borderAll th{
		border-style:solid;
		border-width:1px;
		border-color:#343434 ;
	}
	.borderBottom td,.borderBottom th{
		border-bottom-style:solid;
		border-bottom-width:1px;
		border-bottom-color:#343434 ;
		padding:4px;
	}
	.font-6{
		font-size: 7pt;
	}
	.srNo{
		vertical-align:middle;text-align:center;
	}
	.type{
		
		vertical-align:middle;
	}
  	.qut{
			
			vertical-align:middle;
  	}
  	.unit{
			
			vertical-align:middle;
  	}
	.hsn{
		
		vertical-align:middle;
  	}
	.uqc{
		
		vertical-align:middle;
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
  	.border{
		border:1px solid #343434;
	}
	.border-none{
		border: none;
	}
	.border-bottom-none{
		border-bottom: none;
	}
	
</style>

<div style="padding-top: 10px;">
	<div style="float:left; width:30%;">
		<h1 align="left"><strong>Quotation</strong></h1>
	</div>
	<div class="text-right" style="float: right;width:30%;">
	<img class="logo" src="<?php
			if (!empty($infoSettings[0]->invoice_logo)) {
				echo $this->config->item('media_url') . "/" . $infoSettings[0]->invoice_logo;
			}
		?>">
	</div>
</div>
<table width="100%" style="border">
	<tbody>
		<tr>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Quotation No:</strong></td>
						<td style="font-size: 8pt;"><?php echo $taxInvoiceData[0]->invoiceNumber; ?></td>
					</tr>
				</table>
			</td>
			<td class="half">
				<table>
					<tr>
						<td style="font-size: 8pt;"><strong>Quotation Date:</strong></td><td style="font-size: 8pt;"><?php echo date("d F Y", strtotime($taxInvoiceData[0]->invoiceDate)); ?></td>
					</tr>
				</table>
			</td>	
		</tr>
	
	</tbody>
</table>
<table width="100%" class="border" style="vertical-align: top;border-spacing: 0;">
	<tbody>
		<tr>
			<td class="half" class="border-right">
				<table>
					<tr style="">
						<td><strong>Office Address:</strong></td>
					</tr>
					<tr>
						<td col-span="2"><strong><?php echo $infoSettings[0]->companyName; ?></strong></td>
					</tr>
					<tr>
						<td col-span="2"><?php echo $infoSettings[0]->company_address; ?></td>
					</tr>
					<tr>
					<td class="half"><strong>PAN No.</strong>:<?php echo $infoSettings[0]->pan;?></td>
					<td class="half"><strong>GSTIN</strong>:<?php echo $infoSettings[0]->gst_no;?></h3></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<?php 
	// print_r('<pre>');
	// print_r($invoiceLineDetails);
?>
<table width="100%" class="border">
	<tbody>
		<tr>
			<td class="half" class="border-right">
				<table>
					<tr>
						<td><strong>Bill To :</strong></td>
					</tr>
					<tr>
						<!-- replace with invoice_header details -->
						<td><strong><?php echo $taxInvoiceData[0]->customer_name; ?></strong></td> 
					</tr>
					<tr>
						<td><?php echo $taxInvoiceData[0]->customer_address; ?></td>
					</tr>
					<tr>
						<td><b>GSTN: </b><?php echo $taxInvoiceData[0]->customer_gst; ?></td>
					</tr>
					<tr>
						<td><b>State:</b><?php if(isset($taxInvoiceData[0]->customer_state) && !empty($taxInvoiceData[0]->customer_state)){ echo $taxInvoiceData[0]->customer_state."(".$taxInvoiceData[0]->gst_state_code.")";} ?></td>
					</tr>
					<tr>
						<td><?php if(isset($taxInvoiceData[0]->customer_mobile) && !empty($taxInvoiceData[0]->customer_mobile)) { ?><b>Mobile:</b>
							<?php  $m = json_decode($taxInvoiceData[0]->customer_mobile);if (is_array($m)) {  if(count($m) > 1){ echo "(".$m[0].") ".$m[1]; }}else{ echo $taxInvoiceData[0]->customer_mobile;}} ?>
							</td>
					</tr>
				</table>
			</td>
			
			<td class="half" style="vertical-align: top;">
			<?php if($taxInvoiceData[0]->is_shipping == 'yes'){ ?>
				<table>
					<tr>
						<td><strong>Shipping Details :</strong></td>
					</tr>
					<tr>
						<td><strong><?php echo $taxInvoiceData[0]->customer_name; ?></strong></td> 
					</tr>
					<?php 
						if($taxInvoiceData[0]->ship_to == "no"){
							if (isset($taxInvoiceData[0]->shipping_address) && !empty($taxInvoiceData[0]->shipping_address)) {
								$shippingAdd = json_decode($taxInvoiceData[0]->shipping_address,true); ?>
								<tr><td><?php if (isset($shippingAdd['address'])) echo $shippingAdd['address']; ?></td></tr>
								<tr><td><b>Zip Code : </b><?php if (isset($shippingAdd['zipcode']))  echo $shippingAdd['zipcode']; ?></td></tr>
								<tr><td><b>GSTN : </b><?php echo $taxInvoiceData[0]->customer_gst; ?></td></tr>
								<tr><td><b>State : </b><?php if(isset($taxInvoiceData[0]->customer_state) && !empty($taxInvoiceData[0]->customer_state)){ echo $taxInvoiceData[0]->customer_state."(".$taxInvoiceData[0]->gst_state_code.")";} ?></td></tr>
								<tr><td><b>Mobile : </b><?php if (isset($shippingAdd) && isset($shippingAdd['mobile_no'])) echo $shippingAdd['mobile_no']; ?></td></tr>
							<?php } ?>
						<?php }else{ ?>
							<tr><td><?php  echo $taxInvoiceData[0]->customer_address; ?></td></tr>
							<tr><td><b>GSTN : </b><?php echo $taxInvoiceData[0]->customer_gst; ?></td></tr>
							<tr><td><b>State : </b><?php if(isset($taxInvoiceData[0]->customer_state) && !empty($taxInvoiceData[0]->customer_state)){ echo $taxInvoiceData[0]->customer_state."(".$taxInvoiceData[0]->gst_state_code.")";} ?></td></tr>
							<tr><td><?php if(isset($taxInvoiceData[0]->customer_mobile) && !empty($taxInvoiceData[0]->customer_mobile)) { ?><b>Mobile:</b><?php  $m = json_decode($taxInvoiceData[0]->customer_mobile);if (is_array($m)) { if(count($m) > 1){ echo "(".$m[0].") ".$m[1]; }}else{ echo ' '.$taxInvoiceData[0]->customer_mobile;}} ?></td></tr>
						<?php } ?>
					
				</table>
				<?php } ?>
				
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" class="items border">
	<tbody>
	<tr class="borderBottom">
		<th style="width:5%;" class="srNo text-center font-6">No.</th>
		<th style="width:20%;" class="desc text-left font-6">Description</th>
		<?php if ($taxInvoiceData[0]->is_gst_billing == 'yes') { ?>
			<th style="width:5%;" class="unit text-left font-6">HSN</th>
			<th style="width:5%;" class="unit text-left font-6">UQC</th>
		<?php } ?>
		<th style="width:5%;" class="qut text-right font-6">Quantity</th>
		<th style="width:5%;" class="unit text-right font-6">Unit</th>
		<th style="width:10%;" class="rate text-right font-6">Rate</th>
		<th style="width:10%;" class="rate text-right font-6">Discount</th>
		<th style="width:10%;" class="rate text-right font-6">Total</th>
      		<?php if ($taxInvoiceData[0]->is_gst_billing == 'yes') { 
			if($taxInvoiceData[0]->state_id != $taxInvoiceData[0]->customer_state_id) { ?>
				<th style="width:10%;" class="tax text-right">IGST</th> 
			<?php }else{ ?>
				<th style="width:10%;" class="tax text-right font-6">CGST</th>
				<th style="width:10%;" class="tax text-right font-6">SGST</th> 
			<?php } ?>
		<?php } ?>
      	<th style="width:15%;" class="amt text-right font-6">Amount</th>
    </tr>
<?php 
    foreach ($invoiceLineDetails as $key => $value) {
    ?>
    <tr class="borderBottom">
		<td  class="srNo border-right"><?php echo $value->srNo; ?></td>	
		<td  class="type border-right text-left"><?php echo $value->product_name; ?></td>
		<?php if ($taxInvoiceData[0]->is_gst_billing == 'yes') { ?>
			<td  class="hsn border-right text-left"><?php echo '---'; ?></td>
			<td  class="uqc border-right text-left"><?php echo '---'; ?></td>
		<?php } ?>
		<td  class="qut border-right text-right"><?php echo $value->invoiceLineQty; ?></td>
		<td  class="unit border-right text-right"><?php if($value->invoiceLineUnit > 0){echo $value->categoryName; }else{ echo '---'; }?></td>
		<!-- RATE -->
		<td  class="rate border-right text-right">
			<table style="width: 100%;">
				<tbody>
					<tr>
						<td style="border:none;" class="text-right">
						<?php 
							$newRate = 0;
							// if ($value->is_gst == 'y') {
								// $newRate = $value->invoiceLineRate - ($value->igst_amt / $value->invoiceLineQty);
								// echo (number_format($newRate,2, '.', '')).'<br>';
							// }else
							// {
								$newRate = $value->invoiceLineRate;
								echo number_format($newRate,2, '.', '');
							// }
								$value->newRate = $newRate ;
						?></td>
					</tr>
				</tbody>
			</table>
		</td>
		<!-- DISCOUNT -->
		<td  class="uqc border-right text-right">
		<?php 
			$disAmt = 0 ;
			if($value->discount != 0) {
				if ($value->discount_type == 'amt') {
					$disAmt = $value->discount;
					echo $disAmt." (Amt) "; 
				}else{
					$disAmt = $value->invoiceLineRate * ($value->discount / 100);
					echo (number_format($disAmt,2, '.', '').'<br>'); echo '('.$value->discount."%".')'; 
				}
			}else{
				echo '0.00';
			}	
			$value->disAmt = $disAmt * $value->invoiceLineQty;
		?>	
		</td>
		<!-- TOTAL -->
		<td class="text-right border-right">
			<?php 
				$aggAmt = 0;
				// if ($value->is_gst == 'y') {
				// 	$aggAmt = $value->invoiceLineAmount;
				// 	echo number_format(($value->invoiceLineAmount),2, '.', ''); 
				// }else{
				$aggAmt = $value->invoiceLineAmount-$value->igst_amt;
				echo number_format(($value->invoiceLineAmount-$value->igst_amt),2, '.', ''); 
				// }
				$value->aggAmt = $aggAmt;
			?>
		</td>
		<!-- GST -->
		<?php if ($taxInvoiceData[0]->is_gst_billing == 'yes') { 
			if($taxInvoiceData[0]->state_id != $taxInvoiceData[0]->customer_state_id) { ?>
				<td class="text-right border-right"><?php echo number_format($value->igst_amt,2, '.', ''); ?></td>
			<?php }else{?>
				<td class="text-right border-right"><?php echo number_format($value->cgst_amt,2, '.', ''); ?></td>
				<td class="text-right border-right"><?php echo number_format($value->sgst_amt,2, '.', ''); ?></td>
			<?php } ?>
		<?php } ?>

		<td class="amt text-right" style='vertical-align: top;'>	
			<table>
				<tbody>
					<tr>
						<td class="text-right border-none" style="border:none" ><?php 
							$invoiceTot = 0 ;
							// if($value->is_gst == 'y'){
								// $invoiceTot = $value->invoiceLineAmount + $value->igst_amt;
								// print number_format(($value->invoiceLineAmount + $value->igst_amt),2, '.', '') ;
							// }else{
							$invoiceTot = $value->invoiceLineAmount;
							print number_format(($value->invoiceLineAmount),2, '.', '');
							// }
							$value->invoiceTot = $invoiceTot;
							
						?></td>
					</tr>
				</tbody>
			</table>
		</td>
    </tr>
    <?php } ?>
	<tr>
		<?php ($taxInvoiceData[0]->is_gst_billing == 'yes') ? $colsp = '4' : $colsp = '2' ; ?>
		<td colspan='<?php echo $colsp ;?>' class="border-right text-right" style='vertical-align: top;'></td>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"invoiceLineQty")),0, '.', ''); ?></td>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo '---'; ?></td>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"newRate")),2, '.', ''); ?></td>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"disAmt")),2, '.', ''); ?></td>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"aggAmt")),2, '.', ''); ?></td>
		<?php if ($taxInvoiceData[0]->is_gst_billing == 'yes') { 
			if($taxInvoiceData[0]->state_id != $taxInvoiceData[0]->customer_state_id) { ?>
				<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"igst_amt")),2, '.', ''); ?></td>
			<?php }else{ ?>
				<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"cgst_amt")),2, '.', ''); ?></td>
				<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"sgst_amt")),2, '.', ''); ?></td>
			<?php } 
		} ?>
		<td class="border-right text-right" style='vertical-align: top;'><?php echo number_format(array_sum(array_column($invoiceLineDetails,"invoiceTot")),2, '.', ''); ?></td>
	</tr>
   </tbody>
</table>
<table width="100%" class="border border-bottom-none" >
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
						<td><b>Bank Name: </b><?php echo $infoSettings[0]->bank_details; ?></td>
					</tr>
					<tr>
						<td ><b>Bank A/C No.:</b> <?php echo $infoSettings[0]->bank_acc_no; ?></td>
					</tr>
					<tr>
						<td ><b>Bank IFSC: </b> <?php echo $infoSettings[0]->ifsc_code; ?></td>
					</tr>
					<tr>
						<td ><b>SWIFT Code: </b> <?php echo $infoSettings[0]->mcir_code; ?></td>
					</tr>
				</table>
			</td>
			<?php 
				$addnlAmt = 0 ;
				$addCharge = json_decode($taxInvoiceData[0]->additional_char,true);
				
				foreach ($addCharge as $key => $value) {
					$tgst = $value['rate'] + ( $value['rate'] * ( $value['gst'] / 100) );
					$value['gstAmt'] = $tgst;
					$addnlAmt += $tgst;
				}
				
			?>
			<td style="vertical-align: top;" class="half border-left">
				<table width="100%">
					<?php 
						if (isset($addCharge) && !empty($addCharge)) { ?>
							<tr>
								<td class="" colspan ="2" ><strong>Additional Charges :</strong></td>
							</tr>		
							<?php 
								foreach($addCharge as $key => $value) { ?>
									<tr class="borderBottom" >
										<td class="text-left"><strong><?php echo $value['title'].'' ;?></strong></td>
										<td class="text-right"><?php
											if ($taxInvoiceData[0]->is_gst_billing == 'yes') 
												$tgst = $value['rate'] + ( $value['rate'] * ( $value['gst'] / 100) );
											else
												$tgst = $value['rate'];

											echo number_format(($tgst),2, '.', '') ;?></td>
									</tr>	
								<?php } ?>
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
<table width="100%" class='border' style="margin-bottom: 20px;">
	<tbody>
		<tr>
			<td>
				CHEQUE IN FAVOR OF(PAYABLE AT OR @ METRO LOCATIONS) <?php echo $infoSettings[0]->cheque_in_favour; ?><br>
			</td>
		</tr>
		<tr>
			<td class="border-top">
				<strong >Terms and Conditions</strong>
			</td>
		</tr>
		<tr>
			<td class="text-color" >
				<?php echo $taxInvoiceData[0]->terms; ?>
			</td>
		</tr>
		<tr>
			<td align="right"><br>
				<strong>Authorized Signatory</strong>
			</td>
		</tr>
	</tbody>
</table>

<?php if($infoSettings[0]->is_display_payment == 'yes'){ 
	if (isset($paymentDetails) && !empty($paymentDetails)) {?>
	<table width="100%" style="margin-top :100px" class="items border">
		<tbody>
			<tr class="borderBottom">
				<th style="width:5%;" class="srNo text-center font-6">Receipt ID.</th>
				<th style="width:8%;" class="srNo text-left">Receipt Number.</th>
				<th style="width:20%;" class="desc text-left">Transaction ID</th>
				<th style="width:7%;" class="unit text-left">Payment Mode</th>
				<th style="width:9%;" class="qut text-left">Payment Date</th>
				<th style="width:8%;" class="unit text-left">Amount</th>
				<th style="width:8%;" class="unit text-left">Pending Amount</th>
			</tr>
		<?php 
			foreach ($paymentDetails as $key => $value) { ?>
			<tr class="borderBottom">
				<td  class="srNo border-right"><?php echo $value->receipt_id; ?></td>	
				<td  class="srNo border-right"><?php echo $value->receipt_number; ?></td>	
				<td  class="type border-right text-left"><?php echo $value->transaction_id; ?></td>
				<td  class="unit border-right text-left"><?php echo $value->paymentMode; ?></td>
				<td  class="qut border-right text-right"><?php echo date("d-m-Y", strtotime($value->payment_log_date)); ?></td>
				<td  class="hsn border-right text-right"><?php echo $value->amount; ?></td>
				<td  class="hsn border-right text-right"><?php echo $value->pending_amount; ?></td>
			</tr>
		<?php } ?>
		</tbody>
	</table>
<?php } } ?>