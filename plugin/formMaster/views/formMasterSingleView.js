define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  '../models/formMasterSingleModel',
  '../collections/formMasterCollection',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  'text!../templates/formMasterSingleTemp.html',
], function($,_, Backbone,validate,inputmask,datepickerBT,formMasterSingleModel,formMasterCollection,multiselectOptions,dynamicFieldRender,formMasterTemp){

var formMasterSingleView = Backbone.View.extend({
    model:formMasterSingleModel,
    initialize: function(options){
      this.dynamicData = null;
      this.toClose = "formMasterSingleView";
      this.model = new formMasterSingleModel();
        var selfobj = this;
        this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
        this.multiselectOptions = new multiselectOptions();
        scanDetails = options.searchformMaster;
        $(".popupLoader").show();
  
        var formMasterList = new formMasterCollection();
        formMasterList.fetch({headers: {'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.model.set("formMasterList", res.data);
          selfobj.render();
        });


        if(options.formID != ""){
          this.model.set({formID:options.formID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },error: selfobj.onErrorHandler}).done(function(res){
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
            selfobj.setOldValues();
          });
        }
    },
    events:
    {
      "click .saveformDetails":"saveformDetails",
      "click .item-container li":"setValues",
      "blur .txtchange":"updateOtherDetails",
      "click .multiSel":"setValues",
      "change .bDate":"updateOtherDetails",
      "change .dropval":"updateOtherDetails",
    },
    attachEvents: function() {
      // Detach previous event bindings
      this.$el.off('click', '.saveformDetails', this.saveformDetails);
      // Reattach event bindings
      this.$el.on('click', '.saveformDetails', this.saveformDetails.bind(this));

      this.$el.off('click','.multiSel', this.setValues);
      this.$el.on('click','.multiSel', this.setValues.bind(this));
      this.$el.off('change','.bDate', this.updateOtherDetails);
      this.$el.on('change','.bDate', this.updateOtherDetails.bind(this));
      this.$el.off('change','.dropval', this.updateOtherDetails);
      this.$el.on('change','.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur','.txtchange', this.updateOtherDetails);
      this.$el.on('blur','.txtchange', this.updateOtherDetails.bind(this));
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
    setOldValues:function(){
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues,selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    saveformDetails: function(e){
      e.preventDefault();
      let selfobj = this;
      var formID = this.model.get("formID");
      let isNew = $(e.currentTarget).attr("data-action");
      if(permission.edit != "yes"){
        Swal.fire("You don't have permission to edit", '', 'error');
        return false;
      }
      if(formID == "" || formID == null){
        var methodt = "POST";
      }else{
        var methodt = "PUT";
      }
      if($('#formDetails').valid()){
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
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              selfobj.render();
            }else{
              handelClose(selfobj.toClose);
            }
          }    
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        formTitle: {
          required: true,
        },
        description: {
          required: true,
        },
        status: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
       
      }
      var messages = {
        formTitle: "Form Title Required",
        description: "Description Required",
        status: "Please Select Status",
      };
      $("#formDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },
    render: function(){
      var selfobj = this;
      var source = formMasterTemp;
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
      this.attachEvents();
      rearrageOverlays("Form",this.toClose);
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
  });

  return formMasterSingleView;
    
});
