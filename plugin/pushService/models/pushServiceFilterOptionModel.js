define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pushServiceFilterOptionModel = Backbone.Model.extend({
    idAttribute: "push_service_id",
    defaults: {
      textSearch: 'name',
      textval: null,
      fromDate: null,
      toDate: null,
      status: 'active',
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return pushServiceFilterOptionModel;
});

