define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../../core/views/multiselectOptions',
  '../models/singleuserRoleModel',
  'text!../templates/userRoleSingle_temp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT, Swal,multiselectOptions,singleuserRoleModel,userRoletemp){

var userRoleSingleView = Backbone.View.extend({
    model:singleuserRoleModel,
    form_label:'',
    initialize: function(options){
      var selfobj = this;
      this.toClose = "userRoleSingleView";
      this.pluginName = "menuList";
      this.form_label = options.form_label;
      this.load_from = options.load_from;
      // $(".modelbox").hide();
      scanDetails = options.searchuserRole;
      this.multiselectOptions = new multiselectOptions();
      $(".popupLoader").show();
      this.model = new singleuserRoleModel();

      if(options.roleID != "" && options.roleID != undefined){
        this.model.set({roleID:options.roleID});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler}).done(function(res){
          if (res.flag == "F") showResponse('',res,'');
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.render();
        });
      }else{
        selfobj.render();
      }
    },

    events:
    {
      "click #saveuserRoleDetails":"saveuserRoleDetails",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
    },

    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },

    updateOtherDetails: function(e){
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.model.set(newdetails);
    },

    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status","isParent","isClick","linked","is_custom"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },

    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },

    saveuserRoleDetails: function(e){
      e.preventDefault();
      var selfobj = this;
      var rid = this.model.get("roleID");
      let isNew = $(e.currentTarget).attr("data-action");
      if(rid == "" || rid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#userRoleDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if (res.flag == "F"){
            showResponse('',res,'');
            return
          } 
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(isNew == "new"){
            showResponse(e,res,"Save & New");
          }else{
            showResponse(e,res,"Save");
          }
          
          if(res.flag == "S"){
            if(isNew == "new"){
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.render();
            }else{
              handelClose(selfobj.toClose);
            }
            if (selfobj.load_from == 'addAdminView') {
              scanDetails.fetchUserRoleList();
            }else{
              scanDetails.filterSearch();
            }
          }
        });
      }
    },

    initializeValidate:function(){
      var selfobj = this;
        $("#userRoleDetails").validate({
        rules: {
          roleName:{
             required: true,
          }
        },
        messages: {
          roleName: "Please enter User Role Name"
        }
      });
    },

    render: function(){
      let selfobj = this;
      this.undelegateEvents();
      var source = userRoletemp;
      var template = _.template(source);
      $("#"+this.toClose).remove();
      this.$el.html(template({"model":this.model.attributes}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id',this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role","tabpanel");
      this.$el.data("current","yes");
      $(".ws-tab").append(this.$el);
      $('#'+this.toClose).show();
      this.initializeValidate();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label,this.toClose);
      this.delegateEvents();
      return this;
    },onDelete: function(){
        this.remove();
    }
});

  return userRoleSingleView;
    
});
