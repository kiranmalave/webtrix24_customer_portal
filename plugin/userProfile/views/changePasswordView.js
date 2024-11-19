
define([
    'jquery',
    'underscore',
    'backbone',
    'datepickerBT',
    'Swal',
    'moment',
    '../models/changePasswordModel',
    'text!../templates/changePasswordTemp.html',
  ], function ($, _, Backbone, datepickerBT, Swal, moment, changePasswordModel, changePasswordTemp) {
  
    var changePasswordView = Backbone.View.extend({
      module_desc:'',
      plural_label:'',
      form_label:'',
      currPage: 0,
      initialize: function (options) {
        var selfobj = this;
        this.View = "changePasswordView";
        this.changePaswordModel = new changePasswordModel();
        this.changePaswordModel.set({ adminID: $.cookie('authid') });
        $(".profile-loader").show();
        this.render();
      },
      events:
      {
        "change .txtchange": "updateOtherDetails",
        "click .confirmChangePass": "confirmChangePass",
        "click .showHidePassword": "showHidePassword",
      },

      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.changePaswordModel.set(newdetails);
        console.log(this.changePaswordModel);
      },
  
      confirmChangePass: function (e){
        e.preventDefault();
        var id = this.changePaswordModel.get("adminID");
        console.log(id)
        if (id != "0" || id == "") {
            var methodt = "POST";
        } else {
            var methodt = "PUT";
        }
        var oldPass = $('#current_password').val();
        var newPass = $('#new_password').val();
        var confirmPass = $('#confirm_password').val();
        if(oldPass == ''){
          showResponse('',{ flag:'F' , msg: 'Current Password is Empty..!' },'');
          return;
        } 
        if(newPass == ''){
          showResponse('',{ flag:'F' , msg: 'New Password is Empty..!' },'');
          return;
        } 
        if(confirmPass == ''){
          showResponse('',{ flag:'F' , msg: 'Confirm Password is Empty..!' },'');
          return;
        } 
        if (newPass !== confirmPass) {
          showResponse('',{ flag:'F' , msg: 'New password and confirm password do not match.' },'');
          return;
        }
        (oldPass != '')? this.changePaswordModel.set({'isUpdatePassword': 'yes'}):this.changePaswordModel.set({'isUpdatePassword': 'no'});
        if ($("#changePasswordDetails").valid()) {
            var selfobj = this;
            $(e.currentTarget).html("<span>Saving..</span>");
            $(e.currentTarget).attr("disabled", "disabled");
            this.changePaswordModel.save({}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
            }, error: selfobj.onErrorHandler, type: methodt
            }).done(function (res) {
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "F") {
              showResponse(e,res,'');
            } else {
                $(e.currentTarget).html("<span>Saved</span>");
                $('#changePasswordModal').modal('toggle');
            }
            setTimeout(function () {
                $(e.currentTarget).html("<span>Save</span>");
                $(e.currentTarget).removeAttr("disabled");
            }, 3000);
            });
        }
      },

      showHidePassword: function (e) {
        var value = $(e.currentTarget).attr('data-value');
        if(value == "currentPass"){
          var currentval = $("#current_password").attr("type");
          if (currentval == "password") {
            $("#current_password").attr("type", "text");
            $('#curEyeIcon').text('visibility');
          }
          if (currentval == "text") {
            $("#current_password").attr("type", "password");
            $('#curEyeIcon').text('visibility_off');
          }
        }else if (value == "newPass"){
          var currentval = $("#new_password").attr("type");
          if (currentval == "password") {
            $("#new_password").attr("type", "text");
            $('#newEyeIcon').text('visibility');
          }
          if (currentval == "text") {
            $("#new_password").attr("type", "password");
            $('#newEyeIcon').text('visibility_off');
          }
        }else if (value == "confirmPass"){
          var currentval = $("#confirm_password").attr("type");
          if (currentval == "password") {
            $("#confirm_password").attr("type", "text");
            $('#conEyeIcon').text('visibility');
          }
          if (currentval == "text") {
            $("#confirm_password").attr("type", "password");
            $('#conEyeIcon').text('visibility_off');
          }
        }
        
      },
      
      onErrorHandler: function (collection, response, options) {
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
      },
      
      render: function () {
        let selfobj = this;
        var template = _.template(changePasswordTemp);
        this.$el.html(template());
        $('#changePassMainDiv').empty();
        $("#changePassMainDiv").append(this.$el);
        return this;
      }
    });
  
    return changePasswordView;
  
  });
  
  