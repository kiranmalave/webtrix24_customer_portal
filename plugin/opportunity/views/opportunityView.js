
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  'moment',
  'Swal',
  '../views/opportunitySingleView',
  '../../task/views/taskSingleView',
  '../../appointment/views/appointmentSingleView',
  '../collections/opportunityCollection',
  '../models/opportunityFilterOptionModel',
  '../models/opportunitySingleModel',
  '../../core/views/appSettings',
  '../../core/views/columnArrangeModalView',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../category/collections/slugCollection',
  "../../emailMaster/collections/emailMasterCollection",
  "../../companyMaster/collections/companyCollection",
  '../../core/views/timeselectOptions',
  'text!../templates/opportunityRow.html',
  'text!../templates/opportunityGridRow.html',
  'text!../templates/opportunity_temp.html',
  'text!../templates/opportunityFilterOption_temp.html',
  'text!../../dynamicForm/templates/linkedDropdown.html',
  '../../core/views/notificationView',
  '../../core/views/listSliderView',
  '../../core/views/dynamicFilterView',
  "../../admin/collections/adminCollection",
  '../../core/views/moduleDefaultSettings',
  'text!../templates/opportunityModernView.html',
  'text!../templates/opportunityGridTemp.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, datepickerBT, moment, Swal, opportunitySingleView, taskSingleView, appointmentSingleView, opportunityCollection, opportunityFilterOptionModel, opportunityModel, appSettings, columnArrangeModalView, configureColumnsView, dynamicFormData, slugCollection, emailMasterCollection, companyCollection, timeselectOptions, opportunityRowTemp, leadGridRow, opportunityTemp, opportunityFilterTemp, linkedDropdown, notificationView, listSliderView,dynamicFilterView, adminCollection, moduleDefaultSettings, opportunityModernView, opportunityGridTemp, deleteCardView) {
  var opportunityView = Backbone.View.extend({
    plural_label: '',
    module_desc: '',
    form_label: '',
    mname: '',
    listDataGrid: [],
    paginginfo: [],
    View: 'traditionalList',
    currPage: 0,
    module_name: 'opportunity',
    isdataupdated: false,
    opportunityModel: opportunityModel,
    filteredSearch: false,
    idsToRemove: [],
    initialize: function (options) {
      this.userSettings = {};
      this.toClose = "opportunityFilterView";
      var selfobj = this;
      this.filteredData = [];
      this.arrangedColumnList = [];
      this.filteredFields = [];
      this.totalColumns = 0;
      this.currPage = 0;
      this.tableStructure = {},
      this.idsToRemove = [];
        $(".profile-loader").show();
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".filter").hide();
      $(".opercityBg").hide();
      $(".loder").show();
      $('.customMail').remove('maxActive');
      $(".maxActive").hide();
      this.mname = Backbone.history.getFragment();
      permission = ROLE[this.mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.paginginfo = [],
        this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.moduleDefaultSettings = new moduleDefaultSettings({parentObj : this});
      searchopportunity = new opportunityCollection();
      this.collection = new opportunityCollection();
      this.filterOption = new opportunityFilterOptionModel();
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = [];
      this.staticJoined = [];
      this.columnMappings =[];    
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
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
      this.totalRec = 0;
      this.filterOption.set({ company_id: DEFAULTCOMPANY });
      this.categoryList = new slugCollection();
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'opportunity_stages' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        $('body').find(".loder").hide();
        selfobj.setStageColor();
      });
      selfobj.emailMasterList = new emailMasterCollection();
      selfobj.emailMasterList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: 'active' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        //selfobj.render();
      });
      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
      });
      //selfobj.render();
      this.filterOption.set({ "menuId": this.menuId });
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'opportunityMaster/multipleHardDelete';
	    this.statusChangeURL = 'opportunityMaster/multipleopportunityChangeStatus'; 
    },
    setStageColor: function () {
      var selfobj = this;
      var stageColor;
      this.categoryList.models.forEach(function (element) {
        element.attributes.sublist.forEach(function (list) {
          stageColor = setColor(list.cat_color);
          list.font_color = selfobj.invertHex(list.cat_color);
          list.cat_color_light = stageColor;
        })
      });
    },
    invertHex: function (hex) {
      if (!hex || hex === "") {
        return '#000000'; // Return black for null or empty input
      }
      // Remove the '#' character if it exists
      hex = hex.replace('#', '');

      // Convert hex to RGB
      var r = parseInt(hex.substring(0, 2), 16);
      var g = parseInt(hex.substring(2, 4), 16);
      var b = parseInt(hex.substring(4, 6), 16);

      // Calculate brightness
      var brightness = (r * 0.299) + (g * 0.587) + (b * 0.114);

      // Determine which color to use based on brightness
      var invertedColor;
      if (brightness > 128) {
        invertedColor = '#000000';
      } else {
        invertedColor = '#FFFFFF';
      }

      return invertedColor;
    },
    events:
    {
      "click .loadview": "loadSubView",
      "change .txtchange": "updateOtherDetails",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .markAsCust": "markCutomer",
      // "click .ccBtn": "openComposeMail",
      // "click .bccBtn": "displayList",
      "click .close": "mailHide",
      "click .minimize": "minimize",
      "click .openFull": "maximize",
      "click .showMax": "showmax",
      "click .changeStatusGrid": "changeStatusGrid",
      "click .sortColumns": "sortColumn",
      "click .downloadReport": "downloadReport",
      "change .countryChange": "setCountry",
      "change .selectState": "setState",
      "input .cityChange": "getCity",
      "click .selectCity": "setCity",
      "mouseover .opportunityRow": "handleMouseHover",
      "mouseleave .opportunityRow": "handleMouseLeave",
      "click .listViewBtn": "showViewList",
      "click .setViewMode": "setViewMode",
      "click .listSortColumns": "showListSortColumns",
      "click .memberlistcheck": "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .deleteCard": "deleteCard",
    },
    memberListCheck: function (e) {
      var allChecked = true;
      $(".memberlistcheck").each(function () {
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
    showViewList: function (e) {
      $(".showListView").toggle();
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
    setViewMode: function (e) {
      let selfobj = this;
      var View = $(e.currentTarget).attr("data-value");
      selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, View, selfobj.tableStructure);
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      } else {
        selfobj.userSettings = {};
      }
      if (View != "grid") {
        $(".showListView").toggle();
        selfobj.defaultViewSet();
        selfobj.resetSearch();
      } else if (View == "grid") {
        $("#leadgridview").show();
        $("#leadlistview").hide();
        $("#modernlistview").hide();
        $(".list_mode").removeAttr("disabled")
        $(".grid_mode").attr('disabled', 'disabled');
        $(".modernlist_mode").removeAttr("disabled")
        $(".hide").hide();
        $(".showListView").toggle();
        selfobj.collection.reset();
        selfobj.View = "grid";
        selfobj.gridLazyLoad(listgridID = "", firstLoad = true);
        selfobj.setupDropable();
        selfobj.setupSortable();
        if (selfobj.mname == 'leads') {
          selfobj.leadCanbanSlider();
        }
      }
    },
    filteredSearches: function (e) {
      var selfobj = this;
      selfobj.filteredSearch = true;
      selfobj.filterSearch();
    },
    downloadReport: function (e) {
      e.preventDefault();
      var selfobj = this;
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $(e.currentTarget).closest("form");
      form.attr({
        action: APIPATH + "opportunityReports",
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
    mailHide: function (e) {
      $(".customMail").hide();
      $(".customMailMinimize").hide();
      $(".opercityBg").hide();
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActive');
    },
    minimize: function () {
      $(".customMail").hide();
      $(".customMailMinimize").show();
      $(".opercityBg").hide();
      $('.openFull').addClass('maxActiveRemove');
      var ele = document.querySelector(".customMail");
      ele.classList.remove("maxActive");
      $(".maxActive").hide();
    },
    maximize: function () {
      $(".opercityBg").show();
      $(".customMail").show();
      $(".customMailMinimize").hide();
      $('.customMail').addClass('maxActive');
      $('.openFull').remove('maxActive');
      $(".closeFull").show();
      $('.openFull').remove('maxActiveRemove');
    },
    gridLazyLoad: function (listgridID) {
      let selfobj = this;
      if (listgridID == "") {
        if (selfobj.isdataupdated || selfobj.listDataGrid.length == 0) {
          var isFilter = false;
          if (selfobj.filterOption.get("stage") != null) {
            isFilter = true;
          }
          $.each(this.categoryList.models, function (index, value) {
            $.each(value.attributes.sublist, function (index2, value2) {
              if (!isFilter) {
                selfobj.filterOption.set({ stage: value2.category_id });
                selfobj.listDataGrid[value2.category_id] = new opportunityCollection();
                selfobj.listDataGrid[value2.category_id].fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                }).done(function (res) {
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".profile-loader").hide();
                  selfobj.paginginfo = res.paginginfo;
                  selfobj.setGridPagging(selfobj.paginginfo, value2.category_id);
                  selfobj.addAllGrid(value2.category_id);
                });
                $("#leadlistview").hide();
                $("#modernlistview").hide();
              } else {
                if (selfobj.filterOption.get("stage") == value2.category_id && selfobj.filterOption.get("stage") != 0) {

                  selfobj.listDataGrid[value2.category_id] = new opportunityCollection();
                  selfobj.listDataGrid[value2.category_id].fetch({
                    headers: {
                      'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                    }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
                  }).done(function (res) {
                    if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                    $(".profile-loader").hide();
                    selfobj.paginginfo = res.paginginfo;
                    selfobj.setGridPagging(selfobj.paginginfo);
                    selfobj.addAllGrid(value2.category_id, value2.category_id);
                  });
                  $("#leadlistview").hide();
                  $("#modernlistview").hide();
                } else {
                  selfobj.listDataGrid[value2.category_id] = new opportunityCollection();
                  selfobj.addAllGrid(value2.category_id);
                }

              }
            });
          });
          console.log("herer");
          selfobj.filterOption.set({ stage: "other" });
          selfobj.listDataGrid[0] = new opportunityCollection();
          selfobj.listDataGrid[0].fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data:selfobj.filterOption.attributes
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".profile-loader").hide();
            selfobj.paginginfo = res.paginginfo;
            selfobj.addAllGrid(0);
            selfobj.filterOption.set({ stage: null });
          });
          selfobj.isdataupdated = false;
        }
      } else {
        selfobj.filterOption.set({ stage: listgridID });
        if (selfobj.listDataGrid[listgridID]) {
          selfobj.filterOption.set({ curpage: selfobj.listDataGrid[listgridID].pageinfo.nextpage });
          if (selfobj.listDataGrid[listgridID].loadstate) {
            selfobj.listDataGrid[listgridID].fetch({
              headers: {
                'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
              }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
            }).done(function (res) {
              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              $(".profile-loader").hide();
              selfobj.paginginfo = res.paginginfo;
              selfobj.setGridPagging(selfobj.paginginfo, listgridID);
            });
            const isAddOneAdded = selfobj.listDataGrid[listgridID]._events && selfobj.listDataGrid[listgridID]._events.add && selfobj.listDataGrid[listgridID]._events.add.some(listener => listener.callback === this.addOne);
            if (isAddOneAdded) {
              // nothing to do.
            } else {
              selfobj.listDataGrid[listgridID].on('add', this.addOne, this);
              selfobj.listDataGrid[listgridID].on('reset', this.addAll, this);
            }
          }
        }
      }
    },
    setGridPagging: function (pagingInfo, stageID) {
      $("#" + stageID).find('.gridPagging').empty();
      if (pagingInfo.end > pagingInfo.totalRecords) {
        var paggingString = pagingInfo.totalRecords + " of " + pagingInfo.totalRecords;
      } else {
        var paggingString = pagingInfo.end + " of " + pagingInfo.totalRecords;
      }

      $("#" + stageID).find('.gridPagging').append(paggingString);

    },
    stageColumnUpdate: function (stage) {
      let selfobj = this;
      selfobj.filterOption.set({ stages: stage });
      selfobj.listDataGrid[stage] = new opportunityCollection();
      selfobj.listDataGrid[stage].fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.paginginfo = res.paginginfo;
        selfobj.addAllGrid(stage);
      });
      $('#' + stage).children().not(".totalCount").remove();
    },
    showmax: function () {
      $(".customMail").show();
      $(".customMailMinimize").hide();
      var ele = document.querySelector(".openFull");
      ele.classList.remove("maxActive");
      $('.openFull').remove('maxActiveRemove');
      $(".maxActive").hide();
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = ['opportunity_id', 'salutation', 'opportunity_image', 'latitude', 'longitude', 'opportunity_name', 'opportunity_source', 'stage'];
      switch (show) {
        case "arrangeColumns": {
          new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, viewMode: selfobj.View, skipFields: selfobj.skipFields });
          break;
        }
      }
    },
    markCutomer: function (e) {
      let selfobj = this;
      var id = $(e.currentTarget).attr("data-id");
      var status = "opportunity";
      Swal.fire({
        title: 'Are you sure you want to Mark as opportunity?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Confirm',
        denyButtonText: `Cancel`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (id != "") {
            $.ajax({
              url: APIPATH + 'opportunityMaster/typeStatus',
              method: 'POST',
              data: { opportunityID: id, status: status },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F")
                  showResponse(e, res, '');

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filterSearch();
                }
              }
            });
          }
        } else if (result.isDenied) {
          Swal.fire('Not Marked as opportunity !!', '', 'info');
        }
      })

    },
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      } else {
        Swal.fire({
          title: 'Do you want to delete ?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Make Inactive',
          denyButtonText: `Permanently Delete`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            Swal.fire('Status changed to Inactive!!', '', 'success')

            var selfobj = this;
            var removeIds = [];
            var status = $(e.currentTarget).attr("data-action");
            var action = "changeStatus";
            if (selfobj.View == 'modernlist') {
              $('#modernList input:checkbox').each(function () {
                if ($(this).is(":checked")) {
                  removeIds.push($(this).attr("data-opportunity_id"));
                }
              });
            }
            $('#opportunityList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-opportunity_id"));
              }
            });
            $(".deleteAll").hide();
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
              showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
              return false;
            }
            $.ajax({
              url: APIPATH + 'opportunityMaster/status',
              method: 'POST',
              data: { list: idsToRemove, action: action, status: status, menuId: selfobj.menuId, company_id: DEFAULTCOMPANY },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F")
                  showResponse(e, res, '');

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {

                  selfobj.initialize();

                }
                selfobj.isdataupdated = true;

              }
            });
          } else if (result.isDenied) {
            var selfobj = this;
            var removeIds = [];
            var status = $(e.currentTarget).attr("data-action");
            var action = "changeStatus";
            if (selfobj.View == 'modernlist') {
              $('#modernList input:checkbox').each(function () {
                if ($(this).is(":checked")) {
                  removeIds.push($(this).attr("data-opportunity_id"));
                }
              });
            }
            $('#opportunityList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-opportunity_id"));
              }
            });
            var idsToRemove = removeIds.toString();
            if (idsToRemove == '') {
              showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
              return false;
            }
            var action = "changeStatus";
            $.ajax({
              url: APIPATH + 'opportunityMaster/delete',
              method: 'POST',
              data: { list: idsToRemove, action: action, menuId: selfobj.menuId, company_id: DEFAULTCOMPANY },
              datatype: 'JSON',
              beforeSend: function (request) {
                request.setRequestHeader("token", $.cookie('_bb_key'));
                request.setRequestHeader("SadminID", $.cookie('authid'));
                request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
                request.setRequestHeader("Accept", 'application/json');
              },
              success: function (res) {
                if (res.flag == "F")
                  showResponse(e, res, '');

                if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                if (res.flag == "S") {
                  selfobj.filteredSearch = false;
                  selfobj.initialize();

                }
                selfobj.isdataupdated = true;

              }
            });
          }
        })
      }
    },
    changeStatusGrid: function (e) {
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
          var custID = $(e.currentTarget).attr("data-opportunity_id");
          var selfobj = this;
          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          removeIds.push($(e.currentTarget).attr("data-opportunity_id"));
          $(".action-icons-div").hide();

          var idsToRemove = removeIds.toString();
          if (idsToRemove == '') {
            showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
            return false;
          }
          $.ajax({
            url: APIPATH + 'opportunityMaster/status',
            method: 'POST',
            data: { list: idsToRemove, action: action, status: status, menuId: selfobj.menuId, company_id: DEFAULTCOMPANY },
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse(e, res, '');

              if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                $('#leadCard' + custID).remove();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);

            }
          });
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
          $('#opportunityList input:checkbox').each(function () {
            if ($(this).is(":checked")) {
              $(this).prop('checked', false);
            }
          });
          $(".listCheckbox").find('.checkall').prop('checked', false);
          $(".deleteAll").hide();
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
      $(".loder").show();
      switch (show) {
        case "singleopportunityData": {
          var opportunity_id = $(e.currentTarget).attr("data-opportunity_id");
          if (opportunity_id != "" && opportunity_id != null && opportunity_id != undefined) {
            if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            } else {
              new opportunitySingleView({ opportunity_id: opportunity_id, menuId: this.menuId, searchopportunity: this, menuName: this.mname, form_label: selfobj.form_label, loadfrom: "opportunity" });
            }
          } else {
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            } else {
              new opportunitySingleView({ opportunity_id: opportunity_id, menuId: this.menuId, searchopportunity: this, menuName: this.mname, form_label: selfobj.form_label, loadfrom: "opportunity" });
            }
          }
          $('body').find(".loder").hide();
          $(".profile-loader").hide();
          break;

        }
      }

    },
    loaduser: function () {
      var memberDetails = new singlememberDataModel();
    },
    addOne: function (objectModel) {
      var selfobj = this;
      selfobj.totalRec = selfobj.collection.length;
      $("#leadlistview").hide();
      $(".noCustAdded").hide();
      $(".reports").show();
      $("#modernlistview").hide();
      $("#filterOption").hide();
      if (selfobj.View == "traditionalList") {
        if (selfobj.totalRec == 0) {
          $(".noCustAdded").show();
        } else {
          $("#leadlistview").show();
          $("#filterOption").show();
        }
      } else if (selfobj.View == "modernlist") {
        if (selfobj.totalRec == 0) {
          $(".noCustAdded").show();
        } else {
          $("#modernlistview").show();
          $("#filterOption").show();
        }
      } else {
        $("#filterOption").show();
      }
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
      if (selfobj.View == "traditionalList") {
        var template = _.template(opportunityRowTemp);
        objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
        objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
        objectModel.set({ "assigneeInitialBgColor": selfobj.getColorByInitials(objectModel.attributes.assigneeInitial) });
        objectModel.set({ "assigneeInitialColor": selfobj.getFontColor(objectModel.attributes.assigneeInitialBgColor) });
        objectModel.set("initialBgColor",selfobj.appSettings.getColorByInitials(objectModel.attributes.initial));
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        $("#opportunityList").append(template({ opportunityDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname, menuID: this.menuId }));
      } else if (selfobj.View == "modernlist") {
        var template = _.template(opportunityModernView);
        objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
        objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
        objectModel.set({ "assigneeInitialBgColor": selfobj.getColorByInitials(objectModel.attributes.assigneeInitial) });
        objectModel.set({ "assigneeInitialColor": selfobj.getFontColor(objectModel.attributes.assigneeInitialBgColor) });
        objectModel.set("initialBgColor",selfobj.appSettings.getColorByInitials(objectModel.attributes.initial));
        objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
        $("#modernList").append(template({ opportunityDetails: objectModel, arrangedColumnList: this.arrangedColumnList, menuName: this.mname, menuID: this.menuId }));
      } else if (selfobj.View == "grid" && selfobj.mname == 'opportunity') {
        var template = _.template(opportunityGridTemp);
        if (objectModel.attributes.stageID != 0 && objectModel.attributes.stageID != null && objectModel.attributes.stageID != "") {
          objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
          objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
          objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
          objectModel.set({ "assigneeInitialBgColor": selfobj.getColorByInitials(objectModel.attributes.assigneeInitial) });
          objectModel.set({ "assigneeInitialColor": selfobj.getFontColor(objectModel.attributes.assigneeInitialBgColor) });
          objectModel.set("initialBgColor",selfobj.appSettings.getColorByInitials(objectModel.attributes.initial));
          objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
          $("#" + objectModel.attributes.stageID).append(template({ opportunityDetails: objectModel, opportunityLength: this.collection.length }));
        } else {
          objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
          objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
          objectModel.set({ "assigneeInitial": selfobj.getInitials(objectModel.attributes.assignee) });
          objectModel.set({ "assigneeInitialBgColor": selfobj.getColorByInitials(objectModel.attributes.assigneeInitial) });
          objectModel.set({ "assigneeInitialColor": selfobj.getFontColor(objectModel.attributes.assigneeInitialBgColor) });
          objectModel.set("initialBgColor",selfobj.appSettings.getColorByInitials(objectModel.attributes.initial));
          objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
          $("#otherStage").append(template({ opportunityDetails: objectModel, opportunityLength: this.collection.length }));
        }
        selfobj.setupDragable();
      } //else if (selfobj.View == "grid" && selfobj.mname == 'opportunity') {
      //   var template = _.template(opportunityGridTemp);
      //   objectModel.set({ "lastActivityTime": selfobj.timeselectOptions.displayRelativeTime(objectModel.attributes.last_activity_date) });
      //   objectModel.set({ "initial": selfobj.getInitials(objectModel.attributes.name) });
      //   objectModel.set({ "initialBgColor": selfobj.getColorByInitials(objectModel.attributes.initial) });
      //   objectModel.set({ "initialColor": selfobj.getFontColor(objectModel.attributes.initialBgColor) });
      //   let sectionName = $("<div>", { class: "col-md-4 opportunityGridCard", });
      //   sectionName.append(template({ opportunityDetails: objectModel, opportunityLength: this.collection.length }));
      //   $("#opportunityGridRow1").append(sectionName);
      // }
    },
    addAll: function () {
      let selfobj = this;
      $("#opportunityList").empty();
      $('#otherStage').children().not(".totalCount").remove();
      $("#modernList").empty();
      $("#opportunityGridRow1").empty();
      selfobj.collection.forEach(selfobj.addOne, selfobj);
      setToolTip();
    },
    addAllGrid: function (col_name) {
      $("#" + col_name).children().not('.totalCount').remove();
      let selfobj = this;
      selfobj.listDataGrid[col_name].models.forEach(element => {
        selfobj.addOne(element);
      });
    },
    filterSearch: function (isClose = false, stage) {
      if (isClose && typeof isClose != 'object') {
        $('.' + this.toClose).remove();
        rearrageOverlays();
      }
      this.collection.reset();
      var selfobj = this;
      readyState = true;
      selfobj.filterOption.set({ curpage: 0 });
      selfobj.filterOption.set({ menuId: this.menuId });
      selfobj.filterOption.set({ curpage: this.currPage });
      var $element = $('#loadMember');
      $(".profile-loader").show();
      $element.attr("data-index", 1);
      $element.attr("data-currPage", 0);
      if (this.View == "grid") {
        selfobj.isdataupdated = true;
        selfobj.gridLazyLoad("");
      } else {
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: selfobj.filterOption.attributes
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          res.paginginfo.loadFrom = selfobj.toClose;
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", 1);
          $element.attr("data-index", res.paginginfo.nextpage);
          if (res.loadstate === false) {
            $(".profile-loader-msg").html(res.msg);
            $(".profile-loader-msg").show();
          } else {
            $(".profile-loader-msg").hide();
          }

          selfobj.totalRec = 0;
          selfobj.totalRec = res.paginginfo.totalRecords;
          $('#leadlistview').hide();
          $('#modernlistview').hide();
          $('.noDataFound').hide();
          $(".noCustAdded").hide();
          $("#filterOption").hide();
          if (selfobj.totalRec == 0 && selfobj.filteredSearch == true) {
            $('.noDataFound').show();
            $("#filterOption").show();
            if (selfobj.View == "traditionalList") {
              $('#leadlistview').show();
            } else if (selfobj.View == "modernlist") {
              $('#modernlistview').show();
            }
          } else if (selfobj.totalRec == 0 && selfobj.filteredSearch == false) {
            $('.noCustAdded').show();
            $("#filterOption").hide();
          } else if (selfobj.totalRec > 0) {
            $("#filterOption").show();
            if (selfobj.View == "traditionalList") {
              $('#leadlistview').show();
            } else if (selfobj.View == "modernlist") {
              $('#modernlistview').show();
            }
          }
          selfobj.setValues();
          selfobj.setTableWidth(false);
          if (selfobj.View != 'grid') {
            if (selfobj.arrangedColumnList.length > 0) {
              if (selfobj.View == "traditionalList") {
                var sectionID = 'leadlistview';
              } else if (selfobj.View == "modernlist") {
                var sectionID = 'modernlistview';
              }
              new listSliderView({ sectionID: sectionID });
            }
          }
        });
      }
    },
    loadData: function (e) {
      var selfobj = this;
      var $element = $('#loadMember');
      if ($(e.currentTarget).attr("data-loadfrom") != selfobj.toClose) {
        return;
      }
      var cid = $(e.currentTarget).attr("data-dt-idx");
      var isdiabled = $(e.currentTarget).hasClass("disabled");

      if (isdiabled) {
        //
      } else {
        $element.attr("data-index", cid);
        this.collection.reset();
        var index = $element.attr("data-index");
        selfobj.filterOption.set({ curpage: index });
        var requestData = selfobj.filterOption.attributes;

        $(".profile-loader").show();
        this.collection.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, add: true, remove: false, merge: false, type: 'post', error: selfobj.onErrorHandler, data: requestData
        }).done(function (res) {
          selfobj.currPage = res.paginginfo.curPage;
          $(".profile-loader").hide();
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          res.paginginfo.loadFrom = selfobj.toClose;
          setPagging(res.paginginfo, res.loadstate, res.msg);
          $element.attr("data-currPage", index);
          $element.attr("data-index", res.paginginfo.nextpage);
          selfobj.setTableWidth(false);
        });
      }
    },
    setupSortable: function () {
      var selfobj = this;
      $(".leadopportunity").sortable({
        connectWith: ".leadopportunity",
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        items: '>.leadDetailsCard',
        change: function (event, ui) {
        }
      });

      $(".kanban-view").sortable({
        placeholder: "ui-state-highlight",
        forcePlaceholderSize: true,
        items: '.leadIndex',
        cursor: 'grabbing',
        connectWith: '.listgrid',
        stop: function (event, ui) {
          setTimeout(function () { selfobj.savePositions(); }, 100);
        }
      }).disableSelection();

    },
    setupDragable: function () {
      $(".leadopportunity").draggable({
        revert: "invalid",
        containment: "document",
        helper: "clone",
        cursor: "move",
        zIndex: 1000,
        start: function (event, ui) {
          $(this).css("opacity", "0.6");
        },
        stop: function (event, ui) {
          $(this).css("opacity", "1");
        }
      });
    },
    savePositions: function () {
      var selfobj = this;
      var action = "changePositions";
      var serializedData = $(".row.kanban-view .leadIndex").map(function () {
        return $(this).data("lead-id");
      }).get();
      $.ajax({
        url: APIPATH + 'leadColumnUpdatePositions',
        method: 'POST',
        data: { action: action, menuIDs: serializedData },
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F")
            showResponse(e, res, '');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        }
      });
    },
    setupDropable: function () {
      let selfobj = this;
      $("body").find(".leadDrop").droppable({
        accept: ".leadopportunity",
        over: function (event, ui) {
          $(this).addClass("ui-state-highlight");
        },
        out: function (event, ui) {
          $(this).removeClass("ui-state-highlight");
        },
        drop: function (event, ui) {
          var leadStageID = $(this).parent().find('.listgrid').attr('id');
          var opportunityID = $(ui.draggable).attr('data-opportunity_id');
          $(this).append(ui.draggable);
          $(this).removeClass("ui-state-highlight");
          ui.draggable.removeClass("ui-draggable-dragging");
          setTimeout(function () {
            selfobj.updateLeadStage(leadStageID, opportunityID);
          }, 500);
        },
      });
    },
    updateLeadStage: function (leadStageID, opportunityID) {
      let selfobj = this;
      if (opportunityID != "" && leadStageID != "") {
        selfobj.isdataupdated = true;
        $.ajax({
          url: APIPATH + 'opportunityMaster/leadUpdate',
          method: 'POST',
          data: { opportunityID: opportunityID, lead: leadStageID },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F")
              showResponse(e, res, '');

            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.gridLazyLoad(listgridID = "");
            }
          }
        });
      }
    },
    leadCanbanSlider: function () {
      this.categoryList.models.forEach((category) => {
        this.totalColumns = category ? category.attributes.sublist ? category.attributes.sublist.length : [] : 0;
      });
      var offset = [0, 0];
      const countAll = this.totalColumns + 1;
      var divOverlay = document.querySelector(".kanban-scroll-active");
      var scrollView = document.querySelector(".kanban-columns-thumbs");
      scrollView.innerHTML = "";
      var kanban = document.querySelector(".kanban-view");
      for (var i = 0; i < countAll; i++) {
        const para = document.createElement("div");
        para.classList.add("leadCol");
        scrollView.appendChild(para);
      }
      var isDown = false;
      calViewPortScroll();
      window.addEventListener('resize', calViewPortScroll);
      function calViewPortScroll() {
        var viewPort = kanban ? parseInt(kanban.offsetWidth) * 100 / parseInt(kanban.scrollWidth) : '';
        divOverlay.style.width = viewPort + "%";
      }
      // Remove previously attached events
      document.removeEventListener('mouseup', handleMouseUp, true);
      if (divOverlay) {
        divOverlay.removeEventListener('mousedown', handleMouseDown, true);
        divOverlay.removeEventListener('mousemove', handleMouseMove, true);
      }
      if (kanban) {
        kanban.removeEventListener('scroll', handleScroll);
      }
      // Define event handlers
      function handleMouseUp() {
        isDown = false;
      }
      function handleMouseDown(e) {
        isDown = true;
        offset = [
          divOverlay.offsetLeft - e.clientX,
          divOverlay.offsetTop - e.clientY
        ];
      }
      function handleScroll() {
        if (!isDown) {
          var CalPositionPer = (kanban.scrollLeft * 100 / kanban.scrollWidth);
          var decideScroll = scrollView.offsetWidth * CalPositionPer / 100;
          divOverlay.style.left = decideScroll + 'px';
        }
      }
      function handleMouseMove(e) {
        e.preventDefault();
        if (isDown) {
          var wid = scrollView.offsetWidth - divOverlay.offsetWidth;
          var newLeft = e.clientX + offset[0];
          if ((newLeft) > 0 && (newLeft) < wid) {
            var CalPositionPer = (scrollView.offsetWidth * (newLeft) / 100);
            var decideScroll = kanban.scrollWidth * CalPositionPer / 100;
            divOverlay.style.left = (newLeft) + 'px';
            kanban.scrollLeft = decideScroll;
          }
          if ((newLeft) <= 0) {
            kanban.scrollLeft = 0;
          }
        }
      }
      // Add event listeners
      document.addEventListener('mouseup', handleMouseUp, true);
      if (divOverlay) {
        divOverlay.addEventListener('mousedown', handleMouseDown, true);
        divOverlay.addEventListener('mousemove', handleMouseMove, true);
      }
      if (kanban) {
        kanban.addEventListener('scroll', handleScroll);
      }
    },
    handleMouseHover: function (event) {
      const opportunityRow = $(event.currentTarget);
      const button = opportunityRow.find(".opportunityHoverButton");
      const checkboxTd = opportunityRow.find('td.a-center');
      const actionColumn = opportunityRow.find('td.actionColumn');
      if ($(event.target).closest(checkboxTd).length === 0 && $(event.target).closest(actionColumn).length === 0) {
        if (button.length > 0 && !button.is(":hover")) {
          const bottomPos = opportunityRow.offset().top;
          button.css({
            display: "block",
            right: "72px",
            top: (bottomPos) + "px",
          });
          // button.css({
          //   display: "block",
          //   left: event.clientX + "px",
          //   top: (bottomPos - 5) + "px",
          // });
        }
      }
    },
    handleMouseLeave: function (event) {
      const opportunityRow = $(event.currentTarget);
      const opportunityId = opportunityRow.data('opportunityid');
      const relatedTarget = $(event.relatedTarget);
      if (!relatedTarget.hasClass("opportunityRow")) {
        opportunityRow.find(".opportunityHoverButton").css("display", "none");
      }
    },
    getInitials: function (name) {
      if (name) {
        const words = name.split(' ');
        let initials;
        if (words.length === 1) {
          initials = [words[0].charAt(0)];
        } else {
          initials = [words[0].charAt(0), words[words.length - 1].charAt(0)];
        }
        return initials.join('').toUpperCase();
      }
    },
    getColorByInitials: function (initials) {
      const colors = [
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
        "#fce7f6",
        "#f8d6e7",
        "#d6f8e7",
        "#e7d7fd",
        "#f1f9dd",
        "#d6e6ff",
        "#d3f8fd",
      ];

      let sum = 0;
      if (initials) {
        for (let i = 0; i < initials.length; i++) {
          sum += initials.charCodeAt(i);
        }
        const index = sum % colors.length;
        return colors[index];
      }
    },
    getFontColor: function (bgColor) {
      if (bgColor) {
        var selfobj = this;
        const rgb = selfobj.hexToRgb(bgColor);
        const darkerRgb = {
          r: Math.max(0, rgb.r - 130),
          g: Math.max(0, rgb.g - 130),
          b: Math.max(0, rgb.b - 130)
        };
        const darkerHex = selfobj.rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b);
        return `rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 1)`;
      }
    },
    rgbToHex: function (r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    hexToRgb: function (hex) {
      if (hex) {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
        };
      }
    },
    defaultViewSet: function () {
      var selfobj = this;
      $("#leadlistview").hide();
      $("#leadgridview").hide();
      $("#modernlistview").hide();
      $(".grid_mode").removeAttr("disabled");
      $(".list_mode").removeAttr("disabled");
      $(".modernlist_mode").removeAttr("disabled");
      $(".noCustAdded").hide();
      console.log("herer  we set the default width");
      console.log(selfobj.userSettings);
      if (selfobj.userSettings && selfobj.userSettings.hasOwnProperty(selfobj.menuId)) {
        for (const rowKey in selfobj.userSettings) {
          if (rowKey == selfobj.menuId) {
            const displayView = selfobj.userSettings[rowKey].displayView;
            const tableStructure = selfobj.userSettings[rowKey].tableStructure;
            if (tableStructure) {
              selfobj.tableStructure = tableStructure;
            } else {
              selfobj.tableStructure = {};
            }
            if (displayView) {
              if (displayView == 'traditionalList') {
                if (selfobj.collection.length == 0) {
                  $(".noCustAdded").show();
                } else {
                  $("#leadlistview").show();
                  $(".list_mode").attr('disabled', 'disabled');
                  $("#filterOption").show();
                }
                selfobj.View = "traditionalList";
              } else if (displayView == 'modernlist') {
                if (selfobj.collection.length == 0) {
                  $(".noCustAdded").show();
                } else {
                  $("#modernlistview").show();
                  $(".modernlist_mode").attr('disabled', 'disabled');
                  $("#filterOption").show();
                }
                selfobj.View = "modernlist";
              } else {
                $("#leadgridview").show();
                $(".grid_mode").attr('disabled', 'disabled');
                $(".hide").hide();
                $("#filterOption").show();
                selfobj.collection.reset();
                selfobj.View = "grid";
                selfobj.gridLazyLoad(listgridID = "");
                selfobj.setupDropable();
                selfobj.setupSortable();
                if (selfobj.mname == 'leads') {
                  selfobj.leadCanbanSlider();
                }
              }
            }
            if (tableStructure && tableStructure != {} && Object.entries(tableStructure).length > 0) {
              for (const property in tableStructure) {
                if (tableStructure.hasOwnProperty(property)) {
                  let columns;
                  if (property == 0) {
                    const entry = tableStructure[property];
                    if (displayView === 'traditionalList' && entry.hasOwnProperty('clist')) {
                      columns = entry['clist'];
                    } else if (displayView === 'modernlist' && entry.hasOwnProperty('custModernList')) {
                      columns = entry['custModernList'];
                    }
                  } else {
                    if (displayView === 'traditionalList') {
                      columns = tableStructure['clist'];
                    } else if (displayView === 'modernlist') {
                      columns = tableStructure['custModernList'];
                    }
                  }
                  if (columns) {
                    for (const columnName in columns) {
                      if (columns.hasOwnProperty(columnName)) {
                        if (displayView == "traditionalList") {
                          var tableId = '#clist';
                        } else if (displayView == "modernlist") {
                          var tableId = '#custModernList';
                        }
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
                        if (parseFloat(thElement.style.minWidth) < 80) {
                          thElement.style.minWidth = 80 + 'px';
                        } else {
                          thElement.style.minWidth = thElement.style.minWidth;
                        }
                        if (value < (column.column_name.length * 8)) {
                          thElement.style.width = column.column_name.length * 8 + 'px';
                        } else {
                          thElement.style.width = value + 'px';
                        }
                      }
                    });
                    const unarrangedColumns = Object.keys(columns).filter(column => !selfobj.arrangedColumnList.some(arrangedColumn => arrangedColumn.column_name === column));
                    unarrangedColumns.forEach((column) => {
                      if (column != 'tableWidth') {
                        if (columns.hasOwnProperty(column)) {
                          let value = columns[column];
                          if (value == null || value == "" || value == undefined) {
                            value = 190;
                          } else {
                            value = columns[column];
                          }
                          const thElement = document.querySelector(`${tableId} th[data-column="${column}"]`);
                          if (thElement) {
                            if (column == 'check-gap') {
                              thElement.style.minWidth = 50 + "px";
                              thElement.style.width = value + 'px';
                            } else if (column == 'action') {

                              thElement.style.minWidth = 60 + "px";
                              thElement.style.width = 60 + 'px';
                            } else {
                              thElement.style.minWidth = column.length * 8 + 'px';
                              if (parseFloat(thElement.style.minWidth) < 80) {
                                thElement.style.minWidth = 80;
                              } else {
                                thElement.style.minWidth = thElement.style.minWidth;
                              }
                              if (value < (column.length * 8)) {
                                thElement.style.width = column.length * 8 + 'px';
                              } else {
                                thElement.style.width = value + 'px';
                              }
                            }
                          }
                        }
                      }
                    });
                  } else {
                    if (displayView != 'grid') {
                      if (displayView == "traditionalList") {
                        var tableID = 'clist';
                      } else if (displayView == "modernlist") {
                        var tableID = 'custModernList';
                      }
                      selfobj.setColumnWidth(tableID);
                    }
                  }
                }
              }
            } else {
              if (displayView != 'grid') {
                if (displayView == "traditionalList") {
                  var tableID = 'clist';
                } else if (displayView == "modernlist") {
                  var tableID = 'custModernList';
                }
                selfobj.setColumnWidth(tableID);
              }
            }
            if (displayView == "traditionalList") {
              var tableID = 'clist';
              var tableId = '#clist';
            } else if (displayView == "modernlist") {
              var tableID = 'custModernList';
              var tableId = '#custModernList';
            }
            selfobj.defaultTableSet(tableId, tableID);
            selfobj.setTableWidth(false);
          }
        }
      } else {
        if (selfobj.collection.length == 0) {
          $(".noCustAdded").show();
        } else {
          $("#leadlistview").show();
          $(".list_mode").attr('disabled', 'disabled');
          $("#filterOption").show();
        }
        selfobj.View = "traditionalList";
        selfobj.setColumnWidth('clist');
        selfobj.defaultTableSet('#clist', 'clist');
        selfobj.setTableWidth(false);
      }
      if (selfobj.View != 'grid') {
        if (selfobj.arrangedColumnList.length > 0) {
          if (selfobj.View == "traditionalList") {
            var sectionID = 'leadlistview';
          } else if (selfobj.View == "modernlist") {
            var sectionID = 'modernlistview';
          }
          new listSliderView({ sectionID: sectionID });
        }
      }
    },
    setColumnWidth: function (tableID) {
      var minWidth;
      var width;
      $('#' + tableID + ' ' + '.column-title').each(function (index) {
        if (index !== $('#' + tableID + ' ' + '.column-title').length) {
          var fieldLabel = $(this).attr('data-column');
          if (fieldLabel !== 'action' && fieldLabel !== 'check-gap' && fieldLabel !== '') {
            var fieldLabelLength = fieldLabel.length;

            minWidth = fieldLabelLength * 8;
            if (minWidth < 80) {
              minWidth = 80
            } else {
              minWidth = minWidth;
            }
            width = 190;
          } else if (fieldLabel == 'action') {
            console.log("set widhr here");
            minWidth = 30;
            width = 30;
          } else if (fieldLabel == 'check-gap') {
            minWidth = 50;
            width = 50;
          }
          $(this).css('min-width', minWidth + 'px');
          if (width < minWidth) {
            $(this).css('width', minWidth + 'px');
          } else {
            $(this).css('width', width + 'px');
          }
        }
      });
    },
    defaultTableSet: function (tableId, tableID) {
      var totalWidth = 0;
      var tableElement = document.querySelector(tableId);
      var tableElement1 = document.getElementById(tableID);
      if (tableElement1) {
        var thElements = tableElement1.querySelectorAll('thead th.column-title');
        thElements.forEach(function (th) {
          var thWidthString = th.style.width;
          var thWidth = parseFloat(thWidthString);
          totalWidth += thWidth;
        });
      }
      if (tableElement) {
        tableElement.style.width = totalWidth + 'px';
      } else {
        // console.log(`Element with selector ${tableId} not found.`);
      }
    },
    setTableWidth: function (resize = false) {
      var selfobj = this;
      if (selfobj.View == 'traditionalList') {
        var tableElement = document.getElementById('clist');
      } else if (selfobj.View == 'modernlist') {
        var tableElement = document.getElementById('custModernList');
      }
      if (tableElement) {
        var customTableClassElements = tableElement.closest('.customTableClass');
        var thElements1 = tableElement.querySelectorAll('thead th.column-title');
        var totalWidth1 = 0;
        thElements1.forEach(function (th) {
          var thWidthString1 = th.style.width;
          var thWidth1 = parseFloat(thWidthString1);
          totalWidth1 += thWidth1;
        });
        if (customTableClassElements) {
          var customTableElement = customTableClassElements;
          if (customTableElement.offsetWidth > totalWidth1) {
            if (resize == true) {
              var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
              let existingDynamicTd = tableElement.querySelector('.dynamicThead');
              if (existingDynamicTd) {
                existingDynamicTd.style.width = differenceWidth + 'px';
              }
            } else {
              var differenceWidth = customTableElement.offsetWidth - totalWidth1 - 1;
              // var differenceWidth = customTableElement.offsetWidth - tableElement.offsetWidth;
            }
            if (differenceWidth > 5) {
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
              rows.forEach(function (row) {
                if (!row.querySelector('.dynamicTD')) {
                  var newTd = document.createElement('td');
                  newTd.style.width = differenceWidth + 'px';
                  newTd.textContent = '';
                  newTd.classList.add('dynamicTD');
                  row.appendChild(newTd);
                }
              });
              // }
            } else {
              var existingDynamicTh = tableElement.querySelector('.dynamicThead');
              if (existingDynamicTh) {
                existingDynamicTh.parentNode.removeChild(existingDynamicTh);
              }
              var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
              existingDynamicTd.forEach(function (td) {
                td.parentNode.removeChild(td);
              });
            }
          } else {
            var existingDynamicTh = tableElement.querySelector('.dynamicThead');
            if (existingDynamicTh) {
              existingDynamicTh.parentNode.removeChild(existingDynamicTh);
            }
            var existingDynamicTd = tableElement.querySelectorAll('tbody .dynamicTD');
            existingDynamicTd.forEach(function (td) {
              td.parentNode.removeChild(td);
            });
          }
        } else {
          console.log('No element found with class "customTableClass".');
        }
      }
    },
    columnsResizeFunction: function () {
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
              console.log(tableElement);
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
              $('#' + tableName + ' thead th').each(function () {
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
              if (selfobj.View == "traditionalList") {
                var sectionID = 'leadlistview';
              } else if (selfobj.View == "modernlist") {
                var sectionID = 'modernlistview';
              }
              new listSliderView({ sectionID: sectionID });
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
    deleteCard: function (e) {
      let selfobj = this;
      setTimeout(() => {
        var removeIds = [];
        selfobj.checkedCount = 0;
        $('#clist input:checkbox:not(#cAll)').each(function () {
          if ($(this).is(":checked")) {
            removeIds.push($(this).attr("data-opportunity_id"));
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
      var template = _.template(opportunityTemp);
      selfobj.categoryList.models.forEach((cat) => {
        cat.attributes.sublist.sort((a, b) => {
          return parseInt(a.lead_index) - parseInt(b.lead_index);
        });
      });
      var colName = ['country_id', 'state_id', 'city_id'];
      var fieldName = ['Country Name', 'State Name', 'City Name'];
      selfobj.arrangedColumnList.forEach((column) => {
        var index = colName.indexOf(column.column_name);
        column.fieldLabel = index !== -1 ? fieldName[index] : column.fieldLabel;
      });
      selfobj.totalRec = selfobj.collection.length;
      this.$el.html(template({ totalRec: this.totalRec, menuName: this.mname, closeItem: this.toClose, pluralLable: this.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, categoryList: selfobj.categoryList.models, displayView: selfobj.View, skipFields: selfobj.skipFields }));
      $(".app_playground").append(this.$el);
      $(".loder").hide();
      $(".clearSorting").attr('disabled', 'disabled');
      setToolTip();
      $(".listgrid").scroll(function () {
        var element = $(this);
        var scrollHeight = element.prop('scrollHeight');
        var scrollTop = element.scrollTop();
        var innerHeight = element.innerHeight();
        var remainingScroll = scrollHeight - (scrollTop + innerHeight);
        let rounded = Math.round(remainingScroll);
        if (rounded <= 0) {
          var listgridID = element.attr("id");
          selfobj.gridLazyLoad(listgridID);
        }
      });
      if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
        selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
      } else {
        selfobj.userSettings = {};
      }
      setTimeout(function () {
        if (selfobj.userSettings && selfobj.userSettings != {} && Object.entries(selfobj.userSettings).length > 0) {
          selfobj.defaultViewSet();
        } else {
          selfobj.moduleDefaultSettings.setModuleDefaultView(selfobj.menuId, "traditionalList", selfobj.tableStructure);
          if (localStorage.getItem('user_setting') && localStorage.getItem('user_setting').length > 15) {
            selfobj.userSettings = JSON.parse(localStorage.getItem('user_setting'));
          } else {
            selfobj.userSettings = {};
          }
          selfobj.defaultViewSet();
        }
        selfobj.dynamicFilter.render();
      }, 300);

      $(document).ready(function () {
        selfobj.columnsResizeFunction();
      });

      return this;
    }
  });

  return opportunityView;

});