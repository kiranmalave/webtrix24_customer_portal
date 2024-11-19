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
			vertical-align:middle;
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
			vertical-align:middle;
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
		<h1 align="right"><strong>Delivery Challan</strong></h1>
	</div>
</div>
<br>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class=" half border-right">
				<table>
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
					<tr class="borderBottom" >
						<td class="border-right" style="font-size: 8pt; width:50%;"><strong>Delivery No : </strong><?php echo $taxInvoiceData[0]->invoiceNumber; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Dated:</strong><?php echo date("d F Y", strtotime($taxInvoiceData[0]->invoiceDate)); ?></td>
					</tr>
					<tr class="border-right borderBottom" >
						<td class="border-right" style="font-size: 8pt;width:50%;"><strong>Ref: Note : </strong><?php echo $taxInvoiceData[0]->ref_note; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Mode/Terms of Payment:</strong><?php echo $taxInvoiceData[0]->mode_or_terms_of_payment; ?></td>
					</tr>
					<tr class="border-right " >
						<td class="border-right" style="font-size: 8pt;width:50%;"><strong>Supplier's Ref : </strong><?php echo $taxInvoiceData[0]->supplier_ref; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Other Ref:</strong><?php echo $taxInvoiceData[0]->other_reference; ?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class=" half border-right">
				<table>
					<tr style="">
						<td><strong>To :</strong></td>
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
						<td class="half">State : <?php echo $taxInvoiceData[0]->customer_state; ?></td><td class="half"><?php if(isset($taxInvoiceData[0]->customer_mobile) && !empty($taxInvoiceData[0]->customer_mobile)) { ?><b>Mobile:</b><?php  $m = json_decode($taxInvoiceData[0]->customer_mobile);if(is_array($m)) { if(count($m) > 1){ echo "(".$m[0].") ".$m[1]; }}else{ echo ' '.$taxInvoiceData[0]->customer_mobile;}} ?></td>
					</tr>
				
				</table>
			</td>
			
			<td class="half" style="vertical-align:top" >
				<table width="100%" >
					<tr class="borderBottom" > 
						<td class="border-right"  style="font-size: 8pt;width:50%;"><strong>Buyer's Order No : </strong><?php echo $taxInvoiceData[0]->buyers_order_no; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Dated:</strong><?php if(isset($taxInvoiceData[0]->order_date)){ echo date("d F Y", strtotime($taxInvoiceData[0]->order_date)); }else{ echo " --- " ;} ?></td>
					</tr>
					<tr class="borderBottom" >
						<td class="border-right"  style="font-size: 8pt;width:50%;"><strong>Dispatch Doc No : </strong><?php echo $taxInvoiceData[0]->disapatch_doc_no; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Dated :</strong>  <?php if(isset($taxInvoiceData[0]->dispatch_date)){ echo date("d F Y", strtotime($taxInvoiceData[0]->dispatch_date)); }else{ echo " --- " ;} ?></td>
					</tr>
					<tr class="borderBottom">
						<td class="border-right" style="font-size: 8pt;width:50%;"><strong>Dispatch Through : </strong><?php echo $taxInvoiceData[0]->dispatch_through; ?></td>
						<td style="font-size: 8pt;width:50%;"><strong>Destination :</strong><?php echo $taxInvoiceData[0]->destination; ?></td>
					</tr>
					<tr>
						<td style="font-size: 8pt;"><strong>Terms of Delivery : </strong><?php echo $taxInvoiceData[0]->terms_of_delivery; ?></td>
					</tr>
				</table>
			</td>
		</tr>
	</tbody>
</table>
<table width="100%" style="border:1px solid black;border-collapse:collapse;" class="items">
	<tbody>
	<tr class="borderBottom">
      <th class="srNo text-left">SR No.</th>
      <th class="desc text-left">Description of Goods</th>
      <th class="qut text-left">Quantity</th>
    </tr>
<?php 
    foreach ($invoiceLineDetails as $key => $value) {?>
    <tr class="borderBottom">
		<td class="srNo border-right"><?php echo $key+1; ?></td>
		<td class="type border-right text-left"><?php echo $value->product_name;?></td>
		<td class="qut border-right text-center"><?php echo number_format($value->invoiceLineQty,0, '.', ''); ?></td>
    </tr>
    <?php } ?>
   </tbody>
</table>
<!-- <table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td class="half">
				<table width="100%">
		
				</table>
			</td>
			<td style="vertical-align: top;" class="half border-left">
				<table width="100%">
					<tr  class="borderBottom">
						<td class="text-left"><strong>Sub Total:</strong></td>
						<td class="text-right"><?php echo number_format($taxInvoiceData[0]->invoiceTotal,2, '.', ''); ?></td>
					</tr>							
				</table>
			</td>
		</tr>
	</tbody>
</table> -->
<table width="100%" style="border:1px solid black;">
	<tbody>
		<tr>
			<td style="width:35%;" class="border-right">
				<h4>Please rceive goods in good condition and return the challan duly signed<h3><br><br>
				<h4 style="text-align:center">(Receivers Name ,Date, Sign)<h3>
			</td>
			<td style="width:35%;text-align:center" class="border-right" >
				<h4>Delivery by</h4><br><br>
				<h4>(Name & Sign)<h3>
			</td>
			<td style="width:35%;text-align:center" class="border-right" >	
				<h4>For <?php echo $infoSettings[0]->companyName; ?> </h4><br><br>
				<h4>(Authorized Signatory)<h3>
			</td>
		</tr>
	</tbody>
</table>