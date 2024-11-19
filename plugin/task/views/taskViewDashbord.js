
define([
    'jquery',
    'underscore',
    'backbone',
    'datepickerBT',
    'moment',
    'Swal',
    '../views/taskSingleView',
    '../views/repeatTaskCustomView',
    '../../core/views/historySingleView',
    '../collections/taskCollection',
    '../models/taskFilterOptionModel',
    "../../admin/collections/adminCollection",
    "../../customer/collections/customerCollection",
    "../../category/collections/slugCollection",
    'text!../templates/taskRow_other.html',
    'text!../templates/task_temp_other.html',
    'text!../templates/taskFilterOption_temp.html',
  ], function ($, _, Backbone, datepickerBT, moment, Swal, taskSingleView, repeatTaskCustomView, historySingleView, taskCollection, taskFilterOptionModel, adminCollection, customerCollection, slugCollection, taskRowTemp, taskTemp, taskFilterTemp) {
  
    var taskView = Backbone.View.extend({
      taskCount:0,
      initialize: function (options) {
        var customer_id = options.customerID
        this.customerID = customer_id;
        this.customerName = options.custName;
        this.toClose = "taskFilterView";
        var selfobj = this;
        $(".profile-loader").show();
        var mname = Backbone.history.getFragment();
        permission = ROLE['task'];
        readyState = true;
        this.menuID = permission.menuID;
        this.render();
        filterOption = new taskFilterOptionModel();
        filterOption.set({ customer_id: customer_id });
        filterOption.set({ "menuId": permission.menuID });
        searchtask = new taskCollection();
        this.adminList = new adminCollection();
        this.adminList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active", getAll: "Y" }
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".preloader").hide();
          // selfobj.render();
        });
  
        this.categoryList = new slugCollection();
        this.categoryList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'task_priority,task_type,task_status' }
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".preloader").hide();
          // selfobj.render();
        });
  
        this.customerList = new customerCollection();
        this.customerList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".preloader").hide();
          // selfobj.render();
        });
  
        searchtask.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".preloader").hide();
          setPagging(res.paginginfo, res.loadstate, res.msg);
          
        });
        
        this.collection = searchtask;
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
      },
      events:
      {
        "blur #textval": "setFreeText",
        "change .range": "setRange",
        "change #textSearch": "settextSearch",
        "click .multiOptionSel": "multioption",
        "click .filterSearch": "filterSearch",
        "click #taskFilterOption": "filterRender",
        "click #removeFlyOut": "removeFlyOut",
        "click .resetval": "resetSearch",
        "click .loadview": "loadSubView",
        "click .sortColumns": "sortColumn",
        "change .txtchange": "updateOtherDetails",
        "click .changeStatus": "changeStatusListElement",
        "click .showpage": "loadData",
        "change .changeBox": "changeBox",
        "click .sortbydate": "sortByDate",
        "click .showpoup": "showpoup",
        "click .closeFilter": "closeFilter",
      },
  
      attachEvents: function () {
        this.$el.off('click', '#removeFlyOut', this.removeFlyOut);
        this.$el.on('click', '#removeFlyOut', this.removeFlyOut.bind(this));
        this.$el.off('click', '.loadview', this.loadSubView);
        this.$el.on('click', '.loadview', this.loadSubView.bind(this));
        this.$el.off('click', '#taskFilterOption', this.filterRender);
        this.$el.on('click', '#taskFilterOption', this.filterRender.bind(this));
        this.$el.off('click', '.closeFilter', this.closeFilter);
        this.$el.on('click', '.closeFilter', this.closeFilter.bind(this));
      },
  
      showpoup: function (e) {
        let selfobj = this;
        let task_id = $(e.currentTarget).attr("data-task_id");
        Swal.fire({
          title: 'Are you sure task is Complete?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Mark As Completed',
          denyButtonText: `Cancel`,
        }).then((result) => {
          if (result.isConfirmed) {
            $(e.currentTarget).prop('disabled', true);
            $.ajax({
              url: APIPATH + 'taskDashboard/status',
              method: 'POST',
              data: { list: task_id },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F") {
                  showResponse('',res,'');
                }
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filterSearch();
                }
              }
            });
          } else if (result.isDenied) {
            $(e.currentTarget).prop('checked', false);
          }
        })
      },
  
      updateOtherDetails: function (e) {
        e.stopPropagation();
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        filterOption.set(newdetails);
        console.log(filterOption);
      },
  
      closeFilter:function(e){
        var isOpen = $(".ws_filterOptions").hasClass("open");
          if (isOpen) {
            $(".ws_filterOptions").removeClass("open");
            $(e.currentTarget).removeClass("active");
            return;
          }
      },
  
      changeBox: function (e) {
        var selVal = $(e.currentTarget).val();
        $(".hidetextval").hide();
        $(".filterClear").val("");
        if (selVal == "assignee") {
          $(".assigneeList").show();
        } else if (selVal == "start_date") {
          $(".dateList").show();
        } else if (selVal == "due_date") {
          $(".dateList").show();
        } else {
          $(".textvalBox").show();
        }
      },
      settextSearch: function (e) {
        var usernametxt = $(e.currentTarget).val();
        filterOption.set({ textSearch: usernametxt });
      },
      changeStatusListElement: function (e) {
        var selfobj = this;
        var removeIds = [];
        var status = $(e.currentTarget).attr("data-action");
        if (status == "delete") {
          var r = confirm("Are you sure to delete task?");
          if (r == false) {
            return false;
          }
          var action = "changeStatus";
        }
        $('#clist input:checkbox').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-task_id"));
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
          url: APIPATH + 'taskMaster/status',
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
              showResponse('',res,'');
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.collection.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler
              }).done(function (res) {
                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                $(".profile-loader").hide();
                // selfobj.filterSearch();
              });
            }
            // setTimeout(function () {
            $(".deleteAll").hide();
            // }, 3000);
  
          }
        });
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },
      loadSubView: function (e) {
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-view");
        switch (show) {
          case "singletaskData": {
            var task_id = $(e.currentTarget).attr("data-task_id");
            if (task_id != undefined) {
              new historySingleView({ task_id: task_id });
            } else {
              handelClose("historySingleView");
            }
            new taskSingleView({ task_id: task_id, searchtask: selfobj, customer_id: selfobj.customerID, form_label:"Task", customerName: selfobj.customerName, menuId:this.menuID });
            break;
          }
        }
      },
      loaduser: function () {
        var memberDetails = new singlememberDataModel();
      },
      addOne: function (objectModel) {
        var template = _.template(taskRowTemp);
        var dueDateMoment = moment(objectModel.attributes.due_date);
        objectModel.attributes.newDate = objectModel.attributes.due_date;
        if (objectModel.attributes.due_date != "0000-00-00" && objectModel.attributes.due_date != null) {
          objectModel.attributes.due_date = dueDateMoment.format("DD-MMM-YYYY");
          var today = moment();
          if (dueDateMoment.isSame(today, 'day')) {
            objectModel.attributes.due_date = "Today";
          } else if (dueDateMoment.isSame(today.clone().subtract(1, 'day'), 'day')) {
            objectModel.attributes.due_date = "Yesterday";
          } else if (dueDateMoment.isSame(today.clone().add(1, 'day'), 'day')) {
            objectModel.attributes.due_date = "Tomorrow";
          } else {
            objectModel.attributes.date_status = dueDateMoment.format("MMMM Do, YYYY");
          }
        }
        $("#taskListOther").append(template({ taskDetails: objectModel }));
      },
      addAll: function () {
        $("#taskListOther").empty();
        this.collection.forEach(this.addOne, this);
        this.render();
      },
  
      setValues: function (e) {
        setvalues = ["status", "orderBy", "order"];
        var selfobj = this;
        $.each(setvalues, function (key, value) {
          var modval = filterOption.get(value);
          if (modval != null) {
            var modeVal = modval.split(",");
          } else { var modeVal = {}; }
  
          $(".item-container li." + value).each(function () {
            var currentval = $(this).attr("data-value");
            var selecterobj = $(this);
            $.each(modeVal, function (key, dbvalue) {
              if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
                $(selecterobj).addClass("active");
              }
            });
          });
  
        });
        setTimeout(function () {
          if (e != undefined && e.type == "click") {
            var newsetval = [];
            var objectDetails = [];
            var classname = $(e.currentTarget).attr("class").split(" ");
            $(".item-container li." + classname[0]).each(function () {
              var isclass = $(this).hasClass("active");
              if (isclass) {
                var vv = $(this).attr("data-value");
                newsetval.push(vv);
              }
            });
            if (0 < newsetval.length) {
              var newsetvalue = newsetval.toString();
            }
            else { var newsetvalue = ""; }
  
            objectDetails["" + classname[0]] = newsetvalue;
            $("#valset__" + classname[0]).html(newsetvalue);
            filterOption.model.set(objectDetails);
          }
        }, 3000);
      },
      multioption: function (e) {
        var selfobj = this;
        var issinglecheck = $(e.currentTarget).attr("data-single");
        if (issinglecheck == undefined) { var issingle = "N" } else { var issingle = "Y" }
        if (issingle == "Y") {
          var newsetval = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          newsetval["" + classname[0]] = $(e.currentTarget).attr("data-value");
          filterOption.set(newsetval);
  
        }
        if (issingle == "N") {
          setTimeout(function () {
            var newsetval = [];
            var objectDetails = [];
            var classname = $(e.currentTarget).attr("class").split(" ");
            $(".item-container li." + classname[0]).each(function () {
              var isclass = $(this).hasClass("active");
              if (isclass) {
                var vv = $(this).attr("data-value");
                newsetval.push(vv);
              }
            });
  
            if (0 < newsetval.length) {
              var newsetvalue = newsetval.toString();
            }
            else { var newsetvalue = ""; }
  
            objectDetails["" + classname[0]] = newsetvalue;
            filterOption.set(objectDetails);
          }, 500);
        }
      },
      filterRender: function (e) {
        // var isexits = checkisoverlay(this.toClose);
        // alert(isexits);
        // if (!isexits) {
          var source = taskFilterTemp;
          var template = _.template(source);
          var cont = $("<div>");
          cont.html(template({ "adminList": this.adminList.models, "categoryList": this.categoryList.models, "customerList": this.customerList.models}));
          cont.attr('id', this.toClose);
          /*  
            INFO
            this line use to hide if any other overlay is open first close it.
          */
          $(".overlay-main-container").removeClass("open");
          // append filter html here
          $(".ws_filterOptions").html(cont);
          // $(".ws-select").selectpicker();
          /*  
            INFO
            open filter popup by adding class open here
          */
          $(".ws_filterOptions").addClass("open");
          $(".ws-select").selectpicker();
          /* 
            INFO
            make current task active
          */
          $(e.currentTarget).addClass("active");
  
        // } else {
        //   // check here we alreay open it or not. if open toggle that popup here
        //   var isOpen = $(".ws_filterOptions").hasClass("open");
        //   if (isOpen) {
        //     $(".ws_filterOptions").removeClass("open");
        //     $(e.currentTarget).removeClass("active");
        //     return;
        //   } else {
        //     $(e.currentTarget).addClass("active");
        //     // this function will handel other exiting open popus
        //   }
        // }
        this.setValues();
        this.setupFilter();
        rearrageOverlays("Filter", this.toClose, "small");
        // this.attachEvents();
      },
  
      removeFlyOut: function () {
        console.log("removeFlyOut");
      },
  
      resetSearch: function () {
        filterOption.clear().set(filterOption.defaults);
        filterOption.set({ customer_id: this.customerID });
        $(".multiOptionSel").removeClass("active");
        $("#textval").val("");
        $(".hidetextval").hide();
        $(".txtchange").val("");
        $(".ws-select").selectpicker("refresh");
        $('#textSearch option[value=task_id]').attr('selected', 'selected');
        this.filterSearch(false);
      },
  
      filterSearch: function (isClose = false) {
        if (isClose && typeof isClose != 'object') {
          $('.' + this.toClose).remove();
          rearrageOverlays();
        }
        searchtask.reset();
        var selfobj = this;
        readyState = true;
        filterOption.set({ curpage: 0 });
        var $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
  
        searchtask.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
  
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", 1);
          $element.attr("data-index", res.paginginfo.nextpage);
  
          //$(".page-info").html(recset);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }
          selfobj.setValues();
        });
      },
  
  
      loadData: function (e) {
        var selfobj = this;
        var $element = $('#taskListOther');
        var cid = $(e.currentTarget).attr("data-dt-idx");
        var isdiabled = $(e.currentTarget).hasClass("disabled");
        if (isdiabled) {
        } else {
  
          $element.attr("data-index", cid);
          searchtask.reset();
          var index = $element.attr("data-index");
          var currPage = $element.attr("data-currPage");
  
          filterOption.set({ curpage: index });
          var requestData = filterOption.attributes;
  
          $(".profile-loader").show();
          searchtask.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
          }).done(function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            $(".profile-loader").hide();
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
  
            setPagging(res.paginginfo, res.loadstate, res.msg);
            $element.attr("data-currPage", index);
            $element.attr("data-index", res.paginginfo.nextpage);
          });
        }
      },
      setupFilter: function () {
        var selfobj = this;
        startDate = $('#fromDate').datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          StartDate: new Date(),
          numberOfMonths: 1,
          autoclose: true,
        }).on('changeDate', function (ev) {
          $('#fromDate').change();
          var valuetxt = $("#fromDate").val();
          var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          filterOption.set({ trainingStartDate: valuetxt });
          //selfobj.model.set({trainingStartDate:valuetxt});
          //endDate.datepicker({"StartDate":new Date("10/03/2023")});
          var valuetxt = $("#toDate").val();
          var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          if (temp > temp2) {
            $("#toDate").val("");
          }
  
        });
        endDate = $('#toDate').datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          numberOfMonths: 1,
          autoclose: true,
        }).on('changeDate', function (ev) {
          $('#toDate').change();
          var valuetxt = $("#toDate").val();
          var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          filterOption.set({ trainingStartDate: valuetxt });
          var valuetxt = $("#fromDate").val();
          var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          if (temp2 > temp) {
            $("#fromDate").val("");
          }
          //selfobj.model.set({trainingStartDate:valuetxt});
          //startDate.datepicker("option","minDate",$.datepicker.parseDate("dd/mm/yy",ev.value));
          // startDate.datepicker("setEndDate", moment(valuetxt).format('l'));
  
        });
  
        startDate = $('#fromDate2').datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          StartDate: new Date(),
          numberOfMonths: 1,
          autoclose: true,
        }).on('changeDate', function (ev) {
          $('#fromDate2').change();
          var valuetxt = $("#fromDate2").val();
          var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          filterOption.set({ trainingStartDate: valuetxt });
          //selfobj.model.set({trainingStartDate:valuetxt});
          //endDate.datepicker({"StartDate":new Date("10/03/2023")});
          var valuetxt = $("#toDate2").val();
          var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          if (temp > temp2) {
            $("#toDate2").val("");
          }
  
        });
        endDate = $('#toDate2').datepickerBT({
          format: "dd-mm-yyyy",
          todayBtn: "linked",
          clearBtn: true,
          todayHighlight: true,
          numberOfMonths: 1,
          autoclose: true,
        }).on('changeDate', function (ev) {
          $('#toDate2').change();
          var valuetxt = $("#toDate2").val();
          var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          filterOption.set({ trainingStartDate: valuetxt });
          var valuetxt = $("#fromDate2").val();
          var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
          if (temp2 > temp) {
            $("#fromDate2").val("");
          }
        });
      },
      render: function () {
        var template = _.template(taskTemp);
        this.$el.html(template({ closeItem: this.toClose , taskCount: this.taskCount}));
        $("#tasks").empty().append(this.$el);
        this.attachEvents();
        return this;
      },
  
    });
    return taskView;
  });
  