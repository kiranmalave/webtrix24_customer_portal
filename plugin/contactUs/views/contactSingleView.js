define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'Quill',
    'Swal',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../collections/contactUsCollection',
    '../models/contactUsSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/contactUsSingleTemp.html',
  ], function($,_, Backbone,validate,inputmask,Quill,Swal,multiselectOptions,dynamicFieldRender,contactUsCollection,contactUsSingleModel,readFilesView,contactUsSingleTemp){
  
  var ContactUsView = Backbone.View.extend({
      model:contactUsSingleModel,
      initialize: function(options){
        this.dynamicData = null;
          var selfobj = this;
          this.multiselectOptions = new multiselectOptions();
          this.toClose = "constactUSView";
          this.pluginName = "contactUsView";
          this.form_label = options.form_label;
          selfobj.menuId = options.menuId;
          this.model = new contactUsSingleModel();
          $(".popupLoader").show();
  
          if(options.contactUs_id != ""){
            this.model.set({contactUsID:options.contactUs_id});
            this.model.fetch({headers: {
              'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
            },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler
            }).done(function(res){
              if (res.flag == "F") {
                Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
              }
              if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
                $(".popupLoader").hide();
                selfobj.render();
              });
          }else{
            selfobj.render();
            $(".popupLoader").hide();
          }
      },
      events:
      {
      },
      
      onErrorHandler: function(collection, response, options){
          Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
          $(".profile-loader").hide();
      },
      

      render: function(){
        var selfobj = this;
        var source = contactUsSingleTemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({ model: this.model.attributes }));
        $(".modal-title").html("Contact Us Master");
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".tab-content").append(this.$el);
        $('#'+this.toClose).show();
        rearrageOverlays("Contact Us",this.toClose);
        return this;
      },onDelete: function(){
          this.remove();
      }
  });
  
    return ContactUsView;
      
  });
  