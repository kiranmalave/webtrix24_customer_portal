define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
], function ($, _, Backbone, custom) {

  var funnelChart = Backbone.View.extend({
    initialize: function (options) {
      this.model = options.model ? options.model : null;
      this.p_obj = options.p_obj ? options.p_obj : null;
      this.render();

    },
    prepareVisualModel() {
      // ABSTRACT DATA FROM MODEL
      var current = this.p_obj.model.get('current');
      if (current) {
        this.visualModel = {
          lables: current.lables,
          title: current.title,
          data: current.amounts,
          bgColorsabels: current.bgColors,
          borderColors: current.borderColors,
        }
      }
    },
    render: function () {
      this.prepareVisualModel();
      const ctx = document.getElementById('Chart_' + this.model.get('id')).getContext('2d');
      new Chart(ctx, {
        type: 'funnel',
        data: {
          labels: this.visualModel.lables,
          datasets: [{
            data: this.visualModel.data,
            borderColor: this.visualModel.bgColors,
            backgroundColor: this.visualModel.bgColors,
          }]
        },
        options: {
          indexAxis: 'y',
        },
        plugins: [ChartDataLabels],
      });
    }
  });
  return funnelChart;
});
