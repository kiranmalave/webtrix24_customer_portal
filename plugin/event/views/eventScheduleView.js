define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  'Quill',
  'Swal',
  '../../core/views/multiselectOptions',
  '../collections/avablityCollection',
  '../collections/eventScheduleCollection',
  '../collections/scheduleListCollection',
  '../models/scheduleListModel',
  '../models/schedulerModel',
  'text!../templates/event_schedule_row.html',
  'text!../templates/event_schedule_single_temp.html',
  'text!../templates/eventWeek_temp.html',
  'text!../templates/event_addExtraw_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, Quill, Swal, multiselectOptions, avablityCollection, eventScheduleCollection, scheduleListCollection, scheduleListModel, schedulerModel, event_schedule_row, event_schedule_single_temp, eventWeek_temp, event_addExtraw_temp) {

  var eventScheduleView = Backbone.View.extend({
    model: scheduleListModel,
    defaultWeek: [],
    dateWithoutHyphens: [],
    loadFrom: "site_event",
    scheduleID: null,
    parentCtr: null,
    loadCount: 0,
    eventID: '',
    eventSchedules: '',
    addcount: 0,
    check: 0,
    initialize: function (options) {
      this.eventID = options.eventID;
      this.parentCtr = options.searchevent;
      this.startDate = options.startDate;
      this.endDate = options.endDate;
      this.schedulerID = options.eventschedulerID;
      this.eventName = options.eventName;
      scanDetails = this.parentCtr;
      this.defaultWeek = [];
      this.collection = new avablityCollection();
      this.dynamicData = null;
      this.loadFrom = options.loadFrom;
      this.toClose = "eventScheduleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "avablityList";
      // this.model = new scheduleListModel();
      this.schedulerModel = new schedulerModel();
      this.schedulerModel.set({ schedule_detail_id: options.eventschedulerID });
      this.scheduleID = options.scheduleID;
      var selfobj = this;
      // this.getEventDetails();
      this.multiselectOptions = new multiselectOptions();
      
      $(".popupLoader").show();
      $('body').find(".loder").hide();
      selfobj.render();
      this.differenceBetweenTwoDates();

      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);

    },
    events:
    {
      "change .saveScheduler": "saveSchedulerDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .comment-box": "showCommentBox",
      "change .dropval": "updateOtherDetails",
      "click .loadview": "loadSingleView",
      "click .addExtraSchedule": "addExtraSchedule",
      "change .membercheck": "checkAddSchedule",
      "click .removeExtraSchedule": "removeExtraSchedule",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('change', '.saveScheduler', this.saveSchedulerDetails);
      // Reattach event bindings
      this.$el.on('change', '.saveScheduler', this.saveSchedulerDetails.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('change', '.membercheck', this.checkAddSchedule);
      this.$el.on('change', '.membercheck', this.checkAddSchedule.bind(this));
      this.$el.off('click', '.addExtraSchedule', this.addExtraSchedule);
      this.$el.on('click', '.addExtraSchedule', this.addExtraSchedule.bind(this));
      this.$el.off('click', '.removeExtraSchedule', this.removeExtraSchedule);
      this.$el.on('click', '.removeExtraSchedule', this.removeExtraSchedule.bind(this));
      this.$el.off('click', '.comment-box', this.showCommentBox);
      this.$el.on('click', '.comment-box', this.showCommentBox.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    getEventDetails: function () {
      let selfobj = this;
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', "event_id": this.eventID }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
      });
    },
    showCommentBox: function (e) {
      let selfobj = this;
      var ID = $(e.currentTarget).attr("data-id");
      var count = $(e.currentTarget).attr("data-text");
      $(e.currentTarget).hide();
      $("." + ID + count + "Editor").show();
      $("#" + ID + count).show();
      var __toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'direction': 'rtl' }],                         // text direction
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],
        ['link'],
        ['clean']                                         // remove formatting button
      ];
      if (!$("." + ID + count + "-editor").hasClass("ql-container")) {
        var editor = new Quill($("#" + ID + count).get(0), {
          modules: {
            toolbar: __toolbarOptions
          },
          theme: 'snow'  // or 'bubble'
        });
        editor.on('text-change', function (delta, oldDelta, source) {
          if (source == 'api') {
            console.log("An API call triggered this change.");
          }
        });
        editor.on('selection-change', function (range, oldRange, source) {
          if (range === null && oldRange !== null) {
            $("." + ID + "Editor").hide();
            $(e.currentTarget).show();
            $("." + ID + count + "_text").empty();
            $("." + ID + count + "_text").append(editor.root.innerHTML);
            selfobj.saveSchedulerDetails();
          }
        });
      }
    },
    addOne: function (objectModel) {
      let selfobj = this;
      this.loadCount++;
      var template = _.template(event_schedule_row);
      if (this.loadFrom == "appointment") {
        $(".avablityListDetails").append(template({ eventDetails: objectModel }));
      } else {
        if (objectModel.attributes.event_scheduler != "") {
          selfobj.eventSchedules = JSON.parse(objectModel.attributes.event_scheduler);
          selfobj.eventList()
        }
      }
      if (this.collection.length >= this.loadCount) {
        this.loadCount = 0;
        this.addDefaultTime();
      }
    },
    eventList: function () {
      let selfobj = this;
      var template = _.template(event_schedule_row);
      // $(".ws-schedule-container").each(function () {
      //   var container = $(this).find(".weeklyView");
      //   container.append("<div class='textCls'>Unavailable</div>");
      // });
      for (const [key, value] of Object.entries(selfobj.eventSchedules)) {
        $("#ws_" + key).append(template({ did: key, eventDetails: value })).show();
      }
    },
    addAll: function () {
      $(".weeklyView").empty();
      this.collection.forEach(this.addOne, this);
      this.addDefaultTime();
    },
    addDefaultTime: function () {
      let selfobj = this;
      $('.weeklyView').each(function () {
        var weeklyView = $(this).closest(".ws-schedule-container").find(".weeklyView");
        if (weeklyView.find("tr").length <= 0) {
          $(this).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', false);
          if (weeklyView.find(".textCls").length === 0) {
            weeklyView.append("<span class='textCls'>Unavailable</span>");
          }
        } else {
          $(this).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', true);
          weeklyView.find('.textCls').remove();
        }
        $('body .start_time').timepicker({
          timeFormat: 'h:mm p',
          interval: 15,
          startTime: '00:00',
          dynamic: false,
          dropdown: true,
          scrollbar: true,
          change: tmTotalHrsOnSite,
        });

        $('.end_time').timepicker({
          timeFormat: 'h:mm p',
          interval: 15,
          startTime: '00:00',
          dynamic: false,
          dropdown: true,
          scrollbar: true,
          change: tmTotalHrsOnSite,
        });

        function tmTotalHrsOnSite() {
          selfobj.saveSchedulerDetails();
        };
      });

      this.initializeValidate();
    },
    addExtraSchedule: function (e) {
      let selfobj = this;
      t = $(e.currentTarget).closest(".row").find(".weeklyView").attr('id');
      st = t.split('_');
      var template = _.template(event_addExtraw_temp);

      selfobj.addcount++;
      $(e.currentTarget).closest(".ws-schedule-container").find('.membercheck').prop('checked', true);
      $(e.currentTarget).closest(".ws-schedule-container").find('.weeklyView').find('.textCls').remove();
      $(e.currentTarget).closest(".row").find(".weeklyView").append(template({ eventDetails: { did: st[1], schedule_detail_id: this.schedule_id, i: selfobj.addcount } }));

      $('.start_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: tmTotalHrsOnSite,
      });

      $('.end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: tmTotalHrsOnSite,
      });

      function tmTotalHrsOnSite() {
        selfobj.saveSchedulerDetails();
      };
    },
    checkAddSchedule: function (e) {
      let selfobj = this;
      selfobj.checkcount++;
      var template = _.template(event_addExtraw_temp);
      var container = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView");
      var t = $(e.currentTarget).closest(".row").find(".weeklyView").attr('id');
      var st = t.split('_');
      if ($(e.currentTarget).prop("checked")) {
        container.find('.textCls').remove();
        container.append(template({ eventDetails: { did: st[1], schedule_detail_id: this.schedule_id, i: selfobj.checkcount } }));
      } else {
        container.empty();
        container.append("<span class='textCls'>Unavailable</span");
      }

      $('.start_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: tmTotalHrsOnSite,
      });

      $('.end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        change: tmTotalHrsOnSite,
      });

      function tmTotalHrsOnSite() {
        selfobj.saveSchedulerDetails();
      };
    },
    removeExtraSchedule: function (e) {
      var container = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView");
      var rowCount = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView tr").length;
      if (rowCount == 1) {
        $(e.currentTarget).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', false);
        container.empty();
        container.append("<span class='textCls'>Unavailable</span");
      }
      $(e.currentTarget).closest("tr").remove();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val().trim();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
    },
    saveSchedulerDetails: function (e) {
      var elementsD = $(".pick");
      var appSchedule = {};
      let test = this.schedulerModel.get("schedule_detail_id");
      for (var i = 0; i < elementsD.length; i++) {
        var currentElement = elementsD.eq(i);
        var currentId = currentElement.attr('name');
        var trElements = currentElement.find('tr');
        var trData = [];

        for (var j = 0; j < trElements.length; j++) {
          var tr = trElements.eq(j);
          var title = tr.find('.txtchange').val();
          var startTime = tr.find('.start_time').val();
          var endTime = tr.find('.end_time').val();
          var description = tr.find('.comment-box').html();
          var scheduleItem = {
            title: title,
            startTime: startTime,
            endTime: endTime,
            description: description
          };
          trData.push(scheduleItem);
        }
        appSchedule[currentId] = trData;
      }
      var appScheduleJSON = JSON.stringify(appSchedule, null, 2);
      this.schedulerModel.set({ event_scheduler: appScheduleJSON });
      let selfobj = this;
      this.schedulerModel.set({ event_id: this.eventID });
      var mid = this.schedulerModel.get("schedule_detail_id");
      // let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#eventScheduleDetail").valid()) {
        // $(e.currentTarget).html("<span>Saving..</span>");
        // $(e.currentTarget).attr("disabled", "disabled");
        this.schedulerModel.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (methodt == "PUT") {
            selfobj.schedulerModel.set({ schedule_detail_id: res.lastID });
          }
          // if (isNew == "new") {
          //   showResponse(e, res, "Save & New");
          // } else {
          //   showResponse(e, res, "Save");
          // }
          // scanDetails.filterSearch();
          // handelClose(selfobj.toClose);
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        schedule_name: {
          required: true,
        },

      };
      var feildsrules = feilds;
      var dynamicRules = "";//selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {

        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        // ...feilds,
        // ...dynamicRules
        // };
      }
      var messages = {
        schedule_name: "Please enter event Name",

      };
      $("#eventScheduleDetail").validate({
        rules: feildsrules,
        messages: messages
      });
      startDate = $('#start_date1').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#start_date1').change();
        var valuetxt = $("#start_date1").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#end_date1").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp > temp2) {
          $("#end_date1").val("");
          selfobj.endDate = $("#start_date1").val();
          // prepare list for event
          selfobj.differenceBetweenTwoDates();
        }
      });
      endDate = $('#end_date1').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#end_date1').change();
        var valuetxt = $("#end_date1").val();
        var temp = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        var valuetxt = $("#start_date1").val();
        var temp2 = moment(valuetxt, 'DD-MM-YYYY').valueOf();
        if (temp2 > temp) {
          $("#start_date1").val("");
        }
        selfobj.endDate = $("#end_date1").val();
        //selfobj.prepareEventSchedule();
        selfobj.differenceBetweenTwoDates();
      });

    },
    differenceBetweenTwoDates: function () {
      var selfobj = this;
      selfobj.defaultWeek = [];
      selfobj.dateWithoutHyphens = [];
      var start = moment(selfobj.startDate, 'DD-MM-YYYY');
      var end = moment(selfobj.endDate, 'DD-MM-YYYY');
      var result = end.diff(start, 'days');
      if (start != "" && end != "") {
        for (days = 0; days <= result; days++) {
          selfobj.defaultWeek.push(start.format('DD-MM-YYYY'));
          selfobj.dateWithoutHyphens.push(start.format('YYYYMMDD'));
          start.add(1, 'days');
        }
      }
      $('ws-schedule-list').empty();
      this.render();
      this.attachEvents();
      if (this.collection.length <= 0) {
        this.getEventDetails();
        this.collection.forEach(this.addOne, this);
      }
      // this.collection.on('add', this.addOne, this);

    },
    render: function () {
      $("#" + this.toClose).remove();
      var source = eventWeek_temp;
      var template = _.template(source);
      this.$el.html(template({ "model": this.model.attributes, "weekList": this.defaultWeek, "startDate": this.startDate, "endDate": this.endDate, "dateWithoutHyphens": this.dateWithoutHyphens,"eventName":this.eventName }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();
      this.initializeValidate();
      this.eventList();
      $('.ws-select').selectpicker();
      rearrageOverlays("Event Schedule", this.toClose, "large");
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return eventScheduleView;

});
