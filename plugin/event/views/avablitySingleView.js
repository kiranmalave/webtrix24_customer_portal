define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../views/evtSchedulerDateOverride',
  '../../core/views/multiselectOptions',
  '../collections/avablityCollection',
  '../collections/scheduleListCollection',
  '../models/scheduleListModel',
  '../models/schedulerModel',
  'text!../templates/avablityRow_temp.html',
  'text!../templates/avablitySingle_temp.html',
  'text!../templates/avablityWeek_temp.html',
  'text!../templates/avablity_addExtraw_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Swal, evtSchedulerDateOverride, multiselectOptions, avablityCollection, scheduleListCollection, scheduleListModel, schedulerModel, avablityRow_Temp, avablitytemp, avablityWeek_temp, avablity_addExtraw_temp) {

  var avablitySingleView = Backbone.View.extend({
    model: scheduleListModel,
    defaultWeek: ["sun", "mon", "tue", "wed", "thurs", "fri", "sat"],
    setCopyWeek: ["sun", "mon", "tues", "wednes", "thurs", "fri", "satur"],
    loadFrom: "site_event",
    scheduleID: null,
    loadCount: 0,
    initialize: function (options) {
      this.calledFrom = options.calledFrom;
      this.dynamicData = null;
      this.schedulerID = null;
      this.scheduleID = null;
      this.loadFrom = options.loadFrom;
      this.toClose = "avablitySingleView";
      this.event_id = options.eventID;
      this.pluginName = "avablityList";
      this.model = new scheduleListModel();
      this.schedulerModel = new schedulerModel();
      var selfobj = this;
      this.addDayIds = [];
      this.dayValues = [];
      this.collection = new avablityCollection();
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchavablity;
      $(".popupLoader").show();
      this.scheduleList = new scheduleListCollection();
      $('body').find(".loder").hide();
      selfobj.render();
      this.getScheduleList();

      if (options.scheduleID != "") {
        this.model.set({ scheduleID: options.scheduleID });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          
          //selfobj.render();
        });
      }
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
      $(".ws-schedule-container").find(".weeklyView").empty();

    },
    getScheduleList: function () {
      var selfobj = this;
      this.scheduleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { getAll: 'Y' }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("scheduleList", res.data);
        selfobj.render();
      });
    },
    events:
    {
      "click .saveavablityDetails": "saveavablityDetails",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
      "click .loadview": "loadSingleView",
      "click .cancelavablityDetails": "cancelavablityDetails",
      "click .addExtraSchedule": "addExtraSchedule",
      "click .removeSchedule": "removeSchedule",
      "change .memberlistcheck": "checkAddExtraSchedule",
      "change .copyWeekListcheck": "copyWeekListcheck",
      "click .scheApplyBtn": "scheApplyBtn",
      "click .removeExtraSchedule": "removeExtraSchedule",
      "click .saveSchedulerDetails": "saveSchedulerDetails",
      "click .copySchedule": "copySchedule",
      "click .dateOverride": "openDateOverrideModal",
      // 'click #applyDate': 'applyDate',
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveavablityDetails', this.saveavablityDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveavablityDetails', this.saveavablityDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
      this.$el.off('click', '.cancelavablityDetails', this.cancelavablityDetails);
      this.$el.on('click', '.cancelavablityDetails', this.cancelavablityDetails.bind(this));
      this.$el.off('change', '.memberlistcheck', this.checkAddExtraSchedule);
      this.$el.on('change', '.memberlistcheck', this.checkAddExtraSchedule.bind(this));
      this.$el.off('change', '.copyWeekListcheck', this.copyWeekListcheck);
      this.$el.on('change', '.copyWeekListcheck', this.copyWeekListcheck.bind(this));
      this.$el.off('click', '.scheApplyBtn', this.scheApplyBtn);
      this.$el.on('click', '.scheApplyBtn', this.scheApplyBtn.bind(this));
      this.$el.off('click', '.addExtraSchedule', this.addExtraSchedule);
      this.$el.on('click', '.addExtraSchedule', this.addExtraSchedule.bind(this));
      this.$el.off('click', '.removeExtraSchedule', this.removeExtraSchedule);
      this.$el.on('click', '.removeExtraSchedule', this.removeExtraSchedule.bind(this));
      this.$el.off('click', '.removeSchedule', this.removeSchedule);
      this.$el.on('click', '.removeSchedule', this.removeSchedule.bind(this));
      this.$el.off('click', '.saveSchedulerDetails', this.saveSchedulerDetails);
      this.$el.on('click', '.saveSchedulerDetails', this.saveSchedulerDetails.bind(this));
      this.$el.off('click', '.copySchedule', this.copySchedule);
      this.$el.on('click', '.copySchedule', this.copySchedule.bind(this));
      this.$el.off('click', '.dateOverride', this.openDateOverrideModal);
      this.$el.on('click', '.dateOverride', this.openDateOverrideModal.bind(this));
      // this.$el.off('click', '#applyDate', this.applyDate);
      // this.$el.on('click', '#applyDate', this.applyDate.bind(this));

    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    addOne: function (objectModel) {
      this.loadCount++;
      var template = _.template(avablityRow_Temp);
      st = 0;
      if (this.loadFrom == "site_event") {
        $(".avablityListDetails").append(template({ eventDetails: objectModel, schedule_detail_id: selfobj.schedule_id }));
      } else {
        if (objectModel.attributes.event_scheduler != "") {
          let tempData = JSON.parse(objectModel.attributes.event_scheduler);
          for (const [key, value] of Object.entries(tempData)) {
            $("#ws_" + key).append(template({ did: key, eventDetails: value })).show();
          }
        }
      }
      this.schedulerID = objectModel.attributes.schedule_detail_id;

      if (this.collection.models.length >= this.loadCount) {
        this.loadCount = 0;
        this.addDefaultTime();
      }
    },
    addAll: function () {
      $(".weeklyView").empty();
      this.collection.forEach(this.addOne, this);
      this.addDefaultTime();
    },
    addDefaultTime: function () {
      // var selfobj = this;
      // var template = _.template(avablity_addExtraw_temp);
      $('.weeklyView').each(function () {
        // var t = this.id;
        // var st = t.split('_');
        var weeklyView = $(this).closest(".ws-schedule-container").find(".weeklyView");
        if (weeklyView.find("tr").length <= 0) {
          $(this).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', false);
          if (weeklyView.find(".textCls").length === 0) {
            weeklyView.append("<span class='textCls'>Unavailable</span>");
          }
          // $(this).append(template({ eventDetails: { did: st[1], schedule_detail_id: selfobj.schedule_id } }));
        } else {
          $(this).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', true);
          weeklyView.find('.textCls').remove();
        }
      });

      this.initializeValidate();
    },

    checkAddExtraSchedule: function (e) {
      e.stopPropagation();
      var template = _.template(avablity_addExtraw_temp);
      var container = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView");
      var t = container.attr('id');
      var st = t.split('_');
      if ($(e.currentTarget).prop("checked")) {
        container.find('.textCls').remove();
        container.append(template({ eventDetails: { did: st[1], schedule_detail_id: this.schedule_id } }));
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
      });

      $('.end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });
    },

    //  addExtraSchedule: function (e) {

    //   // Get the day from the parent schedule container ID
    //   var day = $(e.currentTarget).closest('.ws-schedule-container').attr('id').split('-')[0];

    //   // Generate a unique identifier (timestamp)
    //   var uniqueId = new Date().getTime();

    //   // Generate unique IDs for start and end time fields
    //   var startId = 'start_time_' + day + '_' + uniqueId;
    //   var endId = 'end_time_' + day + '_' + uniqueId;

    //   var template = _.template(avablity_addExtraw_temp);
    //   var newFields = template({ eventDetails: { did: day, schedule_detail_id: this.schedule_id } });

    //   // Append the new start and end time fields with unique IDs
    //   $(e.currentTarget).closest(".ws-schedule-container").find('.memberlistcheck').prop('checked', true);
    //   $(e.currentTarget).closest(".ws-schedule-container").find('.textCls').remove(); 
    //   $(e.currentTarget).closest(".row").find(".weeklyView").append(newFields);

    //   // Update the IDs of the newly added start and end time fields
    //   $(e.currentTarget).closest(".row").find(".weeklyView .start_time:last").attr('id', startId);
    //   $(e.currentTarget).closest(".row").find(".weeklyView .end_time:last").attr('id', endId);

    //   // Initialize timepickers for the newly added start and end time fields
    //   $('#' + startId).timepicker({
    //     timeFormat: 'h:mm p',
    //     interval: 15,
    //     startTime: '00:00',
    //     dynamic: false,
    //     dropdown: true,
    //     scrollbar: true,
    //   });

    //   $('#' + endId).timepicker({
    //     timeFormat: 'h:mm p',
    //     interval: 15,
    //     startTime: '00:00',
    //     dynamic: false,
    //     dropdown: true,
    //     scrollbar: true,
    //   });
    // },  

    addExtraSchedule: function (e) {
      t = $(e.currentTarget).closest(".row").find(".weeklyView").attr('id');
      st = t.split('_');
      var template = _.template(avablity_addExtraw_temp);
      $(e.currentTarget).closest(".ws-schedule-container").find('.memberlistcheck').prop('checked', true);
      $(e.currentTarget).closest(".ws-schedule-container").find('.textCls').remove();
      $(e.currentTarget).closest(".row").find(".weeklyView").append(template({ eventDetails: { did: st[1], schedule_detail_id: this.schedule_id } }));

      $('body .start_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });

      $('body .end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });
    },

    copySchedule: function (e) {
      const curr = $(e.currentTarget);
      const t = curr.closest(".row").find(".weeklyView").attr('id');
      const st = t.split('_');

      $(".copyDaySchedule").not(curr.closest(".row").find(".copyDaySchedule")).removeClass("open");
      curr.closest(".row").find(".copyDaySchedule").toggleClass("open");

      this.setCopyWeek.forEach((day, index) => {
        const checkboxId = `#${day}_cp`;
        const isDisabled = st[1] === day;

        $(`.copyWeekListcheck${checkboxId}`).prop({
          'disabled': isDisabled,
          'checked': isDisabled
        });
      });

      var elementsD = document.getElementsByClassName("pickD");
      for (var i = 0; i < elementsD.length; i++) {
        if (elementsD[i].name == st[1]) {
          var values = $("input[name='" + elementsD[i].name + "_ickV']").map(function () {
            return $(this).val();
          }).get();
          this.dayValues = values;
        }
      }
    },

    copyWeekListcheck: function (e) {
      e.stopPropagation();
      var addDayIds = [];
      $('.copyDaySchedule input:checkbox').each(function () {
        var checkboxId = $(this).attr("id");
        chkId = checkboxId.split('_');
        if ($(this).is(":checked") && !$(this).is(":disabled")) {
          if (!addDayIds.includes(chkId[0])) {
            addDayIds.push(chkId[0]);
          }
        }
      });
      this.addDayIds = addDayIds;
    },

    scheApplyBtn: function (e) {
      e.stopPropagation();
      for (var i = 0; i < this.addDayIds.length; i++) {
        var addDayId = this.addDayIds[i];
        if (addDayId == "thurs") {
          var subStr = addDayId.substring(0, 5);
        } else {
          var subStr = addDayId.substring(0, 3);
        }
        if (this.defaultWeek.includes(subStr)) {
          var matchingDaySelector = '#ws_' + subStr;

          var dayData = [];

          for (var k = 0; k < this.dayValues.length; k += 2) {
            var startTime = this.dayValues[k];
            var endTime = this.dayValues[k + 1];

            if (startTime || endTime) {
              dayData.push({
                "startTime": startTime,
                "endTime": endTime
              });
            }
          }
          var numRowsNeeded = dayData.length;
          var allRows = $(matchingDaySelector).closest('.ws-schedule-container').find(".weeklyView tr");

          while (allRows.length < numRowsNeeded) {
            st = matchingDaySelector.split('_');
            var template = _.template(avablity_addExtraw_temp);
            $(matchingDaySelector).closest(".row").find(".weeklyView").append(template({ eventDetails: { did: st[1], schedule_detail_id: this.schedule_id } }));
            allRows = $(matchingDaySelector).closest('.ws-schedule-container').find(".weeklyView tr");
            numRowsNeeded = dayData.length;
          }

          allRows.slice(numRowsNeeded).remove();

          for (let j = 0; j < dayData.length; j++) {
            var scheduleAtIndex = dayData[j];
            var startInput = $(matchingDaySelector + ' .start_time').eq(j);
            var endInput = $(matchingDaySelector + ' .end_time').eq(j);
            startInput.val(scheduleAtIndex.startTime);
            endInput.val(scheduleAtIndex.endTime);
          }
          var container = $(matchingDaySelector).closest(".ws-schedule-container").find(".weeklyView");
          if (dayData.length > 0) {
            container.find('.textCls').remove();
            $(matchingDaySelector).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', true);
          } else {
            $(matchingDaySelector).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', false);
            container.append("<span class='textCls'>Unavailable</span");
          }
        }
      }
      var elementsD = document.getElementsByClassName("pickD");
      for (var i = 0; i < elementsD.length; i++) {
        var values = $("input[name='" + elementsD[i].name + "_ickV']").map(function () {
          return $(this).val();
        }).get();
      }

      $(e.currentTarget).closest(".row").find(".copyDaySchedule").removeClass("open");

      $('.start_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });

      $('.end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });
    },

    openDateOverrideModal: function (e) {
      let selfobj = this;
      var show = $(e.currentTarget).attr("data-view");
      switch (show) {
        case "customModal": {
          new evtSchedulerDateOverride({ event_id: selfobj.event_id, scheduleID: selfobj.scheduleID, schedulerID: selfobj.schedulerID });
          break;
        }
      }
    },

    removeExtraSchedule: function (e) {
      var container = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView");
      var rowCount = $(e.currentTarget).closest(".ws-schedule-container").find(".weeklyView tr").length;
      // alert(rowCount);
      if (rowCount == 1) {
        $(e.currentTarget).closest(".ws-schedule-container").find('input[type="checkbox"]').prop('checked', false);
        container.empty();
        container.append("<span class='textCls'>Unavailable</span");
      }
      $(e.currentTarget).closest("tr").remove();
    },

    //function added by Sanjay
    removeSchedule: function (e) {
      $('.ws-schedule_name_active').hide();

      var selfobj = this;
      var removeIds = $('.remS').attr("data-id");
      var status = $('.remS').attr("data-action");
      var action = "changeScheduleStatus";

      var idsToRemove = removeIds.toString();
      if (idsToRemove == '') {
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        $('.ws-schedule_name_active').hide();
        return false;
      }
      $.ajax({
        url: APIPATH + 'event/status',
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
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            selfobj.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html(status);
          }, 3000);

        }
      });
      this.render();

    },
    cancelavablityDetails: function (e) {

      this.render();
    },
    updateOtherDetails: function (e) {
      let selfobj = this;
      var valuetxt = $(e.currentTarget).val().trim();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.schedulerModel.set(newdetails);
      this.model.set(newdetails);
      if (toID == "schedule") {
        if (valuetxt == "add_schedule") {
          $('.ws-schedule_name').show();
          $('.ws-schedule-list').hide();
          $('.ws-dateoverride-container').hide();
        } else {
          $('.ws-schedule_name').hide();
          $('.ws-schedule-list').show();
          $('.ws-dateoverride-container').show();
          // get list
          this.getschdeuleDetails(valuetxt);
          selfobj.scheduleID = valuetxt;
        }
      }

      //Below three lines added by Sanjay
      if (valuetxt != '') {
        $('.remS').attr("data-id", valuetxt);
      }
    },
    getschdeuleDetails: function (scheduleID) {
      var selfobj = this;
      this.collection.reset();
      this.collection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', "schedule_id": scheduleID }
      }).done(function (res) {
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if (res.statusCode == 994) {
          app_router.navigate("logout", { trigger: true });
        }
      });
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["event_type"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveavablityDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("event_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#scheduleDetail").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
          selfobj.getScheduleList();
        });
      }
    },
    saveSchedulerDetails: function (e) {
      e.preventDefault();
      var elementsD = document.getElementsByClassName("pickD");
      var appSchedule = {};
      for (var i = 0; i < elementsD.length; i++) {
        var values = $("input[name='" + elementsD[i].name + "_ickV']").map(function () {
          return $(this).val();
        }).get();

        var dName = elementsD[i].name;
        this.weekValues = values;
        var dayData = [];
        for (var k = 0; k < values.length; k += 2) {
          var startTime = values[k];
          var endTime = values[k + 1];

          if (startTime || endTime) {
            dayData.push({
              "startTime": startTime,
              "endTime": endTime
            });
          }
        }
        if (dayData.length > 0) {
          appSchedule[dName] = dayData;
        }
      }
      var appScheduleJSON = JSON.stringify(appSchedule, null, 2);
      this.schedulerModel.set({ event_scheduler: appScheduleJSON })
      let selfobj = this;
      this.schedulerModel.set({ event_id: this.event_id });
      this.schedulerModel.set({ schedule_detail_id: this.schedulerID });
      var mid = this.schedulerID
      let isNew = $(e.currentTarget).attr("data-action");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#scheduleDetail").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.schedulerModel.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }

          if (isNew == "new") {
            showResponse(e, res, "Save & New");
          } else {
            showResponse(e, res, "Save");
          }
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
      $("#scheduleDetail").validate({
        rules: feildsrules,
        messages: messages
      });
      $('body .start_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });


      $('.end_time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });

    },

    render: function () {
      $("#" + this.toClose).remove();
      if (this.loadFrom == "site_event") {
        var source = avablitytemp;
        var template = _.template(source);
        this.$el.html(template({ "model": this.model.attributes }));
      } else {
        var source = avablityWeek_temp;
        var template = _.template(source);
        if (this.calledFrom == "Task") {

          $(".showPages").empty();
          this.$el.html(template({ "model": this.model.attributes, "scheduleList": this.scheduleList.models, "weekList": this.defaultWeek, "copyWeekList": this.setCopyWeek }));
          $(".showPages").append(this.$el);
        } else {
          this.$el.html(template({ "model": this.model.attributes, "scheduleList": this.scheduleList.models, "weekList": this.defaultWeek, "copyWeekList": this.setCopyWeek }));
          this.$el.addClass("tab-pane in active panel_overflow");
          this.$el.attr('id', this.toClose);
          this.$el.addClass(this.toClose);
          this.$el.data("role", "tabpanel");
          this.$el.data("current", "yes");
          $(".ws-tab").append(this.$el);
          $('#' + this.toClose).show();
        }
      }
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      if (this.calledFrom != "Task") {
        rearrageOverlays("Schedule", this.toClose, "large");
      }
      return this;
    },

    onDelete: function () {
      this.remove();
    }
  });
  return avablitySingleView;

});
