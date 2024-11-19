
define([
  'jquery',
  'underscore',
  'backbone',
  'datepicker',
  'jqueryUI',
  'RealTimeUpload',
  '../collections/readFilesCollection',
  '../views/addNewFileView',
  '../views/addNewFileView2',
  '../views/addNewDIR',
  '../models/readFilesFilterOptionModel',
  'text!../templates/readFilesTemp.html',
], function($,_, Backbone,datepicker,jqueryUI,RealTimeUpload,readFilesCollection,addNewFileView,addNewFileView2,addNewDIR,readFilesFilterOptionModel,readFilesTemp){

var readFilesView = Backbone.View.extend({
    
    initialize: function(options){
        var selfobj = this;
        $(".profile-loader").show();
        selfobj.paths= {"backto":null,nestedFolderPath:null};
        var mname = Backbone.history.getFragment();
        permission = ROLE[mname];
        readyState = true;
        filterOption = new readFilesFilterOptionModel();
        this.searchreadFiles = new readFilesCollection();
        
        this.searchreadFiles.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post'}).done(function(res){
          if (res.flag == "F") showResponse('',res,'');
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          selfobj.paths=res.paths;
          selfobj.render(); 
          $(".profile-loader").hide();
        });
    },
   events:
    {
      "click .loadview":"loadSubView",
      "click .readFolder":"readFolder",
      "click .fileImage":"copyfileImagePath",
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
          case "singleFile":{
            let path = $(e.currentTarget).attr("data-url");
            var folderPath = this.realpath;
            var addNewFileview = new addNewFileView({folderPath:folderPath,searchVideos:this,filepath:path});
            break;
          }
          case "addNewFile2":{
            var folderPath = this.realpath;
            var addNewFileview2 = new addNewFileView2({folderPath:folderPath,searchVideos:this});
            break;
          }
          case "addDIR":{
            var folderPath = this.realpath;
            var addNewDir = new addNewDIR({folderPath:folderPath,searchVideos:this});
            break;
          }
        }
    },
    copyfileImagePath:function(e)
    {
       var imagePath = $(e.currentTarget).attr("src");
       var $inp=$("<input/>");
       
       $("body").append($inp);
       $inp.val(imagePath).select();
       
       document.execCommand("copy");
       $inp.remove();
       $(".alterMesage").fadeIn(800,function(){
        $(".alterMesage").fadeOut(800);
       })

    },
    readFolder:function(e)
    {
      var selfobj = this;
      var nestedFolderPath = $(e.currentTarget).attr("data-folderPath");
      var backto = $(e.currentTarget).attr("data-backto");
      if(backto ==undefined){
        backto = "";
      }
      this.searchreadFiles.fetch({headers: {
        'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post',data:{backto:backto,nestedFolderPath:nestedFolderPath}}).done(function(res){
        if (res.flag == "F") showResponse('',res,'');
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        selfobj.paths=res.paths;
        selfobj.render(); 
        $(".profile-loader").hide();
      });

    },

    filterSearch: function(){
        // $('#myModal').modal('hide');
        this.searchreadFiles.reset();
        var selfobj = this;
        
        var nestedFolderPath = this.realpath;
       var folderName = this.folderName;
       var folderCurrentPath = this.currentPath;
        this.searchreadFiles.fetch({ headers:{
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            } ,add: true, remove: false, merge: false,error: selfobj.onErrorHandler ,type:'post',data:{folderCurrentPath:folderCurrentPath,nestedFolderPath:nestedFolderPath,folderName:folderName}}).done(function(res){
              if (res.flag == "F") showResponse('',res,'');
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                $(".profile-loader").hide();
                selfobj.paths=res.paths;
                selfobj.render();
               
            });
    },
    
    render: function(){
        var selfobj= this;
        var template = _.template(readFilesTemp);
        this.$el.html(template({searchreadFiles:this.searchreadFiles.models,"paths":selfobj.paths}));
        $(".main_container").append(this.$el);
        $(".alterMesage").hide();

      $("#fileupload").RealTimeUpload({
        text:'Drag and Drop or Select a images to Upload.',
        maxFiles: 0,
        maxFileSize: 4194304,
        uploadButton:true,
        notification:true,
        autoUpload: true,
        extension: ['png', 'jpg', 'jpeg', 'gif','pdf','mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav','docx','doc','xls','xlsx'],
        thumbnails: true,
        action:APIPATH+'mediaUpload/',
        element:'fileupload',
        onSucess:function(){
               $('.modal-backdrop').hide();
                scanDetails.filterSearch();
            }
        });
        
        return this;
    }
});

  return readFilesView;
  
});
