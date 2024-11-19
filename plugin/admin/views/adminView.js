define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'Swal',
  '../views/addAdminView',
  '../views/accessCompanyDetails',
  '../collections/adminCollection',
  '../models/adminFilterOptionModel',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  '../../userRole/collections/userRoleCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/timeselectOptions',
  '../../core/views/dynamicFilterView',
  'text!../templates/adminRow.html',
  'text!../templates/admin_temp.html',
  'text!../templates/adminFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
], function ($, _, Backbone, moment, Swal, addAdminView, accessCompanyDetails, adminCollection, adminFilterOptionModel,configureColumnsView,appSettings,mailView, dynamicFormData,slugCollection,userRoleCollection, moduleDefaultSettings, timeselectOptions , dynamicFilterView,adminRow, adminTemp, adminFilterTemp,linkedDropdown) {

  var adminView = Backbone.View.extend({
    module_desc:'',
    plural_label:'',
    form_label:'',
    scanDetails:{},
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "adminFilterView";
      this.filteredSearch = false;
      this.totalRec = 0; 
      this.filterOption = new adminFilterOptionModel();
      this.arrangedColumnList = [];
      $(".profile-loader").show();
      $('.filter').hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      if(options.parentObj !== undefined){
        this.scanDetails = options.parentObj;
      }
      // ADD JOINED FIELDS OTHER THAN CREATED BY, MODIFIED BY
      this.staticJoined = [
        {
          field : 'roleID',
          fieldtype: 'joined',
          joinedTable : 'user_role_master',
          select: 'roleID,roleName',
          primaryKey : 'roleID',
          slug:'',
        },
      ];
      this.defaultColumns = ['adminID','name','user_name', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = ['user_setting','gfcmToken','otp','country_code','otp_exp_time','g_cal_token','one_drive_access_token','is_google_sync','ftoken','isVerified','photo','adminID','password','latitude','longitude','roleOfUser'];
      this.columnMappings = [
          {'is_sys_user':'System User'},
          {'isemailsend':'Verification Email Sent'},
          {'contactno':'Contact No'},
          {'whatsappno':'Whatsapp No'},
          {'dateofbirth':'Date of Birth'},
          {'lastlogin':'Last Login'},
          {'company_id':'Assigned Company/Branch'},
          {'username':'User Name'},
          {'roleid':'User Role'},
          {'is_approver':'Approval Privileges'},
          {'otp':'OTP'}
      ];
      this.menuId = permission.menuID;
      this.timeselectOptions = new timeselectOptions();
      selfobj.categoryList = new slugCollection();
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj:this});
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.userRoleList = new userRoleCollection();
      this.userRoleList.fetch({
        headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,data:{getAll:'Y',status:"active"}
        }).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
      });
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,data:{getAll:'Y',status:"active"}
        }).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
      });
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
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.filterOption.set({ "menuId": this.menuId });
      this.collection = new adminCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.render();
    },
    getColumnData: function(){
      var selfobj = this;
      this.dynamicFormDatas.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { "pluginId": this.menuId }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.metadata && res.metadata.trim() != '') {
              selfobj.metadata  = JSON.parse(res.metadata);
          } 
          if (res.c_metadata && res.c_metadata.trim() != '') {
              selfobj.c_metadata  = JSON.parse(res.c_metadata);
              selfobj.arrangedColumnList = selfobj.c_metadata;
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
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.flag == 'S') {
          (res.data.length > 0)? $('.filter').show() : $('.filter').hide();
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
        $(".profile-loader").hide();
      });
      selfobj.render();
    },
    events:
    {
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .sortColumns": "sortColumn",
      "click .showpage": "loadData",
      "click .downloadReport": "downloadReport",
      "click .listSortColumns" : "showListSortColumns",
      "click .memberlistcheck" : "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .deleteForever": "deleteForever",
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
      newdetails["type"] = type;
      this.filterOption.set(newdetails);
      let form = $(e.currentTarget).closest("form");
      form.attr({
          action: APIPATH + "adminReports",
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
      console.log("filterOption", this.filterOption);
    }, 
    deleteForever: function(e){
      let selfobj = this;
      var adminID = $(e.currentTarget).attr('data-adminID');
      var name = $(e.currentTarget).attr('data-name');
      var adminIdList = [];
      adminIdList = this.adminList;
      let filteredList = adminIdList.filter(item => item.attributes.adminID !== adminID);
      var inputOptionsPromise = new Promise(function (resolve) {
        setTimeout(function () {
            let inputOptions = {};
            filteredList.forEach(item => {
                inputOptions[item.attributes.adminID] = item.attributes.name;
            });
            resolve(inputOptions);
        }, 100);
    });

    const { value: Role } = Swal.fire({
      title: "User Delete",
      text: name + " has assigned records. Deleting this user may also delete associated records.",
      icon: 'warning',
      showCancelButton: true,
      showCloseButton: true,
      showDenyButton: true,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Asssign & Delete',
      inputPlaceholder: "Select User",
      denyButtonText: `Skip & Delete`,
      input: 'select',
      inputOptions: inputOptionsPromise,
      inputValidator: (value) => {
        selectedId = value;
        if (!value) {
          return 'Please select the User!'
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (Role) {}
        $.ajax({
          url: APIPATH + 'deleteUserForever',
          method: 'POST',
          data: { id: adminID, updatedAdmin: selectedId, action: 'changeAssigneeAndDelete' },
          datatype: 'JSON',
          beforeSend: function (request) {
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
              selfobj.filterSearch();
            }
          }
        });
          Swal.fire('Linked!', '', 'success');
        } else if (result.isDenied){
          $.ajax({
            url: APIPATH + 'deleteUserForever',
            method: 'POST',
            data: { id: adminID, action: 'DeleteAll' },
            datatype: 'JSON',
            beforeSend: function (request) {
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
                selfobj.filterSearch();
              }
  
            }
          });
        } return;
      })
      return;
    },
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
          Swal.fire("You don't have permission to delete", '', 'error');
          return false;
      }else{
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          if (status == "delete") {
            var r = confirm("Are you sure to delete admin user?");
            if (r == false) {
              return false;
            }
            var action = "delete";
          } else {
            var action = "changeStatus";
          }
          $('#adminlistcheck input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-adminID"));
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
            alert("Please select at least one User.");
            return false;
          }
          $.ajax({
            url: APIPATH + 'admins/status',
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
                selfobj.filteredSearch = false;
                selfobj.filterSearch();
              }
              // setTimeout(function () {
              //   $(e.currentTarget).html(status);
              // }, 3000);
              $(".deleteAll").hide();

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
        case "singleadminData": {
          var adminID = $(e.currentTarget).attr("data-adminID");
          if(adminID != "" && adminID != null && adminID != undefined ){
            if (permission.edit != "yes") {
            Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }else{
              new addAdminView({ adminID: adminID, searchadmin: this,menuId:this.menuId,form_label:selfobj.form_label });
            }
          }else{
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            }else{
              new addAdminView({ adminID: adminID, searchadmin: this,menuId:this.menuId,form_label:selfobj.form_label });
            }
          }
          break;
        }
        case "accessCompany": {
          var adminID = $(e.currentTarget).attr("data-adminID");
          new accessCompanyDetails({ adminID: adminID, searchadmin: this });
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
      var template = _.template(adminRow);
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
          if (objectModel.attributes.lastLogin != "") {
            var formettedLastLogin = selfobj.timeselectOptions.changeTimeFormat(objectModel.attributes.lastLogin);
            if (formettedLastLogin != undefined) {
              objectModel.set({ "lastLogin": formettedLastLogin });
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
        });
      }
      if (objectModel.get('slug') !== 'super_admin' ) {
        $("#adminlistcheck").append(template({ adminDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
      }
    },
    addAll: function () {
      $("#adminlistcheck").empty();
      this.collection.forEach(this.addOne, this);
    },
  // ------------------- FILTERS --------------------------
  showListSortColumns: function (e) {
    e.preventDefault();
    this.dynamicFilter.showListSortColumns(e);
  },
  sortColumn: function (e) {
    e.stopPropagation();
    this.dynamicFilter.sortColumn(e);
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
      this.filterOption.set({ menuId:this.menuId});
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
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
         
        } else if(selfobj.totalRec > 0){
            $('.noDataFound').hide();
            $(".noCustAdded").hide();
            $('#listView').show();
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
        selfobj.moduleDefaultSettings.setListSliderView();
      });
    },
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
    // -----------------------------------------------
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['name','userName','email','roleName','lastLogin','status'];
      var stdColumn = [];
      switch (show) {
        case "arrangeColumns": {
          var isOpen = $(".ws_ColumnConfigure").hasClass("open");
            if (isOpen) {
              $(".ws_ColumnConfigure").removeClass("open");
              $(e.currentTarget).removeClass("BG-Color");
              selfobj.getColumnData();
              selfobj.filterSearch();
              return;
            } else {
              new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn,skipFields : selfobj.skipFields, columnMappings: selfobj.columnMappings});
              $(e.currentTarget).addClass("BG-Color");
            }
          break;
        }
      }
    },
    sidebarUpdate: function(){
      var selfobj = this;
      //this.render();
      this.recordCount = 0;
      this.collection.reset();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.flag == "S") {
          ISMENUSET = res.data;
          var sidebarTemplate = _.template(SIDEBAR);
          $("#leftsidebarSection").remove();
          $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
        }else if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }

      });
    },
    render: function () {
      let selfobj = this;
      var template = _.template(adminTemp);
      this.$el.html(template({ closeItem: this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
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

  return adminView;

});