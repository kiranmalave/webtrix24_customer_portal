
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'select2',
  'moment',
  'Swal',
  '../views/taxInvoiceSingleView',
  '../views/quotationToInvoiceView',
  '../collections/taxInvoiceCollection',
  '../models/taxInvoiceFilterOptionModel',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/timeselectOptions',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../../dynamicForm/collections/dynamicStdFieldsCollection',
  '../../category/collections/slugCollection',
  '../../core/views/mailView',
  '../../core/views/moduleDefaultSettings',
  '../views/invoicePreview',
  '../../core/views/dynamicFilterView',
  'text!../templates/taxInvoiceRow.html',
  'text!../templates/taxInvoice_temp.html',
  'text!../../customModule/templates/customFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, select2, moment, Swal, taxInvoiceSingleView, quotationToInvoiceView, taxInvoiceCollection, taxInvoiceFilterOptionModel, columnArrangeModalView, configureColumnsView, appSettings, timeselectOptions, dynamicFormData, singleMenuModel, dynamicStdFieldsCol, slugCollection, mailView, moduleDefaultSettings, invoicePreview, dynamicFilterView, taxInvoiceRowTemp, taxInvoice_temp, customFilterTemp, linkedDropdown, deleteCardView) {

  var taxInvoiceView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    menuName: '',
    form_label: '',
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      this.startX = 0;
      this.startWidth = 0;
      this.currPage = 0;
      this.totalRec = 0;
      this.tableStructure = {},
        this.View = "traditionalList";

      this.$handle = null;
      this.$table = null;
      this.pressed = false;
      this.toClose = "taxInvoiceFilterView";
      var selfobj = this;
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      $(".filter").hide();
      $(".loder").show();
      $('.customMail').remove('maxActive');
      $(".maxActive").hide();
      selfobj.arrangedColumnList = [];
      this.filteredFields = [];
      selfobj.filteredData = [];
      this.idsToRemove = [];
      // $(".profile-loader").hide();
      var mname = Backbone.history.getFragment();
      this.menuName = mname;
      permission = ROLE[mname];
      this.activeOff = true;
      this.inactiveOff = true;
      this.menuLabel = permission.menuName;
      this.menu = permission.menuName;
      var customerMenu = ROLE['customer'];
      this.customerMenuId = customerMenu.menuID;
      var productMenu = ROLE['products'];
      this.productMenuId = productMenu.menuID;
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj: this });
      this.appSettings = new appSettings();
      this.timeselectOptions = new timeselectOptions();
      this.dynamicFormDatas = new dynamicFormData();
      this.menuList = new singleMenuModel();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
      });
      this.filterOption = new taxInvoiceFilterOptionModel();
      this.defaultColumns = ['invoiceNumber','invoiceDate', 'customer_name', 'status'];
      this.skipFields = [
        "ref_quot_no",
        "paymentTerms",
        "is_gst_billing",
        "additional_char",
        "ship_to",
        "is_edit",
        "show_on_pdf",
        "record_type",
        "ref_note",
        "po_number",
        "po_date",
        "ref_note",
        "supplier_ref",
        "other_reference",
        "buyers_order_no",
        "disapatch_doc_no",
        "dispatch_date",
        "dispatch_through",
        "terms_of_delivery",
        "mode_or_terms_of_payment",
        "customer_id",
        "invoiceID",
        "adminID",
        "stateGstPercent",
        "interGstPercent",
        "centralGstPercent",
        "stateGstAmount",
        "interGstAmount",
        "centralGstAmount",
        "po_number",
        "po_date",
        "ship_to",
        "po_date",
        "shipping_address",
        "isEdit",
        "terms",
        "roundOff",
        "state_id",
        "company_id",
        "destination",
        "customer_s_address",
        "customer_s_mobile"
      ];
      this.staticJoined = [
        {
          field: 'customer_id',
          fieldtype: 'customer_id',
          joinedTable: 'customer',
          select: 'customer_id,name',
          primaryKey: 'customer_id',
          slug: ''
        },
        {
          field: 'project_id',
          fieldtype: 'project',
          joinedTable: 'projects',
          select: 'project_id,title',
          primaryKey: 'project_id',
          slug: ''
        },
      ];
      this.columnMappings = [];

      if (this.menuName == "receipt") {
        this.columnMappings = [
          { 'invoicenumber': 'Receipt Number' },
          { 'invoicedate': 'Receipt Date' }
        ];
        this.filterOption.set({ record_type: "receipt" });
        this.record_type = 'receipt';
      } else if (this.menuName == "delivery") {
        this.columnMappings = [
          { 'invoicenumber': 'DC Number' },
          { 'invoicedate': 'Challan Date' }
        ];
        this.filterOption.set({ record_type: "delivery" });
        this.record_type = 'delivery';
      } else if (this.menuName == "quotation") {
        this.columnMappings = [
          { 'invoicenumber': 'Quotation Number' },
          { 'invoicedate': 'Quotation Date' }
        ];
        this.filterOption.set({ record_type: "quotation" });
        this.record_type = 'quotation';
      } else if (this.menuName == "invoice") {
        this.columnMappings = [
          { 'invoicenumber': 'Invoice Number' },
          { 'invoicedate': 'Invoice Date' },
          { 'grossAmount': 'Gross Amount' }
        ];
        this.filterOption.set({ record_type: "invoice" });
        this.record_type = 'invoice';
      } else if (this.menuName == "proforma") {
        this.columnMappings = [
          { 'invoicenumber': 'Proforma Invoice Number' },
          { 'invoicedate': 'Proforma Invoice Date' }
        ];
        this.filterOption.set({ record_type: "proforma" });
        this.record_type = 'proforma';
      }
      this.columnMappings.push(
        { 'invoicetotal': 'Total' },
        { 'customer_s_address': 'Customer Shipping Address' },
        { 'customer_s_mobile': 'Customer Shipping Mobile' },
        { 'company_id': 'Company Name' },
        { 'is_reminder_send': 'Reminder Send' },
        { 'project_id': 'Project' },
      );
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.filterOption.set({ company_id: $.cookie('company_id') });
      this.filterOption.set({ "menuId": this.menuId });
      this.collection = new taxInvoiceCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'taxInvoice/multipleHardDelete';

      this.render();
    },

    copy: function (e) {
      var selfobj = this;
      var invoiceID = $(e.currentTarget).attr('data-invoiceID');
      Swal.fire({
        title: "Copy " + selfobj.menuLabel,
        text: "Are you sure you want to copy this " + selfobj.menuLabel + "?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Copy',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          if (invoiceID) {
            $.ajax({
              url: APIPATH + 'copy',
              method: 'POST',
              data: { record_id: invoiceID, menuId: selfobj.menuId },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F") showResponse(e, res, '');
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filterSearch();
                }
                // setTimeout(function () {}, 3000);
              }
            });
          } else {
            console.error('No Record id is exist..!');
          }
        }
      });
    },
    showShareButton: function (e) {
      const invoice_id = $(e.currentTarget).attr('data-invoiceID');
      $('.share_' + invoice_id).toggle();
    },
    events:
    {
      "click .loadview": "loadSubView",
      "click .showpage": "loadData",
      "click .cancelInvoice": "cancelInvoice",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .invoiceStatus": "invoiceStatusChange",
      "click .deleteAll": "deleteInvoices",
      "click .sortColumns": "sortColumn",
      "click .copy": "copy",
      // "click .paymentStatus": "paymentStatus",
      "click .savePayment": "savePayment",
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .downloadReport": "downloadReport",
      "click .showMax": "showmax",
      "click .shareInvoice": "showShareButton",
      "click .whatsAppShare": "whatsAppShare",
      "click .softRefresh": "resetSearch",
      "click .showmore": "showmore",
      "click .closeFull": "closeFull",
      "click .sortColumns": "sortColumn",
      "click .listSortColumns": "showListSortColumns",
      "mouseover .invoiceRow": "handleMouseHover",
      "mouseleave .invoiceRow": "handleMouseLeave",
      "click .deleteCard": "deleteCard",
    },
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      newdetails["record_type"] = this.record_type;
      newdetails["SadminID"] = $.cookie('authid');
      newdetails["menuId"] = this.menuId;
      newdetails["company_id"] = DEFAULTCOMPANY;
      this.filterOption.set(newdetails);

      let form = $(e.currentTarget).closest("form");
      form.attr({
        action: APIPATH + "accountingReports",
        method: "POST",
        target: "_blank",
      });
      let dataInput = form.find("input[name='data']");
      if (dataInput.length === 0) {
        dataInput = $("<input>")
          .attr("type", "hidden")
          .attr("name", "data")
          .appendTo(form);
      }
      dataInput.val(JSON.stringify(this.filterOption));
      form.submit();
      form.attr({
        action: "#",
        method: "POST",
        target: "",
      });
      this.filterOption.clear('type');
    },
    // PAYMENT STATUS
    getPaymentLogs: function (invoiceID) {
      $('#paylogs').empty();
      $.ajax({
        url: APIPATH + 'paymentLogsList/' + invoiceID,
        method: 'POST',
        data: {},
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F" && res.statusCode != 227) showResponse('', res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            if (res.data.length > 0) {
              var tbl = '<thead id="thead"><tr class="headings"><th class="column-title">Receipt no</th><th class="column-title">Amount</th><th class="column-title">Transaction Id</th><th class="column-title">Payment Date</th><th class="column-title">Mode of Payment</th><th class="column-title">Payment Notes</th><th class="column-title">Attachment</th><th>Download</th></tr></thead><tbody id="paymentLogList"></tbody>'
              $('#paylogs').append(tbl);
              var row = '';
              $.each(res.data, function (key, value) {
                var att = '<a href="' + UPLOADS + '/invoiceLog/' + value.invoice_id + '/' + value.receipt_id + '/' + value.attachement + '" target="_blank"data-toggle="tooltip" data-placement="top" title="View Attachment" style="color: #5f6368;"><span class="material-symbols-outlined">visibility</span></a>';
                if (value.attachement == '') {
                  row = '<tr><td>' + value.receipt_number + '</td><td>' + value.amount + '</td><td>' + value.transaction_id + '</td><td>' + formatDate(value.payment_log_date) + '</td><td>' + value.paymentMode + '</td><td>' + value.notes + '</td><td></td><td class="text-center"><a href="' + APIPATH + 'printReceipt/' + value.receipt_id + '" target="_blank" data-toggle="tooltip" data-placement="top" title="Download" style="color: #5f6368;"><span class="material-symbols-outlined" data-toggle="tooltip" data-placement="top" data-content="Download Data">download</span></a></td></tr>'
                } else {
                  row = '<tr><td>' + value.receipt_number + '</td><td>' + value.amount + '</td><td>' + value.transaction_id + '</td><td>' + formatDate(value.payment_log_date) + '</td><td>' + value.paymentMode + '</td><td>' + value.notes + '</td><td class="text-center">' + att + '</td><td class="text-center"><a href="' + APIPATH + 'printReceipt/' + value.receipt_id + '" target="_blank" data-toggle="tooltip" data-placement="top" title="Download" style="color: #5f6368;"><span class="material-symbols-outlined" data-toggle="tooltip" data-placement="top" data-content="Download Data">download</span></a></td></tr>'
                }
                $('#paymentLogList').append(row);
              });
            }
          }
        }
      });
    },
    paymentStatus: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var inID = $(e.currentTarget).attr('data-id');
      $("#paymentModal_" + inID).modal('show');
      $(".modal-backdrop .fade").css("display", "none");
      $('.ws-select').selectpicker();
      selfobj.getPaymentLogs(inID);
      $('#payment_date_' + inID).datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#payment_date_' + inID).change();
        p_date = $('#payment_date_' + inID).val();
      });
      $('#payment_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
        filterCName: true
      }).on('changeDate', function (ev) {
        $('#payment_date').change();
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
          $('.modal-backdrop').hide();
        }
      });
      $(".cancelBtn").click(function (e) {
        selfobj.filterSearch();
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide');
        $(".modal-backdrop").hide();
      });
      $("#saveChangesBtn").click(function (e) {
        // e.stopPropagation();
        var invoiceID = inID;
        var action = $(e.currentTarget).attr('data-action');
        var paymentDate = $('#payment_date').val();
        var record_type = selfobj.menuName;
        var paymentAmt = $('#pending_amount').val();
        var pending_amount = $('.pendingAmount_lb').attr('data-pendingAmount');
        if (parseFloat(paymentAmt) > parseFloat(pending_amount)) {
          alert('Payment amount is greater than pending amount...! '); return;
        }
        var transaction_id = $('#transaction_id').val();
        var mode_of_payment = $('#mode_of_payment').val();
        var payment_note = $('#payment_note').val();
        var customer_id = $(e.currentTarget).attr('data-customer_id');
        var company_id = DEFAULTCOMPANY;
        $.ajax({
          url: APIPATH + 'taxInvoice/partialPayment',
          method: 'POST',
          data: { 'customer_id': customer_id, 'company_id': company_id, 'payment_note': payment_note, 'record_type': record_type, 'invoiceID': invoiceID, 'action': action, 'paymentDate': paymentDate, 'paymentAmt': paymentAmt, 'transaction_id': transaction_id, 'mode_of_payment': mode_of_payment },
          datatype: 'JSON',
          beforeSend: function (request) {
            //$(e.currentTarget).html("<span>Updating..</span>");
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F" && res.statusCode != '227') showResponse(e, res, '');
            if (res.lastlogID != undefined) {
              selfobj.logID = res.lastlogID;
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              let url = APIPATH + 'logsUpload/' + selfobj.logID + '/' + invoiceID;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              $('#payment_date').val('');
              $('#pending_amount').val('');
              selfobj.filterSearch();
              $('#saveChangesBtn').unbind();
              $("#paymentModal").modal('hide');
              $(".modal-backdrop").hide();
            }
          }
        });
      });
    },
    // UPDATE INVOICES STATUS
    invoiceStatusChange: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      removeIds.push($(e.currentTarget).attr("data-id"));
      $(".action-icons-div").hide();
      var idsToRemove = removeIds.toString();
      $.ajax({
        url: APIPATH + 'taxInvoice/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status, record_type: this.record_type, company_id: $.cookie('company_id') },
        datatype: 'JSON',
        beforeSend: function (request) {
          //$(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") showResponse(e, res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);
        }
      });
    },
    // DELETE INVOICES
    deleteInvoices: function (e) {
      var selfobj = this;
      var removeIds = [];
      var action = "delete";
      $('#taxInvoiceList input:checkbox').each(function () {
        if ($(this).is(":checked") && $(this).attr('data-status') == 'draft') {
          removeIds.push($(this).attr("data-id"));
        }
      });
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
        $('.checkall').prop('checked', false)
        return false;
      }
      $(".action-icons-div").hide();
      $(".memberlistcheck").click(function () {
        if ($(this).is(":checked")) {
          $(".action-icons-div").show(300);
        } else {
          $(".action-icons-div").hide(200);
        }
      });
      Swal.fire({
        title: "Delete " + selfobj.menuLabel,
        text: "Are you sure you want to delete this " + selfobj.menuLabel + "? This action is permanent and cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + 'deleteTaxInvoices',
            method: 'POST',
            data: { list: idsToRemove, action: action },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") showResponse(e, res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.filterSearch();
                $('.checkall').prop('checked', false);
                $('.deleteAll').hide();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            }
          });
        }
      });
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      $(".customMail").hide();
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singletaxInvoiceData": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          new taxInvoiceSingleView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
          break;
        }
        case "convertInvoice": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          var taxInvoicesingleview = new quotationToInvoiceView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
          break;
        }
        case "previewInvoice": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          new invoicePreview({ invoiceID: invoiceID, parentObj: selfobj, menuId: selfobj.menuId, form_label: 'Preview', menuName: this.menuName });
          break;
        }
        case "mail": {
          selfobj.getPdf(e);
          break;
        }
        case "mailView": {
          $(".customMail").show();
          $('.customMail').remove('maxActive');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-custMail");
          new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail });
          $('body').find(".loder").hide();
          break;
        }
      }
    },
    // LAST ACTION TD HANDLING
    handleMouseHover: function (event) {
      const customerRow = $(event.currentTarget);
      const button = customerRow.find(".InvoiceHoverButton");
      const checkboxTd = customerRow.find('td.a-center');
      const actionColumn = customerRow.find('td.actionColumn');
      if ($(event.target).closest(checkboxTd).length === 0 && $(event.target).closest(actionColumn).length === 0) {
        if (button.length > 0 && !button.is(":hover")) {
          const bottomPos = customerRow.offset().top - ($(window).scrollTop());
          button.css({
            display: "block",
            right: "30px",
            top: (bottomPos) + "px",
          });
        }
      }
    },
    handleMouseLeave: function (event) {
      const customerRow = $(event.currentTarget);
      const customerId = customerRow.data('customerid');
      const relatedTarget = $(event.relatedTarget);
      if (!relatedTarget.hasClass("customerRow")) {
        customerRow.find(".InvoiceHoverButton").css("display", "none");
      }
    },
    // SENDING THROUGH WHATSAPP
    whatsAppShare: function (e) {
      var mob = $(e.currentTarget).attr('data-customer-mobile');
      var name = $(e.currentTarget).attr('data-first_name');
      var cust_id = $(e.currentTarget).attr('data-customer_id');
      mob = '9503063266';
      const phoneNumber = '1234567890'; // Replace with recipient's phone number
      const message = encodeURIComponent("Hi, please find the PDF attached.");
      const whatsappURL = `https://wa.me/${mob}?text=${message}`;
      window.location.href = whatsappURL;
    },
    // GET PDF FOR SENDING THROUGH MAIL
    getPdf: function (e) {
      var selfobj = this;
      var invoiceID = $(e.currentTarget).attr('data-invoiceID');
      selfobj.invoicePdfName = '';
      $.ajax({
        url: APIPATH + 'getPdf/' + invoiceID,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            if (res.data != '') {
              selfobj.invoicePdfName = res.data;
              console.log('invoicePdfName', selfobj.invoicePdfName);
              $(".customMail").show();
              $('.customMail').removeClass('maxActive');
              var customer_id = $(e.currentTarget).attr("data-customer_id");
              var cust_name = $(e.currentTarget).attr("data-first_name");
              var cust_mail = $(e.currentTarget).attr("data-custMail");
              new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail, invoicePDf: selfobj.invoicePdfName });
              $('body').find(".loder");
            }
          } else {
            showResponse(e, res, '');
          }
        }
      });
    },
    // EMAIL FLY-OUT 
    showmax: function () {
      $(".customMail").show();
      $(".customMailMinimize").hide();
      var ele = document.querySelector(".openFull");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActiveRemove');
      $(".maxActive").hide();
    },
    mailHide: function (e) {
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActive');
    },
    minimize: function () {
      $(".customMail").hide();
      $(".customMailMinimize").show();
      $(".opercityBg").hide();
      $('.openFull').addClass('maxActiveRemove');
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".maxActive").hide();
    },
    maximize: function () {
      $(".opercityBg").show();
      $(".customMail").show();
      $(".customMailMinimize").hide();
      $('.customMail').addClass('maxActive');
      $('.openFull').remove('maxActive');
      $(".closeFull").show();
      $('.openFull').remove('maxActiveRemove');
    },
    closeFull: function () {
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".closeFull").hide();
      $(".opercityBg").hide();
      $(".maxActive").hide();
    },
    // APPEND DATA TO TABLE
    addOne: function (objectModel) {
      var selfobj = this;
      $(".noCustAdded").hide();
      $(".reports").show();
      selfobj.totalRec = selfobj.collection.length;
      if (selfobj.totalRec == 0) {
        $(".noCustAdded").show();
      }
      var template = _.template(taxInvoiceRowTemp);
      // check datatype and if type is date, datetime or time change it as per the setting  
      // console.log("objectModel.attributes:",objectModel.attributes);          
      Object.entries(objectModel.attributes).forEach(([index, columnItem]) => {   
        const result = selfobj.arrangedColumnList.find(field => field.column_name === index);
        const fieldType = result ? result.fieldType : null;
        if (objectModel.attributes[index] == null || objectModel.attributes[index] == "NULL" || objectModel.attributes[index] =="{}"|| objectModel.attributes[index] == undefined || objectModel.attributes[index] == '' || objectModel.attributes[index] == 0 
          || objectModel.attributes[index] =='0000-00-00' || objectModel.attributes[index]  == "0000-00-00 00:00:00") {
          objectModel.attributes[index] = "-";
        } else {
          if (fieldType == "Datepicker" || fieldType == "Date" || fieldType == "Date Time" || fieldType == "Time") {
            objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
          } else if (fieldType == "Timepicker") {
            objectModel.set({ index: selfobj.timeselectOptions.changeOnlyTime(columnItem) });
          }
        }
        if (index.includes("Amount") || index.includes("amount") || index.includes("invoiceTotal") ) {
          objectModel.attributes[index] = columnItem ? "Rs. " + columnItem : "-";
        }        
      });
      $("#taxInvoiceList").append(template({ taxInvoiceDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.menuName }));
      setToolTip();
    },
    addAll: function () {
      $("#taxInvoiceList").empty();
      this.collection.forEach(this.addOne, this);
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      var index = $element.attr("data-index");
      if (isdiabled) {
        //
      } else {

        $element.attr("data-index", cid);
        this.collection.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        selfobj.filterOption.set({ curpage: index });
        var requestData = selfobj.filterOption.attributes;

        $(".profile-loader").show();
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          selfobj.currPage = res.paginginfo.curPage;
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.setTableWidth(false);
        });
      }
    },
    // CANCLE INVOICES
    cancelInvoice: function (e) {
      var selfobj = this;
      e.preventDefault();
      var invoiceID = $(e.currentTarget).attr("data-invoiceID");
      $.ajax({
        url: APIPATH + 'cancelInvoice/' + invoiceID,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            selfobj.filterSearch();
          } else {
            showResponse(e, res, '');
          }
        }
      });
    },
    // OPEN ARRANGED COLUMN MODAL
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = [];
      switch (show) {
        case "arrangeColumns": {
          var isOpen = $(".ws_ColumnConfigure").hasClass("open");
          if (isOpen) {
            $(".ws_ColumnConfigure").removeClass("open");
            $(e.currentTarget).removeClass("BG-Color");
            return;
          } else {
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, skipFields: selfobj.skipFields, columnMappings: selfobj.columnMappings });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },
    // FILTER SEARCHES
    filteredSearches: function (e) {
      var selfobj = this;
      selfobj.filteredSearch = true;
      selfobj.filterSearch();
    },
    // RESET FILTERS
    resetSearch: function () {
      let selfobj = this;
      selfobj.filterOption.clear().set(selfobj.filterOption.defaults);
      if (selfobj.menuName == "receipt") {
        thselfobjis.filterOption.set({ record_type: "receipt" });
        selfobj.record_type = 'receipt';
      } else if (selfobj.menuName == "delivery") {
        selfobj.filterOption.set({ record_type: "delivery" });
        selfobj.record_type = 'delivery';
      } else if (selfobj.menuName == "quotation") {
        selfobj.filterOption.set({ record_type: "quotation" });
        selfobj.record_type = 'quotation';
      } else if (selfobj.menuName == "invoice") {
        selfobj.filterOption.set({ record_type: "invoice" });
        selfobj.record_type = 'invoice';
      } else if (selfobj.menuName == "proforma") {
        selfobj.filterOption.set({ record_type: "proforma" });
        selfobj.record_type = 'proforma';
      }
      selfobj.filterOption.set({ company_id: DEFAULTCOMPANY });
      selfobj.filterOption.set({ "menuId": selfobj.menuId });
      $(".multiOptionSel").removeClass("active");
      $(".down").removeClass("active");
      $(".up").removeClass("active");
      selfobj.filterSearch();
    },
    // FILTER SEARCH DEFAULT
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      var selfobj = this;
      readyState = true;
      selfobj.filterOption.set({ curpage: 0 });
      $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      selfobj.collection.reset();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = 0;
        selfobj.totalRec = res.paginginfo.totalRecords;
        console.log("selfobj.totalRec",selfobj.totalRec);      
        // if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
        //   // alert("nodata");
        //   $('#listView').show();
        //   $('.noDataFound').show();
        // } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
        //   $('.noCustAdded').show();
        //   $('#listView').hide();
        // } else if (selfobj.totalRec > 0) {
        //   $('.noDataFound').hide();
        //   $(".noCustAdded").hide();
        //   $('#listView').show();
        // }
        if (res.noRecords) {       
          $('#listView').show();
          $('.noDataFound').show();
          $('.noDataFound').html(`<div class="noCustRecDetails"><div class="noCustRecPic"><img src="images/noSearchData.jpeg" alt="No Records Found"></div><div class="noCustRecText"><h1>No Records Found Matching Your Search</h1></div></div>`);
        } else {
          $('#listView').show();
          $('.noDataFound').hide().empty();
        }
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
        selfobj.moduleDefaultSettings.setTableWidth(false);
        if (selfobj.arrangedColumnList.length > 0) {
          selfobj.moduleDefaultSettings.setListSliderView();
        }
      });
    },
    // SHOW SORTING ARROWS
    showListSortColumns: function (e) {
      e.preventDefault();
      this.dynamicFilter.showListSortColumns(e);
    },
    // SORT DATA ACCORDING TO COLUMN NAMES
    sortColumn: function (e) {
      e.stopPropagation();
      this.dynamicFilter.sortColumn(e);
    },
    deleteCard: function (e) {
      let selfobj = this;
      setTimeout(() => {
          var removeIds = [];
          selfobj.checkedCount = 0;
          $('#clist input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                  removeIds.push($(this).attr("data-invoiceID"));
              }
          });
          selfobj.checkedCount = removeIds.length;
          const totalCheckboxes = $('#clist input:checkbox').length;
          const checkedCheckboxes = $('#clist input:checkbox:checked').length;
          if (checkedCheckboxes === totalCheckboxes) {
              $('#cAll').prop("checked", true);
          } else {
              $('#cAll').prop("checked", false);
          }
          if (removeIds.length > 0) {
              $(".action-icons-div").hide();
              selfobj.idsToRemove = removeIds.toString();
              console.log('selfobj.idsToRemove', selfobj.idsToRemove);
          }
          selfobj.deleteCardView = new deleteCardView({ parentView: selfobj });
      }, 100);
  },
    render: function () {
      var selfobj = this;
      var template = _.template(taxInvoice_temp);
      this.$el.html(template({ totalRec: selfobj.totalRec, closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList }));
      $(".ws-select").selectpicker();
      $(".main_container").append(this.$el);
      setTimeout(function () {
        selfobj.moduleDefaultSettings.defaultViewSet();
        selfobj.dynamicFilter.render();
      }, 300);
      $(document).ready(function () {
        selfobj.moduleDefaultSettings.columnsResizeFunction();
      });
      return this;
    }
  });

  return taxInvoiceView;

});
