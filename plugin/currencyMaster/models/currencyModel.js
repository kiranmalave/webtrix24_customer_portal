define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var currencyModel = Backbone.Model.extend({
    idAttribute: "currency_id"
  });
  return currencyModel;
});

