define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var careerFilterOptionModel = Backbone.Model.extend({
    idAttribute: "job_id ",
    defaults: {
      // textSearch: 'job_title',
      // textval: null,
      // status: 'active',
      // orderBy: 'job_title',
      // order: 'ASC',
      status:'active',
      textSearch: '',
      textval: null,
      orderBy:'created_date' ,
      order:'DESC' ,
    }
  });
  return careerFilterOptionModel;
});

