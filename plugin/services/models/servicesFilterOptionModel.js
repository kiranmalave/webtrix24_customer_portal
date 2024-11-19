define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var servicesFilterOptionModel = Backbone.Model.extend({
    idAttribute: "service_id",
    defaults: {
      textSearch: 'serviceTitle',
      textval: null,
      status: 'active',
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return servicesFilterOptionModel;
});

