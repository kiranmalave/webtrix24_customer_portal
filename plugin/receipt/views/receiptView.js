
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/receiptSingleView',
  '../collections/receiptCollection',
  '../../category/collections/slugCollection',
  "../../customer/collections/customerCollection",
  '../models/receiptFilterOptionModel',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/listSliderView',
  '../../core/views/dynamicFilterView',
  'text!../templates/receiptRow.html',
  'text!../templates/receipt_temp.html',
  'text!../templates/receiptFilterOption_temp.html',
  '../../core/views/notificationView',
  '../../core/views/notifyView',
  '../../core/views/timeselectOptions',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, moment, Swal, receiptSingleView, receiptCollection, slugCollection, customerCollection, receiptFilterOptionModel,configureColumnsView,appSettings,mailView,dynamicFormData,moduleDefaultSettings,listSliderView,dynamicFilterView,receiptRowTemp, receiptTemp, receiptFilterTemp, notificationView,notifyView,timeselectOptions,deleteCardView) {

  var receiptView = Backbone.View.extend({
    menu: '',
    userList: [],
    module_name: 'receipts',
    module_desc:'',
    plural_label:'',
    form_label:'',
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "receiptFilterView";
      this.arrangedColumnList = [];
      this.filteredFields = [];
      this.filteredData = [];
      this.filteredSearch = false;
      this.totalRec = 0; 
      this.tableStructure = {},
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = ['show_history','attachement','record_id','income_id','invoice_id'];
      this.View = "traditionalList";
      $(".profile-loader").show();
      $(".loder").show();
      $(".filter").hide();
      this.idsToRemove = [];
      var mname = Backbone.history.getFragment();
      this.timeselectOptions = new timeselectOptions();
      permission = ROLE[mname];
      this.activeOff = true;
      this.inactiveOff = true;
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj :this});
      this.appSettings = new appSettings();
      this.staticJoined = [
        {
          field : 'mode_of_payment',
          fieldtype: 'category',
          joinedTable : 'categories',
          select: 'category_id,categoryName',
          primaryKey : 'categoryID',
          slug:'payment_mode'
        }
      ];
      this.columnMappings = [
        {
          'account_id':'Bank Account',
          'company_id':'Company',
          'payment_log_date':'Payment Date',
        }
      ];    
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.dynamicFormDatas = new dynamicFormData();
      this.appSettings.getMenuList(this.menuId, function(plural_label,module_desc,form_label,result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
        if(result.data[0] != undefined){
          selfobj.tableName = result.data[0].table_name;
        }
      });
      this.filterOption = new receiptFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      this.filterOption.set({ "company_id":DEFAULTCOMPANY });
      this.collection = new receiptCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.statusChangeURL = 'receiptMaster/multipleHardDelete';
      this.render();
    },
    
    events:
    {
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .changeBox": "changeBox",
      "click .receiptStatus": "receiptStatus",
      "click .generatePDF": "generatePDF",
      "click .sortColumns": "sortColumn",
      "click .generateFile": "genrateFile",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .downloadReport": "downloadReport",
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
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      var selfobj = this;
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
          action: APIPATH + "receiptReports",
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
    generatePDF: function (e) {
      var donorReciptID = $(e.currentTarget).attr("data-receipt_id");
      var url = APIPATH + "generateRecipt/" + donorReciptID;
      window.open(url, "_blank");
    },
    genrateFile: function (e) {
      e.preventDefault();
      let from = $("#reports");

      let dataInput = $("<input>")
        .attr("type", "hidden")
        .attr("name", "data")
        .val(JSON.stringify(selfobj.filterOption));

      from.attr({
        id: "receiptsData",
        action: APIPATH + "generateReceiptReport",
        method: "POST",
        target: "_blank",
      }).append(dataInput);
      from.submit();
    },
    receiptStatus: function (e) {
      var selfobj = this;
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      var idsToRemove = $(e.currentTarget).attr("data-id");
      if (idsToRemove == '') {
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
      Swal.fire({
        title: `Are you Sure you want to ${status}?`,
        text: `After you ${status} this Receipt,You can not revert it back.`,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `${status}`,
        denyButtonText: `Cancel`,
        icon: "question",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + 'receiptMaster/status',
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
              if (res.flag == "F") showResponse(e,res,'');
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.filterSearch();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });
        }
      });
    },
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      }else{
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";
        $('#receiptList input:checkbox').each(function () {
          if ($(this).is(":checked") && $(this).attr('data-status') == 'pending' || $(this).attr('data-status') == '') {
            removeIds.push($(this).attr("data-receipt_id"));
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
          showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
          return false;
        }
        $.ajax({
          url: APIPATH + 'receiptMaster/deleteReceipts',
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
            if (res.flag == "F") showResponse(e,res,'');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.filteredSearch = false;
              selfobj.filterSearch();
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);

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
      $(".loder").show();
    
      switch (show) {
        case "singlereceiptData": {
          var receipt_id = $(e.currentTarget).attr("data-receipt_id");
          if(receipt_id != "" && receipt_id != null && receipt_id != undefined ){
            if (permission.edit != "yes") {
            Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }else{
              new receiptSingleView({ receipt_id: receipt_id, searchreceipt: this, menuId:this.menuId,form_label:selfobj.form_label});
            }
          }else{
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            }else{
              new receiptSingleView({ receipt_id: receipt_id, searchreceipt: this, menuId:this.menuId,form_label:selfobj.form_label});
            }
          }
          $('body').find(".loder");
          break;
        }
        case "notificationView": {
          new notificationView({ menuID: this.menuId, searchreceipt: this, module_name: this.module_name,filteredData : selfobj.filteredData });
          $('body').find(".loder");
          break;
        }
        case "notifyView": {
          new notifyView({ menuID: this.menuId, searchreceipt: this, module_name: this.module_name,filteredData : selfobj.filteredData });
          $('body').find(".loder");
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
      if (this.collection.length > 0) {
        $('.receiptslistDownload').show();
      }
      var template = _.template(receiptRowTemp);
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
      $("#receiptList").append(template({ receiptDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
    },
    addAll: function () {
      $("#receiptList").empty();
      this.collection.forEach(this.addOne, this);
    },
    getPendingLength: function () {
      var length = 0;
      var modelsa = [];
      modelsa = this.collection.models;
      modelsa.forEach(function (m) {
        if (m.attributes.status == 'pending') {
          length++;
        }
      });
      return length;
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['receipt_number','name','email_id','contact_number','status'];
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
            new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn,skipFields:selfobj.skipFields});
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },
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
            removeIds.push($(this).attr("data-receipt_id"));
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
      let selfobj = this;
      $(".loder").hide();
      var template = _.template(receiptTemp);
      this.$el.html(template({ closeItem: this.toClose,length: this.getPendingLength(),"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
      $(".app_playground").append(this.$el);
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

  return receiptView;

});
