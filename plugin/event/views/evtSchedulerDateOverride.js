define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'datepickerBT',
    'Swal',
    '../models/schedulerModel',
    'text!../templates/evt_sch_date_override.html',
  ], function ($, _, Backbone, validate, datepickerBT, Swal, schedulerModel,evt_sch_date_override) {

    var evtSchedulerDateOverride = Backbone.View.extend({
    
      initialize: function (options) {
        var selfobj = this;
        this.schedulerID = options.schedulerID;
        this.scheduleID = options.scheduleID;
        this.eventID = options.event_id;
        this.schedulerModel = new schedulerModel();
        if (options.schedulerID != "") {
          this.schedulerModel.set({ schedule_detail_id: options.schedulerID });
          this.schedulerModel.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler
          }).done(function (res) {
            if (res.flag == "F") {
              Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            }
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            $(".popupLoader").hide();
          });
        }
        this.dynamicData = null;
        this.model;
        this.selectedDates = [];
        var selfobj = this;
        selfobj.render();
    },
    
      events:
      {
        'click #applyDate': 'applyDate',
        'click .addHrsAvability': 'addHrsAvability',
        'click .removeHrsAvability': 'removeHrsAvability',
        
      },
      attachEvents: function () {
        this.$el.off('click', '#applyDate', this.applyDate);
        this.$el.on('click', '#applyDate', this.applyDate.bind(this));
        this.$el.off('click', '.removeHrsAvability', this.removeHrsAvability);
        this.$el.on('click', '.removeHrsAvability', this.removeHrsAvability.bind(this));
      },

      initializeValidate: function () {
        var selfobj = this;

        $('.weeklyScheduleView').each(function () {
          var weeklyScheduleView = $(this).closest(".timeOverDetails").find(".weeklyScheduleView");
          if (weeklyScheduleView.find("tr").length <= 0) {
            if (weeklyScheduleView.find(".textCls").length === 0) {
              weeklyScheduleView.append("<span class='textCls'>Unavailable</span>");
            }
          } else {
            weeklyScheduleView.find('.textCls').remove();
          }
        });

        $('body .start_Time').timepicker({
          timeFormat: 'h:mm p',
          interval: 15,
          startTime: '00:00',
          dynamic: false,
          dropdown: true,
          scrollbar: true,
        });
  
        $('body .end_Time').timepicker({
          timeFormat: 'h:mm p',
          interval: 15,
          startTime: '00:00',
          dynamic: false,
          dropdown: true,
          scrollbar: true,
        });
      },

      setOldValues: function () {
        var selfobj = this;
      },

        addHrsAvability: function (e) {

          var rowCount = 0; 
          rowCount++; 
          var newRow = $("#row_0").clone();
          newRow.attr("id", "row_" + rowCount);
          newRow.find(".start_Time").attr("id", "start_Time_" + rowCount);
          newRow.find(".end_Time").attr("id", "end_Time_" + rowCount);
          newRow.find(".start_Time").val("");
          newRow.find(".end_Time").val("");
          $(".weeklyScheduleView").append(newRow);

          $('.weeklyScheduleView').each(function () {
            var weeklyScheduleView = $(this).closest(".timeOverDetails").find(".weeklyScheduleView");
            weeklyScheduleView.find('.textCls').remove();
          });

          $('body .start_Time').timepicker({
            timeFormat: 'h:mm p',
            interval: 15,
            startTime: '00:00',
            dynamic: false,
            dropdown: true,
            scrollbar: true,
          });
    
          $('body .end_Time').timepicker({
            timeFormat: 'h:mm p',
            interval: 15,
            startTime: '00:00',
            dynamic: false,
            dropdown: true,
            scrollbar: true,
          });
      },

      removeHrsAvability: function (e) {
        e.preventDefault();
        var container = $(e.currentTarget).closest(".timeOverDetails").find(".weeklyScheduleView");
        var rowCount = $(e.currentTarget).closest(".timeOverDetails").find(".weeklyScheduleView tr").length; 
        if(rowCount == 1){
          container.empty();
          container.append("<span class='textCls'>Unavailable</span");
        }
        $(e.currentTarget).closest("tr").remove();
      },

      applyDate: function () {
          var tableData = [];
          let selfobj = this;
          $(".weeklyScheduleView tr").each(function () {
              var start_Time = $(this).find(".start_Time").val();
              var end_Time = $(this).find(".end_Time").val();
              if (start_Time && end_Time) {
                  var rowData = {
                      start_Time: start_Time,
                      end_Time: end_Time
                  };
                  tableData.push(rowData);
              }
          });
      
        var dateToTableData = {};
        this.selectedDates.forEach(function (selectedDate) {
          dateToTableData[selectedDate] = tableData;
        });
        var datejson = JSON.stringify(dateToTableData);
        $('#customDateModal').modal('hide');
        this.schedulerModel.set({ schedule: this.scheduleID });
        this.schedulerModel.set({ event_id: this.eventID });
        this.schedulerModel.set({ override_dates: datejson });
        this.schedulerModel.set({ schedule_detail_id: this.schedulerID });
        var mid = this.schedulerID
        if (mid == "" || mid == null) {
          var methodt = "PUT";
        } else {
          var methodt = "POST";
        }
        this.schedulerModel.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        });
      },
      
      
     render: function () {
        $("#customDateModal").empty();
        var source = evt_sch_date_override;
        var template = _.template(source);
        this.$el.html(template({ "model": this.model, "selectedDates": this.selectedDates}));
        $("#customDateModal").append(this.$el);
        this.initializeValidate();
        this.setOldValues();
        this.attachEvents();
        $('#customDateModal').modal('show');
        var selfobj = this;
        $('.addDateOverTime').hide(); 
        $('#applyDate').prop('disabled', true);
        var selfobj = this; 

      $(".calendar-container").datepickerBT({
          todayHighlight: true,
          startDate: new Date(),
          beforeShowDay: function (date) {
              var selectedDate = date;
              selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
              var dateString = selectedDate.toISOString().slice(0, 10);
              if (selfobj.selectedDates.includes(dateString)) {
                  return {
                      classes: 'selected-date',
                      tooltip: 'Selected'
                  };
              }
              return '';
          }.bind(this)
      }).on('changeDate', function (ev) {
          var selectedDate = ev.date;
          selectedDate.setMinutes(selectedDate.getMinutes() - selectedDate.getTimezoneOffset());
          var dateString = selectedDate.toISOString().slice(0, 10);
          var dateIndex = selfobj.selectedDates.indexOf(dateString);
          if (dateIndex === -1) {
              selfobj.selectedDates.push(dateString);
          } else {
              selfobj.selectedDates.splice(dateIndex, 1);
          }
          if (selfobj.selectedDates.length > 0) {
              $('.addDateOverTime').show();
              $('#applyDate').prop('disabled', false);
          } else {
              $('.addDateOverTime').hide();
              $('#applyDate').prop('disabled', true);
          }
          var modifiedDates = selfobj.selectedDates.map(function(date) {
            return date.replace(/-/g, '');
          });
          modifiedDates = selfobj.selectedDates;
          $(".calendar-container").datepickerBT('update');
      });

      $('body .start_Time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });

      $('body .end_Time').timepicker({
        timeFormat: 'h:mm p',
        interval: 15,
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
      });

  
        var tableData = [];
    
        
        $(".weeklyScheduleView tr").each(function () {
            var rowData = {};
          
            rowData.start_Time = $(this).find(".start_Time_").val();
            rowData.end_Time = $(this).find(".end_Time_").val();
      
            tableData.push(rowData);
        });
    
       
        var jsonTableData = {
            selectedDates: this.selectedDates,
            tableData: tableData
        };

      setToolTip();
      return this;
  },
      
      onDelete: function () {
      this.remove();
      },

    });
  
    return evtSchedulerDateOverride;
  
  });
  