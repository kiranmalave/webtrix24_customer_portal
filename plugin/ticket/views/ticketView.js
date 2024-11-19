
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  'moment',
  '../views/ticketSingleView',
  '../collections/ticketCollection',
  '../../admin/collections/adminCollection',
  '../../category/collections/slugCollection',
  '../models/ticketFilterOptionModel',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  'text!../templates/ticketRow.html',
  'text!../templates/ticket_temp.html',
  'text!../templates/ticketFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, Swal, moment, ticketSingleView, ticketCollection, adminCollection, slugCollection, ticketFilterOptionModel, columnArrangeModalView,configureColumnsView, appSettings, mailView, dynamicFormData, ticketRowTemp, ticketTemp, ticketFilterTemp) {

  var ticketView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    form_label: '',
    initialize: function (options) {
      this.toClose = "ourexpenseFilterView";
      var selfobj = this;
      selfobj.arrangedColumnList = [];
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      this.appSettings = new appSettings();
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
      });

      filterOption = new ticketFilterOptionModel();
      filterOption.set({ "menuId": this.menuId });
      this.dynamicFormDatas = new dynamicFormData();

      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'ticket_category' }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        // selfobj.render();
      });

      this.collection = new ticketCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.render();
    },

    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click #filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "change .dropval": "singleFilterOptions",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .sortColumns": "sortColumn",
      "click .downloadReport": "downloadReport",
    },

    downloadReport:function(e){
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      filterOption.set(newdetails);
      let form = $("#reports");
      let dataInput = $("<input>")
        .attr("type", "hidden")
        .attr("name", "data")
        .val(JSON.stringify(filterOption));
      form.attr({
        id: "receiptsData",
        action: APIPATH + "reports",
        method: "POST",
        target: "_blank",
      }).append(dataInput);
      filterOption.clear('type');
      form.submit();
    },
    
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    settextSearch: function (e) {
      var usernametxt = $(e.currentTarget).val();
      filterOption.set({ textSearch: usernametxt });
    },
    sortColumn: function (e) {
      var order = $(e.currentTarget).attr("data-value");
      var selfobj = this;
      var newsetval = [];
      $("#clist").find(".up").removeClass("active");
      $("#clist").find(".down").removeClass("active");
      // var classname = $(e.currentTarget).attr("class").split(" ");
      newsetval["order"] = $(e.currentTarget).attr("data-value");
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      if (order == "" || order == "DESC") {
        order = "ASC";
        $(e.currentTarget).find(".down").removeClass("active");
        $(e.currentTarget).find(".up").addClass("active");
      } else {
        order = "DESC";
        $(e.currentTarget).find(".down").addClass("active");
        $(e.currentTarget).find(".up").removeClass("active");
      }
      $(e.currentTarget).attr("data-value", order);
      newsetval["order"] = order;
      newsetval["orderBy"] = $(e.currentTarget).attr("data-field");
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },
    singleFilterOptions: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },
    changeStatusListElement: function (e) {
      Swal.fire({
        title: "Delete ticket?",
        text: "If you delete these ticket, you cannot retrieve them. Are you sure you want to delete?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete',
        cancelButtonText: 'No, Keep it',
        animation: "slide-from-top",

      }).then((result) => {
        if (result.isConfirmed) {
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $('#clist input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-ticket_id"));
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
            url: APIPATH + 'ticket/status',
            method: 'POST',
            data: { list: idsToRemove, action: action, status: status },
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
                selfobj.collection.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler
                }).done(function (res) {
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".profile-loader").hide();
                  selfobj.filterSearch();
                });
              }
              $(".deleteAll").hide();
              $('.checkall').prop('checked', false);
              $('.memberlistcheck').prop('checked', false);

            }
          });
        } else {
          $('#clist input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false)
            }
          });
          $('.changeStatus').hide();
          $('.checkall').prop('checked', false)
        }
      })
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singleExpenseData": {
          var ticket_id = $(e.currentTarget).attr("data-ticket_id");
          new ticketSingleView({ ticket_id: ticket_id, searchticket: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
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
    resetSearch: function () {
      filterOption.clear().set(filterOption.defaults);
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $(".txtchange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $('#textSearch option[value=ticket_id]').attr('selected', 'selected');
      this.filterSearch();
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      var template = _.template(ticketRowTemp);
      var expenseDate = moment(objectModel.attributes.expense_date);
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
      $("#ticketList").append(template({ expenseDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
    },
    addAll: function () {
      $("#ticketList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
        var source = ticketFilterTemp;
        var template = _.template(source);
        var cont = $("<div>");
        cont.html(template({ "adminList": this.adminList.models, "categoryList": this.categoryList.models, arrangedColumnList: this.arrangedColumnList || [] }));
        cont.attr('id', this.toClose);
        /*  
          INFO
          this line use to hide if any other overlay is open first close it.
        */
        $(".overlay-main-container").removeClass("open");
        // append filter html here
        $(".ws_filterOptions").append(cont);
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

      } else {
        // check here we alreay open it or not. if open toggle that popup here
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
          // this function will handel other exiting open popus
        }
      }
      this.setValues();
      this.setupFilter();
      rearrageOverlays("Filter", this.toClose, "small");
    },
    setValues: function (e) {
      setvalues = ["status"];
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
    filterSearch: function () {
      $('#myModal').modal('hide');
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      filterOption.set({ menuId: this.menuId });
      var $element = $('#loadMember');

      $(".profile-loader").show();

      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      this.collection.fetch({
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
        // $(".page-info").html(recset);
        if (res.loadstate === false) {
          $(".profile-loader-msg").html(res.msg);
          $(".profile-loader-msg").show();
        } else {
          $(".profile-loader-msg").hide();
        }
      });
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

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        this.collection.fetch({
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
        var valuetxt = $("#fromDate").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#fromDate").val("");
        }
      });
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['ticket_id', 'expense_date', 'name', 'expense_Category', 'merchant', 'amount', 'status'];
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
            // new columnArrangeModalView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
            new configureColumnsView({menuId: this.menuId,ViewObj: selfobj,stdColumn:stdColumn});
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },

    render: function () {
      var selfobj = this;
      var template = _.template(ticketTemp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList }));
      $(".main_container").append(this.$el);
      return this;
    }
  });

  return ticketView;

});
