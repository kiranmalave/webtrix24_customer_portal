define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  '../models/otpModel',
  'text!../templates/otpTemp.html',

], function ($, _, Backbone, Swal,otpModel, otpTemp) {

  var otpView = Backbone.View.extend({
    model: otpModel,
    initialize: function (options) {
      var selfobj = this;

      this.model = new otpModel();
      this.model.set({ adminID: options.adminID })
      // console.log(this.model);
      this.render();
    },
    events:
    {
      "blur .txtchange": "updateOtherDetails",
      "click #checkotp": "checkotp",
    },
    checkotp: function (e) {
      e.preventDefault();
      var methodt = "POST";
      console.log(this.model)
      if (this.model.get("password") != this.model.get("confirmPassword")) {
        showResponse('',{ flag:'F' , msg: 'Password Not Match' },'');
        return false;
      }
      if ($("#validateOtp").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Updating...</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse(e,res,'');
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            showResponse(e,res,'Sign In');
            setTimeout(function () {
              window.location.href = '#login';
            }, 3000);
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Update</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    render: function () {
      var logintemp = otpTemp;
      var template = _.template(logintemp);
      this.$el.html(template());
      $(".main_container").empty().append(this.$el);
      return this;
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
      $(".profile-loader").hide();
    },

  });
  return otpView;

});
