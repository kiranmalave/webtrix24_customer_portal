
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  'moment',
  '../views/userRoleSingleView',
  '../collections/userRoleCollection',
  '../models/userRoleFilterOptionModel',
  '../../core/views/appSettings',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/configureColumnsView',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/timeselectOptions',
  '../../core/views/listSliderView',
  '../../core/views/dynamicFilterView',
  'text!../templates/userRoleRow.html',
  'text!../templates/userRole_temp.html',
  'text!../templates/userRoleFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT,Swal,moment,userRoleSingleView, userRoleCollection, userRoleFilterOptionModel,appSettings,moduleDefaultSettings,configureColumnsView,mailView,dynamicFormData,timeselectOptions,listSliderView, dynamicFilterView, userRoleRowTemp, userRoleTemp, userRoleFilterTemp) {
  var userRoleView = Backbone.View.extend({
    module_desc:'',
    plural_label:'',
    form_label:'',
    initialize: function (options) {
      var selfobj = this;
      this.filteredSearch = false;
      this.totalRec = 0; 
      this.tableStructure = {},
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = ['isDelete','groupID','role'];
      this.View = "traditionalList";
      this.toClose = "userRoleFilterView";
      this.arrangedColumnList = [];
      $(".profile-loader").show();
      $(".filter").hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj : this});
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.appSettings.getMenuList(this.menuId, function(plural_label,module_desc,form_label,result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
      });
      this.userRoleList = new userRoleCollection();
      this.userRoleList.fetch({
        headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,data:{getAll:'Y',status:"active"}
      }).done(function(res){
        if (res.flag == "F") showResponse('',res,'');
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
      });
      this.columnMappings = [
        {'is_sys_user':'System Defined Role'},
        {'rolename':'Role Name'},
        {'roleid':'Role ID'},
      ];
      this.filterOption = new userRoleFilterOptionModel();
      this.staticJoined = [];
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.collection = new userRoleCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      $(".right_col").on("scroll", function () {
        selfobj.loadData();
      });
      this.render();
    },
    events:
    {
      "click .loadview": "loadSubView",
      "click .sortColumns": "sortColumn",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .listSortColumns" : "showListSortColumns",
      "click .memberlistcheck" : "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .downloadReport": "downloadReport",
      "click .arrangeColumns": "openColumnArrangeModal",
    },
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      this.filterOption.set(newdetails);
      let form = $(e.currentTarget).closest("form");
      form.attr({
          action: APIPATH + "userRoleReports",
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
  
      // Update the value of the input field
      dataInput.val(JSON.stringify(filterOption));
     
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
      console.log("filterOption", filterOption);
    },
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
            new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn,skipFields:selfobj.skipFields, columnMappings: selfobj.columnMappings});
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
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
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      }else{
          let selfobj = this;
          var removeIds = [];
          var userList = [];
          var selectedRoleId = '';
          userList = this.userRoleList;
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#userRoleList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-roleID"));
            }
          });
          var idsToRemove = $(e.currentTarget).attr("data-id");
          if (idsToRemove == '') {
            showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
            return false;
          }
          let filteredList = userList.filter(item => !removeIds.includes(item.attributes.roleID));
          
          var inputOptionsPromise = new Promise(function (resolve) {
              setTimeout(function () {
                  let inputOptions = {};
                  filteredList.forEach(item => {
                    if (item.attributes.status == 'active' && item.attributes.roleID != idsToRemove) {
                      inputOptions[item.attributes.roleID] = item.attributes.roleName;
                    } 
                  });
                  resolve(inputOptions);
              }, 100);
          });

          const { value: Role } = Swal.fire({
            title: "Link Role",
            text: "Please link with another Role:",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Link',
            animation: "slide-from-top",
            inputPlaceholder: "Select Role",
            input: 'select',
            inputOptions: inputOptionsPromise,
            inputValidator: (value) => {
              selectedRoleId = value;
              if (!value) {
                return 'Please select the Role!'
              }
            }
          }).then((result) => {
            if (result.isConfirmed) {
              if (Role) {}
              $.ajax({
                url: APIPATH + 'userRoleMaster/status',
                method: 'POST',
                data: { list: idsToRemove, action: action, status: status, updatedRoleId: selectedRoleId},
                datatype: 'JSON',
                beforeSend: function (request) {
                  request.setRequestHeader("token", $.cookie('_bb_key'));
                  request.setRequestHeader("SadminID", $.cookie('authid'));
                  request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                  request.setRequestHeader("Accept", 'application/json');
                },
                success: function (res) {
                  if (res.flag == "F") showResponse('',res,'');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  if (res.flag == "S") {
                    selfobj.filteredSearch = false;
                    selfobj.filterSearch();
                  }
                }
              });
              $(".deleteAll").hide();
              Swal.fire('Linked!', '', 'success');
            } else if (result.isDismissed) return;
          })
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
        case "singleuserRoleData": {
          var roleID = $(e.currentTarget).attr("data-roleID");
          if(roleID != "" && roleID != null && roleID != undefined ){
            if (permission.edit != "yes") {
            Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }else{
              new userRoleSingleView({ roleID: roleID, searchuserRole: this,form_label:selfobj.form_label});
            }
          }else{
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            }else{
              new userRoleSingleView({ roleID: roleID, searchuserRole: this,form_label:selfobj.form_label});
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
      var template = _.template(userRoleRowTemp);
      if(selfobj.arrangedColumnList){
        selfobj.arrangedColumnList.forEach((column) => {
          if (column.fieldType == 'Datepicker' || column.fieldType == 'Date') {
            if (objectModel.attributes["" + column.column_name] != "0000-00-00") {
              var dueDateMoment = moment(objectModel.attributes["" + column.column_name]);
              if(column.dateFormat != "" && column.dateFormat != null && column.dateFormat != "undefined"){
                objectModel.attributes[""+column.column_name] = dueDateMoment.format(column.dateFormat);
              }else{
                objectModel.attributes[""+column.column_name] = dueDateMoment.format("DD-MM-YYYY");
              }
            }
            else {
              objectModel.attributes["" + column.column_name] = "-"
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
          if (objectModel.attributes.modified_date != "") {
            var formettedModified_date = selfobj.timeselectOptions.changeTimeFormat(objectModel.attributes.modified_date);
            if (formettedModified_date != undefined) {
              objectModel.set({ "modified_date": formettedModified_date });
            }
          }
          if (objectModel.attributes.created_date != "") {
            var formettedcreated_date = selfobj.timeselectOptions.changeTimeFormat(objectModel.attributes.created_date);
            if (formettedcreated_date != undefined) {
              objectModel.set({ "created_date": formettedcreated_date });
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
      }
      $("#userRoleList").append(template({ userRoleDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
      // $("#userRoleList").append(template({ userRoleDetails: objectModel }));
    },
    addAll: function () {
      $("#userRoleList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filteredSearches:function(e){
      var selfobj = this;
      selfobj.filteredSearch = true;
      selfobj.filterSearch();
    },
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      this.filterOption.set({ curpage: 0 });
    
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
     
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();

        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = 0;
          selfobj.totalRec = res.paginginfo.totalRecords;
          $('#listView').hide();
          $('.noDataFound').hide();
          $("#filterOption").hide();
          if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
              $('#listView').show();
              $('.noDataFound').show();
              $("#filterOption").show();
          } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
              $('.noCustAdded').show();
          } else if(selfobj.totalRec > 0){
              $('#listView').show();
              $("#filterOption").show();
          }
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        //$(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
        selfobj.moduleDefaultSettings.setTableWidth(false);
        if(selfobj.arrangedColumnList.length > 0){
          var sectionID = 'listView';
          new listSliderView({sectionID : sectionID});
        }
      });
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdisabled = $(e.currentTarget).hasClass("disabled");
      if (isdisabled) {
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
          if (res.flag == "F") showResponse('',res,'');
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.setTableWidth(false);
        });
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
    render: function () {
      let selfobj = this;
      var template = _.template(userRoleTemp);
      this.$el.html(template({closeItem:this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList,formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
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
  return userRoleView;
});
