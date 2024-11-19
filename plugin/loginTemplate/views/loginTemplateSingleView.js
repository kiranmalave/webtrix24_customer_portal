define([
    'jquery',
    'underscore',
    'backbone',
    'validate',
    'inputmask',
    'datepickerBT',
    'Swal',
    'Quill',
    '../../core/views/multiselectOptions',
    '../../dynamicForm/views/dynamicFieldRender',
    '../../category/collections/slugCollection',
    '../../category/views/categorySingleView',
    '../models/loginTemplateSingleModel',
    '../../readFiles/views/readFilesView',
    'text!../templates/loginTemplateSingle_temp.html',
  
  ], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,Quill,multiselectOptions,dynamicFieldRender,slugCollection,categorySingleView,loginTemplateSingleModel,readFilesView,loginTemplateSingleTemp){
var loginTemplateSingleView = Backbone.View.extend({ 
    model:loginTemplateSingleModel,
    form_label:'',
    initialize: function(options){
        var selfobj = this;
        this.toClose = "loginTemplateSingleView";
        // use this valiable for dynamic fields to featch the data from server
        this.pluginName = "slideList";
        this.menuId= options.menuId;
        this.model = new loginTemplateSingleModel();
        this.model.set({ menuId: options.menuId });
        this.form_label = options.form_label;
        // this function is called to render the dynamic view
        this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
        this.multiselectOptions = new multiselectOptions();
        this.categoryList = new slugCollection();
        
        scanDetails = options.loginTemplate;
       
        $(".popupLoader").show();

        this.categoryList.fetch({headers:
           {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { status: 'active', getAll: 'Y',slug:'slider_list ' }
        }).done(function (res) { 
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".profile-loader").hide();
          selfobj.render();
        });
  
        if(options.slide_id != "" && options.slide_id != undefined && options.slide_id != null ){
          this.model.set({slide_id:options.slide_id});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.dynamicFieldRenderobj.prepareForm();
            selfobj.render();
          });
         
        }
      },
      events:
      {
        // "click .loadMedia": "loadMedia",
        "click .multiSel": "setValues",
       
      },
      attachEvents: function() {
        this.$el.off('click', '.savesliderDetails', this.savesliderDetails);
        this.$el.on('click', '.savesliderDetails', this.savesliderDetails.bind(this));
        this.$el.off("click", ".loadMedia", this.loadMedia);
        this.$el.on("click", ".loadMedia", this.loadMedia.bind(this));
        this.$el.off('blur','.txtchange', this.updateOtherDetails);
        this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
        this.$el.off('click', '.multiSel', this.setValues);
        this.$el.on('click', '.multiSel', this.setValues.bind(this));
      },
      onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      console.log(da);
      selfobj.model.set(da);
    },
      getSelectedFile:function(url){
        $('.'+this.elm).val(url);
        $('.'+this.elm).change();
        $("#profile_pic_view").attr("src",url);
        $("#profile_pic_view").css({"max-width":"100%"});
        $('#largeModal').modal('toggle');
        this.model.set({"image":url});
      },
      loadMedia: function(e){
        e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
      },
      updateOtherDetails: function(e){
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails=[];
        newdetails[""+toID]= valuetxt;
         this.model.set(newdetails);
        if (this.model.get(toID) && Array.isArray(this.model.get(toID))) {
          this.model.set(toID, this.model.get(toID).join(","));
        }
        
      },
      initializeValidate:function(){
        var selfobj = this;
        var feilds = {
        
        title:{
             required: true,
          },
          description:{
            required: true
          }
          
        };
        var feildsrules = feilds;
        var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
       
        if(!_.isEmpty(dynamicRules)){
        
          var feildsrules = $.extend({}, feilds, dynamicRules);
          // var feildsrules = {
          // ...feilds,
          // ...dynamicRules
          // };
        }
        var messages  = {
          title: "Please enter title",  
           description: "Please enter Description",
        };
        
       
        $("#slideDetails").validate({
          rules: feildsrules,
          messages: messages
        });
      },
      savesliderDetails: function(e){
        e.preventDefault();
        let selfobj = this;
        var mid = this.model.get("slide_id");
        let isNew = $(e.currentTarget).attr("data-action");
        if(mid == "" || mid == null){
          var methodt = "PUT";
        }else{
          var methodt = "POST";
        }
        if($("#slideDetails").valid()){
          $(e.currentTarget).html("<span>Saving..</span>");
          $(e.currentTarget).attr("disabled", "disabled");
          this.model.save({},{headers:{
            'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            if(isNew == "new"){
              showResponse(e,res,"Save & New");
            }else{
              showResponse(e,res,"Save"); 
            }
            scanDetails.filterSearch();
            if(res.flag == "S"){
              if(isNew == "new"){
                selfobj.model.clear().set(selfobj.model.defaults);
                selfobj.model.set({ menuId: selfobj.menuId});
                selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
               
                selfobj.render();
               
                // selfobj.attachEvents();
                
              }else{
                handelClose(selfobj.toClose);
                scanDetails.filterSearch();
              
              }
              
            }
          });
        }
      },

      render: function(){
        var selfobj = this;
        var source = loginTemplateSingleTemp;
        var template = _.template(source);
        $("#"+this.toClose).remove();
        this.$el.html(template({ "model": this.model.attributes }));
        this.$el.addClass("tab-pane in active panel_overflow");
        this.$el.attr('id',this.toClose);
        this.$el.addClass(this.toClose);
        this.$el.data("role","tabpanel");
        this.$el.data("current","yes");
        $(".ws-tab").append(this.$el);
        $('#'+this.toClose).show();
     
        selfobj.initializeValidate();
        selfobj.attachEvents();
        this.setOldValues();

        $('.ws-select').selectpicker();
        rearrageOverlays(selfobj.form_label,this.toClose);
        var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'align': [] }],
            ['link'],
              ['clean']                                         // remove formatting button
          ];
      
        var editor = new Quill($("#description").get(0),{
          modules: {
              toolbar: __toolbarOptions
          },
          theme: 'snow'  // or 'bubble'
          });
    
          //const delta = editor.clipboard.convert();
          //editor.setContents(delta, 'silent');
          editor.on('text-change', function(delta, oldDelta, source) {
              if (source == 'api') {
                  console.log("An API call triggered this change.");
                } else if (source == 'user') {
                  var delta = editor.getContents();
                  var text = editor.getText();
                  var justHtml = editor.root.innerHTML;
                  selfobj.model.set({"description":justHtml});
                }
            });
        return this;
    },onDelete: function(){
        this.remove();
    }
})
return loginTemplateSingleView;

  })