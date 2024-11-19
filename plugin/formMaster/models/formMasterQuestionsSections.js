define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterQuestionsSections = Backbone.Model.extend({
    idAttribute: "sectionID"
  });
  return formMasterQuestionsSections;
});

