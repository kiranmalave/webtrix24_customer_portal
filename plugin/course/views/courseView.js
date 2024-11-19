
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  'moment',
  '../views/courseSingleView',
  '../views/sectionSingleView',
  '../views/triggersView',
  '../collections/courseCollection',
  '../models/courseFilterOptionModel',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/timeselectOptions',
  '../../core/views/dynamicFilterView',
  'text!../templates/courseRow.html',
  'text!../templates/gridRow.html',
  'text!../templates/course_temp.html',
  'text!../templates/courseFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, Swal, moment, courseSingleView, sectionSingleView, courseTriggerView,courseCollection, courseFilterOptionModel, configureColumnsView, appSettings, mailView, dynamicFormData,moduleDefaultSettings,timeselectOptions,dynamicFilterView, courseRowTemp, gridRowTemp, courseTemp, courseFilterTemp, linkedDropdown,deleteCardView) {

  var courseView = Backbone.View.extend({
    collectionLength: '',
    module_desc: '',
    plural_label: '',
    form_label: '',
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "courseFilterView";
      this.filteredSearch = false;
      this.totalColumns = 0;
      this.currPage = 0;
      this.tableStructure = {},
      this.View = 'traditionalList';
      this.arrangedColumnList = [];
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = [];
      this.staticJoined = [];
      this.columnMappings = [];
      this.idsToRemove = [];    
      $(".profile-loader").show();
      $(".filter").hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      readyState = true;
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj : this});
      this.timeselectOptions = new timeselectOptions();
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
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

      this.filterOption = new courseFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      this.collection = new courseCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'courseMaster/multipleHardDelete';
	    this.statusChangeURL = 'courseMaster/multiplecourseChangeStatus';

      selfobj.render();
    },

    events: {
        "click .loadview":"loadSubView",
        "click .sortColumns": "sortColumn",
        "click .changeStatus": "changeStatusListElement",
        "click .showpage": "loadData",
        "click .listCheckbox":"toggleCheck", 
        "click #cours-design":"loadsectionView", 
        "click .arrangeColumns": "openColumnArrangeModal",
        "click .downloadReport": "downloadReport",
        "click .listViewBtn" : "showViewList",
        "click .setViewMode" : "setViewMode",
        "click .listSortColumns" : "showListSortColumns",
        "click .memberlistcheck" : "memberListCheck",
        "click .softRefresh": "resetSearch",
        "click .deleteCard": "deleteCard",
    },
     
    memberListCheck: function(e) {
      var allChecked = true;
      $(".memberlistcheck").each(function() {
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
    setViewMode: function(e){
      let selfobj = this;
      var View = $(e.currentTarget).val();
      var isOpen = $(".ws_ColumnConfigure").hasClass("open");
      if (isOpen) {
        $(".ws_ColumnConfigure").removeClass("open");
        if($(".arrangeColumns").hasClass("BG-Color")){
          $(".arrangeColumns").removeClass("BG-Color")
        }
      }
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId,View,selfobj.tableStructure);
      if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      }else{
        selfobj.userSettings = {};
      }
      if(View != "grid"){
        $(".showListView").toggle();
        selfobj.defaultViewSet();
        selfobj.resetSearch();
      }else if (View == "grid") {
        $("#coursegridview").show();
        $("#courseListView").hide();
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        $(".hide").hide();
        $(".showListView").toggle();
        selfobj.View = "grid";
      }
    },
    downloadReport: function (e) {
      e.preventDefault();
      var selfobj = this;
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
          action: APIPATH + "courseReports",
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
      dataInput.val(JSON.stringify(selfobj.filterOption));
      
      // Submit the form
      form.submit();
  
      // Reset form attributes after submission
      form.attr({
          action: "#",
          method: "POST",
          target: "",
      });
  
      // Clear filterOption
      selfobj.filterOption.clear('type');
      // console.log("filterOption", filterOption);
    }, 
    toggleCheck : function(e){
      $(e.currentTarget).toggleClass("active");    
    },
    changeStatusListElement:function(e){
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      }else{
        Swal.fire({
          title: "Delete Course ",
          text: "Do you want to delete course!!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Delete',
          animation: "slide-from-top",
        
        }).then((result) => {
          if (result.isConfirmed) {
            var selfobj = this;

          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#courseList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-course_id"));
            }
          });

          $(".action-icons-div").hide();
          $(".memberlistcheck").click(function () {
            if ($(this).is(":checked")) {
              $(".action-icons-div").show(300);
            } else {
              $(".action-icons-div").hide(200);
            }
          });

          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            $('.checkall').prop('checked', false)
            Swal.fire('Failed', '', 'Please select at least one record.');
            return false;
          }
          $.ajax({
            url: APIPATH + 'courseMaster/status',
            method: 'POST',
            data: { list: idsToRemove, action: action, status: status },
            datatype: 'JSON',
            beforeSend: function (request) {
              //$(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                Swal.fire('Failed', '', '' + res.msg);

              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.filteredSearch = false;
                selfobj.filterSearch();
                $('.changeStatus').hide();
                $('.checkall').prop('checked', false);
                // selfobj.render();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });

        } else {
          $('#courseList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false)
            }
          });
          $('.changeStatus').hide();
          $('.checkall').prop('checked', false)
        }
        });
      }
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singleCourseData": {
          var course_id = $(e.currentTarget).attr("data-course_id");
          if(course_id != "" && course_id != null && course_id != undefined ){
            if (permission.edit != "yes") {
            Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }else{
              new courseSingleView({ course_id: course_id, searchCourse: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
            }
          }else{
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            }else{
              new courseSingleView({ course_id: course_id, searchCourse: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
            }
          }
          break;
        }
        case "singleSectionData": {
          // var section_id = $(e.currentTarget).attr("data-section_id");
          var course_id = $(e.currentTarget).attr("data-course_id");
          new sectionSingleView({ course_id: course_id, searchCourse: this });
          break;
        }
        case "courseTrigger": {
          // var section_id = $(e.currentTarget).attr("data-section_id");
          var course_id = $(e.currentTarget).attr("data-course_id");
          new courseTriggerView({ course_id: course_id, searchCourse: this });
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
    },
    loadsectionView: function () {
      var course_id = $(e.currentTarget).attr("data-course_id");
      new sectionSingleView({ course_id: course_id, searchCourse: this });
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      let selfobj = this;
      selfobj.totalRec = selfobj.collection.length;
      $("#courseListView").hide();
      $(".noCustAdded").hide();
      $("#filterOption").hide();
      if (selfobj.View == "traditionalList") {
        if (selfobj.totalRec == 0) {
          $(".noCustAdded").show();
        } else {
          $("#courseListView").show();
          $("#filterOption").show();
        }
      }else{
        $("#filterOption").show();
      }
      var template = _.template(courseRowTemp);
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
      $("#courseList").append(template({ courseDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
      var template = _.template(gridRowTemp);
      $("#coursegrid").append(template({ courseDetails: objectModel }));
    },
    addAll: function () {
      $("#courseList").empty();
      this.collection.forEach(this.addOne, this);

      $("#coursegrid").empty();
      this.collection.forEach(this.addOne, this);
    },
    // -------------------------------------------------------------------------------- \\
    // FILTER SEARCHES
    filteredSearches: function (e) {
      var selfobj = this;
      selfobj.filteredSearch = true;
      selfobj.filterSearch();
    },
    // RESET FILTERS
    resetSearch: function () {
      let selfobj = this;
      if (selfobj.default_filter) {
        selfobj.getDefaultFilter(false);
        selfobj.filterOption.clear().set({ 'filterJson': selfobj.default_filter.conditions });
        selfobj.filterOption.set({ "menuId": selfobj.menuId });
      } else {
        selfobj.filterOption.clear().set(selfobj.filterOption.defaults);
        selfobj.filterOption.set({ company_id: DEFAULTCOMPANY });
        selfobj.filterOption.set({ "menuId": selfobj.menuId });
        $(".multiOptionSel").removeClass("active");
        $(".down").removeClass("active");
        $(".up").removeClass("active");
      }
      selfobj.filterSearch();
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
          selfobj.moduleDefaultSettings.setTableWidth(false);
        });
      }
    },
    // -------------------------------------------------------------------------------- \\
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      selfobj.filterOption.set({ curpage: 0 });
      selfobj.filterOption.set({ menuId: this.menuId });
      selfobj.filterOption.set({ curpage: this.currPage });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
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
        $('#courseListView').hide();
        $('.noDataFound').hide();
        $(".noCustAdded").hide();
        $("#filterOption").hide();
        if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
          $('.noDataFound').show();
          $("#filterOption").show();
          if (selfobj.View == "traditionalList") {
            $('#courseListView').show();
          }
        } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
          $('.noCustAdded').show();
          $("#filterOption").hide();
        } else if(selfobj.totalRec > 0){
          $("#filterOption").show();
          if (selfobj.View == "traditionalList") {
            $('#courseListView').show();
          }
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
        if (selfobj.View == "traditionalList") {
          if(selfobj.arrangedColumnList.length > 0){
            selfobj.moduleDefaultSettings.setListSliderView('courseListView');
          }
        }
      });
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
        // $(".profile-loader").show();
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
          selfobj.moduleDefaultSettings.setTableWidth(false);
        });
      }
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['title', 'course_paid', 'author_id'];
      var stdColumn = [];
      switch (show) {
        case "arrangeColumns": {
          var isOpen = $(".ws_ColumnConfigure").hasClass("open");
          if (isOpen) {
            $(".ws_ColumnConfigure").removeClass("open");
            $(e.currentTarget).removeClass("BG-Color");
            selfobj.moduleDefaultSettings.getColumnData();
            selfobj.filterSearch();
            return;
          } else {
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn,skipFields:selfobj.skipFields });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
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
            removeIds.push($(this).attr("data-course_id"));
            //selfobj.checkedCount++;
          }
        });
        selfobj.checkedCount = removeIds.length;
        if (removeIds.length > 0) {
          console.log('selfobj.checkedCount', selfobj.checkedCount);
          $(".action-icons-div").hide();
          selfobj.idsToRemove = removeIds.toString();
          console.log('this.idsToRemove', selfobj.idsToRemove);

        }
        selfobj.deleteCardView = new deleteCardView({ parentView: selfobj });
      }, 100);
    },
    render: function () {
      var selfobj = this;
      var template = _.template(courseTemp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '',totalRec: this.totalRec, }));
      $(".app_playground").append(this.$el);
      $('.listCheckbox #cAll').hide();
      setToolTip();
      setTimeout(function () {
        selfobj.moduleDefaultSettings.defaultViewSet();
        selfobj.dynamicFilter.render();
      }, 300);
      $(document).ready(function() {
        selfobj.moduleDefaultSettings.columnsResizeFunction();
      });
      return this;
    }
  });
  return courseView;
});
