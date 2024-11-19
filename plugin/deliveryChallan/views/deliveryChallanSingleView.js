define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'typeahead',
  'icheck',
  'select2',
  'moment',
  //'../../company/collections/companyCollection',
  '../../core/views/multiselectOptions',
  '../../customer/collections/customerCollection',
  '../models/singleDeliveryChallanModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/invoiceItems',
  'text!../templates/deliveryChallanSingle_temp.html',
  '../../customer/views/customerSingleView',
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment, multiselectOptions, customerCollection, singleDeliveryChallanModel, dynamicFieldRender, invoiceItems, deliveryChallanSingle_temp,customerSingleView) {

  var deliveryChallanSingleView = Backbone.View.extend({
    model: singleDeliveryChallanModel,
    form_label:'',
    s_state : 'false',
    menuName : '' ,
    customerList : new customerCollection() ,
    initialize: function (options) {
      this.dynamicData = null;
      this.toClose = "deliveryChallanSingleView";
      
      this.form_label = options.form_label;
      $('#taxInvoiceData').remove();
    
      this.menuId = options.menuId;
      this.menuName = options.menuName;
      var selfobj = this;
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      // var companyList = new companyCollection();
      invoiceItemsDetails = new invoiceItems();
      this.getnarration();
      this.model = new singleDeliveryChallanModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      // this.customerList = new customerCollection();
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      this.model.set({ year: moment().year(), reportYear: moment().year() });
      this.refreshCust();
      if (options.invoiceID != "" && options.invoiceID != null) {
        this.model.set({ invoiceID: options.invoiceID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set({ menuId: selfobj.menuId});
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
          selfobj.getinfoSetting();
          selfobj.setValues();
        });
      } else {
        selfobj.getinfoSetting();
        selfobj.dynamicFieldRenderobj.prepareForm();
        selfobj.render();
        $(".popupLoader").hide();
      }
    },
    events:
    {
      "click .saveTaxInvoiceDetails": "saveTaxInvoiceDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .multiSel": "setValues",
      "blur .amtChange": "rowTotal",
      "click #addRow": "addemptyRow",
      "click .del-row": "delRow",
      "click .del-all-row": "delAllRows",
      "change .updateAmt": "rowTotal",
      "change .setnarr": "setnarration",
      "click .selectProduct": "setProduct",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",


    },
    refreshCust : function(){
      this.customerList.fetch({
        headers:
        {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active',getAll : 'Y'}
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
      });
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveTaxInvoiceDetails', this.saveTaxInvoiceDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveTaxInvoiceDetails', this.saveTaxInvoiceDetails.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.amtChange', this.rowTotal);
      this.$el.on('blur', '.amtChange', this.rowTotal.bind(this));
      this.$el.off('click', '#addRow', this.addemptyRow);
      this.$el.on('click', '#addRow', this.addemptyRow.bind(this));
      this.$el.off('click', '.del-row', this.delRow);
      this.$el.on('click', '.del-row', this.delRow.bind(this));
      this.$el.off('click', '.del-all-row', this.delAllRows);
      this.$el.on('click', '.del-all-row', this.delAllRows.bind(this));
      this.$el.off('change', '.updateAmt', this.rowTotal);
      this.$el.on('change', '.updateAmt', this.rowTotal.bind(this));
      this.$el.off('change', '.setnarr', this.setnarration);
      this.$el.on('change', '.setnarr', this.setnarration.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('click', '.singleSelectOpt', this.selectOnlyThis);
      this.$el.on('click', '.singleSelectOpt', this.selectOnlyThis.bind(this));
      this.$el.off('input', '.pdChange', this.getProducts);
      this.$el.on('input', '.pdChange', this.getProducts.bind(this));
      this.$el.off('click', '.selectProduct', this.setProduct);
      this.$el.on('click', '.selectProduct', this.setProduct.bind(this));
      
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
   
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lasts = lastID.split("-");
      var lastDetails = parseInt(lasts[1]);
      var sel = '<div class="col-md-12"><div class="form-group form-float"><div class="form-line taskDate"><input id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+(lastDetails + 1)+'" class="dropdown-content custDrop" style="display: none;"></div></div>';
      // var sel = '<select id="narr_' + (lastDetails + 1) + '" name="narr_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr"><option value="">Type</option>';
      // $.each(this.model.get("narrList"), function (key, val) {
      //   sel = sel + '<option data-subtext="'+val.model_name+'/'+val.processor+'/'+val.generation+'/'+val.os+'/'+val.memory+'"  value="' + val.product_id + '">' + val.product_name + '</option>';
      // }); sel = sel + '</select>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> <div class="accessories" > <input type="checkbox" name="usb_mouse_' + (lastDetails + 1) + '" id="usb_mouse_' + (lastDetails + 1) + '" class="assc" ><span class="" >USB Mouse</span></div><div class="accessories" ><input type="checkbox" name="usb_keyboard_' + (lastDetails + 1) + '" id="usb_keyboard_' + (lastDetails + 1) + '" class=" assc"><span   class="" >USB Keyboard</span></div> <div class="accessories" ><input type="checkbox" name="laptop_backpack_' + (lastDetails + 1) + '" id="laptop_backpack_' + (lastDetails + 1) + '" class="assc" ><span   class="" >Laptop Backpack</span></div> <div class="accessories" ><input type="checkbox" name="wifi_adapter_' + (lastDetails + 1) + '" id="wifi_adapter_' + (lastDetails + 1) + '" class="assc" ><span class="" > Wifi Adapter</span></div> <div class="accessories" ><input type="checkbox" name="display_connector_' + (lastDetails + 1) + '" id="display_connector_' + (lastDetails + 1) + '" class="assc"><span class="" >Display Connector</span></div>  <div class="accessories" ><input type="checkbox" name="usb_c_type_connector_' + (lastDetails + 1) + '" id="usb_c_type_connector_' + (lastDetails + 1) + '" class="assc" ><span  class="" >USB & C Type Connector</span></div> <div class="accessories" ><input type="checkbox" name="hdmi_cable_' + (lastDetails + 1) + '" id="hdmi_cable_' + (lastDetails + 1) + '" class="assc"  ><span class="" >HDMI Cable</span></div> <div class="accessories" ><input type="checkbox" name="charger_' + (lastDetails + 1) + '" id="charger_' + (lastDetails + 1) + '" class="assc" ><span class="" >Charger</span></div> <input type="text" name="serial_no_' + (lastDetails + 1) + '" id="serial_no_' + (lastDetails + 1) + '" class="form-control" value="" placeholder="Charger Serial No"> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="checkbox" style="display: none;" name="apply_taxes_' + (lastDetails + 1) + '" id="apply_taxes_' + (lastDetails + 1) + '" class=" apply_tax-check updateAmt" ><span  style="display: none;" class="apply_tax-check" >Apply taxes</span> </td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><i class="material-icons" aria-hidden="true">delete_forever</i></button></td></tr>';
      $(".items-holder").append(temprow);
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      
      this.reArrangeIndex();
      this.updateTaxBox();
      $('.ws-select').selectpicker();
    },
    addRow: function (e) {
      
      e.preventDefault();
      var lastDetails = 1;

      var sel = '<div class="col-md-12"><div class="form-group form-float"><div class="form-line taskDate"><input id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+lastDetails+'" class="dropdown-content custDrop" style="display: none;"></div></div>';

      // var sel = '<select id="narr_' + (lastDetails + 1) + '" name="narr_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr"><option value="">Type</option>';
      
      // $.each(this.model.get("narrList"), function (key, val) {
      //   sel = sel + '<option data-subtext="'+val.model_name+'/'+val.processor+'/'+val.generation+'/'+val.os+'/'+val.memory+'" value="' + val.product_id + '">' + val.product_name + '</option>';
      // }); sel = sel + '</select>';
       var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> <div class="accessories" > <input type="checkbox" name="usb_mouse_' + (lastDetails + 1) + '" id="usb_mouse_' + (lastDetails + 1) + '" class="assc" ><span class="" >USB Mouse</span></div><div class="accessories" ><input type="checkbox" name="usb_keyboard_' + (lastDetails + 1) + '" id="usb_keyboard_' + (lastDetails + 1) + '" class=" assc"><span   class="" >USB Keyboard</span></div> <div class="accessories" ><input type="checkbox" name="laptop_backpack_' + (lastDetails + 1) + '" id="laptop_backpack_' + (lastDetails + 1) + '" class="assc" ><span   class="" >Laptop Backpack</span></div> <div class="accessories" ><input type="checkbox" name="wifi_adapter_' + (lastDetails + 1) + '" id="wifi_adapter_' + (lastDetails + 1) + '" class="assc" ><span class="" > Wifi Adapter</span></div> <div class="accessories" ><input type="checkbox" name="display_connector_' + (lastDetails + 1) + '" id="display_connector_' + (lastDetails + 1) + '" class="assc"><span class="" >Display Connector</span></div>  <div class="accessories" ><input type="checkbox" name="usb_c_type_connector_' + (lastDetails + 1) + '" id="usb_c_type_connector_' + (lastDetails + 1) + '" class="assc" ><span  class="" >USB & C Type Connector</span></div> <div class="accessories" ><input type="checkbox" name="hdmi_cable_' + (lastDetails + 1) + '" id="hdmi_cable_' + (lastDetails + 1) + '" class="assc"  ><span class="" >HDMI Cable</span></div> <div class="accessories" ><input type="checkbox" name="charger_' + (lastDetails + 1) + '" id="charger_' + (lastDetails + 1) + '" class="assc" ><span class="" >Charger</span></div> <input type="text" name="serial_no_' + (lastDetails + 1) + '" id="serial_no_' + (lastDetails + 1) + '" class="form-control" value="" placeholder="Charger Serial No"> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="checkbox" style="display: none;" name="apply_taxes_' + (lastDetails + 1) + '" id="apply_taxes_' + (lastDetails + 1) + '" class=" apply_tax-check updateAmt" ><span  style="display: none;" class="apply_tax-check" >Apply taxes</span> </td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value="0"> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><i class="material-icons" aria-hidden="true">delete_forever</i></button></td></tr>';
      $(".items-holder").append(temprow);
      setTimeout(function () {
        var di = "itemName_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      
      this.reArrangeIndex();
      this.updateTaxBox();
      $('.ws-select').selectpicker();
    },
    getnarration: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'getNarration',
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.flag == "S") {
            selfobj.model.set({ "narrList": res.data });
            selfobj.render();
          }
        }
      });
    },
    getinfoSetting: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'infoSettingsList/1',
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.flag == "S") {
            selfobj.model.set({ "stateGstPercent": res.data[0].stateGst });
            selfobj.model.set({ "centralGstPercent": res.data[0].centralGst });
            selfobj.model.set({ "interGstPercent": res.data[0].interGst });
            selfobj.model.set({ "state_id": res.data[0].state_id });
            selfobj.render();
          }
        }
      });
    },
    setnarration: function (product_id, last) {
      
      var nlist = selfobj.model.get("narrList");
      $.each(nlist, function (key, value) {
        if (product_id == value.product_id) {
          
          $("#itemName_" + last).val(value.product_description);
          // $("#itemQuantity_" + tid[1]).val(value.quantity);
          console.log(value.product_description);
        }
        // console.log($("#itemName_" + tid[1]).val());
      });
      // $('.accessories').show();
    },
    rowTotal: function (e) {
      selfobj = this; 
      var issgst = $('#issgst').is(":checked");
      var iscgst = $('#iscgst').is(":checked");
      var isigst = $('#isigst').is(":checked");
      var subtotal = 0;
      var sgst = 0;
      var cgst = 0;
      var igst = 0;
      var round = 0;
      var GrossTotal = 0;
      var infoSGST = this.model.get("stateGstPercent");
      var infoCGST = this.model.get("centralGstPercent");
      var infoIGST = this.model.get("interGstPercent");
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        // console.log(sgst);
        if($('#apply_taxes_'+lastDetails).is(":checked")) /*'$(#apply_taxes_'+lastDetails).is(":checked")*/
        {
          var rsgst = 0 ;
          var rcgst = 0 ;
          var rigst = 0 ; 
          var SGST = $('#stateGstPercent_'+lastDetails).val();
          var CGST = $('#centralGstPercent_'+lastDetails).val();
          var IGST = $('#interGstPercent_'+lastDetails).val();
          rowtotal = (parseFloat($("#itemQuantity_" + lastDetails).val()) * parseFloat($("#itemRate_" + lastDetails).val()));
          rsgst = parseFloat(rowtotal * SGST / 100);
          rcgst = parseFloat(rowtotal * CGST / 100);
          var tt = '' ;
          if(selfobj.model.get('cust_state_id') != selfobj.model.get('state_id'))
          {
            rigst = parseFloat(rowtotal * IGST / 100);
            if(!isigst) 
              igst = igst + rigst;    
            tt = '<span id= "rowTotal_'+lastDetails+'">'+numberFormat(rowtotal, 2)+'</span><span id= "rigst_'+lastDetails+'">'+numberFormat(rigst, 2)+' </span>'
          }else{
            if(!issgst)
              sgst = sgst + rsgst;
            if(!iscgst) 
              cgst = cgst + rcgst;

            tt = '<span id= "rowTotal_'+lastDetails+'">'+numberFormat(rowtotal, 2)+'</span><span id= "rcgst_'+lastDetails+'">'+numberFormat(rcgst, 2)+' </span><span id= "rsgst_'+lastDetails+'">'+numberFormat(rsgst, 2)+'</span>';
          }  
          $("#itemtotal_" + lastDetails).empty().html(tt);

        }else
        {
          rowtotal = (parseFloat($("#itemQuantity_" + lastDetails).val()) * parseFloat($("#itemRate_" + lastDetails).val()));
          var tt = '<span "rowTotal_'+lastDetails+'">'+numberFormat(rowtotal, 2)+' </span>'
          $("#itemtotal_" + lastDetails).empty().html(tt);
        }
        subtotal = subtotal + rowtotal; 
      });

      if (issgst) {
        sgst = sgst + parseFloat(subtotal * infoSGST / 100);
      }
      if (iscgst) {
        cgst = cgst + parseFloat(subtotal * infoCGST / 100);
      }
      if (isigst) {
        igst = igst + parseFloat(subtotal * infoIGST / 100);
      }
      console.table([subtotal,cgst,sgst,igst]);

      GrossTotal = subtotal + sgst + cgst + igst;
      $(".subTotal").html(numberFormat(subtotal, 2));
      $(".sgst").html(numberFormat(sgst, 2));
      $(".cgst").html(numberFormat(cgst, 2));
      $(".igst").html(numberFormat(igst, 2));
      $(".grossTotal").html(Math.round(numberFormat(GrossTotal, 2)));
      var rrd = Math.round(numberFormat(GrossTotal, 2)) - GrossTotal;
      $(".roundOff").html(numberFormat(rrd, 2));
      $(".diginum").digits();
    },
    delRow: function (e) {
      e.preventDefault();
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      let tr_length = $("tr.item-list-box").length;
      this.reArrangeIndex();
      $("#item-" + lastDetails).remove();
      this.rowTotal(e);
      if(tr_length == 1)
      {
        // console.log(tr_length);
        this.addRow(e);
      }
    },
    delAllRows : function(e){
      $("tr.item-list-box").each(function (key, value) {
        $(this).remove();
      });
      this.addRow(e);
      this.reArrangeIndex();
      this.rowTotal(e);
    },
    reArrangeIndex: function () {
      var i = 1;
      $("tr.item-list-box").each(function (key, value) {
        $(this).find(".sno").html(i);
        i++;
      });
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if(toID == 'customer_id'){
        if(valuetxt == "addCustomer")
        {
          new customerSingleView({ searchCustomer: this, loadfrom: "TaxInvoice",form_label:'Add Customer' });
        }else
        {
          this.updateTaxBox();
        }        
      }     
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
    },
    updateTaxBox : function(){
      selfobj = this;
      let cust = selfobj.customerList.models.find((item) => {
        return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
      });
      var stateID = cust ? cust.attributes.state_id : undefined;
      this.model.set({"cust_state_id" : stateID});
      if(this.model.get('customer_id') == "" || typeof this.model.get('customer_id') == undefined ){
        $('.apply_tax-check').hide(); 
        $('.item_sgst').hide();
        $('.item_cgst').hide();
        $('.item_igst').hide();
      }else{
        
        if(typeof this.model.get('cust_state_id') != 'undefined')
        {
          if(this.model.get('state_id') == this.model.get('cust_state_id'))
          {
            this.s_state = true;
            $('.apply_tax-check').show();
            $('.item_sgst').show();
            $('.item_cgst').show();
            $('.item_igst').hide();
          }else
          {
            $('.apply_tax-check').show();
            $('.item_sgst').hide();
            $('.item_cgst').hide();
            $('.item_igst').show();
          }
        }else{
          $('.apply_tax-check').hide(); 
          $('.item_sgst').hide();
          $('.item_cgst').hide();
          $('.item_igst').hide();
        }
      }
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("name");
      var existingValues = this.model.get(toName);
      if (typeof existingValues !== 'string') {
          existingValues = '';
      }
  
      if ($(e.currentTarget).prop('checked')) {
          if (existingValues.indexOf(valuetxt) === -1) {
              existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
          }
      } else {
          existingValues = existingValues
              .split(',')
              .filter(value => value !== valuetxt)
              .join(',');
      }
      this.model.set({ [toName]: existingValues });
    },
    getProducts: function (e) {
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var name = $(e.currentTarget).val();
      console.log(lastDetails);
      var dropdownContainer = $("#productDropdown_"+lastDetails);
      var table = "customer";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getSearchedProduct',
          method: 'POST',
          data: { text: name },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.flag == "F") showResponse('',res,'');
            if (res.msg === "sucess") { 
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                dropdownContainer.append('<div id= "sd_'+lastDetails  +'" class="dropdown-item selectProduct" style="background-color: #ffffff;" data-productID=' + value.product_id + '>' + value.product_name + '</div>');
              });
              dropdownContainer.show();
            }
          }else {
              // dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "product" style="background-color: #5D60A6; color:#ffffff;" > Add New Product </div>');
              // dropdownContainer.show();
            }
          }
        });
      } else {
        dropdownContainer.hide();
      }
      if (!$(e.currentTarget).is(':focus')) {
        dropdownContainer.hide();
      }
    },
    setProduct: function (e) {
      e.preventDefault();
      let selfobj = this;
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var product_name = $(e.currentTarget).clone().find('span').remove().end().text();   
      var productID = $(e.currentTarget).attr('data-productID');
      console.log(product_name+' / '+productID+' / '+lastDetails);
      $("#productDropdown_"+lastDetails).hide();
      $('#narr_'+lastDetails).val(product_name);
      $('#narr_'+lastDetails).attr({'product_id':productID});
      selfobj.setnarration(productID,lastDetails);
    },
    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      // selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      // var da = selfobj.multiselectOptions.setCheckedValue(e);
      // selfobj.model.set(da);
    },
    saveTaxInvoiceDetails: function (e) {
      e.preventDefault();
      var selfobj = this;
      
      // console.log(this.model);
      invoiceItemsDetails.reset();
      
      var tmpinvoiceID = this.model.get("invoiceID");
      var invoiceID = selfobj.model.get("invoiceID");
      var customerID = selfobj.model.get("customer_id");
      var invoiceDate = $("#invoiceDate").val();
      var processingYear = $("#reportYear").val();
      var processingMonth = $("#reportMonth").val();
      var traineeCount = $("#traineeCount").val();

      var buyers_order_no = this.model.get("buyers_order_no");
      var destination = this.model.get("destination");
      var disapatch_doc_no = this.model.get("disapatch_doc_no");
      var dispatch_date = this.model.get("dispatch_date");
      var dispatch_through = this.model.get("dispatch_through");
      var mode_or_terms_of_payment = this.model.get("mode_or_terms_of_payment");
      var order_date = this.model.get("order_date");
      var other_reference = this.model.get("other_reference");
      var ref_note = this.model.get("ref_note");
      var supplier_ref = this.model.get("supplier_ref");
      var terms_of_delivery = this.model.get("terms_of_delivery");
      var company_id = $.cookie('company_id');
      var record_type = selfobj.menuName;
      var issgst = $('#issgst').is(":checked");
      var iscgst = $('#iscgst').is(":checked");
      var isigst = $('#isigst').is(":checked");
      var infoSGST = this.model.get("stateGstPercent");
      var infoCGST = this.model.get("centralGstPercent");
      var infoIGST = this.model.get("interGstPercent");
      var stateGstAmount = $('.sgst').text();
      var centralGstAmount = $('.cgst').text();
      var interGstAmount = $('.igst').text();
      if (issgst) {
        var isSgst = "yes";
      } else {
        var isSgst = "no";
      }
      if (iscgst) {
        var isCgst = "yes";
      } else {
        var isCgst = "no";
      }
      if (isigst) {
        var isIgst = "yes";
      } else {
        var isIgst = "no";
      }


      if (tmpinvoiceID != '' || tmpinvoiceID != 0) {
        var invoiceID = tmpinvoiceID;
      } else {
        var invoiceID = null;
      }
      var error = [];
      // Set header Information
      var InheaderInfo = { 'company_id' : company_id,"invoiceID": invoiceID, "processingYear": processingYear, "processingMonth": processingMonth, "traineeCount": traineeCount, "customerID": customerID, "invoiceDate": invoiceDate, "sgst": isSgst, "cgst": isCgst, "igst": isIgst, "stateGstPercent": infoSGST, "centralGstPercent": infoCGST, "interGstPercent": infoIGST , "interGstAmount": interGstAmount,"centralGstAmount" :centralGstAmount,"stateGstAmount":stateGstAmount,"record_type":record_type,  "buyers_order_no":buyers_order_no,"destination":destination,"disapatch_doc_no":disapatch_doc_no,"dispatch_date":dispatch_date,"dispatch_through":dispatch_through,"order_date":order_date,"mode_or_terms_of_payment":mode_or_terms_of_payment,"other_reference":other_reference,"ref_note":ref_note,"supplier_ref":supplier_ref,"terms_of_delivery":terms_of_delivery};
      invoiceItemsDetails.add(InheaderInfo);
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var row = $(this).find(".sno").html();
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        var itemQuantity = parseFloat($("#itemQuantity_" + lastDetails).val());
        var itemRate = parseFloat($("#itemRate_" + lastDetails).val());
        var itemName = $("#itemName_" + lastDetails).val();
        var itemUnit = $("#itemUnit_" + lastDetails).val();
        var stateGstPercent = $("#stateGstPercent_" + lastDetails).val();
        var centralGstPercent = $("#centralGstPercent_" + lastDetails).val();
        var interGstPercent = $("#interGstPercent_" + lastDetails).val();
        var stateGstAmount = $("#rsgst_" + lastDetails).text();
        var centralGstAmount = $("#rcgst_" + lastDetails).text();
        var interGstAmount = $("#rigst_" + lastDetails).text();
        var apply_taxes = $("#apply_taxes_" + lastDetails).is(":checked")? "y" : "n";
        var narre = $("#narr_" + lastDetails).attr('product_id');
        // var usb_mouse = $('#usb_mouse_'+lastDetails).is(":checked")? "yes" : "no";
        // var usb_keyboard = $('#usb_keyboard_'+lastDetails).is(":checked")? "yes" : "no";
        // var laptop_backpack = $('#laptop_backpack_'+lastDetails).is(":checked")? "yes" : "no";
        // var wifi_adapter = $('#wifi_adapter_'+lastDetails).is(":checked")? "yes" : "no";
        // var display_connector = $('#display_connector_'+lastDetails).is(":checked")? "yes" : "no";
        // var usb_c_type_connector = $('#usb_c_type_connector_'+lastDetails).is(":checked")? "yes" : "no";
        // var hdmi_cable = $('#hdmi_cable_'+lastDetails).is(":checked")? "yes" : "no";
        // var charger = $('#charger_'+lastDetails).is(":checked")? "yes" : "no";
        // var serial_no = $('#serial_no_'+lastDetails).val();
        // console.table([charger,usb_mouse,hdmi_cable]);
        if (narre == "") {
          error.push("Item type can not blank. Row No." + row);

        }
        if (itemQuantity == "" || itemQuantity == 0) {
          error.push("Item quantity can not blank. Row No." + row);

        }
      
        if(selfobj.menuName != "delivery") {
          
          if (itemRate == "" || itemRate == 0) {
            error.push("Item rate can not blank. Row No." + row);

          }
        }
  
        var nerow = { "invoiceID": invoiceID, "srno": lastDetails, "quantity": itemQuantity, "rate": itemRate, "unit": itemUnit, "description": itemName, "invoiceLineChrgID": narre ,"stateGstPercent" : stateGstPercent,"centralGstPercent":centralGstPercent,"interGstPercent":interGstPercent , "apply_taxes" : apply_taxes ,"stateGstAmount":stateGstAmount ,"centralGstAmount":centralGstAmount ,"interGstAmount":interGstAmount }; //,'charger': charger,'usb_mouse':usb_mouse,'usb_keyboard':usb_keyboard,'laptop_backpack':laptop_backpack,'wifi_adapter':wifi_adapter,'display_connector':display_connector,'usb_c_type_connector':usb_c_type_connector ,'hdmi_cable':hdmi_cable,'serial_no':serial_no
        invoiceItemsDetails.add(nerow);
      });
      if (error.length > 0) {
        var er = "";
        $.each(error, function (key, val) {

          er = er + val + "\n";
        });
        showResponse('',{flag:'F',msg:er},'');
        return false;
      }

      if (invoiceID != null) {
        if (permission.edit == "yes") {
          method = "update";
        }
        else {
          Swal.fire('You don`t have permission to edit', '', 'info');
          return false;
        }
      } else {
        method = "create";
      }
      $(e.currentTarget).html("<span>Saving..</span>");
      $(e.currentTarget).attr("disabled", "disabled");
      invoiceItemsDetails.sync(method, invoiceItemsDetails, { 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          showResponse(e,res,'');
          $(e.currentTarget).html("<span>Error</span>");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          handelClose(selfobj.toClose);
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
              selfobj.dynamicFieldRenderobj.prepareForm();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        }
        setTimeout(function () {
          $(e.currentTarget).html("<span>Save</span>");
          
        }, 3000);
      });
    },

    initializeValidate: function () {
      var selfobj = this;
      $('#invoiceDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#invoiceDate').change();
        var valuetxt = $("#invoiceDate").val();
        selfobj.model.set({ invoiceDate: valuetxt });
      });
  
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });

    },
    render: function () {
      var source = deliveryChallanSingle_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes , menuName : this.menuName}));
      
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      this.updateTaxBox();
      this.reArrangeIndex();
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      return this;

    }, onDelete: function () {
      this.remove();
    }
  });

  return deliveryChallanSingleView;

});
