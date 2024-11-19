define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var testimonialsFilterOptionModel = Backbone.Model.extend({
    idAttribute: "testimonial_id",
    defaults: {
      // textSearch: 'testimonial_name',
      // textval: null,
      // status: 'active',
      // orderBy: 'testimonial_name',
      // order: 'ASC',
      status:'active',
      textSearch: '',
      textval: null,
      orderBy:'created_date' ,
      order:'DESC' ,
    }
  });
  return testimonialsFilterOptionModel;
});

