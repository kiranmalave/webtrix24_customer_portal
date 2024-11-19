define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'Swal',
  '../models/leadModel',
  '../views/settingsView',
  // INCLUDES CHARTS IN 
  '../../dashboardcharts/barCharts',
  '../../dashboardcharts/pieCharts',
  '../../dashboardcharts/lineCharts',
  '../../dashboardcharts/doughnutCharts',
  '../../dashboardcharts/funnelCharts',
  'text!../templates/stagesWiseLeadTemp.html',
], function ($, _, Backbone, custom, Swal, leadModel, settingsView,barCharts,pieCharts,lineCharts,doughnutCharts,funnelCharts, stagesWiseLeadTemp) {

  var stagesWiseLeadView = Backbone.View.extend({
    model: leadModel,
    tagName: "div",
    type: 'income',
    initialize: function (options) {
      var selfobj = this;
      // GET DASHBOARD DETAILS
      this.dashboard_id = options.dashboard_id ? options.dashboard_id : null;
      this.dashboardObj = options.dashboardObj ? options.dashboardObj : null;
      this.currentElement = options.currentElement ? options.currentElement : null;
      this.model = new leadModel();
      // PASSED FROM DASHBOARD VIEW WHILE RENDERING DASHBOARD ELEMENT [REFER FOR SETTINGS OF ELEEMNT]
      if (selfobj.currentElement) {
        selfobj.model.set(selfobj.currentElement);
      }
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: selfobj.currentElement
      }).done(function (res) {
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == 'S') {
          selfobj.render();
        }
      });
    },
    attachEvents: function () {
      this.$el.off('click', '.settingsButton', this.openSettings);
      this.$el.on('click', '.settingsButton', this.openSettings.bind(this));
      this.$el.off('click', '.deleteButton', this.deleteElement);
      this.$el.on('click', '.deleteButton', this.deleteElement.bind(this));
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    // OPEN SETTINGS
    openSettings: function () {
      new settingsView({ model: this.model, parentObj: this });
    },
    // SAVE SETTINGS
    saveSettings: function () {
      var selfobj = this;
      var elements = selfobj.dashboardObj.model.get('details');
      var id = selfobj.currentElement.id;
      if (elements) {
        if (elements.length > 2) {
          elements = JSON.parse(elements);
          if (elements.hasOwnProperty(id)) {
            elements[id] = selfobj.currentElement;
          }
          selfobj.updateDashboard(elements);
        }
      }
    },
    // DELETE ELEMENT
    deleteElement: function (e) {
      e.stopPropagation();
      var selfobj = this;
      var id = $(e.currentTarget).attr('data-id');
      var elements = selfobj.dashboardObj.model.get('details');
      if (elements) {
        if (elements.length > 2) {
          elements = JSON.parse(elements);
          if (elements.hasOwnProperty(id)) {
            delete elements[id]
          }
          selfobj.updateDashboard(elements);
        }
      }
    },
    // UPDATE DASHBOARD DETAILS WHILE SAVING SETTINGS AND DELETING SETTINGS
    updateDashboard: function (details) {
      var selfobj = this;
      var dashboard_id = this.dashboard_id;
      var details = JSON.stringify(details);
      if (details != '') {
        $.ajax({
          url: APIPATH + 'dashboard/update',
          method: 'POST',
          data: { details: details, dashboard_id: dashboard_id, },
          datatype: 'JSON',
          beforeSend: function (request) {
            request.setRequestHeader("token", $.cookie('_bb_key'));
            request.setRequestHeader("SadminID", $.cookie('authid'));
            request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
            request.setRequestHeader("Accept", 'application/json');
          },
          success: function (res) {
            if (res.flag == "F") showResponse('', res, '');
            if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
            if (res.flag == "S") {
              selfobj.dashboardObj.getDashboard();
            }
          }
        });
      }
    },
    // PREPARE VISUALIZATION MODEL
    prepareVisualModel() {
      // ABSTRACT DATA FROM MODEL
      let delayed;
      var selfobj = this;
      var visualModel = []
      var chart_type = selfobj.model.get('chart_type');
      var current = selfobj.model.get('current');
      var last = selfobj.model.get('last');

      // COLORS ONLY FOR PIE AND DOUGHNUT
      if (current && current.bgColors && current.borderColors) {
        var bgColors = current.bgColors;
        var borderColors = current.borderColors;
      }
      if (current) {
        let currentModel = {
          label: current.title,
          data: current.amounts,
          backgroundColor: current.bgColors,//'rgba(75, 192, 192, 0.6)',
          borderColor: current.borderColor,//'rgba(75, 192, 192, 1)',//
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
        if (chart_type == 'pie' || chart_type == 'doughnut') {
          currentModel.backgroundColor = bgColors;
          currentModel.borderColor = borderColors;
        }
        visualModel.push(currentModel);
      }
      selfobj.visualModel = visualModel;
      if (current) {
        selfobj.lables = current.lables;
      }
      console.log(selfobj.visualModel);
    },
    render: function () {
      var selfobj = this;
      var template = _.template(stagesWiseLeadTemp);
      var temp = template({ dashboard_id: selfobj.dashboard_id, model: this.model.attributes });
      $(".dash_temp#dash_temp_" + selfobj.dashboard_id).append(this.$el.html(temp));
      this.prepareVisualModel();
      this.attachEvents();

      // FOR DRAG AND DROP 
      selfobj.$('.dashEle').parent().addClass('ui-sortable-handle');
      selfobj.$('.dashEle').parent().attr('data-ele_id', this.model.get('id'));

      // SHOW ONLY IS GRAPH IS PRESSENT
      if (this.model.get('view_type') == 'graph') {
        const ctx = document.getElementById('incomeChart_' + this.model.get('id')).getContext('2d');
        const incomeChart = new Chart(ctx, {
          type: selfobj.model.get('chart_type'),
          data: {
            labels: selfobj.lables,
            datasets: selfobj.visualModel,
            datalabels: {
              color: '#fff', // Text color
              align: 'center', // Align the labels in the center of the funnel
              anchor: 'center', // Position the labels inside the funnel sections
              font: {
                weight: 'bold',
                size: 14 // Font size
              },
              formatter: function (value, context) {
                return context.chart.data.labels[context.dataIndex] + '\n' + value; // Show both label and value
              }
            },
          },
          options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
              y: {
                beginAtZero: true,
              },
            },
            plugins: 
              {
                datalabels: {
                  color: 'white',
                  formatter: function (value, context) {
                      return context.chart.data.labels[
                          context.dataIndex
                      ];
                  },
              },
              }
            ,
            funnel: {
              direction: 'vertical',
              bottomWidth: 0.4,
              dynamicHeight: true,
              sort: 'ascending',
            }
          }
        });
      } else {
        $('.dashEle .customTableClass').css('height', '290px')
      }
      return this;
    },
  });
  return stagesWiseLeadView;
});
