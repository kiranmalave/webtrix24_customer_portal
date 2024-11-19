define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/careerCollection',
  '../models/careerSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/careerSingle_temp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,Swal,multiselectOptions,dynamicFieldRender,careerCollection,careerSingleModel,readFilesView,careertemp){

var careerSingleView = Backbone.View.extend({
    model:careerSingleModel,
    form_label:'',
    initialize: function(options){
      var selfobj = this;
      this.dynamicData = null;
      this.toClose = "careerSingleView";
      this.pluginName = "careerList";
      this.menuId = options.menuId;
      this.model = new careerSingleModel();
      this.model.set({ menuId: options.menuId });
      this.form_label = options.form_label;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchcareer;
      $(".popupLoader").show();
      
      var careerList = new careerCollection();
      careerList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if (res.flag == "F") {
          Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
        }
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.model.set("careerList",res.data);
        selfobj.render();
      });

      if(options.job_id != ""){
        console.log(options.job_id);
        this.model.set({job_id:options.job_id});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
    },
    events:
    {
      "click .savecareerDetails":"savecareerDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "change .multiSel":"setValues",
      "change .dropval":"updateOtherDetails",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "click .loadMedia": "loadMedia",
    },

    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
    },

    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"career_image":url});
    },
    
    onErrorHandler: function(collection, response, options){
        Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
        $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toName] = valuetxt;
      this.model.set(newdetails);
      if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
        this.model.set(toName, this.model.get(toName).join(","));
      }
    },
    updatemultiSelDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      var toName = $(e.currentTarget).attr("id");
      var existingValues = this.model.get(toName);
      if (existingValues === null || existingValues === undefined) {
          existingValues = '';
      } else if (typeof existingValues !== 'string') {
          existingValues = existingValues.toString();
      }
      existingValues = existingValues.replace(/NULL/ig, '');
      existingValues = existingValues.replace(/^,|,$/g, '');
      if ($(e.currentTarget).prop('checked')) {
          if (existingValues.indexOf(valuetxt) === -1) {
              existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
          }
      } else {
          existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
      }
      this.model.set({ [toName]: existingValues });
    },

    selectOnlyThis: function(e) {
      var clickedCheckbox = e.currentTarget;
      var valueTxt = $(clickedCheckbox).val();
      var toName = $(clickedCheckbox).attr("name");
      this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop('checked', false);
      var existingData = this.model.get(toName);
      this.model.set(toName, ($(clickedCheckbox).prop('checked')) ? valueTxt : null);
      console.log("this.model", this.model);
    },

    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },
    setValues:function(e){
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if(isRender == "yes"){
        selfobj.render();
      }
    },
    savecareerDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var job_id = this.model.get("job_id");
      let isNew = $(e.currentTarget).attr("data-action");
      if(job_id == "" || job_id == null){
        var methodt = "PUT";
      }else{
        var methodt = "POST";
      }
      if($("#careerDetails").valid()){
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({},{headers:{
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if (res.flag == "F") {
            Swal.fire({title: 'Failed !',text: res.msg,timer: 2000,icon: 'error',showConfirmButton: false});
          }
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
    
          if(isNew == "new"){
            showResponse(e,res,"Save & New");
          }else{
            showResponse(e,res,"Save");
          }
          scanDetails.filterSearch();
          if (res.flag == "S") {
            if (isNew == "new") {
              selfobj.model.clear().set(selfobj.model.defaults);
              selfobj.model.set({ menuId: selfobj.menuId});
              selfobj.dynamicFieldRenderobj.initialize({ ViewObj: selfobj, formJson: {} });
              selfobj.render();
              selfobj.attachEvents();
            } else {
              handelClose(selfobj.toClose);
            }
          }
        });
      }
    },
    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
        job_title: {
          required: true,
        },
        description: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();
      if(!_.isEmpty(dynamicRules)){

        var feildsrules = $.extend({}, feilds, dynamicRules);     
      }
      var messages  = {
        job_title: "Please enter  Title",
        description: "Please enter  Description",
      }; 
      $("#careerDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function(){
      var selfobj = this;
      this.undelegateEvents();
        var source = careertemp;
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
        // this is used to append the dynamic form in the single view html
        $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
        // Do call this function from dynamic module it self.
        this.initializeValidate();
        this.setOldValues();
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
        this.delegateEvents(); 
        return this;
    },onDelete: function(){
        this.remove();
    }
});

  return careerSingleView;
  
});
