
define([
  'jquery',
  'underscore',
  'backbone',
  'datepickerBT',
  '../../core/views/multiselectOptions',
  '../../dynamicForm/views/dynamicFieldRender',
  '../collections/formAnsMasterCollection',
  '../models/formAnswerSingleModel',
  'text!../templates/formAnsMasterSingleTemp.html',
], function($,_, Backbone,datepickerBT, multiselectOptions, dynamicFieldRender,formAnsSingleCollection,formAnswerSingleModel,formAnsMasterSingleTemp){

var formAnsMasterSingleView = Backbone.View.extend({
    model: formAnswerSingleModel,
    initialize: function(options){
      this.dynamicData = null;
      this.toClose = "formAnsMasterSingleView";
      this.pluginName = "answersList";
      this.model = new formAnswerSingleModel();
      var selfobj = this;
      this.dynamicFieldRenderobj = new dynamicFieldRender({ ViewObj: selfobj, formJson: {} });
      this.multiselectOptions = new multiselectOptions();
      scanDetails = options.searchCourse;
      $(".profile-loader").show();

        this.answerList = new formAnsSingleCollection();
        this.answerList.fetch({headers: {'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post',data:{getAll:"Y",status:"active"}}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".profile-loader").hide();
          selfobj.render();
        });

        
        if (options.qaID != "") {
        this.model.set({ qaID: options.qaID });
        this.model.fetch({headers: {'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
        },error: selfobj.onErrorHandler,type:'post',data:{getAll:"Y",status:"active"}}).done(function(res){
          if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
          $(".profile-loader").hide();
          selfobj.render();
        });
      }
    },
    events:
    {
      "blur #textval":"setFreeText",
      "click .multiSel":"setValues",
    },
    onErrorHandler: function(collection, response, options){
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    setOldValues: function () {
      var selfobj = this;
      setvalues = ["status"];
      selfobj.multiselectOptions.setValues(setvalues, selfobj);
    },
    setValues: function (e) {
      var selfobj = this;
      var da = selfobj.multiselectOptions.setCheckedValue(e);
      selfobj.model.set(da);
    },
    render: function () {
      var selfobj = this;
      var source = formAnsMasterSingleTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({"answerList":this.answerList.models}));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr("id", this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $("#" + this.toClose).show();
      $("#dynamicFormFields").empty().append(this.dynamicFieldRenderobj.getform());
      this.setOldValues();
      rearrageOverlays("Form Answer", this.toClose);
      return this;
    },
    onDelete: function () {
      this.remove();
    },
  });

  return formAnsMasterSingleView;
  
});
