
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  '../collections/contactUsCollection',
  '../models/contactUsFilterOptionModel',
  '../views/contactSingleView',
  '../../core/views/configureColumnsView',
  '../../core/views/mailView',
  '../../core/views/appSettings',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/dynamicFilterView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/timeselectOptions',
  'text!../templates/contactUsRow.html',
  'text!../templates/contactUs_temp.html',
  'text!../templates/contactUsFilterOption_temp.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, Swal, contactUsCollection, contactUsFilterOptionModel, contactSingleView, configureColumnsView,mailView,appSettings,moduleDefaultSettings,dynamicFilterView,dynamicFormData, timeselectOptions,contactUsRowTemp, contactUsTemp, contactUsFilterTemp,deleteCardView) {

  var contactUsView = Backbone.View.extend({
    idsToRemove: [],
    initialize: function (options) {
      this.toClose = "ourClientFilterView";
      var selfobj = this;
      this.totalRec = 0;
      this.arrangedColumnList = [];
      $(".profile-loader").show();
      $(".filter").hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.pluginId = this.menuId = permission.menuID;
      readyState = true;
      searchcontactUs = new contactUsCollection();
      this.dynamicFormDatas = new dynamicFormData();
      this.filterOption = new contactUsFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      this.filterOption.set({ "getAll": 'Y' });
      this.timeselectOptions = new timeselectOptions();
      this.appSettings = new appSettings();
      this.idsToRemove = [];
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
      searchcontactUs.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: this.filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        setPagging(res.paginginfo, res.loadstate, res.msg);
      });
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj:this});
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = [];
      this.staticJoined = [];
      this.columnMappings = [];    
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.collection = searchcontactUs;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'contactUs/multipleHardDelete';
	    this.statusChangeURL = 'contactUs/multiplecontactusChangeStatus'; 

      this.render();
    },

    events:
    {
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .listSortColumns" : "showListSortColumns",
      "click .sortColumns": "sortColumn",
      "click .showpage": "loadData",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .deleteCard": "deleteCard",
    },
    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-contactUsID"));
        }
      });
      $(".action-icons-div").hide();
      $(".memberlistcheck").click(function() {
          if($(this).is(":checked")) {
              $(".action-icons-div").show(300);
          } else {
              $(".action-icons-div").hide(200);
          }
      });
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
      $.ajax({
        url: APIPATH + 'contactUs/status',
        method: 'POST',
        data: { list: idsToRemove, action: action, status: status },
        datatype: 'JSON',
        beforeSend: function (request) {
          $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.collection.fetch({ headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.filterSearch();
            });
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);

        }
      });
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      selfobj.totalRec = selfobj.collection.length;
      $("#listView").hide();
      $(".noCustAdded").hide();
      $("#filterOption").hide();
      if (selfobj.totalRec == 0) {
        $(".noCustAdded").show();
      } else {
        $("#listView").show();
        $("#filterOption").show();
      }
      var template = _.template(contactUsRowTemp);
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
      $("#contactUsList").append(template({ contactUsListDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
    },
    addAll: function () {
      $("#contactUsList").empty();
      this.collection.forEach(this.addOne, this);
    },
    loadSubView:function(e){
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch(show)
      {
        case "singlecontactData":{
          let contact_id = $(e.currentTarget).attr("data-contact_id");
          new contactSingleView({contactUs_id:contact_id});
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
              selfobj.moduleDefaultSettings.getColumnData();
              selfobj.filterSearch();
              return;
            } else {
              console.log('menu : ',selfobj.menuId);
              console.log('menu : ',this.menuId);
              new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn,skipFields:selfobj.skipFields});
              $(e.currentTarget).addClass("BG-Color");
            }
          break;
        }
      }
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
    // FILTER SEARCH DEFAULT
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      selfobj.filterOption.set({ curpage: 0 });
      $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      console.log('filterOption : ',selfobj.filterOption.attributes); 
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
        if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
          $('#listView').show();
          $('.noDataFound').show();
        } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
          $('.noCustAdded').show();
          $('#listView').hide();
        } else if (selfobj.totalRec > 0) {
          $('.noDataFound').hide();
          $(".noCustAdded").hide();
          $('#listView').show();
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
          if (res.flag == "F") {
            showResponse('',res,'');
          }
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
  deleteCard: function (e) {
    let selfobj = this;
    setTimeout(() => {
      var removeIds = [];
      selfobj.checkedCount = 0;
      $('#clist input:checkbox:not(#cAll)').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-contactUsID"));
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
    // -------------------------------------------------------------------------------- \\
    render: function () {
      let selfobj = this;
      var template = _.template(contactUsTemp);
      console.log('selfobj.plural_label',selfobj);
      this.$el.html(template({closeItem:this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '', totalRec: this.totalRec, }));
      $(".main_container").append(this.$el);
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
  return contactUsView;

});
