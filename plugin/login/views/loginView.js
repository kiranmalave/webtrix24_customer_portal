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

    showRegisterForm: function () {
      $(".login_row").hide();
      $(".right-layout").show();
      $(".previous").hide();
      $(".preSubmit").hide();
    },

    previous: function () {
      var activeTab = document.querySelector('.active-tab');
      var previousTab;
      $(".preSubmit").hide();
      $('.btnNext').show();
      if (activeTab) {
        previousTab = activeTab.previousElementSibling;
        if (previousTab && previousTab.classList.contains('form-contents')) {
          activeTab.classList.remove('active-tab');
          previousTab.classList.add('active-tab');
          if (previousTab.getAttribute('id') == 'form1') {
            $('.previous').attr('disabled', true);
          }
        } else {
          //console.log("No next tab available");
        }
      } else {
        // If no tab is currently active, add active-tab to the first tab
        var firstTab = document.querySelector('.form-contents');
        if (firstTab) {
          firstTab.classList.add('active-tabPre');
        } else {
          //console.log("No form is currently available");
        }
      }
    },

    btnNext: function () {
      var activeTab = document.querySelector('.active-tab');
      var nextTab;

      // this.valid= this.validateNotification(activeTab.id)
      // if(!this.valid)
      //   return;     
      if (activeTab) {
        $(".previous").show();
        nextTab = activeTab.nextElementSibling;
        if (nextTab && nextTab.classList.contains('form-contents')) {

          activeTab.classList.remove('active-tab');
          nextTab.classList.add('active-tab');
          if ($(nextTab).attr('id') == 'form5') {
            $('.btnNext').hide();
            $(".preSubmit").show();
          }
          if ($(activeTab).attr('id') == 'form1') {
            $('.previous').removeAttr('disabled');
          }

        } else {
          //console.log("No next tab available");
        }

      } else {
        // If no tab is currently active, add active-tab to the first tab
        var firstTab = document.querySelector('.form-contents');
        if (firstTab) {
          firstTab.classList.add('active-tab');
        } else {
          //console.log("No form is currently available");
        }
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

    setUsername: function (e) {
      this.model.set({ username: $(e.currentTarget).val() });
      this.resetReqmodel.set({ username: $(e.currentTarget).val() });
    },

    setPassword: function (e) {
      this.model.set({ password: $(e.currentTarget).val() });
      this.resetReqmodel.set({ password: $(e.currentTarget).val() });
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
      $(".profile-loader").hide();
    },

    loadSubView: function (e) {
      var show = $(e.currentTarget).attr("data-show");
      switch (show) {
        case "forgotPassword": {
          var resetPasswordRequestview = new resetPasswordRequestView({ resetPassword: this });
          break;
        }
      }
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
    getCookieValue: function (name) {
      const cookies = document.cookie.split('; ');
      console.log("cookies",cookies);
      for (let cookie of cookies) {
          const [key, value] = cookie.split('=');
          if (key === name) {
              return decodeURIComponent(value); // Return the decoded cookie value
          }
      }
      return null; // Return null if the cookie is not found
    },
    checkLogin: function (e) {
      e.preventDefault();
      var selfobj = this;
      var pass = $("#txt_password").val();
      //console.log('verify : ',$("#loginForm").valid());
      if (!$("#loginForm").valid()) {
        return false;
      }
      $.ajax({
        url: APIPATH + 'salt',
        method: 'GET',
        data: {},
        datatype: 'JSON',
        crossDomain: true,
        beforeSend: function (request) {
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {showResponse('',res,'');return;};
          var code = res.data.salt;
          var md5val = md5(pass);
          var res = md5val.substring(0, 30);
          var combine = res + code;
          var shaval = sha1(combine);
          var shaval_ss = shaval.substring(0, 30);
          selfobj.model.set({ password: shaval_ss });
          selfobj.model.set({ gfcmToken: window.localStorage.getItem('gfcmt') });
          var self = selfobj;
          $(e.currentTarget).html("<span>Validating...</span>");
          
          var userDetails = ({ username: selfobj.model.get("username"), password: selfobj.model.get("password"), Bearer:code, gfcmToken: selfobj.model.get("gfcmToken") });
          selfobj.model.fetch({
            headers: {
              'contentType': 'application/x-www-form-urlencoded', 'Accept': 'application/json'
            }, type: 'POST', error: self.onErrorHandler, data: userDetails
          }).done(function (res) {
            if (res.flag == "F") {
              if (res.statusCode == 314) {
                selfobj.showSwal();
              }else{
                showResponse(e, res, "Sign In");
              }
              setTimeout(function () {
                $(e.currentTarget).html("<span>Sign In</span>");
              }, 3000);
              return false;
            } else {
              var expDate = new Date();
              expDate.setTime(expDate.getTime() + (120 * 60 * 12000)); // add 15 minutes
              if (res.data.user_setting) { localStorage.setItem("user_setting", res.data.user_setting);}
              $.cookie('bbauth', 'valid', { path: COKI, expires: expDate });
              $.cookie('_bb_key', res.loginkey, { path: COKI, expires: expDate });
              $.cookie('name', res.data.name, { path: COKI, expires: expDate });
              $.cookie('photo', res.data.photo, { path: COKI, expires: expDate });
              $.cookie('uname', res.data.userName, { path: COKI, expires: expDate });
              $.cookie('authid', res.data.adminID, { path: COKI, expires: expDate });
              $.cookie('company_id', res.data.default_company, { path: COKI, expires: expDate });
              $.cookie('roleOfUser', res.data.roleOfUser, { path: COKI, expires: expDate });
              $.cookie('userRole', res.data.userRole, { path: COKI, expires: expDate });
              $.cookie("user_setting", res.data.user_setting, { path: COKI, expires: expDate });
              $.cookie("time_format", res.data.time_format, { path: COKI, expires: expDate });
              $.cookie("role_slug", res.data.slug, { path: COKI, expires: expDate });
              var bbauth = $.cookie('bbauth');
              ADMINNAME = $.cookie('name');
              TIMEFORMAT = $.cookie('time_format');
              INITIALS = selfobj.getInitials(ADMINNAME);
              PROFILEIMG = $.cookie('photo');
              ROLESLUG = $.cookie('role_slug');
              ADMINID = $.cookie('authid');
              getLocalData();
              $(e.currentTarget).html("<span>Sign In</span>");
              app_router.navigate("dashboard", { trigger: true });
            }
          });
        }
      });
    },
    showSwal : function(){
      var self = this;
      Swal.fire({
        title: "User Not Verified ",
        text: "Do you want to Resend Verification Link !!",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Resend Link',
        animation: "slide-from-top",
      }).then((result) => {
        if (result.isConfirmed) {
          // $(e.currentTarget).html("<span>Sending..</span>");
          // $(e.currentTarget).attr("disabled", "disabled");
          //console.log(self.resetReqmodel.attributes);
          var methodt = "POST";
          self.resetReqmodel.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: self.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "F") {
              showResponse('',res,'');
            } else {
              showResponse('',{'flag':'F','msg':'Verification Link is Send !' },'');
              $('.modal-backdrop').hide();
              $('#txt_username,#txt_password').val('');
              setTimeout(function () {
                window.location.href = '#login';
              }, 3000);
            }
            setTimeout(function () {
              // $(e.currentTarget).html("<span>Resend</span>");
              // $(e.currentTarget).removeAttr("disabled");
            }, 3000);
  
          });
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