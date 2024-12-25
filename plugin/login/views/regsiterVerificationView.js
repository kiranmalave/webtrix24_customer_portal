define([
    'jquery',
    'underscore',
    'backbone',
    'owlcarousal',
    '../models/loginModel',
    '../views/regsiterCompanyView',
    '../models/resetPasswordRequestModel',
    '../views/resetPasswordRequestView',
    "../../loginTemplate/collections/loginTemplateCollection",
    'text!../templates/registerOTP_temp.html',
    'Swal'
  
  ], function ($, _, Backbone, owlcarousal, loginModel,regsiterCompanyView,resetPasswordRequestModel, resetPasswordRequestView,loginTemplateCollection, registerOTP_temp,Swal) {
    var regsiterVerificationView = Backbone.View.extend({
      initialize: function (option) {
        var selfobj = this;
        this.userID = option.userID;
        if(this.userID=="" || this.userID == null){
          app_router.navigate("login", { trigger: true });
        }
        this.slideList = [];
        this.slideList = new loginTemplateCollection();
        this.slideList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") {showResponse('',res,'');};
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.checkverification();
        });
      },
      events:
      {
        "click .loadSubView": "loadSubView",
        "click .submit": "verifyDetails",
        "click .resendCode": "resendCode",
        
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
        $(".profile-loader").hide();
      },
      initializeValidate: function () {
        var selfobj = this;
        $.validator.addMethod("passwordtxt", function (value, element) {
          return this.optional(element) || /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        }, "Invalid password format.");
        
        $("#verificationOTP").validate({
          rules: {
            txt_email_otp: {
              required: true,
            },
            txt_phone_otp: {
              required:true,
            },
            txt_password: {
              required: true,
              minlength: 8,
              passwordtxt:true,
            }
          },
          messages: {
            txt_email_otp: "Email OTP required.",
            txt_phone_otp: "Mobile OTP required.",
            txt_password: {
              required: "Please enter your password.",
              minlength: "Password must be at least 8 characters long.",
              passwordtxt: "Password must contain at least 1 uppercase letter, 1 number, and 1 special character."
           }
          },
        });
      },
      loadSubView: function (e) {
        e.preventDefault();
        var show = $(e.currentTarget).attr("data-show");
        switch (show) {
          case "companyDetails": {
            new regsiterCompanyView({});
            break;
          }
        }
      },
      verifyDetails: function (e) {
        e.preventDefault();
        var selfobj = this;
        if (!$("#verificationOTP").valid()) {
          return false;
        }
        $(e.currentTarget).html("<span>Verifying...</span>");
        $(e.currentTarget).attr("disabled", "disabled");

        $.ajax({
          url: APIPATH + 'verifyDetails',
          method: 'POST',
          data: {"emailOTP":$("#txt_email_otp").val(),"mobileOTP":$("#txt_phone_otp").val(),"txt_password":$("#txt_password").val(),"vcode":selfobj.userID},
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(e.currentTarget).html("<span>Verify</span>");
            $(e.currentTarget).removeAttr("disabled");
            if (res.flag == "F") {showResponse('',res,'');return;};
            if (res.flag == "S"){
              new regsiterCompanyView({userID:selfobj.userID});
            }
          }
        });
      },
      resendCode: function (e) {
        var selfobj = this;
        $.ajax({
          url: APIPATH + 'resendVerifyDetails',
          method: 'POST',
          data:{vcode:selfobj.userID},
          datatype: 'JSON',
          beforeSend: function (request) {
            $(e.currentTarget).html("<span>Sending...</span>");
            $(e.currentTarget).attr("disabled", "disabled");
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            $(e.currentTarget).html("<span>click here</span>");
            $(e.currentTarget).removeAttr("disabled");
            if (res.flag == "F") {showResponse('',res,'');return;};
            if (res.flag == "S"){
              showNotification("alert-success", "Verification code sent successfully..", null, null, null, null);
            }
          }
        });
      },
      checkverification:function(){
        var selfobj= this;
        //alert("sdsf");
        // new regsiterCompanyView({userID:selfobj.userID});
        // return;
        $.ajax({
          url: APIPATH + 'checkVerifyDetails',
          method: 'POST',
          data:{vcode:selfobj.userID},
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "S" && res.setup=="pending"){
              new regsiterCompanyView({userID:selfobj.userID});
            }else if(res.setup=="done"){
              app_router.navigate("login", { trigger: true });
            }else{
              selfobj.render();
            }
          }
        });
      },
      render: function () {
        var logintemp = registerOTP_temp;
        var template = _.template(logintemp);
        // this.$el.html(template());
        this.$el.html(template({"slideList": this.slideList ? this.slideList.models : [],}));
        $(".main_container").empty().append(this.$el);
        $('#owl-carousel').owlCarousel({
          loop: true,
          margin: 30,
          dots: true,
          nav: false,
          items: 1,
          autoplay: true,
          autoplayTimeout: 2500,
          autoplayHoverPause: true
        })
        this.initializeValidate();
        return this;
      },
    });
    return regsiterVerificationView;
  });