define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var lessonModel = Backbone.Model.extend({
    idAttribute: "lesson_id",
  });
  return lessonModel;
});

