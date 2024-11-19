define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var projectsFilterOptionModel = Backbone.Model.extend({
    idAttribute: "project_id",
    defaults: {
      textSearch: '',
      textval: null,
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return projectsFilterOptionModel;
});

