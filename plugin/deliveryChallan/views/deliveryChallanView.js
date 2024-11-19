
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'select2',
  'moment',
  '../views/deliveryChallanSingleView',
  '../views/deliveryReturnView',
  '../collections/deliveryChallanCollection',
  '../models/deliveryFilterOptionModel',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../core/views/appSettings',
  '../../core/views/mailView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../menu/models/singleMenuModel',
  '../../dynamicForm/collections/dynamicStdFieldsCollection',
  '../../category/collections/slugCollection',
  '../../core/views/timeselectOptions',
  'text!../templates/deliveryChallanRow.html',
  'text!../templates/deliveryChallan_temp.html',
  'text!../../customModule/templates/customFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
], function ($, _, Backbone, datepickerBT, select2, moment, deliveryChallanSingleView, deliveryReturnView, deliveryChallanCollection, deliveryFilterOptionModel, columnArrangeModalView, configureColumnsView, appSettings, mailView, dynamicFormData, singleMenuModel, dynamicStdFieldsCol, slugCollection, timeselectOptions, deliveryChallanRow, deliveryChallan_temp, customFilterTemp, linkedDropdown) {
  var deliveryChallanView = Backbone.View.extend({
    module_desc: '',
    plural_label: '',
    menuName: '',
    form_label: '',
    initialize: function (options) {
      this.startX = 0;
      this.startwidth = 0;
      this.$table = null;
      this.pressed = false;
      this.toClose = "taxInvoiceFilterView";
      var selfobj = this;
      selfobj.arrangedColumnList = [];
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.filteredFields = [];
      selfobj.filteredData = [];
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      this.menuName = mname;
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.menuList = new singleMenuModel();
      this.timeselectOptions = new timeselectOptions();
      this.dynamicStdFieldsList = new dynamicStdFieldsCol();
      // Pass a callback to handle the result of getMenuList
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
        // selfobj.getMenuList();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
        if (selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined) {
          selfobj.dynamicStdFieldsList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded',
              'SadminID': $.cookie('authid'),
              'token': $.cookie('_bb_key'),
              'Accept': 'application/json'
            },
            error: selfobj.onErrorHandler,
            type: 'post',
            data: { "table": "ab_" + selfobj.tableName }
          }).done(function (res) {
            if (res.flag == "F") showResponse('',res,'');
            selfobj.dynamicStdFieldsList = selfobj.dynamicStdFieldsList.filter(model => {
              const field = model.attributes.Field;
              return !selfobj.filteredData.includes(field);
            });
          });
        }
      });
      filterOption = new deliveryFilterOptionModel();
      if (this.menuName == "receipt") {
        filterOption.set({ record_type: "receipt" });
      } else if (this.menuName == "delivery") {
        filterOption.set({ record_type: "delivery" });
      } else if (this.menuName == "qoutation") {
        filterOption.set({ record_type: "qoutation" });
      }
      // var company_id = $.cookie('company_id');
      filterOption.set({ "company_id": $.cookie('company_id') });
      filterOption.set({ "menuId": this.menuId });
      filterOption.set({ "getAll": 'Y' });
      this.collection = new deliveryChallanCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      this.render();
    },

    getMenuList: function (e) {
      var selfobj = this;
      selfobj.menuList.set({ "menuID": this.menuId });
      this.menuList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded',
          'SadminID': $.cookie('authid'),
          'token': $.cookie('_bb_key'),
          'Accept': 'application/json'
        },
        error: selfobj.onErrorHandler
      }).done(function (result) {
        if (result.statusCode == 994) {
          app_router.navigate("logout", { trigger: true });
        }
        $(".popupLoader").hide();
        if (result.data[0] != undefined) {
          selfobj.tableName = result.data[0].table_name;
        }
        if (selfobj.dynamicStdFieldsList && selfobj.dynamicStdFieldsList != undefined) {
          selfobj.dynamicStdFieldsList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded',
              'SadminID': $.cookie('authid'),
              'token': $.cookie('_bb_key'),
              'Accept': 'application/json'
            },
            error: selfobj.onErrorHandler,
            type: 'post',
            data: { "table": "ab_" + selfobj.tableName }
          }).done(function (res) {
            if (res.flag == "F") showResponse('',res,'');
            selfobj.dynamicStdFieldsList = selfobj.dynamicStdFieldsList.filter(model => {
              const field = model.attributes.Field;
              return !selfobj.filteredData.includes(field);
            });
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
          });
        }
      });
    },

    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "change #filterCName": "updateOtherDetails",
      "click #filterSearch": "filterSearch",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .showpage": "loadData",
      "click .cancelInvoice": "cancelInvoice",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .invoiceStatus": "invoiceStatusChange",
      "click .deleteAll": "deleteInvoices",
      "change .dropval": "singleFilterOptions",
      'mousedown .table-resizable .resize-bar': 'onMouseDown',
      'mousemove .table-resizable th, .table-resizable td': 'onMouseMove',
      'mouseup .table-resizable th, .table-resizable td': 'onMouseUp',
      'dblclick .table-resizable thead': 'resetColumnWidth'
    },


    onMouseDown: function (event) {
      let index = $(event.target).parent().index();
      this.$handle = this.$el.find('th').eq(index);
      this.pressed = true;
      this.startX = event.pageX;
      this.startWidth = this.$handle.width();
      this.$table = this.$handle.closest('.table-resizable').addClass('resizing');
    },

    onMouseMove: function (event) {
      if (this.pressed) {
        this.$handle.width(this.startWidth + (event.pageX - this.startX));
      }
    },

    onMouseUp: function () {
      if (this.pressed) {
        this.$table.removeClass('resizing');
        this.pressed = false;
      }
    },

    resetColumnWidth: function () {
      // Reset column sizes on double click
      this.$el.find('th').css('width', '');
    },


    singleFilterOptions: function (e) {
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      filterOption.set(newdetails);
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
    invoiceStatusChange: function (e) {
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      removeIds.push($(e.currentTarget).attr("data-id"));
      $(".action-icons-div").hide();
      var idsToRemove = removeIds.toString();

      $.ajax({
        url: APIPATH + 'deliveryChallan/status',
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
          if (res.flag == "F")
            showResponse(e,res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);
        }
      });
    },
    deleteInvoices: function (e) {
      var selfobj = this;
      var removeIds = [];

      var action = "delete";
      $('.invoice-table input:checkbox').each(function () {
        if ($(this).is(":checked") && $(this).attr('data-status') == 'draft') {
          removeIds.push($(this).attr("data-id"));
          console.log($(this).attr("data-id"));
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

      console.log(removeIds);
      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        $('.checkall').prop('checked', false)

        return false;
      }
      $.ajax({
        url: APIPATH + 'deleteChallan',
        method: 'POST',
        data: { list: idsToRemove, action: action },
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
            selfobj.filterSearch();
            $('.checkall').prop('checked', false);
            $('.deleteAll').hide();
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
    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singletaxInvoiceData": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          var deliveryChallanSingleVie = new deliveryChallanSingleView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
          break;
        }
        case "returnDeliveryData": {
          var invoiceID = $(e.currentTarget).attr("data-invoiceID");
          var deliveryChallanSingleVie = new deliveryReturnView({ invoiceID: invoiceID, searchtaxInvoice: this, menuId: selfobj.menuId, form_label: selfobj.form_label, menuName: this.menuName });
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
      $("#textSearch").val("select");
      $(".filterClear").val("");
      $(".valChange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $(".form-line").removeClass("focused");
      $('#textSearch option[value=invoiceID]').attr('selected', 'selected');
      this.filterSearch(false);
      let filterOptionLi = document.getElementById('filterOption');
      let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
      if (taskBadgeSpan) {
        taskBadgeSpan.remove();
      }
    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      var template = _.template(deliveryChallanRow);
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
      $("#taxInvoiceList").append(template({ taxInvoiceDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
    },
    addAll: function () {
      $("#taxInvoiceList").empty();
      this.collection.forEach(this.addOne, this);
    },
    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      var selfobj = this;
      if (!isexits) {
        var source = customFilterTemp;
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
        const filteredFields = extractedFields.filter(item => item != "");
        selfobj.filteredFields = filteredFields;

        selfobj.filteredFields.forEach(function (column) {
          // if (column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined' && column.parentCategory != 'undefined' && column.parentCategory != "" && column.parentCategory != null) {
          //   selfobj.categoryList = new slugCollection();
          //   var matcchedID = [];
          //   selfobj.categoryList.fetch({
          //     headers: {
          //       'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          //     }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory }
          //   }).done(function (res) {
          //     if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          //     $(".popupLoader").hide();
          //     if (res.data[0]) {
          //       for (var i = 0; i < res.data[0].sublist.length; i++) {
          //         matcchedID.push(res.data[0].sublist[i].categoryName);
          //       }
          //       column.fieldOptions = matcchedID.join(',');
          //     }
          //   });
          // } else {
            column.fieldOptions = column.fieldOptions;
          // }
        });

        const resDataFieldNames = selfobj.filteredFields.map(item => item.column_name);
        var filteredDatas = selfobj.dynamicStdFieldsList.filter(fieldName => !resDataFieldNames.includes(fieldName.attributes.Field));
        var Numeric = ["TINYINT", "SMALLINT", "MEDIUMINT", "INT", "BIGINT", "DECIMAL", "FLOAT", "DOUBLE", "REAL", "BIT", "BOOLEAN", "SERIAL"];
        var Text = ["CHAR", "VARCHAR", "TEXT", "TINYTEXT", "MEDIUMTEXT", "LONGTEXT", "BINARY", "VARBINARY", "BLOB", "TINYBLOB", "MEDIUMBLOB", "LONGBLOB"];
        var Datepicker = ["DATE", "DATETIME", "TIMESTAMP", "YEAR"];
        Numeric = Numeric.map(function (element) {
          return element.toLowerCase();
        });
        Text = Text.map(function (element) {
          return element.toLowerCase();
        });
        Datepicker = Datepicker.map(function (element) {
          return element.toLowerCase();
        });

        filteredDatas.forEach(function (data) {
          if (!selfobj.filteredFields.some(field => field.column_name === data.attributes.Field)) {
            const fieldType = data.attributes.Type;
            const startIndex = fieldType.indexOf("(");
            if (startIndex !== -1 && fieldType.startsWith("enum")) {
              const endIndex = fieldType.indexOf(")");
              const extractedValues = fieldType.substring(startIndex + 1, endIndex);
              var enumValues = extractedValues.split(',').map(value => value.trim()).join(',');
              var fieldOptions = enumValues.replace(/'/g, '');
            }
            const extractedType = startIndex !== -1 ? fieldType.substring(0, startIndex) : fieldType;
            if (extractedType == 'varchar' || Text.includes(data.attributes.Type)) {
              data.attributes.Type = 'Text';
            } else if (extractedType == 'enum' || data.attributes.Type == 'set') {
              data.attributes.Type = 'Dropdown';
            } else if (extractedType == 'int' || extractedType == 'int unsigned' || Numeric.includes(data.attributes.Type)) {
              data.attributes.Type = 'Numeric';
            } else if (Datepicker.includes(data.attributes.Type)) {
              data.attributes.Type = 'Datepicker';
            } else {
              data.attributes.Type = data.attributes.Type;
            }
            const newField = {
              fieldType: data.attributes.Type,
              fieldLabel: formatFieldLabel(data.attributes.Field),
              column_name: data.attributes.Field,
              fieldOptions: fieldOptions,
            };

            function formatFieldLabel(label) {
              return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
            }
            selfobj.filteredFields.push(newField);
          }
        });

        selfobj.filteredFields = selfobj.filteredFields.filter(item => item.column_name !== 'created_by' && item.column_name !== 'modified_by');
        // setTimeout(function () {
        var templateData = {
          filteredFields: selfobj.filteredFields || [],
        };
        cont.html(template(templateData));
        cont.attr('id', this.toClose);
        $(".overlay-main-container").removeClass("open");
        $(".ws_filterOptions").append(cont);
        $(".ws_filterOptions").addClass("open");
        $(".ws-select").selectpicker();
        $(e.currentTarget).addClass("active");
        //   selfobj.setValues();
        //   selfobj.setupFilter();
        // },1500);
      } else {
        var isOpen = $(".ws_filterOptions").hasClass("open");
        if (isOpen) {
          $(".ws_filterOptions").removeClass("open");
          $(e.currentTarget).removeClass("active");
          return;
        } else {
          $(e.currentTarget).addClass("active");
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
    filterSearch: function (isClose = false) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      filterOption.set({ curpage: 0 });
      filterOption.set({ menuId: this.menuId });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      var specificFilters = [];
      selfobj.filteredFields.forEach(function (column) {
        if (column.fieldType == 'Datepicker') {
          specificFilters.push(column.column_name + '-startDate');
          specificFilters.push(column.column_name + '-endDate');
        } else if (column.fieldType == 'Timepicker') {
          specificFilters.push(column.column_name + '-startTime');
          specificFilters.push(column.column_name + '-endTime');
        } else if (column.fieldType == 'Numeric') {
          specificFilters.push(column.column_name + '-startNo');
          specificFilters.push(column.column_name + '-endNo');
        } else if (column.fieldType == 'Range') {
          specificFilters.push(column.column_name + '-startRange');
          specificFilters.push(column.column_name + '-endRange');
        } else {
          specificFilters.push(column.column_name);
        }
      });

      specificFilters = [...new Set(specificFilters)];
      specificFilters.push("textval");
      appliedFilterCount = 0;
      for (var i = 0; i < specificFilters.length; i++) {
        var filterKey = specificFilters[i];
        if (filterOption.attributes[filterKey] != null && filterOption.attributes[filterKey] != "" && filterOption.attributes[filterKey] != undefined) {
          appliedFilterCount++;
        }
      }

      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
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

      if (appliedFilterCount > 0) {
        document.getElementById('filterOption').classList.add('active');
      } else {
        document.getElementById('filterOption').classList.remove('active');
      }

      let filterOptionLi = document.getElementById('filterOption');
      let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
      if (taskBadgeSpan) {
        taskBadgeSpan.remove();
      }
      if (appliedFilterCount != 0) {
        let url = "<span class='badge bg-pink taskBadge'>" + appliedFilterCount + "</span>"
        document.getElementById('filterOption').innerHTML += url;
      }
    },

    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");
      var index = $element.attr("data-index");
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
          if (res.flag == "F") showResponse('',res,'');
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
        });
      }
    },
    cancelInvoice: function (e) {
      var selfobj = this;
      e.preventDefault();
      var invoiceID = $(e.currentTarget).attr("data-invoiceID");
      $.ajax({
        url: APIPATH + 'cancelChallan/' + invoiceID,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "S") {
            selfobj.filterSearch();
          } else {
            showResponse(e,res,'');
          }
        }
      });
    },

    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = [];
      // var stdColumn = ['invoiceNumber', 'customerName', 'invoiceTotal', 'grossAmount', 'created_date'];
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
    },

    setupFilter: function () {
      var selfobj = this;
      if (selfobj.filteredFields) {
        selfobj.filteredFields.forEach(function (column) {
          $('#' + column.column_name + '-startDate').datepickerBT({
            format: "dd-mm-yyyy",
            todayBtn: "linked",
            clearBtn: true,
            todayHighlight: true,
            StartDate: new Date(),
            numberOfMonths: 1,
            autoclose: true,
          }).on('changeDate', function (ev) {
            $('#' + column.column_name + '-startDate').change();
            var valuetxt = $('#' + column.column_name + '-startDate').val();
            var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
            var valuetxt = $('#' + column.column_name + '-endDate').val();
            var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
            if (temp > temp2) {
              $('#' + column.column_name + '-endDate').val("");
            }
            var valuetxt = $(this).val();
            var toID = $(this).attr("id");
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            filterOption.set(newdetails);
          });

          $('#' + column.column_name + '-endDate').datepickerBT({
            format: "dd-mm-yyyy",
            todayBtn: "linked",
            clearBtn: true,
            todayHighlight: true,
            numberOfMonths: 1,
            autoclose: true,
          }).on('changeDate', function (ev) {
            $('#' + column.column_name + '-endDate').change();
            var valuetxt = $('#' + column.column_name + '-endDate').val();
            var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
            var valuetxt = $('#' + column.column_name + '-startDate').val();
            var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
            if (temp < temp2) {
              $('#' + column.column_name + '-startDate').val("");
            }
            var valuetxt = $(this).val();
            var toID = $(this).attr("id");
            var newdetails = [];
            newdetails["" + toID] = valuetxt;
            filterOption.set(newdetails);
          });

          $('#' + column.column_name + '-startTime').timepicker({
            timeFormat: 'h:mm p',
            interval: 15,
            startTime: '00:00',
            dynamic: false,
            dropdown: true,
            scrollbar: true,
            change: function (time) {
              $('#' + column.column_name + '-startTime').change();
              var valuetxt = $('#' + column.column_name + '-startTime').val();
              var temp = moment(valuetxt, 'h:mm p').valueOf();
              var valuetxt = $('#' + column.column_name + '-endTime').val();
              var temp2 = moment(valuetxt, 'h:mm p').valueOf();
              if (temp > temp2) {
                $('#' + column.column_name + '-endTime').val("");
              }
              var valuetxt = $(this).val();
              var toID = $(this).attr("id");
              var newdetails = [];
              newdetails["" + toID] = valuetxt;
              filterOption.set(newdetails);
            }
          });
          $('#' + column.column_name + '-endTime').timepicker({
            timeFormat: 'h:mm p',
            interval: 15,
            startTime: '00:00',
            dynamic: false,
            dropdown: true,
            scrollbar: true,
            change: function (time) {
              $('#' + column.column_name + '-endTime').change();
              var valuetxt = $('#' + column.column_name + '-endTime').val();
              var temp = moment(valuetxt, 'h:mm p').valueOf();
              var valuetxt = $('#' + column.column_name + '-startTime').val();
              var temp2 = moment(valuetxt, 'h:mm p').valueOf();
              if (temp < temp2) {
                $('#' + column.column_name + '-startTime').val("");
              }

              var valuetxt = $(this).val();
              var toID = $(this).attr("id");
              var newdetails = [];
              newdetails["" + toID] = valuetxt;
              filterOption.set(newdetails);
            }
          });

          $('#' + column.column_name + '-startNo').on('change', function (e) {
            var temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
            var temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-endNo').val("");
            }
          });
          $('#' + column.column_name + '-endNo').on('change', function (e) {
            var temp = parseInt($('#' + column.column_name + '-startNo').val(), 10);
            var temp2 = parseInt($('#' + column.column_name + '-endNo').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-startNo').val("");
            }
          });
          $('#' + column.column_name + '-startRange').on('change', function (e) {
            var temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
            var temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-endRange').val("");
            }
          });
          $('#' + column.column_name + '-endRange').on('change', function (e) {
            var temp = parseInt($('#' + column.column_name + '-startRange').val(), 10);
            var temp2 = parseInt($('#' + column.column_name + '-endRange').val(), 10);
            if (temp > temp2) {
              $('#' + column.column_name + '-startRange').val("");
            }
          });

          var linkedClassElement = $("body").find('.dropLinked_' + column.fieldID);
          if (column.fieldType == 'Dropdown' && column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined') {
            if (column.fieldOptions != undefined) {
              var selectOptions = column.fieldOptions.split(",");
              var template = _.template(linkedDropdown);
              var existingElement = linkedClassElement.find('#field_' + column.fieldID);
              if (existingElement.length == 0) {
                linkedClassElement.append(template({ elementDetails: column, selectOptions: selectOptions, elementData: filterOption.attributes }));
              }
            }
          }
        });

        $('.valChange').unbind();

        $('body').on('input', '.valChange', function (e) {
          let inputText = $(e.currentTarget).val();
          let lastCommaIndex = inputText.lastIndexOf('');
          let name = (lastCommaIndex !== -1) ? inputText.substring(lastCommaIndex + 1).trim() : inputText.trim();
          let pluginID = $(e.currentTarget).attr("data-plugIn");
          let where = $(e.currentTarget).attr("name");
          let fieldID = $(e.currentTarget).attr("data-fieldID");
          let selection = $(e.currentTarget).attr("data-selection");
          let dropdownContainer = $("#field_" + fieldID);
          let fieldOpt = $(e.currentTarget).attr("data-fieldOpt");
          let selectedIDS = [];

          $.ajax({
            url: APIPATH + 'dynamicgetList/',
            method: 'POST',
            data: { text: name, pluginID: pluginID, wherec: fieldOpt, fieldID: fieldID },
            datatype: 'JSON',
            beforeSend: function (request) {
              $(".textLoader").show();
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              $(".textLoader").hide();
              dropdownContainer.empty();
              if (res.msg === "sucess" && res.data.length > 0) {
                let pk = res.lookup.pKey;
                let selectedValues = $(e.currentTarget).val().split(',');
                $.each(res.data, function (index, value) {
                  var toSearch = [];
                  $.each(value, function (value1) {
                    if (pk != value1) {
                      toSearch.push(value["" + value1]);
                    }
                  });
                  var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectField';
                  let isSelected = toSearch.some(searchValue => selectedValues.includes(searchValue));
                  if (isSelected) {
                    selectedIDS.push(value["" + pk]);
                  }
                  dropdownContainer.append('<div class="dropdown-item ' + dropdownClass + (isSelected ? ' selected' : '') + '" style="background-color: #ffffff;" data-fieldID="' + fieldID + '" data-cname="' + where + '" data-value="' + value["" + pk] + '">' + toSearch.join("  ") + '</div>');
                });
                dropdownContainer.show();
              }

              let newdetails = {};
              let selectedIDSString = selectedIDS.join(',');
              newdetails[where] = selectedIDSString;
              filterOption.set(newdetails);
            }
          });
        });

        $('body').on('click', '.selectField', function (e) {
          let Name = $(e.currentTarget).text();
          let cname = $(e.currentTarget).attr('data-cname');
          let value = $(e.currentTarget).attr('data-value');
          let fieldID = $(e.currentTarget).attr("data-fieldID");
          $(e.currentTarget).text(Name);
          $("#field_" + fieldID).hide();
          $('.valChange[data-fieldID="' + fieldID + '"]').val(Name);
          let newdetails = [];
          newdetails["" + cname] = value;
          filterOption.set(newdetails);
        });

        $('body').on('click', '.multiSelectField', function (e) {
          let name = $(e.currentTarget).text();
          if ($(e.currentTarget).hasClass("selected")) {
            $(e.currentTarget).removeClass("selected");
          } else {
            $(e.currentTarget).addClass("selected");
          }
          let cname = $(e.currentTarget).attr('data-cname');
          let value = $(e.currentTarget).attr('data-value');
          let fieldID = $(e.currentTarget).attr("data-fieldID");
          let selectedOptions = [];
          let selectedIDS = [];

          $('.multiSelectField.selected').each(function () {
            selectedIDS.push($(this).attr('data-value'));
            selectedOptions.push($(this).text());
          });

          let selectedOptionsString = selectedOptions.join(',');
          let selectedIDSString = selectedIDS.join(',');
          $('.valChange[data-fieldID="' + fieldID + '"]').val(selectedOptionsString);
          let newdetails = {};
          newdetails[cname] = selectedIDSString;
          filterOption.set(newdetails);
        });

      }
    },

    render: function () {
      var selfobj = this;
      var template = _.template(deliveryChallan_temp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList }));
      $(".ws-select").selectpicker();
      $(".main_container").append(this.$el);
      return this;
    }
  });

  return deliveryChallanView;

});
