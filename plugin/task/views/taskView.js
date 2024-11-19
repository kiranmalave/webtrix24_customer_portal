
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/taskSingleView',
  '../views/escalationView',
  '../views/repeatTaskCustomView',
  '../../core/views/historySingleView',
  '../collections/taskCollection',
  '../models/taskFilterOptionModel',
  "../../admin/collections/adminCollection",
  "../../customer/collections/customerCollection",
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  '../../core/views/notificationView',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/timeselectOptions',
  '../../core/views/listSliderView',
  '../../core/views/mailView',
  '../../core/views/dynamicFilterView',
  'text!../templates/taskRow.html',
  'text!../templates/taskGridRow.html',
  'text!../templates/task_temp.html',
  'text!../templates/taskFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, moment, Swal, taskSingleView, escalationView, repeatTaskCustomView, historySingleView, taskCollection, taskFilterOptionModel, adminCollection, customerCollection, configureColumnsView, appSettings, dynamicFormData, slugCollection, notificationView, moduleDefaultSettings, timeselectOptions, listSliderView, mailView, dynamicFilterView, taskRowTemp, taskGridRow, taskTemp, taskFilterTemp, linkedDropdown, deleteCardView) {


  var taskView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    form_label: '',
    View: 'traditionalList',
    listDataGrid: [],
    mname: '',
    filteredSearch: false,
    currPage: 0,
    isdataupdated: false,
    categoryList: [],
    arrangedColumnList: [],
    attachedEvents: {},
    loadFrom: '',
    idsToRemove: [],
    relatedList:[],
    gridColID:null,
    quickFilter:"",
    appendto:null,
    project_id:null,
    filterContainer:null,
    initialize: function (options) {
      $(".profile-loader").show();
      this.startX = 0;
      this.startWidth = 0;
      this.$handle = null;
      this.$table = null;
      this.pressed = false;
      this.tableStructure = {},
      this.toClose = "taskFilterView";
      var selfobj = this;
      if(options.appendto != undefined && options.appendto != ""){
        this.appendto = options.appendto;
      }
      this.loadFrom = options.loadfrom;
      this.filteredFields = [];
      this.filteredData = [];
      this.filterCount = null;
      this.scanDetails = options.searchtask;
      this.totalRec = 0;
      this.currPage = 0;
      this.taskID = options.action;
      if(options.project_id != undefined && options.project_id !=""){
        this.project_id = options.project_id;
      }
      this.idsToRemove = [];
      this.staticJoined = [
        {
          field: 'task_type',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'category_id',
          slug: 'task_type'
        },
        {
          field: 'task_status',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName,parent_id',
          primaryKey: 'category_id',
          slug: 'task_status'
        },
        {
          field: 'task_priority',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'category_id',
          slug: 'task_priority'
        },
        {
          field: 'customer_id',
          fieldtype: 'customer_id',
          joinedTable: 'customer',
          select: 'customer_id,name',
          primaryKey: 'customer_id',
          slug: ''
        },
        {
          field: 'assignee',
          fieldtype: 'assignee',
          joinedTable: 'admin',
          select: 'adminID,name',
          primaryKey: 'adminID',
          slug: ''
        },

        {
          field: 'category_id',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName,parent_id',
          primaryKey: 'category_id',
          slug: 'task_type'
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
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.bulkeditfields =["start_date","due_date","assignee","task_status","task_type","task_priority","customer_id","related_to"];
      this.skipFields = ['end_on_date','ends','repeated', 'occurrence_count', 'is_private', 'does_repeat', 'task_repeat', 'repeat_on', 'record_type', 'completed_date', 'week_numb', 'monthly', 'days', 'end_after_date', 'product_id'];
      this.columnMappings = [
        { 'name': 'Customer Name' },
        { 'email': 'Customer Email' },
        { 'company_id': 'Company Name' },
        { 'project_id': 'Project' },
        { 'task_id': 'Task ID' },
      ];
      this.mname = Backbone.history.getFragment();
      const match = this.mname.match(/^task(?:\/(\d+))?$/);
      if (match) {
        // If the pattern is matched, set this.mname to "task"
        this.mname = match[1] ? "task" : this.mname;
        this.mname = "task"
        // Continue with the rest of the code
        permission = ROLE[this.mname];
        this.menuId = permission.menuID;
        this.appSettings = new appSettings();
        this.dynamicFormDatas = new dynamicFormData();
      } else {
        if (this.mname == "projects") {
          this.mname = "task";
        }
        permission = ROLE[this.mname];
        this.menuId = permission.menuID;
        console.log("MenuIdddddd",this.menuId);
        
        this.appSettings = new appSettings();
        this.relatedList = this.appSettings.getTaskRelated();
        this.dynamicFormDatas = new dynamicFormData();
      }
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.collection = new taskCollection();
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj: this });
      this.timeselectOptions = new timeselectOptions();
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.defaultViewSet();
        //selfobj.getColumnData();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }

      });

      this.$el.find(".loder").hide();
      this.$el.find(".filter").hide();

      this.filterCount = null;
      this.filterOption = new taskFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      if(this.loadFrom == "project") {
        this.filterOption.set({ "project_id": this.project_id });
        this.skipFields.push("project_id");
      }

      

      if (this.mname == "task") {
        this.filterOption.set({ record_type: "task" });
        this.filterOption.set({ company_id: DEFAULTCOMPANY });
      } else if (this.mname == "ticket") {
        this.filterOption.set({ record_type: "ticket" });
        this.filterOption.set({ company_id: DEFAULTCOMPANY });
      } else if (this.mname == "amc") {
        this.filterOption.set({ record_type: "amc" });
      }
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'taskMaster/multipleHardDelete';
      this.statusChangeURL = 'taskMaster/multipletaskChangeStatus';
      this.render();
      // FOR DELAY IN REFRESH GRID
      this.resetSearch = _.debounce(this.resetSearch, 500);
    },
    getColumnData: function () {
      var selfobj = this;
      this.dynamicFormDatas.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
      }).done(function (res) {
        if (res.flag == "F") { showResponse('', res, '');}
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.metadata && res.metadata.trim() != '') {
          selfobj.metadata = JSON.parse(res.metadata);
        }
        if (res.c_metadata && res.c_metadata.trim() != '') {
          selfobj.c_metadata = JSON.parse(res.c_metadata);
          // get the columns from server now change the labels
          if(selfobj.c_metadata.length > 0) {
              selfobj.c_metadata.forEach((columnData,indexof) => {
              const index = selfobj.columnMappings.findIndex(mapping => columnData.column_name in mapping);
              columnData.fieldLabel = index !== -1 ? selfobj.columnMappings[index][""+columnData.column_name] : columnData.fieldLabel;
            });
          }
          selfobj.arrangedColumnList = selfobj.c_metadata;
        }
        var columnss = [];
        if (selfobj.metadata) {
          for (const rowKey in selfobj.metadata) {
            const row = selfobj.metadata[rowKey];
            for (const colKey in row) {
              const column = row[colKey];
              if (column.column_name) {
                columnss.push(column.column_name);
              }
            }
          }
          const resDataFieldNames = res.data.map(item => item.column_name);
          selfobj.filteredData = resDataFieldNames.filter(fieldName => !columnss.includes(fieldName));
        }
        selfobj.render();
        selfobj.getModuleData();
      });
    },

    getModuleData: function () {
      var $element = $('#loadMember');
      var selfobj = this;
      this.collection.reset();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") { showResponse('', res, '');}
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == 'S') {
          (res.data.length > 0) ? $('.filter').show() : $('.filter').hide();
        }
        setPagging(res.paginginfo, res.loadstate, res.msg);
        $(".profile-loader").hide();
      });
      selfobj.render(); 
      if (this.loadFrom == "customerActivity") {
        this.openSingleTemp(this.taskID);
        return;
      }
    },

    setStageColor: function () {
      var selfobj = this;
      var stageColor;
      this.categoryList.models.forEach(function (element) {
        element.attributes.sublist.forEach(function (list) {
          stageColor = setColor(list.cat_color);
          list.cat_color_light = stageColor;
          fontColor = getFontColor(list.cat_color);
          list.font_color = fontColor;
        })
      });
    },

    events:
    {
      "click .resetval": "clearfilter",
      "click .loadview": "loadSubView",
      "click .sortColumns": "sortColumn",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .changeBox": "changeBox",
      "change .quickFlter": "sortByDate",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .downloadReport": "downloadReport",
      "change .setTaskStatus": "setTaskStatus",
      "click .listViewBtn": "showViewList",
      "click .setViewMode": "setViewMode",
      "click .listSortColumns": "showListSortColumns",
      "click .memberlistcheck": "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .hardDelete": "hardDelete",
      "click .deleteCard": "deleteCard",
    },
    memberListCheck: function (e) {
      var allChecked = true;
      this.$el.find(".memberlistcheck").each(function () {
        if (!$(this).prop("checked")) {
          allChecked = false;
          return false;
        }
      });
      if (allChecked) {
        this.$el.find(".checkall").prop("checked", true);
      } else {
        this.$el.find(".checkall").prop("checked", false);
      }
    },
    showViewList: function (e) {
      this.$el.find(".showListView").toggle();
    },
    showListSortColumns: function (e) {
      e.preventDefault();
      var $target = $(e.currentTarget);
      var $showSortOptions = $target.siblings('.showSortOptions');
      var $allSortOptions = this.$el.find('.showSortOptions');
      // var $allSortingBtns = $('.sortingBtn');
      if ($showSortOptions.is(':visible')) {
        $showSortOptions.hide();
        // $target.closest('.sortingBtn').css("visibility", 'hidden');
      } else {
        $allSortOptions.hide();
        // $allSortingBtns.css("visibility", 'hidden');
        $showSortOptions.show();
        // $target.closest('.sortingBtn').css("visibility", 'visible');
      }
    },
    setViewMode: function (e) {
      let selfobj = this;
      var View = $(e.currentTarget).attr("data-value");
      var isOpen = this.$el.find(".ws_ColumnConfigure").hasClass("open");
      if (isOpen) {
        this.$el.find(".ws_ColumnConfigure").removeClass("open");
        if (this.$el.find(".arrangeColumns").hasClass("BG-Color")) {
          this.$el.find(".arrangeColumns").removeClass("BG-Color")
        }
      }
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      } else {
        selfobj.userSettings = {};
      }
      var moduleDetails  = this.userSettings[this.menuId];
      if (moduleDetails.tableStructure) {
        selfobj.tableStructure = moduleDetails.tableStructure;;
      } else {
        selfobj.tableStructure = {};
      }
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, View, selfobj.tableStructure);
      if (View != "grid") {
        this.$el.find(".showListView").toggle();
        selfobj.defaultViewSet();
        //selfobj.resetSearch();
      } else if (View == "grid") {
        this.$el.find(".list_mode").removeAttr("disabled");
        this.$el.find(".grid_mode").attr('disabled', 'disabled');
        selfobj.collection.reset();
        selfobj.defaultViewSet();
        //selfobj.dynamicFilter.renderFilterConditions(selfobj.filterOption.filterJson);
        selfobj.render();
        setTimeout(() => {
          //selfobj.gridLazyLoad("");
          selfobj.setupDropable();
          selfobj.setupSortable();  
        }, 200);
        this.$el.find(".showListView").toggle();
      }
    },
    addAllGrid: function (col_name) {
      //this.$el.find("#" + col_name).children().not('.totalCount').remove();
      let selfobj = this;
      if(selfobj.listDataGrid[col_name] != undefined){
        selfobj.listDataGrid[col_name].models.forEach(element => {
          // check datatype and if type is date, datetime or time change it as per the setting
            //if(element.attributes.start_date) {
            element.attributes.start_date = selfobj.timeselectOptions.changeTimeFormat(element.attributes.start_date);
            element.attributes.due_date = selfobj.timeselectOptions.changeTimeFormat(element.attributes.due_date);
          selfobj.addOne(element);
        });
      }
    },
    gridLazyLoad: function (listgridID) {
      let selfobj = this;
      
      if (listgridID == "") {
        if (selfobj.isdataupdated || selfobj.listDataGrid.length == 0) {
          var isFilter = false;
          if (selfobj.filterOption.get("task_status") != null) {
            isFilter = true;
          }
          $.each(this.categoryList.models, function (index, value) {
            if (value.attributes.slug == "task_status") {
              $.each(value.attributes.sublist, function (index2, value2) {
                if (!isFilter) {
                  selfobj.filterOption.set({ task_status: value2.category_id });
                  selfobj.$el.find("#" + value2.category_id).children().not('.totalCount').remove();
                  selfobj.listDataGrid[value2.category_id] = new taskCollection();
                  selfobj.listDataGrid[value2.category_id].fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                  }).done(function (res) {
                    if (res.flag == "F") {
                      showResponse('', res, '');
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".profile-loader").hide();
                    selfobj.paginginfo = res.paginginfo;
                    selfobj.setGridPagging(selfobj.paginginfo, value2.category_id);
                    selfobj.addAllGrid(value2.category_id);
                  });
                  selfobj.$el.find("#leadlistview").hide();
                } else {
                  if (selfobj.filterOption.get("task_status") == value2.category_id && selfobj.filterOption.get("task_status") != 0) {
                    selfobj.listDataGrid[value2.category_id] = new taskCollection();
                    selfobj.listDataGrid[value2.category_id].fetch({
                      headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                      }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                    }).done(function (res) {
                      if (res.flag == "F") {
                        showResponse('', res, '');
                      }
                      if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                      $(".profile-loader").hide();
                      selfobj.paginginfo = res.paginginfo;
                      selfobj.setGridPagging(selfobj.paginginfo);
                      selfobj.addAllGrid(value2.category_id, value2.category_id);
                    });
                    selfobj.$el.find("#leadlistview").hide();
                  } else {
                    selfobj.listDataGrid[value2.category_id] = new taskCollection();
                    selfobj.addAllGrid(value2.category_id);
                  }
                }
              });
            }
          });
          this.loadotherData();
          // _.debounce(this.loadotherData, 500)
          selfobj.isdataupdated = false;
        }else{
          // render again the grid view
          $.each(selfobj.listDataGrid, function (index, value) {
            if(selfobj.listDataGrid[index] != undefined){
              selfobj.listDataGrid[index].on('add', this.addOne, this);
              selfobj.listDataGrid[index].on('reset', this.addAll, this);
            selfobj.setGridPagging(selfobj.listDataGrid[index].pageinfo,index);
            selfobj.addAllGrid(index);
            }
          });
          selfobj.$el.find("#leadlistview").hide();
        }
      } else {
        this.gridColID = listgridID;
        this.stageColumnUpdate(false,listgridID);
      }
    },
    loadotherData: function(){
      var selfobj = this;
      selfobj.filterOption.set({ task_status: "otherStatus" });
      selfobj.listDataGrid[0] = new taskCollection();
      selfobj.listDataGrid[0].fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.$el.find("#otherStatus").children().not('.totalCount').remove();
        selfobj.paginginfo = res.paginginfo;
        selfobj.setGridPagging(selfobj.paginginfo,"otherStatus");
        selfobj.addAllGrid(0);
        selfobj.filterOption.set({ task_status: null });
      });
    },
    setGridPagging: function (pagingInfo, stageID) {
      if(stageID=="0"){
        stageID ="otherStatus";
      }
      this.$el.find("#" + stageID).find('.gridPagging').empty();
      if (pagingInfo.end > pagingInfo.totalRecords) {
        var paggingString = pagingInfo.totalRecords + " of " + pagingInfo.totalRecords;
      } else {
        var paggingString = pagingInfo.end + " of " + pagingInfo.totalRecords;
      }

      this.$el.find("#" + stageID).find('.gridPagging').append(paggingString);

    },
    setupSortable: function () {
      var selfobj = this;
      this.$el.find(".leadCustomer").sortable({
        connectWith: ".leadCustomer",
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        items: '>.leadDetailsCard',
        change: function (event, ui) {
        }
      });

      this.$el.find(".row.kanban-view").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '>.leadIndex',
        cursor: 'grabbing',
        stop: function (event, ui) {
          setTimeout(function () { selfobj.savePositions(); }, 100);
        }
      });
    },
    savePositions: function () {
      var selfobj = this;
      var action = "changePositions";
      var serializedData = $(".row.kanban-view .leadIndex").map(function () {
        return $(this).data("lead-id");
      }).get();
      $.ajax({
        url: APIPATH + 'taskColumnUpdatePositions',
        method: 'POST',
        data: { action: action, menuIDs: serializedData },
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
    },
    setupDragable: function () {
      var selfobj = this;
      this.$el.find(".leadCustomer").draggable({
        start: function(event, ui) {
          selfobj.sourceId = $(this).parent().attr('id');
          console.log('Dragging from parent ID:', selfobj.sourceId);
        },
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
      });
    },
    setupDropable: function () {
      let selfobj = this;
      $("body").find(".leadDrop").droppable({
        accept: ".leadCustomer",
        over: function (event, ui) {
          //oldID =  $(this).attr('id');
          $(this).addClass("ui-state-highlight");
        },
        out: function (event, ui) {
          $(this).removeClass("ui-state-highlight");
        },
        drop: function (event, ui) {
          var task_id = $(ui.draggable).attr('data-task_id');
          
          let oldID = selfobj.sourceId;
          var taskStatusID = $(this).parent().find('.listgrid').attr('id');
          
          var task_id = $(ui.draggable).attr('data-task_id');
          $(this).append(ui.draggable);
          $(this).removeClass("ui-state-highlight");
          ui.draggable.removeClass("ui-draggable-dragging");
          selfobj.gridColID = oldID;
          selfobj.updateTaskStatus(taskStatusID,task_id,oldID);
          
          // setTimeout(function () {
            
          // }, 100);
        },
      });
    },
    updateTaskStatus: function (taskStatusID, task_id,oldID) {
      let selfobj = this;
      if (task_id != "" && task_id != "") {
        $.ajax({
          url: APIPATH + 'taskMaster/taskStatusUpdate',
          method: 'POST',
          data: { taskID: task_id, taskStatus: taskStatusID },
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
              selfobj.gridColID = taskStatusID;
              selfobj.stageColumnUpdate(true,taskStatusID,function(){
                selfobj.gridColID = oldID;
                selfobj.stageColumnUpdate(true,oldID);
              });
              
            }
          }
        });
      }
    },
    stageColumnUpdate: function (refresh,gridColID,callback) {
      var selfobj= this;
      if(gridColID == ""){
        gridColID = this.gridColID;
      }
      selfobj.filterOption.set("task_status",this.gridColID);
      if(gridColID == "otherStatus"){
        this.gridColID = 0;
        gridColID=0;
        selfobj.filterOption.set("task_status","otherStatus");
      }
      if(refresh){
        if (selfobj.listDataGrid[this.gridColID] != undefined) {
          selfobj.listDataGrid[this.gridColID].reset();
          
          selfobj.filterOption.set("curpage",0);
          this.$el.find("#" + this.gridColID).children().not('.totalCount').remove();
        }
      }else{
        selfobj.filterOption.set({ curpage: selfobj.listDataGrid[this.gridColID].pageinfo.nextpage });
        //selfobj.filterOption.set({ task_status: this.gridColID });
      }
      if (selfobj.listDataGrid[this.gridColID] != undefined) {
        if (selfobj.listDataGrid[this.gridColID].loadstate || refresh) {
          selfobj.listDataGrid[this.gridColID].fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
          }).done(function (res) {
            if (res.flag == "F") {
              showResponse('', res, '');
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".profile-loader").hide();
            selfobj.paginginfo = res.paginginfo;
            selfobj.setGridPagging(selfobj.paginginfo, selfobj.gridColID);
            selfobj.addAllGrid(selfobj.gridColID);
            selfobj.gridColID = null;
            if(typeof callback === 'function'){
              callback();
            }
          });
        }
      }
    },
    preventDefaultClick: function (event) {
      event.preventDefault();
    },
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      newdetails["SadminID"] = $.cookie('authid');
      newdetails["staticJoined"] = JSON.stringify(this.staticJoined);
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
        action: APIPATH + "reports",
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
      dataInput.val(JSON.stringify(selfobj.filterOption));
      form.submit();
      form.attr({
        action: "#",
        method: "POST",
        target: "",
      });
      selfobj.filterOption.clear('type');
    },
    openSingleTemp: function (taskID) {
      let selfobj = this;
      if (taskID != "") {
        new taskSingleView({ task_id: taskID, searchtask: selfobj, menuId: selfobj.menuId, form_label: "Task", menuName: selfobj.mname });
      }
    },
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      } else {
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        Swal.fire({
          title: "Delete Task ",
          text: "Do you want to delete task !!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",
        }).then((result) => {
          if (result.isConfirmed) {
            $('#clist input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-task_id"));
              }
            });
            $(".action-icons-div").hide();
            var idsToRemove = removeIds.toString();
            if (idsToRemove == '') {
              $('.checkall').prop('checked', false)
              Swal.fire('Failed', 'Please select at least one record.', 'error');
              return false;
            }
            $.ajax({
              url: APIPATH + 'taskMaster/status',
              method: 'POST',
              data: { list: idsToRemove, action: "changeStatus", status: status, company_id: DEFAULTCOMPANY, menuId: selfobj.menuId },
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
                  selfobj.render();

                }
                selfobj.isdataupdated = true;
                selfobj.$el.find(".deleteAll").hide();
                selfobj.$el.find('.checkall').prop('checked', false);
                selfobj.$el.find('.memberlistcheck').prop('checked', false);
              }
            });
          } else {
            selfobj.$el.find('.changeStatus').hide();
            selfobj.$el.find('.checkall').prop('checked', false);
            selfobj.$el.find('.memberlistcheck').prop('checked', false);
          }

        });
      }
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    hardDelete: function (e) {
      let selfobj = this;
      var taskID = $(e.currentTarget).attr("data-task_id");
      var status = "delete"
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to Delete", '', 'error');
        return false;
      } else {
        Swal.fire({
          title: 'This action is irreversible and will permanently remove all associated data. Please confirm that you wish to proceed with this critical action.',
          text: '',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Delete',
          denyButtonText: `Cancel`,
          icon: "question",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'taskMaster/hardDelete',
              method: 'POST',
              data: { id: taskID, action: status },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F")
                  showResponse(e, res, '');

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filterSearch();
                }
              }
            });
          } else if (result.isDismissed) return;
        });
      }
    },

    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      selfobj.$el.find(".loder").show();
        switch (show) {
          case "singletaskData": {
            if(selfobj.loadFrom == "project"){
              var loadFromProject = "projectTask";
            }else{
              var loadFromProject = "taskModule";
            }
            if (!$(e.target).closest('.listCheckbox').length) {
              var task_id = $(e.currentTarget).attr("data-task_id");
              if (task_id != "" && task_id != null && task_id != undefined) {
                if (permission.edit != "yes") {
                  Swal.fire("You don't have permission to edit", '', 'error');
                  return false;
                } else {
                  $(".loder").hide();
                  if(selfobj.View == "grid"){
                    this.gridColID = $(e.currentTarget).parent().attr('id');
                    new taskSingleView({ loadFrom: loadFromProject , task_id: task_id, searchtask: selfobj, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: selfobj.mname });
                  }else{
                    new taskSingleView({ loadFrom: loadFromProject , task_id: task_id, searchtask: selfobj, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: selfobj.mname });
                  }
                  
                }
              } else {
                handelClose("historySingleView");
                if (permission.add != "yes") {
                  Swal.fire("You don't have permission to add", '', 'error');
                  return false;
                } else {
                  new taskSingleView({ loadFrom: loadFromProject, task_id: task_id, searchtask: selfobj, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: selfobj.mname });
                }
              }
              selfobj.$el.find(".loder").hide();
            }
            selfobj.$el.find(".loder").hide();
            break;
          }
          case "notificationView": {
            var categoryList = [];
            new notificationView({ parentObj : this});
            selfobj.$el.find(".loder").hide();
            break;
          }
          case "escalationView": {
            var categoryList = [];
            new escalationView({ menuID: selfobj.menuId, searchEscalation: selfobj, module_name: selfobj.mname, filteredData: selfobj.filteredData });
            selfobj.$el.find(".loder").hide();
            break;
          }
          case "mail": {
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
      $(".loder").hide();
    },

    taskProjectrefresh: function(){
      this.scanDetails.refresh();
    },

    sortColumn: function (e) {
      e.stopPropagation();
      this.dynamicFilter.sortColumn(e);
      
      // var order = $(e.currentTarget).attr("data-value");
      // var selfobj = this;
      // var newsetval = [];
      // $("#clist").find(".listSortColumnUp, .listSortColumnDown").removeClass("selected");
      // $("#clist").find(".up, .down").removeClass("active");
      // var currentField = $(e.currentTarget).attr("data-field");
      // newsetval["orderBy"] = currentField;
      // if (order == undefined) {
      //   selfobj.$el.find('.showSortOptions').hide();
      //   var currentSortOrder = selfobj.filterOption.get("order");
      //   if (currentSortOrder === "ASC") {
      //     order = "DESC";
      //   } else {
      //     order = "ASC";
      //   }
      // }
      // if (order == "DESC") {
      //   $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
      //   $(e.currentTarget).closest('th').find(".sortarrow.down").addClass("active");
      //   $(e.currentTarget).closest('th').find(".listSortColumnDown").addClass("selected");
      //   newsetval["order"] = order;
      // }
      // else if (order == "ASC") {
      //   $(e.currentTarget).closest('th').find(".clearSorting").removeAttr("disabled")
      //   $(e.currentTarget).closest('th').find(".sortarrow.up").addClass("active");
      //   $(e.currentTarget).closest('th').find(".listSortColumnUp").addClass("selected");
      //   newsetval["order"] = order;
      // }
      // else {
      //   $(e.currentTarget).closest(".clearSorting").attr('disabled', 'disabled');
      //   newsetval["order"] = 'DESC';
      //   newsetval["orderBy"] = 't.created_date';
      // }
      // selfobj.filterOption.set(newsetval);
      // selfobj.filterSearch();
    },
    sortByDate: function (e) {
      //e.stopPropagation();
      var order = $(e.currentTarget).val();
      let selfobj = this;
      let newsetval = [];
      var date;
      selfobj.filteredSearch = true;
      selfobj.$el.find('.taskfilbtn').removeClass('active');
      // $(e.currentTarget).addClass('active');
      if (order === "today") {
        date = moment().format('YYYY-MM-DD');
      } else if (order === "tomorrow") {
        date = moment().add(1, 'days').format('YYYY-MM-DD');
      } else if (order === "yesterday") {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD');
      }
      if(order==""){
        selfobj.quickFilter ="";
        selfobj.filterOption.set({"due_date":null});
      }else{
        selfobj.quickFilter =order;
        selfobj.filterOption.set({"due_date":date});
      }
      if(selfobj.View=="grid"){
        this.$el.find(".list_mode").removeAttr("disabled");
        this.$el.find(".grid_mode").attr('disabled', 'disabled');
        selfobj.defaultViewSet();
        selfobj.isdataupdated=true;
      }else{
      selfobj.filterSearch();
      }
      
    },
    addOne: function (objectModel) {
      var selfobj = this;
      if(selfobj.View=="grid"){
        selfobj.$el.find(".noCustAdded").hide();
        //selfobj.$el.find("#taskListView").hide();
        var template = _.template(taskGridRow);
        let intial = selfobj.appSettings.getInitials(objectModel.attributes.assignee);
        if (objectModel.attributes.task_statusID != 0 && objectModel.attributes.task_statusID != null) {
          this.$("#" + objectModel.attributes.task_statusID).append(template({ taskDetails: objectModel, taskLength: this.collection.length, "assigneeInitial":intial}));
        } else {
          this.$el.find("#otherStatus").append(template({ taskDetails: objectModel, taskLength: this.collection.length, assigneeInitial: intial}));
          //this.$el.find("#otherStatus").addClass("1212");
        }
        selfobj.setupDragable();

      }else{
        selfobj.totalRec = selfobj.collection.length;
        if (selfobj.totalRec == 0) {
          selfobj.$el.find(".noCustAdded").show();
        }else{
          selfobj.$el.find(".noCustAdded").hide();
        }
        // check datatype and if type is date, datetime or time change it as per the setting
        Object.entries(objectModel.attributes).forEach(([index, columnItem]) => {
          const result = selfobj.arrangedColumnList.find(field => field.column_name === index);
          const fieldType = result ? result.fieldType : null;
          if(fieldType=="Datepicker" || fieldType=="Date") {
            objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
          }
          if(fieldType=="Timepicker") {
            objectModel.set({index:selfobj.timeselectOptions.changeOnlyTime(columnItem)}); 
          }
          if(fieldType=="Date Time") {
            objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
          }
        });
        var template = _.template(taskRowTemp);
        objectModel.set({ "initial": selfobj.appSettings.getInitials(objectModel.attributes.assignee) });
        objectModel.set("initialBgColor",selfobj.appSettings.getColorByInitials(objectModel.attributes.initial));
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        this.$el.find("#taskList").append(template({ taskDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
      }
    },
    addAll: function () {
      var selfobj = this;
      this.$el.find("#taskList").empty();
      setTimeout(function () {
        selfobj.collection.forEach(this.addOne, this);
      }, 100);
    },
    getFontColor: function (bgColor) {
      if (bgColor) {
        var selfobj = this;
        const rgb = selfobj.hexToRgb(bgColor);
        const darkerRgb = {
          r: Math.max(0, rgb.r - 130),
          g: Math.max(0, rgb.g - 130),
          b: Math.max(0, rgb.b - 130)
        };
        const darkerHex = selfobj.rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b);
        return `rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 1)`;
      }
    },
    rgbToHex: function (r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    hexToRgb: function (hex) {
      if (hex) {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
        };
      }
    },
    // FILTER SEARCHES
    filteredSearches: function (e) {
      var selfobj = this;
      selfobj.filteredSearch = true;
      if(selfobj.View=="grid"){
        selfobj.isdataupdated= true;
        selfobj.gridLazyLoad("");
        selfobj.loadotherData();
        //selfobj.filterOption.attributes
      }else{
        selfobj.filterSearch();
      }
    },
    clearfilter:function(){
      this.$("#quick_filter").val('');
      this.dynamicFilter.clearFilter();
    },
    // RESET FILTERS
    resetSearch: function () {
      this.filterOption.set({ "menuId": this.menuId });
      this.filterOption.set({ company_id: DEFAULTCOMPANY });
      // this.filterOption.clear().set(this.filterOption.defaults);
      // this.filterOption.set({ company_id: DEFAULTCOMPANY });
      if(this.loadFrom == "project") {
        this.filterOption.set({ "project_id": this.project_id });
        //this.skipFields.push("project_id");
      }
      this.$el.find(".multiOptionSel").removeClass("active");
      this.$el.find(".down").removeClass("active");
      this.$el.find(".up").removeClass("active");
      
      //this.dynamicFilter.clearFilter();
      if(this.View=="grid"){
          this.isdataupdated= true;
          this.filterOption.set({curpage:0});
          this.filterOption.set("task_status",null);
          this.$el.find(".listgrid").children().not('.totalCount').remove();
            this.gridLazyLoad("");
          }else{
            this.filteredSearch = true;
            this.currPage = 0;
            if (this.mname == "task") {
              this.filterOption.set({ record_type: "task" });
            } else if (this.mname == "ticket") {
              this.filterOption.set({ record_type: "ticket" });
            }
            this.filterSearch(false);
          }


      // let selfobj = this;
      // if (selfobj.default_filter) {
      //   selfobj.getDefaultFilter(false);
      //   selfobj.filterOption.clear().set({ 'filterJson': selfobj.default_filter.conditions });
      //   selfobj.filterOption.set({ "menuId": selfobj.menuId });
      // } else {
      //   selfobj.filterOption.clear().set(selfobj.filterOption.defaults);
      //   selfobj.filterOption.set({ company_id: DEFAULTCOMPANY });
      //   selfobj.filterOption.set({ "menuId": selfobj.menuId });
      //   selfobj.$el.find(".multiOptionSel").removeClass("active");
      //   selfobj.$el.find(".down").removeClass("active");
      //   selfobj.$el.find(".up").removeClass("active");

      // }
      //selfobj.filterSearch();
    },
    updateData:function(){
      if(this.View == "grid"){
        // $('.' + this.toClose).remove();
        // rearrageOverlays();
        this.gridLazyLoad("");
      }else{
        this.filterSearch();
      }
    },
    // FILTER SEARCH DEFAULT
    filterSearch: function (isClose = false) {
      var selfobj = this;
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      if(selfobj.View == "grid"){
        this.stageColumnUpdate(true);
        this.loadotherData();
      }else{
        this.collection.reset();
        var selfobj = this;
        readyState = true;
        selfobj.filterOption.set({ curpage: 0 });
        if (this.loadFrom == "project") {
          this.filterOption.set({ "project_id": this.project_id });
        }
        $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          selfobj.$el.find(".profile-loader").hide();
          if(!res.flag!="F"){
            setPagging(res.paginginfo, res.loadstate, res.msg);
            selfobj.totalRec = res.paginginfo.totalRecords;
            $element.attr("data-currPage", 1);
            $element.attr("data-index", res.paginginfo.nextpage);
          
          }else{
            selfobj.totalRec = 0;
            $element.attr("data-currPage", 1);
            $element.attr("data-index",0);
          }         
          if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
            //selfobj.$el.find('#taskListView').show();
            selfobj.$el.find('.noDataFound').show();
          } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
            selfobj.$el.find('.noCustAdded').show();
            //selfobj.$el.find('#taskListView').hide();
          } else if (selfobj.totalRec > 0) {
            selfobj.$el.find('.noDataFound').hide();
            selfobj.$el.find(".noCustAdded").hide();
            //selfobj.$el.find('#taskListView').show();
          }
          selfobj.moduleDefaultSettings.setTableWidth(false);
          if (selfobj.arrangedColumnList.length > 0) {
            if (selfobj.View == "traditionalList") {
              var sectionID = 'taskListView';
            }
            new listSliderView({ sectionID: sectionID });
          }
          if (res.loadstate === false) {
            selfobj.$el.find(".profile-loader-msg").html(res.msg);
            selfobj.$el.find(".profile-loader-msg").show();
          } else {
            selfobj.$el.find(".profile-loader-msg").hide();
          }
          $(".profile-loader").hide();
        });
      }
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      if (isdiabled) {
      } else {

        $element.attr("data-index", cid);
        this.collection.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        selfobj.filterOption.set({ curpage: index });
        var requestData = selfobj.filterOption.attributes;

        selfobj.$el.find(".profile-loader").show();
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('', res, '');
          }
          selfobj.currPage = res.paginginfo.curPage;
          selfobj.$el.find(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.moduleDefaultSettings.setTableWidth(false);
        });
      }
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['task_id', 'subject', 'assignee', 'task_type', 'task_status', 'task_priority', 'due_date', 'category_id'];
      var stdColumn = [];
      switch (show) {
        case "arrangeColumns": {
          var isOpen = selfobj.$el.find(".ws_ColumnConfigure").hasClass("open");
          if (isOpen) {
            selfobj.$el.find(".ws_ColumnConfigure").removeClass("open");
            $(e.currentTarget).removeClass("BG-Color");
            selfobj.getColumnData();
            selfobj.filterSearch();
            return;
          } else {
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, viewMode: selfobj.View, skipFields: selfobj.skipFields, columnMappings: selfobj.columnMappings });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },
    taskKanbanSlider: function () {
      this.categoryList.models.forEach((category) => {
        this.totalColumns = category ? category.attributes.sublist ? category.attributes.sublist.length : [] : 0;
      });
      var offset = [0, 0];
      // check how many colums we have
      const countAll = this.totalColumns + 1;
      // preview div bottom right
      var divOverlay = document.querySelector(".kanban-scroll-active");
      // inner view in preview scroll
      var scrollView = document.querySelector(".kanban-columns-thumbs");
      // scrollView.innerHTML = "";
      // main colum view with data
      var kanban = document.querySelector(".kanban-view");

      for (var i = 0; i < countAll; i++) {
        const para = document.createElement("div");
        para.classList.add("leadCol");
        scrollView.appendChild(para);
      }

      var isDown = false;
      calViewPortScroll();
      window.addEventListener('resize', calViewPortScroll);

      function calViewPortScroll() {
        var viewPort = kanban ? parseInt(kanban.offsetWidth) * 100 / parseInt(kanban.scrollWidth) : '';
        divOverlay.style.width = viewPort + "%";
      }

      document.addEventListener('mouseup', function () {
        isDown = false;
      }, true);

      if (divOverlay) {
        divOverlay.addEventListener('mousedown', function (e) {
          isDown = true;
          offset = [
            divOverlay.offsetLeft - e.clientX,
            divOverlay.offsetTop - e.clientY
          ];
        }, true);
      }

      if (kanban) {
        kanban.addEventListener('scroll', function (e) {
          if (!isDown) {
            var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
            var CalPositionPer = (kanban.scrollLeft * 100 / kanban.scrollWidth);
            var decideScroll = scrollView.offsetWidth * CalPositionPer / 100;
            divOverlay.style.left = decideScroll + 'px';
          }
        });
      }

      if (divOverlay) {
        divOverlay.addEventListener('mousemove', function (e) {
          e.preventDefault();
          var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
          if (isDown) {

            if ((e.clientX + offset[0]) > 0 && (e.clientX + offset[0]) < wid) {
              var CalPositionPer = (scrollView.offsetWidth * (e.clientX + offset[0]) / 100);
              var decideScroll = kanban.scrollWidth * CalPositionPer / 100;
              divOverlay.style.left = (e.clientX + offset[0]) + 'px';
              kanban.scrollLeft = decideScroll;
            }
            if ((e.clientX + offset[0]) <= 0) {
              kanban.scrollLeft = 0;
            }
          }
        }, true);
      }
    },
    setTaskStatus: function (e) {
      e.stopImmediatePropagation();
      var selfobj = this;
      var selectedStatusId = '';
      var task_id = $(e.currentTarget).attr('data-task_id');
      if ($(e.currentTarget).is(':checked')) {
        selfobj.categoryList.models.forEach(function (element) {
          if (element.attributes.categoryName == 'Task Status') {
            element.attributes.sublist.forEach(function (list) {
              if (list.categoryName == 'Completed') {
                selectedStatusId = list.category_id;
              }
            })
          }
        });
        selfobj.updateTaskStatus(selectedStatusId, task_id);
        $(e.currentTarget).closest(".leadCustomer").remove();
      } else {
        var inputOptionsPromise = new Promise(function (resolve) {
          setTimeout(function () {
            let inputOptions = {};
            selfobj.categoryList.models.forEach(function (element) {
              if (element.attributes.categoryName == 'Task Status') {
                element.attributes.sublist.forEach(function (list, index) {
                  inputOptions[list.category_id] = list.categoryName;
                })
              }
            });
            resolve(inputOptions);
          }, 100);
        });
        const { value: Status } = Swal.fire({
          title: "Change Status",
          text: "Please select the Task Status:",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Change',
          animation: "slide-from-top",
          inputPlaceholder: "Select Status",
          input: 'select',
          inputOptions: inputOptionsPromise,
          inputValidator: (value) => {
            selectedStatusId = value;
            if (!value) {
              return 'Please select the Status!'
            }
          }
        }).then((result) => {
          if (result.isConfirmed) {
            if (Status) { }
            selfobj.updateTaskStatus(selectedStatusId, task_id);
            $(e.currentTarget).closest(".leadCustomer").remove();
          } else {
            $(e.currentTarget).prop('checked', true);
          }
        })
      }
    },
    getCategoriesList:function(callback){
      var selfobj = this;
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_status' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        //selfobj.setStageColor();
        callback();
      });
      
    },
    defaultViewSet: function () {
      var selfobj = this;
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      } else {
        selfobj.userSettings = {};
      }

      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
        var moduleDetails  = this.userSettings[this.menuId];
        // check default view and then call the data from server
        const displayView = moduleDetails.displayView;
        const tableStructure = moduleDetails.tableStructure;
        if (tableStructure) {
          selfobj.tableStructure = tableStructure;
        } else {
          selfobj.tableStructure = {};
        }
        selfobj.View = displayView;
        switch (displayView) {
          case "grid":{
            selfobj.getCategoriesList(function(){
              selfobj.$el.find(".list_mode").removeAttr("disabled");
              selfobj.$el.find(".grid_mode").attr('disabled', 'disabled');
              selfobj.collection.reset();
              selfobj.render();
              setTimeout(() => {
                selfobj.gridLazyLoad(listgridID = "");
                selfobj.setupDropable();
                selfobj.setupSortable();
                selfobj.taskKanbanSlider();
                selfobj.$el.find(".showListView").toggle();  
              }, 500);
            });
            
            break;
          }
          default:{
            // call column data
            selfobj.getColumnData();
            if (selfobj.collection.length == 0) {
              selfobj.$el.find(".noCustAdded").show();
            } else {
                //selfobj.$el.find("#taskListView").show();
                selfobj.$el.find(".list_mode").attr('disabled', 'disabled');
                selfobj.$el.find("#filterOption").show();
              }
          break;
          } 
        }
      }
    },
    deleteCard: function (e) {
      let selfobj = this;
      setTimeout(() => {
        var removeIds = [];
        selfobj.checkedCount = 0;
        $('#clist input:checkbox:not(#cAll)').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-task_id"));
            //selfobj.checkedCount++;
          }
        });
        selfobj.checkedCount = removeIds.length;
        if (removeIds.length > 0) {
          $(".action-icons-div").hide();
          selfobj.idsToRemove = removeIds.toString();
        }
        selfobj.deleteCardView = new deleteCardView({ parentView: selfobj });
      }, 100);
    },

    render: function () {
      let selfobj = this;
      // remove all event again
      this.undelegateEvents();
      var template = _.template(taskTemp);      
      if(selfobj.View =="grid"){
        if (selfobj.categoryList.length > 0) {
          selfobj.categoryList.models.forEach((cat) => {
            cat.attributes.sublist.sort((a, b) => {
              return parseInt(a.lead_index) - parseInt(b.lead_index);
            });
          });
        }
        this.$el.html(template({view:selfobj.View, totalRec: this.totalRec, closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, menuName: this.mname, categoryList: this.categoryList.models, loadFrom: this.loadFrom,relatedList:this.relatedList,quickFilter:selfobj.quickFilter}));
        $(".listgrid").scroll(function (e) {
          var element = $(this);
          var scrollHeight = element.prop('scrollHeight');
          var scrollTop = element.scrollTop();
          var innerHeight = element.innerHeight();
          var remainingScroll = scrollHeight - (scrollTop + innerHeight);
          let rounded = Math.round(remainingScroll);
          if (rounded <= 1) {
            if($(e.currentTarget).attr("id")=="otherStatus"){
              selfobj.gridColID = "otherStatus";
              selfobj.stageColumnUpdate(false,"otherStatus");
            }else{
            selfobj.gridColID = element.attr("id");
            selfobj.gridLazyLoad(selfobj.gridColID);
            }
          }
        });
      }else{
          this.$el.html(template({view:selfobj.View, totalRec: this.totalRec, closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, menuName: this.mname, categoryList: this.categoryList.models, loadFrom: this.loadFrom,relatedList:this.relatedList,quickFilter:selfobj.quickFilter}));
      }
      if (this.appendto != null && this.appendto != undefined) {
        this.appendto.empty().append(this.$el);
      } else {
        $(".app_playground").append(this.$el);
      }
      $(".ws-select").selectpicker();
      selfobj.moduleDefaultSettings.defaultViewSet();
      this.filterContainer = this.$(".filterContainer");
      selfobj.dynamicFilter.render();
      selfobj.moduleDefaultSettings.columnsResizeFunction();
      setTimeout(() => {
        selfobj.dynamicFilter.renderFilterConditions(selfobj.filterOption.get("filterJson"));  
      }, 200);
      
      this.delegateEvents();
      return this;
    }
  });
  return taskView;
});
