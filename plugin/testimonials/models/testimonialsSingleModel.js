define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var TestimonialSingleModel = Backbone.Model.extend({
    idAttribute: "testimonial_id",
    defaults: {
      testimonial_id: null,
      testimonial_name: null,
      designation: null,
      testimonial_message: null,
      testimonial_image: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      designation_show_on_website: 'no',
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'testimonials/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return TestimonialSingleModel;
});
