define([
    'jquery',
    'underscore',
    'backbone',
    'owlcarousal',
    '../models/loginModel',
    '../models/resetPasswordRequestModel',
    '../../core/views/countryExtList',
    '../views/resetPasswordRequestView',
    '../views/regsiterVerificationView',
    "../../loginTemplate/collections/loginTemplateCollection",
    'text!../templates/register_temp.html',
    'Swal'
  
  ], function ($, _, Backbone, owlcarousal, loginModel,resetPasswordRequestModel,countryExtList, resetPasswordRequestView,regsiterVerificationView,loginTemplateCollection, register_temp,Swal) {
    var loginView = Backbone.View.extend({
      model: loginModel,
      resetReqmodel: resetPasswordRequestModel,
      initialize: function () {
        var selfobj = this;
        this.model = new loginModel();
        this.resetReqmodel = new resetPasswordRequestModel();
        this.countryListView = new countryExtList();
        this.slideList = new loginTemplateCollection();
        this.slideList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") {showResponse('',res,'');};
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
          $(".right-layout").hide();
        });
      },
      events:
      {
        "click #user-login": "registerandVerify",
        "blur #txt_username": "setUsername",
        "blur #txt_password": "setPassword",
        "click .loadSubView": "loadSubView",
        "click .showHidePassword": "showHidePassword",
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
        $(".profile-loader").hide();
      },
      registerandVerify: function (e) {
        e.preventDefault();
        var selfobj = this;
        
        //var pass = $("#txt_password").val();
        //console.log('verify : ',$("#loginForm").valid());
        if (!$("#getUserDetails").valid()) {
          return false;
        }
        $.ajax({
          url: APIPATH + 'registeruser',
          method: 'POST',
          data: {},
          datatype: 'JSON',
          crossDomain: true,
          beforeSend: function (request) {
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") {showResponse('',res,'');return;};
            //var code = res.data.salt;
            new regsiterVerificationView({ userID:1});
          }
        });
      },
      initializeValidate: function () {
        var selfobj = this;
        $("#getUserDetails").validate({
          rules: {
            txt_fname: {
              required: true,
            },
            txt_email: {
              email:true,
              required:true,
            },
            txt_phone: {
            onlyInteger:true
            }
          },
          messages: {
            txt_fname:"Please provide your name",
            txt_email:"Please provide your valid email address",
            txt_phone:"Please provide your valid phone number",
          },
        });
        $(".ws-select").selectpicker('refresh');
      },
      loadSubView: function (e) {
        var show = $(e.currentTarget).attr("data-show");
        switch (show) {
          case "verification": {
            var userVerification = new regsiterVerificationView({ resetPassword: this });
            break;
          }
        }
      },
      render: function () {
        var logintemp = register_temp;
        var template = _.template(logintemp);
        // this.$el.html(template());
        console.log(this.slideList.models);
        this.$el.html(template({"slideList":this.slideList.models,countryExtList:this.countryListView.countryExtList}));
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
  
    return loginView;
  
  });