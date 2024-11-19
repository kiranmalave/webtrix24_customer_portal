define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleappointmentModel = Backbone.Model.extend({
    idAttribute: "appointmentID",
    defaults: {
      appointmentID: null,
      title: null,
      start_date: null,
      start_time: null,
      end_date: null,
      end_time: null,
      all_day: null,
      conf_details: null,
      customer_ID: null,
      notif: "notify",
      time: 10,
      time_format: "minutes",
      service: null,
      description: null,
      appointment_google_meet: null,
      meeting_option: "in_person_meet",
      appointment_zoom: null,
      address: null,
      week_numb: null,
      repeat_on: null,
      monthly: null,
      days: null,
      ends: null,
      end_on_date: null,
      end_after_date: null,
      latitude: null,
      longitude: null,
      does_repeat: "does_not_repeat",
      address_url: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      appointment_guest: null,
      appointment_guestID: null,
      extra_notif:null,
      project_id: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'appointmentMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleappointmentModel;
});
