define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'customDashboard',
  'Swal',
  '../models/dashboardSingleModel',
  'text!../templates/dashboard_element_temp.html',  
], function ($, _, Backbone, custom, customDashboard, Swal, dashboardSingleModel, dashboard_element_temp) {
  var dashboardElements = Backbone.View.extend({
    initialize: function (options) {
      var selfobj = this;
      this.details = {},
      this.structure = {},
        this.parentObj = options.parentObj ? options.parentObj : null;
      if (options.model) {
        this.model = options.model;
        this.structure = this.model.get('details') ? JSON.parse(this.model.get('details')) : {};
      }
      selfobj.render();
    },
    events:
    {
      "click .ws-dash-element-list": "addElement",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },
    // ADD ELEMENT IN DASHBOARDS
    addElement: function (e) {
      var selfobj = this;
      var type = $(e.currentTarget).attr('data-type');
      var id  = 'ele-' + Date.now() + Math.random().toString(36).substr(2, 3);
      selfobj.structure[id] = {
        type: type,
        id : id ,
        style: 'default',
        colsize: 'col-md-12',
        chart_type : 'line',
        view_type : 'graph',
        interval : 'last_7_days',
        period_type : 'day',
        index:'999'
      };
      selfobj.model.set({
        'details': selfobj.structure
      });
      selfobj.updateDashboard();
      $('#elementsModal').modal('toggle');
      $('.modal-backdrop.fade.show').remove();
    },
    // UPDATE DASHBOARD WHEN ELEMENT IS ADDED 
    updateDashboard: function () {
      var selfobj = this;
      var dashboard_id = selfobj.model.get('dashboard_id');
      var details = selfobj.model.get('details');
      details = JSON.stringify(details);
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
              selfobj.parentObj.getDashboard();
            }
          }
        });
      }
    },
    render: function () {
      var selfobj = this;
      var template = _.template(dashboard_element_temp);
      var temp = template({ model: selfobj.model.attributes });
      this.$el.html(temp);
      $(".main_container .dash_ele").empty().append(this.$el);
      return this;
    },
  });
  return dashboardElements;
});
