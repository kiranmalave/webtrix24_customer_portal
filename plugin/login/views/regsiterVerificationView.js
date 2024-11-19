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
      model: loginModel,
      resetReqmodel: resetPasswordRequestModel,
      initialize: function (option) {
        var selfobj = this;
        this.userID = option.userID;
        this.model = new loginModel();
        this.resetReqmodel = new resetPasswordRequestModel();
        this.slideList = [];
        this.slideList = new loginTemplateCollection();
        this.slideList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          console.log(res);
          if (res.flag == "F") {showResponse('',res,'');};
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      },
      events:
      {
        "click .loadSubView": "loadSubView",
        "click .showHidePassword": "showHidePassword",
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
        $(".profile-loader").hide();
      },
      initializeValidate: function () {
        var selfobj = this;
        $("#loginForm").validate({
          rules: {
            txt_username: {
              required: true,
            },
            txt_password: {
              required:true,
            }
          },
          messages: {
            txt_username: "Enter Username / Email / Mobile No .",
            txt_password: "Enter Password"
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