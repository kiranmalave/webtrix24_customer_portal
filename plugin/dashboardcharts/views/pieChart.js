define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
], function ($, _, Backbone, custom) {

  var pieChart = Backbone.View.extend({
    initialize: function (options) {
      this.model = options.model ? options.model : null;
      this.p_obj = options.p_obj ? options.p_obj : null;
      this.render();

    },
    // PREPARE VISUALIZATION MODEL
    prepareVisualModel() {
      // ABSTRACT DATA FROM MODEL
      let delayed;
      var visualModel = []
      var selfobj = this;
      var chart_type = this.p_obj.model.get('chart_type');
      var current = this.p_obj.model.get('current');
      var last = this.p_obj.model.get('last');

      // CURRENT DETAILS
      if (current) {
        selfobj.lables = current.lables;
        selfobj.bgColors = current.bgColors
        selfobj.borderColors = current.borderColors
        let currentModel = {
          label: current.title,
          data: current.amounts,
          backgroundColor: selfobj.bgColors, //'rgba(111, 66, 193, 0.6)',//'rgba(75, 192, 192, 0.6)',
          borderColor: selfobj.borderColors,//'rgba(102, 16, 242, 1)',//'rgba(75, 192, 192, 1)',//
          fill: true,
          borderWidth: 1,
          tension: 0.1,
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            },
          },
        }
        visualModel.push(currentModel);
      }
      // LAST DETAILS
      if (last) {
        let lastModel = {
          label: last.title,
          data: last.amounts,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: true,
          borderWidth: 1,
          tension: 0.1,
          animation: {
            onComplete: () => {
              delayed = true;
            },
            delay: (context) => {
              let delay = 0;
              if (context.type === 'data' && context.mode === 'default' && !delayed) {
                delay = context.dataIndex * 300 + context.datasetIndex * 100;
              }
              return delay;
            },
          },
        }
        visualModel.push(lastModel);
      }
      selfobj.visualModel = visualModel;
    },
    render: function () {
      this.prepareVisualModel();
      var selfobj = this;
      const ctx = document.getElementById('Chart_' + this.model.get('id')).getContext('2d');
      var chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.lables,
          datasets: this.visualModel,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',  // Move legend to the side
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          }
        }
      });
    }

  });
  return pieChart;
});

