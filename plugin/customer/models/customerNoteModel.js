define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerNoteModel = Backbone.Model.extend({
    idAttribute: "history_id",
  });
  return customerNoteModel;
});
