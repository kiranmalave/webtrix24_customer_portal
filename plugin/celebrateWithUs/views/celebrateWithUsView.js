
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  '../views/celebrateWithUsSingleView',
  '../views/declinedReasonView',
  '../views/approveCelebrationView',
  '../collections/celebrateWithUsCollection',
  '../../category/collections/slugCollection',
  '../../admin/collections/adminCollection',
  '../models/celebrateWithUsFilterOptionModel',
  '../../core/views/appSettings',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  'text!../templates/celebrateWithUsRow.html',
  'text!../templates/celebrateWithUsTemp.html',
  'text!../templates/celebrateWithUsFilterOptionTemp.html',
], function ($, _, Backbone, datepickerBT, moment, celebrateWithUsSingleView, declinedReasonView, approveCelebrationView, celebrateWithUsCollection, slugCollection, adminCollection, celebrateWithUsFilterOptionModel, appSettings, configureColumnsView, dynamicFormData, celebrateWithUsRowTemp, celebrateWithUsTemp, celebrateWithUsFilterTemp) {

  var celebrateWithUsView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    form_label: '',
    initialize: function (options) {
      var selfobj = this;
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      this.menuId = permission.menuID;
      readyState = true;
      this.totalRec = 0;
      this.toClose = "celebrateWithUsFilterView";
      this.roleOfUser = $.cookie('roleOfUser');
      this.arrangedColumnList = [];
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.render();
      filterOption = new celebrateWithUsFilterOptionModel();
      filterOption.set({ "menuId": this.menuId });
      filterOption.set({ company_id: DEFAULTCOMPANY });
      searchcelebrateWithUs = new celebrateWithUsCollection();
      this.pocList = new adminCollection();
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

      this.pocList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
      });

      this.collection = searchcelebrateWithUs;
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

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
      "change .txtchangefilter": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .chnageConfirmationStatus": "chnageConfirmationStatus",
      "click .showpage": "loadData",
      "change .chnageBox": "chnageBox",
      "click .genrateReport": "genrateReport",
      "keyup #searchText": "searchrecords",
      "click .arrangeColumns": "openColumnArrangeModal",
      "change .dropval": "singleFilterOptions",
    },
    updateOtherDetails: function (e) {
      console.log("i am here");
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
    searchrecords: function (e) {
      var value = $(e.currentTarget).val().toLowerCase();
      $(".dataRows").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
      $(".clearable-input>[data-clear-input]").click(function () {
        e.currentTarget.value = '';
        $(".dataRows").show();
      });
    },
    chnageBox: function (e) {
      var selVal = $(e.currentTarget).val();
      $(".hidetextval").hide();
      $(".clearText").val("");
      filterOption.set({ textval: '' });
      if (selVal == "createdDate") {
        $(".dateList").show();
      } else if (selVal == "confirmationDate") {
        $(".dateList").show();
      } else if (selVal == "contactNo") {
        $(".contacttxt").show();
      } else {
        $(".textvalBox").show();
        $("#textval").val("");
      }
    },

    singleFilterOptions: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
    },

    genrateReport: function (e) {
      var removeIds = [];
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-celWithUsID"));
        }
      });
      var idsToRemove = removeIds.toString();
      filterOption.set({ printID: idsToRemove });
      var report = $(e.currentTarget).attr("data-report");
      filterOption.set({ reportType: report });
      console.log("here");
      console.log(filterOption);
      $("#formData").val(JSON.stringify(filterOption.attributes));
      $("#report").submit();
      return;
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['task_id', 'subject', 'assignee', 'task_type', 'task_status', 'task_priority', 'due_date', 'category_id'];
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, viewMode: selfobj.View });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },


    chnageConfirmationStatus: function (e) {
      if (confirm("Are You Sure?")) {

        var selfobj = this;
        var celWithUsID = $(e.currentTarget).attr("data-celWithUsID");
        var status = $(e.currentTarget).attr("data-action");
        var action = "changeStatus";
        $.ajax({
          url: APIPATH + 'celeChangeConfirmStatus',
          method: 'POST',
          data: { status: status, celWithUsID: celWithUsID, action: action },
          datatype: 'JSON',
          beforeSend: function (request) {
            $(e.currentTarget).html("<span>Updating..</span>");
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F")
              alert(res.msg);
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {

              $(".checkall").prop("checked", false);
              $(".checkall").closest("div").removeClass("active");
              $('.action-icons-div').hide();

              selfobj.collection.fetch({
                headers: {
                  'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                }, error: selfobj.onErrorHandler
              }).done(function (res) {
                $(".checkall").attr("checked", false);

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                // alert("jj");
                $(".profile-loader").hide();
                $(e.currentTarget).html("<span>..</span>");

                selfobj.filterSearch();
              });
            }
            setTimeout(function () {
              $(e.currentTarget).html(status);
            }, 3000);

          }
        });
      }

    },

    changeStatusListElement: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('#clist input:checkbox').each(function () {
        if ($(this).is(":checked")) {
          removeIds.push($(this).attr("data-celebrate_id"));
        }
      });
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        alert("Please select at least one record.");
        return false;
      }
      $.ajax({
        url: APIPATH + 'celebrateWithUs/status',
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
          if (res.flag == "F")
            alert(res.msg);

          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {

            $(".checkall").prop("checked", false);
            $(".checkall").closest("div").removeClass("active");
            $('.action-icons-div').hide();

            selfobj.collection.fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler
            }).done(function (res) {
              $(".checkall").attr("checked", false);

              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.filterSearch();
            });
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 100);

        }
      });
    },

    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-show");
      switch (show) {
        case "singlecelebrateWithUsData": {
          var celebrate_id = $(e.currentTarget).attr("data-celebrate_id");
          new celebrateWithUsSingleView({  menuId: this.menuId,celebrate_id: celebrate_id, searchcelebrateWithUs: this });
          break;
        }
        case "declinedView": {
          $('#declineModal').modal('toggle');
          var celebrate_id = $(e.currentTarget).attr("data-celebrate_id");
          new declinedReasonView({ celebrate_id: celebrate_id, searchcelebrateWithUs: this });
          break;
        }
        case "approvedView": {
          $('#approveModal').modal('toggle');
          var celebrate_id = $(e.currentTarget).attr("data-celebrate_id");
          new approveCelebrationView({ celebrate_id: celebrate_id, searchcelebrateWithUs: this });
          break;
        }
      }
    },
    resetSearch: function () {
      let selfobj = this;
      filterOption.clear().set(filterOption.defaults);
      if (this.mname == "leads") {
        filterOption.set({ type: "lead" });
      } else if (this.mname == "customer") {
        filterOption.set({ type: "customer" });
      }
      filterOption.set({ company_id: DEFAULTCOMPANY });
      $(".multiOptionSel").removeClass("active");
      $(".filterClear").val("");
      $("#textSearch").val("select");
      $(".valChange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $(".form-line").removeClass("focused");
      $(".hidetextval").hide();
      $('#textSearch option[value=customer_id]').attr('selected', 'selected');
      this.filterSearch(false);
      filterOption.set({ "menuId": this.menuId });
      
      let filterOptionLi = document.getElementById('filterOption');
      let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
      if (taskBadgeSpan) {
        taskBadgeSpan.remove();
      }
      $(".down").removeClass("active");
      $(".up").removeClass("active");
      
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      let selfobj = this;
      selfobj.totalRec = selfobj.collection.length;
      if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
        $('#listView').show();
        $('.noDataFound').show();
        $("#filterOption").show();
      } else {
        $('#listView').show();
        $(".noCustRec").hide();
      }
      objectModel.set({ roleOfUser: this.roleOfUser })
      var template = _.template(celebrateWithUsRowTemp);
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
      if (objectModel.attributes.expDateOfEvent != "0000-00-00") {
        objectModel.attributes.expDateOfEvent = moment(objectModel.attributes.expDateOfEvent).format("DD/MM/YYYY");
      }
      if (objectModel.attributes.confirmationDate != "0000-00-00") {
        objectModel.attributes.confirmationDate = moment(objectModel.attributes.confirmationDate).format("DD/MM/YYYY");
      }
      $("#celebrateWithUsList").append(template({ celebrateWithUsDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
    },
    addAll: function () {
      $("#celebrateWithUsList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var selfobj = this;
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
        var source = celebrateWithUsFilterTemp;
        var template = _.template(source);
        var cont = $("<div>");
        const extractedFields = [];
        if (selfobj.metadata) {
          for (var rowKey in selfobj.metadata) {
            var row = selfobj.metadata[rowKey];
            for (var colKey in row) {
              var field = row[colKey];
              if (field.fieldID !== undefined) {
                extractedFields.push(field);
              }
            }
          }
        }

        selfobj.categories = new slugCollection();
        selfobj.categories.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'prefix,region,occasion' }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
        });

        extractedFields.forEach(function (column) {
          column.fieldOptions = column.fieldOptions;
        });
        const filteredFields = extractedFields.filter(item => item.fieldID != "" && item.fieldID != null && item.fieldID != undefined);
        selfobj.filteredFields = filteredFields;

        setTimeout(function () {
          var templateData = {
            filteredFields: selfobj.filteredFields || [],
            "categoryList": selfobj.categories.models,
            "adminList": selfobj.pocList.models || [],
            filterOptions: filterOption.attributes ,
          };
          cont.html(template(templateData));
          $(".ws-select").selectpicker();
          selfobj.setupFilter();
        }, 1000);

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
        /* 
          INFO
          make current campaigns active
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
    filterSearch: function () {

      // console.log(filterOption)
      $('#myModal').modal('hide');
      searchcelebrateWithUs.reset();
      var selfobj = this;
      readyState = true;
      console.log('filter getting called');
      filterOption.set({ curpage: 0, status: 'active,inactive' });
      filterOption.set({ menuId:this.menuId});
      var $element = $('#loadMember');

      $(".profile-loader").show();

      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      searchcelebrateWithUs.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();

        setPagging(res.paginginfo, res.loadstate, res.msg);
        selfobj.totalRec = res.paginginfo.totalRecords;
        if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
          $('#listView').show();
          $('.noDataFound').show();
          $("#filterOption").show();
        } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
          $('.noCustAdded').show();
        } else if (selfobj.totalRec > 0) {
          $('#listView').show();
          $("#filterOption").show();
        }
        $element.attr("data-currPage", 1);
        $element.attr("data-index", res.paginginfo.nextpage);

        if (res.loadtraineeSkill === false) {
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
        searchcelebrateWithUs.reset();
        var index = $element.attr("data-index");
        var currPage = $element.attr("data-currPage");

        filterOption.set({ curpage: index });
        var requestData = filterOption.attributes;

        $(".profile-loader").show();
        searchcelebrateWithUs.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {

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
    },
    render: function () {
      let selfobj = this;
      var template = _.template(celebrateWithUsTemp);
      this.$el.html(template({ roleOfUser: this.roleOfUser, totalRec: this.totalRec, formLabel: selfobj.form_label || '', "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, closeItem: this.toClose }));
      $(".main_container").append(this.$el);
      return this;
    }
  });

  return celebrateWithUsView;

});
