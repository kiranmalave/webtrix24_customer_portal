define([
  'jquery',
  'underscore',
  'backbone',
  'owlcarousal',
  '../models/loginModel',
  '../models/resetPasswordRequestModel',
  '../views/resetPasswordRequestView',
  "../../loginTemplate/collections/loginTemplateCollection",
  'text!../templates/login_temp.html',
  'Swal'

], function ($, _, Backbone, owlcarousal, loginModel,resetPasswordRequestModel, resetPasswordRequestView,loginTemplateCollection, temploginTemplate,Swal) {
  var loginView = Backbone.View.extend({
    model: loginModel,
    resetReqmodel: resetPasswordRequestModel,
    initialize: function () {
      var selfobj = this;
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
        $(".right-layout").hide();
      });
      // this.render();
      // $(".right-layout").hide();
    },

    events:
    {
      "click #user-login": "checkLogin",
      "blur #txt_username": "setUsername",
      "blur #txt_password": "setPassword",
      "click .loadSubView": "loadSubView",
      "click .showHidePassword": "showHidePassword",
      "click .register-btn": "showRegisterForm",
      "click .btnNext": "btnNext",
      "click .previous": "previous",

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
    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
      $(".profile-loader").hide();
    },
    getInitials: function (name) {
      const words = name.split(' ');
      const initials = words.map(word => word.charAt(0));
      //console.log("nameDetails", initials)
      return initials.join('').toUpperCase();

    },
    initializeValidate: function () {
      var selfobj = this;
      $("#loginForm").validate({
        rules: {
          account_id: {
            required: true,
          },
          txt_username: {
            required: true,
          },
          txt_password: {
            required:true,
          }
        },
        messages: {
          account_id: "Enter your account number",
          txt_username: "Enter Username / Email / Mobile No .",
          txt_password: "Enter Password"
        },
      });
    },
    checkLogin: function (e) {
      e.preventDefault();
      var selfobj = this;
      var username = $("#txt_username").val();
      var password = $("#txt_password").val();
      var account_id = $("#account_id").val();
      //console.log('verify : ',$("#loginForm").valid());
      if (!$("#loginForm").valid()) {
        return false;
      }
      $.ajax({
        url: APIPATH + 'checkAccount/',
        method: 'POST',
        data: {username:username,password:password,account_id:account_id},
        datatype: 'JSON',
        crossDomain: true,
        beforeSend: function (request) {
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {showResponse('',res,'');return;};
          if(res.flag == "S"){
            setTimeout(() => {
              window.location.href = "https://"+res.account_name+".webtrix24.com/#login?&token="+res.token;
            },2000);
          }
        }
      });
    },
    render: function () {
      var logintemp = temploginTemplate;
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
      this.uploadFileEl = $("#companyLogoUpload").RealTimeUpload({
        text: 'Company Logo',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton: false,
        notification: true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'docx', 'doc', 'xls', 'xlsx'],
        thumbnails: true,
        action: APIPATH + 'companyLogoUpload',
        element: 'companyLogoUpload',
        onSucess: function () {
          selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
          $('.modal-backdrop').hide();
        }
      })
      return this;
    },

  });

  return loginView;

});