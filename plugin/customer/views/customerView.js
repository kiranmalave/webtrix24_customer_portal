define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/customerSingleView',
  '../views/customerNotesView',
  '../../core/views/mailView',
  '../views/customerActivityView',
  '../../task/views/taskSingleView',
  '../../appointment/views/appointmentSingleView',
  '../collections/customerCollection',
  '../collections/customerNotesCollection',
  '../collections/countryCollection',
  '../collections/stateCollection',
  '../collections/cityCollection',
  '../models/customerFilterOptionModel',
  '../models/customerSingleModel',
  '../models/customerNoteModel',
  '../../core/views/appSettings',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  "../../emailMaster/collections/emailMasterCollection",
  "../../companyMaster/collections/companyCollection",
  '../../core/views/timeselectOptions',
  'text!../templates/customerRow.html',
  'text!../templates/leadGridRow.html',
  'text!../templates/customer_temp.html',
  'text!../templates/customerFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/notificationView',
  '../../core/views/listSliderView',
  '../../core/views/deleteCardView',
  '../views/escalationView',
  '../../core/views/dynamicFilterView',
  "../../admin/collections/adminCollection",
  '../../core/views/moduleDefaultSettings',
  'text!../templates/leadModernView.html',
  'text!../templates/customerGridTemp.html',
], function ($, _, Backbone, datepickerBT, moment, Swal, customerSingleView, customerNotesView, mailView, customerActivityView, taskSingleView, appointmentSingleView, customerCollection, customerNotesCollection, countryCollection, stateCollection, cityCollection, customerFilterOptionModel, customerModel, customerNoteModel, appSettings, columnArrangeModalView, configureColumnsView, dynamicFormData, slugCollection, emailMasterCollection, companyCollection, timeselectOptions, customerRowTemp, leadGridRow, customerTemp, customerFilterTemp, linkedDropdown, notificationView, listSliderView, deleteCardView, escalationView, dynamicFilterView, adminCollection, moduleDefaultSettings, leadModernView, customerGridTemp) {
  var customerView = Backbone.View.extend({
    plural_label: '',
    module_desc: '',
    form_label: '',
    mname: '',
    listDataGrid: [],
    paginginfo: [],
    View: 'traditionalList',
    currPage: 0,
    module_name: 'customer',
    isdataupdated: false,
    idsToRemove: [],
    customerModel: customerModel,
    filteredSearch: false,
    stage_id: '',
    totalRec: 0,
    currPage: 0,
    initialize: function (options) {
      this.userSettings = {};
      this.toClose = "customerFilterView";
      this.fromCampaign = (options.fromCampaign) ? 'yes' : 'no';
      var selfobj = this;
      this.filteredData = [];
      this.arrangedColumnList = [];
      this.filteredFields = [];
      this.idsToRemove = [];
      this.columnlist = [],
        this.totalColumns = 0;
      this.currPage = 0;
      this.View = 'traditionalList',
        this.tableStructure = {},
        this.stage_id = '',
        this.totalRec = 0;
      this.currPage = 0;
      $(".profile-loader").show();
      $(".customMail").hide();
      $(".filter").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      $(".loder").show();
      $(".customMail").remove("maxActive");
      $(".maxActive").hide();
      this.mname = Backbone.history.getFragment();
      permission = ROLE[this.mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.statusChangeURL = 'customerMaster/delete';
      this.paginginfo = [],
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj: selfobj });
      this.filterOption = new customerFilterOptionModel();
      
      // TO SHOW DEFAULT COLUMNS IN COLUMN-ARRANGMENT
      this.defaultColumns = ['name', 'email', 'mobile_no', 'assignee', 'created_by', 'created_date'];
      this.bulkeditfields = ["salutation", "stages", "lead_source", "lead_priority", "gst_state", "assignee"];
      this.skipFields = ['company_name', 'latitude', 'salutation', 'longitude', 'customer_image', 'customer_id', 'country_code', 'linked_task', 'branch_id', 'record_type', 'type', 'link_task'];
      this.columnMappings = [
        { 'name': 'Customer Name' },
        { 'email': 'Email' },
        { 'pan_number': 'PAN No.' },
        { 'company_id': 'Company Name' },
        { 'adhar_number': 'Aadhaar No' },
        { 'gst_no': 'GST No.' },
        { 'stages': 'Stage' },
        { 'office_land_line': 'Landline Number' },
        { 'city': 'City' },
        { 'address': 'Google Location' },
      ];
      this.staticJoined = [
        {
          field: 'lead_source',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'category_id',
          slug: 'lead_source'
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
          field: 'lead_priority',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'category_id',
          slug: 'lead_priority'
        },
        {
          field: 'stages',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'category_id',
          slug: 'lead_stages'
        },
        {
          field: 'city',
          fieldtype: 'city',
          joinedTable: 'cities',
          select: 'city_id,city_name',
          primaryKey: 'city_id',
          slug: ''
        },
        {
          field: 'country',
          fieldtype: 'country',
          joinedTable: 'country',
          select: 'country_id,country_name',
          primaryKey: 'country_id',
          slug: ''
        },
        {
          field: 'state',
          fieldtype: 'states',
          joinedTable: 'states',
          select: 'state_id,state_name',
          primaryKey: 'state_id',
          slug: ''
        },
      ];  
      if (this.mname == "leads") {
        this.columnMappings.push(
          { 'lead_source': 'Source' },
          { 'lead_priority': 'Priority' },
        );
        this.filterOption.set({ type: "lead" });
      } else if (this.mname == "customer") {
        this.skipFields.push('lead_priority');
        this.filterOption.set({ type: "customer" });
      }

      searchCustomer = new customerCollection();
      this.collection = new customerCollection();
      this.stateList = new stateCollection();
      this.cityList = new cityCollection();
      
      if (this.fromCampaign == 'no') {
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
        this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
        this.customerModel = new customerNoteModel();
        this.filterOption.set({ company_id: DEFAULTCOMPANY });
        this.categoryList = new slugCollection();
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
        this.filterOption.set({ "menuId": this.menuId });
        this.render();
      }
      // FOR DELAY IN REFRESH GRID
      this.resetSearch = _.debounce(this.resetSearch, 500);
    },
    events:
    {
      "click .resetval": "clearfilter",
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .markAsCust": "markCutomer",
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .showMax": "showmax",
      "click .changeStatusGrid": "changeStatusGrid",
      "click .sortColumns": "sortColumn",
      "click .downloadReport": "downloadReport",
      "change .countryChange": "setCountry",
      "change .selectState": "setState",
      "input .cityChange": "getCity",
      "click .selectCity": "setCity",
      "mouseover .customerRow": "handleMouseHover",
      "mouseleave .customerRow": "handleMouseLeave",
      "click .listViewBtn": "showViewList",
      "click .setViewMode": "setViewMode",
      "click .listSortColumns": "showListSortColumns",
      "click .deleteCard": "deleteCard",
      "click .memberlistcheck": "memberListCheck",
      "click .softRefresh": "resetSearch",
    },
    defaultViewSet: function () {
      var selfobj = this;
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      } else {
        selfobj.userSettings = {};
      }

      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
        var moduleDetails = this.userSettings[this.menuId];
        // check default view and then call the data from server
        const displayView = moduleDetails.displayView;
        const tableStructure = moduleDetails.tableStructure;
        selfobj.View = displayView;
        switch (displayView) {
          case "grid": {
            selfobj.getCategoriesList(function () {
              selfobj.$el.find(".list_mode").removeAttr("disabled");
              selfobj.$el.find(".grid_mode").attr('disabled', 'disabled');
              selfobj.collection.reset();
              selfobj.render();
              setTimeout(() => {
                selfobj.gridLazyLoad(listgridID = "");
                selfobj.setupDropable();
                selfobj.setupSortable();
                selfobj.leadKanbanSlider();
                selfobj.$el.find(".showListView").toggle();
              }, 500);
            });
            break;
          }
          default: {
            // call column data
            selfobj.moduleDefaultSettings.getColumnData();
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
    getCategoriesList: function (callback) {
      var selfobj = this;
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        beforeSend: function () {
          $('.loder').show();
        },
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'lead_stages' }
      }).done(function (res) {
        $('.loder').hide();
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

        callback();
      });
    },

    setStageColor: function () {
      var selfobj = this;
      var stageColor;
      this.categoryList.models.forEach(function (element) {
        element.attributes.sublist.forEach(function (list) {
          stageColor = setColor(list.cat_color);
          list.font_color = selfobj.invertHex(list.cat_color);
          list.cat_color_light = stageColor;
        })
      });
    },
    invertHex: function (hex) {
      if (!hex || hex === "") {
        return '#000000'; // Return black for null or empty input
      }
      // Remove the '#' character if it exists
      hex = hex.replace('#', '');

      // Convert hex to RGB
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);

      // Calculate brightness
      var brightness = (r * 0.299) + (g * 0.587) + (b * 0.114);

      // Determine which color to use based on brightness
      var invertedColor;
      if (brightness > 128) {
        invertedColor = '#000000';
      } else {
        invertedColor = '#FFFFFF';
      }
      return invertedColor;
    },
    deleteCard: function (e) {
      let selfobj = this;
      setTimeout(() => {
        var removeIds = [];
        selfobj.checkedCount = 0;
        $('#clist input:checkbox:not(#cAll)').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-customer_id"));
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
    memberListCheck: function (e) {
      var allChecked = true;
      $(".memberlistcheck").each(function () {
        if (!$(this).prop("checked")) {
          allChecked = false;
          return false;
        }
      });
      if (allChecked) {
        $(".checkall").prop("checked", true);
      } else {
        $(".checkall").prop("checked", false);
      }
    },
    showViewList: function (e) {
      $(".showListView").toggle();
    },
    clearfilter: function () {

      this.dynamicFilter.clearFilter();
      this.quickFlter = "";
      this.$(".quickFlter option:selected").removeAttr("selected");
    },
    resetSearch: function () {
      var selfobj = this;
      this.filterOption.set(
        {
          "menuId": this.menuId,
          company_id: DEFAULTCOMPANY,
          orderBy: 't.created_date',
          order: "DESC",
        }
      );
      this.$el.find(".multiOptionSel").removeClass("active");
      this.$el.find(".down").removeClass("active");
      this.$el.find(".up").removeClass("active");
      if (this.mname == "leads") {
        selfobj.filterOption.set({ type: "lead" });
      } else if (this.mname == "customer") {
        selfobj.filterOption.set({ type: "customer" });
      }
      if (this.View == "grid") {
        this.filterOption.set({ curpage: 0 });
        this.filterOption.set("stages", null);
        this.$el.find(".listgrid").children().not('.totalCount').remove();
        this.isdataupdated = true;
        this.gridLazyLoad("");
      } else {
        this.filteredSearch = true;
        this.currPage = 0;
        this.filterSearch(false);
      }
    },
    // FILTER SEARCHES
    filteredSearches: function (e) {
      var selfobj = this;
      selfobj.filteredSearch = true;
      if (this.mname == "leads") {
        selfobj.filterOption.set({ record_type: "lead" });
      } else {
        selfobj.filterOption.set({ record_type: "customer" });
      }
      if (selfobj.View == "grid") {
        selfobj.isdataupdated = true;
        selfobj.gridLazyLoad("");
        selfobj.loadotherData();
        //selfobj.filterOption.attributes
      } else {
        selfobj.filterSearch();
      }
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
      var moduleDetails = this.userSettings[this.menuId];
      if (moduleDetails.tableStructure) {
        selfobj.tableStructure = moduleDetails.tableStructure;;
      } else {
        selfobj.tableStructure = {};
      }
      selfobj.dynamicFilter.clearFilter();
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, View, selfobj.tableStructure);
      selfobj.View = "grid";
      if (View != "grid") {
        this.$el.find(".showListView").toggle();
        selfobj.defaultViewSet();
      } else if (View == "grid") {
        this.$el.find(".list_mode").removeAttr("disabled");
        this.$el.find(".grid_mode").attr('disabled', 'disabled');
        selfobj.collection.reset();
        selfobj.defaultViewSet();
        selfobj.render();
        setTimeout(() => {
          selfobj.setupDropable();
          selfobj.setupSortable();
        }, 200);
        this.$el.find(".showListView").toggle();
      }
    },
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      newdetails["SadminID"] = $.cookie('authid');
      newdetails["staticJoined"] = JSON.stringify(this.staticJoined);
      newdetails["menuId"] = this.menuId;
      this.filterOption.set(newdetails);
      let form = $(e.currentTarget).closest("form");
      form.attr({
        action: APIPATH + "reports",
        method: "POST",
        target: "_blank",
      });

      // Update or add hidden input for data
      let dataInput = form.find("input[name='data']");
      if (dataInput.length === 0) {
        dataInput = $("<input>")
          .attr("type", "hidden")
          .attr("name", "data")
          .appendTo(form);
      }
      // Update the value of the input field
      dataInput.val(JSON.stringify(this.filterOption));
      // Submit the form
      form.submit();
      // Reset form attributes after submission
      form.attr({
        action: "#",
        method: "POST",
        target: "",
      });

      // Clear filterOption
      this.filterOption.clear('type');
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
    gridLazyLoad: function (listgridID) {
      let selfobj = this;
      if (listgridID == "") {
        if (selfobj.isdataupdated || selfobj.listDataGrid.length == 0) {
          var isFilter = false;
          if (selfobj.filterOption.get("stages") != null) {
            isFilter = true;
          }
          console.log("isFilter", isFilter);
          $.each(this.categoryList.models, function (index, value) {
            if (value.attributes.slug == "lead_stages") {
              $.each(value.attributes.sublist, function (index2, value2) {
                if (!isFilter) {
                  selfobj.filterOption.set({ stages: value2.category_id });
                  selfobj.$el.find("#" + value2.category_id).children().not('.totalCount').remove();
                  selfobj.listDataGrid[value2.category_id] = new customerCollection();
                  selfobj.listDataGrid[value2.category_id].fetch({
                    beforeSend: function () {
                      $('.loder').show();
                    },
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                  }).done(function (res) {
                    $(".loder").hide();
                    if (res.flag == "F") {
                      showResponse('', res, '');
                    }
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    selfobj.paginginfo = res.paginginfo;
                    selfobj.setGridPagging(selfobj.paginginfo, value2.category_id);
                    selfobj.addAllGrid(value2.category_id);
                  });
                  selfobj.$el.find("#leadlistview").hide();
                } else {
                  if (selfobj.filterOption.get("stages") == value2.category_id && selfobj.filterOption.get("stages") != 0) {

                    selfobj.listDataGrid[value2.category_id] = new customerCollection();
                    selfobj.listDataGrid[value2.category_id].fetch({
                      beforeSend: function () {
                        $('.loder').show();
                      },
                      headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                      }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                    }).done(function (res) {
                      $(".loder").hide();
                      if (res.flag == "F") {
                        showResponse('', res, '');
                      }
                      if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                      selfobj.paginginfo = res.paginginfo;
                      selfobj.setGridPagging(selfobj.paginginfo);
                      selfobj.addAllGrid(value2.category_id, value2.category_id);
                    });
                    selfobj.$el.find("#leadlistview").hide();
                  } else {
                    selfobj.listDataGrid[value2.category_id] = new customerCollection();
                    selfobj.addAllGrid(value2.category_id);
                  }
                }
              });
            }
          });
          this.loadotherData();
          selfobj.isdataupdated = false;
        } else {
          // render again the grid view
          $.each(selfobj.listDataGrid, function (index, value) {
            ////console.log(selfobj.listDataGrid[index]);
            if (selfobj.listDataGrid[index] != undefined) {
              selfobj.listDataGrid[index].on('add', this.addOne, this);
              selfobj.listDataGrid[index].on('reset', this.addAll, this);
              selfobj.setGridPagging(selfobj.listDataGrid[index].pageinfo, index);
              selfobj.addAllGrid(index);
            }
          });
          selfobj.$el.find("#leadlistview").hide();
        }
      } else {
        this.gridColID = listgridID;
        this.stageColumnUpdate(false, listgridID);
      }
    },
    setGridPagging: function (pagingInfo, stageID) {
      if (stageID == "0") {
        stageID = "otherStatus";
      }
      $("#" + stageID).find('.gridPagging').empty();
      if (pagingInfo.end > pagingInfo.totalRecords) {
        var paggingString = pagingInfo.totalRecords + " of " + pagingInfo.totalRecords;
      } else {
        var paggingString = pagingInfo.end + " of " + pagingInfo.totalRecords;
      }

      $("#" + stageID).find('.gridPagging').append(paggingString);

    },
    loadotherData: function () {
      var selfobj = this;
      selfobj.filterOption.set({ stages: "otherStatus" });
      selfobj.listDataGrid[0] = new customerCollection();
      selfobj.listDataGrid[0].fetch({
        beforeSend: function () {
          $('.loder').show();
        },
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        $(".loder").hide();
        if (res.flag == "F") {
          showResponse('', res, '');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.$el.find("#otherStatus").children().not('.totalCount').remove();
        selfobj.paginginfo = res.paginginfo;
        selfobj.setGridPagging(selfobj.paginginfo, "otherStatus");
        selfobj.addAllGrid(0);
        selfobj.filterOption.set({ stages: null });
      });

    },
    // loadotherData: function(){
    //   var selfobj = this;
    //   selfobj.filterOption.set({ stages: "other" });
    //   selfobj.listDataGrid[0] = new customerCollection();
    //   selfobj.listDataGrid[0].fetch({
    //     headers: {
    //       'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
    //     }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
    //   }).done(function (res) {
    //     if (res.flag == "F") {
    //       showResponse('', res, '');
    //     }
    //     if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
    //     $(".profile-loader").hide();
    //     selfobj.$el.find("#otherStage").children().not('.totalCount').remove();
    //     selfobj.paginginfo = res.paginginfo;
    //     selfobj.addAllGrid(0);
    //     selfobj.setGridPagging(selfobj.listDataGrid[0].pageinfo,"otherStage");
    //     selfobj.filterOption.set({ stages	: null });
    //   });
    // },
    stageColumnUpdate: function (refresh, gridColID, callback) {
      var selfobj = this;
      if (gridColID == "") {
        gridColID = this.gridColID;
      }
      selfobj.filterOption.set("stages", this.gridColID);
      if (gridColID == "otherStatus") {
        this.gridColID = 0;
        gridColID = 0;
        selfobj.filterOption.set("stages", "otherStatus");
      }
      if (refresh) {
        if (selfobj.listDataGrid[this.gridColID]) {
          selfobj.listDataGrid[this.gridColID].reset();
          //selfobj.filterOption.set("stages",this.gridColID);
          selfobj.filterOption.set("curpage", 0);
          this.$el.find("#" + this.gridColID).children().not('.totalCount').remove();
        }
      } else {
        if (selfobj.listDataGrid[this.gridColID].pageinfo != undefined) {
          selfobj.filterOption.set({ curpage: selfobj.listDataGrid[this.gridColID].pageinfo.nextpage });
        }
      }
      if (selfobj.listDataGrid[this.gridColID]) {
        if (selfobj.listDataGrid[this.gridColID].loadstate || refresh) {
          selfobj.listDataGrid[this.gridColID].fetch({
            beforeSend: function () {
              $('.loder').show();
            },
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
          }).done(function (res) {
            $(".loder").hide();
            if (res.flag == "F") {
              showResponse('', res, '');
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            selfobj.paginginfo = res.paginginfo;
            selfobj.setGridPagging(selfobj.paginginfo, selfobj.gridColID);
            selfobj.addAllGrid(selfobj.gridColID);
            selfobj.gridColID = null;
            //selfobj.filterOption.set("stages",null);
            if (typeof callback === 'function') {
              callback();
            }
          });

        }
      }
    },
    showmax: function () {
      $(".customMail").show();
      $(".customMailMinimize").hide();
      var ele = document.querySelector(".openFull");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActiveRemove');
      $(".maxActive").hide();
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      if (selfobj.mname == 'leads') {
        var stdColumn = ['customer_id', 'salutation', 'customer_image', 'latitude', 'longitude', 'customer_name'];
      } else {
        var stdColumn = ['customer_id', 'salutation', 'customer_image', 'latitude', 'longitude', 'customer_name', 'lead_source', 'stages'];
      }
      switch (show) {
        case "arrangeColumns": {
          new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, viewMode: selfobj.View, skipFields: selfobj.skipFields });
          break;
        }
      }
    },
    markCutomer: function (e) {
      let selfobj = this;
      var id = $(e.currentTarget).attr("data-id");
      var status = "customer";
      Swal.fire({
        title: 'Are you sure you want to Mark as Customer?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirm',
        denyButtonText: `Cancel`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (id != "") {
            $.ajax({
              url: APIPATH + 'customerMaster/typeStatus',
              method: 'POST',
              data: { customerID: id, status: status },
              datatype: 'JSON',
              beforeSend: function (request) {
                $('.loder').show();
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                $('.loder').hide();
                if (res.flag == "F")
                  showResponse(e, res, '');
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filterSearch();
                }
              }
            });
          }
        } else if (result.isDenied) {
          Swal.fire('Not Marked as Customer !!', '', 'info');
        }
      })

    },
    changeStatusGrid: function (e) {
      let selfobj = this;
      Swal.fire({
        title: 'Do you want to delete ?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Deleted!', '', 'success')
          var custID = $(e.currentTarget).attr("data-customer_id");
          var action = "delete";
          $(".action-icons-div").hide();
          $.ajax({
            url: APIPATH + 'customerMaster/delete',
            method: 'POST',
            data: { list: custID, action: action },
            datatype: 'JSON',
            beforeSend: function (request) {
              $('.loder').show();
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              $('.loder').hide();
              if (res.flag == "F")
                showResponse(e, res, '');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.isdataupdated = true;
                selfobj.gridLazyLoad("");
                // $('#leadCard' + custID).remove();
              }
              $('.loder').hide();
            }
          });
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
          $('#customerList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false);
            }
          });
          $(".listCheckbox").find('.checkall').prop('checked', false);
          $(".deleteAll").hide();
          $(".loder").hide();
        }
      })
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      var stageID = $(e.currentTarget).attr("data-stageID");
      if (stageID) {
        selfobj.stage_id = stageID;
      }
      $(".loder").show();
      $('#NoteModal').modal('hide');
      $('#activityModal').modal('hide');
      $(".customMail").hide();
      switch (show) {
        case "singleCustomerData": {

          if (!$(e.target).closest('.customerEmail').length) {
            var customer_id = $(e.currentTarget).attr("data-customer_id");
            if (customer_id != "" && customer_id != null && customer_id != undefined) {

              if (permission.edit != "yes") {
                Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              } else {

                new customerSingleView({ customer_id: customer_id, menuId: this.menuId, parentObj: this, menuName: this.mname, form_label: selfobj.form_label, loadfrom: "customer" });
              }
            } else {
              if (permission.add != "yes") {
                Swal.fire("You don't have permission to add", '', 'error');
                return false;
              } else {
                new customerSingleView({ customer_id: customer_id, menuId: this.menuId, parentObj: this, menuName: this.mname, form_label: selfobj.form_label, loadfrom: "customer" });
              }
            }
            $('body').find(".loder").hide();
            $(".profile-loader").hide();
          } else {
            if (!$(e.target).closest('.changeStatusGrid').length) {

              $(".customMail").show();
              $('.customMail').remove('maxActive');
              var customer_id = $(e.currentTarget).attr("data-customer_id");
              var cust_name = $(e.currentTarget).attr("data-first_name");
              var cust_mail = $(e.currentTarget).attr("data-custMail");
              new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail, searchmail: this, loadFrom: 'customer' });
              $('body').find(".loder").hide();
            }
          }
          break;
        }
        case "notes": {
          $('#NoteModal').modal('toggle');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var stage_id = $(e.currentTarget).attr("data-stageid");
          new customerNotesView({ customer_id: customer_id, customerName: cust_name, stageID: stage_id, searchCustomer: this });
          $('body').find(".loder").hide();
          break;
        }
        case "mail": {
          $(".customMail").show();
          $('.customMail').remove('maxActive');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-custMail");
          new mailView({ customer_id: customer_id, customerName: cust_name, customer_mail: cust_mail, searchmail: this, loadFrom: 'customer' });
          $('body').find(".loder").hide();
          break;
        }
        case "history": {
          $('#activityModal').modal('toggle');
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          new customerActivityView({ customer_id: customer_id, customerName: cust_name });
          $('body').find(".loder").hide();
          break;
        }
        case "task": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          new taskSingleView({ customer_id: customer_id, customerName: cust_name, loadFrom: "customer", searchtask: this, menuName: 'task' });
          $('body').find(".loder").hide();
          break;
        }
        case "appointment": {
          var customer_id = $(e.currentTarget).attr("data-customer_id");
          var cust_name = $(e.currentTarget).attr("data-first_name");
          var cust_mail = $(e.currentTarget).attr("data-email");
          new appointmentSingleView({ customer_id: customer_id, customerName: cust_name, cust_mail: cust_mail, loadFrom: "customer", searchappointment: this })
          $('body').find(".loder").hide();
          break;
        }
        case "notificationView": {
          var categoryList = [];
          new notificationView({ parentObj: this });
          $('body').find(".loder");
          break;
        }
        case "escalationView": {
          var categoryList = [];
          new escalationView({ parentObj: this });
          $('body').find(".loder").hide();
          break;
        }
        default: {
          $('body').find(".loder").hide();
        }
      }

    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      if (selfobj.View == "grid") {
        selfobj.$el.find(".noCustAdded").hide();
        var template = _.template(leadGridRow);
        //let intial = selfobj.appSettings.getInitials(objectModel.attributes.assignee);
        objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.lastActivityDate) });
        objectModel.set({ "initial": selfobj.appSettings.getInitials(objectModel.attributes.name) });
        objectModel.set({ "assigneeInitial": selfobj.appSettings.getInitials(objectModel.attributes.assignee) });
        objectModel.set({ "assigneeInitialBgColor": getColorByInitials(objectModel.attributes.assigneeInitial) });
        objectModel.set({ "assigneeInitialColor": getFontColor(objectModel.attributes.assigneeInitialBgColor) });
        objectModel.set({ "initialBgColor": getColorByInitials(objectModel.attributes.initial) });
        objectModel.set({ "initialColor": getFontColor(objectModel.attributes.initialBgColor) });
        if (objectModel.attributes.stageID != 0 && objectModel.attributes.stageID != null) {
          $("#" + objectModel.attributes.stageID).append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        } else {
          selfobj.$el.find("#otherStatus").append(template({ customerDetails: objectModel, customerLength: this.collection.length }));
        }
        selfobj.setupDragable();

      } else {
        selfobj.totalRec = selfobj.collection.length;
        if (selfobj.totalRec == 0) {
          selfobj.$el.find(".noCustAdded").show();
        } else {
          selfobj.$el.find(".noCustAdded").hide();
        }
        // check datatype and if type is date, datetime or time change it as per the setting
        Object.entries(objectModel.attributes).forEach(([index, columnItem]) => {
          const result = selfobj.arrangedColumnList.find(field => field.column_name === index);

          const fieldType = result ? result.fieldType : null;
          if (fieldType == "Datepicker" || fieldType == "Date") {
            objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
          }
          if (fieldType == "Timepicker") {
            objectModel.set({ index: selfobj.timeselectOptions.changeOnlyTime(columnItem) });
          }
          if (fieldType == "Date Time") {
            objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
          }
          if (objectModel.attributes[index] == null || objectModel.attributes[index] == undefined) {
            objectModel.attributes[index] = "-";
          } else {
            if (index === "status") {
              const statusValue = objectModel.attributes[index];
              objectModel.attributes['status2'] = statusValue;
            }
            if (index !== "customer_image" && index !== 'email') {
              objectModel.attributes[index] = selfobj.appSettings.capitalizeFirstLetter(objectModel.attributes[index]);
            }
          }
        });
        var template = _.template(customerRowTemp);
        objectModel.set({ "initial": selfobj.appSettings.getInitials(objectModel.attributes.name) });
        objectModel.set({ "assigneeInitial": selfobj.appSettings.getInitials(objectModel.attributes.assignee) });
        objectModel.set({ "assigneeInitialBgColor": getColorByInitials(objectModel.attributes.assigneeInitial) });
        objectModel.set({ "assigneeInitialColor": getFontColor(objectModel.attributes.assigneeInitialBgColor) });
        objectModel.set({ "initialBgColor": getColorByInitials(objectModel.attributes.initial) });
        objectModel.set({ "initialColor": getFontColor(objectModel.attributes.initialBgColor) });
        this.$el.find("#customerList").append(template({ customerDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname, menuID: this.menuId }));
      }
      setToolTip();
    },
    addAll: function () {
      var selfobj = this;
      this.$el.find("#customerList").empty();
      setTimeout(function () {
        selfobj.collection.forEach(this.addOne, this);
      }, 100);
    },
    addAllGrid: function (col_name) {
      let selfobj = this;
      if (selfobj.listDataGrid[col_name] != undefined) {
        selfobj.listDataGrid[col_name].models.forEach(element => {
          // element.attributes.start_date = selfobj.timeselectOptions.changeTimeFormat(element.attributes.start_date);
          // element.attributes.due_date = selfobj.timeselectOptions.changeTimeFormat(element.attributes.due_date);
          // console.log(element);
          selfobj.addOne(element);
        });
      }
    },
    updateData: function () {
      if (this.View == "grid") {
        // $('.' + this.toClose).remove();
        // rearrageOverlays();
        this.gridLazyLoad("");
      } else {
        this.filterSearch();
      }
    },
    filterSearch: function (isClose = false, stage) {
      var selfobj = this;
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      if (selfobj.View == "grid") {
        this.stageColumnUpdate(true);
        this.loadotherData();
      } else {
        this.collection.reset();
        var selfobj = this;
        readyState = true;
        this.filterOption.set({ curpage: 0 });
        this.filterOption.set({ menuId: this.menuId });
        this.filterOption.set({ curpage: this.currPage });
        var $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
        if (this.View == "traditionalList") {
          selfobj.isdataupdated = true;
        }
        this.collection.fetch({
          beforeSend: function () {
            $('.loder').show();
          },
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
        }).done(function (res) {
          $(".loder").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (!res.flag != "F") {
            setPagging(res.paginginfo, res.loadstate, res.msg);
            selfobj.totalRec = res.paginginfo.totalRecords;
            $element.attr("data-currPage", 1);
            $element.attr("data-index", res.paginginfo.nextpage);

          } else {
            selfobj.totalRec = 0;
            $element.attr("data-currPage", 1);
            $element.attr("data-index", 0);
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
              var sectionID = 'leadlistview';
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
        //
      } else {
        $element.attr("data-index", cid);
        this.collection.reset();
        var index = $element.attr("data-index");
        selfobj.filterOption.set({ curpage: index });
        var requestData = selfobj.filterOption.attributes;
        this.collection.fetch({
          beforeSend: function () {
            $('.loder').show();
          },
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          $('.loder').hide();
          selfobj.currPage = res.paginginfo.curPage;
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          res.paginginfo.loadFrom = selfobj.toClose;
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.moduleDefaultSettings.setTableWidth(false);
        });
      }
    },
    setupSortable: function () {
      var selfobj = this;
      $(".leadCustomer").sortable({
        connectWith: ".leadCustomer",
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        items: '>.leadDetailsCard',
        change: function (event, ui) {
        }
      });

      $(".kanban-view").sortable({

        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '>.leadIndex',
        cursor: 'grabbing',
        stop: function (event, ui) {
          setTimeout(function () { selfobj.savePositions(); }, 100);
        }
      }).disableSelection();

    },
    setupDragable: function () {
      var selfobj = this;
      $(".leadCustomer").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
        start: function (event, ui) {
          selfobj.sourceId = $(this).parent().attr('id');
          $(this).css("opacity", "0.6");
        },
        stop: function (event, ui) {
          $(this).css("opacity", "1");
        },
      });
    },
    savePositions: function () {
      var selfobj = this;
      var action = "changePositions";
      var serializedData = $(".row.kanban-view .leadIndex").map(function () {
        return $(this).data("lead-id");
      }).get();
      $.ajax({
        url: APIPATH + 'leadColumnUpdatePositions',
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
          if (res.flag == "F")
            showResponse(e, res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        }
      });
    },
    setupDropable: function () {
      let selfobj = this;
      //let oldID = "";
      $("body").find(".leadDrop").droppable({
        accept: ".leadCustomer",
        over: function (event, ui) {
          $(this).addClass("ui-state-highlight");
        },
        out: function (event, ui) {
          //oldID =  $(this).attr('id');
          $(this).removeClass("ui-state-highlight");
        },
        drop: function (event, ui) {
          let oldID = selfobj.sourceId;
          var leadStageID = $(this).parent().find('.listgrid').attr('id');
          var customerID = $(ui.draggable).attr('data-customer_id');
          $(this).append(ui.draggable);
          $(this).removeClass("ui-state-highlight");
          ui.draggable.removeClass("ui-draggable-dragging");
          selfobj.gridColID = oldID;
          selfobj.updateLeadStage(leadStageID, customerID, oldID);
        },
      });
    },
    updateLeadStage: function (leadStageID, customerID, oldID) {
      let selfobj = this;
      if (customerID != "" && leadStageID != "") {
        selfobj.isdataupdated = true;
        $.ajax({
          url: APIPATH + 'customerMaster/leadUpdate',
          method: 'POST',
          data: { customerID: customerID, lead: leadStageID },
          datatype: 'JSON',
          beforeSend: function (request) {
            $('.loder').show();
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $('.loder').hide();
            if (res.flag == "F")
              showResponse(e, res, '');

            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            // if (res.flag == "S") {
            //   selfobj.gridLazyLoad(listgridID = "");
            // }
            if (res.flag == "S") {
              selfobj.gridColID = leadStageID;
              selfobj.stageColumnUpdate(true, leadStageID, function () {
                selfobj.gridColID = oldID;
                selfobj.stageColumnUpdate(true, oldID);
              });

            }
          }
        });
      }
    },
    leadKanbanSlider: function () {
      this.categoryList.models.forEach((category) => {
        this.totalColumns = category ? category.attributes.sublist ? category.attributes.sublist.length : [] : 0;
      });

      var offset = [0, 0];
      const countAll = this.totalColumns + 1;
      var divOverlay = document.querySelector(".kanban-scroll-active");
      var scrollView = document.querySelector(".kanban-columns-thumbs");
      scrollView.innerHTML = "";
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

      // Remove previously attached events
      document.removeEventListener('mouseup', handleMouseUp, true);
      if (divOverlay) {
        divOverlay.removeEventListener('mousedown', handleMouseDown, true);
        divOverlay.removeEventListener('mousemove', handleMouseMove, true);
      }
      if (kanban) {
        kanban.removeEventListener('scroll', handleScroll);
      }

      // Define event handlers
      function handleMouseUp() {
        isDown = false;
      }

      function handleMouseDown(e) {
        isDown = true;
        offset = [
          divOverlay.offsetLeft - e.clientX,
          divOverlay.offsetTop - e.clientY
        ];
      }

      function handleScroll() {
        if (!isDown) {
          var CalPositionPer = (kanban.scrollLeft * 100 / kanban.scrollWidth);
          var decideScroll = scrollView.offsetWidth * CalPositionPer / 100;
          divOverlay.style.left = decideScroll + 'px';
        }
      }

      function handleMouseMove(e) {
        e.preventDefault();
        if (isDown) {
          var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
          var newLeft = e.clientX + offset[0];
          if ((newLeft) > 0 && (newLeft) < wid) {
            var CalPositionPer = (scrollView.offsetWidth * (newLeft) / 100);
            var decideScroll = kanban.scrollWidth * CalPositionPer / 100;
            divOverlay.style.left = (newLeft) + 'px';
            kanban.scrollLeft = decideScroll;
          }
          if ((newLeft) <= 0) {
            kanban.scrollLeft = 0;
          }
        }
      }

      // Add event listeners
      document.addEventListener('mouseup', handleMouseUp, true);
      if (divOverlay) {
        divOverlay.addEventListener('mousedown', handleMouseDown, true);
        divOverlay.addEventListener('mousemove', handleMouseMove, true);
      }
      if (kanban) {
        kanban.addEventListener('scroll', handleScroll);
      }
    },
    handleMouseHover: function (event) {
      const customerRow = $(event.currentTarget);
      const button = customerRow.find(".CustomerHoverButton");
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
          // button.css({
          //   display: "block",
          //   left: event.clientX + "px",
          //   top: (bottomPos - 5) + "px",
          // });
        }
      }
    },
    handleMouseLeave: function (event) {
      const customerRow = $(event.currentTarget);
      const customerId = customerRow.data('customerid');
      const relatedTarget = $(event.relatedTarget);
      if (!relatedTarget.hasClass("customerRow")) {
        customerRow.find(".CustomerHoverButton").css("display", "none");
      }
    },
    render: function () {
      var selfobj = this;
      var template = _.template(customerTemp);
      this.undelegateEvents();
      selfobj.totalRec = selfobj.collection.length;
      if (selfobj.View == "grid") {
        if (selfobj.categoryList.length > 0) {
          selfobj.categoryList.models.forEach((cat) => {
            cat.attributes.sublist.sort((a, b) => {
              return parseInt(a.lead_index) - parseInt(b.lead_index);
            });
          });
        }
        this.$el.html(template({ view: selfobj.View, totalRec: this.totalRec, closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, menuName: this.mname, categoryList: this.categoryList.models, loadFrom: this.loadFrom, relatedList: this.relatedList, quickFilter: selfobj.quickFilter }));
        $(".listgrid").scroll(function (e) {
          var element = $(this);
          var scrollHeight = element.prop('scrollHeight');
          var scrollTop = element.scrollTop();
          var innerHeight = element.innerHeight();
          var remainingScroll = scrollHeight - (scrollTop + innerHeight);
          let rounded = Math.round(remainingScroll);
          if (rounded <= 1) {
            if ($(e.currentTarget).attr("id") == "otherStage") {
              selfobj.loadotherData();
            } else {
              selfobj.gridColID = element.attr("id");
              selfobj.gridLazyLoad(selfobj.gridColID);
            }
          }
        });
      } else {
        this.$el.html(template({ view: selfobj.View, totalRec: this.totalRec, closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, menuName: this.mname, categoryList: this.categoryList.models, loadFrom: this.loadFrom, relatedList: this.relatedList, quickFilter: selfobj.quickFilter }));
      }
      $(".app_playground").append(this.$el);
      $(".loder").hide();
      $(".clearSorting").attr('disabled', 'disabled');
      setToolTip();
      selfobj.moduleDefaultSettings.defaultViewSet();
      selfobj.dynamicFilter.render();
      selfobj.moduleDefaultSettings.columnsResizeFunction();
      if (selfobj.arrangedColumnList.length > 0) {
        if (selfobj.View == "traditionalList") {
          var sectionID = 'leadlistview';
        }
        new listSliderView({ sectionID: sectionID });
      }
      setTimeout(() => {
        selfobj.dynamicFilter.renderFilterConditions(selfobj.filterOption.get("filterJson"));
      }, 200);
      this.delegateEvents();
      return this;
    }
  });
  return customerView;
});