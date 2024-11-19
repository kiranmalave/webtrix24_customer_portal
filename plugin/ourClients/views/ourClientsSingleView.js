define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Quill',
  'Swal',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/ourClientsCollection',
  '../models/ourClientsSingleModel',
  '../../readFiles/views/readFilesView',
  'text!../templates/ourClientsSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Quill,Swal, multiselectOptions,dynamicFieldRender,ourClientsCollection,ourClientsSingleModel,readFilesView,clientstemp) {

  var ourClientsSingleView = Backbone.View.extend({
    model: ourClientsSingleModel,
    form_label:'',
    initialize: function(options){
      var selfobj = this;
      this.form_label = options.form_label;
      this.toClose = "ourClientsSingleView";
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "ourClientsList";
      this.menuId = options.menuId;
      this.model = new ourClientsSingleModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      selfobj.model.set({ menuId: options.menuId });
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchclients;
      $(".popupLoader").show();
      
      var ourClientsList = new ourClientsCollection();
      ourClientsList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if (res.flag == "F") showResponse('',res,'');
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.model.set("ourClientsList",res.data);
        selfobj.render();
      });

      if(options.clients_id != ""){
        this.model.set({clients_id:options.clients_id});
        this.model.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
          if (res.flag == "F") showResponse('',res,'');
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
        });
      }
    },
    events:
    {
      "click .saveClientsDetails": "saveClientsDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",

    },
    
    onErrorHandler: function (collection, response, options) {
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
    },
    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
      };
      reader.readAsDataURL(e.currentTarget.files[0]);

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
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"client_image":url});
    },
    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
    },
    saveClientsDetails: function (e) {
      e.preventDefault();
      
      let selfobj = this;
      var clients_id = this.model.get("clients_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var methodt = '';
      if (clients_id == "" || clients_id == null || typeof(clients_id) == undefined ) {
        methodt = "PUT";
      } else {
        methodt = "POST";
      }
      if ($("#clientDetails").valid()) {
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
            }else{
              handelClose(selfobj.toClose);
            }
          }         
        });
      }
    },
    initializeValidate:function(){
      var selfobj = this;
      var feilds = {
        client_name: {
          required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if(!_.isEmpty(dynamicRules)){
        var feildsrules = $.extend({}, feilds, dynamicRules);
        
      }
      var messages  = {
        client_name: "Please enter client name",
      };
      $("#clientDetails").validate({
        rules: feildsrules,
        messages: messages
      });
    },
    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = clientstemp;
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
      $(".ws-select").selectpicker("refresh");
      $(".ws-select").selectpicker();
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
    }, 
    onDelete: function () {
      this.remove();
    }
  });

  return ourClientsSingleView;

});
