
define([
  'jquery',
  'underscore',
  'backbone',
  'moment',
  'multiselect',
  '../models/companyAccess',
  
  'text!../templates/assignCompany.html',
], function($,_, Backbone,moment,multiselect,companyAccess,assignCompany){

var accessCompanyDetails = Backbone.View.extend({
    model:companyAccess,
    initialize: function(options){
      var selfobj = this;
      scanDetails = options.searchadmin;
      $(".profile-loader").show();
      $(".modelbox").hide();
      $("#adminAccessData").remove();
      
      $(".modal-dialog").addClass("modal-lg");
      this.model = new companyAccess();
      this.model.set({"adminID":options.adminID});
      //var companyList = new companyCollection();

      this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'POST',data:{getAll:'Y'}}).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.model.set("companyList",res.data['companyList']);
          selfobj.model.set("companyAccess",res.data['companyAccess']);
          selfobj.render();
      });
      $(".profile-loader").hide();
      //_.bindAll(this,"update");
      //this.bind('change : cost', this.update);
    },
    events:
    {
      "click .loadview":"loadSubView",
      "change .switchChange":"updateOtherDetails",
      "click #saveAccessDetails": "saveAccessDetails",
      "change #roleID": "loadModuleList",
      //"change .dropval":"updateOtherDetails",
    },
    updateOtherDetails: function(e){
      var collid = $(e.currentTarget).attr("data-modelID");
      var initID = $(e.currentTarget).attr("data-inID");
      var ischeck = $(e.currentTarget).is(":checked");
      if(ischeck){
        var newsetval = [];
        newsetval[""+initID] = "yes";
      }else{
        var newsetval = [];
        newsetval[""+initID] = "no";
      }


      var mm = this.collection.get(collid);
      mm.set(newsetval);
      this.collection.set(mm,{remove: false});
     
    },
    saveAccessDetails: function(e){
      selfobj = this;
      var addIds = [];
      $('#companyListData_to option').each(function(){
            addIds.push($(this).val());
      });
       var idsToaccess = addIds.toString();
      if(idsToaccess == ''){
        alert("Please select at least one Company.");
        return false;
      }

      var accessList = $("#companyListData_to").val();
      $.ajax({
        url:APIPATH+'userAccess',
        method:'POST',
        data:{list:idsToaccess,adminID:selfobj.model.get("adminID")},
        datatype:'JSON',
         beforeSend: function(request) {
          $(e.currentTarget).html("<span>Updating..</span>");
          request.setRequestHeader("token",$.cookie('_bb_key'));
          request.setRequestHeader("SadminID",$.cookie('authid'));
          request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept",'application/json');
        },
        success:function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "S"){
             
            scanDetails.filterSearch();
              
          }
          setTimeout(function(){
              $(e.currentTarget).html("<span>Saved</span>");
          }, 3000);
          
        }
      });

       
    },
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    loadSubView:function(e){
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-show");
        switch(show)
        {
          case "singleemployeeData":{
            var employeeID = $(e.currentTarget).attr("data-employeeID");
            var employeesingleview = new employeeSingleView({employeeID:employeeID,searchemployee:this});
            break;
          }
        }
    },
    loadModuleList:function(e){ 
      var selfobj = this;
      var roleID = $(e.currentTarget).val();
      if (roleID =="") {
        return false;
      }
      this.collection.roleID= roleID;
      this.collection.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler}).done(function(res){
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.render();
      });
 
    },
    render: function(){
        var template = _.template(assignCompany);
        this.$el.html(template(this.model.attributes));
       // $(".main_container").append(this.$el);
        $("#modalBody").append(this.$el);
        $(".modal-title").html("Access Details");
       // $('#companyID').select2({width:'100%'});
        $('#companyListData').multiselect();
        return this;
    }
});

  return accessCompanyDetails;
  
});
