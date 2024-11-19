define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  'moment',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../models/notificationSingleModel',
  '../../emailMaster/models/emailMasterSingleModel',
  '../collections/notificationCollection',
  '../../admin/collections/adminCollection',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../emailMaster/views/emailMasterSingleView',
  '../views/templateSelectorView',
  '../views/conditionsView',
  '../../category/collections/slugCollection',
  'text!../templates/notification_temp.html',
  'text!../templates/notificationTable.html',
  'text!../templates/notificationAddFields.html',
  'text!../templates/notificationFields.html',
  'text!../templates/dropdownTemp.html',
  'text!../templates/linkedDropdown.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, moment, multiselectOptions, dynamicFieldRender, notificationSingleModel, emailTempModel, notificationCollection, adminCollection, dynamicFormData, emailMasterSingleView, templateSelectorView, conditionsView, slugCollection, notification_temp, notificationTable, notificationAddFields, notificationFields, dropdownTemp, linkedDropdownTemp) {
  var notificationView = Backbone.View.extend({
    model: notificationSingleModel,
    module_name: '',
    valid: false,
    editor: {},
    columnlist: [],
    rowCounter: 1,
    sys_user_id: 'all',
    initialize: function (options) {
      var selfobj = this;
      // console.log('options:',options);
      this.emailMenuID = this.emailTempID = '';
      this.toClose = "notificationView";
      // PARENT DETAILS RE-ASSIGNED TO CURRENT THIS
      this.parentObj = options.parentObj;
      this.menuID = this.parentObj.menuId;
      this.filteredData = this.parentObj.filteredData;
      this.metadata = this.parentObj.metadata;
      this.columnlist = this.parentObj.columnlist ? this.parentObj.columnlist : []; // ORIGINAL 
      this.staticJoined = this.parentObj.staticJoined ? this.parentObj.staticJoined : [];
      this.skipFields = this.parentObj.skipFields ? this.parentObj.skipFields : [];
      this.columnMappings = this.parentObj.columnMappings ? this.parentObj.columnMappings : [];
      this.module_name = this.parentObj.mname;
      this.company_id = $.cookie('company_id');
      this.model = new notificationSingleModel();
      this.model.set({ 'module_name': this.module_name });
      this.model.set({ "record_type": "trigger" });
      this.model.set({ "company_id": this.company_id });
      this.emailTempModel = new emailTempModel();
      this.notificationCollection = new notificationCollection();
      this.adminCollection = new adminCollection();
      this.multiselectOptions = new multiselectOptions();
      this.dynamicFormDatas = new dynamicFormData();
      this.extractedFields = [];
      this.conditionList = [
        { "label": "Condition", "value": "" },
        { "label": "Greater Than (>)", "value": ">" },
        { "label": "Less Than (<)", "value": "<" },
        { "label": "EqualTo (==)", "value": "=" },
        { "label": "Not equalTo (!=)", "value": "!=" },
        { "label": "Greater Than Equal To (>=)", "value": ">=" },
        { "label": "Less Than Equal To (<=)", "value": "<=" },
        { "label": "Change", "value": 'change' }
      ];
      this.logicalList = [
        { "label": "Logical", "value": "" },
        { "label": "AND(&&)", "value": "AND" },
        { "label": "OR(||)", "value": "OR" },
      ];
      this.templateSelectorView = new templateSelectorView({ parentObj: this });
      this.conditionsView = new conditionsView({ parentObj: this });
      this.getNotificationList();
      this.setSystemUser();
      this.render();
    },
    events: {
      "click .saveTrigger": "saveTrigger",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "change .getTemplate": "updateTemplateDetails",
      "change .notifyDetails": "updateNotifyDetails",
      "click #btnNotifications": "showCreateNot",
      "change .notification_type": "notificationTypeUpdate",
      "click .wizard": "wizard",
    },
    attachEvents: function () {
      this.$el.off('click', '.saveNotification', this.saveNotification);
      this.$el.on('click', '.saveNotification', this.saveNotification.bind(this));
      this.$el.off('click', '.editNotification', this.editNotification);
      this.$el.on('click', '.editNotification', this.editNotification.bind(this));
      this.$el.off('click', '.deleteNotification', this.deleteNotification);
      this.$el.on('click', '.deleteNotification', this.deleteNotification.bind(this));
      this.$el.off('click', '.updateNotification', this.updateNotification);
      this.$el.on('click', '.updateNotification', this.updateNotification.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.activateNotifications', this.activateNotifications);
      this.$el.on('change', '.activateNotifications', this.activateNotifications.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('change', '.notifyDetails', this.updateNotifyDetails);
      this.$el.on('change', '.notifyDetails', this.updateNotifyDetails.bind(this));
      this.$el.off('change', '.notification_type', this.notificationTypeUpdate);
      this.$el.on('change', '.notification_type', this.notificationTypeUpdate.bind(this));
      this.$el.off('click', '#btnNotifications', this.showCreateNot);
      this.$el.on('click', '#btnNotifications', this.showCreateNot.bind(this));
      this.$el.off('click', '.wizard', this.wizard);
      this.$el.on('click', '.wizard', this.wizard.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    showCreateNot: function () {
      this.model.set({
        'module_name': this.module_name,
        'record_type': 'trigger',
        'user_type': 'system_user',
        'sys_user_id': 'all'
      });
      this.model.unset('notification_type')
      .unset('name')
      .unset('template_id')
      .unset('notification_id')
      .unset('action_on')
      .unset('attachment');

      $('#notificationDetails, .notification-action-bar , .ws-wizard').show();
      $('.emptyNotificationImg, #btnNotifications').hide();
      $('#notification_div').hide();
    },
    wizard: function (e) {
      var selfobj = this;
      let current = $(e.currentTarget).attr("data-tab-current");
      let next = $(e.currentTarget).attr("data-tab-next");
      let prev = $(e.currentTarget).attr("data-tab-prev");
      let action = $(e.currentTarget).attr("data-tab-action");
      if (action == "next") {
        if (this.validateNotification("tab" + current)) {
          $(".tab-contents").hide();
          $(".tab-contents").removeClass("active-tab");
          $("body").find("#tab" + next).show();
          $("body").find("#tab" + next).addClass("active-tab");
          if (selfobj.model.get('notification_id') == null) {
            $(".step[data-step_id='" + current + "'] .step-circle").removeClass("progress").addClass("active");
            $(".step-line[data-step_id='" + current + "']").addClass("active");
            $(".step[data-step_id='" + next + "'] .step-circle").addClass("progress");
          }
          $(e.currentTarget).attr("data-tab-next", parseInt(next) + 1);
          $(e.currentTarget).attr("data-tab-current", parseInt(next));
          $(e.currentTarget).attr("data-tab-prev", parseInt(current));

          $('#btn-pre').attr("data-tab-prev", parseInt(current));
          $('#btn-pre').attr("data-tab-next", parseInt(next) + 1);
          $('#btn-pre').attr("data-tab-current", parseInt(next));
          $('#btn-pre img').attr("src", 'images/prev_active.png');
          if (next == '3') {
            
            $('.saveNotification').show();
            $('#btn-next').hide();
          } else if (next == '2') {
          }
          (parseInt(prev) + 1 == '0') ? $('#btn-pre').attr('disabled', true) : $('#btn-pre').removeAttr('disabled');
        }
      } else if (action == "prev") {
        $(".tab-contents").hide();
        $(".tab-contents").removeClass("active-tab");
        $("#tab" + prev).show();
        $("body").find("#tab" + prev).addClass("active-tab");
        $('#btn-next').attr("data-tab-prev", parseInt(prev) - 1);
        $('#btn-next').attr("data-tab-next", parseInt(prev) + 1);
        $('#btn-next').attr("data-tab-current", parseInt(prev));
        $(e.currentTarget).attr("data-tab-prev", parseInt(prev) - 1);
        $(e.currentTarget).attr("data-tab-current", parseInt(current) - 1);
        $(e.currentTarget).attr("data-tab-next", parseInt(current));
        if (current == '3') {
          $('.saveNotification').show();
          $('#btn-next').show();
        } else if (next == '2') {
        }
        (prev == '1') ? $('#btn-pre').attr('disabled', true) : $('#btn-pre').removeAttr('disabled');
      } else {
        this.model.set({ 'name': null });
        this.model.set({ 'user_type': 'system_user' });
        this.model.set({ 'sys_user_id': 'all' });
        this.model.set({ 'notification_type': null });
        this.model.set({ 'template_id': null });
        this.model.set({ 'notifications_id': null });
        this.model.set({ 'action_on': null });
        this.getNotificationList();
      }
    },
    validateNotification: function (activeTab) {
      const validateField = (field, message) => {
        if (!this.model.get(field)) {
          showResponse('', { "flag": "F", "msg": message }, '');
          return false;
        }
        return true;
      };

      if (activeTab === "tab1") {
        if (!validateField('name', 'Notification name required')) return false;
        if (!validateField('user_type', 'User type required')) return false;
        if (this.model.get('user_type') === 'system_user') {
          if (!validateField('sys_user_id', 'System user required')) return false;
        }
        return true;
      }

      if (activeTab === "tab2") {
        if (!validateField('notification_type', 'Notification type required')) return false;
        if (!validateField('template_id', 'Template required')) return false;
        return true;
      }

      if (activeTab === "tab3") {
        if (!validateField('action_on', 'Action type required')) return false;
        if (this.model.get('action_on') === 'update') {
          // Uncomment and adjust these validations as needed
          // if (!validateField('field_name', 'Field name required')) return false;
          // if (!validateField('field_value', 'Field value required')) return false;
        }
        return true;
      }
      return false; // Default case if none of the tabs match
    },
    multioption: function (e) {
      var selfobj = this;
      var issinglecheck = $(e.currentTarget).attr("data-single");
      if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
      if (issingle == "Y") {
        var newsetval = [];
        var classname = $(e.currentTarget).attr("class").split(" ");
        newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
        filterOption.set(newsetval);
      }
      if (issingle == "N") {
        setTimeout(function () {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
          });
          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }
          objectDetails["" + classname[0]] = newsetvalue;
          filterOption.set(objectDetails);
        }, 500);
      }
    },
    // REMAINING TO CHECK THIS AFTER SAVING THE RECORDS
    editNotification: function (e) {
      selfobj = this;
      var template = _.template(notificationFields);
      var id = $(e.currentTarget).attr('data-notificationID');
      this.model.set({ notification_id: id });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        selfobj.sys_user_id = selfobj.model.get('sys_user_id');
        selfobj.render();
        
        $('#notificationDetails, .notification-action-bar , .ws-wizard').show();
        $('.step-circle, .step-line').removeClass('progress');
        $('.step-circle, .step-line').addClass('active');
        $('.emptyNotificationImg, #btnNotifications').hide();
        $('#notification_div').hide();
      });
    },
    getActiveTab: function (notification_id) {
      selfobj = this;
      var template = _.template(notificationFields);
      var id = notification_id;
      this.model.set({ notification_id: id });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") {
          if (res.flag == "F") showResponse('', res, '');
        }
        selfobj.render();
        $('#notificationDetails').show();
        $('#notification_div').hide();
        $('#tab2').addClass('active-tab');
        $('#tab1').removeClass('active-tab');
        $('#tab3').removeClass('active-tab');
        $('.previous').removeAttr('disabled');
        var fields = [];
        if (Object.entries(res.data[0].json_data).length > 2) {
          $('.on_FieldSelect').show();
          $(".on_addFields").show();
          $(".addRecords").hide();
          $(".notifyBtn").show();
          let tempData = JSON.parse(res.data[0].json_data);
          for (const [key, value] of Object.entries(tempData)) {
            fields.push(value);
            $(".selectFields").append(template({
              rowCounter: key,
              fieldDetails: fields,
              columnlist: selfobj.columnlist,
              conditionList: selfobj.conditionList,
              logicalList: selfobj.logicalList,
              fieldValue: value.value
            })).show();
            $('.fieldsSelection').each(function (index, element) {
              const currentRow = $(element);

            });
            fields = [];
          }
        }
      });
    },
    // __________________________________________________
    getNotificationList: function () {
      var selfobj = this;
      this.notificationCollection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { 'module_name': selfobj.module_name, 'record_type': selfobj.model.get("record_type"), "company_id": selfobj.company_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });
    },
    notificationTypeUpdate: function (e) {
      e.stopPropagation();
      var nottype = [];
      var newdetails = [];
      var allchecked = true;
      if ($(e.currentTarget).val() == 'both' && $(e.currentTarget).is(':checked')) {
        $('#checkbox').prop('checked', true);
        $('#checkbox1').prop('checked', true);
        $('#checkbox3').prop('checked', true);
      } else if ($(e.currentTarget).val() == 'both' && !$(e.currentTarget).is(':checked')) {
        $('#checkbox').prop('checked', false);
        $('#checkbox1').prop('checked', false);
        $('#checkbox3').prop('checked', false);
      }
      $(".notification_type").each(function () {
        var valuetxt = $(this).val();
        if ($(this).is(':checked')) {
          nottype.push(valuetxt);
        }
        if (!$(this).is(':checked') && valuetxt != 'both') {
          allchecked = false;
        }
      });
      if (allchecked == true) {
        $('#checkbox2').prop('checked', true);
        newdetails['notification_type'] = 'both';
      } else {
        if (nottype.includes('both')) {
          nottype.pop('both');
        }
        $('#checkbox2').prop('checked', false);
        newdetails['notification_type'] = nottype.join(',');
      }
      this.model.set(newdetails);
    },
    updateNotifyDetails: function (e) {
      $(".on_addFields").hide();
      $(".on_FieldSelect").hide();
      this.model.set('action_on', $(e.currentTarget).val());
      var action_type = this.model.get("action_on");
      if (action_type != 'update') {
        $('.selectFields').empty();
        $('#condition_value option[value=change]').show();
      } else {
        $('.selectFields').empty();
        $('#condition_value option[value=change]').hide();
      }
      this.arrangeDropDown();
    },
    arrangeDropDown: function () {
      $(".notifyBtn").hide();
      var action_type = this.model.get("action_on");
      (action_type == 'update' || action_type == 'add') ?
        $('.on_update,.addRecords').show() :
        $(".on_addFields,.on_FieldSelect,.on_update").hide();
    },
    setSystemUser: function () {
      var selfobj = this;
      this.adminCollection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y', status: 'active', roleType: 'Admin' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });
    },

    // DEFAULT FUNCTIONS
    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      switch (toID) {
        case 'user_type':
          if (this.model.get('user_type') == "system_user") {
            $('.sys-user-div').show();
            $('.column-field-div .li_sys_user').show();
          } else {
            $('.sys-user-div').hide();
            $('.userDiv').hide();
            $('.column-field-div .li_sys_user').hide();
          }
          break;
        default:
          break;
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
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["sys_user_id", "status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      if (selfobj.model.get('sys_user_id') == "all") {
        $('.userDiv').hide();
        $("#sys_user_id").val("select");
      } else {
        $('.userDiv').show();
      }
    },
    // SAVE NOTIFICATION 
    saveNotification: function (e) {
      e.preventDefault();
      const currentTab = $('.tab-contents.active-tab').attr('id');
      if (!this.validateNotification(currentTab)) {
        return;
      }
      let selfobj = this;
      if (permission.edit != "yes") {
        Swal.fire({ title: 'Permission Required !', text: "You dont have permission to edit", timer: 2000, icon: 'warning', showConfirmButton: false });
        return false;
      }
      var alertShown = false;
      var rowCount = this.model.get('rowCounter');
      if (this.model.get('action_on') == 'update') {
        if (rowCount == 0) {
          showResponse('', { "flag": "F", "msg": 'Please add atleast one Condition' }, '');
          alertShown = true;
        }
      }
      if (alertShown) {
        $("#notificationDetails").show();
        return false;
      } else {
        selfobj.model.set({ "record_type": "trigger" });
        // ATTACHMENTS SAVE
        if (selfobj.uploadFileEl.elements.uploadList) {
          selfobj.model.attributes.mediaArr = [];
          if (selfobj.model.get('attachment') && selfobj.model.get('attachment') != "") {
            var att = selfobj.model.get('attachment');
          }
          selfobj.uploadFileEl.elements.uploadList.forEach(file => {
            let fileName = file.name.replace(/\.(?=.*\.)/g, '_');
            fileName = fileName.replace(/ /g, '_');
            selfobj.model.get('mediaArr').push(fileName);
          });
          if (selfobj.model.get('attachment') && selfobj.model.get('attachment') != "") {
            att += ',' + selfobj.model.get('mediaArr').join();
          } else {
            att = selfobj.model.get('mediaArr').join()
          }
          selfobj.model.set({ 'attachment': att });
        }
        var mid = this.model.get("notification_id");
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        if (this.validateNotification("tab3")) {
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "F") {
              if (res.flag == "F") showResponse(e, res, '');
            }
            if (res.flag == "S") {
              if (res.last_id != undefined) {
                selfobj.last_id = res.last_id;
              }

              let url = APIPATH + 'notificationattachment/' + selfobj.last_id;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);

              $(e.currentTarget).html("<span>Save</span>");
              if (currentTab == 'tab3') {
                $('#notificationDetails').hide();
                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({ 'module_name': selfobj.module_name });
                selfobj.model.set({ "record_type": "trigger" });
                selfobj.model.set({ "company_id": selfobj.company_id });
                selfobj.getNotificationList();
                selfobj.render();
              }
            }
            setTimeout(function () {
              $(e.currentTarget).html("<span>Save</span>");
              $(e.currentTarget).removeAttr("disabled");
            }, 2000);
          });
        } else {
          $('#notificationDetails').show();
          return;
        }
      }
      // this.addtriggerRows();
      return;
    },
    // UPDATE NOTIFICATION 
    updateNotification: function (e) {
      var selfobj = this;
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Make Inactive',
        denyButtonText: `Permanently Delete`,
      }).then((result) => {
        if (result.isConfirmed) {
          var notification_id = $(e.currentTarget).attr('data-notificationid');
          var status = 'active';
          var action = 'changeStatus';
          $.ajax({
            url: APIPATH + 'notificationMaster/status',
            method: 'POST',
            data: { list: notification_id, action: action, status: status },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") {
                if (res.flag == "F") showResponse(e, res, '');
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {

                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({ 'module_name': selfobj.module_name });
                selfobj.model.set({ "record_type": "trigger" });
                selfobj.model.set({ "company_id": selfobj.company_id });
                Swal.fire({
                  title: 'Notification Deleted!',
                  timer: 3000,
                  icon: 'success',
                  showConfirmButton: false
                });
                setTimeout(function () {
                  selfobj.getNotificationList();
                  selfobj.render();
                }, 4000);
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            }
          });
        } else if (result.isDenied) {
          var notification_id = $(e.currentTarget).attr('data-notificationid');
          var status = 'delete';
          var action = 'changeStatus';
          $.ajax({
            url: APIPATH + 'notificationMaster/status',
            method: 'POST',
            data: { list: notification_id, action: action, status: status },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") {
                if (res.flag == "F") showResponse(e, res, '');
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({ 'module_name': selfobj.module_name });
                selfobj.model.set({ "record_type": "trigger" });
                selfobj.model.set({ "company_id": selfobj.company_id });

                selfobj.getNotificationList();
                selfobj.render();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            }
          });
        }
      })
    },
    // ACTIVATE NOTIFICATION
    activateNotifications: function (e) {
      var status = $(e.currentTarget).is(":checked") ? 'active' : 'inactive';
      var alert = (status == 'active') ? 'Activated' : 'Deactivated';
      var notification_id = $(e.currentTarget).attr('data-notificationID');
      var action = 'changeStatus';
      $.ajax({
        url: APIPATH + 'notificationMaster/status',
        method: 'POST',
        data: { list: notification_id, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            if (res.flag == "F") showResponse(e, res, '');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.model.set(selfobj.model.defaults);
            selfobj.model.set({ 'module_name': selfobj.module_name });
            selfobj.model.set({ "record_type": "trigger" });
            selfobj.model.set({ "company_id": selfobj.company_id });
            Swal.fire({
              title: 'Notification ' + alert + '!',
              timer: 2000,
              icon: 'success',
              showConfirmButton: false
            });
            setTimeout(function () {
              selfobj.getNotificationList();
              selfobj.render();
            }, 3000);
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);
        }
      });
    },
    // DELETE NOTIFICATION
    deleteNotification: function (e) {
      var selfobj = this;
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Make Inactive',
        denyButtonText: `Permanently Delete`,
      }).then((result) => {
        if (result.isConfirmed) {

          var notification_id = $(e.currentTarget).attr('data-notificationid');
          var status = 'inactive';
          var action = 'changeStatus';
          $.ajax({
            url: APIPATH + 'notificationMaster/status',
            method: 'POST',
            data: { list: notification_id, action: action, status: status },
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
                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({ 'module_name': selfobj.module_name });
                selfobj.model.set({ "record_type": "trigger" });
                selfobj.model.set({ "company_id": selfobj.company_id });
                Swal.fire({
                  title: 'Notification Deactivated!',
                  timer: 2000,
                  icon: 'success',
                  showConfirmButton: false
                });
                setTimeout(function () {
                  selfobj.getNotificationList();
                  selfobj.render();
                }, 3000);
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            }
          });
        } else if (result.isDenied) {
          var notification_id = $(e.currentTarget).attr('data-notificationid');
          var status = 'delete';
          var action = 'changeStatus';
          $.ajax({
            url: APIPATH + 'notificationMaster/status',
            method: 'POST',
            data: { list: notification_id, action: action, status: status },
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
                if (res.flag == "F") showResponse(e, res, '');
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.model.set(selfobj.model.defaults);
                selfobj.model.set({ 'module_name': selfobj.module_name });
                selfobj.model.set({ "record_type": "trigger" });
                selfobj.model.set({ "company_id": selfobj.company_id });
                Swal.fire({
                  title: 'Notification Deleted!',
                  timer: 2000,
                  icon: 'success',
                  showConfirmButton: false
                });
                setTimeout(function () {
                  selfobj.getNotificationList();
                  selfobj.render();
                }, 3000);
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            }
          });
        }
      })
    },
    // APPEND NOTIFICATIONLIST
    appendNotficationList: function () {
      var template = _.template(notificationTable);
      $('#notification_div').append(template({ notificationList: this.notificationCollection.models }));
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        name: {
          required: true
        },
        notification_type: {
          required: true
        },
        template_id: {
          required: true
        },
        action_on: {
          required: true
        },
        user_type:
        {
          required: true
        }
      };
      var feildsrules = feilds;
      var messages = {
        notification_type: "Please select Notification Type ",
        user_type: "Please select User Type ",
        action_on: "Please  select Action  ",
        template_id: "Please select Template",
        name: "Please Enter Name",
      };
      $("#triggerDetails").validate({
        rules: feilds,
        messages: messages
      });
      var __toolbarOptions = [
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ align: [] }],
        ["link"],
        ["clean"],
      ];
      var editor = new Quill($("#description").get(0), {
        modules: {
          toolbar: __toolbarOptions,
        },
        theme: "snow",
      });
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == "api") {
          console.log("An API call triggered this change.");
        } else if (source == "user") {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          text = text.replace(/\n/g, '');
          selfobj.model.set({ "description": text });
        }
      });
    },
    render: function () {
      var selfobj = this;
      $(".loder").hide();
      var source = notification_temp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      if (selfobj.model.get("sys_user_id") != "all" && selfobj.model.get("sys_user_id") != undefined) {
        selfobj.sys_user_id = selfobj.model.get("sys_user_id").split(",");
      } else {
        selfobj.sys_user_id = "all";
      }
      this.$el.html(template({ notificationList: this.notificationCollection.models, columnlist: selfobj.columnsList, model: this.model.attributes, adminList: this.adminCollection.models, sys_user_id: selfobj.sys_user_id, menuName: this.module_name, skipFields: this.skipFields }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      $("#notifyView").remove();
      handelClose('notifyView');
      rearrageOverlays("Notification", this.toClose);
      this.initializeValidate();
      this.arrangeDropDown();
      this.setOldValues();
      this.attachEvents();
      
      $('.ws-select').selectpicker();
      this.appendNotficationList();
      if (selfobj.model.get('notification_id')) {
        $('.saveNotification').show();
      } else {
        $('.saveNotification').hide();
      }
      this.templateSelectorView.render();
      this.conditionsView.render();
      return this;
    },
    onDelete: function () {
      this.remove();
    }
  });
  return notificationView;
});
