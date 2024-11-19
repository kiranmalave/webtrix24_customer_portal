
define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Swal',
    'moment',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../category/collections/slugCollection',
    '../../core/views/moduleDefaultSettings',
    '../../core/views/mailView',
    '../../core/views/configureColumnsView',
    '../../core/views/dynamicFilterView',
    '../../core/views/appSettings',
    '../views/customModuleSingleView',
    '../models/customFilterOptionModel',
    '../collections/customCollection',
    'text!../templates/customModuleTemp.html',
    'text!../templates/customRowTemp.html',
    'text!../templates/customFilterOption_temp.html',
    'text!../../dynamicForm/templates/linkedDropdown.html',
  ], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal,moment, dynamicFormData,slugCollection,moduleDefaultSettings,mailView,configureColumnsView,dynamicFilterView,appSettings,customModuleSingleView,customFilterOptionModel,customCollection,customModuleTemp,customRowTemp,customFilterTemp,linkedDropdown) {
  
    var customModuleView = Backbone.View.extend({
      module_desc:'',
      plural_label:'',
      mname:'',
      form_label:'',
      arrangedColumnList: [],
      dynamicStdFieldsList : [],
      filteredSearch : false,
      initialize: function (options) {
        this.totalRec = 0;
        this.toClose = "customFilterView";
        this.menuId = options.menuId;
        var selfobj = this;
        this.filteredFields = [];
        this.filteredData = [];
        this.tableStructure = {},
        this.View = "traditionalList";
        this.mname = Backbone.history.getFragment();
        var parts = this.mname.split('/');
        var mid = parts[parts.length - 1];
        permission = selfobj.getMenuDetails(mid);
        readyState = true;
        $(".modelbox").hide();
        $(".filter").hide();
        $(".profile-loader").show();
        var getmenu = permission.menuID;
        this.menuId = getmenu;
        selfobj.categoryList = new slugCollection();
        this.moduleDefaultSettings = new moduleDefaultSettings({'parentObj':this});
        this.appSettings = new appSettings();
        this.dynamicFormDatas = new dynamicFormData();
        this.appSettings.getMenuList(getmenu, function(plural_label,module_desc,form_label,result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
          selfobj.getColumnData();
          if(result.data[0] != undefined){
            selfobj.tableName = result.data[0].table_name;
          }
        });
        this.filterOption = new customFilterOptionModel();
        this.skipFields = ['id'] ;
        this.columnMappings = this.staticJoined = [];
        this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
        this.filterOption.set({ "menuId": this.menuId });
        searchData =  new customCollection();
        this.collection = new customCollection();
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);  
      },
      getMenuDetails: function(mid) {
        for (var key in ROLE) {
          if (ROLE.hasOwnProperty(key) && ROLE[key].menuID == mid) {
            return ROLE[key];
          }
        }
        return null; 
      },
      events:
      {
        "click .loadview": "loadSubView",
        "click .arrangeColumns": "openColumnArrangeModal",
        "click .showpage": "loadData",
        "click .filterSearch": "filteredSearches",
        "blur #textval": "setFreeText",
        "change #textSearch": "settextSearch",
        "click .changeStatus": "changeStatusListElement",
        "change .changeBox": "changeBox",
        "click .sortColumns": "sortColumn",
        "change .txtchange": "updateOtherDetails",
        "change .dropval": "singleFilterOptions",
        "click .downloadReport": "downloadReport",
        "click .listSortColumns" : "showListSortColumns",
        "click .memberlistcheck" : "memberListCheck",
      },
    // SHOW SORTING ARROWS
    showListSortColumns: function (e) {
      e.preventDefault();
      this.dynamicFilter.showListSortColumns(e);
    },
    // SORT DATA ACCORDING TO COLUMN NAMES
    sortColumn: function (e) {
      e.stopPropagation();
      var selfobj = this;
      selfobj.dynamicFilter.sortColumn(e);
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
        var selfobj = this;
        let type = $(e.currentTarget).attr("data-type");
        var newdetails = [];
        newdetails["type"] = type;
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
          selfobj.filterOption.clear().set({ 'filterJson': selfobj.default_filter.conditions });
          selfobj.filterOption.set({ "menuId": selfobj.menuId });
        } else {
          selfobj.filterOption.clear().set(selfobj.filterOption.defaults);
          if (this.mname == "leads") {
            selfobj.filterOption.set({ type: "lead" });
          } else if (this.mname == "customer") {
            selfobj.filterOption.set({ type: "customer" });
          }
          selfobj.filterOption.set({ company_id: DEFAULTCOMPANY });
          selfobj.filterOption.set({ "menuId": selfobj.menuId });
          $(".multiOptionSel").removeClass("active");
          $(".down").removeClass("active");
          $(".up").removeClass("active");
        }
        selfobj.filterSearch();
      },
      getColumnData: function(){
        var selfobj = this;
        this.dynamicFormDatas.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
         
            if (res.metadata && res.metadata != undefined && res.metadata.trim() !== '') {
                selfobj.metadata  = JSON.parse(res.metadata);
            } 
            if (res.c_metadata && res.c_metadata != undefined && res.c_metadata.trim() !== '') {
                selfobj.c_metadata  = JSON.parse(res.c_metadata);
                selfobj.arrangedColumnList = selfobj.c_metadata;
            }
            var columnss = [];
            if(selfobj.metadata){
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
      getModuleData:function(){
        var $element = $('#loadMember');
        var selfobj = this;
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == 'S') {
            (res.data.length > 0)? $('.filter').show() : $('.filter').hide();
          }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $(".profile-loader").hide();
        });
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
        var template = _.template(customRowTemp);
        var rr = objectModel.attributes;
        selfobj.arrangedColumnList.forEach((column) => {
          if(column.fieldType == 'Datepicker' || column.fieldType == 'Date'){
            if(objectModel.attributes[""+column.column_name] != "0000-00-00"){
              var dueDateMoment = moment(objectModel.attributes[""+column.column_name]);
              if(column.dateFormat != "" && column.dateFormat != null && column.dateFormat != "undefined"){
                objectModel.attributes[""+column.column_name] = dueDateMoment.format(column.dateFormat);
              }else{
                objectModel.attributes[""+column.column_name] = dueDateMoment.format("DD-MM-YYYY");
              }
            }
            else{
              objectModel.attributes[""+column.column_name] = "-"
             }
          }
          if (column.fieldType == 'Timepicker') {
            if (objectModel.attributes["" + column.column_name] != "00:00:00") {
              var timeFormat = column.displayFormat === '12-hours' ? 'hh:mm' : 'HH:mm';
              var timeMoment = moment(objectModel.attributes["" + column.column_name], 'HH:mm');
              objectModel.attributes["" + column.column_name] = timeMoment.format(timeFormat);
            } else {
              objectModel.attributes["" + column.column_name] = "-";
            }
          }   
          // if(column.column_name == 'created_by'){
          //   column.column_name = 'createdBy';
          // } else if (column.column_name == 'modified_by'){
          //   column.column_name = 'modifiedBy';
          // }else{
          //   column.column_name = column.column_name;
          // }
        });
        let tt =  template({ customDetails: objectModel.attributes,arrangedColumnList:selfobj.arrangedColumnList });
        $("body").find("tbody#customList").append(tt);
      },
      addAll: function () {
        $("body").find("tbody#customList").empty();
        this.collection.forEach(this.addOne, this);
      },
      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singleCustomFieldData": {
            var customModule_id = $(e.currentTarget).attr("data-custom_id");
            if(customModule_id != "" && customModule_id != null && customModule_id != undefined ){
              if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              }else{
                new customModuleSingleView({ customModule_id: customModule_id,searchCustomColumns: this,menuId: this.menuId,form_label:selfobj.form_label});
              }
            }else{
              if (permission.add != "yes") {
                Swal.fire("You don't have permission to add", '', 'error');
                return false;
              }else{
                new customModuleSingleView({ customModule_id: customModule_id,searchCustomColumns: this,menuId: this.menuId,form_label:selfobj.form_label});
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
      filterSearch: function (isClose = false) {
        if (isClose && typeof isClose != 'object') {
          $('.' + this.toClose).remove();
          rearrageOverlays();
        }
        this.collection.reset();
        var selfobj = this;
        readyState = true;
        selfobj.filterOption.set({ curpage: 0 });
        selfobj.filterOption.set({ menuId:this.menuId});
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
          $element.attr("data-currPage", 1);
          $element.attr("data-index", res.paginginfo.nextpage);
          // $(".page-info").html(recset);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }
          selfobj.totalRec = 0;
          selfobj.totalRec = res.paginginfo.totalRecords;
          if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
              $('#listView').show();
              $('.noDataFound').show();
            
          } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
              $('.noCustAdded').show();
              $('#listView').hide();
          
          } else if(selfobj.totalRec > 0){
              $('.noDataFound').hide();
              $(".noCustAdded").hide();
              $('#listView').show();
          }
          selfobj.moduleDefaultSettings.setTableWidth(false);
          selfobj.moduleDefaultSettings.setListSliderView();
        });
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },
      openColumnArrangeModal: function (e) {
        let selfobj = this;
        var show = $(e.currentTarget).attr("data-action");
        var stdColumn = ['id'];
        switch (show) {
          case "arrangeColumns": {
            var isOpen = $(".configureColumnCls").hasClass("open");
            if (isOpen) {
              $(".configureColumnCls").removeClass("open");
              $(e.currentTarget).removeClass("BG-Color");
              selfobj.getColumnData();
              selfobj.filterSearch();
              return;
            } else {
              new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
              $(e.currentTarget).addClass("BG-Color");
            }
            break;
          }
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
          var currPage = $element.attr("data-currPage");
  
          selfobj.filterOption.set({ curpage: index });
          var requestData = selfobj.filterOption.attributes;
  
          $(".profile-loader").show();
          this.collection.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            setPagging(res.paginginfo, res.loadstate, res.msg);
            $element.attr("data-currPage", index);
            $element.attr("data-index", res.paginginfo.nextpage);
            $(".profile-loader").hide();
            selfobj.setTableWidth(false);
          });
        }
      },
      changeStatusListElement : function(e){
        if (permission.delete != "yes") {
          Swal.fire("You don't have permission to delete", '', 'error');
          return false;
        }else{
          let selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#customList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-custom_id"));
            }
          });
          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
            $(".deleteAll").hide();
            $(".checkall").prop("checked", false);
            $(".checkall").closest("div").removeClass("active");
            return false;
          }
          Swal.fire({
            title: 'Are you Sure you want to delete the record?',
            text:"",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete',
            animation: "slide-from-top",
          }).then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                url: APIPATH + 'deleteFields/status',
                method: 'POST',
                data: { list: idsToRemove, action: action, status: status,menuID:selfobj.menuId},
                datatype: 'JSON',
                beforeSend: function (request) {
                  request.setRequestHeader("token", $.cookie('_bb_key'));
                  request.setRequestHeader("SadminID", $.cookie('authid'));
                  request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                  request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                  if (res.flag == "F")
                    showResponse(e,res,'');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  if (res.flag == "S") {
                    selfobj.collection.fetch({
                      headers: {
                        'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                      }, error: selfobj.onErrorHandler
                    }).done(function (res) {
                      if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                      $(".profile-loader").hide();
                      selfobj.filteredSearch = false;
                      selfobj.filterSearch();
                    });
                  }
                }
              });
              $(".deleteAll").hide();
              Swal.fire('Deleted!', '', 'success');
              selfobj.resetSearch();
              $(".checkall").prop("checked", false);
              $(".checkall").closest("div").removeClass("active");
            } else if (result.isDismissed) return;
          })
        }      
      },
      render: function () {
        var selfobj = this;
        var template = _.template(customModuleTemp);
        var templateData = {
          closeItem: this.toClose || '',
          pluralLable: this.plural_label || '',
          moduleDesc: selfobj.module_desc || '',
          formLabel: selfobj.form_label || '',
          arrangedColumnList: selfobj.arrangedColumnList || [],
          metadata: selfobj.metadata || {},
          menuId: selfobj.menuId || '',
          totalRec: selfobj.totalRec,
        };
        this.$el.html(template(templateData));
        $(".app_playground").append(this.$el);
        $(".ws-select").selectpicker("refresh");
        $(".ws-select").selectpicker();
        setToolTip();
        setTimeout(function () {
          selfobj.moduleDefaultSettings.defaultViewSet();
          selfobj.dynamicFilter.render();
        }, 300);
        $(document).ready(function() {
          selfobj.moduleDefaultSettings.columnsResizeFunction();
        });
        return this;
      },
      onDelete: function () {
        this.remove();
      },
    });
    return customModuleView;
  });