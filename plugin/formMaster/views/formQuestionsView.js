define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'jqueryUI',
  '../models/formMasterQuestionModel',
  '../models/formMasterQuestionsSectionModel',
  '../models/selectedMenueModel',
  '../../readFiles/views/readFilesView',
  '../collections/formQuestionMasterCollection',
  '../collections/formMaterSectionCollection',
  'text!../templates/formMasterQuestionTemp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,jqueryUI,formMasterQuestionModel,formMasterQuestionsSectionModel,selectedMenueModel,readFilesView,formQuestionMasterCollection,formMaterSectionCollection,formMasterQuestionTemp){

var formQuestionsView = Backbone.View.extend({
     
    initialize: function(options){
       
        var selfobj = this;
        $(".profile-loader").show();

        var mname = Backbone.history.getFragment();
        // permission = ROLE[mname];
        var formID=options.action;
        this.formID=options.formID;///saving with this 'this' because formID accesing in changeStatusListElement function
        readyState = true;
        this.model = new formMasterQuestionModel();//model for save Question With Form ID
        this.formQuestionMaster = new formQuestionMasterCollection();//collection For fetch Question Under that formID,formID has passed with data
        this.sectionModel = new formMasterQuestionsSectionModel();
        this.sectionCollection = new formMaterSectionCollection();
        this.selectedMenu = new selectedMenueModel()
        this.model.set({formID:this.formID})
        this.sectionCollection.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{formID:selfobj.formID,status:'active',getAll:'Y'}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(res.data.length){ selfobj.selectedMenu.set({sectionID:res.data[0].sectionID})
                this.formQuestionMaster.fetch({headers: {
                  'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                   },error: selfobj.onErrorHandler,data:{sectionID:res.data[0].sectionID,formID:selfobj.formID,status:'active',getAll:'Y'}}).done(function(res){
                   if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                    $(".popupLoader").hide();    
                    selfobj.render();
                    selfobj.setValues();
          });
            }
            $(".popupLoader").hide();
            selfobj.render();
          });

          //formID Saved in model for save new Question With Form ID. 
         if(this.sectionCollection.models.length>0)
         {
          alert("hello")
         }

           this.formQuestionMaster.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{formID:selfobj.formID,status:'active',getAll:'Y'}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });
        
     
      
    },
    events:
    {
      "click .addQuestion":"saveformQuestionDetails",
      "click #saveSectionDetails2":"saveformQuestionDetails2",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "blur .txtchange2":"updateOtherDetails2",
      "change .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
      "click .multiselect": "getMulipleSelectedValue",
      "click .editQuestion": "editQuestion",
      "click .changeStatus": "changeStatusListElement",
      "click .loadview": "loadSubView",
      "change .fileAdded": "updateImage",
      "click .deleteQuestionImage":"deleteQuestionImage",
      "change .changeMenu":"changeMenu",
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
    updateOtherDetails2: function(e){

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      newdetails[""+toID]= valuetxt;
      this.sectionModel.set(newdetails);
    },
    changeMenu:function(e)
    {
      var selfobj= this;
      var sectionID = $(e.currentTarget).val();
      this.selectedMenu.set({sectionID:sectionID})
      if(sectionID=="")
      {
         this.formQuestionMaster.reset();
      }
      this.formQuestionMaster.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{formID:selfobj.formID,sectionID:sectionID,status:'active',getAll:'Y'}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });

    },
      deleteQuestionImage:function(e)
      {
        var questionID = this.model.attributes.questionID;
        if(questionID!=null)
        {

          $.ajax({
            url:APIPATH+'deleteQuestionImage', 
            method:'POST',
            data:{questionID:questionID,action:"deleteQuestionImage"},
            datatype:'JSON',
             beforeSend: function(request) {
              $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept",'application/json');
            },
            success:function(res){
              if(res.flag == "F")
                showResponse(e,res,'');

              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
                 
                 $(".deleteQuestionImage").css("display", "none");
                 document.getElementById("output").src = "";
                 $("#output").css("display", "none");
                 $('#uploadFormQuestionImage').val('')
              }
              setTimeout(function(){
                  $(e.currentTarget).html(status);
              }, 3000);
              
            }
          });


        }else
        {
          $(".deleteQuestionImage").css("display", "none");
          document.getElementById("output").src = "";
          $("#output").css("display", "none");
          $('#uploadFormQuestionImage').val('')
        }

      },
      updateImage: function(e){
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var newdetails=[];
      var reader = new FileReader();
      // console.log(reader)
      reader.onload = function (e) {
          // get loaded data and render thumbnail.
          document.getElementById("output").src = e.target.result;
          $("#output").show();
          $(".deleteQuestionImage").css("display", "inline-flex");
          newdetails[""+toID]= reader.result;
          ob.model.set(newdetails);
      };

      
      // read the image file as a data URL.
      reader.readAsDataURL(e.currentTarget.files[0]);
      
      console.log(toID);
      console.log(reader.result);
      
      console.log(this.model);
      //var image = $('#output');
      //image.src = URL.createObjectURL(e.currentTarget.files[0]);

    },
    editQuestion:function(e)
    {

      var questionID = $(e.currentTarget).attr("data-questionID");
       // alert(questionID)
       var methodt="GET"
       var selfobj = this;
       this.model.set({questionID:questionID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
              
              selfobj.selectedMenu.set({sectionID:res.data[0].sectionID})
              if(res.data[0].formQuestionImage!="")
              {
                $(".deleteQuestionImage").show()
                $("html").animate({ scrollTop: 0 }, "slow");
              }
              selfobj.render();
            selfobj.setValues();
          });

          
        // console.log(this.model)

    },
    setValues:function(e){
        setvalues = ["category"];
        var selfobj = this;

        $.each(setvalues,function(key,value){
          var modval = selfobj.model.get(value);
         // console.log(modval);
          if(modval != null){
            var modeVal = modval.split(",");
          }else{ var modeVal = {};}

          $(".category").each(function(){
            var currentval = $(this).attr("data-value");
            // console.log(currentval)
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
    loadSubView:function(e){
        var selfobj = this;
        var show = $(e.currentTarget).attr("data-show");
        switch(show)
        {
          case "formQuestionImage":{
            var questionID = $(e.currentTarget).attr("data-questionID");
            break;
          }
          
        }
    },
     changeStatusListElement:function(e){
      var selfobj = this;
      var removeIds = [];
      var status = $(e.currentTarget).attr("data-action");
      var action = "changeStatus";
      $('.answerEditDelete input:checkbox').each(function(){
          if($(this).is(":checked"))
          {
            removeIds.push($(this).attr("data-questionID"));
          }
      });
      var idsToRemove = removeIds.toString();
      if(idsToRemove == ''){
        showResponse('',{"flag":"F","msg":"Please select at least one record."},'')
        return false;
      }
        $.ajax({
            url:APIPATH+'formQuestionMaster/status',
            method:'POST',
            data:{list:idsToRemove,action:action,status:status},
            datatype:'JSON',
             beforeSend: function(request) {
              $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept",'application/json');
            },
            success:function(res){
              if(res.flag == "F")
                showResponse(e,res,'');
              // console.log(selfobj.formID)
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
                 selfobj.formQuestionMaster.fetch({headers: {
                  'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
                    },error: selfobj.onErrorHandler}).done(function(res){
                      if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                      $(".profile-loader").hide();
                      selfobj.filterSearch();
                      
                  });
              }
              setTimeout(function(){
                  $(e.currentTarget).html(status);
              }, 3000);
              
            }
          });
    },
    
    saveformQuestionDetails: function(e){
      e.preventDefault();
      var questionID = this.model.get("questionID"); 
      var sectionID=$('#sectionID').val();
      if(sectionID=="")
        {
          alert("Please Select Menu");
          return false;
        }
      if(this.model.formID=="")
        {
          alert("form ID Is blank");
          return false;
        }
      this.model.set({sectionID:sectionID})
      if(questionID == "" || questionID == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      // console.log(methodt);
      if($("#formQuestionDetails").valid()){
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
             selfobj.filterSearch();
          }
          
            setTimeout(function(){
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
            }, 3000);
          
        });
      }
    },
    saveformQuestionDetails2: function(e){
      e.preventDefault();
    
      var sectionID = this.sectionModel.get("sectionID");
      if(this.formID!="" && this.formID!=null && this.formID!=undefined)
      {
      this.sectionModel.set({formID:this.formID});
      }else
      {
        this.onErrorHandler()
        return

      }
    // if(permission.edit != "yes"){
    //     Swal.fire("You don't have permission to edit", '', 'error');
    //     return false;
    //   }
      
      if(sectionID == "" || sectionID == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#userRoleDetails").valid()){
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.sectionModel.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          if(res.flag == "F"){
            showResponse(e,res,'');
            $(e.currentTarget).html("<span>Error</span>");
          }else{
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled"); 
             selfobj.filterSearch();
          }
          
          setTimeout(function(){
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
            }, 3000);
          
        });
      }
    },
    filterSearch: function(){
        this.formQuestionMaster.reset();
        this.sectionCollection.reset();
        this.model.clear().set(this.model.defaults);
        this.model.set({formID:this.formID})
        var selfobj = this; 
        var sectionID=this.selectedMenu.attributes.sectionID;
         this.formQuestionMaster.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{sectionID:sectionID,formID:selfobj.formID,status:'active',getAll:'Y',}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });

          this.sectionCollection.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,data:{formID:selfobj.formID,status:'active',getAll:'Y'}}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });
    },
    savePostions:function()
    {
      // alert("hii")
      var selfobj=this;
      var positions=[];
      $('.updated').each(function(){
        positions.push([$(this).attr('data-index'),$(this).attr('data-position')])
        $(this).removeClass('updated');
      })
      var positionsToSave = positions;
      var action="changePositions";
      console.log(positionsToSave);
      $.ajax({
            url:APIPATH+'formQuestions/updatePositions',
            method:'POST',
            data:{positions:positionsToSave,action:action},
            datatype:'JSON',
             beforeSend: function(request) {
              // $(e.currentTarget).html("<span>Updating..</span>");
              request.setRequestHeader("token",$.cookie('_bb_key'));
              request.setRequestHeader("SadminID",$.cookie('authid'));
              request.setRequestHeader("contentType",'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept",'application/json');
            },
            success:function(res){
              if(res.flag == "F")
                showResponse(e,res,'');

              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
              if(res.flag == "S"){
      
                    $(".profile-loader").hide();
              }
              setTimeout(function(){
                  // $(e.currentTarget).html(status);
              }, 3000);
              
            }
          });
      
    },
    render: function(){
      var selfobj= this;
      var source = formMasterQuestionTemp;
      var template = _.template(source);
      this.$el.html(template({model:this.model,formQuestionMaster:this.formQuestionMaster.models,sectionList:this.sectionCollection.models,selectedMenu:this.selectedMenu}));
      $(".main_container").removeClass("content");
      $(".main_container").empty();
      $(".main_container").append(this.$el);
      // CKEDITOR.replace('description',{
      //   language: 'en',
      // });
      // $('.deleteQuestionImage').hide();

     $("#clist").sortable({
            update:function(e,ui){
                $(this).children().each(function(index){
                if($(this).attr('data-position')!=(index+1))
                  {
                    $(this).attr('data-position',(index+1)).addClass('updated');
                  }
             });
              selfobj.savePostions();
            }
          })
      $( "#clist" ).disableSelection(); 
      return this;
  }
});

  return formQuestionsView;
  
});

