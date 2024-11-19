define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'moment',
  '../models/approveCelebrationModel',
  'text!../templates/approvedTemp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, moment, approveCelebrationModel, approvedTemp) {

  var approveCelebrationView = Backbone.View.extend({
    model: approveCelebrationModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      $(".modal-dialog").removeClass('modal-lg');
      $(".modal-dialog").addClass('modal-md');
      scanDetails = options.searchcelebrateWithUs;
      $('#approvedData').remove();
      $(".popupLoader").show();
      this.model = new approveCelebrationModel();
      this.setEndDate(options.celebrate_id);
      if (options.celebrate_id != "") {
        this.model.set({ celebrate_id: options.celebrate_id });
        this.model.set({ confirmationStatus: "Approved" });
        selfobj.render();
        $(".popupLoader").hide();
      }
    },
    events:
    {
      "click #saveApprovedDetails": "saveApprovedDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .setEndDate": "setEndDate",
    },
    onErrorHandler: function (collection, response, options) {
      alert("Something was wrong ! Try to refresh the page or contact administer. :(");
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    setValues: function (e) {
      setvalues = ["status"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
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
          selfobj.model.set(objectDetails);
        }
      }, 500);
    },
    saveApprovedDetails: function (e) {
      e.preventDefault();
      var celebrate_id = this.model.get("celebrate_id");
      if (permission.edit != "yes") {
        alert("You dont have permission to edit");
        return false;
      }
      if (celebrate_id == "" || celebrate_id == null) {
        var methodt = "POST";
      } else {
        var methodt = "PUT";
      }
      // alert(methodt);
      if ($("#approvedDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            scanDetails.filterSearch();
          }

          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },

    setEndDate: function (id) {
      var selfobj = this;
      var celebrate_id = id;
      $.ajax({
        url: APIPATH + 'celebrateWithUs/' + celebrate_id,
        method: 'GET',
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F")
            alert(res.msg);
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            var setEndDate = moment(res.data[0].expDateOfEvent).format("DD-MM-YYYY");
            console.log(setEndDate);

            $('#app_event_date').datepickerBT({
              format: "dd-mm-yyyy",
              todayBtn: "linked",
              clearBtn: true,
              todayHighlight: true,
              // endDate: setEndDate,
              numberOfMonths: 1,
              autoclose: true,
            }).on('changeDate', function (ev) {
              var valuetxt = $("#app_event_date").val();
              selfobj.model.set({ "app_event_date": valuetxt });
            });

            // alert(res.data[0].expDateOfEvent);
            // var endDate = res.data[0].expDateOfEvent;
            // console.log(endDate);
          }
        }
      });
    },


    initializeValidate: function () {
      var selfobj = this;
      $("#cciContactNo,#ankurContactNo").inputmask('Regex', { regex: "^[0-9](\\d{1,9})?$" });
      $('#noOfChildern').inputmask('Regex', { regex: "^[0-9](\\d{1,5})?$" });
      // $('#panNumber').inputmask('Regex',{regex: " ^([A-Z0-9]{1,10})$"});
      $("#approvedDetails").validate({
        rules: {
          app_event_date: {
            required: true,
          },
          app_event_time: {
            required: true,
          },
          cci_name: {
            required: true,
          },
          event_address: {
            required: true,
          },
          cci_contact_no: {
            required: true,
            minlength: 10,
            maxlength: 10
          },
          ankur_contact_no: {
            required: true,
            minlength: 10,
            maxlength: 10
          },
          no_of_childern: {
            required: true,
          }


        },
        messages: {
          app_event_date: "Event Date Required",
          app_event_time: "Event Time Requred",
          cci_name: "CCI Name Required",
          cci_contact_no: "Enter Valid CCI Contact Number",
          ankur_contact_no: "Enter Valid Central Office Contact ",
          no_of_childern: "Number Of Childerns  Required",
          event_address: "Address Required",
        }
      });

    },

    render: function () {
      var source = approvedTemp;
      var template = _.template(source);
      this.$el.html(template({ model: this.model.attributes }));
      $('#approveMedia').empty();
      $("#approveMedia").append(this.$el);
      var profile = this.model.get("userName");
      $(".modal-title").html("Celebrate With US");
      $('#approvedData').show();
      this.setValues();
      this.initializeValidate();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return approveCelebrationView;

});
