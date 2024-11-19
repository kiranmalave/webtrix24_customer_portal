define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'datepickerBT',
  'Swal',
  '../../core/views/multiselectOptions',
  '../collections/taskCollection',
  '../models/singleTaskModel',
  'text!../templates/repeat_task_modal_temp.html',
], function ($, _, Backbone, validate, datepickerBT, Swal, multiselectOptions, taskCollection, repeatTaskModel, customRepeatTaskTemp) {

  var repeatTaskCustomView = Backbone.View.extend({
    model: repeatTaskModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.model = options.model;
      var selfobj = this;
      this.task_id = options.task_id;
      console.log(options.model);
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      $(".modelbox").hide();
      $(".popupLoader").show();
      selfobj.render();

    },
    events:
    {
      "click .saveCustomRepeatDetails": "saveCustomRepeatDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "change .dropval": "updateOtherDetails",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveCustomRepeatDetails', this.saveCustomRepeatDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveCustomRepeatDetails', this.saveCustomRepeatDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('click', '.item-container li', this.setValues);
      this.$el.on('click', '.item-container li', this.setValues.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      console.log(this.model);

      if (toID == "repeat_on") {
        if (valuetxt == "weekly") {
          $(".weekDays").show();
          $(".monthly_setting").hide();
        } else if (valuetxt == "monthly") {
          $(".monthly_setting").show();
          $(".weekDays").hide();
        } else {
          $(".weekDays").hide();
          $(".monthly_setting").hide();
        }
      }
      $('input[type=radio][name=group5]').change(function () {
        if (this.value == "on") {
          $(".onDate").show();
          $(".occurenceDate").hide();
        } else if (this.value == "after") {
          $(".onDate").hide();
          $(".occurenceDate").show();
        } else {
          $(".onDate").hide();
          $(".occurenceDate").hide();
        }

      });
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type","days"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      setTimeout(function () {
      var da = selfobj.multiselectOptions.setCheckedValue(e,selfobj);
      console.log('da',da);
      selfobj.model.set(da);
      console.log(selfobj.model);
      },100);
    },


    saveCustomRepeatDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      console.log('this . model : ',selfobj.model);
      var mid = this.model.get("task_id");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#customRepeatTaskDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.flag == "F") {
            showResponse(e,res,'');
          }
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          showResponse(e, res, "Save");
          if (res.flag == "S") {
            selfobj.model.clear().set(selfobj.model.defaults);
            selfobj.getlist();
            selfobj.model.set({ userID: this.userID });
          }
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        week_numb: {
          required: true,
        },
        repeat_on: {
          required: true,
        },
        monthly: {
          required: true,
        },
        cal: {
          required: true,
        },
        occurrences: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var messages = {
        week_numb: "Please Enter Repeat after",
        repeat_on: "This is required",
        monthly: "Please select the Date",
        cal: "Please select the Date",
        occurrences: "Please Enter after how many occurrences",
      };
      $('#mobile_no').inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
      $("#customRepeatTaskDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      endOnDate = $('#end_on_date').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        StartDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        $('#end_on_date').change();
        selfobj.model.set({ "end_on_date": $('#end_on_date').val() });
        console.log(selfobj.model);
      });
      $("#week_numb").spinner({
        min: 1,
      });
      $("#end_after_date").spinner({
        min: 1,
      });
    },
    render: function () {
      $("#customRepeatTaskModal").empty();
      var source = customRepeatTaskTemp;
      var template = _.template(source);
      this.$el.html(template({ "model": this.model.attributes }));
      $("#customRepeatTaskModal").append(this.$el);
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      // $('.ws-select').selectpicker();
      $('#customRepeatTaskModal').modal('show');
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return repeatTaskCustomView;
});
