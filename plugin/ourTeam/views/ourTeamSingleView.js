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
  '../collections/ourTeamCollection',
  '../models/ourTeamSingleModel',
  '../../readFiles/views/readFilesView',
  '../../category/views/categorySingleView',
  '../../category/collections/categoryCollection',
  'text!../templates/ourTeamSingle_temp.html',
], function ($, _, Backbone, validate, inputmask, datepickerBT, Quill,Swal,multiselectOptions,dynamicFieldRender,ourTeamsCollection, ourTeamSingleModel,readFilesView,categorySingleView,categoryCollection,teamtemp) {

  var ourTeamSingleView = Backbone.View.extend({
    model: ourTeamSingleModel,
    form_label : '',
    initialize: function (options) {
      var selfobj = this;
      this.form_label = options.form_label;
      this.toClose = "ourTeamSingleView";
      this.categoryList = new categoryCollection;
      // use this valiable for dynamic fields to featch the data from server
      this.pluginName = "ourTeamsList";
      this.menuId = options.menuId;
      this.model = new ourTeamSingleModel();
      this.dynamicFieldRenderobj = new dynamicFieldRender({ViewObj:selfobj,formJson:{}});  
      selfobj.model.set({ menuId: options.menuId });
      // this function is called to render the dynamic view
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchteam;
      $(".popupLoader").show();
      
      var ourTeamsList = new ourTeamsCollection();
      ourTeamsList.fetch({headers: {
          'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
      },error: selfobj.onErrorHandler,type:'post', data:{status:'active',getAll:'Y'}}).done(function(res){
        if (res.flag == "F") showResponse('',res,'');
        if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
        $(".popupLoader").hide();
        selfobj.model.set("ourTeamsList",res.data);
        selfobj.render();
      });
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      if (options.team_id != "" && typeof(options.team_id) != undefined ) {
        this.model.set({ team_id: options.team_id });
        this.model.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler
        }).done(function (res) {
          if (res.flag == "F") showResponse('',res,'');
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.dynamicFieldRenderobj.prepareForm();
          selfobj.render();
          selfobj.setOldValues();
        });
      } 
    },
    events:
    {
      "click .saveTeamDetails": "saveTeamDetails",
      // "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "click .multiSel": "setValues",
      "click .multiOptionSel": "multioption",
      "change .dropval": "updateOtherDetails",
      "click .loadMedia": "loadMedia",
      "blur .multiselectOpt": "updatemultiSelDetails",
      "click .singleSelectOpt": "selectOnlyThis",
      "change .multiSelect": "multiSelectOptions"
    },
    multiSelectOptions: function (e) {
      var selfobj = this;
      e.stopPropagation();
      var toID = $(e.currentTarget).attr("id");
      var valuetxt = $(e.currentTarget).val().join(",");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      selfobj.model.set(newdetails);
      console.log("selfobj.model",selfobj.model);
    },

    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    updateOtherDetails: function (e) {
      var valuetxt = $(e.currentTarget).val();
      if (valuetxt == "addCategory") {
        new categorySingleView({ searchCategory: this, loadfrom: "ourTeamSingleView",form_label: "Category" });
      }
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

    setOldValues: function () {
      var selfobj = this;
      setvalues = ["type","show_on_website","status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
      let isRender = $(e.currentTarget).attr("data-render");
      if (isRender == "yes") {
        selfobj.render();
      }
      if (selfobj.model.get('show_on_website') == "no") {
        $('.social-div').hide();
      }else{
        $('.social-div').show();
      }
      console.log('model : ',selfobj.model);
    },
    getSelectedFile:function(url){
      $('.'+this.elm).val(url);
      $('.'+this.elm).change();
      $("#profile_pic_view").attr("src",url);
      $("#profile_pic_view").css({"max-width":"100%"});
      $('#largeModal').modal('toggle');
      this.model.set({"member_image":url});
    },
    loadMedia: function(e){
      e.stopPropagation();
        $('#largeModal').modal('toggle');
        this.elm = "profile_pic";
        new readFilesView({loadFrom:"addpage",loadController:this});
    },
    saveTeamDetails: function (e) {
      e.preventDefault();
      let selfobj = this;
      var team_id = this.model.get("team_id");
      let isNew = $(e.currentTarget).attr("data-action");
      var methodt = '';
      if (team_id == "" || team_id == null || typeof(team_id) == undefined ) {
        methodt = "PUT";        
      } else {
        methodt = "POST";
      }
      if ($("#teamDetails").valid()) {
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {headers: {
          'Content-Type':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:methodt}).done(function(res){
          if (res.flag == "F") showResponse('',res,'');
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
              selfobj.model.set({ menuId: selfobj.menuId });
              selfobj.dynamicFieldRenderobj.initialize({ViewObj:selfobj,formJson:{}});
              handelClose("categorySingleView");
              selfobj.render();
            } else {
              handelClose(selfobj.toClose);
              handelClose("categorySingleView");
            }
          }         
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      var feilds = {
        name: {
          required: true,
        },
        position: {
          // required: true,
        },
      };
      var feildsrules = feilds;
      var dynamicRules = selfobj.dynamicFieldRenderobj.getValidationRule();

      if (!_.isEmpty(dynamicRules)) {
        var feildsrules = $.extend({}, feilds, dynamicRules);
        // var feildsrules = {
        //   ...feilds,
        //   ...dynamicRules
        //   };
      }
      var messages = {
        name: "Please enter member name",
        position: "Please enter member designation",
    
      };
      $("#teamDetails").validate({
        rules: feildsrules,
        messages: messages,
      });
    },

    refreshCat: function () {
      let selfobj = this;
      this.categoryList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y', slug: 'teams' }
      }).done(function (res) {
        if (res.flag == "F") showResponse('',res,'');
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        selfobj.render();
      });
    },

    render: function () {
      var selfobj = this;
      this.undelegateEvents();
      var source = teamtemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes, "categoryList": this.categoryList.models,  }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('.ws-select').selectpicker();
      $("#" + this.toClose).show();
      // this is used to append the dynamic form in the single view html
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      // Do call this function from dynamic module it self.
      this.initializeValidate();
      this.setOldValues();
      rearrageOverlays(selfobj.form_label, this.toClose);
      setToolTip();
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
    }, onDelete: function () {
      this.remove();
    }
  });

  return ourTeamSingleView;

});
