define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'text!../templates/settings.html',
  'text!../templates/intervalField_temp.html',

], function ($, _, Backbone, validate, inputmask, settings, intervalField_temp) {

  var settingsView = Backbone.View.extend({
    initialize: function (options) {
      this.dynamicData = null;
      var selfobj = this;
      this.type = 'income';
      this.model = options.model ? options.model : null;
      this.parentObj = options.parentObj ? options.parentObj : null;
      this.details = {};
      this.interval = {
        days: ['last_7_days', 'last_10_days', 'last_14_days'],
        weeks: ['last_week','last_2_weeks'],
        months: ['last_4_months', 'last_8_months','last_12_months'],
        years: ['last_year']
      };

      console.log('model:', this.model.attributes);
      this.toClose = "settingsView";
      this.render();
    },
    events: {},
    attachEvents: function () {
      this.$el.off('click', '.settingsDetails', this.saveSettings);
      this.$el.on('click', '.settingsDetails', this.saveSettings.bind(this));
      this.$el.off('change', '.dropval', this.updateOtherDetails);
      this.$el.on('change', '.dropval', this.updateOtherDetails.bind(this));
      this.$el.off('blur', '.txtchange', this.updateOtherDetails);
      this.$el.on('blur', '.txtchange', this.updateOtherDetails.bind(this));
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
      this.parentObj.currentElement[toName] = valuetxt;
      this.model.set(newdetails);
      switch (toName) {
        case 'period_type':
          this.showInterval();
          break;
        case 'view_type':
            this.showChartType();
          break;
        default:
          break;
      }
    },
    showInterval: function () {
      var type = this.model.get('period_type');
      var template = _.template(intervalField_temp);
      $('.interval_div').empty().append(template({ intervals: this.interval[type], currentElement: this.parentObj.currentElement }))
      $('.ws-select').selectpicker('refresh');
    },
    showChartType: function () {
      var type = this.model.get('view_type');
      $('.chart_type_div').hide();
      if (type == 'graph') {
        $('.chart_type_div').show();
      }
    },
    saveSettings: function (e) {
      var selfobj = this;
      selfobj.parentObj.saveSettings(true);
    },
    render: function () {
      var selfobj = this;
      var source = settings;
      var template = _.template(source);
      $("#" + this.toClose).remove();
      this.$el.html(template({ model: this.model.attributes }));
      this.$el.addClass("tab-pane in active panel_overflow");
      this.$el.attr('id', this.toClose);
      this.$el.addClass(this.toClose);
      this.$el.data("role", "tabpanel");
      this.$el.data("current", "yes");
      $(".ws-tab").append(this.$el);
      $('.overlay-main-container').addClass('open settings-overlays');
      // $('.overlay-main-container').addClass('settings-overlays');
      $('.ws-select').selectpicker();
      rearrageOverlays('Settings', this.toClose);
      this.attachEvents();
      this.showInterval();
      this.showChartType();
      $('#' + this.toClose).show();
      return this;
    }, onDelete: function () {
      this.remove();
    }
  });
  return settingsView;
});
