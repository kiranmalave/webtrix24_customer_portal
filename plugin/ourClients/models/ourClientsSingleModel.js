define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourClientsSingleModel = Backbone.Model.extend({
    idAttribute: "clients_id",
    defaults: {
      clients_id: null,
      client_name: null,
      clientLogo: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'ourClient/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return ourClientsSingleModel;
});
