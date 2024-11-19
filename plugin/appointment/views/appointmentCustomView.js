define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../collections/appointmentCollection',
  '../models/singleappointmentModel',
  'text!../templates/appointment_custom_temp.html',
], function ($, _, Backbone, validate, datepickerBT, multiselectOptions, appointmentCollection, singleappointmentModel, customRepeatTemp) {

  var appointmentCustomView = Backbone.View.extend({
    model: singleappointmentModel,
    initialize: function (options) {
      this.dynamicData = null;
      this.model = options.model.model;
      var selfobj = this;
      this.appointmentID = options.appointmentID;
      // this.model.set({ appointmentID: this.appointmentID });
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
      "change .changeEnds": "changeEnds",
    },
    attachEvents: function () {
      // Detach previous event bindings
      this.$el.off('click', '.saveCustomRepeatDetails', this.saveCustomRepeatDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveCustomRepeatDetails', this.saveCustomRepeatDetails.bind(this));
      this.$el.off('click', '.multiSel', this.setValues);
      this.$el.on('click', '.multiSel', this.setValues.bind(this));
      this.$el.off('change', '.changeEnds', this.changeEnds);
      this.$el.on('change', '.changeEnds', this.changeEnds.bind(this));
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
      e.stopImmediatePropagation();
      var selfobj = this
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
    },
    changeEnds: function () {
      $('input[type=radio][name=group5]').change(function () {
        // alert("here");
        if (this.value == "on") {
          $("#occurenceDate").hide();
          $("#date_end").show();
        } else if (this.value == "after") {
          $("#date_end").hide();
          $("#occurenceDate").show();
        } else {
          $("#occurenceDate").hide();
          $("#date_end").hide();
        }
      });
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["days", "ends"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      // e.stopImmediatePropagation();
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      console.log(this.model);
    },


    saveCustomRepeatDetails: function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      let selfobj = this;
      var mid = this.model.get("appointmentID");
      if (permission.edit != "yes") {
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if (mid == "" || mid == null) {
        var methodt = "PUT";
      } else {
        var methodt = "POST";
      }
      if ($("#customRepeatDetails").valid()) {
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
          showResponse(e, res, "Saved");
          if (res.flag == "S") {
            selfobj.model.clear().set(selfobj.model.defaults);
            selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
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
      // var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      // if(!_.isEmpty(dynamicRules)){
      //   var feildsrules = $.extend({}, feilds, dynamicRules);
      //   // var feildsrules = {
      //   //   ...feilds,
      //   //   ...dynamicRules
      //   //   };
      // }
      var messages = {
        week_numb: "Please Enter Repeat after",
        repeat_on: "This is required",
        monthly: "Please select the Date",
        cal: "Please select the Date",
        occurrences: "Please Enter after how many occurrences",
      };
      $('#mobile_no').inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
      $("#customRepeatDetails").validate({
        rules: feildsrules,
        messages: messages
      });
      $("#end_on_date").datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: 1,
        autoclose: true,
        changeYear: true,
        changeMonth: true,
        dateFormat: "dd-mm-yy",
      }).on('changeDate', function (ev) {
        selfobj.model.set({ "end_on_date": $('#end_on_date').val() });
        console.log(selfobj.model);
      });
      $("#week_numb").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });
      $("#end_after_date").spinner({
        min: 1,
        change: function (event, ui) {
          console.log("change has occurred");
        },
      });

    },
    render: function () {
      $("#customTimeModal").empty();
      var source = customRepeatTemp;
      var template = _.template(source);
      this.$el.html(template({ "model": this.model.attributes }));
      $("#customTimeModal").append(this.$el);
      this.initializeValidate();
      this.setOldValues();
      this.attachEvents();
      $('.ws-select').selectpicker();
      $('#customTimeModal').modal('show');
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return appointmentCustomView;

});
