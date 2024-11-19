define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var contactUsModel = Backbone.Model.extend({
    idAttribute: "clients_id"
  });
  return contactUsModel;
});

