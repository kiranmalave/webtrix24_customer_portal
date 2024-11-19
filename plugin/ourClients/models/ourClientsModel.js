define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourClientsModel = Backbone.Model.extend({
    idAttribute: "clients_id"
  });
  return ourClientsModel;
});

