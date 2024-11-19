define([
  'jquery',
  'underscore',
  'backbone',
  'RealTimeUpload',
  'text!../templates/addNewFileTemp2.html',
], function($,_, Backbone,RealTimeUpload,addNewFileTemp){

var addNewFileView = Backbone.View.extend({
    
    initialize: function(options){
      var selfobj = this;
      $(".modelbox").hide();
      $('.modal-dialog').removeClass("modal-lg");
      scanDetails = options.searchVideos;
      this.pathToSave=options.folderPath;

      $('#addNewFileInFolder').html("");
      $('#addNewFileInFolder').remove();
      // $(".profile-loader").show(); 
      this.render();
      
  
    },
    events:
    {
      "change .fileAdded": "updateImage",
      "click #saveuserRoleDetails":"saveuserRoleDetails",
       
    },
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },

    render: function(){

        var selfobj = this;
        var source = addNewFileTemp;
        var template = _.template(source);
         $("#modalBody").html("");
        this.$el.html(template());
        $("#modalBody").append(this.$el);
        $(".modal-title").html("Add New File");
        $('#addNewFileInFolder').show();
        var path = this.pathToSave.replaceAll("/",'_');
        $("#fileupload").RealTimeUpload({
        text:'Drag and Drop or Select a images to Upload<br>Once you have uploaded the photos, they will require an admin approval. The process is quick but an admin team member must approve the images before they are visible on the site and in searches.',
        maxFiles: 1,
        maxFileSize: 4194304,
        uploadButton:true,
        notification:true,
        autoUpload: false,
        extension: ['png', 'jpg', 'jpeg', 'gif','pdf','mp4', 'avi', 'mkv', 'mp3', 'ogg', 'wav','docx','doc','xls','xlsx'],
        // extension: ['png', 'jpg', 'jpeg', 'gif'],
        thumbnails: true,
        action:APIPATH+'addFilesInFolder2/'+path,
        element:'fileupload',
        onSucess:function(){
              // alert("hello")
               $('.modal-backdrop').hide();
                scanDetails.filterSearch();
            }
        });

        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return addNewFileView;
  
});
