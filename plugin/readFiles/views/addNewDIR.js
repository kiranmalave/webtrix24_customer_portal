define([
  'jquery',
  'underscore',
  'backbone',
  'RealTimeUpload',
  '../models/addNewDIRModel',
  'text!../templates/addNewDIRTemp.html',
], function($,_, Backbone,RealTimeUpload,addNewDIRModel,addNewDIRTemp){

var addNewFileView = Backbone.View.extend({
    initialize: function(options){
      var selfobj = this;
      this.model=new addNewDIRModel()
      $(".modelbox").hide();
      $('.modal-dialog').removeClass("modal-lg");
      scanDetails = options.searchVideos;
      var folderPath=options.folderPath;
      this.model.set({folderPath:folderPath})
      $('#addNewFileInFolder').html("");
      $('#addNewFileInFolder').remove();
      this.render();
    },
    events:
    {
      // "click #saveuserRoleDetails":"saveuserRoleDetails",
      // "change .fileAdded": "updateImage",
      "click #saveuserRoleDetails":"saveuserRoleDetails",
      "change .txtchange":"updateOtherDetails",
       
    },

    // updateImage: function(e){
    //   var newdetails=[];
    //   $(e.currentTarget.files).each(function(index,data){
    //      var reader = new FileReader();
    //       reader.readAsDataURL(data);
    //       reader.onload = function (e) {

    //        newdetails.push(reader.result)

    //      };

    //   })
    //   this.model.set({fileList:newdetails})
      
    // },

    updateOtherDetails: function(e){

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.model.set(newdetails);
    },
    
    saveuserRoleDetails: function(e){
      e.preventDefault();
        var selfobj = this;
        $(e.currentTarget).html("<span>Adding..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:"POST"}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            showResponse(e,res,'');
            $(e.currentTarget).html("<span>Error</span>");
          }else{
            $(e.currentTarget).html("<span>Adding</span>");
            $('.modal-backdrop').hide();
            scanDetails.filterSearch();
          }
          
          setTimeout(function(){
            $(e.currentTarget).html("<span>Add</span>");
            $(e.currentTarget).removeAttr("disabled");
            }, 3000);
          
        });
    },
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },

    render: function(){
        var source = addNewDIRTemp;
        var template = _.template(source);
        this.$el.html(template());
        $("#modalBody").append(this.$el);
        $(".modal-title").html("Course Details");
        // this.setValues();
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return addNewFileView;
  
});
