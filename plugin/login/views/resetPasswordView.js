define([
  'jquery',
  'underscore',
  'backbone',
  'Swal',
  '../models/resetPasswordModel',
  'text!../templates/resetPasswordTemp.html',

], function ($, _, Backbone,Swal,resetPasswordModel, resetPasswordTemp) {

  var resetPasswordView = Backbone.View.extend({
    model: resetPasswordModel,
    initialize: function (options) {
      var selfobj = this;
      this.model = new resetPasswordModel();
      this.model.set({ adminID: options.adminID })
      this.render();
    },
    events:
    {
      "blur .txtchange": "updateOtherDetails",
      "click #updatePassword": "updatePassword",
      "click .showHidePassword": "showHidePassword",
    },
    updatePassword: function (e) {
      e.preventDefault();
      var methodt = "POST";
      if (this.model.get("password") != this.model.get("confirmPassword")) {
        if (res.flag == "F") showResponse('',{flag:'F',msg:'Confirm Password Not Match'},'');
        return false;
      }
      if ($("#updatePasswordForm").valid()) {
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
            if (res.flag == "F") showResponse('',res,'');
            $(e.currentTarget).html("<span>Error</span>");
          } else {
            showResponse('',res,'');
            app_router.navigate("login", { trigger: true })
          }

          setTimeout(function () {
            $(e.currentTarget).html("<span>Update</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    showHidePassword: function (e) {
      var currentval = $("#txt_password").attr("type");
      if (currentval == "password") {
        $("#txt_password").attr("type", "text");
        $('#eyeIcon').text('visibility');
      }
      if (currentval == "text") {
        $("#txt_password").attr("type", "password");
        $('#eyeIcon').text('visibility_off');
      }
    },
    render: function () {
      var logintemp = resetPasswordTemp;
      var template = _.template(logintemp);
      this.$el.html(template());
      $(".main_container").empty().append(this.$el);
      this.initializeValidate();
      return this;
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    initializeValidate: function () {
      var selfobj = this;
      $("#updatePasswordForm").validate({
        rules: {
          password: {
            required: true,
          },
          confirmPassword: {
            equalTo: "#password"
          }
        },
        messages: {
          password: "Enter Password",
          confirmPassword: "Enter confirm password same as password"
        },
      });
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});
      $(".profile-loader").hide();
    },

  });
  return resetPasswordView;

});
