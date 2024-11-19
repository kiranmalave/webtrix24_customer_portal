define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  'Swal',
  'RealTimeUpload',
  '../../core/views/appSettings',
  "../views/repeatTaskCustomView",
  '../../core/views/commentSingleView',
  '../views/ESTModalView',
  '../../core/views/historySingleView',
  '../../customer/views/customerSingleView',
  '../../projects/views/projectsSingleView',
  '../../admin/views/addAdminView',
  '../../event/views/avablitySingleView',
  "../../core/views/multiselectOptions",
  '../../category/views/categorySingleView',
  "../../dynamicForm/views/dynamicFieldRender",
  "../../category/collections/slugCollection",
  "../../admin/collections/adminCollection",
  "../collections/taskCollection",

  "../../product/collections/productCollection",
  "../../readFiles/views/readFilesView",
  "../models/singleTaskModel",
  //"../../core/models/commentModelTask",
  '../../menu/models/singleMenuModel',
  "text!../templates/taskSingle_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, RealTimeUpload, appSettings, repeatTaskCustomView, commentSingleView, ESTModalView,historySingleView, customerSingleView, projectsSingleView, addAdminView, avablitySingleView, multiselectOptions, categorySingleView, dynamicFieldRender, slugCollection, adminCollection, taskCollection, productCollection, readFilesView, singleTaskModel, singleMenuModel, tasktemp) {
  var taskSingleView = Backbone.View.extend({
    model: singleTaskModel,
    enteredWatchersArray: [],
    attachedDocURLArray: [],
    // tagApi:null,
    tempRes: [],
    label: '',
    taskID: '',
    atValues: [],
    scanDetails: null,
    form_label: '',
    relatedList: [],
    commentSingleView: null,
    initialize: function (options) {
      $(".profile-loader").show();
      var selfobj = this;
      selfobj.menuId = options.menuId;
      this.toClose = "taskSingleView";
      this.LastID = '';
      this.lastCatID = '';
      this.categoryType = '';
      this.uploadFileElArray = [];
      this.tagID = null;
      var selfobj = this;
      this.estimate_time = {};
      this.menuName = options.menuName;
      this.form_label = options.form_label;
      this.scanDetails = options.searchtask;
      this.menuList = new singleMenuModel();
      this.enteredWatchersArray = [];
      $(".popuploader").show();
      this.pluginId = options.pluginId;
      this.customerID = options.customer_id;
      this.projectID = options.project_id;
      this.customerName = options.customerName;
      this.loadFrom = options.loadFrom;
      this.loggedInID = $.cookie("authid");
      this.userRoll = $.cookie('roleOfUser');
      this.model = new singleTaskModel();
      //this.singleComment = new commentModelTask();
      this.productList = new productCollection();
      this.multiselectOptions = new multiselectOptions();
      this.appSettings = new appSettings();
      this.relatedList = this.appSettings.getTaskRelated();
      this.taskID = options.task_id;
      this.recordID = options.task_id;

      if (options.menuId == undefined || options.menuId == null) {
        permission = ROLE[options.menuName];
        selfobj.model.set({ menuId: permission.menuID });
        selfobj.menuId = permission.menuID;
      } else {
        selfobj.model.set({ menuId: options.menuId });
      }
      if (this.form_label == null || this.form_label == undefined) {
        this.form_label = permission.menuName;
      }

      selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      if (options.task_id != "" && options.task_id != undefined && options.task_id != null) {
        this.model.set({ task_id: options.task_id });
        this.model.fetch({
          headers: { 'contentType': "application/x-www-form-urlencoded", 'SadminID': $.cookie("authid"), token: $.cookie("_bb_key"), Accept: "application/json", },
          data: { menuId: selfobj.model.get("menuId") }, error: selfobj.onErrorHandler,
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('', res, '');
          }
          var startDate = selfobj.model.get("start_date");
          var due_date = selfobj.model.get("due_date");
          if (startDate != null && startDate != "0000-00-00") {
            selfobj.model.set({ "start_date": moment(startDate).format("DD-MM-YYYY") });
          }
          if (due_date != null && due_date != "0000-00-00") {
            selfobj.model.set({ "due_date": moment(due_date).format("DD-MM-YYYY") });
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
          selfobj.extractEstTime();
          selfobj.render();
        });
        
      }

      if (this.menuName == "amc") {
        this.productList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('', res, '');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      }

      if (options.task_id == "" || options.task_id == undefined || options.task_id == null) {
        let temp = [];
        temp.push(ADMINNAME);
        let tempID = [];
        tempID.push(ADMINID);
        this.model.set({ tasksWatchers: temp });
        this.model.set({ tasks_watchersAdminID: tempID });
      }

      $(".popuploader").show();
      atValues = [];
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status,ticket_priority,ticket_type,ticket_status' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.render();
      });

      // selfobj.getCommentList();
      $(".popuploader").show();
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popuploader").hide();
        selfobj.render();
      });

      if (this.loadFrom == 'customer') {
        selfobj.setCustomer();
        selfobj.render();
      } else if (this.loadFrom == 'project') {
        this.model.set({ project_id: options.project_id });
        selfobj.setCustomer();
        selfobj.render();
      }

    },

    getCommentList: function () {
      this.commentSingleView = new commentSingleView({ appendto: this.$(".commentbox"), loadFrom: 'task', record_id: this.taskID, searchComment: this });
      this.render();
    },

    events: {
      "click .saveTaskDetails": "saveTaskDetails",
      "blur .txtchange": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      //"click .comment-box": "showCommentBox",
      "click .loadCustom": "loadSubView",
      "click .loadMedia": "loadMedia",
      //"click .savetaskComment": "saveComment",
      "click .loadview": "loadSubView",
      "click .deleteAttachment": "deleteAttachment",
      "click .scroll": "scrollSection",
      "change .watcherdetails": "getWatcherList",
      "click .selectWatchers": "setWatchers",
      "click .removeWatcher": "removeWatcher",
      "click .selectCustomer": "setCustomer",
      "input .assignChange": "getassignee",
      "click .selectAssignee": "setAssignee",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "click .hideUpload": "hideUpload",
      "click .loadAttachment": "loadAttachment",
      "click .hideUploadMedia": "hideUploadMedia",
      "click .deleteAttachments": "deleteAttachments",
      "click .clear": "clearPriority",
      "input .ws-freetxt": "getfreetext",
      "focus .ws-freetxt": "getfreetext",
      "click .selectFreeRecord": "updateDataFreeTxt",
      "click .addNewRecord": "addNew",
      "change .est_time": "estimatedTime",
      "click #est_time_logs": "estLogs",
      "click #saveEstTime": "saveEstTime",
    },
    clearPriority: function (e) {
      var value = $(e.currentTarget).attr("data-view");
      if (value == "priority") {
        $("#task_priority").val('default');
        $("#task_priority").selectpicker("refresh");
        $('.priorityClearBtn').hide();
      } else if (value == "type") {
        $("#task_type").val('default');
        $("#task_type").selectpicker("refresh");
        $('.typeClearBtn').hide();
      } else {
        $("#task_status").val('default');
        $("#task_status").selectpicker("refresh");
        $('.statusClearBtn').hide();
      }

    },
    scrollSection: function (e) {
      let selfobj = this;
      $('.taskSingleView').animate({
        scrollTop: $('.task-nav-tab').offset().top
      }, 500);
      var scrollto = $(e.currentTarget).attr('data-scroll');

      if (scrollto == "comment") {
        $('#navScrollComment').addClass('active');
        $('#navScrollHistory').removeClass('active');
        var task_id = $(e.currentTarget).attr("data-task_id");

        if (!this.$(e.currentTarget).hasClass('active')) {
          this.$(".commentbox").empty();
          this.commentSingleView = new commentSingleView({ appendto: this.$(".commentbox"), type: 'task', record_id: task_id, searchComment: this });
        }
      } else if (scrollto == "history") {
        $('#navScrollHistory').addClass('active');
        $('#navScrollComment').removeClass('active');
        var task_id = $(e.currentTarget).attr("data-task_id");
        if (!this.$(e.currentTarget).hasClass('active')) {
          this.$(".commentbox").empty();
          new historySingleView({ appendto: this.$(".commentbox"), loadFrom: 'task', record_id: task_id, type: 'task' });
        }
      }
    },

    showCommentBox: function (e) {
      let selfobj = this;
      $(e.currentTarget).hide();
      $(".commentEditor").show();
      $(".comment-editor").show();
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      // const atValues = [
      //   { id: 1, value: "Fredrik Sundqvist" },
      //   { id: 2, value: "Patrik Sjölin" }
      // ];

      if (!$(".comment-editor").hasClass("ql-container")) {

        var editor = new Quill($("#comment").get(0), {
          modules: {
            toolbar: __toolbarOptions,
            mention: {
              allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
              mentionDenotationChars: ["@", "#"],
              source: function (searchTerm, renderList, mentionChar) {
                let values;
                if (mentionChar === "@") {

                  values = selfobj.atValues;

                } else {
                  values = selfobj.atValues;
                }

                if (searchTerm.length === 0) {
                  renderList(values, searchTerm);
                } else {
                  const matches = [];
                  for (let i = 0; i < values.length; i++)
                    if (
                      ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                    )
                      matches.push(values[i]);
                  renderList(matches, searchTerm);
                }
              }
            }
          },

          theme: 'snow'  // or 'bubble'
        });

        editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          } else if (source == 'user') {
            var delta = editor.getContents();
            var text = editor.getText();
            var justHtml = editor.root.innerHTML;
            selfobj.singleComment.set({ "comment_text": justHtml });

          }
        });
      }


      let element = document.querySelector(".buttonHide");
      element.classList.add('showButton');
    },



    showWatcher: function (e) {
      e.stopPropagation();
      $(".showWatch").toggle();
    },

    deleteAttachment: function (e) {
      let file_id = $(e.currentTarget).attr("data-file_id");
      let task_id = this.model.get("task_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      let selfobj = this;
      Swal.fire({
        title: "Delete Task ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          if (file_id != null) {
            $.ajax({
              url: APIPATH + 'taskMaster/removeAttachment',
              method: 'POST',
              data: { fileID: file_id, status: status, taskID: task_id },
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
                  $('#' + file_id + 'removeDiv').remove();
                  selfobj.model.set({ "attachment_file": "" });
                }

              }
            });
          } else {
            div.remove();
            selfobj.model.set({ "attachment_file": "" });
          }
        } else {

        }
      });


    },
    hideUpload: function (e) {
      $(".upload").hide();
      $('.dotborder').show();
      $('#attachedDoc').removeClass("attachment-margin-left");
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      e.stopPropagation();
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      if (valuetxt == "addCustomer") {
        new customerSingleView({ searchCustomer: this, loadfrom: "TaskSingleView" });
      } else if (valuetxt == "addAssignee") {
        new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView" });
      } else if (valuetxt == "addStatus" || valuetxt == "addPriority" || valuetxt == "addType") {
        this.categoryType = valuetxt;
        new categorySingleView({ searchCategory: this, loadfrom: "TaskSingleView" });
      }
      if (toID == "task_priority") {
        $('.priorityClearBtn').show();
      } else if (toID == "task_type") {
        $('.typeClearBtn').show();
      } else {
        $('.statusClearBtn').show();
      }
      if (toID == "related_to") {
        this.$('.related-to').addClass("d-none");
        this.$('.related-' + valuetxt).removeClass("d-none");
      }
      if (valuetxt == "") {
        newdetails["" + toID] = null;
      } else {
        newdetails["" + toID] = valuetxt;
      }

      this.model.set(newdetails);
      if (toID == "does_repeat") {
        if (valuetxt == "custom") {
          $(".ws-repeatTask").show();
        } else {
          $(".ws-repeatTask").hide();
        }
      }
      if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
        this.model.set(toID, this.model.get(toID).join(","));
      }
    },
    addNew: function (e) {
      var view = $(e.currentTarget).attr('data-view');
      switch (view) {
        case 'customers':
          new customerSingleView({ parentObj: this, loadfrom: "TaskSingleView", form_label: 'Add Customer' });
          //handelClose(selfobj.toClose);
          break;
        case 'asignee':
          new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView", form_label: 'Add Assignee' });
          break;
        case 'watcher':
          new addAdminView({ searchadmin: this, loadfrom: "TaskSingleView", form_label: 'Add Watchers' });
          break;
        case 'project':
          new projectsSingleView({ parentObj: this, loadfrom: "TaskSingleView", form_label: 'Projects' });
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
      setvalues = ["is_custom", "category", "admin"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },

    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    loadMedia: function (e) {
      $('.upload').show();
      $('.dotborder').hide();
      $('#attachedDoc').addClass("attachment-margin-left");
    },

    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "taskData": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new taskSingleView({ task_id: task_id, scanDetails: this.scanDetails });
          break;
        }
        case "singleCommentData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          //console.log("single comment data",this.commentSingleView);
          if (!this.$(e.currentTarget).hasClass('active')) {
            this.$(".commentbox").empty();
            this.commentSingleView = new commentSingleView({ appendto: this.$(".commentbox"), type: 'task', record_id: this.taskID, searchComment: this });
          }
          break;
        }
        case "singleHistoryData": {
          var task_id = $(e.currentTarget).attr("data-task_id");
          if (!this.$(e.currentTarget).hasClass('active')) {
            this.$(".commentbox").empty();
            new historySingleView({ appendto: this.$(".commentbox"), loadFrom: 'task', record_id: task_id, type: 'task' });
          }
          break;
        }
        case "repeatTask": {
          let task_id = $(e.currentTarget).attr("data-task_id");
          new repeatTaskCustomView({ task_id: task_id, scanDetails: this, model: selfobj.model });
          break;
        }
      }
    },
    saveTaskDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var task_id = this.model.get("task_id");
      var customer_id = this.model.get("customer_id");
      var inputStr = $('#subject').val();
      let capitalizedString = inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
      this.model.set({ "subject": capitalizedString });
      this.model.set({ "company_id": DEFAULTCOMPANY });
      if (this.menuName == "ticket") {
        this.model.set({ "record_type": "ticket" });
      }
      let isNew = $(e.currentTarget).attr("data-action");
      if (task_id == "" || task_id == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#taskDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('', res, '');
          }
          if (res.lastID != undefined) {
            selfobj.taskID = res.lastID;
          }
          if (res.lastID != undefined) {
            selfobj.LastID = res.lastID;
          } else {
            selfobj.LastID = task_id;
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          if (selfobj.loadFrom == "taskModule") {
            // this is notify to grid as data added and need to refresh the grid when open
            selfobj.scanDetails.isdataupdated = true;
            selfobj.scanDetails.updateData();
            rearrageOverlays(selfobj.form_label, selfobj.toClose);
          } else if (selfobj.loadFrom == "project") {
            handelClose(selfobj.toClose);
            selfobj.scanDetails.refresh();
          } else if (selfobj.loadFrom == "customer") {
            selfobj.scanDetails.filterSearch();
          } else if (selfobj.loadFrom == "projectTask") {
            handelClose(selfobj.toClose);
            selfobj.scanDetails.taskProjectrefresh();
          }

          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId });
              let url = APIPATH + 'taskUpload/' + selfobj.taskID + '/' + customer_id;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              // Dynamic field file upload
              var form_label = selfobj.form_label.replace(/ /g, '_');
              selfobj.uploadFileElArray.forEach(function (uploadFileEl, index) {
                var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                var fileTypes = [];
                var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                uploadedFileTypes.split(',').forEach(function (type) {
                  fileTypes.push(type.trim());
                });
                var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                let url1 = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                uploadFileEl.elements.parameters.action = url1;
                uploadFileEl.prepareUploads(uploadFileEl.elements);
              });
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              handelClose("categorySingleView");
              selfobj.render();
            } else {
              let url = APIPATH + 'taskUpload/' + selfobj.taskID + '/' + customer_id;
              selfobj.uploadFileEl.elements.parameters.action = url;
              selfobj.uploadFileEl.prepareUploads(selfobj.uploadFileEl.elements);
              // Dynamic field file upload
              var form_label = selfobj.form_label.replace(/ /g, '_');
              selfobj.uploadFileElArray.forEach(function (uploadFileEl, index) {
                var fieldID = $(uploadFileEl.elements).attr('id').split('_')[1];
                var fileTypes = [];
                var uploadedFileTypes = $(uploadFileEl.elements).attr('data-fileTypes');
                uploadedFileTypes.split(',').forEach(function (type) {
                  fileTypes.push(type.trim());
                });
                var noOfFiles = $(uploadFileEl.elements).attr('data-noOfFiles');
                let url1 = APIPATH + 'customUpload/?menuID=' + selfobj.menuId + '&recordID=' + selfobj.LastID + '&fieldID=' + fieldID + '&module=' + form_label + '&fileTypes=' + fileTypes + '&noOfFiles=' + noOfFiles;
                uploadFileEl.elements.parameters.action = url1;
                uploadFileEl.prepareUploads(uploadFileEl.elements);
              });
              handelClose(selfobj.toClose);
              handelClose("categorySingleView");
            }
          }
        });
      }
    },
    refreshview: function (type, data) {
      var selfobj = this;
      switch (type) {
        case "customer":
          {
            selfobj.model.set("customer_id", data.customer_id);
            selfobj.model.set("customerName", data.name);
            $("#customer_id").val(data.name);

            rearrageOverlays(selfobj.form_label, selfobj.toClose);
            break;
          }
        case "project":
          {
            selfobj.model.set("project_id", data.project_id);
            console.log("selfobj.model", data);
            selfobj.model.set("title", data.title);
            $("#project").val(data.title);
            rearrageOverlays(selfobj.form_label, selfobj.toClose);
            break;
          }
        case "assignee":
          {
            selfobj.model.set("assignee", data.last_id);
            selfobj.model.set("assigneeName", data.name);
            console.log("selfobj.model", selfobj.model);
            $("#assignee").val(data.name);
            rearrageOverlays(selfobj.form_label, selfobj.toClose);
            break;
          }
        default:
          break;
      }
    },
    refreshCat: function (lastID) {
      let selfobj = this;
      this.lastCatID = lastID;
      if (this.categoryType == 'addStatus') {
        this.model.set({ task_status: this.lastCatID })
      } else if (this.categoryType == 'addPriority') {
        this.model.set({ task_priority: this.lastCatID })
      } else if (this.categoryType == 'addType') {
        this.model.set({ task_type: this.lastCatID })
      }
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },

    // getWatcherList: function (e) {
    //   let selfobj = this;
    //   var name = $(e.currentTarget).val();
    //   var dropdownContainer = $("#watcherDropdown");
    //   if (name != "") {
    //     $.ajax({
    //       url: APIPATH + 'getSystemUserNameList/',
    //       method: 'POST',
    //       data: { text: name },
    //       datatype: 'JSON',
    //       beforeSend: function (request) {
    //         $(".textLoader").show();
    //         request.setRequestHeader("token", $.cookie('_bb_key'));
    //         request.setRequestHeader("SadminID", $.cookie('authid'));
    //         request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
    //         request.setRequestHeader("Accept", 'application/json');
    //       },
    //       success: function (res) {
    //         if (res.flag == "F") {
    //           showResponse(e,res,'');
    //         }
    //         $(".textLoader").hide();
    //         dropdownContainer.empty();
    //         if (res.msg === "sucess") {
    //           if (res.data.length > 0) {
    //             $.each(res.data, function (index, value) {
    //               if (value.photo == "") {
    //                 var initial = selfobj.getInitials(value.name);
    //                 dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-initial=' + initial + ' data-adminID=' + value.adminID + '>' + '<span class="watcherInitial">' + initial + '</span>' + value.name + '</div>');
    //               } else {
    //                 dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-adminID=' + value.adminID + ' data-photo=' + value.photo + '> <img src=' + PROFILEPHOTOUPLOAD + value.adminID + '/profilePic/' + value.photo + ' alt="User" /> ' + value.name + '</div>');
    //               }
    //             });
    //             dropdownContainer.show();
    //           }
    //         } else {
    //           dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "watcher" style="background-color: #5D60A6; color:#ffffff;" > Add New Watcher </div>');
    //           dropdownContainer.show();
    //         }
    //       }
    //     });
    //   } else {
    //     $("#watcherDropdown").hide();
    //   }
    // },



    // Function to check if the watcher is already added
    isWatcherAlreadyAdded: function (name, id) {
      let selfobj = this;
      return selfobj.enteredWatchersArray.some(watcher => watcher.name === name && watcher.id === id);
    },

    removeWatcher: function (e) {
      e.stopPropagation();
      let selfobj = this;
      var taskID = this.model.get("task_id");
      var watcherAdminID = $(e.currentTarget).attr('data-watcherAdminID');
      var adminID = $(e.currentTarget).attr('data-adminid');
      var action = "changeStatus";
      if (watcherAdminID != undefined) {
        $.ajax({
          url: APIPATH + 'taskMaster/removeWatchers',
          method: 'POST',
          data: { list: watcherAdminID, action: action, taskID: taskID },
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
              $(e.currentTarget).closest('.tm-tag').remove();
              selfobj.enteredWatchersArray = selfobj.enteredWatchersArray.filter(watcher => watcher.id !== watcherAdminID);
              selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
              let length = selfobj.enteredWatchersArray.length;
              let watcherEye = document.getElementById('watcherEye');
              let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
              if (taskBadgeSpan) {
                taskBadgeSpan.remove();
              }
              if (length == 0) {
                $('.noWatchers').show();
                //$('.showWatchers').hide();
              } else {
                $('.noWatchers').hide();
                //$('.showWatchers').show();
                let url = "<span class='badge taskBadge watchBadge'>" + length + "</span>"
                document.getElementById('watcherEye').innerHTML += url;
              }

            }
          }
        });
      } else {
        $(e.currentTarget).closest('.tm-tag').remove();
        selfobj.enteredWatchersArray = selfobj.enteredWatchersArray.filter(watcher => watcher.id !== adminID);
        let length = selfobj.enteredWatchersArray.length;
        let watcherEye = document.getElementById('watcherEye');
        let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }


        if (length == 0) {
          $('.noWatchers').show();
          //$('.showWatchers').hide();
        } else {
          $('.noWatchers').hide();
          // $('.showWatchers').show();
          let url = "<span class='badge taskBadge watchBadge' >" + length + "</span>"
          document.getElementById('watcherEye').innerHTML += url;
        }
      }
    },

    getInitials: function (name) {
      const words = name.split(' ');
      const initials = words.map(word => word.charAt(0));
      return initials.join('').toUpperCase();
    },
    getfreetext: function (e) {
      let type = $(e.currentTarget).attr("id");
      console.log(type);
      switch (type) {
        case "project":
          this.getproject(e);
          break;
        case "assignee":
          this.getassignee(e);
          break;
        case "customer_id":
          this.getcustomers(e);
          break;
        case "watchers":
          this.getWatcherList(e);
          break;
        default:
          break;
      }
    },
    getproject: function (e) {
      var selfobj = this;
      let data = { "source": 'projects', "check": 'title', "list": 'title,project_id', "stat": false };
      this.appSettings.getFreeSearchList(e, data, function (e, res) {
        //$(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view = "project" style="background-color: #5D60A6; color:#ffffff;" > Add New Project </div>');
        if (res.msg === "sucess") {
          if (res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="project_id" data-record_id=' + value.project_id + '>' + value.title + '</div>');
              dropdownContainer.show();
            });
          }
        } else {
          selfobj.model.set("project_id", null);
        }
        //$(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    getcustomers: function (e) {
      var selfobj = this;
      let data = { "source": 'customer', "check": 'name', "list": 'name,customer_id,type', "stat": false };
      this.appSettings.getFreeSearchList(e, data, function (e, res) {
        //$(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="customers"> Add New Customer </div>');
        if (res.msg === "sucess") {
          if (res.data.length > 0) {
            $.each(res.data, function (index, value) {
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="customer_id" data-record_id=' + value.customer_id + '>' + value.name + '(' + value.type.charAt(0) + ')' + '</div>');
              dropdownContainer.show();
            });
          }
        } else {
          selfobj.model.set("customer_id", null);
        }
        //$(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    getWatcherList: function (e) {
      e.stopPropagation();
      var selfobj = this;
      let data = { "source": 'admin', "check": 'name', "list": 'name,adminID,photo', "stat": false };
      this.appSettings.getFreeSearchList(e, data, function (e, res) {
        //$(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        //dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="customers"> Add New Customer </div>');
        if (res.msg === "sucess") {
          if (res.data.length > 0) {
            $.each(res.data, function (index, value) {
              // dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="customer_id" data-record_id=' + value.customer_id + '>' + value.name +'(' + value.type.charAt(0) + ')'+'</div>');
              // dropdownContainer.show();
              if (res.data.length > 0) {
                $.each(res.data, function (index, value) {
                  var initial = selfobj.getInitials(value.name);
                  if (value.photo == "") {
                    dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-initial=' + initial + ' data-adminID=' + value.adminID + '>' + '<span class="watcherInitial">' + initial + '</span>' + value.name + '</div>');
                  } else {
                    dropdownContainer.append('<div class="dropdown-item selectWatchers" style="background-color: #ffffff;" data-initial=' + initial + ' data-adminID=' + value.adminID + ' data-photo=' + value.photo + '> <img src=' + PROFILEPHOTOUPLOAD + value.adminID + '/profilePic/' + value.photo + ' alt="' + initial + '" /> ' + value.name + '</div>');
                  }
                });
              } else {
                dropdownContainer.append('<div class="dropdown-item"> No Records</div>');
              }
            });
            dropdownContainer.show();
          }
        } else {
          //selfobj.model.set("customer_id",null);
        }
        ////$(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    setWatchers: function (e) {
      e.stopPropagation();
      let selfobj = this;
      var Name = $(e.currentTarget).text();
      var adminID = $(e.currentTarget).attr('data-adminid');
      var photo = $(e.currentTarget).attr('data-photo');
      var createdBy = this.model.get("created_by");
      var initial = $(e.currentTarget).attr('data-initial');

      if (!selfobj.isWatcherAlreadyAdded(Name, adminID)) {
        if (photo != "" && photo != undefined) {
          var htmlToAppend = '<span class="tm-tag"><span><img src=' + PROFILEPHOTOUPLOAD + adminID + '/profilePic/' + photo + ' alt="' + initial + '" /> ' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '><i class="material-icons">close</i></a></span>';
        } else {
          var htmlToAppend = '<span class="tm-tag"><span><span class="watcherInitial">' + initial + '</span>' + Name + '</span><a class="removeWatcher" data-adminID=' + adminID + '><i class="material-icons">close</i></a></span>';
        }
        $(".tm-input").append(htmlToAppend);
        $("#watchers").val('');
        $(".freeSerachList").hide();
        selfobj.enteredWatchersArray.push({ name: Name, id: adminID });
        selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
        /*
        * if record in edit mode add watcher directly to backend
        */
        let task_id = this.model.get("task_id");
        if (task_id != "" && task_id != null) {
          $.ajax({
            url: APIPATH + 'taskMaster/addwatchers',
            method: 'POST',
            data: { watcher_id: adminID, taskID: task_id },
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
            }
          });
        }
        let watcherEye = document.getElementById('watcherEye');
        let taskBadgeSpan = watcherEye.querySelector('span.taskBadge');
        if (taskBadgeSpan) {
          taskBadgeSpan.remove();
        }
        let length = selfobj.enteredWatchersArray.length;
        if (length != 0) {
          $('.noWatchers').hide();
          $('.showWatchers').show();
          let url = "<span class='badge taskBadge watchBadge'>" + length + "</span>"
          document.getElementById('watcherEye').innerHTML += url;
        }
      } else {
        console.log("Watcher is already added");
      }
    },
    updateDataFreeTxt: function (e) {
      e.stopPropagation();
      let selfobj = this;
      let toID = $(e.currentTarget).attr("data-update");
      let record_id = $(e.currentTarget).attr("data-record_id");
      let newdetails = [];
      newdetails["" + toID] = record_id;
      this.model.set(newdetails);
      $(e.currentTarget).closest(".form-group").find("input").val($(e.currentTarget).text());
      $(".freeSerachList").hide();
    },
    getassignee: function (e) {
      var selfobj = this;

      let data = {"source":'admin',"check":'name',"list":'name,adminID,photo',"stat":false};
      var setass =  $(e.currentTarget).val();
      if (setass != "") {
        this.model.set('assignee', null);
      }
      this.appSettings.getFreeSearchList(e,data,function(e,res){

        ////$(e.currentTarget).closest(".form-group").css("position","relative");
        var dropdownContainer = $(e.currentTarget).closest(".form-group").find(".freeSerachList");
        dropdownContainer.empty();
        dropdownContainer.append('<div class="dropdown-item addNewRecord" data-view="asignee" style="background-color: #5D60A6; color:#ffffff;" > Add New Assignee </div>');
        if (res.msg === "sucess") {
          if (res.data.length > 0) {
            $.each(res.data, function (index, value) {
              console.log(value);
              dropdownContainer.append('<div class="dropdown-item selectFreeRecord" data-update="assignee" data-record_id=' + value.adminID + '>' + value.name + '</div>');
              dropdownContainer.show();
            });
          }
        } else {
          selfobj.model.set("assignee", null);
        }
        ////$(e.currentTarget).closest(".form-group").css("position","unset");
      });
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        subject: {
          required: true,
        },
        description: {
          required: true
        },
        start_date: {
          required: true,
        },
        due_date: {
          required: true
        },
        task_priority: {
          required: true
        },
        task_type: {
          required: true
        },
        task_status: {
          required: true
        },
        task_repeat: {
          required: true
        },
        customer_id: {
          required: true
        },
        assignee: {
          required: true
        }
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        //var feildsrules = {...feilds,...dynamicRules};
      }
      var messages = {
        subject: "Please enter Subject",
        description: "Please enter Deccription",
        start_date: " Please enter Start Date ",
        due_date: " Please enter End Date",
        task_priority: " Please Select Task Priority ",
        task_type: " Please Select Task Type ",
        task_status: " Please Select Task Status ",
        customer_id: "Please Select Customer Status",
        assignee: "Please Select Assignee "
      };
      $("#subject").inputmask("Regex", { regex: '^[^"]*$' });

      $("#taskDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
      startDate = $('#start_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#start_date').change();
        var valuetxt = $("#start_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt2 = $("#due_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#due_date").val("");
        }
        selfobj.model.set({ "start_date": $('#start_date').val() });
      });
      endDate = $('#due_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#due_date').change();
        var valuetxt = $("#due_date").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt2 = $("#start_date").val();
        var temp2 = moment(valuetxt2, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date").val("");
        }
        selfobj.model.set({ "due_date": $('#due_date').val() });
      });

    },

    loadAttachment: function (e) {
      var selfobj = this;
      let fieldID = $(e.currentTarget).attr("id");
      $('.upload_' + fieldID).show();
      $('.dotborder_' + fieldID).hide();
      selfobj.setRealtimeUpload();
    },

    hideUploadMedia: function (e) {
      let fieldID = $(e.currentTarget).attr("id");
      $('.upload_' + fieldID).hide();
      $('.dotborder_' + fieldID).show();
    },

    deleteAttachments: function (e) {
      let selfobj = this;
      let file_id = $(e.currentTarget).attr("data-file_id");
      let record_id = selfobj.model.get("task_id");
      let div = document.getElementById('removeIMG');
      let status = "delete";
      Swal.fire({
        title: "Delete Attachment ",
        text: "Do you want to delete Attachment ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          if (file_id != null) {
            $.ajax({
              url: APIPATH + 'customModule/removeAttachment',
              method: 'POST',
              data: { fileID: file_id, status: status, recordID: record_id },
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
                  $('#' + file_id + 'removeDiv').remove();
                  selfobj.model.set({ "attachment_file": "" });
                }

              }
            });
          } else {
            div.remove();
            selfobj.model.set({ "attachment_file": "" });
          }
        } else {

        }
      });
    },
    setRealtimeUpload: function () {
      var selfobj = this;
      $('body').find(".customUpload").each(function (index) {
        var uploadId = $(this).attr('id');
        var fileTypes = $(this).attr('data-fileTypes');

        var fileTypeArray = fileTypes.split(',').map(function (type) {
          return type.trim();
        });
        var fileTypesArray = fileTypeArray;
        var noOfFiles = $(this).attr('data-noOfFiles') ? $(this).attr('data-noOfFiles') : 0;
        // Initialize RealTimeUpload plugin for each element
        var uploadFileEl = $(this).RealTimeUpload({
          text: 'Drag and Drop or Select a File to Upload.',
          maxFiles: parseInt(noOfFiles),
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: false,
          extension: fileTypesArray,
          // extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'customUpload',
          element: uploadId, // Use a unique identifier for each element
          onSucess: function () {
            selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
            $('.modal-backdrop').hide();
          }
        });
        selfobj.uploadFileElArray.push(uploadFileEl);
      });
    },
    extractEstTime: function () {
      var estimate_time = this.model.get('estimate_time');  
      if (estimate_time) {
        estimate_time = JSON.parse(estimate_time);
        Object.entries(estimate_time).forEach(([key, value]) => {
          var newdetails = [];
          newdetails["" + key] = value;
          this.model.set(newdetails);
        });
      }
    },
    estimatedTime: function (e) {
      e.preventDefault();
      var newdetails = [];
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      newdetails["" + toID] = valuetxt;
      selfobj.model.set(newdetails);
      switch (toID) {
        case 'day':
          selfobj.estimate_time['day'] = selfobj.model.get('day');
          break;
        case 'hours':
          selfobj.estimate_time['hours'] = selfobj.model.get('hours');
          break;
        case 'minute':
          selfobj.estimate_time['minute'] = selfobj.model.get('minute');
          break;
        default:
          break;
      }
      if (selfobj.estimate_time != {}) {
        var estimate_time = JSON.stringify(selfobj.estimate_time);
        console.log("estimate_timeeeeeeeeeeee",estimate_time);     
        selfobj.model.set({ 'estimate_time': estimate_time });
      }
    },
    saveEstTime:function(e) {
      e.preventDefault();

    },
    estLogs: function (e) {
      var selfobj = this;
      var estimate = this.model.get("estimate_time");
      console.log("estimate",estimate);   
      if (estimate !== null) {     
        $('#EstModal').modal('toggle');
        new ESTModalView({ taskObj: this});
        $('body').find(".loder");
      }
    },
    estLog: function (method) {
      var selfobj = this;
      $.ajax({
          url: APIPATH + 'taskMaster/timeEstimation',
          method: method,
          data: { taskID: selfobj.taskID },
          datatype: 'JSON',
          beforeSend: function (request) {
              alert()
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
                  alert()

              }
          }
      });
  },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = tasktemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      //let pList = this.productList.models?this.productList.models:[];
      this.$el.html(template({ "model": this.model.attributes, "userRoll": this.userRoll, "categoryList": this.categoryList.models, "loggedInID": this.loggedInID, "menuName": this.menuName, "productList": this.productList.models, relatedList: this.relatedList }))
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      // $(".showWatch").hide();


      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html

      $("#dynamicFormFields").empty().append(selfobj.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      $(".ws-select").selectpicker();
      this.initializeValidate();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label, this.toClose);
      if (this.taskID != undefined && this.taskID != null && this.taskID != "") {
        selfobj.commentSingleView = new commentSingleView({ appendto: this.$(".commentbox"), type: 'task', record_id: selfobj.taskID, searchComment: selfobj });
      }
      if (this.taskID == undefined || this.taskID == null || this.taskID == "") {
        this.loadMedia();
      }
      this.uploadFileEl = $("#taskUpload").RealTimeUpload({
        text: 'Drag and Drop or Select a File to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'taskUpload/',
        element: 'taskUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      });

      selfobj.atValues = [];
      _.each(selfobj.adminList.models, function (admin) {
        selfobj.atValues.push({
          'id': admin.attributes.adminID,
          'value': admin.attributes.name,
        });
      });

      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean'],
        // ['image']                              // remove formatting button
      ];
      var editor = new Quill($("#task_description").get(0), {
        modules: {
          imageResize: {
            displaySize: true
          },
          toolbar: {
            container: __toolbarOptions,
            handlers: {
              image: imageHandler
            }
          },
        },
        theme: 'snow'
      });

      function imageHandler() {
        var range = this.quill.getSelection();
        var value = prompt('please copy paste the image url here.');
        if (value) {
          this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
        }
      }
      editor.on('text-change', function (delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
          var delta = editor.getContents();
          var text = editor.getText();
          var justHtml = editor.root.innerHTML;
          selfobj.model.set({ "description": justHtml });
        }
      });
      let docUrl = "";
      const attachment_file = this.model.get("attachment_file");
      const file_id = this.model.get("attachment_id");
      if (Array.isArray(attachment_file) && Array.isArray(file_id) && attachment_file.length === file_id.length) {
        for (let i = 0; i < attachment_file.length; i++) {
          const fName = attachment_file[i];
          const ftext = fName.split(".");
          let modifiedFName = fName;
          const file_ids = file_id[i];
          if (ftext[1] === "xls" || ftext[1] === "xlsx") {
            modifiedFName = "excel.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''><div class='buttonShow visableAttach'><span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class='deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "pdf") {
            modifiedFName = "pdf.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else if (ftext[1] === "docx") {
            modifiedFName = "word.png";
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + fName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          } else {
            docUrl += "<div id='" + file_ids + "removeDiv' class='attachedPic' data-show='singleFile'><div class='thumbnail'><div class='centered removeAttach'><img id='removeIMG' class='img-fluid fileImage img-thumbnail' src='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' alt=''/><div class='buttonShow visableAttach'> <span class='attachView'><a href='" + UPLOADS + "/task/" + selfobj.taskID + '/' + modifiedFName + "' target='_blank'><span class='material-icons'>visibility</span></a></span><span class=' deleteAttach deleteAttachment' data-file_id='" + file_ids + "'><span class='material-icons'>delete</span></span></div></div></div></div>";
          }
        }
        document.getElementById("attachedDoc").innerHTML += docUrl;

      }
      $('#taskCom li:first-child a').tab('show');

      this.enteredWatchersArray = [];

      var watchersToAdd = this.model.get("tasksWatchers");
      var watcherAdminID = this.model.get("tasks_watchersAdminID");
      if (watchersToAdd != null && watcherAdminID != null) {
        console.log("watchersToAdd");
        console.log(watchersToAdd);
        for (let i = 0; i < watchersToAdd.length; i++) {
          var enteredName = watchersToAdd[i];
          var id = watcherAdminID[i];
          var initial = selfobj.getInitials(enteredName);
          var htmlToAppend = '<span class="tm-tag"> <div class="watcherInitialDetails"><span class="watcherInitial">' + initial + '</span><span>' + enteredName + '</span></div> <a class="removeWatcher"data-watcherAdminID=' + id + '><i class="material-icons">close</i> </a></span>';
          $(".tm-input").append(htmlToAppend);
          selfobj.enteredWatchersArray.push({ name: enteredName, id: id });
        }
      }
      let length = selfobj.enteredWatchersArray.length
      if (length == 0) {
        $('.noWatchers').show();
      } else {
        $('.noWatchers').hide();
        let url = "<span class='badge taskBadge watchBadge'>" + length + "</span>"
        document.getElementById('watcherEye').innerHTML += url;
      }
      selfobj.model.set({ "tasksWatchersArray": selfobj.enteredWatchersArray });
      const uploadedMedia = selfobj.model.get("uploadedMedia");

      // Check if uploadedMedia is an array and has elements
      if (Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
        // Iterate over each object in the uploadedMedia array
        uploadedMedia.forEach(item => {
          const attachment_file = item.attachFile; // Array of file names
          const attachment_fieldID = item.attachment_fieldID; // Array of field IDs
          const attachment_id = item.attachment_id; // Array of attachment IDs

          // Check if attachment_file, attachment_fieldID, and attachment_id are arrays and have the same length
          if (Array.isArray(attachment_file) && Array.isArray(attachment_fieldID) && Array.isArray(attachment_id) &&
            attachment_file.length === attachment_fieldID.length && attachment_file.length === attachment_id.length) {

            let docUrl = "";
            // Iterate over each file in the arrays
            for (let i = 0; i < attachment_file.length; i++) {
              const fName = attachment_file[i];
              const ftext = fName.split(".");
              let modifiedFName = fName;
              var imgPath;
              const file_ids = attachment_id[i];

              if (ftext[1] === "xls" || ftext[1] === "xlsx") {
                modifiedFName = "excel.png";
                imgPath = `${UPLOADS}${modifiedFName}`;
              } else if (ftext[1] === "pdf") {
                modifiedFName = "pdf.png";
                imgPath = `${UPLOADS}${modifiedFName}`;
              } else {
                imgPath = `${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}`;
              }
              // Construct the HTML for each file
              docUrl += `<div id="${file_ids}removeDiv" class="attachedPic" data-show="singleFile">
                                      <div class="thumbnail">
                                          <div class="centered removeAttach">
                                              <img id="removeIMG" class="img-fluid fileImage img-thumbnail" src="${imgPath}" alt="">                
                                              <div class="buttonShow visableAttach">
                                                  <span class="attachView">
                                                      <a href="${UPLOADS}${selfobj.form_label}/${selfobj.recordID}/${modifiedFName}" target="_blank">
                                                          <span class="material-icons">visibility</span>
                                                      </a>
                                                  </span>
                                                  <span class="deleteAttach deleteAttachments" data-file_id="${file_ids}">
                                                      <span class="material-icons">delete</span>
                                                  </span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>`;
            }
            setTimeout(function () {
              // Append the generated HTML to the "attachedDocs" div
              $('body').find(".attachedDocs_" + attachment_fieldID).empty();
              $('body').find(".attachedDocs_" + attachment_fieldID).append(docUrl);
            }, 1000);
          } else {
            console.log("Attachment arrays have different lengths or are not arrays.");
          }
        });
      } else {
        console.log("uploadedMedia is not an array or it is empty.");
      }
      this.delegateEvents();
      return this;
    },

  });
  return taskSingleView;
});