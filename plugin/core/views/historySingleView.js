define([
  "jquery",
  "underscore",
  "backbone",
  "validate",
  "inputmask",
  "datepickerBT",
  'typeahead',
  'moment',
  'Swal',
  "../../core/views/multiselectOptions",
  "../../core/views/timeselectOptions",
  "../collections/historyCollection",
  '../models/commentsFilterOptionModel',
  "text!../templates/historySingle_temp.html",
  "text!../templates/historyRow_temp.html",
], function ($, _, Backbone, validate, inputmask, datepickerBT, typeahead, moment, Swal, multiselectOptions,timeselectOptions, historyCollection, commentsFilterOptionModel, historyTemp, historyRow) {
  var historySingleView = Backbone.View.extend({
    nextPage: '',
    task_id: '',
    remaining: '',
    totalrec: '',
    pageLimit: '',
    loadstate:true,
    sorting: 'DESC',
    initialize: function (options) {
      console.log(options)
      this.dynamicData = null;
      this.toClose = "historySingleView";
      this.appendto = options.appendto;
      var selfobj = this;
      filterOption = new commentsFilterOptionModel();
      this.multiselectOptions = new multiselectOptions();
      this.timeselectOptions = new timeselectOptions();
      this.type = options.type;
      scanDetails = options.searchComment;
      this.record_id = options.record_id;
      this.sorting = "ASC";
      $(".popupLoader").show();
        this.historyList = new historyCollection();
        if (options.task_id !== "") {
          selfobj.historyList.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: 'post', data: { type:this.type,status: "active", record_id: this.record_id }
          }).done(function (res) {
            if (res.flag == "F") {
              showResponse('',res,'');
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
            selfobj.totalrec = res.paginginfo.totalRecords;
            selfobj.nextPage = res.paginginfo.nextpage;
            selfobj.loadstate = res.loadstate;
            selfobj.updateTime();
          });  
        }
      //}
    },
    events: {
      "click .readMoreHistory": "loadData",
      "click .listSortColumns" : "showListSortColumns",
      "click .sortColumns": "sortColumn",
    },
    updateTime: function(){
      var selfobj = this;
      //this.historyList.forEach
      this.historyList.forEach(function(record){
        	
        record.attributes.modified_date = selfobj.timeselectOptions.displayRelativeTime(record.attributes.modified_date);
        record.attributes.activity_date = selfobj.timeselectOptions.displayRelativeTime(record.attributes.activity_date);
      }, this);
      selfobj.render();
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".column-loader").hide();
    },
    showListSortColumns: function (e) {
      e.preventDefault();
      let selfobj = this;
      var action = $(e.currentTarget).attr('data-action');
      var newsetval = [];
      if(action == "ASC"){
        $(e.currentTarget).hide();
        $('.tasksortingUpwards').show();
        selfobj.sorting = "DESC";
        newsetval["order"] = "ASC";
      }else if(action == "DESC"){
        $(e.currentTarget).hide();
        $('.tasksortingDownwards').show();
        newsetval["order"] = "DESC";
        selfobj.sorting = "ASC";
      }
      if(this.type == "project"){
        filterOption.set({ project_id: this.project_id });
      }else if(this.type == "task"){
        filterOption.set({ task_id: this.task_id });
      }
      filterOption.set(newsetval);
      selfobj.filterSearch();
    },

    sortColumn: function (e) {
      e.stopPropagation();
      selfobj.filterSearch();
    },

    filterSearch: function () {
      this.historyList.reset();
      var selfobj = this;
      $(".profile-loader").show();
      filterOption.set("type",this.type);
      filterOption.set("curpage",0);
      filterOption.set("record_id",this.record_id);
      selfobj.historyList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, add: true, remove: false, merge: false, error: selfobj.onErrorHandler, type: 'post', data: filterOption.attributes
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        selfobj.loadstate = res.loadstate;
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".profile-loader").hide();
        selfobj.render();
      });
    },
    loadData: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var index = selfobj.nextPage;
      this.historyList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: {status: "active", type:this.type, curpage: index,record_id:this.record_id }
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "F") {
          showResponse('',res,'');
        }else{
          $(".popupLoader").hide();
          selfobj.nextPage = res.paginginfo.nextpage;
          selfobj.loadstate = res.loadstate;
          if (!selfobj.loadstate) {
            $(e.currentTarget).hide();
          }
          var template = _.template(historyRow);
          res.data.forEach(function (objectModel) {
            objectModel.modified_date = selfobj.timeselectOptions.displayRelativeTime(objectModel.modified_date);
            objectModel.activity_date = selfobj.timeselectOptions.displayRelativeTime(objectModel.activity_date);
            $("#historyRow").append(template({ historyList: objectModel }));
          });
        }
      });
    },
    render: function () {
      $(".showHistory").empty();
      this.undelegateEvents();
      var selfobj = this;
      var source = historyTemp;
      var template = _.template(source);
      //$("#" + this.toClose).remove();
      //console.log("selfobj.loadstate",selfobj.loadstate);
      this.$el.html(template({ "historyList": this.historyList.models, "loadstate": selfobj.loadstate }))
      console.log(selfobj.appendto);
      $(selfobj.appendto).append(this.$el);
      //$("#" + this.toClose).show();
      this.delegateEvents();
      return this;
    },

  });
  return historySingleView;
});


