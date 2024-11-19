define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  'moment',
  'text!../templates/invoicePreviewTemp.html',
  '../../category/collections/slugCollection',
  '../../core/views/mailView',
  '../models/singleTaxInvoiceModel',
], function ($, _, Backbone, Swal, moment,
  invoicePreviewTemp,
  slugCollection,
  mailView,
  singleTaxInvoiceModel) {
  var invoicePreview = Backbone.View.extend({
    form_label: '',
    categoryList: new slugCollection(),
    invoiceDetails: null,
    preview: null,
    model: singleTaxInvoiceModel,
    initialize: function (options) {
      var selfobj = this;
      $('.loder').show();
      this.toClose = "invoicePreView";
      this.form_label = options.form_label;
      this.menuId = options.menuId;
      this.invoiceID = options.invoiceID;
      this.parentObj = options.parentObj;
      this.model = new singleTaxInvoiceModel();
      this.parent_form_label = options.parentObj.form_label ? options.parentObj.form_label : '';
      this.model.set({ parent_form_label: this.parent_form_label });
      if (options.invoiceID != "" && options.invoiceID != null) {
        this.model.set({ invoiceID: options.invoiceID });
        this.getPreviewModel();
      }
      selfobj.refreshCat();
      selfobj.getPreview();
    },
    events:
    {},
    attachEvents: function () {
      this.$el.off('click', '.partial_payment', this.paymentStatus);
      this.$el.on('click', '.partial_payment', this.paymentStatus.bind(this));
      this.$el.off('click', '#saveChangesBtn', this.savePaymentLog);
      this.$el.on('click', '#saveChangesBtn', this.savePaymentLog.bind(this));
      this.$el.off('click', '.loadview', this.loadSubView);
      this.$el.on('click', '.loadview', this.loadSubView.bind(this));
      this.$el.off('click', '.deleteInvoice', this.deleteInvoices);
      this.$el.on('click', '.deleteInvoice', this.deleteInvoices.bind(this));
      this.$el.off('click', '.loadMedia', this.loadFile);
      this.$el.on('click', '.loadMedia', this.loadFile.bind(this));
      this.$el.off('click', '.hideUpload', this.hideUpload);
      this.$el.on('click', '.hideUpload', this.hideUpload.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    getPreviewModel: function(){
      var selfobj = this;
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == 'S') {
          var formattedDate = selfobj.model.get('valid_until_date');
          formattedDate = moment(formattedDate, "DD-MM-YYYY").format("Do MMMM YYYY");
          selfobj.model.set({ 'valid_until_date': formattedDate });
          var formattedDate = selfobj.model.get('invoiceDate');
          formattedDate = moment(formattedDate, "DD-MM-YYYY").format("Do MMMM YYYY");
          selfobj.model.set({ 'invoiceDate': formattedDate });
          var formattedDate = selfobj.model.get('created_date');
          formattedDate = moment(formattedDate).format("Do MMMM YYYY");
          selfobj.model.set({ 'created_date': formattedDate });
          var formattedDate = selfobj.model.get('reminder_send_date');
          formattedDate = moment(formattedDate, "DD-MM-YYYY").format("Do MMMM YYYY");
          selfobj.model.set({ 'reminder_send_date': formattedDate });
        }
        selfobj.render();
      });
    },
    loadFile: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
    },
    hideUpload: function (e) {
      $(".upload").hide();
      $('.dotborder').show();
    },
    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'payment_mode' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },
    initializeValidate: function () {
      var selfobj = this;
    },
    // PARTIAL PAYMENT
    paymentStatus: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var inID = $(e.currentTarget).attr('data-id');
      $("#paymentModal").modal('show');
      $(".modal-backdrop").hide();
      $('.ws-select').selectpicker();
      selfobj.getPaymentLogs(inID);
      var currentDate = moment(new Date()).format("DD-MM-YYYY");
      $('#payment_date').val(currentDate);
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
        p_date = $('#payment_date').val();
        console.log(p_date);
      });
      if (!$("#attachement").hasClass('RTU-hiddenFile')) {
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
      }
      $(".cancelBtn").click(function (e) {
        $('#saveChangesBtn').unbind();
        $("#paymentModal").modal('hide');
        $(".modal-backdrop").hide();
      });
    },
    // GET PAYMENT LOGS LIST
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
          if (res.flag == "F" && res.statusCode != 227) showResponse('', res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            //  console.log("payment Logs",res.data);
            if (res.data.length > 0) {

              var tbl = '<thead id="thead"><tr class="headings"><th class="column-title">Receipt no</th><th class="column-title">Received Amount</th><th class="column-title">Transaction Id</th><th class="column-title">Payment Date</th><th class="column-title">Mode of Payment</th><th class="column-title">Payment Notes</th><th class="column-title">Attachment</th><th>Download</th></tr></thead><tbody id="paymentLogList"></tbody>'
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
    // SAVE PAYMENT LOGS
    savePaymentLog: function (e) {
      var selfobj = this;
      var invoiceID = selfobj.invoiceID;
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
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F" && res.statusCode != '227') showResponse('',res, '');
          if (res.lastlogID != undefined) {
            selfobj.logID = res.lastlogID;
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            let url = APIPATH + 'logsUpload/' + selfobj.logID + '/' + invoiceID;
            selfobj.uploadFileEl.elements.parameters.action = url;
            selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
            $('#payment_date, #pending_amount').val('');
            // $('#saveChangesBtn').unbind();
            $("#paymentModal").modal('hide');
            $(".modal-backdrop").hide();
            selfobj.parentObj.filterSearch();
            selfobj.getPreview();
            selfobj.getPreviewModel();
          }
        }
      });
    },
    getPreview: function () {
      selfobj = this;
      $.ajax({
        url: APIPATH + 'getInvoicePreview/' + selfobj.invoiceID,
        method: 'POST',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            if (res.preview) {
              selfobj.preview = res.preview;
              $('.loder').hide();
              selfobj.render();
            }
          }
        }
      });
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singletaxInvoiceData": {
          handelClose(selfobj.toClose);
          selfobj.parentObj.loadSubView(e);
          break;
        }
        case "mail": {
          selfobj.sendInovicePdf(e);
          break;
        }
      }
    },
    // SEND INVOICE THROUGH PDF
    sendInovicePdf: function (e) {
      var selfobj = this;
      var type = $(e.currentTarget).attr('data-type');
      var invoiceID = $(e.currentTarget).attr('data-invoiceID');
      var customer_id = $(e.currentTarget).attr("data-customer_id");
      var cust_name = $(e.currentTarget).attr("data-first_name");
      var cust_mail = $(e.currentTarget).attr("data-custMail");
      var subject = (type == 'reminder') ? 'Reminder : ' : selfobj.parentObj.menuName;
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
              $('.customMail').remove('maxActive');
              new mailView({ 'customer_id': customer_id, 'customerName': cust_name, 'customer_mail': cust_mail, 'invoicePDf': selfobj.invoicePdfName,'subject':subject,'loadFrom':'invoice','invoiceObj' : selfobj});
              $('body').find(".loder");
            }
          } else {
            showResponse(e, res, '');
          }
        }
      });
    },
    // WHEN INVOICE PDF IS SEND 
    updateMailFlags : function(){
      $.ajax({
        url: APIPATH + 'sendReminder/'+selfobj.invoiceID,
        method: 'POST',
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
            selfobj.parentObj.filterSearch();
            selfobj.getPreview();
            selfobj.getPreviewModel();
          }
        }
      });
    },
    // DELETE INVOICES
    deleteInvoices: function (e) {
      var selfobj = this;
      var removeIds = [];
      removeIds.push(selfobj.invoiceID);
      var idsToRemove = removeIds.toString();
      var action = "delete";
      if (idsToRemove == '') {
        showResponse('', { "flag": "F", "msg": "Invoice is not created." }, '')
        return false;
      }
      Swal.fire({
        title: "Delete " + selfobj.parentObj.menu,
        text: "Are you sure you want to delete this " + selfobj.parentObj.menu + "? This action is permanent and cannot be undone.",
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
                handelClose(selfobj.toClose);
                selfobj.parentObj.filterSearch();
              }
            }
          });
        }
      });
    },
    render: function () {
      var selfobj = this;
      var source = invoicePreviewTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ invoiceID: selfobj.invoiceID, categoryList: this.categoryList.models, model: selfobj.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      rearrageOverlays(selfobj.form_label, this.toClose);
      selfobj.attachEvents();
      selfobj.initializeValidate();
      setToolTip()
      $('.invoicePreview').append(selfobj.preview);
      $('.overlay-main-container.open').addClass('invoice');
      $('.invoice .ws-tab.tab-content').css('padding', '0px');
      return this;
    }, onDelete: function () {
      this.remove();
    },
  });
  return invoicePreview;
});