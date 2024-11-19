define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'owlcarousal',
  '../models/resetPasswordRequestModel',
  '../views/otpView',
  "../../loginTemplate/collections/loginTemplateCollection",
  'text!../templates/resetPasswordRequestTemp.html',
  'Swal'
], function ($, _, Backbone, validate, inputmask, owlcarousal, resetPasswordRequestModel, otpView,loginTemplateCollection, resetPasswordRequestTemp,Swal) {

  var resetPasswordRequestView = Backbone.View.extend({
    model: resetPasswordRequestModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      scanDetails = options.resetPassword;
      $('#userRoleData').remove();
      $(".popupLoader").show();
      this.model = new resetPasswordRequestModel();
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
      });
      // selfobj.render();
      // $(".popupLoader").hide();
    },
    events:
    {
      "click #sendRequest": "sendRequest",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
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
    validateEmail : function(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    sendRequest: function (e) {
      e.preventDefault();
      var methodt = "POST";
      if ($("#resetPasswordRequest").valid()) {
        var selfobj = this;
        console.log('email ',selfobj.model.get('email'));
        console.log('email ',selfobj.model.get('email'));
        if (!selfobj.validateEmail(selfobj.model.get('email'))) {
          showResponse('',{flag:'F' ,msg:'Invalid email format..!' },'');
          return;
        }
        $(e.currentTarget).html("<span>Sending..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            $(e.currentTarget).html("<span>Error</span>");
            showResponse('',res,'');
          } else {
            $(e.currentTarget).html("<span>Sent</span>");
            showResponse('',{flag:'S' ,msg:'Verification Link is Send !' },'');
            $('.modal-backdrop').hide();
            setTimeout(function () {
              window.location.href = '#login';
            }, 5000);
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Resend</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);

        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      $("#resetPasswordRequest").validate({
        rules: {
          email: {
            required: true,
          }
        },
        messages: {
          email: "Please enter valid Email address!"
        }
      });
    },
    render: function () {
      var source = resetPasswordRequestTemp;
      var template = _.template(source);
      this.$el.html(template({"slideList": this.slideList ? this.slideList.models : [],}));
      $(".main_container").empty().append(this.$el);
      $('#owl-carousel').owlCarousel({
        loop: true,
        margin: 30,
        dots: true,
        nav: false,
        items: 1,
        autoplay:true,
        autoplayTimeout:2000,
        autoplayHoverPause:true
    })
    this.initializeValidate();
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

  return resetPasswordRequestView;

});
