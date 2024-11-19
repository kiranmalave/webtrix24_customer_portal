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
	.capitalize{
		text-transform:capitalize
	}
</style>
<table width="100%" style="border:1px solid black;border-collapse:collapse;" class="items">
	<tbody>
	<tr class="borderBottom">
		<?php foreach ($headers as $key => $value) { ?>
			<th class="srNo text-left border-right capitalize"><?php echo $value; ?></th>
		<?php }?>
    </tr>
<?php 
    foreach ($processDetails as $key => $value) {?>
		<tr class="borderBottom">
    	<?php 
			foreach ($value as $key1 => $value1) {?>
				<td class="border-right <?php if (isset($value1) && !str_contains($value1, '@')) {?> capitalize <?php } ?>">
					<?php (isset($value1) && !empty($value1)) ?  print($value1) :  print('-') ; ?>
				</td>
		<?php } ?>
		</tr>
    <?php } ?>
   </tbody>
</table>

