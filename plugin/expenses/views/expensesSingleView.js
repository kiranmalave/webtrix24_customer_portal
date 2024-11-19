define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Swal',
  'RealTimeUpload',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/expensesCollection',
  '../../category/collections/slugCollection',
  '../../accounts/collections/accountCollection',
  '../../admin/collections/adminCollection',
  '../../projects/collections/projectsCollection',
  '../models/expensesSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/expensesSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Swal, RealTimeUpload, multiselectOptions, dynamicFieldRender, expensesCollection, slugCollection, accountCollection, adminCollection, projectsCollection, expensesSingleModel, readFilesView, expensestemp) {

  var expensesSingleView = Backbone.View.extend({
    model: expensesSingleModel,
    attachedDocURLArray: [],
    uploadFileEl: null,
    form_label: '',
    projectsList: new projectsCollection(),
    initialize: function (options) {
      var selfobj = this;
      this.dynamicData = null;
      this.toClose = "expensesSingleView";
      this.form_label = options.form_label;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "expensesList";
      this.loadFrom = options.loadFrom;
      this.customerID = options.customer_id;
      this.projectID = options.project_id;
      this.menuId = options.menuId;
      this.revenueType = options.revenueType;
      this.model = new expensesSingleModel();
      if (this.loadFrom == "project") {
        this.model.set({ customer_id: this.customerID });
        this.model.set({ project_id: this.projectID });
        this.model.set({ related_to: this.loadFrom });
        this.model.set({ revenueType: this.revenueType });
      }
      this.model.set({ menuId: selfobj.menuId });
      // this function is called to render the dynamic view
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchexpenses;
      $(".popupLoader").show();
      var expensesList = new expensesCollection();
      this.model.set({
        loadFrom: options.loadFrom,
      });
      this.accounts = new accountCollection();
      expensesList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("expensesList", res.data);
        $('body').find(".loder").hide();
        selfobj.render();
      });
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

      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'expenses_type,expenses_category' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });
      this.refreshProject();
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", is_approver: "yes", getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });

      if (options.expenses_id != "") {
        this.expense_id = options.expenses_id;
        this.model.set({ expenses_id: options.expenses_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler
        }).done(function (res) {
          var expenseDate = selfobj.model.get("expense_date");
          if (expenseDate != null && expenseDate != "0000-00-00") {
            selfobj.model.set({ "expense_date": moment(expenseDate).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
    },
    events:
    {
      "click .saveexpensesDetails": "saveexpensesDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "change .claimReimburs": "claimReimburs",
      "click .singleSelectOpt": "selectOnlyThis",
      "change .expenseChange": "getexpenseby",
      "input .selectExpenseBy": "setExpenseBy",
      "click .closeTab.deleteAttachment": "deleteAttachment",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);

      if (toID == "paid_by" && valuetxt == "cheque") {
        $('.chequeNumbDiv').show();
        $('.payeeNameDiv').show();
        $('.transacNumbDiv').hide();
      } else if (toID == "paid_by" && valuetxt == "upi") {
        $('.chequeNumbDiv').hide();
        $('.transacNumbDiv').show();
        $('.payeeNameDiv').show();
      } else if (toID == "paid_by" && valuetxt == "cash") {
        $('.chequeNumbDiv').hide();
        $('.transacNumbDiv').hide();
        $('.payeeNameDiv').hide();
      }
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
      if (toID == 'related_to' && valuetxt != '') {
        if (valuetxt != 'project') {
          this.model.set({ 'project_id': null });
        }
        console.log('this.model : ', this.model);
        this.render();
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
    claimReimburs: function (e) {
      e.stopPropagation();
      var selfobj = this;
      $('.claimReimburs input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          $('#paidMainDiv').hide();
          selfobj.model.set({ 'claim_reimbursement': "yes" });
        } else {
          $('#paidMainDiv').show();
          selfobj.model.set({ 'claim_reimbursement': "no" });
        }
      });
    },

    getSelectedFile: function (url) {
      let docUrl = "";
      var selfobj = this;
      const fName = this.model.get("attachment");
      if (fName != null && fName != '') {
        this.attachedDocURLArray.push({ url: fName });
        ftext = fName.split(".");
        if (ftext[1] == "xls" || ftext[1] == "xlsx") {
          fName = "excel.png";
        } else if (ftext[1] == "pdf") {
          fName = "pdf.png";
        }
        docUrl = "<div class='col-xl-2 col-lg-3 col-md-4 col-sm-12 m-b-20' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><a href='" + url + "' target='_blank'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/expense/" + selfobj.expense_id + "/"+fName+"' alt=''></a><span class='closeTab deleteAttachment' data-attachment_name = '"+fName+"'><span class='material-icons'>delete</span></span></div></div></div>";
        document.getElementById("attachedDoc").innerHTML += docUrl;
      }
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      new readFilesView({ loadFrom: "addpage", loadController: this });
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

    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
      };
      reader.readAsDataURL(e.currentTarget.files[0]);

    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    saveexpensesDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var expenses_id = this.model.get("expenses_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (expenses_id == "" || expenses_id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#expenseDetails").valid()) {
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
            const isNewProject = (isNew == "new");
            const isProjectLoad = (selfobj.loadFrom == "project");
            if (isNewProject) {
              selfobj.model.clear().set(selfobj.model.defaults);
              let modelData = { menuId: selfobj.menuId };
              if (isProjectLoad) {
                Object.assign(modelData, {
                  customer_id: selfobj.customerID,
                  project_id: selfobj.projectID,
                  related_to: selfobj.loadFrom
                });
              }
              selfobj.model.set(modelData);
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              selfobj.render();
            } else {
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              handelClose(selfobj.toClose);
              if (isProjectLoad) {
                console.log('scanDetails :', scanDetails);
                scanDetails.render();
              } else {
                scanDetails.filterSearch();
              }
            }
          }
        });
      }
    },
    addNewRecord: function () {
      var selfobj = this;
    },

    getexpenseby: function (e) {
      var name = $(e.currentTarget).val();
      var dropdownContainer = $("#expenseByDropdown");
      var table = "admin";
      var where = "name";
      var list = "adminID, name";
      $.ajax({
        url: APIPATH + 'getAssigneeList/',
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
            Swal.fire({ title: 'Failed !', text: res.msg, timer: 2000, icon: 'error', showConfirmButton: false });
          }
          $(".textLoader").hide();
          dropdownContainer.empty();
          if (res.msg === "sucess" && res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectExpenseBy" style="background-color: #ffffff;" data-adminID=' + value.adminID + '>' + value.name + '</div>');
            });
            dropdownContainer.show();
          } else {
            dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "product" style="background-color: #5D60A6; color:#ffffff;" > User not found </div>');
            dropdownContainer.show();
          }
        }
      });
    },

    setExpenseBy: function (e) {
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var adminID = $(e.currentTarget).attr('data-adminID');
      $('.expenseChange').val(Name);
      $("#expenseByDropdown").hide();
      selfobj.model.set({ "expense_by": adminID });
      selfobj.model.set({ "adminName": Name });
    },

    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        expense_title: {
          required: true,
        },
        expense_date: {
          required: true,
        },
        expense_by: {
          required: true,
        },
        amount: {
          required: true,
        },
        bank_account: {
          required: true,
        },

      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);

      }
      var messages = {
        expense_title: "Please enter Expense Title",
        expense_date: "Please enter Expense Date",
        amount: "Please enter Expense Amount",
        bank_account: "Please Select Bank Account",
        expense_by: "Please enter Expense By",
      };

      $('#expense_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#expense_date').change();
        var valuetxt = $("#expense_date").val();
        selfobj.model.set({ "expense_date": valuetxt });
      });

      $("#expenseDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    deleteAttachment: function (e) {
      let selfobj = this;
      let attachment_name = $(e.currentTarget).attr("data-attachment_name");
      let expense_id = selfobj.expense_id;
      let div = document.getElementById('removeIMG');
      if (attachment_name != null && attachment_name !='') {
        $.ajax({
          url: APIPATH + 'expenses/removeAttachment',
          method: 'POST',
          data: { expense_id: expense_id,attachment_name:attachment_name },
          datatype: 'JSON',
          beforeSend: function (request) {
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
              div.remove();
              selfobj.model.set({ "attachment": "" });
            }
          }
        });
      } else {
        div.remove();
        selfobj.model.set({ "attachment": "" });
      }
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = expensestemp;
      var template = _.template(source);
      // var rout2 = APIPATH + 'expenseMediaReceipt/';
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models, "adminList": this.adminList.models, 'accounts': this.accounts.models, projectsList: this.projectsList.models }));
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
      $(".ws-select").selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      let expense_id = this.model.get("expenses_id");
      if (expense_id == undefined) {
        expense_id = "";
      }
      this.uploadFileEl = $("#receiptUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf'],
        thumbnails: true,
        action: APIPATH + 'expenseReceiptUpload/' + expense_id,
        element: 'receiptUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
          handelClose(selfobj.toClose);
        }
      });
      this.getSelectedFile();
      this.delegateEvents();
      return this;
    },
    onDelete: function () {
      this.remove();
    }
  });

  return expensesSingleView;

});
