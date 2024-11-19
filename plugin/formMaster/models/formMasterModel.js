define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterModel = Backbone.Model.extend({
    idAttribute: "formID"
  });
  return formMasterModel;
});

