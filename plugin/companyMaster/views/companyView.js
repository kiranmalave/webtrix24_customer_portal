
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'Swal',
    '../views/companySingleView',
    '../collections/companyCollection',
    '../models/companyFilterOptionModel',
    '../../core/views/configureColumnsView',
    '../../core/views/appSettings',
    '../../core/views/mailView',
    '../../dynamicForm/collections/dynamicFormDataCollection',
    '../../category/collections/slugCollection',
    '../../core/views/moduleDefaultSettings',
    '../../core/views/timeselectOptions',
    '../../core/views/listSliderView',
    '../../core/views/dynamicFilterView',
    'text!../templates/companyRow.html',
    'text!../templates/company_temp.html',
    'text!../templates/companyFilterOption_temp.html',
    'text!../../dynamicForm/templates/linkedDropdown.html',
  ], function ($, _, Backbone,moment, Swal,companySingleView, companyCollection, companyFilterOptionModel,configureColumnsView,appSettings,mailView,dynamicFormData,slugCollection,moduleDefaultSettings,timeselectOptions,listSliderView, dynamicFilterView, companyRow, company_temp, companyFilterOption_temp,linkedDropdown) {
  
    var companyView = Backbone.View.extend({
      module_desc:'',
      plural_label:'',
      form_label:'',
      currPage: 0,
      initialize: function (options) {
        var selfobj = this;
        this.toClose = "companyFilterView";
        this.filteredSearch = false;
        this.totalRec = 0; 
        this.currPage = 0;
        this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
        this.skipFields = ['ccEmail','email_logo','website_logo','country','city','centralGst','stateGst','invoice_logo','interGst','is_duplicate','finYear','is_display_payment','infoID'];
        this.columnMappings = [
          {'companyname':'Company Name'},
          {'fromemail':'Sender Email'},
          {'fromname':'Sender Name'},
          {'ifsc_code':'IFSC Code'},
          {'mcir_code':'MCIR Code'},
          {'invoice_terms_condotions':'Invoice Terms & Conditions'},
          {'receipt_terms_condotions':'Receipt Terms & Conditions'},
          {'msme_no':'MSME No.'},
          {'lut_no':'LUT No.'},
          {'gst_no':'GST No.'},
          {'is_gst_billing': 'GST Enabled'},
          {'smtp_host':'SMTP Host'},
          {'smtp_user':'SMTP User'},
          {'smtp_pass':'SMTP Password'},
          {'smtp_post':'SMTP Port'}
        ];
        this.tableStructure = {},
        this.View = "traditionalList";
        this.arrangedColumnList = [];
        this.filteredFields = [];
        $(".profile-loader").show();
        $(".filter").hide();
        
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
        if (permission.view == "no") {
          app_router.navigate("dashboard", { trigger: true });
        }
        this.menuId = permission.menuID;
        selfobj.categoryList = new slugCollection();
        this.moduleDefaultSettings = new moduleDefaultSettings({parentObj : this});
        this.timeselectOptions = new timeselectOptions();
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
      
        this.filterOption = new companyFilterOptionModel();
        this.filterOption.set({ "menuId": this.menuId });
        this.staticJoined = [];
        this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
        this.collection = new companyCollection();
        this.collection.on('add', this.addOne, this);
        this.collection.on('reset', this.addAll, this);
        selfobj.render();
      },
  
      events:
      {
        "blur #textval": "setFreeText",
        "change .range": "setRange",
        "change #textSearch": "settextSearch",
        "click .multiOptionSel": "multioption",
        "click .filterSearch": "filteredSearches",
        "click #filterOption": "filterRender",
        "click .resetval": "resetSearch",
        "click .loadview": "loadSubView",
        "change .txtchange": "updateOtherDetails",
        "click .changeStatus": "changeStatusListElement",
        "click .showpage": "loadData",
        "change .dropval": "singleFilterOptions",
        "click .arrangeColumns": "openColumnArrangeModal",
        "click .downloadReport": "downloadReport",
        "click .sortColumns": "sortColumn",
        "click .listSortColumns" : "showListSortColumns",
        "click .memberlistcheck" : "memberListCheck",
        "click .softRefresh": "resetSearch",
        "click .copyContent": "copyRow",
        "click .hardDelete": "hardDelete",
    },

    
    showListSortColumns: function (e) {
      e.preventDefault();
      this.dynamicFilter.showListSortColumns(e);
    },
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
     
      downloadReport: function (e) {
        e.preventDefault();
        let type = $(e.currentTarget).attr("data-type");
        var newdetails = [];
        newdetails["type"] = type;
        this.filterOption.set(newdetails);
        let form = $("#reports");
        form.attr({
            action: APIPATH + "companyReports",
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
      }, 
      
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.filterOption.set(newdetails);
      },
  
      settextSearch: function (e) {
        var usernametxt = $(e.currentTarget).val();
        this.filterOption.set({ textSearch: usernametxt });
      },
      
      copyRow: function (e) {
        let selfobj = this;
        var companyID = $(e.currentTarget).attr("data-infoID");
        var adminID =  $.cookie('authid');
        Swal.fire({
          title: 'Are you sure want to Copy?',
          text: '',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Copy',
          denyButtonText: `Cancel`,
          icon: "question",
        }).then((result) => {
          if (result.isConfirmed) {
            $.ajax({
              url: APIPATH + 'companyMaster/copy',
              method: 'POST',
              data: { id: companyID, adminID : adminID},
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
                }
              }
            });
          } else if (result.isDismissed) return;
        });
      },

      hardDelete: function(e) {
        let selfobj = this;
        var infoID = $(e.currentTarget).attr("data-infoID");
        if (permission.delete != "yes") {
          Swal.fire("You don't have permission to Delete", '', 'error');
            return false;
        }else{
          Swal.fire({
            title: 'This action is irreversible and will permanently remove all associated data. Please confirm that you wish to proceed with this critical action.',
            text: '',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Delete',
            denyButtonText: `Cancel`,
            icon: "question",
          }).then((result) => {
            if (result.isConfirmed) {
              $.ajax({
                url: APIPATH + 'companyMaster/hardDelete',
                method: 'POST',
                data: { id: infoID },
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
                  }
                }
              });
            } else if (result.isDismissed) return;
          });
        }
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
            if (r == true) {
              var action = "delete";
            }
          }
          $('#companyList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-infoID"));
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
            url: APIPATH + 'companyMaster/status',
            method: 'POST',
            data: { list: removeIds, action: action, status: status },
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
        switch (show) {
          case "singleCompanyData": {
            var infoID = $(e.currentTarget).attr("data-infoID");
            if(infoID != "" && infoID != null && infoID != undefined ){
              if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
                return false;
              }else{
                new companySingleView({ infoID: infoID, searchCompany: this,menuId:this.menuId,form_label:selfobj.form_label});
              }
            }else{
              if (permission.add != "yes") {
                Swal.fire("You don't have permission to add", '', 'error');
                return false;
              }else{
                new companySingleView({ infoID: infoID, searchCompany: this,menuId:this.menuId,form_label:selfobj.form_label});
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

      // resetSearch: function () {
      //   this.currPage = 0;
      //   filterOption.clear().set(filterOption.defaults);
      //   $(".multiOptionSel").removeClass("active");
      //   $("#textval").val("");
      //   $("#textSearch").val("select");
      //   $(".filterClear").val("");
      //   $(".valChange").val("");
      //   $(".ws-select").val('default');
      //   $(".ws-select").selectpicker("refresh");
      //   $(".form-line").removeClass("focused");
      //   $('#textSearch option[value=infoID]').attr('selected', 'selected');
      //   this.filterSearch(false);
      //   let filterOptionLi = document.getElementById('filterOption');
      //   let taskBadgeSpan = filterOptionLi.querySelector('span.taskBadge');
      //   if (taskBadgeSpan) {
      //     taskBadgeSpan.remove();
      //   }
      // },
      loaduser: function () {
        var memberDetails = new singlememberDataModel();
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
        var template = _.template(companyRow);
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
        $("#companyList").append(template({ companyDetails: objectModel,arrangedColumnList:this.arrangedColumnList }));
      },
      addAll: function () {
        $("#companyList").empty();
        this.collection.forEach(this.addOne, this);
      },
      filterRender: function (e) {
        var selfobj = this;
        var isexits = checkisoverlay(this.toClose);
        if (!isexits) {
          var source = companyFilterOption_temp;
          var template = _.template(source);
          var cont = $("<div>");
          const extractedFields = [];
          if(selfobj.metadata){
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
        
          extractedFields.forEach(function(column) {
            if(column.fieldType == "Checkbox" || column.fieldType == "Radiobutton"){
              if(column.linkedWith != null && column.linkedWith != "" && column.linkedWith != 'undefined'){
                var matcchedID = [];
                selfobj.categoryList.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', category_id: column.parentCategory}
                }).done(function (res) {
                  if (res.flag == "F") {
                    Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
                  } 
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".popupLoader").hide();
                  var child =[];
                  for (var i = 0; i < res.data[0].sublist.length; i++) {
                    child[0] = res.data[0].sublist[i].category_id;
                    child[1] = res.data[0].sublist[i].categoryName;
                    matcchedID.push(child.slice());
                  }
                  column.fieldOptions = matcchedID;
                });
              }
            }else{
              column.fieldOptions = column.fieldOptions; 
            }
          });
          const filteredFields = extractedFields.filter(item => item.fieldID != "" && item.fieldID != null && item.fieldID != undefined);
          selfobj.filteredFields = filteredFields;
  
          setTimeout(function () { 
            var templateData = {
                filteredFields: selfobj.filteredFields || [],
              };
              cont.html(template(templateData));
              $(".ws-select").selectpicker();
              // selfobj.setupFilter();
          }, 1000);
  
          cont.attr('id', this.toClose);
          /*  l
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
        // this.setupFilter();
        rearrageOverlays("Filter", this.toClose, "small");
      },
      setValues: function (e) {
        setvalues = ["status", "orderBy", "order"];
        var selfobj = this;
        $.each(setvalues, function (key, value) {
          var modval = selfobj.filterOption.get(value);
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
            selfobj.filterOption.set(objectDetails);
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
          selfobj.filterOption.set(newsetval);
  
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
            selfobj.filterOption.set(objectDetails);
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
        this.filterOption.set({ curpage: 0 });
        this.filterOption.set({ menuId:this.menuId});
        this.filterOption.set({ curpage: this.currPage });
        var $element = $('#loadMember');
        $(".profile-loader").show();
        $element.attr("data-index", 1);
        $element.attr("data-currPage", 0);
        // var specificFilters = [];
        // selfobj.filteredFields.forEach(function (column) {
        //   if (column.fieldType == 'Datepicker') {
        //     specificFilters.push(column.column_name + '-startDate');
        //     specificFilters.push(column.column_name + '-endDate');
        //   } else if (column.fieldType == 'Timepicker') {
        //     specificFilters.push(column.column_name + '-startTime');
        //     specificFilters.push(column.column_name + '-endTime');
        //   } else if (column.fieldType == 'Numeric') {
        //     specificFilters.push(column.column_name + '-startNo');
        //     specificFilters.push(column.column_name + '-endNo');
        //   } else if (column.fieldType == 'Range') {
        //     specificFilters.push(column.column_name + '-startRange');
        //     specificFilters.push(column.column_name + '-endRange');
        //   } else {
        //     specificFilters.push(column.column_name);
        //   }
        // });
        
        // specificFilters = [...new Set(specificFilters)];
        // specificFilters.push("textval");
        // appliedFilterCount = 0;
        // for (var i = 0; i < specificFilters.length; i++) {
        //   var filterKey = specificFilters[i];
        //   if (filterOption.attributes[filterKey] != null && filterOption.attributes[filterKey] != "" && filterOption.attributes[filterKey] != undefined) {
        //     appliedFilterCount++;
        //   }
        // }
  
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
  
          selfobj.setValues();
          selfobj.setTableWidth(false);
          if(selfobj.arrangedColumnList.length > 0){
            var sectionID = 'listView';
            new listSliderView({sectionID : sectionID});
          }
        });
        setToolTip();
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
  
          this.filterOption.set({ curpage: index });
          var requestData = this.filterOption.attributes;
  
          $(".profile-loader").show();
          this.collection.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
          }).done(function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            } 
            selfobj.currPage = res.paginginfo.curPage;
            $(".profile-loader").hide();
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
  
            setPagging(res.paginginfo, res.loadstate, res.msg);
            $element.attr("data-currPage", index);
            $element.attr("data-index", res.paginginfo.nextpage);
            selfobj.setTableWidth(false);
          });
        }
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
  
      setupFilter: function () {
        var selfobj = this;
        if(selfobj.filteredFields){
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
              selfobj.filterOption.set(newdetails);
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
                selfobj.filterOption.set(newdetails);
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
                selfobj.filterOption.set(newdetails);
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
                selfobj.filterOption.set(newdetails);
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
  
            var linkedClassElement = $("body").find('.dropLinked_' +column.fieldID);
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
          $('body').off('input', '.valChange');
          $('body').off('click', '.selectField');
          $('body').off('click', '.multiSelectField');
  
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
                if (res.flag == "F") {
                  Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
                } 
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
                    // var dropdownClass = (selection == 'yes') ? 'multiSelectField' : 'selectField';
                    var dropdownClass = 'multiSelectField';
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
                selfobj.filterOption.set(newdetails);
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
  
            $('.multiSelectField.selected[data-fieldID="' + fieldID + '"]').each(function () {
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
  
          $(window).click(function () {
            $('.dropdown-content').hide();
          });
    
        }
      },
  
      singleFilterOptions: function (e) {
        e.stopPropagation();
        var toID = $(e.currentTarget).attr("id");
        var valuetxt = $(e.currentTarget).val().join(",");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.filterOption.set(newdetails);
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
        var template = _.template(company_temp);
        this.$el.html(template({ closeItem: this.toClose,"pluralLable":selfobj.plural_label,"moduleDesc":selfobj.module_desc,"arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '',totalRec: this.totalRec,}));
        $(".app_playground").append(this.$el);
        setToolTip();
        $(".profile-loader").hide();
        $(".ws-select").selectpicker();
        // console.log("user_setting",localStorage.getItem('user_setting'));
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
          selfobj.dynamicFilter.render();
        }, 300);

        $(document).ready(function() {
          selfobj.columnsResizeFunction();
        });
        return this;
      }
    });
  
    return companyView;
  
  });
  