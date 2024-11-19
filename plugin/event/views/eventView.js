
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/eventSingleView',
  '../views/eventScheduleView',
  '../collections/eventCollection',
  '../models/eventFilterOptionModel',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/listSliderView',
  '../../core/views/dynamicFilterView',
  '../../core/views/mailView',
  'text!../templates/eventRow.html',
  'text!../templates/eventGridRow.html',
  'text!../templates/eventTemp.html',
  'text!../templates/eventFilterOptionTemp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, moment, Swal, eventSingleView, eventScheduleView, eventCollection, eventFilterOptionModel,configureColumnsView,appSettings,dynamicFormData,slugCollection,moduleDefaultSettings,listSliderView,dynamicFilterView, mailView, eventRowTemp, eventGridRow, eventTemp, eventFilterTemp,linkedDropdown,deleteCardView) {

  var eventView = Backbone.View.extend({
    module_desc:'',
    plural_label:'',
    form_label:'',
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.filteredSearch = false;
      this.totalRec = 0; 
      this.currPage = 0;
      this.tableStructure = {},
      
      this.View = "traditionalList";
      this.toClose = "eventFilterView";
      this.arrangedColumnList = [];
      this.filteredFields = [];
      this.idsToRemove = [];
      // $(".profile-loader").show();
      $(".loder").show();
      $(".filter").hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = [];
      this.staticJoined = [];
      this.columnMappings = [];    
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      selfobj.categoryList = new slugCollection();
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj : this});
      this.appSettings = new appSettings();
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

      this.filterOption = new eventFilterOptionModel();
      this.filterOption.set({ "menuId": this.menuId });
      this.collection = new eventCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'EventMaster/multipleHardDelete';
	    this.statusChangeURL = 'EventMaster/multipleeventChangeStatus'; 

      this.render();
    },

    events:
    {
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .changeStatusGrid": "changeStatusListElementGrid",
      "click .showpage": "loadData",
      "click .sortColumns": "sortColumn",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .downloadReport": "downloadReport",
      "click .listViewBtn" : "showViewList",
      "click .setViewMode" : "setViewMode",
      "click .listSortColumns" : "showListSortColumns",
      "click .memberlistcheck" : "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .deleteCard": "deleteCard",
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
        $("#eventlistview").hide();
        $("#eventgridview").show();
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        $(".hide").hide();
        $(".showListView").toggle();
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
    downloadReport: function (e) {
      e.preventDefault(); 
      var selfobj = this;
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
          action: APIPATH + "eventsReports",
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
    }, 
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      }else{
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

            var selfobj = this;
            var removeIds = [];
            var status = $(e.currentTarget).attr("data-action");
            var action = "changeStatus";
            $('#eventList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-event_id"));
              }
            });
            $(".deleteAll").hide();
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
              url: APIPATH + 'event/status',
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
                if (res.flag == "F") {
                  Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filteredSearch = false;
                  selfobj.filterSearch();
                }
                $(".deleteAll").hide();
                $('.checkall').prop('checked', false);
              }
            });
          } else if (result.isDenied) {
            // Swal.fire('Changes are not saved', '', 'info')
            $('#eventList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                $(this).prop('checked', false);
              }
            });
            $(".listCheckbox").find('.checkall').prop('checked', false);
            $(".deleteAll").hide();
          }
        })
      }
    },
    changeStatusListElementGrid: function (e) {
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

          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          removeIds.push($(e.currentTarget).attr("data-event_id"));
          // $('#eventList input:checkbox').each(function () {
          //   if ($(this).is(":checked")) {
             
          //   }
          // });
          // $(".deleteAll").hide();
          $(".action-icons-div").hide();
          // $(".memberlistcheck").click(function () {
          //   if ($(this).is(":checked")) {
          //     $(".action-icons-div").show(300);
          //   } else {
          //     $(".action-icons-div").hide(200);
          //   }
          // });
          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
            return false;
          }
          $.ajax({
            url: APIPATH + 'event/status',
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
              if (res.flag == "F") {
                Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
              }
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                selfobj.filterSearch();
              }
              // $(".deleteAll").hide();
              $('.checkall').prop('checked', false);
            }
          });
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
          $('#eventList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false);
            }
          });
          $(".listCheckbox").find('.checkall').prop('checked', false);
          // $(".deleteAll").hide();
        }
      })
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      $(".loder").show();
      let selfobj = this;
      let show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singleeventData": {
            let event_id = $(e.currentTarget).attr("data-event_id");
            if(event_id != "" && event_id != null && event_id != undefined ){
              if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              }else{
                 new eventSingleView({ event_id: event_id, searchevent: this, menuId: selfobj.menuId });
              }
            }else{
              if (permission.add != "yes") {
                Swal.fire("You don't have permission to add", '', 'error');
                return false;
              }else{
                 new eventSingleView({ event_id: event_id, searchevent: this, menuId: selfobj.menuId });
              }
            }
            $('body').find(".loder");
            break;
          }
          case "prepareeventschedule": {
            $('body').find(".loder");
            let eventID = $(e.currentTarget).attr("data-event_id");
            let eventName = $(e.currentTarget).attr("data-eventName");
            let eventschedulerID = $(e.currentTarget).attr("data-event_scheduler_id");
            let startDate = $(e.currentTarget).attr("data-startDate");
            let endDate = $(e.currentTarget).attr("data-endDate");
            startDate = moment(startDate).format('DD-MM-YYYY');
            endDate = moment(endDate).format('DD-MM-YYYY');
            new eventScheduleView({ eventID: eventID, searchevent: this, eventschedulerID: eventschedulerID, startDate: startDate, endDate: endDate, loadFrom: "site_event", eventName: eventName });
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
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      $("#eventlistview").hide();
      $(".noCustAdded").hide();
      $("#filterOption").hide();
      selfobj.totalRec = selfobj.collection.length;
      if (selfobj.View == "traditionalList") {
        if (selfobj.totalRec == 0) {
          $(".noCustAdded").show();
        } else {
          $("#eventlistview").show();
          $("#filterOption").show();
        }
      }else{
        $("#filterOption").show();
      }
      var template = _.template(eventRowTemp);
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
      $("#eventList").append(template({ eventDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
      var template = _.template(eventGridRow);
      $("#eventgrid").append(template({ eventDetails: objectModel }));

      var mailTruncateElements = document.querySelectorAll('.mailtruncate');
      mailTruncateElements.forEach(function (element) {
        var textWidth = element.offsetWidth;
        var parentEle = element.parentElement;

        if (textWidth >= 150) {
          parentEle.querySelector('.tooltiptxt').style.display = 'block';
        }
        else {
          parentEle.querySelector('.tooltiptxt').style.display = 'none';
        }
      });
    },
    addAll: function () {
      $("#eventList").empty();
      this.collection.forEach(this.addOne, this);
      $("#eventgrid").empty();
      this.collection.forEach(this.addOne, this);
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
              removeIds.push($(this).attr("data-event_id"));
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
        var template = _.template(eventTemp);
        this.$el.html(template({closeItem:this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList,formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
        $(".main_container").append(this.$el);
        $('.ws-select').selectpicker();
        $(".loder").hide();
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
  return eventView;
});
