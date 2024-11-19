define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var courseModel = Backbone.Model.extend({
    idAttribute: "course_id"
  });
  return courseModel;
});

