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
  '../models/notificationSingleModel',
  '../../emailMaster/models/emailMasterSingleModel',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../emailMaster/collections/emailMasterCollection',
  '../../emailMaster/views/emailMasterSingleView',
  '../../menu/collections/menuCollection',
  'text!../templates/templateSelector.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, moment, multiselectOptions, notificationSingleModel, emailTempModel, dynamicFormData, emailMasterCollection, emailMasterSingleView, menuCollection, templateSelector) {
  var templateSelectorView = Backbone.View.extend({
    model: notificationSingleModel,
    module_name: '',
    valid: false,
    editor: {},
    columnlist: [],
    rowCounter: 1,
    sys_user_id: 'all',
    initialize: function (options) {
      var selfobj = this;
      this.model = new notificationSingleModel();
      this.emailTempModel = new emailTempModel();
      this.menuList = new menuCollection();
      this.toClose = "templateSelectorView";
      this.parentObj = options.parentObj;
      this.menuID = this.parentObj.menuID;
      this.columnlist = this.parentObj.columnlist ? this.parentObj.columnlist : []; // ORIGINAL 
      this.columnList = this.columnlist;
      this.metadata = this.parentObj.metadata;
      this.emailMenuID = this.emailTempID = '';
      this.filteredData = this.parentObj.filteredData;
      this.module_name = this.parentObj.module_name;
      this.company_id = $.cookie('company_id');
      this.model.set({ 'module_name': this.module_name });
      this.model.set({ "record_type": "trigger" });
      this.model.set({ "company_id": this.company_id });
      this.multiselectOptions = new multiselectOptions();
      this.dynamicFormDatas = new dynamicFormData();
      this.extractedFields = [];
      this.skipFields = this.parentObj.skipFields ? this.parentObj.skipFields : [];
      this.columnMappings = this.parentObj.columnMappings ? this.parentObj.columnMappings : [];
      this.emailMasterList = new emailMasterCollection();
      var emailMenu = ROLE['emailMaster'];
      selfobj.emailMenuID = emailMenu.menuID;
      
      this.getEmailTemp();
      this.getColumnList();
      this.render();
    },
    events:
    {
      "click .saveTrigger": "saveTrigger",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "change .getTemplate": "updateTemplateDetails",
      "change .notification_type": "notificationTypeUpdate",
      "click .addFieldsToTrigger": "addFieldsToTrigger",
    },
    attachEvents: function () {
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.header', this.handleAccordion);
      this.$el.on('click', '.header', this.handleAccordion.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.multiselectOpt', this.updatemultiSelDetails);
      this.$el.on('click', '.multiselectOpt', this.updatemultiSelDetails.bind(this));
      this.$el.off('change', '.getTemplate', this.updateTemplateDetails);
      this.$el.on('change', '.getTemplate', this.updateTemplateDetails.bind(this));
      this.$el.off('click', '.column-field-val', this.setTemplateField);
      this.$el.on('click', '.column-field-val', this.setTemplateField.bind(this));
      this.$el.off('click', '.deleteAttachment', this.removeAttachment);
      this.$el.on('click', '.deleteAttachment', this.removeAttachment.bind(this));
      this.$el.off('change', '#attchInputValue', this.fileInput);
      this.$el.on('change', '#attchInputValue', this.fileInput.bind(this));
      this.$el.off('input', '#feildSearch', this.feildSearch);
      this.$el.on('input', '#feildSearch', this.feildSearch.bind(this));
      this.$el.off('click', '.header label', this.setdef);
      this.$el.on('click', '.header label', this.setdef.bind(this));
    },
    setdef : function (e) {
      e.stopImmediatePropagation();
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    // FOR TEMPLATE SELECTOR
    feildSearch: function (e) {
      let search = $(e.currentTarget).val().toLowerCase();
      $('.column-field-div ul li').hide();
      $('.column-field-div ul li').each(function () {
        var optVal = $(this).html().toLowerCase();
        if (optVal.includes(search)) {
          $(this).show();
        }
      });
    },
    updateTemplateDetails: function () {
      var selfobj = this;
      var valuetxt = selfobj.parentObj.model.get('template_id');
      if (valuetxt != 'addEmailTemp' && valuetxt != null ) {
        selfobj.emailTempModel.set({ 'tempID': valuetxt });
        if (selfobj.emailTempModel.get('tempID') != '') {
          selfobj.emailTempModel.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, data: { menuId: selfobj.emailMenuID }, error: selfobj.onErrorHandler
          }).done(function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            var emailCnt = res ? res.data[0] ? res.data[0].emailContent : undefined : undefined;
            var emailSubject = res ? res.data[0] ? res.data[0].subjectOfEmail : undefined : undefined;
            var smsContent = res ? res.data[0] ? res.data[0].smsContent : undefined : undefined;
            $("#emailContentN .ql-editor").empty().append(emailCnt);
            $("#emailSubject").val(emailSubject);
            $("#PreviewSMS").empty().append(smsContent);
            $('#emailSubject').on('change', function (e) {
              var subject = $(e.currentTarget).val();
              if (subject != '') {
                selfobj.emailTempModel.set({ "menuId": selfobj.emailMenuID });
                selfobj.emailTempModel.set({ "subjectOfEmail": subject });
                var justHtml = selfobj.editor.root.innerHTML;
                // selfobj.emailTempModel.set({"emailContent":justHtml});
                selfobj.emailTempModel.save({}, {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler, type: "POST"
                }).done(function (res) {
                  if (res.flag == "F") showResponse('', res, '');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                });
              }
            });
          });
        }
      }
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
    getEmailTemp: function () {
      selfobj = this;
      this.emailMasterList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: 'active', is_sys_temp: 'no' }
      }).done(function (res) {
        if (res.flag == "F") {
          if (res.flag == "F") showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });
    },
    getColumnList: function () {
      var selfobj = this;
      this.columnsList = this.columnlist;
      this.extractedFields = [];
      if (selfobj.metadata) {
        for (var rowKey in selfobj.metadata) {
          var row = selfobj.metadata[rowKey];
          for (var colKey in row) {
            var field = row[colKey];
            if (field.fieldID !== undefined) {
              if (field.fieldType == 'File') {
                selfobj.columnlist.pop(field);
                selfobj.skipFields.push(field);
              }
              selfobj.extractedFields.push(field);
            }
          }
        }
      }
      selfobj.columnlist = selfobj.columnlist.filter(model => {
        const field = model.Field;
        return !selfobj.filteredData.includes(field);
      });
      selfobj.columnsList.forEach(column => {
        if (column.Field == 'assignee') {
          column.subColList = [{ 'Field': 'Assignee Contact No' }, { 'Field': 'Assignee Email' }, { 'Field': 'Assignee WhatsApp number' }];
        }
        // selfobj.columnMappings.forEach(colData => {
        //   if (colData.hasOwnProperty(column.Field)) {
        //     column.Field = colData[column.Field];
        //   }
        // });
      });
      selfobj.render();
    },
    setTemplateField: function (e) {
      selfobj = this;
      $('.column-field-val .toolt').remove();
      text = $(e.currentTarget).text();
      $(e.currentTarget).append('<span class="toolt" >copied</span>');
      text = "{{" + text + "}}";
      selfobj.copyToClipboard(text);
    },
    copyToClipboard: function (element) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(element).select();
      document.execCommand("copy");
      $temp.remove();
    },
    // DEFAULT FUNCTIONS
    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.parentObj.model.set(newdetails);
      switch (toID) {
        case 'template_id':
          if (valuetxt == "addEmailTemp") {
            new emailMasterSingleView({ searchemailMaster: this, loadfrom: "notificationView", form_label: "Email Templates", notification_id: this.model.get('notification_id') });  
          }else{
            selfobj.emailTempID = valuetxt;
            this.emailTempModel.set({ 'tempID': valuetxt });
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
    // UPLOAD ATTACHMENT
    fileInput: function (event) {
      var selfobj = this;
      const selectedFile = event.target.files[0];
      const fileSizeKB = selectedFile.size / 1024;
      textContent = selectedFile.name + ' (' + fileSizeKB.toFixed(2) + ' KB)';
      var attmt = UPLOADS + '/temp-attachment/' + selectedFile.name;

      var formData = new FormData();
      formData.append('fileInputValue', selectedFile);

      if (!selfobj.attachmentArray.some(item => item.fileName === selfobj.invoicePdfName)) {
        $.ajax({
          url: APIPATH + 'uploadAttachment',
          method: 'POST',
          datatype: 'JSON',
          data: formData,
          contentType: false,
          processData: false,
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {
              if (res.flag == "F") showResponse(event, res, '');
            }
            if (res.flag == "S") {
              selfobj.attachmentArray.push({
                'path': "temp-attachment/",
                'fileName': selectedFile.name,
              });
              const downloadLink = $('<a>')
                .attr('href', URL.createObjectURL(selectedFile))
                .attr('download', selectedFile.name)
                .text(textContent);
              // Append the download link to the uploadedFilesList
              $(".uploadedFilesList").append(
                $('<div class="uploadedFile">').append(
                  $('<span>').append(downloadLink),
                  $('<button type="button" data-path="temp-attachment/" data-fileName="' + selectedFile.name + '" class="btn removeAttachment">')
                    .append('<i class="material-icons"> clear</i>')
                )
              );
              // Remove any existing click event handler before attaching a new one
              downloadLink.off('click').on('click', function (event) {
                event.stopPropagation(); // Prevent other click events from triggering
                // Perform the download
                $(this).get(0).click();
              });
            } else {
              showResponse('', { "flag": "F", "msg": 'failed to upload file..!' }, '');
            }
          }
        });
      }
    },
    // SHOW ATTACHMENT
    showAttachment: function () {
      selfobj = this;
      var attachment = this.parentObj.model.get("attachment");
      if (attachment && attachment != '') {
        let docUrl = "";
        var attachments = attachment.split(',');
        if (Array.isArray(attachments)) {
          for (let i = 0; i < attachments.length; i++) {
            if (attachments[i] != '') {
              const fName = attachments[i];
              const ftext = fName.split(".");
              let modifiedFName = fName;
              if (ftext[1] === "xls" || ftext[1] === "xlsx") {
                modifiedFName = "excel.png";
                docUrl += "<div id='' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + '/notificationAttach/' + selfobj.parentObj.model.get("notification_id") + '/' + attachments[i] + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + attachments[i] + "' data-notif_id='" + selfobj.parentObj.model.get("notification_id") + "'>delete</span></span></div></div></div></div>";
              } else if (ftext[1] === "pdf") {
                modifiedFName = "pdf.png";
                docUrl += "<div id='' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + '/notificationAttach/' + selfobj.parentObj.model.get("notification_id") + '/' + attachments[i] + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + attachments[i] + "' data-notif_id='" + selfobj.parentObj.model.get("notification_id") + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
              } else {
                docUrl += "<div id='' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/notificationAttach/' + selfobj.parentObj.model.get("notification_id") + '/' + attachments[i] + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + '/notificationAttach/' + selfobj.parentObj.model.get("notification_id") + '/' + attachments[i] + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + attachments[i] + "' data-notif_id='" + selfobj.parentObj.model.get("notification_id") + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
              }
            }
          }
        }
        $("#attachedDoc").append(docUrl);
      } else {
        $('#attachedDoc').hide();
      }
    },
    // REMOVE ATTACHMENT
    removeAttachment: function (e) {
      selfobj = this;
      var attch = selfobj.parentObj.model.get('attachment');
      var notification_id = $(e.currentTarget).attr('data-notif_id');
      var file = $(e.currentTarget).attr('data-file_id');
      let attachments = selfobj.parentObj.model.get('attachment');
      let result = attachments.replace(new RegExp(file, 'g'), '');
      result = result.replace(/,+/g, ',').replace(/(^,)|(,$)/g, '').trim();
      $.ajax({
        url: APIPATH + 'notificationMaster/removeAttach',
        method: 'POST',
        data: { notification_id: notification_id, attached: result, file: file },
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
            $(e.currentTarget).closest('.attachedPic').remove();
            selfobj.parentObj.set({ 'attachment': result });
          }
          setTimeout(function () {
            $(e.currentTarget).html(res.status);
          }, 3000);
        }
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        template_id: {
          required: true
        }
      };
      var feildsrules = feilds;
      var messages = {
        template_id: "Please select Template",
      };
      $("#triggerDetails").validate({
        rules: feilds,
        messages: messages
      });
      // UPLOAD FILE
      this.parentObj.uploadFileEl = $("#fileupload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: false,
        action: APIPATH + 'notificationattachment',
        element: 'fileupload',
        onSucess: function () {
          selfobj.parentObj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          console.log('name : ', this.elements.uploadList[0].name);
        }
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
      this.parentObj.model.set(newdetails);
    },
    // ATTACH QUILL 
    attachQuill: function () {
      var selfobj = this;
      // EMAIL TEMPLATE EDITOR
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      if ($("#emailContentN").hasClass('ql-container')) {
        $(".ql-toolbar").remove();
      }
      if ($("#whatsappContent").hasClass('ql-container')) {
        $(".ql-toolbar").remove();
      }
      selfobj.editor = new Quill($("#emailContentN").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'
      });
      selfobj.whatsappEditor = new Quill($("#whatsappContent").get(0), {
        modules: {
          toolbar: __toolbarOptions
        },
        theme: 'snow'
      });
      selfobj.editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = selfobj.editor.getContents();
          var text = selfobj.editor.getText();
          var justHtml = selfobj.editor.root.innerHTML;
          selfobj.emailTempModel.set({ "menuId": selfobj.emailMenuID });
          selfobj.emailTempModel.set({ "emailContent": justHtml });
          selfobj.emailTempModel.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: "POST"
          }).done(function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          });
        }
      });
      selfobj.whatsappEditor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = selfobj.whatsappEditor.getContents();
          var text = selfobj.whatsappEditor.getText();
          var justHtml = selfobj.whatsappEditor.root.innerHTML;
          selfobj.emailTempModel.set({ "menuId": selfobj.emailMenuID });
          selfobj.emailTempModel.set({ "emailContent": justHtml });
          selfobj.emailTempModel.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: "POST"
          }).done(function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          });
        }
      });
    },
    // HANDLE ACCORDION
    handleAccordion: function (e) {
      e.stopPropagation();
      $(e.currentTarget).next('.collapse').slideToggle();
    },
    render: function () {
      var selfobj = this;
      $(".loder").hide();
      var source = templateSelector;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ emailTemps: this.emailMasterList.models, columnlist: selfobj.columnsList, model: this.parentObj.model.attributes, menuName: this.module_name, skipFields: this.skipFields }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      if ($(".templateSelector").length) {
        $(".templateSelector").append(this.$el);
        this.initializeValidate();
        this.attachQuill();  
      }
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      this.updateTemplateDetails();
      this.showAttachment();
      return this;
    },
    onDelete: function () {
      this.remove();
    }
  });
  return templateSelectorView;
});
