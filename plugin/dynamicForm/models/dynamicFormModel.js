define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var dynamicFormModel = Backbone.Model.extend({
    idAttribute: "fieldID"
  });
  return dynamicFormModel;
});

