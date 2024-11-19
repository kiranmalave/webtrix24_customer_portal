define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var careerModel = Backbone.Model.extend({
    idAttribute: "job_id "
  });
  return careerModel;
});

