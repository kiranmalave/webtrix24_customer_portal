define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var eventSingleModel = Backbone.Model.extend({
    idAttribute: "event_id",
    defaults: {
      event_id: null,
      schedule: null,
      event_name: null,
      event_type: "site_event",
      event_image:null,
      appointment_schedule: null,
      future_date: null,
      location: null,
      latitude: null,
      longitude: null,
      address_url: null,
      description: null,
      price_type: null,
      start_date: null,
      end_date: null,
      result: null,
      webinar_link: null,
      contact_person_name: null,
      contact_person_email: null,
      contact_person_phone: null,
      meeting_option: "in_person_meet",
      createdBy: null,
      modifiedBy: null,
      createdDate: null,
      modifiedDate: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'event/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return eventSingleModel;
});
