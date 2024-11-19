define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'datepickerBT',
  'Swal',
  'Quill',
  '../models/errorLogSingleModel',
  'text!../templates/errorLogSingle_Temp.html',
], function($, _, Backbone, validate, inputmask, datepickerBT, Swal, Quill, errorLogSingleModel, errorLogSingleTemp) {
  var errorLogSingleView = Backbone.View.extend({
    model: errorLogSingleModel,
    form_label: '',
    initialize: function(options) {
      var selfobj = this;
      this.toClose = "errorLogSingleView";
      this.pluginName = "errorLogList";
      this.menuId = options.menuId;
      this.model = new errorLogSingleModel();
      this.model.set({ menuId: options.menuId });
      this.form_label = options.form_label;
      scanDetails = options.errorLogMaster;
      $(".popupLoader").show();
        if(options.errorID != "" && options.errorID != undefined && options.errorID != null ){
          this.model.set({errorID:options.errorID});
          this.model.fetch({headers: {
            'contentType':'application/x-www-form-urlencoded','SadminID':$.cookie('authid'),'token':$.cookie('_bb_key'),'Accept':'application/json'
          },data:{menuId:selfobj.model.get("menuId")},error: selfobj.onErrorHandler}).done(function(res){
            console.log(res);
            if(res.statusCode == 994){app_router.navigate("logout",{trigger:true});}
            $(".popupLoader").hide();
            selfobj.render();
          });
         
        }
    },
    onErrorHandler: function(collection, response, options) {
      alert("Something was wrong! Try to refresh the page or contact administrator. :(");
      $(".profile-loader").hide();
    },
    render: function() {
      var selfobj = this;
      var source = errorLogSingleTemp;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ "model": this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('#' + this.toClose).show();

      $('.ws-select').selectpicker();
      rearrageOverlays(selfobj.form_label, this.toClose);
      return this;
    },
    onDelete: function() {
      this.remove();
    }
  });
  
  return errorLogSingleView;
});
