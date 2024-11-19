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
  'Quill',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../customer/collections/customerCollection',
  '../models/singleTaxInvoiceModel',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/invoiceItems',
  '../../customer/views/customerSingleView',
  '../../category/collections/slugCollection',
  '../../readFiles/views/readFilesView',
  '../views/shippingModalView',
  '../../companyMaster/models/companySingleModel',
  '../../menu/collections/menuCollection',
  'text!../templates/taxInvoiceSingle_temp.html',
  'text!../templates/additionalCharges_temp.html',
  '../../category/views/categorySingleView',
  '../../core/views/mailView',
  '../../companyMaster/views/companySingleView',

], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment, Quill,Swal,multiselectOptions, customerCollection, singleTaxInvoiceModel, dynamicFieldRender, invoiceItems,customerSingleView,slugCollection,readFilesView,shippingModalView,companySingleModel,menuCollection,taxInvoice_temp,additionalCharges_temp,categorySingleView,mailView,companySingleView) {

  var taxInvoiceSingleView = Backbone.View.extend({
    model: singleTaxInvoiceModel,
    form_label:'',
    s_state : 'false',
    menuName : '' ,
    customerList : new customerCollection() ,
    categoryList : new slugCollection(),
    initialize: function (options) {
      this.dynamicData = null;
      $(".loder").show();
      this.toClose = "taxinvoiceSingleView";
      this.form_label = options.form_label;
      $('#taxInvoiceData').remove();
      this.menuId = options.menuId;
      this.menuName = options.menuName;
      this.nextInNumber = '' ;
      var selfobj = this;
      scanDetails = options.searchtaxInvoice;
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      this.companySingleModel = new companySingleModel();
      this.menuList = new menuCollection();
      this.InheaderInfo = {};
      this.rows = [];
      if (DEFAULTCOMPANY == 0 || DEFAULTCOMPANY == '') {
        Swal.fire({title: 'Failed !',text: 'Please Select Company First..!',timer: 2000,icon: 'error',showConfirmButton: false});
        return;
      }
      this.companySingleModel.set({'infoID' : DEFAULTCOMPANY});
      if(this.companySingleModel.get('infoID') != ''){
        this.companySingleModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          $(".loder").hide();
          selfobj.companyDetails = res.data;
          selfobj.model.set({ "isGstBilling": res.data[0].is_gst_billing });
          selfobj.model.set({ "companyStateID": res.data[0].state});
          // console.log('Tasda : ',selfobj.model.attributes)
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
        });
      }
      invoiceItemsDetails = new invoiceItems();
      this.getnarration();
      this.model = new singleTaxInvoiceModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      // this.customerList = new customerCollection();
      this.categoryList.fetch({headers:{
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if (res.flag == "F") showResponse('',res,'');
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        $('.loder').hide();
        selfobj.render();
      });
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
          selfobj.model.set({ 'isGstBilling': selfobj.model.get('is_gst_billing')});          
          selfobj.render();
          selfobj.setOldValues();
        });
      } else {
        selfobj.getNextDocNum();
        selfobj.render();
        $(".popupLoader").hide();
        $(".custShippingAddress").hide();
      }
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'unit' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    refreshComp: function () {
      let selfobj = this;
      selfobj.companySingleModel.set({'infoID' : DEFAULTCOMPANY}); 
      if(selfobj.companySingleModel.get('infoID') != ''){
        selfobj.companySingleModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          },data:{menuId:selfobj.companyMenuID}, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          $(".loder").hide();
          selfobj.companyDetails = res.data;
          selfobj.model.set({ "isGstBilling": res.data[0].is_gst_billing });
          selfobj.model.set({ "companyStateID": res.data[0].state });
          // console.log('Tasda : ',selfobj.model.attributes)
          selfobj.getNextDocNum();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
        });
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
      "click .loadMedia": "loadMedia",
      "click #convert_invoice": "convert_invoice",
      "click .accordionHeader": "accordionToggle",
      "click .addCharges": "addAdditionalCharges",
      "click .uploadInvoiceLogo": "uploadInvoiceLogo",
      "blur .companyDetailsChange": "updateCompanyDetails",
      "click .custDetails": "customerDetails",
      "click .shipTocheck": "shipTocheck",
      "click .removeFields": "removeFields",
      "click .editShippingDetails": "editShippingDetails",
      "click .editCustomerDetails": "editCustomerDetails",
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
      this.$el.off('click', '.loadMedia', this.loadMedia);
      this.$el.on('click', '.loadMedia', this.loadMedia.bind(this));
      this.$el.off('click', '#convert_invoice', this.convert_invoice);
      this.$el.on('click', '#convert_invoice', this.convert_invoice.bind(this));
      this.$el.off('click', '.accordionHeader', this.accordionToggle);
      this.$el.on('click', '.accordionHeader', this.accordionToggle.bind(this));
      this.$el.off('click', '.addCharges', this.addAdditionalCharges);
      this.$el.on('click', '.addCharges', this.addAdditionalCharges.bind(this));
      this.$el.off('click', '.uploadInvoiceLogo', this.uploadInvoiceLogo);
      this.$el.on('click', '.uploadInvoiceLogo', this.uploadInvoiceLogo.bind(this));
      this.$el.off('blur', '.companyDetailsChange', this.updateCompanyDetails);
      this.$el.on('blur', '.companyDetailsChange', this.updateCompanyDetails.bind(this));
      this.$el.off('click', '.custDetails', this.customerDetails);
      this.$el.on('click', '.custDetails', this.customerDetails.bind(this));
      this.$el.off('click', '.shipTocheck', this.shipTocheck);
      this.$el.on('click', '.shipTocheck', this.shipTocheck.bind(this));
      this.$el.off('click', '.removeFields', this.removeFields);
      this.$el.on('click', '.removeFields', this.removeFields.bind(this));
      this.$el.off('click', '.editShippingDetails', this.editShippingDetails);
      this.$el.on('click', '.editShippingDetails', this.editShippingDetails.bind(this));
      this.$el.off('click', '.editCustomerDetails', this.editCustomerDetails);
      this.$el.on('click', '.editCustomerDetails', this.editCustomerDetails.bind(this));
      this.$el.off('click', '.editCompanyDetails', this.editCompanyDetails);
      this.$el.on('click', '.editCompanyDetails', this.editCompanyDetails.bind(this));
      this.$el.off('click', '.clearPaymentStatus', this.clearPaymentStatus);
      this.$el.on('click', '.clearPaymentStatus', this.clearPaymentStatus.bind(this));

      this.$el.off('input', '.custChange', this.getcustomers);
      this.$el.on('input', '.custChange', this.getcustomers.bind(this));
      this.$el.off('click', '.selectCustomer', this.setCustomer);
      this.$el.on('click', '.selectCustomer', this.setCustomer.bind(this));
    },
    editCompanyDetails : function (e) {
      var selfobj = this;
      // console.log(selfobj.form_label);
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "companyMasterSingleView": {
          var comapanyID = $(e.currentTarget).attr("data-comapanyID");
          new companySingleView({ infoID: comapanyID, searchCompany: selfobj,menuId:selfobj.companyMenuID,form_label:'Company Details',loadfrom:'invoiceView'});
          break;
        }
      }
    },
    loadMedia: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
    },
    customerDetails: function (e) {
      $('.custDetails').hide();
      $('.customerDetailsDrop').show();
      $('.custShippingAddress').show();    
      $('.customerAddDetails').hide();
    },
    editCustomerDetails: function (e) {
      $('.customerAddDetails').hide();
      $('.customerDetailsDrop').show();
    },
    editShippingDetails: function (e) {
      var selfobj = this;
      $('#shippingModal').modal('toggle');
      new shippingModalView({ taxInvoice: this });
      $('body').find(".loder");
    },
    shipTocheck: function (e) {
      var selfobj = this;
      if ($(e.currentTarget).is(":checked")) { 
        selfobj.model.set({"ship_to" : 'yes'});
        $('.shippingDetails').hide();
        $('.shipTocheckCls').show();
        $('.shipTouncheckCls').hide();
        let cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if(cust){
          $('.shipTocheckCls .custName').empty().append(cust.attributes.name); 
          $('.shipTocheckCls .custAddress').empty().append(cust.attributes.address); 
          $('.shipTocheckCls .custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-')); 
          $('.shipTocheckCls .custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
          $('.shipTocheckCls .custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
          $('.shipTocheckCls .stateCode').empty().append('Gst State Code: ' + (cust.attributes.gst_state_code ? cust.attributes.gst_state_code : '-')); 

        }
      } else {
        selfobj.model.set({"ship_to" : 'no'});

        selfobj.model.set({ shipping_address: ''});
          $('.shippingDetails').show();
          $('.shipTocheckCls').hide();
          $('.shipTouncheckCls').hide();
        // }
      }
    },
    accordionToggle: function (e) {
      const accordionHeader = e.target.closest(".accordionHeader");
      if (accordionHeader) {
          const accordionContent = accordionHeader.nextElementSibling;
          if (accordionContent) {
              accordionContent.classList.toggle("is-open");
              if (accordionContent.classList.contains("is-open")) {
                  accordionContent.style.height = (accordionContent.scrollHeight + 15) + "px";
                  const materialIcons = accordionHeader.querySelector(".material-icons");
                  if (materialIcons) {
                    materialIcons.textContent = 'expand_more';
                  }
              } else {
                  accordionContent.style.height = "0px";
                  const materialIcons = accordionHeader.querySelector(".material-icons");
                  if (materialIcons) {
                    materialIcons.textContent = 'expand_less';
                  }
              }
              console.log("Updated class on accordionHeader", accordionHeader.querySelector("i").classList);
          } else {
              console.error("No accordion content found.");
          }
      } else {
          console.error("No accordion header found.");
      }
    },  
    addAdditionalCharges:function(e){
      var selfobj = this;
      var lastChildId = $('.addAdditionalFields .fieldsSelection:last').attr('id');
      if(lastChildId){
        var numericPart = lastChildId.match(/\d+/);
        this.rowCounter = numericPart[0];
      }else{
        this.rowCounter = 0;
      }
      this.rowCounter++;
      var template = _.template(additionalCharges_temp);
      $(".addAdditionalFields").append(template({rowCounter : this.rowCounter}));
      $('input[name="field_gst"]').val(this.model.get('largestGst'));
      if($('.addAdditionalFields .fieldsSelection').length == 3){
        $('.addCharges').attr('disabled','disabled');
        $('.addCharges').css('color', '#838689');
      }else{
        $('.addCharges').removeAttr('disabled');
        $('.addCharges').css('color', '#0B78F9');
      }
    },
    ShowAdditionalCharges:function(){
      var selfobj = this;
      if (this.model.get('additional_char') != undefined) {
        var charges = JSON.parse(this.model.get('additional_char'));
        var template = _.template(additionalCharges_temp);
        this.rowCounter = 1;
        Object.values(charges).forEach(item => {
          $(".addAdditionalFields").append(template({rowCounter : this.rowCounter}));
          $('#field_title_'+this.rowCounter).val(item.title);
          $('#field_rate_'+this.rowCounter).val(item.rate);
          $('#field_gst_'+this.rowCounter).val(item.gst);
          this.rowCounter++;
        });
      }
    },
    ShowPaymentLogs:function(){
      this.logsAmt = 0 ;
      this.receiptStr = '' ;
      var logs = this.model.get('paymentLogs');
      if (logs != undefined && logs != '') {
        logs.forEach((log)=>{
          this.logsAmt = this.logsAmt + parseInt(log.amount);
          if (this.receiptStr == '') 
            this.receiptStr = this.receiptStr + '#'+log.receipt_number;
          else
            this.receiptStr = this.receiptStr + ', #'+log.receipt_number;
        });
        $('.LogsPayment').show();
        $('.logsAmt').html('-'+this.logsAmt);
        $('.receiptStr').html(this.receiptStr);
      }
    },
    removeFields: function (e) {
      var selfobj = this;
      e.preventDefault();
      var container = $(e.currentTarget).closest(".addAdditionalFields");
      var rowCount = container.find(".fieldsSelection").length;
      $(e.currentTarget).closest(".fieldsSelection").remove();
      if (rowCount < 4) {
        $('.addCharges').removeAttr('disabled');
        $('.addCharges').css('color', '#0B78F9');
      }else{
        $('.addCharges').attr('disabled','disabled');
        $('.addCharges').css('color', '#838689');
      }
      selfobj.rowTotal();

    },
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lasts = lastID.split("-");
      var lastDetails = parseInt(lasts[1]);
      var slug_id ='' ;
       $.each(this.categoryList.models,function (key, val) {
        if(val.attributes.slug == 'unit') {    
          slug_id = val.attributes.category_id; 
        }
      })
      var sel2 = '<select id="itemUnit_' + (lastDetails + 1) + '" name="itemUnit_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr" title="Unit" data-slug="'+slug_id+'"> > ';
      sel2 = sel2 + ' <option class="" value="">Select Units</option><option class = "addNew" value="addCategory">Add Units Type</option>';
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {       
          $.each(val.attributes.sublist, function (key, modcat) {          
            sel2 = sel2 + '<option value="' + modcat.category_id + '">' + modcat.categoryName + '</option>';
          });
        }
      }); 
      sel2 = sel2 + '</select>';
      var sel3 ='<select for="itemHSN_' + (lastDetails + 1) + '" id="itemHSN_' + (lastDetails + 1) + '" name="itemHSN_' + (lastDetails + 1) + '" title="HSN" class="form-control ws-select amtChange dropval show-tick repeatChange nopadding">'+
      '<option value="hsn_1">hsn_1</option>'+
      '<option selected value="hsn_2">hsn_2</option>'+
      '</select>';
      var sel4 ='<select for="itemUQC_' + (lastDetails + 1) + '" id="itemUQC_' + (lastDetails + 1) + '" name="itemUQC_' + (lastDetails + 1) + '" title="UQC" class="form-control ws-select amtChange dropval show-tick repeatChange nopadding">'+
            '<option value="uqc_1">uqc_1</option>'+
            '<option selected value="uqc_1">uqc_2</option>'+
          '</select>';
      // var sel3 = '<select for="itemDiscountType_' + (lastDetails + 1) + '" id="itemDiscountType_' + (lastDetails + 1) + '" name="itemDiscountType_' + (lastDetails + 1) + '" title="Type" class="form-control ws-select amtChange dropval show-tick repeatChange nopadding">'+
      //   '<option selected value="amt">Amt</option>'+
      //   '<option selected value="per">Per</option>'+
      //   '</select>';
      var sel = '<div class="col-md-12 productDropdown nopadding"><div class="form-group form-float"><div class="taskDate"><input autocomplete="off" id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+(lastDetails + 1)+'" class="dropdown-content custDrop" style="display: none;"></div></div>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box">' +
                    '<td class="sno">' + (lastDetails + 1) + '</td>' +
                    '<td class="custom-dropdown">' + sel + '</td>' +
                    '<td class="">' + sel3 + '</td>' +
                    '<td class="">' + sel4 + '</td>' +  
                    '<td >' +
                    '<input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits input-p unitClass" value="">' +
                    '<div class="form-group form-float">' +
                    '<div class="form-line focused">' 
                    + sel2 +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td class="text-right">' +
                    '<input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="itemRate form-control amtChange digits" value="">' +
                    '<img style="display:none;" src="images/info.png" class="alertIcon withGstIcon_' + (lastDetails + 1) + '" data-toggle="tooltip" data-placement="top" title="with Gst">'+
                    // '<div class="apply-taxes">'+
                    //     '<input type="checkbox" name="itemAmtWithGST_' + (lastDetails + 1) + '" id="itemAmtWithGST_' + (lastDetails + 1) + '" class="itemAmtWithGST-check updateAmt" >'+
                    //     '<span class="itemAmtWithGST">With Gst</span>'+
                    // '</div>'+
                    // '<span class="itemWithGSTAmt itemWithGSTAmt_' + (lastDetails + 1) + '"></span>'+
                    '</td>' +
                    '<td >' +
                    '<input type="text" name="itemDiscount_' + (lastDetails + 1) + '" id="itemDiscount_' + (lastDetails + 1) + '" class="itemDiscount form-control amtChange input-p" value="">' +
                    '<div class="form-group form-float">'+
                    '<div class="form-line" >'+ 
                    '<select for="itemDiscountType_' + (lastDetails + 1) + '" id="itemDiscountType_' + (lastDetails + 1) + '" name="itemDiscountType_' + (lastDetails + 1) + '" title="Type" class="form-control amtChange ws-select dropval show-tick repeatChange nopadding">'+
                    '<option value="amt">Amt</option>'+
                    '<option selected value="per">Per</option>'+
                    '</select>'+
                    '</div>'+
                    '</div>'+
                    '</td>' +
                    '<td class="text-center" id="itemPricetotal_' + (lastDetails + 1) + '"></td>'+
                    '<td>' +
                    '<input type="text" name="itemGST_' + (lastDetails + 1) + '" id="itemGST_' + (lastDetails + 1) + '" class="itemGST form-control amtChange input-p"><span class="itemGstAmt itemGstAmt_'+(lastDetails + 1)+'"></span>' +
                    '</td>' +
                    '<td class="IGST text-center igst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
                    '<td class="SGST text-center sgst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
                    '<td class="CGST text-center cgst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
                    '<td class="text-center total-td" id="itemtotal_' + (lastDetails + 1) + '"></td>' +
                    '<td class="text-right">' +
                    '<button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"></button>' +
                    '</td>' +
                    '</tr>';

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
      var lastDetails = 0;
      var slug_id ='' ;
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {    
          slug_id = val.attributes.category_id; 
        }
     })
     var sel2 = '<select id="itemUnit_' + (lastDetails + 1) + '" name="itemUnit_' + (lastDetails + 1) + '" class="form-control ws-select dropval setnarr" title="Unit" data-slug="'+slug_id+'"> > ';
      sel2 = sel2 + ' <option class="" value="">Select Units</option><option class = "addNew" value="addCategory">Add Units Type</option>';
      $.each(this.categoryList.models, function (key, val) {
        if(val.attributes.slug == 'unit') {       
          $.each(val.attributes.sublist, function (key, modcat) {          
            sel2 = sel2 + '<option value="' + modcat.category_id + '">' + modcat.categoryName + '</option>';
          });
        }
      }); 
      sel2 = sel2 + '</select>';
      var sel3 ='<select for="itemHSN_' + (lastDetails + 1) + '" id="itemHSN_' + (lastDetails + 1) + '" name="itemHSN_' + (lastDetails + 1) + '" title="HSN" class="form-control ws-select amtChange dropval show-tick repeatChange nopadding">'+
                '<option value="hsn_1">hsn_1</option>'+
                '<option selected value="hsn_2">hsn_2</option>'+
              '</select>';
      var sel4 ='<select for="itemUQC_' + (lastDetails + 1) + '" id="itemUQC_' + (lastDetails + 1) + '" name="itemUQC_' + (lastDetails + 1) + '" title="UQC" class="form-control ws-select amtChange dropval show-tick repeatChange nopadding">'+
                '<option value="uqc_1">uqc_1</option>'+
                '<option selected value="uqc_1">uqc_2</option>'+
              '</select>';

      var sel = '<div class="col-md-12 productDropdown nopadding"><div class="form-group form-float"><div class="taskDate"><input autocomplete="off" id="narr_'+(lastDetails + 1)+'" type="text" class="form-control pdChange ddcnt taskDate" name="narr_'+(lastDetails + 1)+'" value="" placeholder="Type" /></div></div><div class="product-input"></div><div id="productDropdown_'+lastDetails+'" class="dropdown-content custDrop" style="display: none;"></div></div>';
      var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box">' +
      '<td class="sno">' + (lastDetails + 1) + '</td>' +
      '<td class="custom-dropdown">' + sel + '</td>' +
      '<td class="">' + sel3 + '</td>' +
      '<td class="">' + sel4 + '</td>' +
      '<td >' +
      '<input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits input-p unitClass" value="">' +
      '<div class="form-group form-float">' +
      '<div class=" focused">' +
      +sel2+
      '</div>' +
      '</div>' +
      '</td>' +
      '<td class="text-right">' +
      '<input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="itemRate form-control amtChange digits" value="">' +
      '<img style="display:none;" src="images/info.png" class="alertIcon withGstIcon_' + (lastDetails + 1) + '" data-toggle="tooltip" data-placement="top" title="with Gst">'+
      // '<div class="apply-taxes">'+
      //     '<input type="checkbox" name="itemAmtWithGST_' + (lastDetails + 1) + '" id="itemAmtWithGST_' + (lastDetails + 1) + '" class="itemAmtWithGST-check updateAmt" >'+
      //     '<span class="itemAmtWithGST">With Gst</span>'+
      // '</div>'+
      // '<span class="itemWithGSTAmt itemWithGSTAmt_' + (lastDetails + 1) + '"></span>'+
      '</td>' +
      '<td>' +
      '<input type="text" name="itemDiscount_' + (lastDetails + 1) + '" id="itemDiscount_' + (lastDetails + 1) + '" class="itemDiscount form-control amtChange input-p" value="">' +
      '<div class="form-group form-float">'+
      '<div class="" >'+ 
      '<select for="itemDiscountType_' + (lastDetails + 1) + '" id="itemDiscountType_' + (lastDetails + 1) + '" name="itemDiscountType_' + (lastDetails + 1) + '" title="Type" class="form-control ws-select dropval show-tick repeatChange nopadding">'+
      '<option value="amt">Amt</option>'+
      '<option selected value="per">Per</option>'+
      '</select>'+
      '</div>'+
      '</div>'+
      '</td>' +
      '<td class="text-center" id="itemPricetotal_' + (lastDetails + 1) + '"></td>'+
      '<td>' +
      '<input type="text" name="itemGST_' + (lastDetails + 1) + '" id="itemGST_' + (lastDetails + 1) + '" class="itemGST form-control amtChange input-p"><span class="itemGstAmt itemGstAmt_'+(lastDetails + 1)+'"></span>' +
      '</td>' +
      '<td class="IGST text-center igst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
      '<td class="SGST text-center sgst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
      '<td class="CGST text-center cgst_td_' + (lastDetails + 1) + '" style="display: none;"></td>'+
      '<td class="text-center total-td" id="itemtotal_' + (lastDetails + 1) + '"></td>' +
      '<td class="text-right">' +
      '<button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"></button>' +
      '</td>' +
      '</tr>';
      // var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value=""></td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="form-control amtChange digits" value=""> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img src="images/deleteImg.png"/></button></td></tr>';
      //  var temprow = '<tr id="item-' + (lastDetails + 1) + '" class="item-list-box"><td class="sno">' + (lastDetails + 1) + '</td><td class="custom-dropdown" >' + sel + '</td><td><input type="text" name="itemName_' + (lastDetails + 1) + '" id="itemName_' + (lastDetails + 1) + '" class="form-control"> <div class="accessories" > <input type="checkbox" name="usb_mouse_' + (lastDetails + 1) + '" id="usb_mouse_' + (lastDetails + 1) + '" class="assc" ><span class="" >USB Mouse</span></div><div class="accessories" ><input type="checkbox" name="usb_keyboard_' + (lastDetails + 1) + '" id="usb_keyboard_' + (lastDetails + 1) + '" class=" assc"><span   class="" >USB Keyboard</span></div> <div class="accessories" ><input type="checkbox" name="laptop_backpack_' + (lastDetails + 1) + '" id="laptop_backpack_' + (lastDetails + 1) + '" class="assc" ><span   class="" >Laptop Backpack</span></div> <div class="accessories" ><input type="checkbox" name="wifi_adapter_' + (lastDetails + 1) + '" id="wifi_adapter_' + (lastDetails + 1) + '" class="assc" ><span class="" > Wifi Adapter</span></div> <div class="accessories" ><input type="checkbox" name="display_connector_' + (lastDetails + 1) + '" id="display_connector_' + (lastDetails + 1) + '" class="assc"><span class="" >Display Connector</span></div>  <div class="accessories" ><input type="checkbox" name="usb_c_type_connector_' + (lastDetails + 1) + '" id="usb_c_type_connector_' + (lastDetails + 1) + '" class="assc" ><span  class="" >USB & C Type Connector</span></div> <div class="accessories" ><input type="checkbox" name="hdmi_cable_' + (lastDetails + 1) + '" id="hdmi_cable_' + (lastDetails + 1) + '" class="assc"  ><span class="" >HDMI Cable</span></div> <div class="accessories" ><input type="checkbox" name="charger_' + (lastDetails + 1) + '" id="charger_' + (lastDetails + 1) + '" class="assc" ><span class="" >Charger</span><input type="text" name="serial_no_' + (lastDetails + 1) + '" id="serial_no_' + (lastDetails + 1) + '" class="form-control serial_no" value="" placeholder="Charger Serial No"> </div> </td><td><input type="text" name="itemQuantity_' + (lastDetails + 1) + '" id="itemQuantity_' + (lastDetails + 1) + '" class="form-control amtChange digits" value=""> <input type="checkbox" style="display: none;" name="apply_taxes_' + (lastDetails + 1) + '" id="apply_taxes_' + (lastDetails + 1) + '" class=" apply_tax-check updateAmt" ><span  style="display: none;" class="apply_tax-check" >Apply taxes</span> </td><td class= "tax-lable"><input type="text" name="itemUnit_' + (lastDetails + 1) + '" id="itemUnit_' + (lastDetails + 1) + '" class="form-control"> <label style="display: none;" class="item_cgst">Cgst</label>   <label style="display: none;" class="item_sgst">Sgst</label> <label style="display: none;" class="item_igst">Igst</label> </td><td class="text-right"><input type="text" name="itemRate_' + (lastDetails + 1) + '" id="itemRate_' + (lastDetails + 1) + '" class="itemRate form-control amtChange digits" value=""> <input type="text" name="centralGstPercent_' + (lastDetails + 1) + '" id="centralGstPercent_' + (lastDetails + 1) + '" class="form-control item_cgst amtChange" style="display: none;" value="'+this.model.get('centralGstPercent')+'">  <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '" id="stateGstPercent_' + (lastDetails + 1) + '" class="form-control item_sgst amtChange" style="display: none;" value="'+this.model.get('stateGstPercent')+'"> <input type="text" name="stateGstPercent_' + (lastDetails + 1) + '"" id="interGstPercent_' + (lastDetails + 1) + '" class="form-control item_igst amtChange" style="display: none;" value="'+this.model.get('interGstPercent')+'"> </td><td class="text-right total-td" id="itemtotal_' + (lastDetails + 1) + '"></td><td class="text-right"><button id="itemdel_' + (lastDetails + 1) + '" class="del-row btn-small btn-default"><img class="invoiceDeleteImg" src="images/deleteImg.png"/></button></td></tr>';
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
        this.addRow(e);
      }
    },
    convert_invoice : function(e)
    {
      e.preventDefault();
      var selfobj = this;
      if (selfobj.model.get('invoiceID') != null && selfobj.model.get('invoiceID') != undefined ) {
        selfobj.getPaymentLogs(selfobj.model.get('invoiceID'));
      }
    },
    numberToWords: function(number) {
      var self = this;
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
      if (number === 0) return 'zero';
  
      let words = '';
  
      // Extract crores
      if (number >= 10000000) {
          words += self.numberToWords(Math.floor(number / 10000000)) + ' crore ';
          number %= 10000000;
      }
  
      // Extract lakhs
      if (number >= 100000) {
          words += self.numberToWords(Math.floor(number / 100000)) + ' lakh ';
          number %= 100000;
      }
  
      // Extract thousands
      if (number >= 1000) {
          words += self.numberToWords(Math.floor(number / 1000)) + ' thousand ';
          number %= 1000;
      }
  
      // Extract hundreds
      if (number >= 100) {
          words += ones[Math.floor(number / 100)] + ' hundred ';
          number %= 100;
      }
      // Extract tens and ones
      if (number >= 20) 
      {
        words += tens[Math.floor(number / 10)];
        if (number % 10 !== 0) {
            words += ' ' + ones[Math.floor(number % 10)];
        } 
        else {
            words += ''; 
        }
        number %= 10;
      }else if (number >= 10 && number <= 19) {
        words += teens[number - 10];
      } else if (number > 0) {
        words += ones[Math.floor(number)];
      }
      return words.trim().toUpperCase();
    },
    rowTotal: function (e) {
      // console.clear();
      const selfobj = this; 
      selfobj.InheaderInfo.subtotal = 0;
      selfobj.InheaderInfo.TotalGST = 0;
      selfobj.InheaderInfo.TotalDiscount = 0;
      selfobj.InheaderInfo.TotalPrice = 0;
      selfobj.InheaderInfo.TotalQty = 0;
      selfobj.InheaderInfo.largestgst = 0;
      selfobj.InheaderInfo.GrossTotal = 0;
      selfobj.InheaderInfo.additionalCharges = 0;
      selfobj.InheaderInfo.custStateID = selfobj.model.get('cust_state_id');
      selfobj.InheaderInfo.companyStateID = selfobj.model.get('companyStateID');
      selfobj.InheaderInfo.isGstBilling = selfobj.model.get('isGstBilling');
      console.log('Invoice Calculation : ',selfobj.InheaderInfo);
      this.calculateRowTotal();
      this.calculateAdditionalCharges();
      console.log('After Adding Additional Charges : ',selfobj.InheaderInfo);
      this.showInvoiceSummary();
      this.showPayDetails();
    }, 
    // CALCULATE ROW TOTAL
    calculateRowTotal : function(){
      var selfobj = this;
      selfobj.rows = [] ;
      $("tr.item-list-box").each(function () {
        var rowCal = {};
        const lastID = $(this).attr("id");
        const lastDetails = lastID.split("-")[1];
        rowCal.srno = lastDetails ;
        rowCal.invoiceID = selfobj.model.get("invoiceID");
        rowCal.srno = lastDetails;
        rowCal.itemDiscount = parseFloat($("#itemDiscount_" + lastDetails).val()) || 0;
        rowCal.quantity = parseFloat($("#itemQuantity_" + lastDetails).val()) || 0;
        rowCal.itemDiscountType = $("#itemDiscountType_" + lastDetails).val();
        rowCal.rate = parseFloat($("#itemRate_" + lastDetails).val()) || 0;
        rowCal.rate1 = parseFloat($("#itemRate_" + lastDetails).val()) || 0;
        rowCal.interGstPercent = parseFloat($("#itemGST_" + lastDetails).val()) || 0;
        rowCal.interGstAmount = $(".itemGstAmt_" + lastDetails).text();
        rowCal.withGst = $("#item-" + lastDetails).attr('data-with_gst');
        rowCal.unit = $("#itemUnit_" + lastDetails).val();
        rowCal.invoiceLineChrgID = $("#narr_" + lastDetails).attr('product_id');
        
        // ROW TOTAL
        rowCal.itemtotal = rowCal.quantity * rowCal.rate;

        // QUANTITY TOTAL
        selfobj.InheaderInfo.TotalQty += rowCal.quantity;

        // APPLY DISCOUNT
        rowCal = selfobj.calculateDiscount(rowCal);
        
        // APPLY GST
        // if (selfobj.InheaderInfo.isGstBilling === 'yes') {
         rowCal = selfobj.calculateGST(rowCal);
        // }
        
        rowCal.rowGstTotal = rowCal.gst * rowCal.quantity;
       
        // HIDE / SHOW GST 
        if (selfobj.InheaderInfo.isGstBilling === 'yes') {
          (rowCal.withGst == 'yes' || rowCal.withGst == 'y')?
            $('.withGstIcon_'+lastDetails).show():
            $('.withGstIcon_'+lastDetails).hide();
          // if(rowCal.withGst == 'yes' || rowCal.withGst == 'y'){
          //   $(".itemWithGSTAmt_" + lastDetails).empty().html(numberFormat(rowCal.gstAmt, 2)).hide();
          //   $(".itemGstAmt_" + lastDetails).empty().html(numberFormat(rowCal.gst, 2)).hide();
          //   $("#itemtotal_" + lastDetails).html('<span id="rowTotal_' + lastDetails + '">' + numberFormat(rowCal.itemtotal+rowCal.itemGstTotal, 2) + '</span>');
          //   // UPDATE TOTAL PRICE
          //   selfobj.InheaderInfo.TotalPrice += rowCal.itemtotal;
          // }else{
            $(".itemWithGSTAmt_" + lastDetails).empty().html(numberFormat(rowCal.rate1, 2)).hide();
            $(".itemGstAmt_" + lastDetails).empty().html(numberFormat(rowCal.gst, 2)).hide();
            // $("#itemtotal_" + lastDetails).html('<span id="rowTotal_' + lastDetails + '">' + numberFormat(rowCal.itemtotal, 2) + '</span>');
            // UPDATE TOTAL PRICE
            selfobj.InheaderInfo.TotalPrice += rowCal.itemtotal - (rowCal.gst * rowCal.quantity);
          // }
            $(".cgst_td_" + lastDetails+",.sgst_td_" + lastDetails).empty().html(numberFormat((rowCal.rowGstTotal/2), 2));
            $(".igst_td_" + lastDetails).empty().html(numberFormat(rowCal.rowGstTotal, 2));
            if (selfobj.InheaderInfo.custStateID && selfobj.InheaderInfo.custStateID == selfobj.InheaderInfo.companyStateID) {
              $(".cgst_td_" + lastDetails+",.sgst_td_" + lastDetails).show();
              $(".igst_td_" + lastDetails).hide();
            }else{
              $(".cgst_td_" + lastDetails+",.sgst_td_" + lastDetails).hide();
              $(".igst_td_" + lastDetails).show();
            }
        }else{
          selfobj.InheaderInfo.TotalPrice += rowCal.itemtotal;
        }
        $("#itemtotal_" + lastDetails).html('<span id="rowTotal_' + lastDetails + '">' + numberFormat(rowCal.itemtotal, 2) + '</span>');
        $("#itemPricetotal_" + lastDetails).html(numberFormat(rowCal.rowPriceTotal, 2));
        selfobj.InheaderInfo.subtotal += (rowCal.itemtotal+rowCal.itemGstTotal);
        selfobj.rows.push(rowCal);
        console.log('ROW - '+lastDetails,rowCal);
      });
    },
    // APPLY DISCOUNT
    calculateDiscount : function(rowCal){
      var selfobj = this;
      if (rowCal.itemDiscount) {
        rowCal.discount = 0;
        if (rowCal.itemDiscountType === 'amt') {
          rowCal.discount = rowCal.itemDiscount * rowCal.quantity;
          rowCal.itemtotal -= rowCal.discount;
          if (rowCal.itemDiscount <= rowCal.rate1) {
            rowCal.rate1 -= rowCal.itemDiscount;
          } else {
            showResponse('',{ flag:'F' , msg: 'Discount is greater than price!' },'');
          }
        } else {
          rowCal.discount = rowCal.itemtotal * (rowCal.itemDiscount / 100);
          rowCal.itemtotal -=rowCal.discount;
          rowCal.rate1 -= rowCal.rate1 * (rowCal.itemDiscount / 100);
        } 
        selfobj.InheaderInfo.TotalDiscount += rowCal.discount;
      }
      return rowCal;
    },
    // APPLY GST
    calculateGST : function(rowCal){
      var selfobj = this;
      rowCal.gstAmt = rowCal.rate1;
      rowCal.gst = 0;
      rowCal.itemGstTotal = 0;
      if (rowCal.interGstPercent) {
        // UPDATE LARGEST GST
        selfobj.InheaderInfo.largestgst = Math.max(selfobj.InheaderInfo.largestgst, rowCal.interGstPercent);
        if (selfobj.InheaderInfo.isGstBilling === 'no') {
          rowCal.gstAmt = (rowCal.rate1 * 100) / (rowCal.interGstPercent + 100);
          rowCal.gst = rowCal.rate1 - rowCal.gstAmt;
          rowCal.itemtotal = rowCal.rate1 * rowCal.quantity;
          rowCal.rowPriceTotal = rowCal.rate1 * rowCal.quantity;
        }else {
          rowCal.gst = rowCal.rate1 * (rowCal.interGstPercent / 100);
          rowCal.gstAmt += rowCal.gst;
          rowCal.itemtotal += rowCal.gst * rowCal.quantity;
          rowCal.rowPriceTotal = rowCal.rate1 * rowCal.quantity;
          selfobj.InheaderInfo.TotalGST += rowCal.gst * rowCal.quantity;
        }
      } 
      return rowCal;
    },
    getcustomers: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#customerDropdown");
      var table = "customer";
      var where = "name";
      var list = "customer_id, name, type, record_type";
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getCustomerList/',
          method: 'POST',
          data: { text: name, tableName: table, wherec: where, list: list },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(".textLoader").show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess") {

              if (res.data.length > 0) {
                $.each(res.data, function (index, value) {
                  dropdownContainer.append('<div class="dropdown-item selectCustomer" style="background-color: #ffffff;" data-customerID=' + value.customer_id + '>' + value.name +'</div>');
                });
                dropdownContainer.show();
              }
            } else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customer" style="background-color: #5D60A6; color:#ffffff;" > Add New Customer </div>');
              dropdownContainer.show();
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
    setCustomer: function (e) {
      // e.preventDefault();
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customerName": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        $("#customerDropdown").hide();
        $('.customerDetails-card').show();
        $('.customerDetailsDrop').hide();
      }
      $('#customer_id').val(Name);
    },
    // CALCULATE ADDITTIONAL CHARGES
    calculateAdditionalCharges : function(){
      selfobj = this;
      let additional_ch = 0;
      let additional_gst = 0;
      let adI = 1 ;
      $(".fieldsSelection input[name='field_rate']").each(function () {
        additional_ch += parseFloat($(this).val()) || 0;
        $("#field_gst_" + adI).val(selfobj.InheaderInfo.largestgst);
        adI++;
      });
      if (selfobj.InheaderInfo.isGstBilling === 'yes'){
        additional_gst = additional_ch * (selfobj.InheaderInfo.largestgst / 100);
      }
      selfobj.model.set({'additionalCharges': additional_ch});
      selfobj.InheaderInfo.additionalCharges = additional_ch;
      selfobj.InheaderInfo.additionalChargesGST = additional_gst;

      selfobj.InheaderInfo.GrossTotal = (selfobj.InheaderInfo.TotalPrice+selfobj.InheaderInfo.TotalGST) + additional_ch;
    },
    // SHOW TOTAL CALCULATIONS
    showInvoiceSummary : function () {
      var selfobj = this;
      // HIDE ALL GSTs LABELS
      $(".cgst").hide();
      $(".sgst").hide();  
      $(".igst").hide();
      $(".cgst-lb").hide();
      $(".sgst-lb").hide();
      $(".igst-lb").hide();
      // ADVANCED RECIEPTS TO SHOW
      if ($('#advanceReceipts').prop('checked')) {
        const logsAmt = Math.abs(parseInt($('.logsAmt').text())) || 0;
        selfobj.InheaderInfo.GrossTotal -= logsAmt;
      }
      // TOTAL SUMMARY
      $(".subTotal").html(numberFormat(selfobj.InheaderInfo.subtotal, 2));
      $(".qtyTotal").html(numberFormat(selfobj.InheaderInfo.TotalQty, 2));
      $(".discTotal").html(numberFormat(selfobj.InheaderInfo.TotalDiscount, 2));
      $(".priceTotal").html(numberFormat((selfobj.InheaderInfo.TotalPrice), 2));
      $(".grossAmount").html(numberFormat(selfobj.InheaderInfo.GrossTotal, 2));
      $(".amtInWords").html(selfobj.numberToWords(selfobj.InheaderInfo.GrossTotal));
      // IF isGSTBilling is "yes" 
      $(".igst,.igstTotal").html(numberFormat(selfobj.InheaderInfo.TotalGST, 2));
      $(".cgst,.sgst,.sgstTotal,.cgstTotal").html(numberFormat((selfobj.InheaderInfo.TotalGST / 2), 2));
      if (selfobj.InheaderInfo.isGstBilling == 'yes') {
        if (selfobj.InheaderInfo.custStateID && selfobj.InheaderInfo.custStateID == selfobj.InheaderInfo.companyStateID) {
          $(".cgst,.sgst,.sgstTotal,.cgstTotal").show();
          $(".cgst-lb,.sgst-lb").show();
        }else{
          $(".igst,.igstTotal").show();
          $(".igst-lb").show();
        }
      }
      // TOGGLE ROUNDOFF
      if ($('#roundOff').prop('checked')) {
        const rrd = Math.round(numberFormat(selfobj.InheaderInfo.GrossTotal, 2)) - numberFormat(selfobj.InheaderInfo.GrossTotal, 2);
        $(".roundOff").show();
        $(".roundOff").html(numberFormat(rrd, 2));
        $(".grossAmount").html(numberFormat(Math.round(selfobj.InheaderInfo.GrossTotal), 2));
        selfobj.InheaderInfo.roundOff = numberFormat(Math.round(selfobj.InheaderInfo.GrossTotal), 2);
      }else{
        $(".roundOff").hide();
      }
      $(".diginum").digits();
    },  
    updateTaxBox : function(){
      selfobj = this; 
      if(selfobj.customerList.models){
        let cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if(cust){
          $('.custDetails').hide();
          $('.customerDetailsDrop').hide();
          $('.customerAddDetails').show();
          $('.custName').empty().append(cust.attributes.name); 
          $('.custAddress').empty().append(cust.attributes.address); 
          if (cust.attributes.address != '' && cust.attributes.address != null) {
            $('#ship_to').removeAttr("disabled");
            $('.addressBeware').hide();
          }else{
            $('#ship_to').attr("disabled", true);
            $('.addressBeware').show();
          }
          $('.custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-'));
          $('.custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
          $('.custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
          $('.custGstCls.stateCode').empty().append('Gst State Code : ' + (cust.attributes.gst_state_code ? cust.attributes.gst_state_code : '-')); 
        }
        if (selfobj.model.get("ship_to") == 'yes') { 
          $('.shippingDetails').hide();
          $('.shipTouncheckCls').hide();
          $('.shipTocheckCls').show();
          if(cust){
            $('.shipTocheckCls .custName').empty().append(cust.attributes.name); 
            $('.shipTocheckCls .custAddress').empty().append(cust.attributes.address); 
            $('.shipTocheckCls .custZipcode').empty().append('Zip Code: ' + (cust.attributes.zipcode ? cust.attributes.zipcode : '-')); 
            $('.shipTocheckCls .custMobileNo').empty().append('Phone No.:' + (cust.attributes.mobile_no ? cust.attributes.mobile_no : '-')); 
            $('.shipTocheckCls .custGstCls').empty().append('GST: ' + (cust.attributes.gst_no ? cust.attributes.gst_no : '-')); 
            $('.shipTocheckCls .custGstCls.stateCode').empty().append('Gst State Code: ' + (cust.attributes.gst_state_code ? cust.attributes.gst_state_code : '-')); 
          }
        } else {
          if (selfobj.model.get("shipping_address") != '' && selfobj.model.get("shipping_address") != null && selfobj.model.get("shipping_address") != undefined) { 
            var shippingAddress = selfobj.model.get("shipping_address");
            if (shippingAddress && shippingAddress.trim() !== '') {
              shippingAddress  = JSON.parse(shippingAddress); 
            }
            $('.shippingDetails').hide();
            $('.shipTocheckCls').hide();
            $('.shipTouncheckCls').show();
            $('.shipTouncheckCls .custAddress').empty().append(shippingAddress.address); 
            $('.shipTouncheckCls .custZipcode').empty().append('Zip Code: ' + (shippingAddress.zipcode ? shippingAddress.zipcode : '-')); 
            $('.shipTouncheckCls .custMobileNo').empty().append('Phone No.: '+ (shippingAddress.mobile_no ? shippingAddress.mobile_no : '-') ); 
            $('.shipTouncheckCls .stateCode').empty().append('Gst State Code: ' + (cust.attributes.gst_state_code ? cust.attributes.gst_state_code : '-')); 
          }else{
            $('.shippingDetails').show();
            $('.shipTocheckCls').hide();
            $('.shipTouncheckCls').hide();
          } 
        }
        

       

        if(this.model.get('customer_id') == "" || typeof this.model.get('customer_id') == undefined ){
          $('.apply_tax-check').hide(); 
          $('.item_sgst').hide();
          $('.item_cgst').hide();
          $('.item_igst').hide();
        }
      }

      var stateID = cust ? cust.attributes.gst_state : undefined;
      var gstStateCode = cust ? cust.attributes.gst_state_code : undefined;
      $(".cgst-lb,.sgst-lb,.igst-lb,.CGST,.SGST,.IGST").hide();
      const companyStateID = this.model.get('companyStateID');
      const isGSTBilling = this.model.get('isGstBilling');
      if (isGSTBilling == 'yes') {
        if (stateID && stateID == companyStateID) {
          $(".cgst-lb").show();
          $(".sgst-lb").show();
          $(".CGST").show();
          $(".SGST").show();
        }else{
          $(".igst-lb").show();
          $(".IGST").show();
        }
      }
      

      
      this.model.set({"cust_state_id" : stateID});
      this.model.set({"gst_state_code" : gstStateCode});
      $('.CustomerCompany.accordion-content-description.is-open').css('height', '0px');
      $('.CustomerCompany.accordion-content-description.is-open').css('height', ($('.CustomerCompany.accordion-content-description').get(0).scrollHeight + 15) + 'px');
    },
    uploadInvoiceLogo: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    getSelectedFile: function (url) {
      var selfobj = this;
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      $('.uploadInvoiceLogo').hide();
      
      var companyID = DEFAULTCOMPANY; 
      selfobj.companySingleModel.set({'infoID' : companyID}); 
      selfobj.companySingleModel.set({ "invoice_logo": url });
      selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
      
      selfobj.companySingleModel.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type:"POST"
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      });
    },
    updateCompanyDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      selfobj.companySingleModel.set(newdetails);
      var companyID = DEFAULTCOMPANY; 
      selfobj.companySingleModel.set({'infoID' : companyID}); 
      selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
      selfobj.companySingleModel.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type:"POST"
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      today = dd + '-' + mm + '-' + yyyy;
      
      var nextWeek = new Date(yyyy + '-' + mm + '-' + dd);
      nextWeek.setDate(nextWeek.getDate() + 7);
      var dd = String(nextWeek.getDate()).padStart(2, '0');
      var mm = String(nextWeek.getMonth() + 1).padStart(2, '0');
      var yyyy = nextWeek.getFullYear();
      nextWeek = dd + '-' + mm + '-' + yyyy;
      if(!(selfobj.model.get('invoiceDate'))){
        $('#invoiceDate').val(today);
        $('#valid_until_date').val(nextWeek);
      }
      if(!(selfobj.model.get('payment_date'))){
        selfobj.model.set({'payment_date':today});
        $('#payment_date').val(today);
      }
      if(!(selfobj.model.get('valid_until_date'))){
        $('#valid_until_date').val(nextWeek);
      }
      $('#invoiceDate').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true,
      }).on('changeDate', function (ev) {
        $('#invoiceDate').change();
        var valuetxt = $("#invoiceDate").val();
        selfobj.model.set({ invoiceDate: valuetxt });
        selfobj.showPayDetails();
      });
      $('#payment_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true,
      }).on('changeDate', function (ev) {
        $('#payment_date').change();
        var valuetxt = $("#payment_date").val();
        selfobj.model.set({ payment_date: valuetxt });
        console.log('selfobj.model.attributes : ',selfobj.model.attributes);
        console.log('valuetxt : ',valuetxt);
      });
      $('#valid_until_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#valid_until_date').change();
        var valuetxt = $("#valid_until_date").val();
        selfobj.model.set({ valid_until_date: valuetxt });
      });
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
    },
    refreshCust : function(){
      this.customerList.fetch({
        headers:{'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active',getAll : 'Y', type: 'customer',company_id:DEFAULTCOMPANY}
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
        // $('.custDetails').hide();
        console.log('cust :',selfobj.model.get('customer_id'));
        if (selfobj.model.get('customer_id')== null || selfobj.model.get('customer_id')== undefined ) {
          $('.customerDetails').show();
          $('.customerAddDetails').hide();
        }else{
          $('.custDetails').hide();
          $('.customerAddDetails').hide();
          // $('.customerAddDetails').hide();
        }
        $('.invoice_logo.accordion-content-description.is-open').css('height', '0px');
        $('.invoice_logo.accordion-content-description.is-open').css('height', ($('.invoice_logo.accordion-content-description').get(0).scrollHeight + 15) + 'px');
        $('.CustomerCompany.accordion-content-description.is-open').css('height', '0px');
        $('.CustomerCompany.accordion-content-description.is-open').css('height', ($('.CustomerCompany.accordion-content-description').get(0).scrollHeight + 15) + 'px');
      });
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});
      $(".profile-loader").hide();
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
    getNextDocNum: function () {
      selfobj = this;
      var company_id = $.cookie('company_id');
      $.ajax({
        url: APIPATH + 'getNextDocNumber/'+selfobj.menuName,
        method: 'GET',
        datatype: 'JSON',
        data:{'company_id':company_id},
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.flag == "S") {
            selfobj.nextInNumber = res.data;
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
        }
      });
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
      if (valuetxt == "addCategory") {
        var slug = $(e.currentTarget).attr("data-slug");
        new categorySingleView({slug : slug , searchCategory: this, loadfrom: "taxInvoiceSingleView" , form_label : "Category" });
      }
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var existingValues = this.model.get(toName);
      if (existingValues === null || existingValues === undefined) {
          existingValues = '';
      } else if (typeof existingValues !== 'string') {
          existingValues = existingValues.toString();
      }
      existingValues = existingValues.replace(/NULL/ig, '');
      existingValues = existingValues.replace(/^,|,$/g, '');
      if ($(e.currentTarget).prop('checked')) {
          if (existingValues.indexOf(valuetxt) === -1) {
              existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
          }
      } else {
          existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
      }
      this.model.set({ [toName]: existingValues });
    },
    getProducts: function (e) {
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var name = $(e.currentTarget).val();
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
            if (res.flag === "S") { 
              if(res.data.length > 0) {
              $.each(res.data, function (index, value) {
                dropdownContainer.append('<div data-productID="'+value.product_id+'" id= "sd_'+lastDetails  +'" class="dropdown-item selectProduct" style="background-color: #ffffff;"  data-with_gst="' + value.with_gst + '" data-actual_cost="' + value.actual_cost + '"  data-price="' + value.price + '" data-discount="' + value.discount + '" data-unit="' + value.unit + '" data-gst="' + value.gst + '" data-discount_type="' + value.discount_type+'" >' + value.product_name+'</div>');
              });
              dropdownContainer.show();
            }
          }else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "product" style="background-color: #5D60A6; color:#ffffff;" > Product Not found </div>');
              dropdownContainer.show();
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
      var price = $(e.currentTarget).attr('data-price');
      var discount = $(e.currentTarget).attr('data-discount');
      var discount_type = $(e.currentTarget).attr('data-discount_type');
      var unit = $(e.currentTarget).attr('data-unit');
      var gst = $(e.currentTarget).attr('data-gst');
      var with_gst = $(e.currentTarget).attr('data-with_gst');
      var actual_cost = $(e.currentTarget).attr('data-actual_cost');

      $("#productDropdown_"+lastDetails).hide();
      $('#narr_'+lastDetails).val(product_name);
      $('#itemRate_'+lastDetails).val(actual_cost);
      $('#itemGST_'+lastDetails).val(gst);

      (discount =='' || discount == 0) ? $('#itemDiscount_'+lastDetails).val(0) : $('#itemDiscount_'+lastDetails).val(discount);
      console.log('Discount Type : ',discount_type);
      $('#itemQuantity_'+lastDetails).val(1);
      $('#item-'+lastDetails).attr({'data-with_gst':with_gst});
      $("#itemUnit_"+lastDetails).val(unit).change();
      $("#itemDiscountType_"+lastDetails).val(discount_type).change();
      // $("#itemUnit_"+lastDetails).val(unit).change();
      $('#narr_'+lastDetails).attr({'product_id':productID});
      selfobj.setnarration(productID,lastDetails);
      if (price != '' ) {
        selfobj.rowTotal();
      }
    },
    getPaymentLogs:function(invoiceID){
      $('#paylogs').empty();
      $.ajax({
        url:APIPATH+'paymentLogsList/'+invoiceID,
        method:'POST',
        data:{},
        datatype:'JSON',
        beforeSend: function(request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token",$.cookie('_bb_key'));
          request.setRequestHeader("SadminID",$.cookie('authid'));
          request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept",'application/json');
        },
        success:function(res){          
          if(res.flag == "F"){
            showResponse('',res,''); 
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "S"){
            if(res.data.length > 0){
              var logsTotal = 0 ;
             var tbl = '<tbody id="receiptList"></tbody>'
             $('#receipt-table').append(tbl); 
             var row = '';
              $.each(res.data, function(key, value) {
                row = '<tr><th style="width:50%;text-align:left">'+value.receipt_number+'</th><td style="text-align:right">'+numberFormat(value.amount,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
                $('#receiptList').append(row);
                logsTotal += parseFloat(value.amount) ;
              });
              
              row = '<tr><th style="width:50%;text-align:left">Receipts Total</th><td align="right">'+numberFormat(logsTotal,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);

              var pendingAmt = parseFloat(selfobj.model.get('grossAmount')) - logsTotal;
              row = '<tr><th style="width:50%;text-align:left"> Pending Amount </th><td align="right">'+numberFormat(pendingAmt,2)+'</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);
            }
          }
        }
      });
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
      setvalues = ["partially","fully"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    clearPaymentStatus : function(e){
      var selfobj = this;
      selfobj.model.set({'payment_status':'partially'})
      selfobj.model.set({'payment_date':''})
      selfobj.model.set({'payment_amount':''})
      selfobj.model.set({'mode_of_payment':''})
      selfobj.model.set({'transaction_id':''})
      $('.payment_status.multiSel').removeClass('active');
      $('.log').hide();
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      $('.log').show();
      selfobj.showPayDetails();
    },
    showPayDetails : function () {
      if (selfobj.model.get('payment_status') == 'fully') {
        $('#payment_amount').val(selfobj.InheaderInfo.GrossTotal).focus();
        $('#payment_date').val($('#invoiceDate').val());
        $('#payment_amount').attr('disabled','disabled');
        $('#payment_date').attr('disabled','disabled');
      }else{
        $('#payment_amount').val(''); 
        $('#payment_date').val('');
        $('#payment_amount').removeAttr('disabled');
        $('#payment_date').removeAttr('disabled');
      }
    },
    validateRow : function () {
      var error = [];
      $("tr.item-list-box").each(function (key, value) {
        var lastID = $(this).attr("id");
        var row = $(this).find(".sno").html();
        var lasts = lastID.split("-");
        var lastDetails = lasts[1];
        var narre = $("#narr_" + lastDetails).attr('product_id');
        if (narre == undefined || narre == '') {
          narre = $("#narr_" + lastDetails).val();
        }
        var itemQuantity = parseFloat($("#itemQuantity_" + lastDetails).val());
        var itemRate = parseFloat($("#itemRate_" + lastDetails).val());
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
      });
      if (error.length > 0) {
        var er = "";
        $.each(error, function (key, val) {
          er = er + val + "\n";
        });
        showResponse('',{ flag:'F' , msg: er },'');
        return false;
      }else{
        return true;
      }
    },
    saveTaxInvoiceDetails: function (e) {
      e.preventDefault();
      invoiceItemsDetails.reset();
      var selfobj = this;
      (selfobj.model.get("ship_to") == 'yes') ? selfobj.model.set({ shipping_address: ''}):selfobj.model.set({ shipping_address: selfobj.model.get("shipping_address")});
      let isNew = $(e.currentTarget).attr("data-action");
      var tmpinvoiceID = this.model.get("invoiceID");
      var invoiceID = null;
      selfobj.InheaderInfo.isnewInvoice = 'no' ;
      (tmpinvoiceID != '' || tmpinvoiceID != 0 ) ?  invoiceID = tmpinvoiceID : invoiceID = null;
      if (invoiceID == null) {
        selfobj.InheaderInfo.isnewInvoice = 'yes' ;
      }
      // ADDITIONAL CHARGES
      var additional_charges = {};
      $(".fieldsSelection").each(function (key, value) {
        var lastAC = $(this).attr("id");
        var lastAd = lastAC.split("_");
        var lastAddCharges = lastAd[1];
        var title = $(this).find("input[name='field_title']").val();
        var rate = $(this).find("input[name='field_rate']").val();
        var gst = $(this).find("input[name='field_gst']").val();
        additional_charges[lastAddCharges] = {
          "title" : title,
          "rate" : rate,
          "gst" : gst,
        };
      });
      // INVOICE DETAILS
      selfobj.InheaderInfo.invoiceID = invoiceID;
      selfobj.InheaderInfo.additional_char = JSON.stringify(additional_charges);
      selfobj.InheaderInfo.state_id = selfobj.model.get("companyStateID");
      selfobj.InheaderInfo.gst_state_code = selfobj.model.get("gst_state_code");
      selfobj.InheaderInfo.logsAmt = this.logsAmt;
      selfobj.InheaderInfo.pending_amt = this.model.get('pending_amount');
      selfobj.InheaderInfo.show_on_pdf = $('#advanceReceipts').prop('checked') ? 'yes' : 'no';
      selfobj.InheaderInfo.payment_note = this.model.get("payment_note") == '' || this.model.get("payment_note") == undefined ? '' : this.model.get("payment_note");
      selfobj.InheaderInfo.company_id = $.cookie('company_id');    
      selfobj.InheaderInfo.processingYear = $("#reportYear").val();
      selfobj.InheaderInfo.processingMonth = $("#reportMonth").val();
      selfobj.InheaderInfo.traineeCount = $("#traineeCount").val();
      selfobj.InheaderInfo.customerID = selfobj.model.get("customer_id");
      selfobj.InheaderInfo.invoiceDate = $("#invoiceDate").val();
      selfobj.InheaderInfo.valid_until_date = $("#valid_until_date").val();
      selfobj.InheaderInfo.ship_to = selfobj.model.get("ship_to");
      selfobj.InheaderInfo.shipping_address = selfobj.model.get("shipping_address");
      selfobj.InheaderInfo.record_type = selfobj.menuName;
      // PAYMENT DETAILS
      selfobj.InheaderInfo.payment_date = this.model.get("payment_date") == '' || this.model.get("payment_date") == undefined ? '' : this.model.get("payment_date");
      selfobj.InheaderInfo.payment_amount = this.model.get("payment_amount") == '' || this.model.get("payment_amount") == undefined ? '' : this.model.get("payment_amount") ;
      if (selfobj.InheaderInfo.GrossTotal < selfobj.InheaderInfo.payment_amount) {
        showResponse('',{ flag:'F' , msg: 'Payment Amount is Greater than Total amount..!' },'');
        return;
      }
      selfobj.InheaderInfo.payment_mode = this.model.get("mode_of_payment") == '' || this.model.get("mode_of_payment") == undefined ? '' : this.model.get("mode_of_payment");
      selfobj.InheaderInfo.transaction_id = this.model.get("transaction_id") == '' || this.model.get("transaction_id") == undefined ? '' : this.model.get("transaction_id");
      selfobj.InheaderInfo.payment_status = selfobj.model.get("payment_status");
      invoiceItemsDetails.add(selfobj.InheaderInfo);
      console.log('InheaderInfo : ',selfobj.InheaderInfo );
      // INVOICELINE ROWS DETAILS
      $.each(selfobj.rows, function (key, val) {
        invoiceItemsDetails.add(val);  
      });
      if (!selfobj.validateRow()) {
        return;
      }
      if (invoiceID != null) {
        if (permission.edit == "yes") {
          method = "update";
        }
        else {
          Swal.fire({title: 'Failed !',text: "You don`t have permission to edit",timer: 2000,icon: 'error',showConfirmButton: false});          
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
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");
          handelClose(selfobj.toClose);
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if (res.lastInvoiceID != undefined) {
              selfobj.lastInvoiceID = res.lastInvoiceID;
            }
            let url = APIPATH + 'logsUpload/' + selfobj.logID +'/'+selfobj.lastInvoiceID;
            selfobj.uploadFileEl.elements.parameters.action = url;
            selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
            
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        }
        setTimeout(function (e) {
          $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        }, 3000);
      });
    },
    fromEditors: function () {
      var selfobj = this;
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],      
        [{ 'header': 1 }, { 'header': 2 }],             
        [{ 'direction': 'rtl' }],                       
        [{ 'size': ['small', false, 'large', 'huge'] }], 
        [{ 'align': [] }],
        ['link'],
          ['clean']                                        
      ]; 
      if(selfobj.menuName == 'quotation'){
        var editor = new Quill($("#quotation_terms_conditions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }else if(selfobj.menuName == 'invoice'){
        var editor = new Quill($("#invoice_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }else if(selfobj.menuName == 'receipt'){
        var editor = new Quill($("#receipt_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }
      if(editor){
        editor.on('text-change', function(delta, oldDelta, source) {
          if (source == 'api') {
              console.log("An API call triggered this change.");
            } else if (source == 'user') {
              var delta = editor.getContents();
              var text = editor.getText();
              var justHtml = editor.root.innerHTML;
              selfobj.companySingleModel.set({'infoID' : DEFAULTCOMPANY}); 
              selfobj.companySingleModel.set({"menuId":selfobj.companyMenuID});
              if(selfobj.menuName == 'quotation'){
                selfobj.companySingleModel.set({"quotation_terms_conditions":justHtml});
              }else if(selfobj.menuName == 'invoice'){
                selfobj.companySingleModel.set({"invoice_terms_condotions":justHtml});
              }else if(selfobj.menuName == 'receipt'){
                selfobj.companySingleModel.set({"receipt_terms_condotions":justHtml});
              }
              selfobj.companySingleModel.save({},{headers:{
                'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
              },error: selfobj.onErrorHandler,type:"POST" }).done(function(res){
                if (res.flag == "F") showResponse('',res,'');
                if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}    
              });
            }
        });
      }
    },
    render: function () {
      var source = taxInvoice_temp;
      if (selfobj.model.get('is_gst_billing')) {
        selfobj.model.set({ "isGstBilling": selfobj.model.get('is_gst_billing') });
      }
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes , menuName : this.menuName,categoryList : selfobj.categoryList.models,companyDetails: selfobj.companyDetails ? selfobj.companyDetails[0] : []}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);  
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      $('.overlay-main-container.open').addClass('invoice');
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.uploadFileEl = $("#attachement").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'logsUpload/',
        element: 'attachement',
        onSucess: function () {
          // selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });
      $(".cancelBtn").click(function(e){
        selfobj.filterSearch();
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide'); 
        $(".modal-backdrop").hide();
      });
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.fromEditors();
      console.log('selfobj.companyDetails : ',selfobj.companyDetails);
      if(selfobj.companyDetails && selfobj.companyDetails[0] && selfobj.companyDetails[0].invoice_logo){
        $('body').find(".uploadInvoiceLogo").hide();
        $('body').find(".uploadInvoiceLogo").addClass("d-none");
      }else{
        $('body').find(".uploadInvoiceLogo").show();
        $('body').find(".uploadInvoiceLogo").removeClass("d-none");
      }
      this.updateTaxBox();
      this.reArrangeIndex();
      console.log('this.model',selfobj.model);
      if (selfobj.model.get("customer_id") == '' || selfobj.model.get("customer_id") == null || selfobj.model.get("customer_id") == undefined) { 
        $(".custShippingAddress").hide();
      }
      if (selfobj.model.get("invoiceID") != null && selfobj.model.get("invoiceID") != '' ) {
        $(".shippingDetails").hide();
        (selfobj.model.get("ship_to") == 'yes')? $(".shipTocheckCls").show(): $(".shipTouncheckCls").show();
        selfobj.ShowAdditionalCharges();
        selfobj.ShowPaymentLogs();
        selfobj.rowTotal();
      }else{
        $('#invoiceNumber').val(selfobj.nextInNumber);
      }
      $('.invoice_logo.accordion-content-description.is-open').css('height', '0px');
      $('.invoice_logo.accordion-content-description.is-open').css('height', ($('.invoice_logo.accordion-content-description').get(0).scrollHeight + 15) + 'px');
      $('.CustomerCompany.accordion-content-description.is-open').css('height', '0px');
      $('.CustomerCompany.accordion-content-description.is-open').css('height', ($('.CustomerCompany.accordion-content-description').get(0).scrollHeight + 15) + 'px');
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return taxInvoiceSingleView;
});
