
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'Swal',
  'moment',
  '../views/dynamicFormsSingleView',
  '../collections/dynamicFormsCollection',
  '../models/dynamicFormsFilterOptionModel',
  '../../core/views/appSettings',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/timeselectOptions',
  '../../core/views/listSliderView',
  'text!../templates/dynamicFormsRow.html',
  'text!../templates/dynamicForms_temp.html',
  'text!../templates/dynamicFormsFilterOption_temp.html',
], function ($, _, Backbone, datepickerBT, Swal,moment, dynamicFromSingleView, dynamicFormsCollection, dynamicFormsFilterOptionModel,appSettings,moduleDefaultSettings,configureColumnsView,dynamicFormData,timeselectOptions,listSliderView,dynamicFormsRow, dynamicFormTemp, dynamicFormFilterTemp) {

  var dynamicFormsView = Backbone.View.extend({
    
    module_desc:'',
    plural_label:'',
    form_label:'',
    initialize: function (options) {
      var selfobj = this;
      this.filteredSearch = false;
      this.totalRec = 0; 
      this.tableStructure = {},
      this.View = "traditionalList";
      this.arrangedColumnList = [];
      this.toClose = "dynamicFormsFilterView";
      $(".profile-loader").show();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      this.menuId = permission.menuID;
      this.moduleDefaultSettings = new moduleDefaultSettings();
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.appSettings.getMenuList(this.menuId, function(plural_label,module_desc,form_label,result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.getColumnData();
      });

      filterOption = new dynamicFormsFilterOptionModel();
      this.collection = new dynamicFormsCollection();
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
        }, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        setPagging(res.paginginfo, res.loadstate, res.msg);
        $(".profile-loader").hide();
      });
      selfobj.render();
    },

    events:
    {
      "blur #textval": "setFreeText",
      "change .range": "setRange",
      "change #textSearch": "settextSearch",
      "click .multiOptionSel": "multioption",
      "click #filterSearch": "filteredSearches",
      "click #filterOption": "filterRender",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .sortColumns": "sortColumn",
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
      filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
          action: APIPATH + "formsReports",
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
      filterOption.clear('type');
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

            $('#clist input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-form_id"));
              }
            });
            $(".deleteAll").hide();

            $(".action-icons-div").hide();
            $(".listCheckbox").click(function () {
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
              url: APIPATH + 'dynamicForms/status',
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
                setTimeout(function () {
                  $(e.currentTarget).html(status);
                }, 3000);

              }
            });
          } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
            $('#clist input:checkbox').each(function () {
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

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    loadSubView: function (e) {
      var selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "singleformData": {
          var form_id = $(e.currentTarget).attr("data-form_id");
          if(form_id != "" && form_id != null && form_id != undefined ){
            if (permission.edit != "yes") {
            Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            }else{
               new dynamicFromSingleView({ form_id: form_id, searchform: this,form_label:selfobj.form_label });
            }
          }else{
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            }else{
               new dynamicFromSingleView({ form_id: form_id, searchform: this,form_label:selfobj.form_label });
            }
          }
          break;
        }
      }
    },

    resetSearch: function () {
      filterOption.set({ curpage: 0, form_id: null, textval: null, textSearch: 'form_id', status: 'active', orderBy: 'form_name', order: 'ASC' });
      $(".multiOptionSel").removeClass("active");
      $("#textval").val("");
      $("#textSearch").val("select");
      $(".filterClear").val("");
      $(".valChange").val("");
      $(".ws-select").val('default');
      $(".ws-select").selectpicker("refresh");
      $(".form-line").removeClass("focused");
      $('#textSearch option[value=form_id]').attr('selected', 'selected');
      this.filterSearch();
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
      var template = _.template(dynamicFormsRow);
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
      $("#formList").append(template({ formDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
    },

    addAll: function () {
      $("#formList").empty();
      this.collection.forEach(this.addOne, this);
    },

    filterRender: function (e) {
      var isexits = checkisoverlay(this.toClose);
      if (!isexits) {
        var source = dynamicFormFilterTemp;
        var template = _.template(source);
        var cont = $("<div>");
        cont.html(template({}));
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
          make current receipt active
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
      filterOption.set({ curpage: 0 });
   
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);

      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
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

        selfobj.setValues();
        selfobj.setTableWidth(false);
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

          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.setTableWidth(false);
        });
      }
    },

    defaultViewSet:function(){
      var selfobj = this;
      $("#listView").hide();
      $(".noCustAdded").hide();
      $("#filterOption").hide();
      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
          for (const rowKey in selfobj.userSettings) {
            if(rowKey == selfobj.menuId){
              const displayView = selfobj.userSettings[rowKey].displayView;
              const tableStructure = selfobj.userSettings[rowKey].tableStructure;
              if(tableStructure){
                selfobj.tableStructure = tableStructure;
              }else{
                selfobj.tableStructure = {};
              }
              if(displayView){
                if(selfobj.collection.length == 0){
                  $(".noCustAdded").show();
                }else{
                  $("#listView").show();
                  $("#filterOption").show();
                }
                selfobj.View = "traditionalList";
              }
              if (tableStructure && tableStructure != {} && Object.entries(tableStructure).length > 0) {
                for (const property in tableStructure) {
                    if (tableStructure.hasOwnProperty(property)) {
                      let columns;
                      if(property == 0){
                        const entry = tableStructure[property];
                        if (entry.hasOwnProperty('clist')) {
                            columns = entry['clist'];
                        }
                      }else{
                          columns = tableStructure['clist'];
                      }
                      
                        if (columns) {
                            for (const columnName in columns) {
                                if (columns.hasOwnProperty(columnName)) {
                                  var tableId = '#clist';
                                }
                            }
                            // Adjust column widths
                            selfobj.arrangedColumnList.forEach((column) => {
                              if (columns.hasOwnProperty(column.column_name)) {
                                var value = columns[column.column_name];
                                if (value == null || value == "" || value == undefined) {
                                  value = 190;
                                } else {
                                  value = columns[column.column_name];
                                }
                              } else {
                                var value = 190;
                              }
                                const thElement = document.querySelector(`${tableId} th[data-column="${column.column_name}"]`);
                                if (thElement) {
                                  thElement.style.minWidth = column.column_name.length * 8 + 'px';
                                  if(parseFloat(thElement.style.minWidth) < 80){
                                    thElement.style.minWidth = 80 + 'px';
                                  }else{
                                    thElement.style.minWidth = thElement.style.minWidth;
                                  }
                                  if(value < (column.column_name.length * 8)){
                                    thElement.style.width = column.column_name.length * 8 + 'px';
                                  }else{
                                    thElement.style.width = value + 'px';
                                  }
                                }
                            });
                            const unarrangedColumns = Object.keys(columns).filter(column => !selfobj.arrangedColumnList.some(arrangedColumn => arrangedColumn.column_name === column));
                            unarrangedColumns.forEach((column) => {
                              if(column != 'tableWidth'){
                                if (columns.hasOwnProperty(column)) {
                                  let value = columns[column];
                                  if (value == null || value == "" || value == undefined) {
                                    value = 190;
                                  } else {
                                    value = columns[column];
                                  }
                                  const thElement = document.querySelector(`${tableId} th[data-column="${column}"]`);
                                  if (thElement) {
                                    if(column == 'check-gap'){
                                      thElement.style.minWidth = 50 + "px";
                                      thElement.style.width = value + 'px';
                                    }else if(column == 'action'){
                                      thElement.style.minWidth = 90 + "px";
                                      thElement.style.width = value + 'px';
                                    }else{
                                      thElement.style.minWidth = column.length * 8 + 'px';
                                      if(parseFloat(thElement.style.minWidth) < 80){
                                        thElement.style.minWidth = 80;
                                      }else{
                                        thElement.style.minWidth = thElement.style.minWidth;
                                      }
                                      if(value < (column.length * 8)){
                                        thElement.style.width = column.length * 8 + 'px';
                                      }else{
                                        thElement.style.width = value + 'px';
                                      }
                                    }
                                  }
                                }
                              }
                            });                            
                        }else{
                          if(displayView != 'grid'){
                            selfobj.setColumnWidth('clist');
                          }
                        }
                    }
                }
              }else{
                if(displayView != 'grid'){
                  selfobj.setColumnWidth('clist');
                }
              }
              selfobj.defaultTableSet('#clist','clist');
              selfobj.setTableWidth(false);
            }
          }
      } else {
            if(selfobj.collection.length == 0){
              $(".noCustAdded").show();
            }else{
              $("#listView").show();
              $("#filterOption").show();
            }
            selfobj.View = "traditionalList";
            selfobj.setColumnWidth('clist');
            selfobj.defaultTableSet('#clist','clist');
            selfobj.setTableWidth(false);
      }
      if(selfobj.arrangedColumnList.length > 0){
        var sectionID = 'listView';
        new listSliderView({sectionID : sectionID});
      }
    },

    setColumnWidth:function(tableID){
      var minWidth;
      var width;
      $('#'+tableID + ' ' + '.column-title').each(function(index) {
        if (index !== $('#'+tableID + ' ' + '.column-title').length) {
          var fieldLabel = $(this).attr('data-column');
          if (fieldLabel !== 'action' && fieldLabel !== 'check-gap' && fieldLabel !== '') {
            var fieldLabelLength = fieldLabel.length;

            minWidth = fieldLabelLength * 8;
            if(minWidth < 80){
              minWidth = 80
            }else{
              minWidth = minWidth;
            }
            width = 190 ;
          } else if(fieldLabel == 'action') {
            minWidth = 90;
            width = 90;
          } else if (fieldLabel == 'check-gap') {
            minWidth = 50;
            width = 50;
          }
          $(this).css('min-width', minWidth + 'px');
          if(width < minWidth){
            $(this).css('width', minWidth + 'px');
          }else{
            $(this).css('width', width + 'px');
          }
        }
      });  
    },

    defaultTableSet:function(tableId,tableID){
      var totalWidth = 0;
      var tableElement = document.querySelector(tableId);
      var tableElement1 = document.getElementById(tableID);
      if(tableElement1){
        var thElements = tableElement1.querySelectorAll('thead th.column-title');
        thElements.forEach(function(th) {
            var thWidthString = th.style.width;
            var thWidth = parseFloat(thWidthString); 
            totalWidth += thWidth;
        });
      }
      if (tableElement) {
          tableElement.style.width = totalWidth + 'px'; 
      } else {
          console.log(`Element with selector ${tableId} not found.`);
      }
    },

    setTableWidth:function(resize = false){
      var selfobj = this;
      var tableElement = document.getElementById('clist');
      if(tableElement){
        var customTableClassElements = tableElement.closest('.customTableClass');
        var thElements1 = tableElement.querySelectorAll('thead th.column-title');
        var totalWidth1 = 0;
        thElements1.forEach(function(th) {
            var thWidthString1 = th.style.width;
            var thWidth1 = parseFloat(thWidthString1); 
            totalWidth1 += thWidth1;
        });
        if (customTableClassElements) {
          var customTableElement = customTableClassElements;
            if(customTableElement.offsetWidth > totalWidth1){
              if(resize == true){
                var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
                let existingDynamicTd = tableElement.querySelector('.dynamicThead');
                if (existingDynamicTd) {
                  existingDynamicTd.style.width = differenceWidth + 'px';
                }
              }else{
                var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
                // var differenceWidth = customTableElement.offsetWidth - tableElement.offsetWidth;
              }
              if(differenceWidth > 5){
                // Append <th> if it doesn't exist
                if (!tableElement.querySelector('.dynamicThead')) {
                  var newTh = document.createElement('th');
                  newTh.style.width = differenceWidth + 'px';
                  newTh.textContent = '';
                  newTh.classList.add('dynamicThead');
                  var headingsRow = tableElement.querySelector('.headings');
                  headingsRow.appendChild(newTh);
                }
    
                // Append <td> in each <tr> if it doesn't exist
                var rows = tableElement.querySelectorAll('.even.pointer');
                rows.forEach(function(row) {
                    if (!row.querySelector('.dynamicTD')) {
                        var newTd = document.createElement('td');
                        newTd.style.width = differenceWidth + 'px';
                        newTd.textContent = '';
                        newTd.classList.add('dynamicTD');
                        row.appendChild(newTd);
                    }
                });
              // }
              }else{
                var existingDynamicTh = tableElement.querySelector('.dynamicThead');
                if (existingDynamicTh) {
                    existingDynamicTh.parentNode.removeChild(existingDynamicTh);
                }
                var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
                existingDynamicTd.forEach(function(td) {
                  td.parentNode.removeChild(td);
                });
              }
            }else{
              var existingDynamicTh = tableElement.querySelector('.dynamicThead');
              if (existingDynamicTh) {
                  existingDynamicTh.parentNode.removeChild(existingDynamicTh);
              }
              var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
              existingDynamicTd.forEach(function(td) {
                td.parentNode.removeChild(td);
              });
            }
        } else {
            console.log('No element found with class "customTableClass".');
        }
      }
    },

    columnsResizeFunction: function() {
      var selfobj = this;
      var tables = document.getElementsByClassName('resizable');
      for (var i = 0; i < tables.length; i++) {
          resizableGrid(tables[i]);
      }
  
      function resizableGrid(table) {
        var row = table.getElementsByTagName('tr')[0],
            cols = row ? row.children : undefined;
        if (!cols) return;
        var tableHeight = table.offsetHeight;
        for (var i = 0; i < cols.length; i++) {
            var div = createDiv(tableHeight);
            cols[i].appendChild(div);
            cols[i].style.position = 'relative';
            setListeners(div, cols[i]);
        }
    
        function setListeners(div, col) {
            var pageX, curCol, curColWidth, closestTable, tableName, tableWidth, tableElement, withoutPX;
    
            div.addEventListener('mousedown', onMouseDown);
            div.addEventListener('mouseover', onMouseOver);
            div.addEventListener('mouseout', onMouseOut);
    
            function onMouseDown(e) {
                closestTable = e.target.closest('table');
                if (closestTable) {
                    tableName = closestTable.getAttribute('id');
                    tableElement = document.getElementById(tableName);
                    tableWidth = parseFloat(tableElement.style.width);
                    curCol = col;
                    pageX = e.pageX;
                    var padding = paddingDiff(curCol);
                    curColWidth = curCol.offsetWidth - padding;
    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                }
            }
    
            function onMouseOver(e) {
                e.target.style.borderRight = '2px solid #84888c';
            }
    
            function onMouseOut(e) {
                e.target.style.borderRight = '';
            }
    
            function onMouseMove(e) {
                if (curCol) {
                    var diffX = e.pageX - pageX;
                    let minW = parseFloat(window.getComputedStyle(curCol).getPropertyValue("min-width"));
                    if (minW < (curColWidth + diffX)) {
                        curCol.style.width = (curColWidth + diffX) + 'px';
                        withoutPX = tableWidth + diffX;
                        tableElement.style.width = (tableWidth + diffX) + "px";
                    }
                }
            }
    
            function onMouseUp(e) {
                curCol = undefined;
                pageX = undefined;
                curColWidth = undefined;
                if (tableName) {
                    $('#' + tableName + ' thead th').each(function() {
                        var datacolumn = $(this).attr('data-column');
                        var styleWidth = this.style.width;
                        var styleMinWidth = this.style.minWidth;
                        var width = parseFloat(styleWidth);
                        var minWidth = parseFloat(styleMinWidth);
                        if (width < minWidth) {
                            width = minWidth;
                        }
                        let columnObj = {};
                        if (datacolumn) {
                            columnObj[datacolumn] = width;
                            if (!selfobj.tableStructure[tableName]) {
                                selfobj.tableStructure[tableName] = columnObj;
                            } else {
                                Object.assign(selfobj.tableStructure[tableName], columnObj);
                            }
                        }
                    });
                    selfobj.setTableWidth(true);
                      var sectionID = 'listView';
                      new listSliderView({sectionID : sectionID});
                    selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, selfobj.View, selfobj.tableStructure);
                } else {
                    console.log("Table name not found.");
                }
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }
    
        function createDiv(height) {
            var div = document.createElement('div');
            div.style.top = 0;
            div.style.right = 0;
            div.style.width = '5px';
            div.style.position = 'absolute';
            div.style.cursor = 'col-resize';
            div.style.userSelect = 'none';
            div.style.height = '40px'; // Fixed height
            return div;
        }
    
        function paddingDiff(col) {
            if (getStyleVal(col, 'box-sizing') == 'border-box') {
                return 0;
            }
            var padLeft = getStyleVal(col, 'padding-left');
            var padRight = getStyleVal(col, 'padding-right');
            return (parseInt(padLeft) + parseInt(padRight));
        }
    
        function getStyleVal(elm, css) {
            return (window.getComputedStyle(elm, null).getPropertyValue(css))
        }
      };
    
    },
    
    render: function () {
      var selfobj = this;
      var template = _.template(dynamicFormTemp);
      this.$el.html(template({closeItem:this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList,formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
      $(".app_playground").append(this.$el);
      if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      }else{
        selfobj.userSettings = {};
      }
      setTimeout(function () {
        if(selfobj.userSettings && selfobj.userSettings != {} && Object.entries(selfobj.userSettings).length > 0) {
          selfobj.defaultViewSet();
        }else{
          selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId,"traditionalList",selfobj.tableStructure);
          if(localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15){
            selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
          }else{
            selfobj.userSettings = {};
          }
          selfobj.defaultViewSet();
        }
      }, 300);

      $(document).ready(function() {
        selfobj.columnsResizeFunction();
      });
      return this;
    }
  });

  return dynamicFormsView;

});
