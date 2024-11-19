define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pushServiceSingleModel = Backbone.Model.extend({
    idAttribute: "push_service_id",
    defaults: {
      push_service_id: null,
      push_service_name: null,
      to_email:null,
      message_body: null,
      sms_body: null,
      whats_app_body: null,
      trigger_type: null,
      trigger_date: null,
      interval_type: null,
      interval_month: null,
      interval_week: null,
      interval_span: null,
      stop_type: null,
      stop_value: null,
      stop_date: null,
      status: 'pending',
    },
    urlRoot: function () {
      return APIPATH + 'pushServiceNotificationMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return pushServiceSingleModel;
});
