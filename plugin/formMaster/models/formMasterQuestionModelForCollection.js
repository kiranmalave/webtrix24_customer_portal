define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterQuestionModelForCollection = Backbone.Model.extend({
    idAttribute: "questionID"
  });
  return formMasterQuestionModelForCollection;
});
