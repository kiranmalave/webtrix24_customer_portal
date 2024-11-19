define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var testimonialsModel = Backbone.Model.extend({
    idAttribute: "testimonial_id"
  });
  return testimonialsModel;
});

