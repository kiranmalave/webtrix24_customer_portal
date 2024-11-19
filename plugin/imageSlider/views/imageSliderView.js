define([
  "jquery",
  "underscore",
  "backbone",
  "datepickerBT",
  "Swal",
  "moment",
  "../views/imageSliderSingleView",
  "../collections/imageSliderCollection",
  "../models/imageSliderFilterModel",
  "../../core/views/configureColumnsView",
  "../../core/views/appSettings",
  "../views/sliderSectionView",
  "../../dynamicForm/collections/dynamicFormDataCollection",
  '../../category/collections/slugCollection',
  '../../core/views/moduleDefaultSettings',
  '../../core/views/timeselectOptions',
  '../../core/views/dynamicFilterView',
  "text!../templates/imageSliderRow_temp.html",
  "text!../templates/imageSlider_temp.html",
  "text!../templates/imageSliderFilterOption_temp.html",
  "text!../../dynamicForm/templates/linkedDropdown.html",
  '../../core/views/deleteCardView',
], function (
  $,
  _,
  Backbone,
  datepickerBT,
  Swal,
  moment,
  imageSliderSingleView,
  imageSliderCollection,
  imageSliderFilterModel,
  configureColumnsView,
  appSettings,
  sliderSectionView,
  dynamicFormData,
  slugCollection,
  moduleDefaultSettings,
  timeselectOptions,
  dynamicFilterView,
  imageSliderRowTemp,
  imageSliderTemp,
  imageSliderFilterTemp,
  linkedDropdown,
  deleteCardView
) {
  var imageSliderView = Backbone.View.extend({
    collectionLength: "",
    module_desc: "",
    plural_label: "",
    form_label: "",
    currPage: 0,
    idsToRemove: [],
    initialize: function (options) {
      var selfobj = this;
      this.toClose = "imageSliderFilterView";
      this.filteredSearch = false;
      this.totalRec = 0;
      this.currPage = 0;
      this.tableStructure = {},
      this.View = "traditionalList";
      this.arrangedColumnList = [];
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.skipFields = [];
      this.filteredFields = [];
      this.filteredData = [];
      this.idsToRemove = [];
      $(".profile-loader").show();
      $(".filter").hide();
      var mname = Backbone.history.getFragment();
      permission = ROLE[mname];
      var getmenu = permission.menuID;
      this.menuId = getmenu;
      var mname = Backbone.history.getFragment();
      readyState = true;
      selfobj.categoryList = new slugCollection();
      this.timeselectOptions = new timeselectOptions();
      this.appSettings = new appSettings();
      this.dynamicFormDatas = new dynamicFormData();
      this.appSettings.getMenuList(
        this.menuId,
        function (plural_label, module_desc, form_label, result) {
          selfobj.plural_label = plural_label;
          selfobj.module_desc = module_desc;
          selfobj.form_label = form_label;
          readyState = true;
          selfobj.moduleDefaultSettings.getColumnData();
          if (result.data[0] != undefined) {
            selfobj.tableName = result.data[0].table_name;
          }
        }
      );
      this.moduleDefaultSettings = new moduleDefaultSettings({ parentObj : selfobj});
      this.staticJoined = [];
      this.columnMappings = [];    
      this.dynamicFilter = new dynamicFilterView({ parentView: selfobj });
      this.filterOption = new imageSliderFilterModel();
      this.filterOption.set({ menuId: this.menuId });
      this.collection = new imageSliderCollection();
      this.collection.on("add", this.addOne, this);
      this.collection.on("reset", this.addAll, this);
      this.deleteURL = 'sliderSections/multipleHardDelete';
	    this.statusChangeURL = 'sliderSections/multipleimagesliderChangeStatus'; 
      this.render();

    },

    events: {
      "click .loadview": "loadSubView",
      "click .sortColumns": "sortColumn",
      "click .changeStatus": "changeStatusListElement",
      "click .showpage": "loadData",
      "click .listCheckbox": "toggleCheck",
      "click .close-filter": "closeFilter",
      "click .arrangeColumns": "openColumnArrangeModal",
      "click .downloadReport": "downloadReport",
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
    downloadReport: function (e) {
      e.preventDefault();
      let type = $(e.currentTarget).attr("data-type");
      var newdetails = [];
      var selfobj = this;
      newdetails["type"] = type;
      selfobj.filterOption.set(newdetails);
      let form = $("#reports");
      form.attr({
        action: APIPATH + "sliderReports",
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
      selfobj.filterOption.clear("type");
    },
    changeStatusListElement: function (e) {
      Swal.fire({
        title: "Delete slider ",
        text: "Do you want to delete slider!!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Delete",
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          var selfobj = this;

          var removeIds = [];
          var status = $(e.currentTarget).attr("data-action");
          var action = "changeStatus";
          $("#sliderList input:checkbox").each(function () {
            if ($(this).is(":checked")) {
              removeIds.push($(this).attr("data-slider_id"));
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
          if (idsToRemove == "") {
            $(".checkall").prop("checked", false);
            showResponse('', { flag: 'F', msg: 'Please select at least one record.' }, '');
            return false;
          }
          $.ajax({
            url: APIPATH + "sliderMaster/status",
            method: "POST",
            data: { list: idsToRemove, action: action, status: status },
            datatype: "JSON",
            beforeSend: function (request) {
              //$(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token", $.cookie("_bb_key"));
              request.setRequestHeader("SadminID", $.cookie("authid"));
              request.setRequestHeader(
                "contentType",
                "application/x-www-form-urlencoded"
              );
              request.setRequestHeader("Accept", "application/json");
            },
            success: function (res) {
              if (res.flag == "F") showResponse(e, res, '');
              if (res.statusCode == 994) {
                app_router.navigate("logout", { trigger: true });
              }
              if (res.flag == "S") {
                selfobj.filterSearch();
                $(".changeStatus").hide();
                $(".checkall").prop("checked", false);
                // selfobj.render();
              }
              setTimeout(function () {
                $(e.currentTarget).html(status);
              }, 3000);
            },
          });
        } else {
          $("#sliderList input:checkbox").each(function () {
            if ($(this).is(":checked")) {
              $(this).prop("checked", false);
            }
          });
          $(".changeStatus").hide();
          $(".checkall").prop("checked", false);
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
        case "singleSliderData": {
          var slider_id = $(e.currentTarget).attr("data-slider_id");
          if (slider_id != "" && slider_id != null && slider_id != undefined) {
            if (permission.edit != "yes") {
              Swal.fire("You don't have permission to edit", '', 'error');
              return false;
            } else {
              new imageSliderSingleView({ slider_id: slider_id, imageSlider: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
            }
          } else {
            if (permission.add != "yes") {
              Swal.fire("You don't have permission to add", '', 'error');
              return false;
            } else {
              new imageSliderSingleView({ slider_id: slider_id, imageSlider: this, menuId: selfobj.menuId, form_label: selfobj.form_label });
            }
          }
          break;
        }
        case "singleSectionData": {
          var slider_id = $(e.currentTarget).attr("data-slider_id");
          new sliderSectionView({ slider_id: slider_id, imageSlider: this, menuId: selfobj.menuId, sliderSectionList: selfobj.sliderSectionList });
          break;
        }
      }
    },
    addOne: function (objectModel) {
      let selfobj = this;
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
      var template = _.template(imageSliderRowTemp);
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
      $("#sliderList").append(
        template({
          sliderDetails: objectModel,
          arrangedColumnList: this.arrangedColumnList,
        })
      );
    },
    addAll: function () {
      $("#sliderList").empty();
      this.collection.forEach(this.addOne, this);
    },
    openColumnArrangeModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-action");
      // var stdColumn = ['title', 'course_paid', 'author_id'];
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
            new configureColumnsView({
              menuId: this.menuId,
              ViewObj: selfobj,
              stdColumn: stdColumn,
              skipFields: selfobj.skipFields
            });
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
            removeIds.push($(this).attr("data-slider_id"));
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
      var template = _.template(imageSliderTemp);
      this.$el.html(
        template({
          closeItem: this.toClose,
          pluralLable: selfobj.plural_label,
          moduleDesc: selfobj.module_desc,
          arrangedColumnList: selfobj.arrangedColumnList,
          formLabel: selfobj.form_label || "",
          totalRec: this.totalRec,
        })
      );
      $(".app_playground").append(this.$el);
      $(".listCheckbox #cAll").hide();
      setToolTip();
      setTimeout(function () {
        selfobj.moduleDefaultSettings.defaultViewSet();
        selfobj.dynamicFilter.render();
      }, 300);
      $(document).ready(function () {
        selfobj.moduleDefaultSettings.columnsResizeFunction();
      });
      return this;
    },
  });

  return imageSliderView;
});