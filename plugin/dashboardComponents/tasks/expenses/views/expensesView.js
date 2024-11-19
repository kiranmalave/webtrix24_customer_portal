define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'Swal',
  '../models/expenseModel',
  '../views/settingsView',
  'text!../templates/expense.html',
], function ($, _, Backbone, custom, Swal, expenseModel, settingsView, expenseTemp) {

  var expensesView = Backbone.View.extend({
    model: expenseModel,
    tagName: "div",
    type: 'income',
    initialize: function (options) {
      var selfobj = this;
      // GET DASHBOARD DETAILS
      this.dashboard_id = options.dashboard_id ? options.dashboard_id : null;
      this.dashboardObj = options.dashboardObj ? options.dashboardObj : null;
      this.currentElement = options.currentElement ? options.currentElement : null;
      this.model = new expenseModel();
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
    render: function () {
      var selfobj = this;
      var template = _.template(expenseTemp);
      var temp = template({ dashboard_id: selfobj.dashboard_id, model: this.model.attributes });
      this.$el.html(temp);
      let delayed;
      $(".dash_temp#dash_temp_" + selfobj.dashboard_id).append(this.$el);
      // FOR DRAG AND DROP 
      selfobj.$('.dashEle').parent().addClass('ui-sortable-handle');
      selfobj.$('.dashEle').parent().attr('data-ele_id',this.model.get('id'));

      var inte = this.model.get('interval').replace(/_/g, " ");
      let label = inte.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      if (label == 'Last Year') {
        label = new Date().getFullYear() - 1;
      }
      if (this.model.get('view_type') == 'graph') {
        var datas = [
          {
            label: label,
            data: selfobj.model.get('amounts'),
            backgroundColor: 'rgba(111, 66, 193, 0.6)',//'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(102, 16, 242, 1)',//'rgba(75, 192, 192, 1)',//
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
          },
        ];
        if (this.model.get('period_type') == 'years') {
          var eleData = {
            label: new Date().getFullYear(),
            data: selfobj.model.get('amounts2'),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',//
            borderColor: 'rgba(75, 192, 192, 1)',//'rgba(75, 192, 192, 1)',//
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
          };
          datas.push(eleData);
        }
        const ctx = document.getElementById('incomeChart_' + this.model.get('id')).getContext('2d');

        const incomeChart = new Chart(ctx, {
          type: selfobj.model.get('chart_type'),
          data: {
            labels: selfobj.model.get('lables'),
            datasets: datas,
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 40000
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            }
          }
        });
        var h = Math.floor(Math.random() * (350 - 200 + 1)) + 200;
        var w = Math.floor((10 / 7) * h);
        incomeChart.canvas.parentNode.style.height = h + 'px';
        incomeChart.canvas.parentNode.style.width = w + 'px';

        // incomeChart.canvas.parentNode.style.height = '350px';
        // incomeChart.canvas.parentNode.style.width = '600px';
      } else {
        $('.dashEle .customTableClass').css('height', '290px')
      }
      $('.ws-select').selectpicker();
      this.attachEvents();
      return this;
    },
  });
  return expensesView;
});
