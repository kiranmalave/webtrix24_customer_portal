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
  // COLLECTIONS
  '../../customer/collections/customerCollection',
  '../collections/invoiceItems',
  '../../category/collections/slugCollection',
  '../../menu/collections/menuCollection',
  '../../projects/collections/projectsCollection',
  // MODELS
  '../models/singleTaxInvoiceModel',
  '../../companyMaster/models/companySingleModel',
  // TEMPLATES
  'text!../templates/taxInvoiceSingle_temp.html',
  'text!../templates/additionalCharges_temp.html',
  'text!../templates/invoiceNewRow.html',
  'text!../templates/customerLookupRow.html',
  'text!../templates/invoiceRow.html',
  // VIEWS
  '../views/invoicePreview',
  '../views/shippingModalView',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../customer/views/customerSingleView',
  '../../product/views/productSingleView',
  '../../readFiles/views/readFilesView',
  '../../category/views/categorySingleView',
  '../../companyMaster/views/companySingleView',
  '../../core/views/appSettings',
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, icheck, select2, moment, Quill, Swal, 
  customerCollection, invoiceItems, slugCollection, menuCollection, projectsCollection, singleTaxInvoiceModel, companySingleModel, 
  taxInvoice_temp, additionalCharges_temp,invoiceNewRow, customerLookupRow, invoiceRow, invoicePreview, 
  shippingModalView, multiselectOptions, dynamicFieldRender, customerSingleView, productSingleView, readFilesView, categorySingleView, companySingleView,appSettings) {
  var taxInvoiceSingleView = Backbone.View.extend({
    model: singleTaxInvoiceModel,
    form_label: '',
    s_state: 'false',
    menuName: '',
    customerList: new customerCollection(),
    categoryList: new slugCollection(),
    projectsList: new projectsCollection(),
    initialize: function (options) {
      var selfobj = this;
      this.dynamicData = null;
      this.rows = [];
      this.InheaderInfo = {};
      this.nextInNumber = '';
      this.unitSlug = '';
      this.menuId = options.menuId;
      this.menuName = options.menuName;
      this.form_label = options.form_label;
      this.scanDetails = options.searchtaxInvoice;
      this.loadFrom = options.loadFrom;
      this.customerID = options.customer_id;
      this.projectID = options.project_id;
      this.customerMenuId = selfobj.scanDetails.customerMenuId;
      this.productMenuId = selfobj.scanDetails.productMenuId;
      this.toClose = "taxinvoiceSingleView";
      $(".loder").show();
      $('#taxInvoiceData').remove();
      $(".popupLoader").show();
      $(".modal-dialog").addClass("modal-lg");
      this.model = new singleTaxInvoiceModel();
      this.companySingleModel = new companySingleModel();
      this.menuList = new menuCollection();
      this.appSettings = new appSettings();
      invoiceItemsDetails = new invoiceItems();
      if (DEFAULTCOMPANY == 0 || DEFAULTCOMPANY == '') {
        Swal.fire({ title: 'Failed !', text: 'Please Select Company First..!', timer: 2000, icon: 'error', showConfirmButton: false });
        return;
      }
      if (options.menuId == undefined || options.menuId == null) {
        permission = ROLE[options.menuName];
        selfobj.model.set({ menuId: permission.menuID });
        selfobj.menuId = permission.menuID;
      } else {
        selfobj.model.set({ menuId: options.menuId });
      }
      if (this.loadFrom == "project") {
        this.model.set({ customer_id: this.customerID });
        this.model.set({ project_id: this.projectID });
        this.model.set({ related_to: this.loadFrom });
      }
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      $(".popupLoader").show();
      this.model.set({ year: moment().year(), reportYear: moment().year() });
      this.refreshComp();
      this.refreshCat();
      this.refreshCust();
      this.refreshProject();
      if (options.invoiceID != "" && options.invoiceID != null) {
        this.getnarration();
        this.model.set({ invoiceID: options.invoiceID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('', res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set({ menuId: selfobj.menuId });
          selfobj.model.set({ 'isGstBilling': selfobj.model.get('is_gst_billing') });
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
      "change .catVal": "catVal",
      "click .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "input .pdChange": "getProducts",
      "click .selectProduct": "setProduct",
      "click #convert_invoice": "convert_invoice",
      "click .addCharges": "addAdditionalCharges",
      "blur .companyDetailsChange": "updateCompanyDetails",
      "click .custDetails": "customerDetails",
      "click #ship_to": "shipTocheck",
      "click .removeFields": "removeFields",
      "click .editShippingDetails": "editShippingDetails",
      "click .customerDetails-card": "changeCustomer",
      "click .customerShippingDetails": "changeShippingType",
      "click .editCustomerDetails": "editCustomerDetails",
      "click .addNewRecord": "editCustomerDetails",
      "click .editCompanyDetails": "editCompanyDetails",
      "click .clearPaymentStatus": "clearPaymentStatus",
      "change .catVal": "catVal",
      "input .custChange": "getcustomers",
      "click .selectCustomer": "setCustomer",
      "click .selectFreeRecord": "updateDataFreeTxt",
      "click #saveRow": "saveRow",
    },
    // BASIC FUNCTIONS
    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    selectOnlyThis: function (e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["partially", "fully", 'is_shipping'];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
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
    setValues: function (e) {
      var selfobj = this;
      var classList = $(e.currentTarget).attr('class');
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      if ($(e.currentTarget).hasClass('is_shipping')) {
        selfobj.updateTaxBox();
      }
      $('.log').show();
      selfobj.showPayDetails();
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
      if (!(selfobj.model.get('invoiceDate'))) {
        $('#invoiceDate').val(today);
        $('#valid_until_date').val(nextWeek);
      }
      if (!(selfobj.model.get('payment_date'))) {
        selfobj.model.set({ 'payment_date': today });
        $('#payment_date').val(today);
      }
      if (!(selfobj.model.get('valid_until_date'))) {
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
    // GET DETAILS ONLY
    refreshCust: function () {
      var selfobj = this;
      this.customerList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { status: 'active', getAll: 'Y', type: 'customer', company_id: DEFAULTCOMPANY }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.model.set("customerList", res.data);
        selfobj.render();
        if (selfobj.model.get('customer_id') == null || selfobj.model.get('customer_id') == undefined) {
          $('.customerDetails').show();
          $('.customerAddDetails').hide();
        } else {
          $('.custDetails').hide();
          $('.customerAddDetails').hide();
        }
      });
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'unit' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    refreshProject: function () {
      let selfobj = this;
      this.projectsList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    refreshComp: function () {
      let selfobj = this;
      selfobj.companySingleModel.set({ 'infoID': DEFAULTCOMPANY });
      if (selfobj.companySingleModel.get('infoID') != '') {
        selfobj.companySingleModel.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.companyMenuID }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('', res, '');
          $(".loder").hide();
          selfobj.companyDetails = res.data;
          selfobj.model.set({ "isGstBilling": res.data[0].is_gst_billing });
          selfobj.model.set({ "companyStateID": res.data[0].state });
          selfobj.getNextDocNum();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.render();
        });
      }
    },
    catVal: function (e) {
      var valueTxt = $(e.currentTarget).val();
      if (valueTxt == 'addCategory') {
        var slug = $(e.currentTarget).attr("data-slug");
        new categorySingleView({ searchCategory: this, slug: slug, loadfrom: "taxInvoiceSingleView", form_label: "Category" });
      }
    },
    // ABOUT TO COMPANY AND CUSTOMER 
    editCompanyDetails: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "companyMasterSingleView": {
          var comapanyID = $(e.currentTarget).attr("data-comapanyID");
          new companySingleView({ infoID: comapanyID, searchCompany: selfobj, menuId: selfobj.companyMenuID, form_label: 'Company Details', loadfrom: 'invoiceView' });
          break;
        }
      }
    },
    customerDetails: function (e) {
      $('.custDetails').hide();
      $('.customerDetailsDrop').show();
      $('.custShippingAddress').show();
      $('.customerAddDetails').hide();
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
        selfobj.model.set({ "ship_to": 'yes' });
        let cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if (cust) {
          $('.customerShippingDetails .custAddress').empty().append(cust.attributes.address);
        }
      } else {
        $('.customerShippingDetails .custAddress').empty();
        selfobj.model.set({ "ship_to": 'no' });
        selfobj.model.set({ shipping_address: '' });
      }
    },
    getcustomers: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#customerDropdown");
      if (name != "") {
        $.ajax({
          url: APIPATH + 'getInvoiceCustomer/',
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
            if (res.flag == "F") {
              showResponse('', res, '');
            }
            $(".textLoader").hide();
            dropdownContainer.empty();
            if (res.msg === "sucess") {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customers" style="background-color: #3F51B5; color:#ffffff;" > Add New Customer </div>');
              if (res.data.length > 0) {
                $.each(res.data, function (index, value) {
                  value.objectJson = JSON.stringify(value);
                  var words = value.name ? value.name.split(' ') : '';
                  var initials = words ? words.map(word => word.charAt(0)) : '';
                  value.initials = initials ? initials.join('').toUpperCase() : '';
                  console.log('customerLookupRow : ',customerLookupRow);
                  let template = _.template(customerLookupRow);
                  dropdownContainer.append(template({ cust: value }));
                  setToolTip()
                });
                dropdownContainer.show();
              }
            } else {
              dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "customers" style="background-color: #3F51B5; color:#ffffff;" > Customer not   found </div>');
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
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customerName": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).attr('data-name');
        var cust = $(e.currentTarget).attr('data-cust');
        if (cust != '') {
          cust = JSON.parse(cust);
        }
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        selfobj.customer = cust;
        $("#customerDropdown").hide();
        selfobj.updateTaxBox();
      }
      $('#customer_id').val(Name);
    },
    editCustomerDetails: function (e) {
      var dataView = $(e.currentTarget).attr('data-view');
      switch (dataView) {
        case 'product':
          new productSingleView({ searchProduct: this, product_id: null, menuId: this.productMenuId, form_label: 'Product', loadfrom: "TaxInvoice" });
          break;
        case 'customers':
          var customer_id = $(e.currentTarget).attr('data-customer_id');
          new customerSingleView({ searchCustomer: this, customer_id: customer_id, menuId: this.customerMenuId, loadfrom: "TaxInvoice", form_label: 'Add Customer' });
          break;
        default:
          break;
      }
      e.stopPropagation();
    },
    updateTaxBox: function () {
      var selfobj = this;
      var customer = selfobj.customer ? selfobj.customer : undefined;
      $(".cgst-lb, .sgst-lb, .igst-lb, .CGST, .SGST, .IGST").hide();
      if (!customer) {
        var cust = selfobj.customerList.models.find((item) => {
          return item && item.attributes && item.attributes.customer_id == selfobj.model.attributes.customer_id;
        });
        if (cust) {
          customer = cust.attributes;
        }
      }
      if (customer) {
        $('#custProfile, .customerDetails .custProfileDiv .cust-initials').hide();
        $('.customerDetails-card, .addshippingDetails-card').show();
        $('.customerDetailsDrop').hide();
        $('.custName').empty().append(customer.name);
        (customer.address) ? $('.custAddress').empty().append(customer.address) : $('.custAddress').empty().append('-');
        var words = customer.name ? customer.name.split(' ') : '';
        var initials = words ? words.map(word => word.charAt(0)) : '';
        initials = initials ? initials.join('').toUpperCase() : '';
        if(customer.customer_image) {
          $('#custProfile').show().attr('src', UPLOADS + '/customer/' + customer.customer_id + '/profilePic/' + customer.customer_image);
          // $('#custProfile').attr('src', UPLOADS + '/customer/' + customer.customer_id + '/profilePic/' + customer.customer_image); 
        }else{
          $('.customerDetails .custProfileDiv .cust-initials').show().text(initials);
        }
        $('.editCustomerDetails').attr('data-customer_id', customer.customer_id);
        // IF SHIPPING YES THEN SHOW SHIPPING CARD
        if (this.model.get('is_shipping') == 'yes') {
          $('.addshippingDetails-card').hide();
          $('.shippingDetails-card').show();
          (customer.address) ? $('#ship_to').removeAttr('disabled') : $('#ship_to').attr('disabled', true);
          if (selfobj.model.get("ship_to") == 'yes') {
            if (customer.address) {
              $('#ship_to').prop("checked", true);
            } else {
              $('#ship_to').prop("checked", false);
            }
          } else {
            if (selfobj.model.get("shipping_address") != '' && selfobj.model.get("shipping_address") != null && selfobj.model.get("shipping_address") != undefined) {
              var shippingAddress = selfobj.model.get("shipping_address");
              if (shippingAddress && shippingAddress.trim() !== '') {
                shippingAddress = JSON.parse(shippingAddress);
              }
              $('.customerShippingDetails .custAddress').empty().append(shippingAddress.full_address);
            }
          }
        } else {
          $('.shippingDetails-card').hide();
          $('.addshippingDetails-card').show();
          selfobj.model.set({ 'shipping_address': null });
          $('.customerShippingDetails .custAddress').empty();
        }
        console.log('selfobj.model : ', selfobj.model.attributes);
        var stateID = customer.gst_state;
        var gstStateCode = customer.gst_state_code;
        this.model.set({ "cust_state_id": stateID });
        this.model.set({ "gst_state_code": gstStateCode });
        const companyStateID = this.model.get('companyStateID');
        const isGSTBilling = this.model.get('isGstBilling');
        if (isGSTBilling == 'yes') {
          if (stateID && stateID == companyStateID) {
            $(".cgst-lb, .sgst-lb, .CGST, .SGST").show();
          } else {
            $(".igst-lb, .IGST").show();
          }
        }
        if (this.model.get('customer_id') == "" || typeof this.model.get('customer_id') == undefined) {
          $('.apply_tax-check').hide();
          $('.item_sgst').hide();
          $('.item_cgst').hide();
          $('.item_igst').hide();
        }
      }
    },
    changeCustomer: function (e) {
      $('.customerDetails-card').hide();
      $('.customerDetailsDrop').show();
    },
    changeShippingType: function (e) {
      $('.addshippingDetails-card').show();
      $('.shippingDetails-card').hide();
    },
    updateCompanyDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      selfobj.companySingleModel.set(newdetails);
      var companyID = DEFAULTCOMPANY;
      selfobj.companySingleModel.set({ 'infoID': companyID });
      selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
      selfobj.companySingleModel.save({}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: "POST"
      }).done(function (res){
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
      });
    },
    // ABOUT PRODUCTS
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
          if (res.flag == "F") showResponse('', res, '');
          if (res.flag == "S") {
            selfobj.model.set({ "narrList": res.data });
            selfobj.render();
          }
        }
      });
    },
    getProducts: function (e) {
      var lastID = $(e.currentTarget).attr("id");
      var lasts = lastID.split("_");
      var lastDetails = lasts[1];
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#productDropdown_" + lastDetails);
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
              if (res.data.length > 0) {
                $.each(res.data, function (index, value) {
                  Object.entries(value).forEach(([index, val]) => {
                    value[index] = (val == null) ? '' : val;
                  });
                  dropdownContainer.append('<div data-productID="' + value.product_id + '" id= "sd_' + lastDetails + '" class="dropdown-item selectProduct" style="background-color: #ffffff;"  data-with_gst="' + value.with_gst + '" data-actual_cost="' + value.actual_cost + '"  data-price="' + value.price + '" data-discount="' + value.discount + '" data-product_description	="' + value.product_description + '" data-unit="' + value.unit + '" data-gst="' + value.gst + '" data-discount_type="' + value.discount_type + '" >' + value.product_name + '</div>');
                });
                dropdownContainer.show();
              }
            } else {
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
      var productID = $(e.currentTarget).attr('data-productID');
      var product_name = $(e.currentTarget).clone().find('span').remove().end().text();
      var product_description = $(e.currentTarget).attr('data-product_description') ? $(e.currentTarget).attr('data-product_description') : '';
      var price = $(e.currentTarget).attr('data-price') ? $(e.currentTarget).attr('data-price') : '0.00';
      var discount = $(e.currentTarget).attr('data-discount') ? $(e.currentTarget).attr('data-discount') : '0';
      var discount_type = $(e.currentTarget).attr('data-discount_type');
      var unit = $(e.currentTarget).attr('data-unit');
      var gst = $(e.currentTarget).attr('data-gst');
      var with_gst = $(e.currentTarget).attr('data-with_gst');
      var actual_cost = $(e.currentTarget).attr('data-actual_cost');
      $("#productDropdown_" + lastDetails).hide();
      $('#narr_' + lastDetails).val(product_name);
      $('#desc_' + lastDetails).val(product_description);
      $('#narr_' + lastDetails).attr({ 'product_id': productID });
      $('#itemRate_' + lastDetails).val(actual_cost);
      $('#itemGST_' + lastDetails).val(gst);
      (discount == '' || discount == 0) ? $('#itemDiscount_' + lastDetails).val(0) : $('#itemDiscount_' + lastDetails).val(discount);
      $('#itemQuantity_' + lastDetails).val(1);
      $('#item-' + lastDetails).attr({ 'data-with_gst': with_gst });
      $("#itemUnit_" + lastDetails).val(unit).change();
      $("#itemDiscountType_" + lastDetails).val(discount_type).change();
      selfobj.setnarration(productID, lastDetails);
      if (price != '') {
        selfobj.rowTotal();
      }
    },
    getPaymentLogs: function (invoiceID) {
      $('#paylogs').empty();
      $.ajax({
        url: APIPATH + 'paymentLogsList/' + invoiceID,
        method: 'POST',
        data: {},
        datatype: 'JSON',
        beforeSend: function (request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            showResponse('', res, '');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            if (res.data.length > 0) {
              var logsTotal = 0;
              var tbl = '<tbody id="receiptList"></tbody>'
              $('#receipt-table').append(tbl);
              var row = '';
              $.each(res.data, function (key, value) {
                row = '<tr><th style="width:50%;text-align:left">' + value.receipt_number + '</th><td style="text-align:right">' + numberFormat(value.amount, 2) + '</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
                $('#receiptList').append(row);
                logsTotal += parseFloat(value.amount);
              });

              row = '<tr><th style="width:50%;text-align:left">Receipts Total</th><td align="right">' + numberFormat(logsTotal, 2) + '</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);

              var pendingAmt = parseFloat(selfobj.model.get('grossAmount')) - logsTotal;
              row = '<tr><th style="width:50%;text-align:left"> Pending Amount </th><td align="right">' + numberFormat(pendingAmt, 2) + '</td></tr>' //<td>'+value.transaction_id+'</td><td>'+formatDate(value.payment_log_date)+'</td><td>'+value.paymentMode+'</td><td>'+formatDate(value.created_date)+'</td><td><a href="'+UPLOADS+'/invoiceLog/'+value.invoice_id+'/'+value.payment_log_id+'/'+value.attachement+'" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a></td>
              $('#receiptList').append(row);
            }
          }
        }
      });
    },
    getNextDocNum: function () {
      selfobj = this;
      var company_id = $.cookie('company_id');
      $.ajax({
        url: APIPATH + 'getNextDocNumber/' + selfobj.menuName,
        method: 'GET',
        datatype: 'JSON',
        data: { 'company_id': company_id },
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse('', res, '');
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
    saveRow: function(e) {
      e.preventDefault();
      var template = _.template(invoiceRowPlain);
      $('#invoiceLineRows').append(template({row_number: 1+1}));
    },
    // ABOUT ADITIONAL CHARGES
    addAdditionalCharges: function (e) {
      var selfobj = this;
      var isGstBilling = selfobj.model.get('isGstBilling');
      var largest = this.model.get('largestGst');
      var lastChildId = $('.addAdditionalFields .fieldsSelection:last').attr('id');
      // console.log("largest gst", largest); 
      if (lastChildId) {
        var numericPart = lastChildId.match(/\d+/);
        this.rowCounter = numericPart[0];
      } else {
        this.rowCounter = 0;
      }
      this.rowCounter++;
      var template = _.template(additionalCharges_temp);
      $(".addAdditionalFields").append(template({ rowCounter: this.rowCounter, isGstBilling: isGstBilling, largest: largest}));
      // console.log("largest gst", largest);
      
      // $('input[name="field_gst"]').val(this.model.get('largestGst'));
      if ($('.addAdditionalFields .fieldsSelection').length === 3) {
        $('.addCharges').attr('disabled', 'disabled');
        $('.addCharges').css('color', '#838689');
      } else {
        $('.addCharges').removeAttr('disabled');
        $('.addCharges').css('color', '#0B78F9');
      }
    },
    ShowAdditionalCharges: function () {
      var selfobj = this;
      if (this.model.get('additional_char') != undefined) {
        var charges = JSON.parse(this.model.get('additional_char'));
        var template = _.template(additionalCharges_temp);
        var isGstBilling = selfobj.model.get('isGstBilling');
        var largest = this.model.get('largestGst');
        this.rowCounter = 1;
        Object.values(charges).forEach(item => {
          $(".addAdditionalFields").append(template({ rowCounter: this.rowCounter ,isGstBilling: isGstBilling,largest: largest}));
          $('#field_title_' + this.rowCounter).val(item.title);
          $('#field_rate_' + this.rowCounter).val(item.rate);
          $('#field_gst_' + this.rowCounter).val(item.gst);
          this.rowCounter++;
        });
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
      } else {
        $('.addCharges').attr('disabled', 'disabled');
        $('.addCharges').css('color', '#838689');
      }
      selfobj.rowTotal();
    },
    // PAYMENTS LOGS IN ADDITIONAL CHARGES
    ShowPaymentLogs: function () {
      this.logsAmt = 0;
      this.receiptStr = '';
      var logs = this.model.get('paymentLogs');
      if (logs != undefined && logs != '') {
        logs.forEach((log) => {
          this.logsAmt = this.logsAmt + parseInt(log.amount);
          if (this.receiptStr == '')
            this.receiptStr = this.receiptStr + '#' + log.receipt_number;
          else
            this.receiptStr = this.receiptStr + ', #' + log.receipt_number;
        });
        $('.LogsPayment').show();
        $('.logsAmt').html('-' + this.logsAmt);
        $('.receiptStr').html(this.receiptStr);
      }
    },
    // INVOICE LINE ROWS MANIPULATION
    addemptyRow: function (e) {
      e.preventDefault();
      var lastID = $("tr.item-list-box:last").attr("id");
      var lasts = lastID.split("-");
      var lastDetails = parseInt(lasts[1]);
      var slug_id = '';
      $.each(this.categoryList.models, function (key, val) {
        if (val.attributes.slug == 'unit') {
          slug_id = val.attributes.category_id;
        }
      })
      var template = _.template(invoiceNewRow);
      $(".items-holder").append(template({ categoryList: this.categoryList, slug_id: slug_id, row_number: (lastDetails + 1), model: selfobj.model.attributes }));
      setTimeout(function () {
        var di = "narr_" + (lastDetails + 1);
        $("#" + di).focus();
      }, 200);
      $('.digits').inputmask('Regex', { regex: "^[0-9]{1,15}(\\.\\d{1,2})?$" });
      $('.percentage').inputmask('Regex', { regex: "^[0-9]{1,2}(\\.\\d{1,2})?$" });
      this.rowTotal(e);
      this.reArrangeIndex();
      this.updateTaxBox();
      $('.ws-select').selectpicker();
    },
    addRow: function (e) {
      e.preventDefault();
      var lastDetails = 0;
      var slug_id = '';
      $.each(this.categoryList.models, function (key, val) {
        if (val.attributes.slug == 'unit') {
          slug_id = val.attributes.category_id;
        }
      })
      var template = _.template(invoiceNewRow);
      $(".items-holder").append(template({ categoryList: this.categoryList, slug_id: slug_id, row_number: (lastDetails + 1), model: selfobj.model.attributes }));
      setTimeout(function () {
        var di = "narr_" + (lastDetails + 1);
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
      $("#item-" + lastDetails).remove();
      this.reArrangeIndex();
      this.rowTotal(e);
      if (tr_length == 1) {
        this.addRow(e);
      }
    },
    delAllRows: function (e) {
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
    setFocusOnNewRow: function (e) {
      $('tr.item-list-box input').on('keydown', function (e) {
        if (e.key === 'Tab') {
          if ($(this).attr('id').includes('itemtotal')) {
            $('#addRow').focus();
            console.log('dsadad:', $(this).attr('id'));
          }
        }
      });
    },
    // INVOICE CALCULATION ONLY
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
      this.calculateRowTotal();
      this.calculateAdditionalCharges();
      this.showInvoiceSummary();
      this.showPayDetails();
    },
    validateRow: function () {
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
        var itemQuantity = $("#itemQuantity_" + lastDetails).val();
        var itemRate = $("#itemRate_" + lastDetails).val();
        if (itemQuantity == "" || itemQuantity == 0) {
          error.push("Item quantity can not blank. Row No." + row);
        }
        if (selfobj.menuName != "delivery") {
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
        showResponse('', { flag: 'F', msg: er }, '');
        return false;
      } else {
        return true;
      }
    },
    // CALCULATE ROW TOTAL
    calculateRowTotal: function () {
      var selfobj = this;
      selfobj.rows = [];
      $("tr.item-list-box").each(function () {
        var rowCal = {};
        const lastID = $(this).attr("id");
        const lastDetails = lastID.split("-")[1];
        rowCal.srno = $(this).find('.sno').html(); // lastDetails ;
        rowCal.invoiceID = selfobj.model.get("invoiceID");
        //rowCal.srno = lastDetails;
        rowCal.itemDiscount = parseFloat($("#itemDiscount_" + lastDetails).val()) || 0;
        rowCal.quantity = parseFloat($("#itemQuantity_" + lastDetails).val()) || 0;
        rowCal.itemDiscountType = $("#itemDiscountType_" + lastDetails).val();
        rowCal.rate = parseFloat($("#itemRate_" + lastDetails).val()) || 0;
        rowCal.rate1 = parseFloat($("#itemRate_" + lastDetails).val()) || 0;
        rowCal.interGstPercent = parseFloat($("#itemGST_" + lastDetails).val()) || 0;
        rowCal.interGstAmount = $(".itemGstAmt_" + lastDetails).text();
        rowCal.withGst = ($("#item-" + lastDetails).attr('data-with_gst')) ? $("#item-" + lastDetails).attr('data-with_gst') : 'no';
        rowCal.unit = $("#itemUnit_" + lastDetails).val();
        rowCal.invoiceLineChrgID = ($("#narr_" + lastDetails).attr('product_id')) ? $("#narr_" + lastDetails).attr('product_id') : '';
        rowCal.product_name = $("#narr_" + lastDetails).val();
        rowCal.invoiceLineNarr = $("#desc_" + lastDetails).val();

        // ROW TOTAL
        rowCal.itemtotal = rowCal.rowPriceTotal = rowCal.quantity * rowCal.rate;

        // QUANTITY TOTAL
        selfobj.InheaderInfo.TotalQty += rowCal.quantity;

        // APPLY DISCOUNT
        rowCal = selfobj.calculateDiscount(rowCal);

        // APPLY GST
        rowCal = selfobj.calculateGST(rowCal);

        rowCal.rowGstTotal = rowCal.gst * rowCal.quantity;

        // HIDE / SHOW GST 
        if (selfobj.InheaderInfo.isGstBilling === 'yes') {
          (rowCal.withGst == 'yes' || rowCal.withGst == 'y') ?
            $('.withGstIcon_' + lastDetails).show() :
            $('.withGstIcon_' + lastDetails).hide();
          $(".itemWithGSTAmt_" + lastDetails).empty().html(numberFormat(rowCal.rate1, 2)).hide();
          $("#itemGstAmt_" + lastDetails).val('0.00').val(numberFormat(rowCal.gst, 2));
          // UPDATE TOTAL PRICE
          selfobj.InheaderInfo.TotalPrice += rowCal.itemtotal - (rowCal.gst * rowCal.quantity);
          $("#cgst_td_" + lastDetails + ",#sgst_td_" + lastDetails).val('0.00').val(numberFormat((rowCal.rowGstTotal / 2), 2));
          $("#igst_td_" + lastDetails).val('0.00').val(numberFormat(rowCal.rowGstTotal, 2));
          if (selfobj.InheaderInfo.custStateID && selfobj.InheaderInfo.custStateID == selfobj.InheaderInfo.companyStateID) {
            $(".cgst_td_" + lastDetails + ",.sgst_td_" + lastDetails).show();
            $(".igst_td_" + lastDetails).hide();
          } else {
            $(".cgst_td_" + lastDetails + ",.sgst_td_" + lastDetails).hide();
            $(".igst_td_" + lastDetails).show();
          }
        } else {
          selfobj.InheaderInfo.TotalPrice += rowCal.itemtotal;
        }
        $("#itemtotal_" + lastDetails).val('0.00').val(numberFormat(rowCal.itemtotal, 2));
        $("#itemPricetotal_" + lastDetails).val('0.00').val(numberFormat(rowCal.rowPriceTotal, 2));
        selfobj.InheaderInfo.subtotal += (rowCal.itemtotal + rowCal.itemGstTotal);
        selfobj.rows.push(rowCal);
        console.log('ROW - ' + lastDetails, rowCal);
      });
    },
    // APPLY DISCOUNT
    calculateDiscount: function (rowCal) {
      var selfobj = this;
      if (rowCal.itemDiscount) {
        rowCal.discount = 0;
        if (rowCal.itemDiscountType === 'amt') {
          rowCal.discount = rowCal.itemDiscount * rowCal.quantity;
          rowCal.itemtotal -= rowCal.discount;
          rowCal.rowPriceTotal -= rowCal.discount;
          if (rowCal.itemDiscount <= rowCal.rate1) {
            rowCal.rate1 -= rowCal.itemDiscount;
          } else {
            showResponse('', { flag: 'F', msg: 'Discount is greater than price!' }, '');
          }
        } else {
          rowCal.discount = rowCal.itemtotal * (rowCal.itemDiscount / 100);
          rowCal.itemtotal -= rowCal.discount;
          rowCal.rowPriceTotal -= rowCal.discount;
          rowCal.rate1 -= rowCal.rate1 * (rowCal.itemDiscount / 100);
        }
        selfobj.InheaderInfo.TotalDiscount += rowCal.discount;
      }
      return rowCal;
    },
    // APPLY GST
    calculateGST: function (rowCal) {
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
        } else {
          rowCal.gst = rowCal.rate1 * (rowCal.interGstPercent / 100);
          rowCal.gstAmt += rowCal.gst;
          rowCal.itemtotal += rowCal.gst * rowCal.quantity;
          rowCal.rowPriceTotal = rowCal.rate1 * rowCal.quantity;
          selfobj.InheaderInfo.TotalGST += rowCal.gst * rowCal.quantity;
        }
      }
      return rowCal;
    },
    // AMOUNTS TO WORDS
    numberToWords: function (number) {
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
      if (number >= 20) {
        words += tens[Math.floor(number / 10)];
        if (number % 10 !== 0) {
          words += ' ' + ones[Math.floor(number % 10)];
        }
        else {
          words += '';
        }
        number %= 10;
      } else if (number >= 10 && number <= 19) {
        words += teens[number - 10];
      } else if (number > 0) {
        words += ones[Math.floor(number)];
      }
      return words.trim().toUpperCase();
    },
    // CALCULATE ADDITTIONAL CHARGES
    calculateAdditionalCharges: function () {
      selfobj = this;
      let additional_ch = 0;
      let additional_gst = 0;
      let adI = 1;
      $(".fieldsSelection input[name='field_rate']").each(function () {
        var rate = parseFloat($(this).val()) || 0;
        var addChargesRow = rate * (selfobj.InheaderInfo.largestgst / 100);
        addChargesRow = rate + addChargesRow;
        additional_ch += parseFloat($(this).val()) || 0;
        $("#field_gst_" + adI).val(selfobj.InheaderInfo.largestgst);
        $("#addChargesTotal_" + adI).empty().html(addChargesRow);
        if (selfobj.InheaderInfo.isGstBilling === 'yes') {
          additional_gst = additional_ch * (selfobj.InheaderInfo.largestgst / 100);
        }
        adI++;
      });
      selfobj.model.set({ 'additionalCharges': additional_ch });
      selfobj.InheaderInfo.additionalCharges = additional_ch;
      selfobj.InheaderInfo.additionalChargesGST = additional_gst;
      additional_ch = additional_ch + additional_gst;
      selfobj.InheaderInfo.GrossTotal = (selfobj.InheaderInfo.TotalPrice + selfobj.InheaderInfo.TotalGST) + additional_ch;
    },
    // SHOW TOTAL CALCULATIONS
    showInvoiceSummary: function () {
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
      $(".subTotal").html(numberFormat(selfobj.InheaderInfo.TotalPrice, 2));
      $(".qtyTotal").html(numberFormat(selfobj.InheaderInfo.TotalQty, 2));
      $(".discTotal").html(numberFormat(selfobj.InheaderInfo.TotalDiscount, 2));
      $(".priceTotal").html(numberFormat((selfobj.InheaderInfo.TotalPrice), 2));
      $(".grossAmount").html(numberFormat(selfobj.InheaderInfo.GrossTotal, 2));
      $(".amtInWords").html(selfobj.numberToWords(selfobj.InheaderInfo.GrossTotal));

      // IF isGSTBilling is "yes" 
      $(".igst,.igstTotal").html(numberFormat(selfobj.InheaderInfo.TotalGST, 2));
      $(".cgst,.sgst,.sgstTotal,.cgstTotal").html(numberFormat((selfobj.InheaderInfo.TotalGST / 2), 2));
      $(".gstTotal").html(numberFormat((selfobj.InheaderInfo.TotalGST), 2));
      if (selfobj.InheaderInfo.isGstBilling == 'yes') {
        if (selfobj.InheaderInfo.custStateID && selfobj.InheaderInfo.custStateID == selfobj.InheaderInfo.companyStateID) {
          $(".cgst,.sgst,.sgstTotal,.cgstTotal").show();
          $(".cgst-lb,.sgst-lb").show();
        } else {
          $(".igst,.igstTotal").show();
          $(".igst-lb").show();
        }
      }
      // TOGGLE ROUNDOFF
      if ($('#roundOff').prop('checked')) {
        const rrd = numberFormat(selfobj.InheaderInfo.GrossTotal, 2) - Math.round(numberFormat(selfobj.InheaderInfo.GrossTotal, 2));
        $(".roundOff").show();
        $(".roundOff").html(numberFormat(rrd, 2));
        $(".grossAmount").html(numberFormat(Math.round(selfobj.InheaderInfo.GrossTotal), 2));
        selfobj.InheaderInfo.roundOff = numberFormat(Math.round(selfobj.InheaderInfo.GrossTotal), 2);
      } else {
        $(".roundOff").hide();
      }
      $(".diginum").digits();
    },
    convert_invoice: function (e) {
      e.preventDefault();
      var selfobj = this;
      if (selfobj.model.get('invoiceID') != null && selfobj.model.get('invoiceID') != undefined) {
        selfobj.getPaymentLogs(selfobj.model.get('invoiceID'));
      }
    },
    clearPaymentStatus: function (e) {
      var selfobj = this;
      selfobj.model.set({ 'payment_status': 'partially' })
      selfobj.model.set({ 'payment_date': '' })
      selfobj.model.set({ 'payment_amount': '' })
      selfobj.model.set({ 'mode_of_payment': '' })
      selfobj.model.set({ 'transaction_id': '' })
      $('.payment_status.multiSel').removeClass('active');
      $('.log').hide();
    },
    showPayDetails: function () {
      if (selfobj.model.get('payment_status') == 'fully') {
        $('#payment_amount').val(selfobj.InheaderInfo.GrossTotal).focus();
        $('#payment_date').val($('#invoiceDate').val());
        $('#payment_amount').attr('disabled', 'disabled');
        $('#payment_date').attr('disabled', 'disabled');
      } else {
        $('#payment_amount').val('');
        $('#payment_date').val('');
        $('#payment_amount').removeAttr('disabled');
        $('#payment_date').removeAttr('disabled');
      }
    },
    validateHeaderInfo: function () {
      var selfobj = this;
      if (selfobj.InheaderInfo.customerID == null || selfobj.InheaderInfo.customerID == 0 || selfobj.InheaderInfo.customerID == undefined) {
        showResponse('', { flag: 'F', msg: 'Please Select Customer' }, '');
        return false;
      } else {
        return true;
      }
    },
    saveTaxInvoiceDetails: function (e) {
      // e.preventDefault();  
      invoiceItemsDetails.reset();
      var selfobj = this;
      (selfobj.model.get("ship_to") == 'yes') ? selfobj.model.set({ shipping_address: '' }) : selfobj.model.set({ shipping_address: selfobj.model.get("shipping_address") });
      let isNew = $(e.currentTarget).attr("data-action");
      var tmpinvoiceID = this.model.get("invoiceID");
      var invoiceID = null;
      selfobj.InheaderInfo.isnewInvoice = 'no';
      (tmpinvoiceID != '' || tmpinvoiceID != 0) ? invoiceID = tmpinvoiceID : invoiceID = null;
      if (invoiceID == null) {
        selfobj.InheaderInfo.isnewInvoice = 'yes';
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
          "title": title,
          "rate": rate,
          "gst": gst,
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
      selfobj.InheaderInfo.shipping_mobile = selfobj.model.get("shipping_mobile") ? selfobj.model.get("shipping_mobile") : '';
      selfobj.InheaderInfo.record_type = selfobj.menuName;
      selfobj.InheaderInfo.related_to = (selfobj.model.get("related_to")) ? selfobj.model.get("related_to") : '';
      selfobj.InheaderInfo.project_id = (selfobj.model.get("project_id")) ? selfobj.model.get("project_id") : '';
      selfobj.InheaderInfo.is_shipping = (selfobj.model.get("is_shipping")) ? selfobj.model.get("is_shipping") : 'no';
      if (selfobj.InheaderInfo.related_to == 'projects' && selfobj.InheaderInfo.project_id == '') {
        showResponse('', { msg: 'Please Select Project', flag: 'F' }, "");
        return;
      }
      if (!selfobj.InheaderInfo.isGstBilling) {
        selfobj.InheaderInfo.isGstBilling = selfobj.model.get('isGstBilling');
      }
      // PAYMENT DETAILS
      selfobj.InheaderInfo.payment_date = this.model.get("payment_date") == '' || this.model.get("payment_date") == undefined ? '' : this.model.get("payment_date");
      selfobj.InheaderInfo.payment_amount = this.model.get("payment_amount") == '' || this.model.get("payment_amount") == undefined ? '' : this.model.get("payment_amount");
      if (selfobj.InheaderInfo.GrossTotal < selfobj.InheaderInfo.payment_amount) {
        showResponse('', { flag: 'F', msg: 'Payment Amount is Greater than Total amount..!' }, '');
        return;
      }
      selfobj.InheaderInfo.payment_mode = this.model.get("mode_of_payment") == '' || this.model.get("mode_of_payment") == undefined ? '' : this.model.get("mode_of_payment");
      selfobj.InheaderInfo.transaction_id = this.model.get("transaction_id") == '' || this.model.get("transaction_id") == undefined ? '' : this.model.get("transaction_id");
      selfobj.InheaderInfo.payment_status = selfobj.model.get("payment_status");
      console.log('InheaderInfo', selfobj.InheaderInfo);
      invoiceItemsDetails.add(selfobj.InheaderInfo);
      // INVOICELINE ROWS DETAILS
      $.each(selfobj.rows, function (key, val) {
        invoiceItemsDetails.add(val);
      });
      if (!selfobj.validateHeaderInfo()) {
        return;
      }
      if (!selfobj.validateRow()) {
        return;
      }
      if (invoiceID != null) {
        if (permission.edit == "yes") {
          method = "update";
        }
        else {
          Swal.fire({ title: 'Failed !', text: "You don`t have permission to edit", timer: 2000, icon: 'error', showConfirmButton: false });
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
          showResponse('', res, '');
          $(e.currentTarget).html("<span>Error</span>");
          (isNew == "new") ? $(e.currentTarget).html("<span>Save & New</span>") : $(e.currentTarget).html("<span>Save</span>");
          $(e.currentTarget).removeAttr("disabled");
        } else {
          $(e.currentTarget).html("<span>Saved</span>");

          if (res.flag == "S") {
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if (res.lastInvoiceID != undefined) {
              selfobj.lastInvoiceID = res.lastInvoiceID;
              invoiceID = selfobj.lastInvoiceID;
            }
            // SHOW PREVIEW OF INVOICE
            if (invoiceID) {
              // IF IS NEW 
              if (isNew == "new") {
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.rows = [];
                selfobj.nextInNumber = '';
                selfobj.InheaderInfo = {};
                selfobj.getNextDocNum();
                selfobj.customer = null;
                selfobj.model.set({ menuId: selfobj.menuId });
                selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {}, });
                selfobj.render();
              } else {
                handelClose(selfobj.toClose);
                new invoicePreview({ invoiceID: invoiceID, parentObj: selfobj.scanDetails, menuId: selfobj.menuId, form_label: 'Preview', menuName: this.menuName });
              }
            }
            selfobj.scanDetails.filterSearch();
          }
        }
        setTimeout(function (e) {
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
      if (selfobj.menuName == 'quotation') {
        var editor = new Quill($("#quotation_terms_conditions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      } else if (selfobj.menuName == 'invoice') {
        var editor = new Quill($("#invoice_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      } else if (selfobj.menuName == 'receipt') {
        var editor = new Quill($("#receipt_terms_condotions").get(0), {
          modules: {
            toolbar: __toolbarOptions,
          },
          theme: "snow",
        });
      }
      if (editor) {
        editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = editor.getContents();
            var text = editor.getText();
            var justHtml = editor.root.innerHTML;
            selfobj.companySingleModel.set({ 'infoID': DEFAULTCOMPANY });
            selfobj.companySingleModel.set({ "menuId": selfobj.companyMenuID });
            if (selfobj.menuName == 'quotation') {
              selfobj.companySingleModel.set({ "quotation_terms_conditions": justHtml });
            } else if (selfobj.menuName == 'invoice') {
              selfobj.companySingleModel.set({ "invoice_terms_condotions": justHtml });
            } else if (selfobj.menuName == 'receipt') {
              selfobj.companySingleModel.set({ "receipt_terms_condotions": justHtml });
            }
            selfobj.companySingleModel.save({}, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: "POST"
            }).done(function (res) {
              if (res.flag == "F") showResponse('', res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            });
          }
        });
      }
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = taxInvoice_temp;
      if (selfobj.model.get('is_gst_billing')) {
        selfobj.model.set({ "isGstBilling": selfobj.model.get('is_gst_billing') });
      }
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes, rows: this.rows, menuName: this.menuName, categoryList: selfobj.categoryList.models, companyDetails: selfobj.companyDetails ? selfobj.companyDetails[0] : [], projectsList: this.projectsList.models, unitSlug: this.unitSlug }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      $('.overlay-main-container.open').addClass('invoice');
      $('.invoice .ws-tab.tab-content').css('padding', '15px 0px');
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.fromEditors();
      setToolTip()
      this.updateTaxBox();
      this.reArrangeIndex();
      if (selfobj.model.get("invoiceID") != null && selfobj.model.get("invoiceID") != '') {
        selfobj.rowTotal();
        selfobj.ShowAdditionalCharges();
        selfobj.ShowPaymentLogs();
      } else {
        $('#invoiceNumber').val(selfobj.nextInNumber);
      }
      if (this.rows.length != 0) {
        this.rowTotal();
      }
      this.setFocusOnNewRow();
      this.delegateEvents();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return taxInvoiceSingleView;
});
