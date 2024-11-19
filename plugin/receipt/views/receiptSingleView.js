define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Swal',
  "../../customer/collections/customerCollection",
  "../../category/collections/slugCollection",
  '../../projects/collections/projectsCollection',
  '../../accounts/collections/accountCollection',

  '../models/receiptSingleModel',

  'text!../templates/receiptSingle_temp.html',

  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../../readFiles/views/readFilesView',
  '../../customer/views/customerSingleView',
  '../../admin/views/addAdminView',
  '../../accounts/views/accountSingleView',
  '../../core/views/appSettings',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, customerCollection, slugCollection, projectsCollection, accountCollection, receiptSingleModel, receipttemp, multiselectOptions, dynamicFieldRender, readFilesView, customerSingleView, addAdminView, accountSingleView,appSettings) {

  var receiptSingleView = Backbone.View.extend({
    model: receiptSingleModel,
    form_label: '',
    initialize: function (options) {
      var selfobj = this;
      this.form_label = options.form_label;
      this.amt = 0;
      this.toClose = "receiptSingleView";
      this.pluginName = "receiptList";
      this.menuId = options.menuId;
      this.loadFrom = options.loadFrom;
      this.customer_id = options.customer_id;
      this.projectID = options.project_id;
      if (options.menuName && options.menuName != '') {
        this.customerMenuID = ROLE['customer'].menuID;  
      }
      this.appSettings = new appSettings();
      this.customerMenuID = ROLE['customer'].menuID;
      this.accountMenu = ROLE['accounts'];
      this.model = new receiptSingleModel();
      this.model.set({ menuId: options.menuId });
      this.model.set({ company_id: DEFAULTCOMPANY });
      this.dynamicFieldRenderobj = new dynamicFieldRender({
        ViewObj: selfobj,
        formJson: {},
      });
      this.projectsList = new projectsCollection(),
        this.accounts = new accountCollection();
      this.scanDetails = options.searchreceipt;
      this.multiselectOptions = new multiselectOptions();
      this.expectedIncomeList = [];
      $(".modelbox").hide();
      $(".popupLoader").show();

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'payment_mode' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('.loder').hide();
        selfobj.render();
      });
      this.refreshProject();
      this.refreshAccounts();

      this.model.set({
        revenueType: options.revenueType,
        loadFrom: options.loadFrom,
        customer_id: options.customer_id,
        record_id: options.project_id,
        related_to: options.related_to
      });
      this.getIndividualCustomer();
      if (selfobj.model.get('loadFrom') == 'project' && selfobj.model.get('customer_id')) {
        this.getExpectedIncomList();
      }
      if (options.receipt_id != "") {
        this.model.set({ receipt_id: options.receipt_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == 'S') {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.dynamicFieldRenderobj.prepareForm();
            selfobj.render();
            selfobj.setOldValues();
          }
        });
      }
    },
    events: {
      "click .savereceiptDetails": "savereceiptDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "input .custChange": "getcustomers",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "change .logoAdded": "updateImageLogo",
      "click .dotborder": "loadMedia",
      "click .multiOptionSel": "setValues",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "input .ws-freetxt": "getfreetext",
      "focus .ws-freetxt": "getfreetext",
      "click .selectFreeRecord": "updateDataFreeTxt",
      "click .addNewRecord": "addNew",
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".column-loader").hide();
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
      if (toID == 'related_to' && valuetxt != '') {
        this.render();
      }
      if (toID == 'account_id' && valuetxt == 'addNewBankAccount') {
        new accountSingleView({ searchaccount: selfobj, menuId: selfobj.accountMenu.menuID, form_label: 'Account', menuName: 'accounts', loadFrom: 'receipts' });
      }
      if (toID == 'income_id' && valuetxt != '') {
        var expInc = this.expectedIncomeList.filter((income) => income.income_id == valuetxt);
        console.log('expInc: ',expInc);
        if (expInc.length != 0) {
          expInc = expInc[0];
          if ( expInc.account_id != undefined && expInc.account_id != '') {
            var expIncAccount = expInc.account_id;
            if (expIncAccount) {
              selfobj.model.set({ 'account_id': expIncAccount });
            }
            selfobj.render();
          }
        }
      }
    },
    getfreetext:function(e){
      let type = $(e.currentTarget).attr("id");
      console.log(type);
      switch (type) {
          case "customer_id":
            this.getcustomers(e);
          break;
        default:
          break;
      }
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
    refreshAccounts: function () {
      let selfobj = this;
      this.accounts.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', 'fetchFrom': 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("expensesList", res.data);
        $('body').find(".loder").hide();
        selfobj.render();
      });
    },
    addNew: function (e) {
      var view = $(e.currentTarget).attr('data-view');
      switch (view) {
        case 'customers':
          new customerSingleView({ searchCustomer: this, loadFrom: "ReceiptSingleView", form_label: 'Add Customer' });
          break;
        case 'acknowledge_by':
          new addAdminView({ searchadmin: this, loadFrom: "ReceiptSingleView", form_label: 'Add Referal' });
          break;
        default:
          break;
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
      setvalues = ["show_history"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "receipt_image": url });
    },
    loadMedia: function (e) {
      // alert()
      $('.upload').show();
      $('.dotborder').hide();
    },
    // loadMedia: function (e) {
    //   e.stopPropagation();
    //   $('#largeModal').modal('toggle');
    //   this.elm = "profile_pic";
    //   new readFilesView({ loadFrom: "addpage", loadController: this });
    // },
    savereceiptDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("receipt_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      console.log('this model : ', this.model);
      if ($("#receiptDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }

          if (res.flag == "S") {
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if (res.lastInvoiceID != undefined) {
              selfobj.lastInvoiceID = res.lastInvoiceID;
            } else {
              selfobj.lastInvoiceID = 0;
            }
            let url = APIPATH + 'logsUpload/' + selfobj.logID + '/' + selfobj.lastInvoiceID;
            selfobj.uploadFileEl.elements.parameters.action = url;
            selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: options.menuId });
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
            } else {
              if (selfobj.loadFrom == 'project') {
                // selfobj.scanDetails.render();
                selfobj.scanDetails.getFinenceDetails();
              } else {            
                selfobj.scanDetails.filterSearch();
              }
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        customer_id: {
          required: true,
        },
        account_id: {
          required: true,
        },
        amount: {
          min: 1,
          required: true,
        },
        mode_of_payment: {
          required: true,
        },
        payment_log_date: {
          required: true,
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
      }
      var messages = {
        customer_id: "Customer is Required..!",
        mode_of_payment: "Payment Mode is Required..!",
        account_id: "Bank Account is Required..!",
        amount: {
          required: "Payment Amount is Required..!",
          min: "Payment Amount should be greater than 0 ..!",
        },
        payment_mode: "Payment Mode is Required..!",
        payment_log_date: "Payment Date is Required..!"
      };

      $("#receiptDetails").validate({
        rules: feildsrules,
        messages: messages,
      });

      $('#payment_log_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#payment_log_date').change();
        var valuetxt = $("#payment_log_date").val();
        selfobj.model.set({ payment_log_date: valuetxt });
      });
    },
    getIndividualCustomer: function () {
      var selfobj = this;
      var customer_id = this.model.get('customer_id');
      if (customer_id) {
        $.ajax({
          url: APIPATH + 'customerMaster/' + customer_id,
          method: 'GET',
          data: { menuId: selfobj.customerMenuID },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            console.log('Customer Master Res : ', res);
            if (res.flag == 'S' && res.data != []) {
              data = res.data[0];
              selfobj.model.set({ customer_name: data.name });
            }
          }
        });
      }
    },
    getExpectedIncomList: function () {
      var selfobj = this;
      var customer_id = this.model.get('customer_id');
      var record_type = 'revenue';
      if (customer_id) {
        $.ajax({
          url: APIPATH + 'getExpectedIncomeList/',
          method: 'GET',
          data: { customer_id: customer_id, record_type: record_type },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            console.log('getExpectedIncomeList : ', res);
            if (res.flag == 'S' && res.data != []) {
              selfobj.expectedIncomeList = res.data;
            }
          }
        });
      }
    },
    getcustomers:function(e){
      var selfobj = this;
      let data = {"source":'customer',"check":'name',"list":'name,customer_id,type',"stat":false};
      this.appSettings.getFreeSearchList(e,data,function(e,res){
        $(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="customers"> Add New Customer </div>');
        if (res.msg === "sucess"){
          if (res.data.length > 0){
            $.each(res.data, function (index, value){
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="customer_id" data-record_id=' + value.customer_id + '>' + value.name +'(' + value.type.charAt(0) + ')'+'</div>');
              dropdownContainer.show();
            });
          }
        }else{
          console.log("Now Hwreiuyiuyiu");
          
          selfobj.model.set("customer_id",null);
        }
        $(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    updateDataFreeTxt:function(e){
      e.stopPropagation();
      let selfobj = this;
      let toID = $(e.currentTarget).attr("data-update");
      let record_id = $(e.currentTarget).attr("data-record_id");
      let newdetails = [];
      newdetails["" + toID] = record_id;
      this.model.set(newdetails);
      $(e.currentTarget).closest(".form-group").find("input").val($(e.currentTarget).text());
      selfobj.model.set({ "customer_name": $(e.currentTarget).text() });
      $(".freeSerachList").hide();
    },
    setCustomer: function (e) {
      e.preventDefault();
      let selfobj = this;
      if (selfobj.loadFrom == 'customer') {
        var Name = selfobj.customerName;
        var customerID = selfobj.customerID;
        selfobj.model.set({ "customer_name": Name });
        selfobj.model.set({ "customer_id": customerID });
      } else {
        var Name = $(e.currentTarget).text();
        var customerID = $(e.currentTarget).attr('data-customerID');
        selfobj.model.set({ "customer_id": customerID });
        selfobj.model.set({ "customer_name": Name });
        $("#customerDropdown").hide();
        selfobj.getAllInvoices(customerID);
      }
      $('#customer_id').val(Name);
    },
    getAllInvoices: function (customerID) {
      var selfobj = this;
      $.ajax({
        url: APIPATH + 'getAllInvoices',
        method: 'POST',
        data: { 'customerID': customerID, 'status': 'approved' },
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
          // console.log(res);
          $('.invoices_body').empty();
          $('.remainingAmt').remove();
          if (res.flag === "S" && res.data.length > 0) {
            var tr = '';
            tr = '<tr class="head" ><th class="ml-2">Invoice Number</th><th>Invoice Date</th><th>Invoice Total</th><th>Pending Amount</th><th>Pay Amount</th><th>After Paid Amount</th></tr>';
            $.each(res.data, function (index, value) {
              tr += '<tr class="tr" data-id="' + value.invoiceID + '"><td class="ml-2">' + value.invoiceNumber + '</td><td>' + value.invoiceDate + '</td><td>' + value.grossAmount + '</td><td class="pending_amt" id="pending_amt_' + (index + 1) + '" >' + value.pending_amount + '</td><td id="payment_amt_' + (index + 1) + '" ></td><td id="afterPay_amt_' + (index + 1) + '" ></td></tr>';
            });
            $('.invoices_body').append(tr);
            selfobj.minusAmt();
          }
        }
      });
    },
    minusAmt: function () {
      console.clear();
      var selfobj = this;
      var paidInv = {};
      var payment_amount = parseFloat($('#payment_amount').val());
      selfobj.remainingAmt = payment_amount;
      let i = 1;

      $(".invoices_body .tr").each(function (key, value) {
        console.log('remainingAmt Before:', selfobj.remainingAmt);
        var invoiceID = $(this).attr('data-id');
        var pending_amt = parseFloat($(this).find(".pending_amt").text());
        if (selfobj.remainingAmt > 0 && !isNaN(pending_amt) && pending_amt > 0) {
          var paymentForInvoice = Math.min(selfobj.remainingAmt, pending_amt);
          var new_pending_amt = pending_amt - paymentForInvoice;
          selfobj.remainingAmt -= paymentForInvoice;
          console.log('remainingAmt After:', selfobj.remainingAmt);
          paidInv[invoiceID] = {
            'invoiceID': invoiceID,
            'pending_amt': pending_amt,
            'new_pending_amt': new_pending_amt,
            'paid_amount': paymentForInvoice
          };
          $(this).find('td#payment_amt_' + i).html(paymentForInvoice);
          $(this).find('td#afterPay_amt_' + i).html(new_pending_amt);
        }
        i++;
      });

      paidInv = JSON.stringify(paidInv);
      selfobj.model.set({ paid_invoice: paidInv });
      console.log(selfobj.model.get('paid_invoice'));
    },
    renderAttachment: function () {
      const attachment_file = this.model.get("attachement");
      if (attachment_file) {
        let docUrl = "";
        const fName = attachment_file;
        const ftext = fName.split(".");
        let modifiedFName = fName;
        if (ftext[1] === "xls" || ftext[1] === "xlsx") {
          modifiedFName = "excel.png";
          docUrl += "<div id='"+modifiedFName+"-removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' ";
        } else if (ftext[1] === "pdf") {
          modifiedFName = "pdf.png";
          docUrl += "<div id='"+modifiedFName+"-removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' ";
        } else if (ftext[1] === "docx") {
          modifiedFName = "word.png";
          docUrl += "<div id='"+modifiedFName+"-removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + IMAGES + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' ";
        } else {
          if (this.model.get("invoice_id") !== null && this.model.get("invoice_id") !== "" ) {
            docUrl += "<div id='"+modifiedFName+"-removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + this.model.get("invoice_id") + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/'+ this.model.get("invoice_id") + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + modifiedFName + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }else{
            docUrl += "<div id='"+modifiedFName+"-removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/receipts/" + this.model.get("receipt_id") + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + modifiedFName + "'><span class='material-icons'>delete</span></span></div></div></div></div>";

          }
        }
        console.log(docUrl);
        document.getElementById("attachedDoc").innerHTML += docUrl;
        $('.upload').hide();
        $('.loadMedia').hide();
      }
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = receipttemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models, projectsList: this.projectsList.models, accounts: this.accounts.models, expectedIncomeList: selfobj.expectedIncomeList }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $(".ws-select").selectpicker();
      $("#" + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.initializeValidate();
      this.setOldValues();
      $(window).click(function () {
        $('.dropdown-content').hide();
      });
      this.uploadFileEl = $("#attachement").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'logsUpload/',
        element: 'attachement',

        onSucess: function () {
          // selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          console.log(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });
      $(".cancelBtn").click(function (e) {
        selfobj.filterSearch();
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide');
        $(".modal-backdrop").hide();
      });
      this.renderAttachment();
      rearrageOverlays(selfobj.form_label, this.toClose);
      this.delegateEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return receiptSingleView;
});
