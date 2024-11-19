define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var dynamicFormsModel = Backbone.Model.extend({
    idAttribute: "form_id"
  });
  return dynamicFormsModel;
});

