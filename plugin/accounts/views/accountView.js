
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/accountSingleView',
  '../collections/accountCollection',
  '../models/accountFilterOptionModel',
  '../../core/views/configureColumnsView',
  '../../core/views/mailView',
  'text!../templates/accountRow.html',
  'text!../templates/account_temp.html',
  'text!../templates/accountFilterOption_temp.html',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/dynamicFilterView',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/timeselectOptions',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, moment, Swal, accountSingleView, accountCollection, accountFilterOptionModel, configureColumnsView, mailView, accountRowTemp, accountTemp, accountFilterTemp, appSettings, dynamicFormData, moduleDefaultSettings, dynamicFilterView, linkedDropdown,timeselectOptions,deleteCardView) {

  var accountView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    form_label: '',
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.filteredSearch = false;
      this.totalRec = 0;
      this.toClose = "accountFilterView";
      this.arrangedColumnList = [];
      this.idsToRemove = [];
      this.collection = new accountCollection();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      this.deleteOff = true;
      console.log("this is mname :", mname);
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.pluginId = this.menuId = permission.menuID;
      this.timeselectOptions = new timeselectOptions();
      console.log('this.menuId : ', permission);
      // PROVIDE CATEGORY SLUG HERE
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = ['is_amc', 'shipping', 'track_quantity', 'barcode'];
      this.staticJoined = [
        {
          field: 'account_type',
          fieldtype: 'category',
          joinedTable: 'categories',
          select: 'category_id,categoryName',
          primaryKey: 'categoryID',
          slug: 'account_types',
        },
      ];
      this.columnMappings = [
        {
          'company_id': 'Company',
          'opening_bal': 'Opening Balance',

        }];
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      $(".profile-loader").show();
      $('.loder').show();
      $('.filter').hide();
      readyState = true;
      this.isFilterRendered = false;
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj: this });
      this.appSettings = new appSettings();
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
      this.filterOption = new accountFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      this.dynamicFormDatas = new dynamicFormData();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'accountMaster/multipleHardDelete';
	    this.statusChangeURL = 'accountMaster/multipleaccountChangeStatus'; 

      this.render();
    },
    
    events:
    {
      "click .loadview": "loadSubView",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .downloadReport": "downloadReport",
      "click .sortColumns": "sortColumn",
      "click .listSortColumns": "showListSortColumns",
      "click .memberlistcheck": "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click #resetSearch": "resetSearch",
      "click .deleteCard": "deleteCard",
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
    downloadReport: function (e) {
      e.preventDefault();
      selfobj = this;
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      let dataInput = $("<input>")
        .attr("type", "hidden")
        .attr("name", "data")
        .val(JSON.stringify(selfobj.filterOption));
      form.attr({
        id: "receiptsData",
        action: APIPATH + "reports",
        method: "POST",
        target: "_blank",
      }).append(dataInput);
      selfobj.filterOption.clear('type');
      form.submit();
    },
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      } else {
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";

        $('#accountList input:checkbox').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-account_id"));
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
          showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
          $('.checkall').prop('checked', false);
          return false;
        }
        $.ajax({
          url: APIPATH + 'accountMaster/status',
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
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.filteredSearch = false;
              selfobj.filterSearch();
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);
            $('.checkall').prop('checked', false);
          }
        });
      }
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({ title: 'Failed !', text: "Something was wrong ! Try to refresh the page or contact administer. :(", timer: 2000, icon: 'error', showConfirmButton: false });
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {

      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");

      switch (show) {

        case "singleaccountData": {
          var account_id = $(e.currentTarget).attr("data-account_id");

          if (account_id != "" && account_id != null && account_id != undefined) {
            if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            } else {
              new accountSingleView({ account_id: account_id, pluginId: selfobj.pluginId, searchaccount: selfobj, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
            }
          } else {
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            } else {
              new accountSingleView({ account_id: account_id, pluginId: selfobj.pluginId, searchaccount: selfobj, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
            }
          }
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
      var template = _.template(accountRowTemp);
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
      $("#accountList").append(template({ accountDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
    },
    addAll: function () {
      $("#accountList").empty();
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
      console.log('filterOption : ', selfobj.filterOption.attributes);
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.errorCode == 995) { selfobj.onErrorHandler() };
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
            showResponse('', res, '');
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
    // -------------------------------------------------------------------------------- \\
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['name','created_date'];
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, skipFields: selfobj.skipFields });
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
            removeIds.push($(this).attr("data-account_id"));
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
      selfobj = this;
      var template = _.template(accountTemp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '', totalRec: this.totalRec, }));
      $(".app_playground").append(this.$el);
      setToolTip();
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
  return accountView;
});