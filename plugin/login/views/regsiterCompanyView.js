define([
    'jquery',
    'underscore',
    'backbone',
    'owlcarousal',
    'RealTimeUpload',
    '../../core/views/countryExtList',
    '../models/loginModel',
    "../../loginTemplate/collections/loginTemplateCollection",
    'text!../templates/registerCompany_temp.html',
    'Swal'
  
  ], function ($, _, Backbone, owlcarousal,RealTimeUpload,countryExtList,loginModel,loginTemplateCollection, registerCompany_temp,Swal) {
    var regsiterCompanyView = Backbone.View.extend({
      model: loginModel,
      initialize: function (option) {
        var selfobj = this;
        this.userID = option.userID;
        this.model = new loginModel();
        this.slideList = [];
        this.countryListView = new countryExtList();
        this.countryExtList = this.countryListView.countryExtList;
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
        });
      },
      events:
      {
        "click .loadSubView": "loadSubView",
        "click .showHidePassword": "showHidePassword",
        "click .btnNext": "btnNext",
        "click .previous": "previous",
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
        let ctab = $(previousTab).attr('data-item');
        $(".progress-step").removeClass("green");
        for (let index = 1; index < ctab; index++) {
          $(".progress-step.form"+index).addClass("green");
        }
        if(ctab == 1){
          $(".progress-step.form"+1).addClass("green");
        }
        $(".progress-text").html(ctab+"/4");
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
            if ($(nextTab).attr('id') == 'form4') {
              $('.btnNext').hide();
              $(".preSubmit").show();
            }
            if ($(activeTab).attr('id') == 'form1') {
              $('.previous').removeAttr('disabled');
            }
            let ctab = $(activeTab).attr('data-item');
            $(".progress-step").removeClass("green");
            ctab = parseInt(ctab)  +1;
            for (let index = 1; index <= ctab; index++) {
              $(".progress-step.form"+index).addClass("green");
            }
            $(".progress-text").html(ctab+"/4")
            //$(".progress-step."+ctab).addClass("green");
  
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
        var show = $(e.currentTarget).attr("data-show");
        switch (show) {
          case "verification": {
            var userVerification = new regsiterCompanyView();
            break;
          }
        }
      },
      render: function () {
        var logintemp = registerCompany_temp;
        var template = _.template(logintemp);
        // this.$el.html(template());
        this.$el.html(template({"slideList": this.slideList ? this.slideList.models : [],countryExtList: selfobj.countryExtList}));
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
        });
        $("#companyLogo").RealTimeUpload({
          text: 'Drag and Drop or Select a File to Upload.',
          maxFiles: 1,
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: false,
          extension: ['png', 'jpg', 'jpeg'],
          // extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'customUpload',
          element: "companyLogo", // Use a unique identifier for each element
          onSucess: function () {
            selfobj.model.attributes.mediaArr.push(this.elements.uploadList[0].name);
            $('.modal-backdrop').hide();
          }
        });
        this.initializeValidate();
        return this;
      },
  
    });
  
    return regsiterCompanyView;
  
  });