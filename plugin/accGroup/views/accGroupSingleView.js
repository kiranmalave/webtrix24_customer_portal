define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepicker',
  '../models/singleAccGroupModel',
  '../../accGroup/collections/accGroupCollection',
  'text!../templates/accGroupSingle_temp.html',
], function($,_, Backbone,validate,inputmask,datepicker,singleAccGroupModel,accGroupCollection,accGrouptemp){

var accGroupSingleView = Backbone.View.extend({
    model:singleAccGroupModel,
    initialize: function(options){
        var selfobj = this;
        $(".modelbox").hide();
        scanDetails = options.searchAccGroup;
        $('#accGroupData').remove();
        $(".popupLoader").show();
        var accGroupList = new accGroupCollection();
      
        this.model = new singleAccGroupModel();
        accGroupList.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{getAll:'Y'}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.model.set("accGroupList",res.data);
            selfobj.render();
          });

        if(options.accGroupID != ""){
          this.model.set({accGroupID:options.accGroupID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler}).done(function(res){
            console.log("sdsdsd");
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
           
          });
        }else
        {
           selfobj.render();
           $(".popupLoader").hide();
        }
    },
    events:
    {
      "click #saveAccGroupDetails":"saveAccGroupDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel":"setValues",
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
      console.log(this.model);
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
          console.log(classname[0]);
          console.log(selfobj.model);
        }
      }, 500);
    },
    saveAccGroupDetails: function(e){
      e.preventDefault();
      var bid = this.model.get("accGroupID");
      
      if(permission.edit != "yes"){
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if(bid == "" || bid == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#accGroupDetails").valid()){
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
         this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            showResponse(e,res,'');
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
      console.log("validate initialize");
        $("#accGroupDetails").validate({
        rules: {
          accGroupName:{
             required: true,
          }
        },
        messages: {
          accGroupName: "Please enter acc Group Name",
        }
      });
    },
    render: function(){
      var isexits = checkisoverlay("accGroupData");
      if(!isexits){
        var source = accGrouptemp;
        var template = _.template(source);

        //var template = _.template(menuTemp);
        this.$el.html(template(this.model.attributes));
        this.$el.addClass("overlay");
        this.$el.addClass("accGroupData");
        this.$el.data("current","yes");
        //this.$el.html(res);
        $(".overlay-main-container").append(this.$el);
        this.initializeValidate();
        this.setValues();
      }
        rearrageOverlays();
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return accGroupSingleView;
  
});
