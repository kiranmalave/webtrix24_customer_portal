define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'Swal',
  '../models/resetPasswordRequestModel',
  '../models/verificationModel',
  "../../loginTemplate/collections/loginTemplateCollection",
  '../views/otpView',
  'text!../templates/verifyUser.html',
], function ($, _, Backbone, validate, inputmask, Swal,resetPasswordRequestModel,verificationModel, loginTemplateCollection,otpView, verifyUserTemp) {

  var verificationView = Backbone.View.extend({
    model: verificationModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      // scanDetails = options.resetPassword;
      $('#userRoleData').remove();
      $(".popupLoader").show();

      this.model = new verificationModel();
      this.resetReqmodel = new resetPasswordRequestModel();
      this.slideList = [];
      this.slideList = new loginTemplateCollection();
      this.slideList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
        $(".right-layout").hide();
      });
      //selfobj.render();
    },
    events:
    {
      "click #verifyCodeAndPass": "checkotp",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click .showHidePassword": "showHidePassword",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {  
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
    },
    showHidePassword: function (e) {
      var currentval = $(e.currentTarget).siblings('input').attr("type");
      console.log('currentVal :', currentval);
      switch (currentval) {
          case 'password':
              $(e.currentTarget).siblings('input').attr("type", "text");            
              $(e.currentTarget).children('span').text('visibility');
              break;
          case 'text':
              $(e.currentTarget).siblings('input').attr("type", "password");    
              $(e.currentTarget).children('span').text('visibility_off');
              break;
          default:
              break;
      }
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

    checkotp: function (e) {
      e.preventDefault();
      var selfobj = this;
      var searchParams = new URLSearchParams(location.href);
      var code = searchParams.get('vfcode');
      var adminID = searchParams.get('auth-id');
      this.model.set({'vfcode':code});
      this.model.set({'userID':adminID});
      var methodt = "POST";
      if ($("#verifyUser").valid()) {
        if (selfobj.model.get("password") != selfobj.model.get("confirmPassword")) {
          showResponse('',{ flag:'F' , msg: 'Password Not Match' },'');
          return false;
        }
        $(e.currentTarget).html("<span>Updating...</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse('',res,'');
            $(e.currentTarget).html("<span>Error</span>");
          }else{
            showResponse('',res,'');
            window.location.href = '#login';
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Verify And Update</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    initializeValidate: function () {
      $("#verifyUser").validate({
        rules: {
          confirmPassword: {
            required: true,
          },
          password: {
            required: true,
          },
        },
        messages: {
          password: "Please enter Password",
          confirmPassword: "Please Confirm Password",
        }
      });
    },
    showSwal : function(){
      var self = this;
      Swal.fire({
        title: "Invalid Verification Code ",
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
          console.log(self.resetReqmodel.attributes);
          var methodt = "POST";
          self.resetReqmodel.save({}, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: self.onErrorHandler, type: methodt
          }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "F") {
             Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
            } else {
              Swal.fire({
                title: 'Verification Link is Send !',
                text: res.msg,
                timer: 2000,
                icon: 'info',
                showConfirmButton: false
              });
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
      var source = verifyUserTemp;
      var template = _.template(source);
      this.$el.html(template({"slideList": this.slideList ? this.slideList.models : [],}));
      $(".main_container").empty().append(this.$el);
      this.initializeValidate();
      $('#owl-carousel').owlCarousel({
        loop: true,
        margin: 30,
        dots: true,
        nav: false,
        items: 1,
        autoplay:true,
        autoplayTimeout:2500,
        autoplayHoverPause:true
      })
      return this;

      // var source = resetPasswordRequestTemp;
      // var template = _.template(source);
      // this.$el.html(template(this.model.attributes));
      // $("#modalBody").append(this.$el);

      // var profile = this.model.get("userName");
      // $(".modal-title").html("Reset Passowrd");
      // $('#userRoleData').show();
      // this.setValues();
      // return this;
    }, onDelete: function () {
      this.remove();
    }
  });

  return verificationView;

});
