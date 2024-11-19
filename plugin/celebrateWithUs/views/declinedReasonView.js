define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../models/declinedReasonModel',
  'text!../templates/declinedReasonTemp.html',
], function($,_,Backbone,validate,inputmask,datepickerBT,declinedReasonModel,declinedReasonTemp){

var declinedReasonView = Backbone.View.extend({
    model:declinedReasonModel,
    initialize: function(options){
        var selfobj = this;
        $(".modelbox").hide();
        $(".modal-dialog").removeClass('modal-lg');
        $(".modal-dialog").addClass('modal-md');
        scanDetails = options.searchcelebrateWithUs;
        $('#declinedData').remove();
        $(".popupLoader").show();
        this.model = new declinedReasonModel();
        if(options.celebrate_id != ""){
          this.model.set({celebrate_id:options.celebrate_id});
          this.model.set({confirmationStatus:"Declined"});
           selfobj.render();
           $(".popupLoader").hide();
        console.log(this.model);
        }
    },
    events:
    {
      "click #saveDeclinedDetails":"saveDeclinedDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
    },
    onErrorHandler: function(collection, response, options){
        alert("Something was wrong ! Try to refresh the page or contact administer. :(");
        $(".profile-loader").hide();
    },
    updateOtherDetails: function(e){
      var selfobj = this;
      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.model.set(newdetails);
    },
    setValues:function(e){
        setvalues = ["status"];
        var selfobj = this;
        $.each(setvalues,function(key,value){
          var modval = selfobj.model.get(value);
          if(modval != null){
            var modeVal = modval.split(",");
          }else{ var modeVal = {};}

          $(".item-container li."+value).each(function(){
            var currentval = $(this).attr("data-value");
            var selecterobj = $(this);
            $.each(modeVal,function(key,dbvalue){
              if(dbvalue.trim().toLowerCase() == currentval.toLowerCase()){
                $(selecterobj).addClass("active");
              }
            });
          });
          
        });
        setTimeout(function(){
        if(e != undefined && e.type == "click")
        {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li."+classname[0]).each(function(){
            var isclass = $(this).hasClass("active");
            if(isclass){
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }
         
          });

          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else{var newsetvalue = "";}

          objectDetails[""+classname[0]] = newsetvalue;
          $("#valset__"+classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
        }
      }, 500);
    },
    saveDeclinedDetails: function(e){
      e.preventDefault();
      var celebrate_id = this.model.get("celebrate_id");
    if(permission.edit != "yes"){
        alert("You dont have permission to edit");
        return false;
      }
      if(celebrate_id == "" || celebrate_id == null){
        var methodt = "POST";
      }else{
        var methodt = "PUT";
      }
      alert(celebrate_id);
      if($("#declinedDetails").valid()){
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            alert(res.msg);
            $(e.currentTarget).html("<span>Error</span>");
          }else{
            $(e.currentTarget).html("<span>Saved</span>");
            scanDetails.filterSearch();
          }
          
          setTimeout(function(){
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
            }, 3000);
          
        });
      }
    },
    initializeValidate:function(){
      var selfobj = this;
      $('#amountInFigure').inputmask('Regex',{regex: "^[0-9](\\d{1,10})?$"});
      // $('#panNumber').inputmask('Regex',{regex: " ^([A-Z0-9]{1,10})$"});
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
        var source = declinedReasonTemp;
        var template = _.template(source);
        this.$el.html(template({model:this.model.attributes}));
        $('#declineMedia').empty();
        $("#declineMedia").append(this.$el);
        var profile = this.model.get("userName");
        $(".modal-title").html("Celebrate With US");
        $('#declinedData').show();
        this.setValues();
        this.initializeValidate();
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return declinedReasonView;
    
});
