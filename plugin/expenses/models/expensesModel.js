define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var expensesModel = Backbone.Model.extend({
    idAttribute: "expenses_id"
  });
  return expensesModel;
});

