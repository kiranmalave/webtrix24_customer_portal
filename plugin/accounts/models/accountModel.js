define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var accountModel = Backbone.Model.extend({
    idAttribute: "account_id"
  });
  return accountModel;
});

