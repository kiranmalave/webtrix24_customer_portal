define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var readCourseMediaModel = Backbone.Model.extend({
    idAttribute: "media_id"
  });
  return readCourseMediaModel;
});

