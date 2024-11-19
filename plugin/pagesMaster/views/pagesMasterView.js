
define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  'moment',
  '../views/pagesMasterSingleView',
  '../collections/pagesMasterCollection',
  '../models/pagesMasterFilterOptionModel',
  '../../core/views/appSettings',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/configureColumnsView',
  '../../dynamicForm/collections/dynamicFormDataCollection',
  '../../core/views/timeselectOptions',
  '../../core/views/dynamicFilterView',
  '../../core/views/mailView',
  "../../admin/collections/adminCollection",
  'text!../templates/pagesMasterRow.html',
  'text!../templates/pagesMasterTemp.html',
  'text!../templates/pagesMasterFilterOptionTemp.html',
  '../../core/views/deleteCardView',
], function ($, _, Backbone, Swal, moment, pagesMasterSingleView, pagesMasterCollection, pagesMasterFilterOptionModel, appSettings, moduleDefaultSettings, configureColumnsView, dynamicFormData, timeselectOptions, dynamicFilterView, mailView, adminCollection, pagesMasterRowTemp, pagesMasterTemp, pagesMasterFilterTemp, deleteCardView) {
  var pagesMasterView = Backbone.View.extend({
    mname: '',
    module_desc: '',
    plural_label: '',
    form_label: '',
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "pagesFilterView";
      $(".profile-loader").show();
      $(".filter").hide();
      this.filteredSearch = false;
      this.totalRec = 0;
      this.currPage = 0;
      this.tableStructure = {},
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = ['isHome', 'isParent', 'feture_image'];
      this.View = "traditionalList";
      this.arrangedColumnList = [];
      var mname = Backbone.history.getFragment();
      this.mname = mname;
      this.idsToRemove = [];
      permission = ROLE[mname];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj: this });
      this.staticJoined = [];
      this.columnMappings = [
        { 'pageLink': 'Page Link' },
        { 'pageSubTitle': 'Page Sub Title' }
      ];
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.dynamicFormDatas = new dynamicFormData();
      this.timeselectOptions = new timeselectOptions();
      this.appSettings = new appSettings();
      this.appSettings.getMenuList(this.menuId, function (plural_label, module_desc, form_label, result) {
        selfobj.plural_label = plural_label;
        selfobj.module_desc = module_desc;
        selfobj.form_label = form_label;
        readyState = true;
        selfobj.moduleDefaultSettings.getColumnData();
      });

      this.adminList = new adminCollection();
      this.adminList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('', res, '');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
      });

      selfobj.filterOption = new pagesMasterFilterOptionModel();
      if (this.mname == "pages") {
        selfobj.filterOption.set({ page_type: "page" });
      } else if (this.mname == "blogs") {
        selfobj.filterOption.set({ page_type: "blog" });
      } else if (this.mname == "services") {
        selfobj.filterOption.set({ page_type: "service" });
      }

      this.collection = new pagesMasterCollection();
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

      this.deleteURL = 'pagesMenuMaster/multipleHardDelete';
      this.statusChangeURL = 'pagesMenuMaster/multiplepagesChangeStatus';

      this.render();
    },

    events:
    {
      "click .sortColumns": "sortColumn",
      "click .resetval": "resetSearch",
      "click .loadview": "loadSubView",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .copyContent": "copyRow",
      "click .listSortColumns": "showListSortColumns",
      "click .memberlistcheck": "memberListCheck",
      "click .softRefresh": "resetSearch",
      "click .downloadReport": "downloadReport",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .hardDelete": "hardDelete",
      "click .deleteCard": "deleteCard",
    },
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      var selfobj = this;
      newdetails["type"] = type;

      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
        action: APIPATH + "pagesReports",
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
      dataInput.val(JSON.stringify(selfobj.filterOption));
      form.submit();
      form.attr({
        action: "#",
        method: "POST",
        target: "",
      });
      selfobj.filterOption.clear('type');
      console.log("filterOption", selfobj.filterOption);
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      var stdColumn = ['pageCss', 'pageContent', 'cssForPage', 'scriptForPage', 'pageCode'];
      // var stdColumn = [];
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
            new configureColumnsView({ menuId: this.menuId, ViewObj: selfobj, stdColumn: stdColumn, skipFields: selfobj.skipFields });
            $(e.currentTarget).addClass("BG-Color");
          }
          break;
        }
      }
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
    changeStatusListElement: function (e) {
      if (permission.delete != "yes") {
        Swal.fire("You don't have permission to delete", '', 'error');
        return false;
      } else {
        Swal.fire({
          title: 'Are you sure want to delete?',
          text: '',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Delete',
          denyButtonText: `Cancel`,
          icon: "question",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Deleted!', '', 'success');
            var selfobj = this;
            var removeIds = [];
            var status = $(e.currentTarget).attr("data-action");
            var action = "changeStatus";
            $('#pagesMasterList input:checkbox').each(function () {
              if ($(this).is(":checked")) {
                removeIds.push($(this).attr("data-pageID"));
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
              showResponse('', { "flag": "F", "msg": "Please select at least one record." }, '')
              return false;
            }
            $.ajax({
              url: APIPATH + 'pagesMaster/status',
              method: 'POST',
              data: { list: removeIds, action: action, status: status },
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
                  showResponse(e, res, '');

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
            // Swal.fire('Changes are not saved', '', 'info')
            $('#pagesMasterList input:checkbox').each(function () {
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
    hardDelete: function (e) {
      let selfobj = this;
      var pageID = $(e.currentTarget).attr("data-pageID");
      Swal.fire({
        title: 'Are you sure want to Delete?',
        text: '',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Delete',
        denyButtonText: `Cancel`,
        icon: "question",
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: APIPATH + 'pagesMaster/hardDelete',
            method: 'POST',
            data: { id: pageID },
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
                selfobj.collection.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler
                }).done(function (res) {
                  if (res.flag == "F") showResponse('', res, '');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".profile-loader").hide();
                  selfobj.filterSearch();
                });
              }
            }
          });
        } else if (result.isDismissed) return;
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
        case "singlepagesMasterData": {
          var pageID = $(e.currentTarget).attr("data-pageID");
          if (pageID != "" && pageID != null && pageID != undefined) {
            if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            } else {
              new pagesMasterSingleView({ pageID: pageID, parentCont: this, menuName: this.mname, searchpagesMaster: this, form_label: selfobj.form_label });
            }
          } else {
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            } else {
              new pagesMasterSingleView({ pageID: pageID, parentCont: this, menuName: this.mname, searchpagesMaster: this, form_label: selfobj.form_label });
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
    copyRow: function (e) {
      let selfobj = this;
      var pageID = $(e.currentTarget).attr("data-pageid");
      var adminID = $.cookie('authid');
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
            url: APIPATH + 'pagesMaster/copy',
            method: 'POST',
            data: { id: pageID, adminID: adminID },
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
                selfobj.collection.fetch({
                  headers: {
                    'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
                  }, error: selfobj.onErrorHandler
                }).done(function (res) {
                  if (res.flag == "F") showResponse('', res, '');
                  if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
                  $(".profile-loader").hide();
                  selfobj.filterSearch();
                });
              }
            }
          });
        } else if (result.isDismissed) return;
      });
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
      var template = _.template(pagesMasterRowTemp);
      // check datatype and if type is date, datetime or time change it as per the setting
      Object.entries(objectModel.attributes).forEach(([index, columnItem]) => {
        const result = selfobj.arrangedColumnList.find(field => field.column_name === index);
        const fieldType = result ? result.fieldType : null;
        if (fieldType == "Datepicker" || fieldType == "Date") {
          objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
        }
        if (fieldType == "Timepicker") {
          objectModel.set({ index: selfobj.timeselectOptions.changeOnlyTime(columnItem) });
        }
        if (fieldType == "Date Time") {
          objectModel.attributes[index] = selfobj.timeselectOptions.changeTimeFormat(columnItem);
        }
      });
      $("#pagesMasterList").append(template({ pagesMasterDetails: objectModel, arrangedColumnList: this.arrangedColumnList }));
    },
    addAll: function () {
      $("#pagesMasterList").empty();
      this.collection.forEach(this.addOne, this);
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
      console.log('filterOption : ', selfobj.filterOption.attributes);
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
            showResponse('', res, '');
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
            removeIds.push($(this).attr("data-pageID"));
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
      let selfobj = this;
      var template = _.template(pagesMasterTemp);
      this.$el.html(template({ closeItem: this.toClose, "pluralLable": selfobj.plural_label, "moduleDesc": selfobj.module_desc, "arrangedColumnList": selfobj.arrangedColumnList, formLabel: selfobj.form_label || '', totalRec: this.totalRec, }));
      $(".app_playground").append(this.$el);
      setToolTip();
      setTimeout(function () {
        selfobj.moduleDefaultSettings.defaultViewSet();
        selfobj.dynamicFilter.render();
      }, 300);
      $(document).ready(function () {
        selfobj.moduleDefaultSettings.columnsResizeFunction();
      });

      return this;
    }
  });

  return pagesMasterView;

});
